import { describe, it, expect } from 'vitest';
import { DEMO_INTEGRATIONS, getDemoIntegrations } from '../src/lib/demoData';

describe('demoData', () => {
  it('contains between 8 and 12 integrations', () => {
    expect(DEMO_INTEGRATIONS.length).toBeGreaterThanOrEqual(8);
    expect(DEMO_INTEGRATIONS.length).toBeLessThanOrEqual(12);
  });

  it('all integrations have valid required fields', () => {
    DEMO_INTEGRATIONS.forEach((integration) => {
      expect(integration.id).toBeTruthy();
      expect(integration.id).toMatch(/^demo-/);
      expect(integration.integration_name).toBeTruthy();
      expect(integration.service).toBeTruthy();
      expect(integration.data_access_level).toBeGreaterThanOrEqual(1);
      expect(integration.data_access_level).toBeLessThanOrEqual(5);
      expect(integration.integration_depth).toBeGreaterThanOrEqual(1);
      expect(integration.integration_depth).toBeLessThanOrEqual(5);
      expect(integration.last_activity_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(integration.owner_email).toContain('@');
      expect(typeof integration.owner_active).toBe('boolean');
    });
  });

  it('includes dormant integrations with inactive owners (ex-employees)', () => {
    const inactive = DEMO_INTEGRATIONS.filter((i) => !i.owner_active);
    expect(inactive.length).toBeGreaterThanOrEqual(3);
  });

  it('includes integrations with active owners', () => {
    const active = DEMO_INTEGRATIONS.filter((i) => i.owner_active);
    expect(active.length).toBeGreaterThanOrEqual(3);
  });

  it('all IDs are unique', () => {
    const ids = DEMO_INTEGRATIONS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('getDemoIntegrations returns fresh copies', () => {
    const a = getDemoIntegrations();
    const b = getDemoIntegrations();
    expect(a.length).toBe(DEMO_INTEGRATIONS.length);
    expect(b.length).toBe(DEMO_INTEGRATIONS.length);
    // Verify copies, not references
    a[0].integration_name = 'MODIFIED';
    expect(b[0].integration_name).not.toBe('MODIFIED');
    expect(DEMO_INTEGRATIONS[0].integration_name).not.toBe('MODIFIED');
  });

  it('includes visceral well-known SaaS services (Slack, Jira, Notion)', () => {
    const services = DEMO_INTEGRATIONS.map((i) => i.service);
    expect(services).toContain('Slack');
    expect(services).toContain('Jira');
    expect(services).toContain('Notion');
    expect(services).toContain('Salesforce');
    expect(services).toContain('GitHub');
  });

  it('includes varied data access levels spanning critical to low', () => {
    const levels = new Set(DEMO_INTEGRATIONS.map((i) => i.data_access_level));
    // At least 2 distinct access levels for variety
    expect(levels.size).toBeGreaterThanOrEqual(2);
  });

  it('top-risk integrations have inactive owners for visceral urgency', () => {
    const inactive = DEMO_INTEGRATIONS.filter((i) => !i.owner_active);
    // At least 3 inactive owners to create urgency
    expect(inactive.length).toBeGreaterThanOrEqual(3);
    // All inactive owners have high access levels
    inactive.forEach((i) => {
      expect(i.data_access_level).toBeGreaterThanOrEqual(4);
    });
  });
});
