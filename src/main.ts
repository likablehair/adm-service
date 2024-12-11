export { default as RichiestaListaDocumentiDichiarazioniRequest } from './requests/ponImport/richiestaListaDocumentiDichiarazioniRequest';
export { default as RichiestaProspettoSintesiRequest } from './requests/ponImport/richiestaProspettoSintesiRequest';
export { default as DownloadProspettoSintesiRequest } from './requests/ponImport/downloadProspettoSintesiRequest';
export { default as ListaDestautTIN } from './requests/destinatariAutorizzati/listaDestautTINRequest';

export type {
  ProcessResponse,
  ProcessResponseFromXML,
  BaseProcessRequest,
  ProcessRequest,
  Esito,
} from './requests/baseRequest';

export type { RichiestaDocumentiDichiarazione } from './requests/ponImport/richiestaListaDocumentiDichiarazioniRequest';
export type { RichiestaProspettoSintesi as RichiestaProspetto } from './requests/ponImport/richiestaProspettoSintesiRequest';
export type { DownloadProspetto } from './requests/ponImport/downloadProspettoSintesiRequest';

export type { Enquiry } from './requests/destinatariAutorizzati/listaDestautTINRequest';

export type { AdmDeclarationMapped } from './converters/XMLConverter';

export { default as XMLConverter } from './converters/XMLConverter';
export { default as PDFConverter } from './converters/PDFConverter';

export type {
  MRNProcessed,
  AggregatedSearchType,
  Declaration
} from './managers/admRobotProcessAutomation.manager';
export { default as AdmRPA } from './managers/admRobotProcessAutomation.manager';

export type {
  ProspettoSintesiResult,
  ImportDeclarationResult,
} from './managers/prospettoSintesi.manager';
export { default as ProspettoSintesiManager } from './managers/prospettoSintesi.manager';
