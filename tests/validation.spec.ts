import { describe, expect, test } from 'vitest';

import {
  validateAccounting,
  validateImportDeclaration,
  validateDaeDat,
  ImportDeclarationToValidate,
  DaeDatToValidate,
} from 'src/validation/documents';
import { AdmValidationError } from 'src/validation/errors';
import {
  convertAsterisksToZero,
  parseDecimal,
  splitCityAndCountry,
} from 'src/utils/values';
import { isWeighedNet, resolveDeclaredWeight } from 'src/validation/rules';

function declaration(
  overrides: Partial<ImportDeclarationToValidate> = {},
): ImportDeclarationToValidate {
  return {
    mrn: '24ITQTC04WJ97190R7',
    version: '1',
    track: 'H1',
    date: '12/03/2024',
    acceptanceDate: '12/03/2024',
    releaseDate: '13/03/2024',
    releaseCode: 'A',
    totalGrossWeight: 1250 as number | undefined,
    invoiceValue: 10850 as number | undefined,
    currency: 'USD',
    exchangeRate: 1.085 as number | undefined,
    incoterm: 'CIF',
    originCountryAlpha2: 'CN',
    supplier: {
      companyName: 'Shanghai Steel Co',
      vatNumber: '12345678901',
      country: 'CN',
      address: 'Nanjing Road 120',
      city: 'Shanghai',
      postalCode: '200001',
    },
    goods: [good()],
    ...overrides,
  };
}

function good(
  overrides: Partial<ImportDeclarationToValidate['goods'][number]> = {},
) {
  return {
    nr: '1',
    ncCode: '72071111',
    taricCode: '00',
    identificationCode: '7207111100',
    description: 'Semilavorati di ferro o acciai non legati',
    country: 'CN',
    netWeight: 1200 as number | undefined,
    grossWeight: 1250 as number | undefined,
    price: 10000 as number | undefined,
    statisticValue: 10500 as number | undefined,
    customsRegime: '4000',
    requestedRegime: '40',
    previousRegime: '00',
    releaseCode: 'A',
    releaseDate: '13/03/2024',
    page: 2,
    ...overrides,
  };
}

describe('parseDecimal', () => {
  test('keeps an absent value distinguishable from zero', () => {
    expect(parseDecimal('')).toBeUndefined();
    expect(parseDecimal('   ')).toBeUndefined();
    expect(parseDecimal(undefined)).toBeUndefined();
    expect(parseDecimal('0')).toBe(0);
    expect(parseDecimal('0,00')).toBe(0);
  });

  test('reads the Italian decimal convention', () => {
    expect(parseDecimal('1234,56')).toBe(1234.56);
    expect(parseDecimal('1.234,56')).toBe(1234.56);
    expect(parseDecimal(' 42 ')).toBe(42);
  });

  test('returns undefined rather than NaN on unparsable input', () => {
    expect(parseDecimal('n/d')).toBeUndefined();
  });
});

describe('convertAsterisksToZero', () => {
  test('rewrites the asterisk only on numeric fields', () => {
    const result = convertAsterisksToZero({
      netWeight: '*',
      description: '*',
      ncCode: '*',
    });

    expect(result.netWeight).toBe('0');
    expect(result.description).toBe('*');
    expect(result.ncCode).toBe('*');
  });

  test('still rewrites the empty string on the keys the caller lists', () => {
    const result = convertAsterisksToZero(
      { postalCode: '', city: '' },
      'postalCode',
    );

    expect(result.postalCode).toBe('0');
    expect(result.city).toBe('');
  });
});

