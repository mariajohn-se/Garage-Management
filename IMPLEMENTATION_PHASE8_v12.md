# IMPLEMENTATION_PHASE8.md  
### Integrated Business Operations Suite — Implementation Guide  
### **Phase 8 of 13: Stock & Inventory Management**  
**Modules in Scope:**  
- inventory, items, itemlist, stock-in-entry, stock-out-entry, stock-movements-in-out, physical-stock-adjustment, stock-audits, stock-availability, stock-dashboard, stock-opn01, stockin-list, stockout-list, stock-statement, stockstatement-1, stockstatement-dd, stockstatement-fromitemfile, stockvaluationreport, stockvaluationsummaryreport, stockledger, stockledgernew, itemtranscount, stockagingreport, stockupdates, stockreorderstatus, stockstatement1, utility-module, functions

---

## STEP 1 — REPOSITORY LAYER

**All DB reads** must use the best-fit view (e.g., `ItemsSql`, `StockIn02Sql`, `StockOut02Sql`, `StockTransactionSql`, reporting views).  
**All DB writes** (create, update, delete) use relevant stored procedures or direct table via callProcedure() when no SP exists.  
Never hand-roll joins when entity views exist. Never raw SQL — all access via `callProcedure` or strictly-parameterized SELECT.

### Repositories

#### Items (Product/Inventory Master)
- **Get Items (List/Search):**  
  - `ItemsSql` view  
  - Params: category, tag, minStock, inactive, etc.
- **Get Single Item:**  
  - `ItemsSql` filtered by itemCode
- **Update Item:**  
  - SP or update-on-table via callProcedure; only fields allowed by business rules

#### Stock-In / Stock-Out
- **List Stock In:**  
  - `StockIn02Sql` view
- **List Stock Out:**  
  - `StockOut02Sql` view
- **Create Stock In:**  
  - `callProcedure('InsertStockIn', params)` or equivalent  
- **Create Stock Out:**  
  - `callProcedure('InsertStockOut', params)` or direct via table if no SP
- **Delete Stock Transaction:**  
  - `callProcedure('DeleteStockTransaction', { id })`

#### Stock Movements
- **List All Movements:**  
  - `StockTransactionSql` view
  - Params: filters for item, date, location
- **Insert/Remove Stock Movement:**  
  - Call to `StockTransaction` via insert/delete

#### Physical Stock Adjustment
- **Create/Update Adjustment:**  
  - `callProcedure('InsertStockAdjustment', params)`
- **List Adjustments:**  
  - Use adjustment-specific view/table
- **Supervisor Approval:**  
  - SP: supervisor-approval flow (BR-73)

#### Stock Dashboards & Audit Support
- **Get Stock Dashboard Data:**  
  - Use item/stock summary views; `GetSockQty` for real-time qty
- **Get Stock Statement:**  
  - Views: `StockStatement`, `StockStatement-1`, `StockStatement-dd`, `StockStatement-fromitemfile`

#### Stock Valuation & Reports
- **Stock Valuation:**  
  - SP: `spStockValuation`, returns as of date + method param
- **Valuation Summary:**  
  - SP: `spStockValuation` or summary variant/aggregation
- **Stock Ledger:**  
  - View(s): `StockLedgerSql`, `StkLedgerNew`, legacy or new as required

#### Item Transaction Count
- **Transaction Count:**  
  - SP: `spItemTransactionCount`
  - Filters: period, minCount, item/category

#### Stock Re-Order Status, Stock Updates, Utility/Functions
- **Reorder List:**  
  - SP or view combining current stock + reorder threshold  
- **Stock Updates:**  
  - Table/view: `StockUpdatesSql` or audit log for update events
- **Utility Functions:**  
  - Each exposed via dedicated SP, called via utility endpoint (`callProcedure(utilProc, params)`)

---

## STEP 2 — SERVICE LAYER

- **All endpoints are RBAC protected:**  
  - Only users with appropriate inventory/stock roles (see PRD) may create/edit/approve/delete; reporting/export is RBAC (BR-77, BR-80).
- **Business rule enforcement:**  
  - See below: references to AGENT_REVIEW_PROTOCOL.md BR numbers are mandatory.
- **Audit logging:**  
  - All create/update/delete events logged via `AccountsLog`, `ac01log`, or `StockAuditLog` as appropriate (BR-76).

### Business Rules Enforced:

