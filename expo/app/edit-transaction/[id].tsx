import { useBudget } from '@/contexts/BudgetContext';
import { useAppearance } from '@/contexts/AppearanceContext';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { formatInputNumber, parseInputNumber } from '@/utils/formatCurrency';
import {
  Home,
  Zap,
  ShoppingCart,
  Fuel,
  Utensils,
  Tv,
  PiggyBank,
  MoreHorizontal,
  ChevronLeft,
  Repeat,
  Plus,
  Coffee,
  Bus,
  Plane,
  Heart,
  Gift,
  BookOpen,
  Shirt,
  Dumbbell,
  Smartphone,
  Laptop,
  Briefcase,
  GraduationCap,
  Music,
  Film,
} from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Switch,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  home: Home,
  zap: Zap,
  'shopping-cart': ShoppingCart,
  fuel: Fuel,
  utensils: Utensils,
  tv: Tv,
  'piggy-bank': PiggyBank,
  coffee: Coffee,
  bus: Bus,
  plane: Plane,
  heart: Heart,
  gift: Gift,
  'book-open': BookOpen,
  shirt: Shirt,
  dumbbell: Dumbbell,
  smartphone: Smartphone,
  laptop: Laptop,
  briefcase: Briefcase,
  'graduation-cap': GraduationCap,
  music: Music,
  film: Film,
  'more-horizontal': MoreHorizontal,
};

