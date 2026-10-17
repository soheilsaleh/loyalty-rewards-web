import type { ReactElement, ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthProvider';

interface Options extends Omit<RenderOptions, 'wrapper'> {
  route?: string;
  withAuth?: boolean;
}

export function renderWithProviders(
  ui: ReactElement,
  { route = '/', withAuth = false, ...options }: Options = {},
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    const tree = <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>;

    return (
      <QueryClientProvider client={queryClient}>
        {withAuth ? <AuthProvider>{tree}</AuthProvider> : tree}
      </QueryClientProvider>
    );
  }

  return { queryClient, ...render(ui, { wrapper: Wrapper, ...options }) };
}

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}
