import BaseRequest, { ProcessResponse } from '../baseRequest';

type RichiestaProspetto = {
  mrn: string;
};

export default class RichiestaProspettoSintesi extends BaseRequest<RichiestaProspetto> {
  constructor() {
    //super('https://interop.adm.gov.it/ponimportsoap/services/ponimport');
    super('./assets/ponimport_reale.wsdl');
  }

  async processRequest(params: {
    data: {
      xmlParams: RichiestaProspetto;
      dichiarante: string;
    };
    security: {
      admCertificate: {
        path: string;
        passphrase: string;
      };
      signCertificate: {
        path: string;
        passphrase: string;
      };
    };
  }): Promise<{ type: string; message: ProcessResponse[] }> {
    try {
      const generatedXml = this.createXMLForRequest(params.data.xmlParams);

      return await this.asyncBaseProcessRequest({
        data: {
          xml: generatedXml,
          dichiarante: params.data.dichiarante,
        },
        security: params.security,
        serviceId: 'richiestaProspettoSintesi',
      });
    } catch (e) {
      return { type: 'error', message: [] };
    }
  }

  protected createXMLForRequest(params: RichiestaProspetto): string {
    return `
      <RichiestaProspetto 
        xmlns="http://documenti.tracciati.xsd.fascicoloele.domest.dogane.finanze.it" 
        xsi:schemaLocation="http://documenti.tracciati.xsd.fascicoloele.domest.dogane.finanze.it schema.xsd" 
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      >
        <input xmlns="">
          <richiesta>
            <mrn>${params.mrn}</mrn>
          </richiesta>
        </input>
      </RichiestaProspetto>
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
