import PDFParser from 'pdf2json';
import { DeclarationRawJson } from './PDFConverter';
import { _cells } from './DaeDatCellsMapper';

export type DaeDatStatementMapped = {
  consignee: {
    companyName: string;
    companyAddress: string;
    postalCode: string;
    city: string;
    country: string;
  };
  customsExitOffice: string;
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
    statisticValue: string;
    netWeight: string;
    ncCode: string;
    description: string;
    identificationCode: string;
  }[];
};

export interface DaeDatJson {
  statement: {
    releaseDate: string;
    customsExitOffice: string;
    totalGrossWeight: string;
    totalPackages1: string;
    totalPackages2: string;
    releaseCode: string;
    transitNetworkCountry1: string;
    transitNetworkCountry2: string;
    transitNetworkCountry3: string;
    transitNetworkCountry4: string;
    transitNetworkCountry5: string;
    transitNetworkCountry6: string;
    transitNetworkCountry7: string;
    transitNetworkCountry8: string;
    transitNetworkCountry9: string;
    transitNetworkCountry10: string;
    transitNetworkCountry11: string;
    transitNetworkCountry12: string;
    transportMode: string;
  };
  consignee: {
    companyName: string;
    companyAddress: string;
    postalCode: string;
    city: string;
    country: string;
  };
  goods: {
    nr1: string;
    nr2: string;
    statisticValue1: string;
    statisticValue2: string;
    statisticValue3: string;
    statisticValue4: string;
    statisticValue5: string;
    statisticValue6: string;
    statisticValue7: string;
    statisticValue8: string;
    netWeight1: string;
    netWeight2: string;
    netWeight3: string;
    netWeight4: string;
    netWeight5: string;
    netWeight6: string;
    ncCode1: string;
    ncCode2: string;
    ncCode3: string;
    ncCode4: string;
    ncCode5: string;
    ncCode6: string;
    description1: string;
    description2: string;
    description3: string;
    description4: string;
    description5: string;
    customsRegime1: string;
    customsRegime2: string;
    customsRegime3: string;
    customsRegime4: string;
    customsRegime5: string;
    customsRegime6: string;
    customsRegime7: string;
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
  private map(input: DaeDatJson): DaeDatStatementMapped {
    const releaseDate = input.statement.releaseDate?.trim() || '';

    const totalPackages =
      input.statement.totalPackages1?.trim() ||
      input.statement.totalPackages2?.trim() ||
      '';

    const totalGrossWeight = input.statement.totalGrossWeight?.trim() || '';

    const customsExitOffice = input.statement.customsExitOffice?.trim() || '';

    const releaseCode = input.statement.releaseCode?.trim() || '';

    const companyName = input.consignee.companyName?.trim() || '';

    const companyAddress = input.consignee.companyAddress?.trim() || '';

    const postalCode = input.consignee.postalCode?.trim() || '0';

    const city = input.consignee.city?.trim() || '';

    const country = input.consignee.country?.trim() || '';

    const transportMode = input.statement.transportMode?.trim() || '-1';

    const transitNetworkCountry =
      input.statement.transitNetworkCountry1?.trim() ||
      input.statement.transitNetworkCountry2?.trim() ||
      input.statement.transitNetworkCountry3?.trim() ||
      input.statement.transitNetworkCountry4?.trim() ||
      input.statement.transitNetworkCountry5?.trim() ||
      input.statement.transitNetworkCountry6?.trim() ||
      input.statement.transitNetworkCountry7?.trim() ||
      input.statement.transitNetworkCountry8?.trim() ||
      input.statement.transitNetworkCountry9?.trim() ||
      input.statement.transitNetworkCountry10?.trim() ||
      input.statement.transitNetworkCountry11?.trim() ||
      input.statement.transitNetworkCountry12?.trim() ||
      '';

    const goods = input.goods.map((good) => {
      const statisticValue =
        good.statisticValue1?.trim() ||
        good.statisticValue2?.trim() ||
        good.statisticValue3?.trim() ||
        good.statisticValue4?.trim() ||
        good.statisticValue5?.trim() ||
        good.statisticValue6?.trim() ||
        good.statisticValue7?.trim() ||
        good.statisticValue8?.trim() ||
        '';

      const netWeight =
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
        '';

      ncCode = ncCode.replace(/[\s/]/g, '').slice(0, 8);

      const identificationCode = ncCode;

      const description = [
        good.description1,
        good.description2,
        good.description3,
        good.description4,
        good.description5,
      ];

      let customsRegime =
        good.customsRegime1?.trim() ||
        good.customsRegime2?.trim() ||
        good.customsRegime3?.trim() ||
        good.customsRegime4?.trim() ||
        good.customsRegime5?.trim() ||
        good.customsRegime6?.trim() ||
        good.customsRegime7?.trim() ||
        '';

      const requestedRegime = customsRegime.slice(0, 2).trim();

      const previousRegime = customsRegime.slice(-2).trim();

      customsRegime = `${requestedRegime}${previousRegime}`;

      return this.convertAsterisksToZero({
        customsRegime,
        requestedRegime,
        previousRegime,
        statisticValue,
        netWeight,
        ncCode,
        identificationCode,
        description: this.convertArrayToString(description),
      });
    });

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
  public async run(params: {
    data: {
      path: string;
    };
  }): Promise<DaeDatStatementMapped> {
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
      const daeDatEntity: any = {
        statement: {},
        consignee: {},
      };
      if (!!declarationRawJson && declarationRawJson.Pages) {
        const pages = declarationRawJson.Pages;

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
                        lastItem.nr1 !== goodObject.nr2) ||
                      (!!lastItem.nr2 &&
                        lastItem.nr2 !== goodObject.nr1 &&
                        lastItem.nr2 !== goodObject.nr2);

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

      const accountingStatementMapped = this.map(daeDatEntity);
      return accountingStatementMapped;
    } catch (error) {
      throw new Error('parsing PDF DAE/DAT:' + error); // Returning an empty object
    }
  }
}
export default DaeDatPDFConverter;
