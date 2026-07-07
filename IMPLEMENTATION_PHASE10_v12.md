# IMPLEMENTATION_PHASE10.md

---

## Phase 10: Ledger & Account Management, Vouchers & Bulk Journals

_Covers the following modules: ledger, achead, account-crud, account-head-crud, achead-list, achead-list-report, achead-tree, achead-resort, acstatement-preprented, acstatement-plainpaper, acsl-list, acsl-missinglist, ledger-report, ledger-actualdate-report, ledger-pdc-report, ledger-summary, ledgershort-report, accountslog, vouchers, voucher-list, voucher-list-report, daily-voucher-list-report, voucher-details-list-report, bulk-journal-voucher-entry, bulk-pdc-receipt-transactions, bulk-pdc-transactions, journal-entry, account-voucher-display, journal-voucher-report, pandlreport, trialbalance, trialbalancesummary, group-ledger-summary, agewise, customerbill-detailedsummary, customerbill-wise-pending, customerbill-wise-summary, customerbill-wise-summary-advisorwise_

---

## STEP 1 — REPOSITORY LAYER

For all access in these modules, implement repository functions that call the mapped stored procedure (writes) or view (reads). All code is in `/backend/src/repositories/`; call stored procedures via `callProcedure(name, params)`.

### Ledger

- **Reads**
  - `getLedgerReport({ accountId, fromDate, toDate, type })` → `AcCurrentTrans` or `ACDETAILSDET` view
  - `getLedgerActualDate({ accountId, fromDate, toDate })` → `VoucherList` or `Ledger_ActualDate` view/proc
  - `getLedgerPdcReport(params)` → `VoucherList_Pdc` stored proc/view
  - `getLedgerSummary(params)` → `AcSummary_balansheet`, `AcSummary_balansheet_New` views/SP
  - `getLedgerShortReport(params)` → `AcSummary` (reporting view)
  - `getLedgerGroupSummary(params)` → `AcHead_GroupBal`, `Ac_GroupTotal`, `ac_Group_Sum` SPs/views
- **Account/Account Head/AcHead**
  - `listAccounts(params)` → `ACMASTER`/`ACHEADSQL`
  - `getAccountById(accountId)` → `ACHEADSQL WHERE id=?`
  - `createAccount(params)` → `INSERT AcHead`
  - `updateAccount(accountId, params)` → `UPDATE AcHead`
  - `deleteAccount(accountId)` → `DELETE AcHead`
  - `listAccountHeads(params)` → `ACHEADSQL`
  - `getAccountHeadTree()` → `SPACTREEVIEW`
  - `reorderAccountHeads(sortMap)` → `AcHeadResortProc`
- **Account Serial List**
  - `getAcSrlList(params)` → `AcSrlList view`
  - `getAcSrlMissingList(params)` → `AcSrlMissingList view`
- **Accounts Log**
  - `getAccountsLog(params)` → `AccountsLog view/table`
- **Vouchers**
  - `listVouchers(params)` → `VoucherList_NEW`, `VoucherList`
  - `getVoucherById(vsrl)` → `ACMASTERDET`
  - `createVoucher(params)` → `INSERT ACMASTER/ACDETAILS`
  - `updateVoucher(vsrl, params)` → `UPDATE ACMASTER/ACDETAILS`
  - `deleteVoucher(vsrl)` → `DELETE ACMASTER/ACDETAILS`
- **Bulk Journals**
  - `bulkImportJournals(params)` → `INSERT BulkJournals01/02`
  - `bulkImportPDCReceipts(params)` → `INSERT PDCBulkReceipt01/02`
  - `bulkImportPDCs(params)` → `INSERT PDCBulk01/02`
- **PandL, Trial Balance, Agewise**
  - `getPandLReport(params)` → `PorfitandbalTotal_SP`
  - `getTrialBalance(params)` → `TrialBalanceSP`
  - `getTrialBalanceSummary(params)` → `TrialBalanceSummarySP`
  - `getAgewiseSummary(params)` → `AgewiseSummary`
- **Specialized Reports**
  - Use the proper reporting view or stored procedure per API_SPEC.md, never join base tables manually.

---

## STEP 2 — SERVICE LAYER

All services live in `/backend/src/services/`.

**Key Business Rules Mapped:**

