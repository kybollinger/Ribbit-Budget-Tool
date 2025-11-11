export interface DemoTransaction {
  id: string;
  merchant: string;
  amount: number;
  category: string;
  date: string;
  icon: string;
  pending: boolean;
}

export const DEMO_TRANSACTIONS: DemoTransaction[] = [
  {
    id: '1',
    merchant: 'Starbucks Coffee',
    amount: 5.75,
    category: 'Food & Dining',
    date: new Date().toISOString(),
    icon: 'utensils',
    pending: true,
  },
  {
    id: '2',
    merchant: 'Shell Gas Station',
    amount: 48.32,
    category: 'Transportation',
    date: new Date(Date.now() - 86400000).toISOString(),
    icon: 'fuel',
    pending: true,
  },
  {
    id: '3',
    merchant: 'Amazon.com',
    amount: 89.99,
    category: 'Shopping',
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    icon: 'shopping-cart',
    pending: true,
  },
  {
    id: '4',
    merchant: 'Netflix',
    amount: 15.99,
    category: 'Entertainment',
    date: new Date(Date.now() - 86400000 * 3).toISOString(),
    icon: 'tv',
    pending: false,
  },
  {
    id: '5',
    merchant: 'Whole Foods Market',
    amount: 127.45,
    category: 'Groceries',
    date: new Date(Date.now() - 86400000 * 4).toISOString(),
    icon: 'shopping-cart',
    pending: false,
  },
  {
    id: '6',
    merchant: 'LA Fitness',
    amount: 49.99,
    category: 'Health & Fitness',
    date: new Date(Date.now() - 86400000 * 5).toISOString(),
    icon: 'zap',
    pending: false,
  },
  {
    id: '7',
    merchant: 'Target',
    amount: 63.28,
    category: 'Shopping',
    date: new Date(Date.now() - 86400000 * 6).toISOString(),
    icon: 'shopping-cart',
    pending: false,
  },
  {
    id: '8',
    merchant: 'Uber',
    amount: 18.45,
    category: 'Transportation',
    date: new Date(Date.now() - 86400000 * 7).toISOString(),
    icon: 'fuel',
    pending: false,
  },
];
