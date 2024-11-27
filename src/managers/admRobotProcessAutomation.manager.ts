import { Browser, Cookie, Page } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

export type DeclarationTableRow = {
  [key: string]: string;
};

export type Declaration = {
  declaratingOperator: string;
  mrn: string;
  lrn: string;
  operationScope: string;
  acceptanceDate: string;
  officeCode: string;
  articlesNumber: string;
  version: string;
  edStatus: string;
  detailsButtonClass: string;
};

const declarationTableHeaderMap: Record<string, keyof Declaration> = {
  'Declarating Operator': 'declaratingOperator',
  Dichiarante: 'declaratingOperator',
  Mrn: 'mrn',
  Lrn: 'lrn',
  Type: 'operationScope',
  Ambito: 'operationScope',
  'Acceptance Date and Hours': 'acceptanceDate',
  'Data e Ora Accettazione': 'acceptanceDate',
  'Office Code': 'officeCode',
  'Codice Ufficio': 'officeCode',
  'Articles Number': 'articlesNumber',
  'Numero Articoli': 'articlesNumber',
  Ver: 'version',
  'ED Status': 'edStatus',
  'Stato FE': 'edStatus',
  Details: 'detailsButtonClass',
  Dettagli: 'detailsButtonClass',
};

export default class AdmRobotProcessAutomationManager {
  constructor() {
    puppeteer.use(StealthPlugin());
  }