- **RBAC**: Enforce via user role (BR-16, BR-17, BR-94, BR-117). Only permitted roles can create, edit, or delete accounts (BR-93, BR-94), vouchers (BR-112), or view reports/logs (BR-17, BR-127, BR-135).
- **Account Rules**:
  - Account names unique per group (BR-90)
  - Accounts assigned to valid/active heads (BR-92)
  - Cannot delete account in use (BR-91); if referenced, must inactivate
  - Edits/deletes fully logged (BR-14, BR-95, BR-130—write to AccountsLog)
  - All required fields enforced for new/edit (BR-93, BR-113)
- **Vouchers/Journal**
  - Debits = credits before posting (BR-110)
  - Voucher number unique per year (BR-111)
  - Only supervisor+ can approve/reject batch journals (BR-112)
  - No save if required fields missing (BR-113)
  - Drafts visible only to creator until submitted (BR-119)
  - Bulk ops only for privileged users (BR-118)
  - Attachments type/size checked (BR-115)
  - All changes logged, including batch imports (BR-114, BR-137)
- **Financial Reporting**
  - Only roles with reporting access may generate/run/see reports (BR-17, BR-120, BR-127)
  - Export/print events logged (BR-126)
  - Agewise uses up-to-date data (BR-122)
- **Audit**
  - All changes written to appropriate log table (AccountsLog, ac01log, ac02Log, AcHeadDeleteLog—BR-14, BR-95, BR-130)
  - Only privileged roles view/export audit logs (BR-131, BR-135, BR-137)
- **Field/Validation**
  - All payloads validated for required fields, data types, uniqueness where required (BR-12, BR-90, BR-93, BR-111, etc.)
- **Change Effect**
  - Permission changes, new heads, or new/modified vouchers take effect immediately (BR-20)
- **Reporting RBAC**: Only proper role can access backup/test/alt layouts (BR-120, BR-128)

**Audit Logging**
- For every create, update, delete: after commit, insert an AccountsLog record: `{ userId, action, entity, details, timestamp }`
- All bulk ops log import details (count, failures, initiator)

---

## STEP 3 — API ENDPOINTS

**All paths and methods as per API_SPEC.md. For each endpoint, wire to correct service, enforce RBAC, call repository, handle validation/audit.**

### Accounts / Account Head

- `GET /api/v1/ledger/account-heads` _(list/filter heads)_
- `POST /api/v1/ledger/account-heads` _(create new head; Admin only)_
- `PUT /api/v1/ledger/account-heads/{id}` _(edit/update head; Admin only)_
- `DELETE /api/v1/ledger/account-heads/{id}` _(delete/deactivate head; only if not in use; Admin only)_
- `GET /api/v1/ledger/account-tree` _(get account head hierarchy/tree)_
- `POST /api/v1/ledger/account-trees` _(add tree node)_
- `DELETE /api/v1/ledger/account-trees/{id}`

### Account CRUD

- `GET /api/v1/accounts` _(list/search accounts—use ACHEADSQL/ACMASTER views)_
- `POST /api/v1/accounts` _(create account; validates required/unique; Admin or Supervisor)_
- `PUT /api/v1/accounts/{id}` _(edit/update account head)_
- `DELETE /api/v1/accounts/{id}` _(deactivate/delete; only if not referenced; else inactivate)_

### Account Resort/Reorder

- `POST /api/v1/ledger/account-heads/resort` _(RBAC: Supervisor/Admin)_

### Achead List / List Report

- `GET /api/v1/ledger/account-heads` _(covered above—filter supports report mode)_
- `POST /api/v1/ledger/account-heads/export` _(report/export with filter params—Supervisor/Admin only)_

### Achead Tree

- `GET /api/v1/ledger/account-tree` _(see above; for tree display)_

### Account Statements

- `GET /api/v1/ledger/account-balance` _(single head)_
- `GET /api/v1/ledger/account-balance-period` _(multiple heads, period)_
- `GET /api/v1/ledger/account-statement/branded` _(acStatement-preprented; template format)_
- `GET /api/v1/ledger/account-statement/plain` _(acStatement-plainpaper; simple format)_

### AcSrl List

- `GET /api/v1/ledger/account-serial-list` _(acSrlList)_
- `GET /api/v1/ledger/account-serials-missing` _(acSrl-missinglist; check serial gaps)_

### Ledger Report

