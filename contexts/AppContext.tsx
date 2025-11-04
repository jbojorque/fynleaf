import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Account, AppContextType, Expense, HistoryItem } from '../navigation/types';
import { Currency } from '../utils/currency';

const APP_DATA_KEY = '@FinanceAppStore_v1';

interface AppData {
  accounts: Account[];
  expenses: Expense[];
  history: HistoryItem[];
  currency: Currency;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currency, setCurrency] = useState<Currency>('PHP'); // Default to PHP

  useEffect(() => {
    const loadData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem(APP_DATA_KEY);
        if (jsonValue !== null) {
          const data: AppData = JSON.parse(jsonValue);
          setAccounts(data.accounts || []);
          setExpenses(data.expenses || []);
          setHistory(data.history || []);
          setCurrency(data.currency || 'PHP');
        }
      } catch (e) { console.error('Failed to load data.', e); }
      finally { setIsLoading(false); }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const saveData = async () => {
      try {
        const data: AppData = { accounts, expenses, history, currency };
        const jsonValue = JSON.stringify(data);
        await AsyncStorage.setItem(APP_DATA_KEY, jsonValue);
      } catch (e) { console.error('Failed to save data.', e); }
    };
    saveData();
  }, [accounts, expenses, history, currency, isLoading]);

  const addAccount = (account: Omit<Account, 'id'>) => {
    const newAccount: Account = { ...account, id: Date.now().toString() };
    setAccounts(prev => [...prev, newAccount]);
  };

  const editAccount = (updatedAccount: Account) => {
    setAccounts(prev => 
      prev.map(acc => acc.id === updatedAccount.id ? updatedAccount : acc)
    );
  };

  const deleteAccount = (id: string) => {
    setAccounts(prev => prev.filter(acc => acc.id !== id));
  };

  const addExpense = (data: Omit<Expense, 'id' | 'date' | 'accountId'>, accountId: string) => {
    const newExpense: Expense = {
      ...data,
      id: Date.now().toString(),
      date: new Date().toISOString(),
      accountId: accountId,
    };
    setExpenses(prev => [newExpense, ...prev]);
    setAccounts(prev => 
      prev.map(acc => 
        acc.id === accountId ? { ...acc, balance: acc.balance - data.amount } : acc
      )
    );
  };

  const deleteExpense = (id: string) => {
    const expenseToDelete = expenses.find(exp => exp.id === id);
    if (!expenseToDelete) return;
    setAccounts(prev =>
      prev.map(acc =>
        acc.id === expenseToDelete.accountId 
          ? { ...acc, balance: acc.balance + expenseToDelete.amount } 
          : acc
      )
    );
    setExpenses(prev => prev.filter(exp => exp.id !== id));
  };
  
  const resetExpenses = () => {
    if (expenses.length === 0) return;
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const newHistoryItem: HistoryItem = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      total: total,
      expenses: [...expenses],
    };
    setHistory(prev => [newHistoryItem, ...prev]);
    setExpenses([]);
  };

  const getExpensesByCategory = (): { [key: string]: number } => {
    return expenses.reduce((acc, expense) => {
      const { category, amount } = expense;
      acc[category] = (acc[category] || 0) + amount;
      return acc;
    }, {} as { [key: string]: number });
  };
  
  const formatCurrency = (amount: number, showSymbol = true, useDecimals = true) => {
    const code = currency || 'PHP';
    // Use 'en-PH' for PHP formatting, or 'en-US' as a fallback
    const locale = (code === 'PHP') ? 'en-PH' : 'en-US';
    
    try {
      const formatter = new Intl.NumberFormat(locale, { 
        style: 'currency', 
        currency: code,
        minimumFractionDigits: useDecimals ? 2 : 0, 
        maximumFractionDigits: useDecimals ? 2 : 0 
      });

      if (showSymbol) {
        return formatter.format(amount);
      } else {
        // Fallback for non-symbol currency formatting
        return new Intl.NumberFormat(locale, {
          style: 'decimal',
          minimumFractionDigits: useDecimals ? 2 : 0,
          maximumFractionDigits: useDecimals ? 2 : 0
        }).format(amount);
      }
    } catch (e) {
      // Fallback if currency code is not supported
      return `${code} ${amount.toFixed(2)}`;
    }
  };


  return (
    <AppContext.Provider
      value={{
        isLoading,
        accounts,
        expenses,
        history,
        currency,
        setCurrency,
        addAccount,
        editAccount,
        deleteAccount,
        addExpense,
        deleteExpense,
        resetExpenses,
        getExpensesByCategory,
        formatCurrency,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};