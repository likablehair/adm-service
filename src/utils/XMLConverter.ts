export type Dichiarazione = {
  Messaggio: {
    DichiarazioneH1: {
      DichCompl: string;
      UltimoInvio: string;
      CodUffDog: string;
      DatiH1: {
        IntestazioneH1: {
          InformazioniMessaggio: {
            TipoDichiarazione: string;
            TipoDichiarazioneSupplementare: string;
            FirmaAutenticazione: string;
          };
          RiferimentiMessaggiDocumentiCertificatiAutorizzazioni: {
            InformazioniSupplementari: {
              DescrizioneInfoSuppl: string;
            };
            CodiceTipDocIdentificativo: {
              Codice: string;
              IdentificativoDocumento: string;
            };
            NumRifUCR: string;
            LRN: string;
            DilazionePagamento: string;
          };
          Parti: {
            Esportatore: {
              Nome: string;
              ViaNumero: string;
              Paese: string;
              CodPostale: string;
              Citta: string;
            };
            IdentificativoEsportatore: string;
            Importatore: {
              Nome: string;
              ViaNumero: string;
              Paese: string;
              CodPostale: string;
              Citta: string;
            };
          };
        };
        ArticoloH1: {
          IdentificazioneMerci: {
            CodiceNC: string;
            CodiceTaric: string;
            DescrizioneMerci: string;
            CodiciAggiuntiviNazionali: string;
            MassaNetta: string;
            MassaLorda: string;
            Collo: {
              TipoImballaggio: string;
              NumeroImballaggi: string;
              MarchiSpedizione: string;
            };
          };
          InformazioniTrasporti: {
            IDContainer: string;
          };
          InformazioniValoreImposte: {
            PrezzoArticolo: string;
            MetodoValutazione: string;
            Preferenze: string;
            AggiunteDetrazioni: {
              CodiceDetrazione: string;
              Importo: string;
            };
            IndicatoriValutazione: string;
          };
          AltriDati: {
            NaturaTransazione: string;
            ValoreStatistico: string;
          };
          DateTempiPeriodiLuoghi: {
            CodicePaeseOrigine: string;
            CodicePaeseOriginePreferenziale: string;
            CodicePaeseSpedizioneEsportazione: string;
            CodicePaeseDestinazione: string;
            CodiceRegioneDestinazione: string;
          };
        }[];
      }[];
    }[];
  };
};

// import * as fs from 'fs';
import { parseStringPromise } from 'xml2js';

export default class XMLConverter {
  constructor() {}

  async run(params: {
    xmlFilePath?: string;
    xmlData?: string;
  }): Promise<Dichiarazione> {
    try {
      let data: string;
      // if(!!params.xmlFilePath)
      //   data = fs.readFileSync(params.xmlFilePath, 'utf-8');

      if (!params.xmlData) throw new Error('xmlData not loaded');
      else data = params.xmlData;

      const jsonData = await parseStringPromise(data);

      return jsonData;
    } catch (err) {
      console.error('Error reading or converting XML file:', err);
      throw err;
    }
  }
}
