import { useFocusEffect } from 'expo-router';
import React, { useCallback } from 'react';
import { Alert, Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useAppContext } from '../../contexts/AppContext';
import { CURRENCIES, getCurrencySymbol } from '../../utils/currency';

export default function SettingsScreen() {
  const { expenses, currency, setCurrency, resetExpenses } = useAppContext();

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

  const exportToCSV = async () => { /* ... (same as before) ... */ };
  const handleReset = () => {
    if (expenses.length === 0) {
      Alert.alert("No Expenses", "There are no expenses to reset.");
      return;
    }
    Alert.alert(
      "Reset Current Period",
      "Are you sure? This will move all current expenses to history.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Reset", style: "destructive", onPress: () => resetExpenses() }
      ]
    );
  };

  return (
    <Animated.ScrollView style={[styles.container, animatedStyle]}>
      <Text style={styles.header}>Settings</Text>
      <Text style={styles.label}>Choose Currency</Text>
      <View style={styles.currencyContainer}>
        {CURRENCIES.map((c) => (
          <TouchableOpacity
            key={c}
            style={[ styles.currencyButton, currency === c && styles.currencyButtonActive ]}
            onPress={() => setCurrency(c)}
          >
            <Text style={[ styles.currencyText, currency === c && styles.currencyTextActive ]}>
              {c} ({getCurrencySymbol(c)})
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={styles.section}>
        <Text style={styles.label}>Export Data</Text>
        <Button title="Export Current Expenses to CSV" onPress={exportToCSV} />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Danger Zone</Text>
        <Button title="Reset Current Period" color="#DC3545" onPress={handleReset} />
      </View>
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 18, fontWeight: '600', marginBottom: 10 },
  currencyContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  currencyButton: { paddingVertical: 10, paddingHorizontal: 15, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8 },
  currencyButtonActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  currencyText: { fontSize: 16, color: '#333' },
  currencyTextActive: { color: '#fff', fontWeight: 'bold' },
  section: { marginTop: 40, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 20 }
});
