import {
  AdmDeclarationMapped,
  ProcessRequest,
  ProspettoSintesiManager,
} from 'src/main';
import { RichiestaProspettoSintesi } from 'src/requests/ponImport/richiestaProspettoSintesiRequest';
import { RichiestaProspettoSvincolo } from 'src/requests/ponImport/richiestaProspettoSvincoloRequest';
import ProspettoContabileManager, { ImportProspettoContabileResult } from './prospettoContabile.manager';
import ProspettoSvincoloManager, {
  ImportProspettoSvincoloResult,
} from './prospettoSvincolo.manager';

export type ImportProspettoResult = {
  fileSvincolo?: {
    buffer: Buffer;
    from: { path: string };
    extension: string;
  };
  fileContabile?: {
    buffer: Buffer;
    from: { path: string };
    extension: string;
  };
  fileSintesi: {
    buffer: Buffer;
    from: { path: string };
    extension: string;
  };
  admDeclarationMapped: AdmDeclarationMapped;
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

    let fileContabile: ImportProspettoContabileResult | undefined = undefined,
      fileSvincolo: ImportProspettoSvincoloResult | undefined = undefined;
    try {
      const contabileManager = new ProspettoContabileManager();
      fileContabile = await contabileManager.import(params);
    } catch (error) {
      console.error(error);
    }

    try {
      const svincoloManager = new ProspettoSvincoloManager();
      fileSvincolo = await svincoloManager.import(params);
    } catch (error) {
      console.error(error);
    }

    return {
      fileContabile: fileContabile?.file,
      fileSintesi,
      fileSvincolo: fileSvincolo?.file,
      admDeclarationMapped,
    };
  }
}
