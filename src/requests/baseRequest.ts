import soap from 'soap';

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

export default abstract class BaseRequest {
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
        throw new Error(err.message);
      } else {
        throw new Error('Unknown error');
      }
    }
  }
}
