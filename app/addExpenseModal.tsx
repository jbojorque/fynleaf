import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Button, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAppContext } from '../contexts/AppContext';
import { getCurrencySymbol } from '../utils/currency';

const CATEGORIES = ['Food', 'Transport', 'Utilities', 'Entertainment', 'Other'];

export default function AddExpenseModal() {
  const { addExpense, currency, formatCurrency, accounts } = useAppContext();
  const isEditing = false; // Editing is not supported in this example

  const payableAccounts = accounts.filter(acc => acc.balance > 0);

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState<string | undefined>(
    payableAccounts.length > 0 ? payableAccounts[0].id : undefined
  );

  const handleSubmit = () => {
    const parsedAmount = parseFloat(amount);
    
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid amount.');
      return;
    }
    if (!category) { 
      Alert.alert('Invalid Input', 'Please select a category.');
      return;
    }
    if (!selectedAccountId) {
      Alert.alert('Invalid Input', 'You must have an account with a positive balance to pay from.');
      return;
    }

    const selectedAccount = accounts.find(a => a.id === selectedAccountId);
    if (selectedAccount && selectedAccount.balance < parsedAmount) {
      Alert.alert('Insufficient Funds', `You only have ${formatCurrency(selectedAccount.balance)} in this account.`);
      return;
    }

    const expenseData = { amount: parsedAmount, category, note };

    if (isEditing) {
      // Logic for editing
    } else {
      addExpense(expenseData, selectedAccountId);
    }
    
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.label}>Amount ({getCurrencySymbol(currency)})</Text>
        <TextInput
          style={styles.input}
          placeholder="0.00"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        <Text style={styles.label}>Pay From</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedAccountId}
            onValueChange={(itemValue) => setSelectedAccountId(itemValue)}
            style={styles.picker}
            itemStyle={styles.pickerItem}
          >
            {payableAccounts.length === 0 ? (
              <Picker.Item label="No accounts with a positive balance." value={undefined} />
            ) : (
              payableAccounts.map(account => (
                <Picker.Item 
                  key={account.id} 
                  label={`${account.name} (${formatCurrency(account.balance)})`} 
                  value={account.id} 
                  color="#000000"
                />
              ))
            )}
          </Picker>
        </View>

        <Text style={styles.label}>Category</Text>
        <View style={styles.categoryContainer}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[ styles.categoryButton, category === cat && styles.categoryButtonActive ]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[ styles.categoryText, category === cat && styles.categoryTextActive ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <Text style={styles.label}>Note (Optional)</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          placeholder="e.g., Lunch with colleagues"
          value={note}
          onChangeText={setNote}
          multiline
        />
        
        <View style={styles.submitButton}>
          <Button
            title={isEditing ? 'Update Expense' : 'Add Expense'}
            onPress={handleSubmit}
            disabled={isEditing || !selectedAccountId}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20,
    backgroundColor: '#f9f9f9'
  },
  label: { 
    fontSize: 16, 
    fontWeight: '600', 
    marginBottom: 8, 
    color: '#333' 
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
    color: 'black',
  },
  multilineInput: { 
    height: 100, 
    textAlignVertical: 'top' 
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
  },
  categoryButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryText: {
    fontSize: 14,
    color: '#333',
  },
  categoryTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  submitButton: {
    marginTop: 10,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 20,
    justifyContent: 'center'
  },
  picker: {
    color: '#000000',
  },
  pickerItem: {
    color: '#000000',
  }
});