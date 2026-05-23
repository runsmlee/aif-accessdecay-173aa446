# AccessDecay — Product Requirements Document

## Problem
Security teams have no visibility into dormant SaaS API integrations — forgotten OAuth tokens, abandoned webhooks, and stale service accounts that former employees provisioned. These zombie integrations persist silently, creating unmonitored access paths into sensitive data. When breaches happen through these vectors, the remediation response is chaotic because there's no prioritized list of what to kill first. Security analysts currently track this in spreadsheets or not at all, leaving critical exposure gaps open for months.

## Target Users
Security analysts and IT administrators at mid-market companies (200–2000 employees) who manage SaaS sprawl and need to audit third-party API access without enterprise-grade CASB tools.

## Core Feature (default: exactly ONE)
- **Prioritized Kill List Queue**: User uploads a CSV of their SaaS integrations → the scoring engine calculates risk for each row using data access level, integration depth, time since last activity, and employee churn → displays an actionable ranked queue where each item can be revoked or dismissed — Acceptance Criteria: After uploading a valid CSV with ≥5 integration rows, the user sees a ranked list sorted by descending risk score, and clicking "Revoke" on any item marks it as revoked and removes it from the active queue within 1 second.

## Should Have (optional — only if the ONE feature requires it)
- **Risk Breakdown Panel**: When the user clicks a kill list item, a detail panel slides open showing the four scoring factors (data access level, integration depth, days dormant, owner status) with their individual values and contribution to the total score — Acceptance Criteria: Clicking any ranked item reveals a panel within 500ms that displays all four scoring factor values and the computed total score.

## Out of Scope (v1) — LIST AT LEAST 3 things explicitly NOT being built
- **Direct SaaS provider API connections** (OAuth flows for each vendor like Salesforce, Slack, etc.) — would require per-vendor integration work that dilutes focus; CSV upload proves the scoring model works first.
- **Multi-user team collaboration** (role-based access, shared queues, audit logs for multiple users) — tempting for a security product but the single analyst workflow validates the core loop without organizational complexity.
- **Automated scheduled scanning and alerts** (cron-based re-scanning, Slack/email notifications for new dormant integrations) — competitors offer this but it's a retention feature, not an acquisition feature; v1 proves value on demand.
- **Compliance reporting and export** (SOC 2 evidence, PDF audit reports) — adjacent to security remediation but shifts the product from "action tool" to "documentation tool."

## Success Metrics
- Primary: User uploads CSV and revokes at least one integration within 60 seconds of first visit
- Secondary: ≥80% of uploaded integrations receive distinct risk scores (algorithm differentiates meaningfully, not all items tied)

## Design Principles
- **Action over observation**: Every pixel drives toward revoking access. No passive dashboards, no metric cards that don't lead to a revoke button. The kill list IS the interface.
- **Urgency through clarity**: Risk scores and rankings use the #EF4444 red palette to communicate severity instantly. Dormant = dangerous until proven otherwise.
- **The hero contains the working ONE feature directly** — no "Get Started" button, no onboarding flow. The CSV uploader and kill list are immediately visible and functional on first load.
