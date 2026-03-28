import { useBudget } from '@/contexts/BudgetContext';
import { useAppearance } from '@/contexts/AppearanceContext';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
} from 'react-native';
import * as Haptics from 'expo-haptics';

const ICON_OPTIONS = [
  { icon: 'home', Component: Home },
  { icon: 'zap', Component: Zap },
  { icon: 'shopping-cart', Component: ShoppingCart },
  { icon: 'fuel', Component: Fuel },
  { icon: 'utensils', Component: Utensils },
  { icon: 'tv', Component: Tv },
  { icon: 'piggy-bank', Component: PiggyBank },
  { icon: 'coffee', Component: Coffee },
  { icon: 'bus', Component: Bus },
  { icon: 'plane', Component: Plane },
  { icon: 'heart', Component: Heart },
  { icon: 'gift', Component: Gift },
  { icon: 'book-open', Component: BookOpen },
  { icon: 'shirt', Component: Shirt },
  { icon: 'dumbbell', Component: Dumbbell },
  { icon: 'smartphone', Component: Smartphone },
  { icon: 'laptop', Component: Laptop },
  { icon: 'briefcase', Component: Briefcase },
  { icon: 'graduation-cap', Component: GraduationCap },
  { icon: 'music', Component: Music },
  { icon: 'film', Component: Film },
  { icon: 'more-horizontal', Component: MoreHorizontal },
];

const COLOR_OPTIONS = [
  '#FF6B6B',
  '#4ECDC4',
  '#95E1D3',
  '#F38181',
  '#AA96DA',
  '#FCBAD3',
  '#A8D8EA',
  '#FFD93D',
  '#6BCF7F',
  '#FF8B94',
  '#A8E6CF',
  '#FFD3B6',
];

