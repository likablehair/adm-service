export type ValidationScope = 'declaration' | 'supplier' | 'consignee' | 'good';

export type ValidationReason =
  | 'missing'
  | 'unexpected'
  | 'invalid'
  | 'inconsistent';

export type ValidationIssue = {
  scope: ValidationScope;
  field: string;
  reason: ValidationReason;
  message: string;
  goodNr?: string;
  page?: number;
  value?: string | number;
};

export type ValidationContext = {
  document: string;
  profile: string;
  mrn?: string;
};

export class AdmValidationError extends Error {
  public readonly issues: ValidationIssue[];
  public readonly document: string;
  public readonly profile: string;
  public readonly mrn?: string;

  constructor(context: ValidationContext, issues: ValidationIssue[]) {
    super(AdmValidationError.buildMessage(context, issues));
    this.name = 'AdmValidationError';
    this.issues = issues;
    this.document = context.document;
    this.profile = context.profile;
    this.mrn = context.mrn;
  }

  private static buildMessage(
    context: ValidationContext,
    issues: ValidationIssue[],
  ): string {
    const subject = [context.document, context.profile, context.mrn]
      .filter((part) => !!part)
      .join(' ');

    const detail = issues
      .map((issue) => {
        const where = issue.goodNr ? ` (article ${issue.goodNr})` : '';
        return `${issue.field}${where}: ${issue.message}`;
      })
      .join('; ');

    return `${subject} failed validation with ${issues.length} issue(s) — ${detail}`;
  }

  public toSummary(): {
    document: string;
    profile: string;
    mrn?: string;
    issues: ValidationIssue[];
  } {
    return {
      document: this.document,
      profile: this.profile,
      mrn: this.mrn,
      issues: this.issues,
    };
  }
}

export function isAdmValidationError(
  error: unknown,
): error is AdmValidationError {
  return error instanceof AdmValidationError;
}
