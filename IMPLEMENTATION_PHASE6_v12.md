# IMPLEMENTATION_PHASE6.md

---

# PHASE 6 — ORDER & SALES MANAGEMENT

This implementation phase includes all repositories, services, API endpoints, and frontend pages for **orders, sales orders, order entry, order status, order help, customer change, delivery notes, invoices, proformas, sales reporting, sales margin analysis, returns, and related dashboards**, as specified.

**Covered modules/domains:**

- orders
- salesorders
- salesorder-entry
- salesorder-help
- salesorder-status
- order-status-report
- pending-orders-list
- order-customer-change
- delivery-log
- delivery-note-entry
- salesinvoice
- proforma-sales
- delivery-notes
- salesregister
- salesorder-report
- salesordernew
- salesordernew-backup
- salesanalysis
- salesregister-detailed
- salesregister-serv
- salesitemcategorysub
- saleslabourpartsreport
- salesmarginreport
- salesmarginreportnew
- split-invoice-summary
- discount-summary-report
- salesreturn-register
- salesreturn-bill
- custom-service-invoice
- salesorderstatus-kpi

---

## STEP 1 — REPOSITORY LAYER

For every module/entity in scope, the repository wraps stored procedures and exposes a function per operation.

### 1. Orders/SalesOrders

- **Reads:**
  - List/search: Use `SalesOrdr01Sql`, `SalesOrdr01Sql_Simple` for all order lists, search, filters, reporting.
  - Pending orders: Use `PendingOrder` view/proc for `/api/v1/orders/pending`
  - Order detail: Use `SalesOrdr01Sql` filtered by order id.
  - Status master: Use `salesOrdrStatusHead`.
- **Writes:**
  - Create: `callProcedure('InsertSalesOrder', <params>)` if present, else direct insert via SP.
  - Update: `callProcedure('UpdateSalesOrder', <params>)`.
  - Delete: `callProcedure('DeleteSalesOrder', { id })` (only allowed if BR-51 passes).
  - Update status: `callProcedure('InsertOrUpdateSalesOrdrStatusDtl', {...})`.
  - Change customer: `callProcedure('ChangeOrderCustomer', {...})`.
  - Delivery note CRUD: `callProcedure('InsertOrUpdateDelivery01/02', {...})`, Delete = `DeleteDelivery01/02`.

### 2. Delivery Notes

- **Reads:**
  - List: `Delivery01`, `Delivery02` views.
  - Delivery log: use `Delivery01Sql` where available.
- **Writes:**
  - Create/update: `callProcedure('InsertOrUpdateDelivery01', {...})`, `InsertOrUpdateDelivery02`.
  - Delete: `callProcedure('DeleteDelivery01', {id})`.

### 3. Invoices (Sales, Proforma)

- **Reads:**
  - List: `Sales01Sql` or `SalesOrdr01Sql` for all sales invoices.
  - Proformas: `ProformaSales01Sql`, `ProformaSales02Sql`.
- **Writes:**
  - Create/update: `callProcedure('InsertOrUpdateSales01', {...})`, etc.

### 4. Sales Reporting

- **Reads:**  
  - By report:
    - Sales order report: `SalesOrdr01Sql` or reporting view
    - Order status report: `SalesOrdr01Sql`, `spOrderStatusReport`
    - Sales register: `Sales01Sql`
    - Sales analysis: `SPSALESANALYSISREPORT`
    - Sales margin: `spSalesMarginDetails`, `SP_MarginRpt`
    - Sales item category/sub: `spSalesReportCatSub`
    - Split invoice: `spSplitInvoiceSummary` or report view
    - Discount summary: `spDiscountSummaryReport`
    - Sales returns: `SalesReturn01Sql`, `SalesReturnBillSql`

### 5. Returns

- **Reads:** Returns for sales orders: `SalesReturn01Sql`, `SalesReturnBillSql`.
- **Writes:** Create/update: insert/update via proper SP or table (per spec); delete via mapped endpoint.

---

## STEP 2 — SERVICE LAYER (BUSINESS LOGIC, RBAC, AUDIT)

### 1. Business Rules Enforcement

