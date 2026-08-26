export type Requirement = 'required' | 'optional' | 'absent';

export type FieldRequirements = Record<string, Requirement>;

export type DocumentProfile = {
  declaration: FieldRequirements;
  party: FieldRequirements;
  good: FieldRequirements;
};

const IMPORT_BASE_DECLARATION: FieldRequirements = {
  mrn: 'required',
  version: 'required',
  track: 'required',
  date: 'required',
  acceptanceDate: 'required',
  releaseDate: 'optional',
  releaseCode: 'optional',
  totalGrossWeight: 'required',
  originCountryAlpha2: 'required',
  invoiceValue: 'required',
  currency: 'required',
  exchangeRate: 'required',
  incoterm: 'required',
};

const IMPORT_BASE_PARTY: FieldRequirements = {
  companyName: 'required',
  vatNumber: 'optional',
  country: 'required',
  address: 'optional',
  city: 'required',
  postalCode: 'required',
};

const NO_PARTY: FieldRequirements = {
  companyName: 'optional',
  vatNumber: 'optional',
  country: 'optional',
  address: 'optional',
  city: 'optional',
  postalCode: 'optional',
};

const IMPORT_BASE_GOOD: FieldRequirements = {
  nr: 'required',
  ncCode: 'required',
  taricCode: 'required',
  identificationCode: 'required',
  description: 'required',
  country: 'required',
  netWeight: 'required',
  grossWeight: 'optional',
  price: 'required',
  statisticValue: 'required',
  customsRegime: 'required',
  requestedRegime: 'required',
  previousRegime: 'required',
  releaseCode: 'optional',
  releaseDate: 'optional',
};

const H1: DocumentProfile = {
  declaration: {
    ...IMPORT_BASE_DECLARATION,
    invoiceValue: 'optional',
    currency: 'optional',
  },
  party: NO_PARTY,
  good: IMPORT_BASE_GOOD,
};

const H1V6: DocumentProfile = {
  declaration: IMPORT_BASE_DECLARATION,
  party: IMPORT_BASE_PARTY,
  good: IMPORT_BASE_GOOD,
};

const H4: DocumentProfile = {
  declaration: IMPORT_BASE_DECLARATION,
  party: IMPORT_BASE_PARTY,
  good: IMPORT_BASE_GOOD,
};

const H2: DocumentProfile = {
  declaration: {
    ...IMPORT_BASE_DECLARATION,
    invoiceValue: 'optional',
    exchangeRate: 'optional',
    currency: 'optional',
    incoterm: 'optional',
  },
  party: NO_PARTY,
  good: {
    ...IMPORT_BASE_GOOD,
    netWeight: 'optional',
    grossWeight: 'required',
    price: 'optional',
  },
};

const H7: DocumentProfile = {
  declaration: {
    ...IMPORT_BASE_DECLARATION,
    originCountryAlpha2: 'absent',
    invoiceValue: 'absent',
    exchangeRate: 'absent',
    currency: 'absent',
    incoterm: 'absent',
  },
  party: IMPORT_BASE_PARTY,
  good: {
    ...IMPORT_BASE_GOOD,
    taricCode: 'optional',
    customsRegime: 'optional',
    requestedRegime: 'optional',
    previousRegime: 'optional',
    netWeight: 'optional',
    grossWeight: 'required',
    country: 'absent',
    price: 'absent',
    statisticValue: 'absent',
  },
};

export const IMPORT_PROFILES: Record<string, DocumentProfile> = {
  H1,
  H1v6: H1V6,
  H2,
  H4,
  H7,
};

export const IMPORT_FALLBACK_PROFILE: DocumentProfile = {
  declaration: {
    mrn: 'required',
    track: 'required',
    date: 'required',
    totalGrossWeight: 'optional',
    originCountryAlpha2: 'optional',
    invoiceValue: 'optional',
    currency: 'optional',
    exchangeRate: 'optional',
    incoterm: 'optional',
    version: 'optional',
    acceptanceDate: 'optional',
    releaseDate: 'optional',
    releaseCode: 'optional',
  },
  party: NO_PARTY,
  good: {
    nr: 'optional',
    ncCode: 'required',
    taricCode: 'optional',
    identificationCode: 'required',
    description: 'required',
    country: 'optional',
    netWeight: 'optional',
    grossWeight: 'optional',
    price: 'optional',
    statisticValue: 'optional',
    customsRegime: 'optional',
    requestedRegime: 'optional',
    previousRegime: 'optional',
    releaseCode: 'optional',
    releaseDate: 'optional',
  },
};

export function getImportProfile(track: string): DocumentProfile {
  return IMPORT_PROFILES[track] ?? IMPORT_FALLBACK_PROFILE;
}

const DAE_DAT_BASE: DocumentProfile = {
  declaration: {
    type: 'required',
    releaseDate: 'required',
    releaseCode: 'required',
    customsExitOffice: 'required',
    customsExportOffice: 'optional',
    totalPackages: 'required',
    totalGrossWeight: 'required',
    totalStatisticValue: 'required',
    transitNetworkCountry: 'required',
    transportMode: 'required',
  },
  party: {
    companyName: 'required',
    companyAddress: 'optional',
    country: 'required',
    city: 'required',
    postalCode: 'optional',
  },
  good: {
    nr: 'required',
    ncCode: 'required',
    identificationCode: 'required',
    description: 'required',
    netWeight: 'required',
    statisticValue: 'required',
    customsRegime: 'required',
    requestedRegime: 'required',
    previousRegime: 'required',
  },
};

export const DAE_DAT_PROFILE: DocumentProfile = DAE_DAT_BASE;

export const OLD_DAE_DAT_PROFILE: DocumentProfile = {
  ...DAE_DAT_BASE,
  declaration: {
    ...DAE_DAT_BASE.declaration,
    customsExportOffice: 'optional',
  },
};

export const DAE_DAT_TYPES_WITHOUT_TRANSPORT_MODE = ['CO'];

export function withDaeDatType(
  profile: DocumentProfile,
  type: string | undefined,
): DocumentProfile {
  if (!DAE_DAT_TYPES_WITHOUT_TRANSPORT_MODE.includes(type ?? '')) {
    return profile;
  }

  return {
    ...profile,
    declaration: { ...profile.declaration, transportMode: 'optional' },
  };
}

export const ACCOUNTING_PROFILE: DocumentProfile = {
  declaration: {
    version: 'optional',
    totalDuties: 'required',
    totalTaxes: 'required',
    totalVatToBePaid: 'required',
    rectificationOrCancellationDate: 'optional',
    vatExemptionValue: 'optional',
    vatExemptionTaxableValue: 'optional',
    letterOfIntent: 'optional',
    taxB00Vat22: 'optional',
    taxB00Vat10: 'optional',
    taxB00Vat04: 'optional',
    taxB00Vat00: 'optional',
    tax931: 'optional',
    tax931TaxableValue: 'optional',
    tax931Quantity: 'optional',
    tax123: 'optional',
    tax123TaxableValue: 'optional',
    tax123Quantity: 'optional',
    taxA30: 'optional',
    taxA35: 'optional',
    totalSeaTaxes: 'optional',
  },
  party: {},
  good: {},
};

export const TRACKS_WEIGHED_NET: readonly string[] = ['H1', 'H1v6', 'H4'];

export function isWeighedNet(track: string): boolean {
  return TRACKS_WEIGHED_NET.includes(track);
}

export function resolveDeclaredWeight(
  track: string,
  netWeight: number | undefined,
  grossWeight: number | undefined,
): number | undefined {
  return isWeighedNet(track) ? netWeight : grossWeight;
}
