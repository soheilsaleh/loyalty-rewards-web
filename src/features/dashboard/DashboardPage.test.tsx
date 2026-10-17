import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../../test/render';
import { server } from '../../test/server';
import { DashboardPage } from './DashboardPage';

describe('DashboardPage', () => {
  it('shows the points balance and recent activity', async () => {
    renderWithProviders(<DashboardPage />);

    expect(await screen.findByText('1,650')).toBeInTheDocument();
    expect(screen.getByText('Recent activity')).toBeInTheDocument();
    expect(screen.getByText(/silver tier/i)).toBeInTheDocument();
  });

  it('shows an error state when the account request fails', async () => {
    server.use(
      http.get('*/api/v1/me/account', () =>
        HttpResponse.json({ message: 'Something went wrong.' }, { status: 500 }),
      ),
    );

    renderWithProviders(<DashboardPage />);

    expect(await screen.findByText(/couldn't load your account/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('shows an empty state when there is no activity', async () => {
    server.use(
      http.get('*/api/v1/me/transactions', () =>
        HttpResponse.json({
          data: [],
          links: { first: null, last: null, prev: null, next: null },
          meta: { path: '/api/v1', per_page: 15, next_cursor: null, prev_cursor: null },
        }),
      ),
    );

    renderWithProviders(<DashboardPage />);

    expect(await screen.findByText(/no activity yet/i)).toBeInTheDocument();
  });
});
