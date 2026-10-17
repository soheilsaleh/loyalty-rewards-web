export type Role = 'admin' | 'staff' | 'customer';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
  created_at: string | null;
}

export interface Tier {
  id: number;
  name: string;
  slug: string;
  min_lifetime_points: number;
}

export interface Account {
  id: number;
  name?: string;
  currency: string;
  points_balance: number;
  lifetime_points: number;
  tier: Tier | null;
  updated_at: string | null;
}

export type TransactionType = 'earn' | 'redeem' | 'adjust' | 'expire' | 'refund' | 'bonus';

export interface PointTransaction {
  id: number;
  type: TransactionType;
  label: string;
  points: number;
  balance_after: number;
  description: string | null;
  expires_at: string | null;
  created_at: string | null;
}

export interface Reward {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  cost_points: number;
  stock: number | null;
  is_active: boolean;
  created_at: string | null;
}

export type RedemptionStatus = 'pending' | 'fulfilled' | 'cancelled';

export interface Redemption {
  id: number;
  points_spent: number;
  status: RedemptionStatus;
  reward: Reward | null;
  created_at: string | null;
}

export interface CursorLink {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface CursorMeta {
  path: string;
  per_page: number;
  next_cursor: string | null;
  prev_cursor: string | null;
}

export interface CursorPage<T> {
  data: T[];
  links: CursorLink;
  meta: CursorMeta;
}

export interface LoginResponse {
  data: User;
  token: string;
}

export interface Wrapped<T> {
  data: T;
}
