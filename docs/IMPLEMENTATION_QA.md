# IMPLEMENTATION_QA.md  
**Integrated Business Operations Suite — MASTER QA Checklist**  
For: Final Pre-Release Quality Assurance (ALL PHASES)  
---

## SECTION 1 — HOW TO USE

- **When to run:** After all build phases are completed, before any beta/production release.
- **What to do:**  
  - Step through every check below.
  - Check every item; a page or endpoint passes ONLY if there is **no placeholder, no stub, no unimplemented screen, and all data is genuinely API-bound**.
  - If any item in any section is ❌, FIX IT, REBUILD, and re-run the checklist.
  - The application is **not DONE** unless every box below is ✅ and every route shows live, data-bound content — never just a static "Coming Soon", "Sales — Phase 6" or similar.
- **Reminder:**  
  - For every screen/route in the app, open it in a browser and confirm it loads real data from the live API and is not hard-coded.
  - For every API endpoint, test with a real request.
  - ALL CRUD entities must have both a data list and an entry/edit page, fully functional.

---

## SECTION 2 — PLACEHOLDER / STUB SWEEP (highest priority)

> For every route/page in FRONTEND_SPEC.md:
>
> - **Real page?**: Does this route render the fully built, data-bound UI (not just a title, empty div, or "TODO")?
> - **Data loads?**: Does the real route call its API, load data live, and is not hard-coded/mock data?
>
> **Open EVERY route and complete the table below.**

