import BaseRequest, {
  BaseProcessRequest,
  ProcessResponse,
  ProcessRequest,
} from '../baseRequest';
import ponImportCodiciEsito from '../ponImport/ponImportCodiciEsito.json';

export type RichiestaIvisto = {
  mrn: string;
};

export default class RichiestaIvistoRequest extends BaseRequest<RichiestaIvisto> {
  constructor() {
    const superArgs = {
      httpsUrl:
        'https://interop.adm.gov.it/ExportServiceWeb/services/ExportService',
      soapUrl: '',
      httpSoapAction:
        'http://process.exportservice.domest.sogei.it/wsdl/ExportService',
      succesCodes: ponImportCodiciEsito.success,
      errorCodes: ponImportCodiciEsito.error,
    };
    super(
      superArgs.httpsUrl,
      superArgs.soapUrl,
      superArgs.httpSoapAction,
      superArgs.succesCodes,
      superArgs.errorCodes,
    );
  }

  async processRequest(params: ProcessRequest<RichiestaIvisto>): Promise<{
    type: 'success' | 'error' | 'unknown';
    message: ProcessResponse | undefined;
  }> {
    try {
      const generatedXml = this.createXMLForRequest(params.data.xml);

      return await this.asyncBaseProcessRequest({
        data: {
          xml: generatedXml,
          dichiarante: params.data.dichiarante,
        },
        security: params.security,
        serviceId: 'richiestaIvistoNonFirmata',
      });
    } catch (e) {
      return { type: 'error', message: undefined };
    }
  }

  protected createXMLForRequest(params: RichiestaIvisto): string {
    return `<mrn xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="Input.xsd">${params.mrn}</mrn>`;
  }

  protected createSoapEnvelope(
    params: Omit<BaseProcessRequest<string>, 'security'>,
  ): string {
    return `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:type="http://ponimport.ssi.sogei.it/type/">
        <soapenv:Header/>
        <soapenv:Body>
          <type:Input>
              <type:serviceId>${params.serviceId}</type:serviceId>
              <!--1 or more repetitions:-->
              <type:data>
                <type:xml>${params.data.xml}</type:xml>
                <type:dichiarante>${params.data.dichiarante}</type:dichiarante>
              </type:data>
          </type:Input>
      </soapenv:Body>
  </soapenv:Envelope>
    `;
  }
}
