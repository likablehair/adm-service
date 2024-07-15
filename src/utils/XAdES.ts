import * as xadesjs from 'xadesjs';
import Encryption from 'src/utils/encryption';
import { webcrypto } from 'crypto';

export default class XAdES {
  private _encryption;

  constructor() {
    const crypto = webcrypto as unknown as Crypto;
    xadesjs.Application.setEngine('OpenSSL', crypto);
    this._encryption = new Encryption();
  }

  public async signXML(params: {
    xmlString: string;
    certPath: string;
    passphrase: string;
  }) {
    const algorithm = {
      name: 'RSASSA-PKCS1-v1_5',
      hash: { name: 'SHA-256' },
    };

    try {
      const xmlDoc = xadesjs.Parse(params.xmlString);
      const signedXml = new xadesjs.SignedXml();

      const { privateKey } = await this._encryption.retrieveKeyFromCert(
        params.certPath,
        params.passphrase,
      );

      const privateKeyDer = this._encryption.privateKeyToPkcs8(privateKey);
      const cryptoKey =
        await crypto.subtle.importKey(
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
}