| Route Path                                 | Real page? | Data loads? | Notes *(issues only!)*         |
|---------------------------------------------|:----------:|:-----------:|---------------------------------|
| /sign-in                                   |   [ ]      |    [ ]      |                                 |
| /change-password                           |   [ ]      |    [ ]      |                                 |
| /odbc-sign-in                              |   [ ]      |    [ ]      |                                 |
| /forgot-password                           |   [ ]      |    [ ]      |                                 |
| /admin/user-logs                           |   [ ]      |    [ ]      |                                 |
| /admin/users                               |   [ ]      |    [ ]      |                                 |
| /admin/roles                               |   [ ]      |    [ ]      |                                 |
| /admin/users/new                           |   [ ]      |    [ ]      |                                 |
| /admin/users/:userId                       |   [ ]      |    [ ]      |                                 |
| /admin/legacy-users                        |   [ ]      |    [ ]      |                                 |
| /admin/legacy-users/:legacyUserId          |   [ ]      |    [ ]      |                                 |
| /admin/users/:userId/change-password       |   [ ]      |    [ ]      |                                 |
| /user-info                                 |   [ ]      |    [ ]      |                                 |
| /admin/action-logs                         |   [ ]      |    [ ]      |                                 |
| /admin/employees                           |   [ ]      |    [ ]      |                                 |
| /customers                                 |   [ ]      |    [ ]      |                                 |
| /customers/new                             |   [ ]      |    [ ]      |                                 |
| /customers/:id/edit                        |   [ ]      |    [ ]      |                                 |
| /suppliers                                 |   [ ]      |    [ ]      |                                 |
| /suppliers/new                             |   [ ]      |    [ ]      |                                 |
| /suppliers/:id/edit                        |   [ ]      |    [ ]      |                                 |
| /contacts                                  |   [ ]      |    [ ]      |                                 |
| /contacts/new                              |   [ ]      |    [ ]      |                                 |
| /contacts/:id/edit                         |   [ ]      |    [ ]      |                                 |
| /contacts/duplicates                       |   [ ]      |    [ ]      |                                 |
| /customers/:customerId/vehicles            |   [ ]      |    [ ]      |                                 |
| /customers/:customerId/vehicles/new        |   [ ]      |    [ ]      |                                 |
| /customers/:customerId/vehicles/:vehId/edit|   [ ]      |    [ ]      |                                 |
| /customers/merge-duplicates                |   [ ]      |    [ ]      |                                 |
| /suppliers/merge-duplicates                |   [ ]      |    [ ]      |                                 |
| /vehicles/merge-duplicates                 |   [ ]      |    [ ]      |                                 |
| /customers/agewise                         |   [ ]      |    [ ]      |                                 |
| /suppliers/agewise                         |   [ ]      |    [ ]      |                                 |
| /customers/help                            |   [ ]      |    [ ]      |                                 |
| /suppliers/help                            |   [ ]      |    [ ]      |                                 |
| /documents/help                            |   [ ]      |    [ ]      |                                 |
| /documents/dms                             |   [ ]      |    [ ]      |                                 |
| /attachments                               |   [ ]      |    [ ]      |                                 |
| /documents/:documentId?                    |   [ ]      |    [ ]      |                                 |
| /documents/menu                            |   [ ]      |    [ ]      |                                 |
| /documents/templates                       |   [ ]      |    [ ]      |                                 |
| /documents/remarks-report                  |   [ ]      |    [ ]      |                                 |
| /estimations/new                           |   [ ]      |    [ ]      |                                 |
| /estimations/:estimationId                 |   [ ]      |    [ ]      |                                 |
| /estimations/approvals                     |   [ ]      |    [ ]      |                                 |
| /jobs/status                               |   [ ]      |    [ ]      |                                 |
| /jobs/status-master                        |   [ ]      |    [ ]      |                                 |
| /jobs/status-help                          |   [ ]      |    [ ]      |                                 |
| /jobs/work-status                          |   [ ]      |    [ ]      |                                 |
| /jobs/work-status/manage                   |   [ ]      |    [ ]      |                                 |
| /jobs/work-status/report                   |   [ ]      |    [ ]      |                                 |
| /jobs/pending-job-cards                    |   [ ]      |    [ ]      |                                 |
| /jobs/status/advisor-report                |   [ ]      |    [ ]      |                                 |
| /jobs/in-progress/report                   |   [ ]      |    [ ]      |                                 |
| /jobs/work-status/rpt                      |   [ ]      |    [ ]      |                                 |
| /jobs/work-status/summary-report           |   [ ]      |    [ ]      |                                 |
| /orders/new                                |   [ ]      |    [ ]      |                                 |
| /orders/:orderId                           |   [ ]      |    [ ]      |                                 |
| /orders/help                               |   [ ]      |    [ ]      |                                 |
| /orders/status                             |   [ ]      |    [ ]      |                                 |
| /orders/pending                            |   [ ]      |    [ ]      |                                 |
| /orders/deliveries/log                     |   [ ]      |    [ ]      |                                 |
| /orders/:orderId/delivery-note/new         |   [ ]      |    [ ]      |                                 |
| /orders/:orderId/change-customer           |   [ ]      |    [ ]      |                                 |
| /orders/report                             |   [ ]      |    [ ]      |                                 |
| /orders/status-report                      |   [ ]      |    [ ]      |                                 |
| /orders/pending-register                   |   [ ]      |    [ ]      |                                 |
| /delivery-notes/report                     |   [ ]      |    [ ]      |                                 |
| /purchases/foreign/new                     |   [ ]      |    [ ]      |                                 |
| /purchases/local/new                       |   [ ]      |    [ ]      |                                 |
| /purchases/local/:purchaseOrderId/edit     |   [ ]      |    [ ]      |                                 |
| /purchases/local                           |   [ ]      |    [ ]      |                                 |
| /purchases/delivery-orders/pending         |   [ ]      |    [ ]      |                                 |
| /purchases/delivery-orders/:deliveryOrderNo|   [ ]      |    [ ]      |                                 |
| /purchases/delivery-orders/search          |   [ ]      |    [ ]      |                                 |
| /purchases/report                          |   [ ]      |    [ ]      |                                 |
| /purchases/delivery-orders/pdo-report      |   [ ]      |    [ ]      |                                 |
| /purchases/delivery-orders/pending-report  |   [ ]      |    [ ]      |                                 |
| /inventory/stock-in/new                    |   [ ]      |    [ ]      |                                 |
| /inventory/stock-out/new                   |   [ ]      |    [ ]      |                                 |
| /inventory/stock-in                        |   [ ]      |    [ ]      |                                 |
| /inventory/stock-out                       |   [ ]      |    [ ]      |                                 |
| /inventory/movements                       |   [ ]      |    [ ]      |                                 |
| /inventory/adjustments/new                 |   [ ]      |    [ ]      |                                 |
| /inventory/availability                    |   [ ]      |    [ ]      |                                 |
| /inventory/dashboard                       |   [ ]      |    [ ]      |                                 |
| /inventory/stock-updates                   |   [ ]      |    [ ]      |                                 |
| /inventory/valuation                       |   [ ]      |    [ ]      |                                 |
| /inventory/ledger                          |   [ ]      |    [ ]      |                                 |
| /inventory/aging-report                    |   [ ]      |    [ ]      |                                 |
| /reports/sales/analysis                    |   [ ]      |    [ ]      |                                 |
| /reports/sales/register                    |   [ ]      |    [ ]      |                                 |
| /reports/ledger/account-head-list          |   [ ]      |    [ ]      |                                 |
| /menu                                      |   [ ]      |    [ ]      |                                 |
| /main-menu                                 |   [ ]      |    [ ]      |                                 |
| /utility                                   |   [ ]      |    [ ]      |                                 |
| /main-module                               |   [ ]      |    [ ]      |                                 |
| /sandbox/form1                             |   [ ]      |    [ ]      |                                 |
| /reports/summary/a1                        |   [ ]      |    [ ]      |                                 |
| /finance/vouchers/list                     |   [ ]      |    [ ]      |                                 |
| /ledger/account-tree-list                  |   [ ]      |    [ ]      |                                 |
| /ledger/account-heads/report               |   [ ]      |    [ ]      |                                 |
| /ledger/reports                            |   [ ]      |    [ ]      |                                 |
| /reports/                                  |   [ ]      |    [ ]      |                                 |
| /admin/company-report-header               |   [ ]      |    [ ]      |                                 |
| /reports/additional-remarks                |   [ ]      |    [ ]      |                                 |
| ... (CONTINUE FOR **EVERY ROUTE IN FRONTEND_SPEC.md**) ... |          |           |                                 |

