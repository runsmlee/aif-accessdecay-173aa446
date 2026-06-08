import type { Integration } from '../types';

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

// 7 visceral demo integrations: recognizable SaaS tools with departed employees
// and real urgency. Top items are Critical — inactive owners, high access, months dormant.
// Lower items are Medium — active owners, less access, shorter dormancy.
// Names embed structured SEO terms: integration type (OAuth token, API key, webhook),
// permission scope (Admin, Read-Write, Read-Only), data accessed, and risk reason
// so each row is self-describing for search engines without relying on header copy.
export const DEMO_INTEGRATIONS: Integration[] = [
  {
    id: 'demo-jira-webhook',
    integration_name: 'Jira OAuth Token — Admin Scope, Full Project Read/Write, Granted by Terminated Employee',
    service: 'Jira',
    data_access_level: 4,
    integration_depth: 4,
    last_activity_date: daysAgo(212),
    owner_email: 'marcus.rivera@company.com',
    owner_active: false,
  },
  {
    id: 'demo-notion-workspace',
    integration_name: 'Notion API Key — Admin Scope, Full Workspace Read/Write, Granted by Terminated Employee',
    service: 'Notion',
    data_access_level: 5,
    integration_depth: 5,
    last_activity_date: daysAgo(180),
    owner_email: 'aisha.patel@company.com',
    owner_active: false,
  },
  {
    id: 'demo-salesforce-admin',
    integration_name: 'Salesforce API Key — Admin Scope, Full CRM CRUD Access, Granted by Terminated Employee',
    service: 'Salesforce',
    data_access_level: 5,
    integration_depth: 4,
    last_activity_date: daysAgo(134),
    owner_email: 'derek.kim@company.com',
    owner_active: false,
  },
  {
    id: 'demo-github-org-token',
    integration_name: 'GitHub OAuth Token — Admin Scope, Full Repository Read/Write, Granted by Terminated Employee',
    service: 'GitHub',
    data_access_level: 4,
    integration_depth: 5,
    last_activity_date: daysAgo(95),
    owner_email: 'rachel.wu@company.com',
    owner_active: false,
  },
  {
    id: 'demo-slack-bot-token',
    integration_name: 'Slack OAuth Token — Admin Scope, Full Channel Read/Write, Granted by Terminated Employee',
    service: 'Slack',
    data_access_level: 5,
    integration_depth: 5,
    last_activity_date: daysAgo(47),
    owner_email: 'sarah.chen@company.com',
    owner_active: false,
  },
  {
    id: 'demo-stripe-webhook',
    integration_name: 'Stripe Webhook — Read-Write Scope, Billing and Payment Data',
    service: 'Stripe',
    data_access_level: 3,
    integration_depth: 3,
    last_activity_date: daysAgo(62),
    owner_email: 'emma.wilson@company.com',
    owner_active: true,
  },
  {
    id: 'demo-hubspot-crm',
    integration_name: 'HubSpot OAuth Token — Read-Write Scope, CRM Contact and Deal Data',
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