describe('validateImportDeclaration', () => {
  test('a complete H1 reports nothing', () => {
    expect(validateImportDeclaration(declaration())).toEqual([]);
  });

  test('reports an article with no price', () => {
    const issues = validateImportDeclaration(
      declaration({ goods: [good({ price: undefined })] }),
    );

    const priceIssue = issues.find((i) => i.field === 'goods[0].price');
    expect(priceIssue).toBeDefined();
    expect(priceIssue?.reason).toBe('missing');
    expect(priceIssue?.goodNr).toBe('1');
    expect(priceIssue?.page).toBe(2);
  });

  test('a price that really is zero is not reported', () => {
    const issues = validateImportDeclaration(
      declaration({
        invoiceValue: 0,
        goods: [good({ price: 0, statisticValue: 0 })],
      }),
    );

    expect(issues.filter((i) => i.field === 'goods[0].price')).toEqual([]);
  });

  test('reports an article with no description', () => {
    const issues = validateImportDeclaration(
      declaration({ goods: [good({ description: '' })] }),
    );

    expect(
      issues.some(
        (i) => i.field === 'goods[0].description' && i.reason === 'missing',
      ),
    ).toBe(true);
  });

  test('H1 tolerates a blank currency, which shares the invoice value box', () => {
    const issues = validateImportDeclaration(
      declaration({ track: 'H1', invoiceValue: undefined, currency: '' }),
    );

    expect(issues.some((i) => i.field === 'currency')).toBe(false);
  });

  test('H7 requires neither the origin country nor the TARIC code', () => {
    const issues = validateImportDeclaration(
      declaration({
        track: 'H7',
        originCountryAlpha2: '',
        invoiceValue: undefined,
        currency: '',
        exchangeRate: undefined,
        incoterm: '',
        goods: [
          good({
            taricCode: '00',
            customsRegime: '',
            requestedRegime: '',
            previousRegime: '',
            netWeight: undefined,
          }),
        ],
      }),
    );

    expect(issues.some((i) => i.field === 'originCountryAlpha2')).toBe(false);
    expect(issues.some((i) => i.field === 'goods[0].taricCode')).toBe(false);
  });

  test('H7 reports a value showing up where the track never carries one', () => {
    const issues = validateImportDeclaration(
      declaration({
        track: 'H7',
        // these belong to other tracks: if they appear here, a cell has read
        // something from the wrong place
        originCountryAlpha2: 'CN',
        currency: 'USD',
        goods: [good({ price: 100, statisticValue: 120, country: 'CN' })],
      }),
    );

    [
      'originCountryAlpha2',
      'currency',
      'goods[0].price',
      'goods[0].statisticValue',
      'goods[0].country',
    ].forEach((field) => {
      expect(
        issues.some((i) => i.field === field && i.reason === 'unexpected'),
      ).toBe(true);
    });
  });

  test('H7 says nothing about the fields the converter blanks itself', () => {
    const issues = validateImportDeclaration(
      declaration({
        track: 'H7',
        originCountryAlpha2: '',
        invoiceValue: undefined,
        currency: '',
        exchangeRate: undefined,
        incoterm: '',
        goods: [
          good({
            taricCode: '00',
            customsRegime: '4000',
            requestedRegime: '40',
            previousRegime: '00',
            country: '',
            price: undefined,
            statisticValue: undefined,
            netWeight: undefined,
          }),
        ],
      }),
    );

    ['taricCode', 'customsRegime', 'requestedRegime', 'previousRegime'].forEach(
      (field) => {
        expect(issues.some((i) => i.field === `goods[0].${field}`)).toBe(false);
      },
    );
  });

  test('H2 does not require a supplier', () => {
    const issues = validateImportDeclaration(
      declaration({
        track: 'H2',
        invoiceValue: undefined,
        currency: '',
        exchangeRate: undefined,
        incoterm: '',
        supplier: {
          companyName: '',
          vatNumber: '',
          country: '',
          address: '',
          city: '',
          postalCode: '',
        },
        goods: [good({ netWeight: undefined })],
      }),
    );

    expect(issues.filter((i) => i.scope === 'supplier')).toEqual([]);
  });

  test('an unknown track is reported without flooding the caller', () => {
    const issues = validateImportDeclaration(
      declaration({
        track: '',
        incoterm: '',
        currency: '',
        invoiceValue: undefined,
      }),
    );

    expect(issues.some((i) => i.field === 'track')).toBe(true);
    expect(issues.some((i) => i.field === 'incoterm')).toBe(false);
  });

  test('reports a malformed value that is present', () => {
    const issues = validateImportDeclaration(
      declaration({ currency: 'DOLLARI', date: '2024-03-12' }),
    );

    expect(
      issues.some((i) => i.field === 'currency' && i.reason === 'invalid'),
    ).toBe(true);
    expect(
      issues.some((i) => i.field === 'date' && i.reason === 'invalid'),
    ).toBe(true);
  });

  test('an optional field is checked when present', () => {
    const issues = validateImportDeclaration(
      declaration({ exchangeRate: -1, releaseDate: '2024-03-13' }),
    );

    expect(
      issues.some((i) => i.field === 'exchangeRate' && i.reason === 'invalid'),
    ).toBe(true);
    expect(
      issues.some((i) => i.field === 'releaseDate' && i.reason === 'invalid'),
    ).toBe(true);
  });

  test('an optional field is not reported when absent', () => {
    const issues = validateImportDeclaration(
      declaration({
        invoiceValue: undefined,
        releaseDate: '',
        releaseCode: '',
      }),
    );

    expect(
      issues.some((i) =>
        ['invoiceValue', 'releaseDate', 'releaseCode'].includes(i.field),
      ),
    ).toBe(false);
  });

  test('an optional article field is checked when present', () => {
    const issues = validateImportDeclaration(
      declaration({ goods: [good({ grossWeight: -5 })] }),
    );

    expect(
      issues.some(
        (i) => i.field === 'goods[0].grossWeight' && i.reason === 'invalid',
      ),
    ).toBe(true);
  });

  test('H1 tolerates a blank invoice value but wants the exchange rate', () => {
    const issues = validateImportDeclaration(
      declaration({
        track: 'H1',
        invoiceValue: undefined,
        exchangeRate: undefined,
      }),
    );

    expect(issues.some((i) => i.field === 'invoiceValue')).toBe(false);
    expect(
      issues.some((i) => i.field === 'exchangeRate' && i.reason === 'missing'),
    ).toBe(true);
  });

  test('H1 still wants the exchange rate', () => {
    const issues = validateImportDeclaration(
      declaration({ track: 'H1', exchangeRate: undefined }),
    );

    expect(
      issues.some((i) => i.field === 'exchangeRate' && i.reason === 'missing'),
    ).toBe(true);
  });

  test('H1v6 wants the invoice value but not the exchange rate', () => {
    const issues = validateImportDeclaration(
      declaration({
        track: 'H1v6',
        invoiceValue: undefined,
        exchangeRate: undefined,
      }),
    );

    expect(
      issues.some((i) => i.field === 'invoiceValue' && i.reason === 'missing'),
    ).toBe(true);
    // Da agosto 2026 ADM non lo stampa piu' su questo tracciato.
    expect(issues.some((i) => i.field === 'exchangeRate')).toBe(false);
  });

  test('H1 wants both regimes on every article', () => {
    const issues = validateImportDeclaration(
      declaration({
        goods: [good({ requestedRegime: '', previousRegime: '' })],
      }),
    );

    expect(issues.some((i) => i.field === 'goods[0].requestedRegime')).toBe(
      true,
    );
    expect(issues.some((i) => i.field === 'goods[0].previousRegime')).toBe(
      true,
    );
  });

  test('H2 wants the gross weight and the statistical value, not the price', () => {
    const issues = validateImportDeclaration(
      declaration({
        track: 'H2',
        invoiceValue: undefined,
        currency: '',
        exchangeRate: undefined,
        incoterm: '',
        goods: [
          good({
            netWeight: undefined,
            grossWeight: undefined,
            price: undefined,
            statisticValue: undefined,
          }),
        ],
      }),
    );

    expect(issues.some((i) => i.field === 'goods[0].grossWeight')).toBe(true);
    expect(issues.some((i) => i.field === 'goods[0].statisticValue')).toBe(
      true,
    );
    expect(issues.some((i) => i.field === 'goods[0].netWeight')).toBe(false);
    expect(issues.some((i) => i.field === 'goods[0].price')).toBe(false);
  });

  test('H7 wants only code, description and gross weight on an article', () => {
    const issues = validateImportDeclaration(
      declaration({
        track: 'H7',
        originCountryAlpha2: '',
        invoiceValue: undefined,
        currency: '',
        exchangeRate: undefined,
        incoterm: '',
        goods: [
          good({
            taricCode: '',
            country: '',
            customsRegime: '',
            requestedRegime: '',
            previousRegime: '',
            netWeight: undefined,
            price: undefined,
            statisticValue: undefined,
            grossWeight: 1250,
          }),
        ],
      }),
    );

    expect(issues.filter((i) => i.scope === 'good')).toEqual([]);
  });

  test('H4 carries everything, invoice value included', () => {
    const issues = validateImportDeclaration(
      declaration({
        track: 'H4',
        invoiceValue: undefined,
        exchangeRate: undefined,
      }),
    );

    expect(
      issues.some((i) => i.field === 'invoiceValue' && i.reason === 'missing'),
    ).toBe(true);
    expect(
      issues.some((i) => i.field === 'exchangeRate' && i.reason === 'missing'),
    ).toBe(true);
  });

  test('H1 tolerates an exporter that is only an EORI code', () => {
    const issues = validateImportDeclaration(
      declaration({
        track: 'H1',
        supplier: {
          companyName: 'CHE107975860',
          vatNumber: '107975860',
          country: 'CH',
          address: '',
          city: '',
          postalCode: '',
        },
      }),
    );

    expect(issues.filter((i) => i.scope === 'supplier')).toEqual([]);
  });

  test('H4 still wants city and postal code on the supplier', () => {
    const base = declaration();
    const issues = validateImportDeclaration(
      declaration({
        track: 'H4',
        supplier: { ...base.supplier, city: '', postalCode: '' },
      }),
    );

    expect(
      issues.some((i) => i.field === 'supplier.city' && i.reason === 'missing'),
    ).toBe(true);
    expect(
      issues.some(
        (i) => i.field === 'supplier.postalCode' && i.reason === 'missing',
      ),
    ).toBe(true);
  });

  test('throw mode raises every issue at once', () => {
    expect(() =>
      validateImportDeclaration(
        declaration({ goods: [good({ price: undefined, description: '' })] }),
        { mode: 'throw' },
      ),
    ).toThrow(AdmValidationError);

    try {
      validateImportDeclaration(
        declaration({ goods: [good({ price: undefined, description: '' })] }),
        { mode: 'throw' },
      );
    } catch (error) {
      const validationError = error as AdmValidationError;
      expect(validationError.issues.length).toBe(2);
      expect(validationError.mrn).toBe('24ITQTC04WJ97190R7');
      expect(validationError.profile).toBe('H1');
      expect(validationError.message).toContain('goods[0].price');
    }
  });

  test('off mode reports nothing', () => {
    const issues = validateImportDeclaration(
      declaration({ goods: [good({ price: undefined })] }),
      { mode: 'off' },
    );

    expect(issues).toEqual([]);
  });
});

