import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('auto-loads demo data on first visit when no stored data exists', () => {
    render(<App />);
    // Demo integrations should appear immediately — no empty state
    expect(screen.getByText('Okta SSO Bridge')).toBeInTheDocument();
    expect(screen.getByText('Zapier Full OAuth')).toBeInTheDocument();
    expect(screen.getByText('Salesforce Admin Sync')).toBeInTheDocument();
  });

  it('does NOT show empty state when demo data auto-loads', () => {
    render(<App />);
    expect(screen.queryByText(/no integrations yet/i)).not.toBeInTheDocument();
  });

  it('renders Load demo data button', () => {
    render(<App />);
    const btn = screen.getByRole('button', { name: /load demo data/i });
    expect(btn).toBeInTheDocument();
  });

  it('shows active count from demo data in header', () => {
    render(<App />);
    expect(screen.getByText(/10 active/i)).toBeInTheDocument();
  });

  it('resets to demo data when Load demo data is clicked after revoking', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Verify demo data loaded
    const revokeButtons = screen.getAllByRole('button', { name: /revoke/i });
    const initialCount = revokeButtons.length;
    expect(initialCount).toBe(10);

    // Revoke the first item
    await user.click(revokeButtons[0]);

    // Active count should decrease
    expect(screen.getByText(/9 active/i)).toBeInTheDocument();

    // Click "Load demo data" to reset
    await user.click(screen.getByRole('button', { name: /load demo data/i }));

    // Should be back to full demo data
    const restoredButtons = screen.getAllByRole('button', { name: /revoke/i });
    expect(restoredButtons.length).toBe(initialCount);
    expect(screen.getByText(/10 active/i)).toBeInTheDocument();
  });

  it('persists demo data to localStorage after auto-load', () => {
    render(<App />);

    // Check that localStorage has data
    const stored = localStorage.getItem('accessdecay-integrations');
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored as string);
    expect(parsed.length).toBe(10);
  });
});
