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
export type { RichiestaProspettoSintesi } from './requests/ponImport/richiestaProspettoSintesiRequest';
export type { RichiestaProspettoSvincolo } from './requests/ponImport/richiestaProspettoSvincoloRequest';
export type { DownloadProspetto } from './requests/ponImport/downloadProspettoSintesiRequest';

export type { Enquiry } from './requests/destinatariAutorizzati/listaDestautTINRequest';

export type { AdmDeclarationMapped } from './converters/XMLConverter';
export type { AccountingStatementMapped } from './converters/AccountingPDFConverter';
export type { DaeDatStatementMapped } from './converters/DaeDatPDFConverter';

export { default as XMLConverter } from './converters/XMLConverter';
export { default as PDFConverter } from './converters/PDFConverter';
export { default as AccountingPDFConverter } from './converters/AccountingPDFConverter';
export { default as DaeDatPDFConverter } from './converters/DaeDatPDFConverter';

export type {
  MRNProcessed,
  AggregatedSearchType,
  Declaration,
  DeclarationType,
  MrnExportStatusType,
} from './managers/admRobotProcessAutomation.manager';
export { default as AdmRPA } from './managers/admRobotProcessAutomation.manager';

export type {
  ProspettoSintesiResult,
  ImportProspettoSintesiResult,
  docType,
  AdmFile,
  DOC_TYPES,
} from './managers/prospettoSintesi.manager';
export {
  default as ProspettoSintesiManager,
  ProspettoSintesiMissingError,
} from './managers/prospettoSintesi.manager';

export type { ImportProspettoContabileResult } from './managers/prospettoContabile.manager';
export {
  default as ProspettoContabileManager,
  ProspettoContabileMissingError,
} from './managers/prospettoContabile.manager';

export type {
  ProspettoSvincoloResult,
  ImportProspettoSvincoloResult,
  GoodOutcome,
} from './managers/prospettoSvincolo.manager';
export {
  default as ProspettoSvincoloManager,
  ProspettoSvincoloMissingError,
} from './managers/prospettoSvincolo.manager';

export type {
  DaeDatResult,
  ImportDaeDatResult,
  DAE_DAT_PDF_TYPES,
} from './managers/daeDat.manager';
export {
  default as DaeDatManager,
  DaeDatMissingError,
} from './managers/daeDat.manager';

export type { RichiestaIvisto } from './requests/exportService/richiestaIvistoRequest';

export type { IvistoResult, IvistoMapped } from './managers/ivisto.manager';
export {
  default as IvistoManager,
  IvistoMissingError,
} from './managers/ivisto.manager';
