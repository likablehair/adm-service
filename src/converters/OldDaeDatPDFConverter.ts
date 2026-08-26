import PDFParser from 'pdf2json';
import { DeclarationRawJson } from './PDFConverter';
import { _cells } from './OldDaeDatCellsMapper';
import {
  columnsInReadingOrder,
  convertArrayToString,
  convertAsterisksToZero,
  parseDecimal,
} from 'src/utils/values';
import { validateDaeDat } from 'src/validation/documents';
import { ValidationOptions } from 'src/validation/validator';
import { ValidationIssue } from 'src/validation/errors';
import { documentCodeList } from 'src/utils/documentCodes';

export type OldDaeDatStatementMapped = {
  consignee: {
    companyName: string;
    companyAddress: string;
    postalCode: string;
    city: string;
    country: string;
  };
  type: string;
  customsExitOffice: string;
  totalPackages: number | undefined;
  totalGrossWeight: number | undefined;
  totalStatisticValue: number;
  releaseDate: string;
  releaseCode: string;
  transitNetworkCountry: string;
  transportMode: number;
  goods: {
    nr: string;
    customsRegime: string;
    requestedRegime: string;
    previousRegime: string;
    statisticValue: number | undefined;
    netWeight: number | undefined;
    ncCode: string;
    description: string;
    identificationCode: string;
    documents: { code: string; identifier: string }[];
  }[];
  validationIssues?: ValidationIssue[];
};

export interface OldDaeDatJson {
  statement: {
    type: string;
    releaseDate: string;
    customsExitOffice: string;
    totalGrossWeight: string;
    totalPackages1: string;
    totalPackages2: string;
    totalPackages3: string;
    releaseCode1: string;
    releaseCode2: string;
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
    transitNetworkCountry13: string;
    transitNetworkCountry14: string;
    transitNetworkCountry15: string;
    transitNetworkCountry16: string;
    transitNetworkCountry17: string;
    transitNetworkCountry18: string;
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
    pageMarker1: string;
    pageMarker2: string;
    pageMarker3: string;
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
    statisticValue15: string;
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
    netWeight14: string;
    netWeight15: string;
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
    customsRegime8: string;
    customsRegime9: string;
    customsRegime10: string;
    customsRegime11: string;
    customsRegime12: string;
    customsRegime13: string;
    customsRegime14: string;
    customsRegime15: string;
    codeIdentifier: string;
  }[];
}

const GOOD_DESCRIPTION_COLUMNS = columnsInReadingOrder(
  _cells,
  'goods',
  'description',
);

const GOOD_NET_WEIGHT_COLUMNS = columnsInReadingOrder(
  _cells,
  'goods',
  'netWeight',
);

class OldDaeDatPDFConverter {
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
      if (isMappingDocuments || _cells[cell].column != 'codeIdentifier') {
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
    input: OldDaeDatJson,
    numberOfGoodsPages: number = 0,
    options?: ValidationOptions,
  ): OldDaeDatStatementMapped {
    const type = input.statement.type?.trim() || '';

    const releaseDate = input.statement.releaseDate?.trim() || '';

    const totalPackages = parseDecimal(
      input.statement.totalPackages1?.trim() ||
        input.statement.totalPackages2?.trim() ||
        input.statement.totalPackages3?.trim() ||
        '',
    );

    const totalGrossWeight = parseDecimal(input.statement.totalGrossWeight);

    const customsExitOffice = input.statement.customsExitOffice?.trim() || '';

    const releaseCode =
      input.statement.releaseCode1?.trim() ||
      input.statement.releaseCode2?.trim() ||
      '';

    const companyName = input.consignee.companyName?.trim() || '';

    const companyAddress = input.consignee.companyAddress?.trim() || '';

    const postalCode = input.consignee.postalCode?.trim() || '';

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
      input.statement.transitNetworkCountry13?.trim() ||
      input.statement.transitNetworkCountry14?.trim() ||
      input.statement.transitNetworkCountry15?.trim() ||
      input.statement.transitNetworkCountry16?.trim() ||
      input.statement.transitNetworkCountry17?.trim() ||
      input.statement.transitNetworkCountry18?.trim() ||
      '';

    const goods = input.goods.map((good, index) => {
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
        good.statisticValue14?.trim() ||
        good.statisticValue15?.trim() ||
        '';

      const netWeight =
        GOOD_NET_WEIGHT_COLUMNS.map(
          (column) => (good as unknown as Record<string, string>)[column],
        )
          .map((value) => value?.trim())
          .filter((value) => !!value)
          .slice(-1)[0] ?? '';

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

      const description = GOOD_DESCRIPTION_COLUMNS.map(
        (column) => (good as unknown as Record<string, string>)[column],
      );

      let customsRegime =
        good.customsRegime1?.trim() ||
        good.customsRegime2?.trim() ||
        good.customsRegime3?.trim() ||
        good.customsRegime4?.trim() ||
        good.customsRegime5?.trim() ||
        good.customsRegime6?.trim() ||
        good.customsRegime7?.trim() ||
        good.customsRegime8?.trim() ||
        good.customsRegime9?.trim() ||
        good.customsRegime10?.trim() ||
        good.customsRegime11?.trim() ||
        good.customsRegime12?.trim() ||
        good.customsRegime13?.trim() ||
        good.customsRegime14?.trim() ||
        good.customsRegime15?.trim() ||
        '';

      const requestedRegime = customsRegime.slice(0, 2).trim();

      const previousRegime = customsRegime.slice(-2).trim();

      customsRegime = `${requestedRegime}${previousRegime}`;

      const statisticValue = parseDecimal(statisticValueString);
      const nr = String(index + 1);

      const documents = this.convertDocumentsStringToArray(good.codeIdentifier);

      const formattedDocuments: { code: string; identifier: string }[] =
        documents.map((doc) => {
          const documentCode = doc.split(/[ ]?-(.*)/).map((el) => el.trim());

          const code = documentCode[0];
          let identifier = documentCode[1];

          if (identifier) {
            identifier = identifier.replace(/( \/|\/)$/, '').trim();
          }

          return {
            code,
            identifier: !identifier || identifier === '' ? '-' : identifier,
          };
        });

      return {
        nr,
        documentsSource: good.codeIdentifier,
        customsRegime,
        requestedRegime,
        previousRegime,
        statisticValue,
        netWeight: parseDecimal(
          convertAsterisksToZero({ netWeight }).netWeight,
        ),
        ncCode,
        identificationCode,
        description: convertArrayToString(description),
        documents: formattedDocuments,
      };
    });

    if (numberOfGoodsPages !== goods.length) {
      throw new Error('Missing mapping for goods');
    }

    if (goods.some((g) => !g.ncCode)) {
      throw new Error('Missing NC Code for goods');
    }

    if (!type || type == '') {
      throw new Error('Missing declaration type');
    }

    if (goods.length === 0) {
      throw new Error('No article was extracted from the declaration');
    }

    const totalStatisticValue =
      Math.round(
        goods.reduce((acc, good) => acc + (good.statisticValue ?? 0), 0) * 100,
      ) / 100;

    const validationIssues = validateDaeDat(
      {
        type,
        releaseDate,
        releaseCode,
        customsExitOffice,
        totalPackages,
        totalGrossWeight,
        totalStatisticValue,
        transitNetworkCountry,
        transportMode: Number(transportMode),
        consignee: {
          companyName,
          companyAddress,
          postalCode,
          city,
          country,
        },
        goods,
      },
      { ...options, layout: 'old' },
    );

    return convertAsterisksToZero({
      type,
      releaseDate,
      totalPackages,
      totalGrossWeight,
      customsExitOffice,
      totalStatisticValue,
      releaseCode,
      transitNetworkCountry,
      transportMode: Number(transportMode),
      validationIssues,
      consignee: {
        companyName,
        companyAddress,
        postalCode: postalCode == '*' ? '' : postalCode,
        city: city == '*' ? '' : city,
        country,
      },
      goods,
    });
  }

