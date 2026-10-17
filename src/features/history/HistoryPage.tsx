import { useMemo, useState } from 'react';
import type { TransactionType } from '../../api/types';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { Skeleton } from '../../components/Skeleton';
import { TransactionList } from '../../components/TransactionList';
import { useHistory } from './useHistory';

type Filter = TransactionType | 'all';

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'earn', label: 'Earned' },
  { value: 'redeem', label: 'Redeemed' },
  { value: 'expire', label: 'Expired' },
  { value: 'adjust', label: 'Adjusted' },
];

export function HistoryPage() {
  const history = useHistory();
  const [filter, setFilter] = useState<Filter>('all');

  const items = useMemo(() => {
    const all = history.data?.pages.flatMap((page) => page.data) ?? [];
    return filter === 'all' ? all : all.filter((item) => item.type === filter);
  }, [history.data, filter]);

  if (history.isPending) {
    return (
      <Card>
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  if (history.isError) {
    return (
      <ErrorState message="We couldn't load your history." onRetry={() => void history.refetch()} />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setFilter(option.value)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition ${
              filter === option.value
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <Card>
        {items.length === 0 ? (
          <EmptyState
            title={filter === 'all' ? 'No transactions yet' : `No ${filter} transactions`}
            description={
              filter === 'all' ? 'Your points history will appear here.' : 'Try a different filter.'
            }
          />
        ) : (
          <TransactionList items={items} />
        )}

        <div className="mt-4 flex justify-center">
          {history.hasNextPage ? (
            <Button
              variant="secondary"
              loading={history.isFetchingNextPage}
              onClick={() => void history.fetchNextPage()}
            >
              Load more
            </Button>
          ) : (
            items.length > 0 && (
              <span className="text-xs text-slate-400">You have reached the end.</span>
            )
          )}
        </div>
      </Card>

      <p className="text-center text-xs text-slate-400">
        Filters apply to the entries loaded so far.
      </p>
    </div>
  );
}
