import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Transaction, Category, CategoryWithTotal } from '@/types/budget';
import { DEFAULT_CATEGORIES } from '@/constants/defaultCategories';

const STORAGE_KEY_TRANSACTIONS = '@flow_transactions';
const STORAGE_KEY_CATEGORIES = '@flow_categories';
const STORAGE_KEY_LAST_CHECK = '@flow_last_recurring_check';

export const [BudgetProvider, useBudget] = createContextHook(() => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const transactionsQuery = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY_TRANSACTIONS);
        console.log('Loaded transactions from storage:', stored ? `${stored.length} chars` : 'null');
        
        if (!stored || stored === 'undefined' || stored === 'null') {
          console.log('No valid transactions data found, returning empty array');
          return [];
        }
        
        const trimmed = stored.trim();
        if (trimmed === '' || trimmed.startsWith('[object') || (!trimmed.startsWith('[') && !trimmed.startsWith('{'))) {
          console.error('Invalid JSON format detected, resetting');
          await AsyncStorage.removeItem(STORAGE_KEY_TRANSACTIONS);
          return [];
        }
        
        let parsed;
        try {
          parsed = JSON.parse(trimmed);
        } catch (jsonError) {
          console.error('JSON parse failed:', jsonError);
          console.error('Stored value preview:', trimmed.substring(0, 100));
          await AsyncStorage.removeItem(STORAGE_KEY_TRANSACTIONS);
          return [];
        }
        
        if (!Array.isArray(parsed)) {
          console.error('Invalid transactions data format (not an array), resetting');
          await AsyncStorage.removeItem(STORAGE_KEY_TRANSACTIONS);
          return [];
        }
        
        console.log('Successfully loaded transactions:', parsed.length);
        return parsed;
      } catch (error) {
        console.error('Error loading transactions:', error);
        console.error('This usually means corrupted data in AsyncStorage');
        await AsyncStorage.removeItem(STORAGE_KEY_TRANSACTIONS);
        return [];
      }
    },
  });

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY_CATEGORIES);
        console.log('Loaded categories from storage:', stored ? `${stored.length} chars` : 'null');
        
        if (!stored || stored === 'undefined' || stored === 'null') {
          console.log('No valid categories data found, using defaults');
          return DEFAULT_CATEGORIES;
        }
        
        const trimmed = stored.trim();
        if (trimmed === '' || trimmed.startsWith('[object') || (!trimmed.startsWith('[') && !trimmed.startsWith('{'))) {
          console.error('Invalid JSON format detected, resetting to defaults');
          await AsyncStorage.removeItem(STORAGE_KEY_CATEGORIES);
          return DEFAULT_CATEGORIES;
        }
        
        let parsed;
        try {
          parsed = JSON.parse(trimmed);
        } catch (jsonError) {
          console.error('JSON parse failed:', jsonError);
          console.error('Stored value preview:', trimmed.substring(0, 100));
          await AsyncStorage.removeItem(STORAGE_KEY_CATEGORIES);
          return DEFAULT_CATEGORIES;
        }
        
        if (!Array.isArray(parsed)) {
          console.error('Invalid categories data format (not an array), resetting to defaults');
          await AsyncStorage.removeItem(STORAGE_KEY_CATEGORIES);
          return DEFAULT_CATEGORIES;
        }
        
        console.log('Successfully loaded categories:', parsed.length);
        return parsed;
      } catch (error) {
        console.error('Error loading categories:', error);
        console.error('This usually means corrupted data in AsyncStorage');
        await AsyncStorage.removeItem(STORAGE_KEY_CATEGORIES);
        return DEFAULT_CATEGORIES;
      }
    },
  });

  useEffect(() => {
    if (transactionsQuery.data) {
      setTransactions(transactionsQuery.data);
    }
  }, [transactionsQuery.data]);

  useEffect(() => {
    if (categoriesQuery.data) {
      setCategories(categoriesQuery.data);
    }
  }, [categoriesQuery.data]);

  const processRecurringTransactions = useCallback(async () => {
    const lastCheck = await AsyncStorage.getItem(STORAGE_KEY_LAST_CHECK);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastCheckDate = lastCheck ? new Date(lastCheck) : new Date(0);
    lastCheckDate.setHours(0, 0, 0, 0);

    if (lastCheckDate >= today) {
      return;
    }

    console.log('Processing recurring transactions...');
    
    const recurringTransactions = transactions.filter((t) => t.recurring?.enabled && t.recurring.nextDate);
    let hasChanges = false;
    
    const updatedTransactions = [...transactions];
    
    for (const recurringTx of recurringTransactions) {
      const nextDate = new Date(recurringTx.recurring!.nextDate!);
      nextDate.setHours(0, 0, 0, 0);
      
      if (nextDate <= today) {
        console.log(`Creating transaction for recurring: ${recurringTx.description || 'Unnamed'}`);
        
        const newTransaction: Transaction = {
          id: Date.now().toString() + Math.random().toString(36).substring(7),
          type: recurringTx.type,
          categoryId: recurringTx.categoryId,
          amount: recurringTx.amount,
          description: recurringTx.description,
          vendor: recurringTx.vendor,
          notes: recurringTx.notes,
          date: nextDate.toISOString(),
          createdAt: new Date().toISOString(),
        };
        
        updatedTransactions.push(newTransaction);
        
        let newNextDate = new Date(nextDate);
        switch (recurringTx.recurring!.frequency) {
          case 'weekly':
            newNextDate.setDate(newNextDate.getDate() + 7);
            break;
          case 'biweekly':
            newNextDate.setDate(newNextDate.getDate() + 14);
            break;
          case 'monthly':
            newNextDate.setMonth(newNextDate.getMonth() + 1);
            break;
        }
        
        const recurringIndex = updatedTransactions.findIndex(t => t.id === recurringTx.id);
        if (recurringIndex !== -1) {
          updatedTransactions[recurringIndex] = {
            ...recurringTx,
            recurring: {
              ...recurringTx.recurring!,
              nextDate: newNextDate.toISOString(),
            },
          };
        }
        
        hasChanges = true;
      }
    }
    
    if (hasChanges) {
      console.log('Saving updated transactions after processing recurring...');
      await AsyncStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(updatedTransactions));
      setTransactions(updatedTransactions);
    }
    
    await AsyncStorage.setItem(STORAGE_KEY_LAST_CHECK, today.toISOString());
  }, [transactions]);

  useEffect(() => {
    if (transactions.length > 0) {
      processRecurringTransactions();
    }
  }, [processRecurringTransactions]);

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    setTransactions((prevTransactions) => {
      const newTransaction: Transaction = {
        ...transaction,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      const updated = [...prevTransactions, newTransaction];
      AsyncStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(updated)).catch(err => 
        console.error('Failed to save transactions:', err)
      );
      return updated;
    });
  }, []);

  const updateTransaction = useCallback((id: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => {
    setTransactions((prevTransactions) => {
      const updated = prevTransactions.map((t) => 
        t.id === id ? { ...t, ...updates } : t
      );
      AsyncStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(updated)).catch(err => 
        console.error('Failed to save transactions:', err)
      );
      return updated;
    });
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prevTransactions) => {
      const updated = prevTransactions.filter((t) => t.id !== id);
      AsyncStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(updated)).catch(err => 
        console.error('Failed to save transactions:', err)
      );
      return updated;
    });
  }, []);

  const categoriesWithTotals: CategoryWithTotal[] = useMemo(() => {
    return categories
      .filter((category) => category.isActive)
      .map((category) => {
        const categoryTransactions = transactions.filter(
          (t) => t.categoryId === category.id && t.type === 'expense' && !t.recurring?.enabled
        );
        const total = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
        return {
          ...category,
          total,
          transactionCount: categoryTransactions.length,
        };
      });
  }, [categories, transactions]);

  const totalExpenses = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'expense' && !t.recurring?.enabled)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const totalIncome = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'income' && !t.recurring?.enabled)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const netBalance = useMemo(() => {
    return totalIncome - totalExpenses;
  }, [totalIncome, totalExpenses]);

  const getTransactionsByCategory = useCallback((categoryId: string) => {
    return transactions
      .filter((t) => t.categoryId === categoryId && t.type === 'expense' && !t.recurring?.enabled)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions]);

  const getTransactionsByMonth = useCallback((month: number, year: number) => {
    return transactions.filter((t) => {
      if (t.recurring?.enabled) {
        return false;
      }
      const date = new Date(t.date);
      return date.getMonth() === month && date.getFullYear() === year;
    });
  }, [transactions]);

  const getCategorySpendingForMonth = useCallback((categoryId: string, month: number, year: number) => {
    return transactions
      .filter((t) => {
        if (t.recurring?.enabled) {
          return false;
        }
        const date = new Date(t.date);
        return (
          t.categoryId === categoryId &&
          t.type === 'expense' &&
          date.getMonth() === month &&
          date.getFullYear() === year
        );
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const validateCategoryName = useCallback((name: string, type: 'income' | 'expense', excludeId?: string) => {
    const trimmedName = name.trim().toLowerCase();
    return !categories.some(
      (c) => c.name.toLowerCase() === trimmedName && c.type === type && c.id !== excludeId
    );
  }, [categories]);

  const getCategoryTransactionCount = useCallback((categoryId: string) => {
    return transactions.filter((t) => t.categoryId === categoryId).length;
  }, [transactions]);

  const addCategory = useCallback((category: Omit<Category, 'id' | 'order' | 'isActive'>) => {
    const trimmedName = category.name.trim();
    if (!trimmedName) {
      throw new Error('Category name is required');
    }

    setCategories((prevCategories) => {
      const trimmedNameLower = trimmedName.toLowerCase();
      const nameExists = prevCategories.some(
        (c) => c.name.toLowerCase() === trimmedNameLower && c.type === category.type
      );
      if (nameExists) {
        throw new Error(`A ${category.type} category with this name already exists`);
      }

      const newCategory: Category = {
        ...category,
        name: trimmedName,
        id: Date.now().toString(),
        order: prevCategories.length,
        isActive: true,
      };
      const updated = [...prevCategories, newCategory];
      AsyncStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(updated)).catch(err => 
        console.error('Failed to save categories:', err)
      );
      return updated;
    });
  }, []);

  const updateCategory = useCallback((id: string, updates: Partial<Category>) => {
    if (updates.name !== undefined && updates.name.trim() === '') {
      throw new Error('Category name is required');
    }

    setCategories((prevCategories) => {
      const category = prevCategories.find((c) => c.id === id);
      if (!category) {
        throw new Error('Category not found');
      }

      if (updates.name) {
        const trimmedName = updates.name.trim().toLowerCase();
        const nameExists = prevCategories.some(
          (c) => c.name.toLowerCase() === trimmedName && c.type === category.type && c.id !== id
        );
        if (nameExists) {
          throw new Error(`A ${category.type} category with this name already exists`);
        }
      }

      const updated = prevCategories.map((c) => 
        c.id === id ? { ...c, ...updates, name: updates.name?.trim() || c.name } : c
      );
      AsyncStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(updated)).catch(err => 
        console.error('Failed to save categories:', err)
      );
      return updated;
    });
  }, []);

  const archiveCategory = useCallback((id: string) => {
    setCategories((prevCategories) => {
      const updated = prevCategories.map((c) => 
        c.id === id ? { ...c, isActive: false } : c
      );
      AsyncStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(updated)).catch(err => 
        console.error('Failed to save categories:', err)
      );
      return updated;
    });
  }, []);

  const deleteCategory = useCallback((id: string) => {
    const transactionCount = getCategoryTransactionCount(id);
    if (transactionCount > 0) {
      throw new Error('Cannot delete category with transactions. Archive it instead.');
    }

    setCategories((prevCategories) => {
      const updated = prevCategories.filter((c) => c.id !== id);
      AsyncStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(updated)).catch(err => 
        console.error('Failed to save categories:', err)
      );
      return updated;
    });
  }, [getCategoryTransactionCount]);

  const getRecurringTransactions = useCallback(() => {
    return transactions
      .filter((t) => t.recurring?.enabled)
      .sort((a, b) => {
        const dateA = a.recurring?.nextDate ? new Date(a.recurring.nextDate).getTime() : 0;
        const dateB = b.recurring?.nextDate ? new Date(b.recurring.nextDate).getTime() : 0;
        return dateA - dateB;
      });
  }, [transactions]);

  return {
    transactions,
    categories,
    categoriesWithTotals,
    totalExpenses,
    totalIncome,
    netBalance,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionsByCategory,
    getTransactionsByMonth,
    getCategorySpendingForMonth,
    addCategory,
    updateCategory,
    deleteCategory,
    archiveCategory,
    validateCategoryName,
    getCategoryTransactionCount,
    getRecurringTransactions,
    isLoading: transactionsQuery.isLoading || categoriesQuery.isLoading,
  };
});
