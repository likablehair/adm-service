import * as xadesjs from 'xadesjs';
import { Crypto } from '@peculiar/webcrypto';
import forge from 'node-forge';
import * as fs from 'node:fs';

export default class XAdES {
  constructor() {
    xadesjs.Application.setEngine('NodeJS', new Crypto());
  }

  public async signXML(params: {
    xmlString: string;
    certPath: string;
    passphrase?: string;
  }) {
    const algorithm = {
      name: 'RSASSA-PKCS1-v1_5',
      hash: { name: 'SHA-256' },
    };

    try {
      const xmlDoc = xadesjs.Parse(params.xmlString);
      const signedXml = new xadesjs.SignedXml();

      const { privateKey } = await this._retrieveKeyFromCert(
        import.meta.env.VITE_CERTIFICATE_URL,
        import.meta.env.VITE_CERTIFICATE_PASSPHRASE,
      );

      const privateKeyDer = this._privateKeyToPkcs8(privateKey);
      const cryptoKey = await xadesjs.Application.crypto.subtle.importKey(
        'pkcs8',
        privateKeyDer,
        algorithm,
        false,
        ['sign'],
      );

      const signature = await signedXml.Sign(algorithm, cryptoKey, xmlDoc);

      const xmlSignature = signature.GetXml();

      if (xmlSignature) {
        const signatureValue = xmlSignature
          .getElementsByTagName('ds:SignatureValue')
          .item(0);

        if (signatureValue) {
          signatureValue.setAttribute('Id', signature.Id + '-SIGVALUE');
        }
      }

      return signature.toString();
    } catch (error) {
      console.error('Error in signXML: ', error);
    }
  }

  private _identifyCryptograhyStandard(
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

  private _extractKeysFromPKCS12(
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
          // Encrypted private key
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
      throw new Error('Private key not found in the p12 file');
    }
    if (!publicKey) {
      throw new Error('Public key not found in the p12 file');
    }

    return { privateKey, publicKey };
  }

  private _extractKeysFromPKCS7(/* certificateBuffer: Buffer */) {
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
      throw new Error('Private key not found in the p7 file');
    } */

    return { privateKey, publicKey };
  }

  private _extractKeysFromX509(certificateBuffer: Buffer) {
    const certificateDer = forge.util.binary.raw.encode(certificateBuffer);
    const certificateAsn1 = forge.asn1.fromDer(certificateDer);

    const certificate = forge.pki.certificateFromAsn1(certificateAsn1);

    return {
      privateKey: certificate.privateKey,
      publicKey: certificate.publicKey,
    };
  }

  private async _retrieveKeyFromCert(certPath: string, passphrase: string) {
    const certificateBuffer = fs.readFileSync(certPath);
    const cryptographyStandard = this._identifyCryptograhyStandard(
      certificateBuffer,
      passphrase,
    );

    let privateKey: forge.pki.PrivateKey | undefined = undefined;
    let publicKey: forge.pki.PublicKey | undefined = undefined;

    switch (cryptographyStandard) {
      case 'PKCS12':
        ({ privateKey, publicKey } = this._extractKeysFromPKCS12(
          certificateBuffer,
          passphrase,
        ));
        break;
      case 'PKCS7':
        ({ privateKey, publicKey } =
          this._extractKeysFromPKCS7(/* certificateBuffer */));
        break;
      case 'X509':
        ({ privateKey, publicKey } =
          this._extractKeysFromX509(certificateBuffer));
        break;
      default:
        throw new Error('Cryptographic standard not identified');
    }

    if (!privateKey) {
      throw new Error('Private key not found');
    }

    return { privateKey, publicKey };
  }

  private _stringToArrayBuffer(data: string) {
    const arrBuff = new ArrayBuffer(data.length);
    const writer = new Uint8Array(arrBuff);
    for (let i = 0, len = data.length; i < len; i++) {
      writer[i] = data.charCodeAt(i);
    }
    return arrBuff;
  }

  private _privateKeyToPkcs8(privateKey: forge.pki.PrivateKey) {
    const rsaPrivateKey = forge.pki.privateKeyToAsn1(privateKey);
    const privateKeyInfo = forge.pki.wrapRsaPrivateKey(rsaPrivateKey);
    const privateKeyInfoDer = forge.asn1.toDer(privateKeyInfo).getBytes();
    const privateKeyInfoDerBuff = this._stringToArrayBuffer(privateKeyInfoDer);
    return privateKeyInfoDerBuff;
  }
}
