import BaseRequest, {
  BaseProcessRequest,
  ProcessResponse,
  ProcessRequest,
} from '../baseRequest';
import ponImportCodiciEsito from '../ponImport/ponImportCodiciEsito.json';

export type RichiestaProspettoSintesi = {
  mrn: string;
};

export default class RichiestaProspettoSintesiRequest extends BaseRequest<RichiestaProspettoSintesi> {
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

  async processRequest(
    params: ProcessRequest<RichiestaProspettoSintesi>,
  ): Promise<{
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
    } catch (error: unknown) {
      let localError: Error;

      if (error instanceof Error) {
        localError = error;
      } else if (typeof error === 'string') {
        localError = new Error(error);
      } else {
        localError = new Error('Unknown error');
      }

      throw localError;
    }
  }

  protected createXMLForRequest(params: RichiestaProspettoSintesi): string {
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
}
