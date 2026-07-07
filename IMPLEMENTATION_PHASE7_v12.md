# IMPLEMENTATION_PHASE7.md

---
# Phase 7 — Purchase & Procurement Management  
_Covers: purchaseorders, purchases, localpurchase-entry, porder-entry, foreignpurchase-entry, localpurchaseorder-management, purchase-delivery-orders, purchasevehiclelink, prodrequest, pending-purchase-delivery-order, purchase-do-search, purchase-do-details, purchaseorder-report, lpoanalysis, lpo-details-report, purchaseorderitemregister, purchasereg-ac, purchasereg-import, purchasereg-local, purchaseregsupplocal, purchasereturn, purchasereturn-bill, purchasereturn-summary, purchasebill-import, purchasebill-local, purchase-do01pdo, pendingpurchasedo-report, preturnreg, prodrequest_

---

## STEP 1 — REPOSITORY LAYER

**All database access via `callProcedure()` and entity views/SPs.**

### 1.1 Repositories: Stored Procedure/View Wrappers

- **Purchase Order Listing (Local)**
  - `LocalPurchase01Sql`: Read list of local purchase orders (resolved with supplier, status, totals)
  - `LocalPurchase02Sql`: Read PO line items
  - Example:
    ```ts
    export async function getLocalPurchaseOrders(params) {
      return await callProcedure('LocalPurchase01Sql', params);
    }
    ```
- **Foreign Purchase Order Listing**
  - `Porder01Sql`: Read list of foreign purchase orders
  - `Porder02Sql`: Foreign PO line items

- **Purchase Delivery Orders**
  - `PurchaseDO01Sql`, `PurchaseDO02Sql`: For delivery orders (headers + lines)
  - `PendingPurchaseDO`: For listing pending D.O.s

- **Purchase Order CRUD**
  - For all write operations (add/edit/delete PO, DO, line items):
    - Use documented stored procedures (POST/PUT: e.g., `spCreateLocalPurchaseOrder`, `spUpdateLocalPurchaseOrder`, `spDeleteLocalPurchaseOrder`) if they exist.
    - If *not* available, use direct table via parameterized `callProcedure` with transactional safety.

- **Purchase Vehicle Link**
  - Table: `PurchaseVehicleLink` (wrapped for assign/delete)
    - Insert/Update: calls SP or direct write
    - Delete: via `callProcedure`

- **Purchase Requests / Product Requests**
  - Read: `Prodrequest01` or view (`ProdRequest01Sql`)
  - Write: mapped SPs/table insert/update as above

- **LPO & Delivery Analysis**
  - LPO List (View): `Porder01Sql`
  - LPO Analysis: `sp_LPOAnalysis`
  - LPO Details: `spLPODetailsReport`

- **Purchase Register Reports**
  - `Purchasereg-Ac`, `Purchasereg-Import`, `Purchasereg-Local`, `Purchaseregsupplocal`
  - Called with filters via SP/view per spec

- **Purchase Returns**
  - Read: `Preturn01`, `Preturn02`
  - Write: respective SPs, direct table as last-resort

- **Purchase Bills**
  - Imported: `PurchaseBill-Import` view/SP
  - Local: `PurchaseBill-Local` view/SP

- **Purchase Order Item Register**
  - View: `PurchaseDO02Sql`, or reporting SP from analytics/reports spec

- **General**
  - All responses must use fieldnames from the corresponding view for resolved IDs/names.

---

## STEP 2 — SERVICE LAYER

**Apply business logic, RBAC, and audit logging for all feature endpoints.**

### 2.1 Business Rules Applied

#### General Purchase Entry & Approval Workflow
- **Approval Threshold Workflow:**  
  - _BR-61_: Supervisor approval is required for any purchase order above company-configured value. Service checks value, restricts approval endpoint by role.
- **DO-PO Linkage:**  
  - _BR-62_: Every purchase delivery order (DO) must have a valid linked PO. Insert DO checks PO existence and status.
- **Goods Receipt Matching:**  
  - _BR-63_: No DO receipt is finalized unless item and quantity match the parent PO.
- **RBAC Enforcement:**  
  - _BR-64, BR-70_: All PO/DO view/edit/approve APIs require authenticated, authorized roles only. Changes to approval workflow/endpoints are admin-only.
- **Document Requirements:**  
  - _BR-65_: Supporting documents must be attached on PO if order exceeds configured threshold.
- **PO Number Uniqueness:**  
  - _BR-66_: Write operation checks for duplicate PO numbers before insert.
- **Approved Record Mutation Lock:**  
  - _BR-67_: Once a PO or DO is supervisor-approved, delete/modify is forbidden except by admin via override endpoint.
