import BaseRequest, {
  ProcessResponseType,
  BaseProcessRequestType,
  ProcessRequestType,
} from '../baseRequest';

export type RichiestaDocumentiDichiarazione = {
  mrn: string;
  utenteInvio: string;
};

export default class RichiestaListaDocumentiDichiarazioniRequest extends BaseRequest<RichiestaDocumentiDichiarazione> {
  constructor() {
    const superArgs = {
      axiosUrl: 'https://interop.adm.gov.it/ponimportsoap/services/ponimport',
      soapUrl: './assets/ponimport_reale.wsdl',
    };
    super(superArgs.axiosUrl, superArgs.soapUrl);
  }

  async processRequest(
    params: ProcessRequestType<RichiestaDocumentiDichiarazione>,
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
        serviceId: 'richiestaListaDocumentiDichiarazione',
      });
    } catch (e) {
      if (e instanceof Error) {
        console.log('STACK TRACE: ', e.stack);
      }
      return { type: 'error', message: undefined };
    }
  }

  protected createXMLForRequest(
    params: RichiestaDocumentiDichiarazione,
  ): string {
    return `
      <RichiestaDocumentiDichiarazione 
        xmlns="http://documenti.tracciati.xsd.fascicoloele.domest.dogane.finanze.it" 
        xsi:schemaLocation="http://documenti.tracciati.xsd.fascicoloele.domest.dogane.finanze.it schema.xsd" 
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      >
        <input xmlns="">
          <richiesta>
            <mrn>${params.mrn}</mrn>
            <utenteInvio>${params.utenteInvio}</utenteInvio>
          </richiesta>
        </input>
      </RichiestaDocumentiDichiarazione>
    `;
  }

  // This method is not used in the current implementation - Axios
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
