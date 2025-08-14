# Fuse Energy Front-End Interview Prep

Runnable React + TypeScript project (Vite) with a small in-memory API and feature pages. Use it locally or on CodeSandbox.

## Run locally

```bash
pnpm i # or npm i / yarn
pnpm dev
```

Open http://localhost:5173

## Import to CodeSandbox

1. Push this folder to a GitHub repo or zip-upload to CodeSandbox
2. Make sure the template is set to Vite + React + TS

## App structure

- `src/pages/DashboardPage.tsx`: KPIs + featured plan
- `src/pages/PlansPage.tsx`: CRUD (create/delete) for plans
- `src/pages/BillingPage.tsx`: Pay user balances
- `src/pages/AdminPage.tsx`: Assign users to plans
- `src/api/client.ts`: In-memory API with latency/errors

## Data model

```ts
type Plan = {
  id: string;
  name: string;
  priceCentsPerKwh: number;
  renewablePercent: number;
  isFeatured?: boolean;
};
type User = {
  id: string;
  name: string;
  email: string;
  planId: string | null;
  balanceCents: number;
  isAdmin?: boolean;
};
```

## Interview-style tasks

Focus on correctness, code clarity, and incremental commits. UI polish is nice-to-have.

1. Plans: Edit and feature toggle

- Add inline edit for plan name and price on `PlansPage`
- Add a control to toggle `isFeatured` (only one plan should be featured at a time)
- Acceptance:
  - Editing persists after refresh (simulate by reloading page; since API is in-memory, you can keep state in URL or localStorage)
  - Exactly one plan can have `isFeatured = true`

2. Dashboard: Choose plan flow

- On `DashboardPage`, wire the "Choose plan" button to assign the featured plan to a specific user (e.g., the first non-admin user)
- Show a toast or inline success message
- Acceptance:
  - The user now has that `planId`
  - Dashboard KPIs update accordingly

3. Billing: Validation + optimistic update

- Validate that payment amount > 0 and not more than outstanding balance when positive
- Apply optimistic UI update, then rollback on API error
- Acceptance:
  - Errors show inline and do not crash the app
  - On failure, balances revert

4. Admin: Search + sort

- Add text search by user name and plan name
- Add ascending/descending sort by balance and name
- Acceptance:
  - Search filters result set
  - Sort toggles work and are accessible

5. API layer: Error utilities and retry

- Create a small `fetchWithRetry` util used by API methods to retry transient failures (e.g., 2 retries, exp. backoff)
- Acceptance:
  - API calls succeed more reliably despite random failures

6. Types & tests

- Strengthen types: extract `MoneyCents` branded type; add utility formatters
- Add a couple of unit tests for utils with Vitest (optional if time-boxed)

## Bonus ideas

- Persist state to `localStorage` and hydrate on boot
- Extract a generic `DataTable` component with empty/loading/error states
- Add route-level loaders/actions to demonstrate data APIs

## Notes

- Keep functions small and descriptive. Prefer early returns and meaningful names.
- Handle edge cases: empty datasets, errors, and loading.
- Use React dev tools thinking: derive state where possible, avoid duplication.
