import { _cells } from './DeclarationCellsMapper';
import PDFParser from 'pdf2json';
import { AdmDeclarationMapped } from './XMLConverter';
import {
  columnsInReadingOrder,
  convertArrayToString,
  convertAsterisksToZero,
  parseDecimal,
} from 'src/utils/values';
import { resolveDeclaredWeight } from 'src/validation/rules';
import { validateImportDeclaration } from 'src/validation/documents';
import { ValidationOptions } from 'src/validation/validator';

export type DeclarationRawJson = {
  Transcoder: string;
  Meta: {
    PDFFormatVersion: string;
    IsAcroFormPresent: boolean;
    IsXFAPresent: false;
    Title: string;
    Author: string;
    Subject: string;
    Creator: string;
    Producer: string;
    CreationDate: string;
    ModDate: string;
    Metadata: {
      'xmp:creatortool': string;
      'xmp:metadatadate': string; //date
      'xmp:modifydate': string; //date
      'xmp:createdate': string; //date
      'pdf:producer': string;
      'xmpmm:documentid': string;
      'xmpmm:instanceid': string;
      'dc:format': string;
      'dc:description': string;
      'dc:creator': string;
      'dc:title': string;
      'desc:version': string;
      'desc:embeddedhref': string;
    };
  };
  Pages: [
    {
      Width: number;
      Height: number;
      HLines: [{ x: number; y: number; w: number; l: number; oc: string }[]];
      VLines: [{ x: number; y: number; w: number; l: number; oc: string }[]];
      Fills: [];
      Texts: [
        {
          x: number;
          y: number;
          w: number;
          clr: number;
          sw: number;
          A: string;
          R: [{ T: string; S: number; TS: number[] }];
        },
      ];
      Fields: [];
      Boxsets: [];
    },
  ];
};

export interface DeclarationJson {
  date: Date;
  declarationId: number;
  cbamRequestId: number;
  authorId: number;
  mrn: string;
  entity?: {
    column: string;
    value: string;
    x?: number;
    y?: number;
  };
  declaration?: {
    date1: string;
    date2: string;
    date3: string;
    date4: string;
    acceptanceDate1: string;
    acceptanceDate2: string;
    acceptanceDate3: string;
    acceptanceDate4: string;
    invoiceValueAndCurrency1: string;
    invoiceValueAndCurrency2: string;
    invoiceValueAndCurrency3: string;
    invoiceValueAndCurrency4: string;
    exchangeRate1: string;
    exchangeRate2: string;
    exchangeRate3: string;
    exchangeRate4: string;
    totalGrossWeight1: string;
    totalGrossWeight2: string;
    totalGrossWeight3: string;
    totalGrossWeight4: string;
    incoterm1: string;
    incoterm2: string;
    incoterm3: string;
    incoterm4: string;
    incoterm5: string;
    incoterm6: string;
    incoterm7: string;
    incoterm8: string;
    originCountry1: string;
    originCountry2: string;
    originCountry3: string;
    originCountry4: string;
    originCountry5: string;
    originCountry6: string;
    originCountry7: string;
    originCountry8: string;
    originCountry9: string;
    releaseDate1: string;
    releaseCode1: string;
    mrn: string;
    version: string;
    track: string;
  };
  supplier?: {
    companyName1: string;
    companyName2: string;
    companyName3: string;
    companyName4: string;
    companyName5: string;
    companyName6: string;
    companyName7: string;
    companyName8: string;
    vatNumber: string;
    country1: string;
    country2: string;
    country3: string;
    country4: string;
    country5: string;
    country6: string;
    country7: string;
    country8: string;
    address1: string;
    address2: string;
    address3: string;
    address4: string;
    address5: string;
    address6: string;
    address7: string;
    address8: string;
    address9: string;
    address10: string;
    city1: string;
    city2: string;
    city3: string;
    city4: string;
    city5: string;
    city6: string;
    city7: string;
    city8: string;
    city9: string;
    city10: string;
    postalCode1: string;
    postalCode2: string;
    postalCode3: string;
    postalCode4: string;
    postalCode5: string;
    postalCode6: string;
    postalCode7: string;
    postalCode8: string;
  };
  goods: {
    nr: string;
    goodCodeString: string;
    goodDetailString: string;
    ncCode: string;
    taricCode: string;
    identificationCode: string;
    releaseCode: string;
    releaseDate: string;
    description1: string;
    description2: string;
    description3: string;
    description4: string;
    description5: string;
    description6: string;
    description7: string;
    description8: string;
    description9: string;
    description10: string;
    description11: string;
    description12: string;
    description13: string;
    description14: string;
    description15: string;
    description16: string;
    description17: string;
    description18: string;
    description19: string;
    description20: string;
    description21: string;
    description22: string;
    description23: string;
    country1: string;
    country2: string;
    country3: string;
    country4: string;
    country5: string;
    country6: string;
    country7: string;
    country8: string;
    country9: string;
    country10: string;
    country11: string;
    country12: string;
    country13: string;
    country14: string;
    country15: string;
    prefixedCountry1: string;
    prefixedCountry2: string;
    prefixedCountry3: string;
    prefixedCountry4: string;
    prefixedCountry5: string;
    prefixedCountry6: string;
    prefixedCountry7: string;
    prefixedCountry8: string;
    prefixedCountry9: string;
    prefixedCountry10: string;
    prefixedCountry11: string;
    prefixedCountry12: string;
    prefixedCountry13: string;
    prefixedCountry14: string;
    prefixedCountry15: string;
    netWeight: string;
    grossWeight: string;
    customsRegime: string;
    requestedRegime: string;
    previousRegime: string;
    price1: string;
    price2: string;
    price3: string;
    price4: string;
    price5: string;
    price6: string;
    price7: string;
    price8: string;
    price9: string;
    price10: string;
    price11: string;
    price12: string;
    price13: string;
    price14: string;
    statisticValue1: string;
    statisticValue2: string;
    statisticValue3: string;
    statisticValue4: string;
    statisticValue5: string;
    statisticValue6: string;
    statisticValue7: string;
    statisticValue8: string;
    statisticValue9: string;
    statisticValue10: string;
    statisticValue11: string;
    statisticValue12: string;
    statisticValue13: string;
    statisticValue14: string;
    page: number;
    documents: {
      code: string;
      identifier: string;
    }[];
  }[];
  documents?: {
    code: string;
    identifier: string;
  }[];
}

