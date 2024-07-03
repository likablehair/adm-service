import { expect, test } from 'vitest';

import {
  RichiestaListaDocumentiDichiarazioniRequest,
  ListaDestautTIN,
  ProcessResponse,
} from 'src/main';

test('RichiestaListaDocumentiDichiarazioniRequest', async () => {
  const certificateUrl = import.meta.env.VITE_CERTIFICATE_URL;
  if (!certificateUrl) {
    console.error('ERROR: CERTIFICATE_URL not found');
    return;
  }

  const certificatePassphrase = import.meta.env.VITE_CERTIFICATE_PASSPHRASE;
  if (!certificatePassphrase) {
    console.error('ERROR: CERTIFICATE_PASSPHRASE not found');
    return;
  }

  const xmlParams = {
    data: {
      dichiarante: '01824540346',
      xml: 'test',
    },
    security: {
      certificate: certificateUrl,
      passphrase: certificatePassphrase,
    },
  };

  const request = new RichiestaListaDocumentiDichiarazioniRequest();
  const result = await request.processRequest(xmlParams);
  if (result.type === 'success') {
    const esito = (result.message[0] as ProcessResponse).esito;
    console.log('esito', esito);
  }
  console.log('result async', result);
  expect(result.type).toBe('success');
});

test('ListaDestautTIN', async () => {
  const certificateUrl = import.meta.env.VITE_CERTIFICATE_URL;
  if (!certificateUrl) {
    console.error('ERROR: CERTIFICATE_URL not found');
    return;
  }

  const certificatePassphrase = import.meta.env.VITE_CERTIFICATE_PASSPHRASE;
  if (!certificatePassphrase) {
    console.error('ERROR: CERTIFICATE_PASSPHRASE not found');
    return;
  }

  const xmlParams = {
    data: {
      dichiarante: '01824540346',
      xml: 'test',
    },
    security: {
      certificate: certificateUrl,
      passphrase: certificatePassphrase,
    },
  };

  const request = new ListaDestautTIN();
  const result = await request.processRequest(xmlParams);
  if (result.type === 'success') {
    const esito = (result.message[0] as ProcessResponse).esito;
    console.log('esito', esito);
  }
  console.log('result async', result);
  //We don't have a valid certificate for this request
  expect(result.type).toBe('error');
});
