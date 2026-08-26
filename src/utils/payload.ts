/* eslint-disable @typescript-eslint/no-explicit-any */

export class AdmPayloadError extends Error {
  public readonly document: string;
  public readonly path: string;

  constructor(document: string, path: string) {
    super(`Unexpected ${document} payload: ${path} not found in the response`);
    this.name = 'AdmPayloadError';
    this.document = document;
    this.path = path;
  }
}

export function requireNode(root: any, path: string, document: string): any {
  let current = root;

  const segments = path.split('.');
  for (let i = 0; i < segments.length; i++) {
    if (current === undefined || current === null) {
      throw new AdmPayloadError(document, segments.slice(0, i).join('.'));
    }
    current = current[segments[i]];
  }

  if (current === undefined || current === null) {
    throw new AdmPayloadError(document, path);
  }

  return current;
}

export function ensureArray<T>(input: T | T[] | undefined | null): T[] {
  if (Array.isArray(input)) return input;
  if (input === undefined || input === null) return [];
  return [input];
}

export function assertMrnMatches(
  requested: string,
  returned: unknown,
  document: string,
): void {
  const found = typeof returned === 'string' ? returned.trim() : '';

  if (!found) {
    throw new AdmPayloadError(document, 'the MRN of the returned document');
  }

  if (!!requested && found !== requested.trim()) {
    throw new Error(
      `Unexpected ${document} payload: asked for MRN ${requested}, got ${found}`,
    );
  }
}
