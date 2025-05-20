import { _cells } from './AccountingCellsMapper';
import PDFParser from 'pdf2json';
import { DeclarationRawJson } from './PDFConverter';
import * as fsPromises from 'fs/promises';
import { createId } from '@paralleldrive/cuid2';

export type AccountingStatementMapped = {
  version: string;
  totalDuties: number;
  totalTaxes: number;
  totalVatToBePaid: number;
  vatExemption: boolean;
  vatExemptionValue: number | undefined;
  vatExemptionTaxableValue: number | undefined;
  letterOfIntent: string | undefined;
  taxB00Vat22: number | undefined;
  taxB00Vat04: number | undefined;
  taxB00Vat10: number | undefined;
  tax931: number | undefined;
  tax123: number | undefined;
  taxA30: number | undefined;
  taxA35: number | undefined;
  totalSeaTaxes: number | undefined;
  rectificationOrCancellationDate: string;
  documents: {
    code: string;
    identifier: string;
  }[];
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
    totalDuties21: string;
    totalDuties22: string;
    totalDuties23: string;
    totalDuties24: string;
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
    totalTaxes11: string;
    totalTaxes12: string;
    totalTaxes13: string;
    totalTaxes14: string;
    totalTaxes15: string;
    totalTaxes16: string;
    totalTaxes17: string;
    totalTaxes18: string;
    totalTaxes19: string;
    totalTaxes20: string;
    totalTaxes21: string;
    totalTaxes22: string;
    totalTaxes23: string;
    totalTaxes24: string;
    totalTaxes25: string;
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
    totalVat11: string;
    totalVat12: string;
    totalVat13: string;
    totalVat14: string;
    totalVat15: string;
    totalVat16: string;
    totalVat17: string;
    totalVat18: string;
    totalVat19: string;
    totalVat20: string;
    totalVat21: string;
    totalVat22: string;
    totalVat23: string;
    totalVat24: string;
    totalVat25: string;
    totalVat26: string;
    totalVat27: string;
  };
  documents: {
    code: string;
    identifier: string;
    country: string;
    year: string;
  }[];
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
    tribute8: string;
    value8: string;
    tribute9: string;
    value9: string;
    tribute10: string;
    value10: string;
    tribute11: string;
    value11: string;
    tribute12: string;
    value12: string;
    tribute13: string;
    value13: string;
  };
  vat: {
    tribute1: string;
    value1: string;
    taxableValue1: string;
    rate1: string;
    letterOfIntent1: string;
    tribute2: string;
    value2: string;
    taxableValue2: string;
    rate2: string;
    letterOfIntent2: string;
    tribute3: string;
    value3: string;
    taxableValue3: string;
    rate3: string;
    letterOfIntent3: string;
    tribute4: string;
    value4: string;
    taxableValue4: string;
    rate4: string;
    letterOfIntent4: string;
    tribute5: string;
    value5: string;
    taxableValue5: string;
    rate5: string;
    letterOfIntent5: string;
    tribute6: string;
    value6: string;
    taxableValue6: string;
    rate6: string;
    letterOfIntent6: string;
    tribute7: string;
    value7: string;
    taxableValue7: string;
    rate7: string;
    letterOfIntent7: string;
    tribute8: string;
    value8: string;
    taxableValue8: string;
    rate8: string;
    letterOfIntent8: string;
    tribute9: string;
    value9: string;
    taxableValue9: string;
    rate9: string;
    letterOfIntent9: string;
    tribute10: string;
    value10: string;
    taxableValue10: string;
    rate10: string;
    letterOfIntent10: string;
    tribute11: string;
    value11: string;
    taxableValue11: string;
    rate11: string;
    letterOfIntent11: string;
    tribute12: string;
    value12: string;
    taxableValue12: string;
    rate12: string;
    letterOfIntent12: string;
    tribute13: string;
    value13: string;
    taxableValue13: string;
    rate13: string;
    letterOfIntent13: string;
    tribute14: string;
    value14: string;
    taxableValue14: string;
    rate14: string;
    letterOfIntent14: string;
    tribute15: string;
    value15: string;
    taxableValue15: string;
    rate15: string;
    letterOfIntent15: string;
    tribute16: string;
    value16: string;
    taxableValue16: string;
    rate16: string;
    letterOfIntent16: string;
    tribute17: string;
    value17: string;
    taxableValue17: string;
    rate17: string;
    letterOfIntent17: string;
    tribute18: string;
    value18: string;
    taxableValue18: string;
    rate18: string;
    letterOfIntent18: string;
    tribute19: string;
    value19: string;
    taxableValue19: string;
    rate19: string;
    letterOfIntent19: string;
    tribute20: string;
    value20: string;
    taxableValue20: string;
    rate20: string;
    letterOfIntent20: string;
    tribute21: string;
    value21: string;
    taxableValue21: string;
    rate21: string;
    letterOfIntent21: string;
    tribute22: string;
    value22: string;
    taxableValue22: string;
    rate22: string;
    letterOfIntent22: string;
    tribute23: string;
    value23: string;
    taxableValue23: string;
    rate23: string;
    letterOfIntent23: string;
    tribute24: string;
    value24: string;
    taxableValue24: string;
    rate24: string;
    letterOfIntent24: string;
    tribute25: string;
    value25: string;
    taxableValue25: string;
    rate25: string;
    letterOfIntent25: string;
    tribute26: string;
    value26: string;
    taxableValue26: string;
    rate26: string;
    letterOfIntent26: string;
    tribute27: string;
    value27: string;
    taxableValue27: string;
    rate27: string;
    letterOfIntent27: string;
    tribute28: string;
    value28: string;
    taxableValue28: string;
    rate28: string;
    letterOfIntent28: string;
    tribute29: string;
    value29: string;
    taxableValue29: string;
    rate29: string;
    letterOfIntent29: string;
    tribute30: string;
    value30: string;
    taxableValue30: string;
    rate30: string;
    letterOfIntent30: string;
    tribute31: string;
    value31: string;
    taxableValue31: string;
    rate31: string;
    letterOfIntent31: string;
    tribute32: string;
    value32: string;
    taxableValue32: string;
    rate32: string;
    letterOfIntent32: string;
    tribute33: string;
    value33: string;
    taxableValue33: string;
    rate33: string;
    letterOfIntent33: string;
    tribute34: string;
    value34: string;
    taxableValue34: string;
    rate34: string;
    letterOfIntent34: string;
    tribute35: string;
    value35: string;
    taxableValue35: string;
    rate35: string;
    letterOfIntent35: string;
  };
}

