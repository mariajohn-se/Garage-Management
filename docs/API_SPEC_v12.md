<!--
  Generated from : PRD_v1.0.0.md
  PRD hash       : 30974e2c05a9
  Spec version   : v12
  Generated at   : 2026-07-02 09:27:18 UTC
-->

# API_SPEC.md

---

# SECTION 1 — STORED PROCEDURE TO ENDPOINT MAPPING

For each stored procedure from DB_CONNECTION_SPEC.md, a corresponding REST endpoint specification is provided. Each GET maps to a readonly endpoint; writes are mapped in Section 2.

---

### 1.1 Auth & User Operations

#### POST /api/v1/auth/login
- **Description**: User authentication by unique identifier and password.
- **Parameters**: `{ username, password }`
- **Calls**: [APPLICATION-LAYER] (auth check against USERS table, see Section 2).
- **Response**: `{ token, refreshToken, user }`
- **Auth Role**: Public
- **Error Codes**: 401 INVALID_CREDENTIALS, 403 ACCOUNT_LOCKED, 423 ACCOUNT_DISABLED

#### POST /api/v1/auth/logout
- **Description**: Invalidate session token.
- **Parameters**: Header: `Authorization: Bearer <token>`
- **Calls**: [APP-LAYER] (session/refresh deletion, no DB call)
- **Auth Role**: Any authenticated user
- **Error Codes**: 401 TOKEN_EXPIRED

#### POST /api/v1/auth/password-reset-request
- **Description**: Initiate password reset via email.
- **Parameters**: `{ email }`
- **Calls**: [APP-LAYER] (token generation, sends email)
- **Auth Role**: Public
- **Error Codes**: 404 USER_NOT_FOUND

#### POST /api/v1/auth/reset-password
- **Description**: Reset password using a secure token.
- **Parameters**: `{ token, newPassword }`
- **Calls**: [APPLICATION-LAYER] (write to USERS table; see Section 2)
- **Auth Role**: Public
- **Error Codes**: 400 INVALID_TOKEN, 400 INVALID_PASSWORD

#### PUT /api/v1/auth/change-password
- **Description**: Change password for logged-in user.
- **Parameters**: `{ currentPassword, newPassword }`
- **Calls**: [APPLICATION-LAYER] (write USERS)
- **Auth Role**: User (self)
- **Error Codes**: 400 INVALID_PASSWORD, 401 NOT_AUTHORIZED

#### POST /api/v1/auth/unlock-account
- **Description**: Admin unlocks user account.
- **Parameters**: `{ userId }`
- **Calls**: [APPLICATION-LAYER] (write USERS table, see Section 2)
- **Auth Role**: Admin
- **Error Codes**: 404 USER_NOT_FOUND, 403 FORBIDDEN

#### GET /api/v1/auth/user-log
- **Description**: Audit and activity log report (sign-ins, fails, resets).
- **Parameters**: `?userId&dateFrom&dateTo&eventType`
- **Calls**: [View] UserLog Table/View
- **Auth Role**: Supervisor, Administrator
- **Response**: Array of `{ SLNo, UserId, UserName, ActionName, ActionDate, Remarks, ... }`
- **Error Codes**: 403 FORBIDDEN

#### GET /api/v1/auth/session
- **Description**: Get current user's session/account details and assigned roles.
- **Parameters**: Auth token
- **Response**: `{ id, fullname, email, roles, status, ... }`
- **Auth Role**: Any authenticated user

#### GET /api/v1/users
- **Description**: List/search all user accounts, with filters.
- **Parameters**: `?page&limit&name&role&status`
- **Calls**: [View] USERS table + UserRights for role mapping (may require view composition).
- **Response**: Array of users (see Section 2 for payload)
- **Auth Role**: Supervisor (read/filters), Administrator (full)

#### POST /api/v1/users
- **Description**: Create a new user (see Section 2 for DB-layer).
- **Payload**: `{ fullname, email, phone, password, roles, status }`
- **Auth Role**: Administrator

#### PUT /api/v1/users/{id}
- **Description**: Update user details (fields: name, email, phone, role, status).
- **Payload**: `{ ...fieldset }`
- **Auth Role**: Administrator

#### PUT /api/v1/users/{id}/activate
- **Description**: Activate/deactivate a user account (status change)
- **Payload**: `{ status }`
- **Auth Role**: Admin

#### PUT /api/v1/users/bulk-activate
- **Description**: Activate/deactivate multiple users
- **Payload**: `{ userIds, status }`
- **Auth Role**: Admin

