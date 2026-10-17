import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '../../api/client';
import { queryKeys } from '../../api/keys';
import type { CursorPage, PointTransaction } from '../../api/types';

/** The full ledger, newest first, loaded one cursor page at a time. */
export function useHistory() {
  return useInfiniteQuery({
    queryKey: queryKeys.history,
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) =>
      api<CursorPage<PointTransaction>>(
        pageParam
          ? `/api/v1/me/transactions?cursor=${encodeURIComponent(pageParam)}`
          : '/api/v1/me/transactions',
      ),
    getNextPageParam: (lastPage) => lastPage.meta.next_cursor,
  });
}
