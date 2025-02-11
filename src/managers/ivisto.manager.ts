import { parseStringPromise } from 'xml2js';
import * as fsPromises from 'fs/promises';
import { ProcessRequest, RichiestaIvisto } from 'src/main';
import RichiestaIvistoRequest from 'src/requests/exportService/richiestaIvistoRequest';
import { AdmFile } from 'src/main';

export type IvistoResult = {
  file: AdmFile;
  ivistoMapped: IvistoMapped;
};

export type IvistoMapped = {
  messageSender: string;
  messageRecipient: string;
  preparationDateAndTime: string;
  messageIdentification: string;
  messageType: string;
  exportOperation: {
    mrn: string;
    transit: number;
  };
  customsOfficeOfExport: {
    referenceNumber: string;
  };
  customsOfficeOfExitActual: {
    referenceNumber: string;
  };
  exitControlResult: {
    code: string;
    exitDate: string;
  };
};

export const IvistoMissingError = 'Ivisto not present';

export default class IvistoManager {
  async import(params: ProcessRequest<RichiestaIvisto>): Promise<IvistoResult> {
    const request = new RichiestaIvistoRequest();
    const result = await request.processRequest(params);

    if (result.message?.esito?.codice == '197') {
      //DO NOT MODIFY THE TEXT OF THIS ERROR
      throw new Error(IvistoMissingError);
    }

    if (result.type !== 'success') {
      throw new Error(`message: ${result.message?.esito?.messaggio}`);
    }

    if (!result.message || !result.message.data) {
      throw new Error('XML Not found');
    }

    const ivistoResult = await this.convert({
      mrn: params.data.xml.mrn,
      data: result.message.data,
    });

    return ivistoResult;
  }

  async convert(params: { mrn: string; data: string }): Promise<IvistoResult> {
    const xmlFilePath = `${params.mrn}.xml`;
    const buffer = Buffer.from(params.data!, 'base64');
    await fsPromises.writeFile(xmlFilePath, buffer);
    const xmlContent = await fsPromises.readFile(xmlFilePath, 'utf8');
    await fsPromises.unlink(xmlFilePath);
    const ivistoMapped = await this.map(xmlContent);
    return {
      ivistoMapped,
      file: {
        extension: 'xml',
        docType: 'ivisto',
        buffer,
        from: {
          path: xmlFilePath,
        },
      },
    };
  }

  async map(xmlContent: string): Promise<IvistoMapped> {
    const jsonResult = await parseStringPromise(xmlContent, {
      explicitArray: false,
    });

    const ieCC599C = jsonResult['ie:CC599C'];

    const result = {
      messageSender: ieCC599C.messageSender,
      messageRecipient: ieCC599C.messageRecipient,
      preparationDateAndTime: ieCC599C.preparationDateAndTime,
      messageIdentification: ieCC599C.messageIdentification,
      messageType: ieCC599C.messageType,
      exportOperation: {
        mrn: ieCC599C.ExportOperation.MRN,
        transit: Number(ieCC599C.ExportOperation.transit),
      },
      customsOfficeOfExport: {
        referenceNumber: ieCC599C.CustomsOfficeOfExport.referenceNumber,
      },
      customsOfficeOfExitActual: {
        referenceNumber: ieCC599C.CustomsOfficeOfExitActual.referenceNumber,
      },
      exitControlResult: {
        code: ieCC599C.ExitControlResult.code,
        exitDate: ieCC599C.ExitControlResult.exitDate,
      },
    };

    return result;
  }
}
