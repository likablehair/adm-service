import { test } from 'vitest';

import ArubaSign from 'src/utils/ArubaSign';

test('Sign an XML', async () => {
  const arubaSign = new ArubaSign();

  const otpPWD = import.meta.env.VITE_ARUBA_OTP_PWD;
  const user = import.meta.env.VITE_ARUBA_USER;
  const userPWD = import.meta.env.VITE_ARUBA_USER_PWD;
  const delegatedUser = import.meta.env.VITE_ARUBA_DELEGATED_USER;
  const delegatedPassword = import.meta.env.VITE_ARUBA_DELEGATED_PASSWORD;
  const typeOtpAuth = import.meta.env.VITE_ARUBA_TYPE_OTP_AUTH;

  const xmlTest = `
    <root>
      <child>test</child>
    </root>
  `;

  const binaryXML = Buffer.from(xmlTest).toString('base64');

  const signedXML = await arubaSign.xmlSignature({
    inputType: 'BYNARYNET',
    binaryInput: binaryXML,
    identity: {
      otpPWD,
      user,
      userPWD,
      delegatedUser,
      delegatedPassword,
      typeOtpAuth,
    },
    xmlSignatureType: 'XMLENVELOPED',
  });

  console.log(signedXML);
});
