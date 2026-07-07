<!--
  Generated from : PRD_v1.0.0.md
  PRD hash       : 30974e2c05a9
  Spec version   : v12
  Generated at   : 2026-07-02 09:27:18 UTC
-->

# DB_CONNECTION_SPEC.md

---

## SECTION 1 — DATABASE CONNECTION

**Database Type:** SQL Server

**Connection String Template:**
```
Server=${DB_HOST};Database=${DB_NAME};User Id=${DB_USER};Password=${DB_PASSWORD};TrustServerCertificate=True;Encrypt=True;
```

**Environment Variable Names:**
- DB_TYPE      (should be "sqlserver")
- DB_HOST      (e.g. "192.168.0.235\sql2008")
- DB_NAME      (e.g. "autodealer")
- DB_USER      (e.g. "sa")
- DB_PASSWORD  (e.g. "p@ssw0rd")

---

## SECTION 2 — STORED PROCEDURES

### spCustomerOutStandingSalesManwise
- Parameters:
  - @Date VARCHAR(10) [IN]
- Returns: TABLE (ID, CustID, Bill, Date, Amount, totRcpt, AcName, CUSTOMER, HEAD, BalAmt, Phone1, VSRL, Ordr, SalesMan, [age in days])
- Purpose: Returns customer outstanding balances grouped by salesman as of given date.
- Maps to: GET /api/v1/reports/customer-outstanding-salesmanwise

---

### spRptSalesManInvoices
- Parameters:
  - @FromDate DATETIME [IN]
  - @Todate DATETIME [IN]
- Returns: TABLE (StaffID, SalesMan, CatDescr, Amount, Discount, TotalJob, InvJob, RunningJob)
- Purpose: Returns invoices/sales summary grouped by sales staff, category, and various job counters.
- Maps to: GET /api/v1/reports/salesman-invoices

---

### PendingPurchaseDO
- Parameters:
  - @mSuppID NVARCHAR(255) [IN]  (optional)
- Returns: TABLE (PDONo, ID, SuppId, Ref, PorDt, PurchaseID)
- Purpose: Lists all pending purchase delivery orders; can be filtered by supplier.
- Maps to: GET /api/v1/purchases/delivery-orders/pending

---

### spMonthlySplitSales
- Parameters:
  - @fromDate DATETIME [IN]
  - @toDate DATETIME [IN]
- Returns: TABLE (Month, Year, amount, SplitSection, ItemType)
- Purpose: Monthly sales totals split by section and item type.
- Maps to: GET /api/v1/reports/sales-monthly-split

---

### PartsAvailability_Sp
- Parameters:
  - @JobCard NVARCHAR(15) = '' [IN]
  - @AllOrApproved INT = 0 [IN] (0 = all, 1 = only approved)
- Returns: TABLE (as per PartsAvailability_orderedsql view: Ordr, ItemCode, Qty, ... approval and availability columns)
- Purpose: Provides availability (ordered, arrived, current stock) for required parts, optionally only approved items.
- Maps to: GET /api/v1/jobs/{jobCard}/parts-availability

---

### spStockLastTrans
- Parameters:
  - @StockDate VARCHAR(10) [IN]
- Returns: TABLE (ItemCode, tag, description, location, stockDate, Stock, Rate, TDR, TDA, Amount, CostDisc, AgeType, DaysInStock)
- Purpose: Returns items' last stock transaction as of a date, with aging info.
- Maps to: GET /api/v1/inventory/last-transactions

---

### GetSockQty
- Parameters: none
- Returns: TABLE (ITEMCODE, TAG, description, Location, STOCK, COST)
- Purpose: Returns the current stock quantity and cost for inventory items.
- Maps to: GET /api/v1/inventory/quantities

---

### ac_Group_Sum
- Parameters:
  - @mAc NVARCHAR(255) [IN]
  - @mDate1 DATETIME [IN]
  - @mDate2 DATETIME [IN]
  - @DateOption INT = 0 [IN]
