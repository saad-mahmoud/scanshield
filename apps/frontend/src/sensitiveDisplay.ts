const EMAIL_TYPE = 'email';
const SSN_TYPE = 'ssn';
const CREDIT_CARD_TYPE = 'credit_card';

function maskEmail(value: string): string {
  const atIndex = value.indexOf('@');
  if (atIndex <= 0 || atIndex === value.length - 1) {
    return '****';
  }

  const local = value.slice(0, atIndex);
  const domain = value.slice(atIndex + 1);
  const visibleTail = local.slice(-4);
  const maskedHead = '*'.repeat(Math.max(1, local.length - visibleTail.length));
  return `${maskedHead}${visibleTail}@${domain}`;
}

function maskSsn(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length < 4) {
    return '***-**-****';
  }
  return `***-**-${digits.slice(-4)}`;
}

function maskCreditCard(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length < 4) {
    return '**** **** **** ****';
  }
  return `**** **** **** ${digits.slice(-4)}`;
}

export function maskByFindingType(type: string, value: string): string {
  switch (type) {
    case EMAIL_TYPE:
      return maskEmail(value);
    case SSN_TYPE:
      return maskSsn(value);
    case CREDIT_CARD_TYPE:
      return maskCreditCard(value);
    default:
      return value;
  }
}
