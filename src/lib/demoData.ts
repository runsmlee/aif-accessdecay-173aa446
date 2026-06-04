import type { Integration } from '../types';

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

// 7 visceral demo integrations: recognizable SaaS tools with departed employees
// and real urgency. Top items are Critical — inactive owners, high access, months dormant.
// Lower items are Medium — active owners, less access, shorter dormancy.
// Names include indexable security terminology (OAuth token, API key, admin access,
// read/write scope) so the demo data doubles as SEO-discoverable content.
export const DEMO_INTEGRATIONS: Integration[] = [
  {
    id: 'demo-slack-bot-token',
    integration_name: 'Slack OAuth bot token — full workspace read/write access, abandoned after employee departure',
    service: 'Slack',
    data_access_level: 5,
    integration_depth: 5,
    last_activity_date: daysAgo(47),
    owner_email: 'sarah.chen@company.com',
    owner_active: false,
  },
  {
    id: 'demo-jira-webhook',
    integration_name: 'Jira OAuth token (webhook) — full read/write project access, abandoned after employee departure',
    service: 'Jira',
    data_access_level: 4,
    integration_depth: 4,
    last_activity_date: daysAgo(212),
    owner_email: 'marcus.rivera@company.com',
    owner_active: false,
  },
  {
    id: 'demo-notion-workspace',
    integration_name: 'Notion API key — admin workspace read/write access, orphaned after employee departure',
    service: 'Notion',
    data_access_level: 5,
    integration_depth: 5,
    last_activity_date: daysAgo(180),
    owner_email: 'aisha.patel@company.com',
    owner_active: false,
  },
  {
    id: 'demo-salesforce-admin',
    integration_name: 'Salesforce admin API key — full CRUD access to all CRM objects, abandoned after employee departure',
    service: 'Salesforce',
    data_access_level: 5,
    integration_depth: 4,
    last_activity_date: daysAgo(134),
    owner_email: 'derek.kim@company.com',
    owner_active: false,
  },
  {
    id: 'demo-github-org-token',
    integration_name: 'GitHub org admin OAuth token — full repository read/write access, former employee credential',
    service: 'GitHub',
    data_access_level: 4,
    integration_depth: 5,
    last_activity_date: daysAgo(95),
    owner_email: 'rachel.wu@company.com',
    owner_active: false,
  },
  {
    id: 'demo-stripe-webhook',
    integration_name: 'Stripe API key (webhook) — read/write billing and payment data access',
    service: 'Stripe',
    data_access_level: 3,
    integration_depth: 3,
    last_activity_date: daysAgo(62),
    owner_email: 'emma.wilson@company.com',
    owner_active: true,
  },
  {
    id: 'demo-hubspot-crm',
    integration_name: 'HubSpot OAuth token — read/write CRM contact and deal access',
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
