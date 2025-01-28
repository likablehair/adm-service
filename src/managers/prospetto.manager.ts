import {
  AdmDeclarationMapped,
  ProcessRequest,
  ProspettoSintesiManager,
} from 'src/main';
import { RichiestaProspettoSintesi } from 'src/requests/ponImport/richiestaProspettoSintesiRequest';
import { RichiestaProspettoSvincolo } from 'src/requests/ponImport/richiestaProspettoSvincoloRequest';
import ProspettoContabileManager from './prospettoContabile.manager';
import ProspettoSvincoloManager, {
  ImportProspettoSvincoloResult,
} from './prospettoSvincolo.manager';
import { DAE_DAT_PDF_TYPES } from './daeDat.manager';
import { AccountingStatementMapped } from 'src/converters/AccountingPDFConverter';

export const DOC_TYPES = [
  'declaration',
  'accounting',
  'release',
  ...DAE_DAT_PDF_TYPES,
] as const;

export type docType = (typeof DOC_TYPES)[number];

export type AdmFile = {
  buffer: Buffer;
  from: { path: string };
  extension: string;
  docType: docType;
};

export type ImportProspettoResult = {
  files?: AdmFile[];
  admDeclarationMapped: AdmDeclarationMapped;
  accountingStatementMapped: AccountingStatementMapped | undefined;
};

export default class ProspettoManager {
  async import(
    params: ProcessRequest<
      RichiestaProspettoSvincolo & RichiestaProspettoSintesi
    >,
  ): Promise<ImportProspettoResult> {
    const sintesiManager = new ProspettoSintesiManager();
    const { file: fileSintesi, admDeclarationMapped } =
      await sintesiManager.import(params);

    let fileContabile: AdmFile | undefined = undefined,
      accountingStatementMapped: AccountingStatementMapped | undefined =
        undefined,
      fileSvincolo: ImportProspettoSvincoloResult | undefined = undefined;
    try {
      const contabileManager = new ProspettoContabileManager();
      ({ file: fileContabile, accountingStatementMapped } =
        await contabileManager.import(params));
    } catch (error) {
      // console.error(error);
    }

    try {
      const svincoloManager = new ProspettoSvincoloManager();
      fileSvincolo = await svincoloManager.import(params);
    } catch (error) {
      // console.error(error);
    }

    const files = [fileContabile, fileSvincolo?.file, fileSintesi].filter(
      (f) => !!f,
    );

    return {
      files,
      admDeclarationMapped,
      accountingStatementMapped,
    };
  }
}
