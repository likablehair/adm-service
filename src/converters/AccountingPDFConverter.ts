import { _cells } from './AccountingCellsMapper';
import PDFParser from 'pdf2json';
import { DeclarationRawJson } from './PDFConverter';

export type AccountingStatementMapped = {
  version: string;
  totalDuties: number;
  totalTaxes: number;
  totalVat: number;
  vatExemption: boolean;
  vatExemptionValue: number | undefined;
  taxB00Vat22: number | undefined;
  taxB00Vat04: number | undefined;
  taxB00Vat10: number | undefined;
  tax931: number | undefined;
  tax123: number | undefined;
  totalSeaTaxes: number | undefined;
  rectificationOrCancellationDate: string;
};

export interface AccountingJson {
  statement: {
    version: string;
    rectificationOrCancellationDate1: string;
    rectificationOrCancellationDate2: string;
    rectificationOrCancellationDate3: string;
    totalDuties1: string;
    totalDuties2: string;
    totalDuties3: string;
    totalDuties4: string;
    totalDuties5: string;
    totalDuties6: string;
    totalDuties7: string;
    totalDuties8: string;
    totalDuties9: string;
    totalDuties10: string;
    totalDuties11: string;
    totalDuties12: string;
    totalDuties13: string;
    totalDuties14: string;
    totalDuties15: string;
    totalDuties16: string;
    totalDuties17: string;
    totalDuties18: string;
    totalDuties19: string;
    totalDuties20: string;
    totalTaxes1: string;
    totalTaxes2: string;
    totalTaxes3: string;
    totalTaxes4: string;
    totalTaxes5: string;
    totalTaxes6: string;
    totalTaxes7: string;
    totalTaxes8: string;
    totalTaxes9: string;
    totalTaxes10: string;
    totalVat1: string;
    totalVat2: string;
    totalVat3: string;
    totalVat4: string;
    totalVat5: string;
    totalVat6: string;
    totalVat7: string;
    totalVat8: string;
    totalVat9: string;
    totalVat10: string;
  };
  taxes: {
    tribute1: string;
    value1: string;
    tribute2: string;
    value2: string;
    tribute3: string;
    value3: string;
    tribute4: string;
    value4: string;
    tribute5: string;
    value5: string;
    tribute6: string;
    value6: string;
    tribute7: string;
    value7: string;
  };
  vat: {
    tribute1: string;
    value1: string;
    rate1: string;
    tribute2: string;
    value2: string;
    rate2: string;
    tribute3: string;
    value3: string;
    rate3: string;
    tribute4: string;
    value4: string;
    rate4: string;
    tribute5: string;
    value5: string;
    rate5: string;
    tribute6: string;
    value6: string;
    rate6: string;
    tribute7: string;
    value7: string;
    rate7: string;
    tribute8: string;
    value8: string;
    rate8: string;
    tribute9: string;
    value9: string;
    rate9: string;
    tribute10: string;
    value10: string;
    rate10: string;
    tribute11: string;
    value11: string;
    rate11: string;
    tribute12: string;
    value12: string;
    rate12: string;
    tribute13: string;
    value13: string;
    rate13: string;
    tribute14: string;
    value14: string;
    rate14: string;
    tribute15: string;
    value15: string;
    rate15: string;
    tribute16: string;
    value16: string;
    rate16: string;
    tribute17: string;
    value17: string;
    rate17: string;
    tribute18: string;
    value18: string;
    rate18: string;
    tribute19: string;
    value19: string;
    rate19: string;
    tribute20: string;
    value20: string;
    rate20: string;
    tribute21: string;
    value21: string;
    rate21: string;
    tribute22: string;
    value22: string;
    rate22: string;
    tribute23: string;
    value23: string;
    rate23: string;
    tribute24: string;
    value24: string;
    rate24: string;
    tribute25: string;
    value25: string;
    rate25: string;
    tribute26: string;
    value26: string;
    rate26: string;
    tribute27: string;
    value27: string;
    rate27: string;
    tribute28: string;
    value28: string;
    rate28: string;
    tribute29: string;
    value29: string;
    rate29: string;
  };
}

