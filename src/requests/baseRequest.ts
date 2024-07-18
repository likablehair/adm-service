import * as soap from 'soap';
import XAdES from 'src/utils/XAdES';
import Encryption from 'src/utils/encryption';
import https from 'https';
import fetch from 'node-fetch';
import * as fs from 'node:fs';
import { resolve } from 'path';

export type BaseProcessRequestType<T> = {
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
    signCertificate: {
      path?: string;
      file?: Buffer;
      passphrase: string;
    };
  };
  serviceId: string;
};

export type ProcessResponseType = {
  IUT: string | null;
  esito: EsitoType | null;
  data?: string | null; //base64 encoded string
  dataRegistrazione: string | null; //Date in string format,
  xml: string | null;
};

export type EsitoType = {
  codice: string | null;
  messaggio: string | null;
};

export type ProcessRequestType<T> = Omit<
  BaseProcessRequestType<T>,
  'serviceId'
>;

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

  abstract processRequest(params: ProcessRequestType<T>): Promise<{
    type: string;
    message: ProcessResponseType | undefined;
  }>;

  protected abstract createSoapEnvelope(
    params: Omit<BaseProcessRequestType<string>, 'security'>,
  ): string;

  protected abstract createXMLForRequest(params: T): string;

  protected async asyncBaseProcessRequest(
    params: BaseProcessRequestType<string>,
  ): Promise<{
    type: string;
    message: ProcessResponseType;
  }> {
    try {
      const XAdESClass = new XAdES();

      let signCertificateBuffer: Buffer;
      if (params.security.signCertificate.path) {
        signCertificateBuffer = fs.readFileSync(
          params.security.signCertificate.path,
        );
      } else if (params.security.signCertificate.file) {
        signCertificateBuffer = params.security.signCertificate.file;
      } else {
        throw new Error('Certificate not found');
      }

      const signedXML = await XAdESClass.signXML({
        xmlString: params.data.xml,
        certFile: signCertificateBuffer,
        passphrase: params.security.signCertificate.passphrase,
      });

      console.log('signedXML', signedXML);

      if (!signedXML) {
        throw new Error('Error in signXML');
      }

      const signedXMLBase64 = btoa(signedXML);

      const xmlParams = {
        serviceId: params.serviceId,
        data: {
          xml: signedXMLBase64,
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

      return await this._axiosRequest({
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

      const message: ProcessResponseType = {
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
  private async _axiosRequest(params: HTTPRequestType) {
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

      const xmlDoc = new DOMParser().parseFromString(xmlResponse, 'text/xml');
      const data = <ProcessResponseType>{};

      const body = xmlDoc.getElementsByTagName('soapenv:Body');
      const output = body[0].childNodes[0];
      const outputNodes = output.childNodes;

      for (let i = 0; i < outputNodes.length; i++) {
        const node = outputNodes[i];

        if (node.nodeType === 1) {
          const nodeNameWithoutPrefix = node.nodeName.split(':')[1];

          if (
            (nodeNameWithoutPrefix as keyof ProcessResponseType) === 'esito'
          ) {
            const eistoNodes = node.childNodes;
            const esito = <EsitoType>{};

            for (let j = 0; j < eistoNodes.length; j++) {
              const esitoChild = eistoNodes[j];
              if (esitoChild.nodeType === 1) {
                const esitoChildNameWithoutPrefix =
                  esitoChild.nodeName.split(':')[1];
                esito[esitoChildNameWithoutPrefix as keyof EsitoType] =
                  esitoChild.textContent;
              }
            }
            data['esito'] = esito;
          } else {
            data[
              nodeNameWithoutPrefix as keyof Omit<ProcessResponseType, 'esito'>
            ] = node.textContent;
          }
        }
      }

      data['xml'] = xmlResponse;

      return {
        type: 'success',
        message: data,
      };
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw new Error(err.message);
      } else {
        throw new Error('Unknown error');
      }
    }
  }
}