- Returns: TABLE (Bal)
- Purpose: Sums accounting group by account(s) and date range. Optionally by voucher or cheque date.
- Maps to: GET /api/v1/ledger/account-group-balance

---

### Ac_GroupTotal
- Parameters:
  - @mCodes NVARCHAR(255) = '' [IN]
  - @mDate1 DATETIME [IN]
  - @mDate2 DATETIME [IN]
  - @DateOption INT = 0 [IN]
- Returns: TABLE (bal)
- Purpose: Returns total debit/credit balance for an account or group in a date range.
- Maps to: GET /api/v1/ledger/group-total

---

### spGetEstmationDetails
- Parameters:
  - @JobCardNo VARCHAR(12) [IN]
- Returns: TABLE (custname, Address1, ..., Estimation01.*, Approved, RefNo)
- Purpose: Gets estimation (service/job) details for a given job card.
- Maps to: GET /api/v1/estimations/{jobCardNo}/details

---

### SPACTREEVIEW
- Parameters: none
- Returns: TABLE (HEAD, CODES, SCODE, DESCRIPTION, SORT, LEVEL)
- Purpose: Returns tree view/hierarchy of account heads for reporting and selection.
- Maps to: GET /api/v1/ledger/account-tree

---

### Ac_headBalance
- Parameters:
  - @mAc NVARCHAR(255) [IN]
  - @mDate1 DATETIME [IN]
  - @mDate2 DATETIME [IN] (optional)
- Returns: TABLE (BalAmt)
- Purpose: Returns the balance amount for an account head as of a date or date range.
- Maps to: GET /api/v1/ledger/account-balance

---

### SPCASHBANKDETAILS
- Parameters:
  - @ACCOUNT VARCHAR(50) [IN]
  - @FROMDATE VARCHAR(12) [IN]
  - @TODATE VARCHAR(12) [IN]
  - @TYPE VARCHAR(50) [IN]
- Returns: TABLE (as per ACDETAILSSQL view — see view section)
- Purpose: Retrieve cash/bank transaction details for a specified account, type, and date range.
- Maps to: GET /api/v1/banking/cash-bank-details

---

### AcAgeWiseDetails
- Parameters:
  - @mDate DATETIME [IN]
  - @mHead NVARCHAR(255) = '' [IN]
- Returns: TABLE (VSRL, DATE, AC, description, DEBT, CRED, Name, Phone1, Fax, ContactPerson, ContactTel, Days)
- Purpose: Returns age-wise outstanding details grouped by account head and as of date.
- Maps to: GET /api/v1/reports/age-wise-details

---

### acBal
- Parameters:
  - @mAc NVARCHAR(255) [IN]
  - @mDate1 DATETIME [IN]
  - @mDate2 DATETIME [IN]
  - @DateOption INT = 0 [IN]
- Returns: TABLE (bal)
- Purpose: Computes account balance for codes and period, optionally by date type.
- Maps to: GET /api/v1/ledger/account-balance-period

---

### AcClosingBalance
- Parameters:
  - @mAc NVARCHAR(255) = '' [IN]
- Returns: TABLE (BalAmt)
- Purpose: Returns closing balance for account.
- Maps to: GET /api/v1/ledger/account-closing-balance

---

### spGetVehicleStatus
- Parameters:
  - @VehNo VARCHAR(50) [IN]
  - @JobCardNo VARCHAR(50) [IN]
  - @Status INT OUTPUT
- Returns: INT (status)
- Purpose: Checks vehicle status for job card, updates @Status (0-3: not found, found, delivered, etc.)
- Maps to: GET /api/v1/vehicles/{vehNo}/status/{jobCardNo}

---

### AcCurrentTrans
- Parameters:
  - @mDate1 DATETIME [IN]
  - @mDate2 DATETIME [IN]
  - @mHead NVARCHAR(10) [IN]
- Returns: TABLE (DESCRIPTION, CODES, HEAD, bankType, bank, Opn, CurrDr, CurrCr)
- Purpose: Shows opening/period/current debit/credit per account head for dashboard/ledger
- Maps to: GET /api/v1/ledger/current-transactions

