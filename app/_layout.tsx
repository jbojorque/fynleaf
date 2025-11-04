import { Stack } from 'expo-router';
import React from 'react';
import { AppProvider } from '../contexts/AppContext';

export default function RootLayout() {
  return (
    // The AppProvider wraps everything
    <AppProvider>
      <Stack>
        {/* This loads the (tabs) layout */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        
        {/* These are your modal screens */}
        <Stack.Screen 
          name="addExpenseModal" 
          options={{ presentation: 'modal', title: 'Add Expense' }} 
        />
        <Stack.Screen 
          name="addAccountModal" 
          options={{ presentation: 'modal', title: 'Add Account' }} 
        />
      </Stack>
    </AppProvider>
  );
}
