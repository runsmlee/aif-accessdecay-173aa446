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
    // Demo integrations with visceral SaaS names should appear immediately
    expect(screen.getByText('Slack Workspace Admin')).toBeInTheDocument();
    expect(screen.getByText('Notion Full Workspace Sync')).toBeInTheDocument();
    expect(screen.getByText('Jira System Webhooks')).toBeInTheDocument();
  });

  it('does NOT show empty state when demo data auto-loads', () => {
    render(<App />);
    expect(screen.queryByText(/no integrations yet/i)).not.toBeInTheDocument();
  });

  it('renders "Use your own data" upload button', () => {
    render(<App />);
    const label = screen.getByText(/use your own data/i);
    expect(label).toBeInTheDocument();
  });

  it('shows active count from demo data in header', () => {
    render(<App />);
    expect(screen.getByText(/10 active/i)).toBeInTheDocument();
  });

  it('shows departed employee names on critical items', () => {
    render(<App />);
    // Top items have inactive owners — their names should be visible
    expect(screen.getByText(/Sarah Chen left/i)).toBeInTheDocument();
    expect(screen.getByText(/Marcus Rivera left/i)).toBeInTheDocument();
  });

  it('persists demo data to localStorage after auto-load', () => {
    render(<App />);

    // Check that localStorage has data
    const stored = localStorage.getItem('accessdecay-integrations');
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored as string);
    expect(parsed.length).toBe(10);
  });

  it('allows revoking an integration from the kill list', async () => {
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
  });
});
