import { parseStringPromise } from 'xml2js';

export type BaseXMLSignatureEnvelopeParams = {
  xmlSignatureType: 'XMLENVELOPED' | 'XMLENVELOPING' | 'XMLDETACHED_INTERNAL';
  sessionId?: string;
  signatureProfile?:
    | 'ETSI_EN_319_132_1_v1_1_1'
    | 'ETSI_TS_103171_v2_1_1'
    | 'XMLDETACHED_INTERNAL';
  identity: {
    typeHSM?: string;
    typeOtpAuth?: string;
    user?: string;
    userPWD?: string;
    otpPWD?: string;
    delegatedUser?: string;
    delegatedPassword?: string;
    delegatedDomain?: string;
    tsaIdentity?: string;
  };
};

export type BynaryNetParams = BaseXMLSignatureEnvelopeParams & {
  inputType: 'BYNARYNET';
  binaryInput: string;
};

export type FileNameParams = BaseXMLSignatureEnvelopeParams & {
  inputType: 'FILENAME';
  srcName: string;
  dstName: string;
};

export type DirectoryNameParams = BaseXMLSignatureEnvelopeParams & {
  inputType: 'DIRECTORYNAME';
  srcName: string;
  dstName: string;
};

export type StreamParams = BaseXMLSignatureEnvelopeParams & {
  inputType: 'STREAM';
  //stream: DataHandler - check what it is
};

export type XMLSignatureEnvelopeParams =
  | BynaryNetParams
  | FileNameParams
  | DirectoryNameParams
  | StreamParams;

export type XMLSignatureResponseBase = {
  'S:Envelope': {
    'S:Body': {
      'ns2:xmlsignatureResponse': {
        return: {
          return_code: string;
          status: string;
        };
      };
    };
  };
};

export type XMLSignatureResponseError = {
  'S:Envelope': {
    'S:Body': {
      'ns2:xmlsignatureResponse': {
        return: {
          description: string;
          return_code: string;
          status: 'KO';
        };
      };
    };
  };
};

export type XMLSignatureResponseSuccess = {
  'S:Envelope': {
    'S:Body': {
      'ns2:xmlsignatureResponse': {
        return: {
          binaryoutput: string;
          return_code: string;
          status: 'OK';
        };
      };
    };
  };
};

export type XMLSignatureResponse =
  | XMLSignatureResponseError
  | XMLSignatureResponseSuccess;

export default class ArubaSignatureManager {
  private _httpsUrl: string;

  constructor() {
    this._httpsUrl =
      'https://arss.arubapec.it:443/ArubaSignService/ArubaSignService';
  }

  public async xmlSignature(
    params: XMLSignatureEnvelopeParams,
  ): Promise<string> {
    const envelopeParams: XMLSignatureEnvelopeParams = params;

    const soapEnvelope =
      this._createSoapEnvelopeForXMLSignature(envelopeParams);

    const resultXml = await this._fetchRequest({
      soapEnvelope,
    });

    return resultXml;
  }

  private _createSoapEnvelopeForXMLSignature(
    params: XMLSignatureEnvelopeParams,
  ): string {
    let signRequestV2Content = '';

    switch (params.inputType) {
      case 'BYNARYNET':
        signRequestV2Content = `
          <binaryinput>${params.binaryInput}</binaryinput>
        `;
        break;
    }

    signRequestV2Content += `
      <certID>AS0</certID>
      <identity>
        <otpPwd>${params.identity.otpPWD}</otpPwd>
        <typeOtpAuth>${params.identity.typeOtpAuth}</typeOtpAuth>
        <user>${params.identity.user}</user>
        ${
          params.identity.userPWD
            ? `<userPWD>${params.identity.userPWD}</userPWD>`
            : ''
        }
        ${
          params.identity.delegatedUser
            ? `<delegated_user>${params.identity.delegatedUser}</delegated_user>`
            : ''
        }
        ${
          params.identity.delegatedPassword
            ? `<delegated_password>${params.identity.delegatedPassword}</delegated_password>`
            : ''
        }
        ${
          params.identity.delegatedDomain
            ? `<delegated_domain>${params.identity.delegatedDomain}</delegated_domain>`
            : ''
        }
      </identity>
      <transport>${params.inputType}</transport>
    `;

    let parameterContent = '';

    parameterContent += `
      <type>${params.xmlSignatureType}</type>
      ${
        params.signatureProfile
          ? `<signatureProfile>${params.signatureProfile}</signatureProfile>`
          : ''
      }
    `;

    return `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:arub="http://arubasignservice.arubapec.it/">
        <soapenv:Header/>
        <soapenv:Body>
          <arub:xmlsignature>
            <SignRequestV2>
              ${signRequestV2Content}
            </SignRequestV2>
            <parameter>
              ${parameterContent}
            </parameter>
          </arub:xmlsignature>
        </soapenv:Body>
      </soapenv:Envelope>
    `;
  }

  private async _fetchRequest(params: { soapEnvelope: string }) {
    try {
      const response = await fetch(this._httpsUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml;charset=UTF-8',
        },
        body: params.soapEnvelope,
      });

      const xmlResponse = await response.text();

      const parsedXML = await this._parseXMLResponse({ xmlResponse });

      return parsedXML;
    } catch (error: unknown) {
      let localError: Error;

      if (error instanceof Error) {
        localError = error;
      } else if (typeof error === "string") {
        localError = new Error(error);
      } else {
        localError = new Error("Unknown error");
      }

      localError.message = `fetchRequest from ArubaSignature: ${localError.message}`;
      throw localError;
    }
  }

  private async _parseXMLResponse(params: {
    xmlResponse: string;
  }): Promise<string> {
    try {
      const data: string = params.xmlResponse;

      const jsonData: XMLSignatureResponse = await parseStringPromise(data, {
        explicitArray: false,
      });

      const status =
        jsonData['S:Envelope']['S:Body']['ns2:xmlsignatureResponse']['return'][
          'status'
        ];

      if (status === 'KO') {
        const description =
          jsonData['S:Envelope']['S:Body']['ns2:xmlsignatureResponse'][
            'return'
          ]['description'];
        throw new Error(description);
      } else {
        const binaryOutput =
          jsonData['S:Envelope']['S:Body']['ns2:xmlsignatureResponse'][
            'return'
          ]['binaryoutput'];
        return binaryOutput;
      }
    } catch (error: unknown) {
      let localError: Error;

      if (error instanceof Error) {
        localError = error;
      } else if (typeof error === "string") {
        localError = new Error(error);
      } else {
        localError = new Error("Unknown error");
      }

      localError.message = `parseXMLResponse from ArubaSignature: ${localError.message}`;
      throw localError;
    }
  }
}
