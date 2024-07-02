import { expect, test } from 'vitest';
import { asyncRequestListDeclarationDocuments } from 'src/main';

test('asyncRequestListDeclarationDocuments', async () => {
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

  const xmlParams: Parameters<typeof asyncRequestListDeclarationDocuments>[0] =
    {
      data: {
        dichiarante: '01824540346',
        xml: 'test',
      },
      security: {
        certificate: certificateUrl,
        passphrase: certificatePassphrase,
      },
    };

  const result = await asyncRequestListDeclarationDocuments(xmlParams);
  console.log('result async', result);
  expect(result.type).toBe('success');
});
