// screens/ExpenseListScreen.tsx
import React, { useCallback } from 'react'; // <-- Import useCallback
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useExpenses } from '../contexts/ExpenseContext';
import { HomeTabScreenProps, Expense } from '../navigation/types';
import { getCurrencySymbol } from '../utils/currency';
// --- Import Reanimated and navigation hook ---
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';

// Helper function to format the number with commas
const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

export default function ExpenseListScreen({ navigation }: HomeTabScreenProps<'Expenses'>) {
  const { expenses, deleteExpense, isLoading, currency } = useExpenses();
  const currencySymbol = getCurrencySymbol(currency);

  // --- Set up animated values ---
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  // --- Trigger animation on screen focus ---
  useFocusEffect(
    useCallback(() => {
      opacity.value = 0;
      translateY.value = 20;
      
      opacity.value = withTiming(1, { duration: 500 });
      translateY.value = withTiming(0, { duration: 500 });
      
      return () => {
        opacity.value = 0;
        translateY.value = 20;
      };
    }, [])
  );

  // --- Create animated style ---
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
      flex: 1, // Make sure it fills the space
    };
  });
  // ---------------------------------

  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete Expense",
      "Are you sure you want to delete this expense?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteExpense(id) }
      ]
    );
  };
  
  const renderItem = ({ item }: { item: Expense }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemCategory}>{item.category || 'General'}</Text>
        <Text style={styles.itemNote}>{item.note}</Text>
        <Text style={styles.itemDate}>{new Date(item.date).toLocaleDateString()}</Text>
      </View>
      <View style={styles.itemActions}>
        <Text style={styles.itemAmount}>
          {currencySymbol}{formatNumber(item.amount)}
        </Text>
        <View style={styles.buttons}>
          <TouchableOpacity 
            style={[styles.button, styles.editButton]} 
            onPress={() => navigation.navigate('AddExpenseModal', { expenseToEdit: item })}
          >
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.deleteButton]} 
            onPress={() => handleDelete(item.id)}
          >
             <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return <View style={styles.container}><Text>Loading...</Text></View>
  }

  return (
    // --- Apply animated style to a wrapper View ---
    <Animated.View style={[styles.container, animatedStyle]}>
      {expenses.length === 0 ? (
         <Text style={styles.emptyText}>No expenses yet. Add one!</Text>
      ) : (
        <FlatList
          data={expenses}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          // Add padding to the bottom of the list
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#fff' },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemInfo: { flex: 1 },
  itemCategory: { fontSize: 16, fontWeight: 'bold' },
  itemNote: { fontSize: 14, color: '#666' },
  itemDate: { fontSize: 12, color: '#999', marginTop: 5 },
  itemActions: { alignItems: 'flex-end' },
  itemAmount: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#1a1a1a',
    includeFontPadding: false,
  },
  buttons: { flexDirection: 'row', marginTop: 10 },
  button: { paddingVertical: 5, paddingHorizontal: 10, borderRadius: 5, marginLeft: 10 },
  editButton: { backgroundColor: '#FFC107' },
  deleteButton: { backgroundColor: '#DC3545' },
  buttonText: { color: 'white', fontSize: 12 },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 18, color: '#777' }
});