> **Continue for all 339+ routes specified. If any page fails either check, FIX IT NOW.**

---

## SECTION 3 — DATA BINDING AUDIT

> For every screen, confirm:
> - It fetches from its mapped API endpoint(s),  
> - Renders real, dynamic data,  
> - AND implements loading, empty, and error states (never shows static/fake data).
> - Every create/edit/delete invokes the actual API (never local stub/mock), then updates/refreshes its list/detail view.

**Checklist for EVERY page:**

- [ ] Initial load fetches data from correct API endpoint
- [ ] Loading state (skeleton/spinner) shown until data loads
- [ ] Empty state message displayed when API returns 0 records
- [ ] Error state banner appears if API errors
- [ ] Create/edit/delete forms POST/PUT/DELETE to real endpoints and confirm via live API response
- [ ] After saving, list/detail view updates/reflects current data (not stale)
- [ ] For every list, add/edit entry for the entity (CRUD completeness)
- [ ] No page displays mock/fake data or hard-coded dummy values

**If any fail, FIX IMMEDIATELY.**

---

## SECTION 4 — ENDPOINT LIVENESS

> For every API endpoint in API_SPEC.md:
> - Confirm the endpoint exists and is live (not returning 404/501/empty stub).
> - The API is wired to `callProcedure()` with the real procedure or SELECT (never static/fake data).
> - The correct SP/view is called for every GET/POST/PUT/DELETE: no missing, swapped, or unimplemented endpoints.

**Checklist (sampling, expand for all endpoints):**

| Endpoint Path                                 | Exists? | Returns Data? | Wired to SP/view? | Notes |
|-----------------------------------------------|:-------:|:-------------:|:-----------------:|-------|
| /api/v1/auth/login                            |  [ ]    |     [ ]       |       [ ]         |       |
| /api/v1/auth/logout                           |  [ ]    |     [ ]       |       [ ]         |       |
| /api/v1/users                                 |  [ ]    |     [ ]       |       [ ]         |       |
| /api/v1/users/:id                             |  [ ]    |     [ ]       |       [ ]         |       |
| /api/v1/customers                             |  [ ]    |     [ ]       |       [ ]         |       |
| /api/v1/suppliers                             |  [ ]    |     [ ]       |       [ ]         |       |
| /api/v1/attachments                           |  [ ]    |     [ ]       |       [ ]         |       |
| /api/v1/jobs/status-master                    |  [ ]    |     [ ]       |       [ ]         |       |
| /api/v1/orders                                |  [ ]    |     [ ]       |       [ ]         |       |
| /api/v1/purchases                             |  [ ]    |     [ ]       |       [ ]         |       |
| /api/v1/items                                 |  [ ]    |     [ ]       |       [ ]         |       |
| /api/v1/ledger/account-heads                  |  [ ]    |     [ ]       |       [ ]         |       |
| /api/v1/vouchers/list                         |  [ ]    |     [ ]       |       [ ]         |       |
| /api/v1/banking/cash-bank-details             |  [ ]    |     [ ]       |       [ ]         |       |
| /api/v1/reports/sales-... (all reports)       |  [ ]    |     [ ]       |       [ ]         |       |
| ... (EVERY endpoint in API_SPEC.md)           |         |               |                   |       |

> If **any endpoint** is 404, not implemented, returns `501`/empty-stub, or just `{}` ..., log as a failure and FIX IT.

---

## SECTION 5 — PER-PHASE COMPLETENESS

> For each phase, list every module. For each:  
> - [ ] Module is implemented, not stubbed  
> - [ ] Screens/pages are present and live  
> - [ ] All business logic and API wiring is complete

