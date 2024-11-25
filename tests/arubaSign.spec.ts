import ArubaSignatureManager from 'src/managers/arubaSignature.manager';
import { expect, expectTypeOf, test } from 'vitest';

test('Sign an XML', async () => {
  const arubaSign = new ArubaSignatureManager();

  const otpPWD = import.meta.env.VITE_ARUBA_OTP_PWD;
  const user = import.meta.env.VITE_ARUBA_USER;
  const userPWD = import.meta.env.VITE_ARUBA_USER_PWD;
  const delegatedUser = import.meta.env.VITE_ARUBA_DELEGATED_USER;
  const delegatedPassword = import.meta.env.VITE_ARUBA_DELEGATED_PASSWORD;
  const delegatedDomain = import.meta.env.VITE_ARUBA_DELEGATED_DOMAIN;
  const typeOtpAuth = import.meta.env.VITE_ARUBA_TYPE_OTP_AUTH;

  const xmlTest = `
    <root>
      <child>test</child>
    </root>
  `;

  const binaryXML = Buffer.from(xmlTest).toString('base64');

  expectTypeOf(
    arubaSign.xmlSignature({
      inputType: 'BYNARYNET',
      binaryInput: binaryXML,
      identity: {
        otpPWD,
        user,
        userPWD,
        delegatedUser,
        delegatedPassword,
        typeOtpAuth,
        delegatedDomain,
      },
      xmlSignatureType: 'XMLENVELOPED',
      signatureProfile: 'ETSI_TS_103171_v2_1_1',
    }),
  ).resolves.toBeString();
});

test('Sign an XML (credentials error)', async () => {
  const arubaSign = new ArubaSignatureManager();

  const otpPWD = '';
  const user = '';
  const userPWD = '';
  const delegatedUser = '';
  const delegatedPassword = '';
  const delegatedDomain = '';
  const typeOtpAuth = '';

  const xmlTest = `
    <root>
      <child>test</child>
    </root>
  `;

  const binaryXML = Buffer.from(xmlTest).toString('base64');

  await expect(
    arubaSign.xmlSignature({
      inputType: 'BYNARYNET',
      binaryInput: binaryXML,
      identity: {
        otpPWD,
        user,
        userPWD,
        delegatedUser,
        delegatedPassword,
        typeOtpAuth,
        delegatedDomain,
      },
      xmlSignatureType: 'XMLENVELOPED',
      signatureProfile: 'ETSI_TS_103171_v2_1_1',
    }),
  ).rejects.toThrowError();
});
