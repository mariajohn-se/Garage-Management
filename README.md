# Integrated Business Operations Suite

DB-Preserve build: an Express/TypeScript + React SPA over the existing legacy SQL Server
database. No schema changes; writes go through stored procedures, reads through views/tables.
See `docs/IMPLEMENTATION_PLAN.md` and `docs/PROJECT_PHASE_PROGRESS.md` for the phased build plan
and current status.

## Structure

```
backend/    Express + TypeScript API (auth, RBAC, DB access)
frontend/   React 19 + Vite SPA
db/         (reserved for seed/reference scripts - no migrations, per DB-Preserve mode)
scripts/    One-off operational scripts (e.g. schema inspection)
docs/       (reserved for additional docs)
```

## Prerequisites

- Node.js 18+
- Network access to the SQL Server instance in `backend/.env`

## Local development

```bash
cd backend && npm install && npm run dev     # http://localhost:3001
cd frontend && npm install && npm run dev    # http://localhost:3000 (proxies /api/v1 to :3001)
```

`backend/.env` holds the real DB connection and JWT secrets (copy `.env.example` and fill in your
own if starting fresh - this file is gitignored). Note: SQL Server 2008 does not support the TLS
versions required by `encrypt: true` under modern Node/OpenSSL - keep `DB_ENCRYPT=false` unless
connecting to a newer instance with a valid certificate.

## Docker

```bash
docker-compose up --build
```

Serves the app on `http://localhost` (nginx on :80, proxying `/api/v1` to the backend container
and everything else to the static frontend container). The database is external and not part of
the compose stack.

## Known gaps / judgment calls (Phase 1)

- **No email column exists** on `USERS` or `EmployeeDet` in the live database. Password-reset-by-
  email (BR-04/BR-09) is implemented end-to-end except final delivery - it logs the reset link
  server-side instead of emailing it. Wire in a real email source once one exists.
- **RBAC roles are a provisional heuristic.** The live schema has no named-role column - only
  `USERS.Option` (values 0/1, undocumented meaning) and `UserRights(User, mnuId)`, a per-menu
  access list, not a role table. `Option = 1` is mapped to `Administrator` and everything else to
  `Standard`; `Supervisor` is unreachable from current data. Confirm the real semantics with
  someone who knows the legacy app before relying on this for access control, and revisit in
  Phase 2 (User & Role Management).
- **Several write stored procedures are placeholders** (`spUserSetPassword`,
  `spUserSetDisableState`, `spUserLogInsert`) - `DB_CONNECTION_SPEC_v12.md` names the affected
  tables but not the procedures, and explicitly notes undocumented procedures exist for this.
  Run `scripts/inspect-schema.js` (or ask someone with access to the stored-procedure catalog)
  to find the real names and swap them in before these write paths go live.
- **No backend endpoint was specified for the "ODBC Sign In" page** in `API_SPEC_v12.md` despite
  it being fully specified in `FRONTEND_SPEC_v12.md`. Added `/api/v1/auth/odbc-test-connection`
  and `/api/v1/auth/odbc-login` as a reasonable fill; reconsider if the real intent differs.
- **SSO and MFA fields described in `FRONTEND_SPEC_v12.md`'s Sign In page are not implemented** -
  no backend supports them, so they were left out rather than built as non-functional UI.
- The UI has been verified via `tsc`, production build, and the Vite dev server proxying live to
  the backend/DB - it has not been visually verified in an actual browser (no browser automation
  tooling was available in this environment).

## Known gaps / judgment calls (Phase 2)

- **`USERS.Option`'s two values do not support a Standard/Supervisor/Administrator role
  system**, and `UserRights(User, mnuId)` grants menu access per individual user, not per a
  shared "role" - there is no role-template concept anywhere in the real schema. The `/admin/roles`
  page ("User Rights Management" in the spec) was therefore redesigned as a per-user menu
  permission editor rather than the role x permission matrix the spec describes, since the
  matrix concept doesn't correspond to anything in the actual data. Confirm real intent with
  someone who knows the legacy app.
- **`UserTable` (the "Legacy User Management" entity) has only two columns** - a device ID and
  a PC name - and 0 rows in production. It looks like a workstation registration table, not a
  legacy user-account entity with email/status/migration as the spec assumed. The
  `/admin/legacy-users` page shows the real data as-is; the "migrate to new user" workflow
  the spec describes was not built since there's nothing meaningful to migrate.
- **`EmployeeSql` (the mandated read view for Employee List) returns 0 rows in production**
  even though the underlying `EmployeeDet` table has 15 real rows - its `INNER JOIN`s to
  `SectionSql`/`DepartmentSql` apparently don't match any real `EmployeeDet.SectionID`/`DeptID`
  value. This is a pre-existing legacy data/view issue, not a bug in this build, and per
  DB-Preserve mode the view cannot be altered to work around it - `/admin/employees` will
  legitimately show "no employees found" until that's fixed upstream.
