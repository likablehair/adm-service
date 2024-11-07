import { Cookie, Page } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

export default class AdmRPA {

  constructor() {
    puppeteer.use(StealthPlugin());
  }

  async getMRNList(params: {
    dichiarante: string;
    security: {
      username: string;
      password: string;
    }
  }) {
    try {
      const browser = await puppeteer.launch({
        headless: 'shell',
        args: ['--lang=it-IT,it'],
        env: {
          LANGUAGE: 'it_IT',
        },
      });

      console.log('browser launched');
      const page = await browser.newPage();

      await page.setExtraHTTPHeaders({
        'Accept-Language': 'it-IT,it;q=0.9,en;q=0.8',
      });

      const cookies = await this.loginADM({
        page,
        username: params.security.username,
        password: params.security.password,
      });

      page.setCookie(...cookies);

      const gestioneDocumentiPage = await this.accessToGestioneDocumenti({
        page,
        dichiarante: params.dichiarante,
      });

      await this.aggregatedSearch({
        page: gestioneDocumentiPage,
      });

      await browser.close();
    } catch (error) {
      console.error(error);
    }
  }

  async loginADM(params: {
    page: Page;
    username: string;
    password: string;
  }): Promise<Cookie[]> {
    const url = 'https://iampe.adm.gov.it/sam/UI/Login?realm=/adm';

    await params.page.goto(url);

    await params.page.type('input[name="IDToken1"]', params.username);
    await params.page.type('input[name="IDToken2"]', params.password);

    await params.page.locator('button ::-p-text(Accedi)').click();

    const response = await params.page.waitForNavigation();
    const requestHeaders = response?.request().headers();

    console.log('headers', requestHeaders);

    const cookies = await params.page.cookies();

    return cookies;
  }

  async accessToGestioneDocumenti(params: {
    page: Page;
    dichiarante: string;
  }) {
    const url =
      'https://sso.adm.gov.it/pud2interop85cast?Location=https://web.adm.gov.it/ponimport/xhtml/index.xhtml';
    await params.page.goto(url);

    const dropdownLabelXPath = 'xpath///*[@id="formDel:j_idt47_label"]';
    const dropdownOptionXPath = `aria/${params.dichiarante}[role="option"]`;
    const buttonConfirmXPath = 'xpath///*[@id="formDel:idGoto"]/span';

    await params.page.waitForSelector(dropdownLabelXPath);
    await params.page.click(dropdownLabelXPath);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log('clicked on label');

    await params.page.waitForSelector(dropdownOptionXPath);
    await params.page.click(dropdownOptionXPath);

    console.log('clicked on option');

    await new Promise((resolve) => setTimeout(resolve, 2000));

    await params.page.waitForSelector(buttonConfirmXPath);
    await params.page.click(buttonConfirmXPath);

    console.log('clicked on button');

    await params.page.waitForNavigation();

    console.log('navigated');

    return params.page;
  }

  async aggregatedSearch(params: {
    page: Page
  }) {
    const ricercaAggregataTabXPath =
      'xpath///*[@id="formAvan:accordionTab:tabRicercaAggregata_header"]';
    const ricercaAggregataButtonXPath =
      'xpath///*[@id="formAvan:accordionTab:buttonRicercaAgg"]/span';

    await params.page.waitForSelector(ricercaAggregataTabXPath);
    await params.page.click(ricercaAggregataTabXPath);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    await params.page.waitForSelector(ricercaAggregataButtonXPath);
    await params.page.click(ricercaAggregataButtonXPath);

    const contentPanelDataXPath = 'xpath///*[@id="formResult:dataResult_data"]';

    await params.page.waitForSelector(contentPanelDataXPath);

    const tableData = await params.page.evaluate(() => {
      const rows = document.querySelectorAll(
        '#formResult\\:dataResult_data tr',
      );
      const tbody = document.querySelector<HTMLTableSectionElement>(
        '#formResult\\:dataResult_data',
      );
      const headerCells = tbody?.closest('table')?.querySelectorAll('th');

      const headersData: string[] = [];
      headerCells?.forEach((header) => {
        headersData.push(header.innerText.trim().toString());
      });

      const data: {
        [key: string]: string;
      }[] = [];

      rows.forEach((row) => {
        const cells = row.querySelectorAll('td');
        const rowData: {
          [key: string]: string;
        } = {};

        cells.forEach((cell, index) => {
          const headerName = headersData[index] || `column-${index + 1}`;
          rowData[headerName] = cell.innerText.trim();
        });

        data.push(rowData);
      });

      return data;
    });

    console.log(tableData);
  }
}
