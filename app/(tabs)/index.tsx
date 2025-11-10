import { useBudget } from '@/contexts/BudgetContext';
import { useAnalysis } from '@/contexts/AnalysisContext';
import { useAppearance } from '@/contexts/AppearanceContext';
import { router } from 'expo-router';
import { formatCurrency } from '@/utils/formatCurrency';
import { getCategoryColor } from '@/utils/getCategoryColor';
import {
  Home,
  Plus,
  TrendingUp,
  Zap,
  ShoppingCart,
  Fuel,
  Utensils,
  Tv,
  PiggyBank,
  MoreHorizontal,
} from 'lucide-react-native';
import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { getFrogByBudgetStatus } from '@/constants/mascots';

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  home: Home,
  zap: Zap,
  'shopping-cart': ShoppingCart,
  fuel: Fuel,
  utensils: Utensils,
  tv: Tv,
  'piggy-bank': PiggyBank,
  'more-horizontal': MoreHorizontal,
};

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const { categoriesWithTotals, isLoading, getCategorySpendingForMonth, getTransactionsByMonth } = useBudget();
  const { selectedDateInfo } = useAnalysis();
  const { theme } = useAppearance();
  const insets = useSafeAreaInsets();

  const monthlyTransactions = useMemo(() => {
    return getTransactionsByMonth(selectedDateInfo.month, selectedDateInfo.year);
  }, [getTransactionsByMonth, selectedDateInfo.month, selectedDateInfo.year]);

  const monthlyIncome = useMemo(() => {
    return monthlyTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [monthlyTransactions]);

  const monthlyExpenses = useMemo(() => {
    return monthlyTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [monthlyTransactions]);

  const monthlyBalance = useMemo(() => {
    return monthlyIncome - monthlyExpenses;
  }, [monthlyIncome, monthlyExpenses]);

  const categoriesForBudgetCheck = useMemo(() => {
    return categoriesWithTotals.map((category) => {
      const monthSpending = getCategorySpendingForMonth(
        category.id,
        selectedDateInfo.month,
        selectedDateInfo.year
      );
      return {
        goal: category.goal,
        total: monthSpending,
      };
    });
  }, [categoriesWithTotals, getCategorySpendingForMonth, selectedDateInfo]);

  const frogMascot = useMemo(() => {
    return getFrogByBudgetStatus(monthlyIncome, monthlyExpenses, categoriesForBudgetCheck);
  }, [monthlyIncome, monthlyExpenses, categoriesForBudgetCheck]);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.accent.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={[styles.headerTitle, { fontSize: 36 * theme.textScale, color: theme.colors.text.primary }]}>Ribbit</Text>
            <Text style={[styles.headerSubtitle, { fontSize: 16 * theme.textScale, color: theme.colors.text.secondary }]}>Track every dollar</Text>
          </View>
          <View style={styles.frogIconContainer}>
            {frogMascot?.uri ? (
              <Image
                source={{ uri: frogMascot.uri }}
                style={[styles.frogIcon, { tintColor: theme.accent.primary }]}
                contentFit="contain"
              />
            ) : null}
          </View>
        </View>

        <View style={[styles.balanceCard, { backgroundColor: theme.colors.cardBackground }]}>
          <View style={styles.balanceHeader}>
            <TrendingUp size={24} color={theme.accent.primary} strokeWidth={2.5} />
            <Text style={[styles.balanceLabel, { fontSize: 15 * theme.textScale, color: theme.colors.text.secondary }]}>Monthly Balance</Text>
          </View>
          <Text style={[styles.balanceAmount, { fontSize: 48 * theme.textScale, color: monthlyBalance >= 0 ? theme.colors.success : theme.colors.error }]}>
            {monthlyBalance >= 0 ? '+' : ''}{formatCurrency(monthlyBalance)}
          </Text>
          <View style={styles.balanceFooter}>
            <View style={styles.balanceRow}>
              <Text style={[styles.balanceLabel, { fontSize: 15 * theme.textScale, color: theme.colors.text.secondary }]}>Income: </Text>
              <Text style={[styles.balanceValue, { fontSize: 16 * theme.textScale, color: theme.colors.success }]}>
                +{formatCurrency(monthlyIncome)}
              </Text>
            </View>
            <View style={styles.balanceRow}>
              <Text style={[styles.balanceLabel, { fontSize: 15 * theme.textScale, color: theme.colors.text.secondary }]}>Expenses: </Text>
              <Text style={[styles.balanceValue, { fontSize: 16 * theme.textScale, color: theme.colors.error }]}>
                -{formatCurrency(monthlyExpenses)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { fontSize: 20 * theme.textScale, color: theme.colors.text.primary }]}>Categories</Text>
            <TouchableOpacity
              style={[styles.addCategoryButton, { backgroundColor: theme.accent.primaryLight }]}
              onPress={() => router.push('/add-category')}
              activeOpacity={0.7}
            >
              <Plus size={20} color={theme.accent.primary} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
          <View style={styles.categoriesGrid}>
            {categoriesWithTotals.map((category) => {
              const IconComponent = ICON_MAP[category.icon] || MoreHorizontal;
              const monthSpending = getCategorySpendingForMonth(
                category.id,
                selectedDateInfo.month,
                selectedDateInfo.year
              );
              const goal = category.goal || 0;
              const progress = goal > 0 ? (monthSpending / goal) : 0;
              const isNearGoal = progress >= 0.8 && progress < 1;
              const isOverGoal = progress >= 1;
              const categoryColor = getCategoryColor(category, theme.accent.primary);

              return (
                <TouchableOpacity
                  key={category.id}
                  style={[styles.categoryCard, { backgroundColor: theme.colors.cardBackground }]}
                  onPress={() =>
                    router.push({
                      pathname: '/category/[id]',
                      params: { id: category.id },
                    })
                  }
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.categoryIconContainer,
                      { backgroundColor: categoryColor + '20' },
                    ]}
                  >
                    <IconComponent
                      size={32}
                      color={categoryColor}
                      strokeWidth={2.5}
                    />
                  </View>
                  <View style={styles.categoryInfo}>
                    <Text style={[styles.categoryName, { fontSize: 14 * theme.textScale, color: theme.colors.text.primary }]} numberOfLines={1}>
                      {category.name}
                    </Text>
                    {goal > 0 ? (
                      <>
                        <Text
                          style={[
                            styles.categoryAmount,
                            { fontSize: 16 * theme.textScale, color: theme.colors.text.primary },
                            isOverGoal && { color: theme.colors.error },
                          ]}
                        >
                          {formatCurrency(monthSpending)} of {formatCurrency(goal)}
                        </Text>
                        <View style={[styles.goalBar, { backgroundColor: theme.colors.border }]}>
                          <View
                            style={[
                              styles.goalBarFill,
                              {
                                width: `${Math.min(progress * 100, 100)}%`,
                                backgroundColor: isOverGoal
                                  ? theme.colors.error
                                  : isNearGoal
                                  ? theme.colors.warning
                                  : theme.colors.success,
                              },
                            ]}
                          />
                        </View>
                        <Text
                          style={[
                            styles.goalText,
                            { fontSize: 10 * theme.textScale, color: theme.colors.text.secondary },
                            isOverGoal && { color: theme.colors.error },
                          ]}
                        >
                          {selectedDateInfo.isCurrentMonth ? 'This month' : selectedDateInfo.label}
                        </Text>
                      </>
                    ) : (
                      <>
                        <Text style={[styles.categoryAmount, { fontSize: 16 * theme.textScale, color: theme.colors.text.primary }]}>
                          {formatCurrency(category.total)}
                        </Text>
                        <Text style={[styles.categoryCount, { fontSize: 11 * theme.textScale, color: theme.colors.text.tertiary }]}>
                          {category.transactionCount} item
                          {category.transactionCount !== 1 ? 's' : ''}
                        </Text>
                      </>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { bottom: 32 + insets.bottom, backgroundColor: theme.accent.primary, shadowColor: theme.accent.primary }]}
        onPress={() => router.push('/transaction-type-modal')}
        activeOpacity={0.8}
      >
        <Plus size={28} color="#fff" strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    marginTop: 20,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500' as const,
  },
  frogIconContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  frogIcon: {
    width: 80,
    height: 80,
  },
  balanceCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#6366F1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  balanceLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginBottom: 8,
  },
  balanceFooter: {
    flexDirection: 'column',
    gap: 8,
    marginTop: 8,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceValue: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1F2937',
  },
  addCategoryButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#6366F120',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    width: (width - 52) / 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryInfo: {
    gap: 4,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#1F2937',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginTop: 4,
  },
  categoryCount: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500' as const,
  },
  goalBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 8,
  },
  goalBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  goalText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500' as const,
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
});
