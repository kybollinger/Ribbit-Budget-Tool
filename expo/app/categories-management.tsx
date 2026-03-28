import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { useBudget } from '@/contexts/BudgetContext';
import { useAppearance } from '@/contexts/AppearanceContext';
import { Plus, Edit2, Trash2, FolderOpen, Search } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatCurrency } from '@/utils/formatCurrency';
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

export default function CategoriesManagementScreen() {
  const insets = useSafeAreaInsets();
  const { categories, deleteCategory, archiveCategory, getCategoryTransactionCount } = useBudget();
  const { theme } = useAppearance();
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredCategories = categories.filter((category) => {
    const matchesSearch = category.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch && category.isActive;
  });

  const expenseCategories = filteredCategories.filter((c) => c.type === 'expense');
  const incomeCategories = filteredCategories.filter((c) => c.type === 'income');

  const handleDelete = (id: string, name: string) => {
    const transactionCount = getCategoryTransactionCount(id);

    if (transactionCount > 0) {
      Alert.alert(
        'Archive Category',
        `"${name}" has ${transactionCount} transaction${transactionCount !== 1 ? 's' : ''}. Would you like to archive it instead? Archived categories are hidden but transactions remain in your history.`,
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
            },
          },
        ]
      );
    } else {
      Alert.alert(
        'Delete Category',
        `Are you sure you want to delete "${name}"?`,
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
              } catch (error) {
                Alert.alert('Error', error instanceof Error ? error.message : 'Failed to delete category');
              }
            },
          },
        ]
      );
    }
  };

  const renderCategory = (category: any) => {
    const IconComponent = ICON_MAP[category.icon] || MoreHorizontal;
    const transactionCount = getCategoryTransactionCount(category.id);
    const categoryColor = getCategoryColor(category, theme.accent.primary);

    return (
      <View key={category.id} style={[styles.categoryCard, { backgroundColor: theme.colors.cardBackground }]}>
        <TouchableOpacity
          style={styles.categoryContent}
          onPress={() => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            router.push(`/category/${category.id}`);
          }}
          activeOpacity={0.7}
        >
          <View style={styles.categoryInfo}>
            <View style={[styles.iconContainer, { backgroundColor: categoryColor + '20' }]}>
              <IconComponent
                size={20}
                color={categoryColor}
                strokeWidth={2}
              />
            </View>
            <View style={styles.categoryDetails}>
              <Text style={[styles.categoryName, { color: theme.colors.text.primary }]}>{category.name}</Text>
              <View style={styles.categoryMeta}>
                <Text style={[styles.categoryMetaText, { color: theme.colors.text.secondary }]}>
                  {transactionCount} transaction{transactionCount !== 1 ? 's' : ''}
                </Text>
                {category.goal && (
                  <>
                    <Text style={[styles.categoryDot, { color: theme.colors.text.tertiary }]}>•</Text>
                    <Text style={[styles.categoryMetaText, { color: theme.colors.text.secondary }]}>
                      Goal: {formatCurrency(category.goal)}
                    </Text>
                  </>
                )}
              </View>
            </View>
          </View>
        </TouchableOpacity>
        <View style={styles.categoryActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: categoryColor + '20' }]}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              router.push(`/edit-category/${category.id}`);
            }}
            activeOpacity={0.7}
          >
            <Edit2 size={16} color={categoryColor} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.error + '20' }]}
            onPress={() => handleDelete(category.id, category.name)}
            activeOpacity={0.7}
          >
            <Trash2 size={16} color={theme.colors.error} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

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
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>Categories</Text>
          <TouchableOpacity
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              router.push('/add-category');
            }}
            style={styles.addButton}
          >
            <Plus size={24} color={theme.accent.primary} strokeWidth={2} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.headerSubtitle, { color: theme.colors.text.secondary }]}>Manage your spending categories</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.searchContainer}>
          <View style={[styles.searchInputContainer, { backgroundColor: theme.colors.cardBackground }]}>
            <Search size={20} color={theme.colors.text.tertiary} strokeWidth={2} />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.text.primary }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search categories..."
              placeholderTextColor={theme.colors.text.tertiary}
            />
          </View>
        </View>

        {filteredCategories.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconContainer, { backgroundColor: theme.colors.border }]}>
              <FolderOpen size={48} color={theme.colors.text.tertiary} strokeWidth={2} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.colors.text.primary }]}>
              {searchQuery ? 'No categories found' : 'No Categories'}
            </Text>
            <Text style={[styles.emptyDescription, { color: theme.colors.text.secondary }]}>
              {searchQuery
                ? 'Try a different search term'
                : 'Create your first category to start tracking expenses'}
            </Text>
            {!searchQuery && (
              <TouchableOpacity
                style={[styles.emptyButton, { backgroundColor: theme.accent.primary }]}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  router.push('/add-category');
                }}
                activeOpacity={0.7}
              >
                <Plus size={20} color="#fff" strokeWidth={2} />
                <Text style={styles.emptyButtonText}>Add Category</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <>
            {expenseCategories.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text.secondary }]}>Expense Categories</Text>
                <View style={styles.categoriesList}>
                  {expenseCategories.map(renderCategory)}
                </View>
              </View>
            )}

            {incomeCategories.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text.secondary }]}>Income Categories</Text>
                <View style={styles.categoriesList}>
                  {incomeCategories.map(renderCategory)}
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
    backgroundColor: '#F8F9FC',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: '#F8F9FC',
  },
  backButton: {
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#6366F1',
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
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#6B7280',
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
  searchContainer: {
    marginBottom: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    padding: 0,
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
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
    marginBottom: 32,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#6366F1',
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
    color: '#6B7280',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  categoriesList: {
    gap: 12,
  },
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryContent: {
    flex: 1,
    marginRight: 12,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 4,
  },
  categoryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryMetaText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500' as const,
  },
  categoryDot: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  categoryActions: {
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
