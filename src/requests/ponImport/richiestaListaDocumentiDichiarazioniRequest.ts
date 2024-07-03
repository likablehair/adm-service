import BaseRequest, { ProcessResponse } from "../baseRequest";

export default class RichiestaListaDocumentiDichiarazioniRequest extends BaseRequest {
  constructor() {
    //super('https://www.ponimpresa.gov.it/wsdl/ponimport.wsdl');
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
  }): Promise<{ type: string; message: ProcessResponse[]; }> {
      return await this.asyncBaseProcessRequest({
        data: params.data,
        security: params.security,
        serviceId: 'richiestaListaDocumentiDichiarazione',
      });
  }

}