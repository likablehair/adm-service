import soap from 'soap';

export type ProcessResponse = {
  IUT: string;
  esito: EsitoType;
  data?: string //base64 encoded string
  dataRegistrazione: string; //Date in string format
}

export type EsitoType = {
  codice: string;
  messaggio: string[];
}

export async function asyncRequestListDeclarationDocuments(params: {
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
}> {
  return await _asyncBasePonimportMethod({
    data: params.data,
    security: params.security,
    serviceId: 'richiestaListaDocumentiDichiarazione',
  });
}

export async function asyncRequestProspettoSintesi(params: {
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
}> {
  return await _asyncBasePonimportMethod({
    data: params.data,
    security: params.security,
    serviceId: 'richiestaProspettoSintesi',
  });
}

export async function asyncDownloadProspettoSintesi(params: {
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
}> {
  return await _asyncBasePonimportMethod({
    data: params.data,
    security: params.security,
    serviceId: 'downloadProspettoSintesi',
  });
}

async function _asyncBasePonimportMethod(params: {
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
  const url = './assets/ponimport_reale.wsdl';
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

    const client = await soap.createClientAsync(url);
    client.setSecurity(
      new soap.ClientSSLSecurityPFX(certificate, params.security.passphrase),
    );

    const resultProcess = await client.processAsync(xmlParams) as ProcessResponse[];
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