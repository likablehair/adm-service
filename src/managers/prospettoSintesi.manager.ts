import { ProcessRequest } from 'src/requests/baseRequest';
import DownloadProspettoSintesi from 'src/requests/ponImport/downloadProspettoSintesiRequest';
import RichiestaProspettoSintesiRequest, {
  RichiestaProspettoSintesi,
} from 'src/requests/ponImport/richiestaProspettoSintesiRequest';

import { parseStringPromise } from 'xml2js';
import * as fsPromises from 'fs/promises';
import { AdmDeclarationMapped, PDFConverter } from 'src/main';

export type ProspettoSintesiResult = {
  mrn: string;
  rev: string;
  type: string;
  path: string;
  exit: {
    code: string;
    message: string;
  };
};

export default class ProspettoSintesiManager {

  async import(params: ProcessRequest<RichiestaProspettoSintesi>): Promise<AdmDeclarationMapped> {
    try {
      const downloadedPDF: string = await this.download(params);
      const savedPDF: ProspettoSintesiResult = await this.save(downloadedPDF);
      return await this.convert({ data : {path: savedPDF.path}});
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw new Error(err.message);
      } else {
        throw new Error('Unknown error');
      }
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

      if (richiestaProspetto.type !== 'success') {
        throw new Error('RichiestaProspettoSintesi failed');
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
        throw new Error('DownloadProspettoSintesi failed');
      }

      if (!downloadProspetto.message?.data) {
        throw new Error('PDF not found');
      }

      return downloadProspetto.message.data;
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw new Error(err.message);
      } else {
        throw new Error('Unknown error');
      }
    }
  }

  async save(request: string): Promise<ProspettoSintesiResult> {
    try {
      const xmlFilePath = 'tmp.pdf';

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
        exit: {
          code: downloaded.output.esito.codiceErrore,
          message: downloaded.output.esito.messaggioErrore,
        },
      };

      return result;
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw new Error(err.message);
      } else {
        throw new Error('Unknown error');
      }
    }
  }

  async convert(params: { data: { path: string } }) {
    const converterPDF = new PDFConverter();
    return await converterPDF.run({ data: { path: params.data.path }});
  }
}
