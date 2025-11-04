import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator, FlatList, Pressable, SafeAreaView, StatusBar,
  StyleSheet, Text, View,
} from 'react-native';
import { PieChart } from "react-native-gifted-charts";
import { useAppContext } from '../../contexts/AppContext';
import { PieSliceData } from '../../navigation/types';

const CARD_COLORS = [ '#007AFF', '#5856D6', '#34C759', '#FF9500', '#FF3B30', '#00C7BE', '#3A3A3C', '#E91E63', '#9C27B0', '#4CAF50', '#FFEB3B', '#FF5722', ];
const getIconForAccount = (name: string, size: number, color: string) => { const lowerName = name.toLowerCase(); if (lowerName.includes('bank') || lowerName.includes('bdo') || lowerName.includes('bpi')) { return <FontAwesome name="bank" size={size} color={color} />; } if (lowerName.includes('cash') && !lowerName.includes('gcash')) { return <FontAwesome name="money" size={size} color={color} />; } if (lowerName.includes('card')) { return <FontAwesome name="credit-card-alt" size={size} color={color} />; } if (lowerName.includes('gcash') || lowerName.includes('maya')) { return <Ionicons name="phone-portrait-outline" size={size} color={color} />; } return <MaterialCommunityIcons name="wallet-outline" size={size} color={color} />; };

export default function DashboardScreen() {
    const { isLoading, accounts, formatCurrency } = useAppContext();
    const [focusedIndex, setFocusedIndex] = useState(-1);

    const positiveBalanceTotal = accounts.filter(acc => acc.balance > 0).reduce((sum, account) => sum + account.balance, 0);
    const actualTotalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

    const accountsForChart = accounts.filter(acc => acc.balance > 0);
    const pieChartData: PieSliceData[] = accountsForChart.map((acc, index) => { const percentage = positiveBalanceTotal > 0 ? ((acc.balance / positiveBalanceTotal) * 100).toFixed(0) : 0; return { value: acc.balance, originalBalance: acc.balance, color: CARD_COLORS[index % CARD_COLORS.length], name: acc.name, percentage: percentage, labelText: `${formatCurrency(acc.balance, false, false)}\n(${percentage}%)`, focused: index === focusedIndex }; });

    if (isLoading) {
        return ( <View style={[styles.container, styles.center]}><ActivityIndicator size="large" color="#007AFF" /><Text style={styles.loadingText}>Loading Data...</Text></View> );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <LinearGradient colors={['#ffffff', '#f0f2f5']} style={styles.headerBackgroundGradient} >
                <View style={styles.header}>
                    <View style={styles.headerTitleRow}>
                        <MaterialCommunityIcons name="wallet-outline" size={18} color="#8A9BBE" style={{ marginRight: 6 }} />
                        <Text style={styles.headerTitle}>Account Overview</Text>
                    </View>
                    <Text style={styles.totalAmount}>{formatCurrency(actualTotalBalance, true)}</Text>
                    {accountsForChart.length > 0 ? (
                        <View style={styles.chartContainer}>
                            <PieChart
                                data={pieChartData}
                                radius={90}
                                sectionAutoFocus
                                focusOnPress
                                onPress={(item: any, index: number) => { setFocusedIndex(index === focusedIndex ? -1 : index); }}
                            />
                             {/* You can add your chart focus/legend components here if you wish */}
                        </View>
                    ) : (
                        <Text style={styles.emptyChartText}>Add an account to see a chart</Text>
                    )}
                </View>
            </LinearGradient>

            <FlatList
                data={accounts}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={[styles.gridContainer, { paddingBottom: 100 }]}
                renderItem={({ item, index }) => { 
                    const cardColor = CARD_COLORS[index % CARD_COLORS.length];
                    return ( 
                      <Link href={{ pathname: "/addAccountModal", params: { accountId: item.id } }} asChild>
                        <Pressable style={[styles.card]}>
                            <View style={[styles.cardInner, { backgroundColor: cardColor }]}>
                                <View style={styles.cardIcon}>
                                    {getIconForAccount(item.name, 22, 'white')}
                                </View>
                                <View>
                                    <Text style={styles.cardName}>{item.name.toUpperCase()}</Text>
                                    <Text style={styles.cardBalance}>{formatCurrency(item.balance, true, true)}</Text>
                                </View>
                            </View>
                        </Pressable>
                      </Link>
                    );
                }}
                ListHeaderComponent={<Text style={styles.gridHeader}>My Accounts</Text>}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Press the "+" button to add an account.</Text>
                    </View>
                 }
            />

            <Link href={{ pathname: "/addAccountModal", params: { accountId: undefined } }} asChild>
              <Pressable style={styles.fab}>
                  <Ionicons name="add" size={30} color="white" />
              </Pressable>
            </Link>
            
        </SafeAreaView>
    );
}

// --- STYLES ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F8FC' },
    center: { justifyContent: 'center', alignItems: 'center', flex: 1 },
    loadingText: { marginTop: 10, fontSize: 16, color: '#666' },
    headerBackgroundGradient: { borderBottomLeftRadius: 30, borderBottomRightRadius: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3, marginBottom: 8 },
    header: { paddingBottom: 12, paddingHorizontal: 24, backgroundColor: 'transparent' },
    headerTitleRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingTop: 10 },
    headerTitle: { fontSize: 18, color: '#8A9BBE', fontWeight: '600' },
    totalAmount: { fontSize: 42, color: '#1E2A3C', fontWeight: 'bold', textAlign: 'center', marginTop: 8 },
    chartContainer: { alignItems: 'center', marginTop: 20, marginBottom: 10, position: 'relative', minHeight: 250, width: '100%', justifyContent: 'center' },
    emptyChartText: { textAlign: 'center', color: '#8A9BBE', marginTop: 10, fontSize: 16, marginBottom: 10 },
    gridContainer: { paddingHorizontal: 12, paddingTop: 16, paddingBottom: 100 },
    gridHeader: { fontSize: 20, fontWeight: 'bold', color: '#1E2A3C', marginBottom: 12, paddingLeft: 6 },
    card: { flex: 1 / 2 },
    cardInner: { flex: 1, margin: 6, padding: 16, borderRadius: 12, minHeight: 120, justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, overflow: 'hidden' },
    cardIcon: { alignSelf: 'flex-end', opacity: 0.8 },
    cardName: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    cardBalance: { color: 'white', fontSize: 20, fontWeight: '600', marginTop: 8 },
    emptyContainer: { alignItems: 'center', marginTop: 100, flex: 1, paddingHorizontal: 20 },
    emptyText: { fontSize: 16, color: '#8A9BBE', textAlign: 'center' },
    fab: { position: 'absolute', bottom: 40, right: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#007AFF', shadowOpacity: 0.3, shadowRadius: 8, elevation: 10 },
});