  private convertDocumentsStringToArray(documentString: string): string[] {
    const docCodes = documentCodeList.map((doc) => this.escapeRegExp(doc.code));
    const joinedDocCodes = docCodes.join('|');
    const regex = new RegExp(
      `(${joinedDocCodes})\\s*-\\s*.*?(?=\\s*(?:${joinedDocCodes})\\b|\\s*$)`,
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
    validation?: ValidationOptions;
  }): Promise<OldDaeDatStatementMapped> {
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
      const daeDatEntity: any = {
        statement: {},
        consignee: {},
      };

      let pagesNumber: number = 0;
      if (!!declarationRawJson && declarationRawJson.Pages) {
        const pages = declarationRawJson.Pages;
        pagesNumber = pages.length;

        for (let i = 0; i < pages.length; i++) {
          let isMappingDocuments: boolean = false;
          let countDocumentPosition: number = 0;

          const page = pages[i];
          if (page.Texts) {
            const goodObject: any = {};

            const totalNumberOfDocumentPositions: number =
              i === 0
                ? 0
                : page.Texts.filter((textElement: any) => {
                    return textElement.x === 1.125;
                  }).length;

            for (let j = 0; j < page.Texts.length; j++) {
              const textElement = page.Texts[j];
              const text = decodeURIComponent(textElement.R[0].T);

              // if (i == 0) {
              //   console.log({ x: textElement.x, y: textElement.y, text: text });
              // }

              //console.log({ "page": i + 1, "x": textElement.x, "y": textElement.y, "text": text })

              if (textElement.x === 1.125 && i > 0) {
                countDocumentPosition += 1;
              }

              if (countDocumentPosition > 0 && textElement.x === 1.125) {
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
                if (i > 0) {
                  if (!daeDatEntity[mappedPosition.entity])
                    daeDatEntity[mappedPosition.entity] = [];

                  if (Array.isArray(daeDatEntity[mappedPosition.entity])) {
                    if (mappedPosition.column === 'codeIdentifier') {
                      if (
                        countDocumentPosition < totalNumberOfDocumentPositions
                      ) {
                        if (!goodObject[mappedPosition.column]) {
                          goodObject[mappedPosition.column] = text.trim();
                        } else {
                          goodObject[mappedPosition.column] += text.trim();
                        }
                      }
                    } else {
                      goodObject[mappedPosition.column] = text.trim();
                    }

                    const lastItem =
                      daeDatEntity[mappedPosition.entity].slice(-1)[0];

                    const markers = [
                      goodObject.pageMarker1,
                      goodObject.pageMarker2,
                      goodObject.pageMarker3,
                    ];

                    const isNewItem =
                      !lastItem ||
                      [
                        lastItem.pageMarker1,
                        lastItem.pageMarker2,
                        lastItem.pageMarker3,
                      ].some((marker) => !!marker && !markers.includes(marker));

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

      const accountingStatementMapped = this.map(
        daeDatEntity,
        pagesNumber - 1,
        params.validation,
      );

      await cleanUp();
      return accountingStatementMapped;
    } catch (error) {
      await cleanUp();
      throw new Error('parsing PDF DAE/DAT:' + error); // Returning an empty object
    }
  }
}
export default OldDaeDatPDFConverter;