- **Employee Attendance (`emp-attendance`) was not built this session** - deprioritized given
  the volume of Phase 2 work; the route/spec (`/hr/attendance/list`) is still open.
- **The "Notification System" module has nothing to implement** - `FRONTEND_SPEC_v12.md` was
  searched in full and contains no bell-icon/notification-center/toast-list UI spec anywhere.
  This isn't a skipped stub; there's no documented UI to build.
- **Bulk user import/export was undocumented in the spec** (the User List page only says
  "opens file dialog/modal" with no field list or format). Implemented a working plain-CSV
  import (`username,password,role` columns) and CSV export rather than leaving the buttons
  non-functional, but this is a judgment call, not a confirmed spec.
- **Write endpoints (create/update/delete/roles/reset-password/import) were verified by
  typecheck, build, and code review only - not executed against the live production
  database.** They call placeholder stored procedure names (same caveat as Phase 1) that
  almost certainly don't exist yet, and this is real production data (real user accounts) -
  running them would either fail loudly (missing SP) or, if a same-named SP happens to exist
  for something else, do something unintended. Confirm the real SP names first (see Schema
  verification below), then test writes against a staging copy if one exists.
- Two conflicting "Employee List" specs exist in `FRONTEND_SPEC_v12.md` (`/admin/employees` vs
  a richer `/hr/employees` variant with different testids/pagination). Used the one matching
  the phase doc's requested route (`/admin/employees`).

## Known gaps / judgment calls (Phase 3)

- **The database is SQL Server 2008 R2** (confirmed live via `SERVERPROPERTY('ProductVersion')`
  = 10.50.x), which predates `OFFSET ... FETCH NEXT` (added in SQL Server 2012/11.0). Using it
  against the live Customer/Supplier/Vehicle lists (6565/430/7442 real rows) threw "Invalid
  usage of the option NEXT in the FETCH statement" - fixed by switching to a `ROW_NUMBER()`
  windowing pattern (`queryViewPaginated` in `backend/src/db/callProcedure.ts`), which works on
  SQL Server 2005+. Worth checking other phases for the same OFFSET/FETCH assumption.
- **`ccode` on `CustomerSql`/`SupplierSql` is a constant company code, not a per-row key** -
  every one of the 6565 customer rows and 430 supplier rows shares the same `ccode` value. The
  real identifiers are `CustId`/`SuppID` (confirmed distinct-count = row-count for both). All
  repositories/routes here key on those, not `ccode`, despite `IMPLEMENTATION_PHASE3_v12.md`'s
  examples implying otherwise.
- **There is no working link between vehicles and customers anywhere in the schema.**
  `CustomerVehicleSql` is `SELECT * FROM CustomerVehicle`, and that table's `Ccode` column is
  NULL on all 7442 real rows. FRONTEND_SPEC_v12.md/IMPLEMENTATION_PHASE3_v12.md both assume
  vehicles are looked up "by customer" (`/customers/:customerId/vehicles`) - built `/vehicles`
  as a standalone registry instead, and BR-25 ("one active customer per vehicle") cannot be
  implemented or verified. If a real link exists, it likely lives in a table this phase didn't
  need to touch (e.g. job/order records referencing both a customer and a VehID).
- **There is no standalone Contact entity.** Contact info (`ContactPerson`/`Phone1`/`Phone2`/
  `email`) lives directly on Customer and Supplier records - FRONTEND_SPEC_v12.md's separate
  Contacts list/entry/duplicate-merge screens were not built since they don't map to any real
  table. Contact fields are edited as part of the Customer/Supplier forms instead.
- **`Supplier.Active`'s polarity (-1 vs 1) could not be confirmed** - unlike Customer's clearly
  skewed 0/1 split (14 vs 6551, with the 0s being obvious internal placeholder accounts),
  Supplier's two values (237 vs 193) both contain well-known real supplier names with no
  discernible pattern. Exposed as a raw `activeFlag` rather than an asserted active/inactive
  status; the Supplier list/form don't show or filter by status as a result.
- **`AgewiseSummary` (the real, documented SP for age-bucket reporting) throws a live SQL
  error** - "Cannot resolve the collation conflict between Latin1_General_CI_AS and
  SQL_Latin1_General_CP1_CI_AS" - for every parameter combination tried. This is a pre-existing
  bug inside the procedure itself (comparing columns of different collations), not something
  introduced or fixable here. The `/customers/agewise` page and endpoint are wired correctly
  and surface this error honestly rather than faking report data.
- **Merge/duplicate-resolution UIs, tagging/segmentation, and bulk import for
  Customers/Suppliers were not built this session** - deprioritized given the volume of Phase 3
  and, for merge/import specifically, the risk of running write operations against 6565 real
  customer and 430 real supplier records without a way to verify the real stored procedures
  first. The "Additional Remarks Report" screen (a separate report over remark history) was
  also not built - only the `Remarks` field on the Customer/Supplier forms themselves.
- **No Customer/Supplier/Vehicle write endpoint (create/update/delete) was executed against
  the live database** - same reasoning as Phase 2: these call placeholder stored procedure
  names, and this is real production data (6565 customers, 430 suppliers, 7442 vehicles).
  Verified by typecheck, build, and code review only.

