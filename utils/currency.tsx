// utils/currency.ts
export const CURRENCIES = ['USD', 'EUR', 'JPY', 'GBP', 'PHP'] as const;
export type Currency = typeof CURRENCIES[number];

export const getCurrencySymbol = (currency: Currency | string): string => {
  switch (currency) {
    case 'USD': return '$';
    case 'EUR': return '€';
    case 'JPY': return '¥';
    case 'GBP': return '£';
    case 'PHP': return '₱';
    default: return '$';
  }
};