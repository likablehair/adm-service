import { ProcessRequest } from 'src/requests/baseRequest';
import { RichiestaProspettoSintesi } from 'src/requests/ponImport/richiestaProspettoSintesiRequest';
import { parseStringPromise } from 'xml2js';
import * as fsPromises from 'fs/promises';
import { AdmFile, ProspettoSintesiResult } from 'src/main';
import RichiestaProspettoContabileRequest from 'src/requests/ponImport/richiestaProspettoContabileRequest';
import DownloadProspettoContabile from 'src/requests/ponImport/downloadProspettoContabileRequest';
import AccountingPDFConverter, {
  AccountingStatementMapped,
} from 'src/converters/AccountingPDFConverter';

export type ImportProspettoContabileResult = {
  file: AdmFile;
  accountingStatementMapped: AccountingStatementMapped;
};

export const ProspettoContabileMissingError = 'Prospetto Contabile not present';

export default class ProspettoContabileManager {
  async import(
    params: ProcessRequest<RichiestaProspettoSintesi>,
  ): Promise<ImportProspettoContabileResult> {
    try {
      const downloadedPDF: string = await this.download(params);
      const savedPDF: ProspettoSintesiResult = await this.save(
        params.data.xml.mrn,
        downloadedPDF,
      );
      const accountingStatementMapped: AccountingStatementMapped =
        await this.convert({
          data: { path: savedPDF.path },
        });
      await fsPromises.unlink(savedPDF.path);

      return {
        file: {
          buffer: savedPDF.buffer,
          from: { path: savedPDF.path },
          extension: 'pdf',
          docType: 'accounting',
          version: Number(savedPDF.rev)
        },
        accountingStatementMapped,
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

      localError.message = `importing ProspettoContabile: ${localError.message}`;
      throw localError;
    }
  }
  async download(
    params: ProcessRequest<RichiestaProspettoSintesi>,
  ): Promise<string> {
    try {
      const richiestaProspettoContabileRequest =
        new RichiestaProspettoContabileRequest();
      const richiestaProspetto =
        await richiestaProspettoContabileRequest.processRequest(params);

      if (richiestaProspetto.message?.esito?.codice == '197') {
        //DO NOT MODIFY THE TEXT OF THIS ERROR
        throw new Error(ProspettoContabileMissingError);
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

      const downloadProspettoContabileRequest =
        new DownloadProspettoContabile();
      const downloadProspetto =
        await downloadProspettoContabileRequest.processRequest({
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

      localError.message = `downloading ProspettoContabile: ${localError.message}`;
      throw localError;
    }
  }

  async save(mrn: string, request: string): Promise<ProspettoSintesiResult> {
    try {
      const xmlFilePath = `${mrn}_accounting.pdf`;

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

      localError.message = `saving ProspettoContabile: ${localError.message}`;
      throw localError;
    }
  }

  async convert(params: { data: { path: string } }) {
    const converterPDF = new AccountingPDFConverter();
    return await converterPDF.run({ data: { path: params.data.path } });
  }
}
