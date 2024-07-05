import forge from 'node-forge';
import * as fs from 'node:fs';

export default class Encryption {
  constructor() { }

  identifyCryptograhyStandard(
    certificateBuffer: Buffer,
    passphrase: string,
  ) {
    const certificateDer = forge.util.binary.raw.encode(certificateBuffer);
    const certificateAsn1 = forge.asn1.fromDer(certificateDer);

    try {
      forge.pkcs12.pkcs12FromAsn1(certificateAsn1, passphrase);
      return 'PKCS12';
    } catch (error) {
      console.log('Error in identifyCryptograhyStandard', error);
    }

    try {
      forge.pkcs7.messageFromAsn1(certificateAsn1);
      return 'PKCS7';
    } catch (error) {
      console.log('Error in identifyCryptograhyStandard', error);
    }

    try {
      forge.pki.certificateFromAsn1(certificateAsn1);
      return 'X509';
    } catch (error) {
      console.log('Error in identifyCryptograhyStandard', error);
    }

    throw new Error('Cryptographic standard not identified');
  }

  extractKeysFromPKCS12(
    certificateBuffer: Buffer,
    passphrase: string,
  ) {
    const certificateDer = forge.util.binary.raw.encode(certificateBuffer);
    const certificateAsn1 = forge.asn1.fromDer(certificateDer);

    const p12 = forge.pkcs12.pkcs12FromAsn1(certificateAsn1, passphrase);

    let privateKey: forge.pki.PrivateKey | undefined = undefined;
    let publicKey: forge.pki.PublicKey | undefined = undefined;

    for (const safeContents of p12.safeContents) {
      for (const safeBag of safeContents.safeBags) {
        if (safeBag.type === forge.pki.oids.pkcs8ShroudedKeyBag) {
          // Encrypted  key
          privateKey = safeBag.key;
        } else if (safeBag.type === forge.pki.oids.certBag) {
          // Certificate
          if (safeBag.cert) {
            publicKey = safeBag.cert.publicKey;
          }
        }
      }
    }

    if (!privateKey) {
      throw new Error(' key not found in the p12 file');
    }
    if (!publicKey) {
      throw new Error('Public key not found in the p12 file');
    }

    return { privateKey, publicKey };
  }

  extractKeyAndCertFromPKCS12(
    certificateBuffer: Buffer,
    passphrase: string,
  ) {
    const certificateDer = forge.util.binary.raw.encode(certificateBuffer);
    const certificateAsn1 = forge.asn1.fromDer(certificateDer);

    const p12 = forge.pkcs12.pkcs12FromAsn1(certificateAsn1, passphrase);

    let privateKey: forge.pki.PrivateKey | undefined = undefined;
    let certificate: forge.pki.Certificate | undefined = undefined;

    for (const safeContents of p12.safeContents) {
      for (const safeBag of safeContents.safeBags) {
        if (safeBag.type === forge.pki.oids.pkcs8ShroudedKeyBag) {
          // Encrypted  key
          privateKey = safeBag.key;
        } else if (safeBag.type === forge.pki.oids.certBag) {
          // Certificate
          if (safeBag.cert) {
            certificate = safeBag.cert;
          }
        }
      }
    }

    if (!privateKey) {
      throw new Error(' key not found in the p12 file');
    }

    if (!certificate) {
      throw new Error('Certificate not found in the p12 file');
    }

    return { privateKey, certificate };

  }

  extractKeysFromPKCS7(/* certificateBuffer: Buffer */) {
    //WIP
    /*     const certificateDer = forge.util.binary.raw.encode(certificateBuffer);
    const certificateAsn1 = forge.asn1.fromDer(certificateDer);

    const p7 = forge.pkcs7.messageFromAsn1(certificateAsn1); */

    const privateKey: forge.pki.PrivateKey | undefined = undefined;
    const publicKey: forge.pki.PublicKey | undefined = undefined;

    /*     for (const recipient of p7.content) {
      if (recipient) {
        const decrypted = recipient.decrypt('passphrase');
        if (decrypted) {
          privateKey = decrypted;
        }
      }
    }

    if (!privateKey) {
      throw new Error(' key not found in the p7 file');
    } */

    return { privateKey, publicKey };
  }

  extractKeysFromX509(certificateBuffer: Buffer) {
    const certificateDer = forge.util.binary.raw.encode(certificateBuffer);
    const certificateAsn1 = forge.asn1.fromDer(certificateDer);

    const certificate = forge.pki.certificateFromAsn1(certificateAsn1);

    return {
      privateKey: certificate.privateKey,
      publicKey: certificate.publicKey,
    };
  }

  createPKCS12(
    privateKey: forge.pki.PrivateKey,
    certificate: forge.pki.Certificate,
    passphrase: string,
  ) {
    const p12Asn1 = forge.pkcs12.toPkcs12Asn1(
      privateKey,
      [certificate],
      passphrase,
      { 
        algorithm: 'aes256',
        generateLocalKeyId: true, 
      },
    );

    const p12Der = forge.asn1.toDer(p12Asn1).getBytes();

    const p12DerBuffer = Buffer.from(p12Der, 'binary');
    
    //Optional - just to check if the file is created
    fs.writeFileSync(
      './certificates/p12Der.p12', 
      p12DerBuffer,
      { flag: 'w'}
    );

    return p12DerBuffer;
  }

  async retrieveKeyFromCert(certPath: string, passphrase: string) {
    const certificateBuffer = fs.readFileSync(certPath);
    const cryptographyStandard = this.identifyCryptograhyStandard(
      certificateBuffer,
      passphrase,
    );

    let privateKey: forge.pki.PrivateKey | undefined = undefined;
    let publicKey: forge.pki.PublicKey | undefined = undefined;

    switch (cryptographyStandard) {
      case 'PKCS12':
        ({ privateKey, publicKey } = this.extractKeysFromPKCS12(
          certificateBuffer,
          passphrase,
        ));
        break;
      case 'PKCS7':
        ({ privateKey, publicKey } =
          this.extractKeysFromPKCS7(/* certificateBuffer */));
        break;
      case 'X509':
        ({ privateKey, publicKey } =
          this.extractKeysFromX509(certificateBuffer));
        break;
      default:
        throw new Error('Cryptographic standard not identified');
    }

    if (!privateKey) {
      throw new Error(' key not found');
    }

    return { privateKey, publicKey };
  }

   stringToArrayBuffer(data: string) {
    const arrBuff = new ArrayBuffer(data.length);
    const writer = new Uint8Array(arrBuff);
    for (let i = 0, len = data.length; i < len; i++) {
      writer[i] = data.charCodeAt(i);
    }
    return arrBuff;
  }

   privateKeyToPkcs8(privateKey: forge.pki.PrivateKey) {
    const rsaPrivateKey = forge.pki.privateKeyToAsn1(privateKey);
    const privateKeyInfo = forge.pki.wrapRsaPrivateKey(rsaPrivateKey);
    const privateKeyInfoDer = forge.asn1.toDer(privateKeyInfo).getBytes();
    const privateKeyInfoDerBuff = this.stringToArrayBuffer(privateKeyInfoDer);
    return privateKeyInfoDerBuff;
  }

  async convertPKCS12Encryption(
    certPath: string,
    passphrase: string,
  ) {
    const certificateBuffer = fs.readFileSync(certPath);
    const { privateKey, certificate } = this.extractKeyAndCertFromPKCS12(
      certificateBuffer,
      passphrase,
    );

    const newP12 = this.createPKCS12(privateKey, certificate, passphrase);

    return newP12;
  }

  

}