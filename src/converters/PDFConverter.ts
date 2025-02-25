import { _cells } from './DeclarationCellsMapper';
import PDFParser from 'pdf2json';
import { AdmDeclarationMapped } from './XMLConverter';

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
  declaration: {
    date1: string;
    date2: string;
    date3: string;
    acceptanceDate1: string;
    acceptanceDate2: string;
    acceptanceDate3: string;
    invoiceValueAndCurrency1: string;
    invoiceValueAndCurrency2: string;
    invoiceValueAndCurrency3: string;
    exchangeRate1: string;
    exchangeRate2: string;
    exchangeRate3: string;
    totalGrossWeight1: string;
    totalGrossWeight2: string;
    totalGrossWeight3: string;
    incoterm1: string;
    incoterm2: string;
    incoterm3: string;
    incoterm4: string;
    incoterm5: string;
    incoterm6: string;
    incoterm7: string;
    releaseDate1: string;
    releaseCode1: string;
    mrn: string;
    version: string;
    track: string;
  };
  supplier: {
    companyName1: string;
    companyName2: string;
    companyName3: string;
    companyName4: string;
    companyName5: string;
    companyName6: string;
    vatNumber: string;
    country1: string;
    country2: string;
    country3: string;
    country4: string;
    country5: string;
    country6: string;
    country7: string;
    address1: string;
    address2: string;
    address3: string;
    address4: string;
    address5: string;
    address6: string;
    address7: string;
    address8: string;
    city1: string;
    city2: string;
    city3: string;
    city4: string;
    city5: string;
    city6: string;
    city7: string;
    city8: string;
    city9: string;
    postalCode1: string;
    postalCode2: string;
    postalCode3: string;
    postalCode4: string;
    postalCode5: string;
    postalCode6: string;
    postalCode7: string;
  };
  goods: {
    goodCodeString: string;
    goodDetailString: string;
    ncCode: string;
    taricCode: string;
    identificationCode: string;
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
    netWeight: string;
    customsRegime: string;
    requestedRegime: string;
    previousRegime: string;
  }[];
  documents: {
    code: string;
    identifier: string;
  }[];
}

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
      if(isMappingDocuments || _cells[cell].entity != 'documents'){
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
  ): AdmDeclarationMapped {
    const companyNameArray: string[] = [
      input.supplier?.companyName1,
      input.supplier?.companyName2,
      input.supplier?.companyName3,
      input.supplier?.companyName4,
      input.supplier?.companyName5,
      input.supplier?.companyName6,
    ];

    const address: string[] = [
      input.supplier?.address1,
      input.supplier?.address2,
      input.supplier?.address3,
      input.supplier?.address4,
      input.supplier?.address5,
      input.supplier?.address6,
      input.supplier?.address7,
      input.supplier?.address8,
    ];

    const city: string[] = [
      input.supplier?.city1,
      input.supplier?.city2,
      input.supplier?.city3,
      input.supplier?.city4,
      input.supplier?.city5,
      input.supplier?.city6,
      input.supplier?.city7,
      input.supplier?.city8,
      input.supplier?.city9,
    ];

    let country: string =
      input.supplier?.country1?.trim() ||
      input.supplier?.country2?.trim() ||
      input.supplier?.country3?.trim() ||
      input.supplier?.country4?.trim() ||
      input.supplier?.country5?.trim() ||
      input.supplier?.country6?.trim() ||
      input.supplier?.country7?.trim() ||
      '';

    const postalCode: string =
      input.supplier?.postalCode1?.trim() ||
      input.supplier?.postalCode2?.trim() ||
      input.supplier?.postalCode3?.trim() ||
      input.supplier?.postalCode4?.trim() ||
      input.supplier?.postalCode5?.trim() ||
      input.supplier?.postalCode6?.trim() ||
      input.supplier?.postalCode7?.trim() ||
      '';

    const eoriCode = input.supplier?.vatNumber?.trim() || '';

    let companyName: string = '',
      vatNumber: string = '';

    if (
      this.convertArrayToString(companyNameArray) == '' &&
      country == '' &&
      this.convertArrayToString(address) == '' &&
      this.convertArrayToString(city) == '' &&
      postalCode == '' &&
      eoriCode != ''
    ) {
      companyName = eoriCode;
      vatNumber = /^[A-Za-z]{2}/.test(eoriCode) ? eoriCode.slice(2) : eoriCode;
      country = /^[A-Za-z]{2}/.test(eoriCode) ? eoriCode.slice(0, 2) : 'IT';
    } else {
      companyName = this.convertArrayToString(companyNameArray);
      if (eoriCode != '') {
        vatNumber = eoriCode.replace(/[a-zA-Z]/g, '');
      }
    }

    const supplier = this.convertAsterisksToZero(
      {
        companyName,
        vatNumber,
        country,
        address: this.convertArrayToString(address),
        city: this.convertArrayToString(city),
        postalCode,
      },
      'city',
      'postalCode',
      'address',
    );

    const date: string =
      input.declaration.date1 ||
      input.declaration.date2 ||
      input.declaration.date3 ||
      '';

    const acceptanceDate: string =
      input.declaration.acceptanceDate1 ||
      input.declaration.acceptanceDate2 ||
      input.declaration.acceptanceDate3 ||
      '';

    const releaseDate: string = input.declaration.releaseDate1 || '';

    const releaseCode: string = input.declaration.releaseCode1 || '';

    const totalGrossWeight: string =
      input.declaration.totalGrossWeight1 ||
      input.declaration.totalGrossWeight2 ||
      input.declaration.totalGrossWeight3 ||
      '';

    const invoiceValue: string =
      input.declaration.invoiceValueAndCurrency1?.split(' ')[0] ||
      input.declaration.invoiceValueAndCurrency2?.split(' ')[0] ||
      input.declaration.invoiceValueAndCurrency3?.split(' ')[0] ||
      '';

    const currency: string =
      input.declaration.invoiceValueAndCurrency1?.split(' ')[1] ||
      input.declaration.invoiceValueAndCurrency2?.split(' ')[1] ||
      input.declaration.invoiceValueAndCurrency3?.split(' ')[1] ||
      '';

    const exchangeRate: string =
      input.declaration.exchangeRate1 ||
      input.declaration.exchangeRate2 ||
      input.declaration.exchangeRate3 ||
      '';

    const incoterm: string =
      input.declaration.incoterm1 ||
      input.declaration.incoterm2 ||
      input.declaration.incoterm3 ||
      input.declaration.incoterm4 ||
      input.declaration.incoterm5 ||
      input.declaration.incoterm6 ||
      input.declaration.incoterm7 ||
      '';

    const goods = input.goods
      .map((good) => {
        if (
          good.goodDetailString == 'Dettaglio Articolo n°' &&
          good.goodCodeString == 'Codice merce'
        ) {
          const ncCode =
            input.declaration.track == 'H7'
              ? good.ncCode
              : good.ncCode.slice(0, -2);

          const taricCode =
            input.declaration.track == 'H7' ? '' : good.ncCode.slice(-2);

          const requestedRegime =
            input.declaration.track == 'H7'
              ? ''
              : good.customsRegime.slice(0, 2).trim();

          const previousRegime =
            input.declaration.track == 'H7'
              ? ''
              : good.customsRegime.slice(-2).trim();

          const customsRegime = `${requestedRegime}${previousRegime}`;

          const description: string[] = [
            good.description1,
            good.description2,
            good.description3,
            good.description4,
            good.description5,
            good.description6,
            good.description7,
            good.description8,
            good.description9,
            good.description10,
            good.description11,
            good.description12,
          ];

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
            '';

          return this.convertAsterisksToZero({
            ncCode,
            taricCode,
            identificationCode: good.ncCode,
            description: this.convertArrayToString(description),
            country,
            netWeight: good.netWeight,
            customsRegime,
            requestedRegime,
            previousRegime,
          });
        }
        return undefined;
      })
      .filter((g) => !!g);

    const documents = input.documents.filter(
      (d) => d.code != '' && d.code != 'Tipo' && d.code != 'Scarichi' && d.code != 'Documenti' && d.code != 'Codice',
    );

    if (documents.length != documentsNumber) {
      throw new Error('Missing mapping for documents');
    }

    return this.convertAsterisksToZero({
      mrn: input.declaration.mrn,
      version: input.declaration.version,
      date,
      acceptanceDate,
      releaseCode,
      releaseDate,
      totalGrossWeight,
      invoiceValue,
      currency,
      exchangeRate,
      incoterm,
      track: input.declaration.track,
      supplier,
      goods,
      documents,
    });
  }
  private convertArrayToString(array: string[]): string {
    return array
      .filter((el) => !!el)
      .map((el) => el.trim())
      .join(' ');
  }
  private convertAsterisksToZero<T extends Record<string, unknown>>(
    object: T,
    ...keysToConvertVoidToZero: (keyof T)[]
  ): T {
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        const element = object[key];
        if (
          element === '*' ||
          (keysToConvertVoidToZero.includes(key) && element === '')
        ) {
          //GENERALLY NOT SAFE, BUT ADDED IF
          object[key] = '0' as T[typeof key];
        }
      }
    }

    return object;
  }
  public async run(params: {
    data: {
      path: string;
    };
  }): Promise<AdmDeclarationMapped> {
    const pdfParser = new PDFParser();

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

        pdfParser.loadPDF(params.data.path);
      },
    );

    try {
      const declarationRawJson: DeclarationRawJson =
        await loadDeclarationFromPDF;
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const declarationEntity: any = {
        date: new Date(),
        declarationId: 0,
        cbamRequestId: 0,
        authorId: 0,
        mrn: '',
        documents: [],
      };
      let countNumber = 0;
      let isMappingDocuments: boolean = false,
        isFirstDocument = true,
        isNewDocument = false;
      if (!!declarationRawJson && declarationRawJson.Pages) {
        const pages = declarationRawJson.Pages;

        for (let i = 0; i < pages.length; i++) {
          const page = pages[i];
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

              // if(i == 0){
              //   console.log({ "x": textElement.x, "y": textElement.y, "text": text })
              // }

              if (text == 'Scarichi' && textElement.x == 2.159) {
                isMappingDocuments = false;
              }

              if (
                text != 'Codice' &&
                textElement.x == 2.159 &&
                isMappingDocuments
              ) {
                countNumber++;
              }

              if (i == 0 && text == 'Documenti' && textElement.x == 2.159) {
                isMappingDocuments = true;
              }

              const mappedPosition: { entity?: string; column?: string } =
                this.getMappedPosition(textElement.x, textElement.y, isMappingDocuments);

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
                      declarationEntity['documents'].push(documentObject);
                      documentObject = {
                        code: '',
                        identifier: '',
                      };
                      isNewDocument = false
                    }

                    if (mappedPosition.column == 'identifier') {
                      documentObject['identifier'] =
                        documentObject['identifier'] + text.trim();
                    } else {
                      documentObject['code'] = text.trim();
                    }
                  }
                }
                else {
                  if (i > 0) {
                    if (!declarationEntity[mappedPosition.entity])
                      declarationEntity[mappedPosition.entity] = [];
  
                    if (Array.isArray(declarationEntity[mappedPosition.entity])) {
                      goodObject[mappedPosition.column] = text.trim();
  
                      const lastItem =
                        declarationEntity[mappedPosition.entity].slice(-1)[0];
  
                      const isNewItem =
                        !lastItem ||
                        (lastItem.nr !== goodObject.nr &&
                          !!goodObject.ncCode &&
                          goodObject.ncCode.length > 0 &&
                          goodObject.ncCode.length <= 10 &&
                          !isNaN(parseFloat(goodObject.netWeight)));
  
                      if (isNewItem)
                        declarationEntity[mappedPosition.entity].push(goodObject);
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
            declarationEntity['documents'].push(documentObject);
          }
        }
      } else {
        throw new Error('No Pages found in the PDF.');
      }

      const admDeclarationMapped = this.map(declarationEntity, countNumber);
      return admDeclarationMapped;
    } catch (error) {
      throw new Error('parsing PDF declarations:' + error); // Returning an empty object
    }
  }
}
export default PDFConverter;