  async getMRNList(params: {
    dichiarante: string;
    dateFrom?: Date;
    dateTo?: Date;
    security: {
      username: string;
      password: string;
    };
    browser?: Browser;
  }): Promise<string[]> {
    try {
      let browser: Browser;
      if (!params.browser) {
        browser = await puppeteer.launch({
          headless: 'shell',
          args: ['--lang=it-IT'],
          env: {
            LANGUAGE: 'it_IT',
          },
        });
      } else {
        browser = params.browser;
      }

      console.log('browser launched');
      const page = await browser.newPage();

      await page.setExtraHTTPHeaders({
        'Accept-Language': 'it-IT,it;q=0.9',
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

      let declarations: Declaration[] = [];
      if (params.dateFrom && params.dateTo) {
        const currentDate = new Date(params.dateFrom);
        const dateTo = new Date(params.dateTo);
        dateTo.setHours(0, 0, 0, 0);
        currentDate.setHours(0, 0, 0, 0);

        while (currentDate <= dateTo) {
          const declarationsFromDate = await this.aggregatedSearch({
            page: gestioneDocumentiPage,
            date: currentDate,
          });

          declarations = [...declarations, ...declarationsFromDate];

          currentDate.setDate(currentDate.getDate() + 1);
        }
      } else {
        declarations = await this.aggregatedSearch({
          page: gestioneDocumentiPage,
          date: params.dateFrom,
        });
      }

      const mrnList = declarations.map((declaration) => declaration.mrn);

      if (!params.browser) {
        await browser.close();
      }

      return mrnList;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async loginADM(params: {
    page: Page;
    username: string;
    password: string;
  }): Promise<Cookie[]> {
    try {
      const url = 'https://iampe.adm.gov.it/sam/UI/Login?realm=/adm';

      await this._retry({
        promiseFactory: () => params.page.goto(url),
        retryCount: 5,
        retryMs: 500,
      });

      await params.page.type('input[name="IDToken1"]', params.username);
      await params.page.type('input[name="IDToken2"]', params.password);

      const accessButtonXPath = 'xpath///*[@id="tab-1"]/form/div/a/button';

      await params.page.waitForSelector(accessButtonXPath);

      await Promise.all([
        this._retry({
          promiseFactory: () => params.page.waitForNavigation(),
          retryCount: 3,
          retryMs: 500,
        }),
        params.page.click(accessButtonXPath),
      ]);

      const cookies = await params.page.cookies();

      return cookies;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async accessToGestioneDocumenti(params: { page: Page; dichiarante: string }) {
    try {
      const url =
        'https://sso.adm.gov.it/pud2interop85cast?Location=https://web.adm.gov.it/ponimport/xhtml/index.xhtml';

      await params.page.goto(url);

      const dropdownLabelDichiaranteXPath = 'xpath///*[@id="formDel:j_idt50_label"]';
      const dropdownOptionDichiaranteXPath = `aria/${params.dichiarante}[role="option"]`;
      const buttonConfirmXPath = 'xpath///*[@id="formDel:idGoto"]/span';

      await params.page.waitForSelector(dropdownLabelDichiaranteXPath);
      await params.page.click(dropdownLabelDichiaranteXPath);

      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log('clicked on label');

      await params.page.waitForSelector(dropdownOptionDichiaranteXPath);
      await params.page.click(dropdownOptionDichiaranteXPath);

      console.log('clicked on option');

      await new Promise((resolve) => setTimeout(resolve, 1500));

      await params.page.waitForSelector(buttonConfirmXPath);

      console.log('clicked on button');

      await Promise.all([
        this._retry({
          promiseFactory: () => params.page.waitForNavigation(),
          retryCount: 3,
          retryMs: 500,
        }),
        params.page.click(buttonConfirmXPath),
      ]);

      console.log('navigated');

      return params.page;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async aggregatedSearch(params: {
    page: Page;
    date?: Date;
  }): Promise<Declaration[]> {
    try {
      const ricercaAggregataTabXPath =
        'xpath///*[@id="formAvan:accordionTab:tabRicercaAggregata_header"]';
      const ricercaAggregataButtonXPath =
        'xpath///*[@id="formAvan:accordionTab:buttonRicercaAgg"]/span';

      await params.page.waitForSelector(ricercaAggregataTabXPath);
      await params.page.click(ricercaAggregataTabXPath);

      await new Promise((resolve) => setTimeout(resolve, 1500));

      //Check if the dateFrom is provided
      if (params.date) {
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        params.date.setHours(0, 0, 0, 0);

        if (params.date > currentDate) {
          throw new Error('Invalid date: date is in the future');
        }

        const dateFromInputXPath =
          'xpath///*[@id="formAvan:accordionTab:dataRegistrazioneDa"]/button';
        await params.page.waitForSelector(dateFromInputXPath);
        await params.page.click(dateFromInputXPath);

        await new Promise((resolve) => setTimeout(resolve, 1500));

        const datePickerCalendarXPath =
          'xpath///*[@id="ui-datepicker-div"]/table';
        await params.page.waitForSelector(datePickerCalendarXPath);

        const day = params.date.getDate();
        const month = params.date.getMonth() + 1;
        const year = params.date.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();

        const monthDifferece = currentMonth - month;
        const yearDifference = currentYear - year;

        const dateDifferenceIteration = monthDifferece + yearDifference * 12;

        if (dateDifferenceIteration > 0) {
          const previousMonthButtonXPath =
            'xpath///*[@id="ui-datepicker-div"]/div/a[1]';

          //Iterate over the months
          for (let i = 0; i < dateDifferenceIteration; i++) {
            await params.page.waitForSelector(previousMonthButtonXPath);
            await params.page.click(previousMonthButtonXPath);

            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }

        const datePosition = this._getDatePositionInDatepicker({
          day,
          month,
          year,
        });

        const dateCellXPath = `xpath///*[@id="ui-datepicker-div"]/table/tbody/tr[${
          datePosition.row
        }]/td[${datePosition.column}]`;

        await params.page.waitForSelector(dateCellXPath);
        await params.page.click(dateCellXPath);

        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      await params.page.waitForSelector(ricercaAggregataButtonXPath);
      await params.page.click(ricercaAggregataButtonXPath);

      await new Promise((resolve) => setTimeout(resolve, 1500));

      const resultFoundText = await params.page.evaluate(() => {
        const resultFoundText = document.querySelector(
          '#formResult\\:panelRisultati_content',
        ) as HTMLElement | undefined;
        if (resultFoundText) {
          return resultFoundText.innerText.split('\n')[0];
        } else {
          return undefined;
        }
      });

      let mrnNumber: number = 0;
      if (resultFoundText) {
        const splittedResultFoundText = resultFoundText.split(/\s|&nbsp;/g);
        mrnNumber = Number(
          splittedResultFoundText[splittedResultFoundText.length - 1],
        );
      }

      if (mrnNumber > 5) {
        //Set the number of rows to 30 (max option available)
        const rowsPerPageDropdownXPath =
          'xpath///*[@id="formResult:dataResult:j_id44"]';
        await params.page.waitForSelector(rowsPerPageDropdownXPath);
        await params.page.click(rowsPerPageDropdownXPath);

        await new Promise((resolve) => setTimeout(resolve, 1500));

        await params.page.select(rowsPerPageDropdownXPath, '30');
      }

      const iterationNumber = Math.ceil(mrnNumber / 30);

      let declarationTableData: DeclarationTableRow[] = [];
      //Iterate over the table pages
      for (let i = 0; i < iterationNumber; i++) {
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const contentPanelDataXPath =
          'xpath///*[@id="formResult:dataResult_data"]';

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

          const data: DeclarationTableRow[] = [];

          rows.forEach((row) => {
            const cells = row.querySelectorAll('td');
            const rowData: DeclarationTableRow = {
              declaratingOperator: '',
              mrn: '',
              lrn: '',
              operationScope: '',
              acceptanceDate: '',
              officeCode: '',
              articlesNumber: '',
              version: '',
              edStatus: '',
              detailsButtonClass: '',
            };

            cells.forEach((cell, index) => {
              const headerName = headersData[index];
              rowData[headerName] = cell.innerText.trim();
            });

            data.push(rowData);
          });

          return data;
        });

        declarationTableData = [...declarationTableData, ...tableData];

        if (i < iterationNumber - 1) {
          const nextPageButtonXPath =
            'xpath///*[@id="formResult:dataResult_paginator_bottom"]/a[3]';
          await params.page.waitForSelector(nextPageButtonXPath);
          await params.page.click(nextPageButtonXPath);
        }
      }

      console.log('declarationTableData', declarationTableData);

      const declarationData = declarationTableData.map((declaration) => {
        return this._mapDeclarationTableHeaders({
          declarationTableRow: declaration,
        });
      });

      console.log('declarationData', declarationData);

      return declarationData;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  private _getDatePositionInDatepicker(params: {
    day: number;
    month: number;
    year: number;
  }): { row: number; column: number } {
    const firstDayOfMonth = new Date(params.year, params.month - 1, 1);
    let firstDay = firstDayOfMonth.getDay();

    if (firstDay === 0) {
      firstDay = 7;
    }

    const daysInMonth = new Date(params.year, params.month, 0).getDate();

    if (params.day < 1 || params.day > daysInMonth) {
      throw new Error('Invalid day');
    }

    const position = params.day + firstDay;
    const row = Math.ceil((position - 1) / 7);
    const column = (position - 1) % 7;

    return { row, column };
  }

  private _mapDeclarationTableHeaders(params: {
    declarationTableRow: DeclarationTableRow;
  }): Declaration {
    const mappedObj: Declaration = {
      declaratingOperator: '',
      mrn: '',
      lrn: '',
      operationScope: '',
      acceptanceDate: '',
      officeCode: '',
      articlesNumber: '',
      version: '',
      edStatus: '',
      detailsButtonClass: '',
    };

    for (const key in params.declarationTableRow) {
      const standardKey = declarationTableHeaderMap[key];
      mappedObj[standardKey] = params.declarationTableRow[key];
    }

    return mappedObj;
  }

  private async _retry<T>({
    promiseFactory,
    retryCount = 3,
    retryMs = 200,
  }: {
    promiseFactory: () => Promise<T>;
    retryCount?: number;
    retryMs?: number;
  }): Promise<T> {
    try {
      return await promiseFactory();
    } catch (error) {
      if (retryCount <= 0) {
        throw error;
      }

      console.log('retrying', retryCount);

      await new Promise((resolve) => setTimeout(resolve, retryMs));

      return await this._retry({
        promiseFactory: promiseFactory,
        retryCount: retryCount - 1,
        retryMs: retryMs,
      });
    }
  }
}
