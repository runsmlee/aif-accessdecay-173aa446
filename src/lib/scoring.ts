import type { Integration, ScoredIntegration, RiskFactors } from '../types';

// Scoring weights:
// Risk = (data_access_level × access_weight) × (integration_depth × depth_weight)
//        × (days_dormant × dormancy_weight) + (owner_churn_weight if inactive)
// This means active integrations (0 days dormant) score 0 from the first three factors.
// Dormant integrations score higher based on access level, depth, and time.

const WEIGHTS = {
  accessWeight: 3,      // data_access_level (1-5) × 3 → max 15
  depthWeight: 2,       // integration_depth (1-5) × 2 → max 10
  dormancyWeight: 0.5,  // days_dormant × 0.5 → ~182 at 365 days
  ownerChurnWeight: 20, // flat bonus if owner left
} as const;

function getDaysDormant(lastActivityDate: string): number {
  const last = new Date(lastActivityDate);
  const now = new Date();
  const diffMs = now.getTime() - last.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export function calculateRiskScore(integration: Integration): ScoredIntegration {
  const daysDormant = getDaysDormant(integration.last_activity_date);

  // Data access contribution: scaled by dormancy
  const accessScaled = integration.data_access_level * WEIGHTS.accessWeight;
  const dataAccessWeighted = daysDormant > 0 ? accessScaled * (daysDormant / 30) : 0;

  // Integration depth contribution: scaled by dormancy
  const depthScaled = integration.integration_depth * WEIGHTS.depthWeight;
  const integrationDepthWeighted = daysDormant > 0 ? depthScaled * (daysDormant / 60) : 0;

  // Dormancy contribution: grows with time
  const dormancyWeighted = daysDormant * WEIGHTS.dormancyWeight;

  // Owner churn: flat bonus for inactive owners
  const ownerChurnWeighted = integration.owner_active ? 0 : WEIGHTS.ownerChurnWeight;

  const factors: RiskFactors = {
    dataAccessWeighted: Math.round(dataAccessWeighted * 10) / 10,
    integrationDepthWeighted: Math.round(integrationDepthWeighted * 10) / 10,
    dormancyWeighted: Math.round(dormancyWeighted * 10) / 10,
    ownerChurnWeighted: Math.round(ownerChurnWeighted * 10) / 10,
  };

  const risk_score = Math.round(
    dataAccessWeighted + integrationDepthWeighted + dormancyWeighted + ownerChurnWeighted
  );

  return {
    ...integration,
    risk_score,
    days_dormant: daysDormant,
    factors,
  };
}

export function rankIntegrations(integrations: Integration[]): ScoredIntegration[] {
  return integrations
    .map(calculateRiskScore)
    .sort((a, b) => {
      // Primary sort: descending risk score
      if (b.risk_score !== a.risk_score) {
        return b.risk_score - a.risk_score;
      }
      // Secondary sort: alphabetically by integration name
      return a.integration_name.localeCompare(b.integration_name);
    });
}
