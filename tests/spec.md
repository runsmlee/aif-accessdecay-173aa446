# Test Specifications

## Unit Tests (Vitest + React Testing Library)

### scoring.test.ts
- [ ] `calculateRiskScore` returns 0 for an integration with last activity today and active owner
- [ ] `calculateRiskScore` returns highest score when data access is admin (5), depth is 5, last activity is 365 days ago, and owner has left
- [ ] `calculateRiskScore` ranks a dormant admin integration higher than a recently active read-only integration
- [ ] `calculateRiskScore` handles edge case: missing optional fields default to safe values (depth=1, owner_active=true)
- [ ] `rankIntegrations` returns items sorted by descending risk score
- [ ] `rankIntegrations` assigns equal-ranked items a stable secondary sort by integration name

### csvParser.test.ts
- [ ] `parseCSV` correctly parses a valid CSV with headers: integration_name, service, data_access_level, integration_depth, last_activity_date, owner_email, owner_active
- [ ] `parseCSV` skips rows with missing required fields and reports skipped count
- [ ] `parseCSV` handles CSV with extra columns gracefully (ignores extras)
- [ ] `parseCSV` throws descriptive error for completely invalid (non-CSV) file content

### CSVUploader.test.tsx
- [ ] renders file input with accept=".csv" attribute
- [ ] displays sample CSV format link/text so user knows the expected format
- [ ] clicking upload with valid file calls onUpload callback with parsed integrations
- [ ] shows inline error message for non-CSV file selection
- [ ] shows loading state during file parsing

### KillList.test.tsx
- [ ] renders empty state with prompt to upload CSV when no integrations exist
- [ ] renders list items sorted by descending risk score
- [ ] each list item displays: integration name, service, risk score, and "Revoke" button
- [ ] clicking "Revoke" removes item from active list and shows "Revoked" badge
- [ ] revoked items move to a "Revoked" section below the active queue
- [ ] items with risk score ≥ 80 display in high-severity red styling (#EF4444)
- [ ] items with risk score 40–79 display in medium-severity amber styling
- [ ] items with risk score < 40 display in low-severity gray styling

### KillListItem.test.tsx
- [ ] renders integration name, service name, risk score, and days dormant
- [ ] clicking item opens detail panel showing four scoring factors
- [ ] clicking "Revoke" button calls onRevoke callback with correct integration ID
- [ ] displays "Revoked" state when isRevoked prop is true, hiding the Revoke button

### RiskBreakdown.test.tsx
- [ ] displays all four scoring factors: data access level, integration depth, days dormant, owner status
- [ ] shows individual factor values and their weighted contribution
- [ ] shows computed total risk score that matches sum of weighted factors

## User Journey Tests

### Primary Workflow
1. App loads → hero section visible with CSV uploader and empty kill list queue, no "Get Started" gate
2. User uploads valid CSV with 10 integrations → kill list populates within 2 seconds, sorted by descending risk score
3. User clicks highest-risk item → detail panel slides open showing risk factor breakdown
4. User clicks "Revoke" on highest-risk item → item moves to "Revoked" section, list re-renders
5. User refreshes page → previously loaded integrations and revoked state persist (localStorage)

### Edge Case Workflow
1. User uploads CSV with only 2 valid rows out of 5 → kill list shows 2 items, notification says "3 rows skipped due to missing data"
2. User uploads a second CSV → new integrations merge with existing list, re-ranked together

## Acceptance Criteria Checklist
(Reviewer verifies these against PRD.md Must Have and Should Have features)
- [ ] AC: After uploading a valid CSV with ≥5 integration rows, the user sees a ranked list sorted by descending risk score, and clicking "Revoke" on any item marks it as revoked and removes it from the active queue within 1 second
- [ ] AC: Clicking any ranked item reveals a panel within 500ms that displays all four scoring factor values and the computed total score