class AccountingPDFConverter {
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
    input: AccountingJson,
    seaTaxCodes: string[],
    documentsNumber: number,
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
      input.statement.totalDuties21?.trim() ||
      input.statement.totalDuties22?.trim() ||
      input.statement.totalDuties23?.trim() ||
      input.statement.totalDuties24?.trim() ||
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
      input.statement.totalTaxes11?.trim() ||
      input.statement.totalTaxes12?.trim() ||
      input.statement.totalTaxes13?.trim() ||
      input.statement.totalTaxes14?.trim() ||
      input.statement.totalTaxes15?.trim() ||
      input.statement.totalTaxes16?.trim() ||
      input.statement.totalTaxes17?.trim() ||
      input.statement.totalTaxes18?.trim() ||
      input.statement.totalTaxes19?.trim() ||
      input.statement.totalTaxes20?.trim() ||
      input.statement.totalTaxes21?.trim() ||
      input.statement.totalTaxes22?.trim() ||
      input.statement.totalTaxes23?.trim() ||
      input.statement.totalTaxes24?.trim() ||
      input.statement.totalTaxes25?.trim() ||
      '';

    const totalTaxes =
      totalTaxesString != ''
        ? Number(Number(totalTaxesString.replace(',', '.')).toFixed(2))
        : undefined;

    const totalVatToBePaidString =
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
      input.statement.totalVat11?.trim() ||
      input.statement.totalVat12?.trim() ||
      input.statement.totalVat13?.trim() ||
      input.statement.totalVat14?.trim() ||
      input.statement.totalVat15?.trim() ||
      input.statement.totalVat16?.trim() ||
      input.statement.totalVat17?.trim() ||
      input.statement.totalVat18?.trim() ||
      input.statement.totalVat19?.trim() ||
      input.statement.totalVat20?.trim() ||
      input.statement.totalVat21?.trim() ||
      input.statement.totalVat22?.trim() ||
      input.statement.totalVat23?.trim() ||
      input.statement.totalVat24?.trim() ||
      input.statement.totalVat25?.trim() ||
      input.statement.totalVat26?.trim() ||
      input.statement.totalVat27?.trim() ||
      '';

