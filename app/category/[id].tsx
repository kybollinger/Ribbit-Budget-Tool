import { useBudget } from '@/contexts/BudgetContext';
import { useAppearance } from '@/contexts/AppearanceContext';
import { formatCurrency } from '@/utils/formatCurrency';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Trash2, Plus, Edit3 } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
  Alert,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';

interface SwipeableItemProps {
  transaction: {
    id: string;
    amount: number;
    description?: string;
    vendor?: string;
    date: string;
  };
  onDelete: () => void;
}

const SwipeableItem: React.FC<SwipeableItemProps> = ({
  transaction,
  onDelete,
}) => {
  const [translateX] = useState(new Animated.Value(0));

  const handleSwipe = (direction: 'left' | 'right') => {
    Animated.timing(translateX, {
      toValue: direction === 'left' ? -80 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleDelete = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    Alert.alert('Delete Transaction', 'Are you sure you want to delete this?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: onDelete,
      },
    ]);
  };

  const { theme } = useAppearance();
  const date = new Date(transaction.date);
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <View style={styles.swipeContainer}>
      <View style={styles.deleteBackground}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          activeOpacity={0.7}
        >
          <Trash2 size={20} color="#fff" strokeWidth={2} />
        </TouchableOpacity>
      </View>
      <Animated.View
        style={[
          styles.transactionItem,
          { transform: [{ translateX }], backgroundColor: theme.colors.cardBackground },
        ]}
      >
        <TouchableOpacity
          style={styles.transactionContent}
          onLongPress={() => handleSwipe('left')}
          onPress={() => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            router.push({
              pathname: '/edit-transaction/[id]',
              params: { id: transaction.id },
            });
          }}
          activeOpacity={0.7}
        >
          <View style={styles.transactionInfo}>
            <Text style={[styles.transactionDescription, { color: theme.colors.text.primary }]}>
              {transaction.description || 'No description'}
            </Text>
            {transaction.vendor && (
              <Text style={[styles.transactionVendor, { color: theme.colors.text.secondary }]}>{transaction.vendor}</Text>
            )}
            <Text style={[styles.transactionDate, { color: theme.colors.text.tertiary }]}>{formattedDate}</Text>
          </View>
          <Text style={[styles.transactionAmount, { color: theme.colors.text.primary }]}>
            {formatCurrency(transaction.amount)}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default function CategoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { categories, getTransactionsByCategory, deleteTransaction } =
    useBudget();
  const { theme } = useAppearance();
  const insets = useSafeAreaInsets();

  const category = categories.find((c) => c.id === id);
  const transactions = getTransactionsByCategory(id);

  if (!category) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.text.secondary }]}>Category not found</Text>
      </View>
    );
  }

  const total = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen
        options={{
          title: category.name,
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerTintColor: theme.colors.text.primary,
          headerShadowVisible: false,
          headerBackTitle: 'Back',
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
              onPress={() => {
                router.push({
                  pathname: '/edit-category/[id]',
                  params: { id: category.id },
                });
              }}
              style={styles.editButton}
            >
              <Edit3 size={20} color={theme.accent.primary} strokeWidth={2} />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={[styles.summaryCard, { backgroundColor: theme.colors.cardBackground }]}>
        <View
          style={[
            styles.categoryColorBar,
            { backgroundColor: category.color },
          ]}
        />
        <View style={styles.summaryContent}>
          <Text style={[styles.summaryLabel, { color: theme.colors.text.secondary }]}>Total Spent</Text>
          <Text style={[styles.summaryAmount, { color: theme.colors.text.primary }]}>{formatCurrency(total)}</Text>
          <Text style={[styles.summaryCount, { color: theme.colors.text.tertiary }]}>
            {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {transactions.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyStateTitle, { color: theme.colors.text.primary }]}>No transactions yet</Text>
          <Text style={[styles.emptyStateText, { color: theme.colors.text.secondary }]}>
            Tap the + button to add your first expense
          </Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SwipeableItem
              transaction={item}
              onDelete={() => deleteTransaction(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity
        style={[styles.fab, { bottom: 32 + insets.bottom, backgroundColor: category.color, shadowColor: category.color }]}
        onPress={() =>
          router.push({
            pathname: '/add-expense',
            params: { type: 'expense', categoryId: category.id },
          })
        }
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
  editButton: {
    padding: 8,
    marginRight: -8,
  },
  summaryCard: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryColorBar: {
    height: 4,
  },
  summaryContent: {
    padding: 24,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#6B7280',
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 36,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginBottom: 4,
  },
  summaryCount: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500' as const,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  swipeContainer: {
    marginBottom: 12,
    position: 'relative',
  },
  deleteBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    backgroundColor: '#EF4444',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    width: 80,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  transactionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  transactionInfo: {
    flex: 1,
    gap: 4,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
  },
  transactionVendor: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500' as const,
  },
  transactionDate: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500' as const,
  },
  transactionAmount: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginLeft: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
});
