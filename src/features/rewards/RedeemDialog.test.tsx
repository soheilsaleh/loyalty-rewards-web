import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../test/render';
import { demoRewards } from '../../test/handlers';
import { server } from '../../test/server';
import { RedeemDialog } from './RedeemDialog';

const reward = demoRewards[0]; // Free Coffee, 500 points

describe('RedeemDialog', () => {
  it('warns and disables redemption when the balance is too low', () => {
    renderWithProviders(<RedeemDialog reward={reward} balance={100} onClose={vi.fn()} />);

    expect(screen.getByText(/need 400 more points/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Redeem' })).toBeDisabled();
  });

  it('shows the API error when a redemption is rejected (422)', async () => {
    server.use(
      http.post('*/api/v1/rewards/:id/redeem', () =>
        HttpResponse.json({ message: 'Insufficient points.' }, { status: 422 }),
      ),
    );

    const user = userEvent.setup();
    renderWithProviders(<RedeemDialog reward={reward} balance={1_000} onClose={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Redeem' }));

    expect(await screen.findByText('Insufficient points.')).toBeInTheDocument();
  });

  it('confirms a successful redemption', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RedeemDialog reward={reward} balance={1_000} onClose={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Redeem' }));

    expect(await screen.findByText('Redeemed!')).toBeInTheDocument();
  });
});