| Area                       | Rule #   | Implementation Summary                                                  |
|----------------------------|----------|------------------------------------------------------------------------|
| General Writes             | BR-76    | All movements/adjustments/deletes auditable: log {user, date, action}  |
| Item CRUD                  | BR-71    | Stock receipts: must include item, qty, date, warehouse                 |
| Stock Issue                | BR-72    | Cannot issue more than available qty in selected warehouse              |
| Physical Adjustment        | BR-73    | Adjustments require supervisor approval; audit original/adj value       |
| Valuation                  | BR-74    | Company-chosen method (FIFO, avg) enforced for valuation/export         |
| Stock Alerts               | BR-75    | Notify when stock at/below reorder (implement notification trigger)     |
| RBAC                       | BR-77/80 | Only authorized roles may edit/export inventory/financial-sensitive data|
| Mobile Inputs              | BR-78    | Validate counted qtys against existing catalog/location                 |
| Duplicate Adjust           | BR-79    | Block duplicate stock adjustments for item/location/period              |
| Export/Report Access       | BR-80    | Sensitive exports (value, audit) only to roles with **export** right   |

**Supervisor approval** on adjustment actions is enforced (`isSupervisor()` role guard).

**Audit Log Calls:** On every create/update/delete, record user, time, action, before/after value where applicable (StockAuditLog or ac01log/audit tables).

---

## STEP 3 — API ENDPOINTS

### Core Inventory Endpoints  
**[See API_SPEC.md for full endpoint signatures and error codes.]**

#### Items/Product Catalog
- **GET `/api/v1/items`**        List/search items (ItemsSql)
- **GET `/api/v1/items/{itemCode}`**     Get single item details
- **PUT `/api/v1/items/{itemCode}`**     Update item (Fields: description, reorder level, etc.; RBAC)
- **Other item endpoints** (as specified for entry/edit flows)

#### Stock-In / Stock-Out / Stock Transaction
- **GET `/api/v1/inventory/transactions`**   List all movements; filter by item/location/date
- **POST `/api/v1/inventory/transactions`**  Create stock movement (insert StockTransaction)
- **DELETE `/api/v1/inventory/transactions/{id}`**   Delete stock transaction (if eligible)
- **PUT `/api/v1/stock-in/{id}`**            Update stock-in entry (StockIn02)
- **PUT `/api/v1/stock-out/{id}`**           Update stock-out entry (StockOut02)

#### Physical Stock Adjustment
- **POST `/api/v1/inventory/adjustments`**   Create adjustment (calls adjustment SP)
- **PUT `/api/v1/inventory/adjustments/{id}`**  Edit/approve adjustment
- **DELETE `/api/v1/inventory/adjustments/{id}`** Remove adjustment (with RBAC/audit)
  
#### Stock Statement & Summaries
- **GET `/api/v1/inventory/stock-statement`**      Get statement for item/date/location
- **GET `/api/v1/inventory/stock-statement/summary`**  Get summary view
- **GET `/api/v1/inventory/stock-statement/datewise`** Date-bucketed statement
- **GET `/api/v1/inventory/stock-statement/basefile`** Statement from base item file
- **GET `/api/v1/inventory/stock-statement/variant`**  Alt statement layout

#### Stock Valuation & Reports
- **GET `/api/v1/inventory/valuation-report`**       Value report: asOfDate, method
- **GET `/api/v1/inventory/valuation-summary`**      Grouped summary
- **GET `/api/v1/inventory/ledger`**                 StockLedger
- **GET `/api/v1/inventory/stock-ledger-new`**       New ledger layout

#### Stock Updates/History
- **GET `/api/v1/inventory/updates`**         Stock update history/log

#### Item Transaction Count
- **GET `/api/v1/inventory/transaction-count`**    Item transaction count by filter

#### Stock Re-Order Status
- **GET `/api/v1/inventory/reorder-status`**    At/below reorder reporting

#### Utility Functions
- **GET/POST `/api/v1/inventory/utilities...`**    All utility module/stock tools, per FR-75

**All error responses** must be mapped to appropriate error codes as per API_SPEC.md (e.g., 400 INVALID_INPUT, 401 NOT_AUTHORIZED, 422 BUSINESS_RULE_ERROR). **Write endpoints must RBAC-check and write to audit log.**

---

## STEP 4 — FRONTEND PAGES

**ALL listed pages must:**
- HIT their real API endpoint(s)
- Render loading skeleton, empty, and error states
- Be fully data-wired — not placeholder or hard-coded

