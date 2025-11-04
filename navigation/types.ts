import { Currency } from '../utils/currency';

// --- From SaveApp ---
export interface Account {
  id: string;
  name: string;
  balance: number;
}

// Data for the Pie Chart
export interface PieSliceData { 
  value: number; 
  color: string; 
  name: string; 
  percentage: string | number; 
  originalBalance?: number; 
  focused?: boolean; 
  labelText?: string; 
}

// --- From ExpenseTracker ---
export type Expense = {
  id: string;
  amount: number;
  category: string;
  note: string;
  date: string; // ISO string
  accountId: string; // <-- **THE CRITICAL LINK**
};

export type HistoryItem = {
  id: string;
  date: string;
  total: number;
  expenses: Expense[]; 
};

// --- The New Combined "Brain" ---
export type AppContextType = {
  // Account data
  accounts: Account[];
  addAccount: (account: Omit<Account, 'id'>) => void;
  editAccount: (updatedAccount: Account) => void;
  deleteAccount: (id: string) => void;
  
  // Expense data
  expenses: Expense[];
  history: HistoryItem[];
  
  // --- **THE CORE INTEGRATION** ---
  addExpense: (data: Omit<Expense, 'id'|'date'|'accountId'>, accountId: string) => void;
  deleteExpense: (expenseId: string) => void;
  resetExpenses: () => void;
  
  // Settings & Helpers
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  isLoading: boolean;
  formatCurrency: (amount: number, showSymbol?: boolean, useDecimals?: boolean) => string;
  getExpensesByCategory: () => { [key: string]: number };
};