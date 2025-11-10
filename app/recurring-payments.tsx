import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useBudget } from '@/contexts/BudgetContext';
import { useAppearance } from '@/contexts/AppearanceContext';
import { Plus, Edit2, Trash2, Repeat } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatCurrency } from '@/utils/formatCurrency';
import {
  Home,
  Zap,
  ShoppingCart,
  Fuel,
  Utensils,
  Tv,
  PiggyBank,
  MoreHorizontal,
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

export default function RecurringPaymentsScreen() {
  const insets = useSafeAreaInsets();
  const { categories, deleteTransaction, getRecurringTransactions } = useBudget();
  const { theme } = useAppearance();

  const recurringTransactions = useMemo(() => {
    return getRecurringTransactions();
  }, [getRecurringTransactions]);

  const handleDelete = (id: string, description: string) => {
    Alert.alert(
      'Delete Recurring Payment',
      `Are you sure you want to delete "${description || 'this recurring payment'}"?`,
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
          },
        },
      ]
    );
  };

  const formatFrequency = (frequency: 'weekly' | 'biweekly' | 'monthly') => {
    switch (frequency) {
      case 'weekly':
        return 'Weekly';
      case 'biweekly':
        return 'Biweekly';
      case 'monthly':
        return 'Monthly';
      default:
        return frequency;
    }
  };

  const formatNextDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  const expenseRecurring = recurringTransactions.filter((t) => t.type === 'expense');
  const incomeRecurring = recurringTransactions.filter((t) => t.type === 'income');

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={[styles.backButtonText, { color: theme.accent.primary }]}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerTop}>
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>Recurring Payments</Text>
          <TouchableOpacity
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              router.push('/add-recurring-payment');
            }}
            style={styles.addButton}
          >
            <Plus size={24} color={theme.accent.primary} strokeWidth={2} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.headerSubtitle, { color: theme.colors.text.secondary }]}>Manage recurring income and expenses</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {recurringTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Repeat size={48} color="#9CA3AF" strokeWidth={2} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.colors.text.primary }]}>No Recurring Payments</Text>
            <Text style={[styles.emptyDescription, { color: theme.colors.text.secondary }]}>
              Set up recurring transactions to automatically track regular income or expenses.
            </Text>
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: theme.accent.primary }]}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                router.push('/add-recurring-payment');
              }}
              activeOpacity={0.7}
            >
              <Plus size={20} color="#fff" strokeWidth={2} />
              <Text style={styles.emptyButtonText}>Add Recurring Payment</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {expenseRecurring.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text.secondary }]}>Recurring Expenses</Text>
                <View style={styles.transactionsList}>
                  {expenseRecurring.map((transaction) => {
                    const category = categories.find((c) => c.id === transaction.categoryId);
                    const IconComponent = category ? ICON_MAP[category.icon] || MoreHorizontal : MoreHorizontal;

                    return (
                      <View key={transaction.id} style={[styles.transactionCard, { backgroundColor: theme.colors.cardBackground }]}>
                        <View style={styles.transactionHeader}>
                          <View style={styles.transactionInfo}>
                            <View style={[styles.iconContainer, { backgroundColor: theme.accent.primaryLight }]}>
                              <IconComponent
                                size={20}
                                color={theme.accent.primary}
                                strokeWidth={2}
                              />
                            </View>
                            <View style={styles.transactionDetails}>
                              <Text style={[styles.transactionDescription, { color: theme.colors.text.primary }]}>
                                {transaction.description || category?.name || 'Recurring Payment'}
                              </Text>
                              <View style={styles.transactionMeta}>
                                <Text style={[styles.transactionCategory, { color: theme.colors.text.secondary }]}>{category?.name}</Text>
                                <Text style={[styles.transactionDot, { color: theme.colors.text.tertiary }]}>•</Text>
                                <Text style={[styles.transactionFrequency, { color: theme.colors.text.secondary }]}>
                                  {formatFrequency(transaction.recurring?.frequency || 'monthly')}
                                </Text>
                              </View>
                            </View>
                          </View>
                          <Text style={[styles.transactionAmount, { color: theme.colors.text.primary }]}>
                            {formatCurrency(transaction.amount)}
                          </Text>
                        </View>
                        <View style={styles.transactionFooter}>
                          <View style={styles.nextDateContainer}>
                            <Repeat size={14} color="#6B7280" strokeWidth={2} />
                            <Text style={[styles.nextDateText, { color: theme.colors.text.secondary }]}>
                              Next: {transaction.recurring?.nextDate ? formatNextDate(transaction.recurring.nextDate) : 'Not set'}
                            </Text>
                          </View>
                          <View style={styles.transactionActions}>
                            <TouchableOpacity
                              style={[styles.actionButton, { backgroundColor: theme.colors.background }]}
                              onPress={() => {
                                if (Platform.OS !== 'web') {
                                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                }
                                router.push(`/edit-recurring-payment/${transaction.id}`);
                              }}
                              activeOpacity={0.7}
                            >
                              <Edit2 size={16} color={theme.accent.primary} strokeWidth={2} />
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.actionButton, { backgroundColor: theme.colors.background }]}
                              onPress={() => handleDelete(transaction.id, transaction.description || '')}
                              activeOpacity={0.7}
                            >
                              <Trash2 size={16} color="#EF4444" strokeWidth={2} />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {incomeRecurring.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text.secondary }]}>Recurring Income</Text>
                <View style={styles.transactionsList}>
                  {incomeRecurring.map((transaction) => {
                    const category = categories.find((c) => c.id === transaction.categoryId);
                    const IconComponent = category ? ICON_MAP[category.icon] || MoreHorizontal : MoreHorizontal;

                    return (
                      <View key={transaction.id} style={[styles.transactionCard, { backgroundColor: theme.colors.cardBackground }]}>
                        <View style={styles.transactionHeader}>
                          <View style={styles.transactionInfo}>
                            <View style={[styles.iconContainer, { backgroundColor: theme.accent.primaryLight }]}>
                              <IconComponent
                                size={20}
                                color={theme.accent.primary}
                                strokeWidth={2}
                              />
                            </View>
                            <View style={styles.transactionDetails}>
                              <Text style={[styles.transactionDescription, { color: theme.colors.text.primary }]}>
                                {transaction.description || category?.name || 'Recurring Income'}
                              </Text>
                              <View style={styles.transactionMeta}>
                                <Text style={[styles.transactionCategory, { color: theme.colors.text.secondary }]}>{category?.name}</Text>
                                <Text style={[styles.transactionDot, { color: theme.colors.text.tertiary }]}>•</Text>
                                <Text style={[styles.transactionFrequency, { color: theme.colors.text.secondary }]}>
                                  {formatFrequency(transaction.recurring?.frequency || 'monthly')}
                                </Text>
                              </View>
                            </View>
                          </View>
                          <Text style={[styles.transactionAmount, styles.incomeAmount]}>
                            +{formatCurrency(transaction.amount)}
                          </Text>
                        </View>
                        <View style={styles.transactionFooter}>
                          <View style={styles.nextDateContainer}>
                            <Repeat size={14} color="#6B7280" strokeWidth={2} />
                            <Text style={[styles.nextDateText, { color: theme.colors.text.secondary }]}>
                              Next: {transaction.recurring?.nextDate ? formatNextDate(transaction.recurring.nextDate) : 'Not set'}
                            </Text>
                          </View>
                          <View style={styles.transactionActions}>
                            <TouchableOpacity
                              style={[styles.actionButton, { backgroundColor: theme.colors.background }]}
                              onPress={() => {
                                if (Platform.OS !== 'web') {
                                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                }
                                router.push(`/edit-recurring-payment/${transaction.id}`);
                              }}
                              activeOpacity={0.7}
                            >
                              <Edit2 size={16} color={theme.accent.primary} strokeWidth={2} />
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.actionButton, { backgroundColor: theme.colors.background }]}
                              onPress={() => handleDelete(transaction.id, transaction.description || '')}
                              activeOpacity={0.7}
                            >
                              <Trash2 size={16} color="#EF4444" strokeWidth={2} />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backButton: {
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '700' as const,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '500' as const,
  },
  addButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
    marginBottom: 32,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  transactionsList: {
    gap: 12,
  },
  transactionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  transactionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  transactionCategory: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  transactionDot: {
    fontSize: 13,
  },
  transactionFrequency: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  incomeAmount: {
    color: '#10B981',
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  nextDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nextDateText: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  transactionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
