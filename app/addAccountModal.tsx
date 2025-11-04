import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Platform, Pressable,
  StyleSheet, Text, TextInput, View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppContext } from '../contexts/AppContext';

const ACCOUNT_TYPES = [ 'BDO Unibank', 'BPI', 'Metrobank', 'GCash', 'Maya', 'CASH', 'CIMB', 'Maribank', 'UNO', 'GoTyme', 'Land Bank', 'Security Bank', 'RCBC', 'PNB', 'China Bank', 'UnionBank', 'EastWest Bank', 'CREDIT CARD', 'Asia United Bank', 'Paypal', 'Wise', 'Other', ];

export default function AddAccountModal() {
  const { accounts, addAccount, editAccount, deleteAccount } = useAppContext();
  const params = useLocalSearchParams();
  const accountId = params.accountId as string | undefined;

  const isEditMode = !!accountId;
  const [currentAccount, setCurrentAccount] = useState(() => 
    isEditMode ? accounts.find(a => a.id === accountId) : null
  );

  const [accountName, setAccountName] = useState(ACCOUNT_TYPES[0]);
  const [customName, setCustomName] = useState('');
  const [balanceInput, setBalanceInput] = useState('');

  useEffect(() => {
    if (isEditMode && currentAccount) {
      if (ACCOUNT_TYPES.includes(currentAccount.name)) {
        setAccountName(currentAccount.name);
      } else {
        setAccountName('Other');
        setCustomName(currentAccount.name);
      }
      setBalanceInput(currentAccount.balance.toString());
    }
  }, [isEditMode, currentAccount]);
    
  const handleSubmit = () => {
    const balance = parseFloat(balanceInput);
    const name = accountName === 'Other' ? customName.trim() : accountName;
    if (!name) { Alert.alert('Invalid Input', 'Please enter an account name.'); return; }
    if (isNaN(balance)) { Alert.alert('Invalid Input', 'Please enter a valid balance amount.'); return; }

    if (isEditMode && currentAccount) {
      editAccount({ ...currentAccount, name: name, balance: balance });
    } else {
      addAccount({ name: name, balance: balance });
    }
    router.back();
  };

  const handleDeleteAccount = () => {
    if (!currentAccount) return;
    Alert.alert("Delete Account", `Are you sure you want to delete the "${currentAccount.name}" account?`, [{ text: "Cancel", style: "cancel" }, { text: "Delete", style: "destructive", onPress: () => { 
        deleteAccount(currentAccount.id);
        router.back(); 
      }, }, ] 
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Pressable style={StyleSheet.absoluteFill} onPress={() => router.back()} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
        <View style={styles.modalView} >
          <Text style={styles.modalTitle}>{isEditMode ? 'Update Account' : 'Add New Account'}</Text>
          <Text style={styles.inputLabel}>Account Name</Text>
          <View style={styles.pickerContainer}>
            <Picker 
              selectedValue={accountName} 
              onValueChange={(itemValue) => setAccountName(itemValue)} 
              style={styles.picker} 
              itemStyle={styles.pickerItem}
            >
              {ACCOUNT_TYPES.map((type) => (
                <Picker.Item key={type} label={type} value={type} color="#000000"/>
              ))}
            </Picker>
          </View>
          {accountName === 'Other' && (
            <TextInput style={styles.input} placeholder="Enter custom name" placeholderTextColor="#999" value={customName} onChangeText={setCustomName}/>
          )}
          <Text style={styles.inputLabel}>Current Balance</Text>
          <TextInput style={styles.input} placeholder="e.g., 5000" placeholderTextColor="#999" keyboardType="numeric" value={balanceInput} onChangeText={setBalanceInput}/>
          <View style={styles.buttonRow}>
            {isEditMode && (
              <Pressable style={[styles.button, styles.buttonDelete]} onPress={handleDeleteAccount} >
                <Ionicons name="trash-outline" size={18} color="white" style={{ marginRight: 8 }} />
                <Text style={[styles.buttonText, styles.buttonAddText]}>Delete</Text>
              </Pressable>
            )}
            <Pressable style={[styles.button, styles.buttonSubmit]} onPress={handleSubmit} >
              <Ionicons name="checkmark" size={18} color="white" style={{ marginRight: 8 }} />
              <Text style={[styles.buttonText, styles.buttonAddText]}>{isEditMode ? 'Update' : 'Add'}</Text>
            </Pressable>
          </View>
          <Pressable style={[styles.button, styles.buttonClose]} onPress={() => router.back()} >
            <Ionicons name="close" size={18} color="#1F2937" style={{ marginRight: 8 }} />
            <Text style={[styles.buttonText, styles.buttonCloseText]}>Cancel</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'transparent' },
  keyboardView: { width: '100%' },
  modalView: { 
    backgroundColor: 'white', 
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20, 
    padding: 24, 
    shadowColor: '#000', 
    shadowOpacity: 0.25, 
    shadowRadius: 4, 
    elevation: 5,
    width: '100%',
  },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: 'black', marginBottom: 20, textAlign: 'center' },
  inputLabel: { fontSize: 16, color: '#666', marginBottom: 8, marginTop: 10 },
  pickerContainer: { backgroundColor: '#F0F2F5', borderRadius: 8 },
  picker: { color: '#000000' },
  pickerItem: { color: '#000000' },
  input: { backgroundColor: '#F0F2F5', borderRadius: 8, padding: 16, fontSize: 16, marginBottom: 16, color: 'black' },
  buttonRow: { flexDirection: 'row', marginBottom: 10 },
  button: { borderRadius: 8, padding: 16, flex: 1, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  buttonClose: { backgroundColor: '#E5E7EB', marginTop: 10 },
  buttonCloseText: { color: '#1F2937' },
  buttonSubmit: { backgroundColor: '#007AFF', flex: 2, marginLeft: 10 },
  buttonDelete: { backgroundColor: '#FF3B30', flex: 1.5, marginRight: 10 },
  buttonAddText: { color: 'white' },
  buttonText: { fontWeight: 'bold', fontSize: 16 },
});