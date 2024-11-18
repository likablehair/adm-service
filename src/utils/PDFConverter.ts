import { _cells } from './DeclarationCellsMapper'
import PDFParser from 'pdf2json'

export type DeclarationRawJson = {
  Transcoder: string
  Meta: {
    PDFFormatVersion: string
    IsAcroFormPresent: boolean
    IsXFAPresent: false
    Title: string
    Author: string
    Subject: string
    Creator: string
    Producer: string
    CreationDate: string
    ModDate: string
    Metadata: {
      'xmp:creatortool': string
      'xmp:metadatadate': string //date
      'xmp:modifydate': string //date
      'xmp:createdate': string //date
      'pdf:producer': string
      'xmpmm:documentid': string
      'xmpmm:instanceid': string
      'dc:format': string
      'dc:description': string
      'dc:creator': string
      'dc:title': string
      'desc:version': string
      'desc:embeddedhref': string
    }
  }
  Pages: [
    {
      Width: number
      Height: number
      HLines: [{ x: number; y: number; w: number; l: number; oc: string }[]]
      VLines: [{ x: number; y: number; w: number; l: number; oc: string }[]]
      Fills: []
      Texts: [
        {
          x: number
          y: number
          w: number
          clr: number
          sw: number
          A: string
          R: [{ T: string; S: number; TS: number[] }]
        }
      ]
      Fields: []
      Boxsets: []
    }
  ]
}

export interface Good {
  nr: string
  cn: string
  grossWeight: string
  netWeight: string
  description: string
  price: string,
  shippingCountry: string, 
  destinationCountry: string,
  destinationProvince: string,
  originCountry : string,  
  directEmission : number,
  indirectEmission : number,
  totalEmission : number,
  directEmissionIntensity: number,
  indirectEmissionIntensity: number,
  isCbam : boolean ,
  category: string,  
}

export interface DeclarationJson {
  date: Date
  declarationId: number
  cbamRequestId: number
  authorId: number
  mrn: string
  entity?: {
    column: string
    value: string
    x?: number
    y?: number
  }
  declaration: { date: string, mrn: string },
  exporter: {
    companyName: string;
    vatNumber: string;
    country: string;
    address: string;
    city: string;
    postalCode: string;
  };
  goods: {
    ncCode: string;
    taricCode: string;
    identificationCode: string;
    description: string;
    country: string;
    netWeight: string;
    customsRegime: string;
    requestedRegime: string;
    previousRegime: string;
  }[];
}

export type AdmDeclarationMapped = {
  mrn: string;
  date: string;
  exporter: {
    companyName: string;
    vatNumber: string;
    country: string;
    address: string;
    city: string;
    postalCode: string;
  };
  goods: {
    ncCode: string;
    taricCode: string;
    identificationCode: string;
    description: string;
    country: string;
    netWeight: string;
    customsRegime: string;
    requestedRegime: string;
    previousRegime: string;
  }[];
};


class PDFConverter {
  
  private getMappedPosition(x: number, y: number): { entity?: string; column?: string } {
    const _x = x.toFixed(3)
    const _y = y.toFixed(3)
    const _xy: string = _x.toString() + '-' + _y.toString()
  
    _cells[Number(_xy)] = { xRange: [x, x], yRange: [y, y] }
  
    for (const cell in _cells) {
      if (Object.prototype.hasOwnProperty.call(_cells, cell)) {
        const { xRange, yRange, entity, column } = _cells[cell]
        if (x >= xRange[0] && x <= xRange[1] && y >= yRange[0] && y <= yRange[1]) {
          return { entity, column } 
        }
      }
    }
    return {}
  }
  private async map(input: DeclarationJson): Promise<AdmDeclarationMapped> {
    
    const exporter = {
        companyName: input.exporter?.companyName || '', 
        vatNumber: input.exporter?.vatNumber || '',
        country: input.exporter?.country || '',
        address: input.exporter?.address || '',
        city: input.exporter?.city || '',
        postalCode: input.exporter?.postalCode || ''
    };

    const goods = input.goods.map(good => {
      const ncCode = good.ncCode.slice(0, -2);
      const taricCode = good.ncCode.slice(-2); 
      
      const requestedRegime = good.customsRegime.slice(0, 2).trim(); 
      const previousRegime = good.customsRegime.slice(-2).trim();
      const customsRegime = `${requestedRegime}${previousRegime}`; 
      return {
        ncCode, 
        taricCode, 
        identificationCode: good.ncCode, 
        description: good.description,
        country: good.country,
        netWeight: good.netWeight,
        customsRegime: customsRegime, 
        requestedRegime: requestedRegime, 
        previousRegime: previousRegime  
      };
    });

    return {
        mrn: input.declaration.mrn,
        date: input.declaration.date, 
        exporter,
        goods
    };
}
  public async run(params: {
    data: {      
      path: string
    }
  }): Promise<AdmDeclarationMapped> {
    const pdfParser = new PDFParser()
  
    const loadDeclarationFromPDF = new Promise<DeclarationRawJson>((resolve, reject) => {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      pdfParser.on('pdfParser_dataError', (errData: any) => {
        reject(errData.parserError)
      })
      /* eslint-disable @typescript-eslint/no-explicit-any */
      pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
        resolve(pdfData)
      })
  
      pdfParser.loadPDF(params.data.path)
    })
  
    try {
      const declarationRawJson: DeclarationRawJson = await loadDeclarationFromPDF
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const declarationEntity: any = {
        date: new Date(),
        declarationId: 0,
        cbamRequestId: 0, 
        authorId: 0,
        mrn: ''
      }
  
      if (!!declarationRawJson && declarationRawJson.Pages) {
        const pages = declarationRawJson.Pages
  
        for (let i = 0; i < pages.length; i++) {
          const page = pages[i]
  
          if (page.Texts) {
            /* eslint-disable @typescript-eslint/no-explicit-any */
            const goodObject: any = {}
            for (let j = 0; j < page.Texts.length; j++) {
              const textElement = page.Texts[j]
              const text = decodeURIComponent(textElement.R[0].T)

              // console.log({ "x": textElement.x, "y": textElement.y, "text": text })
              const mappedPosition: { entity?: string; column?: string  } = this.getMappedPosition(
                textElement.x,
                textElement.y
              )
  
              const totColumnsMapped = _cells.filter(
                (el) => el.entity === mappedPosition.entity
              ).length
  
              if (!mappedPosition.column || !text.trim()) {
                continue
              } else if (!!mappedPosition.entity && !!mappedPosition.column) {

                if (i > 0) {
                  if (!declarationEntity[mappedPosition.entity])
                    declarationEntity[mappedPosition.entity] = []
                  if (Array.isArray(declarationEntity[mappedPosition.entity])) {
                    goodObject[mappedPosition.column] = text.trim()
  
                    if (Object.keys(goodObject).length === totColumnsMapped)
                      declarationEntity[mappedPosition.entity].push(goodObject)
                  }
                } else {
                  if (!declarationEntity[mappedPosition.entity])
                    declarationEntity[mappedPosition.entity] = {}
                  declarationEntity[mappedPosition.entity][mappedPosition.column] = text.trim()
                }
              }
            }
          }
        }
      } else {
        throw new Error('No Pages found in the PDF.')
      }
  
      
      // console.log(declarationEntity)
      const admDeclarationMapped = await this.map(declarationEntity)
      // console.log(admDeclarationMapped)
      return admDeclarationMapped  
    } catch (error) {
      throw new  Error('Error parsing PDF:' + error) // Returning an empty object
    }
  }


}
export default PDFConverter
