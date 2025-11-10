import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NumberToWordsService {
  constructor() {}

  convert(value: number, lang: 'fr' | 'en' = 'fr'): string {
    if (isNaN(value)) {
      throw new Error('La valeur fournie n’est pas un nombre valide');
    }

    return lang === 'fr'
      ? this.convertToFrench(value)
      : this.convertToEnglish(value);
  }

  // --- Conversion en anglais ---
  private convertToEnglish(value: number): string {
    const ones = [
      '',
      'one',
      'two',
      'three',
      'four',
      'five',
      'six',
      'seven',
      'eight',
      'nine',
      'ten',
      'eleven',
      'twelve',
      'thirteen',
      'fourteen',
      'fifteen',
      'sixteen',
      'seventeen',
      'eighteen',
      'nineteen',
    ];
    const tens = [
      '',
      '',
      'twenty',
      'thirty',
      'forty',
      'fifty',
      'sixty',
      'seventy',
      'eighty',
      'ninety',
    ];

    if (value === 0) return 'zero';
    if (value < 0) return 'minus ' + this.convertToEnglish(-value);

    let words = '';

    const numToWords = (num: number): string => {
      if (num < 20) return ones[num];
      if (num < 100)
        return tens[Math.floor(num / 10)] + (num % 10 ? '-' + ones[num % 10] : '');
      if (num < 1000)
        return (
          ones[Math.floor(num / 100)] +
          ' hundred' +
          (num % 100 ? ' and ' + numToWords(num % 100) : '')
        );

      for (const [div, word] of [
        [1_000_000_000, 'billion'],
        [1_000_000, 'million'],
        [1000, 'thousand'],
      ] as [number, string][]) {
        if (num >= div)
          return (
            numToWords(Math.floor(num / div)) +
            ' ' +
            word +
            (num % div ? ' ' + numToWords(num % div) : '')
          );
      }

      return '';
    };

    words = numToWords(value);
    return words.trim();
  }

  // --- Conversion en français ---
  private convertToFrench(value: number): string {
    const units = [
      '',
      'un',
      'deux',
      'trois',
      'quatre',
      'cinq',
      'six',
      'sept',
      'huit',
      'neuf',
      'dix',
      'onze',
      'douze',
      'treize',
      'quatorze',
      'quinze',
      'seize',
    ];
    const tens = [
      '',
      'dix',
      'vingt',
      'trente',
      'quarante',
      'cinquante',
      'soixante',
      'soixante-dix',
      'quatre-vingt',
      'quatre-vingt-dix',
    ];

    if (value === 0) return 'zéro';
    if (value < 0) return 'moins ' + this.convertToFrench(-value);

    const numToWords = (num: number): string => {
      if (num < 17) return units[num];
      if (num < 20) return 'dix-' + units[num - 10];
      if (num < 70) {
        const ten = Math.floor(num / 10);
        const unit = num % 10;
        return tens[ten] + (unit ? (unit === 1 ? '-et-un' : '-' + units[unit]) : '');
      }
      if (num < 80) return 'soixante-' + numToWords(num - 60);
      if (num < 100) return 'quatre-vingt' + (num > 80 ? '-' + numToWords(num - 80) : '');
      if (num < 1000) {
        const hundred = Math.floor(num / 100);
        const rest = num % 100;
        return (
          (hundred > 1 ? units[hundred] + ' cent' : 'cent') +
          (rest ? ' ' + numToWords(rest) : '')
        );
      }
      if (num < 1_000_000) {
        const thousand = Math.floor(num / 1000);
        const rest = num % 1000;
        return (
          (thousand > 1 ? numToWords(thousand) + ' mille' : 'mille') +
          (rest ? ' ' + numToWords(rest) : '')
        );
      }
      if (num < 1_000_000_000) {
        const million = Math.floor(num / 1_000_000);
        const rest = num % 1_000_000;
        return (
          numToWords(million) +
          ' million' +
          (million > 1 ? 's' : '') +
          (rest ? ' ' + numToWords(rest) : '')
        );
      }
      return num.toString(); // pour très grands nombres
    };

    return numToWords(value).trim();
  }
}