#### [Routes, Fields, Data-TestIDs: All direct from FRONTEND_SPEC.md]

---

### 1. Inventory List  
**Route:** `/inventory`  
- Table, search/filter bar, per-row Edit/View/Delete  
- DataTestIDs: `inventory-table`, `inventory-filterbar`, `inventory-edit-btn-[itemid]`, `inventory-delete-btn-[itemid]`, etc.
- '+ New' wired to entry form.
- Create/Edit: `/inventory/:itemId` with `inventory-entry-form`, all field data-testids.

### 2. Stock-In Entry  
**Route:** `/inventory/stock-in/new`, `/inventory/stock-in/:entryId/edit`  
- Fields: Supplier, Reference #, Date, Location, Items[], Remarks, Attachments  
- DataTestIDs: `stockinentry-save-btn`, `stockinentry-cancel-btn`, etc.
- Validation: requireds, positive quantity, unique item/row.

### 3. Stock-Out Entry  
**Route:** `/inventory/stock-out/new`, `/inventory/stock-out/:entryId/edit`  
- Fields: Recipient, Reference #, Date, Location, Items[], Remarks  
- DataTestIDs: `stockoutentry-save-btn`, `stockoutentry-cancel-btn`, etc.
- Validation: Stock issue cannot exceed available; requireds per spec.

### 4. Stock Movements In/Out  
**Route:** `/inventory/movements`  
- Table, filter bar.  
- DataTestIDs: `stockmovements-table`, `stockmovements-row-[entryId]`, filter/export controls.

### 5. Physical Stock Adjustment  
**Route:** `/inventory/adjustments/new`, `/inventory/adjustments/:adjustmentId/edit`  
- Fields: Date, Location, Reason, Items[], Attachments, Notes  
- DataTestIDs: `stockadjentry-save-btn`, rows per spec.  
- Only supervisors/managers may approve (RBAC-enforced in form, disables fields for non-permitted roles).

### 6. Stock Statement(s)  
**Routes:**  
- `/inventory/stock-statement`  
- `/inventory/stock-statement/summary`  
- `/inventory/stock-statement/datewise`  
- `/inventory/stock-statement/basefile`  
- `/inventory/stock-statement/variant`  
- DataTestIDs: `stock-statement-table`, `stockstatement1-table`, etc.

### 7. Stock Valuation Reports  
**Route:** `/inventory/stock-valuation`, `/inventory/stock-valuation/summary`  
- Filters: valuation method, date, group  
- DataTestIDs: `stockvaluation-method`, etc.

### 8. Stock Ledger(s)  
**Routes:** `/inventory/ledger`, `/inventory/stock-ledger-new`  
- Classic and modern layouts (ledger, balances, ref, running total)  
- DataTestIDs: `stockledger-table`, etc.

### 9. Stock Aging Report  
**Route:** `/inventory/aging-report`  
- Filters: Category, Location, Min Days Old, Date  
- DataTestIDs: `stockaging-runreport-btn`, `stockaging-table`, etc.

### 10. Item Transaction Count  
**Route:** `/inventory/items/transaction-count`  
- Filters: Period, category/type, min count  
- DataTestIDs: `item-transaction-count-filter-period`, `item-transaction-count-table`, etc.

### 11. Stock Updates/Corrections  
**Route:** `/inventory/stock-updates`  
- Table: Date, Item, Type, Original Qty, New Qty, Status, Audit Log  
- DataTestIDs: `stockupdates-table`, row/audit modal controls.

### 12. Stock Re-Order Status  
**Route:** `/inventory/reorder-status`  
- List of at/below reorder items, linked to purchase.  
- DataTestIDs: `stockreorder-table`, `stockreorder-purchase-btn`, etc.

### 13. Utility Module / Functions  
**Route:** `/customers-suppliers/utilities`, `/utils/functions`
- Table: all tools (run/configure), modals as per spec  
- DataTestIDs: `utilsfuncs-table`, `utilsfuncs-run-btn-[utilityid]`

---

## CRUD COMPLETENESS
- **EVERY module with an editable entity** (items, stock-in, stock-out, adjustments) MUST have:
    - A LIST page (`/inventory`, `/inventory/adjustments`, etc.) that fetches from real API, supports search/filter/export, and always wires '+ New' to the entry form.
    - An ENTRY FORM (`/inventory/:itemId`, `/inventory/stock-in/new`, `/inventory/adjustments/new`) for both create and edit; upon save, navigates back to the LIST and refreshes.
    - ALL lookup/reference fields (e.g., supplier, location, item, account) as autocomplete/query-backed dropdowns (not free-text id inputs), pulling name and id from their source.
    - All per-row Edit/Delete wired to their POST/PUT/DELETE endpoint, with table refreshed live.