    const totalVatToBePaid =
      totalVatToBePaidString != ''
        ? Number(Number(totalVatToBePaidString.replace(',', '.')).toFixed(2))
        : undefined;

    const vatLiquidation: {
      tribute: string;
      value: string;
      taxableValue: string;
      rate: string;
      letterOfIntent: string;
    }[] = [
      {
        tribute: input.vat?.tribute1 || '',
        value: input.vat?.value1 || '',
        taxableValue: input.vat?.taxableValue1 || '',
        rate: input.vat?.rate1 || '',
        letterOfIntent: input.vat?.letterOfIntent1 || '',
      },
      {
        tribute: input.vat?.tribute2 || '',
        value: input.vat?.value2 || '',
        taxableValue: input.vat?.taxableValue2 || '',
        rate: input.vat?.rate2 || '',
        letterOfIntent: input.vat?.letterOfIntent2 || '',
      },
      {
        tribute: input.vat?.tribute3 || '',
        value: input.vat?.value3 || '',
        taxableValue: input.vat?.taxableValue3 || '',
        rate: input.vat?.rate3 || '',
        letterOfIntent: input.vat?.letterOfIntent3 || '',
      },
      {
        tribute: input.vat?.tribute4 || '',
        value: input.vat?.value4 || '',
        taxableValue: input.vat?.taxableValue4 || '',
        rate: input.vat?.rate4 || '',
        letterOfIntent: input.vat?.letterOfIntent4 || '',
      },
      {
        tribute: input.vat?.tribute5 || '',
        value: input.vat?.value5 || '',
        taxableValue: input.vat?.taxableValue5 || '',
        rate: input.vat?.rate5 || '',
        letterOfIntent: input.vat?.letterOfIntent5 || '',
      },
      {
        tribute: input.vat?.tribute6 || '',
        value: input.vat?.value6 || '',
        taxableValue: input.vat?.taxableValue6 || '',
        rate: input.vat?.rate6 || '',
        letterOfIntent: input.vat?.letterOfIntent6 || '',
      },
      {
        tribute: input.vat?.tribute7 || '',
        value: input.vat?.value7 || '',
        taxableValue: input.vat?.taxableValue7 || '',
        rate: input.vat?.rate7 || '',
        letterOfIntent: input.vat?.letterOfIntent7 || '',
      },
      {
        tribute: input.vat?.tribute8 || '',
        value: input.vat?.value8 || '',
        taxableValue: input.vat?.taxableValue8 || '',
        rate: input.vat?.rate8 || '',
        letterOfIntent: input.vat?.letterOfIntent8 || '',
      },
      {
        tribute: input.vat?.tribute9 || '',
        value: input.vat?.value9 || '',
        taxableValue: input.vat?.taxableValue9 || '',
        rate: input.vat?.rate9 || '',
        letterOfIntent: input.vat?.letterOfIntent9 || '',
      },
      {
        tribute: input.vat?.tribute10 || '',
        value: input.vat?.value10 || '',
        taxableValue: input.vat?.taxableValue10 || '',
        rate: input.vat?.rate10 || '',
        letterOfIntent: input.vat?.letterOfIntent10 || '',
      },
      {
        tribute: input.vat?.tribute11 || '',
        value: input.vat?.value11 || '',
        taxableValue: input.vat?.taxableValue11 || '',
        rate: input.vat?.rate11 || '',
        letterOfIntent: input.vat?.letterOfIntent11 || '',
      },
      {
        tribute: input.vat?.tribute12 || '',
        value: input.vat?.value12 || '',
        taxableValue: input.vat?.taxableValue12 || '',
        rate: input.vat?.rate12 || '',
        letterOfIntent: input.vat?.letterOfIntent12 || '',
      },
      {
        tribute: input.vat?.tribute13 || '',
        value: input.vat?.value13 || '',
        taxableValue: input.vat?.taxableValue13 || '',
        rate: input.vat?.rate13 || '',
        letterOfIntent: input.vat?.letterOfIntent13 || '',
      },
      {
        tribute: input.vat?.tribute14 || '',
        value: input.vat?.value14 || '',
        taxableValue: input.vat?.taxableValue14 || '',
        rate: input.vat?.rate14 || '',
        letterOfIntent: input.vat?.letterOfIntent14 || '',
      },
      {
        tribute: input.vat?.tribute15 || '',
        value: input.vat?.value15 || '',
        taxableValue: input.vat?.taxableValue15 || '',
        rate: input.vat?.rate15 || '',
        letterOfIntent: input.vat?.letterOfIntent15 || '',
      },
      {
        tribute: input.vat?.tribute16 || '',
        value: input.vat?.value16 || '',
        taxableValue: input.vat?.taxableValue16 || '',
        rate: input.vat?.rate16 || '',
        letterOfIntent: input.vat?.letterOfIntent16 || '',
      },
      {
        tribute: input.vat?.tribute17 || '',
        value: input.vat?.value17 || '',
        taxableValue: input.vat?.taxableValue17 || '',
        rate: input.vat?.rate17 || '',
        letterOfIntent: input.vat?.letterOfIntent17 || '',
      },
      {
        tribute: input.vat?.tribute18 || '',
        value: input.vat?.value18 || '',
        taxableValue: input.vat?.taxableValue18 || '',
        rate: input.vat?.rate18 || '',
        letterOfIntent: input.vat?.letterOfIntent18 || '',
      },
      {
        tribute: input.vat?.tribute19 || '',
        value: input.vat?.value19 || '',
        taxableValue: input.vat?.taxableValue19 || '',
        rate: input.vat?.rate19 || '',
        letterOfIntent: input.vat?.letterOfIntent19 || '',
      },
      {
        tribute: input.vat?.tribute20 || '',
        value: input.vat?.value20 || '',
        taxableValue: input.vat?.taxableValue20 || '',
        rate: input.vat?.rate20 || '',
        letterOfIntent: input.vat?.letterOfIntent20 || '',
      },
      {
        tribute: input.vat?.tribute21 || '',
        value: input.vat?.value21 || '',
        taxableValue: input.vat?.taxableValue21 || '',
        rate: input.vat?.rate21 || '',
        letterOfIntent: input.vat?.letterOfIntent21 || '',
      },
      {
        tribute: input.vat?.tribute22 || '',
        value: input.vat?.value22 || '',
        taxableValue: input.vat?.taxableValue22 || '',
        rate: input.vat?.rate22 || '',
        letterOfIntent: input.vat?.letterOfIntent22 || '',
      },
      {
        tribute: input.vat?.tribute23 || '',
        value: input.vat?.value23 || '',
        taxableValue: input.vat?.taxableValue23 || '',
        rate: input.vat?.rate23 || '',
        letterOfIntent: input.vat?.letterOfIntent23 || '',
      },
      {
        tribute: input.vat?.tribute24 || '',
        value: input.vat?.value24 || '',
        taxableValue: input.vat?.taxableValue24 || '',
        rate: input.vat?.rate24 || '',
        letterOfIntent: input.vat?.letterOfIntent24 || '',
      },
      {
        tribute: input.vat?.tribute25 || '',
        value: input.vat?.value25 || '',
        taxableValue: input.vat?.taxableValue25 || '',
        rate: input.vat?.rate25 || '',
        letterOfIntent: input.vat?.letterOfIntent25 || '',
      },
      {
        tribute: input.vat?.tribute26 || '',
        value: input.vat?.value26 || '',
        taxableValue: input.vat?.taxableValue26 || '',
        rate: input.vat?.rate26 || '',
        letterOfIntent: input.vat?.letterOfIntent26 || '',
      },
      {
        tribute: input.vat?.tribute27 || '',
        value: input.vat?.value27 || '',
        taxableValue: input.vat?.taxableValue27 || '',
        rate: input.vat?.rate27 || '',
        letterOfIntent: input.vat?.letterOfIntent27 || '',
      },
      {
        tribute: input.vat?.tribute28 || '',
        value: input.vat?.value28 || '',
        taxableValue: input.vat?.taxableValue28 || '',
        rate: input.vat?.rate28 || '',
        letterOfIntent: input.vat?.letterOfIntent28 || '',
      },
      {
        tribute: input.vat?.tribute29 || '',
        value: input.vat?.value29 || '',
        taxableValue: input.vat?.taxableValue29 || '',
        rate: input.vat?.rate29 || '',
        letterOfIntent: input.vat?.letterOfIntent29 || '',
      },
      {
        tribute: input.vat?.tribute30 || '',
        value: input.vat?.value30 || '',
        taxableValue: input.vat?.taxableValue30 || '',
        rate: input.vat?.rate30 || '',
        letterOfIntent: input.vat?.letterOfIntent30 || '',
      },
      {
        tribute: input.vat?.tribute31 || '',
        value: input.vat?.value31 || '',
        taxableValue: input.vat?.taxableValue31 || '',
        rate: input.vat?.rate31 || '',
        letterOfIntent: input.vat?.letterOfIntent31 || '',
      },
      {
        tribute: input.vat?.tribute32 || '',
        value: input.vat?.value32 || '',
        taxableValue: input.vat?.taxableValue32 || '',
        rate: input.vat?.rate32 || '',
        letterOfIntent: input.vat?.letterOfIntent32 || '',
      },
      {
        tribute: input.vat?.tribute33 || '',
        value: input.vat?.value33 || '',
        taxableValue: input.vat?.taxableValue33 || '',
        rate: input.vat?.rate33 || '',
        letterOfIntent: input.vat?.letterOfIntent33 || '',
      },
      {
        tribute: input.vat?.tribute34 || '',
        value: input.vat?.value34 || '',
        taxableValue: input.vat?.taxableValue34 || '',
        rate: input.vat?.rate34 || '',
        letterOfIntent: input.vat?.letterOfIntent34 || '',
      },
      {
        tribute: input.vat?.tribute35 || '',
        value: input.vat?.value35 || '',
        taxableValue: input.vat?.taxableValue35 || '',
        rate: input.vat?.rate35 || '',
        letterOfIntent: input.vat?.letterOfIntent35 || '',
      },
    ];

