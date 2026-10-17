import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client';
import { queryKeys } from '../../api/keys';
import type { CursorPage, PointTransaction } from '../../api/types';

/** The most recent ledger entries (the API returns 15 per page; trim to `limit`). */
export function useRecentTransactions(limit = 10) {
  return useQuery({
    queryKey: queryKeys.recentTransactions,
    queryFn: async () => {
      const page = await api<CursorPage<PointTransaction>>('/api/v1/me/transactions');
      return page.data.slice(0, limit);
    },
  });
}