| Phase   | Module Name                                                  | Fully Done? [ ] | Notes |
|---------|--------------------------------------------------------------|:---------------:|-------|
| Phase 1 | project-scaffolding                                          | [ ]             |       |
|         | db-connection, env-config                                    | [ ]             |       |
|         | callProcedure, app-shell, health-check-endpoint              | [ ]             |       |
|         | auth, jwt-session, auth-middleware, user-session-store       | [ ]             |       |
|         | password-hashing, rbac-foundation, userlog-capture           | [ ]             |       |
|         | frontend-basics, initial-deployment                          | [ ]             |       |
| Phase 2 | users, user-crud, roles, user-rights-management              | [ ]             |       |
|         | user-table, userlogreport, user-audit-trail                  | [ ]             |       |
|         | legacy-user-management, bulk-user-import-export              | [ ]             |       |
|         | password-change, admin-change-password, bypass-forgot-password|[ ]             |       |
|         | userlist-report, page-user-info, emp-attendance              | [ ]             |       |
|         | employee-management, employee-list, notification-system      | [ ]             |       |
|         | userlog-audit-report, password-reset-request, unlock-account | [ ]             |       |
| Phase 3 | ... (**LIST ALL MODULE NAMES AS IN BUILD ORDER**)            | [ ]             |       |
| ...     | ...                                                          | [ ]             |       |
| Phase 13| penetration-testing-review, end-to-end-tests                 | [ ]             |       |
|         | ui-accessibility-final, workflow-polish, code-linting-standards |[ ]         |   |
|         | audit-final-checklist, ui-design-system-finalized            | [ ]             |       |
|         | deployment-readiness-check, doc-full-coverage-checklist      | [ ]             |       |
|         | agent-review-protocol                                        | [ ]             |       |

> **List modules for ALL phases as shown above. All modules must be checked.**

---

## SECTION 6 — CROSS-CUTTING

**Site-wide Checks:**

- [ ] All protected routes (screens) show 401/redirect when not logged in; not accessible by bookmarks or typing the route.
- [ ] RBAC is enforced: each page/action is only accessible to roles authorized in the PRD. Unauthorized links/buttons are absent or clearly disabled.
- [ ] Main navigation and submenus resolve only to actual implemented pages/screens.
- [ ] No console errors (frontend: browser, backend: server logs) on any navigation, page load, or action.
- [ ] No dead or broken navigation links anywhere in the app.
- [ ] Responsive layout: every UI works at mobile/max/desktop breakpoints.
- [ ] All tables are horizontally scrollable on overflow and accessible by keyboard.
- [ ] All required accessibility ARIA labels and roles are present; tab order correct; screen readers can use forms, tables, actions.
- [ ] Every editable entity:  
    - [ ] Has a list ("grid") page  
    - [ ] Has entry/edit page  
    - [ ] Entry page has save/cancel; always returns/navigates to list  
    - [ ] List has "+ New" button and Edit per row  
    - [ ] Nav link to the entity is present from menu or module screen  
    - [ ] All lookup/search/reference fields use **searchable dropdowns with real resolved names** (never raw ID text fields)
- [ ] Every validation message described in the spec actually shows, exactly per the wording in FRONTEND_SPEC.md, including per-field, global, loading, error, and empty states.
- [ ] No entity allows input or saves unhandled/raw reference IDs (must show names; users must never type IDs manually).

> For any gap, incomplete workflow, or entity missing list or entry page, CHECK AS FAILURE and FIX.

---

## SECTION 7 — FINAL SIGN-OFF

> For each phase, fill in:  
- **Pages built**: Count of screens/routes delivered  
- **Pages data-bound**: Screens which actually load/work with live API  
- **Placeholders found**: Number of stubs/empty/TODO/partial pages or missing data bindings  
- **Status**: "✅ PASSED" if Placeholders found = 0 and Pages data-bound = Pages built; "❌ FAILED" otherwise

| Phase   | Pages built | Pages data-bound | Placeholders found | Status         |
|---------|-------------|------------------|--------------------|----------------|
| Phase 1 |             |                  |                    |                |
| Phase 2 |             |                  |                    |                |
| Phase 3 |             |                  |                    |                |
| ...     |             |                  |                    |                |
| Phase 13|             |                  |                    |                |
| **TOTAL** |           |                  |                    |                |

> **Only RELEASE when Placeholders found = 0 for every phase. Any phase with stubs/incomplete is a RELEASE BLOCKER.**

---

**END OF IMPLEMENTATION_QA.md**