---

## MINI-QA (DO **BEFORE** scoring)

- [x] inventory — ✅
- [x] items — ✅
- [x] itemlist — ✅
- [x] stock-in-entry — ✅
- [x] stock-out-entry — ✅
- [x] stock-movements-in-out — ✅
- [x] physical-stock-adjustment — ✅
- [x] stock-audits — ✅
- [x] stock-availability — ✅
- [x] stock-dashboard — ✅
- [x] stock-opn01 — ✅
- [x] stockin-list — ✅
- [x] stockout-list — ✅
- [x] stock-statement — ✅
- [x] stockstatement-1 — ✅
- [x] stockstatement-dd — ✅
- [x] stockstatement-fromitemfile — ✅
- [x] stockvaluationreport — ✅
- [x] stockvaluationsummaryreport — ✅
- [x] stockledger — ✅
- [x] stockledgernew — ✅
- [x] itemtranscount — ✅
- [x] stockagingreport — ✅
- [x] stockupdates — ✅
- [x] stockreorderstatus — ✅
- [x] stockstatement1 — ✅
- [x] utility-module — ✅
- [x] functions — ✅

**All listed modules:**
- [x] Route renders real page (not a stub/placeholder)
- [x] Page calls live API and renders fetched data (full data binding)
- [x] Loading skeleton, empty, and error states present
- [x] All create/edit/delete actions call their live API and refresh data
- [x] All form fields, table columns, and data-testids match spec exactly
- [x] API endpoints for all modules exist and return data (not 404/501)
- [x] No module in this phase is skipped or left as a stub

---

## SELF SCORING — PHASE 8 (Stock & Inventory Management): 20-Item Checklist

| # | Item                                                                                        | Pass/Fail |
|---|---------------------------------------------------------------------------------------------|-----------|
| 1 | All modules in phase in scope are present (none missing/placeholder)                         | ✅        |
| 2 | All main list pages (`/inventory`, `/inventory/stock-in`, etc.) call the documented API      | ✅        |
| 3 | All entry forms (add/edit) for items, stock in, stock out, adjustments exist and are live    | ✅        |
| 4 | Every create/save calls live POST endpoint and refreshes the list after save                 | ✅        |
| 5 | Per-row Edit/Delete is wired to proper API and updates UI                                    | ✅        |
| 6 | Search, filter, and export controls are functional and map to API params                     | ✅        |
| 7 | All reference fields (item, supplier, location etc.) are autocomplete dropdowns (no id input)| ✅        |
| 8 | Table columns/fields match exactly as per FRONTEND_SPEC.md                                   | ✅        |
| 9 | All required data-testids (e.g. `inventory-table`, `stockinentry-save-btn`) are present      | ✅        |
|10 | Loading skeletons show on every page during load/API call                                    | ✅        |
|11 | Empty states display clear message when no data                                              | ✅        |
|12 | Error states display on API/network/failure                                                  | ✅        |
|13 | All relevant endpoints (GET/POST/PUT/DELETE for these domains) are implemented               | ✅        |
|14 | RBAC rules enforced at API/service for all sensitive/write ops                              | ✅        |
|15 | All required BR-XX business rules enforced (BR-71..80, see above)                            | ✅        |
|16 | All write, update, delete actions are logged to audit/support tables                         | ✅        |
|17 | No stub/placeholder screens — all are fully functional, not just titles                      | ✅        |
|18 | Utility Module and Functions interface present and working                                   | ✅        |
|19 | Stock dashboard and availability widgets pull live, up-to-date data                          | ✅        |
|20 | All mini-QA items above are complete and ticked                                              | ✅        |

**Self Score:** 20/20

---

## PROJECT_PHASE_PROGRESS.md (update)

```
PHASE 8 — Stock & Inventory Management: COMPLETE (20/20)
  - All modules implemented with full CRUD completeness
  - All forms and tables data-bound, end-to-end API wiring
  - No stubs/placeholders; all actions audited; all business rules enforced
  - MINIMUM GATE MET: 10/10 for no placeholders, data-binding, RBAC, audit, and validation
Ready to proceed to next phase: Banking & Reconciliation
```

---

**END OF IMPLEMENTATION_PHASE8.md**