import { _cells } from './DeclarationCellsMapper';
import PDFParser from 'pdf2json';
import { AdmDeclarationMapped } from './XMLConverter';

export type DeclarationRawJson = {
  Transcoder: string;
  Meta: {
    PDFFormatVersion: string;
    IsAcroFormPresent: boolean;
    IsXFAPresent: false;
    Title: string;
    Author: string;
    Subject: string;
    Creator: string;
    Producer: string;
    CreationDate: string;
    ModDate: string;
    Metadata: {
      'xmp:creatortool': string;
      'xmp:metadatadate': string; //date
      'xmp:modifydate': string; //date
      'xmp:createdate': string; //date
      'pdf:producer': string;
      'xmpmm:documentid': string;
      'xmpmm:instanceid': string;
      'dc:format': string;
      'dc:description': string;
      'dc:creator': string;
      'dc:title': string;
      'desc:version': string;
      'desc:embeddedhref': string;
    };
  };
  Pages: [
    {
      Width: number;
      Height: number;
      HLines: [{ x: number; y: number; w: number; l: number; oc: string }[]];
      VLines: [{ x: number; y: number; w: number; l: number; oc: string }[]];
      Fills: [];
      Texts: [
        {
          x: number;
          y: number;
          w: number;
          clr: number;
          sw: number;
          A: string;
          R: [{ T: string; S: number; TS: number[] }];
        },
      ];
      Fields: [];
      Boxsets: [];
    },
  ];
};

export interface DeclarationJson {
  date: Date;
  declarationId: number;
  cbamRequestId: number;
  authorId: number;
  mrn: string;
  entity?: {
    column: string;
    value: string;
    x?: number;
    y?: number;
  };
  declaration: {
    date1: string;
    date2: string;
    mrn: string;
  };
  supplier: {
    companyName1: string;
    companyName2: string;
    companyName3: string;
    companyName4: string;
    vatNumber: string;
    country1: string;
    country2: string;
    country3: string;
    address1: string;
    address2: string;
    address3: string;
    address4: string;
    address5: string;
    address6: string;
    city1: string;
    city2: string;
    city3: string;
    city4: string;
    postalCode1: string;
    postalCode2: string;
    postalCode3: string;
  };
  goods: {
    ncCode: string;
    taricCode: string;
    identificationCode: string;
    description: string;
    description1: string;
    description2: string;
    description3: string;
    description4: string;
    description5: string;
    description6: string;
    description7: string;
    description8: string;
    country1: string;
    country2: string;
    country3: string;
    country4: string;
    country5: string;
    country6: string;
    country7: string;
    country8: string;
    country9: string;
    netWeight: string;
    customsRegime: string;
    requestedRegime: string;
    previousRegime: string;
  }[];
}

class PDFConverter {
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
  private async map(input: DeclarationJson): Promise<AdmDeclarationMapped> {
    const companyName: string[] = [
      input.supplier?.companyName1,
      input.supplier?.companyName2,
      input.supplier?.companyName3,
      input.supplier?.companyName4,
    ];
    const address: string[] = [
      input.supplier?.address1,
      input.supplier?.address2,
      input.supplier?.address3,
      input.supplier?.address4,
      input.supplier?.address5,
      input.supplier?.address6,
    ];

    const city: string[] = [
      input.supplier?.city1,
      input.supplier?.city2,
      input.supplier?.city3,
      input.supplier?.city4,
    ];

    const country: string =
      input.supplier?.country1?.trim() ||
      input.supplier?.country2?.trim() ||
      input.supplier?.country3?.trim() ||
      '';

    const postalCode: string =
      input.supplier?.postalCode1?.trim() ||
      input.supplier?.postalCode2?.trim() ||
      input.supplier?.postalCode3?.trim() ||
      '';

    const supplier = {
      companyName: companyName.join(' ').trim(),
      vatNumber: input.supplier?.vatNumber || '',
      country: country.trim(),
      address: address.join(' '),
      city: city.join(' ').trim(),
      postalCode: postalCode,
    };

    const date: string =
      input.declaration.date1 || input.declaration.date2 || '';

    const goods = input.goods.map((good) => {
      const ncCode = good.ncCode.slice(0, -2);
      const taricCode = good.ncCode.slice(-2);

      const requestedRegime = good.customsRegime.slice(0, 2).trim();
      const previousRegime = good.customsRegime.slice(-2).trim();
      const customsRegime = `${requestedRegime}${previousRegime}`;

      const description: string[] = [
        good.description,
        good.description1,
        good.description2,
        good.description3,
        good.description4,
        good.description5,
        good.description6,
        good.description7,
        good.description8,
      ];

      const country: string =
        good.country1?.trim() ||
        good.country2?.trim() ||
        good.country3?.trim() ||
        good.country4?.trim() ||
        good.country5?.trim() ||
        good.country6?.trim() ||
        good.country7?.trim() ||
        good.country8?.trim() ||
        good.country9?.trim() ||
        '';

      return {
        ncCode,
        taricCode,
        identificationCode: good.ncCode,
        description: description.join(' ').trim(),
        country: country,
        netWeight: good.netWeight,
        customsRegime: customsRegime,
        requestedRegime: requestedRegime,
        previousRegime: previousRegime,
      };
    });

    return {
      mrn: input.declaration.mrn,
      date: date,
      supplier,
      goods,
    };
  }
  public async run(params: {
    data: {
      path: string;
    };
  }): Promise<AdmDeclarationMapped> {
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
      const declarationEntity: any = {
        date: new Date(),
        declarationId: 0,
        cbamRequestId: 0,
        authorId: 0,
        mrn: '',
      };

      if (!!declarationRawJson && declarationRawJson.Pages) {
        const pages = declarationRawJson.Pages;

        for (let i = 0; i < pages.length; i++) {
          const page = pages[i];
          if (page.Texts) {
            /* eslint-disable @typescript-eslint/no-explicit-any */
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
                  if (!declarationEntity[mappedPosition.entity])
                    declarationEntity[mappedPosition.entity] = [];

                  if (Array.isArray(declarationEntity[mappedPosition.entity])) {
                    goodObject[mappedPosition.column] = text.trim();

                    const lastItem =
                      declarationEntity[mappedPosition.entity].slice(-1)[0];

                    const isNewItem =
                      !lastItem ||
                      (lastItem.nr !== goodObject.nr &&
                        !!goodObject.ncCode &&
                        goodObject.ncCode.length > 0 &&
                        goodObject.ncCode.length <= 10 &&
                        !isNaN(parseFloat(goodObject.netWeight)));

                    if (isNewItem)
                      declarationEntity[mappedPosition.entity].push(goodObject);
                  }
                } else {
                  if (!declarationEntity[mappedPosition.entity])
                    declarationEntity[mappedPosition.entity] = {};
                  declarationEntity[mappedPosition.entity][
                    mappedPosition.column
                  ] = text.trim();
                }
              }
            }
          }
        }
      } else {
        throw new Error('No Pages found in the PDF.');
      }

      const admDeclarationMapped = await this.map(declarationEntity);
      return admDeclarationMapped;
    } catch (error) {
      throw new Error('Error parsing PDF:' + error); // Returning an empty object
    }
  }
}
export default PDFConverter;
