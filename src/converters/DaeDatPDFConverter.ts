import PDFParser from 'pdf2json';
import { DeclarationRawJson } from './PDFConverter';
import { _cells } from './DaeDatCellsMapper';
import * as fsPromises from 'fs/promises';
import { createId } from '@paralleldrive/cuid2';
import { documentCodeList } from 'src/utils/documentCodes';

export type DaeDatStatementMapped = {
  consignee: {
    companyName: string;
    companyAddress: string;
    postalCode: string;
    city: string;
    country: string;
  };
  customsExitOffice: string;
  customsExportOffice: string;
  totalPackages: string;
  totalGrossWeight: string;
  totalStatisticValue: number;
  releaseDate: string;
  releaseCode: string;
  transitNetworkCountry: string;
  transportMode: number;
  goods: {
    customsRegime: string;
    requestedRegime: string;
    previousRegime: string;
    statisticValue: number;
    netWeight: string;
    ncCode: string;
    description: string;
    identificationCode: string;
    documents: { code: string; identifier: string }[];
  }[];
};

export interface DaeDatJson {
  statement: {
    releaseDate: string;
    customsExitOffice: string;
    customsExportOffice: string;
    totalGrossWeight: string;
    totalPackages: string;
    releaseCode1: string;
    releaseCode2: string;
    transitNetworkCountry: string;
    transportMode: string;
  };
  consignee: {
    companyName: string;
    companyAddress: string;
    postalCode: string;
    cityAndCountry: string;
    city: string;
    country: string;
  };
  goods: {
    nr1: string;
    nr2: string;
    nr3: string;
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
    netWeight1: string;
    netWeight2: string;
    netWeight3: string;
    netWeight4: string;
    netWeight5: string;
    netWeight6: string;
    netWeight7: string;
    netWeight8: string;
    netWeight9: string;
    netWeight10: string;
    netWeight11: string;
    netWeight12: string;
    netWeight13: string;
    ncCode1: string;
    ncCode2: string;
    ncCode3: string;
    ncCode4: string;
    ncCode5: string;
    ncCode6: string;
    ncCode7: string;
    ncCode8: string;
    ncCode9: string;
    ncCode10: string;
    ncCode11: string;
    ncCode12: string;
    ncCode13: string;
    description1: string;
    description2: string;
    description3: string;
    description4: string;
    description5: string;
    description6: string;
    description7: string;
    requestedRegime1: string;
    requestedRegime2: string;
    requestedRegime3: string;
    requestedRegime4: string;
    requestedRegime5: string;
    requestedRegime6: string;
    requestedRegime7: string;
    requestedRegime8: string;
    requestedRegime9: string;
    requestedRegime10: string;
    requestedRegime11: string;
    requestedRegime12: string;
    requestedRegime13: string;
    previousRegime1: string;
    previousRegime2: string;
    previousRegime3: string;
    previousRegime4: string;
    previousRegime5: string;
    previousRegime6: string;
    previousRegime7: string;
    previousRegime8: string;
    previousRegime9: string;
    previousRegime10: string;
    previousRegime11: string;
    previousRegime12: string;
    previousRegime13: string;
    documents1: string;
    documents2: string;
    documents3: string;
    documents4: string;
    documents5: string;
    documents6: string;
    documents7: string;
    documents8: string;
    documents9: string;
    documents10: string;
    documents11: string;
    documents12: string;
    documents13: string;
    documents14: string;
    documents15: string;
    additionalDocuments1: string;
    additionalDocuments2: string;
    additionalDocuments3: string;
    additionalDocuments4: string;
    additionalDocuments5: string;
    additionalDocuments6: string;
    additionalDocuments7: string;
    additionalDocuments8: string;
    additionalDocuments9: string;
    additionalDocuments10: string;
    additionalDocuments11: string;
    additionalDocuments12: string;
    additionalDocuments13: string;
    additionalDocuments14: string;
    additionalDocuments15: string;
    additionalDocuments16: string;
    additionalDocuments17: string;
    additionalDocuments18: string;
    additionalDocuments19: string;
    additionalDocuments20: string;
    additionalDocuments21: string;
    additionalDocuments22: string;
    additionalDocuments23: string;
    additionalDocuments24: string;
    additionalDocuments25: string;
    additionalDocuments26: string;
    additionalDocuments27: string;
  }[];
}

