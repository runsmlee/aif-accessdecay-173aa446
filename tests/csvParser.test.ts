import { describe, it, expect } from 'vitest';
import { parseCSV } from '../src/lib/csvParser';

describe('parseCSV', () => {
  it('correctly parses a valid CSV with headers: integration_name, service, data_access_level, integration_depth, last_activity_date, owner_email, owner_active', () => {
    const csv = `integration_name,service,data_access_level,integration_depth,last_activity_date,owner_email,owner_active
Salesforce Sync,Salesforce,5,4,2024-01-15,admin@company.com,true
Slack Bot,Slack,2,3,2024-03-01,hr@company.com,false`;
    const result = parseCSV(csv);
    expect(result.integrations).toHaveLength(2);
    expect(result.skippedCount).toBe(0);
    expect(result.integrations[0].integration_name).toBe('Salesforce Sync');
    expect(result.integrations[0].service).toBe('Salesforce');
    expect(result.integrations[0].data_access_level).toBe(5);
    expect(result.integrations[0].integration_depth).toBe(4);
    expect(result.integrations[0].owner_active).toBe(true);
    expect(result.integrations[1].owner_active).toBe(false);
    expect(result.integrations[1].owner_email).toBe('hr@company.com');
  });

  it('skips rows with missing required fields and reports skipped count', () => {
    const csv = `integration_name,service,data_access_level,integration_depth,last_activity_date,owner_email,owner_active
Valid Service,HubSpot,3,2,2024-02-01,user@company.com,true
Missing Fields,Slack,,,2024-01-01,user2@company.com,true
Another Valid,Zapier,1,1,2024-04-01,ops@company.com,false`;
    const result = parseCSV(csv);
    expect(result.integrations).toHaveLength(2);
    expect(result.skippedCount).toBe(1);
  });

  it('handles CSV with extra columns gracefully (ignores extras)', () => {
    const csv = `integration_name,service,data_access_level,integration_depth,last_activity_date,owner_email,owner_active,extra_col,another_extra
My App,Stripe,4,3,2024-01-01,dev@company.com,true,extra_value,another_value`;
    const result = parseCSV(csv);
    expect(result.integrations).toHaveLength(1);
    expect(result.integrations[0].integration_name).toBe('My App');
    expect(result.skippedCount).toBe(0);
  });

  it('throws descriptive error for completely invalid (non-CSV) file content', () => {
    const invalidContent = 'This is not CSV content at all {{{}}}';
    expect(() => parseCSV(invalidContent)).toThrow();
  });
});