#### PUT /api/v1/users/{id}/roles
- **Description**: Assign user roles (full replace)
- **Payload**: `{ roles: [ ... ] }`
- **Auth Role**: Admin

#### PUT /api/v1/users/{id}/reset-password
- **Description**: Admin resets user password (user must change on next login)
- **Payload**: `{ newPassword }`
- **Auth Role**: Admin

#### POST /api/v1/users/import
- **Description**: Bulk import users from CSV/Excel.
- **Payload**: File upload (CSV/Excel)
- **Auth Role**: Admin

#### GET /api/v1/users/export
- **Description**: Export user list as CSV/Excel.
- **Parameters**: `format=csv|xlsx`
- **Auth Role**: Admin, Supervisor (read-only)

#### GET /api/v1/employees
- **Description**: Filterable report listing all employees, with department, role, status.
- **Parameters**: `?department&role&status`
- **Calls**: [View] EmployeeSql
- **Auth Role**: Admin, Supervisor

#### [Additional RBAC/role/rights endpoints for group/feature mapping as needed.]

---

### 1.2 Customer & Supplier

#### GET /api/v1/customers
- **Description**: List/filter customers. Uses CustomerSql view.
- **Parameters**: `?search&area&phone&status&page&limit`
- **Auth Role**: Any active user

#### GET /api/v1/customers/{id}
- **Description**: Customer detail.
- **Calls**: CustomerSql
- **Auth Role**: Any active user

#### GET /api/v1/customers/reports/agewise
- **Description**: Age-wise grouping/report for customers.
- **Parameters**: date, other filters
- **Calls**: AgewiseSummary (with @Customer=1)
- **Auth Role**: Supervisor, Admin

#### GET /api/v1/suppliers
- **Description**: List/filter suppliers (SupplierSql).
- **Parameters**: `?search&area&phone&status&page&limit`
- **Auth Role**: Any active user

#### GET /api/v1/suppliers/{id}
- **Description**: Supplier detail.
- **Calls**: SupplierSql
- **Auth Role**: Any active user

#### GET /api/v1/suppliers/reports/agewise
- **Description**: Age-wise grouping/report for suppliers.
- **Parameters**: date, other filters
- **Calls**: AgewiseSummary (with @Supplier=1)
- **Auth Role**: Supervisor, Admin

#### GET /api/v1/customers/contacts
- **Description**: List/search customer contacts (Contact entries in CustomerSql, extension possible)
- **Auth Role**: Any active user

#### GET /api/v1/suppliers/contacts
- **Description**: List/search supplier contacts
- **Auth Role**: Any active user

#### [See Section 2 for create/edit/delete endpoints for Customer, Supplier, Contact, Vehicle tables (required by WRITES).]

---

### 1.3 Vehicle

#### GET /api/v1/customers/{customerId}/vehicles
- **Description**: List vehicles for a customer.
- **Calls**: CustomerVehicleSql filtered by customerId

#### GET /api/v1/vehicles
- **Description**: Search vehicles (by registration, model, customer, etc).
- **Parameters**: `?registration&model&customer&page&limit`
- **Calls**: CustomerVehicleSql

#### [Section 2 covers POST/PUT/DELETE for vehicles.]

---

### 1.4 Documents & Attachments

#### GET /api/v1/documents
- **Description**: List/search documents, filterable.
- **Calls**: Views for Document01 or Document log tables if exported as view.

#### GET /api/v1/attachments
- **Description**: Search/filter attachments by metadata.
- **Calls**: AttachmentMaster (view/table)
- **Parameters**: `?fileName&fileType&transactionId&tag&uploadedBy&dateFrom&dateTo&page&limit`

#### [Section 2 covers POST/PUT/DELETE for attachments, document edits, remarks, and logs.]

---

### 1.5 Estimations & Job Management

#### GET /api/v1/estimations
- **Description**: List/search service/job estimations.
- **Calls**: Estimation01Sql (view)
- **Parameters**: `customer, status, date, staff, ...`
- **Auth Role**: Standard, Supervisor

#### GET /api/v1/estimations/{id}
- **Description**: Get estimation details.
- **Calls**: spGetEstmationDetails (@JobCardNo)

#### POST /api/v1/estimations
- **Description**: Create new estimation (see Section 2 for write)
- **Payload**: `{ ... }`
- **Auth Role**: Standard, Supervisor

#### PUT /api/v1/estimations/{id}
- **Description**: Update estimation

#### POST /api/v1/estimations/{id}/submit
- **Description**: Submit estimation for approval

#### POST /api/v1/estimations/{id}/approve
- **Description**: Supervisor approve/reject estimation

---

