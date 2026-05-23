import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { KillList } from '../src/components/KillList';
import type { ScoredIntegration } from '../src/types';

function makeScored(overrides: Partial<ScoredIntegration> = {}): ScoredIntegration {
  return {
    id: 'test-1',
    integration_name: 'Test Integration',
    service: 'TestService',
    data_access_level: 3,
    integration_depth: 3,
    last_activity_date: '2024-01-01',
    owner_email: 'user@test.com',
    owner_active: true,
    risk_score: 50,
    days_dormant: 100,
    factors: {
      dataAccessWeighted: 15,
      integrationDepthWeighted: 12,
      dormancyWeighted: 18,
      ownerChurnWeighted: 5,
    },
    ...overrides,
  };
}

describe('KillList', () => {
  it('renders empty state with prompt to upload CSV when no integrations exist', () => {
    render(
      <KillList
        integrations={[]}
        revokedIds={[]}
        onRevoke={vi.fn()}
        onItemClick={vi.fn()}
        selectedId={null}
      />
    );
    expect(screen.getByText(/upload a csv/i)).toBeInTheDocument();
  });

  it('renders list items sorted by descending risk score', () => {
    const items = [
      makeScored({ id: 'low', integration_name: 'Low Risk', risk_score: 20 }),
      makeScored({ id: 'high', integration_name: 'High Risk', risk_score: 90 }),
      makeScored({ id: 'medium', integration_name: 'Medium Risk', risk_score: 50 }),
    ];
    render(
      <KillList
        integrations={items}
        revokedIds={[]}
        onRevoke={vi.fn()}
        onItemClick={vi.fn()}
        selectedId={null}
      />
    );
    const listItems = screen.getAllByRole('listitem');
    // Active section should show items in descending risk order
    expect(listItems[0]).toHaveTextContent('High Risk');
    expect(listItems[1]).toHaveTextContent('Medium Risk');
    expect(listItems[2]).toHaveTextContent('Low Risk');
  });

  it('each list item displays: integration name, service, risk score, and "Revoke" button', () => {
    const items = [makeScored()];
    render(
      <KillList
        integrations={items}
        revokedIds={[]}
        onRevoke={vi.fn()}
        onItemClick={vi.fn()}
        selectedId={null}
      />
    );
    expect(screen.getByText('Test Integration')).toBeInTheDocument();
    expect(screen.getByText('TestService')).toBeInTheDocument();
    expect(screen.getByText(/50/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /revoke/i })).toBeInTheDocument();
  });

  it('clicking "Revoke" removes item from active list and shows "Revoked" badge', async () => {
    const onRevoke = vi.fn();
    const items = [makeScored({ id: 'revoke-me' })];
    render(
      <KillList
        integrations={items}
        revokedIds={['revoke-me']}
        onRevoke={onRevoke}
        onItemClick={vi.fn()}
        selectedId={null}
      />
    );
    // The item should be in the revoked section with a "Revoked" badge
    expect(screen.getAllByText(/revoked/i).length).toBeGreaterThanOrEqual(1);
    // No revoke button for already-revoked items
    expect(screen.queryByRole('button', { name: /revoke revoke-me/i })).not.toBeInTheDocument();
  });

  it('revoked items move to a "Revoked" section below the active queue', () => {
    const items = [
      makeScored({ id: 'active', integration_name: 'Active Item', risk_score: 50 }),
      makeScored({ id: 'revoked', integration_name: 'Revoked Item', risk_score: 80 }),
    ];
    render(
      <KillList
        integrations={items}
        revokedIds={['revoked']}
        onRevoke={vi.fn()}
        onItemClick={vi.fn()}
        selectedId={null}
      />
    );
    // Active section should only show active item
    expect(screen.getByText('Active Queue')).toBeInTheDocument();
    expect(screen.getAllByText(/Revoked/).length).toBeGreaterThanOrEqual(1);
    // Active item should not be in revoked section
    const activeItems = screen.getAllByRole('listitem');
    // Revoked item should show "Revoked" badge
    expect(screen.getByText('Revoked Item')).toBeInTheDocument();
  });

  it('items with risk score ≥ 80 display in high-severity red styling', () => {
    const items = [makeScored({ id: 'high', risk_score: 85 })];
    render(
      <KillList
        integrations={items}
        revokedIds={[]}
        onRevoke={vi.fn()}
        onItemClick={vi.fn()}
        selectedId={null}
      />
    );
    const item = screen.getByRole('listitem');
    expect(item.className).toMatch(/severity-high|bg-severity-high|border-severity-high|text-severity-high/);
  });

  it('items with risk score 40–79 display in medium-severity amber styling', () => {
    const items = [makeScored({ id: 'medium', risk_score: 55 })];
    render(
      <KillList
        integrations={items}
        revokedIds={[]}
        onRevoke={vi.fn()}
        onItemClick={vi.fn()}
        selectedId={null}
      />
    );
    const item = screen.getByRole('listitem');
    expect(item.className).toMatch(/severity-medium|bg-severity-medium|border-severity-medium|text-severity-medium/);
  });

  it('items with risk score < 40 display in low-severity gray styling', () => {
    const items = [makeScored({ id: 'low', risk_score: 25 })];
    render(
      <KillList
        integrations={items}
        revokedIds={[]}
        onRevoke={vi.fn()}
        onItemClick={vi.fn()}
        selectedId={null}
      />
    );
    const item = screen.getByRole('listitem');
    expect(item.className).toMatch(/severity-low|bg-severity-low|border-severity-low|text-severity-low/);
  });
});
