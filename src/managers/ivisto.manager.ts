import { parseStringPromise } from 'xml2js';
import * as fsPromises from 'fs/promises';

export type IvistoResult = {
  type: string;
  message: {
    IUT: string;
    data: string;
    dataRegistrazione: string;
    esito: {
      codice: string;
      messaggio: string;
    };
    xml: string;
  };
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

export default class IvistoManager {
  async convert(params: { mrn: string; data: string }): Promise<IvistoMapped> {
    const xmlFilePath = `${params.mrn}.pdf`;
    const buffer = Buffer.from(params.data!, 'base64');
    await fsPromises.writeFile(xmlFilePath, buffer);
    const xmlContent = await fsPromises.readFile(xmlFilePath, 'utf8');
    await fsPromises.unlink(xmlFilePath);
    return await this.map(xmlContent);
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
