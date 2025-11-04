import React, { useCallback } from 'react';
import { Alert, Button, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppContext } from '../../contexts/AppContext';

// These imports will work because of the global.d.ts file
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { useFocusEffect } from 'expo-router';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { CURRENCIES, getCurrencySymbol } from '../../utils/currency';

export default function SettingsScreen() {
  const { top } = useSafeAreaInsets();
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

  const exportToCSV = async () => {
    if (expenses.length === 0) {
      Alert.alert("No Data", "There are no expenses to export.");
      return;
    }
    const header = "ID,Date,Category,Amount,Note,AccountId\n";
    const rows = expenses.map(exp => 
      `${exp.id},${exp.date},${exp.category},${exp.amount},"${exp.note.replace(/"/g, '""')}",${exp.accountId}`
    ).join("\n");
    const csvString = header + rows;
    
    const fileUri = (FileSystem.documentDirectory || '') + 'expenses.csv';
    try {
      await FileSystem.writeAsStringAsync(fileUri, csvString, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'Export Expenses',
      });
    } catch (error) {
      Alert.alert("Error", "Could not save or share the file.");
    }
  };

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
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Animated.ScrollView 
        style={animatedStyle}
        contentContainerStyle={[styles.scrollContainer, { paddingTop: top }]}
      >
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 18, fontWeight: '600', marginBottom: 10 },
  currencyContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  currencyButton: { paddingVertical: 10, paddingHorizontal: 15, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8 },
  currencyButtonActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  currencyText: { fontSize: 16, color: '#333' },
  currencyTextActive: { color: '#fff', fontWeight: 'bold' },
  section: { marginTop: 40, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 20 }
});