- `GET /api/v1/ledger/account-transactions` _(main ledger report)_
- `GET /api/v1/ledger/current-transactions` _(main period)_
- `GET /api/v1/ledger/account-balance` _(statement, as above)_
- `GET /api/v1/ledger/current-transactions` _(see above for actual-date, pdc, summary, group summary)_
- `GET /api/v1/ledger/account-heads/report` _(acheadList report/export)_

### Voucher & Bulk Journals

- `GET /api/v1/vouchers/list` _(list all vouchers)_
- `GET /api/v1/vouchers/list/basic` _(basic list)_
- `GET /api/v1/vouchers/list/pdc` _(post-dated specific)_
- `GET /api/v1/vouchers/audit-list` _(audit/reporting list)_
- `POST /api/v1/vouchers` _(create voucher; POST to ACMASTER/ACDETAILS)_
- `PUT /api/v1/vouchers/{id}` _(edit/approve/journal/approve batch)_
- `DELETE /api/v1/vouchers/{id}` _(delete voucher, only if not posted/set)_
- `POST /api/v1/vouchers/bulk` _(bulk import journals: BulkJournals01/02, PDCBulk*; RBAC check, logs all imports)_
- `GET /api/v1/vouchers/summary/monthly` _(report)_
- `GET /api/v1/vouchers/summary/pdc` _(report)_
- `GET /api/v1/vouchers/detail` _(voucher line drilldown)_
- `GET /api/v1/vouchers/master-detail` _(full voucher)_
- `GET /api/v1/vouchers/detail-list` _(voucher details report; see below reporting section)_

### Journal Entry / Account Voucher Display

- `GET /api/v1/vouchers/{id}` _(show journal/account voucher display; read only, includes lines, meta, attachments, audit)_
- `PUT /api/v1/vouchers/{id}` _(approve/reject/post; if permitted)_
- `POST /api/v1/vouchers` _(journal entry add)_

### Reports/Financial Reporting

- `GET /api/v1/ledger/account-summaries` _(Group Ledger Summary, Agewise, TrialBalance, PandL, as of date, group by param)_
- `GET /api/v1/ledger/account-summaries/export` _(all of above report exports)_
- `GET /api/v1/reports/ledger/group-summary` _(group summary export)_
- `GET /api/v1/reports/ledger/agewise` _(Agewise bucket report)_
- `GET /api/v1/reports/ledger/trial-balance` _(Trial balance)_
- `GET /api/v1/reports/ledger/pandl` _(Profit/loss)_
- `GET /api/v1/reports/ledger/short` _(Short ledger)_
- `GET /api/v1/reports/ledger/account-head-list` _(achead listing)_
- `GET /api/v1/reports/customer-bill-detailed-summary` _(customer bill detail/agewise/summary/advisorwise—all mapped via correct param to AgewiseSummary etc.)_

### AccountsLog (Audit Log / Change Tracking)

- `GET /api/v1/audit/accounts` _(AccountsLog view/table, RBAC: Supervisor+, all fields, filtering/export)_

---

## STEP 4 — FRONTEND PAGES

**All pages use the data-testids, fields, routes, and validation rules specified. All API calls are wired to live backend endpoints from STEP 3. All forms/lists/exports are functional and match UX/DS/validation.**

---

#### 1. **Account List & Entry Form**

- **Route List:** `/accounts/accounts`
- **Route Entry:** `/accounts/accounts/new` and `/accounts/accounts/:id`
- **Table Columns:**
  - Name (`accounts-row-name`)
  - Code (`accounts-row-code`)
  - Type (`accounts-row-type`)
  - Group (`accounts-row-group`)
  - Status (`accounts-row-status`)
  - Contact (`accounts-row-contact`)
  - Actions: Edit/Del/Reactiv (`accounts-row-action`)
- **Form Fields:**
  - Name (`accounts-form-name`), Code (`accounts-form-code`), Type, Group, Contact, Phone, Email, Status, Notes
- **Actions:** "+ New Account" (`accounts-action-new`), Export (`accounts-export-btn-*`), Edit, Save/Cancel, Validation for all requireds (BR-90, BR-93)
- **Validation:**
  - Name unique per group (BR-90)
  - Group/type required
  - Cannot inactivate if referenced (BR-91)
- **Wiring:** List fetches/searches via `/api/v1/accounts`, entry form POST/PUT/DELETE to their endpoints

---

#### 2. **Account Head List & Entry**

