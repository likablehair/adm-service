import { ProcessRequest } from 'src/requests/baseRequest';
import { RichiestaProspettoSintesi } from 'src/requests/ponImport/richiestaProspettoSintesiRequest';
import { parseStringPromise } from 'xml2js';
import * as fsPromises from 'fs/promises';
import { ProspettoSintesiResult } from 'src/main';
import RichiestaProspettoContabileRequest from 'src/requests/ponImport/richiestaProspettoContabileRequest';
import DownloadProspettoContabile from 'src/requests/ponImport/downloadProspettoContabileRequest';
import { AdmFile } from './prospetto.manager';

export type ImportProspettoContabileResult = {
  file: AdmFile
};

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
      await fsPromises.unlink(savedPDF.path);

      return {
        file: {
          buffer: savedPDF.buffer,
          from: { path: savedPDF.path },
          extension: 'pdf',
          docType: 'accounting'
        },
      };
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
      const richiestaProspettoContabileRequest =
        new RichiestaProspettoContabileRequest();
      const richiestaProspetto =
        await richiestaProspettoContabileRequest.processRequest(params);

      if (richiestaProspetto.type !== 'success') {
        throw new Error('RichiestaProspettoContabile failed');
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
        throw new Error('DownloadProspettoContabile failed');
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
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw new Error(err.message);
      } else {
        throw new Error('Unknown error');
      }
    }
  }
}