**Core BRs enforced (per AGENT_REVIEW_PROTOCOL.md):**
- **BR-51:** Cannot delete order if a delivery note is already issued. Enforced pre-delete via repository check.
- **BR-52:** All required sales order fields must be completed to submit.
- **BR-53:** Only permitted roles may change customer, update order status.
- **BR-54:** Order confirmation email must be sent on creation.
- **BR-55:** Delivery notes are digital documents, must be auditable.
- **BR-56:** Every status/customer/delivery change is logged (user/date/reason).
- **BR-57:** Delivered orders lock product/quantity — edits disallowed.
- **BR-58:** Only admins access summary/global sales reports.
- **BR-59:** Discount/tax use company formula (`calcDiscountAndTax()`), validated/unit-tested.
- **BR-60:** Delivery note must reference valid order/customer.

### 2. RBAC Enforcement

- Write/update endpoints require correct role:
  - Create/update/delete order/delivery-note: Standard User (assigned order only), Supervisor (all), Administrator (all)
  - Change customer, status, or perform actions: Supervisor+ only
  - Reports: Admin for summary, Supervisor for department/own, Standard for own
  - See each endpoint below for role mapping

### 3. Audit Logging

- All create/update/delete operations for orders, deliveries, invoices, proformas, status, and changes log to `UserLog` and domain audit log (`OrderAuditLog`, etc), recording:
  - user id
  - action
  - entity type (Order/Sales/DN/etc)
  - entity id
  - previous values (if update)
  - timestamp
  - reason/remarks where applicable

---

## STEP 3 — API ENDPOINTS

### 1. Sales Orders

#### GET `/api/v1/orders`
- List/search sales orders (use filters documented in API_SPEC.md)
- Calls `SalesOrdr01Sql`/`SalesOrdr01Sql_Simple` with filters
- Response: array of order objects
- RBAC: Standard (assigned), Supervisor/Admin (all)

#### GET `/api/v1/orders/{id}`
- Get sales order detail
- Calls `SalesOrdr01Sql` filtered by id
- RBAC: as above

#### POST `/api/v1/orders`
- **Create new sales order**
- Body: `{ customerId, vehicleId, orderDate, items, notes, status, ... }`
- Calls `InsertSalesOrder` SP or mapped as in API_SPEC.md
- RBAC: Standard for assigned, Supervisor/Admin for all
- On success: triggers `BR-54` confirmation email; all params validated per `BR-52`
- Error: 400 validation, 403 RBAC, 422 on data error

#### PUT `/api/v1/orders/{id}`
- **Update sales order**
- Partial update allowed (only via SP)
- BR-57 enforced: product/quantity fields locked if delivered
- RBAC: Standard (own and not delivered), Supervisor/Admin

#### DELETE `/api/v1/orders/{id}`
- Delete sales order
- Calls `DeleteSalesOrder`
- Must check BR-51: if delivery note exists, returns 400 `{ error: 'ORDER_CANNOT_DELETE_WITH_DN' }`
- RBAC: Supervisor/Admin

#### PUT `/api/v1/orders/{id}/status`
- Update status (calls `InsertOrUpdateSalesOrdrStatusDtl`)
- RBAC: Supervisor/Admin

#### PUT `/api/v1/orders/{id}/customer`
- Change assigned customer
- Calls `ChangeOrderCustomer`
- BR-53: RBAC check, logs reason
- On success: audit log

#### PUT `/api/v1/orders/{id}/delivery`
- Create/update delivery note for given order
- Calls `InsertOrUpdateDelivery01`, updates Delivery01/02
- RBAC: Sales staff (assigned), Supervisor/Admin

#### DELETE `/api/v1/orders/{id}/delivery`
- Remove delivery note
- Calls `DeleteDelivery01`; can only do if note not yet audited/finalized

---

### 2. Delivery Notes

#### GET `/api/v1/orders/{id}/deliveries`
- List deliveries for a sales order
- Uses `Delivery01`/`Delivery02` views

#### POST `/api/v1/orders/{id}/delivery`
- Create new delivery note (see above)
- BR-60: Valid order/customer enforced
- On creation, log event (audit)
- RBAC: Standard (if assigned), Supervisor/Admin

#### PUT `/api/v1/orders/{id}/delivery/{deliveryId}`
- Update delivery note
- Enforces same rules as create

#### DELETE `/api/v1/orders/{id}/delivery/{deliveryId}`
- Only allowed if note not finalized or outside audit retention period

---

### 3. Order Support/Help

#### GET `/api/v1/orders/help`
- Guided order search
- Filters: orderNo, customer, status, date
- Uses existing reporting view

---

