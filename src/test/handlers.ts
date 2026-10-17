import { http, HttpResponse } from 'msw';
import type { Account, CursorMeta, PointTransaction, Redemption, Reward, User } from '../api/types';

export const demoUser: User = {
  id: 3,
  name: 'Demo Customer',
  email: 'customer@loyalty.test',
  phone: null,
  role: 'customer',
  created_at: '2026-01-01T00:00:00+00:00',
};

export const demoAccount: Account = {
  id: 1,
  name: 'Demo Customer',
  currency: 'EUR',
  points_balance: 1_650,
  lifetime_points: 1_650,
  tier: { id: 1, name: 'Bronze', slug: 'bronze', min_lifetime_points: 0 },
  updated_at: '2026-01-02T00:00:00+00:00',
};

export const demoTtransactions: PointTransaction[] = [
  {
    id: 2,
    type: 'earn',
    label: 'Purchase',
    points: 400,
    balance_after: 1_650,
    description: 'Demo purchase',
    expires_at: null,
    created_at: '2026-01-02T00:00:00+00:00',
  },
  {
    id: 1,
    type: 'earn',
    label: 'Purchase',
    points: 1_250,
    balance_after: 1_250,
    description: 'Demo purchase',
    expires_at: null,
    created_at: '2026-01-01T00:00:00+00:00',
  },
];

export const demoRewards: Reward[] = [
  {
    id: 1,
    name: 'Free Coffee',
    slug: 'free-coffee',
    description: 'A free hot drink of your choice.',
    cost_points: 500,
    stock: null,
    is_active: true,
    created_at: '2026-01-01T00:00:00+00:00',
  },
  {
    id: 3,
    name: 'Limited Tote Bag',
    slug: 'limited-tote-bag',
    description: 'A limited edition cotton tote bag.',
    cost_points: 2_500,
    stock: 50,
    is_active: true,
    created_at: '2026-01-01T00:00:00+00:00',
  },
];

export const demoRedemption: Redemption = {
  id: 1,
  points_spent: 500,
  status: 'fulfilled',
  reward: demoRewards[0],
  created_at: '2026-01-03T00:00:00+00:00',
};

const meta = (next: string | null = null): CursorMeta => ({
  path: '/api/v1',
  per_page: 15,
  next_cursor: next,
  prev_cursor: null,
});

type JsonBody = Record<string, unknown>;
const json = (body: unknown) => HttpResponse.json(body as JsonBody);

export const handlers = [
  http.post('*/api/v1/auth/login', () => json({ data: demoUser, token: 'test-token' })),

  http.get('*/api/v1/auth/me', () => json({ data: demoUser })),

  http.post('*/api/v1/auth/logout', () => new HttpResponse(null, { status: 204 })),

  http.get('*/api/v1/me/account', () => json({ data: demoAccount })),

  http.get('*/api/v1/me/transactions', () =>
    json({
      data: demoTtransactions,
      links: { first: null, last: null, prev: null, next: null },
      meta: meta(),
    }),
  ),

  http.get('*/api/v1/rewards', () =>
    json({
      data: demoRewards,
      links: { first: null, last: null, prev: null, next: null },
      meta: meta(),
    }),
  ),

  http.post('*/api/v1/rewards/:id/redeem', () =>
    HttpResponse.json({ data: demoRedemption } as JsonBody, { status: 201 }),
  ),
];
