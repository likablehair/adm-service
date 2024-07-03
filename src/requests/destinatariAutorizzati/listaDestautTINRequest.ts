import BaseRequest, { ProcessResponse } from '../baseRequest';

type Enquiry = {
  tin: string;
  mrn: string;
  state: string;
  codUff: string;
  dataDa: string;
  dataA: string;
};

export default class ListaDestautTIN extends BaseRequest<Enquiry> {
  constructor() {
    super('./assets/DestinatariAutorizzatiService.wsdl');
  }

  async processRequest(params: {
    data: {
      xml: string;
      dichiarante: string;
    };
    security: {
      certificate: string | Blob;
      passphrase: string;
    };
  }): Promise<{ type: string; message: ProcessResponse[] }> {
    try {
      return await this.asyncBaseProcessRequest({
        data: params.data,
        security: params.security,
        serviceId: 'listaDestautTIN',
      });
    } catch (e) {
      return { type: 'error', message: [] };
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

  protected createSoapEnvelope(params: {
    data: { xml: string; dichiarante: string };
    serviceId: string;
  }): string {
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
