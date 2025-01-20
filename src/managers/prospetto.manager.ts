import { AdmDeclarationMapped, ProcessRequest, ProspettoSintesiManager } from "src/main";
import { RichiestaProspettoSintesi } from "src/requests/ponImport/richiestaProspettoSintesiRequest";
import { RichiestaProspettoSvincolo } from "src/requests/ponImport/richiestaProspettoSvincoloRequest";
import ProspettoContabileManager from "./prospettoContabile.manager";
import ProspettoSvincoloManager from "./prospettoSvincolo.manager";

export type ImportProspettoResult = {
  fileSvincolo: {
    buffer: Buffer;
    from: { path: string };
    extension: string;
  };
  fileContabile: {
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
}

export default class ProspettoManager {
  async import(
    params: ProcessRequest<RichiestaProspettoSvincolo & RichiestaProspettoSintesi>,
  ): Promise<ImportProspettoResult> {
    const sintesiManager = new ProspettoSintesiManager();
    const { file: fileSintesi, admDeclarationMapped} = await sintesiManager.import(params)

    const contabileManager = new ProspettoContabileManager();
    const { file: fileContabile } = await contabileManager.import(params)

    const svincoloManager = new ProspettoSvincoloManager();
    const { file: fileSvincolo } = await svincoloManager.import(params)

    return {
      fileContabile,
      fileSintesi,
      fileSvincolo,
      admDeclarationMapped
    }
  }
}