---

### CustomerOverview
- Parameters:
  - @PageNumber INT
  - @RecodsPerPage INT
  - @HowManyRecords INT OUTPUT
  - @WhereCondition VARCHAR(8000)
- Returns: TABLE (RowNumber, CustId, Name, Phone, Fax, ContactPerson, ContactPhone, Area, DEBT, CRED, OutStanding, ACCode)
- Purpose: Paginated customer listing with balance, filterable
- Maps to: GET /api/v1/customers

---

### ACDETAILSDET
- Parameters:
  - @mVsrl NVARCHAR(255) [IN]
  - @mAc NVARCHAR(255) [IN]
- Returns: TABLE (*)
- Purpose: Returns ACDETAILSSQL view data for vouchers matching Vsrl, and optionally account filter.
- Maps to: GET /api/v1/vouchers/detail

---

### AcHeadList
- Parameters:
  - @mAc NVARCHAR(255)
- Returns: TABLE (TreeHD, achead.*, TotRec)
- Purpose: List account heads, optionally filtered by group/tree.
- Maps to: GET /api/v1/ledger/account-heads

---

### Opening_Balance_NEW
- Parameters:
  - @mDate DATETIME
  - @mAc NVARCHAR(255)
  - @mActualDate INT = 0
  - @mGroupFilter VARCHAR(200) = ''
- Returns: TABLE (OpDebt, OpCred, OpClosing)
- Purpose: Returns opening balances for accounts, supports filtering/groups/actual/voucher date
- Maps to: GET /api/v1/ledger/opening-balance

---

### GetStaffDetFromOrder
- Parameters:
  - @mOrder NVARCHAR(10) = ''
- Returns: TABLE (StaffID)
- Purpose: Returns staff id(s) for a specific order (service advisor lookup)
- Maps to: GET /api/v1/orders/{orderNo}/staff

---

### ACMASTERDET
- Parameters:
  - @mID INT = 0
  - @mVsrl NVARCHAR(255) = ''
- Returns: TABLE (*)
- Purpose: Retrieves master details for an account voucher by ID or Vsrl.
- Maps to: GET /api/v1/vouchers/master-detail

---

### VoucherList_NEW
- Parameters:
  - @mDate1 DATETIME
  - @mDate2 DATETIME
  - @mAc VARCHAR(255) = ''
  - @mActualDate INT = 0
  - @mGroupFilter VARCHAR(200) = ''
- Returns: TABLE (acdetailsSql.*, GroupInfo)
- Purpose: Detailed journal voucher/transaction listing by period/account/group.
- Maps to: GET /api/v1/vouchers/list

---

### Opening_Balance
- Parameters:
  - @mDate DATETIME
  - @mAc NVARCHAR(255)
  - @mActualDate INT = 0
- Returns: TABLE (OpDebt, OpCred, OpClosing)
- Purpose: Opening balance for account.
- Maps to: GET /api/v1/ledger/opening-balance/simple

---

### ProductsOverview
- Parameters:
  - @PageNumber INT
  - @RecodsPerPage INT
  - @HowManyRecords INT OUTPUT
  - @WhereCondition VARCHAR(8000)
- Returns: TABLE (RowNumber, Id, Code, Description, PartNo, Category, StockQty, StockValue)
- Purpose: Paginated item/product listing with stock, allows dynamic filter.
- Maps to: GET /api/v1/items

---

### AcRcptSum
- Parameters:
  - @mAc NVARCHAR(255)
  - @mDate DATETIME
  - @mCustSupp INT
  - @mActualdate INT = 0
- Returns: TABLE (RcVDAmnt)
- Purpose: Returns sum of receipts for account (customer or supplier selectable).
- Maps to: GET /api/v1/ledger/account-receipts

---

### AcSummary
- Parameters:
  - @mAc NVARCHAR(255)
  - @mDate1 DATETIME
  - @mDate2 DATETIME
  - @mGroupID INT = 1
  - @DateOption INT = 0
