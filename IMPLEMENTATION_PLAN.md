## ⚠️ DB-PRESERVE PROJECT

This project uses DB-Preserve mode.

**Before starting any phase, read: `DB_CONNECTION_SPEC.md`**
- All database access must go through existing stored procedures
- Do NOT create new database tables or run schema migrations
- Connect to the existing database using the connection details in DB_CONNECTION_SPEC.md

---

# IMPLEMENTATION_PLAN.md
## Build Instructions

---

## INSTRUCTIONS FOR THE LLM

You are a senior full stack software engineer. Your job is to build the complete application described in the specification files by following these steps exactly.

All specification files and phase prompt files are in the same folder as this file. Read them as instructed below.

This project has **13 build phases** (Phase 1 to Phase 13).

---

## STEP 1 — READ PROGRESS FILE FIRST

Before doing anything else, read `PROJECT_PHASE_PROGRESS.md` now.
It tells you exactly which phases are complete and where to continue from.

```
Find the first phase whose Status is NOT COMPLETE → start there.
If all 13 phases are COMPLETE → output the final sign-off.
```

---

## STEP 2 — SCORING RULES

After completing every phase you MUST:

```
1. Run the score card from that phase prompt file
2. Calculate score out of 10
3. Count total tokens used in this phase (input + output)
4. Update PROJECT_PHASE_PROGRESS.md with: score, token count, status, any failed items
5. Then:
   Score >= 9.5 → automatically continue to next phase
   Score < 9.5  → fix ALL failed items → re-score → update PROJECT_PHASE_PROGRESS.md → continue
```

Never stop between phases to ask the user anything.
Never skip a phase.
Never move to next phase if score is below 9.5.

---

## STEP 3 — BUILD PHASES IN ORDER

### PHASE 1 — Foundation & Authentication
Read: `IMPLEMENTATION_PHASE1.md`, `PROJECT_OVERVIEW.md`, `API_SPEC.md`, `FRONTEND_SPEC.md`, `STANDARDS.md`, `AGENT_REVIEW_PROTOCOL.md`, `DB_CONNECTION_SPEC.md`
Build → Score → Update PROJECT_PHASE_PROGRESS.md → Continue

### PHASE 2 — User & Role Management
Read: `IMPLEMENTATION_PHASE2.md`, `PROJECT_OVERVIEW.md`, `API_SPEC.md`, `FRONTEND_SPEC.md`, `STANDARDS.md`, `AGENT_REVIEW_PROTOCOL.md`, `DB_CONNECTION_SPEC.md`
Build → Score → Update PROJECT_PHASE_PROGRESS.md → Continue

### PHASE 3 — Customers, Suppliers, Contacts, Vehicles
Read: `IMPLEMENTATION_PHASE3.md`, `PROJECT_OVERVIEW.md`, `API_SPEC.md`, `FRONTEND_SPEC.md`, `STANDARDS.md`, `AGENT_REVIEW_PROTOCOL.md`, `DB_CONNECTION_SPEC.md`
Build → Score → Update PROJECT_PHASE_PROGRESS.md → Continue

### PHASE 4 — Document & Attachment Management
Read: `IMPLEMENTATION_PHASE4.md`, `PROJECT_OVERVIEW.md`, `API_SPEC.md`, `FRONTEND_SPEC.md`, `STANDARDS.md`, `AGENT_REVIEW_PROTOCOL.md`, `DB_CONNECTION_SPEC.md`
Build → Score → Update PROJECT_PHASE_PROGRESS.md → Continue

### PHASE 5 — Jobs, Work Orders & Estimation
Read: `IMPLEMENTATION_PHASE5.md`, `PROJECT_OVERVIEW.md`, `API_SPEC.md`, `FRONTEND_SPEC.md`, `STANDARDS.md`, `AGENT_REVIEW_PROTOCOL.md`, `DB_CONNECTION_SPEC.md`
Build → Score → Update PROJECT_PHASE_PROGRESS.md → Continue

### PHASE 6 — Order & Sales Management
Read: `IMPLEMENTATION_PHASE6.md`, `PROJECT_OVERVIEW.md`, `API_SPEC.md`, `FRONTEND_SPEC.md`, `STANDARDS.md`, `AGENT_REVIEW_PROTOCOL.md`, `DB_CONNECTION_SPEC.md`
Build → Score → Update PROJECT_PHASE_PROGRESS.md → Continue

### PHASE 7 — Purchase & Procurement Management
Read: `IMPLEMENTATION_PHASE7.md`, `PROJECT_OVERVIEW.md`, `API_SPEC.md`, `FRONTEND_SPEC.md`, `STANDARDS.md`, `AGENT_REVIEW_PROTOCOL.md`, `DB_CONNECTION_SPEC.md`
Build → Score → Update PROJECT_PHASE_PROGRESS.md → Continue