describe('validateAccounting', () => {
  function accounting(overrides: Record<string, unknown> = {}) {
    return {
      version: '1',
      totalDuties: 120.5,
      totalTaxes: 340,
      totalVatToBePaid: 1250.4,
      rectificationOrCancellationDate: '',
      ...overrides,
    };
  }

  test('a coherent statement reports nothing', () => {
    expect(validateAccounting(accounting())).toEqual([]);
  });

  test('the VAT to be paid may be zero but not negative', () => {
    expect(
      validateAccounting(accounting({ totalVatToBePaid: 0 })).filter(
        (i) => i.field === 'totalVatToBePaid',
      ),
    ).toEqual([]);

    expect(
      validateAccounting(accounting({ totalVatToBePaid: -1 })).some(
        (i) => i.field === 'totalVatToBePaid' && i.reason === 'invalid',
      ),
    ).toBe(true);
  });

  test('the exemption value is negative and its taxable amount positive', () => {
    const wrong = validateAccounting(
      accounting({ vatExemptionValue: 500, vatExemptionTaxableValue: -500 }),
    );

    expect(
      wrong.some(
        (i) => i.field === 'vatExemptionValue' && i.reason === 'invalid',
      ),
    ).toBe(true);
    expect(
      wrong.some(
        (i) => i.field === 'vatExemptionTaxableValue' && i.reason === 'invalid',
      ),
    ).toBe(true);

    const right = validateAccounting(
      accounting({ vatExemptionValue: -500, vatExemptionTaxableValue: 500 }),
    );

    expect(right.filter((i) => i.field.startsWith('vatExemption'))).toEqual([]);
  });

  test('every other tribute is reported when negative', () => {
    const issues = validateAccounting(
      accounting({ tax931: -10, taxA30: -1, taxB00Vat22: -3 }),
    );

    ['tax931', 'taxA30', 'taxB00Vat22'].forEach((field) => {
      expect(
        issues.some((i) => i.field === field && i.reason === 'invalid'),
      ).toBe(true);
    });
  });

  test('a tribute at zero is accepted', () => {
    expect(
      validateAccounting(accounting({ taxB00Vat00: 0 })).filter(
        (i) => i.field === 'taxB00Vat00',
      ),
    ).toEqual([]);
  });
});

