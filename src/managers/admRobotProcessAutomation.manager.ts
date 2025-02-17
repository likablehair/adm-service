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

export type AggregatedSearchType = {
  declarations: Declaration[];
  realTotalDeclarations: number;
  date: Date;
};

export type MRNProcessed = {
  mrnList: string[];
  date: Date;
  realTotalDeclarationNumber: number;
};

export type MrnExportStatusType = {
  mrn: string;
  buffer: Buffer;
};
export type DeclarationType = 'import' | 'export';

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
    type: DeclarationType;
  }): Promise<MRNProcessed[]> {
    try {
      const type = params.type;

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

      console.info(
        `[${new Date().toISOString()}] RPA with user ${params.security.username} for ${params.dichiarante} starting...`,
      );
      const page = await browser.newPage();

      await page.setExtraHTTPHeaders({
        'Accept-Language': 'it-IT,it;q=0.9',
      });

      const cookies = await this.loginADM({
        page,
        username: params.security.username,
        password: params.security.password,
      });

      await page.setCookie(...cookies);

      const gestioneDocumentiPage = await this.accessToGestioneDocumenti({
        page,
        dichiarante: params.dichiarante,
      });

      let aggregatedSearchResult: AggregatedSearchType[] = [];
      aggregatedSearchResult = await this.aggregatedSearch({
        page: gestioneDocumentiPage,
        dateFrom: params.dateFrom,
        dateTo: params.dateTo,
        type,
      });

      const mrnProcessed: MRNProcessed[] = aggregatedSearchResult.map(
        (result) => {
          const declarations = result.declarations;
          const date = result.date;
          const realTotalDeclarations = result.realTotalDeclarations;

          const mrnList = declarations.map((declaration) => {
            console.info(
              `[${new Date().toISOString()}] RPA with user ${params.security.username} for ${params.dichiarante} found MRN: ${declaration.mrn}`,
            );

            return declaration.mrn;
          });

          return {
            mrnList,
            date,
            realTotalDeclarationNumber: realTotalDeclarations,
          };
        },
      );

      const totalMrn = mrnProcessed.reduce((acc, curr) => {
        return acc + curr.mrnList.length;
      }, 0);

      console.info(
        `[${new Date().toISOString()}] RPA with user ${params.security.username} for ${params.dichiarante} total MRNs: ${totalMrn}`,
      );

      if (!params.browser) {
        await browser.close();
      }

      console.info(
        `[${new Date().toISOString()}] RPA with user ${params.security.username} for ${params.dichiarante} ended successfully!`,
      );

      return mrnProcessed;
    } catch (error: unknown) {
      let localError: Error;

      if (error instanceof Error) {
        localError = error;
      } else if (typeof error === 'string') {
        localError = new Error(error);
      } else {
        localError = new Error('Unknown error');
      }

      localError.message = `getMRNList: ${localError.message}`;
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
    } catch (error: unknown) {
      let localError: Error;

      if (error instanceof Error) {
        localError = error;
      } else if (typeof error === 'string') {
        localError = new Error(error);
      } else {
        localError = new Error('Unknown error');
      }

      localError.message = `login: ${localError.message}`;

      throw localError;
    }
  }

  async accessToGestioneDocumenti(params: { page: Page; dichiarante: string }) {
    try {
      const url =
        'https://sso.adm.gov.it/pud2interop85cast?Location=https://web.adm.gov.it/ponimport/xhtml/index.xhtml';

      await params.page.goto(url);
      const dropdownLabelDichiaranteCSS =
        '#formDel label.ui-selectonemenu-label';
      const dropdownOptionDichiaranteXPath = `aria/${params.dichiarante}[role="option"]`;
      const buttonConfirmXPath = 'xpath///*[@id="formDel:idGoto"]/span';

      await params.page.waitForSelector(dropdownLabelDichiaranteCSS, {
        visible: true,
      });
      await params.page.click(dropdownLabelDichiaranteCSS);

      await new Promise((resolve) => setTimeout(resolve, 1500));

      await params.page.waitForSelector(dropdownOptionDichiaranteXPath);
      await params.page.click(dropdownOptionDichiaranteXPath);

      await new Promise((resolve) => setTimeout(resolve, 1500));
      await params.page.waitForSelector(buttonConfirmXPath);

      await Promise.all([
        this._retry({
          promiseFactory: () => params.page.waitForNavigation(),
          retryCount: 3,
          retryMs: 500,
        }),
        params.page.click(buttonConfirmXPath),
      ]);

      return params.page;
    } catch (error: unknown) {
      let localError: Error;

      if (error instanceof Error) {
        localError = error;
      } else if (typeof error === 'string') {
        localError = new Error(error);
      } else {
        localError = new Error('Unknown error');
      }

      localError.message = `accessGestioneDocumenti: ${localError.message}`;

      throw localError;
    }
  }

  async aggregatedSearch(params: {
    page: Page;
    dateFrom?: Date;
    dateTo?: Date;
    type: DeclarationType;
  }): Promise<AggregatedSearchType[]> {
    try {
      const type = params.type;
      let dateFrom = new Date();
      let dateTo = new Date();

      //Check if the dateFrom is provided
      if (params.dateFrom && params.dateTo) {
        dateFrom = new Date(params.dateFrom);
        dateTo = new Date(params.dateTo);
      } else if (params.dateFrom) {
        dateFrom = new Date(params.dateFrom);
        dateTo = new Date(dateFrom);
      }

      dateFrom.setHours(6, 0, 0, 0);
      dateTo.setHours(6, 0, 0, 0);

      if (dateFrom > dateTo) {
        throw new Error('Invalid date: date is in the future');
      }

      const iterationDate = new Date(dateFrom);
      iterationDate.setHours(6, 0, 0, 0);

      let datePickerDate = new Date();
      datePickerDate.setHours(6, 0, 0, 0);

      let rowsPerPageValue = 5;
      let declarationData: {
        declarations: Declaration[];
        realTotalDeclarations: number;
        date: Date;
      }[] = [];

      //Test
      while (iterationDate <= dateTo) {
        const ricercaAggregataContentXPath =
          'xpath///*[@id="formAvan:accordionTab:tabRicercaAggregata"]';

        const ricercaAggregataTabXPath =
          'xpath///*[@id="formAvan:accordionTab:tabRicercaAggregata_header"]';

        const isHidden = await params.page
          .waitForSelector(ricercaAggregataContentXPath, {
            hidden: true,
          })
          .then(() => true)
          .catch(() => false);

        if (isHidden) {
          await params.page.waitForSelector(ricercaAggregataTabXPath);
          await params.page.click(ricercaAggregataTabXPath);

          await new Promise((resolve) => setTimeout(resolve, 1500));
        }

        const ricercaAggregataButtonXPath =
          'xpath///*[@id="formAvan:accordionTab:buttonRicercaAgg"]/span';

        const dateFromInputXPath =
          'xpath///*[@id="formAvan:accordionTab:dataRegistrazioneDa"]/button';
        await params.page.waitForSelector(dateFromInputXPath);
        await params.page.click(dateFromInputXPath);

        await new Promise((resolve) => setTimeout(resolve, 1500));

        const datePickerCalendarXPath =
          'xpath///*[@id="ui-datepicker-div"]/table';
        await params.page.waitForSelector(datePickerCalendarXPath);

        const day = iterationDate.getDate();
        const month = iterationDate.getMonth() + 1;
        const year = iterationDate.getFullYear();

        const currentMonth = datePickerDate.getMonth() + 1;
        const currentYear = datePickerDate.getFullYear();

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
        } else if (dateDifferenceIteration < 0) {
          const nextMonthButtonXPath =
            'xpath///*[@id="ui-datepicker-div"]/div/a[2]';

          //Iterate over the months
          for (let i = 0; i < Math.abs(dateDifferenceIteration); i++) {
            await params.page.waitForSelector(nextMonthButtonXPath);
            await params.page.click(nextMonthButtonXPath);

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

        //select import or export
        const dropdownLabelScopeCSS = '#formAvan label.ui-selectonemenu-label';
        const dropdownOptionScopeXPath = `aria/${type == 'export' ? 'Esportazione' : 'Importazione'}[role="option"]`;

        await params.page.waitForSelector(dropdownLabelScopeCSS, {
          visible: true,
        });
        await params.page.click(dropdownLabelScopeCSS);

        await new Promise((resolve) => setTimeout(resolve, 1500));

        await params.page.waitForSelector(dropdownOptionScopeXPath);
        await params.page.click(dropdownOptionScopeXPath);

        await new Promise((resolve) => setTimeout(resolve, 1500));

        await params.page.waitForSelector(ricercaAggregataButtonXPath);
        await params.page.click(ricercaAggregataButtonXPath);

        await new Promise((resolve) => setTimeout(resolve, 1500));

        //Wait for the table, otherwise the result will be always 0
        const resultTableCss = '#formResult div.ui-datatable';
        const tableVisible = await params.page
          .waitForSelector(resultTableCss, {
            visible: true,
          })
          .then(() => true)
          .catch(() => false);

        if (!tableVisible) {
          const logDate = iterationDate.toISOString().split('T')[0];
          console.info(
            `[${new Date().toISOString()}] RPA aggregatedSearch for date ${logDate}: 0 declarations found`,
          );

          //Close the search tab
          await params.page.waitForSelector(ricercaAggregataTabXPath);
          await params.page.click(ricercaAggregataTabXPath);

          datePickerDate = new Date(iterationDate);
          datePickerDate.setHours(6, 0, 0, 0);
          iterationDate.setDate(iterationDate.getDate() + 1);
          continue;
        }

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

        if (mrnNumber > rowsPerPageValue) {
          //Set the number of rows to 30 (max option available)
          rowsPerPageValue = 30;
          const rowsPerPageDropdownCss =
            '#formResult select.ui-paginator-rpp-options';
          await params.page.waitForSelector(rowsPerPageDropdownCss);
          await params.page.click(rowsPerPageDropdownCss);

          await new Promise((resolve) => setTimeout(resolve, 1500));

          await params.page.select(
            rowsPerPageDropdownCss,
            rowsPerPageValue.toString(),
          );
        }

        const iterationNumber = Math.ceil(mrnNumber / rowsPerPageValue);

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

        const loopDeclarations = declarationTableData.map((declaration) => {
          return this._mapDeclarationTableHeaders({
            declarationTableRow: declaration,
          });
        });

        declarationData = [
          ...declarationData,
          {
            declarations: loopDeclarations,
            realTotalDeclarations: mrnNumber,
            date: new Date(iterationDate),
          },
        ];

        const logDate = iterationDate.toISOString().split('T')[0];
        console.info(
          `[${new Date().toISOString()}] RPA aggregatedSearch for date ${logDate}: ${loopDeclarations.length} declarations found`,
        );

        if (iterationNumber > 1) {
          const paginatorFirstButtonCss = '#formResult .ui-paginator-first';
          await params.page.waitForSelector(paginatorFirstButtonCss);
          await params.page.click(paginatorFirstButtonCss);
        }

        //Close the search tab
        await params.page.waitForSelector(ricercaAggregataTabXPath);
        await params.page.click(ricercaAggregataTabXPath);

        datePickerDate = new Date(iterationDate);
        datePickerDate.setHours(6, 0, 0, 0);
        iterationDate.setDate(iterationDate.getDate() + 1);
      }

      return declarationData;
    } catch (error: unknown) {
      let localError: Error;

      if (error instanceof Error) {
        localError = error;
      } else if (typeof error === 'string') {
        localError = new Error(error);
      } else {
        localError = new Error('Unknown error');
      }

      localError.message = `aggregatedSearch: ${localError.message}`;

      throw localError;
    }
  }

  async printMrnExportStatus(params: {
    mrn: string;
    browser?: Browser;
  }): Promise<MrnExportStatusType> {
    try {
      let browser: Browser;
      if (!params.browser) {
        browser = await puppeteer.launch({
          headless: false,
          args: ['--lang=it-IT'],
          env: {
            LANGUAGE: 'it_IT',
          },
        });
      } else {
        browser = params.browser;
      }

      console.info(
        `[${new Date().toISOString()}] RPA to get Movement Reference Number - (MRN) ${params.mrn} starting...`,
      );
      const page = await browser.newPage();

      await page.setExtraHTTPHeaders({
        'Accept-Language': 'it-IT,it;q=0.9',
      });

      const url =
        'https://www.adm.gov.it/portale/notifica-di-esportazione-del-m.r.n.-movement-reference-number-';

      await this._retry({
        promiseFactory: () => page.goto(url),
        retryCount: 5,
        retryMs: 500,
      });

      await page.waitForSelector(
        'xpath///*[@id="cookiebar-adm"]/div/div/div[1]/a',
      );
      await page.click('xpath///*[@id="cookiebar-adm"]/div/div/div[1]/a');

      await page.type(
        'xpath///*[@id="_it_smc_sogei_info_dogane_aes_web_InfoDoganeAesPortlet_INSTANCE_Sh48LEXuB3mL_mrn"]',
        params.mrn,
      );
      await page.waitForFunction(() => {
        const btn = document.querySelector(
          'button.btn-primary-adm span.lfr-btn-label',
        );
        return btn && btn !== null;
      });

      await Promise.all([
        this._retry({
          promiseFactory: () => page.waitForNavigation(),
          retryCount: 3,
          retryMs: 500,
        }),
        await page.click('button.btn-primary-adm span.lfr-btn-label'),
      ]);

      const screenshot = await page.screenshot();

      const buffer = Buffer.from(screenshot);
      // const pdfFilePath = `${params.mrn}_screenshot.png`;
      // await fsPromises.writeFile(pdfFilePath, buffer);
      console.info(
        `[${new Date().toISOString()}] RPA to get Movement Reference Number - (MRN) ${params.mrn} ended successfully!`,
      );
      return {
        mrn: params.mrn,
        buffer,
      };
    } catch (error: unknown) {
      let localError: Error;

      if (error instanceof Error) {
        localError = error;
      } else if (typeof error === 'string') {
        localError = new Error(error);
      } else {
        localError = new Error('Unknown error');
      }

      localError.message = `login: ${localError.message}`;

      throw localError;
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
    let column = (position - 1) % 7;

    if (column === 0) {
      column = 7;
    }

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
