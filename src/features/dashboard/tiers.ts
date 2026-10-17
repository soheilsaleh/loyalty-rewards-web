export interface TierThreshold {
  slug: string;
  name: string;
  min: number;
}

/**
 * Tier thresholds mirror the API seed (Silver 1,000 / Gold 5,000 / Platinum
 * 20,000 lifetime points). The API has no public `/tiers` endpoint yet, so the
 * client keeps this small, documented copy; a `/tiers` endpoint is on the API
 * roadmap and would let this be fetched instead.
 */
export const TIERS: TierThreshold[] = [
  { slug: 'bronze', name: 'Bronze', min: 0 },
  { slug: 'silver', name: 'Silver', min: 1_000 },
  { slug: 'gold', name: 'Gold', min: 5_000 },
  { slug: 'platinum', name: 'Platinum', min: 20_000 },
];

export interface TierProgress {
  current: TierThreshold;
  next: TierThreshold | null;
  /** 0-100 progress from the current tier's floor toward the next tier. */
  percent: number;
  pointsToNext: number;
}

export function tierProgress(lifetimePoints: number): TierProgress {
  const current = [...TIERS].reverse().find((tier) => lifetimePoints >= tier.min) ?? TIERS[0];
  const next = TIERS.find((tier) => tier.min > lifetimePoints) ?? null;

  if (!next) {
    return { current, next: null, percent: 100, pointsToNext: 0 };
  }

  const span = next.min - current.min;
  const gained = lifetimePoints - current.min;
  const percent = span <= 0 ? 100 : Math.min(100, Math.max(0, Math.round((gained / span) * 100)));

  return { current, next, percent, pointsToNext: next.min - lifetimePoints };
}
