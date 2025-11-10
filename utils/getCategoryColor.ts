import { Category } from '@/types/budget';

export function getCategoryColor(category: Category | { color?: string }, accentColor: string): string {
  return category.color || accentColor;
}