class DaeDatPDFConverter {
  private getMappedPosition(
    x: number,
    y: number,
  ): { entity?: string; column?: string } {
    const _x = x.toFixed(3);
    const _y = y.toFixed(3);
    const _xy: string = _x.toString() + '-' + _y.toString();

    _cells[Number(_xy)] = { xRange: [x, x], yRange: [y, y] };

    for (const cell in _cells) {
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
    return {};
  }
  private map(
    input: DaeDatJson,
    documentsNumber: number,
    numberOfGoodsPages: number = 0,
  ): DaeDatStatementMapped {
    const unformattedReleaseDate = input.statement.releaseDate?.trim() || '';
    const [year, month, day] = unformattedReleaseDate.split('/');
    const releaseDate = `${day}/${month}/${year}`;

    const totalPackages = input.statement.totalPackages?.trim() || '';

    const totalGrossWeight = input.statement.totalGrossWeight?.trim() || '';

    const customsExitOffice = input.statement.customsExitOffice?.trim() || '';

    const customsExportOffice =
      input.statement.customsExportOffice?.trim() || '';

    const releaseCode =
      input.statement.releaseCode1?.trim() ||
      input.statement.releaseCode2?.trim() ||
      '';

    const companyName = input.consignee.companyName?.trim() || '';

    const companyAddress = input.consignee.companyAddress?.trim() || '';

    const postalCode = input.consignee.postalCode?.trim() || '0';

    const cityAndCountry = input.consignee.cityAndCountry?.trim() || '';
    const consigneeCity = input.consignee.city?.trim() || '';
    const consigneeCountry = input.consignee.country?.trim() || '';

    const city = consigneeCity || cityAndCountry.split('-')[0].trim() || '';

    const country =
      consigneeCountry || cityAndCountry.split('-')[1].trim() || '';

    const transportMode = input.statement.transportMode?.trim() || '-1';

    const transitNetworkCountry =
      input.statement.transitNetworkCountry?.trim() || '';

    const goods = input.goods.map((good) => {
      const statisticValueString =
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
        '';

      const netWeight =
        good.netWeight13?.trim() ||
        good.netWeight12?.trim() ||
        good.netWeight11?.trim() ||
        good.netWeight10?.trim() ||
        good.netWeight9?.trim() ||
        good.netWeight8?.trim() ||
        good.netWeight7?.trim() ||
        good.netWeight6?.trim() ||
        good.netWeight5?.trim() ||
        good.netWeight4?.trim() ||
        good.netWeight3?.trim() ||
        good.netWeight2?.trim() ||
        good.netWeight1?.trim() ||
        '';

      let ncCode =
        good.ncCode1?.trim() ||
        good.ncCode2?.trim() ||
        good.ncCode3?.trim() ||
        good.ncCode4?.trim() ||
        good.ncCode5?.trim() ||
        good.ncCode6?.trim() ||
        good.ncCode7?.trim() ||
        good.ncCode8?.trim() ||
        good.ncCode9?.trim() ||
        good.ncCode10?.trim() ||
        good.ncCode11?.trim() ||
        good.ncCode12?.trim() ||
        good.ncCode13?.trim() ||
        '';

      ncCode = ncCode.replace(/[\s/]/g, '').slice(0, 8);

      const identificationCode = ncCode;

      const description = [
        good.description1,
        good.description2,
        good.description3,
        good.description4,
        good.description5,
        good.description6,
        good.description7,
      ];

      const requestedRegime =
        good.requestedRegime1?.trim() ||
        good.requestedRegime2?.trim() ||
        good.requestedRegime3?.trim() ||
        good.requestedRegime4?.trim() ||
        good.requestedRegime5?.trim() ||
        good.requestedRegime6?.trim() ||
        good.requestedRegime7?.trim() ||
        good.requestedRegime8?.trim() ||
        good.requestedRegime9?.trim() ||
        good.requestedRegime10?.trim() ||
        good.requestedRegime11?.trim() ||
        good.requestedRegime12?.trim() ||
        good.requestedRegime13?.trim() ||
        '';

      const previousRegime =
        good.previousRegime1?.trim() ||
        good.previousRegime2?.trim() ||
        good.previousRegime3?.trim() ||
        good.previousRegime4?.trim() ||
        good.previousRegime5?.trim() ||
        good.previousRegime6?.trim() ||
        good.previousRegime7?.trim() ||
        good.previousRegime8?.trim() ||
        good.previousRegime9?.trim() ||
        good.previousRegime10?.trim() ||
        good.previousRegime11?.trim() ||
        good.previousRegime12?.trim() ||
        good.previousRegime13?.trim() ||
        '';

      const customsRegime = `${requestedRegime}${previousRegime}`;

      const statisticValue: number = Number(
        statisticValueString.replace(',', '.'),
      );

      const documentsArray = [
        good.documents1,
        good.documents2,
        good.documents3,
        good.documents4,
        good.documents5,
        good.documents6,
        good.documents7,
        good.documents8,
        good.documents9,
        good.documents10,
        good.documents11,
        good.documents12,
        good.documents13,
        good.documents14,
        good.documents15,
        ...(good.statisticValue1 ||
        good.statisticValue2 ||
        good.statisticValue3 ||
        good.statisticValue4 ||
        good.statisticValue5 ||
        good.statisticValue6 ||
        good.statisticValue7 ||
        good.statisticValue8 ||
        good.statisticValue9 ||
        good.statisticValue10 ||
        good.statisticValue11 ||
        good.statisticValue12
          ? [good.statisticValue13]
          : []),
      ];

      const documentsString = this.convertArrayToString(documentsArray);

      const documents = this.convertDocumentsStringToArray(documentsString);

      const additionalDocumentsArray = [
        good.additionalDocuments1,
        good.additionalDocuments2,
        good.additionalDocuments3,
        good.additionalDocuments4,
        good.additionalDocuments5,
        good.additionalDocuments6,
        good.additionalDocuments7,
        good.additionalDocuments8,
        good.additionalDocuments9,
        good.additionalDocuments10,
        good.additionalDocuments11,
        good.additionalDocuments12,
        good.additionalDocuments13,
        good.additionalDocuments14,
        good.additionalDocuments15,
        good.additionalDocuments16,
        good.additionalDocuments17,
        good.additionalDocuments18,
        good.additionalDocuments19,
        good.additionalDocuments20,
        good.additionalDocuments21,
        good.additionalDocuments22,
        good.additionalDocuments23,
        good.additionalDocuments24,
        good.additionalDocuments25,
        good.additionalDocuments26,
        good.additionalDocuments27,
      ];

      const additionalDocumentsString = this.convertArrayToString(
        additionalDocumentsArray,
      );

      const additionalDocuments = this.convertDocumentsStringToArray(
        additionalDocumentsString,
      );

      const formattedDocuments: { code: string; identifier: string }[] = [
        ...documents,
        ...additionalDocuments,
      ].map((doc) => {
        const documentCode = doc.split(/\s*[-–]\s*(.*)/).map((el) => el.trim());

        const code = documentCode[0];
        let identifier = documentCode[1];

        if (identifier) {
          identifier = identifier.replace(/(\s*\/+)$/, '').trim();
        }

        return {
          code,
          identifier: !identifier || identifier === '' ? '-' : identifier,
        };
      });

      return this.convertAsterisksToZero({
        customsRegime,
        requestedRegime,
        previousRegime,
        statisticValue,
        netWeight,
        ncCode,
        identificationCode,
        description: this.convertArrayToString(description),
        documents: formattedDocuments,
      });
    });

    if (numberOfGoodsPages !== goods.length) {
      throw new Error('Missing mapping for goods');
    }

    if (goods.some((g) => !g.ncCode)) {
      throw new Error('Missing NC Code for goods');
    }

    const localDocumentsNumber =
      goods.reduce((acc, good) => {
        return acc + (good.documents.length || 0);
      }, 0) || 0;

    if (localDocumentsNumber !== documentsNumber) {
      throw new Error('Missing mapping for documents');
    }

    const totalStatisticValue =
      Math.round(
        goods.reduce((acc, good) => {
          return acc + Number(good.statisticValue);
        }, 0) * 100,
      ) / 100;

    return this.convertAsterisksToZero({
      releaseDate,
      totalPackages,
      totalGrossWeight,
      customsExitOffice,
      customsExportOffice,
      totalStatisticValue,
      releaseCode,
      transitNetworkCountry,
      transportMode: Number(transportMode),
      consignee: this.convertAsterisksToZero(
        {
          companyName,
          companyAddress,
          postalCode: postalCode == '*' || postalCode == '' ? '0' : postalCode,
          city,
          country,
        },
        'city',
        'postalCode',
      ),
      goods,
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

  private convertDocumentsStringToArray(
    documentString: string | undefined,
  ): string[] {
    if (!documentString) return [];

    const docCodes = documentCodeList.map((doc) => this.escapeRegExp(doc.code));
    const joinedDocCodes = docCodes.join('|');
    const regex = new RegExp(
      `(${joinedDocCodes})\\s*[-–]\\s*.*?(?=\\s*(?:${joinedDocCodes})\\b|\\s*$)`,
      'g',
    );

    const documentsArray =
      documentString
        .match(regex)
        ?.map((el) => el.trim())
        .filter((el) => !!el && el !== '') || [];

    return documentsArray;
  }

  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  public async run(params: {
    data: { path: string } | { buffer: Buffer };
  }): Promise<DaeDatStatementMapped> {
    const pdfParser = new PDFParser();

    let path = createId();
    if ('buffer' in params.data) {
      await fsPromises.writeFile(path, params.data.buffer);
    } else {
      path = params.data.path;
    }

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

        pdfParser.loadPDF(path);
      },
    );

    try {
      const declarationRawJson: DeclarationRawJson =
        await loadDeclarationFromPDF;
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const daeDatEntity: any = {
        statement: {},
        consignee: {},
      };

      let numberOfDocuments: number = 0;
      let pagesNumber: number = 0;
      if (!!declarationRawJson && declarationRawJson.Pages) {
        const pages = declarationRawJson.Pages;
        pagesNumber = pages.length;

        for (let i = 0; i < pages.length; i++) {
          const page = pages[i];
          if (page.Texts) {
            const goodObject: any = {};

            for (let j = 0; j < page.Texts.length; j++) {
              const textElement = page.Texts[j];
              const text = decodeURIComponent(textElement.R[0].T);

              // if (i == 0) {
              //   console.log({ x: textElement.x, y: textElement.y, text: text });
              // }

              //console.log({ "page": i + 1, "x": textElement.x, "y": textElement.y, "text": text })

              const mappedPosition: { entity?: string; column?: string } =
                this.getMappedPosition(textElement.x, textElement.y);

              if (!mappedPosition.column || !text.trim()) {
                continue;
              } else if (!!mappedPosition.entity && !!mappedPosition.column) {
                if (i > 0) {
                  if (!daeDatEntity[mappedPosition.entity])
                    daeDatEntity[mappedPosition.entity] = [];

                  if (Array.isArray(daeDatEntity[mappedPosition.entity])) {
                    goodObject[mappedPosition.column] = text.trim();

                    const lastItem =
                      daeDatEntity[mappedPosition.entity].slice(-1)[0];

                    const isNewItem =
                      !lastItem ||
                      (!!lastItem.nr1 &&
                        lastItem.nr1 !== goodObject.nr1 &&
                        lastItem.nr1 !== goodObject.nr2 &&
                        lastItem.nr1 !== goodObject.nr3) ||
                      (!!lastItem.nr2 &&
                        lastItem.nr2 !== goodObject.nr1 &&
                        lastItem.nr2 !== goodObject.nr2 &&
                        lastItem.nr2 !== goodObject.nr3) ||
                      (!!lastItem.nr3 &&
                        lastItem.nr3 !== goodObject.nr1 &&
                        lastItem.nr3 !== goodObject.nr2 &&
                        lastItem.nr3 !== goodObject.nr3);

                    if (isNewItem)
                      daeDatEntity[mappedPosition.entity].push(goodObject);
                  }
                } else {
                  if (!daeDatEntity[mappedPosition.entity])
                    daeDatEntity[mappedPosition.entity] = {};

                  daeDatEntity[mappedPosition.entity][mappedPosition.column] =
                    text.trim();
                }
              }
            }
          }
        }
      } else {
        throw new Error('No Pages found in the PDF.');
      }

      numberOfDocuments = daeDatEntity.goods.reduce(
        (acc: number, good: any) => {
          const documentsArray = [
            good.documents1,
            good.documents2,
            good.documents3,
            good.documents4,
            good.documents5,
            good.documents6,
            good.documents7,
            good.documents8,
            good.documents9,
            good.documents10,
            good.documents11,
            good.documents12,
            good.documents13,
            good.documents14,
            good.documents15,
            ...(good.statisticValue1 ||
            good.statisticValue2 ||
            good.statisticValue3 ||
            good.statisticValue4 ||
            good.statisticValue5 ||
            good.statisticValue6 ||
            good.statisticValue7 ||
            good.statisticValue8 ||
            good.statisticValue9 ||
            good.statisticValue10 ||
            good.statisticValue11 ||
            good.statisticValue12
              ? [good.statisticValue13]
              : []),
          ];

          const documentsString = this.convertArrayToString(documentsArray);

          const additionalDocumentsArray = [
            good.additionalDocuments1,
            good.additionalDocuments2,
            good.additionalDocuments3,
            good.additionalDocuments4,
            good.additionalDocuments5,
            good.additionalDocuments6,
            good.additionalDocuments7,
            good.additionalDocuments8,
            good.additionalDocuments9,
            good.additionalDocuments10,
            good.additionalDocuments11,
            good.additionalDocuments12,
            good.additionalDocuments13,
            good.additionalDocuments14,
            good.additionalDocuments15,
            good.additionalDocuments16,
            good.additionalDocuments17,
            good.additionalDocuments18,
            good.additionalDocuments19,
            good.additionalDocuments20,
            good.additionalDocuments21,
            good.additionalDocuments22,
            good.additionalDocuments23,
            good.additionalDocuments24,
            good.additionalDocuments25,
            good.additionalDocuments26,
            good.additionalDocuments27,
          ];

          const additionalDocumentsString = this.convertArrayToString(
            additionalDocumentsArray,
          );

          return (
            acc +
            this.convertDocumentsStringToArray(documentsString).length +
            this.convertDocumentsStringToArray(additionalDocumentsString).length
          );
        },
        0,
      );

      const accountingStatementMapped = this.map(
        daeDatEntity,
        numberOfDocuments,
        pagesNumber - 1,
      );

      await fsPromises.unlink(path);
      return accountingStatementMapped;
    } catch (error) {
      await fsPromises.unlink(path);
      throw new Error('parsing PDF DAE/DAT:' + error); // Returning an empty object
    }
  }
}
export default DaeDatPDFConverter;
