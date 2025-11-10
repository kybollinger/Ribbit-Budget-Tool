import { useBudget } from '@/contexts/BudgetContext';
import { useAppearance } from '@/contexts/AppearanceContext';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  Repeat,
  Plus,
  Trash2,
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

export default function EditRecurringPaymentScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useAppearance();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { transactions, categories, deleteTransaction, addTransaction } = useBudget();
  const transaction = transactions.find((t) => t.id === id);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [vendor, setVendor] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [recurringFrequency, setRecurringFrequency] = useState<'weekly' | 'biweekly' | 'monthly'>('monthly');
  const [recurringDate, setRecurringDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  useEffect(() => {
    if (transaction && !isInitialized) {
      setSelectedCategoryId(transaction.categoryId);
      setAmount(formatInputNumber(transaction.amount.toString()));
      setDescription(transaction.description || '');
      setVendor(transaction.vendor || '');
      setNotes(transaction.notes || '');
      setRecurringFrequency(transaction.recurring?.frequency || 'monthly');
      setRecurringDate(transaction.recurring?.nextDate ? new Date(transaction.recurring.nextDate) : new Date());
      setIsInitialized(true);
    }
  }, [transaction, isInitialized]);

  if (!transaction) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Recurring payment not found</Text>
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

    deleteTransaction(id);
    
    addTransaction({
      type: transaction.type,
      categoryId: selectedCategoryId,
      amount: parseFloat(numericAmount),
      description: description.trim() || undefined,
      vendor: vendor.trim() || undefined,
      notes: notes.trim() || undefined,
      date: transaction.date,
      recurring: {
        frequency: recurringFrequency,
        enabled: true,
        nextDate: recurringDate.toISOString(),
      },
    });

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/recurring-payments');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Recurring Payment',
      'Are you sure you want to delete this recurring payment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            deleteTransaction(id);
            if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/recurring-payments');
    }
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
          headerShown: false,
        }}
      />

      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/recurring-payments');
              }
            }}
            style={styles.backButton}
          >
            <Text style={[styles.backButtonText, { color: theme.accent.primary }]}>← Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.saveButton, { backgroundColor: theme.accent.primary }]}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
          {isIncome ? 'Edit Recurring Income' : 'Edit Recurring Payment'}
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.text.secondary }]}>Update recurring transaction details</Text>
      </View>

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
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.categoryHeader}>
            <Text style={[styles.sectionLabel, { color: theme.colors.text.primary }]}>Category *</Text>
            <TouchableOpacity
              onPress={() => {
                router.push('/add-category');
              }}
              style={[styles.addCategoryButton, { backgroundColor: theme.accent.primaryLight }]}
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
                      backgroundColor: theme.accent.primaryLight,
                      borderColor: theme.accent.primary,
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
                    color={isSelected ? theme.accent.primary : '#6B7280'}
                    strokeWidth={2}
                  />
                  <Text
                    style={[
                      styles.categoryChipText,
                      isSelected && { color: theme.accent.primary },
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
            placeholder={isIncome ? "e.g., Monthly salary" : "e.g., Netflix subscription"}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { marginBottom: 12, color: theme.colors.text.primary }]}>Vendor</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.cardBackground, color: theme.colors.text.primary }]}
            value={vendor}
            onChangeText={setVendor}
            placeholder="e.g., Netflix"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { marginBottom: 12, color: theme.colors.text.primary }]}>Notes</Text>
          <TextInput
            style={[styles.input, styles.notesInput, { backgroundColor: theme.colors.cardBackground, color: theme.colors.text.primary }]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Additional notes..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <View style={styles.recurringHeader}>
            <View style={styles.recurringTitleContainer}>
              <Repeat size={20} color={theme.accent.primary} strokeWidth={2} />
              <Text style={[styles.sectionLabel, { color: theme.colors.text.primary }]}>Frequency</Text>
            </View>
          </View>
          <View style={styles.frequencyContainer}>
            {(['weekly', 'biweekly', 'monthly'] as const).map((freq) => (
              <TouchableOpacity
                key={freq}
                style={[
                  styles.frequencyButton,
                  { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border },
                  recurringFrequency === freq && {
                    borderColor: theme.accent.primary,
                    backgroundColor: theme.accent.primaryLight,
                  },
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
                  <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
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
        </View>

        <TouchableOpacity
          style={[styles.deleteButton, { backgroundColor: theme.colors.cardBackground }]}
          onPress={handleDelete}
          activeOpacity={0.7}
        >
          <Trash2 size={20} color="#EF4444" strokeWidth={2} />
          <Text style={styles.deleteButtonText}>Delete Recurring Payment</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '500' as const,
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
  },
  addCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addCategoryText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
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
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '700' as const,
    padding: 0,
  },
  input: {
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#FFFFFF',
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
    marginBottom: 8,
  },
  datePickerButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  datePickerText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
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
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#EF4444',
    marginTop: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#EF4444',
  },
});
