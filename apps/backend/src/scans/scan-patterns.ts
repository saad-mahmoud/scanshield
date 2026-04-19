import { FindingType } from '../entities/finding-type.enum';
import { RiskLevel } from '../entities/risk-level.enum';

export interface ScanMatch {
  type: FindingType;
  value: string;
  position: number;
}

/** Basic email pattern */
const EMAIL = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;

/** US phone (10 digits, optional country code / separators) */
const US_PHONE =
  /\b(?:\+?1[-.\s]?)?(?:\(\d{3}\)|\d{3})[-.\s]?\d{3}[-.\s]?\d{4}\b/g;

/** SSN format XXX-XX-XXXX */
const SSN = /\b\d{3}-\d{2}-\d{4}\b/g;

/** 16 digits with optional spaces/dashes between groups (basic, not Luhn-validated) */
const CREDIT_CARD = /\b(?:\d{4}[-\s]?){3}\d{4}\b/g;

const PATTERNS: ReadonlyArray<{ type: FindingType; regex: RegExp }> = [
  { type: FindingType.Email, regex: EMAIL },
  { type: FindingType.Phone, regex: US_PHONE },
  { type: FindingType.Ssn, regex: SSN },
  { type: FindingType.CreditCard, regex: CREDIT_CARD },
];

/**
 * Collect all regex matches with start offset in the original string.
 */
export function scanContent(content: string): ScanMatch[] {
  const matches: ScanMatch[] = [];

  for (const { type, regex } of PATTERNS) {
    for (const match of content.matchAll(regex)) {
      if (match.index !== undefined) {
        matches.push({ type, value: match[0], position: match.index });
      }
    }
  }

  return matches.sort((a, b) => a.position - b.position);
}

export function computeRiskLevel(matches: ScanMatch[]): RiskLevel {
  if (matches.length === 0) {
    return RiskLevel.Clean;
  }

  const types = new Set(matches.map((m) => m.type));
  if (types.has(FindingType.Ssn) || types.has(FindingType.CreditCard)) {
    return RiskLevel.Critical;
  }
  if (types.size >= 2) {
    return RiskLevel.High;
  }

  const only = matches[0].type;
  if (only === FindingType.Email || only === FindingType.Phone) {
    return RiskLevel.Medium;
  }

  return RiskLevel.Medium;
}
