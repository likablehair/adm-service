import * as xadesjs from 'xadesjs';
import { Crypto } from '@peculiar/webcrypto';

export default class XAdES {
  constructor() {
    xadesjs.Application.setEngine('NodeJS', new Crypto());
  }

  public async generateKeyPair() {
    const algorithm = {
      name: 'RSASSA-PKCS1-v1_5',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: { name: 'SHA-256' },
    };
    try {
      const keys = await xadesjs.Application.crypto.subtle.generateKey(
        algorithm,
        true,
        ['sign', 'verify'],
      );

      return {
        keys: keys,
        algorithm: algorithm,
      };
    } catch (error) {
      console.error('Error in generateKeyPair', error);
    }
  }

  public async signXML(params: {
    xmlString: string;
    keys: CryptoKeyPair;
    algorithm: {
      name: string;
      hash: string;
    };
  }) {
    const algorithm = {
      name: params.algorithm.name,
      hash: params.algorithm.hash,
    };

    try {
      const xmlDoc = xadesjs.Parse(params.xmlString);
      const signedXml = new xadesjs.SignedXml();
      const keys = params.keys;

      const signature = await signedXml.Sign(
        algorithm,
        keys.privateKey,
        xmlDoc,
        {
          keyValue: keys.publicKey,
          references: [
            { hash: algorithm.hash, transforms: ['enveloped'], uri: '' },
          ],
        },
      );

      const signatureValue = signature
        .GetXml()
        ?.getElementsByTagName('ds:SignatureValue');
      if (signatureValue && signatureValue.length) {
        signatureValue[0].setAttribute('Id', signature.Id + '-SIGVALUE');
      }

      return signature.toString();
    } catch (error) {
      console.error('Error in signXML: ', error);
    }
  }
}
