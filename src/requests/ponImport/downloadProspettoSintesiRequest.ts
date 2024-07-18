import BaseRequest, {
  BaseProcessRequestType,
  ProcessResponseType,
  ProcessRequestType,
} from '../baseRequest';

export type DownloadProspetto = {
  datiDichiarazione: {
    mrn: string;
  };
  richiestaProspetto: {
    IUT: string;
  };
};

export default class DownloadProspettoSintesi extends BaseRequest<DownloadProspetto> {
  constructor() {
    const superArgs = {
      httpsUrl: 'https://interop.adm.gov.it/ponimportsoap/services/ponimport',
      soapUrl: 'ponimport_reale.wsdl',
      httpSoapAction: 'http://ponimport.ssi.sogei.it/wsdl/PONImport'
    };
    super(superArgs.httpsUrl, superArgs.soapUrl, superArgs.httpSoapAction);
  }

  async processRequest(params: ProcessRequestType<DownloadProspetto>): Promise<{
    type: string;
    message: ProcessResponseType | undefined;
  }> {
    try {
      const generatedXml = this.createXMLForRequest(params.data.xml);

      return await this.asyncBaseProcessRequest({
        data: {
          xml: generatedXml,
          dichiarante: params.data.dichiarante,
        },
        security: params.security,
        serviceId: 'downloadProspettoSintesi',
      });
    } catch (e) {
      return { type: 'error', message: undefined };
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

  protected createSoapEnvelope(
    params: Omit<BaseProcessRequestType<string>, 'security'>,
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
