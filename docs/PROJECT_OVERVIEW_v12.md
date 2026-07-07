<!--
  Generated from : PRD_v1.0.0.md
  PRD hash       : 30974e2c05a9
  Spec version   : v12
  Generated at   : 2026-07-02 09:27:18 UTC
-->

# PROJECT_OVERVIEW.md

---

## SECTION 1 — PROJECT OVERVIEW

### 1.1. Application Purpose

The **Integrated Business Operations Suite** is a unified platform supporting end-to-end management of business operations across finance, sales, purchasing, inventory, order processing, CRM, personnel, audit, and reporting for service-, sales-, and inventory-driven organizations. It enables operational efficiency, detailed audit trails, enterprise analytics, and compliance, all while preserving the legacy database and procedures.

---

### 1.2. Key Business Domains

#### 1.2.1. User Authentication & Security

**Core Entities:**  
- USERS, UserLog, UserRights, UserTable, LoginStatus, loginDetails

**Relationships:**  
- Users have roles and rights via UserRights; events/audit trail recorded in UserLog/LoginStatus/loginDetails.

**Critical Business Rules:**  
- BR-01: Unique user identifier & password required
- BR-02: Account lockout after failed logins (configurable)
- BR-03: Enforce password complexity & minimum length
- BR-04: Password changes/resets require verification
- BR-05: Sessions expire after inactivity period
- BR-06: Only proper roles can view authentication logs/administer users
- BR-07: User log report restricted to supervisors/admins
- BR-08: Sensitive settings require re-authentication
- BR-09: Notify user upon password change/reset
- BR-10: All user/auth operations exposed via API
- See additional rules for audit logging (BR-14), RBAC (BR-11), and password rules (BR-15).

**Documented Security/Compliance Constraints:**  
- All authentication events fully logged and viewable only by privileged roles
- Password hashing algorithms: bcrypt/Argon2 per PRD
- Session expiration configurable

---

#### 1.2.2. User & Role Management

**Core Entities:**  
- USERS, UserRights, UserTable, loginDetails, LoginStatus, EmployeeDet

**Relationships:**  
- Users mapped to RBAC via UserRights, EmployeeDet serves personnel reference

**Critical Business Rules:**  
- BR-11: Only administrators can assign/modify roles
- BR-12: Users must have unique emails
- BR-13: Deactivated accounts cannot sign in or access system
- BR-14: All user account actions logged with timestamp/user
- BR-15: Password complexity enforced
- BR-16: Highest access among multiple roles applies
- BR-17: Only report-permitted users can access reporting tools
- BR-18: Bulk import must check for duplicates
- BR-19: Temporary users auto-expire
- BR-20: Role/permission changes take effect immediately

**Further Constraints:**  
- Bulk import/export of users, audit trail across all user/role operations (FR-35)
- Deactivation, activation, bulk user actions, legacy user management, API synchronization endpoints (FR-42, FR-43)

---

#### 1.2.3. Customer, Supplier, and Contact Management

**Core Entities:**  
- Customer, Supplier, CustomerVehicle, Vehicles, Contact entries, AdditionalRemarks, CustomerSql, SupplierSql

**Relationships:**  
- Customers/suppliers can have contacts and vehicles linked (CustomerVehicle, Vehicles)
- Audit and remarks recorded (AdditionalRemarks)
  
**Critical Business Rules:**  
- BR-21: Customers must have a unique name/phone combo
- BR-22: Cannot deactivate supplier if involved in active transactions
- BR-23: Contacts must include a valid phone or email
- BR-24: Merging duplicates requires supervisor/admin approval
- BR-25: Vehicle linked to only one active customer at a time
- BR-26 & BR-27: Duplicate check & validation on add/import
- BR-28: All edits to masters logged with user/time
- BR-29: Only authorized users may view/export sensitive contacts
- BR-30: Validation settings must be admin-configurable

**Documented Constraints:**  
- Bulk import/export, duplicate/merge, vehicle-customer linkage, audit and change logs

---

#### 1.2.4. Document & Attachment Management

**Core Entities:**  
- AttachmentMaster, AdditionalRemarks, DocHead, Document01, MailTable

**Relationships:**  
- Attachments/remarks link to orders, jobs, transactions

