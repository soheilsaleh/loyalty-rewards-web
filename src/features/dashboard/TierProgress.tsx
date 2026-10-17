import { formatPoints } from '../../lib/format';
import { tierProgress } from './tiers';

export function TierProgress({ lifetimePoints }: { lifetimePoints: number }) {
  const { current, next, percent, pointsToNext } = tierProgress(lifetimePoints);

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {current.name} tier
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {next ? `${formatPoints(pointsToNext)} points to ${next.name}` : 'Highest tier reached'}
        </span>
      </div>

      <div
        className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progress to next tier"
      >
        <div
          className="h-full rounded-full bg-indigo-600 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="mt-2 flex justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>{formatPoints(lifetimePoints)} lifetime points</span>
        {next && (
          <span>
            {percent}% to {next.name}
          </span>
        )}
      </div>
    </div>
  );
}
