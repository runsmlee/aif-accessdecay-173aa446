import type { Integration } from '../types';

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

export const DEMO_INTEGRATIONS: Integration[] = [
  {
    id: 'demo-okta-sso-bridge',
    integration_name: 'Okta SSO Bridge',
    service: 'Okta',
    data_access_level: 5,
    integration_depth: 5,
    last_activity_date: daysAgo(210),
    owner_email: 'david.kim@company.com',
    owner_active: false,
  },
  {
    id: 'demo-aws-iam-cross-account',
    integration_name: 'AWS IAM Cross-Account',
    service: 'AWS',
    data_access_level: 5,
    integration_depth: 5,
    last_activity_date: daysAgo(180),
    owner_email: 'rachel.wu@company.com',
    owner_active: false,
  },
  {
    id: 'demo-jira-project-mirror',
    integration_name: 'Jira Project Mirror',
    service: 'Jira',
    data_access_level: 4,
    integration_depth: 4,
    last_activity_date: daysAgo(156),
    owner_email: 'lisa.park@company.com',
    owner_active: false,
  },
  {
    id: 'demo-salesforce-admin-sync',
    integration_name: 'Salesforce Admin Sync',
    service: 'Salesforce',
    data_access_level: 5,
    integration_depth: 5,
    last_activity_date: daysAgo(89),
    owner_email: 'mike.torres@company.com',
    owner_active: false,
  },
  {
    id: 'demo-zapier-full-oauth',
    integration_name: 'Zapier Full OAuth',
    service: 'Zapier',
    data_access_level: 5,
    integration_depth: 4,
    last_activity_date: daysAgo(47),
    owner_email: 'sarah.chen@company.com',
    owner_active: false,
  },
  {
    id: 'demo-github-org-sync',
    integration_name: 'GitHub Org Sync',
    service: 'GitHub',
    data_access_level: 4,
    integration_depth: 4,
    last_activity_date: daysAgo(78),
    owner_email: 'alex.johnson@company.com',
    owner_active: true,
  },
  {
    id: 'demo-hubspot-crm-connector',
    integration_name: 'HubSpot CRM Connector',
    service: 'HubSpot',
    data_access_level: 4,
    integration_depth: 3,
    last_activity_date: daysAgo(62),
    owner_email: 'emma.wilson@company.com',
    owner_active: true,
  },
  {
    id: 'demo-slack-workspace-bot',
    integration_name: 'Slack Workspace Bot',
    service: 'Slack',
    data_access_level: 3,
    integration_depth: 3,
    last_activity_date: daysAgo(34),
    owner_email: 'james.li@company.com',
    owner_active: true,
  },
  {
    id: 'demo-stripe-payment-webhook',
    integration_name: 'Stripe Payment Webhook',
    service: 'Stripe',
    data_access_level: 3,
    integration_depth: 2,
    last_activity_date: daysAgo(45),
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
    owner_email: 'tom.brown@company.com',
    owner_active: true,
  },
];

export function getDemoIntegrations(): Integration[] {
  return DEMO_INTEGRATIONS.map((item) => ({ ...item }));
}
