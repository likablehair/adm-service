import { expect, test } from 'vitest';

import * as fs from 'node:fs';
import XMLConverter, {
  AdmDeclarationMapped,
} from 'src/converters/XMLConverter';
import RichiestaProspettoSintesiRequest from 'src/requests/ponImport/richiestaProspettoSintesiRequest';
import ProspettoSintesiManager, {
  ProspettoSintesiResult,
} from 'src/managers/prospettoSintesi.manager';
import RichiestaIvistoRequest from 'src/requests/exportService/richiestaIvistoRequest';
import IvistoManager from 'src/managers/ivisto.manager';
import RichiestaProspettoContabileRequest from 'src/requests/ponImport/richiestaProspettoContabileRequest';
import ProspettoContabileManager from 'src/managers/prospettoContabile.manager';
import RichiestaProspettoSvincoloRequest from 'src/requests/ponImport/richiestaProspettoSvincoloRequest';
import ProspettoSvincoloManager, {
  ProspettoSvincoloResult,
} from 'src/managers/prospettoSvincolo.manager';
import RichiestaDaeDatRequest from 'src/requests/ponImport/richiestaDaeDatRequest';
import DaeDatManager, { DaeDatResult } from 'src/managers/daeDat.manager';
import { AccountingStatementMapped } from 'src/converters/AccountingPDFConverter';
import { DaeDatStatementMapped } from 'src/converters/DaeDatPDFConverter';
import { IvistoResult } from 'src/main';

test('RichiestaIvistoRequest', async () => {
  const certificatePath = import.meta.env.VITE_CERTIFICATE_EXPORT_URL;
  if (!certificatePath) {
    console.error('ERROR: CERTIFICATE_URL not found');
    return;
  }

  const certificatePassphrase = import.meta.env
    .VITE_CERTIFICATE_EXPORT_PASSPHRASE;
  if (!certificatePassphrase) {
    console.error('ERROR: CERTIFICATE_PASSPHRASE not found');
    return;
  }

  const mrn = import.meta.env.VITE_MRN_IVISTO_TEST;
  if (!mrn) {
    console.error('ERROR: MRN_TEST not found');
    return;
  }

  const dichiarante = import.meta.env.VITE_EXPORT_DICHIARANTE_TEST;
  if (!dichiarante) {
    console.error('ERROR: EXPORT_DICHIARANTE_TEST not found');
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

  const request = new RichiestaIvistoRequest();

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

  const manager = new IvistoManager();

  if (result.type === 'success' && !!result.message && !!result.message.data) {
    const ivistoResult: IvistoResult = await manager.convert({
      mrn: mrn,
      data: result.message.data,
    });
    expect(ivistoResult.ivistoMapped.exportOperation.mrn).toBe(mrn);
  }

  expect(result.type).toBe('success');
});

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

  const mrn = import.meta.env.VITE_MRN_IMPORT_TEST;
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

  expect(result.type).toBe('success');
});

test('RichiestaProspettoContabileRequest', async () => {
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

  const mrn = import.meta.env.VITE_MRN_IMPORT_TEST;
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

  const request = new RichiestaProspettoContabileRequest();

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

  expect(result.type).toBe('success');
});

test('RichiestaProspettoSvincoloRequest', async () => {
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

  const mrn = import.meta.env.VITE_MRN_IMPORT_TEST;
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

  const request = new RichiestaProspettoSvincoloRequest();

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

  expect(result.type).toBe('success');
});

test('RichiestaDaeDatRequest', async () => {
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

  const mrn = import.meta.env.VITE_MRN_EXPORT_TEST;
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

  const request = new RichiestaDaeDatRequest();

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

  expect(result.type).toBe('success');
});

test('Convert XML', async () => {
  const converterXML = new XMLConverter();

  //Must be a string with the XML content, not the path
  const xml = import.meta.env.VITE_XML_TEST;
  if (!xml) {
    console.error('ERROR: XML_TEST not found');
    return;
  }

  await converterXML.run({ xmlData: xml });
});

test(
  'Import Declaration PDF',
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

    const mrn = import.meta.env.VITE_MRN_IMPORT_TEST;
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

    const params = {
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
    };
    const downloadedPDF = await manager.download(params);

    const result: ProspettoSintesiResult = await manager.save(
      params.data.xml.mrn,
      downloadedPDF,
    );
    const admDeclarationMapped: AdmDeclarationMapped = await manager.convert({
      data: { buffer: result.buffer },
    });

    expect(result.exit.code).toBe('CM_000');
    expect(result.exit.message).toBe('Operazione effettuata con successo');
    expect(admDeclarationMapped.mrn).toBe(import.meta.env.VITE_MRN_IMPORT_TEST);
  },
);

test(
  'Import Prospetto Contabile',
  {
    timeout: 20000,
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

    const mrn = import.meta.env.VITE_MRN_IMPORT_TEST;
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

    const seaTaxCodes = [
      '9AA',
      '9AB',
      '9AC',
      '9AD',
      '9AE',
      '9AF',
      '9AG',
      '9AH',
      '9AJ',
      '9AK',
      '9AL',
      '9AM',
      '9AN',
      '9AP',
      '9AR',
      '9AS',
      '9BA',
      '9BD',
      '9CA',
      '9CB',
      '9CC',
      '9CE',
      '9CK',
      '9DF',
    ];

    const manager = new ProspettoContabileManager();

    const params = {
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
    };
    const downloadedPDF = await manager.download(params);

    const result: ProspettoSintesiResult = await manager.save(
      params.data.xml.mrn,
      downloadedPDF,
    );
    const accountingStatementMapped: AccountingStatementMapped =
      await manager.convert({
        data: { buffer: result.buffer, seaTaxCodes },
      });

    expect(result.exit.code).toBe('CM_000');
    expect(result.exit.message).toBe('Operazione effettuata con successo');
    expect(accountingStatementMapped).toBeDefined();
  },
);

test(
  'Import Prospetto Svincolo',
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

    const mrn = import.meta.env.VITE_MRN_IMPORT_TEST;
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

    const manager = new ProspettoSvincoloManager();

    const params = {
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
    };
    const downloadedPDF = await manager.download(params);

    const result: ProspettoSvincoloResult = await manager.save(
      params.data.xml.mrn,
      downloadedPDF,
    );

    expect(result.exit.code).toBe('CM_000');
    expect(result.exit.message).toBe('Operazione effettuata con successo');
  },
);

test(
  'Import DaeDat',
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

    const mrn = import.meta.env.VITE_MRN_EXPORT_TEST;
    if (!mrn) {
      console.error('ERROR: MRN_TEST not found');
      return;
    }

    const dichiarante = import.meta.env.VITE_EXPORT_DICHIARANTE_TEST;
    if (!dichiarante) {
      console.error('ERROR: EXPORT_DICHIARANTE_TEST not found');
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

    const manager = new DaeDatManager();
    const params = {
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
    };
    const downloadedPDF = await manager.download(params);

    const result: DaeDatResult = await manager.save(
      params.data.xml.mrn,
      downloadedPDF,
    );
    const daeDatStatementMapped: DaeDatStatementMapped = await manager.convert({
      data: { buffer: result.buffer },
    });

    expect(result.exit.code).toBe('CM_000');
    expect(result.exit.message).toBe('Operazione effettuata con successo');
    expect(daeDatStatementMapped).toBeDefined();
  },
);