class AccountingPDFConverter {
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
    input: AccountingJson,
    seaTaxCodes: string[],
  ): AccountingStatementMapped {
    const version: string = input.statement.version || '';

    const rectificationOrCancellationDate: string =
      input.statement.rectificationOrCancellationDate1 ||
      input.statement.rectificationOrCancellationDate2 ||
      input.statement.rectificationOrCancellationDate3 ||
      '';

    const totalDutiesString =
      input.statement.totalDuties1?.trim() ||
      input.statement.totalDuties2?.trim() ||
      input.statement.totalDuties3?.trim() ||
      input.statement.totalDuties4?.trim() ||
      input.statement.totalDuties5?.trim() ||
      input.statement.totalDuties6?.trim() ||
      input.statement.totalDuties7?.trim() ||
      input.statement.totalDuties8?.trim() ||
      input.statement.totalDuties9?.trim() ||
      input.statement.totalDuties10?.trim() ||
      input.statement.totalDuties11?.trim() ||
      input.statement.totalDuties12?.trim() ||
      input.statement.totalDuties13?.trim() ||
      input.statement.totalDuties14?.trim() ||
      input.statement.totalDuties15?.trim() ||
      input.statement.totalDuties16?.trim() ||
      input.statement.totalDuties17?.trim() ||
      input.statement.totalDuties18?.trim() ||
      input.statement.totalDuties19?.trim() ||
      input.statement.totalDuties20?.trim() ||
      '';

    const totalDuties =
      totalDutiesString != ''
        ? Number(Number(totalDutiesString.replace(',', '.')).toFixed(2))
        : undefined;

    const totalTaxesString =
      input.statement.totalTaxes1?.trim() ||
      input.statement.totalTaxes2?.trim() ||
      input.statement.totalTaxes3?.trim() ||
      input.statement.totalTaxes4?.trim() ||
      input.statement.totalTaxes5?.trim() ||
      input.statement.totalTaxes6?.trim() ||
      input.statement.totalTaxes7?.trim() ||
      input.statement.totalTaxes8?.trim() ||
      input.statement.totalTaxes9?.trim() ||
      input.statement.totalTaxes10?.trim() ||
      '';

    const totalTaxes =
      totalTaxesString != ''
        ? Number(Number(totalTaxesString.replace(',', '.')).toFixed(2))
        : undefined;

    const totalVatString =
      input.statement.totalVat1?.trim() ||
      input.statement.totalVat2?.trim() ||
      input.statement.totalVat3?.trim() ||
      input.statement.totalVat4?.trim() ||
      input.statement.totalVat5?.trim() ||
      input.statement.totalVat6?.trim() ||
      input.statement.totalVat7?.trim() ||
      input.statement.totalVat8?.trim() ||
      input.statement.totalVat9?.trim() ||
      input.statement.totalVat10?.trim() ||
      '';

    const totalVat =
      totalVatString != ''
        ? Number(Number(totalVatString.replace(',', '.')).toFixed(2))
        : undefined;

    const vatLiquidation: { tribute: string; value: string; rate: string }[] = [
      {
        tribute: input.vat?.tribute1 || '',
        value: input.vat?.value1 || '',
        rate: input.vat?.rate1 || '',
      },
      {
        tribute: input.vat?.tribute2 || '',
        value: input.vat?.value2 || '',
        rate: input.vat?.rate2 || '',
      },
      {
        tribute: input.vat?.tribute3 || '',
        value: input.vat?.value3 || '',
        rate: input.vat?.rate3 || '',
      },
      {
        tribute: input.vat?.tribute3 || '',
        value: input.vat?.value3 || '',
        rate: input.vat?.rate3 || '',
      },
      {
        tribute: input.vat?.tribute4 || '',
        value: input.vat?.value4 || '',
        rate: input.vat?.rate4 || '',
      },
      {
        tribute: input.vat?.tribute5 || '',
        value: input.vat?.value5 || '',
        rate: input.vat?.rate5 || '',
      },
      {
        tribute: input.vat?.tribute6 || '',
        value: input.vat?.value6 || '',
        rate: input.vat?.rate6 || '',
      },
      {
        tribute: input.vat?.tribute7 || '',
        value: input.vat?.value7 || '',
        rate: input.vat?.rate7 || '',
      },
      {
        tribute: input.vat?.tribute8 || '',
        value: input.vat?.value8 || '',
        rate: input.vat?.rate8 || '',
      },
      {
        tribute: input.vat?.tribute9 || '',
        value: input.vat?.value9 || '',
        rate: input.vat?.rate9 || '',
      },
      {
        tribute: input.vat?.tribute10 || '',
        value: input.vat?.value10 || '',
        rate: input.vat?.rate10 || '',
      },
      {
        tribute: input.vat?.tribute11 || '',
        value: input.vat?.value11 || '',
        rate: input.vat?.rate11 || '',
      },
      {
        tribute: input.vat?.tribute12 || '',
        value: input.vat?.value12 || '',
        rate: input.vat?.rate12 || '',
      },
      {
        tribute: input.vat?.tribute13 || '',
        value: input.vat?.value13 || '',
        rate: input.vat?.rate13 || '',
      },
      {
        tribute: input.vat?.tribute14 || '',
        value: input.vat?.value14 || '',
        rate: input.vat?.rate14 || '',
      },
      {
        tribute: input.vat?.tribute15 || '',
        value: input.vat?.value15 || '',
        rate: input.vat?.rate15 || '',
      },
      {
        tribute: input.vat?.tribute16 || '',
        value: input.vat?.value16 || '',
        rate: input.vat?.rate16 || '',
      },
      {
        tribute: input.vat?.tribute17 || '',
        value: input.vat?.value17 || '',
        rate: input.vat?.rate17 || '',
      },
      {
        tribute: input.vat?.tribute18 || '',
        value: input.vat?.value18 || '',
        rate: input.vat?.rate18 || '',
      },
      {
        tribute: input.vat?.tribute19 || '',
        value: input.vat?.value19 || '',
        rate: input.vat?.rate19 || '',
      },
      {
        tribute: input.vat?.tribute20 || '',
        value: input.vat?.value20 || '',
        rate: input.vat?.rate20 || '',
      },
      {
        tribute: input.vat?.tribute21 || '',
        value: input.vat?.value21 || '',
        rate: input.vat?.rate21 || '',
      },
      {
        tribute: input.vat?.tribute22 || '',
        value: input.vat?.value22 || '',
        rate: input.vat?.rate22 || '',
      },
      {
        tribute: input.vat?.tribute23 || '',
        value: input.vat?.value23 || '',
        rate: input.vat?.rate23 || '',
      },
      {
        tribute: input.vat?.tribute24 || '',
        value: input.vat?.value24 || '',
        rate: input.vat?.rate24 || '',
      },
      {
        tribute: input.vat?.tribute25 || '',
        value: input.vat?.value25 || '',
        rate: input.vat?.rate25 || '',
      },
      {
        tribute: input.vat?.tribute26 || '',
        value: input.vat?.value26 || '',
        rate: input.vat?.rate26 || '',
      },
      {
        tribute: input.vat?.tribute27 || '',
        value: input.vat?.value27 || '',
        rate: input.vat?.rate27 || '',
      },
      {
        tribute: input.vat?.tribute28 || '',
        value: input.vat?.value28 || '',
        rate: input.vat?.rate28 || '',
      },
      {
        tribute: input.vat?.tribute29 || '',
        value: input.vat?.value29 || '',
        rate: input.vat?.rate29 || '',
      },
    ];

    const vatExemption = vatLiquidation.find((il) => il.tribute == '406');

    const vatExemptionValue = vatExemption
      ? Number(Number(vatExemption.value.replace(',', '.')).toFixed(2))
      : undefined;

    const taxB00Vat22Liquidation = vatLiquidation.find(
      (il) => il.tribute == 'B00' && (il.rate == '22,00' || il.rate == '0,22'),
    );

    const taxB00Vat22 = taxB00Vat22Liquidation
      ? Number(
          Number(taxB00Vat22Liquidation.value.replace(',', '.')).toFixed(2),
        )
      : undefined;

    const taxB00Vat10Liquidation = vatLiquidation.find(
      (il) => il.tribute == 'B00' && (il.rate == '10,00' || il.rate == '0,10'),
    );

    const taxB00Vat10 = taxB00Vat10Liquidation
      ? Number(
          Number(taxB00Vat10Liquidation.value.replace(',', '.')).toFixed(2),
        )
      : undefined;

    const taxB00Vat04Liquidation = vatLiquidation.find(
      (il) => il.tribute == 'B00' && (il.rate == '4,00' || il.rate == '0,04'),
    );

    const taxB00Vat04 = taxB00Vat04Liquidation
      ? Number(Number(taxB00Vat04Liquidation.value.replace(',', '.')).toFixed(2))
      : undefined;

    const taxLiquidation: { tribute: string; value: string }[] = [
      {
        tribute: input.taxes?.tribute1 || '',
        value: input.taxes?.value1 || '',
      },
      {
        tribute: input.taxes?.tribute2 || '',
        value: input.taxes?.value2 || '',
      },
      {
        tribute: input.taxes?.tribute3 || '',
        value: input.taxes?.value3 || '',
      },
      {
        tribute: input.taxes?.tribute4 || '',
        value: input.taxes?.value4 || '',
      },
      {
        tribute: input.taxes?.tribute5 || '',
        value: input.taxes?.value5 || '',
      },
      {
        tribute: input.taxes?.tribute6 || '',
        value: input.taxes?.value6 || '',
      },
      {
        tribute: input.taxes?.tribute7 || '',
        value: input.taxes?.value7 || '',
      },
    ];

    const tax931Liquidation = taxLiquidation.find((il) => il.tribute == '931');

    const tax931 = tax931Liquidation
      ? Number(Number(tax931Liquidation.value.replace(',', '.')).toFixed(2))
      : undefined;

    const tax123Liquidation = taxLiquidation.find((il) => il.tribute == '123');

    const tax123 = tax123Liquidation
      ? Number(Number(tax123Liquidation.value.replace(',', '.')).toFixed(2))
      : undefined;

    const seaTaxLiquidation = taxLiquidation.filter((il) =>
      seaTaxCodes.includes(il.tribute),
    );

    let totalSeaTaxes: number | undefined = Number(
      seaTaxLiquidation
        .reduce((acc, tax) => {
          return (acc += Number(
            Number(tax.value.replace(',', '.')).toFixed(2),
          ));
        }, 0)
        .toFixed(2),
    );

    if (totalSeaTaxes == 0) {
      totalSeaTaxes = undefined;
    }

    if (totalDuties == undefined) {
      throw new Error('Missing total duties');
    }

    if (totalVat == undefined) {
      throw new Error('Missing total vat');
    }

    if (totalTaxes == undefined) {
      throw new Error('Missing total taxes');
    }

    if (
      taxB00Vat22 == undefined &&
      taxB00Vat10 == undefined &&
      taxB00Vat04 == undefined
    ) {
      throw new Error('Missing VAT tax');
    }

    return {
      rectificationOrCancellationDate,
      version,
      totalDuties,
      totalTaxes,
      totalVat,
      vatExemption: !!vatExemption,
      vatExemptionValue,
      taxB00Vat22,
      taxB00Vat10,
      taxB00Vat04,
      tax931,
      tax123,
      totalSeaTaxes,
    };
  }
  public async run(params: {
    data: {
      path: string;
      seaTaxCodes: string[];
    };
  }): Promise<AccountingStatementMapped> {
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
      const accountingEntity: any = {
        statement: {},
      };

      if (!!declarationRawJson && declarationRawJson.Pages) {
        const pages = declarationRawJson.Pages;

        for (let i = 0; i < pages.length; i++) {
          const page = pages[i];
          if (page.Texts) {
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
                if (!accountingEntity[mappedPosition.entity])
                  accountingEntity[mappedPosition.entity] = {};
                accountingEntity[mappedPosition.entity][mappedPosition.column] =
                  text.trim();
              }
            }
          }
        }
      } else {
        throw new Error('No Pages found in the PDF.');
      }

      const accountingStatementMapped = this.map(
        accountingEntity,
        params.data.seaTaxCodes,
      );
      return accountingStatementMapped;
    } catch (error) {
      throw new Error('parsing PDF Accounting:' + error); // Returning an empty object
    }
  }
}
export default AccountingPDFConverter;
