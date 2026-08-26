import {
  AdmValidationError,
  ValidationContext,
  ValidationIssue,
  ValidationScope,
} from './errors';
import { FieldRequirements, Requirement } from './rules';

export type ValidationMode = 'report' | 'throw' | 'off';

export type ValidationOptions = {
  mode?: ValidationMode;
};

export const DEFAULT_VALIDATION_MODE: ValidationMode = 'report';

export function isMissing(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (typeof value === 'number') return Number.isNaN(value);
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

type FormatCheck = {
  test: (value: unknown) => boolean;
  message: string;
};

const isFiniteNumber = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v);

const nonNegativeAmount: FormatCheck = {
  test: (v) => isFiniteNumber(v) && v >= 0,
  message: 'expected a non negative amount',
};

const negativeAmount: FormatCheck = {
  test: (v) => isFiniteNumber(v) && v < 0,
  message: 'expected a negative amount',
};

const positiveAmount: FormatCheck = {
  test: (v) => isFiniteNumber(v) && v > 0,
  message: 'expected an amount above zero',
};

const NON_NEGATIVE_ACCOUNTING_FIELDS = [
  'totalDuties',
  'totalTaxes',
  'totalVatToBePaid',
  'totalSeaTaxes',
  'tax931',
  'tax931TaxableValue',
  'tax931Quantity',
  'tax123',
  'tax123TaxableValue',
  'tax123Quantity',
  'taxA30',
  'taxA35',
  'taxB00Vat22',
  'taxB00Vat10',
  'taxB00Vat04',
  'taxB00Vat00',
];

const FORMAT_CHECKS: Record<string, FormatCheck> = {
  ...Object.fromEntries(
    NON_NEGATIVE_ACCOUNTING_FIELDS.map((field) => [field, nonNegativeAmount]),
  ),
  vatExemptionValue: negativeAmount,
  vatExemptionTaxableValue: positiveAmount,
  date: {
    test: (v) => /^\d{2}\/\d{2}\/\d{4}$/.test(String(v)),
    message: 'expected a dd/MM/yyyy date',
  },
  acceptanceDate: {
    test: (v) => /^\d{2}\/\d{2}\/\d{4}$/.test(String(v)),
    message: 'expected a dd/MM/yyyy date',
  },
  releaseDate: {
    test: (v) => /^\d{2}\/\d{2}\/\d{4}$/.test(String(v)),
    message: 'expected a dd/MM/yyyy date',
  },
  country: {
    test: (v) => /^[A-Za-z]{2}$/.test(String(v).trim()),
    message: 'expected a 2 letter country code',
  },
  originCountryAlpha2: {
    test: (v) => /^[A-Za-z]{2}$/.test(String(v).trim()),
    message: 'expected a 2 letter country code',
  },
  transitNetworkCountry: {
    test: (v) => /^[A-Za-z]{2}$/.test(String(v).trim()),
    message: 'expected a 2 letter country code',
  },
  currency: {
    test: (v) => /^[A-Za-z]{3}$/.test(String(v).trim()),
    message: 'expected a 3 letter currency code',
  },
  ncCode: {
    test: (v) => /^\d{6,10}$/.test(String(v).trim()),
    message: 'expected a numeric commodity code',
  },
  taricCode: {
    test: (v) => /^\d{2}$/.test(String(v).trim()),
    message: 'expected a 2 digit TARIC code',
  },
  price: {
    test: (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0,
    message: 'expected a non negative amount',
  },
  statisticValue: {
    test: (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0,
    message: 'expected a non negative amount',
  },
  invoiceValue: {
    test: (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0,
    message: 'expected a non negative amount',
  },
  exchangeRate: {
    test: (v) => typeof v === 'number' && Number.isFinite(v) && v > 0,
    message: 'expected a positive exchange rate',
  },
  netWeight: {
    test: (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0,
    message: 'expected a non negative weight',
  },
  grossWeight: {
    test: (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0,
    message: 'expected a non negative weight',
  },
  totalGrossWeight: {
    test: (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0,
    message: 'expected a non negative weight',
  },
  totalPackages: {
    test: (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0,
    message: 'expected a non negative package count',
  },
  transportMode: {
    test: (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0,
    message: 'expected a transport mode code',
  },
};

export type FieldSet = {
  scope: ValidationScope;
  pathPrefix?: string;
  values: Record<string, unknown>;
  requirements: FieldRequirements;
  goodNr?: string;
  page?: number;
};

function describe(value: unknown): string | number | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return value;
  return undefined;
}

export function checkFieldSet(set: FieldSet): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const field of Object.keys(set.requirements)) {
    const requirement: Requirement = set.requirements[field];

    const value = set.values[field];
    const path = set.pathPrefix ? `${set.pathPrefix}.${field}` : field;
    const missing = isMissing(value);

    if (requirement === 'optional' && missing) continue;

    if (requirement === 'required' && missing) {
      issues.push({
        scope: set.scope,
        field: path,
        reason: 'missing',
        message: 'the document type requires this value, none was extracted',
        goodNr: set.goodNr,
        page: set.page,
      });
      continue;
    }

    if (requirement === 'absent' && !missing) {
      issues.push({
        scope: set.scope,
        field: path,
        reason: 'unexpected',
        message: 'the document type does not carry this value',
        goodNr: set.goodNr,
        page: set.page,
        value: describe(value),
      });
      continue;
    }

    if (missing) continue;

    const format = FORMAT_CHECKS[field];
    if (!!format && !format.test(value)) {
      issues.push({
        scope: set.scope,
        field: path,
        reason: 'invalid',
        message: format.message,
        goodNr: set.goodNr,
        page: set.page,
        value: describe(value),
      });
    }
  }

  return issues;
}

export function concludeValidation(
  context: ValidationContext,
  issues: ValidationIssue[],
  options?: ValidationOptions,
): ValidationIssue[] {
  const mode = options?.mode ?? DEFAULT_VALIDATION_MODE;

  if (mode === 'off') return [];
  if (issues.length === 0) return [];
  if (mode === 'throw') throw new AdmValidationError(context, issues);

  return issues;
}
