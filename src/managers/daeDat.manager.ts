import { ProcessRequest } from 'src/requests/baseRequest';
import RichiestaDaeDatRequest, {
  RichiestaDaeDat,
} from 'src/requests/ponImport/richiestaDaeDatRequest';
import { parseStringPromise } from 'xml2js';
import * as fsPromises from 'fs/promises';
import { AdmFile } from './prospetto.manager';
import DaeDatPDFConverter, { DaeDatStatementMapped } from 'src/converters/DaeDatPDFConverter';

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
      const daeDatStatementMapped: DaeDatStatementMapped =
        await this.convert({
          data: { path: savedPDF.path },
        });
      await fsPromises.unlink(savedPDF.path);

      return {
        file: {
          buffer: savedPDF.buffer,
          from: { path: savedPDF.path },
          extension: 'pdf',
          docType: savedPDF.pdfType,
        },
        daeDatStatementMapped
      };
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw new Error(err.message);
      } else {
        throw new Error('Unknown error');
      }
    }
  }
  async download(params: ProcessRequest<RichiestaDaeDat>): Promise<string> {
    try {
      const richiestaDaeDatRequest = new RichiestaDaeDatRequest();
      const richiestaDaeDat =
        await richiestaDaeDatRequest.processRequest(params);

      if (richiestaDaeDat.type !== 'success') {
        throw new Error('RichiestaDaeDat failed');
      }

      if (!richiestaDaeDat.message?.data) {
        throw new Error('PDF not found');
      }

      return richiestaDaeDat.message.data;
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw new Error(err.message);
      } else {
        throw new Error('Unknown error');
      }
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
      const pdfFileName: string = attachment.nomeFile || 'decoded-tmp.pdf';
      const pdfType = attachment.tipoPdf;

      if (!DAE_DAT_PDF_TYPES.includes(pdfType)) {
        throw new Error(`PDF Type "${pdfType}"is not valid`);
      }

      const pdfContent = Buffer.from(attachment.contenuto, 'base64');
      await fsPromises.writeFile(pdfFileName, pdfContent);

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
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw new Error(err.message);
      } else {
        throw new Error('Unknown error');
      }
    }
  }

  async convert(params: { data: { path: string } }) {
    const converterPDF = new DaeDatPDFConverter();
    return await converterPDF.run({ data: { path: params.data.path } });
  }
}
