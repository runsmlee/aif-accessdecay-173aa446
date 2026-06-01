import type { Integration } from '../types';

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

// 7 visceral demo integrations: recognizable SaaS tools with departed employees
// and real urgency. Top items are Critical — inactive owners, high access, months dormant.
// Lower items are Medium — active owners, less access, shorter dormancy.
export const DEMO_INTEGRATIONS: Integration[] = [
  {
    id: 'demo-slack-bot-token',
    integration_name: 'Slack Bot Token',
    service: 'Slack',
    data_access_level: 5,
    integration_depth: 5,
    last_activity_date: daysAgo(47),
    owner_email: 'sarah.chen@company.com',
    owner_active: false,
  },
  {
    id: 'demo-jira-webhook',
    integration_name: 'Jira Webhook to deprecated service',
    service: 'Jira',
    data_access_level: 4,
    integration_depth: 4,
    last_activity_date: daysAgo(212),
    owner_email: 'marcus.rivera@company.com',
    owner_active: false,
  },
  {
    id: 'demo-notion-workspace',
    integration_name: 'Notion Workspace Sync',
    service: 'Notion',
    data_access_level: 5,
    integration_depth: 5,
    last_activity_date: daysAgo(180),
    owner_email: 'aisha.patel@company.com',
    owner_active: false,
  },
  {
    id: 'demo-salesforce-admin',
    integration_name: 'Salesforce Admin API Token',
    service: 'Salesforce',
    data_access_level: 5,
    integration_depth: 4,
    last_activity_date: daysAgo(134),
    owner_email: 'derek.kim@company.com',
    owner_active: false,
  },
  {
    id: 'demo-github-org-token',
    integration_name: 'GitHub Org Admin Token',
    service: 'GitHub',
    data_access_level: 4,
    integration_depth: 5,
    last_activity_date: daysAgo(95),
    owner_email: 'rachel.wu@company.com',
    owner_active: false,
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
];

export function getDemoIntegrations(): Integration[] {
  return DEMO_INTEGRATIONS.map((item) => ({ ...item }));
}
