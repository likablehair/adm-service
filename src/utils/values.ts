const NUMERIC_TEXT_FIELDS: ReadonlySet<string> = new Set([
  'netWeight',
  'grossWeight',
  'totalGrossWeight',
  'totalPackages',
  'invoiceValue',
  'exchangeRate',
  'price',
  'statisticValue',
]);

export function convertAsterisksToZero<T extends Record<string, unknown>>(
  object: T,
  ...keysToConvertVoidToZero: (keyof T)[]
): T {
  for (const key in object) {
    if (!Object.prototype.hasOwnProperty.call(object, key)) continue;

    const element = object[key];
    const isVoidToZeroKey = keysToConvertVoidToZero.includes(key);

    if (
      (element === '*' && NUMERIC_TEXT_FIELDS.has(key)) ||
      (isVoidToZeroKey && (element === '' || element === '*'))
    ) {
      object[key] = '0' as T[typeof key];
    }
  }

  return object;
}

export function convertArrayToString(array: (string | undefined)[]): string {
  return array
    .filter((el): el is string => !!el)
    .map((el) => el.trim())
    .join(' ');
}

export function parseDecimal(value: string | undefined): number | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;

  const normalized = trimmed.includes(',')
    ? trimmed.replace(/\./g, '').replace(',', '.')
    : trimmed;

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function columnsInReadingOrder(
  cells: {
    entity?: string;
    column?: string;
    yRange: [number, number];
  }[],
  entity: string,
  prefix: string,
): string[] {
  const pattern = new RegExp(`^${prefix}\\d+$`);

  return cells
    .filter((cell) => cell.entity === entity && pattern.test(cell.column ?? ''))
    .sort((a, b) => a.yRange[0] - b.yRange[0])
    .map((cell) => cell.column as string);
}

export function splitCityAndCountry(value: string | undefined): {
  city: string;
  country: string;
} {
  const parts = (value ?? '')
    .split(' - ')
    .map((part) => part.trim())
    .filter((part) => part !== '');

  if (parts.length < 2) return { city: parts[0] ?? '', country: '' };

  return { city: parts[0], country: parts[parts.length - 1] };
}
