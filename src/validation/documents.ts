import { ValidationIssue } from './errors';
import {
  ACCOUNTING_PROFILE,
  DAE_DAT_PROFILE,
  DocumentProfile,
  OLD_DAE_DAT_PROFILE,
  getImportProfile,
  withDaeDatType,
} from './rules';
import {
  checkFieldSet,
  concludeValidation,
  isMissing,
  ValidationOptions,
} from './validator';

export type ImportDeclarationToValidate = {
  mrn: string;
  version: string;
  track: string;
  date: string;
  acceptanceDate: string;
  releaseDate: string;
  releaseCode: string;
  totalGrossWeight: number | undefined;
  invoiceValue: number | undefined;
  currency: string;
  exchangeRate: number | undefined;
  incoterm: string;
  originCountryAlpha2: string;
  supplier: {
    companyName: string;
    vatNumber: string;
    country: string;
    address: string;
    city: string;
    postalCode: string;
  };
  goods: {
    nr: string;
    ncCode: string;
    taricCode: string;
    identificationCode: string;
    description: string;
    country: string;
    netWeight: number | undefined;
    grossWeight: number | undefined;
    price: number | undefined;
    statisticValue: number | undefined;
    customsRegime: string;
    requestedRegime: string;
    previousRegime: string;
    releaseCode: string;
    releaseDate: string;
    page?: number;
  }[];
};

export function validateImportDeclaration(
  declaration: ImportDeclarationToValidate,
  options?: ValidationOptions & { source?: 'pdf' | 'xml' },
): ValidationIssue[] {
  const profile: DocumentProfile = getImportProfile(declaration.track);
  const issues: ValidationIssue[] = [];

  issues.push(
    ...checkFieldSet({
      scope: 'declaration',
      values: {
        mrn: declaration.mrn,
        version: declaration.version,
        track: declaration.track,
        date: declaration.date,
        acceptanceDate: declaration.acceptanceDate,
        releaseDate: declaration.releaseDate,
        releaseCode: declaration.releaseCode,
        totalGrossWeight: declaration.totalGrossWeight,
        invoiceValue: declaration.invoiceValue,
        currency: declaration.currency,
        exchangeRate: declaration.exchangeRate,
        incoterm: declaration.incoterm,
        originCountryAlpha2: declaration.originCountryAlpha2,
      },
      requirements: profile.declaration,
    }),
  );

  issues.push(
    ...checkFieldSet({
      scope: 'supplier',
      pathPrefix: 'supplier',
      values: { ...declaration.supplier },
      requirements: profile.party,
    }),
  );

  if (declaration.goods.length === 0) {
    issues.push({
      scope: 'declaration',
      field: 'goods',
      reason: 'missing',
      message: 'no article was extracted from the document',
    });
  }

  declaration.goods.forEach((good, index) => {
    issues.push(
      ...checkFieldSet({
        scope: 'good',
        pathPrefix: `goods[${index}]`,
        values: {
          nr: good.nr,
          ncCode: good.ncCode,
          taricCode: good.taricCode,
          identificationCode: good.identificationCode,
          description: good.description,
          country: good.country,
          netWeight: good.netWeight,
          grossWeight: good.grossWeight,
          price: good.price,
          statisticValue: good.statisticValue,
          customsRegime: good.customsRegime,
          requestedRegime: good.requestedRegime,
          previousRegime: good.previousRegime,
          releaseCode: good.releaseCode,
          releaseDate: good.releaseDate,
        },
        requirements: profile.good,
        goodNr: good.nr,
        page: good.page,
      }),
    );
  });

  return concludeValidation(
    {
      document: options?.source === 'xml' ? 'declaration XML' : 'declaration',
      profile: declaration.track || 'unknown track',
      mrn: declaration.mrn,
    },
    issues,
    options,
  );
}

