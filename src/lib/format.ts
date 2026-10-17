const numberFormatter = new Intl.NumberFormat('en-US');
const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'EUR',
});
const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

export function formatPoints(points: number): string {
  return numberFormatter.format(points);
}

export function formatCurrency(cents: number, currency = 'EUR'): string {
  const formatter =
    currency === 'EUR'
      ? currencyFormatter
      : new Intl.NumberFormat('en-US', { style: 'currency', currency });
  return formatter.format(cents / 100);
}

export function formatDate(value: string | null | undefined): string {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : dateFormatter.format(date);
}