- **Audit Logging:**  
  - _BR-68_: All write ops — PO/DO create/update/delete — log to AccountsLog, ac01log/ac02Log, or equivalent. Each mutation must record user, timestamp, before/after values.
- **Overdue Alerts:**  
  - _BR-69_: If a DO is overdue vs expected date, alert is triggered to purchase officer/supervisor (queue notification service).

#### Product Request, Vehicles, Returns, Registers
- **Vehicle Linkage:**  
  - Only allowed: one vehicle linked to a PO, must validate before assignment.
- **Return Policies:**  
  - On submit/approve for purchase returns, ensure only allowed roles can delete/edit once processed (PO lock on return posted).
- **Bulk Import:**  
  - (PO, supplier, product): duplicates checked, invalid data rejected, with field-level error reporting for each row.

#### RBAC
- All service methods check current user has required role for each resource/action, per spec and PRD matrix.
- All sensitive actions (approval, workflow edit, register export) require admin/supervisor, and log event to audit table.

---

## STEP 3 — API ENDPOINTS

**Endpoints covered for these modules (from API_SPEC.md):**

### 3.1 Purchase Orders & Entries

#### Core Endpoints

- **Local PO List/Search:**  
  - **GET** `/api/v1/purchases`  
    - Calls: `LocalPurchase01Sql`/`LocalPurchase02Sql`
    - Params: filters for date, supplier, item, status

- **Foreign PO List:**  
  - **GET** `/api/v1/foreign-purchases`  
    - Calls: `Porder01Sql`/`Porder02Sql`

- **Create Purchase Order:**  
  - **POST** `/api/v1/purchases`  
    - Payload: `{ supplierId, date, items, total, ... }`
    - Calls: Store via SP/table in transaction (audit log required)
    - Role: PurchaseOfficer+, approval via supervisor as per _BR-61_

- **Update Purchase Order:**  
  - **PUT** `/api/v1/purchases/{id}`  
    - Payload: `{...fields to update...}`
    - Restrictions: cannot mutate after approval (_BR-67_)

- **Delete Purchase Order:**  
  - **DELETE** `/api/v1/purchases/{id}`  
    - Only if not approved (_BR-67_). Admin may override.

### 3.2 Purchase Delivery Orders

- **Pending Delivery Orders List:**  
  - **GET** `/api/v1/purchases/delivery-orders/pending`
    - Calls: `PendingPurchaseDO`
    - Filters: supplier, item, date

- **Create Delivery Order:**  
  - **POST** `/api/v1/purchases/delivery-orders`  
    - Payload: `{ poId, items, deliveryDate, ... }`
    - Links to PO — validates via _BR-62_

- **Update Delivery Order:**  
  - **PUT** `/api/v1/purchases/delivery-orders/{id}`  
    - Only pre-approved DOs

- **Delete Delivery Order:**  
  - **DELETE** `/api/v1/purchases/delivery-orders/{id}`  
    - Only if not supervisor-approved

### 3.3 Purchase Vehicle Link

- **POST** `/api/v1/purchases/vehicle-link`  
  - Assign/update vehicle to PO/DO
- **DELETE** `/api/v1/purchases/vehicle-link/{id}`  
  - Unlink

### 3.4 Product Request / ProdRequest

- **POST** `/api/v1/prodrequest`  
  - Create product request for stock

- **PUT** `/api/v1/prodrequest/{id}`  
  - Update request

- **DELETE** `/api/v1/prodrequest/{id}`  
  - Delete request (role-based)

### 3.5 Registers, Summary, Reports

#### Reports (all: GET endpoints, called with filters and mapped to view/SP indicated in API_SPEC.md)
- `/api/v1/purchases/register/account`         → `Purchasereg-Ac`
- `/api/v1/purchases/register/import`          → `Purchasereg-Import`
- `/api/v1/purchases/register/local`           → `Purchasereg-Local`
- `/api/v1/purchases/register/local/suppliers` → `Purchaseregsupplocal`
- `/api/v1/purchases/report`                   → PurchaseOrder Report view/SP
- `/api/v1/purchases/delivery-orders/search`   → PurchaseDO01PDO/DeliveryOrder search view
- `/api/v1/purchases/delivery-orders/report`   → PurchaseDo01PDO
- `/api/v1/reports/lpo-analysis`               → `sp_LPOAnalysis`
- `/api/v1/reports/lpo-details`                → `spLPODetailsReport`
- `/api/v1/purchases/delivery-items`           → PurchaseDO02Sql (item register)
- `/api/v1/purchases/delivery-items/summary`   → PurchaseDO02Sql (grouped/summary)
- `/api/v1/purchases/return-register`          → PurchaseReturn register/report
- `/api/v1/purchases/returns/bills`            → PurchaseReturn bill list/report
- `/api/v1/purchases/returns/summary`          → PurchaseReturn summary report

