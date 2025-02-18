import { _cells } from './AccountingCellsMapper';
import PDFParser from 'pdf2json';
import { DeclarationRawJson } from './PDFConverter';

export type AccountingStatementMapped = {
  version: string;
  totalDuties: number;
  totalVat: number;
  vatExemption: boolean;
  vatExemptionValue: number | undefined;
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
    tribute14: string;
    value14: string;
    tribute15: string;
    value15: string;
    tribute16: string;
    value16: string;
    tribute17: string;
    value17: string;
    tribute18: string;
    value18: string;
    tribute19: string;
    value19: string;
    tribute20: string;
    value20: string;
    tribute21: string;
    value21: string;
    tribute22: string;
    value22: string;
    tribute23: string;
    value23: string;
    tribute24: string;
    value24: string;
    tribute25: string;
    value25: string;
    tribute26: string;
    value26: string;
    tribute27: string;
    value27: string;
    tribute28: string;
    value28: string;
    tribute29: string;
    value29: string;
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
  private map(input: AccountingJson): AccountingStatementMapped {
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

    const ivaLiquidation: { tribute: string; value: string }[] = [
      {
        tribute: input.statement.tribute1 || '',
        value: input.statement.value1 || '',
      },
      {
        tribute: input.statement.tribute2 || '',
        value: input.statement.value2 || '',
      },
      {
        tribute: input.statement.tribute3 || '',
        value: input.statement.value3 || '',
      },
      {
        tribute: input.statement.tribute3 || '',
        value: input.statement.value3 || '',
      },
      {
        tribute: input.statement.tribute4 || '',
        value: input.statement.value4 || '',
      },
      {
        tribute: input.statement.tribute5 || '',
        value: input.statement.value5 || '',
      },
      {
        tribute: input.statement.tribute6 || '',
        value: input.statement.value6 || '',
      },
      {
        tribute: input.statement.tribute7 || '',
        value: input.statement.value7 || '',
      },
      {
        tribute: input.statement.tribute8 || '',
        value: input.statement.value8 || '',
      },
      {
        tribute: input.statement.tribute9 || '',
        value: input.statement.value9 || '',
      },
      {
        tribute: input.statement.tribute10 || '',
        value: input.statement.value10 || '',
      },
      {
        tribute: input.statement.tribute11 || '',
        value: input.statement.value11 || '',
      },
      {
        tribute: input.statement.tribute12 || '',
        value: input.statement.value12 || '',
      },
      {
        tribute: input.statement.tribute13 || '',
        value: input.statement.value13 || '',
      },
      {
        tribute: input.statement.tribute14 || '',
        value: input.statement.value14 || '',
      },
      {
        tribute: input.statement.tribute15 || '',
        value: input.statement.value15 || '',
      },
      {
        tribute: input.statement.tribute16 || '',
        value: input.statement.value16 || '',
      },
      {
        tribute: input.statement.tribute17 || '',
        value: input.statement.value17 || '',
      },
      {
        tribute: input.statement.tribute18 || '',
        value: input.statement.value18 || '',
      },
      {
        tribute: input.statement.tribute19 || '',
        value: input.statement.value19 || '',
      },
      {
        tribute: input.statement.tribute20 || '',
        value: input.statement.value20 || '',
      },
      {
        tribute: input.statement.tribute21 || '',
        value: input.statement.value21 || '',
      },
      {
        tribute: input.statement.tribute22 || '',
        value: input.statement.value22 || '',
      },
      {
        tribute: input.statement.tribute23 || '',
        value: input.statement.value23 || '',
      },
      {
        tribute: input.statement.tribute24 || '',
        value: input.statement.value24 || '',
      },
      {
        tribute: input.statement.tribute25 || '',
        value: input.statement.value25 || '',
      },
      {
        tribute: input.statement.tribute26 || '',
        value: input.statement.value26 || '',
      },
      {
        tribute: input.statement.tribute27 || '',
        value: input.statement.value27 || '',
      },
      {
        tribute: input.statement.tribute28 || '',
        value: input.statement.value28 || '',
      },
      {
        tribute: input.statement.tribute29 || '',
        value: input.statement.value29 || '',
      },
    ];

    const vatExemptionLiquidation = ivaLiquidation.find(
      (il) => il.tribute == '406',
    );

    const filteredVatLiquidation = ivaLiquidation.filter(
      (il) => il.tribute == 'B00',
    );

    const totalVat =
      filteredVatLiquidation.length > 0
        ? filteredVatLiquidation.reduce((acc, cur) => {
            return (acc += Number(cur.value.replace(',', '.')));
          }, 0)
        : undefined;

    const vatExemptionValue = vatExemptionLiquidation
      ? Number(
          Number(vatExemptionLiquidation.value.replace(',', '.')).toFixed(2),
        )
      : undefined;

    if (totalDuties == undefined) {
      throw new Error('Missing total duties');
    }

    if (totalVat == undefined) {
      throw new Error('Missing total vat');
    }

    return {
      rectificationOrCancellationDate,
      version,
      totalDuties,
      totalVat,
      vatExemption: !!vatExemptionLiquidation,
      vatExemptionValue,
    };
  }
  public async run(params: {
    data: {
      path: string;
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

      const accountingStatementMapped = this.map(accountingEntity);
      return accountingStatementMapped;
    } catch (error) {
      throw new Error('parsing PDF Accounting:' + error); // Returning an empty object
    }
  }
}
export default AccountingPDFConverter;