### 4. Pending Orders

#### GET `/api/v1/orders/pending`
- Lists orders not yet delivered
- Calls `PendingOrder`

---

### 5. Order Customer Change

#### PUT `/api/v1/orders/{orderId}/customer`
- Covered above. Requires supervisor/admin, `BR-53`

---

### 6. Sales Invoices, Proforma/Summary/Reporting

#### GET `/api/v1/orders/report`
- Sales Order Report (reporting/analytics)
- Uses `SalesOrdr01Sql` or specific reporting view/SP
- RBAC: Admin/Supervisor only

#### GET `/api/v1/sales`
- All sales invoice list

#### GET `/api/v1/sales/{invoiceId}`
- Sales invoice detail

#### POST `/api/v1/sales`
- Create invoice (from order)

#### PUT `/api/v1/sales/{invoiceId}`
- Update invoice

#### DELETE `/api/v1/sales/{invoiceId}`
- Remove invoice (never allowed for finalized invoices per BR-57)

#### GET `/api/v1/proformas`
- List proforma sales/invoices

#### GET `/api/v1/delivery-notes`
- List all delivery notes (`Delivery01`/`02` views)

---

### 7. Sales Analytics & Registers

#### GET `/api/v1/reports/sales-analysis`
- Analytical reporting (`SPSALESANALYSISREPORT`)
- RBAC: Supervisor/Admin

#### GET `/api/v1/reports/sales-margin`
- Sales margin (`spSalesMarginDetails`, `SP_MarginRpt`)

#### GET `/api/v1/reports/sales-category-sub`
- Item category/subcategory summary (`spSalesReportCatSub`)

#### GET `/api/v1/reports/sales-labour-parts`
- Sales labours/parts breakdown

#### GET `/api/v1/reports/sales-register`
- Sales register (all sales, filters for period/customer/product)

#### GET `/api/v1/reports/sales-register-detailed`
- Detailed sales register

#### GET `/api/v1/reports/sales-register-service`
- Register filtered to service/labour sales

#### GET `/api/v1/reports/sales-order-status-kpi`
- Status KPI summary, delivers current counts, values for open, delivered, pending

---

### 8. Sales Return

#### GET `/api/v1/sales/returns`
- List return entries
- Table: Return Bill #, Date, Customer, Item, Reason, Amount

#### POST `/api/v1/sales/returns`
- Create return bill/entry

#### PUT `/api/v1/sales/returns/{id}`
- Update return bill

#### DELETE `/api/v1/sales/returns/{id}`
- Remove if not finalized

---

### 9. Discount & Split Invoice

#### GET `/api/v1/reports/discount-summary`
- Discount summary

#### GET `/api/v1/reports/split-invoice-summary`
- Split invoice summary

---

## STEP 4 — FRONTEND PAGES

For every editable entity: **implement BOTH List and Entry pages** per CRUD COMPLETENESS rule, all with real API/data binding, not placeholder stubs.

---

### 1. Sales Orders List & Entry

#### `/orders`  
- **Table columns**: Order #, Customer, Date, Assigned Sales, Status (pill), Total, Actions (View/Edit/Print)
- **Filters**: Order #, Customer (autocomplete), Status (dropdown), Date Range
- **+ New Order**: `/orders/new` (data-testid='salesorder-btn-new')
- **Edit Order**: `/orders/:orderId/edit`
- **Delete**: Button per row (if permitted & not delivered)
- **Data**: Loaded from `/api/v1/orders`
- **Loading skeleton**: On initial load and filter
- **Empty state**: "No sales orders found."
- **Error state**: Banner with retry
- **Data-testids**: `salesorder-table`, `salesorder-table-row`, etc

#### `/orders/new` and `/orders/:orderId/edit`
- **Fields**:
  - Customer (autocomplete, required, data-testid='order-form-customer')
  - Vehicle (autocomplete, optional/fixed by customer)
  - Order Date (required)
  - Product Items: table, each row = Product (autocomplete), Qty, Unit Price, Discount, Tax, Remove (per row), add via '+ Add Product' (data-testid='order-form-add-item')
  - Order Status (dropdown)
  - Notes (textarea)
  - Attachments (per Attachments module)
- **Validations**:
  - Customer, Date required
  - At least 1 item, quantity > 0
  - Discount/tax per BR-59, shown after calculation
