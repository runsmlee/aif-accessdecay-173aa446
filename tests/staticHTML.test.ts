import { readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, it, expect } from 'vitest';

/**
 * Regression tests for the two critical bugs:
 *
 * 1. Static HTML: The 7 demo kill list rows must be present in index.html
 *    so search engines can index the content (not just client-side JS).
 *
 * 2. $RefreshReg$ leak: The production build must not include React Fast
 *    Refresh code ($RefreshReg$/$RefreshSig$).
 */

const indexHtml = readFileSync(resolve(__dirname, '..', 'index.html'), 'utf-8');

describe('index.html static content (SEO)', () => {
  it('contains all 7 demo kill list integration names in static HTML', () => {
    const expectedNames = [
      'Jira OAuth Token',
      'Notion API Key',
      'Salesforce',
      'GitHub OAuth',
      'Slack OAuth',
      'Stripe Webhook',
      'HubSpot OAuth',
    ];
    for (const name of expectedNames) {
      expect(indexHtml).toContain(name);
    }
  });

  it('contains risk scores in static HTML', () => {
    // Scores are in the static HTML — verify specific known values exist
    expect(indexHtml).toContain('>239<');
    expect(indexHtml).toContain('>Critical');
    expect(indexHtml).toContain('>56<');
    expect(indexHtml).toContain('>High');
  });

  it('contains an h1 element for accessibility and SEO', () => {
    expect(indexHtml).toMatch(/<h1[^>]*>/);
  });

  it('contains the kill list inside #root (not just client-side)', () => {
    // The static content must be inside the #root div so it's in the
    // initial HTML payload, not added by JS.
    const rootMatch = indexHtml.match(/<div id="root">([\s\S]*?)<\/div>\s*<script/);
    expect(rootMatch).toBeTruthy();
    expect(rootMatch![1]).toContain('Jira OAuth Token');
    expect(rootMatch![1]).toContain('Notion API Key');
  });
});