- Returns: TABLE (TreeHD, head, codes, description, group, bank, banktype, locked, hidden, lock, SumCr, SumDr)
- Purpose: Returns summarized ledger/ac head list with debit/credit/lock/group details.
- Maps to: GET /api/v1/ledger/account-summaries

---

### AcSummary_balansheet
- Parameters:
  - @mAc NVARCHAR(255)
  - @mDate1 DATETIME
  - @mDate2 DATETIME
  - @mGroupID INT
  - @DateOption INT
  - @mFilterFld NVARCHAR(255)
- Returns: TABLE (TreeHD, achead.*, SumCr, SumDr, grptotal)
- Purpose: Summary for balance sheet reporting.
- Maps to: GET /api/v1/ledger/balance-sheet-summary

---

### AcSummary_balansheet_New
- Parameters: (same as AcSummary_balansheet) + @FromBalanceSheet INT
- Returns: TABLE (TreeHD, achead.*, grptotal, ...)
- Purpose: Enhanced version of balance sheet summary.
- Maps to: GET /api/v1/ledger/balance-sheet-summary-v2

---

### PorfitandbalTotal_SP
- Parameters:
  - @mAc NVARCHAR(255)
  - @mDate1 DATETIME
  - @mDate2 DATETIME
  - @DateOption INT = 0
- Returns: TABLE (bal)
- Purpose: Sums balance for profit and loss reporting.
- Maps to: GET /api/v1/reports/profit-balance-total

---

### AcHead_GroupBal (Scalar UDF, treat as SP for API layer)
- Parameters:
  - @mCodes NVARCHAR(10)
  - @mTreeHd NVARCHAR(255)
  - @mDate1 DATETIME
  - @mDate2 DATETIME
  - @DateOption INT
- Returns: MONEY (balance)
- Purpose: UDF for group/branch account balance by tree/group and date range.
- Maps to: GET /api/v1/ledger/group-tree-balance

---

### AcHeadList
- Parameters:
  - @mAc NVARCHAR(255)
- Returns: TABLE (TreeHD, achead.*, TotRec)
- Purpose: List of all account heads, optionally filtered by group/tree.
- Maps to: GET /api/v1/ledger/account-heads

---

### AgewiseSummary
- Parameters:
  - @mDate DATETIME
  - @mActualDate INT
  - @Customer INT
  - @Supplier INT
  - @mCode VARCHAR(10)
  - @mDatewise INT
  - @mContactdate VARCHAR(10)
  - @ReportType INT
- Returns: TABLE (ac, description, Name, Phone1, ..., D15, D30, ..., D360, Tot, ...)
- Purpose: Age bucket reporting for customers/suppliers/accounts.
- Maps to: GET /api/v1/reports/agewise-summary

---

### spGetWorkStatus
- Parameters: none
- Returns: TABLE (SELECT, Ordr, Status, ordt, CustName, ContactTel, ..., StatusId)
- Purpose: Returns current running jobs and work status for dashboard/ops.
- Maps to: GET /api/v1/jobs/work-status

---

### JObFinished
- Parameters:
  - @mCustID NVARCHAR(10)
  - @mStaffID NVARCHAR(10)
  - @mVehID NVARCHAR(10)
  - @mOrdr NVARCHAR(10)
  - @JobCompleted INT
  - @mDate1 DATETIME
  - @mDate2 DATETIME
- Returns: TABLE (salesordr01sql view, filtered by input)
- Purpose: Returns jobs that are completed (or other status) for report/views.
- Maps to: GET /api/v1/jobs/finished

---

### VoucherList
- Parameters:
  - @mDate1 DATETIME
  - @mDate2 DATETIME
  - @mAc VARCHAR(255)
  - @mActualDate INT
- Returns: TABLE (acdetailsSql view matching the filters)
- Purpose: Filtered list of voucher/transactions for voucher reporting.
- Maps to: GET /api/v1/vouchers/list/basic

