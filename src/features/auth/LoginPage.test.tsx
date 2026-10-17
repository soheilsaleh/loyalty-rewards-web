import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../../test/render';
import { server } from '../../test/server';
import { LoginPage } from './LoginPage';

describe('LoginPage', () => {
  it('shows the demo credentials hint', () => {
    renderWithProviders(<LoginPage />, { route: '/login', withAuth: true });

    expect(screen.getByText('customer@loyalty.test')).toBeInTheDocument();
  });

  it('renders field errors from a 422 response', async () => {
    server.use(
      http.post('*/api/v1/auth/login', () =>
        HttpResponse.json(
          {
            message: 'The given data was invalid.',
            errors: { email: ['The email field is required.'] },
          },
          { status: 422 },
        ),
      ),
    );

    const user = userEvent.setup();
    renderWithProviders(<LoginPage />, { route: '/login', withAuth: true });

    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText('The email field is required.')).toBeInTheDocument();
  });

  it('shows a friendly message when credentials are rejected (401)', async () => {
    server.use(
      http.post('*/api/v1/auth/login', () =>
        HttpResponse.json(
          { message: 'These credentials do not match our records.' },
          { status: 401 },
        ),
      ),
    );

    const user = userEvent.setup();
    renderWithProviders(<LoginPage />, { route: '/login', withAuth: true });

    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/email or password is incorrect/i)).toBeInTheDocument();
  });
});
