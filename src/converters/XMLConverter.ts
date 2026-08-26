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
  totalGrossWeight: number | undefined;
  invoiceValue: number | undefined;
  currency: string;
  exchangeRate: number | undefined;
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
    nr: string;
    ncCode: string;
    taricCode: string;
    identificationCode: string;
    releaseDate: string;
    releaseCode: string;
    description: string;
    country: string;
    netWeight: number | undefined;
    grossWeight: number | undefined;
    weight: number | undefined;
    price: number | undefined;
    statisticValue: number | undefined;
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
  validationIssues?: ValidationIssue[];
};

import { parseStringPromise } from 'xml2js';
import { parseDecimal } from 'src/utils/values';
import { resolveDeclaredWeight } from 'src/validation/rules';
import { validateImportDeclaration } from 'src/validation/documents';
import { ValidationOptions } from 'src/validation/validator';
import { ValidationIssue } from 'src/validation/errors';

export default class XMLConverter {
  constructor() {}

  async run(params: {
    xmlFilePath?: string;
    xmlData?: string;
    track?: string;
    validation?: ValidationOptions;
  }): Promise<AdmDeclarationMapped> {
    try {
      let data: string;

      if (!params.xmlData) throw new Error('xmlData not loaded');
      else data = params.xmlData;

      const jsonData = await parseStringPromise(data, { explicitArray: false });
      const result = this.map(jsonData, params.track, params.validation);

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

  async map(
    jsonData: Dichiarazione,
    track: string = 'H1',
    options?: ValidationOptions,
  ): Promise<AdmDeclarationMapped> {
    const intestazione =
      jsonData?.Messaggio?.DichiarazioneH1?.DatiH1?.IntestazioneH1;

    if (!intestazione?.Parti?.Esportatore) {
      throw new Error(
        'Unexpected declaration payload: IntestazioneH1.Parti.Esportatore not found',
      );
    }

    const esportatore = intestazione.Parti.Esportatore;

    const data: AdmDeclarationMapped = {
      mrn: '',
      version: '',
      date: '',
      acceptanceDate: '',
      releaseCode: '',
      releaseDate: '',
      track,
      totalGrossWeight: undefined,
      invoiceValue: undefined,
      currency: '',
      exchangeRate: undefined,
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
      nr: string;
      ncCode: string;
      taricCode: string;
      identificationCode: string;
      releaseDate: string;
      releaseCode: string;
      description: string;
      country: string;
      netWeight: number | undefined;
      grossWeight: number | undefined;
      weight: number | undefined;
      price: number | undefined;
      statisticValue: number | undefined;
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
      const articolo = articoli[i];
      const merci = articolo.IdentificazioneMerci;
      const regime = articolo.InformazioniMessaggio?.RegimeDoganale;

      const statisticValue = parseDecimal(articolo.AltriDati?.ValoreStatistico);
      const price = parseDecimal(
        articolo.InformazioniValoreImposte?.PrezzoArticolo,
      );
      const netWeight = parseDecimal(merci?.MassaNetta);
      const grossWeight = parseDecimal(merci?.MassaLorda);

      const requestedRegime = regime?.RegimeRichiesto || '';
      const previousRegime = regime?.RegimePrecedente || '';

      goods.push({
        nr: articolo.InformazioniMessaggio?.NumeroArticolo || '',
        ncCode: merci?.CodiceNC || '',
        taricCode: merci?.CodiceTaric || '',
        identificationCode: `${merci?.CodiceNC || ''}${merci?.CodiceTaric || ''}`,
        releaseCode: '',
        releaseDate: '',
        description: merci?.DescrizioneMerci || '',
        country: esportatore.Paese,
        netWeight,
        grossWeight,
        weight: resolveDeclaredWeight(track, netWeight, grossWeight),
        price,
        statisticValue,
        customsRegime: `${requestedRegime}${previousRegime}`,
        requestedRegime,
        previousRegime,
        page: i + 1,
        documents: [],
      });
    }

    if (goods.length === 0) {
      throw new Error('No article was extracted from the declaration');
    }

    data.validationIssues = validateImportDeclaration(
      { ...data, goods },
      { ...options, source: 'xml' },
    );

    data.goods = goods.map((good, index) => ({
      ...good,
      nr: good.nr?.trim() || String(index + 1),
    }));

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
