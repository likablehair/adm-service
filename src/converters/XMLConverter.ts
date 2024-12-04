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
            RegimeDoganale: {
              RegimeRichiesto: string;
              RegimePrecedente: string;
            }[];
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
            IdentificativoImportatore: string;
            IdentificativoDichiarante: string;
            IdentificativoRappresentante: string;
            QualificaRappresentante: string;
            IdentificTitolAutorizzazione: {
              TipoAutorizzazione: string;
              Identificativo: string;
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
          InformazioniMessaggio: {
            NumeroArticolo: string;
            RegimeDoganale: {
              RegimeRichiesto: string;
              RegimePrecedente: string;
            };
          };
        }[];
      };
    };
  };
};

export type AdmDeclarationMapped = {
  mrn: string;
  date: string;
  supplier: {
    companyName: string;
    vatNumber: string;
    country: string;
    address: string;
    city: string;
    postalCode: string;
  };
  goods: {
    ncCode: string;
    taricCode: string;
    identificationCode: string;
    description: string;
    country: string;
    netWeight: string;
    customsRegime: string;
    requestedRegime: string;
    previousRegime: string;
  }[];
};

import { parseStringPromise } from 'xml2js';

export default class XMLConverter {
  constructor() {}

  async run(params: {
    xmlFilePath?: string;
    xmlData?: string;
  }): Promise<AdmDeclarationMapped> {
    try {
      let data: string;

      if (!params.xmlData) throw new Error('xmlData not loaded');
      else data = params.xmlData;

      const jsonData = await parseStringPromise(data, { explicitArray: false });
      const result = this.map(jsonData);

      return result;
    } catch (err) {
      console.error('Error reading or converting XML file:', err);
      throw err;
    }
  }

  async map(jsonData: Dichiarazione): Promise<AdmDeclarationMapped> {
    const esportatore =
      jsonData.Messaggio.DichiarazioneH1.DatiH1.IntestazioneH1.Parti
        .Esportatore;

    const data: AdmDeclarationMapped = {
      mrn: '',
      date: '',
      supplier: {
        companyName: esportatore.Nome,
        vatNumber: '',
        country: esportatore.Paese,
        address: esportatore.ViaNumero,
        city: esportatore.Citta,
        postalCode: esportatore.CodPostale,
      },
      goods: [],
    };

    const articoloH1 = jsonData.Messaggio.DichiarazioneH1.DatiH1.ArticoloH1;

    const goods: {
      ncCode: string;
      taricCode: string;
      identificationCode: string;
      description: string;
      country: string;
      netWeight: string;
      customsRegime: string | '';
      requestedRegime: string | '';
      previousRegime: string | '';
    }[] = [];

    const articoli = await this.ensureArray(articoloH1);

    for (let i = 0; i < articoli.length; i++) {
      goods.push({
        ncCode: articoli[i].IdentificazioneMerci.CodiceNC,
        taricCode: articoli[i].IdentificazioneMerci.CodiceTaric,
        identificationCode:
          articoli[i].IdentificazioneMerci.CodiceNC +
          articoli[i].IdentificazioneMerci.CodiceTaric,
        description: articoli[i].IdentificazioneMerci.DescrizioneMerci,
        country: esportatore.Paese,
        netWeight: articoli[i].IdentificazioneMerci.MassaNetta,
        customsRegime:
          articoli[i].InformazioniMessaggio.RegimeDoganale.RegimeRichiesto +
          articoli[i].InformazioniMessaggio.RegimeDoganale.RegimePrecedente,
        requestedRegime:
          articoli[i].InformazioniMessaggio.RegimeDoganale.RegimeRichiesto,
        previousRegime:
          articoli[i].InformazioniMessaggio.RegimeDoganale.RegimePrecedente,
      });
    }

    data.goods = goods;
    return data;
  }

  async ensureArray(
    input: Dichiarazione['Messaggio']['DichiarazioneH1']['DatiH1']['ArticoloH1'],
  ) {
    if (Array.isArray(input)) {
      return input;
    } else if (input !== undefined && input !== null) {
      return [input];
    } else {
      return [];
    }
  }
}