**Critical Business Rules:**  
- BR-31: CRUD operations on attachments/docs restricted by RBAC
- BR-32: Attachments must link to a valid transaction/order
- BR-33: All attachment metadata (uploader, date, version) must be stored
- BR-34: Remarks must be user/time-stamped
- BR-35: Deleted attachments/remarks NOT restorable by standard users
- BR-36: Bulk delete/download requires explicit confirmation
- BR-37: Full audit trail for admin review
- BR-38: Documents must use standardized headers/categories

**Documented Constraints:**  
- Attachment versioning, tagging, access control, audit logs, bulk operations, metadata per attachment

---

#### 1.2.5. Job, Work Order, and Estimation Management

**Core Entities:**  
- Estimation01, Estimation02, jobInProgress, WorkInProgress, AssignedJobs, salesOrdrStatusDtl, salesOrdrStatusHead, AdditionalRemarks

**Relationships:**  
- Jobs/Orders/Estimations tied to customers, status, staff, progress audit, advisor assignments

**Critical Business Rules:**  
- BR-39: Estimation requires customer, description, at least one cost line to submit
- BR-40: Only supervisors/admins may approve/reject estimations
- BR-41: Status updates only by authorized/assigned
- BR-42: Cannot assign inactive status to jobs
- BR-43: Active job cap per user (supervisor override if exceeded) [Needs confirmation]
- BR-44: Report access restricted to relevant departments
- BR-45: All job status/assignment/approval changes logged with old/new values, user, timestamp
- BR-46: Job can only complete if all job card info present
- BR-47: Assignment notifications within 5 minutes
- BR-48: Digital signature required for job completion
- BR-49: Mobile users must use multi-factor auth (Best Practice)
- BR-50: Only admins may modify job status master list

**Documented Constraints:**  
- Audit trail on every action, RBAC, digital signature workflow for closeout

---

#### 1.2.6. Order & Sales Management

**Core Entities:**  
- SalesOrdr01, Sales01, Delivery01, Delivery02, Delivery logs, ProformaSales01/02

**Relationships:**  
- Sales orders, invoices, delivery notes linked to customers, status, staff

**Critical Business Rules:**  
- BR-51: Cannot delete an order if a delivery note issued
- BR-52: All required fields must be filled to submit order
- BR-53: Only allowed roles may change customer, update status
- BR-54: Order confirmation email on creation (immediate)
- BR-55: Delivery notes must be digital & retained for audit
- BR-56: Log all status/customer/delivery changes with user/date/reason
- BR-57: Delivered orders uneditable for product/quantity
- BR-58: Only admins can access global summary reports
- BR-59: Discount/tax calculations per company formula before finalization
- BR-60: Delivery note must reference a valid sales order & customer

**Documented Constraints:**  
- Digital document chain, audit trail, RBAC, notification

---

#### 1.2.7. Purchase & Procurement Management

**Core Entities:**  
- LocalPurchase01/02, PurchaseDO01/02, LpoIssue01/02, Porder01/02, Preturn01/02, QtnRequest01/02, PurchaseVehicleLink, settings

**Relationships:**  
- Purchases linked to suppliers, delivery orders, staff, approval state, supporting docs

**Critical Business Rules:**  
- BR-61: Supervisor approval required for POs above threshold
- BR-62: Delivery order must link to a PO
- BR-63: Received goods must match PO item/quantity
- BR-64: Only RBAC-permitted users may view/edit/approve POs
- BR-65: Supporting documents mandatory above value threshold
- BR-66: Unique purchase order numbers
- BR-67: Cannot delete PO/DO once supervisor-approved
- BR-68: Change audit log on every PO/DO mutation
- BR-69: Overdue DOs trigger alerts
- BR-70: Only admins may configure approval workflow/access rights

**Documented Constraints:**  
- Role-based PO approval, document upload rules, linkage requirements

---

#### 1.2.8. Stock & Inventory Management

**Core Entities:**  
- Items, StockIn01/02, StockOut01/02, StockOpn01/02, StockTransaction, Inventory reporting views, ItemTransaction_Checking

**Relationships:**  
- Stock movements reference items, warehouses, staff, transactions

