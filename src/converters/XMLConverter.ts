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
  version: string;
  date: string;
  acceptanceDate: string;
  track: string;
  releaseDate: string;
  releaseCode: string;
  totalGrossWeight: string;
  invoiceValue: string;
  currency: string;
  exchangeRate: string;
  incoterm: string;
  originCountryAlpha2: string;
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
    releaseDate: string;
    releaseCode: string;
    description: string;
    country: string;
    netWeight: string;
    price: number;
    statisticValue: number;
    customsRegime: string;
    requestedRegime: string;
    previousRegime: string;
    page: number;
    documents: {
      code: string;
      identifier: string;
    }[];
  }[];
  documents: {
    code: string;
    identifier: string;
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
    } catch (error: unknown) {
      let localError: Error;

      if (error instanceof Error) {
        localError = error;
      } else if (typeof error === 'string') {
        localError = new Error(error);
      } else {
        localError = new Error('Unknown error');
      }

      localError.message = `Error in converting XML: ${localError.message}`;
      throw localError;
    }
  }

  async map(jsonData: Dichiarazione): Promise<AdmDeclarationMapped> {
    const esportatore =
      jsonData.Messaggio.DichiarazioneH1.DatiH1.IntestazioneH1.Parti
        .Esportatore;

    const data: AdmDeclarationMapped = {
      mrn: '',
      version: '',
      date: '',
      acceptanceDate: '',
      releaseCode: '',
      releaseDate: '',
      track: 'H1',
      totalGrossWeight: '',
      invoiceValue: '',
      currency: '',
      exchangeRate: '',
      incoterm: '',
      originCountryAlpha2: '',
      supplier: {
        companyName: esportatore.Nome,
        vatNumber: '',
        country: esportatore.Paese,
        address: esportatore.ViaNumero,
        city: esportatore.Citta,
        postalCode: esportatore.CodPostale,
      },
      goods: [],
      documents: [],
    };

    const articoloH1 = jsonData.Messaggio.DichiarazioneH1.DatiH1.ArticoloH1;

    const goods: {
      ncCode: string;
      taricCode: string;
      identificationCode: string;
      releaseDate: string;
      releaseCode: string;
      description: string;
      country: string;
      netWeight: string;
      price: number;
      statisticValue: number;
      customsRegime: string | '';
      requestedRegime: string | '';
      previousRegime: string | '';
      page: number;
      documents: {
        code: string;
        identifier: string;
      }[];
    }[] = [];

    const articoli = await this.ensureArray(articoloH1);

    for (let i = 0; i < articoli.length; i++) {
      const statisticValue = Number(
        articoli[i].AltriDati.ValoreStatistico?.trim().replace(',', '.'),
      );

      const price = Number(
        articoli[i].InformazioniValoreImposte.PrezzoArticolo?.trim().replace(
          ',',
          '.',
        ),
      );

      goods.push({
        ncCode: articoli[i].IdentificazioneMerci.CodiceNC,
        taricCode: articoli[i].IdentificazioneMerci.CodiceTaric,
        identificationCode:
          articoli[i].IdentificazioneMerci.CodiceNC +
          articoli[i].IdentificazioneMerci.CodiceTaric,
        releaseCode: '',
        releaseDate: '',
        description: articoli[i].IdentificazioneMerci.DescrizioneMerci,
        country: esportatore.Paese,
        netWeight: articoli[i].IdentificazioneMerci.MassaNetta,
        price,
        statisticValue,
        customsRegime:
          articoli[i].InformazioniMessaggio.RegimeDoganale.RegimeRichiesto +
          articoli[i].InformazioniMessaggio.RegimeDoganale.RegimePrecedente,
        requestedRegime:
          articoli[i].InformazioniMessaggio.RegimeDoganale.RegimeRichiesto,
        previousRegime:
          articoli[i].InformazioniMessaggio.RegimeDoganale.RegimePrecedente,
        page: i + 1,
        documents: [],
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