describe('validateDaeDat', () => {
  function daeDat(overrides: Partial<DaeDatToValidate> = {}): DaeDatToValidate {
    return {
      type: 'DAE',
      releaseDate: '13/03/2024',
      releaseCode: 'A',
      customsExitOffice: 'ITQTC04',
      customsExportOffice: 'ITQTC04',
      totalPackages: 12,
      totalGrossWeight: 1250,
      totalStatisticValue: 10500,
      transitNetworkCountry: 'CH',
      transportMode: 3,
      consignee: {
        companyName: 'Zurich Metals AG',
        companyAddress: 'Bahnhofstrasse 1',
        country: 'CH',
        city: 'Zurich',
        postalCode: '8001',
      },
      goods: [
        {
          nr: '1',
          ncCode: '72071111',
          identificationCode: '72071111',
          description: 'Semilavorati di ferro',
          netWeight: 1200,
          statisticValue: 10500,
          customsRegime: '1000',
          requestedRegime: '10',
          previousRegime: '00',
          documents: [{ code: 'N380', identifier: 'INV-1' }],
        },
      ],
      ...overrides,
    };
  }

  test('a complete DAE reports nothing', () => {
    expect(validateDaeDat(daeDat())).toEqual([]);
  });

  test('an EX with no transport mode reports it', () => {
    const issues = validateDaeDat(daeDat({ transportMode: -1 }));

    expect(
      issues.some((i) => i.field === 'transportMode' && i.reason === 'missing'),
    ).toBe(true);
  });

  test('a CO says nothing about the transport mode it never carries', () => {
    const issues = validateDaeDat(daeDat({ type: 'CO', transportMode: -1 }));

    expect(issues.some((i) => i.field === 'transportMode')).toBe(false);
  });

  test('a DAE good with no article number reports it', () => {
    const base = daeDat();
    const issues = validateDaeDat(
      daeDat({ goods: [{ ...base.goods[0], nr: '' }] }),
    );

    expect(
      issues.some((i) => i.field === 'goods[0].nr' && i.reason === 'missing'),
    ).toBe(true);
  });

  test('a DAE with no postal code says nothing about it', () => {
    const issues = validateDaeDat(
      daeDat({
        consignee: {
          companyName: 'Zurich Metals AG',
          companyAddress: 'Bahnhofstrasse 1',
          country: 'CH',
          city: 'Zurich',
          postalCode: '',
        },
      }),
    );

    expect(issues.filter((i) => i.field.includes('postalCode'))).toEqual([]);
  });

  test('a DAE that declares no consignee at all says nothing about it', () => {
    const issues = validateDaeDat(
      daeDat({
        consignee: {
          companyName: '',
          companyAddress: '',
          country: '',
          city: '',
          postalCode: '',
        },
      }),
    );

    expect(issues).toEqual([]);
  });

  test('a DAE with a half-read consignee names the parts that are missing', () => {
    const issues = validateDaeDat(
      daeDat({
        consignee: {
          companyName: 'Zurich Metals AG',
          companyAddress: '',
          country: '',
          city: '',
          postalCode: '',
        },
      }),
    );

    expect(issues.map((i) => i.field).sort()).toEqual([
      'consignee.city',
      'consignee.country',
    ]);
  });

  test('treats the -1 transport mode sentinel as missing', () => {
    const issues = validateDaeDat(daeDat({ transportMode: -1 }));

    expect(
      issues.some((i) => i.field === 'transportMode' && i.reason === 'missing'),
    ).toBe(true);
  });

  test('reports an article with no statistic value', () => {
    const issues = validateDaeDat(
      daeDat({
        goods: [{ ...daeDat().goods[0], statisticValue: undefined }],
      }),
    );

    expect(
      issues.some(
        (i) => i.field === 'goods[0].statisticValue' && i.reason === 'missing',
      ),
    ).toBe(true);
  });

  test('the export office box is never demanded', () => {
    expect(
      validateDaeDat(daeDat({ customsExportOffice: '' })).filter(
        (i) => i.field === 'customsExportOffice',
      ),
    ).toEqual([]);

    expect(
      validateDaeDat(daeDat({ customsExportOffice: '' }), {
        layout: 'old',
      }).filter((i) => i.field === 'customsExportOffice'),
    ).toEqual([]);
  });

  test('wants the customs regime, the exit office and the release code', () => {
    const base = daeDat();
    const issues = validateDaeDat(
      daeDat({
        releaseCode: '',
        customsExitOffice: '',
        goods: [{ ...base.goods[0], customsRegime: '' }],
      }),
    );

    ['releaseCode', 'customsExitOffice', 'goods[0].customsRegime'].forEach(
      (field) => {
        expect(
          issues.some((i) => i.field === field && i.reason === 'missing'),
        ).toBe(true);
      },
    );
  });

  test('wants both halves of the customs regime', () => {
    const base = daeDat();
    const issues = validateDaeDat(
      daeDat({
        goods: [{ ...base.goods[0], requestedRegime: '', previousRegime: '' }],
      }),
    );

    expect(issues.some((i) => i.field === 'goods[0].requestedRegime')).toBe(
      true,
    );
    expect(issues.some((i) => i.field === 'goods[0].previousRegime')).toBe(
      true,
    );
  });

  test('wants the city on the consignee but not the postal code', () => {
    const base = daeDat();
    const issues = validateDaeDat(
      daeDat({ consignee: { ...base.consignee, city: '', postalCode: '' } }),
    );

    expect(
      issues.some(
        (i) => i.field === 'consignee.city' && i.reason === 'missing',
      ),
    ).toBe(true);
    expect(issues.some((i) => i.field === 'consignee.postalCode')).toBe(false);
  });

  test('reports a documents cell that was not parsed', () => {
    const base = daeDat();
    const issues = validateDaeDat(
      daeDat({
        goods: [
          {
            ...base.goods[0],
            documents: [],
            documentsSource: 'N380 - INV-1 / N705 - BL-9',
          },
        ],
      }),
    );

    expect(
      issues.some(
        (i) => i.field === 'goods[0].documents' && i.reason === 'invalid',
      ),
    ).toBe(true);
  });

  test('an empty documents cell is not reported', () => {
    const base = daeDat();
    const issues = validateDaeDat(
      daeDat({
        goods: [{ ...base.goods[0], documents: [], documentsSource: '' }],
      }),
    );

    expect(issues.filter((i) => i.field === 'goods[0].documents')).toEqual([]);
  });

  test('reports an empty release date instead of a broken one', () => {
    const issues = validateDaeDat(daeDat({ releaseDate: '' }));

    expect(
      issues.some((i) => i.field === 'releaseDate' && i.reason === 'missing'),
    ).toBe(true);
  });
});