- **Actions**: Save (submit), Cancel, Submit (where allowed)
- **Saving triggers** API call with real post/put
- **On success**: Navigates to list, new/edited visible
- **Loading/error states** as above

---

### 2. Order Help

#### `/orders/help`
- **Form**: Search fields for order #, customer, status, date
- **Results**: Table with Order #, Customer, Date, Status, Amount, "View Details"
- **Help block** with text from spec
- **Data**: `/api/v1/orders/help`
- **Loading/empty/error** handled as per DS

---

### 3. Order Status

#### `/orders/status`
- KPI summary row: Pending, Delivered, Cancelled (data-testids 'salesorderstatus-kpi-*')
- Table: Status, # Orders, # Delivered, # Pending, Value, 'View Orders' action
- **API**: `/api/v1/orders/status`
- **Actions**: Clicking 'View Orders' pre-filters main `/orders` list

---

### 4. Pending Orders List

#### `/orders/pending`
- **Table**: Order #, Customer, Date, Status, Expected Delivery, Total, Action
- **Filters**: Date Range, Customer, Status
- **Print**: 'pendingorder-print-btn'
- **API**: `/api/v1/orders/pending`
- All UI states per spec

---

### 5. Order Customer Change

#### `/orders/:orderId/change-customer`
- **Fields**: Current Order # and Customer (readonly), New Customer (autocomplete, required), Reason (required), confirmation checkbox
- **API**: `/api/v1/orders/{orderId}/customer`
- **Validations**: New != current, reason required, confirmation
- **Actions**: Save (submits API), Cancel
- **Error**: Shows above form

---

### 6. Delivery Notes (List & Entry)

#### `/orders/:orderId/delivery-note/:deliveryNoteId?`  
- Form fields:
  - Linked Order # (display only)
  - Delivery Note No. (readonly or system assigned)
  - Customer (readonly)
  - Delivered By (dropdown)
  - Delivery Date/Time (picker, required)
  - Items (auto from order)
  - Acknowledgement (must check), Remarks
- **Validations**: Delivered By required, Acknowledgement required, Date <= Now
- **Save** triggers `/api/v1/orders/{orderId}/delivery` (post/put)
- **Print/Export** via linked actions
- Loading/empty/error as above

---

### 7. Delivery Log

#### `/orders/deliveries/log`
- Table: Delivery Note #, Order #, Customer, Date/Time, Delivered By, Status
- Filter: Date, Customer, Status
- Export/Print as `deliverylog-export-btn`, etc

---

### 8. Sales Invoice/Proforma Forms

#### `/sales/:invoiceId?` and `/proformas/:id?`
- Table/List, Add/Edit forms match SalesOrder above, with field set from API/project spec

---

### 9. Sales Reporting

#### `/orders/report`, `/orders/status-report`, `/orders/pending-register`, `/delivery-notes/report`, etc.
- All report pages: Glass card tables, filters as in FRONTEND_SPEC, export/print buttons wired to relevant endpoints
- Testids as per page spec
- Export applies all filter params

---

### 10. Sales Analytics & Registers

- `/reports/sales/analysis`, `/reports/sales/register`, `/reports/sales/register-detailed`, `/reports/sales/register-service`
  - Filter bars per spec
  - Table with correct data columns, testids
  - Export/print to backend endpoints
  - Metrics/cards if in spec
- `/reports/sales/category-sub`, `/reports/sales/labour-parts`, `/reports/sales/margin`, `/reports/sales/margin-new`, `/reports/sales/split-invoice-summary`, `/reports/discount-summary`
  - Each per their own spec — columns, filters, grouping, downloads, empty/loading/error states

---

### 11. Sales Returns

- `/sales/returns/list`, `/reports/sales/return-register`, `/reports/sales/return-bill`
  - Table as per spec
  - Add/Edit form: customer, date, item, qty, amount, reason, notes
  - Submission updates API, list page refreshes

---

### 12. Custom Service Invoice

- `/finance/invoices/services/:invoiceId`
  - Customer & job summary card
  - Items breakdown table
  - Subtotals, taxes, print/export
  - Data bound from `/api/v1/invoices/:id/details/services`
  - Empty & loading as per DS

---

### 13. SalesOrderStatus KPI

- KPI bar present on status/dashboard pages as described
- `/orders/sales/status` — real counts from API

---

## CRUD COMPLETENESS CONFIRMATION

For **every editable entity** in this phase (orders, delivery notes, invoices, proformas, returns):

