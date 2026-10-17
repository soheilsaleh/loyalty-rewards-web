import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { createTestQueryClient } from '../../test/render';
import { demoRedemption, demoRewards } from '../../test/handlers';
import { server } from '../../test/server';
import { useRedeem } from './useRedeem';

function createWrapper() {
  const queryClient = createTestQueryClient();
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

const reward = demoRewards[0];

describe('useRedeem', () => {
  it('reuses the same Idempotency-Key when retried after a 5xx', async () => {
    const keys: string[] = [];
    server.use(
      http.post('*/api/v1/rewards/:id/redeem', ({ request }) => {
        keys.push(request.headers.get('idempotency-key') ?? '');
        return HttpResponse.json({ message: 'Server error' }, { status: 500 });
      }),
    );

    const { result } = renderHook(() => useRedeem(), { wrapper: createWrapper() });

    result.current.mutate(reward.id);
    await waitFor(() => expect(result.current.isError).toBe(true));

    result.current.mutate(reward.id);
    await waitFor(() => expect(keys).toHaveLength(2));

    expect(keys[0]).toBeTruthy();
    expect(keys[1]).toBe(keys[0]);
  });

  it('uses a fresh Idempotency-Key after a successful redemption', async () => {
    const keys: string[] = [];
    server.use(
      http.post('*/api/v1/rewards/:id/redeem', ({ request }) => {
        keys.push(request.headers.get('idempotency-key') ?? '');
        return HttpResponse.json({ data: demoRedemption }, { status: 201 });
      }),
    );

    const { result } = renderHook(() => useRedeem(), { wrapper: createWrapper() });

    result.current.mutate(reward.id);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    result.current.mutate(reward.id);
    await waitFor(() => expect(keys).toHaveLength(2));

    expect(keys[1]).not.toBe(keys[0]);
  });

  it('drops the key after a client-side rejection (4xx)', async () => {
    const keys: string[] = [];
    server.use(
      http.post('*/api/v1/rewards/:id/redeem', ({ request }) => {
        keys.push(request.headers.get('idempotency-key') ?? '');
        return HttpResponse.json({ message: 'Insufficient points.' }, { status: 422 });
      }),
    );

    const { result } = renderHook(() => useRedeem(), { wrapper: createWrapper() });

    result.current.mutate(reward.id);
    await waitFor(() => expect(result.current.isError).toBe(true));

    result.current.mutate(reward.id);
    await waitFor(() => expect(keys).toHaveLength(2));

    expect(keys[1]).not.toBe(keys[0]);
  });
});
