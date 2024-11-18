import { ProcessRequest } from 'src/requests/baseRequest';
import DownloadProspettoSintesi from 'src/requests/ponImport/downloadProspettoSintesiRequest';
import RichiestaProspettoSintesi, {
  RichiestaProspetto,
} from 'src/requests/ponImport/richiestaProspettoSintesiRequest';

import { parseStringPromise } from 'xml2js';
import * as fsPromises from 'fs/promises';

export default class RequestAndDownloadDeclarationPDF {
  async process(params: ProcessRequest<RichiestaProspetto>): Promise<string> {
    try {
      const richiestaProspettoSintesiRequest = new RichiestaProspettoSintesi();
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

      return await this.save(downloadProspetto.message.data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw new Error(err.message);
      } else {
        throw new Error('Unknown error');
      }
    }
  }

  async save(request: string): Promise<string> {
    try {
      const xmlFilePath = 'download.pdf';
      const buffer = Buffer.from(request, 'base64');
      await fsPromises.writeFile(xmlFilePath, buffer);
      const xmlContent = await fsPromises.readFile(xmlFilePath, 'utf8');
      await fsPromises.unlink(xmlFilePath);

      const parsed = await parseStringPromise(xmlContent, {
        explicitArray: false,
      });
      const dowloaded = parsed['ns0:DownloadProspetto'];
      const data = dowloaded.output.datiDichiarazione;
      const attachment = dowloaded.output.allegato;
      const pdfFileName: string = attachment.nomeFile || 'decoded-content.pdf';

      const pdfContent = Buffer.from(attachment.contenuto, 'base64');
      await fsPromises.writeFile(pdfFileName, pdfContent);

      const jsonData = {
        mrn: data.mrn,
        rev: data.revisione,
        type: dowloaded.output.TipologiaProspetto,
        filename: attachment.nomeFile,
        exit: dowloaded.output.esito,
      };

      // console.log(JSON.stringify(jsonData, null, 4));
      return jsonData.filename;
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw new Error(err.message);
      } else {
        throw new Error('Unknown error');
      }
    }
  }
}
