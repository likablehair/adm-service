import soap from 'soap';
import XAdES from 'src/utils/XAdES';
import Encryption from 'src/utils/encryption';
import axios from 'axios';
import https from 'https';

export type BaseProcessRequestType<T> = {
  data: {
    xml: T;
    dichiarante: string;
  };
  security: {
    admCertificate: {
      path: string;
      passphrase: string;
    };
    signCertificate: {
      path: string;
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
  private _axiosUrl: string;
  private _soapUrl: string;
  private _encryption;

  constructor(axiosUrl: string, soapUrl: string) {
    this._axiosUrl = axiosUrl;
    this._soapUrl = soapUrl;
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
    const XAdESClass = new XAdES();

    const signedXML = await XAdESClass.signXML({
      xmlString: params.data.xml,
      certPath: params.security.signCertificate.path,
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

    try {
      const admCertificatePath = params.security.admCertificate.path;
      const admCertificatePassphrase =
        params.security.admCertificate.passphrase;

      const newAdmCertificate = await this._encryption.convertPKCS12Encryption(
        admCertificatePath,
        admCertificatePassphrase,
      );

      return await this._soapRequest({
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
      const client = await soap.createClientAsync(this._soapUrl);
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
        throw new Error(err.message);
      } else {
        throw new Error('Unknown error');
      }
    }
  }

  // This method is not used in the current implementation
  private async _axiosRequest(params: HTTPRequestType) {
    try {
      const soapEnvelope = this.createSoapEnvelope(params.xmlParams);
      const configuredHttpsAgent = new https.Agent({
        pfx: params.security.admCertificate.file,
        passphrase: params.security.admCertificate.passphrase,
        host: 'interop.adm.gov.it',
        keepAlive: true,
      });

      const config = {
        method: 'post',
        url: this._axiosUrl,
        headers: {
          'Content-Type': 'text/xml;charset=UTF-8',
          SOAPAction: 'http://ponimport.ssi.sogei.it/wsdl/PONImport',
        },
        httpsAgent: configuredHttpsAgent,
        data: soapEnvelope,
      };

      const response = await axios(config);
      const xmlResponse = response.data;

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