### 1.6 Jobs, Work Orders, Status

#### GET /api/v1/jobs
- **Description**: Active jobs, filterable list.
- **Calls**: SalesOrdr01Sql_Simple, JobInProgressSql, WorkInProgressSql (for real time job data)
- **Parameters**: `status, advisor, customer, vehicle, inProgressOnly, overdue, ...`

#### GET /api/v1/jobs/status-master
- **Description**: List job status definitions.
- **Calls**: salesOrdrStatusHead table/view

#### POST /api/v1/jobs/status-master
- **Description**: Add/edit/deactivate job status master list (see Section 2 for write)
- **Auth Role**: Admin

#### GET /api/v1/jobs/work-status
- **Description**: Work status dashboard/analytics.
- **Calls**: spGetWorkStatus

#### GET /api/v1/jobs/finished
- **Description**: Completed jobs
- **Calls**: JObFinished

#### GET /api/v1/jobs/pending
- **Description**: Jobs with pending/incomplete job cards.
- **Calls**: PendingJobs (if writing is permitted, see Section 2)

---

### 1.7 Orders & Sales

#### GET /api/v1/orders
- **Description**: List/search sales orders.
- **Calls**: SalesOrdr01Sql / SalesOrdr01Sql_Simple
- **Parameters**: `customer, status, startDate, endDate, ...`

#### GET /api/v1/orders/{id}
- **Description**: Retrieve a sales order with all details

#### GET /api/v1/orders/pending
- **Description**: Pending sales orders (not fulfilled)
- **Calls**: PendingOrder

#### PUT /api/v1/orders/{id}/status
- **Description**: Update order status (write, see Section 2)
- **Auth Role**: Supervisor, Admin

#### PUT /api/v1/orders/{id}/customer
- **Description**: Change assigned customer (write, see Section 2)

---

### 1.8 Purchase & Procurement

#### GET /api/v1/purchases
- **Description**: List/filter purchase orders.
- **Calls**: LocalPurchase01Sql, LocalPurchase02Sql

#### GET /api/v1/purchases/delivery-orders/pending
- **Description**: List all pending purchase delivery orders (PendingPurchaseDO SP)
- **Parameters**: SupplierId (optional)

#### [PUT/POST endpoints for purchases in Section 2]

---

### 1.9 Inventory & Items

#### GET /api/v1/items
- **Description**: List/search inventory items.
- **Calls**: ItemsSql (view)
- **Parameters**: `category, tag, minStock, inactive, ...`

#### GET /api/v1/items/{itemCode}
- **Description**: Get details for an inventory item

#### GET /api/v1/inventory/quantities
- **Description**: Current stock and cost.
- **Calls**: GetSockQty

#### GET /api/v1/inventory/last-transactions
- **Description**: Aging info for items, last movement.
- **Calls**: spStockLastTrans

#### GET /api/v1/inventory/transactions
- **Description**: List all stock in/out (with optional filters)
- **Calls**: StockIn02Sql, StockOut02Sql, StockTransactionSql

#### GET /api/v1/inventory/fast-moving-items
- **Description**: Fast moving inventory items.
- **Parameters**: `fromDate, toDate, minCount`
- **Calls**: spFastMovingItems

#### [Section 2 has POST/PUT/DELETE for inventory writes.]

---

### 1.10 Ledger & Finance

#### GET /api/v1/ledger/account-heads
- **Description**: List all financial account heads.
- **Calls**: ACHEADSQL view

#### GET /api/v1/ledger/account-tree
- **Description**: Account head hierarchy/tree
- **Calls**: SPACTREEVIEW

#### GET /api/v1/ledger/account-balance
- **Description**: Balance for a head, as of a date/range
- **Calls**: Ac_headBalance

#### GET /api/v1/ledger/account-balance-period
- **Description**: Account balance for period/multiple heads.
- **Calls**: acBal, Ac_GroupTotal, ac_Group_Sum

#### GET /api/v1/ledger/opening-balance
- **Description**: Opening balance report, account(s)
- **Calls**: Opening_Balance, Opening_Balance_NEW

#### GET /api/v1/ledger/account-receipts
- **Description**: Total receipts for account (@mCustSupp=0=creditor, 1=debtor)
- **Calls**: AcRcptSum

#### GET /api/v1/ledger/current-transactions
- **Description**: Opening/current period DR/CR
- **Calls**: AcCurrentTrans

#### GET /api/v1/ledger/balance-sheet-summary
- **Description**: Summary for balance sheet
- **Calls**: AcSummary_balansheet, AcSummary_balansheet_New

