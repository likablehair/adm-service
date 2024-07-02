export const add = (a: number, b: number) => a + b;
export const sub = (a: number, b: number) => a - b;

import soap from 'soap';

export async function asyncRequestListDeclarationDocuments(params: {
  data: {
    xml: string;
    dichiarante: string;
  },
  security: {
    certificate: Blob | string;
    passphrase: string;
  }
}): Promise<{
  type: string;
  message: unknown;
}> {
  
  const url = './assets/ponimport_reale.wsdl';
  const xmlParams = {
    serviceId: 'richiestaListaDocumentiDichiarazione',
    data: params.data
  }

  try {

    let certificate: Buffer | string | undefined = undefined

    if (params.security.certificate instanceof Blob) {
      const arrayBuffer = await params.security.certificate.arrayBuffer();
      certificate = Buffer.from(arrayBuffer);
    } else {
      certificate = params.security.certificate;
    }

    const client = await soap.createClientAsync(url);
    client.setSecurity(
      new soap.ClientSSLSecurityPFX(
        certificate,
        params.security.passphrase
      )
    );

    const resultProcess = await client.processAsync(xmlParams);

    return {
      'type': 'success',
      'message': resultProcess
    };
  } catch (err) {
    return {
      'type': 'error',
      'message': err
    };
  }
  
}
