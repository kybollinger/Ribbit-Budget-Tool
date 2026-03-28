import { router, Stack } from 'expo-router';
import { TrendingUp, TrendingDown } from 'lucide-react-native';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

export default function TransactionTypeModal() {
  const insets = useSafeAreaInsets();
  
  const handleSelectType = (type: 'income' | 'expense') => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.replace({
      pathname: '/add-expense',
      params: { type },
    });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          presentation: 'transparentModal',
          animation: 'fade',
          headerShown: false,
        }}
      />
      
      <TouchableOpacity 
        style={styles.backdrop} 
        activeOpacity={1}
        onPress={() => router.back()}
      />

      <View style={[styles.content, { paddingBottom: 40 + insets.bottom }]}>
        <View style={styles.handle} />
        
        <Text style={styles.title}>Add Transaction</Text>
        <Text style={styles.subtitle}>Choose transaction type</Text>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.typeButton, styles.incomeButton]}
            onPress={() => handleSelectType('income')}
            activeOpacity={0.8}
          >
            <View style={styles.iconContainer}>
              <TrendingUp size={32} color="#10B981" strokeWidth={2.5} />
            </View>
            <Text style={styles.typeButtonTitle}>Income</Text>
            <Text style={styles.typeButtonSubtitle}>Money received</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.typeButton, styles.expenseButton]}
            onPress={() => handleSelectType('expense')}
            activeOpacity={0.8}
          >
            <View style={styles.iconContainer}>
              <TrendingDown size={32} color="#EF4444" strokeWidth={2.5} />
            </View>
            <Text style={styles.typeButtonTitle}>Expense</Text>
            <Text style={styles.typeButtonSubtitle}>Money spent</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  typeButton: {
    flex: 1,
    backgroundColor: '#F8F9FC',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  incomeButton: {
    borderColor: '#10B98120',
  },
  expenseButton: {
    borderColor: '#EF444420',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  typeButtonTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginBottom: 4,
  },
  typeButtonSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500' as const,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
});
