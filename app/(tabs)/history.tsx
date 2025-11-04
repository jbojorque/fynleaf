import { useFocusEffect } from 'expo-router';
import React, { useCallback } from 'react';
import { FlatList, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppContext } from '../../contexts/AppContext';
import { HistoryItem } from '../../navigation/types';

export default function HistoryScreen() {
  const { top } = useSafeAreaInsets();
  const { history, formatCurrency } = useAppContext();

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
        {formatCurrency(item.total)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Animated.View style={animatedStyle}>
        <Text style={[styles.header, { paddingTop: top }]}>History</Text>
        {history.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No history yet.</Text>
            <Text style={styles.emptySubText}>
              Reset a period from Settings to see it here.
            </Text>
          </View>
        ) : (
          <FlatList
            data={history}
            renderItem={renderHistoryItem}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4' },
  header: {
    fontSize: 28, 
    fontWeight: 'bold', 
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30, marginTop: -50 },
  emptyText: { fontSize: 20, fontWeight: 'bold', color: '#333', textAlign: 'center' },
  emptySubText: { fontSize: 16, color: '#777', textAlign: 'center', marginTop: 10 },
  itemContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  itemDate: { fontSize: 18, fontWeight: 'bold' },
  itemCount: { fontSize: 14, color: '#666', marginTop: 5 },
  itemTotal: { fontSize: 20, fontWeight: 'bold', color: '#1a1a1a', includeFontPadding: false },
});