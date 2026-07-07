<!--
  Generated from : PRD_v1.0.0.md
  PRD hash       : 30974e2c05a9
  Spec version   : v12
  Generated at   : 2026-07-02 09:27:18 UTC
-->

# STANDARDS.md

---

## SECTION 1 — TECH STACK (DB-Preserve)

### Backend
- Node.js (v18 LTS or later)
- Express.js (v4+)
- TypeScript (enforce in all backend code)

### Frontend
- React 19 (with Vite + TypeScript)
- Styling: CSS Modules with variables from the design system

### Database
- Existing SQL Server database (schema is fixed, cannot be changed)
- No ORM (Prisma, Sequelize, TypeORM, etc. FORBIDDEN)
- Data access is exclusively via:
  - Stored procedures (writes: callProcedure)
  - Views (reads: SELECT from views, never hand-join bases if a view exists)
  - Direct table queries ONLY if absolutely necessary and no SP/view exists

### Auth
- JWT-based authentication
  - Access/refresh tokens, stateless on backend
- Passport.js (passport-local for credentials, passport-jwt for protected endpoints)
- RBAC: Enforced via user roles/permissions reflected from legacy (`USERS`, `UserRights` tables)

---

## SECTION 1B — CODING STANDARDS

### Naming Conventions

| Context              | Convention          | Example                      |
|----------------------|--------------------|------------------------------|
| Stored procedures    | As in DB_CONNECTION_SPEC.md | `spCustomerOutStandingSalesManwise`  |
| API endpoints        | kebab-case, plural, versioned | `/api/v1/customers`         |
| Controller files     | PascalCase, suffix `Controller` | `UserController.ts`   |
| Service files        | PascalCase, suffix `Service` | `UserService.ts`      |
| Repository files     | PascalCase, suffix `Repository` | `UserRepository.ts`  |
| Data models/types    | PascalCase single   | `User`, `UserListResponse`   |
| Frontend components  | PascalCase         | `UserForm.tsx`               |
| Paths / folders      | kebab-case         | `/services/`, `/models/`     |
| Env variables        | UPPER_SNAKE_CASE   | `DB_HOST`, `JWT_SECRET`      |
| Error codes          | UPPER_SNAKE_CASE   | `AUTH_FAILURE`, `DB_CONN_ERROR` |

### File Organization

- `/src/`
  - `/api/` — controllers and Express routers (REST endpoints only)
  - `/services/` — business logic, always calls repository
  - `/repositories/` — DB access layer, all `callProcedure()`/SELECT logic here
  - `/models/` — DTOs, types, response models
  - `/middleware/` — Express/JWT/passport, RBAC, error handling
  - `/utils/` — helpers (db connection, logging, callProcedure, etc)
  - `/frontend/` — React app (Vite), follows its own `/api/`, `/pages/`, `/components/`, `/hooks/` etc structure

### Error Handling Patterns

- Service and controller layers: throw Error instances (subclassed if possible: ValidationError, AuthError, ForbiddenError, NotFoundError)
- Error handler middleware: maps errors to HTTP status and frontend error envelope
- DB errors:
  - Unwrap and sanitize all SQL server errors — never leak stack/SQL to client
  - Log error details to server logs (with context)
- All user-facing errors must map to clear, friendly messages (see error-handling.md)

### Logging

- Use a structured logger (e.g., Winston or Pino)
- Minimum: error-level logs on all uncaught exceptions, warn-level on validation/permission failures, info-level on all logins and auth events (include userId, IP, action summary)
- Do not log secrets, passwords, raw tokens

### Security Requirements

- All endpoints must check JWT authentication unless explicitly public
- RBAC enforced at service layer for sensitive operations
- Passwords must be hashed with bcrypt (min cost 10), with random salt per user. No bare passwords in DB, memory, logs
- CSRF not needed for pure API, but CORS must restrict allowed origins in production
- Sensitive actions audited (write to UserLog or equivalent)
- All parameterized inputs — NEVER use raw string concatenation in query/command text

---

## SECTION 1C — DB ACCESS PATTERN (CRITICAL)

- **Never modify the DB schema in any way** — no migrations, no DDL statements, no CREATE/ALTER/DROP.
- **Writes** (INSERT/UPDATE/DELETE):
  - STRATEGY A — If stored procedures exist for the entity (as per DB_CONNECTION_SPEC.md), call them via a `callProcedure(<procedureName>, params)` helper. Never perform direct table writes if an SP exists.
- **Reads**:
  - STRATEGY B — Always SELECT from the most-resolved legacy view (`<Table>Sql`, e.g. `CustomerSql`, `SalesOrdr01Sql`, `ItemsSql`). If more than one view matches, use the one that resolves the most human-readable fields and IDs.
  - DO NOT hand-craft manual SQL JOINs on base tables (e.g. joining customer to address to advisor)—this is error-prone and regression-prone.
  - Where no view exists, may SELECT from a base table with strict parameterization.
- If only tables exist (no SPs/views, e.g., in Access backends):
  - STRATEGY C — Use driver parameterized queries (driver as per DB_CONNECTION_SPEC.md: node-adodb for Access, mssql for SQL Server, etc).
- FORBIDDEN: raw unparameterized string queries, ORM usage, schema changes, table creation/deletion, migration frameworks.

---