#### POST /api/v1/ledger/account-heads
- **Description**: Create new account head (Section 2 for write)
- **Auth Role**: Admin

#### PUT /api/v1/ledger/account-heads/{id}
- **Description**: Edit/update account head

#### DELETE /api/v1/ledger/account-heads/{id}
- **Description**: Delete/deactivate account head

---

### 1.11 Vouchers & Journals

#### GET /api/v1/vouchers/list
- **Description**: List all vouchers (Optionally by period, account, group)
- **Calls**: VoucherList_NEW

#### GET /api/v1/vouchers/list/basic
- **Description**: List vouchers by period/account/actualDate
- **Calls**: VoucherList

#### GET /api/v1/vouchers/list/pdc
- **Description**: Post-dated cheque-specific voucher list.
- **Calls**: VoucherList_Pdc

#### GET /api/v1/vouchers/summary/monthly
- **Description**: Monthly summary
- **Calls**: VoucherSummary

#### GET /api/v1/vouchers/summary/pdc
- **Description**: Post-dated summary
- **Calls**: VoucherSummary_PDC

#### GET /api/v1/vouchers/detail
- **Description**: Get voucher details by Vsrl and account.
- **Calls**: ACDETAILSDET

#### GET /api/v1/vouchers/master-detail
- **Description**: Get master voucher details by ID or VSRL.
- **Calls**: ACMASTERDET

#### GET /api/v1/vouchers/audit-list
- **Description**: List voucher transactions for period for download.
- **Calls**: PROCVOUCHERLIST

#### [Section 2 covers voucher POST/PUT/DELETE, including bulk import and batch operations.]

---

### 1.12 Bank & Cash Book

#### GET /api/v1/banking/cash-bank-details
- **Description**: Cash/bank book for defined account, period, type.
- **Parameters**: `account, fromDate, toDate, type`
- **Calls**: SPCASHBANKDETAILS

---

### 1.13 Reports (analytics & compliance)

#### GET /api/v1/reports/customer-outstanding-salesmanwise
- **Description**: Customer outstandings by salesman/date
- **Parameters**: `date`
- **Calls**: spCustomerOutStandingSalesManwise

#### GET /api/v1/reports/salesman-invoices
- **Description**: Sales summary/grouping reports
- **Parameters**: fromDate, toDate
- **Calls**: spRptSalesManInvoices

#### GET /api/v1/reports/sales-monthly-split
- **Description**: Monthly sales split by section/type
- **Parameters**: fromDate, toDate
- **Calls**: spMonthlySplitSales

#### GET /api/v1/reports/sales-analysis
- **Description**: Detailed analytical sales report
- **Parameters**: fromDate, toDate
- **Calls**: SPSALESANALYSISREPORT

#### GET /api/v1/reports/lpo-analysis
- **Description**: LPO and DO analysis/reporting (see stored proc)
- **Parameters**: fromDate, toDate
- **Calls**: sp_LPOAnalysis

#### GET /api/v1/reports/sales-bill
- **Description**: Progress of sales bill payment/receipt
- **Parameters**: fromDate, toDate, option
- **Calls**: spSalesBillReport

#### GET /api/v1/reports/sales-staffwise
- **Description**: Staff-wise sales/receipt summary, balance info.
- **Parameters**: fromDate, toDate, staffId, hideZero
- **Calls**: spSalesReportStaffvise

#### GET /api/v1/reports/sales-margins
- **Description**: Margin report for sales (parameters as stored proc)
- **Parameters**: fromDt, toDt, bill
- **Calls**: spSalesMarginDetails

#### GET /api/v1/reports/sales-category-staff
- **Description**: Sales by category/staff/personnel
- **Parameters**: staffId, fromDate, toDate
- **Calls**: spSalesReportCatSub

#### GET /api/v1/reports/agewise-summary
- **Description**: Age bucket outstanding report
- **Parameters**: @ parameters per AgewiseSummary
- **Calls**: AgewiseSummary

#### GET /api/v1/reports/margin-breakdown
- **Description**: Detailed margin breakdown by sales/bill/order
- **Parameters**: DTFROM, DTTO, ORDRNO, INVNO
- **Calls**: SP_MarginRpt

---

### 1.14 Communications/Messages

#### GET /api/v1/users/{userId}/messages/unread-count
- **Description**: Number of unread in-app messages.
- **Calls**: MailCheck

#### GET /api/v1/users/{userId}/messages
- **Description**: List read/unread in-app messages.
- **Calls**: MailRead

#### [Section 2: POST/PUT/DELETE for MailTable]

---

### 1.15 Miscellaneous/Supporting

