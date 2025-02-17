import { ProcessRequest } from 'src/requests/baseRequest';
import RichiestaProspettoSvincoloRequest, {
  RichiestaProspettoSvincolo,
} from 'src/requests/ponImport/richiestaProspettoSvincoloRequest';
import { parseStringPromise } from 'xml2js';
import * as fsPromises from 'fs/promises';
import { AdmFile } from './prospettoSintesi.manager';

export type ProspettoSvincoloResult = {
  mrn: string;
  rev: string;
  path: string;
  buffer: Buffer;
  exit: {
    code: string;
    message: string;
  };
  goodOutcomes: GoodOutcome[];
};

export type ImportProspettoSvincoloResult = {
  file: AdmFile;
  goodOutcomes: GoodOutcome[];
};

export type GoodOutcome = {
  singolo: string;
  codiceArticolo: string;
  codiceEsitoCDC: string;
  codiceSvincolo: string;
  codiceStatoElaborativo: string;
  descrizioneStatoElaborativo: string;
  dataSvincolo: string;
  completato: string;
};

export const ProspettoSvincoloMissingError = 'Prospetto Svincolo not present';

export default class ProspettoSvincoloManager {
  async import(
    params: ProcessRequest<RichiestaProspettoSvincolo>,
  ): Promise<ImportProspettoSvincoloResult> {
    try {
      const downloadedPDF: string = await this.download(params);

      const savedPDF: ProspettoSvincoloResult = await this.save(
        params.data.xml.mrn,
        downloadedPDF,
      );
      await fsPromises.unlink(savedPDF.path);

      return {
        file: {
          buffer: savedPDF.buffer,
          from: { path: savedPDF.path },
          extension: 'pdf',
          docType: 'release',
        },
        goodOutcomes: savedPDF.goodOutcomes,
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

      localError.message = `importing ProspettoSvincolo: ${localError.message}`;
      throw localError;
    }
  }
  async download(
    params: ProcessRequest<RichiestaProspettoSvincolo>,
  ): Promise<string> {
    try {
      const richiestaProspettoSvincoloRequest =
        new RichiestaProspettoSvincoloRequest();
      const richiestaProspetto =
        await richiestaProspettoSvincoloRequest.processRequest(params);

      if (richiestaProspetto.message?.esito?.codice == '197') {
        //DO NOT MODIFY THE TEXT OF THIS ERROR
        throw new Error(ProspettoSvincoloMissingError);
      }

      if (richiestaProspetto.type !== 'success') {
        throw new Error(
          `message: ${richiestaProspetto.message?.esito?.messaggio}`,
        );
      }

      if (!richiestaProspetto.message?.data) {
        throw new Error('PDF not found');
      }

      return richiestaProspetto.message.data;
    } catch (error: unknown) {
      let localError: Error;

      if (error instanceof Error) {
        localError = error;
      } else if (typeof error === 'string') {
        localError = new Error(error);
      } else {
        localError = new Error('Unknown error');
      }

      localError.message = `downloading ProspettoSvincolo: ${localError.message}`;
      throw localError;
    }
  }

  async save(mrn: string, request: string): Promise<ProspettoSvincoloResult> {
    try {
      const xmlFilePath = `${mrn}_release.pdf`;

      const buffer = Buffer.from(request, 'base64');
      await fsPromises.writeFile(xmlFilePath, buffer);

      const xmlContent = await fsPromises.readFile(xmlFilePath, 'utf8');
      await fsPromises.unlink(xmlFilePath);

      const parsed = await parseStringPromise(xmlContent, {
        explicitArray: false,
      });
      const downloaded = parsed['ns0:RichiestaProspettoSvincolo'];
      const data = downloaded.output.dichiarazione;
      const attachment = downloaded.output.prospettoSvincolo;
      let goodOutcomes = downloaded.output.articoli;
      const pdfFileName: string = attachment.nomeFile || 'decoded-tmp.pdf';

      const pdfContent = Buffer.from(attachment.contenuto, 'base64');
      await fsPromises.writeFile(pdfFileName, pdfContent);

      if (!Array.isArray(goodOutcomes)) {
        goodOutcomes = [goodOutcomes];
      }

      const result: ProspettoSvincoloResult = {
        mrn: data.mrn,
        rev: data.revisione,
        path: attachment.nomeFile,
        buffer: pdfContent,
        exit: {
          code: downloaded.output.esito.codiceErrore,
          message: downloaded.output.esito.messaggioErrore,
        },
        goodOutcomes,
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

      localError.message = `saving ProspettoSvincolo: ${localError.message}`;
      throw localError;
    }
  }
}
