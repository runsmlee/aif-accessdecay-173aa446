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
    expect(screen.getByText(/Slack OAuth Token/)).toBeInTheDocument();
    expect(screen.getByText(/Jira OAuth Token/)).toBeInTheDocument();
    expect(screen.getByText(/Notion API Key/)).toBeInTheDocument();
  });

  it('does NOT show empty state when demo data auto-loads', () => {
    render(<App />);
    expect(screen.queryByText(/no integrations yet/i)).not.toBeInTheDocument();
  });

  it('shows CSV upload button in header during demo mode', () => {
    render(<App />);
    // Header has an upload button when viewing demo data
    expect(screen.getByRole('button', { name: /upload your csv/i })).toBeInTheDocument();
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
    expect(parsed.length).toBe(7);
  });

  it('shows demo revoke message when clicking Revoke in demo mode', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Verify demo data loaded
    const revokeButtons = screen.getAllByRole('button', { name: /revoke/i });
    expect(revokeButtons.length).toBe(7);

    // Click the first revoke button (demo mode)
    await user.click(revokeButtons[0]);

    // Should show the demo message instead of actually revoking
    expect(screen.getByText(/this is demo data.*upload your csv to see your real risks/i)).toBeInTheDocument();

    // Active count should NOT decrease in demo mode (no header count shown)
    expect(screen.queryByText(/6 active/i)).not.toBeInTheDocument();
  });

  it('renders 7 demo integrations', () => {
    render(<App />);
    const revokeButtons = screen.getAllByRole('button', { name: /revoke/i });
    expect(revokeButtons).toHaveLength(7);
  });
});