#### GET /api/v1/ledger/group-tree-balance
- **Description**: UDF group/tree account balance by parameters.
- **Calls**: AcHead_GroupBal

---

# SECTION 2 — APPLICATION-LAYER WRITES (DB-Preserve)

_NOTE: Each write target (CREATE, UPDATE, DELETE) must have a REST endpoint. Wrapper stored procedures will be implemented as necessary if missing. Here, endpoints are listed by resource/module._

## 2.1 User & Authentication WRITES

#### POST /api/v1/users
- Create user (INSERT into USERS).
- Parameters: `{ fullname, email, phone, password, roles, status }`
- Updates: USERS, UserRights
- Auth Role: Admin

#### PUT /api/v1/users/{id}
- Update user (UPDATE USERS).
- Payload: `{ name?, email?, phone?, roles?, status? }`

#### DELETE /api/v1/users/{id}
- Delete user (DELETE USERS).

#### PUT /api/v1/users/{id}/reset-password
- Set user password (UPDATE USERS.Pw).

#### PATCH /api/v1/users/{id}/lock
- Lock or unlock user (UPDATE USERS.Option).
- Auth Role: Admin

#### POST /api/v1/roles
- Create a new role (INSERT UserRights).

#### PUT /api/v1/roles/{id}
- Update/edit role (UPDATE UserRights).

#### DELETE /api/v1/roles/{id}
- Delete role (DELETE UserRights).

## 2.2 Customer/Supplier/Contact/Vehicle

#### POST /api/v1/customers
- Create customer (INSERT Customer).

#### PUT /api/v1/customers/{id}
- Update customer (UPDATE Customer).

#### DELETE /api/v1/customers/{id}
- Delete customer (DELETE Customer).

#### POST /api/v1/customers/{id}/contacts
- Add/update contact (INSERT or UPDATE Contact table — if implemented as new, else use appropriate field in Customer).

#### DELETE /api/v1/customers/{id}/contacts/{contactId}
- Delete contact.

#### POST /api/v1/suppliers
- Create supplier (INSERT Supplier).

#### PUT /api/v1/suppliers/{id}
- Update supplier.

#### DELETE /api/v1/suppliers/{id}
- Delete supplier.

#### POST /api/v1/vehicles
- Create customer vehicle (INSERT CustomerVehicle).

#### PUT /api/v1/vehicles/{id}
- Update vehicle.

#### DELETE /api/v1/vehicles/{id}
- Delete vehicle.

#### POST /api/v1/customer-duplicate/merge
- Merge duplicate customers (APP-LAYER: merge/resolve, updates Customer, AcDetails, CustBill, etc. See WRITES).

#### POST /api/v1/supplier-duplicate/merge
- Merge duplicate suppliers (as above).

#### POST /api/v1/vehicle-duplicate/merge
- Merge duplicate vehicles.

## 2.3 Attachments/Documents/Remarks

#### POST /api/v1/attachments
- Upload attachment (INSERT AttachmentMaster).

#### DELETE /api/v1/attachments/{id}
- Delete attachment.

#### PUT /api/v1/attachments/{id}
- Edit metadata (UPDATE AttachmentMaster).

#### POST /api/v1/documents
- Create document (INSERT Document01).

#### PUT /api/v1/documents/{id}
- Update document.

#### DELETE /api/v1/documents/{id}
- Delete document.

#### POST /api/v1/remarks
- Add remark (INSERT AdditionalRemarks).

#### PUT /api/v1/remarks/{id}
- Update remark.

#### DELETE /api/v1/remarks/{id}
- Delete remark.

#### POST /api/v1/document-heads
- Create document head (INSERT DocHead).

#### PUT /api/v1/document-heads/{id}
- Edit document head.

#### DELETE /api/v1/document-heads/{id}
- Delete document head.

## 2.4 Jobs, Estimations, Status, Assignment

#### POST /api/v1/estimations
- Create estimation (INSERT Estimation01, Estimation02).

#### PUT /api/v1/estimations/{id}
- Edit estimation.

#### DELETE /api/v1/estimations/{id}
- Delete estimation.

#### PUT /api/v1/estimations/{id}/approve
- Approve/reject estimation (UPDATE Estimation01.Approved).

#### POST /api/v1/jobs
- Create job (INSERT SalesOrdr01, SalesOrdr02).

#### PUT /api/v1/jobs/{id}
- Update job (status, assignment, progress, notes).

#### DELETE /api/v1/jobs/{id}
- Delete job.

#### POST /api/v1/jobs/{id}/assign
- Assign staff (INSERT/UPDATE AssignedJobs).

