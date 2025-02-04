import { _cells } from './AccountingCellsMapper';
import PDFParser from 'pdf2json';
import { DeclarationRawJson } from './PDFConverter';

export type AccountingStatementMapped = {
  totalDuties: string;
  totalVat: string | undefined;
  vatExemption: boolean;
  vatExemptionValue: string | undefined;
};

export interface AccountingJson {
  statement: {
    totalDuties1: string;
    totalDuties2: string;
    totalDuties3: string;
    totalDuties4: string;
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
    const totalDuties =
      input.statement.totalDuties1?.trim() ||
      input.statement.totalDuties2?.trim() ||
      input.statement.totalDuties3?.trim() ||
      input.statement.totalDuties4?.trim() ||
      '';

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
    ];

    const vatExemptionLiquidation = ivaLiquidation.find(
      (il) => il.tribute == '406',
    );

    const totalVatLiquidation = ivaLiquidation.find(
      (il) => il.tribute == 'B00',
    );

    return {
      totalDuties,
      totalVat: totalVatLiquidation?.value,
      vatExemption: !!vatExemptionLiquidation,
      vatExemptionValue: vatExemptionLiquidation?.value,
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

              // if(i == 0){
              //   console.log({ "x": textElement.x, "y": textElement.y, "text": text })
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
