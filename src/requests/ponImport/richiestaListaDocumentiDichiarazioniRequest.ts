import BaseRequest, {
  ProcessResponse,
  BaseProcessRequest,
  ProcessRequest,
} from '../baseRequest';

export type RichiestaDocumentiDichiarazioneMRN = {
  mrn: string;
  lrn?: never;
  utenteInvio?: never;
};

export type RichiestaDocumentiDichiarazioneLRN = {
  mrn?: never;
  lrn: string;
  utenteInvio: string;
}

export type RichiestaDocumentiDichiarazione = 
  | RichiestaDocumentiDichiarazioneMRN
  | RichiestaDocumentiDichiarazioneLRN;

export default class RichiestaListaDocumentiDichiarazioniRequest extends BaseRequest<RichiestaDocumentiDichiarazione> {
  constructor() {
    const superArgs = {
      httpsUrl: 'https://interop.adm.gov.it/ponimportsoap/services/ponimport',
      soapUrl: 'ponimport_reale.wsdl',
      httpSoapAction: 'http://ponimport.ssi.sogei.it/wsdl/PONImport',
    };
    super(superArgs.httpsUrl, superArgs.soapUrl, superArgs.httpSoapAction);
  }

  async processRequest(
    params: ProcessRequest<RichiestaDocumentiDichiarazione>,
  ): Promise<{
    type: string;
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
        xsi:schemaLocation="http://documenti.tracciati.xsd.fascicoloele.domest.dogane.finanze.it richiesta-lista-documenti-dichiarazione.xsd" 
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      >
        <input xmlns="">
          <richiesta>
            ${
              params.mrn ? 
                `<mrn>${params.mrn}</mrn>` : 
                `
                  <lrn>${params.lrn}</lrn>
                  <utenteInvio>${params.utenteInvio}</utenteInvio>
                `
              }
          </richiesta>
        </input>
      </RichiestaDocumentiDichiarazione>
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
