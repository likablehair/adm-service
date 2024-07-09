import BaseRequest, {
  ProcessRequestType,
  ProcessResponseType,
} from '../baseRequest';

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
    const superArgs = {
      axiosUrl: 'https://interop.adm.gov.it/ponimportsoap/services/ponimport',
      soapUrl: './assets/ponimport_reale.wsdl',
    };
    super(superArgs.axiosUrl, superArgs.soapUrl);
  }

  async processRequest(
    params: Omit<ProcessRequestType<DownloadProspetto>, 'serviceId'>,
  ): Promise<{
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

  // This method is not used in the current implementation - Axios
  protected createSoapEnvelope(
    params: Omit<ProcessRequestType<string>, 'security'>,
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