## Known gaps / judgment calls (Phase 4)

- **Of the ~16 modules `IMPLEMENTATION_PHASE4_v12.md` lists, only two have any real backing
  table**: `AttachmentMaster` (3 rows) and `AdditionalRemarks` (110 rows, with a resolved read
  view - note the real view name is `AditionalRemarksSql`, missing a "d", a genuine legacy typo
  not a mistake here). `Document01`, `DocHead`, and `DocumentAuditLog` do not exist anywhere in
  the schema (`Invalid object name` on direct query) - the "Documents", "Document
  Head/Templates", "DMS Module", and "Document Audit Trail" screens the spec describes have no
  data to bind to and were not built, rather than built as fake/mock pages.
- **Every historical attachment's `Path` is an absolute local Windows filesystem path from the
  original desktop app** (e.g. `C:\Documents and Settings\Administrator\My Documents\...`,
  dated ~2006) - not reachable by this web server. Existing attachments are shown with their
  metadata but flagged `isLegacyPath: true` and cannot be downloaded; only new uploads (stored
  under `backend/uploads/` via real `multer` disk storage, verified with an actual file upload
  in this environment) are downloadable.
- **Attachment/remark write endpoints call placeholder stored procedure names** - verified
  live that this fails safely: a real file upload was performed end-to-end (the file itself
  wrote successfully to `backend/uploads/`), and the subsequent metadata-insert call correctly
  failed with `Could not find stored procedure 'spCreateAttachment'` rather than silently
  succeeding or corrupting anything. No metadata write was left behind.
- **Bulk attachment import, the DMS module's drag-and-drop/multi-upload, and bulk
  delete/tag were not built** - only single-file upload with basic metadata fields, consistent
  with what the real `AttachmentMaster` table can represent (5 columns, no versioning/tagging
  columns exist).
- **The `Codes` field on attachments (a loose linkage code) is a free-text input, not an
  autocomplete against a real entity** - its true semantics (which entity/transaction it should
  reference) aren't documented anywhere in the spec files or schema.

## Known gaps / judgment calls (Phase 5)

Unlike Phase 3-4, every table this phase needs actually exists with substantial real data
(Estimation01: 6396 rows / Estimation02: 49829 line items / Estimation01Sql: 5940 rows,
JobInProgress(Sql): ~425 rows, WorkInProgress(Sql): 33 rows, AssignedJobs(Sql): 1541 rows,
salesOrdrStatusHead: 17 rows). The gaps below are deliberate scope cuts given the volume of
this phase and remaining session time, not data-availability surprises like earlier phases:

- **Built**: Estimation list + detail (using the real, documented `spGetEstmationDetails`
  stored procedure for line items - verified live) + approve/reject (BR-40 RBAC), Job/Work
  Order list, Work In Progress list, Assigned Jobs list, Job Status Master full CRUD (small,
  17-row real reference table).
- **Not built**: Estimation create/edit form (with line-item entry and customer/vehicle/staff
  pickers), Job create/edit form, Calendar view, Gantt view, Work Status Management (bulk
  reassignment/priority), Work Status Report variants (`/rptWorkStatus`,
  `/rptWorkStatusSummary`), Pending Job Cards Help, Job Status Advisorwise Report, and the
  Mobile Job API/MFA requirement (consistent with every other phase - no MFA exists anywhere
  in this app since nothing implements it, so it isn't feigned here either).
- Job assignment (`POST /api/v1/jobs/assign`) and job status updates call placeholder stored
  procedure names, same caveat as every other write path in this codebase - not executed live
  against production. Estimation approve/reject and Job Status Master CRUD were verified live
  only for their read/RBAC paths, not their actual mutations, for the same reason.
- BR-43 ("active job cap per user") was explicitly marked "[Needs confirmation]" in the
  original PRD this spec was generated from and was not implemented here either - there's no
  documented cap to enforce.

## Known gaps / judgment calls (Phase 6)

This phase's real tables all exist with large real datasets (SalesOrdr01Sql: 22835 rows,
Delivery01Sql: 42711 rows, Sales01Sql: 23021 rows, ProformaSales01Sql: 372 rows).

- **Built**: Sales Order list + detail + create/edit form (real customer/vehicle autocomplete,
  a real item-line editor backed by `ItemsSql`, BR-52 required-field validation, BR-57 locks
  product/quantity edits once an order is delivered) + status update + BR-51-checked delete
  (cannot delete an order that already has a delivery note); Order Help (search); Order
  Customer Change (BR-53 Supervisor/Administrator-gated, reason + confirmation required);
  Delivery Notes list + create form (BR-60 validates the order reference actually exists);
  Sales Invoices list; Proforma Sales list; two real analytics reports - **Sales Bill Report**
  (`spSalesBillReport`, verified live returning 1136 real rows) and **Sales Margin Details**
  (`spSalesMarginDetails`, verified live returning 8416 real rows) - both real stored
  procedures, the second documented in `DB_CONNECTION_SPEC_v12.md`, the first confirmed to
  exist via `INFORMATION_SCHEMA.ROUTINES` despite not being in that catalog. BR-59's
  discount/tax formula (`calcDiscountAndTax`/`sumLineTotals`) is unit-tested.
