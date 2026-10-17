import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client';
import { queryKeys } from '../../api/keys';
import type { CursorPage, Reward } from '../../api/types';

export function useRewards() {
  return useQuery({
    queryKey: queryKeys.rewards,
    queryFn: async () => (await api<CursorPage<Reward>>('/api/v1/rewards')).data,
  });
}
