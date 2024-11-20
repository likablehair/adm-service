import { expect, test } from 'vitest';

import * as fs from 'node:fs';
import XMLConverter, { AdmDeclarationMapped } from 'src/utils/XMLConverter';
import RichiestaProspettoSintesiRequest from 'src/requests/ponImport/richiestaProspettoSintesiRequest';
import PDFConverter from 'src/utils/PDFConverter';
import ProspettoSintesiManager from 'src/managers/ProspettoSintesiManager';

test('RichiestaProspettoSintesiRequest', async () => {
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

  const mrn = import.meta.env.VITE_MRN_TEST;
  if (!mrn) {
    console.error('ERROR: MRN_TEST not found');
    return;
  }

  const dichiarante = import.meta.env.VITE_DICHIARANTE_TEST;
  if (!dichiarante) {
    console.error('ERROR: DICHIARANTE_TEST not found');
    return;
  }

  const otpPWD = import.meta.env.VITE_ARUBA_OTP_PWD;
  const user = import.meta.env.VITE_ARUBA_USER;
  const userPWD = import.meta.env.VITE_ARUBA_USER_PWD;
  const delegatedUser = import.meta.env.VITE_ARUBA_DELEGATED_USER;
  const delegatedPassword = import.meta.env.VITE_ARUBA_DELEGATED_PASSWORD;
  const delegatedDomain = import.meta.env.VITE_ARUBA_DELEGATED_DOMAIN;
  const typeOtpAuth = import.meta.env.VITE_ARUBA_TYPE_OTP_AUTH;

  const admCertificate = fs.readFileSync(certificatePath);

  const request = new RichiestaProspettoSintesiRequest();
  const result = await request.processRequest({
    data: {
      xml: {
        mrn,
      },
      dichiarante,
    },
    security: {
      admCertificate: {
        passphrase: certificatePassphrase,
        file: admCertificate,
      },
      identity: {
        otpPWD,
        user,
        userPWD,
        delegatedUser,
        delegatedPassword,
        typeOtpAuth,
        delegatedDomain,
      },
    },
  });

  // console.log('result async', result);
  expect(result.type).toBe('success');
});

test('Translate XML', async () => {
  const converterXML = new XMLConverter();

  //Must be a string with the XML content, not the path
  const xml = import.meta.env.VITE_XML_TEST;
  if (!xml) {
    console.error('ERROR: XML_TEST not found');
    return;
  }

  await converterXML.run({ xmlData: xml });
});

let PDF_PATH = '';
let MRN_TEST = '';

test(
  'Automation for requesting and downloading a declaration PDF',
  {
    timeout: 15000,
  },
  async () => {
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

    const mrn = import.meta.env.VITE_MRN_TEST;
    if (!mrn) {
      console.error('ERROR: MRN_TEST not found');
      return;
    }

    const dichiarante = import.meta.env.VITE_DICHIARANTE_TEST;
    if (!dichiarante) {
      console.error('ERROR: DICHIARANTE_TEST not found');
      return;
    }

    const otpPWD = import.meta.env.VITE_ARUBA_OTP_PWD;
    const user = import.meta.env.VITE_ARUBA_USER;
    const userPWD = import.meta.env.VITE_ARUBA_USER_PWD;
    const delegatedUser = import.meta.env.VITE_ARUBA_DELEGATED_USER;
    const delegatedPassword = import.meta.env.VITE_ARUBA_DELEGATED_PASSWORD;
    const delegatedDomain = import.meta.env.VITE_ARUBA_DELEGATED_DOMAIN;
    const typeOtpAuth = import.meta.env.VITE_ARUBA_TYPE_OTP_AUTH;

    const admCertificate = fs.readFileSync(certificatePath);

    const manager = new ProspettoSintesiManager();
    const result = await manager.process({
      data: {
        xml: {
          mrn,
        },
        dichiarante,
      },
      security: {
        admCertificate: {
          passphrase: certificatePassphrase,
          file: admCertificate,
        },
        identity: {
          otpPWD,
          user,
          userPWD,
          delegatedUser,
          delegatedPassword,
          typeOtpAuth,
          delegatedDomain,
        },
      },
    });

    PDF_PATH = result.filename;
    MRN_TEST = result.mrn;
    expect(result.exit.code).toBe('CM_000');
    expect(result.exit.message).toBe('Operazione effettuata con successo');

  },
);

test('Translate PDF', async () => {
  const converterPDF = new PDFConverter();
  const admDeclarationMapped: AdmDeclarationMapped = await converterPDF.run({ data: { path: PDF_PATH } });

  expect(admDeclarationMapped.mrn).toBe(MRN_TEST);

});
