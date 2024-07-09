import BaseRequest, { ProcessRequestType, ProcessResponseType } from '../baseRequest';

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
    const superArgs = {
      axiosUrl: 'https://interop.adm.gov.it/DestinariAutorizzatiServiceWeb/services/DestinatariAutorizzatiService',
      soapUrl: './assets/DestinatariAutorizzatiService.wsdl',
    }
    super(superArgs.axiosUrl, superArgs.soapUrl)
  }

  async processRequest(params: 
    Omit<ProcessRequestType<Enquiry>, 'serviceId'>
  ): Promise<{ 
    type: string; 
    message: ProcessResponseType | undefined
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

  // This method is not used in the current implementation - Axios
  protected createSoapEnvelope(params: 
    Omit<ProcessRequestType<string>, 'security'>
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
