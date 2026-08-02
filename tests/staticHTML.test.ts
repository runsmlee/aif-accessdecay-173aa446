import { readFileSync, existsSync, readdirSync } from 'fs';
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

  it('contains exactly 7 kill list items in static HTML', () => {
    // Count the number of <article> elements in the static HTML
    const articleCount = (indexHtml.match(/<article/g) || []).length;
    expect(articleCount).toBe(7);
  });

  it('contains structured data: service names and dormancy periods', () => {
    expect(indexHtml).toContain('days dormant');
    expect(indexHtml).toContain('Jira');
    expect(indexHtml).toContain('Notion');
    expect(indexHtml).toContain('Salesforce');
    expect(indexHtml).toContain('GitHub');
    expect(indexHtml).toContain('Slack');
  });
});

describe('production build output (regression)', () => {
  const distDir = resolve(__dirname, '..', 'dist');

  it('dist/index.html preserves static kill list content if build exists', () => {
    if (!existsSync(distDir)) return; // Skip if build hasn't been run
    const builtHtml = readFileSync(resolve(distDir, 'index.html'), 'utf-8');
    // The build must preserve the static HTML content inside #root
    expect(builtHtml).toContain('Jira OAuth Token');
    expect(builtHtml).toContain('Notion API Key');
    expect(builtHtml).toContain('Active Queue');
    expect(builtHtml).toContain('Critical');
  });

  it('production JS must not contain React Fast Refresh code', () => {
    if (!existsSync(distDir)) return; // Skip if build hasn't been run
    const assetsDir = resolve(distDir, 'assets');
    if (!existsSync(assetsDir)) return;

    const jsFiles = readdirSync(assetsDir).filter((f) => f.endsWith('.js'));
    expect(jsFiles.length).toBeGreaterThan(0);

    for (const jsFile of jsFiles) {
      const content = readFileSync(resolve(assetsDir, jsFile), 'utf-8');
      // $RefreshReg$ and $RefreshSig$ are React Fast Refresh runtime functions
      // that must NEVER appear in production builds
      expect(content).not.toContain('RefreshReg');
      expect(content).not.toContain('RefreshSig');
      expect(content).not.toContain('react-refresh');
    }
  });
});