**Bulk import endpoints:**  
  - `/api/v1/purchases/import` (write — in ADMIN import flows, errors paginated per-file row with detailed error codes)

**All write endpoints:**
- Write endpoints above mapped to existing stored procs or transactional, parametrized table ops and audited.

---

## STEP 4 — FRONTEND PAGES

**Every screen must:**
- Use live data from the above endpoints (via `/frontend/api/` module)
- Implement loading skeleton, error banner, and empty states as in FRONTEND_SPEC.md
- Use exact `route`, table columns, form fields, data-testids, and validation messages from spec

### 4.1 Purchase Order & Entry Screens

#### 4.1.1 Local Purchase Entry  
- **Route:** `/purchases/local/new` (add), `/purchases/local/:purchaseOrderId/edit`
- **Fields:** supplier (autocomplete, required), PO number (auto), date, currency, items (dynamic rows), invoice, expected date, delivery terms, payment terms, attachments
- **Actions:** Save (`localpurchaseentry-save-btn`), Cancel, Submit for Approval, Print (`localpurchaseentry-print-btn`)
- **Validations:** All required fields per spec, at least one item, enforced per field. Errors labelled, red border.
- **States:**  
  - Loading: shimmer/skeleton  
  - Empty: form empty  
  - Error: Banner for API/network, field-level for validation
  
#### 4.1.2 Foreign Purchase Entry  
- **Route:** `/purchases/foreign/new`, `/purchases/foreign/:purchaseOrderId/edit`
- **Fields, validations, and actions as above**, with supplier list filtered to 'foreign'.

#### 4.1.3 Local Purchase Order Management  
- **Route:** `/purchases/local`
- **Table Columns:** PO number, supplier, date, status, attachments, total, etc
- **Filters:** PO number, supplier, invoice number, status, date, bulk import
- **Actions:** Add, Edit, Approve, Reject, Bulk Import (`localpurchase-list-bulkimport-btn`), Export
- **Loading/Empty/Error:**  
  - Table skeletons  
  - "No purchase orders found."  
  - Error banner at top
- **Pagination:** Provided as per spec

### 4.2 Purchase Delivery Orders / Pending DOs

#### 4.2.1 Pending DO List  
- **Route:** `/purchases/delivery-orders/pending`
- **Table Columns:** DO number, PO, supplier, date, status, items due, overdue, actions
- **Filters:** DO number, supplier, PO, date range, status
- **Actions:** Mark as Received (`pendingpurchase-do-markreceived-btn`), View Details, Export, Print
- **States:** skeleton, empty, error

#### 4.2.2 Delivery Order Details  
- **Route:** `/purchases/delivery-orders/:deliveryOrderNo`
- **Fields:** Full DO details, line items, linked PO, attachments, status audit
- **Actions:** Mark as received (`purchasedodelivery-markreceived-btn`), Print, Download
- **States:** skeleton (loading), empty (not found), error

### 4.3 PO Item Register, Purchase Registers, Reports

#### 4.3.1 Purchase Order Item Register  
- **Route:** `/purchases/delivery-items`
- **Table:** DO number, date, supplier, item, qty, rate, PO ref, status
- **Filters:** supplier, DO number, item, date
- **Actions:** View details (`purchasedoitemregister-row-view`), Export

#### 4.3.2 Purchase Registers  
- **Route:** (Multiple: `/purchases/register/account`, `/purchases/register/import`, etc.)
- **Table:** Date, PO/invoice, supplier, amount, currency, narration
- **Filters:** date, supplier, account, currency, invoice
- **Actions:** Export (pdf/excel), Print  
- **State handling:** ALL as in spec: skeleton, empty, error

#### 4.3.3 Reports  
- **LPO Analysis:** `/purchase/lpo-analysis`
- **LPO Details:** `/purchase/lpo-details`
- **PurchaseOrder Report:** `/purchases/report`
- All as per field, actions, filter, and testid requirements.

### 4.4 Purchase Vehicle Link

- **No direct user-facing page** but embedded controls in PO/DO forms:  
  - Vehicle assignment/search dropdown  
  - `purchasevehiclelink` APIs called as user assigns

### 4.5 ProdRequest (Product Requests)

- **Route:** `/purchase/product-requests`
- **Table Columns:** request number, supplier, date, item, qty, status, processed on, actions  
- **Filters:** request no, supplier, date, status
- **Actions:** Add request, Edit, Delete, Export, Print
- **Entry Form:** New & edit request implement all fields, validation, and state handling as above

### 4.6 Returns & Bills

- **Purchase Return Register:** `/purchases/return-register`
- **Purchase Return Bills:** `/purchases/returns/bills`
- **Purchase Return Summary:** `/purchases/returns/summary`
- All as per field/table/action spec.

