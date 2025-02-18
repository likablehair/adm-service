import { ProcessRequest } from 'src/requests/baseRequest';
import DownloadProspettoSintesi from 'src/requests/ponImport/downloadProspettoSintesiRequest';
import RichiestaProspettoSintesiRequest, {
  RichiestaProspettoSintesi,
} from 'src/requests/ponImport/richiestaProspettoSintesiRequest';
import { parseStringPromise } from 'xml2js';
import * as fsPromises from 'fs/promises';
import { AdmDeclarationMapped, PDFConverter } from 'src/main';
import { DAE_DAT_PDF_TYPES } from './daeDat.manager';

export type ProspettoSintesiResult = {
  mrn: string;
  rev: string;
  type: string;
  path: string;
  buffer: Buffer;
  exit: {
    code: string;
    message: string;
  };
};

export type ImportProspettoSintesiResult = {
  admDeclarationMapped: AdmDeclarationMapped;
  file: AdmFile;
};

export const DOC_TYPES = [
  'declaration',
  'accounting',
  'release',
  'ivisto',
  ...DAE_DAT_PDF_TYPES,
] as const;

export type docType = (typeof DOC_TYPES)[number];

export type AdmFile = {
  buffer: Buffer;
  from: { path: string };
  extension: string;
  docType: docType;
  version?: number;
};

export const ProspettoSintesiMissingError = 'Prospetto Sintesi not present';

export default class ProspettoSintesiManager {
  async import(
    params: ProcessRequest<RichiestaProspettoSintesi>,
  ): Promise<ImportProspettoSintesiResult> {
    try {
      const downloadedPDF: string = await this.download(params);
      const savedPDF: ProspettoSintesiResult = await this.save(
        params.data.xml.mrn,
        downloadedPDF,
      );
      const admDeclarationMapped: AdmDeclarationMapped = await this.convert({
        data: { path: savedPDF.path },
      });
      await fsPromises.unlink(savedPDF.path);

      return {
        admDeclarationMapped,
        file: {
          buffer: savedPDF.buffer,
          from: { path: savedPDF.path },
          extension: 'pdf',
          docType: 'declaration',
          version: Number(savedPDF.rev),
        },
      };
    } catch (error: unknown) {
      let localError: Error;

      if (error instanceof Error) {
        localError = error;
      } else if (typeof error === 'string') {
        localError = new Error(error);
      } else {
        localError = new Error('Unknown error');
      }

      localError.message = `importing ProspettoSintesi: ${localError.message}`;
      throw localError;
    }
  }
  async download(
    params: ProcessRequest<RichiestaProspettoSintesi>,
  ): Promise<string> {
    try {
      const richiestaProspettoSintesiRequest =
        new RichiestaProspettoSintesiRequest();
      const richiestaProspetto =
        await richiestaProspettoSintesiRequest.processRequest(params);

      if (richiestaProspetto.message?.esito?.codice == '197') {
        //DO NOT MODIFY THE TEXT OF THIS ERROR
        throw new Error(ProspettoSintesiMissingError);
      }

      if (richiestaProspetto.type !== 'success') {
        throw new Error(
          `message: ${richiestaProspetto.message?.esito?.messaggio}`,
        );
      }

      if (!richiestaProspetto.message?.IUT) {
        throw new Error('IUT not found');
      }

      const IUT: string = richiestaProspetto.message.IUT;

      // Wait 10 seconds before downloading the PDF (constraint from the ADM WS)
      await new Promise((resolve) => setTimeout(resolve, 10000));

      const downloadProspettoSintesiRequest = new DownloadProspettoSintesi();
      const downloadProspetto =
        await downloadProspettoSintesiRequest.processRequest({
          data: {
            dichiarante: params.data.dichiarante,
            xml: {
              datiDichiarazione: {
                mrn: params.data.xml.mrn,
              },
              richiestaProspetto: {
                IUT,
              },
            },
          },
          security: params.security,
        });

      if (downloadProspetto.type !== 'success') {
        throw new Error(
          `message: ${downloadProspetto.message?.esito?.messaggio}`,
        );
      }

      if (!downloadProspetto.message?.data) {
        throw new Error('PDF not found');
      }

      return downloadProspetto.message.data;
    } catch (error: unknown) {
      let localError: Error;

      if (error instanceof Error) {
        localError = error;
      } else if (typeof error === 'string') {
        localError = new Error(error);
      } else {
        localError = new Error('Unknown error');
      }

      localError.message = `downloading ProspettoSintesi: ${localError.message}`;
      throw localError;
    }
  }

  async save(mrn: string, request: string): Promise<ProspettoSintesiResult> {
    try {
      const xmlFilePath = `${mrn}_declaration.pdf`;

      const buffer = Buffer.from(request, 'base64');
      await fsPromises.writeFile(xmlFilePath, buffer);

      const xmlContent = await fsPromises.readFile(xmlFilePath, 'utf8');
      await fsPromises.unlink(xmlFilePath);

      const parsed = await parseStringPromise(xmlContent, {
        explicitArray: false,
      });
      const downloaded = parsed['ns0:DownloadProspetto'];
      const data = downloaded.output.datiDichiarazione;
      const attachment = downloaded.output.allegato;
      const pdfFileName: string = attachment.nomeFile || 'decoded-tmp.pdf';

      const pdfContent = Buffer.from(attachment.contenuto, 'base64');
      await fsPromises.writeFile(pdfFileName, pdfContent);

      const result: ProspettoSintesiResult = {
        mrn: data.mrn,
        rev: data.revisione,
        type: downloaded.output.TipologiaProspetto,
        path: attachment.nomeFile,
        buffer: pdfContent,
        exit: {
          code: downloaded.output.esito.codiceErrore,
          message: downloaded.output.esito.messaggioErrore,
        },
      };

      return result;
    } catch (error: unknown) {
      let localError: Error;

      if (error instanceof Error) {
        localError = error;
      } else if (typeof error === 'string') {
        localError = new Error(error);
      } else {
        localError = new Error('Unknown error');
      }

      localError.message = `downloading ProspettoSintesi: ${localError.message}`;
      throw localError;
    }
  }

  async convert(params: { data: { path: string } }) {
    const converterPDF = new PDFConverter();
    return await converterPDF.run({ data: { path: params.data.path } });
  }
}