    const vatExemption = vatLiquidation.find((il) => il.tribute == '406');

    const vatExemptionValue = vatExemption
      ? Number(Number(vatExemption.value.replace(',', '.')).toFixed(2))
      : undefined;

    const vatExemptionTaxableValue = vatExemption
      ? Number(Number(vatExemption.taxableValue.replace(',', '.')).toFixed(2))
      : undefined;

    const letterOfIntent = vatExemption
      ? vatExemption.letterOfIntent
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
      ? Number(
          Number(taxB00Vat04Liquidation.value.replace(',', '.')).toFixed(2),
        )
      : undefined;

    const taxB00Vat00Liquidation = vatLiquidation.find(
      (il) => il.tribute == 'B00' && (il.rate == '0,00' || il.rate == '0,00'),
    );

    const taxB00Vat00 = taxB00Vat00Liquidation
      ? Number(
          Number(taxB00Vat00Liquidation.value.replace(',', '.')).toFixed(2),
        )
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
      {
        tribute: input.taxes?.tribute8 || '',
        value: input.taxes?.value8 || '',
      },
      {
        tribute: input.taxes?.tribute9 || '',
        value: input.taxes?.value9 || '',
      },
      {
        tribute: input.taxes?.tribute10 || '',
        value: input.taxes?.value10 || '',
      },
      {
        tribute: input.taxes?.tribute11 || '',
        value: input.taxes?.value11 || '',
      },
      {
        tribute: input.taxes?.tribute12 || '',
        value: input.taxes?.value12 || '',
      },
      {
        tribute: input.taxes?.tribute13 || '',
        value: input.taxes?.value13 || '',
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

    const taxA30Liquidation = taxLiquidation.find((il) => il.tribute == 'A30');

    const taxA30 = taxA30Liquidation
      ? Number(Number(taxA30Liquidation.value.replace(',', '.')).toFixed(2))
      : undefined;

    const taxA35Liquidation = taxLiquidation.find((il) => il.tribute == 'A35');

    const taxA35 = taxA35Liquidation
      ? Number(Number(taxA35Liquidation.value.replace(',', '.')).toFixed(2))
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

    const documents = input.documents
      .filter(
        (d) => d.code != '' && d.code != 'Elenco Fatture' && d.code != 'Codice',
      )
      .map((document) => {
        return {
          code: document.code,
          identifier: [
            document.country,
            document.year,
            document.identifier,
          ].join('-'),
        };
      });

    if (documents.length != documentsNumber) {
      throw new Error('Missing mapping for documents');
    }

    if (letterOfIntent) {
      documents.push({ code: '01DI', identifier: letterOfIntent });
    }

    if (totalDuties == undefined) {
      throw new Error('Missing total duties');
    }

    if (totalVatToBePaid == undefined) {
      throw new Error('Missing total vat to be paid');
    }

    if (totalTaxes == undefined) {
      throw new Error('Missing total taxes');
    }

    if (
      taxB00Vat22 == undefined &&
      taxB00Vat10 == undefined &&
      taxB00Vat04 == undefined &&
      taxB00Vat00 == undefined
    ) {
      throw new Error('Missing VAT tax');
    }

    return {
      rectificationOrCancellationDate,
      version,
      totalDuties,
      totalTaxes,
      totalVatToBePaid,
      vatExemption: !!vatExemption,
      vatExemptionValue,
      vatExemptionTaxableValue,
      letterOfIntent,
      taxB00Vat22,
      taxB00Vat10,
      taxB00Vat04,
      tax931,
      tax123,
      taxA30,
      taxA35,
      totalSeaTaxes,
      documents,
    };
  }
  public async run(params: {
    data: ({ path: string } | { buffer: Buffer }) & { seaTaxCodes: string[] };
  }): Promise<AccountingStatementMapped> {
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
      const accountingEntity: any = {
        statement: {},
        documents: [],
      };
      let isMappingDocuments: boolean = false,
        countNumber = 0,
        isFirstDocument = true,
        isNewDocument = false;

      if (!!declarationRawJson && declarationRawJson.Pages) {
        const pages = declarationRawJson.Pages;

        for (let i = 0; i < pages.length; i++) {
          const page = pages[i];
          if (page.Texts) {
            let documentObject: any = {
              code: '',
              identifier: '',
              country: '',
              year: '',
            };
            for (let j = 0; j < page.Texts.length; j++) {
              const textElement = page.Texts[j];
              const text = decodeURIComponent(textElement.R[0].T);

              // if (i == 0) {
              //   console.log({ x: textElement.x, y: textElement.y, text: text });
              // }

              if (text == 'Condizioni di Consegna' && textElement.x == 2.159) {
                isMappingDocuments = false;
              }

              if (
                text != 'Codice' &&
                textElement.x == 2.159 &&
                isMappingDocuments
              ) {
                countNumber++;
              }

              if (
                i == 0 &&
                text == 'Elenco Fatture' &&
                textElement.x == 2.159
              ) {
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
                if (
                  mappedPosition.entity == 'documents' &&
                  isMappingDocuments
                ) {
                  if (isMappingDocuments) {
                    if (mappedPosition.column == 'code') {
                      if (isFirstDocument) {
                        isFirstDocument = false;
                      } else {
                        isNewDocument = true;
                      }
                    }

                    if (isNewDocument) {
                      accountingEntity['documents'].push(documentObject);
                      documentObject = {
                        code: '',
                        identifier: '',
                        country: '',
                        year: '',
                      };
                      isNewDocument = false;
                    }

                    documentObject[mappedPosition.column] = text.trim();
                  }
                } else {
                  if (!accountingEntity[mappedPosition.entity])
                    accountingEntity[mappedPosition.entity] = {};
                  accountingEntity[mappedPosition.entity][
                    mappedPosition.column
                  ] = text.trim();
                }
              }
            }
            accountingEntity['documents'].push(documentObject);
          }
        }
      } else {
        throw new Error('No Pages found in the PDF.');
      }

      const accountingStatementMapped = this.map(
        accountingEntity,
        params.data.seaTaxCodes,
        countNumber,
      );
      await fsPromises.unlink(path);
      return accountingStatementMapped;
    } catch (error) {
      await fsPromises.unlink(path);
      throw new Error('parsing PDF Accounting:' + error); // Returning an empty object
    }
  }
}
export default AccountingPDFConverter;
