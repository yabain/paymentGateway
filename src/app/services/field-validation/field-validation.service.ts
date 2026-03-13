import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export interface CurrencyAmountRule {
  min: number;
  max: number;
}

@Injectable({
  providedIn: 'root',
})
export class FieldValidationService {
  private readonly rules: Record<string, CurrencyAmountRule> = {
    XAF: { min: 1000, max: 500000 },
    KES: { min: 50, max: 400000 },
    NGN: { min: 1000, max: 1000000 },
  };

  normalizeCurrency(currency?: string): string {
    return (currency || 'XAF').toUpperCase();
  }

  getRule(currency?: string): CurrencyAmountRule {
    const code = this.normalizeCurrency(currency);
    return this.rules[code] || this.rules['XAF'];
  }

  parseAmount(value: any): number {
    if (typeof value === 'number') {
      return value;
    }

    if (typeof value === 'string') {
      const cleanValue = value.replace(/\s/g, '').replace(',', '.');
      return Number(cleanValue);
    }

    return Number(value);
  }

  isValidAmount(value: any, currency?: string): boolean {
    const amount = this.parseAmount(value);
    if (!Number.isFinite(amount)) {
      return false;
    }

    const { min, max } = this.getRule(currency);
    return amount >= min && amount <= max;
  }

  getRangeMessage(currency?: string): string {
    const code = this.normalizeCurrency(currency);
    const { min, max } = this.getRule(code);
    return `${code}: min ${min}, max ${max}`;
  }

  currencyAmountValidator(getCurrency: () => string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value === null || control.value === undefined || control.value === '') {
        return null;
      }

      const currency = getCurrency();
      const amount = this.parseAmount(control.value);

      if (!Number.isFinite(amount)) {
        return {
          currencyAmount: {
            currency,
            reason: 'notNumber',
          },
        };
      }

      const { min, max } = this.getRule(currency);

      if (amount < min || amount > max) {
        return {
          currencyAmount: {
            currency,
            min,
            max,
            actual: amount,
          },
        };
      }

      return null;
    };
  }

  isValidEmail(email?: string): boolean {
    if (!email) {
      return false;
    }
    const normalized = String(email).trim();
    const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regexEmail.test(normalized);
  }

  emailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value === null || control.value === undefined || control.value === '') {
        return null;
      }
      return this.isValidEmail(control.value) ? null : { emailFormat: true };
    };
  }

  normalizePhoneDigits(value?: string): string {
    return String(value || '').replace(/\D/g, '');
  }

  isValidPhoneForCountry(phone: string, countryCode?: string): boolean {
    const digits = this.normalizePhoneDigits(phone);
    const code = String(countryCode || '').trim();

    if (code === '237') {
      return /^6\d{8}$/.test(digits);
    }

    if (code === '254') {
      return /^(7|1)\d{8}$/.test(digits);
    }

    if (code === '234') {
      return /^[789]\d{9}$/.test(digits);
    }

    return /^\d{6,15}$/.test(digits);
  }

  isValidOperatorPhone(
    phone: string,
    countryCode?: string,
    operator?: 'OM' | 'MTN' | 'MPESA' | string,
  ): boolean {
    const digits = this.normalizePhoneDigits(phone);
    const code = String(countryCode || '').trim();
    const op = String(operator || '').toUpperCase();

    if (op === 'OM' && code === '237') {
      return /^6((55|56|57|58|59|86|87|88|89)|9[0-9])\d{6}$/.test(digits);
    }

    if (op === 'MTN' && code === '237') {
      return /^6((50|51|52|53|54)|7[0-9]|8[0-5])\d{6}$/.test(digits);
    }

    if (op === 'MPESA' && code === '254') {
      return /^(7|1)\d{8}$/.test(digits);
    }

    return this.isValidPhoneForCountry(digits, code);
  }

  phoneValidator(getCountryCode: () => string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value === null || control.value === undefined || control.value === '') {
        return null;
      }

      const countryCode = getCountryCode();
      return this.isValidPhoneForCountry(control.value, countryCode)
        ? null
        : { phoneFormat: { countryCode } };
    };
  }

  operatorPhoneValidator(
    getCountryCode: () => string,
    getOperator: () => string,
  ): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value === null || control.value === undefined || control.value === '') {
        return null;
      }

      const countryCode = getCountryCode();
      const operator = getOperator();
      return this.isValidOperatorPhone(control.value, countryCode, operator)
        ? null
        : { operatorPhoneFormat: { countryCode, operator } };
    };
  }

  isPaystackCurrency(currency?: string): boolean {
    const normalized = (currency || '').toUpperCase();
    return normalized === 'KES';
  }

  getPaymentProviderName(currency?: string): string {
    return this.isPaystackCurrency(currency) ? 'Paystack' : 'Flutterwave';
  }
}