**Critical Business Rules:**  
- BR-71: Receipts must include item, qty, date, warehouse
- BR-72: Cannot issue stock beyond available qty/location
- BR-73: Stock adjustments require supervisor approval, original/adjusted values audit
- BR-74: Valuation by company-selected method (FIFO, weighted avg)
- BR-75: Notification when inventory falls to/below reorder
- BR-76: All movements/adjustments/deletes auditable with user/date/action
- BR-77: Only authorized roles may edit/approve/export sensitive inventory
- BR-78: Validate mobile count input against catalog/location
- BR-79: Prevent duplicate stock adjustments for same item/location/period
- BR-80: Only authorized roles may access/export financial/sensitive inventory reports

**Documented Constraints:**  
- Stock audit, barcode support, audit log routes, alert rules, data integrity

---

#### 1.2.9. Banking & Reconciliation

**Core Entities:**  
- ACMASTER, ACDETAILS, Branch, Section, Table1, aaaaaaaaaaaaaa

**Relationships:**  
- Transactions audit-logged, attached supporting docs, reconciled to external statements

**Critical Business Rules:**  
- BR-81: Only bank/finance roles can edit/reconcile transactions
- BR-82: Unreconciled transactions must be resolved/documented in 3 business days
- BR-83: All reconciliation actions logged for compliance
- BR-84: Only authorized roles can view/export CBPBook/PendingBillsLetter
- BR-85: Transactions missing serial cannot be posted
- BR-86: Imported bank statements must pass format/completeness validation
- BR-87: Notify supervisors of unresolved reconcile exceptions
- BR-88: Help resources on all main bank/reconcile screens
- BR-89: Report design/advanced reconcile features restricted to assigned roles

**Documented Constraints:**  
- All import/export/audit actions logged. Strict RBAC on reporting/exception handling.

---

#### 1.2.10. Ledger & Account Management

**Core Entities:**  
- ACHEAD, ACMASTER, ACDETAILS, AcTree, AcGroupLink

**Relationships:**  
- Ledger entries attached to accounts, groups, heads (tree structure), status/history audit

**Critical Business Rules:**  
- BR-90: Account names unique per group
- BR-91: Accounts used in transactions can only be deactivated, not deleted
- BR-92: Parent heads only assigned to valid/active accounts
- BR-93: Required for create: name, type, group, status
- BR-94: Only permitted users can CRUD accounts/heads
- BR-95: All changes to account details logged
- BR-96: Every ledger entry must attach to valid/active account
- BR-97: Import validation for duplicates/required fields
- BR-98: Failed imports/exports notify supervisors
- BR-99: Orphaned heads flagged for review/correction

**Documented Constraints:**  
- Full audit trail on all head/account actions

---

#### 1.2.11. Receipts & Payments Processing

**Core Entities:**  
- ACMASTER, ACDETAILS, CustBill01/02, SuppBill01/02, PDCBulk01/02, PDCBulkReceipt01/02

**Relationships:**  
- Receipts/payments posted to accounts/parties, authorizations, audit

**Critical Business Rules:**  
- BR-100: Finalization requires supervisor/admin authorization
- BR-101: Accurate allocation to correct account
- BR-102: Posted/settled transactions cannot be edited/deleted
- BR-103: All pending items require approval
- BR-104: Petty cash must never go negative
- BR-105: Restricted backup/specialized report access
- BR-106: Payment status is determined by external confirmation
- BR-107: Audit log must capture user/time/action
- BR-108: CRUD ops enforce permissions, always log outcome
- BR-109: Advanced design/access for reporting requires explicit assignment

**Documented Constraints:**  
- Strict authorization, audit completeness, alternate report access

---

#### 1.2.12. Voucher & Transaction Entry

**Core Entities:**  
- ACMASTER, ACDETAILS, BulkJournals01/02, VoucherLog, CustBill01/02

**Relationships:**  
- Vouchers must remain balanced, unique per financial year, full audit

**Critical Business Rules:**  
- BR-110: Journals must balance debits/credits before posting
- BR-111: Unique voucher numbers per financial year
- BR-112: Only supervisors+ can approve/reject journal batches
- BR-113: No save unless required fields filled
- BR-114: Every change to voucher/transaction must be audit-logged
- BR-115: Attachments must be in approved format/size
- BR-116: Only authorized users/systems can access posting APIs
- BR-117: Report access by role
- BR-118: Batch ops only for privileged users
- BR-119: Drafts visible only to creator until submitted

