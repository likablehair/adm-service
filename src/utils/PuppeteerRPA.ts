import { Cookie, Page } from 'puppeteer'
import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

export default class PuppeteerRPA {
  admUsername: string;
  admPassword: string;

  constructor (admUsername: string, admPassword: string) {
    puppeteer.use(StealthPlugin())
    this.admUsername = admUsername
    this.admPassword = admPassword
  }

  async main() {
    try {
      const browser = await puppeteer.launch({
        headless: 'shell',
        args: [
          '--lang=it-IT,it',
          'accept-lang=it'
        ],
        env: {
          LANGUAGE: 'it_IT',
        }
      })

      console.log('browser launched')
      const page = await browser.newPage()

      await page.setExtraHTTPHeaders({
        'Accept-Language': 'it-IT,it;q=0.9,en;q=0.8'
      })

      await this.loginADM(page)
      await this.accessToGestioneDocumenti(page)
      await this.listMRN(page)

      await browser.close()
    } catch (error) {
      console.error(error)
    }

  }

  async loginADM(page: Page): Promise<Cookie[]> {
    const url = 'https://iampe.adm.gov.it/sam/UI/Login?realm=/adm'

    await page.goto(url)
    
    await page.type('input[name="IDToken1"]', this.admUsername)
    await page.type('input[name="IDToken2"]', this.admPassword)
    
    await page.locator('button ::-p-text(Accedi)').click()

    const response = await page.waitForNavigation()
    const requestHeaders = response?.request().headers()

    console.log('headers', requestHeaders)

    const cookies = await page.cookies()

    return cookies
  }

  async accessToGestioneDocumenti(page: Page) {
    const url = 'https://sso.adm.gov.it/pud2interop85cast?Location=https://web.adm.gov.it/ponimport/xhtml/index.xhtml'
    await page.goto(url)

    const dropdownLabelXPath = 'xpath///*[@id="formDel:j_idt47_label"]'
    const dropdownOptionXPath = `aria/${this.admUsername}[role="option"]`
    const buttonConfirmXPath = 'xpath///*[@id="formDel:idGoto"]/span'

    await page.waitForSelector(dropdownLabelXPath)
    await page.click(dropdownLabelXPath)

    await new Promise(resolve => setTimeout(resolve, 2000))

    console.log('clicked on label')

    await page.waitForSelector(dropdownOptionXPath)
    await page.click(dropdownOptionXPath)

    console.log('clicked on option')

    await new Promise(resolve => setTimeout(resolve, 2000))

    await page.waitForSelector(buttonConfirmXPath)
    await page.click(buttonConfirmXPath)

    console.log('clicked on button')

    await page.waitForNavigation()

    console.log('navigated')
  }

  async listMRN(page: Page) {
    const ricercaAggregataTabXPath = 'xpath///*[@id="formAvan:accordionTab:tabRicercaAggregata_header"]'
    const ricercaAggregataButtonXPath = 'xpath///*[@id="formAvan:accordionTab:buttonRicercaAgg"]/span'

    await page.waitForSelector(ricercaAggregataTabXPath)
    await page.click(ricercaAggregataTabXPath)

    await new Promise(resolve => setTimeout(resolve, 2000))

    await page.waitForSelector(ricercaAggregataButtonXPath)
    await page.click(ricercaAggregataButtonXPath) 

    const contentPanelDataXPath = 'xpath///*[@id="formResult:dataResult_data"]'

    await page.waitForSelector(contentPanelDataXPath)

    const tableData = await page.evaluate(() => {
      const rows = document.querySelectorAll('#formResult\\:dataResult_data tr');
      const tbody = document.querySelector<HTMLTableSectionElement>('#formResult\\:dataResult_data');
      const headerCells = tbody?.closest('table')?.querySelectorAll('th')

      const headersData: string[] = []
      headerCells?.forEach((header) => {
        headersData.push(header.innerText.trim().toString())
      })

      const data: {
        [key: string]: string
      }[] = []

      rows.forEach((row) => {
        const cells = row.querySelectorAll('td')
        const rowData: {
          [key: string]: string
        } = {}

        cells.forEach((cell, index) => {
          const headerName = headersData[index] || `column-${index + 1}`
          rowData[headerName] = cell.innerText.trim();
      });

        data.push(rowData)
      })

      return data
    })

    console.log(tableData)

  }
}