export default function EditCategoryScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useAppearance();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { categories, updateCategory, deleteCategory, archiveCategory, getCategoryTransactionCount } = useBudget();
  const category = categories.find((c) => c.id === id);

  const [name, setName] = useState<string>('');
  const [selectedIcon, setSelectedIcon] = useState<string>('more-horizontal');
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
  const [goalAmount, setGoalAmount] = useState<string>('');
  const [categoryType, setCategoryType] = useState<'income' | 'expense'>('expense');
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  useEffect(() => {
    if (category && !isInitialized) {
      setName(category.name);
      setSelectedIcon(category.icon);
      setSelectedColor(category.color);
      setGoalAmount(category.goal ? category.goal.toString() : '');
      setCategoryType(category.type);
      setIsInitialized(true);
    }
  }, [category, isInitialized]);

  if (!category) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Category not found</Text>
      </View>
    );
  }

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Missing Name', 'Please enter a category name');
      return;
    }

    if (category && categoryType !== category.type) {
      Alert.alert(
        'Change Category Type',
        `Changing this category from ${category.type} to ${categoryType} will affect how it appears in your analysis. Are you sure?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Change Type',
            style: 'default',
            onPress: () => saveCategory(),
          },
        ]
      );
    } else {
      saveCategory();
    }
  };

  const saveCategory = () => {
    try {
      console.log('[EditCategory] Saving category:', {
        id,
        name: name.trim(),
        icon: selectedIcon,
        color: selectedColor,
        type: categoryType,
        goal: goalAmount ? parseFloat(goalAmount) : undefined,
      });

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      updateCategory(id, {
        name: name.trim(),
        icon: selectedIcon,
        color: selectedColor,
        type: categoryType,
        goal: goalAmount ? parseFloat(goalAmount) : undefined,
      });

      console.log('[EditCategory] Category updated successfully, navigating back');
      
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/categories-management');
      }
    } catch (error) {
      console.error('[EditCategory] Error saving category:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update category');
    }
  };

  const handleDelete = () => {
    const transactionCount = getCategoryTransactionCount(id);

    if (transactionCount > 0) {
      Alert.alert(
        'Archive Category',
        `This category has ${transactionCount} transaction${transactionCount !== 1 ? 's' : ''}. Would you like to archive it instead? Archived categories are hidden but transactions remain in your history.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Archive',
            style: 'default',
            onPress: () => {
              if (Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
              archiveCategory(id);
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/categories-management');
              }
            },
          },
        ]
      );
    } else {
      Alert.alert(
        'Delete Category',
        'Are you sure you want to delete this category?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              try {
                if (Platform.OS !== 'web') {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }
                deleteCategory(id);
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace('/categories-management');
                }
              } catch (error) {
                Alert.alert('Error', error instanceof Error ? error.message : 'Failed to delete category');
              }
            },
          },
        ]
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
                router.replace('/categories-management');
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
        <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>Edit Category</Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.text.secondary }]}>Update category details</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.colors.text.primary }]}>Category Name *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.cardBackground, color: theme.colors.text.primary }]}
            value={name}
            onChangeText={setName}
            placeholder="e.g., Transportation"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.colors.text.primary }]}>Type *</Text>
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                categoryType === 'expense' && {
                  backgroundColor: theme.accent.primaryLight,
                  borderColor: theme.accent.primary,
                },
              ]}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setCategoryType('expense');
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  categoryType === 'expense' && { color: theme.accent.primary },
                ]}
              >
                Expense
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                categoryType === 'income' && {
                  backgroundColor: theme.accent.primaryLight,
                  borderColor: theme.accent.primary,
                },
              ]}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setCategoryType('income');
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  categoryType === 'income' && { color: theme.accent.primary },
                ]}
              >
                Income
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.colors.text.primary }]}>Icon</Text>
          <View style={styles.iconGrid}>
            {ICON_OPTIONS.map(({ icon, Component }) => {
              const displayColor = selectedColor || theme.accent.primary;
              return (
                <TouchableOpacity
                  key={icon}
                  style={[
                    styles.iconOption,
                    { backgroundColor: theme.colors.cardBackground },
                    selectedIcon === icon && {
                      backgroundColor: displayColor + '20',
                      borderColor: displayColor,
                    },
                  ]}
                  onPress={() => {
                    if (Platform.OS !== 'web') {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    setSelectedIcon(icon);
                  }}
                  activeOpacity={0.7}
                >
                  <Component
                    size={24}
                    color={selectedIcon === icon ? displayColor : '#6B7280'}
                    strokeWidth={2}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.colors.text.primary }]}>Color (Optional)</Text>
          <TouchableOpacity
            style={[
              styles.accentColorOption,
              { backgroundColor: theme.colors.cardBackground },
              selectedColor === undefined && [
                styles.accentColorOptionSelected,
                { borderColor: theme.accent.primary },
              ],
            ]}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              setSelectedColor(undefined);
            }}
            activeOpacity={0.7}
          >
            <View style={[styles.accentColorIndicator, { backgroundColor: theme.accent.primary }]} />
            <Text style={[styles.accentColorText, { color: theme.colors.text.primary }]}>Use Accent Color</Text>
          </TouchableOpacity>
          <View style={styles.colorGrid}>
            {COLOR_OPTIONS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  selectedColor === color && styles.colorOptionSelected,
                ]}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  setSelectedColor(color);
                }}
                activeOpacity={0.7}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.colors.text.primary }]}>Monthly Goal (Optional)</Text>
          <View style={[styles.amountInputContainer, { backgroundColor: theme.colors.cardBackground }]}>
            <Text style={[styles.currencySymbol, { color: theme.colors.text.primary }]}>$</Text>
            <TextInput
              style={[styles.amountInput, { color: theme.colors.text.primary }]}
              value={goalAmount}
              onChangeText={setGoalAmount}
              placeholder="0.00"
              keyboardType="decimal-pad"
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <Text style={[styles.helperText, { color: theme.colors.text.secondary }]}>
            Set a spending limit for this category
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.deleteButton, { backgroundColor: theme.colors.cardBackground }]}
          onPress={handleDelete}
          activeOpacity={0.7}
        >
          <Trash2 size={20} color="#EF4444" strokeWidth={2} />
          <Text style={styles.deleteButtonText}>
            {getCategoryTransactionCount(id) > 0 ? 'Archive Category' : 'Delete Category'}
          </Text>
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
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    marginBottom: 12,
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
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconOption: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
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
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: '#1F2937',
    borderWidth: 3,
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
    fontSize: 24,
    fontWeight: '700' as const,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700' as const,
    padding: 0,
  },
  helperText: {
    fontSize: 13,
    marginTop: 8,
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
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
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
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  accentColorOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  accentColorOptionSelected: {
    borderWidth: 3,
  },
  accentColorIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  accentColorText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
});
