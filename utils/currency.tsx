// Define the currencies you want to support
export const CURRENCIES = ['USD', 'EUR', 'JPY', 'GBP', 'PHP'] as const;

// Create a TypeScript type from the array
export type Currency = typeof CURRENCIES[number];

// Helper function to get the symbol for a given currency
export const getCurrencySymbol = (currency: Currency | string): string => {
  switch (currency) {
    case 'USD': return '$';
    case 'EUR': return '€';
    case 'JPY': return '¥';
    case 'GBP': return '£';
    case 'PHP': return '₱';
    default: return '₱'; // Default to PHP
  }
};