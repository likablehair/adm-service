
export type BaseXMLSignatureEnvelopeParams = {
  xmlSignatureType: 'XMLENVELOPED' | 'XMLENVELOPING' | 'XMLDETACHED_INTERNAL';
  sessionId?: string;
  signatureProfile?: 'ETSI_EN_319_132_1_v1_1_1' |
    'ETSI_TS_103171_v2_1_1' |
    'XMLDETACHED_INTERNAL'
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
  }
}

export type BynaryNetParams = BaseXMLSignatureEnvelopeParams & {
  inputType: 'BYNARYNET';
  binaryInput: string;
}

export type FileNameParams = BaseXMLSignatureEnvelopeParams & {
  inputType: 'FILENAME';
  srcName: string;
  dstName: string;
}

export type DirectoryNameParams = BaseXMLSignatureEnvelopeParams & {
  inputType: 'DIRECTORYNAME';
  srcName: string;
  dstName: string;
}

export type StreamParams = BaseXMLSignatureEnvelopeParams & {
  inputType: 'STREAM';
  //stream: DataHandler - check what it is
}

export type XMLSignatureEnvelopeParams = BynaryNetParams 
  | FileNameParams 
  | DirectoryNameParams 
  | StreamParams;


export default class ArubaSign {
  private _httpsUrl: string;

  constructor() {
    this._httpsUrl = 'https://arss.arubapec.it:443/ArubaSignService/ArubaSignService';
  }

  public async xmlSignature(params: XMLSignatureEnvelopeParams): Promise<string> {
    const envelopeParams: XMLSignatureEnvelopeParams = params;

    const soapEnvelope = this._createSoapEnvelopeForXMLSignature(envelopeParams);

    const resultXml = await this._fetchRequest({
      soapEnvelope,
    });

      return resultXml;
  }
  
  private _createSoapEnvelopeForXMLSignature(params: XMLSignatureEnvelopeParams): string {
    let signRequestV2Content = '';
    
    switch (params.inputType) {
      case "BYNARYNET":
        signRequestV2Content = `
          <binaryinput>${params.binaryInput}</binaryinput>
        `;
        break;
    }
    
    signRequestV2Content += `
      <certID>AS0</certID>
      <identity>
        <otpPWD>${params.identity.otpPWD}</otpPWD>
        <typeOtpAuth>${params.identity.typeOtpAuth}</typeOtpAuth>
        <user>${params.identity.user}</user>
        <userPWD>${params.identity.userPWD}</userPWD>
        ${
          params.identity.delegatedUser ? 
            `<delegated_user>${params.identity.delegatedUser}</delegated_user>` 
            : ''
        }
        ${
          params.identity.delegatedPassword ? 
            `<delegated_password>${params.identity.delegatedPassword}</delegated_password>` 
            : ''
        }
        ${
          params.identity.delegatedDomain ? 
            `<delegated_domain>${params.identity.delegatedDomain}</delegated_domain>` 
            : ''
        }
      </identity>
      <transport>${params.inputType}</transport>
      <signatureLevel>LT</signatureLevel>
    `;

    let parameterContent = '';

    parameterContent += `
      <type>${params.xmlSignatureType}</type>
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
    `
  }

  private async _fetchRequest(params: {
    soapEnvelope: string;
  }) {
    try {
      const response = await fetch(this._httpsUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml;charset=UTF-8',
        },
        body: params.soapEnvelope,
      })

      const xmlResponse = await response.text();
      return xmlResponse;
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw new Error(err.message);
      } else {
        throw new Error('Unknown error');
      }
    }
  }
}