describe('resolveDeclaredWeight', () => {
  test('H1, H1v6 and H4 are measured by net mass', () => {
    for (const track of ['H1', 'H1v6', 'H4']) {
      expect(isWeighedNet(track)).toBe(true);
      expect(resolveDeclaredWeight(track, 1200, 1250)).toBe(1200);
    }
  });

  test('every other track is measured by gross mass', () => {
    for (const track of ['H2', 'H7', '', 'H9']) {
      expect(isWeighedNet(track)).toBe(false);
      expect(resolveDeclaredWeight(track, 1200, 1250)).toBe(1250);
    }
  });

  test('stays undefined when the document lacks the mass its track uses', () => {
    expect(resolveDeclaredWeight('H1', undefined, 1250)).toBeUndefined();
    expect(resolveDeclaredWeight('H7', 1200, undefined)).toBeUndefined();
  });
});

describe('the converters never delete the caller file', () => {
  test('a path handed in survives a failed parse', async () => {
    const { mkdtempSync, writeFileSync, existsSync } = await import('node:fs');
    const { tmpdir } = await import('node:os');
    const { join } = await import('node:path');

    const dir = mkdtempSync(join(tmpdir(), 'adm-converter-'));
    const file = join(dir, 'not-a-real.pdf');
    writeFileSync(file, 'this is not a PDF');

    const PDFConverter = (await import('src/converters/PDFConverter')).default;

    await expect(
      new PDFConverter().run({ data: { path: file } }),
    ).rejects.toThrow();

    expect(existsSync(file)).toBe(true);
  });
});

describe('splitCityAndCountry', () => {
  test('takes the ISO code from the end, not the second part', () => {
    expect(splitCityAndCountry('SHARJAH - UAE - AE')).toEqual({
      city: 'SHARJAH',
      country: 'AE',
    });
  });

  test('keeps the hyphens that belong to the city name', () => {
    expect(splitCityAndCountry('SEOUL-SI YEONGDEUNGPO-GU - KR')).toEqual({
      city: 'SEOUL-SI YEONGDEUNGPO-GU',
      country: 'KR',
    });
  });

  test('reads the plain two-part form', () => {
    expect(splitCityAndCountry('CASABLANCA - MA')).toEqual({
      city: 'CASABLANCA',
      country: 'MA',
    });
  });

  test('claims no country when the cell carries only a city', () => {
    expect(splitCityAndCountry('SHARJAH')).toEqual({
      city: 'SHARJAH',
      country: '',
    });
  });

  test('says nothing about an empty cell', () => {
    expect(splitCityAndCountry('')).toEqual({ city: '', country: '' });
    expect(splitCityAndCountry(undefined)).toEqual({ city: '', country: '' });
  });
});