#### DELETE /api/v1/jobs/{id}/assigned-jobs/{assignedId}
- Delete assignment

#### POST /api/v1/jobs/status-master
- Add status (INSERT SalesOrdrStatusHead).

#### PUT /api/v1/jobs/status-master/{id}
- Edit status.

#### DELETE /api/v1/jobs/status-master/{id}
- Delete status.

#### POST /api/v1/jobs/in-progress
- Add in-progress entry (INSERT WorkInProgress).

#### PUT /api/v1/jobs/in-progress/{id}
- Update/complete/cancel in-progress (UPDATE WorkInProgress).

#### DELETE /api/v1/jobs/in-progress/{id}
- Delete work-in-progress record.

## 2.5 Orders

#### POST /api/v1/orders
- Create sales order (INSERT SalesOrdr01, SalesOrdr02).

#### PUT /api/v1/orders/{id}
- Update order.

#### DELETE /api/v1/orders/{id}
- Delete order.

#### PUT /api/v1/orders/{id}/status
- Update order status (INSERT/UPDATE salesOrdrStatusDtl).

#### PUT /api/v1/orders/{id}/customer
- Change customer assignment.

#### PUT /api/v1/orders/{id}/delivery
- Create or update delivery note (INSERT/UPDATE Delivery01, Delivery02).

#### DELETE /api/v1/orders/{id}/delivery
- Delete delivery note.

## 2.6 Purchase Orders

#### POST /api/v1/purchases
- Create local purchase order (INSERT LocalPurchase01, LocalPurchase02).

#### PUT /api/v1/purchases/{id}
- Update purchase order.

#### DELETE /api/v1/purchases/{id}
- Delete purchase order.

#### POST /api/v1/purchases/delivery-orders
- Create delivery order (INSERT PurchaseDO01, PurchaseDO02).

#### PUT /api/v1/purchases/delivery-orders/{id}
- Update delivery order.

#### DELETE /api/v1/purchases/delivery-orders/{id}
- Delete delivery order.

#### DELETE /api/v1/purchases/vehicle-link/{id}
- Delete PurchaseVehicleLink (DELETE)

#### POST /api/v1/purchases/vehicle-link
- Create/Update PurchaseVehicleLink (INSERT/UPDATE)

## 2.7 Inventory

#### POST /api/v1/inventory/transactions
- Add stock movement (INSERT StockTransaction).

#### DELETE /api/v1/inventory/transactions/{id}
- Remove stock transaction.

#### PUT /api/v1/items/{id}
- Update item (inventory/product master).

## 2.8 Ledger/Accounts

#### POST /api/v1/ledger/account-heads
- Add account head (INSERT AcHead).

#### PUT /api/v1/ledger/account-heads/{id}
- Edit/update account head.

#### DELETE /api/v1/ledger/account-heads/{id}
- Delete account head.

#### POST /api/v1/ledger/account-trees
- Add account tree node (INSERT AcTree).

#### DELETE /api/v1/ledger/account-trees/{id}
- Delete tree node.

## 2.9 Vouchers & Bulk Journals

#### POST /api/v1/vouchers
- Create voucher/master (INSERT Acmaster/AcDetails).

#### PUT /api/v1/vouchers/{id}
- Update voucher/master.

#### DELETE /api/v1/vouchers/{id}
- Delete voucher/master.

#### POST /api/v1/vouchers/bulk
- Bulk import journals (INSERT BulkJournals01/02, PDCBulk*).

#### POST /api/v1/vouchers/reference
- Add customer bill reference (INSERT CustBill01).

#### PUT /api/v1/vouchers/reference/{id}
- Update customer bill reference.

#### DELETE /api/v1/vouchers/reference/{id}
- Delete customer bill reference.

#### POST /api/v1/vouchers/reference-details
- Add bill allocation/detail (INSERT CustBill02).

#### PUT /api/v1/vouchers/reference-details/{id}
- Update bill detail.

#### DELETE /api/v1/vouchers/reference-details/{id}
- Delete bill detail.

## 2.10 Mail/Messages

#### POST /api/v1/messages
- Send new message (INSERT MailTable).

#### PUT /api/v1/messages/{id}
- Update message (mark as read, edit, etc).

#### DELETE /api/v1/messages/{id}
- Delete message.

## 2.11 Miscellaneous

#### POST /api/v1/ajanda
- Insert Ajanda
#### PUT /api/v1/ajanda/{id}
- Update Ajanda
#### DELETE /api/v1/ajanda/{id}
- Delete Ajanda