---

### VoucherList_Pdc
- Parameters:
  - @mDate1 DATETIME
  - @mDate2 DATETIME
  - @mAc VARCHAR(255)
  - @mFilterAc NVARCHAR(255)
- Returns: TABLE (acdetailsSql filtered for PDC)
- Purpose: Returns voucher details by cheque date for post-dated reporting.
- Maps to: GET /api/v1/vouchers/list/pdc

---

### VoucherSummary
- Parameters:
  - @mDate1 DATETIME
  - @mDate2 DATETIME
  - @mAc NVARCHAR(255)
  - @mActualDate INT
- Returns: TABLE (Sum_DEBT, Sum_CRED, AC, DESCRIPTION, mYY, mMM)
- Purpose: Returns monthly summary of voucher debit/credit per account for period.
- Maps to: GET /api/v1/vouchers/summary/monthly

---

### VoucherSummary_PDC
- Parameters:
  - @mDate1 DATETIME
  - @mDate2 DATETIME
  - @mAc NVARCHAR(255)
  - @mFilterAc NVARCHAR(255)
- Returns: TABLE (debit/credit summary per account for PDC transactions)
- Purpose: Monthly summary for post-dated vouchers/account
- Maps to: GET /api/v1/vouchers/summary/pdc

---

### PROCVOUCHERLIST
- Parameters:
  - @FROMDATE VARCHAR(10)
  - @TODATE VARCHAR(10)
- Returns: TABLE (PAYTYPE, RefNo, AC, VAC, DATE, DEBT, CRED, ...)
- Purpose: Lists voucher transactions for a period for download/report/audit.
- Maps to: GET /api/v1/vouchers/audit-list

---

### SPSALESANALYSISREPORT
- Parameters:
  - @FROMDATE VARCHAR(10)
  - @TODATE VARCHAR(10)
- Returns: TABLE (ID, BILL, BILLDT, VSRL, ORDR, NETT, CUSTNAME, PHONE1, STAFFNAME, VEHNO, MAKE, PAID)
- Purpose: Analytical sales report (with amounts and payment status).
- Maps to: GET /api/v1/reports/sales-analysis

---

### sp_LPOAnalysis
- Parameters:
  - @fromDate VARCHAR(10)
  - @toDate VARCHAR(10)
- Returns: TABLE (Invoice, suppid, LPODate, itemCode, ..., Status, ...)
- Purpose: Purchase order and DO status with detailed linkage.
- Maps to: GET /api/v1/reports/lpo-analysis

---

### spSalesReportForFM
- Parameters:
  - @BodyShop BIT
  - @year INT
- Returns: TABLE (Bill, BillDt, CustName, Amount, CorQ, StaffId)
- Purpose: Sales summary report, filterable by bodyshop and year.
- Maps to: GET /api/v1/reports/sales-summary-fm

---

### spSalesReportStaffvise
- Parameters:
  - @fromDate VARCHAR(10)
  - @toDate VARCHAR(10)
  - @StaffId VARCHAR(10)
  - @HideZero INT
- Returns: TABLE (s1.*, ReceivedAmt, Balance)
- Purpose: Staff-wise sales report
- Maps to: GET /api/v1/reports/sales-staffwise

---

### spSalesBillReport
- Parameters:
  - @fromDate VARCHAR(10)
  - @toDate VARCHAR(10)
  - @option INT
- Returns: TABLE (Ordr, Bill, BillDt, Nett, CustName, Phone1, StaffName, PaidAmount, Balance)
- Purpose: Sales bill payments/receipts progress for reconciliation.
- Maps to: GET /api/v1/reports/sales-bill

---

### spSalesMarginDetails
- Parameters:
  - @fromDt VARCHAR(10)
  - @toDt VARCHAR(10)
  - @bill VARCHAR(12) = '0'
- Returns: TABLE (multiple sales, purchase and margin calculation columns)
- Purpose: Detailed margin report for sales by bill, order, item, etc.
- Maps to: GET /api/v1/reports/sales-margins

