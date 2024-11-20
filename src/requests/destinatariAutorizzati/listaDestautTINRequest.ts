import BaseRequest, {
  BaseProcessRequest,
  ProcessResponse,
  ProcessRequest,
} from '../baseRequest';
import destinatariAutorizzatiCodiciEsito from '../destinatariAutorizzati/destinatariAutorizzatiCodiciEsito.json';

export type Enquiry = {
  tin: string;
  mrn: string;
  state: string;
  codUff: string;
  dataDa: string;
  dataA: string;
};

export default class ListaDestautTIN extends BaseRequest<Enquiry> {
  constructor() {
    const superArgs = {
      httpsUrl:
        'https://interop.adm.gov.it/DestinariAutorizzatiServiceWeb/services/DestinatariAutorizzatiService',
      soapUrl: 'DestinatariAutorizzatiService.wsdl',
      httpSoapAction:
        'http://process.destinatariautorizzatiservice.domest.sogei.it/wsdl/DestinatariAutorizzatiService',
      successCodes: destinatariAutorizzatiCodiciEsito.success,
      errorCodes: destinatariAutorizzatiCodiciEsito.error,
    };
    super(
      superArgs.httpsUrl,
      superArgs.soapUrl,
      superArgs.httpSoapAction,
      superArgs.successCodes,
      superArgs.errorCodes,
    );
  }

  async processRequest(params: ProcessRequest<Enquiry>): Promise<{
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
        serviceId: 'listaDestautTIN',
      });
    } catch (e) {
      return { type: 'error', message: undefined };
    }
  }

  protected createXMLForRequest(params: Enquiry): string {
    return `
      <enquiry xsi:noNamespaceSchemaLocation="schema.xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
        <tin>${params.tin}</tin>
        <mrn>${params.mrn}</mrn>
        <state>${params.state}</state>
        <codUff>${params.codUff}</codUff>
        <dataDa>${params.dataDa}</dataDa>
        <dataA>${params.dataA}</dataA>
      </enquiry>
    `;
  }

  protected createSoapEnvelope(
    params: Omit<BaseProcessRequest<string>, 'security'>,
  ): string {
    return `
      <soap:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:type="http://ponimport.ssi.sogei.it/type/">
      <soap:Header/>
      <soap:Body>
        <des:Input>
            <des:serviceId>${params.serviceId}</des:serviceId>
            <!--1 or more repetitions:-->
            <des:data>
              <des:xml>${params.data.xml}</des:xml>
              <des:dichiarante>${params.data.dichiarante}</des:dichiarante>
            </des:data>
        </des:Input>
      </soapenv:Body>
  </soapenv:Envelope>
    `;
  }
}
