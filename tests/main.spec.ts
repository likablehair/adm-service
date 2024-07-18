import { expect, test } from 'vitest';

import { RichiestaListaDocumentiDichiarazioniRequest } from 'src/main';
import * as fs from 'node:fs';

test('RichiestaListaDocumentiDichiarazioniRequest', async () => {
  const certificatePath = import.meta.env.VITE_CERTIFICATE_URL;
  if (!certificatePath) {
    console.error('ERROR: CERTIFICATE_URL not found');
    return;
  }

  const certificatePassphrase = import.meta.env.VITE_CERTIFICATE_PASSPHRASE;
  if (!certificatePassphrase) {
    console.error('ERROR: CERTIFICATE_PASSPHRASE not found');
    return;
  }

  const signCertificatePath = import.meta.env.VITE_SIGN_CERTIFICATE_URL;
  if (!signCertificatePath) {
    console.error('ERROR: CERTIFICATE_SIGN not found');
    return;
  }

  const admCertificate = fs.readFileSync(certificatePath);
  const signCertificate = fs.readFileSync(signCertificatePath);

  const request = new RichiestaListaDocumentiDichiarazioniRequest();
  const result = await request.processRequest({
    data: {
      xml: {
        mrn: 'test',
        utenteInvio: 'test',
      },
      dichiarante: '01824540346',
    },
    security: {
      admCertificate: {
        passphrase: certificatePassphrase,
        file: admCertificate,
      },
      signCertificate: {
        passphrase: certificatePassphrase,
        file: signCertificate,
      },
    },
  });
  if (result.type === 'success') {
    const esito = result.message?.esito;
    console.log('esito', esito);
  }
  console.log('result async', result);
  expect(result.type).toBe('success');
});