---

### SP_MarginRpt
- Parameters:
  - @DTFROM VARCHAR(10)
  - @DTTO VARCHAR(10)
  - @ORDRNO VARCHAR(10) = '0'
  - @INVNO VARCHAR(10)= '0'
- Returns: TABLE (margin calculation fields, join with bills/orders)
- Purpose: Detailed margin breakdown/report, filtering by order/invoice.
- Maps to: GET /api/v1/reports/margin-breakdown

---

### spSalesReportCatSub
- Parameters:
  - @staffId VARCHAR(10)
  - @FromDate DATETIME
  - @ToDate DATETIME
- Returns: TABLE (CatID, Category, StaffId, Amount, Disc)
- Purpose: Sales category breakdown by salesperson and period.
- Maps to: GET /api/v1/reports/sales-category-staff

---

### spFastMovingItems
- Parameters:
  - @FromDate VARCHAR(10)
  - @Todate VARCHAR(10)
  - @minCount INT
- Returns: TABLE (cnt, ITEMCODE, TAG, description)
- Purpose: Lists fast-moving inventory items over a period.
- Maps to: GET /api/v1/inventory/fast-moving-items

---

### spItemTransactionCount
- Parameters:
  - @dtFrom VARCHAR(10)
  - @dtto VARCHAR(10)
  - @Count INT
  - @CatId INT
- Returns: TABLE (itemcode, tag, description, total)
- Purpose: Transaction count for items in period/category for audit.
- Maps to: GET /api/v1/inventory/item-transaction-count

---

### MailCheck
- Parameters:
  - @mUserID NVARCHAR(255)
- Returns: TABLE (MailCount)
- Purpose: Returns count of unread in-app messages for a user.
- Maps to: GET /api/v1/users/{userId}/messages/unread-count

---

### MailRead
- Parameters:
  - @Uid NVARCHAR(255)
  - @Option INT
- Returns: TABLE (Opt, mailtable.*)
- Purpose: Retrieves read/unread messages for user.
- Maps to: GET /api/v1/users/{userId}/messages

---

### CheckPendingDO
- Parameters:
  - @mOrdr NVARCHAR(255)
- Returns: TABLE (dono, tag, qty)
- Purpose: Returns pending delivery orders for a given job/order.
- Maps to: GET /api/v1/jobs/{orderId}/pending-delivery-orders

---

### InvoicePendingDo
- Parameters:
  - @mOrdr NVARCHAR(255)
- Returns: TABLE (DoNo, BillID, Tag, Qty)
- Purpose: Returns invoices associated with pending delivery orders for an order.
- Maps to: GET /api/v1/orders/{orderId}/pending-invoice-delivery

---

### OriginalEstimation_SP
- Parameters:
  - @mJObNo NVARCHAR(10)
- Returns: TABLE (*)
- Purpose: Returns original estimation lines for a job.
- Maps to: GET /api/v1/estimations/{jobId}/original

---

### MailTable related procedures (MailCheck, MailRead)
- Parameters and returns vary (see above)
- Purpose: Handles in-app mail / message features for notification center.

---

### [Additional procedures exist — see source for details, e.g., for user logins, admin, etc.]

---

## SECTION 3 — DATABASE VIEWS (READ MODELS — CRITICAL)

> For all read screens and endpoints, use these views rather than joining base tables.

### CustomerSql
- Base table: Customer
- Resolved columns: custname, Address1, Address2, Address3, Emirate (name), Salesman (description), AreaName, Areaname, all contact and email fields
- Read by: GET /api/v1/customers, /customers/{id}, customers dropdowns/autocomplete

---

### SupplierSql
- Base table: Supplier
- Resolved columns: SuppName, Address1/2/3, Emirate (name), AreaName, Salesman, category groupings
- Read by: GET /api/v1/suppliers, /suppliers/{id}, supplier lookup/import exports

---

