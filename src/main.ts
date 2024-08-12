export { default as RichiestaListaDocumentiDichiarazioniRequest } from './requests/ponImport/richiestaListaDocumentiDichiarazioniRequest';
export { default as RichiestaProspettoSintesiRequest } from './requests/ponImport/richiestaProspettoSintesiRequest';
export { default as DownloadProspettoSintesiRequest } from './requests/ponImport/downloadProspettoSintesiRequest';

export { default as ListaDestautTIN } from './requests/destinatariAutorizzati/listaDestautTINRequest';

export type {
  ProcessResponseType,
  BaseProcessRequestType,
  ProcessRequestType,
  EsitoType,
} from './requests/baseRequest';

export type { RichiestaDocumentiDichiarazione } from './requests/ponImport/richiestaListaDocumentiDichiarazioniRequest';
export type { RichiestaProspetto } from './requests/ponImport/richiestaProspettoSintesiRequest';
export type { DownloadProspetto } from './requests/ponImport/downloadProspettoSintesiRequest';

export type { Enquiry } from './requests/destinatariAutorizzati/listaDestautTINRequest';

export type { AdmDeclarationMapped } from './utils/XMLConverter';
export { default as XMLConverter } from './utils/XMLConverter';
