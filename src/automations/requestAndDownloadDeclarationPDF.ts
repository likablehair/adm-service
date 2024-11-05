import { ProcessRequest } from 'src/requests/baseRequest';
import DownloadProspettoSintesi from 'src/requests/ponImport/downloadProspettoSintesiRequest';
import RichiestaProspettoSintesi, {
  RichiestaProspetto,
} from 'src/requests/ponImport/richiestaProspettoSintesiRequest';

export default class RequestAndDownloadDeclarationPDF {
  async process(params: ProcessRequest<RichiestaProspetto>): Promise<string> {
    try {
      const richiestaProspettoSintesiRequest = new RichiestaProspettoSintesi();
      const richiestaProspetto =
        await richiestaProspettoSintesiRequest.processRequest(params);

      if (richiestaProspetto.type !== 'success') {
        throw new Error('RichiestaProspettoSintesi failed');
      }

      if (!richiestaProspetto.message?.IUT) {
        throw new Error('IUT not found');
      }

      const IUT: string = richiestaProspetto.message.IUT;

      // Wait 10 seconds before downloading the PDF (constraint from the ADM WS)
      await new Promise((resolve) => setTimeout(resolve, 10000));

      const downloadProspettoSintesiRequest = new DownloadProspettoSintesi();
      const downloadProspetto =
        await downloadProspettoSintesiRequest.processRequest({
          data: {
            dichiarante: params.data.dichiarante,
            xml: {
              datiDichiarazione: {
                mrn: params.data.xml.mrn,
              },
              richiestaProspetto: {
                IUT,
              },
            },
          },
          security: params.security,
        });

      if (downloadProspetto.type !== 'success') {
        throw new Error('DownloadProspettoSintesi failed');
      }

      if (!downloadProspetto.message?.data) {
        throw new Error('PDF not found');
      }

      return downloadProspetto.message.data;
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw new Error(err.message);
      } else {
        throw new Error('Unknown error');
      }
    }
  }
}
