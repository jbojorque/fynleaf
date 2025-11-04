// screens/AddExpenseModal.tsx
import React, { useEffect, useState } from 'react';
import {
    Button,
    ScrollView,
    StyleSheet,
    Text, TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAppContext } from '../contexts/AppContext';
import { RootStackScreenProps } from '../navigation/types';
import { getCurrencySymbol } from '../utils/currency';

// These are the categories the user can select
const CATEGORIES = ['Food', 'Transport', 'Utilities', 'Entertainment', 'Other'];

export default function AddExpenseModal({ navigation, route }: RootStackScreenProps<'AddExpenseModal'>) {
  // Get currency context
  const { addExpense, editAccount, currency } = useAppContext(); 
  
  // Check if we are editing or creating
  const expenseToEdit = route.params?.expenseToEdit;
  const isEditing = !!expenseToEdit;

  // Setup component state
  const [amount, setAmount] = useState(expenseToEdit?.amount.toString() || '');
  const [category, setCategory] = useState(expenseToEdit?.category || ''); // Default to ''
  const [note, setNote] = useState(expenseToEdit?.note || '');

  // Set the modal title
  useEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Edit Expense' : 'Add Expense',
    });
  }, [navigation, isEditing]);

  const handleSubmit = () => {
    const parsedAmount = parseFloat(amount);
    
    // --- Validation ---
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }
    if (!category) { 
      alert('Please select a category.');
      return;
    }
    // --------------------

    const expenseData = { 
      amount: parsedAmount, 
      category, 
      note 
    };

    if (isEditing) {
      // Pass all old data + new data to edit
      editAccount({ ...expenseToEdit!, ...expenseData }); 
    } else {
      // Pass just new data to add
      addExpense(expenseData);
    }
    
    // Go back to the previous screen
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      {/* Amount Input */}
      <Text style={styles.label}>Amount ({getCurrencySymbol(currency)})</Text>
      <TextInput
        style={styles.input}
        placeholder="0.00"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      {/* Category Selector */}
      <Text style={styles.label}>Category</Text>
      <View style={styles.categoryContainer}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryButton,
              // Apply 'active' style if this category is selected
              category === cat && styles.categoryButtonActive 
            ]}
            onPress={() => setCategory(cat)}
          >
            <Text style={[
              styles.categoryText,
              // Apply 'active' text style if this category is selected
              category === cat && styles.categoryTextActive
            ]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Note Input */}
      <Text style={styles.label}>Note (Optional)</Text>
      <TextInput
        style={[styles.input, styles.multilineInput]}
        placeholder="e.g., Lunch with colleagues"
        value={note}
        onChangeText={setNote}
        multiline
      />
      
      {/* Submit Button */}
      <View style={styles.submitButton}>
        <Button
          title={isEditing ? 'Update Expense' : 'Add Expense'}
          onPress={handleSubmit}
        />
      </View>
    </ScrollView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20,
    backgroundColor: '#f9f9f9' // Lighter background
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
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  multilineInput: { 
    height: 100, 
    textAlignVertical: 'top' 
  },
  // --- New Category Button Styles ---
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
    borderRadius: 20, // More rounded
  },
  categoryButtonActive: {
    backgroundColor: '#007AFF', // Blue for active
    borderColor: '#007AFF',
  },
  categoryText: {
    fontSize: 14,
    color: '#333',
  },
  categoryTextActive: {
    color: '#fff', // White text for active
    fontWeight: 'bold',
  },
  // --- Wrapper for the submit button ---
  submitButton: {
    marginTop: 10,
  }
});