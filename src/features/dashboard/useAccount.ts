import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client';
import { queryKeys } from '../../api/keys';
import type { Account, Wrapped } from '../../api/types';

export function useAccount() {
  return useQuery({
    queryKey: queryKeys.account,
    queryFn: async () => (await api<Wrapped<Account>>('/api/v1/me/account')).data,
  });
}
