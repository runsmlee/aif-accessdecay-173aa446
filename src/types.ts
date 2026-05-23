export interface Integration {
  id: string;
  integration_name: string;
  service: string;
  data_access_level: number; // 1-5
  integration_depth: number; // 1-5
  last_activity_date: string; // ISO date
  owner_email: string;
  owner_active: boolean;
}

export interface ScoredIntegration extends Integration {
  risk_score: number;
  days_dormant: number;
  factors: RiskFactors;
}

export interface RiskFactors {
  dataAccessWeighted: number;
  integrationDepthWeighted: number;
  dormancyWeighted: number;
  ownerChurnWeighted: number;
}

export interface CSVRow {
  integration_name?: string;
  service?: string;
  data_access_level?: string;
  integration_depth?: string;
  last_activity_date?: string;
  owner_email?: string;
  owner_active?: string;
}

export interface ParseResult {
  integrations: Integration[];
  skippedCount: number;
}