### SalesOrdr01Sql or SalesOrdr01Sql_Simple
- Base table: SalesOrdr01
- Resolved columns: Customer name, StaffName/advisor, status (description + booleans), vehicle (VehNo, Make, Model), phone numbers, insurance company, statusId/Description
- Read by: GET /api/v1/orders, /jobs, /dashboard (recent orders, order lookup, advisor assignment, status reports)

---

### Estimation01Sql
- Base table: Estimation01
- Resolved columns: All base Estimation01 columns plus: custname, address, staff/advisor name, vehicle details, phone, fax, staff, and more
- Read by: GET /api/v1/estimations, estimation summary/detail, report screens

---

### WorkInProgressSql
- Base table: WorkInProgress
- Resolved columns: All job, employee, activity, plus EmpName, clock-in states, status strings, calculated time
- Read by: GET /api/v1/jobs/in-progress, job time-tracking, technician assignments

---

### JobInProgressSql
- Base table: jobInProgress
- Resolved columns: All job fields plus vehicle, staff, customer, service charge, colors, description, status description, finished flag
- Read by: GET /api/v1/jobs/job-progress-detail

---

### AssignedJobsSql
- Base table: AssignedJobs
- Resolved columns: Job assignment, associated EmpName, status string/id
- Read by: GET /api/v1/jobs/assigned

---

### AcheadSql / ACHEADSQL
- Base table: ACHEAD
- Resolved columns: All account head fields, parent/child info, attached description, codes, tree names, bank/customer/supplier flags, group, hidden flags, tree string
- Read by: GET /api/v1/ledger/account-heads, head tree, account lookup

---

### AcTree
- Base table: AcTree
- Resolved columns: Codes, GROUPTREE, Group, Head, BankType (parent/child, full group chain)
- Read by: GET /api/v1/ledger/account-tree, structure views

---

### ACDETAILSSQL
- Base table: ACDETAILS / ACMASTER (joined)
- Resolved columns: All voucher/transaction fields, linked account and voucher master, branch, code/description for both debit and credit, group name, pay type, date, narration, posted flag, pdc, cheque info
- Read by: GET /api/v1/vouchers/list, any transaction/ledger read, statement printouts

---

### ACMASTERSQL
- Base table: ACMASTER
- Resolved columns: All master voucher fields, branch name, description, bank info
- Read by: GET /api/v1/vouchers/master-detail

---

### CustomerSupplier
- Base table: Combo of Customer and Supplier
- Resolved columns: Codes, Name, Address, Emirates, Phone1/2, SectionID ('Customer' or 'Supplier')
- Read by: GET /api/v1/contacts, cross-domain lookups for reports and credits

---

### Sales01Sql
- Base table: Sales01
- Resolved columns: All invoice fields plus customer info, vehicle/engine, order, payment state, credit/cash, advisor, cancelled state
- Read by: GET /api/v1/sales/bills, /api/v1/reports/sales, sales invoice lists

---

### Sales02Sql
- Base table: Sales02
- Resolved columns: Product in invoice fields, joins to items, description, type info, rates
- Read by: GET /api/v1/sales/details, sales detail reporting

---

### Delivery01Sql
- Base table: Delivery01
- Resolved columns: Customer name/address info, sales order linkage, vehicle details, additional notes
- Read by: GET /api/v1/delivery/notes, delivery tracking, links for pick/ship screen

---

### Delivery02Sql
- Base table: Delivery02
- Resolved columns: Item descriptions, denom/unit, tags, delivery note link, bill IDs, quantities
- Read by: GET /api/v1/delivery/items, delivery-item-summary

---

### LocalPurchase01Sql / LocalPurchase02Sql
- Base tables: LocalPurchase01, LocalPurchase02
- Resolved columns: All purchase fields plus supplier names, address, item info, remarks, cost discounts
- Read by: GET /api/v1/purchases/list, purchase search, import screens

---

### PurchaseDo01Sql / PurchaseDo02Sql
- Base tables: PurchaseDO01, PurchaseDO02
- Resolved columns: Items, supplier names, financials, split/cost info, referenced purchase order
- Read by: GET /api/v1/purchases/delivery-orders, /delivery-item-list

