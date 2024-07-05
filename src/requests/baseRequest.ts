import soap from 'soap';
import XAdES from 'src/XAdES';
/* import axios from 'axios';
import https from 'https'; */

export type ProcessResponse = {
  IUT: string;
  esito: EsitoType;
  data?: string; //base64 encoded string
  dataRegistrazione: string; //Date in string format
};

export type EsitoType = {
  codice: string;
  messaggio: string[];
};

export default abstract class BaseRequest<T> {
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  abstract processRequest(params: {
    data: {
      xmlParams: T;
      dichiarante: string;
    };
    security: {
      admCertificate: {
        path: string;
        passphrase: string;
      },
      signCertificate: {
        path: string;
        passphrase: string;
      }
    };
  }): Promise<{
    type: string;
    message: ProcessResponse[];
  }>;

  protected abstract createSoapEnvelope(params: {
    data: {
      xml: string;
      dichiarante: string;
    };
    serviceId: string;
  }): string;

  protected abstract createXMLForRequest(params: T): string;

  protected async asyncBaseProcessRequest(params: {
    data: {
      xml: string;
      dichiarante: string;
    };
    security: {
      admCertificate: {
        path: string;
        passphrase: string;
      },
      signCertificate: {
        path: string;
        passphrase: string;
      }
    };
    serviceId: string;
  }): Promise<{
    type: string;
    message: ProcessResponse[];
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
      const admCertificatePassphrase = params.security.admCertificate.passphrase;

      /*       const buffer = Buffer.from(certificate);
      const soapEnvelope = this.createSoapEnvelope(xmlParams);
      const configuredHttpsAgent = new https.Agent({
        pfx: buffer,
        passphrase: params.security.passphrase,
        host: 'interop.adm.gov.it',
        keepAlive: true,
      });
      
      const config = {
        method: 'post',
        url: this.url,
        headers: {
          'Content-Type': 'text/xml;charset=UTF-8',
          'SOAPAction': 'http://ponimport.ssi.sogei.it/wsdl/PONImport',
        },
        httpsAgent: configuredHttpsAgent,
        data: soapEnvelope,
      }

      const response = await axios(config);

      console.log('response', response.data)

      return {
        type: 'success',
        message: [],
      }; */

      const client = await soap.createClientAsync(this.url);
      client.setSecurity(
        new soap.ClientSSLSecurityPFX(admCertificatePath, admCertificatePassphrase),
      );

      const resultProcess = (await client.processAsync(
        xmlParams,
      )) as ProcessResponse[];
      return {
        type: 'success',
        message: resultProcess,
      };
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
}
