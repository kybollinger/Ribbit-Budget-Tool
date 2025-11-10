import { useBudget } from '@/contexts/BudgetContext';
import { useAnalysis } from '@/contexts/AnalysisContext';
import { useAppearance } from '@/contexts/AppearanceContext';
import { formatCurrency } from '@/utils/formatCurrency';
import { router } from 'expo-router';
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import Svg, { Path, Circle } from 'react-native-svg';
import { ChevronDown, ChevronUp, Calendar } from 'lucide-react-native';
import { Image } from 'expo-image';
import { getFrogByBudgetStatus } from '@/constants/mascots';

const { width } = Dimensions.get('window');
const CHART_SIZE = width - 80;

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

interface MonthData {
  month: number;
  year: number;
  label: string;
  income: number;
  expenses: number;
  net: number;
  categoryBreakdown: { categoryId: string; amount: number; percentage: number }[];
}

function PieChart({ data, categories, theme }: { data: MonthData['categoryBreakdown']; categories: any[]; theme: any }) {
  const total = data.reduce((sum, item) => sum + item.amount, 0);
  
  if (total === 0) {
    return (
      <View style={[styles.emptyChartContainer, { backgroundColor: theme.colors.border }]}>
        <Text style={[styles.emptyChartText, { fontSize: 16 * theme.textScale, color: theme.colors.text.secondary }]}>No expenses this month</Text>
      </View>
    );
  }

  const sortedData = data.sort((a, b) => b.amount - a.amount);
  
  const createPieSlice = (percentage: number, startAngle: number, color: string) => {
    const radius = CHART_SIZE / 2;
    const centerX = radius;
    const centerY = radius;
    const innerRadius = radius * 0.5;
    
    const angle = (percentage / 100) * 360;
    const endAngle = startAngle + angle;
    
    const startAngleRad = (startAngle - 90) * (Math.PI / 180);
    const endAngleRad = (endAngle - 90) * (Math.PI / 180);
    
    const x1 = centerX + radius * Math.cos(startAngleRad);
    const y1 = centerY + radius * Math.sin(startAngleRad);
    const x2 = centerX + radius * Math.cos(endAngleRad);
    const y2 = centerY + radius * Math.sin(endAngleRad);
    
    const x3 = centerX + innerRadius * Math.cos(endAngleRad);
    const y3 = centerY + innerRadius * Math.sin(endAngleRad);
    const x4 = centerX + innerRadius * Math.cos(startAngleRad);
    const y4 = centerY + innerRadius * Math.sin(startAngleRad);
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    const pathData = [
      `M ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
      'Z',
    ].join(' ');
    
    return pathData;
  };

  let currentAngle = 0;
  const slices = sortedData.map((item) => {
    const category = categories.find((c) => c.id === item.categoryId);
    const slice = {
      path: createPieSlice(item.percentage, currentAngle, category?.color || '#9CA3AF'),
      color: category?.color || '#9CA3AF',
    };
    currentAngle += (item.percentage / 100) * 360;
    return slice;
  });

  return (
    <View style={styles.chartContainer}>
      <View style={styles.pieChartWrapper}>
        <Svg width={CHART_SIZE} height={CHART_SIZE}>
          {slices.map((slice, index) => (
            <Path key={index} d={slice.path} fill={slice.color} />
          ))}
          <Circle
            cx={CHART_SIZE / 2}
            cy={CHART_SIZE / 2}
            r={(CHART_SIZE / 2) * 0.5}
            fill={theme.colors.cardBackground}
          />
        </Svg>
        <View style={styles.pieCenterContent}>
          <Text style={[styles.pieCenterLabel, { fontSize: 14 * theme.textScale, color: theme.colors.text.secondary }]}>Total</Text>
          <Text style={[styles.pieCenterValue, { fontSize: 24 * theme.textScale, color: theme.colors.text.primary }]}>{formatCurrency(total)}</Text>
        </View>
      </View>
      <View style={styles.legendContainer}>
        {sortedData.map((item, index) => {
          const category = categories.find((c) => c.id === item.categoryId);
          return (
            <View key={index} style={styles.legendItem}>
              <View
                style={[
                  styles.legendColor,
                  { backgroundColor: category?.color || '#9CA3AF' },
                ]}
              />
              <Text style={[styles.legendText, { fontSize: 14 * theme.textScale, color: theme.colors.text.primary }]} numberOfLines={1}>
                {category?.name || 'Unknown'}
              </Text>
              <Text style={[styles.legendPercentage, { fontSize: 14 * theme.textScale, color: theme.colors.text.secondary }]}>
                {item.percentage.toFixed(1)}%
              </Text>
              <Text style={[styles.legendAmount, { fontSize: 14 * theme.textScale, color: theme.colors.text.primary }]}>
                {formatCurrency(item.amount)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function BarChart({ data, categories, theme }: { data: MonthData['categoryBreakdown']; categories: any[]; theme: any }) {
  const total = data.reduce((sum, item) => sum + item.amount, 0);
  
  if (total === 0) {
    return (
      <View style={[styles.emptyChartContainer, { backgroundColor: theme.colors.border }]}>
        <Text style={[styles.emptyChartText, { fontSize: 16 * theme.textScale, color: theme.colors.text.secondary }]}>No expenses this month</Text>
      </View>
    );
  }

  const sortedData = data.sort((a, b) => b.amount - a.amount);
  const maxAmount = Math.max(...sortedData.map((item) => item.amount));

  return (
    <View style={styles.barChartContainer}>
      {sortedData.map((item, index) => {
        const category = categories.find((c) => c.id === item.categoryId);
        const barWidth = (item.amount / maxAmount) * 100;
        
        return (
          <View key={index} style={styles.barChartRow}>
            <View style={styles.barChartLabelContainer}>
              <View
                style={[
                  styles.barChartColorDot,
                  { backgroundColor: category?.color || '#9CA3AF' },
                ]}
              />
              <Text style={[styles.barChartLabel, { fontSize: 14 * theme.textScale, color: theme.colors.text.primary }]} numberOfLines={1}>
                {category?.name || 'Unknown'}
              </Text>
            </View>
            <View style={[styles.barChartBarContainer, { backgroundColor: theme.colors.border }]}>
              <View
                style={[
                  styles.barChartBar,
                  {
                    width: `${barWidth}%`,
                    backgroundColor: category?.color || '#9CA3AF',
                  },
                ]}
              />
            </View>
            <View style={styles.barChartValues}>
              <Text style={[styles.barChartAmount, { fontSize: 14 * theme.textScale, color: theme.colors.text.primary }]}>
                {formatCurrency(item.amount)}
              </Text>
              <Text style={[styles.barChartPercentage, { fontSize: 13 * theme.textScale, color: theme.colors.text.secondary }]}>
                {item.percentage.toFixed(1)}%
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

export default function AnalysisScreen() {
  const { transactions, categories, totalExpenses, totalIncome } = useBudget();
  const { selectedMonth, selectedYear, updateSelectedDate, selectedDateInfo } = useAnalysis();
  const { theme, chartType } = useAppearance();
  const insets = useSafeAreaInsets();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [tempMonth, setTempMonth] = useState<number>(new Date().getMonth());
  const [tempYear, setTempYear] = useState<number>(new Date().getFullYear());

  const categoriesForBudgetCheck = useMemo(() => {
    return categories.map((category) => {
      const monthTransactions = transactions.filter((t) => {
        if (t.recurring?.enabled) {
          return false;
        }
        const tDate = new Date(t.date);
        return (
          t.categoryId === category.id &&
          t.type === 'expense' &&
          tDate.getMonth() === selectedMonth &&
          tDate.getFullYear() === selectedYear
        );
      });
      const monthSpending = monthTransactions.reduce((sum, t) => sum + t.amount, 0);
      return {
        goal: category.goal,
        total: monthSpending,
      };
    });
  }, [categories, transactions, selectedMonth, selectedYear]);

  const frogMascot = useMemo(() => {
    const mascot = getFrogByBudgetStatus(totalIncome, totalExpenses, categoriesForBudgetCheck);
    return mascot && mascot.uri ? mascot : { uri: '', name: 'Frog' };
  }, [totalIncome, totalExpenses, categoriesForBudgetCheck]);

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    transactions.forEach((t) => {
      const date = new Date(t.date);
      years.add(date.getFullYear());
    });
    const currentYear = new Date().getFullYear();
    years.add(currentYear);
    return Array.from(years).sort((a, b) => b - a);
  }, [transactions]);

  const monthData = useMemo(() => {
    const monthTransactions = transactions.filter((t) => {
      if (t.recurring?.enabled) {
        return false;
      }
      const tDate = new Date(t.date);
      return tDate.getMonth() === selectedMonth && tDate.getFullYear() === selectedYear;
    });

    const income = monthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = monthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const categoryTotals = new Map<string, number>();
    monthTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const current = categoryTotals.get(t.categoryId) || 0;
        categoryTotals.set(t.categoryId, current + t.amount);
      });

    const categoryBreakdown = Array.from(categoryTotals.entries())
      .map(([categoryId, amount]) => ({
        categoryId,
        amount,
        percentage: expenses > 0 ? (amount / expenses) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      month: selectedMonth,
      year: selectedYear,
      label: selectedDateInfo.label,
      income,
      expenses,
      net: income - expenses,
      categoryBreakdown,
    };
  }, [transactions, selectedMonth, selectedYear, selectedDateInfo]);

  const toggleCategoryExpansion = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const getCategoryTransactions = (categoryId: string) => {
    return transactions
      .filter((t) => {
        if (t.recurring?.enabled) {
          return false;
        }
        const tDate = new Date(t.date);
        return (
          t.categoryId === categoryId &&
          t.type === 'expense' &&
          tDate.getMonth() === selectedMonth &&
          tDate.getFullYear() === selectedYear
        );
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={[styles.headerTitle, { fontSize: 36 * theme.textScale, color: theme.colors.text.primary }]}>Analysis</Text>
          <Text style={[styles.headerSubtitle, { fontSize: 16 * theme.textScale, color: theme.colors.text.secondary }]}>Track your spending patterns</Text>
        </View>
        <View style={styles.frogIconContainer}>
          {frogMascot.uri ? (
            <Image
              source={{ uri: frogMascot.uri }}
              style={[styles.frogIcon, { tintColor: theme.accent.primary }]}
              contentFit="contain"
            />
          ) : null}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={[styles.datePicker, { backgroundColor: theme.colors.cardBackground }]}
          onPress={() => {
            setTempMonth(selectedMonth);
            setTempYear(selectedYear);
            setShowDatePicker(true);
          }}
          activeOpacity={0.7}
        >
          <Calendar size={20} color={theme.accent.primary} strokeWidth={2} />
          <Text style={[styles.datePickerText, { fontSize: 17 * theme.textScale, color: theme.colors.text.primary }]}>
            {MONTHS[selectedMonth]} {selectedYear}
          </Text>
          <ChevronDown size={20} color={theme.colors.text.secondary} strokeWidth={2} />
        </TouchableOpacity>

        <View style={[styles.summaryCard, { backgroundColor: theme.colors.cardBackground }]}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { fontSize: 13 * theme.textScale, color: theme.colors.text.secondary }]}>Income</Text>
              <Text style={[styles.summaryValue, { fontSize: 20 * theme.textScale, color: theme.colors.success }]}>
                +{formatCurrency(monthData.income)}
              </Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { fontSize: 13 * theme.textScale, color: theme.colors.text.secondary }]}>Expenses</Text>
              <Text style={[styles.summaryValue, { fontSize: 20 * theme.textScale, color: theme.colors.error }]}>
                -{formatCurrency(monthData.expenses)}
              </Text>
            </View>
          </View>
          <View style={[styles.netDivider, { backgroundColor: theme.colors.border }]} />
          <View style={styles.netRow}>
            <View style={styles.netItem}>
              <Text style={[styles.summaryLabel, { fontSize: 13 * theme.textScale, color: theme.colors.text.secondary }]}>Net</Text>
              <Text
                style={[
                  styles.summaryValueLarge,
                  { fontSize: 28 * theme.textScale, color: monthData.net >= 0 ? theme.colors.success : theme.colors.error },
                ]}
              >
                {monthData.net >= 0 ? '+' : ''}{formatCurrency(monthData.net)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: 20 * theme.textScale, color: theme.colors.text.primary }]}>Spending Breakdown</Text>
          {chartType === 'pie' ? (
            <PieChart data={monthData.categoryBreakdown} categories={categories} theme={theme} />
          ) : (
            <BarChart data={monthData.categoryBreakdown} categories={categories} theme={theme} />
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: 20 * theme.textScale, color: theme.colors.text.primary }]}>Category Details</Text>
          {monthData.categoryBreakdown.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: theme.colors.border }]}>
              <Text style={[styles.emptyStateText, { fontSize: 16 * theme.textScale, color: theme.colors.text.secondary }]}>No expenses this month</Text>
            </View>
          ) : (
            monthData.categoryBreakdown.map((item, index) => {
              const category = categories.find((c) => c.id === item.categoryId);
              const isExpanded = expandedCategories.has(item.categoryId);
              const categoryTransactions = getCategoryTransactions(item.categoryId);

              return (
                <View key={index} style={[styles.categoryDetailCard, { backgroundColor: theme.colors.cardBackground }]}>
                  <TouchableOpacity
                    onPress={() => toggleCategoryExpansion(item.categoryId)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.categoryDetailHeader}>
                      <View style={styles.categoryDetailInfo}>
                        <View
                          style={[
                            styles.categoryDetailColorDot,
                            { backgroundColor: category?.color || '#9CA3AF' },
                          ]}
                        />
                        <Text style={[styles.categoryDetailName, { fontSize: 16 * theme.textScale, color: theme.colors.text.primary }]}>
                          {category?.name || 'Unknown'}
                        </Text>
                      </View>
                      <View style={styles.categoryDetailRight}>
                        <Text style={[styles.categoryDetailAmount, { fontSize: 18 * theme.textScale, color: theme.colors.text.primary }]}>
                          {formatCurrency(item.amount)}
                        </Text>
                        {isExpanded ? (
                          <ChevronUp size={20} color={theme.colors.text.secondary} strokeWidth={2} />
                        ) : (
                          <ChevronDown size={20} color={theme.colors.text.secondary} strokeWidth={2} />
                        )}
                      </View>
                    </View>
                    <View style={[styles.categoryDetailBar, { backgroundColor: theme.colors.border }]}>
                      <View
                        style={[
                          styles.categoryDetailBarFill,
                          {
                            width: `${item.percentage}%`,
                            backgroundColor: category?.color || '#9CA3AF',
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.categoryDetailPercentage, { fontSize: 12 * theme.textScale, color: theme.colors.text.secondary }]}>
                      {item.percentage.toFixed(1)}% of total expenses · {categoryTransactions.length} transaction{categoryTransactions.length !== 1 ? 's' : ''}
                    </Text>
                  </TouchableOpacity>

                  {isExpanded && categoryTransactions.length > 0 && (
                    <View style={[styles.transactionsContainer, { borderTopColor: theme.colors.border }]}>
                      {categoryTransactions.map((transaction) => (
                        <TouchableOpacity
                          key={transaction.id}
                          style={[styles.transactionItem, { borderBottomColor: theme.colors.border }]}
                          onPress={() => {
                            router.push({
                              pathname: '/edit-transaction/[id]',
                              params: { id: transaction.id },
                            });
                          }}
                          activeOpacity={0.7}
                        >
                          <View style={styles.transactionInfo}>
                            <Text style={[styles.transactionDescription, { fontSize: 14 * theme.textScale, color: theme.colors.text.primary }]}>
                              {transaction.description || transaction.vendor || 'No description'}
                            </Text>
                            <Text style={[styles.transactionDate, { fontSize: 12 * theme.textScale, color: theme.colors.text.secondary }]}>
                              {new Date(transaction.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}
                              {transaction.vendor && transaction.description && (
                                <Text style={styles.transactionVendor}> · {transaction.vendor}</Text>
                              )}
                            </Text>
                          </View>
                          <Text style={[styles.transactionAmount, { fontSize: 15 * theme.textScale, color: theme.colors.text.primary }]}>
                            {formatCurrency(transaction.amount)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      <Modal
        visible={showDatePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDatePicker(false)}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View style={[styles.pickerModal, { paddingBottom: insets.bottom, backgroundColor: theme.colors.background }]}>
              <View style={styles.pickerHeader}>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(false)}
                  style={styles.pickerHeaderButton}
                >
                  <Text style={[styles.pickerHeaderButtonText, { fontSize: 17 * theme.textScale, color: theme.accent.primary }]}>Cancel</Text>
                </TouchableOpacity>
                <Text style={[styles.pickerTitle, { fontSize: 14 * theme.textScale, color: theme.colors.text.secondary }]}>Select Date</Text>
                <TouchableOpacity
                  onPress={() => {
                    updateSelectedDate(tempMonth, tempYear);
                    setShowDatePicker(false);
                  }}
                  style={styles.pickerHeaderButton}
                >
                  <Text style={[styles.pickerHeaderButtonText, { fontSize: 17 * theme.textScale, color: theme.accent.primary, fontWeight: '600' as const }]}>Done</Text>
                </TouchableOpacity>
              </View>
              <View style={[styles.pickersContainer, { backgroundColor: theme.colors.cardBackground }]}>
                <View style={styles.pickerWrapper}>
                  <Text style={[styles.pickerLabel, { fontSize: 12 * theme.textScale, color: theme.colors.text.secondary }]}>Month</Text>
                  <Picker
                    selectedValue={tempMonth}
                    onValueChange={(value) => setTempMonth(value)}
                    style={styles.picker}
                    itemStyle={styles.pickerItem}
                  >
                    {MONTHS.map((month, index) => (
                      <Picker.Item key={index} label={month} value={index} />
                    ))}
                  </Picker>
                </View>
                <View style={styles.pickerWrapper}>
                  <Text style={[styles.pickerLabel, { fontSize: 12 * theme.textScale, color: theme.colors.text.secondary }]}>Year</Text>
                  <Picker
                    selectedValue={tempYear}
                    onValueChange={(value) => setTempYear(value)}
                    style={styles.picker}
                    itemStyle={styles.pickerItem}
                  >
                    {availableYears.map((year) => (
                      <Picker.Item key={year} label={year.toString()} value={year} />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FC',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
    marginBottom: 20,
  },
  datePickerText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#1F2937',
    flex: 1,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 48,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600' as const,
    marginBottom: 6,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  summaryValueLarge: {
    fontSize: 28,
    fontWeight: '700' as const,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
  },
  pieChartWrapper: {
    width: CHART_SIZE,
    height: CHART_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative' as const,
  },
  pieCenterContent: {
    position: 'absolute' as const,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pieCenterLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  pieCenterValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#1F2937',
  },
  legendContainer: {
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600' as const,
    flex: 1,
  },
  legendPercentage: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600' as const,
    marginRight: 8,
  },
  legendAmount: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '700' as const,
  },
  emptyChartContainer: {
    width: '100%',
    paddingVertical: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  emptyChartText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600' as const,
  },
  categoryDetailCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  categoryDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryDetailInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryDetailRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryDetailColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  categoryDetailName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
    flex: 1,
  },
  categoryDetailAmount: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1F2937',
  },
  categoryDetailBar: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  categoryDetailBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  categoryDetailPercentage: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500' as const,
  },
  emptyState: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600' as const,
    textAlign: 'center' as const,
  },
  netDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 20,
  },
  netRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  netItem: {
    alignItems: 'center',
  },
  transactionsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  transactionInfo: {
    flex: 1,
    marginRight: 12,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500' as const,
  },
  transactionVendor: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#1F2937',
  },
  barChartContainer: {
    width: '100%',
  },
  barChartRow: {
    marginBottom: 16,
  },
  barChartLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  barChartColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  barChartLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#1F2937',
    flex: 1,
  },
  barChartBarContainer: {
    height: 32,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 4,
  },
  barChartBar: {
    height: '100%',
    borderRadius: 8,
    minWidth: 2,
  },
  barChartValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  barChartAmount: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#1F2937',
  },
  barChartPercentage: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerModal: {
    backgroundColor: '#F9F9FB',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: '100%',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F9F9FB',
    borderBottomWidth: 0.5,
    borderBottomColor: '#C6C6C8',
  },
  pickerHeaderButton: {
    padding: 4,
    minWidth: 60,
  },
  pickerHeaderButtonText: {
    fontSize: 17,
    color: '#6366F1',
  },
  pickerTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  pickersContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
  },
  pickerWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#6B7280',
    marginTop: 12,
    marginBottom: 4,
  },
  picker: {
    width: '100%',
    height: 200,
  },
  pickerItem: {
    fontSize: 20,
    height: 200,
    color: '#1F2937',
  },
});