### PHASE 8 — Stock & Inventory Management
Read: `IMPLEMENTATION_PHASE8.md`, `PROJECT_OVERVIEW.md`, `API_SPEC.md`, `FRONTEND_SPEC.md`, `STANDARDS.md`, `AGENT_REVIEW_PROTOCOL.md`, `DB_CONNECTION_SPEC.md`
Build → Score → Update PROJECT_PHASE_PROGRESS.md → Continue

### PHASE 9 — Banking & Reconciliation
Read: `IMPLEMENTATION_PHASE9.md`, `PROJECT_OVERVIEW.md`, `API_SPEC.md`, `FRONTEND_SPEC.md`, `STANDARDS.md`, `AGENT_REVIEW_PROTOCOL.md`, `DB_CONNECTION_SPEC.md`
Build → Score → Update PROJECT_PHASE_PROGRESS.md → Continue

### PHASE 10 — Ledger & Account Management, Vouchers & Bulk Journals
Read: `IMPLEMENTATION_PHASE10.md`, `PROJECT_OVERVIEW.md`, `API_SPEC.md`, `FRONTEND_SPEC.md`, `STANDARDS.md`, `AGENT_REVIEW_PROTOCOL.md`, `DB_CONNECTION_SPEC.md`
Build → Score → Update PROJECT_PHASE_PROGRESS.md → Continue

### PHASE 11 — Receipts & Payments Processing
Read: `IMPLEMENTATION_PHASE11.md`, `PROJECT_OVERVIEW.md`, `API_SPEC.md`, `FRONTEND_SPEC.md`, `STANDARDS.md`, `AGENT_REVIEW_PROTOCOL.md`, `DB_CONNECTION_SPEC.md`
Build → Score → Update PROJECT_PHASE_PROGRESS.md → Continue

### PHASE 12 — Reporting, Audit Logging & Analytics
Read: `IMPLEMENTATION_PHASE12.md`, `PROJECT_OVERVIEW.md`, `API_SPEC.md`, `FRONTEND_SPEC.md`, `STANDARDS.md`, `AGENT_REVIEW_PROTOCOL.md`, `DB_CONNECTION_SPEC.md`
Build → Score → Update PROJECT_PHASE_PROGRESS.md → Continue

### PHASE 13 — Security & Final Polish
Read: `IMPLEMENTATION_PHASE13.md`, `PROJECT_OVERVIEW.md`, `API_SPEC.md`, `FRONTEND_SPEC.md`, `STANDARDS.md`, `AGENT_REVIEW_PROTOCOL.md`, `DB_CONNECTION_SPEC.md`
Build → Score → Update PROJECT_PHASE_PROGRESS.md → Continue

---

## FINAL OUTPUT

When all 13 phases score 9.5 or above, run the MASTER QA checklist before signing off:

### FINAL STEP — RUN MASTER QA
Read `IMPLEMENTATION_QA.md` and work through every section.
Open every route and confirm it is a REAL, data-bound page — NOT a placeholder/stub (e.g. a screen that only shows a title).
Fix every ❌ you find, then re-run the checklist. The project is RELEASE-READY only when IMPLEMENTATION_QA.md fully passes (0 placeholders).

Then output this:

```
🎉 PROJECT COMPLETE
===================
| Phase | Description | Score  | Tokens | Status |
|-------|-------------|--------|--------|--------|
|   1   | Foundation & Authentication | __ /10 | __     |  PASS  |
|   2   | User & Role Management | __ /10 | __     |  PASS  |
|   3   | Customers, Suppliers, Contacts | __ /10 | __     |  PASS  |
|   4   | Document & Attachment Manageme | __ /10 | __     |  PASS  |
|   5   | Jobs, Work Orders & Estimation | __ /10 | __     |  PASS  |
|   6   | Order & Sales Management | __ /10 | __     |  PASS  |
|   7   | Purchase & Procurement Managem | __ /10 | __     |  PASS  |
|   8   | Stock & Inventory Management | __ /10 | __     |  PASS  |
|   9   | Banking & Reconciliation | __ /10 | __     |  PASS  |
|   10   | Ledger & Account Management, V | __ /10 | __     |  PASS  |
|   11   | Receipts & Payments Processing | __ /10 | __     |  PASS  |
|   12   | Reporting, Audit Logging & Ana | __ /10 | __     |  PASS  |
|   13   | Security & Final Polish | __ /10 | __     |  PASS  |
Overall: READY FOR PRODUCTION ✅
Run: docker-compose up
```

---

## IF TOKEN RUNS OUT

1. `PROJECT_PHASE_PROGRESS.md` shows exactly which phases are done
2. Start a new chat
3. Say: `"Read IMPLEMENTATION_PLAN.md and PROJECT_PHASE_PROGRESS.md and continue"`
4. LLM reads progress file and continues from where it stopped
