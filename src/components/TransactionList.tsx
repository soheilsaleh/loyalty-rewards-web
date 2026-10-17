import type { PointTransaction } from '../api/types';
import { formatDate, formatPoints } from '../lib/format';

function tone(points: number): string {
  if (points > 0) return 'text-emerald-600 dark:text-emerald-400';
  if (points < 0) return 'text-red-600 dark:text-red-400';
  return 'text-slate-500 dark:text-slate-400';
}

function sign(points: number): string {
  return points > 0 ? `+${formatPoints(points)}` : formatPoints(points);
}

export function TransactionList({ items }: { items: PointTransaction[] }) {
  return (
    <ul className="divide-y divide-slate-100 dark:divide-slate-800">
      {items.map((transaction) => (
        <li key={transaction.id} className="flex items-center justify-between gap-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
              {transaction.label}
            </p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              {transaction.description ?? transaction.type} · {formatDate(transaction.created_at)}
            </p>
          </div>
          <div className="text-right">
            <p className={`text-sm font-semibold ${tone(transaction.points)}`}>
              {sign(transaction.points)}
            </p>
            <p className="text-xs text-slate-400">
              balance {formatPoints(transaction.balance_after)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
