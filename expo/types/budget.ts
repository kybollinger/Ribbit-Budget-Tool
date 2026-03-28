export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  categoryId: string;
  amount: number;
  description?: string;
  vendor?: string;
  notes?: string;
  date: string;
  createdAt: string;
  recurring?: {
    frequency: 'weekly' | 'biweekly' | 'monthly';
    enabled: boolean;
    nextDate?: string;
  };
}

export interface Category {
  id: string;
  name: string;
  color?: string;
  icon: string;
  order: number;
  type: 'income' | 'expense';
  goal?: number;
  isActive: boolean;
}

export interface CategoryWithTotal extends Category {
  total: number;
  transactionCount: number;
}
