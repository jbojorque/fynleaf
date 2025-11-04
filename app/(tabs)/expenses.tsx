import { Ionicons } from '@expo/vector-icons';
import { Link, useFocusEffect } from 'expo-router';
import React, { useCallback } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useAppContext } from '../../contexts/AppContext';
import { Expense } from '../../navigation/types';

export default function ExpenseListScreen() {
  const { expenses, deleteExpense, isLoading, formatCurrency, accounts } = useAppContext();
  
  const getAccountName = (id: string) => {
    return accounts.find(acc => acc.id === id)?.name || 'Unknown';
  };

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  useFocusEffect(
    useCallback(() => {
      opacity.value = 0;
      translateY.value = 20;
      opacity.value = withTiming(1, { duration: 500 });
      translateY.value = withTiming(0, { duration: 500 });
      return () => { opacity.value = 0; translateY.value = 20; };
    }, [])
  );
  const animatedStyle = useAnimatedStyle(() => {
    return { opacity: opacity.value, transform: [{ translateY: translateY.value }], flex: 1 };
  });

  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete Expense",
      "Are you sure? This will add the amount back to the account it was paid from.",
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
        <Text style={styles.itemAccount}>
          Paid from: {getAccountName(item.accountId)}
        </Text>
        <Text style={styles.itemDate}>{new Date(item.date).toLocaleDateString()}</Text>
      </View>
      <View style={styles.itemActions}>
        <Text style={styles.itemAmount}>
          -{formatCurrency(item.amount)}
        </Text>
        <View style={styles.buttons}>
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
    <Animated.View style={[styles.container, animatedStyle]}>
      {expenses.length === 0 ? (
         <Text style={styles.emptyText}>No expenses yet. Add one!</Text>
      ) : (
        <FlatList
          data={expenses}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 100 }} // More padding
        />
      )}
      {/* Add Expense Button */}
      <Link href="/addExpenseModal" asChild>
        <Pressable style={styles.fab}>
            <Ionicons name="add" size={30} color="white" />
        </Pressable>
      </Link>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  itemContainer: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  itemInfo: { flex: 1 },
  itemCategory: { fontSize: 16, fontWeight: 'bold' },
  itemNote: { fontSize: 14, color: '#666' },
  itemAccount: { fontSize: 12, color: '#007AFF', fontStyle: 'italic', marginTop: 5 },
  itemDate: { fontSize: 12, color: '#999', marginTop: 5 },
  itemActions: { alignItems: 'flex-end' },
  itemAmount: { fontSize: 18, fontWeight: 'bold', color: '#D92D20', includeFontPadding: false },
  buttons: { flexDirection: 'row', marginTop: 10 },
  button: { paddingVertical: 5, paddingHorizontal: 10, borderRadius: 5, marginLeft: 10 },
  deleteButton: { backgroundColor: '#DC3545' },
  buttonText: { color: 'white', fontSize: 12 },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 18, color: '#777' },
  fab: { position: 'absolute', bottom: 40, right: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#007AFF', shadowOpacity: 0.3, shadowRadius: 8, elevation: 10 },
});