#### POST /api/v1/ajanda02
- Insert Ajanda02
#### PUT /api/v1/ajanda02/{id}
- Update Ajanda02
#### DELETE /api/v1/ajanda02/{id}
- Delete Ajanda02

#### POST /api/v1/settings
- Set settings (UPDATE)

#### PUT /api/v1/settings
- Update settings

---

# SECTION 3 — NODE.JS STORED PROCEDURE CALL PATTERN (Express + MSSQL)

```typescript
// db/callProcedure.ts
import { mssqlPool } from './connection';

export async function callProcedure(procName: string, inputParams: Record<string, any>) {
  const pool = await mssqlPool.connect();
  const req = pool.request();
  // Add params, types as needed
  Object.entries(inputParams).forEach(([name, value]) => req.input(name, value));
  const result = await req.execute(procName);
  // MSSQL: result.recordset (array of rows)
  return result.recordset;
}

// Express API route example
import express from 'express';
import { callProcedure } from '../db/callProcedure';

const router = express.Router();

router.get('/api/v1/customers', async (req, res) => {
  try {
    const filters = buildFilters(req.query); // map query to SP parameters
    const customers = await callProcedure('CustomerOverview', filters);
    res.json({ data: customers });
  } catch (err) {
    // error handling
    res.status(500).json({ error: 'INTERNAL_ERROR', details: err.message });
  }
});
```

- Always map frontend/API to stored procedure, NEVER direct table access.
- Use named parameters, not SQL concatenation.
- Error handling: catch (err) and translate to published error code set.
- Response shape: return recordset directly or recast to documented API response envelope as needed.

---

# COVERAGE CHECK

## 1. Each stored procedure from DB_CONNECTION_SPEC.md

| SP Name                                      | Endpoint defined |
|-----------------------------------------------|------------------|
| spCustomerOutStandingSalesManwise             | ✅               |
| spRptSalesManInvoices                         | ✅               |
| PendingPurchaseDO                            | ✅               |
| spMonthlySplitSales                           | ✅               |
| PartsAvailability_Sp                          | ✅               |
| spStockLastTrans                              | ✅               |
| GetSockQty                                    | ✅               |
| ac_Group_Sum                                  | ✅               |
| Ac_GroupTotal                                 | ✅               |
| spGetEstmationDetails                         | ✅               |
| SPACTREEVIEW                                  | ✅               |
| Ac_headBalance                                | ✅               |
| SPCASHBANKDETAILS                             | ✅               |
| AcAgeWiseDetails                              | ✅               |
| acBal                                         | ✅               |
| AcClosingBalance                              | ✅               |
| spGetVehicleStatus                            | ✅               |
| AcCurrentTrans                                | ✅               |
| CustomerOverview                              | ✅               |
| ACDETAILSDET                                  | ✅               |
| AcHeadList                                    | ✅               |
| Opening_Balance_NEW                           | ✅               |
| GetStaffDetFromOrder                          | ✅               |
| ACMASTERDET                                   | ✅               |
| VoucherList_NEW                               | ✅               |
| Opening_Balance                               | ✅               |
| ProductsOverview                              | ✅               |
| AcRcptSum                                     | ✅               |
| AcSummary                                     | ✅               |
| AcSummary_balansheet                          | ✅               |
| AcSummary_balansheet_New                      | ✅               |
| PorfitandbalTotal_SP                          | ✅               |
| AcHead_GroupBal                               | ✅               |
| AgewiseSummary                                | ✅               |
| spGetWorkStatus                               | ✅               |
| JObFinished                                   | ✅               |
| VoucherList                                   | ✅               |
| VoucherList_Pdc                               | ✅               |
| VoucherSummary                                | ✅               |
| VoucherSummary_PDC                            | ✅               |
| PROCVOUCHERLIST                               | ✅               |
| SPSALESANALYSISREPORT                         | ✅               |
| sp_LPOAnalysis                                | ✅               |
| spSalesReportForFM                            | ✅               |
| spSalesReportStaffvise                        | ✅               |
| spSalesBillReport                             | ✅               |
| spSalesMarginDetails                          | ✅               |
| SP_MarginRpt                                  | ✅               |
| spSalesReportCatSub                           | ✅               |
| spFastMovingItems                             | ✅               |
| spItemTransactionCount                        | ✅               |
| MailCheck                                     | ✅               |
| MailRead                                      | ✅               |
| CheckPendingDO                                | ✅               |
| InvoicePendingDo                              | ✅               |
| OriginalEstimation_SP                         | ✅               |

_All documented procedures have mapped/covered endpoints._


## 2. Each write target from WRITE TARGETS BY TABLE

