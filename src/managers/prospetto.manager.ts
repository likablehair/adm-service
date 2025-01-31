import {
  AdmDeclarationMapped,
  DaeDatStatementMapped,
  ProcessRequest,
  ProspettoSintesiManager,
} from 'src/main';
import { RichiestaProspettoSintesi } from 'src/requests/ponImport/richiestaProspettoSintesiRequest';
import { RichiestaProspettoSvincolo } from 'src/requests/ponImport/richiestaProspettoSvincoloRequest';
import ProspettoContabileManager from './prospettoContabile.manager';
import ProspettoSvincoloManager, {
  GoodOutcome,
} from './prospettoSvincolo.manager';
import DaeDatManager, { DAE_DAT_PDF_TYPES } from './daeDat.manager';
import { AccountingStatementMapped } from 'src/converters/AccountingPDFConverter';
import { RichiestaDaeDat } from 'src/requests/ponImport/richiestaDaeDatRequest';

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

export type ImportDeclarationTypeImportResult = {
  files: AdmFile[];
  goodOutcomes?: GoodOutcome[];
  admDeclarationMapped: AdmDeclarationMapped;
  accountingStatementMapped?: AccountingStatementMapped;
};

export type ImportDeclarationTypeExportResult = {
  files: AdmFile[]
  daeDatStatementMapped: DaeDatStatementMapped
}

export default class ProspettoManager {
  async importDeclarationTypeImport(
    params: ProcessRequest<
      RichiestaProspettoSvincolo & RichiestaProspettoSintesi
    >,
  ): Promise<ImportDeclarationTypeImportResult> {
    const sintesiManager = new ProspettoSintesiManager();
    const { file: fileSintesi, admDeclarationMapped } =
      await sintesiManager.import({
        data: {
          dichiarante: params.data.dichiarante,
          xml: {
            mrn: params.data.xml.mrn,
          },
        },
        security: params.security,
      });

    let fileContabile: AdmFile | undefined = undefined,
      accountingStatementMapped: AccountingStatementMapped | undefined =
        undefined,
      fileSvincolo: AdmFile | undefined = undefined,
      goodOutcomes: GoodOutcome[] | undefined = undefined;
    try {
      const contabileManager = new ProspettoContabileManager();
      ({ file: fileContabile, accountingStatementMapped } =
        await contabileManager.import({
          data: {
            dichiarante: params.data.dichiarante,
            xml: {
              mrn: params.data.xml.mrn,
            },
          },
          security: params.security,
        }));
    } catch (error) {
      // console.error(error);
    }

    try {
      const svincoloManager = new ProspettoSvincoloManager();
      ({ file: fileSvincolo, goodOutcomes } = await svincoloManager.import({
        data: {
          dichiarante: params.data.dichiarante,
          xml: {
            mrn: params.data.xml.mrn,
          },
        },
        security: params.security,
      }));
    } catch (error) {
      // console.error(error);
    }

    const files = [fileContabile, fileSvincolo, fileSintesi].filter((f) => !!f);

    return {
      files,
      admDeclarationMapped,
      accountingStatementMapped,
      goodOutcomes,
    };
  }

  async importDeclarationTypeExport(params: ProcessRequest<RichiestaDaeDat>): Promise<ImportDeclarationTypeExportResult> {
    const daeDatManager = new DaeDatManager();
    const { file: fileDaeDat, daeDatStatementMapped } =
      await daeDatManager.import({
        data: {
          dichiarante: params.data.dichiarante,
          xml: {
            mrn: params.data.xml.mrn,
          },
        },
        security: params.security,
      });

    return {
      files: [fileDaeDat],
      daeDatStatementMapped
    }
  }
}
