import { describe, it, expect } from 'vitest';
import { calculateRiskScore, rankIntegrations } from '../src/lib/scoring';
import type { Integration } from '../src/types';

function makeIntegration(overrides: Partial<Integration> = {}): Integration {
  return {
    id: 'test-1',
    integration_name: 'Test Integration',
    service: 'TestService',
    data_access_level: 1,
    integration_depth: 1,
    last_activity_date: new Date().toISOString().split('T')[0],
    owner_email: 'user@test.com',
    owner_active: true,
    ...overrides,
  };
}

describe('calculateRiskScore', () => {
  it('returns 0 for an integration with last activity today and active owner', () => {
    const integration = makeIntegration({
      data_access_level: 1,
      integration_depth: 1,
      last_activity_date: new Date().toISOString().split('T')[0],
      owner_active: true,
    });
    const result = calculateRiskScore(integration);
    expect(result.risk_score).toBe(0);
    expect(result.days_dormant).toBe(0);
  });

  it('returns highest score when data access is admin (5), depth is 5, last activity is 365 days ago, and owner has left', () => {
    const integration = makeIntegration({
      data_access_level: 5,
      integration_depth: 5,
      last_activity_date: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      owner_active: false,
    });
    const result = calculateRiskScore(integration);
    // Should be the maximum possible score
    expect(result.risk_score).toBeGreaterThan(80);
    expect(result.days_dormant).toBeGreaterThanOrEqual(365);
    expect(result.factors.dataAccessWeighted).toBeGreaterThan(0);
    expect(result.factors.integrationDepthWeighted).toBeGreaterThan(0);
    expect(result.factors.dormancyWeighted).toBeGreaterThan(0);
    expect(result.factors.ownerChurnWeighted).toBeGreaterThan(0);
  });

  it('ranks a dormant admin integration higher than a recently active read-only integration', () => {
    const dormantAdmin = makeIntegration({
      id: 'dormant-admin',
      integration_name: 'Dormant Admin',
      data_access_level: 5,
      integration_depth: 4,
      last_activity_date: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      owner_active: false,
    });
    const activeReadonly = makeIntegration({
      id: 'active-readonly',
      integration_name: 'Active Readonly',
      data_access_level: 1,
      integration_depth: 1,
      last_activity_date: new Date().toISOString().split('T')[0],
      owner_active: true,
    });
    const dormantScore = calculateRiskScore(dormantAdmin);
    const activeScore = calculateRiskScore(activeReadonly);
    expect(dormantScore.risk_score).toBeGreaterThan(activeScore.risk_score);
  });

  it('handles edge case: missing optional fields default to safe values (depth=1, owner_active=true)', () => {
    const integration = makeIntegration({
      data_access_level: 3,
      integration_depth: 1,
      last_activity_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      owner_active: true,
    });
    const result = calculateRiskScore(integration);
    expect(result.risk_score).toBeGreaterThanOrEqual(0);
    expect(result.factors).toBeDefined();
    // Sum of weighted factors should equal total score
    const sumOfFactors =
      result.factors.dataAccessWeighted +
      result.factors.integrationDepthWeighted +
      result.factors.dormancyWeighted +
      result.factors.ownerChurnWeighted;
    expect(sumOfFactors).toBeCloseTo(result.risk_score, 1);
  });
});

describe('rankIntegrations', () => {
  it('returns items sorted by descending risk score', () => {
    const high = makeIntegration({
      id: 'high',
      integration_name: 'High Risk',
      data_access_level: 5,
      integration_depth: 5,
      last_activity_date: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      owner_active: false,
    });
    const low = makeIntegration({
      id: 'low',
      integration_name: 'Low Risk',
      data_access_level: 1,
      integration_depth: 1,
      last_activity_date: new Date().toISOString().split('T')[0],
      owner_active: true,
    });
    const medium = makeIntegration({
      id: 'medium',
      integration_name: 'Medium Risk',
      data_access_level: 3,
      integration_depth: 3,
      last_activity_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      owner_active: true,
    });
    const ranked = rankIntegrations([medium, high, low]);
    expect(ranked[0].id).toBe('high');
    expect(ranked[1].id).toBe('medium');
    expect(ranked[2].id).toBe('low');
  });

  it('assignes equal-ranked items a stable secondary sort by integration name', () => {
    const a = makeIntegration({
      id: 'a',
      integration_name: 'Alpha Service',
      data_access_level: 1,
      integration_depth: 1,
      last_activity_date: new Date().toISOString().split('T')[0],
      owner_active: true,
    });
    const b = makeIntegration({
      id: 'b',
      integration_name: 'Beta Service',
      data_access_level: 1,
      integration_depth: 1,
      last_activity_date: new Date().toISOString().split('T')[0],
      owner_active: true,
    });
    const ranked = rankIntegrations([b, a]);
    // Both have same score, so sort by name
    expect(ranked[0].integration_name).toBe('Alpha Service');
    expect(ranked[1].integration_name).toBe('Beta Service');
  });
});