---

### ItemsSql
- Base table: Items
- Resolved columns: ItemType, ItemSubType, CatDescr, full description, denom, tags, location, category
- Read by: GET /api/v1/items, item lookup/autocomplete, inventory views

---

### StockIn01Sql/StockIn02Sql, StockOut01Sql/StockOut02Sql, StockTransactionSql
- Base tables: StockIn01/StockIn02, StockOut01/StockOut02, StockTransaction
- Resolved columns: All stock in/out transactions, joined to ItemsSql for description/unit/category
- Read by: GET /api/v1/inventory/transactions, stock ledger/statement, in-out audit

---

### Salary related views (EmployeeSql)
- Base table: EmployeeDet (+ joins)
- Resolved columns: All employee main/contact/payroll info, section/department
- Read by: GET /api/v1/hr/employees, payroll/attendance screens

---

### All [vw...] views (vwPurchaseDOnotInPurchase, vwSalesOrdrStatusReport, etc.)
- All naming vw* or *StatusSql indicates reporting views for grouped/status reporting.
- Use: As backend read models for direct reporting endpoints (see stored procs above).

---

### Any [*Sql_Simple] or [*Summary] view
- Use for quick summary/lookup screens (dashboard, analytics, autocomplete).

---

## SECTION 4 — EXISTING TABLES REFERENCED

| Table Name            | Purpose                                                        |
|-----------------------|----------------------------------------------------------------|
| Customer              | Entity record for each customer (master data)                  |
| Supplier              | Entity record for each supplier/vendor                         |
| Items                 | Master record for all inventory/products/parts                 |
| ACHEAD                | Account and account group headers (COA, financial structure)   |
| ACMASTER              | Voucher/accounting document master                             |
| ACDETAILS             | Voucher line items, debits/credits (transactions)              |
| CustBill01 / CustBill02 | Customer bill header and bill receipt allocation             |
| Sales01 / Sales02     | Invoice master and invoice product line items                  |
| SalesOrdr01 / SalesOrdr02 | Sales order master and details                             |
| Delivery01 / Delivery02   | Delivery note header/detail for order fulfillment          |
| WorkInProgress        | Job/work time-tracking per employee/activity                   |
| jobInProgress         | Job status tracking within service workflow                    |
| AssignedJobs          | Job allocation/assignment control                              |
| ProformaSales01/02    | Proforma (quotation) management                               |
| LocalPurchase01/02    | Local purchase order and item line tables                      |
| PurchaseDO01/02       | Purchase delivery order and item line tables                   |
| StockIn01/02, StockOut01/02, StockTransaction | Stock movement records (in/out, adjustments)  |
| Estimation01/02       | Service estimation master/details                              |
| Ajanda, Ajanda02      | Internal work/meeting/organization notes/journal               |
| EmployeeDet           | Employee/HR master record                                      |
| settings              | Global and company-specific settings                           |
| UserLog               | User activity/audit log                                        |
| USERS                 | Application user accounts                                      |
| UserRights            | User-menu access matrix (for RBAC)                             |
| Vehicles              | Vehicle master file                                            |
| CustomerVehicle       | Customer-vehicle linkage, vehicle details                      |
| AttachmentMaster      | Document/attachment file records (metadata only)               |
| MailTable             | In-app messages/notifications                                  |
| tempMarginReport      | Temporary margin reporting staging                             |
| MIRDtl, MIRHDR        | Material Issue/Request records                                 |
| salary01              | Payroll/salary itemized records                                |
| Company, Omasters     | Company definitions, master code lists (areas, categories)     |

***  
**RULE:** To maximize correctness and avoid legacy bugs, use the “*Sql” and reporting views above for all read operations in APIs or frontend—NEVER manually join base tables where a view exists.

***  
If you need further documentation of views, procedures, or table purposes, refer to the view/procedure definitions above or the legacy code base for exact source SQL.  
***