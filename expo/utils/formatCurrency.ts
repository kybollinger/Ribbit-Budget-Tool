export function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatMonthYear(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

export function formatInputNumber(value: string): string {
  const numericValue = value.replace(/[^0-9.]/g, '');
  const parts = numericValue.split('.');
  
  if (parts[0]) {
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  
  return parts.length > 1 ? `${parts[0]}.${parts[1]}` : parts[0];
}

export function parseInputNumber(value: string): string {
  return value.replace(/,/g, '');
}
