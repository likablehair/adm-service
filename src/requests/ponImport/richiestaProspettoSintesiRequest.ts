import BaseRequest, {
  BaseProcessRequest,
  ProcessResponse,
  ProcessRequest,
} from '../baseRequest';
import ponImportCodiciEsito from '../ponImport/ponImportCodiciEsito.json';

export type RichiestaProspetto = {
  mrn: string;
};

export default class RichiestaProspettoSintesi extends BaseRequest<RichiestaProspetto> {
  constructor() {
    const superArgs = {
      httpsUrl: 'https://interop.adm.gov.it/ponimportsoap/services/ponimport',
      soapUrl: 'ponimport_reale.wsdl',
      httpSoapAction: 'http://ponimport.ssi.sogei.it/wsdl/PONImport',
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

  async processRequest(params: ProcessRequest<RichiestaProspetto>): Promise<{
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
        serviceId: 'richiestaProspettoSintesi',
      });
    } catch (e) {
      return { type: 'error', message: undefined };
    }
  }

  protected createXMLForRequest(params: RichiestaProspetto): string {
    return `
      <RichiestaProspetto
        xmlns="http://documenti.tracciati.xsd.fascicoloele.domest.dogane.finanze.it" 
        xsi:schemaLocation="http://documenti.tracciati.xsd.fascicoloele.domest.dogane.finanze.it richiestaProspettoContabileSintesi.xsd" 
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      >
        <input xmlns="">
          <datiDichiarazione>
            <mrn>${params.mrn}</mrn>
          </datiDichiarazione>
        </input>
      </RichiestaProspetto>
    `;
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

  protected convertXMLResponse(): string {
    return '';
  }
}