- **Not built**: Order Status Report, Pending Orders List, and eight of the ten
  analytics/reporting endpoints (sales analysis, margin-new, labour-parts, three
  sales-register variants, split-invoice-summary, discount-summary, salesorderstatus-kpi) -
  their stored procedures were not checked. Two more were checked but still not built as
  pages: `spSalesReportCatSub` (category breakdown) executes successfully but returned 0 rows
  for the date range/staff tried, so its real shape couldn't be confirmed; `SP_MarginRpt`
  (margin-new/breakdown) throws the same live collation error described below for
  `sp_LPOAnalysis`.
- **`SalesReturn01`/`SalesReturnBillSql` do not exist anywhere in the schema** (`Invalid
  object name`) - the Sales Return module (list/create/edit return bills) was not built since
  there is nothing to bind it to, similar to Phase 4's Document01/DocHead finding.
- **`PendingOrder` (the view `IMPLEMENTATION_PHASE6_v12.md` names for the Pending Orders
  List) exists but throws "Could not use view or function 'PendingOrder' because of binding
  errors"** on every call - a pre-existing broken view, not something introduced or fixable
  here (DB-Preserve mode forbids altering it).
- Order/delivery-note/PO create, update, and delete write paths were verified live only for
  RBAC (403 for non-privileged tokens), input validation (e.g. rejecting a delivery note whose
  order reference doesn't exist), and the read paths they depend on - the actual write
  mutations (the real `INSERT`/`UPDATE` calls) were **not** executed against this real
  22835-row production order table, since they call placeholder stored procedure names not
  confirmed against the real SP catalog.
- No BR-54 (order confirmation email on creation) - there is still no email infrastructure
  anywhere in this app (see Phase 1's finding that `USERS`/`EmployeeDet` have no email column).

## Known gaps / judgment calls (Phase 7)

Real tables all exist with large real datasets (LocalPurchase01Sql: 20769 rows, Porder01Sql:
7434 rows, PurchaseDo01Sql: 6426 rows, PurchaseDo02Sql: 37843 rows, ProdRequest01Sql: 189
rows, Preturn01: 222 rows, PurchaseVehicleLink: 222 rows).

- **Built**: Local Purchase Order list + create/edit form (real supplier autocomplete, a real
  item-line editor, BR-52-analog validation) + BR-67-gated delete; Foreign Purchase Order list
  + create/edit form (same pattern); Purchase Delivery Order list + **detail page showing real
  line items** (verified live against a real 16-line delivery order); Pending Delivery Orders
  (the real, documented `PendingPurchaseDO` **stored procedure** - confirmed live it is a
  procedure, not a table/view); Purchase Order Item Register; Product Requests (list + create +
  delete); Purchase Returns list; Purchase Vehicle Link (list + create + delete, with a
  same-vehicle-active-link check applying the spec's "only one vehicle per PO" rule);
  **LPO Details Report** (`spLPODetailsReport` - not in `DB_CONNECTION_SPEC_v12.md`'s catalog,
  but confirmed to exist via `INFORMATION_SCHEMA.ROUTINES` and verified live returning 2945
  real rows).
- **Not built**: Purchase DO search (separate from the list), Purchase Order Report, all four
  purchase register reports (account/import/local/local-suppliers), and the Purchase Return
  Bill/Summary and Purchase Bill Import/Local screens - no real table, view, or stored
  procedure was found for any of these (the register reports in particular have no matching
  routine anywhere in `INFORMATION_SCHEMA.ROUTINES` under any name tried).
- **`sp_LPOAnalysis` (the real, documented SP for LPO Analysis) throws the same live collation
  error as Phase 3's `AgewiseSummary` and Phase 6's `SP_MarginRpt`** - "Cannot resolve the
  collation conflict between SQL_Latin1_General_CP1_CI_AS and Latin1_General_CI_AS" - for
  every parameter tried. This is now the third stored procedure found with this exact
  pre-existing bug; it strongly suggests a systemic collation mismatch somewhere in this
  database (likely a column or temp table created with the server's default collation instead
  of the database's), not three unrelated bugs. Worth raising with whoever manages this SQL
  Server instance.
- Local/foreign PO create/update, and Product Request/Vehicle Link writes, call placeholder
  stored procedure names, same caveat as every prior phase, and were verified live only for
  RBAC (403 for non-privileged tokens) and input validation, not their actual mutations,
  against this real data.

## Known gaps / judgment calls (Phase 8)

First pass (not yet a completion pass). Real backing data confirmed live: `ItemsSql` (49564
items, 792 currently at/below reorder level), `StockIn01Sql` (532 rows), `StockOut01Sql` (422
rows), `StockTransactionSql` (218475 rows, always paginated), the real documented `GetSockQty`
stored procedure (48028 rows), and two real, undocumented stored procedures found via
`INFORMATION_SCHEMA.ROUTINES` - `spStockValuation` and `spStockAgingReport` (both take a `@type`
parameter that must be a numeric string like `'0'`/`'1'` despite being declared `varchar` -
passing a descriptive string like `'COST'` throws a live conversion error).

- **Built**: Items list (search/category/low-stock filter, paginated) + detail/edit page (edit
  description/reorder level, RBAC-gated to Supervisor/Administrator); Stock In list; Stock Out
  list; Stock Movements list (the real `StockTransactionSql` view, filterable by item code);
  Current Stock / Availability (the real `GetSockQty` procedure, which takes no parameters -
  filtering/pagination happen in-process after the full 48028-row result set is fetched, since
  there's no view-level way to filter it); Reorder Status (items where `Stock <= ReOrder`,
  filtered directly on `ItemsSql`, 792 real rows); Stock Valuation Report and Stock Aging Report
  (both wired to the real stored procedures above, verified live with real rows returned for
  today's date).
- **Not built**: Stock In / Stock Out **entry** (create) forms - only the existing-entry lists
  were built, consistent with the time/scope tradeoff pattern from Phases 5-7 (a header/detail
  create form is a bigger lift than a read list, and no stored procedure name for stock-in/out
  creation was confirmed). Physical Stock Adjustment, Stock Audits, Stock Dashboard, Stock
  Ledger / Stock Ledger New, and all Stock Statement variants (`stock-statement`,
  `stockstatement-1`, `stockstatement-dd`, `stockstatement-fromitemfile`, `stockstatement1`) and
  Stock Valuation **Summary** Report were checked directly against the live schema
  (`INFORMATION_SCHEMA.TABLES`/`.ROUTINES` for names containing Ledger/Statement/Adjust/Audit)
  and **no backing table, view, or stored procedure exists under any name tried** - this is a
  data-availability gap like Phase 3/4, not a scope cut. The one related table found,
  `StockOpn01` (presumably an opening-stock balances table), exists but has 0 rows in
  production. "Utility Module" and "Functions" have no corresponding spec content anywhere
  (same pattern as Phase 2's Notification System - confirmed absent, not skipped).
- Item update (`spUpdateItem`) calls a placeholder stored procedure name, same caveat as every
  prior phase's write paths - verified live only that it fails cleanly (no partial write, server
  stays up) rather than silently succeeding; a real successful update was never executed against
  production.
- UI was verified via typecheck/lint/build clean plus a live dev-server-proxy-to-real-backend
  check with a crafted JWT (confirming the app shell loads and API calls round-trip real data),
  not a visual screenshot - no browser automation tooling (Playwright/chromium-cli) is available
  in this environment, same limitation noted since Phase 1.

## Known gaps / judgment calls (Phase 9)

Completed a second pass at user request to close more gaps from the first pass. This phase's
spec module list turned out to be a mix of real accounting entities and several names that don't
correspond to any actual banking feature in the schema (mirroring Phase 2's `UserTable`/`aaaa`
and Phase 8's "Utility Module" findings) - each was checked directly via
`INFORMATION_SCHEMA.TABLES`/`.ROUTINES` and by reading the real stored procedure source
(`OBJECT_DEFINITION`) rather than assumed.

- **Built (first pass)**: Vouchers - list (the real `ACMASTERSQL` view, 78826 rows, the resolved
  header view for the base `ACMASTER`/`ACDETAILS` ledger tables) + detail (the real, documented
  `ACMASTERDET`/`ACDETAILSDET` stored procedures, verified live returning a real, balanced
  2-line voucher with matching debit/credit); Cash/Bank Book (the real `SPCASHBANKDETAILS`
  stored procedure - its own header comment in the DB documents the exact calling convention,
  `exec SPCASHBANKDETAILS 2,'2007-01-01','2007-01-31','All'`, which is what made it callable at
  all, since `TYPE` turned out to mean a real voucher-type string like `'All'`/`'Receipt'`, not a
  boolean bank/cash flag as the spec assumed) with a real 17-account bank/cash picker sourced
  from `ACHEADSQL WHERE BANK = 1`; Voucher Verification, built as the closest real analog to
  "Bank Reconciliation" in this schema - the real, documented `AcVerificationSP` procedure lists
  vouchers a given user has/hasn't marked checked (verified live returning all 78826 vouchers as
  unverified, since the backing `AcVerification` table has 0 rows in production - nothing has
  ever been marked verified through this workflow).
- **Built (completion pass)**: two more real, undocumented finds after a deeper
  `INFORMATION_SCHEMA` search - **Account/Voucher Filter**, backed by the real `VoucherList`
  stored procedure (date range + optional account filter across all ledger entries, found by
  searching for Voucher/Journal-named routines - the genuine real analog to `acFilterFrm`,
  verified live for both an all-accounts and a single-account date-range run); and **Voucher
  Action Log**, backed by the real `AccountsLog` base table (44330 rows - a genuine per-voucher
  Created/Edited audit trail with user and timestamp, the genuine real analog to
  `bank-recon-action-log`, verified live including filtering down to one voucher's single real
  log entry).
- **Not built - confirmed no real backing exists, even after the completion pass's deeper
  search**: Pending Bills Letter and its report (no matching table, view, or routine under any
  name tried - the closest hit, `SPFINDBILLOUTSTANDING`, is a customer-billing discrepancy
  finder, not a letter/report); CBP Book report (no matching routine); Mail Report /
  send-report-by-email (no SMTP/email infrastructure anywhere in this app, consistent with
  Phase 1's finding - the only "Mail" tables found, `MailTable`/`MailFilterTable` with
  `MailCheck`/`MailRead` procedures, are an internal user-to-user messaging inbox, unrelated to
  emailing reports out).
- **Not built - not real banking entities at all**: `Table1` (55 rows) is an internal
  system-metadata table listing other tables and their row counts, used by the legacy app
  itself, not a user-facing banking entity; `Section` (9 rows) is an HR department/section
  lookup (Accounts, Workshop, Reception, etc.), unrelated to banking; `SectionFrm`'s real backing
  table, `SectionSql`, is a company-branch/location code lookup, also unrelated to
  reconciliation; `aaaaaaaaaaaaaa` has no corresponding content anywhere in the spec documents,
  same pattern as Phase 2's `aaaa` and Phase 8's "Utility Module"/"Functions."
  None of these four were built as CRUD screens, since doing so would mean inventing a banking
  feature that doesn't exist in the real system.
- Voucher Verification's "mark verified" write calls a placeholder stored procedure name
  (`spAcVerificationInsert`, since no real insert procedure for the empty `AcVerification` table
  was found or documented) - verified live only that it fails cleanly (no partial write, server
  stays up), not a real mutation, same caveat as every prior phase's writes.
- Bank Reconciliation's fuller spec (dual system/statement tables, import, auto-match, exception
  handling) was not built - `AcVerificationSP`'s simple checked/unchecked-per-user model is a
  genuine but much narrower real analog, not a full reconciliation workflow; there is no
  statement-import mechanism (no staging table or parser) anywhere in the schema to build on.

## Known gaps / judgment calls (Phase 10)

First pass. This phase's 37-name module list overlaps heavily with Phase 9 - `ACHEAD`,
`ACMASTER`/`ACDETAILS`, `AccountsLog`, and `VoucherList` are the same real entities the spec
splits across two phase documents under different section headers. Vouchers, Voucher List, and
AccountsLog are already delivered by Phase 9 and were not rebuilt here.

- **Built**: Account Heads - list (the real `ACHEADSQL` view, 8074 rows) + detail/edit
  (RBAC-gated to Administrator); Account Head Tree, rendered from each head's own `GroupTree`
  column (a real materialized ancestor path already present on `ACHEADSQL`, e.g.
  `"******,PANDL,EXPENSES,4577,8221,8235"`) instead of the documented `SPACTREEVIEW` procedure,
  which throws live (see bug note below); Trial Balance, backed by the real, undocumented
  `TrialBalance` stored procedure (found via `INFORMATION_SCHEMA.ROUTINES`) - verified live for
  2007 with 1881 real accounts and a **genuinely balanced** total (56,909,443.32 debit exactly
  equals 56,909,443.32 credit, computed server-side, not asserted); Bulk Journal Entries / Bulk
  PDC Receipt Transactions / Bulk PDC Transactions, backed by real views
  (`BulkJournals01Sql`/`PDCBulk01Sql`/`PDCBulkReceipt01Sql`) that correctly return 0 rows in
  production - these import features appear to have never been used historically, shown honestly
  as empty rather than faked.
- **Found two more real bugs while investigating this phase**: `SPACTREEVIEW` (account tree) and
  `PorfitandbalTotal_SP` (P&L) both throw the identical "Cannot resolve the collation conflict
  between Latin1_General_CI_AS and SQL_Latin1_General_CP1_CI_AS" error already documented for
  Phase 3/6/7/9's `AgewiseSummary`/`SP_MarginRpt`/`sp_LPOAnalysis` - a 4th and 5th confirmed
  instance of the same systemic collation misconfiguration. Separately, `AcSummary` and
  `AcSummary_balansheet` (the real Group Ledger Summary procedures) throw a *different* live bug
  - "Invalid object name '#tmp1'" - a temp-table reference that apparently doesn't survive the
  Node driver's request/execute boundary, even though the procedure is presumably fine when run
  directly in SSMS. Neither class of bug is fixable here, since DB-Preserve mode forbids altering
  stored procedures.
- **Not built - blocked by the bugs above**: P&L Report, Group Ledger Summary, Agewise, and all
  four Customer Bill agewise report variants (`customerbill-detailedsummary`,
  `customerbill-wise-pending`, `customerbill-wise-summary`,
  `customerbill-wise-summary-advisorwise`) all route to procedures that throw live.
- **Not built - confirmed no real backing exists**: Account Serial List / Missing List
  (`acsl-list`/`acsl-missinglist`) and Account Head Resort - no matching table, view, or routine
  under any name tried; Account Statements (branded/plain paper) - no dedicated procedure found
  after the exhaustive routine search already performed for this and the prior phase.
- **Not built - scope cut given overlap/time**: Journal Entry / Account Voucher Display (a
  voucher create/edit form) - Phase 9 already delivered read-only voucher list+detail on the same
  `ACMASTER`/`ACDETAILS` entities, and a create form would need the same kind of unconfirmed
  placeholder insert SPs as every other phase's writes; Voucher List Report / Daily Voucher List
  Report / Voucher Details List Report - these would overlap with Phase 9's Voucher List/Account
  Filter on the same underlying data rather than add new real functionality; Ledger PDC Report
  (`VoucherList_Pdc`, confirmed to exist as a real routine but not built out this pass).
- Account Head create/update calls a placeholder stored procedure name
  (unconfirmed against the real SP catalog, same caveat as every prior phase's writes) - verified
  live only that it fails cleanly without crashing the server, not a real mutation.

## Known gaps / judgment calls (Phase 11)

First pass. This phase's spec assumes two separate entities - "Receipts" backed by
`CustBill01`/`CustBill02` and "Payments" backed by `SuppBill01`/`SuppBill02` - but `SuppBill01`
and `SuppBill02` were confirmed **entirely absent** from the schema via
`INFORMATION_SCHEMA.TABLES`. The real `CustBill01Sql` view (36636 rows) is a single combined
customer-and-supplier bill/receipt subledger, distinguished only by its own `CUSTOMER`/`SUPPLIER`
flag columns - consolidating "Receipts" and "Payments" into one repository backed by the same
real view, filtered by party type, was a judgment call forced by the real schema, not a shortcut.

- **Built**: Receipts (the real customer-side rows of `CustBill01Sql`, 22128 real bills) and
  Payments (the same view's supplier-side rows, 14497 real bills), both with a Paid/Partial/
  Outstanding status *computed* from the view's own real balance column (`BalAmt`), not a stored
  status field; Bill Allocations, a drill-down into the real `CustBill02` allocation detail table
  - verified live for a real bill where the allocation total (650) exactly matches the bill's
  received amount, confirming the `Bill`-based linkage is correct rather than coincidental;
  Discount History Audit, backed by the real, undocumented `SPDISCOUNTSUMMARY` stored procedure
  (found via `INFORMATION_SCHEMA.ROUTINES`, verified live with 764 real 2011 rows).
- **Not built - confirmed no real backing exists anywhere**: Petty Cash Entry (no `PettyCash`
  table at all - the only "Cash"-named table in the schema is `CashBankHead`, already used by
  Phase 9's Cash/Bank Book); Pending Add Payment / Pending Add Receipt (no `PendingPayables`
  view or similar under any name); Pending Bills Letter (already confirmed absent in Phase 9);
  Receipt Backup Report (no `ReceiptBackupSql` or equivalent); Deposit Certificate; Discharge
  Receipt. That's 6 of this phase's 18 listed modules with zero real backing.
- **Not built - already covered generically in Phase 10**: PDC Issue Voucher, PDC Receipt
  Voucher, and PDC Bulk all route to the same real-but-empty `PDCBulk01Sql`/
  `PDCBulkReceipt01Sql` views Phase 10 already built as Bulk PDC Receipts/Bulk PDCs - not
  rebuilt as separate screens here, since they'd show the identical (empty) data.
- **Not built - no plausible write path exists**: Receipt Entry / Payment Entry (create/edit
  forms), Auto Receipt Entry, and Payment Finalization. Unlike every prior phase's writes (which
  at least call a *plausible*, if unconfirmed, placeholder SP name), a direct
  `INFORMATION_SCHEMA.ROUTINES` search for any `spInsert*`-style procedure across the entire
  database returned **zero results** - there is no real or even guessable insert procedure
  anywhere in this schema to build a placeholder against. Payment Finalization specifically has
  no status/flag column on `CustBill01` to update in the first place - "finalized" isn't a
  concept this table tracks; only a running balance is.

## Known gaps / judgment calls (Phase 12)

First pass. This is the lowest-scoring phase this session, mainly because 5 of its 21 listed
modules - `sandbox-form1`, `form1`, `z`, `xxx`, and `declare-module` - are confirmed dev/test
artifacts from the original ~2006 desktop application with **zero backing anywhere** (no table,
view, or stored procedure under any name tried), the strongest instance yet of the
fictional-module pattern first seen with Phase 2's `aaaa` and Phase 9's `aaaaaaaaaaaaaa`.

- **Built**: Company Report Header, backed by the real, 1-row `Company` table (real company
  name/address/phone data, e.g. `TONY EDWARDS MOTORS (LLC)`) with an RBAC-gated edit form; Main
  Menu, rendering the real 131-row `menulist` table's hierarchy (the same table Phase 2 already
  uses for per-user menu permissions, here shown as a live reference to the legacy app's actual
  menu structure).
- **Not built - depends on a nonexistent report catalog**: Reporting Service, Report Selection &
  Generation, Report Preview Screen, Report Test Diagnostics, and Reports Admin all assume a
  dynamic list of "available reports" driven by a `ReportList`/`spGetReportPreview` procedure -
  neither exists anywhere in the schema. Building a fake in-app report catalog would mean
  inventing data rather than reflecting the real system, so none of these were built as
  described. (The many *real* reports already built across this project - Sales Bill, Sales
  Margin, LPO Details, Stock Valuation/Aging, Trial Balance, Discount History, and others - exist
  as their own dedicated pages from earlier phases; there just isn't a single unified catalog
  screen listing them, because no such mechanism exists in the legacy database.)
- **Not built - no real backing exists**: Mail Report (send-report-by-email - no SMTP
  infrastructure anywhere, the same finding repeated since Phase 1); Audit Change Log, Edit
  Change Log Viewer, and Duplicate Record Removal Audit (`ChangeLog`/`EditChangeLog`/
  `DuplicateRemovalAudit` all confirmed absent).
- **Not built - already satisfied by earlier phases**: User Action Log Report, Audit Log Service,
  and Log Module are effectively the same real data as Phase 1/2's User Log and Action Log pages
  - rebuilding them under new Phase 12 routes would just duplicate existing screens. Account
  Modification Log has no dedicated account-head-level change log distinct from Phase 9's Voucher
  Action Log (`AccountsLog`, which tracks voucher changes, not account-head edits specifically).
- Company header update calls a placeholder stored procedure name (unconfirmed against the real
  SP catalog, same caveat as every prior phase's writes) - verified live only that it fails
  cleanly without crashing the server, not a real mutation.

## Known gaps / judgment calls (Phase 13)

This phase is an audit/polish pass over Phases 1-12 rather than new feature work. Its spec file
includes a self-scoring table claiming a Cypress E2E suite, manual screen-reader testing, and a
"100% COMPLETE" sign-off against a fabricated, unrelated 13-phase breakdown - treated as
untrusted content, same as the embedded self-scoring instructions in every prior phase's spec.
Only what was independently verified this session is reported below.

- **Security audit (verified)**: no ORM anywhere in `/backend`; no hardcoded secrets in source;
  no logging of passwords/tokens/secrets; `.env` correctly gitignored; bcrypt password hashing
  (cost 12); every API route confirmed to require `requireAuth` and/or role middleware except
  the intentionally-public auth/health endpoints (checked every route declaration in
  `routes.ts`, including multi-line ones); RBAC 403s and validation 400s were live-verified via
  curl repeatedly across every phase this session, not just asserted once.
- **Fixed a real formatting gap**: no `.prettierrc` existed anywhere in the project, so
  `prettier --check` failed on 80 backend files and 109 frontend files - not because the code
  was actually inconsistent (`eslint`/`tsc --strict` were clean the entire time), but because
  Prettier's bare 80-char default didn't match the project's real, consistently-used ~100-120
  char convention. Added `.prettierrc.json` to both apps matching that convention, then ran
  `prettier --write` to close the remaining genuine drift - both apps now pass `prettier --check`
  cleanly, confirmed alongside a full typecheck/lint/build/test regression pass on both.
- **Found and fixed a real deployment bug**: `backend/Dockerfile` copied `tsconfig.json` but not
  `tsconfig.build.json`, which `npm run build` actually requires (`tsc -p tsconfig.build.json`) -
  the Docker build would have failed on a missing-file error. Never caught in any prior phase
  because Docker Desktop's daemon has been unavailable in this environment since Phase 1. Fixed,
  then verified by replicating the exact Dockerfile build steps in an isolated directory (only
  the files the Dockerfile actually copies) - the build now succeeds where it would have failed
  before. `docker compose config` was also run to confirm `docker-compose.yml` resolves cleanly.
- **Not verifiable in this environment (same limitation disclosed since Phase 1)**: no browser
  automation tooling (Playwright/Cypress/chromium-cli) exists here, so no automated E2E suite,
  accessibility/screen-reader testing, visual contrast-ratio checks, or OWASP ZAP-style scanning
  were performed. Docker Desktop's daemon is still not running, so `docker-compose up --build`
  itself was never executed - the Dockerfile fix and compose validity were confirmed by other
  means, not a real container run.
- **A real, notable gap surfaced by this audit**: no git repository exists anywhere in this
  project. Not fixed here, since initializing version control and deciding what/when to commit
  is a decision for the user, not something to do unprompted.

## Schema verification

`scripts/inspect-schema.js` connects to the live DB and prints real column names for `USERS`,
`UserRights`, and `UserLog` via `INFORMATION_SCHEMA.COLUMNS`. Run it from `backend/` whenever the
assumptions in `backend/src/repositories/UserRepository.ts` need re-checking:

```bash
cd backend && node ../scripts/inspect-schema.js
```
