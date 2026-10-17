import { tokenStore } from '../auth/tokenStore';

export const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000').replace(
  /\/+$/,
  '',
);

function extractMessage(body: unknown): string | undefined {
  if (body && typeof body === 'object' && 'message' in body) {
    const message = (body as { message?: unknown }).message;
    if (typeof message === 'string' && message.length > 0) {
      return message;
    }
  }
  return undefined;
}

/**
 * Error thrown for any non-2xx API response. `body` holds the decoded JSON so
 * callers can inspect Laravel's `errors` map on a 422.
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(extractMessage(body) ?? `Request failed with status ${status}`);
    this.name = 'ApiError';
  }

  /** Laravel validation errors, keyed by field. Empty for non-422 responses. */
  get errors(): Record<string, string[]> {
    if (this.status !== 422 || !this.body || typeof this.body !== 'object') {
      return {};
    }
    const errors = (this.body as { errors?: unknown }).errors;
    return errors && typeof errors === 'object' ? (errors as Record<string, string[]>) : {};
  }
}

let onUnauthorized: (() => void) | null = null;

/** Registered by AuthProvider so a 401 anywhere clears the session. */
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

export interface ApiRequestInit extends RequestInit {
  /** Sent as the `Idempotency-Key` header when present. */
  idempotencyKey?: string;
}

export async function api<T>(path: string, init: ApiRequestInit = {}): Promise<T> {
  const { idempotencyKey, headers, ...rest } = init;
  const token = tokenStore.get();

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      Accept: 'application/json',
      ...(rest.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
      ...(headers as Record<string, string> | undefined),
    },
  });

  if (response.status === 401) {
    tokenStore.clear();
    onUnauthorized?.();
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(response.status, body);
  }

  return body as T;
}
