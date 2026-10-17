import { useState } from 'react';
import { ApiError } from '../../api/client';
import type { Redemption, Reward } from '../../api/types';
import { Button } from '../../components/Button';
import { formatPoints } from '../../lib/format';
import { useRedeem } from './useRedeem';

function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 422)
      return error.message || 'You do not have enough points for this reward.';
    if (error.status === 409) return error.message || 'This request conflicts with an earlier one.';
    if (error.status === 429) return 'Too many requests. Please wait a moment and try again.';
    return error.message;
  }
  return 'Network error. Please check your connection and try again.';
}

export function RedeemDialog({
  reward,
  balance,
  onClose,
}: {
  reward: Reward;
  balance: number;
  onClose: () => void;
}) {
  const redeem = useRedeem();
  const [result, setResult] = useState<Redemption | null>(null);

  const balanceAfter = balance - reward.cost_points;
  const affordable = balanceAfter >= 0;

  function close() {
    redeem.reset();
    onClose();
  }

  function confirm() {
    redeem.mutate(reward.id, {
      onSuccess: (response) => setResult(response.data),
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onClick={close}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Redeem ${reward.name}`}
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900"
        onClick={(event) => event.stopPropagation()}
      >
        {result ? (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-2xl dark:bg-emerald-950">
              ✓
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Redeemed!</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              You spent <span className="font-semibold">{formatPoints(result.points_spent)}</span>{' '}
              points on <span className="font-semibold">{reward.name}</span>.
            </p>
            <Button className="w-full" onClick={close}>
              Done
            </Button>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Redeem {reward.name}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {reward.description ?? 'Confirm to spend your points.'}
            </p>

            <dl className="mt-4 space-y-2 rounded-lg bg-slate-50 p-4 text-sm dark:bg-slate-950">
              <div className="flex justify-between">
                <dt className="text-slate-500 dark:text-slate-400">Cost</dt>
                <dd className="font-medium">{formatPoints(reward.cost_points)} points</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500 dark:text-slate-400">Current balance</dt>
                <dd className="font-medium">{formatPoints(balance)} points</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500 dark:text-slate-400">Balance after</dt>
                <dd
                  className={`font-semibold ${affordable ? '' : 'text-red-600 dark:text-red-400'}`}
                >
                  {formatPoints(balanceAfter)} points
                </dd>
              </div>
            </dl>

            {!affordable && (
              <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">
                You need {formatPoints(reward.cost_points - balance)} more points.
              </p>
            )}

            {redeem.isError && (
              <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">
                {errorMessage(redeem.error)}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" onClick={close} disabled={redeem.isPending}>
                Cancel
              </Button>
              <Button onClick={confirm} loading={redeem.isPending} disabled={!affordable}>
                Redeem
              </Button>
            </div>

            <p className="mt-4 text-center text-[11px] text-slate-400">
              Sent with a stable Idempotency-Key, so a retry never charges twice.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