**Documented Constraints:**  
- Reporting per voucher, strict validation and audit of all financial actions

---

#### 1.2.13. Financial Reporting & Statements

**Core Entities:**  
- All reporting views, audit logs, logs of report generation and export

**Critical Business Rules:**
- BR-120: Only users with defined roles access statutory/financial reports
- BR-121: Required parameters before report generation
- BR-122: Account/agewise reports must use up-to-date data
- BR-123: Only supervisors/admins may schedule reports
- BR-124: Reports must be exportable at least as PDF/Excel
- BR-125: Account statements must match stationery/approved formats
- BR-126: All report events (generate/export/email) logged with user/time
- BR-127: Only admins/designers can create/modify report templates
- BR-128: Backup/test/alt layouts restricted to admin access
- BR-129: Report failure alerts go to responsible party

**Documented Constraints:**
- Audit logging, RBAC per report, multi-format (PDF/Excel/CSV)
- All reporting/end-user data exported is traceable with event logs

---

#### 1.2.14. Audit Logging & Change Tracking

**Core Entities:**  
- AccountsLog, ac01log, ac02Log, AcHeadDeleteLog, UserLog, loginDetails

**Relationships:**  
- All create/update/delete events across system logged with source, time, after/before state as appropriate

**Critical Business Rules:**  
- BR-130: Every change to account/customer/supplier is recorded with user/time/details
- BR-131: Only privileged users may view/export audits
- BR-132: Remove/merge of duplicates must be logged for possible rollback/proof
- BR-133: Audit record retention must meet company policy/law
- BR-134: Alert for suspicious/high-risk activities
- BR-135: Audit/change logs access is restricted, auditable
- BR-136: Logs immutable except by retention/archival policy
- BR-137: All audit/change tracking procs must be available as service operations at API layer

---

#### 1.2.15. Miscellaneous/Other Domains

- aaaaaaaaaaaaaa, Table1: Custom/config/business logic, usage to be validated for context per PRD and business review
- Trade, Department, Section: Support employee, organization, mapping to other master/detail data

---

### 1.3. Document & Invoice & Transaction Types

- **Invoices**: Sales01/Sales02, Estimation01/02, ProformaSales01/02, InsrInvoice01/02
- **Delivery Notes**: Delivery01/02, Delivery* views; always linked to valid sales orders (BR-60)
- **Purchase Orders**: LocalPurchase01/02, Porder01/02, LpoIssue01/02, PurchaseDO01/02
- **Vouchers / Journal Entries**: ACMASTER, ACDETAILS, BulkJournals01/02; audit-logged, strict balancing
- **Receipts/Payments**: CustBill*, SuppBill*, PDCBulk*, etc.
- **Attachments**: AttachmentMaster; always linked to valid business objects
- **Additional Remarks**: AdditionalRemarks; tied to transactions/orders

---

### 1.4. User Roles & Permissions

- **Standard User**: Full access to their domain (data entry, process), restricted reporting.
- **Supervisor**: All Standard User rights, plus: approve transactions, merge duplicates, full reporting, audit report view (per PRD matrix).
- **Administrator**: Full system access — all modules, user/role management, account management, full reporting, audit, configuration, all workflow overrides.
- All role permissions enforced via RBAC (see Access Control Matrix in PRD). Additional custom roles supported via UserRights object.

---

### 1.5. System Constraints & Parameters

**Security Parameters (must match PRD):**
- Passwords: min length, complexity (enforced, per BR-03, BR-15)
- Lockout: after N failed attempts (BR-02), lockout interval configurable
- Session inactivity expiration: configurable (BR-05; see NFR-05)
- All tokens (JWT): expiry time per environment config
- All sensitive actions: require user re-auth (BR-08)
- Passwords stored with bcrypt/Argon2 + unique salt (PRD and NFR-03)

**Data Integrity & Compliance:**
- Strict uniqueness rules on all master/entity records
- All deletions logged/audited
- Records meeting compliance retention cannot be deleted (BR-133)
- All audit logs are immutable except by archival/retention processes (BR-136)
- No schema changes to legacy DB (DB-preserve mode)

**Performance Targets (must match PRD):**
- Dashboard load / screen load: <2 seconds (NFR-01)
- Any save/update: <1 second (NFR-02)
- Reports: exported in <10 seconds (NFR-01)