export type DaeDatToValidate = {
  type: string;
  releaseDate: string;
  releaseCode: string;
  customsExitOffice: string;
  customsExportOffice?: string;
  totalPackages: number | undefined;
  totalGrossWeight: number | undefined;
  totalStatisticValue: number;
  transitNetworkCountry: string;
  transportMode: number;
  consignee: {
    companyName: string;
    companyAddress: string;
    country: string;
    city: string;
    postalCode: string;
  };
  goods: {
    nr: string;
    ncCode: string;
    identificationCode: string;
    description: string;
    netWeight: number | undefined;
    statisticValue: number | undefined;
    customsRegime: string;
    requestedRegime: string;
    previousRegime: string;
    documents: { code: string; identifier: string }[];
    documentsSource?: string;
  }[];
};

export function validateDaeDat(
  statement: DaeDatToValidate,
  options?: ValidationOptions & { layout?: 'current' | 'old'; mrn?: string },
): ValidationIssue[] {
  const profile = withDaeDatType(
    options?.layout === 'old' ? OLD_DAE_DAT_PROFILE : DAE_DAT_PROFILE,
    statement.type,
  );
  const issues: ValidationIssue[] = [];

  issues.push(
    ...checkFieldSet({
      scope: 'declaration',
      values: {
        type: statement.type,
        releaseDate: statement.releaseDate,
        releaseCode: statement.releaseCode,
        customsExitOffice: statement.customsExitOffice,
        customsExportOffice: statement.customsExportOffice,
        totalPackages: statement.totalPackages,
        totalGrossWeight: statement.totalGrossWeight,
        totalStatisticValue: statement.totalStatisticValue,
        transitNetworkCountry: statement.transitNetworkCountry,
        transportMode:
          statement.transportMode === -1 ? undefined : statement.transportMode,
      },
      requirements: profile.declaration,
    }),
  );

  const consigneeValues: Record<string, unknown> = { ...statement.consignee };
  const consigneeDeclared = Object.values(consigneeValues).some(
    (value) => !isMissing(value),
  );

  if (consigneeDeclared) {
    issues.push(
      ...checkFieldSet({
        scope: 'consignee',
        pathPrefix: 'consignee',
        values: consigneeValues,
        requirements: profile.party,
      }),
    );
  }

  if (statement.goods.length === 0) {
    issues.push({
      scope: 'declaration',
      field: 'goods',
      reason: 'missing',
      message: 'no article was extracted from the document',
    });
  }

  statement.goods.forEach((good, index) => {
    issues.push(
      ...checkFieldSet({
        scope: 'good',
        pathPrefix: `goods[${index}]`,
        values: {
          nr: good.nr,
          ncCode: good.ncCode,
          identificationCode: good.identificationCode,
          description: good.description,
          netWeight: good.netWeight,
          statisticValue: good.statisticValue,
          customsRegime: good.customsRegime,
          requestedRegime: good.requestedRegime,
          previousRegime: good.previousRegime,
        },
        requirements: profile.good,
        goodNr: good.nr,
        page: index + 1,
      }),
    );

    if (!!good.documentsSource?.trim() && good.documents.length === 0) {
      issues.push({
        scope: 'good',
        field: `goods[${index}].documents`,
        reason: 'invalid',
        message:
          'the documents cell carries text but no document code was recognised in it',
        goodNr: good.nr,
        page: index + 1,
        value: good.documentsSource.trim(),
      });
    }
  });

  return concludeValidation(
    {
      document: options?.layout === 'old' ? 'DAE/DAT (old layout)' : 'DAE/DAT',
      profile: statement.type || 'unknown type',
      mrn: options?.mrn,
    },
    issues,
    options,
  );
}

export type AccountingToValidate = Record<string, unknown>;

export function validateAccounting(
  statement: AccountingToValidate,
  options?: ValidationOptions & { mrn?: string },
): ValidationIssue[] {
  const issues = checkFieldSet({
    scope: 'declaration',
    values: statement,
    requirements: ACCOUNTING_PROFILE.declaration,
  });

  return concludeValidation(
    {
      document: 'accounting statement',
      profile: String(statement.version ?? '') || 'no version',
      mrn: options?.mrn,
    },
    issues,
    options,
  );
}