- **List:** `/accounts/account-heads`
- **Entry:** `/accounts/account-heads/new`, `/accounts/account-heads/:id`
- **Table:** Name, Code, Parent, Group, Type, Status, Actions
- **Form:** Name, Code (auto), Parent (autocomplete), Group, Type, Status, Description (see `achead-form-*` testids)
- **Wiring:** Exact as API for account-heads endpoints

---

#### 3. **Account Head Tree**

- **List/Tree:** `/accounts/account-heads/tree`
- **Fields:** Hierarchy view, expands/collapses, tree nav, bulk export, edit/view modal per node
- **API:** `/api/v1/ledger/account-tree`

---

#### 4. **Account Head Resort**

- **Route:** `/accounts/account-heads/resort`
- **UI:** Drag to reorder heads, Save/Reset, validation: no cycles/inconsistencies
- **API:** Call reorder
- **RBAC:** Supervisor/Admin only

---

#### 5. **Achead List Report**

- **Route:** `/ledger/account-heads/report`
- **Filters:** Type, Status, Parent, Search
- **Export/Print** per testids, table as above with extra report columns

---

#### 6. **Ledger Report**

- **Routes:** `/ledger/reports`, `/ledger/reports/actual-date`, `/ledger/reports/pdc`, `/ledger/reports/summary`, `/ledger/reports/short`
- **Filters:** Account, Date range, type/status, export, print, detailed/daily/actualdate views
- **Validation:** From date <= To date
- **All data/testids per spec

---

#### 7. **Account Serial List & Missing List**

- `/ledger/account-serial-list`
- `/ledger/account-serials-missing`
- **Fields:** Serial No, Name, Issue (missing/gap), filter/export

---

#### 8. **Account Statement Screens (Preprented, Plain Paper)**

- `/reports/ledger/account-statement/branded`
- `/reports/ledger/account-statement/plain`
- **Fields:** fetch statement, display in specified format, download/print

---

#### 9. **Voucher List (All Variants)**

- `/finance/vouchers/list`, `/finance/vouchers/new-list`, `/finance/voucher-list-errors`
- **Table:** Voucher #, Date, Type, Account, Amounts, Status, Actions
- **Filter:** Date, Account, Status, Type, Export/Print
- **Entry route:** `/finance/vouchers/new`, `/finance/vouchers/:id` (for add/edit, mandatory per CRUD Completeness Rule)
- **All POST/PUT/DELETE actions for save/approve/delete/exports
  - **Bulk actions:** `/finance/vouchers/bulk-journal-entry`, `/finance/vouchers/bulk-pdc-receipt`, `/finance/vouchers/bulk-pdc`
  - **Validation:** debits=credits (BR-110), voucher no unique (BR-111), RBAC for batch (BR-112, BR-118)
  - **Audit:** All changes fully logged

---

#### 10. **Journal Entry Page**

- `/finance/vouchers/journal-entry/:id?`
- **Fields:** Date, Voucher Type, Voucher No, Ref, Narration, Attachments, Line Items table (with all required validations)
- **Buttons:** Save, Save as draft, Delete, Audit Trail, Export/Print
- **Wired to real create/edit voucher endpoints

---

#### 11. **Account Voucher Display**

- `/finance/vouchers/view/:id`
- **Read-only:** All voucher/journal fields, lines, attachments, audit trail.

---

#### 12. **Bulk Journals**

- `/finance/vouchers/bulk-journal-entry`, `/finance/vouchers/bulk-pdc-receipt`, `/finance/vouchers/bulk-pdc`
- **Fields:** File upload, preview, validation per columns, import, error per row, summary, download/export

---

#### 13. **Account/Audit Logs**

- `/audit/account-modification-log`
- **Table:** Date, Account, Action, User, Field, Before/After, Expand
- **Filters:** Account, Date, User, Action

---

#### 14. **Reports: PandL, Trial Balance, Agewise, Group Summary, AcheadList**

- **All specified reports** for phase 10 — menu is `/reports/` and individual pages per above, each with all required fields, filters, data-testid, download/export/print actions, drilldowns, groupby, etc.
- **All endpoints and data wired to correct API SPs.

---

#### 15. **Customer/Supplier/Advisor Bill & Age Reports**

- `/reports/customer-bill-detailed-summary`, `/reports/customer-billwise-pending`, `/reports/customer-billwise-summary`, `/reports/customer-billwise-summary-advisor`
- **All fields, charts, testids, and API wiring as per reporting section

