import { expect, test } from 'vitest';

import {
  RichiestaListaDocumentiDichiarazioniRequest,
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

  const signCertificate = import.meta.env.VITE_SIGN_CERTIFICATE_URL;
  if (!signCertificate) {
    console.error('ERROR: CERTIFICATE_SIGN not found');
    return;
  }

  const request = new RichiestaListaDocumentiDichiarazioniRequest();
  const result = await request.processRequest({
    data: {
      xmlParams: {
        mrn: 'test',
        utenteInvio: 'test',
      },
      dichiarante: '01824540346',
    },
    security: {
      admCertificate: {
        path: certificateUrl,
        passphrase: certificatePassphrase,
      },
      signCertificate: {
        path: certificateUrl,
        passphrase: certificatePassphrase,
      },
    },
  });
  if (result.type === 'success') {
    const esito = (result.message[0] as ProcessResponse).esito;
    console.log('esito', esito);
  }
  console.log('result async', result);
  expect(result.type).toBe('success');
});
