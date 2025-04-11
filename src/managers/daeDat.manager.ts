import { ProcessRequest } from 'src/requests/baseRequest';
import RichiestaDaeDatRequest, {
  RichiestaDaeDat,
} from 'src/requests/ponImport/richiestaDaeDatRequest';
import { parseStringPromise } from 'xml2js';
import * as fsPromises from 'fs/promises';
import DaeDatPDFConverter, {
  DaeDatStatementMapped,
} from 'src/converters/DaeDatPDFConverter';
import { AdmFile } from './prospettoSintesi.manager';

export const DAE_DAT_PDF_TYPES = ['DAE', 'DAT'] as const;

export type DaeDatResult = {
  mrn: string;
  rev: string;
  pdfType: (typeof DAE_DAT_PDF_TYPES)[number];
  path: string;
  buffer: Buffer;
  exit: {
    code: string;
    message: string;
  };
};

export type ImportDaeDatResult = {
  file: AdmFile;
  daeDatStatementMapped: DaeDatStatementMapped;
};

export const DaeDatMissingError = 'DaeDat not present';

export default class DaeDatManager {
  async import(
    params: ProcessRequest<RichiestaDaeDat>,
  ): Promise<ImportDaeDatResult> {
    try {
      const downloadedPDF: string = await this.download(params);
      const savedPDF: DaeDatResult = await this.save(
        params.data.xml.mrn,
        downloadedPDF,
      );
      const daeDatStatementMapped: DaeDatStatementMapped = await this.convert({
        data: { buffer: savedPDF.buffer },
      });

      return {
        file: {
          buffer: savedPDF.buffer,
          from: { path: savedPDF.path },
          extension: 'pdf',
          docType: savedPDF.pdfType,
          version: Number(savedPDF.rev),
        },
        daeDatStatementMapped,
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

      localError.message = `importing DaeDat: ${localError.message}`;
      throw localError;
    }
  }
  async download(params: ProcessRequest<RichiestaDaeDat>): Promise<string> {
    try {
      const richiestaDaeDatRequest = new RichiestaDaeDatRequest();
      const richiestaDaeDat =
        await richiestaDaeDatRequest.processRequest(params);

      if (richiestaDaeDat.message?.esito?.codice == '197') {
        //DO NOT MODIFY THE TEXT OF THIS ERROR
        throw new Error(DaeDatMissingError);
      }

      if (richiestaDaeDat.type !== 'success') {
        throw new Error(
          `message: ${richiestaDaeDat.message?.esito?.messaggio}`,
        );
      }

      if (!richiestaDaeDat.message?.data) {
        throw new Error('PDF not found');
      }

      return richiestaDaeDat.message.data;
    } catch (error: unknown) {
      let localError: Error;

      if (error instanceof Error) {
        localError = error;
      } else if (typeof error === 'string') {
        localError = new Error(error);
      } else {
        localError = new Error('Unknown error');
      }

      localError.message = `downloading DaeDat: ${localError.message}`;
      throw localError;
    }
  }

  async save(mrn: string, request: string): Promise<DaeDatResult> {
    try {
      const xmlFilePath = `${mrn}_daeDat.pdf`;

      const buffer = Buffer.from(request, 'base64');
      await fsPromises.writeFile(xmlFilePath, buffer);

      const xmlContent = await fsPromises.readFile(xmlFilePath, 'utf8');
      await fsPromises.unlink(xmlFilePath);

      const parsed = await parseStringPromise(xmlContent, {
        explicitArray: false,
      });
      const downloaded = parsed['ns0:RichiestaDaeDat'];
      const data = downloaded.output.dichiarazione;
      const attachment = downloaded.output.daeDat;
      const pdfType = attachment.tipoPdf;
      const pdfContent = Buffer.from(attachment.contenuto, 'base64');

      if (!DAE_DAT_PDF_TYPES.includes(pdfType)) {
        throw new Error(`PDF Type "${pdfType}"is not valid`);
      }

      const result: DaeDatResult = {
        mrn: data.mrn,
        rev: data.revisione,
        pdfType,
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

      localError.message = `saving DaeDat: ${localError.message}`;
      throw localError;
    }
  }

  async convert(params: { data: { path: string } | { buffer: Buffer } }) {
    const converterPDF = new DaeDatPDFConverter();
    return await converterPDF.run(params);
  }
}
