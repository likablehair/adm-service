import BaseRequest, { ProcessResponse } from '../baseRequest';

export default class RichiestaProspettoSintesi extends BaseRequest {
  constructor() {
    //super('https://www.ponimpresa.gov.it/wsdl/ponimport.wsdl');
    //super('https://interop.adm.gov.it/ponimportsoap/services/ponimport');
    super('./assets/ponimport_reale.wsdl')
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
    return await this.asyncBaseProcessRequest({
      data: params.data,
      security: params.security,
      serviceId: 'richiestaProspettoSintesi',
    });
  }

  protected createSoapEnvelope(params: { data: { xml: string; dichiarante: string; }; serviceId: string; }): string {
    return `
      <soap:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:type="http://ponimport.ssi.sogei.it/type/">
      <soap:Header/>
      <soap:Body>
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
