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
  tax931TaxableValue: number | undefined;
  tax931Quantity: number | undefined;
  tax123: number | undefined;
  tax123TaxableValue: number | undefined;
  tax123Quantity: number | undefined;
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
    totalDuties25: string;
    totalDuties26: string;
    totalDuties27: string;
    totalDuties28: string;
    totalDuties29: string;
    totalDuties30: string;
    totalDuties31: string;
    totalDuties32: string;
    totalDuties33: string;
    totalDuties34: string;
    totalDuties35: string;
    totalDuties36: string;
    totalDuties37: string;
    totalDuties38: string;
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
    totalTaxes26: string;
    totalTaxes27: string;
    totalTaxes28: string;
    totalTaxes29: string;
    totalTaxes30: string;
    totalTaxes31: string;
    totalTaxes32: string;
    totalTaxes33: string;
    totalTaxes34: string;
    totalTaxes35: string;
    totalTaxes36: string;
    totalTaxes37: string;
    totalTaxes38: string;
    totalTaxes39: string;
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
    totalVat28: string;
    totalVat29: string;
    totalVat30: string;
    totalVat31: string;
    totalVat32: string;
    totalVat33: string;
    totalVat34: string;
    totalVat35: string;
    totalVat36: string;
    totalVat37: string;
    totalVat38: string;
    totalVat39: string;
    totalVat40: string;
    totalVat41: string;
    totalVat42: string;
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
    taxableValue1: string;
    rate1: string;
    letterOfIntent1: string;
    quantity1: string;
    tribute2: string;
    value2: string;
    taxableValue2: string;
    rate2: string;
    letterOfIntent2: string;
    quantity2: string;
    tribute3: string;
    value3: string;
    taxableValue3: string;
    rate3: string;
    letterOfIntent3: string;
    quantity3: string;
    tribute4: string;
    value4: string;
    taxableValue4: string;
    rate4: string;
    letterOfIntent4: string;
    quantity4: string;
    tribute5: string;
    value5: string;
    taxableValue5: string;
    rate5: string;
    letterOfIntent5: string;
    quantity5: string;
    tribute6: string;
    value6: string;
    taxableValue6: string;
    rate6: string;
    letterOfIntent6: string;
    quantity6: string;
    tribute7: string;
    value7: string;
    taxableValue7: string;
    rate7: string;
    letterOfIntent7: string;
    quantity7: string;
    tribute8: string;
    value8: string;
    taxableValue8: string;
    rate8: string;
    letterOfIntent8: string;
    quantity8: string;
    tribute9: string;
    value9: string;
    taxableValue9: string;
    rate9: string;
    letterOfIntent9: string;
    quantity9: string;
    tribute10: string;
    value10: string;
    taxableValue10: string;
    rate10: string;
    letterOfIntent10: string;
    quantity10: string;
    tribute11: string;
    value11: string;
    taxableValue11: string;
    rate11: string;
    letterOfIntent11: string;
    quantity11: string;
    tribute12: string;
    value12: string;
    taxableValue12: string;
    rate12: string;
    letterOfIntent12: string;
    quantity12: string;
    tribute13: string;
    value13: string;
    taxableValue13: string;
    rate13: string;
    letterOfIntent13: string;
    quantity13: string;
    tribute14: string;
    value14: string;
    taxableValue14: string;
    rate14: string;
    letterOfIntent14: string;
    quantity14: string;
    tribute15: string;
    value15: string;
    taxableValue15: string;
    rate15: string;
    letterOfIntent15: string;
    quantity15: string;
    tribute16: string;
    value16: string;
    taxableValue16: string;
    rate16: string;
    letterOfIntent16: string;
    quantity16: string;
    tribute17: string;
    value17: string;
    taxableValue17: string;
    rate17: string;
    letterOfIntent17: string;
    quantity17: string;
    tribute18: string;
    value18: string;
    taxableValue18: string;
    rate18: string;
    letterOfIntent18: string;
    quantity18: string;
    tribute19: string;
    value19: string;
    taxableValue19: string;
    rate19: string;
    letterOfIntent19: string;
    quantity19: string;
    tribute20: string;
    value20: string;
    taxableValue20: string;
    rate20: string;
    letterOfIntent20: string;
    quantity20: string;
    tribute21: string;
    value21: string;
    taxableValue21: string;
    rate21: string;
    letterOfIntent21: string;
    quantity21: string;
    tribute22: string;
    value22: string;
    taxableValue22: string;
    rate22: string;
    letterOfIntent22: string;
    quantity22: string;
    tribute23: string;
    value23: string;
    taxableValue23: string;
    rate23: string;
    letterOfIntent23: string;
    quantity23: string;
    tribute24: string;
    value24: string;
    taxableValue24: string;
    rate24: string;
    letterOfIntent24: string;
    quantity24: string;
    tribute25: string;
    value25: string;
    taxableValue25: string;
    rate25: string;
    letterOfIntent25: string;
    quantity25: string;
    tribute26: string;
    value26: string;
    taxableValue26: string;
    rate26: string;
    letterOfIntent26: string;
    quantity26: string;
    tribute27: string;
    value27: string;
    taxableValue27: string;
    rate27: string;
    letterOfIntent27: string;
    quantity27: string;
    tribute28: string;
    value28: string;
    taxableValue28: string;
    rate28: string;
    letterOfIntent28: string;
    quantity28: string;
    tribute29: string;
    value29: string;
    taxableValue29: string;
    rate29: string;
    letterOfIntent29: string;
    quantity29: string;
    tribute30: string;
    value30: string;
    taxableValue30: string;
    rate30: string;
    letterOfIntent30: string;
    quantity30: string;
    tribute31: string;
    value31: string;
    taxableValue31: string;
    rate31: string;
    letterOfIntent31: string;
    quantity31: string;

    tribute32: string;
    value32: string;
    taxableValue32: string;
    rate32: string;
    letterOfIntent32: string;
    quantity32: string;
    tribute33: string;
    value33: string;
    taxableValue33: string;
    rate33: string;
    letterOfIntent33: string;
    quantity33: string;
    tribute34: string;
    value34: string;
    taxableValue34: string;
    rate34: string;
    letterOfIntent34: string;
    quantity34: string;
    tribute35: string;
    value35: string;
    taxableValue35: string;
    rate35: string;
    letterOfIntent35: string;
    quantity35: string;
    tribute36: string;
    value36: string;
    taxableValue36: string;
    rate36: string;
    letterOfIntent36: string;
    quantity36: string;
    tribute37: string;
    value37: string;
    taxableValue37: string;
    rate37: string;
    letterOfIntent37: string;
    quantity37: string;
    tribute38: string;
    value38: string;
    taxableValue38: string;
    rate38: string;
    letterOfIntent38: string;
    quantity38: string;
    tribute39: string;
    value39: string;
    taxableValue39: string;
    rate39: string;
    letterOfIntent39: string;
    quantity39: string;
    tribute40: string;
    value40: string;
    taxableValue40: string;
    rate40: string;
    letterOfIntent40: string;
    quantity40: string;
    tribute41: string;
    value41: string;
    taxableValue41: string;
    rate41: string;
    letterOfIntent41: string;
    quantity41: string;
    tribute42: string;
    value42: string;
    taxableValue42: string;
    rate42: string;
    letterOfIntent42: string;
    quantity42: string;
    tribute43: string;
    value43: string;
    taxableValue43: string;
    rate43: string;
    letterOfIntent43: string;
    quantity43: string;
    tribute44: string;
    value44: string;
    taxableValue44: string;
    rate44: string;
    letterOfIntent44: string;
    quantity44: string;
    tribute45: string;
    value45: string;
    taxableValue45: string;
    rate45: string;
    letterOfIntent45: string;
    quantity45: string;
    tribute46: string;
    value46: string;
    taxableValue46: string;
    rate46: string;
    letterOfIntent46: string;
    quantity46: string;
    tribute47: string;
    value47: string;
    taxableValue47: string;
    rate47: string;
    letterOfIntent47: string;
    quantity47: string;
    tribute48: string;
    value48: string;
    taxableValue48: string;
    rate48: string;
    letterOfIntent48: string;
    quantity48: string;
    tribute49: string;
    value49: string;
    taxableValue49: string;
    rate49: string;
    letterOfIntent49: string;
    quantity49: string;
    tribute50: string;
    value50: string;
    taxableValue50: string;
    rate50: string;
    letterOfIntent50: string;
    quantity50: string;
    tribute51: string;
    value51: string;
    taxableValue51: string;
    rate51: string;
    letterOfIntent51: string;
    quantity51: string;
    tribute52: string;
    value52: string;
    taxableValue52: string;
    rate52: string;
    letterOfIntent52: string;
    quantity52: string;
    tribute53: string;
    value53: string;
    taxableValue53: string;
    rate53: string;
    letterOfIntent53: string;
    quantity53: string;
    tribute54: string;
    value54: string;
    taxableValue54: string;
    rate54: string;
    letterOfIntent54: string;
    quantity54: string;
    tribute55: string;
    value55: string;
    taxableValue55: string;
    rate55: string;
    letterOfIntent55: string;
    quantity55: string;
    tribute56: string;
    value56: string;
    taxableValue56: string;
    rate56: string;
    letterOfIntent56: string;
    quantity56: string;
    tribute57: string;
    value57: string;
    taxableValue57: string;
    rate57: string;
    letterOfIntent57: string;
    quantity57: string;
    tribute58: string;
    value58: string;
    taxableValue58: string;
    rate58: string;
    letterOfIntent58: string;
    quantity58: string;
    tribute59: string;
    value59: string;
    taxableValue59: string;
    rate59: string;
    letterOfIntent59: string;
    quantity59: string;
    tribute60: string;
    value60: string;
    taxableValue60: string;
    rate60: string;
    letterOfIntent60: string;
    quantity60: string;
    tribute61: string;
    value61: string;
    taxableValue61: string;
    rate61: string;
    letterOfIntent61: string;
    quantity61: string;
    tribute62: string;
    value62: string;
    taxableValue62: string;
    rate62: string;
    letterOfIntent62: string;
    quantity62: string;
    tribute63: string;
    value63: string;
    taxableValue63: string;
    rate63: string;
    letterOfIntent63: string;
    quantity63: string;
    tribute64: string;
    value64: string;
    taxableValue64: string;
    rate64: string;
    letterOfIntent64: string;
    quantity64: string;
    tribute65: string;
    value65: string;
    taxableValue65: string;
    rate65: string;
    letterOfIntent65: string;
    quantity65: string;
    tribute66: string;
    value66: string;
    taxableValue66: string;
    rate66: string;
    letterOfIntent66: string;
    quantity66: string;
    tribute67: string;
    value67: string;
    taxableValue67: string;
    rate67: string;
    letterOfIntent67: string;
    quantity67: string;
    tribute68: string;
    value68: string;
    taxableValue68: string;
    rate68: string;
    letterOfIntent68: string;
    quantity68: string;
    tribute69: string;
    value69: string;
    taxableValue69: string;
    rate69: string;
    letterOfIntent69: string;
    quantity69: string;
    tribute70: string;
    value70: string;
    taxableValue70: string;
    rate70: string;
    letterOfIntent70: string;
    quantity70: string;
    tribute71: string;
    value71: string;
    taxableValue71: string;
    rate71: string;
    letterOfIntent71: string;
    quantity71: string;
    tribute72: string;
    value72: string;
    taxableValue72: string;
    rate72: string;
    letterOfIntent72: string;
    quantity72: string;
    tribute73: string;
    value73: string;
    taxableValue73: string;
    rate73: string;
    letterOfIntent73: string;
    quantity73: string;
    tribute74: string;
    value74: string;
    taxableValue74: string;
    rate74: string;
    letterOfIntent74: string;
    quantity74: string;
    tribute75: string;
    value75: string;
    taxableValue75: string;
    rate75: string;
    letterOfIntent75: string;
    quantity75: string;
    tribute76: string;
    value76: string;
    taxableValue76: string;
    rate76: string;
    letterOfIntent76: string;
    quantity76: string;
    tribute77: string;
    value77: string;
    taxableValue77: string;
    rate77: string;
    letterOfIntent77: string;
    quantity77: string;
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
      input.statement.totalDuties25?.trim() ||
      input.statement.totalDuties26?.trim() ||
      input.statement.totalDuties27?.trim() ||
      input.statement.totalDuties28?.trim() ||
      input.statement.totalDuties29?.trim() ||
      input.statement.totalDuties30?.trim() ||
      input.statement.totalDuties31?.trim() ||
      input.statement.totalDuties32?.trim() ||
      input.statement.totalDuties33?.trim() ||
      input.statement.totalDuties34?.trim() ||
      input.statement.totalDuties35?.trim() ||
      input.statement.totalDuties36?.trim() ||
      input.statement.totalDuties37?.trim() ||
      input.statement.totalDuties38?.trim() ||
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
      input.statement.totalTaxes26?.trim() ||
      input.statement.totalTaxes27?.trim() ||
      input.statement.totalTaxes28?.trim() ||
      input.statement.totalTaxes29?.trim() ||
      input.statement.totalTaxes30?.trim() ||
      input.statement.totalTaxes31?.trim() ||
      input.statement.totalTaxes32?.trim() ||
      input.statement.totalTaxes33?.trim() ||
      input.statement.totalTaxes34?.trim() ||
      input.statement.totalTaxes35?.trim() ||
      input.statement.totalTaxes36?.trim() ||
      input.statement.totalTaxes37?.trim() ||
      input.statement.totalTaxes38?.trim() ||
      input.statement.totalTaxes39?.trim() ||
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
      input.statement.totalVat28?.trim() ||
      input.statement.totalVat29?.trim() ||
      input.statement.totalVat30?.trim() ||
      input.statement.totalVat31?.trim() ||
      input.statement.totalVat32?.trim() ||
      input.statement.totalVat33?.trim() ||
      input.statement.totalVat34?.trim() ||
      input.statement.totalVat35?.trim() ||
      input.statement.totalVat36?.trim() ||
      input.statement.totalVat37?.trim() ||
      input.statement.totalVat38?.trim() ||
      input.statement.totalVat39?.trim() ||
      input.statement.totalVat40?.trim() ||
      input.statement.totalVat41?.trim() ||
      input.statement.totalVat42?.trim() ||
      '';

    const totalVatToBePaid =
      totalVatToBePaidString != ''
        ? Number(Number(totalVatToBePaidString.replace(',', '.')).toFixed(2))
        : undefined;

    const taxLiquidation: {
      tribute: string;
      value: string;
      taxableValue: string;
      quantity: string;
      rate: string;
      letterOfIntent: string;
    }[] = [
      {
        tribute: input.taxes?.tribute1 || '',
        taxableValue: input.taxes?.taxableValue1 || '',
        quantity: input.taxes?.quantity1 || '',
        value: input.taxes?.value1 || '',
        rate: input.taxes?.rate1 || '',
        letterOfIntent: input.taxes?.letterOfIntent1 || '',
      },
      {
        tribute: input.taxes?.tribute2 || '',
        taxableValue: input.taxes?.taxableValue2 || '',
        quantity: input.taxes?.quantity2 || '',
        value: input.taxes?.value2 || '',
        rate: input.taxes?.rate2 || '',
        letterOfIntent: input.taxes?.letterOfIntent2 || '',
      },
      {
        tribute: input.taxes?.tribute3 || '',
        taxableValue: input.taxes?.taxableValue3 || '',
        quantity: input.taxes?.quantity3 || '',
        value: input.taxes?.value3 || '',
        rate: input.taxes?.rate3 || '',
        letterOfIntent: input.taxes?.letterOfIntent3 || '',
      },
      {
        tribute: input.taxes?.tribute4 || '',
        taxableValue: input.taxes?.taxableValue4 || '',
        quantity: input.taxes?.quantity4 || '',
        value: input.taxes?.value4 || '',
        rate: input.taxes?.rate4 || '',
        letterOfIntent: input.taxes?.letterOfIntent4 || '',
      },
      {
        tribute: input.taxes?.tribute5 || '',
        taxableValue: input.taxes?.taxableValue5 || '',
        quantity: input.taxes?.quantity5 || '',
        value: input.taxes?.value5 || '',
        rate: input.taxes?.rate5 || '',
        letterOfIntent: input.taxes?.letterOfIntent5 || '',
      },
      {
        tribute: input.taxes?.tribute6 || '',
        taxableValue: input.taxes?.taxableValue6 || '',
        quantity: input.taxes?.quantity6 || '',
        value: input.taxes?.value6 || '',
        rate: input.taxes?.rate6 || '',
        letterOfIntent: input.taxes?.letterOfIntent6 || '',
      },
      {
        tribute: input.taxes?.tribute7 || '',
        taxableValue: input.taxes?.taxableValue7 || '',
        quantity: input.taxes?.quantity7 || '',
        value: input.taxes?.value7 || '',
        rate: input.taxes?.rate7 || '',
        letterOfIntent: input.taxes?.letterOfIntent7 || '',
      },
      {
        tribute: input.taxes?.tribute8 || '',
        taxableValue: input.taxes?.taxableValue8 || '',
        quantity: input.taxes?.quantity8 || '',
        value: input.taxes?.value8 || '',
        rate: input.taxes?.rate8 || '',
        letterOfIntent: input.taxes?.letterOfIntent8 || '',
      },
      {
        tribute: input.taxes?.tribute9 || '',
        taxableValue: input.taxes?.taxableValue9 || '',
        quantity: input.taxes?.quantity9 || '',
        value: input.taxes?.value9 || '',
        rate: input.taxes?.rate9 || '',
        letterOfIntent: input.taxes?.letterOfIntent9 || '',
      },
      {
        tribute: input.taxes?.tribute10 || '',
        taxableValue: input.taxes?.taxableValue10 || '',
        quantity: input.taxes?.quantity10 || '',
        value: input.taxes?.value10 || '',
        rate: input.taxes?.rate10 || '',
        letterOfIntent: input.taxes?.letterOfIntent10 || '',
      },
      {
        tribute: input.taxes?.tribute11 || '',
        taxableValue: input.taxes?.taxableValue11 || '',
        quantity: input.taxes?.quantity11 || '',
        value: input.taxes?.value11 || '',
        rate: input.taxes?.rate11 || '',
        letterOfIntent: input.taxes?.letterOfIntent11 || '',
      },
      {
        tribute: input.taxes?.tribute12 || '',
        taxableValue: input.taxes?.taxableValue12 || '',
        quantity: input.taxes?.quantity12 || '',
        value: input.taxes?.value12 || '',
        rate: input.taxes?.rate12 || '',
        letterOfIntent: input.taxes?.letterOfIntent12 || '',
      },
      {
        tribute: input.taxes?.tribute13 || '',
        taxableValue: input.taxes?.taxableValue13 || '',
        quantity: input.taxes?.quantity13 || '',
        value: input.taxes?.value13 || '',
        rate: input.taxes?.rate13 || '',
        letterOfIntent: input.taxes?.letterOfIntent13 || '',
      },
      {
        tribute: input.taxes?.tribute14 || '',
        taxableValue: input.taxes?.taxableValue14 || '',
        quantity: input.taxes?.quantity14 || '',
        value: input.taxes?.value14 || '',
        rate: input.taxes?.rate14 || '',
        letterOfIntent: input.taxes?.letterOfIntent14 || '',
      },
      {
        tribute: input.taxes?.tribute15 || '',
        taxableValue: input.taxes?.taxableValue15 || '',
        quantity: input.taxes?.quantity15 || '',
        value: input.taxes?.value15 || '',
        rate: input.taxes?.rate15 || '',
        letterOfIntent: input.taxes?.letterOfIntent15 || '',
      },
      {
        tribute: input.taxes?.tribute16 || '',
        taxableValue: input.taxes?.taxableValue16 || '',
        quantity: input.taxes?.quantity16 || '',
        value: input.taxes?.value16 || '',
        rate: input.taxes?.rate16 || '',
        letterOfIntent: input.taxes?.letterOfIntent16 || '',
      },
      {
        tribute: input.taxes?.tribute17 || '',
        taxableValue: input.taxes?.taxableValue17 || '',
        quantity: input.taxes?.quantity17 || '',
        value: input.taxes?.value17 || '',
        rate: input.taxes?.rate17 || '',
        letterOfIntent: input.taxes?.letterOfIntent17 || '',
      },
      {
        tribute: input.taxes?.tribute18 || '',
        taxableValue: input.taxes?.taxableValue18 || '',
        quantity: input.taxes?.quantity18 || '',
        value: input.taxes?.value18 || '',
        rate: input.taxes?.rate18 || '',
        letterOfIntent: input.taxes?.letterOfIntent18 || '',
      },
      {
        tribute: input.taxes?.tribute19 || '',
        taxableValue: input.taxes?.taxableValue19 || '',
        quantity: input.taxes?.quantity19 || '',
        value: input.taxes?.value19 || '',
        rate: input.taxes?.rate19 || '',
        letterOfIntent: input.taxes?.letterOfIntent19 || '',
      },
      {
        tribute: input.taxes?.tribute20 || '',
        taxableValue: input.taxes?.taxableValue20 || '',
        quantity: input.taxes?.quantity20 || '',
        value: input.taxes?.value20 || '',
        rate: input.taxes?.rate20 || '',
        letterOfIntent: input.taxes?.letterOfIntent20 || '',
      },
      {
        tribute: input.taxes?.tribute21 || '',
        taxableValue: input.taxes?.taxableValue21 || '',
        quantity: input.taxes?.quantity21 || '',
        value: input.taxes?.value21 || '',
        rate: input.taxes?.rate21 || '',
        letterOfIntent: input.taxes?.letterOfIntent21 || '',
      },
      {
        tribute: input.taxes?.tribute22 || '',
        taxableValue: input.taxes?.taxableValue22 || '',
        quantity: input.taxes?.quantity22 || '',
        value: input.taxes?.value22 || '',
        rate: input.taxes?.rate22 || '',
        letterOfIntent: input.taxes?.letterOfIntent22 || '',
      },
      {
        tribute: input.taxes?.tribute23 || '',
        taxableValue: input.taxes?.taxableValue23 || '',
        quantity: input.taxes?.quantity23 || '',
        value: input.taxes?.value23 || '',
        rate: input.taxes?.rate23 || '',
        letterOfIntent: input.taxes?.letterOfIntent23 || '',
      },
      {
        tribute: input.taxes?.tribute24 || '',
        taxableValue: input.taxes?.taxableValue24 || '',
        quantity: input.taxes?.quantity24 || '',
        value: input.taxes?.value24 || '',
        rate: input.taxes?.rate24 || '',
        letterOfIntent: input.taxes?.letterOfIntent24 || '',
      },
      {
        tribute: input.taxes?.tribute25 || '',
        taxableValue: input.taxes?.taxableValue25 || '',
        quantity: input.taxes?.quantity25 || '',
        value: input.taxes?.value25 || '',
        rate: input.taxes?.rate25 || '',
        letterOfIntent: input.taxes?.letterOfIntent25 || '',
      },
      {
        tribute: input.taxes?.tribute26 || '',
        taxableValue: input.taxes?.taxableValue26 || '',
        quantity: input.taxes?.quantity26 || '',
        value: input.taxes?.value26 || '',
        rate: input.taxes?.rate26 || '',
        letterOfIntent: input.taxes?.letterOfIntent26 || '',
      },
      {
        tribute: input.taxes?.tribute27 || '',
        taxableValue: input.taxes?.taxableValue27 || '',
        quantity: input.taxes?.quantity27 || '',
        value: input.taxes?.value27 || '',
        rate: input.taxes?.rate27 || '',
        letterOfIntent: input.taxes?.letterOfIntent27 || '',
      },
      {
        tribute: input.taxes?.tribute28 || '',
        taxableValue: input.taxes?.taxableValue28 || '',
        quantity: input.taxes?.quantity28 || '',
        value: input.taxes?.value28 || '',
        rate: input.taxes?.rate28 || '',
        letterOfIntent: input.taxes?.letterOfIntent28 || '',
      },
      {
        tribute: input.taxes?.tribute29 || '',
        taxableValue: input.taxes?.taxableValue29 || '',
        quantity: input.taxes?.quantity29 || '',
        value: input.taxes?.value29 || '',
        rate: input.taxes?.rate29 || '',
        letterOfIntent: input.taxes?.letterOfIntent29 || '',
      },
      {
        tribute: input.taxes?.tribute30 || '',
        taxableValue: input.taxes?.taxableValue30 || '',
        quantity: input.taxes?.quantity30 || '',
        value: input.taxes?.value30 || '',
        rate: input.taxes?.rate30 || '',
        letterOfIntent: input.taxes?.letterOfIntent30 || '',
      },
      {
        tribute: input.taxes?.tribute31 || '',
        taxableValue: input.taxes?.taxableValue31 || '',
        quantity: input.taxes?.quantity31 || '',
        value: input.taxes?.value31 || '',
        rate: input.taxes?.rate31 || '',
        letterOfIntent: input.taxes?.letterOfIntent31 || '',
      },

      {
        tribute: input.taxes?.tribute32 || '',
        value: input.taxes?.value32 || '',
        taxableValue: input.taxes?.taxableValue32 || '',
        rate: input.taxes?.rate32 || '',
        letterOfIntent: input.taxes?.letterOfIntent32 || '',
        quantity: input.taxes?.quantity32 || '',
      },
      {
        tribute: input.taxes?.tribute33 || '',
        value: input.taxes?.value33 || '',
        taxableValue: input.taxes?.taxableValue33 || '',
        rate: input.taxes?.rate33 || '',
        letterOfIntent: input.taxes?.letterOfIntent33 || '',
        quantity: input.taxes?.quantity33 || '',
      },
      {
        tribute: input.taxes?.tribute34 || '',
        value: input.taxes?.value34 || '',
        taxableValue: input.taxes?.taxableValue34 || '',
        rate: input.taxes?.rate34 || '',
        letterOfIntent: input.taxes?.letterOfIntent34 || '',
        quantity: input.taxes?.quantity34 || '',
      },
      {
        tribute: input.taxes?.tribute35 || '',
        value: input.taxes?.value35 || '',
        taxableValue: input.taxes?.taxableValue35 || '',
        rate: input.taxes?.rate35 || '',
        letterOfIntent: input.taxes?.letterOfIntent35 || '',
        quantity: input.taxes?.quantity35 || '',
      },
      {
        tribute: input.taxes?.tribute36 || '',
        value: input.taxes?.value36 || '',
        taxableValue: input.taxes?.taxableValue36 || '',
        rate: input.taxes?.rate36 || '',
        letterOfIntent: input.taxes?.letterOfIntent36 || '',
        quantity: input.taxes?.quantity36 || '',
      },
      {
        tribute: input.taxes?.tribute37 || '',
        value: input.taxes?.value37 || '',
        taxableValue: input.taxes?.taxableValue37 || '',
        rate: input.taxes?.rate37 || '',
        letterOfIntent: input.taxes?.letterOfIntent37 || '',
        quantity: input.taxes?.quantity37 || '',
      },
      {
        tribute: input.taxes?.tribute38 || '',
        value: input.taxes?.value38 || '',
        taxableValue: input.taxes?.taxableValue38 || '',
        rate: input.taxes?.rate38 || '',
        letterOfIntent: input.taxes?.letterOfIntent38 || '',
        quantity: input.taxes?.quantity38 || '',
      },
      {
        tribute: input.taxes?.tribute39 || '',
        value: input.taxes?.value39 || '',
        taxableValue: input.taxes?.taxableValue39 || '',
        rate: input.taxes?.rate39 || '',
        letterOfIntent: input.taxes?.letterOfIntent39 || '',
        quantity: input.taxes?.quantity39 || '',
      },
      {
        tribute: input.taxes?.tribute40 || '',
        value: input.taxes?.value40 || '',
        taxableValue: input.taxes?.taxableValue40 || '',
        rate: input.taxes?.rate40 || '',
        letterOfIntent: input.taxes?.letterOfIntent40 || '',
        quantity: input.taxes?.quantity40 || '',
      },
      {
        tribute: input.taxes?.tribute41 || '',
        value: input.taxes?.value41 || '',
        taxableValue: input.taxes?.taxableValue41 || '',
        rate: input.taxes?.rate41 || '',
        letterOfIntent: input.taxes?.letterOfIntent41 || '',
        quantity: input.taxes?.quantity41 || '',
      },
      {
        tribute: input.taxes?.tribute42 || '',
        value: input.taxes?.value42 || '',
        taxableValue: input.taxes?.taxableValue42 || '',
        rate: input.taxes?.rate42 || '',
        letterOfIntent: input.taxes?.letterOfIntent42 || '',
        quantity: input.taxes?.quantity42 || '',
      },
      {
        tribute: input.taxes?.tribute43 || '',
        value: input.taxes?.value43 || '',
        taxableValue: input.taxes?.taxableValue43 || '',
        rate: input.taxes?.rate43 || '',
        letterOfIntent: input.taxes?.letterOfIntent43 || '',
        quantity: input.taxes?.quantity43 || '',
      },
      {
        tribute: input.taxes?.tribute44 || '',
        value: input.taxes?.value44 || '',
        taxableValue: input.taxes?.taxableValue44 || '',
        rate: input.taxes?.rate44 || '',
        letterOfIntent: input.taxes?.letterOfIntent44 || '',
        quantity: input.taxes?.quantity44 || '',
      },
      {
        tribute: input.taxes?.tribute45 || '',
        value: input.taxes?.value45 || '',
        taxableValue: input.taxes?.taxableValue45 || '',
        rate: input.taxes?.rate45 || '',
        letterOfIntent: input.taxes?.letterOfIntent45 || '',
        quantity: input.taxes?.quantity45 || '',
      },
      {
        tribute: input.taxes?.tribute46 || '',
        value: input.taxes?.value46 || '',
        taxableValue: input.taxes?.taxableValue46 || '',
        rate: input.taxes?.rate46 || '',
        letterOfIntent: input.taxes?.letterOfIntent46 || '',
        quantity: input.taxes?.quantity46 || '',
      },
      {
        tribute: input.taxes?.tribute47 || '',
        value: input.taxes?.value47 || '',
        taxableValue: input.taxes?.taxableValue47 || '',
        rate: input.taxes?.rate47 || '',
        letterOfIntent: input.taxes?.letterOfIntent47 || '',
        quantity: input.taxes?.quantity47 || '',
      },
      {
        tribute: input.taxes?.tribute48 || '',
        value: input.taxes?.value48 || '',
        taxableValue: input.taxes?.taxableValue48 || '',
        rate: input.taxes?.rate48 || '',
        letterOfIntent: input.taxes?.letterOfIntent48 || '',
        quantity: input.taxes?.quantity48 || '',
      },
      {
        tribute: input.taxes?.tribute49 || '',
        value: input.taxes?.value49 || '',
        taxableValue: input.taxes?.taxableValue49 || '',
        rate: input.taxes?.rate49 || '',
        letterOfIntent: input.taxes?.letterOfIntent49 || '',
        quantity: input.taxes?.quantity49 || '',
      },
      {
        tribute: input.taxes?.tribute50 || '',
        value: input.taxes?.value50 || '',
        taxableValue: input.taxes?.taxableValue50 || '',
        rate: input.taxes?.rate50 || '',
        letterOfIntent: input.taxes?.letterOfIntent50 || '',
        quantity: input.taxes?.quantity50 || '',
      },
      {
        tribute: input.taxes?.tribute51 || '',
        value: input.taxes?.value51 || '',
        taxableValue: input.taxes?.taxableValue51 || '',
        rate: input.taxes?.rate51 || '',
        letterOfIntent: input.taxes?.letterOfIntent51 || '',
        quantity: input.taxes?.quantity51 || '',
      },
      {
        tribute: input.taxes?.tribute52 || '',
        value: input.taxes?.value52 || '',
        taxableValue: input.taxes?.taxableValue52 || '',
        rate: input.taxes?.rate52 || '',
        letterOfIntent: input.taxes?.letterOfIntent52 || '',
        quantity: input.taxes?.quantity52 || '',
      },
      {
        tribute: input.taxes?.tribute53 || '',
        value: input.taxes?.value53 || '',
        taxableValue: input.taxes?.taxableValue53 || '',
        rate: input.taxes?.rate53 || '',
        letterOfIntent: input.taxes?.letterOfIntent53 || '',
        quantity: input.taxes?.quantity53 || '',
      },
      {
        tribute: input.taxes?.tribute54 || '',
        value: input.taxes?.value54 || '',
        taxableValue: input.taxes?.taxableValue54 || '',
        rate: input.taxes?.rate54 || '',
        letterOfIntent: input.taxes?.letterOfIntent54 || '',
        quantity: input.taxes?.quantity54 || '',
      },
      {
        tribute: input.taxes?.tribute55 || '',
        value: input.taxes?.value55 || '',
        taxableValue: input.taxes?.taxableValue55 || '',
        rate: input.taxes?.rate55 || '',
        letterOfIntent: input.taxes?.letterOfIntent55 || '',
        quantity: input.taxes?.quantity55 || '',
      },
      {
        tribute: input.taxes?.tribute56 || '',
        value: input.taxes?.value56 || '',
        taxableValue: input.taxes?.taxableValue56 || '',
        rate: input.taxes?.rate56 || '',
        letterOfIntent: input.taxes?.letterOfIntent56 || '',
        quantity: input.taxes?.quantity56 || '',
      },
      {
        tribute: input.taxes?.tribute57 || '',
        value: input.taxes?.value57 || '',
        taxableValue: input.taxes?.taxableValue57 || '',
        rate: input.taxes?.rate57 || '',
        letterOfIntent: input.taxes?.letterOfIntent57 || '',
        quantity: input.taxes?.quantity57 || '',
      },
      {
        tribute: input.taxes?.tribute58 || '',
        value: input.taxes?.value58 || '',
        taxableValue: input.taxes?.taxableValue58 || '',
        rate: input.taxes?.rate58 || '',
        letterOfIntent: input.taxes?.letterOfIntent58 || '',
        quantity: input.taxes?.quantity58 || '',
      },
      {
        tribute: input.taxes?.tribute59 || '',
        value: input.taxes?.value59 || '',
        taxableValue: input.taxes?.taxableValue59 || '',
        rate: input.taxes?.rate59 || '',
        letterOfIntent: input.taxes?.letterOfIntent59 || '',
        quantity: input.taxes?.quantity59 || '',
      },
      {
        tribute: input.taxes?.tribute60 || '',
        value: input.taxes?.value60 || '',
        taxableValue: input.taxes?.taxableValue60 || '',
        rate: input.taxes?.rate60 || '',
        letterOfIntent: input.taxes?.letterOfIntent60 || '',
        quantity: input.taxes?.quantity60 || '',
      },
      {
        tribute: input.taxes?.tribute61 || '',
        value: input.taxes?.value61 || '',
        taxableValue: input.taxes?.taxableValue61 || '',
        rate: input.taxes?.rate61 || '',
        letterOfIntent: input.taxes?.letterOfIntent61 || '',
        quantity: input.taxes?.quantity61 || '',
      },
      {
        tribute: input.taxes?.tribute62 || '',
        value: input.taxes?.value62 || '',
        taxableValue: input.taxes?.taxableValue62 || '',
        rate: input.taxes?.rate62 || '',
        letterOfIntent: input.taxes?.letterOfIntent62 || '',
        quantity: input.taxes?.quantity62 || '',
      },
      {
        tribute: input.taxes?.tribute63 || '',
        value: input.taxes?.value63 || '',
        taxableValue: input.taxes?.taxableValue63 || '',
        rate: input.taxes?.rate63 || '',
        letterOfIntent: input.taxes?.letterOfIntent63 || '',
        quantity: input.taxes?.quantity63 || '',
      },
      {
        tribute: input.taxes?.tribute64 || '',
        value: input.taxes?.value64 || '',
        taxableValue: input.taxes?.taxableValue64 || '',
        rate: input.taxes?.rate64 || '',
        letterOfIntent: input.taxes?.letterOfIntent64 || '',
        quantity: input.taxes?.quantity64 || '',
      },
      {
        tribute: input.taxes?.tribute65 || '',
        value: input.taxes?.value65 || '',
        taxableValue: input.taxes?.taxableValue65 || '',
        rate: input.taxes?.rate65 || '',
        letterOfIntent: input.taxes?.letterOfIntent65 || '',
        quantity: input.taxes?.quantity65 || '',
      },
      {
        tribute: input.taxes?.tribute66 || '',
        value: input.taxes?.value66 || '',
        taxableValue: input.taxes?.taxableValue66 || '',
        rate: input.taxes?.rate66 || '',
        letterOfIntent: input.taxes?.letterOfIntent66 || '',
        quantity: input.taxes?.quantity66 || '',
      },
      {
        tribute: input.taxes?.tribute67 || '',
        value: input.taxes?.value67 || '',
        taxableValue: input.taxes?.taxableValue67 || '',
        rate: input.taxes?.rate67 || '',
        letterOfIntent: input.taxes?.letterOfIntent67 || '',
        quantity: input.taxes?.quantity67 || '',
      },
      {
        tribute: input.taxes?.tribute68 || '',
        value: input.taxes?.value68 || '',
        taxableValue: input.taxes?.taxableValue68 || '',
        rate: input.taxes?.rate68 || '',
        letterOfIntent: input.taxes?.letterOfIntent68 || '',
        quantity: input.taxes?.quantity68 || '',
      },
      {
        tribute: input.taxes?.tribute69 || '',
        value: input.taxes?.value69 || '',
        taxableValue: input.taxes?.taxableValue69 || '',
        rate: input.taxes?.rate69 || '',
        letterOfIntent: input.taxes?.letterOfIntent69 || '',
        quantity: input.taxes?.quantity69 || '',
      },
      {
        tribute: input.taxes?.tribute70 || '',
        value: input.taxes?.value70 || '',
        taxableValue: input.taxes?.taxableValue70 || '',
        rate: input.taxes?.rate70 || '',
        letterOfIntent: input.taxes?.letterOfIntent70 || '',
        quantity: input.taxes?.quantity70 || '',
      },
      {
        tribute: input.taxes?.tribute71 || '',
        value: input.taxes?.value71 || '',
        taxableValue: input.taxes?.taxableValue71 || '',
        rate: input.taxes?.rate71 || '',
        letterOfIntent: input.taxes?.letterOfIntent71 || '',
        quantity: input.taxes?.quantity71 || '',
      },
      {
        tribute: input.taxes?.tribute72 || '',
        value: input.taxes?.value72 || '',
        taxableValue: input.taxes?.taxableValue72 || '',
        rate: input.taxes?.rate72 || '',
        letterOfIntent: input.taxes?.letterOfIntent72 || '',
        quantity: input.taxes?.quantity72 || '',
      },
      {
        tribute: input.taxes?.tribute73 || '',
        value: input.taxes?.value73 || '',
        taxableValue: input.taxes?.taxableValue73 || '',
        rate: input.taxes?.rate73 || '',
        letterOfIntent: input.taxes?.letterOfIntent73 || '',
        quantity: input.taxes?.quantity73 || '',
      },
      {
        tribute: input.taxes?.tribute74 || '',
        value: input.taxes?.value74 || '',
        taxableValue: input.taxes?.taxableValue74 || '',
        rate: input.taxes?.rate74 || '',
        letterOfIntent: input.taxes?.letterOfIntent74 || '',
        quantity: input.taxes?.quantity74 || '',
      },
      {
        tribute: input.taxes?.tribute75 || '',
        value: input.taxes?.value75 || '',
        taxableValue: input.taxes?.taxableValue75 || '',
        rate: input.taxes?.rate75 || '',
        letterOfIntent: input.taxes?.letterOfIntent75 || '',
        quantity: input.taxes?.quantity75 || '',
      },
      {
        tribute: input.taxes?.tribute76 || '',
        value: input.taxes?.value76 || '',
        taxableValue: input.taxes?.taxableValue76 || '',
        rate: input.taxes?.rate76 || '',
        letterOfIntent: input.taxes?.letterOfIntent76 || '',
        quantity: input.taxes?.quantity76 || '',
      },
      {
        tribute: input.taxes?.tribute77 || '',
        value: input.taxes?.value77 || '',
        taxableValue: input.taxes?.taxableValue77 || '',
        rate: input.taxes?.rate77 || '',
        letterOfIntent: input.taxes?.letterOfIntent77 || '',
        quantity: input.taxes?.quantity77 || '',
      },
    ];

    const vatExemption = taxLiquidation.filter((il) => il.tribute == '406');

    const vatExemptionValue = vatExemption.length
      ? Number(
          vatExemption
            .reduce((acc, tax) => {
              return (acc += Number(
                Number(tax.value.replace(',', '.')).toFixed(2),
              ));
            }, 0)
            .toFixed(2),
        )
      : undefined;

    const vatExemptionTaxableValue = vatExemption.length
      ? Number(
          vatExemption
            .reduce((acc, tax) => {
              return (acc += Number(
                Number(tax.taxableValue.replace(',', '.')).toFixed(2),
              ));
            }, 0)
            .toFixed(2),
        )
      : undefined;

    const letterOfIntent = vatExemption.length
      ? vatExemption[0].letterOfIntent
      : undefined;

    const taxB00Vat22Liquidation = taxLiquidation.find(
      (il) => il.tribute == 'B00' && (il.rate == '22,00' || il.rate == '0,22'),
    );

    const taxB00Vat22 = taxB00Vat22Liquidation
      ? Number(
          Number(taxB00Vat22Liquidation.value.replace(',', '.')).toFixed(2),
        )
      : undefined;

    const taxB00Vat10Liquidation = taxLiquidation.find(
      (il) => il.tribute == 'B00' && (il.rate == '10,00' || il.rate == '0,10'),
    );

    const taxB00Vat10 = taxB00Vat10Liquidation
      ? Number(
          Number(taxB00Vat10Liquidation.value.replace(',', '.')).toFixed(2),
        )
      : undefined;

    const taxB00Vat04Liquidation = taxLiquidation.find(
      (il) => il.tribute == 'B00' && (il.rate == '4,00' || il.rate == '0,04'),
    );

    const taxB00Vat04 = taxB00Vat04Liquidation
      ? Number(
          Number(taxB00Vat04Liquidation.value.replace(',', '.')).toFixed(2),
        )
      : undefined;

    const taxB00Vat00Liquidation = taxLiquidation.find(
      (il) => il.tribute == 'B00' && (il.rate == '0,00' || il.rate == '0,00'),
    );

    const taxB00Vat00 = taxB00Vat00Liquidation
      ? Number(
          Number(taxB00Vat00Liquidation.value.replace(',', '.')).toFixed(2),
        )
      : undefined;

    const tax931Liquidation = taxLiquidation.filter(
      (il) => il.tribute == '931',
    );

    const tax931 = tax931Liquidation.length
      ? Number(
          tax931Liquidation
            .reduce((acc, tax) => {
              return (acc += Number(
                Number(tax.value.replace(',', '.')).toFixed(2),
              ));
            }, 0)
            .toFixed(2),
        )
      : undefined;

    const tax931TaxableValue = tax931Liquidation.length
      ? Number(
          tax931Liquidation
            .reduce((acc, tax) => {
              return (acc += Number(
                Number(tax.taxableValue.replace(',', '.')).toFixed(2),
              ));
            }, 0)
            .toFixed(2),
        )
      : undefined;

    const tax931Quantity = tax931Liquidation.length
      ? Number(
          tax931Liquidation
            .reduce((acc, tax) => {
              return (acc += Number(
                Number(tax.quantity.replace(',', '.')).toFixed(2),
              ));
            }, 0)
            .toFixed(2),
        )
      : undefined;

    const tax123Liquidation = taxLiquidation.filter(
      (il) => il.tribute == '123',
    );

    const tax123 = tax123Liquidation.length
      ? Number(
          tax123Liquidation
            .reduce((acc, tax) => {
              return (acc += Number(
                Number(tax.value.replace(',', '.')).toFixed(2),
              ));
            }, 0)
            .toFixed(2),
        )
      : undefined;

    const tax123TaxableValue = tax123Liquidation.length
      ? Number(
          tax123Liquidation
            .reduce((acc, tax) => {
              return (acc += Number(
                Number(tax.taxableValue.replace(',', '.')).toFixed(2),
              ));
            }, 0)
            .toFixed(2),
        )
      : undefined;

    const tax123Quantity = tax123Liquidation.length
      ? Number(
          tax123Liquidation
            .reduce((acc, tax) => {
              return (acc += Number(
                Number(tax.quantity.replace(',', '.')).toFixed(2),
              ));
            }, 0)
            .toFixed(2),
        )
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
      Number(totalTaxes) !=
      Number(
        taxLiquidation
          .filter((tax) => tax.tribute != 'B00' && tax.tribute != '406')
          .reduce((prev, acc) => {
            if (!isNaN(Number(Number(acc.value.replace(',', '.')).toFixed(2))))
              prev += Number(Number(acc.value.replace(',', '.')).toFixed(2));
            return prev;
          }, 0)
          .toFixed(2),
      )
    ) {
      throw new Error('Missing tax mapping');
    }

    if (
      totalVatToBePaid &&
      taxB00Vat22 == undefined &&
      taxB00Vat10 == undefined &&
      taxB00Vat04 == undefined &&
      taxB00Vat00 == undefined
    ) {
      throw new Error('Missing VAT tax');
    }

    if (
      Number(
        (
          (vatExemptionValue || 0) +
          (taxB00Vat00 || 0) +
          (taxB00Vat04 || 0) +
          (taxB00Vat10 || 0) +
          (taxB00Vat22 || 0)
        ).toFixed(2),
      ) != totalVatToBePaid
    ) {
      throw new Error('Missing vat mapping');
    }

    return {
      rectificationOrCancellationDate,
      version,
      totalDuties,
      totalTaxes,
      totalVatToBePaid,
      vatExemption: !!vatExemption.length,
      vatExemptionValue,
      vatExemptionTaxableValue,
      letterOfIntent,
      taxB00Vat22,
      taxB00Vat10,
      taxB00Vat04,
      tax931,
      tax931TaxableValue,
      tax931Quantity,
      tax123,
      tax123TaxableValue,
      tax123Quantity,
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
