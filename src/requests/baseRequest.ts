import soap from 'soap';
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
      xml: string;
      dichiarante: string;
    };
    security: {
      certificate: Blob | string;
      passphrase: string;
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
      certificate: Blob | string;
      passphrase: string;
    };
    serviceId: string;
  }): Promise<{
    type: string;
    message: ProcessResponse[];
  }> {
    const xmlParams = {
      serviceId: params.serviceId,
      data: params.data,
    };

    try {
      let certificate: Buffer | string | undefined = undefined;

      if (params.security.certificate instanceof Blob) {
        const arrayBuffer = await params.security.certificate.arrayBuffer();
        certificate = Buffer.from(arrayBuffer);
      } else {
        certificate = params.security.certificate;
      }

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
        new soap.ClientSSLSecurityPFX(certificate, params.security.passphrase),
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
        throw new Error('Unknown error');
      }
    }
  }
}
