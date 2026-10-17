import { useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiError, api } from '../../api/client';
import { queryKeys } from '../../api/keys';
import type { Redemption, Wrapped } from '../../api/types';
import { newIdempotencyKey } from '../../lib/id';

/**
 * Redeems a reward with a stable `Idempotency-Key` per user *intent*.
 *
 * The key is generated on the first attempt and reused for retries, so a retry
 * after a network failure or a 5xx returns the original redemption instead of
 * spending points twice. The key is discarded once the intent is resolved — a
 * success, or a client-side rejection (4xx) such as insufficient points — so
 * the next redemption starts with a fresh key.
 */
export function useRedeem() {
  const queryClient = useQueryClient();
  const keyRef = useRef<string | null>(null);

  return useMutation({
    mutationFn: (rewardId: number) => {
      keyRef.current ??= newIdempotencyKey();
      return api<Wrapped<Redemption>>(`/api/v1/rewards/${rewardId}/redeem`, {
        method: 'POST',
        idempotencyKey: keyRef.current,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.account });
      void queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onSettled: (_data, error) => {
      // Keep the key only for retryable failures (network / 5xx).
      if (!error || (error instanceof ApiError && error.status < 500)) {
        keyRef.current = null;
      }
    },
  });
}
