import { useState } from 'react';
import type { Reward } from '../../api/types';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { Skeleton } from '../../components/Skeleton';
import { formatPoints } from '../../lib/format';
import { useAccount } from '../dashboard/useAccount';
import { RedeemDialog } from './RedeemDialog';
import { useRewards } from './useRewards';

export function RewardsPage() {
  const rewards = useRewards();
  const account = useAccount();
  const [selected, setSelected] = useState<Reward | null>(null);

  if (rewards.isPending) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index}>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="mt-3 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-2/3" />
            <Skeleton className="mt-6 h-9 w-24" />
          </Card>
        ))}
      </div>
    );
  }

  if (rewards.isError) {
    return (
      <ErrorState
        message="We couldn't load the reward catalog."
        onRetry={() => void rewards.refetch()}
      />
    );
  }

  if (rewards.data.length === 0) {
    return (
      <EmptyState title="No rewards available" description="Check back soon for new rewards." />
    );
  }

  const balance = account.data?.points_balance ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Rewards</h1>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          Balance: <span className="font-semibold">{formatPoints(balance)}</span> points
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rewards.data.map((reward) => {
          const outOfStock = reward.stock !== null && reward.stock <= 0;
          const canAfford = balance >= reward.cost_points;

          return (
            <Card key={reward.id} className="flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {reward.name}
                </h2>
                {reward.stock !== null && (
                  <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {outOfStock ? 'Out of stock' : `${reward.stock} left`}
                  </span>
                )}
              </div>
              <p className="mt-2 flex-1 text-sm text-slate-500 dark:text-slate-400">
                {reward.description ?? 'No description.'}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                  {formatPoints(reward.cost_points)} pts
                </span>
                <Button
                  size="sm"
                  disabled={outOfStock || !account.data}
                  onClick={() => setSelected(reward)}
                  title={!canAfford ? 'You may not have enough points yet' : undefined}
                >
                  Redeem
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {selected && account.data && (
        <RedeemDialog
          reward={selected}
          balance={account.data.points_balance}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