## SECTION 2 — BUILD ORDER (IMPLEMENTATION PHASES)

**ALL functional requirement domains listed below are mandatory. No module may be omitted.**

### PHASE 1 — FOUNDATION & INFRASTRUCTURE
- Project scaffolding: create `/backend` and `/frontend` workspaces (or `/src/backend`, `/src/frontend`)
- Dependency install: backend (express, typescript, mssql, passport.js, bcrypt, jsonwebtoken, winston or pino), frontend (react, react-router, @tanstack/react-query, form libs, etc.)
- `.env.example` and full config scaffolding for DB (see `DB_CONNECTION_SPEC.md`), JWT, mail (smtp), etc
- Implement `db/connection.ts` and shared `callProcedure(procedureName, params, [txn])` helper (see DB_CONNECTION_SPEC.md)
- Application shell, AppError/error classes, error middleware, logging
- Health check endpoint (`GET /api/v1/health`)
- Initial DB connection test — console log results, abort on failure
- User authentication: login, logout, session/refresh, JWT issuance, failed attempt tracking, lockout, password change/reset, hashing
- RBAC roles/types: implement role-checking system (enum for roles, middleware for access enforcement)
- UserLog capture for all auth events
- Foundation frontend setup: home, login page, protected route logic, role-based menu shell
- Deployment: Dockerfile, docker-compose (NO db), nginx config, GitHub Actions basic pipeline

### PHASE 2 — USER & ROLE MANAGEMENT MODULES
- User CRUD: user listing (paginated, filtered, export), create, edit, deactivate, (soft) delete, bulk import/export, reset password (admin flow)
- Roles: creation, editing, custom role assignment, permissions matrix (object-level permissions)
- Audit log: user action/event history (RBAC protected)
- Notifications: email/SMS/alerts on critical auth/user events
- Help/support UI for user/auth flows

### PHASE 3 — ENTITY MASTER DATA MODULES (CUSTOMERS, SUPPLIERS, CONTACTS, VEHICLES)
- Customer CRUD: create, edit, deactivate
- Supplier CRUD: create, edit, deactivate
- Contact CRUD: add/update contacts, link to customer/supplier
- Vehicle CRUD: add/assign vehicles to customers
- Bulk/batch import and update (with error/duplicate handling)
- Advanced search and filtering (by tag, type, status, combinatorial)
- Duplicate detection and merge (customer, supplier, vehicle)
- Tagging, segmentation, user preferences
- Reports: exportable lists, age summaries, compliance exports
- Change audit/logs for all entity changes

### PHASE 4 — DOCUMENT & ATTACHMENT MANAGEMENT MODULES
- File uploads: multi-file, drag/drop, metadata tagging, versioning, bulk operations
- Attachment CRUD: delete, link, protect by RBAC, preview (PDF, image, text), batch/metadata edit
- Document header/category admin
- Remarks + versioned history logs
- Document workflow/status (draft, locked, finalized)
- Audit trail and reporting for all file/remark/document events

### PHASE 5 — JOB, WORK ORDER, ESTIMATION, SALES/ORDER MANAGEMENT
- Job/service estimation, create/approve/reject
- Job assignment and status workflow (includes Gantt/calendar view)
- Work in progress dashboard
- Sales/order entry, status, delivery note workflow
- API: endpoints for all work/job/report actions (assignment, completion, digital signature capture)
- Notification/alert flows for overdue jobs/assignment/status changes
- Mobile-optimized interface for on-site/work users

### PHASE 6 — PURCHASE, PROCUREMENT, INVENTORY, LEDGER, FINANCIAL, BANKING
- Purchase and delivery order management (local/foreign)
- Stock/inventory: in/out entry, adjustments, part management, valuation, reporting
- Ledger/account management: create/update heads, summary reports, statement, trial balance, age-wise, group summaries
- Receipts/payments: entry, allocation, settlement/finalization, audit, bank/cashbook
- Bank reconciliation, cash book/ledger integration
- Vouchers: entry, approval, reporting, bulk operations

### PHASE 7 — REPORTING, AUDIT, ANALYTICS
- Full reporting endpoints using views/SPs ONLY (never raw table joins unless unavoidable)
- All exports (Excel, PDF, CSV) per requirements
- Custom report design (with RBAC for designer roles)
- Audit trail exports, compliance logs, system diagnostics (ADMIN only APIs/screens)
- Notification integration for failed batch/merge/actions
- Drill-down/summary reports, dashboard analytics

### PHASE 8 — FINAL POLISH & CROSS-CUTTING
- Comprehensive testing (unit, integration; mocks for DB); error simulation/handling tests
- Accessibility, theming, and design system compliance review
- Complete deployment and pipeline scripts, production readiness checklists
- Manual UAT scripts + acceptance test checklists for requirement traceability
- Full admin config and object-level permissions polish

---

**NOTE:**
- All data mutations (write operations) described in the legacy "APPLICATION WRITE OPERATIONS" list must have API endpoints implemented in the designated phase/module.
- All business rules (BR-*, password, audit, role logic) are to be implemented as described in PRD, enforced at the service and, where relevant, repository layer.
- No module, requirement, or business domain may be omitted per FR list above. If a functional area is referenced by any FR, at least an API skeleton and placeholder frontend UI must exist in the phase indicated.
- Testing is continuous, but final integration and UAT are last phase deliverables.
