import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { Skeleton } from '../../components/Skeleton';
import { TransactionList } from '../../components/TransactionList';
import { formatPoints } from '../../lib/format';
import { TierProgress } from './TierProgress';
import { useAccount } from './useAccount';
import { useRecentTransactions } from './useRecentTransactions';

export function DashboardPage() {
  const account = useAccount();
  const transactions = useRecentTransactions(10);

  if (account.isPending) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-4 h-10 w-40" />
          </Card>
          <Card>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-4 h-3 w-full" />
            <Skeleton className="mt-2 h-3 w-2/3" />
          </Card>
        </div>
        <Card>
          <Skeleton className="h-4 w-40" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (account.isError) {
    return (
      <ErrorState message="We couldn't load your account." onRetry={() => void account.refetch()} />
    );
  }

  const data = account.data;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Points balance</p>
          <p className="mt-2 text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {formatPoints(data.points_balance)}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {data.currency} · {data.name ?? 'your account'}
          </p>
        </Card>

        <Card>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Membership</p>
          <div className="mt-4">
            <TierProgress lifetimePoints={data.lifetime_points} />
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Recent activity
          </h2>
          <span className="text-xs text-slate-400">Last 10 transactions</span>
        </div>

        <div className="mt-4">
          {transactions.isPending && (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          )}

          {transactions.isError && (
            <ErrorState
              message="We couldn't load your transactions."
              onRetry={() => void transactions.refetch()}
            />
          )}

          {transactions.isSuccess && transactions.data.length === 0 && (
            <EmptyState
              title="No activity yet"
              description="Your points history will appear here once you earn or redeem."
            />
          )}

          {transactions.isSuccess && transactions.data.length > 0 && (
            <TransactionList items={transactions.data} />
          )}
        </div>
      </Card>
    </div>
  );
}
