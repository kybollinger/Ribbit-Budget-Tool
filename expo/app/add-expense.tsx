import { useBudget } from '@/contexts/BudgetContext';
import { useAppearance } from '@/contexts/AppearanceContext';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { formatInputNumber, parseInputNumber } from '@/utils/formatCurrency';
import { getCategoryColor } from '@/utils/getCategoryColor';
import {
  Home,
  Zap,
  ShoppingCart,
  Fuel,
  Utensils,
  Tv,
  PiggyBank,
  MoreHorizontal,
  X,
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
import React, { useState } from 'react';
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

export default function AddExpenseScreen() {
  const { type = 'expense', categoryId } = useLocalSearchParams<{ type?: 'income' | 'expense'; categoryId?: string }>();
  const { categories, addTransaction } = useBudget();
  const { theme } = useAppearance();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(categoryId || '');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [vendor, setVendor] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [recurringEnabled, setRecurringEnabled] = useState<boolean>(false);
  const [recurringFrequency, setRecurringFrequency] = useState<'weekly' | 'biweekly' | 'monthly'>('monthly');
  const [recurringDate, setRecurringDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  const isIncome = type === 'income';

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

    addTransaction({
      type: type as 'income' | 'expense',
      categoryId: selectedCategoryId,
      amount: parseFloat(numericAmount),
      description: description.trim() || undefined,
      vendor: vendor.trim() || undefined,
      notes: notes.trim() || undefined,
      date: new Date().toISOString(),
      recurring: recurringEnabled ? {
        frequency: recurringFrequency,
        enabled: true,
        nextDate: recurringDate.toISOString(),
      } : undefined,
    });

    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <Stack.Screen
        options={{
          presentation: 'modal',
          title: isIncome ? 'Add Income' : 'Add Expense',
          headerStyle: {
            backgroundColor: '#F8F9FC',
          },
          headerTintColor: '#1F2937',
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.closeButton}
            >
              <X size={24} color="#1F2937" strokeWidth={2} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={handleSave}
              style={[styles.saveButton, { backgroundColor: isIncome ? '#10B981' : theme.accent.primary }]}
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
          <Text style={[styles.sectionLabel, { marginBottom: 12 }]}>Amount *</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.amountInput}
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
            <Text style={styles.sectionLabel}>Category *</Text>
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
            {categories.filter((category) => category.type === type).map((category) => {
              const IconComponent = ICON_MAP[category.icon] || MoreHorizontal;
              const isSelected = selectedCategoryId === category.id;
              const categoryColor = getCategoryColor(category, theme.accent.primary);

              return (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryChip,
                    isSelected && {
                      backgroundColor: categoryColor + '20',
                      borderColor: categoryColor,
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
                    color={isSelected ? categoryColor : '#6B7280'}
                    strokeWidth={2}
                  />
                  <Text
                    style={[
                      styles.categoryChipText,
                      isSelected && { color: categoryColor },
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
          <Text style={[styles.sectionLabel, { marginBottom: 12 }]}>Description</Text>
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            placeholder={isIncome ? "e.g., Freelance payment" : "e.g., Weekly groceries"}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { marginBottom: 12 }]}>Vendor</Text>
          <TextInput
            style={styles.input}
            value={vendor}
            onChangeText={setVendor}
            placeholder="e.g., Whole Foods"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { marginBottom: 12 }]}>Notes</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
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
              <Text style={styles.sectionLabel}>Recurring</Text>
            </View>
            <Switch
              value={recurringEnabled}
              onValueChange={(value) => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setRecurringEnabled(value);
              }}
              trackColor={{ false: '#E5E7EB', true: theme.accent.primary }}
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
                <Text style={styles.datePickerLabel}>Next Occurrence</Text>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowDatePicker(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.datePickerText}>
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
                            <Text style={styles.modalButtonText}>Done</Text>
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FC',
  },
  closeButton: {
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
  },
  addCategoryText: {
    fontSize: 13,
    fontWeight: '600' as const,
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
    color: '#1F2937',
  },
});
