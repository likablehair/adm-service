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
  goods: {
    statisticValue: string;
    netWeight: string;
    ncCode: string;
    description: string;
  }[]
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
    customsRegime6: string;
    customsRegime7: string;
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
    ncCode1: string;
    ncCode2: string;
    ncCode3: string;
    ncCode4: string;
    description1: string;
    description2: string;
    description3: string;
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

    const customsRegime =
      input.statement.customsRegime1?.trim() ||
      input.statement.customsRegime2?.trim() ||
      input.statement.customsRegime3?.trim() ||
      input.statement.customsRegime4?.trim() ||
      input.statement.customsRegime5?.trim() ||
      input.statement.customsRegime6?.trim() ||
      input.statement.customsRegime7?.trim() ||
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

    const goods = input.goods.map(good => {
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
        good.netWeight1?.trim() ||
        good.netWeight2?.trim() ||
        good.netWeight3?.trim() ||
        good.netWeight4?.trim() ||
        '';

      const ncCode =
        good.ncCode1?.trim() ||
        good.ncCode2?.trim() ||
        good.ncCode3?.trim() ||
        good.ncCode4?.trim() ||
        '';

      const description = [
        good.description1,
        good.description2,
        good.description3,
      ]
      
      return {
        statisticValue,
        netWeight,
        ncCode: ncCode.replace(/[\s/]/g, ''),
        description: this.convertArrayToString(description),
      }
    })
    
    const totalStatisticValue =
      Math.round(
        goods.reduce((acc, good) => {
          return acc + Number(good.statisticValue);
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
      goods,
    };
  }
  private convertArrayToString(array: string[]): string {
    return array
      .filter((el) => !!el)
      .map((el) => el.trim())
      .join(' ');
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

                      const lastItem =
                        daeDatEntity[mappedPosition.entity].slice(-1)[0];

                      const isNewItem = 
                        !lastItem ||
                        ( 
                          (
                            !!lastItem.nr1 && 
                            (
                              lastItem.nr1 !== goodObject.nr1 &&
                              lastItem.nr1 !== goodObject.nr2
                            )
                          )
                          ||
                          (
                            !!lastItem.nr2 && 
                            (
                              lastItem.nr2 !== goodObject.nr1 &&
                              lastItem.nr2 !== goodObject.nr2
                            )
                          )
                        )

                      if (isNewItem)
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

      const accountingStatementMapped = this.map(daeDatEntity);
      return accountingStatementMapped;
    } catch (error) {
      throw new Error('Error parsing PDF:' + error); // Returning an empty object
    }
  }
}
export default DaeDatPDFConverter;