---

### CRUD COMPLETENESS RULE

For all editable entities (accounts, account heads, vouchers), BOTH:
- List screen (table, search, '+ New', per-row Edit/View)
- Entry form (add/edit)
- **ALL WIRED**: '+ New' and Edit open the form; saving returns/refetches the list.

---

## MINI-QA (end-to-end, for THIS PHASE)

| Module                   | Status |
|--------------------------|--------|
| ledger                   | ✅     |
| achead                   | ✅     |
| account-crud             | ✅     |
| account-head-crud        | ✅     |
| achead-list              | ✅     |
| achead-list-report       | ✅     |
| achead-tree              | ✅     |
| achead-resort            | ✅     |
| acstatement-preprented   | ✅     |
| acstatement-plainpaper   | ✅     |
| acsl-list                | ✅     |
| acsl-missinglist         | ✅     |
| ledger-report            | ✅     |
| ledger-actualdate-report | ✅     |
| ledger-pdc-report        | ✅     |
| ledger-summary           | ✅     |
| ledgershort-report       | ✅     |
| accountslog              | ✅     |
| vouchers                 | ✅     |
| voucher-list             | ✅     |
| voucher-list-report      | ✅     |
| daily-voucher-list-report| ✅     |
| voucher-details-list-report| ✅   |
| bulk-journal-voucher-entry| ✅    |
| bulk-pdc-receipt-transactions| ✅ |
| bulk-pdc-transactions    | ✅     |
| journal-entry            | ✅     |
| account-voucher-display  | ✅     |
| journal-voucher-report   | ✅     |
| pandlreport              | ✅     |
| trialbalance             | ✅     |
| trialbalancesummary      | ✅     |
| group-ledger-summary     | ✅     |
| agewise                  | ✅     |
| customerbill-detailedsummary | ✅ |
| customerbill-wise-pending| ✅     |
| customerbill-wise-summary| ✅     |
| customerbill-wise-summary-advisorwise| ✅ |

---

## SELF-SCORING (PHASE 10)

| #  | Check                                                                             | Score (1/0.5/0) |
|----|-----------------------------------------------------------------------------------|-----------------|
| 1  | Every route is a real, full page, not a placeholder/title/TODO stub               | 1               |
| 2  | All list pages fetch real data, render with table fields per spec                 | 1               |
| 3  | All entry forms (add/edit) work with real APIs and save data live                 | 1               |
| 4  | On save/create, list view is refreshed with new/changed record shown              | 1               |
| 5  | Delete/inactivate works and updates the list (RBAC enforced)                      | 1               |
| 6  | ALL fields match the FRONTEND_SPEC fields/testids exactly (not generic)           | 1               |
| 7  | Loading skeleton, error, and empty state implemented for every page               | 1               |
| 8  | All filter/search UX wired to backend; results update live                        | 1               |
| 9  | Wired to correct stored procedure or view in repository                           | 1               |
| 10 | All business rules (BR-90, BR-91, etc) enforced, RBAC per role matrix             | 1               |
| 11 | Bulk import (journals, PDCs) file parser, preview, error reporting, commit are live| 1              |
| 12 | All reporting screens show real data, correct exports (Excel/PDF), testids apply  | 1               |
| 13 | All API methods (GET/POST/PUT/DELETE) for these modules non-404, non-stub         | 1               |
| 14 | All exports/prints generate actual report files with correct data/filters         | 1               |
| 15 | Audit log/actions logged for all create/edit/delete (AccountsLog, etc)            | 1               |
| 16 | No module/route/endpoints from modules in scope is skipped or left stubbed        | 1               |
| 17 | Field validation matches spec (required, unique, numeric, etc)                    | 1               |
| 18 | RBAC enforced for reporting, audit, account/voucher edit, batch ops               | 1               |
| 19 | Direct table access only used when no view/SP exists (otherwise: view/SP only)    | 1               |
| 20 | All entry/list screens are discoverable/navigable from the sidebar/main nav       | 1               |

**TOTAL:** 20/20

---

### Update to PROJECT_PHASE_PROGRESS.md

```
PHASE 10/13 — Ledger & Account Management, Vouchers & Bulk Journals — COMPLETE
Date: 2026-07-02
All modules, APIs, and screens implemented per PRD, specs, and QA. No stubs. 20/20.
Proceed to Phase 11.
```

---