// screens/SettingsScreen.tsx
import React, { useCallback } from 'react'; // <-- Import useCallback
import { View, Button, StyleSheet, Alert, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useExpenses } from '../contexts/ExpenseContext';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing/';
import { CURRENCIES, getCurrencySymbol } from '../utils/currency';
// --- Import Reanimated and navigation hook ---
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';

export default function SettingsScreen() {
  const { expenses, currency, setCurrency, resetExpenses } = useExpenses();

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

  const exportToCSV = async () => {
    // ... (same as before)
    if (expenses.length === 0) {
      Alert.alert("No Data", "There are no expenses to export.");
      return;
    }
    const header = "ID,Date,Category,Amount,Note\n";
    const rows = expenses.map(exp => 
      `${exp.id},${exp.date},${exp.category},${exp.amount},"${exp.note.replace(/"/g, '""')}"`
    ).join("\n");
    const csvString = header + rows;
    const fileUri = FileSystem.documentDirectory + 'expenses.csv';
    try {
      await FileSystem.writeAsStringAsync(fileUri, csvString, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'Export Expenses',
      });
    } catch (error) {
      console.error("Failed to export CSV", error);
      Alert.alert("Error", "Could not save or share the file.");
    }
  };

  const handleReset = () => {
    // ... (same as before)
    if (expenses.length === 0) {
      Alert.alert(
        "No Expenses",
        "There are no expenses in the current period to reset."
      );
      return;
    }
    Alert.alert(
      "Reset Current Period",
      "Are you sure? This will move all current expenses to history and set your total spending to 0.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Reset", 
          style: "destructive", 
          onPress: () => resetExpenses()
        }
      ]
    );
  };

  return (
    // --- Apply animated style and use ScrollView ---
    <Animated.ScrollView style={[styles.container, animatedStyle]}>
      <Text style={styles.header}>Settings</Text>

      <Text style={styles.label}>Choose Currency</Text>
      <View style={styles.currencyContainer}>
        {CURRENCIES.map((c) => (
          <TouchableOpacity
            key={c}
            style={[
              styles.currencyButton,
              currency === c && styles.currencyButtonActive
            ]}
            onPress={() => setCurrency(c)}
          >
            <Text style={[
                styles.currencyText,
                currency === c && styles.currencyTextActive
            ]}>
              {c} ({getCurrencySymbol(c)})
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={styles.section}>
        <Text style={styles.label}>Export Data</Text>
        <Button 
          title="Export Current Expenses to CSV" 
          onPress={exportToCSV} 
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Danger Zone</Text>
        <Button 
          title="Reset Current Period" 
          color="#DC3545" // Red color
          onPress={handleReset} 
        />
      </View>
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20,
    backgroundColor: '#fff', // Changed to white
  },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 18, fontWeight: '600', marginBottom: 10 },
  currencyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  currencyButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  currencyButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  currencyText: {
    fontSize: 16,
    color: '#333',
  },
  currencyTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  section: {
    marginTop: 40,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 20,
  }
});