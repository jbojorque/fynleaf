// screens/HistoryScreen.tsx
import React, { useCallback } from 'react'; // <-- Import useCallback
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useExpenses } from '../contexts/ExpenseContext';
import { HomeTabScreenProps, HistoryItem } from '../navigation/types';
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

export default function HistoryScreen({ navigation }: HomeTabScreenProps<'History'>) {
  const { history, currency } = useExpenses();
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

  const renderHistoryItem = ({ item }: { item: HistoryItem }) => (
    <TouchableOpacity style={styles.itemContainer}>
      <View>
        <Text style={styles.itemDate}>
          {new Date(item.date).toLocaleDateString()}
        </Text>
        <Text style={styles.itemCount}>
          {item.expenses.length} expenses
        </Text>
      </View>
      <Text style={styles.itemTotal}>
        {currencySymbol}{formatNumber(item.total)}
      </Text>
    </TouchableOpacity>
  );

  return (
    // --- Apply animated style to a wrapper View ---
    <Animated.View style={[styles.container, animatedStyle]}>
      {history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No history yet.</Text>
          <Text style={styles.emptySubText}>
            When you "Reset Current Period" from the Settings tab,
            your expense summary will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          renderItem={renderHistoryItem}
          keyExtractor={item => item.id}
          // Add padding to the bottom of the list
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginTop: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemDate: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  itemTotal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    includeFontPadding: false,
  },
});