import Papa from 'papaparse';
import type { Integration, CSVRow, ParseResult } from '../types';

function generateId(name: string, service: string, index: number): string {
  return `${name.toLowerCase().replace(/\s+/g, '-')}-${service.toLowerCase().replace(/\s+/g, '-')}-${index}`;
}

export function parseCSV(csvContent: string): ParseResult {
  const result = Papa.parse<CSVRow>(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header: string) => header.trim(),
  });

  // Check if parsed data has any valid structure (at least some expected headers)
  const expectedHeaders = ['integration_name', 'service', 'data_access_level', 'last_activity_date'];
  const hasValidHeaders = result.meta.fields
    ? expectedHeaders.some((h) => result.meta.fields!.includes(h))
    : false;

  if (!hasValidHeaders && result.data.length === 0) {
    throw new Error(
      'Invalid CSV format. Expected headers: integration_name, service, data_access_level, integration_depth, last_activity_date, owner_email, owner_active'
    );
  }

  const integrations: Integration[] = [];
  let skippedCount = 0;

  result.data.forEach((row, index) => {
    const name = row.integration_name?.trim();
    const service = row.service?.trim();
    const dataAccessRaw = row.data_access_level?.trim();
    const depthRaw = row.integration_depth?.trim();
    const dateRaw = row.last_activity_date?.trim();
    const email = row.owner_email?.trim();
    const activeRaw = row.owner_active?.trim();

    // Validate required fields
    if (!name || !service || !dataAccessRaw || !dateRaw || !email) {
      skippedCount++;
      return;
    }

    const data_access_level = parseInt(dataAccessRaw, 10);
    const last_activity_date = dateRaw;

    if (isNaN(data_access_level)) {
      skippedCount++;
      return;
    }

    // Optional fields with defaults
    const integration_depth = depthRaw ? parseInt(depthRaw, 10) : 1;
    const owner_active = activeRaw ? activeRaw.toLowerCase() === 'true' : true;

    integrations.push({
      id: generateId(name, service, index),
      integration_name: name,
      service,
      data_access_level: Math.max(1, Math.min(5, data_access_level)),
      integration_depth: isNaN(integration_depth) ? 1 : Math.max(1, Math.min(5, integration_depth)),
      last_activity_date,
      owner_email: email,
      owner_active,
    });
  });

  return { integrations, skippedCount };
}