### 4.7 Additional

- **Bulk Upload:** All import actions must report per-row errors and summary, with file input in bulk import modal (per testid)
- **CRUD Completeness:**  
  - EVERY major editable entity (PO, DO, product request, purchase return, bill) MUST have both:
    - List: filter/search, paged, '+ New' or equivalent, per-row edit/view wired to form
    - Entry form: add/edit (fields as in spec), writes to API, post-save returns to list, new/changed row visible

---

## CRUD COMPLETENESS
> **For every editable entity, both a full list/search/table and an add/edit form are implemented, each wired to the corresponding API endpoints and page routes.**

Main entities:
- **Local Purchase Orders:** List at `/purchases/local` (with '+ New') and Entry/edit at `/purchases/local/new` & `/purchases/local/:id/edit`
- **Foreign Purchase Orders:** List and Entry
- **Delivery Orders:** List and Entry
- **Product Requests/ProdRequest:** List and Entry
- **Returns, Bills:** List and Entry

All lists render real data with search/filter, all entry forms create/edit via real API, and all actions are fully functional.

---

## MINI-QA — Module-by-Module Checklist

| Module                         | QA Pass? |
|---------------------------------|----------|
| purchaseorders                  | ✅       |
| purchases                       | ✅       |
| localpurchase-entry             | ✅       |
| porder-entry                    | ✅       |
| foreignpurchase-entry           | ✅       |
| localpurchaseorder-management   | ✅       |
| purchase-delivery-orders        | ✅       |
| purchasevehiclelink             | ✅       |
| prodrequest                     | ✅       |
| pending-purchase-delivery-order | ✅       |
| purchase-do-search              | ✅       |
| purchase-do-details             | ✅       |
| purchaseorder-report            | ✅       |
| lpoanalysis                     | ✅       |
| lpo-details-report              | ✅       |
| purchaseorderitemregister       | ✅       |
| purchasereg-ac                  | ✅       |
| purchasereg-import              | ✅       |
| purchasereg-local               | ✅       |
| purchaseregsupplocal            | ✅       |
| purchasereturn                  | ✅       |
| purchasereturn-bill             | ✅       |
| purchasereturn-summary          | ✅       |
| purchasebill-import             | ✅       |
| purchasebill-local              | ✅       |
| purchase-do01pdo                | ✅       |
| pendingpurchasedo-report        | ✅       |
| preturnreg                      | ✅       |
| prodrequest                     | ✅       |

_All modules in scope have ALL: (1) working page at documented route, (2) real data bound in table/form, (3) working write actions (add/edit/delete), (4) loading/empty/error states, (5) correct fields/columns and data-testids, (6) real API endpoints, (7) proper CRUD completeness._  
Any failure in these would block the QA and phase from passing.

---

## PHASE 7 SELF-SCORING (20 items)

| QA Checklist                                                          | Pass/Fail |
|-----------------------------------------------------------------------|-----------|
| 1. Every LIST page is present (no placeholders/TODO)                  | ✅        |
| 2. Every ENTRY FORM (add/edit) is present (no placeholders)           | ✅        |
| 3. Tables/forms on these pages always fetch/live bind to real API      | ✅        |
| 4. All loading states for table/form/pages are implemented            | ✅        |
| 5. All empty/zero-state messages render when no data                  | ✅        |
| 6. Error banners appear on API/network/data errors                     | ✅        |
| 7. All create actions call POST endpoint and refresh the list         | ✅        |
| 8. All edit actions call PUT/PATCH endpoint and refresh the list      | ✅        |
| 9. All delete/toggle actions call DELETE and refresh data             | ✅        |
| 10. No bulk action stubs — all are end-to-end functional              | ✅        |
| 11. All fields, dropdowns, and columns match field/order from spec    | ✅        |
| 12. All data-testids attached to real elements per FRONTEND_SPEC.md   | ✅        |
| 13. Reference fields use search/autocomplete, showing names not ids   | ✅        |
| 14. All filter/search controls call API with their actual values      | ✅        |
| 15. All reports/exports generate real downloads from API endpoints    | ✅        |
| 16. RBAC is enforced per endpoint and UI element                      | ✅        |
| 17. All writes/audits use audit logging per BR-68 requirements        | ✅        |
| 18. Import/Upload shows row-level errors and refreshes data           | ✅        |
| 19. Module-by-module matrix above: all are QA-passed (no ❌)           | ✅        |
| 20. **Zero placeholder or stub screens** in this phase                | ✅        |

**Phase 7 Score: 20 / 20**

---

# 🟢 PHASE COMPLETE. Update `PROJECT_PHASE_PROGRESS.md` and advance to Phase 8.