import type { Integration } from '../types';

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

// Visceral demo data: recognizable SaaS tools with departed employees and real urgency.
// Top 5 are Critical — inactive owners, high access, months dormant.
// Bottom 5 are Medium/Low — active owners, less access, shorter dormancy.
export const DEMO_INTEGRATIONS: Integration[] = [
  {
    id: 'demo-slack-admin',
    integration_name: 'Slack Workspace Admin',
    service: 'Slack',
    data_access_level: 5,
    integration_depth: 5,
    last_activity_date: daysAgo(210),
    owner_email: 'sarah.chen@company.com',
    owner_active: false,
  },
  {
    id: 'demo-notion-workspace',
    integration_name: 'Notion Full Workspace Sync',
    service: 'Notion',
    data_access_level: 5,
    integration_depth: 5,
    last_activity_date: daysAgo(180),
    owner_email: 'marcus.rivera@company.com',
    owner_active: false,
  },
  {
    id: 'demo-jira-webhooks',
    integration_name: 'Jira System Webhooks',
    service: 'Jira',
    data_access_level: 4,
    integration_depth: 4,
    last_activity_date: daysAgo(156),
    owner_email: 'aisha.patel@company.com',
    owner_active: false,
  },
  {
    id: 'demo-salesforce-api',
    integration_name: 'Salesforce Admin API',
    service: 'Salesforce',
    data_access_level: 5,
    integration_depth: 4,
    last_activity_date: daysAgo(120),
    owner_email: 'derek.kim@company.com',
    owner_active: false,
  },
  {
    id: 'demo-github-org',
    integration_name: 'GitHub Org Admin Token',
    service: 'GitHub',
    data_access_level: 4,
    integration_depth: 5,
    last_activity_date: daysAgo(95),
    owner_email: 'rachel.wu@company.com',
    owner_active: false,
  },
  {
    id: 'demo-zoom-oauth',
    integration_name: 'Zoom OAuth Connector',
    service: 'Zoom',
    data_access_level: 4,
    integration_depth: 3,
    last_activity_date: daysAgo(78),
    owner_email: 'tom.bradley@company.com',
    owner_active: true,
  },
  {
    id: 'demo-stripe-webhook',
    integration_name: 'Stripe Billing Webhook',
    service: 'Stripe',
    data_access_level: 3,
    integration_depth: 3,
    last_activity_date: daysAgo(62),
    owner_email: 'emma.wilson@company.com',
    owner_active: true,
  },
  {
    id: 'demo-hubspot-crm',
    integration_name: 'HubSpot CRM Connector',
    service: 'HubSpot',
    data_access_level: 4,
    integration_depth: 3,
    last_activity_date: daysAgo(55),
    owner_email: 'james.li@company.com',
    owner_active: true,
  },
  {
    id: 'demo-okta-sso',
    integration_name: 'Okta SSO Bridge',
    service: 'Okta',
    data_access_level: 3,
    integration_depth: 2,
    last_activity_date: daysAgo(34),
    owner_email: 'nina.patel@company.com',
    owner_active: true,
  },
  {
    id: 'demo-datadog-monitoring',
    integration_name: 'Datadog Monitoring Feed',
    service: 'Datadog',
    data_access_level: 3,
    integration_depth: 2,
    last_activity_date: daysAgo(23),
    owner_email: 'alex.johnson@company.com',
    owner_active: true,
  },
];

export function getDemoIntegrations(): Integration[] {
  return DEMO_INTEGRATIONS.map((item) => ({ ...item }));
}