**Export/Reporting:**
- All named reports must exist/exportable as in legacy (PRD constraint)
- Export formats: PDF, Excel, CSV minimum (BR-124)
- Every report, export, print, and key event logged (BR-126)

**Interoperability:**
- API endpoints for all service operations matching legacy procedures (BR-10, BR-137)
- No feature regression (legacy parity; PRD constraint)
- All object/system-level RBAC enforced (no escalation allowed)

---

### 1.6. Compliance, Data Retention, and Change Management

- Must meet all audit, regulatory requirements for jurisdiction (per NFR & PRD)
- Audit logs and change tracking for every sensitive/regulated action
- Unique record IDs for all transactions (NFR-12)
- All access to audit logs is restricted (BR-135)

---

### 1.7. Gaps & Inferred Requirements

**Gaps & Their Status:**
- All Gaps (Section G in PRD) MUST be reviewed: see PRD for those marked [IN SCOPE] (to be built) or [DEFERRED] (document for future phases).
- Any "NEEDS CONFIRMATION" flagged for business SME review is not implemented until resolved.
- **Example:**
    - [IN SCOPE] Multi-factor authentication for admins (BR-49, G-72)
    - [DEFERRED] CRM/ERP external integration (PRD: Future Scope)
    - [NEEDS CONFIRMATION] Cap on open jobs per user (BR-43)

**Process:**
- All [GAP] and [INFERRED] requirements in the PRD are explicitly logged for traceability.

---

## SECTION 2 — ARCHITECTURE

### 2.1. High-Level Architecture Diagram

```
+----------------------------------+
|         React 19 Frontend        |
|     (Vite, TS, Zustand, etc)     |
|                                  |
|  [API calls via Axios > BE API]  |
+----------------------------------+
             |   REST API (HTTPS)
+----------------------------------+
|         Node.js 20+ Backend      |
|   (Express, TS, callProcedure)   |
|                                  |
|    Controllers (REST endpoints)  |
|        ↕ Services (business)     |
|        ↕ Repository Layer        |
|      ↕ DB: callProcedure helper  |
+----------------------------------+
             |
+----------------------------------+
|      SQL Server (LEGACY DB)      |
| [STRICTLY: Existing Procs/Views] |
+----------------------------------+
```

---

### 2.2. Prescribed Folder and Project Structure

#### **Root**

```
- /frontend           # React 19 + Vite + TypeScript app
- /backend            # Node.js 20+ + Express + TypeScript API
- /db                 # callProcedure helper, db config (.env)
- /docs               # Arch and requirements markdowns
- /scripts            # Utilities, deployment, admin scripts
- .env.example        # Environment variable template
- .dockerignore
- docker-compose.yml
- nginx.conf          # NGINX config (static and API proxy)
- README.md
```

#### **/frontend**
- src/
    - api/                   # Typed API client per endpoint
    - components/            # Reusable UI components
    - pages/                 # Route-based page components
    - layouts/               # Shell layouts (main, auth)
    - stores/                # Zustand stores
    - hooks/                 # React Query (TanStack), form hooks
    - styles/                # Design system tokens, global styles
    - utils/                 # Utilities, helpers
    - __tests__/
- index.html
- vite.config.ts

#### **/backend**
- src/
    - controllers/           # Route handlers (REST endpoints)
    - services/              # Business/service logic
    - repositories/          # Repeatable DB access, calls callProcedure()
    - middlewares/           # Error, auth, logging, validation
    - db/                    # callProcedure.ts, db connection pool
    - auth/                  # JWT, RBAC, password logic
    - models/                # TypeScript types/interfaces
    - utils/                 # Utilities, helpers
    - __tests__/
- app.ts
- server.ts
- tsconfig.json

#### **/db**
- connection.ts             # Exports DB connection, connects via mssql per config
- callProcedure.ts          # Secure wrapper for executing stored procedures/views
- seed/                     # (rare use) only for test records; NEVER schema/structure

---

### 2.3. Technology Choices and Versions

- **Frontend**
    - React 19.x
    - Vite
    - TypeScript 5+
    - Zustand for state
    - TanStack Query for async/server state
    - React Hook Form + Zod for all forms
    - CSS Modules or vanilla-extract (per frontend-standards.md)
    - Lucide or Feather for icons (per design system)
    - All code must use strict CSS token system from design system