const SUPPLIER_COMPANYNAME_COLUMNS = columnsInReadingOrder(
  _cells,
  'supplier',
  'companyName',
);
const SUPPLIER_ADDRESS_COLUMNS = columnsInReadingOrder(
  _cells,
  'supplier',
  'address',
);
const SUPPLIER_CITY_COLUMNS = columnsInReadingOrder(_cells, 'supplier', 'city');
const GOOD_DESCRIPTION_COLUMNS = columnsInReadingOrder(
  _cells,
  'goods',
  'description',
);

class PDFConverter {
  private getMappedPosition(
    x: number,
    y: number,
    isMappingDocuments: boolean,
  ): { entity?: string; column?: string } {
    const _x = x.toFixed(3);
    const _y = y.toFixed(3);
    const _xy: string = _x.toString() + '-' + _y.toString();

    _cells[Number(_xy)] = { xRange: [x, x], yRange: [y, y] };

    for (const cell in _cells) {
      if (isMappingDocuments || _cells[cell].entity != 'documents') {
        if (Object.prototype.hasOwnProperty.call(_cells, cell)) {
          const { xRange, yRange, entity, column } = _cells[cell];
          if (
            x >= xRange[0] &&
            x <= xRange[1] &&
            y >= yRange[0] &&
            y <= yRange[1]
          ) {
            return { entity, column };
          }
        }
      }
    }
    return {};
  }
  private map(
    input: DeclarationJson,
    documentsNumber: number,
    options?: ValidationOptions,
  ): AdmDeclarationMapped {
    const companyNameArray = SUPPLIER_COMPANYNAME_COLUMNS.map(
      (column) =>
        (input.supplier as Record<string, string> | undefined)?.[column],
    );

    const address = SUPPLIER_ADDRESS_COLUMNS.map(
      (column) =>
        (input.supplier as Record<string, string> | undefined)?.[column],
    );

    const city = SUPPLIER_CITY_COLUMNS.map(
      (column) =>
        (input.supplier as Record<string, string> | undefined)?.[column],
    );

    let country: string =
      input.supplier?.country1?.trim() ||
      input.supplier?.country2?.trim() ||
      input.supplier?.country3?.trim() ||
      input.supplier?.country4?.trim() ||
      input.supplier?.country5?.trim() ||
      input.supplier?.country6?.trim() ||
      input.supplier?.country7?.trim() ||
      input.supplier?.country8?.trim() ||
      '';

    const postalCode: string =
      input.supplier?.postalCode1?.trim() ||
      input.supplier?.postalCode2?.trim() ||
      input.supplier?.postalCode3?.trim() ||
      input.supplier?.postalCode4?.trim() ||
      input.supplier?.postalCode5?.trim() ||
      input.supplier?.postalCode6?.trim() ||
      input.supplier?.postalCode7?.trim() ||
      input.supplier?.postalCode8?.trim() ||
      '';

    const eoriCode = input.supplier?.vatNumber?.trim() || '';

    let companyName: string = '',
      vatNumber: string = '';

    if (
      convertArrayToString(companyNameArray) == '' &&
      country == '' &&
      convertArrayToString(address) == '' &&
      convertArrayToString(city) == '' &&
      postalCode == '' &&
      eoriCode != ''
    ) {
      companyName = eoriCode;
      vatNumber = /^[A-Za-z]{2}/.test(eoriCode) ? eoriCode.slice(2) : eoriCode;
      country = /^[A-Za-z]{2}/.test(eoriCode) ? eoriCode.slice(0, 2) : 'IT';
    } else {
      companyName = convertArrayToString(companyNameArray);
      if (eoriCode != '') {
        vatNumber = eoriCode.replace(/[a-zA-Z]/g, '');
      }
    }

    const supplierRaw = {
      companyName,
      vatNumber,
      country,
      address: convertArrayToString(address),
      city: convertArrayToString(city),
      postalCode,
    };

    const supplier = convertAsterisksToZero(
      { ...supplierRaw },
      'city',
      'postalCode',
      'address',
    );

    const date: string =
      input.declaration?.date1 ||
      input.declaration?.date2 ||
      input.declaration?.date3 ||
      input.declaration?.date4 ||
      '';

    const acceptanceDate: string =
      input.declaration?.acceptanceDate1 ||
      input.declaration?.acceptanceDate2 ||
      input.declaration?.acceptanceDate3 ||
      input.declaration?.acceptanceDate4 ||
      '';

    const releaseDate: string = input.declaration?.releaseDate1 || '';

    const releaseCode: string = input.declaration?.releaseCode1 || '';

    const totalGrossWeightString: string =
      input.declaration?.totalGrossWeight1 ||
      input.declaration?.totalGrossWeight2 ||
      input.declaration?.totalGrossWeight3 ||
      input.declaration?.totalGrossWeight4 ||
      '';

    const invoiceValueString: string =
      input.declaration?.invoiceValueAndCurrency1?.split(' ')[0] ||
      input.declaration?.invoiceValueAndCurrency2?.split(' ')[0] ||
      input.declaration?.invoiceValueAndCurrency3?.split(' ')[0] ||
      input.declaration?.invoiceValueAndCurrency4?.split(' ')[0] ||
      '';

    const currency: string =
      input.declaration?.invoiceValueAndCurrency1?.split(' ')[1] ||
      input.declaration?.invoiceValueAndCurrency2?.split(' ')[1] ||
      input.declaration?.invoiceValueAndCurrency3?.split(' ')[1] ||
      input.declaration?.invoiceValueAndCurrency4?.split(' ')[1] ||
      '';

    const exchangeRateString: string =
      input.declaration?.exchangeRate1 ||
      input.declaration?.exchangeRate2 ||
      input.declaration?.exchangeRate3 ||
      input.declaration?.exchangeRate4 ||
      '';

    const totalGrossWeight = parseDecimal(totalGrossWeightString);
    const invoiceValue = parseDecimal(invoiceValueString);
    const exchangeRate = parseDecimal(exchangeRateString);

    const incoterm: string =
      input.declaration?.incoterm1 ||
      input.declaration?.incoterm2 ||
      input.declaration?.incoterm3 ||
      input.declaration?.incoterm4 ||
      input.declaration?.incoterm5 ||
      input.declaration?.incoterm6 ||
      input.declaration?.incoterm7 ||
      input.declaration?.incoterm8 ||
      '';

    const originCountryAlpha2: string =
      input.declaration?.originCountry1 ||
      input.declaration?.originCountry2 ||
      input.declaration?.originCountry3 ||
      input.declaration?.originCountry4 ||
      input.declaration?.originCountry5 ||
      input.declaration?.originCountry6 ||
      input.declaration?.originCountry7 ||
      input.declaration?.originCountry8 ||
      input.declaration?.originCountry9 ||
      '';

    const track = input.declaration?.track || '';
    const mrn = input.declaration?.mrn || '';
    const version = input.declaration?.version || '';

    const goods = input.goods
      ?.map((good) => {
        if (
          good.goodDetailString == 'Dettaglio Articolo n°' &&
          good.goodCodeString == 'Codice merce'
        ) {
          const nr = good.nr;

          const ncCode = track == 'H7' ? good.ncCode : good.ncCode.slice(0, -2);

          const taricCode = track == 'H7' ? '' : good.ncCode.slice(-2);

          const requestedRegime =
            track == 'H7' ? '' : good.customsRegime.slice(0, 2).trim();

          const previousRegime =
            track == 'H7' ? '' : good.customsRegime.slice(-2).trim();

          const customsRegime = `${requestedRegime}${previousRegime}`;

          const description = GOOD_DESCRIPTION_COLUMNS.map(
            (column) => (good as unknown as Record<string, string>)[column],
          );

          const country: string =
            good.country1?.trim() ||
            good.country2?.trim() ||
            good.country3?.trim() ||
            good.country4?.trim() ||
            good.country5?.trim() ||
            good.country6?.trim() ||
            good.country7?.trim() ||
            good.country8?.trim() ||
            good.country9?.trim() ||
            good.country10?.trim() ||
            good.country11?.trim() ||
            good.country12?.trim() ||
            good.country13?.trim() ||
            good.country14?.trim() ||
            good.country15?.trim() ||
            good.prefixedCountry1?.trim() ||
            good.prefixedCountry2?.trim() ||
            good.prefixedCountry3?.trim() ||
            good.prefixedCountry4?.trim() ||
            good.prefixedCountry5?.trim() ||
            good.prefixedCountry6?.trim() ||
            good.prefixedCountry7?.trim() ||
            good.prefixedCountry8?.trim() ||
            good.prefixedCountry9?.trim() ||
            good.prefixedCountry10?.trim() ||
            good.prefixedCountry11?.trim() ||
            good.prefixedCountry12?.trim() ||
            good.prefixedCountry13?.trim() ||
            good.prefixedCountry14?.trim() ||
            good.prefixedCountry15?.trim() ||
            '';

          const priceString: string =
            good.price1?.trim() ||
            good.price2?.trim() ||
            good.price3?.trim() ||
            good.price4?.trim() ||
            good.price5?.trim() ||
            good.price6?.trim() ||
            good.price7?.trim() ||
            good.price8?.trim() ||
            good.price9?.trim() ||
            good.price10?.trim() ||
            good.price11?.trim() ||
            good.price12?.trim() ||
            good.price13?.trim() ||
            good.price14?.trim() ||
            '';

          const statisticValueString: string =
            good.statisticValue1?.trim() ||
            good.statisticValue2?.trim() ||
            good.statisticValue3?.trim() ||
            good.statisticValue4?.trim() ||
            good.statisticValue5?.trim() ||
            good.statisticValue6?.trim() ||
            good.statisticValue7?.trim() ||
            good.statisticValue8?.trim() ||
            good.statisticValue9?.trim() ||
            good.statisticValue10?.trim() ||
            good.statisticValue11?.trim() ||
            good.statisticValue12?.trim() ||
            good.statisticValue13?.trim() ||
            good.statisticValue14?.trim() ||
            '';

          const price = parseDecimal(priceString);
          const statisticValue = parseDecimal(statisticValueString);

          const documents = good.documents;

          const normalised = convertAsterisksToZero({
            netWeight: good.netWeight,
            grossWeight: good.grossWeight,
          });

          const netWeight = parseDecimal(normalised.netWeight);
          const grossWeight = parseDecimal(normalised.grossWeight);

          return {
            nr,
            ncCode,
            taricCode,
            identificationCode: good.ncCode,
            releaseCode: good.releaseCode,
            releaseDate: good.releaseDate,
            description: convertArrayToString(description),
            country,
            netWeight,
            grossWeight,
            weight: resolveDeclaredWeight(track, netWeight, grossWeight),
            price,
            statisticValue,
            customsRegime,
            requestedRegime,
            previousRegime,
            documents,
            page: good.page,
          };
        }
        return undefined;
      })
      .filter((g) => !!g);

    const documents = input.documents;

    const localDocumentsNumber =
      (documents?.length || 0) +
      goods.reduce((acc, good) => acc + good.documents.length, 0);

    if (localDocumentsNumber != documentsNumber || !documents) {
      throw new Error('Missing mapping for documents');
    }

    if (originCountryAlpha2 == '' && track != 'H7') {
      throw new Error('Missing mapping for origin country');
    }

    if (goods.length === 0) {
      throw new Error('No article was extracted from the declaration');
    }

    const validationIssues = validateImportDeclaration(
      {
        mrn,
        version,
        track,
        date,
        acceptanceDate,
        releaseDate,
        releaseCode,
        totalGrossWeight,
        invoiceValue,
        currency,
        exchangeRate,
        incoterm,
        originCountryAlpha2,
        supplier: supplierRaw,
        goods,
      },
      { ...options, source: 'pdf' },
    );

    const numberedGoods = goods.map((good, index) => ({
      ...good,
      nr: good.nr?.trim() || String(index + 1),
    }));

    return convertAsterisksToZero({
      mrn,
      version,
      date,
      acceptanceDate,
      releaseCode,
      releaseDate,
      totalGrossWeight,
      invoiceValue,
      currency,
      exchangeRate,
      incoterm,
      originCountryAlpha2,
      track,
      supplier,
      goods: numberedGoods,
      documents,
      validationIssues,
    });
  }
  public async run(params: {
    data: { path: string } | { buffer: Buffer };
    validation?: ValidationOptions;
  }): Promise<AdmDeclarationMapped> {
    const pdfParser = new PDFParser();

    const cleanUp = async () => {
      pdfParser.destroy();
    };

    const loadDeclarationFromPDF = new Promise<DeclarationRawJson>(
      (resolve, reject) => {
        /* eslint-disable @typescript-eslint/no-explicit-any */
        pdfParser.on('pdfParser_dataError', (errData: any) => {
          reject(errData.parserError);
        });
        /* eslint-disable @typescript-eslint/no-explicit-any */
        pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
          resolve(pdfData);
        });

        if ('buffer' in params.data) {
          pdfParser.parseBuffer(params.data.buffer);
        } else {
          pdfParser.loadPDF(params.data.path);
        }
      },
    );

    try {
      const declarationRawJson: DeclarationRawJson =
        await loadDeclarationFromPDF;
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const declarationEntity: { [key: string]: any } = {
        date: new Date(),
        declarationId: 0,
        cbamRequestId: 0,
        authorId: 0,
        mrn: '',
        documents: [],
        goods: [],
      };

      const documentsWithPage: {
        page: number;
        documents: { code: string; identifier: string }[];
      }[] = [];

      let countNumber = 0;
      let isMappingDocuments: boolean = false;
      let isFirstDocument = true;
      let isNewDocument = false;

      if (!!declarationRawJson && declarationRawJson.Pages) {
        const pages = declarationRawJson.Pages;

        for (let i = 0; i < pages.length; i++) {
          const page = pages[i];
          const documentsPerPage: { code: string; identifier: string }[] = [];

          if (page.Texts) {
            /* eslint-disable @typescript-eslint/no-explicit-any */
            const goodObject: any = {};
            let documentObject: any = {
              code: '',
              identifier: '',
            };
            for (let j = 0; j < page.Texts.length; j++) {
              const textElement = page.Texts[j];
              const text = decodeURIComponent(textElement.R[0].T);

              // if(i == 0 || i == 1){
              //   console.log({ "page": i + 1, "x": textElement.x, "y": textElement.y, "text": text })
              // }

              if (
                (text == 'Scarichi' || text == 'Liquidazione') &&
                textElement.x == 2.159
              ) {
                isMappingDocuments = false;
              }

              if (
                text != 'Codice' &&
                textElement.x == 2.159 &&
                isMappingDocuments
              ) {
                countNumber++;
              }

              if (text == 'Documenti' && textElement.x == 2.159) {
                isMappingDocuments = true;
              }

              const mappedPosition: { entity?: string; column?: string } =
                this.getMappedPosition(
                  textElement.x,
                  textElement.y,
                  isMappingDocuments,
                );

              if (!mappedPosition.column || !text.trim()) {
                continue;
              } else if (!!mappedPosition.entity && !!mappedPosition.column) {
                if (mappedPosition.entity == 'documents') {
                  if (isMappingDocuments) {
                    if (mappedPosition.column == 'code') {
                      if (isFirstDocument) {
                        isFirstDocument = false;
                      } else {
                        isNewDocument = true;
                      }
                    }

                    if (isNewDocument) {
                      if (
                        documentObject.code != '' &&
                        documentObject.code != 'Tipo' &&
                        documentObject.code != 'Scarichi' &&
                        documentObject.code != 'Documenti' &&
                        documentObject.code != 'Codice'
                      ) {
                        documentsPerPage.push(documentObject);
                      }

                      documentObject = {
                        code: '',
                        identifier: '',
                      };

                      isNewDocument = false;
                    }

                    if (mappedPosition.column == 'identifier') {
                      documentObject['identifier'] =
                        documentObject['identifier'] + text.trim();
                    } else {
                      documentObject['code'] = text.trim();
                    }
                  }
                } else {
                  if (i > 0) {
                    if (!declarationEntity[mappedPosition.entity]) {
                      declarationEntity[mappedPosition.entity] = [];
                    }

                    if (
                      Array.isArray(declarationEntity[mappedPosition.entity])
                    ) {
                      goodObject[mappedPosition.column] = text.trim();
                      goodObject['page'] = i + 1;

                      const lastItem =
                        declarationEntity[mappedPosition.entity].slice(-1)[0];

                      const isNewItem =
                        !lastItem ||
                        (lastItem.nr !== goodObject.nr &&
                          !!goodObject.ncCode &&
                          goodObject.ncCode.length > 0 &&
                          goodObject.ncCode.length <= 10);

                      if (isNewItem)
                        declarationEntity[mappedPosition.entity].push(
                          goodObject,
                        );
                    }
                  } else if (mappedPosition.entity != 'goods') {
                    if (!declarationEntity[mappedPosition.entity])
                      declarationEntity[mappedPosition.entity] = {};

                    declarationEntity[mappedPosition.entity][
                      mappedPosition.column
                    ] = text.trim();
                  }
                }
              }
            }

            if (
              documentObject.code != '' &&
              documentObject.code != 'Tipo' &&
              documentObject.code != 'Scarichi' &&
              documentObject.code != 'Documenti' &&
              documentObject.code != 'Codice'
            ) {
              documentsPerPage.push(documentObject);
            }

            if (documentsPerPage.length > 0) {
              documentsWithPage.push({
                page: i + 1,
                documents: documentsPerPage,
              });
            }
          }
        }
      } else {
        throw new Error('No Pages found in the PDF.');
      }

      const parsedDeclarationEntity = declarationEntity as DeclarationJson;

      const documentsForGoods: {
        page: number;
        documents: {
          code: string;
          identifier: string;
        }[];
      }[] = [];

      parsedDeclarationEntity['goods'].forEach((good) => {
        const documentsForGood = documentsWithPage.find(
          (d) =>
            d.page == good.page &&
            good.goodDetailString == 'Dettaglio Articolo n°' &&
            good.goodCodeString == 'Codice merce',
        );

        if (documentsForGood) {
          documentsForGoods.push(documentsForGood);
        }

        good.documents = documentsForGood?.documents || [];
      });

      const declarationGeneralDocuments = documentsWithPage.filter(
        (d) => !documentsForGoods.includes(d),
      );

      declarationEntity['documents'] = declarationGeneralDocuments.flatMap(
        (d) => d.documents,
      );

      const admDeclarationMapped = this.map(
        parsedDeclarationEntity,
        countNumber,
        params.validation,
      );
      await cleanUp();
      return admDeclarationMapped;
    } catch (error) {
      await cleanUp();
      throw new Error('parsing PDF declarations:' + error); // Returning an empty object
    }
  }
}
export default PDFConverter;