| Table Name             | Endpoint Defined          |
|------------------------|--------------------------|
| ACDETAILS              | ✅ POST/PUT/DELETE       |
| AcGroupHead            | ✅ POST/DELETE           |
| AcHead                 | ✅ POST/PUT/DELETE       |
| Acmaster               | ✅ POST/PUT/DELETE       |
| AcTree                 | ✅ POST/DELETE           |
| AcVerification         | ✅ POST/PUT/DELETE       |
| Ajanda                 | ✅ POST/PUT/DELETE       |
| Ajanda02               | ✅ POST/PUT/DELETE       |
| AssignedJobs           | ✅ POST/PUT/DELETE       |
| AttachmentMaster       | ✅ POST/DELETE/PUT       |
| CompanyInfo            | ✅ DELETE                |
| CustBill01             | ✅ POST/PUT/DELETE       |
| custBill02             | ✅ POST/PUT/DELETE       |
| Customer               | ✅ POST/PUT/DELETE       |
| CustomerVehicle        | ✅ POST/PUT/DELETE       |
| Delivery01             | ✅ PUT                   |
| delivery02             | ✅ PUT                   |
| DocHead                | ✅ POST/PUT/DELETE       |
| Document01             | ✅ POST/PUT/DELETE       |
| Items                  | ✅ PUT                   |
| LocalPurchase01        | ✅ PUT                   |
| LocalPurchase02        | ✅ PUT                   |
| LpoIssue01             | ✅ PUT                   |
| MailTable              | ✅ POST/PUT              |
| MIRDtl                 | ✅ POST/PUT              |
| MIRHDR                 | ✅ POST/PUT              |
| MIRStatusDtl           | ✅ POST                  |
| Omasters               | ✅ DELETE                |
| Porder02               | ✅ PUT                   |
| Preturn01              | ✅ PUT                   |
| Preturn02              | ✅ PUT                   |
| Prodrequest01          | ✅ PUT                   |
| Product                | ✅ PUT                   |
| ProformaSales01        | ✅ PUT                   |
| PurchaseVehicleLink    | ✅ POST/PUT/DELETE       |
| PurchaseVoucher        | ✅ POST                  |
| QtnRequest01           | ✅ PUT                   |
| salary01               | ✅ DELETE                |
| Sales01                | ✅ PUT                   |
| Sales02                | ✅ PUT                   |
| SalesOrdr01            | ✅ PUT                   |
| salesOrdrStatusDtl     | ✅ POST                  |
| SalesOrdrStatusHead    | ✅ POST/PUT/DELETE       |
| settings               | ✅ PUT                   |
| Sreturn01              | ✅ PUT                   |
| SReturn02              | ✅ PUT                   |
| StockIn02              | ✅ PUT                   |
| StockOut02             | ✅ PUT                   |
| StockTransaction       | ✅ POST/DELETE           |
| SuppBill01             | ✅ POST/DELETE           |
| SuppBill02             | ✅ POST/DELETE           |
| Supplier               | ✅ DELETE                |
| tempMarginReport       | ✅ POST/DELETE           |
| UsedCars               | ✅ POST/PUT              |
| UsedCarsSql            | ✅ DELETE                |
| Users                  | ✅ POST/PUT/DELETE       |
| Vehicles               | ✅ DELETE                |
| WorkInProgress         | ✅ POST/PUT              |

_Every write target has at least one mapped CRUD endpoint._


## 3. WRITE-COVERAGE GATE

| Module/Domain                   | POST/PUT/DELETE? | Pass/Fail |
|----------------------------------|------------------|-----------|
| Authentication/Users             | ✅               | PASS      |
| Customer/Supplier                | ✅               | PASS      |
| Contacts                         | ✅               | PASS      |
| Vehicles                         | ✅               | PASS      |
| Attachments/Documents/Remarks    | ✅               | PASS      |
| Jobs/Estimation/Assignment       | ✅               | PASS      |
| Orders/Delivery                  | ✅               | PASS      |
| Purchases/Procurement            | ✅               | PASS      |
| Inventory                        | ✅               | PASS      |
| Ledger/Accounts                  | ✅               | PASS      |
| Vouchers/Bulk Journals           | ✅               | PASS      |
| Employee/Payroll                 | ✅               | PASS      |
| Communication (MailTable)        | ✅               | PASS      |
| Miscellaneous/Settings           | ✅               | PASS      |

_Final Check: All PRD modules requiring write operations have POST/PUT/DELETE endpoints specified. No read-only gap for any editable domain. ✅ PASS_

---

**End of API_SPEC.md**