import * as soap from 'soap';
import Encryption from 'src/utils/encryption';
import https from 'https';
import fetch from 'node-fetch';
import * as fs from 'node:fs';
import { resolve } from 'path';
import ArubaSign from 'src/utils/ArubaSign';
import { parseStringPromise } from 'xml2js';

export type BaseProcessRequest<T> = {
  data: {
    xml: T;
    dichiarante: string;
  };
  security: {
    admCertificate: {
      path?: string;
      file?: Buffer;
      passphrase: string;
    };
    identity: {
      otpPWD: string;
      typeOtpAuth: string;
      user: string;
      userPWD?: string;
      delegatedUser?: string;
      delegatedPassword?: string;
      delegatedDomain?: string;
    };
  };
  serviceId: string;
};

export type ProcessResponseFromXML = {
  'soapenv:Envelope': {
    'soapenv:Body': {
      'ns2:Output': {
        'ns2:IUT': string;
        'ns2:esito': {
          'ns2:codice': string;
          'ns2:messaggio': string;
        };
        'ns2:data'?: string;
        'ns2:dataRegistrazione': string;
      };
    };
  };
};

export type ProcessResponse = {
  IUT: string | null;
  esito: Esito | null;
  data?: string | null; //base64 encoded string
  dataRegistrazione: string | null; //Date in string format,
  xml: string | null;
};

export type Esito = {
  codice: string | null;
  messaggio: string | null;
};

export type ProcessRequest<T> = Omit<BaseProcessRequest<T>, 'serviceId'>;

type HTTPRequestType = {
  xmlParams: {
    serviceId: string;
    data: {
      xml: string;
      dichiarante: string;
    };
  };
  security: {
    admCertificate: {
      file: Buffer;
      passphrase: string;
    };
  };
};

export default abstract class BaseRequest<T> {
  private _httpsUrl: string;
  private _httpSoapAction: string;
  private _soapUrl: string;
  private _encryption;

  constructor(httpsUrl: string, soapUrl: string, httpSoapAction: string) {
    this._httpsUrl = httpsUrl;
    this._soapUrl = soapUrl;
    this._httpSoapAction = httpSoapAction;
    this._encryption = new Encryption();
  }

  abstract processRequest(params: ProcessRequest<T>): Promise<{
    type: string;
    message: ProcessResponse | undefined;
  }>;

  protected abstract createSoapEnvelope(
    params: Omit<BaseProcessRequest<string>, 'security'>,
  ): string;

  protected abstract createXMLForRequest(params: T): string;

  protected async asyncBaseProcessRequest(
    params: BaseProcessRequest<string>,
  ): Promise<{
    type: string;
    message: ProcessResponse;
  }> {
    try {
      const arubaSign = new ArubaSign();

      const binaryXML = Buffer.from(params.data.xml).toString('base64');
      const signedCodedXML = await arubaSign.xmlSignature({
        inputType: 'BYNARYNET',
        binaryInput: binaryXML,
        xmlSignatureType: 'XMLENVELOPED',
        identity: params.security.identity,
        signatureProfile: 'ETSI_TS_103171_v2_1_1',
      });

      if (!signedCodedXML) {
        throw new Error('Error in signXML');
      }

      const xmlParams = {
        serviceId: params.serviceId,
        data: {
          xml: signedCodedXML,
          dichiarante: params.data.dichiarante,
        },
      };

      let certificateBuffer: Buffer;
      if (params.security.admCertificate.path) {
        certificateBuffer = fs.readFileSync(
          params.security.admCertificate.path,
        );
      } else if (params.security.admCertificate.file) {
        certificateBuffer = params.security.admCertificate.file;
      } else {
        throw new Error('Certificate not found');
      }

      const admCertificatePassphrase =
        params.security.admCertificate.passphrase;

      const newAdmCertificate = await this._encryption.convertPKCS12Encryption({
        certFile: certificateBuffer,
        passphrase: admCertificatePassphrase,
      });

      return await this._fetchRequest({
        xmlParams,
        security: {
          admCertificate: {
            file: newAdmCertificate,
            passphrase: admCertificatePassphrase,
          },
        },
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err);
        throw new Error(err.message);
      } else {
        console.error(err);
        throw new Error('Unknown error');
      }
    }
  }

  //DEPRECATED
  private async _soapRequest(params: HTTPRequestType) {
    try {
      const localUrl = import.meta.env.DEV
        ? resolve('public', this._soapUrl)
        : resolve(__dirname, this._soapUrl);

      const client = await soap.createClientAsync(localUrl);
      client.setSecurity(
        new soap.ClientSSLSecurityPFX(
          params.security.admCertificate.file,
          params.security.admCertificate.passphrase,
        ),
      );

      const resultProcess = await client.processAsync(params.xmlParams);

      const message: ProcessResponse = {
        ...resultProcess[0],
        xml: resultProcess[1],
      };

      return {
        type: 'success',
        message: message,
      };
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.log('Error in _soapRequest', err.stack);
        throw new Error(err.message);
      } else {
        throw new Error('Unknown error');
      }
    }
  }
  private async _fetchRequest(params: HTTPRequestType) {
    try {
      const soapEnvelope = this.createSoapEnvelope(params.xmlParams);

      const configuredHttpsAgent = new https.Agent({
        pfx: params.security.admCertificate.file,
        passphrase: params.security.admCertificate.passphrase,
        host: 'interop.adm.gov.it',
        keepAlive: true,
      });

      const response = await fetch(this._httpsUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml;charset=UTF-8',
          SOAPAction: this._httpSoapAction,
        },
        body: soapEnvelope,
        agent: configuredHttpsAgent,
      });

      const xmlResponse = await response.text();

      const jsonData: ProcessResponseFromXML = await parseStringPromise(
        xmlResponse,
        {
          explicitArray: false,
        },
      );

      const IUT =
        jsonData['soapenv:Envelope']['soapenv:Body']['ns2:Output']['ns2:IUT'];
      const dataRegistrazione =
        jsonData['soapenv:Envelope']['soapenv:Body']['ns2:Output'][
          'ns2:dataRegistrazione'
        ];
      const data =
        jsonData['soapenv:Envelope']['soapenv:Body']['ns2:Output']['ns2:data'];
      const esito = {
        codice:
          jsonData['soapenv:Envelope']['soapenv:Body']['ns2:Output'][
            'ns2:esito'
          ]['ns2:codice'],
        messaggio:
          jsonData['soapenv:Envelope']['soapenv:Body']['ns2:Output'][
            'ns2:esito'
          ]['ns2:messaggio'],
      };
      const xml = xmlResponse;

      const responseObject: ProcessResponse = {
        IUT,
        data,
        dataRegistrazione,
        esito,
        xml,
      };

      return {
        type: 'success',
        message: responseObject,
      };
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw new Error(err.message);
      } else {
        throw new Error('Unknown error');
      }
    }
  }

  protected abstract convertXMLResponse(params: T): string;
}
