import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DemoTransaction } from '@/mocks/demoTransactions';
import { useAppearance } from '@/contexts/AppearanceContext';
import { ShoppingCart, Fuel, Utensils, Tv, Zap, MoreHorizontal } from 'lucide-react-native';
import { formatCurrency } from '@/utils/formatCurrency';

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  'shopping-cart': ShoppingCart,
  fuel: Fuel,
  utensils: Utensils,
  tv: Tv,
  zap: Zap,
  'more-horizontal': MoreHorizontal,
};

interface TransactionCardProps {
  transaction: DemoTransaction;
}

export default function TransactionCard({ transaction }: TransactionCardProps) {
  const { theme } = useAppearance();
  const IconComponent = ICON_MAP[transaction.icon] || MoreHorizontal;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.cardBackground, shadowColor: theme.accent.primary }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: theme.accent.primaryLight }]}>
          <IconComponent size={28} color={theme.accent.primary} strokeWidth={2.5} />
        </View>
        {transaction.pending && (
          <View style={[styles.pendingBadge, { backgroundColor: '#FEF3C7' }]}>
            <Text style={[styles.pendingText, { fontSize: 11 * theme.textScale }]}>Pending</Text>
          </View>
        )}
      </View>

      <View style={styles.cardContent}>
        <Text style={[styles.merchant, { fontSize: 22 * theme.textScale, color: theme.colors.text.primary }]}>
          {transaction.merchant}
        </Text>
        <Text style={[styles.category, { fontSize: 14 * theme.textScale, color: theme.colors.text.secondary }]}>
          {transaction.category}
        </Text>
      </View>

      <View style={styles.cardFooter}>
        <Text style={[styles.amount, { fontSize: 36 * theme.textScale, color: theme.colors.text.primary }]}>
          -{formatCurrency(transaction.amount)}
        </Text>
        <Text style={[styles.date, { fontSize: 13 * theme.textScale, color: theme.colors.text.tertiary }]}>
          {formatDate(transaction.date)}
        </Text>
      </View>

      <View style={[styles.categoryStrip, { backgroundColor: theme.accent.primary }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    padding: 24,
    justifyContent: 'space-between',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
  },
  pendingText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#92400E',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardContent: {
    gap: 6,
    flex: 1,
    justifyContent: 'center',
    marginVertical: 16,
  },
  merchant: {
    fontSize: 22,
    fontWeight: '700' as const,
    lineHeight: 28,
  },
  category: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginTop: 2,
  },
  cardFooter: {
    gap: 8,
  },
  amount: {
    fontSize: 36,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
  },
  date: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  categoryStrip: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 6,
  },
});