export default function EditTransactionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { transactions, categories, updateTransaction, deleteTransaction } = useBudget();
  const { theme } = useAppearance();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [vendor, setVendor] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [recurringEnabled, setRecurringEnabled] = useState<boolean>(false);
  const [recurringFrequency, setRecurringFrequency] = useState<'weekly' | 'biweekly' | 'monthly'>('monthly');
  const [recurringDate, setRecurringDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [transactionDate, setTransactionDate] = useState<Date>(new Date());
  const [showTransactionDatePicker, setShowTransactionDatePicker] = useState<boolean>(false);

  const transaction = transactions.find((t) => t.id === id);

  useEffect(() => {
    if (transaction) {
      setSelectedCategoryId(transaction.categoryId);
      setAmount(formatInputNumber(transaction.amount.toString()));
      setDescription(transaction.description || '');
      setVendor(transaction.vendor || '');
      setNotes(transaction.notes || '');
      setTransactionDate(new Date(transaction.date));
      if (transaction.recurring) {
        setRecurringEnabled(transaction.recurring.enabled);
        setRecurringFrequency(transaction.recurring.frequency);
        if (transaction.recurring.nextDate) {
          setRecurringDate(new Date(transaction.recurring.nextDate));
        }
      }
    }
  }, [transaction]);

  if (!transaction) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.text.secondary }]}>Transaction not found</Text>
      </View>
    );
  }

  const isIncome = transaction.type === 'income';

  const handleSave = () => {
    if (!selectedCategoryId) {
      Alert.alert('Missing Category', 'Please select a category');
      return;
    }

    const numericAmount = parseInputNumber(amount);
    if (!numericAmount || parseFloat(numericAmount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    updateTransaction(id, {
      categoryId: selectedCategoryId,
      amount: parseFloat(numericAmount),
      description: description.trim() || undefined,
      vendor: vendor.trim() || undefined,
      notes: notes.trim() || undefined,
      date: transactionDate.toISOString(),
      recurring: recurringEnabled ? {
        frequency: recurringFrequency,
        enabled: true,
        nextDate: recurringDate.toISOString(),
      } : undefined,
    });

    router.back();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Transaction',
      `Are you sure you want to delete this ${isIncome ? 'income' : 'expense'}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            deleteTransaction(id);
            router.back();
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <Stack.Screen
        options={{
          title: isIncome ? 'Edit Income' : 'Edit Expense',
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerTintColor: theme.colors.text.primary,
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <ChevronLeft size={24} color={theme.colors.text.primary} strokeWidth={2} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={handleSave}
              style={[styles.saveButton, { backgroundColor: isIncome ? theme.colors.success : theme.accent.primary }]}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { marginBottom: 12, color: theme.colors.text.primary }]}>Amount *</Text>
          <View style={[styles.amountInputContainer, { backgroundColor: theme.colors.cardBackground }]}>
            <Text style={[styles.currencySymbol, { color: theme.colors.text.primary }]}>$</Text>
            <TextInput
              style={[styles.amountInput, { color: theme.colors.text.primary }]}
              value={amount}
              onChangeText={(text) => setAmount(formatInputNumber(text))}
              placeholder="0.00"
              keyboardType="decimal-pad"
              placeholderTextColor={theme.colors.text.secondary}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { marginBottom: 12, color: theme.colors.text.primary }]}>Date</Text>
          <TouchableOpacity
            style={[styles.datePickerButton, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}
            onPress={() => setShowTransactionDatePicker(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.datePickerText, { color: theme.colors.text.primary }]}>
              {transactionDate.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </TouchableOpacity>
          {showTransactionDatePicker && (
            Platform.OS === 'ios' ? (
              <Modal
                transparent
                animationType="slide"
                visible={showTransactionDatePicker}
                onRequestClose={() => setShowTransactionDatePicker(false)}
              >
                <View style={styles.modalOverlay}>
                  <View style={[styles.modalContent, { backgroundColor: theme.colors.cardBackground }]}>
                    <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
                      <TouchableOpacity
                        onPress={() => setShowTransactionDatePicker(false)}
                        style={styles.modalButton}
                      >
                        <Text style={[styles.modalButtonText, { color: theme.accent.primary }]}>Done</Text>
                      </TouchableOpacity>
                    </View>
                    <DateTimePicker
                      value={transactionDate}
                      mode="date"
                      display="spinner"
                      onChange={(event, date) => {
                        if (date) {
                          setTransactionDate(date);
                        }
                      }}
                    />
                  </View>
                </View>
              </Modal>
            ) : (
              <DateTimePicker
                value={transactionDate}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowTransactionDatePicker(false);
                  if (date) {
                    setTransactionDate(date);
                  }
                }}
              />
            )
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.categoryHeader}>
            <Text style={[styles.sectionLabel, { color: theme.colors.text.primary }]}>Category *</Text>
            <TouchableOpacity
              onPress={() => {
                router.push('/add-category');
              }}
              style={[styles.addCategoryButton, { backgroundColor: theme.accent.primary + '10' }]}
              activeOpacity={0.7}
            >
              <Plus size={16} color={theme.accent.primary} strokeWidth={2} />
              <Text style={[styles.addCategoryText, { color: theme.accent.primary }]}>New</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.categoriesContainer}>
            {categories.filter((category) => category.type === transaction.type).map((category) => {
              const IconComponent = ICON_MAP[category.icon] || MoreHorizontal;
              const isSelected = selectedCategoryId === category.id;

              return (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryChip,
                    { backgroundColor: theme.colors.cardBackground },
                    isSelected && {
                      backgroundColor: category.color + '20',
                      borderColor: category.color,
                    },
                  ]}
                  onPress={() => {
                    if (Platform.OS !== 'web') {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    setSelectedCategoryId(category.id);
                  }}
                  activeOpacity={0.7}
                >
                  <IconComponent
                    size={20}
                    color={isSelected ? category.color : theme.colors.text.secondary}
                    strokeWidth={2}
                  />
                  <Text
                    style={[
                      styles.categoryChipText,
                      { color: theme.colors.text.secondary },
                      isSelected && { color: category.color },
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { marginBottom: 12, color: theme.colors.text.primary }]}>Description</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.cardBackground, color: theme.colors.text.primary }]}
            value={description}
            onChangeText={setDescription}
            placeholder={isIncome ? "e.g., Freelance payment" : "e.g., Weekly groceries"}
            placeholderTextColor={theme.colors.text.secondary}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { marginBottom: 12, color: theme.colors.text.primary }]}>Vendor</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.cardBackground, color: theme.colors.text.primary }]}
            value={vendor}
            onChangeText={setVendor}
            placeholder="e.g., Whole Foods"
            placeholderTextColor={theme.colors.text.secondary}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { marginBottom: 12, color: theme.colors.text.primary }]}>Notes</Text>
          <TextInput
            style={[styles.input, styles.notesInput, { backgroundColor: theme.colors.cardBackground, color: theme.colors.text.primary }]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Additional notes..."
            placeholderTextColor={theme.colors.text.secondary}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <View style={styles.recurringHeader}>
            <View style={styles.recurringTitleContainer}>
              <Repeat size={20} color={theme.accent.primary} strokeWidth={2} />
              <Text style={[styles.sectionLabel, { color: theme.colors.text.primary }]}>Recurring</Text>
            </View>
            <Switch
              value={recurringEnabled}
              onValueChange={(value) => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setRecurringEnabled(value);
              }}
              trackColor={{ false: theme.colors.border, true: theme.accent.primary }}
              thumbColor="#fff"
            />
          </View>
          {recurringEnabled && (
            <>
              <View style={styles.frequencyContainer}>
                {(['weekly', 'biweekly', 'monthly'] as const).map((freq) => (
                  <TouchableOpacity
                    key={freq}
                    style={[
                      styles.frequencyButton,
                      { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border },
                      recurringFrequency === freq && { borderColor: theme.accent.primary, backgroundColor: theme.accent.primary + '20' },
                    ]}
                    onPress={() => {
                      if (Platform.OS !== 'web') {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                      setRecurringFrequency(freq);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.frequencyButtonText,
                        { color: theme.colors.text.secondary },
                        recurringFrequency === freq && { color: theme.accent.primary },
                      ]}
                    >
                      {freq.charAt(0).toUpperCase() + freq.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.datePickerSection}>
                <Text style={[styles.datePickerLabel, { color: theme.colors.text.secondary }]}>Next Occurrence</Text>
                <TouchableOpacity
                  style={[styles.datePickerButton, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}
                  onPress={() => setShowDatePicker(true)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.datePickerText, { color: theme.colors.text.primary }]}>
                    {recurringDate.toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                </TouchableOpacity>
              </View>
              {showDatePicker && (
                Platform.OS === 'ios' ? (
                  <Modal
                    transparent
                    animationType="slide"
                    visible={showDatePicker}
                    onRequestClose={() => setShowDatePicker(false)}
                  >
                    <View style={styles.modalOverlay}>
                      <View style={[styles.modalContent, { backgroundColor: theme.colors.cardBackground }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
                          <TouchableOpacity
                            onPress={() => setShowDatePicker(false)}
                            style={styles.modalButton}
                          >
                            <Text style={[styles.modalButtonText, { color: theme.accent.primary }]}>Done</Text>
                          </TouchableOpacity>
                        </View>
                        <DateTimePicker
                          value={recurringDate}
                          mode="date"
                          display="spinner"
                          onChange={(event, date) => {
                            if (date) {
                              setRecurringDate(date);
                            }
                          }}
                        />
                      </View>
                    </View>
                  </Modal>
                ) : (
                  <DateTimePicker
                    value={recurringDate}
                    mode="date"
                    display="default"
                    onChange={(event, date) => {
                      setShowDatePicker(false);
                      if (date) {
                        setRecurringDate(date);
                      }
                    }}
                  />
                )
              )}
            </>
          )}
        </View>

        <TouchableOpacity
          style={[styles.deleteButton, { backgroundColor: theme.colors.cardBackground, borderColor: '#EF4444' }]}
          onPress={handleDelete}
          activeOpacity={0.7}
        >
          <Text style={styles.deleteButtonText}>Delete Transaction</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FC',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FC',
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: -8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#1F2937',
  },
  addCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#6366F110',
  },
  addCategoryText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#6366F1',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#1F2937',
    padding: 0,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  notesInput: {
    minHeight: 100,
    paddingTop: 14,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  recurringHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recurringTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  frequencyContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  frequencyButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  frequencyButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  datePickerSection: {
    marginTop: 16,
  },
  datePickerLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#6B7280',
    marginBottom: 8,
  },
  datePickerButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  datePickerText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#1F2937',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#6366F1',
  },
  deleteButton: {
    marginTop: 8,
    marginBottom: 24,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#EF4444',
    backgroundColor: '#fff',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#EF4444',
  },
});