- **Backend**
    - Node.js 20+
    - Express 5.x
    - TypeScript 5+
    - mssql driver (STRICT — use callProcedure pattern, never raw SQL for business logic)
    - JWT (auth), bcrypt/Argon2 (passwords)
    - Enforced code organization: controller → service → repository → callProcedure
    - Global error handler (standard error classes, see error-handling.md)
    - Logging: Winston or equivalent, per backend-standards.md

- **Database**
    - SQL Server 2008+ (existing), no schema changes allowed
    - All business/data logic via described stored procedures, views ONLY for reads
    - No migrations/DDL; db structural changes forbidden

- **CI/CD + Deployment**
    - Docker for all app containers (no DB in Compose)
    - NGINX for frontend assets & API reverse proxy
    - GitHub Actions or similar for pipeline (see deployment-setup.md)

---

### 2.4. Service Boundaries

- **Authentication Service**: Handles all login, JWT, password, RBAC, session flows.
- **User Management Service**: CRUD & audit for USERS, roles, rights, logs.
- **Customer/Supplier Service**: CRUD, merge/duplicate, contacts/vehicles, audit, search.
- **Document/Attachment Service**: Upload/download/preview/delete, audit, versioning.
- **Job/Work Order Service**: Estimations, status, assignments, calendar/Gantt, audit, mobile.
- **Order/Sales Service**: Order/invoice/delivery creation, fulfillment, status.
- **Purchase/Procurement Service**: PO/DO/return, approval, status, attachments.
- **Stock & Inventory Service**: Item management, in/out, count, audit, barcodes, alerts.
- **Banking & Reconciliation Service**: Payments, cash/bank books, reconciliation, statements.
- **Ledger/Account Service**: Chart of accounts, heads, structure, summaries, import/export.
- **Voucher/Transaction Service**: Journal posting, batch, validation, attachments.
- **Reporting Service**: All reporting, export, audit of report actions.
- **Audit & Change Log Service**: Change tracking for all sensitive domains, exposure for admin/supervisor.

---

### 2.5. Environment Configuration (.env Variables)

**Minimum Variables (see also .env.example):**
```
# DB Access
DB_TYPE=sqlserver
DB_HOST=192.168.0.235\sql2008
DB_NAME=autodealer
DB_USER=sa
DB_PASSWORD=p@ssw0rd

# JWT / Auth
JWT_SECRET=...
JWT_EXPIRY=2h
REFRESH_TOKEN_SECRET=...
REFRESH_TOKEN_EXPIRY=30d

# General
PORT=3001
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=...

# Email/SMS (for password reset/MFA)
SMTP_HOST=...
SMTP_USER=...
SMTP_PASS=...
SMS_GATEWAY_URL=...

# Other
LOG_LEVEL=info
API_PREFIX=/api/v1
```

**Strict Prohibition:** Do not expose DB password or credentials in any client-side or deployable static asset.

---

### 2.6. Deployment Approach

- All deployments run via Docker Compose (backend, frontend, nginx proxy — NO DB).
- Static assets (frontend) served via NGINX, with API requests proxied to Express.
- **CI/CD**: GitHub Actions triggers on push; runs lint, type check, backend + frontend tests, builds, pushes containers.
- Production environments use .env standard, secrets managed per target stack.
- Health checks defined on backend `/api/v1/health` and nginx.
- No schema migration: DB remains untouched structurally, legacy stored procs/views must always exist and be backward compatible.

---

### 2.7. Key Implementation Constraints (Do Not Violate)

- **No new tables or schema changes in DB**
- **All read API endpoints MUST use the existing read models/views wherever resolved (…Sql or …Summary views)**
- **All data mutations go via existing stored procedures, called from callProcedure() only**
- **All requirements in PRD—business, compliance, and performance—are strict**
- **Never allow direct client access to backend DB**
- **All exported data (reports, CSVs) must not include PHI or regulated/sensitive data unless RBAC grants access**
- **No feature regression: each named legacy screen has an endpoint/UI and workflow mapped**

---

**This architecture and business overview is prescriptive and non-negotiable based on PRD and standards. All code MUST reflect these boundaries, structures, and constraints.**