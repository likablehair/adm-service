import BaseRequest, { ProcessResponse } from '../baseRequest';

type DownloadProspetto = {
  datiDichiarazione: {
    mrn: string;
  };
  richiestaProspetto: {
    IUT: string;
  };
};

export default class DownloadProspettoSintesi extends BaseRequest<DownloadProspetto> {
  constructor() {
    //super('https://interop.adm.gov.it/ponimportsoap/services/ponimport');
    super('./assets/ponimport_reale.wsdl');
  }

  async processRequest(params: {
    data: {
      xmlParams: DownloadProspetto;
      dichiarante: string;
    };
    security: {
      admCertificate: {
        path: string;
        passphrase: string;
      },
      signCertificate: {
        path: string;
        passphrase: string;
      }
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
        serviceId: 'downloadProspettoSintesi',
      });
    } catch (e) {
      return { type: 'error', message: [] };
    }
  }

  protected createXMLForRequest(params: DownloadProspetto): string {
    return `
      <DownloadProspetto  
        xmlns="http://documenti.tracciati.xsd.fascicoloele.domest.dogane.finanze.it" 
        xsi:schemaLocation="http://documenti.tracciati.xsd.fascicoloele.domest.dogane.finanze.it schema.xsd" 
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      >
        <input xmlns="">
          <datiDichiarazione>
            <mrn>${params.datiDichiarazione.mrn}</mrn>
          </datiDichiarazione>
          <richiestaProspetto>
            <IUT>${params.richiestaProspetto.IUT}</IUT>
          </richiestaProspetto>
        </input>
      </DownloadProspetto>
    `;
  }

  protected createSoapEnvelope(params: {
    data: { xml: string; dichiarante: string };
    serviceId: string;
  }): string {
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