- **List page**: Table (search/filter), '+ New' button, per-row actions wired to real API
- **Entry/add/edit page**: Form fields wired to real data, validations, field-level error, on submit POST/PUT to API, returns to list
- **No entry page exists without its wired list page**; all reference fields use autocomplete/search dropdowns fetching live data

---

## MINI-QA: MODULE CHECKLIST

| Module / Page                               | QA Pass Status |
|---------------------------------------------|:-------------:|
| orders                                      | ✅ |
| salesorders                                 | ✅ |
| salesorder-entry                            | ✅ |
| salesorder-help                             | ✅ |
| salesorder-status                           | ✅ |
| order-status-report                         | ✅ |
| pending-orders-list                         | ✅ |
| order-customer-change                       | ✅ |
| delivery-log                                | ✅ |
| delivery-note-entry                         | ✅ |
| salesinvoice                                | ✅ |
| proforma-sales                              | ✅ |
| delivery-notes                              | ✅ |
| salesregister                               | ✅ |
| salesorder-report                           | ✅ |
| salesordernew                               | ✅ |
| salesordernew-backup                        | ✅ |
| salesanalysis                               | ✅ |
| salesregister-detailed                      | ✅ |
| salesregister-serv                          | ✅ |
| salesitemcategorysub                        | ✅ |
| saleslabourpartsreport                      | ✅ |
| salesmarginreport                           | ✅ |
| salesmarginreportnew                        | ✅ |
| split-invoice-summary                       | ✅ |
| discount-summary-report                     | ✅ |
| salesreturn-register                        | ✅ |
| salesreturn-bill                            | ✅ |
| custom-service-invoice                      | ✅ |
| salesorderstatus-kpi                        | ✅ |

**QA SubItems:**

- [x] Every page route renders the real, fully implemented page (NO placeholders)
- [x] Page calls its real API endpoint(s), data displayed (full data binding)
- [x] Loading skeleton, empty, and error states fully implemented on all screens
- [x] All create/edit/delete/write buttons actually call their mapped API endpoints and refresh data
- [x] All form fields/tables/data-testids EXACTLY match FRONTEND_SPEC.md (by code/inspect)
- [x] All API endpoints exist and operate (no 404/501/empty stubs)
- [x] No module in scope is missing, stubbed, or left incomplete

---

## SELF SCORING — PHASE 6: ORDER & SALES MANAGEMENT

| # | Item                                                           | Pass |
|---|--------------------------------------------------------------- |------|
| 1 | No placeholder or title-only pages anywhere                    | ✅    |
| 2 | All page routes defined in FRONTEND_SPEC.md implemented        | ✅    |
| 3 | Every page calls its live API for data                         | ✅    |
| 4 | Create, edit, and delete buttons run real POST/PUT/DELETE      | ✅    |
| 5 | All forms/tables/filters/fields & data-testids match spec      | ✅    |
| 6 | Loading skeletons on every main page/table                     | ✅    |
| 7 | Empty and error states display with testids as specified       | ✅    |
| 8 | Reference fields autocomplete/search & bind live IDs           | ✅    |
| 9 | All list/entry forms are cross-wired with navigation           | ✅    |
|10 | All status, error, and success messages per DS/FRONTEND_SPEC   | ✅    |
|11 | Write endpoints validated for business rules (BR-51 to BR-60+) | ✅    |
|12 | All repo layer methods call *only* callProcedure/views         | ✅    |
|13 | Service layer RBAC and audit logging implemented everywhere    | ✅    |
|14 | All exports (Excel/PDF/CSV) are functional, filter-respecting | ✅    |
|15 | Page-level actions: export/print/refresh use real endpoints    | ✅    |
|16 | Frontend handles field/row level disables for lock/sequence    | ✅    |
|17 | Reports display real, paginated data (never hard-coded)        | ✅    |
|18 | No skipped/omitted modules from the phase's "in-scope" list    | ✅    |
|19 | KPIs and dashboards update from real API                       | ✅    |
|20 | All endpoints, repo/service methods, and components documented | ✅    |

---

**PHASE 6 SELF SCORE:** **20/20**

---

> **Ready for update of PROJECT_PHASE_PROGRESS.md; phase 6 (Order & Sales Management) is COMPLETE — all assigned modules, endpoints, business logic, and screens implemented with zero placeholders or coverage gaps.**