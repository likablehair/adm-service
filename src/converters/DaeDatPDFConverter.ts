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
  customsRegime: string;
  releaseCode: string;
};

export interface DaeDatJson {
  statement: {
    releaseDate: string;
    customsExitOffice: string;
    totalGrossWeight: string;
    totalPackages1: string;
    totalPackages2: string;
    customsRegime1: string;
    customsRegime2: string;
    customsRegime3: string;
    customsRegime4: string;
    customsRegime5: string;
    releaseCode: string;
  };
  consignee: {
    companyName: string;
    companyAddress: string;
    postalCode: string;
    city: string;
    country: string;
  };
  goods: {
    statisticValue1: string;
    statisticValue2: string;
    statisticValue3: string;
    statisticValue4: string;
    statisticValue5: string;
    statisticValue6: string;
    statisticValue7: string;
    statisticValue8: string;
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
  private map(input: DaeDatJson, numberOfPages: number): DaeDatStatementMapped {
    if (input.goods.length != numberOfPages - 1) {
      throw Error('Missing statistic value mapping');
    }

    const releaseDate = input.statement.releaseDate?.trim() || '';

    const customsRegime =
      input.statement.customsRegime1?.trim() ||
      input.statement.customsRegime2?.trim() ||
      input.statement.customsRegime3?.trim() ||
      input.statement.customsRegime4?.trim() ||
      input.statement.customsRegime5?.trim() ||
      '';

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

    const totalStatisticValue =
      Math.round(
        input.goods.reduce((acc, good) => {
          const statisticValue =
            good.statisticValue1?.trim() ||
            good.statisticValue2?.trim() ||
            good.statisticValue3?.trim() ||
            good.statisticValue4?.trim() ||
            good.statisticValue5?.trim() ||
            good.statisticValue6?.trim() ||
            good.statisticValue7?.trim() ||
            good.statisticValue8?.trim() ||
            '0';

          return acc + Number(statisticValue);
        }, 0) * 100,
      ) / 100;

    return {
      releaseDate,
      totalPackages,
      totalGrossWeight,
      customsExitOffice,
      customsRegime,
      totalStatisticValue,
      releaseCode,
      consignee: {
        companyName,
        companyAddress,
        postalCode: postalCode == '*' || postalCode == '' ? '0' : postalCode,
        city,
        country,
      },
    };
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
      let numberOfPages: number | undefined = undefined;
      if (!!declarationRawJson && declarationRawJson.Pages) {
        const pages = declarationRawJson.Pages;
        numberOfPages = pages.length;

        for (let i = 0; i < pages.length; i++) {
          const page = pages[i];
          if (page.Texts) {
            const goodObject: any = {};
            for (let j = 0; j < page.Texts.length; j++) {
              const textElement = page.Texts[j];
              const text = decodeURIComponent(textElement.R[0].T);

              // if(i == 0){
              //   console.log({ "x": textElement.x, "y": textElement.y, "text": text })
              // }

              const mappedPosition: { entity?: string; column?: string } =
                this.getMappedPosition(textElement.x, textElement.y);

              if (!mappedPosition.column || !text.trim()) {
                continue;
              } else if (!!mappedPosition.entity && !!mappedPosition.column) {
                if (i > 0) {
                  if (
                    i == 1 &&
                    mappedPosition.entity == 'statement' &&
                    mappedPosition.column.startsWith('customsRegime')
                  ) {
                    if (!daeDatEntity[mappedPosition.entity])
                      daeDatEntity[mappedPosition.entity] = {};
                    daeDatEntity[mappedPosition.entity][mappedPosition.column] =
                      text.trim();
                  } else {
                    if (!daeDatEntity[mappedPosition.entity])
                      daeDatEntity[mappedPosition.entity] = [];

                    if (Array.isArray(daeDatEntity[mappedPosition.entity])) {
                      goodObject[mappedPosition.column] = text.trim();
                      daeDatEntity[mappedPosition.entity].push(goodObject);
                    }
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

      const accountingStatementMapped = this.map(daeDatEntity, numberOfPages);
      return accountingStatementMapped;
    } catch (error) {
      throw new Error('Error parsing PDF:' + error); // Returning an empty object
    }
  }
}
export default DaeDatPDFConverter;
