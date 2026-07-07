<!--
  Generated from : PRD_v1.0.0.md
  PRD hash       : 30974e2c05a9
  Spec version   : v12
  Generated at   : 2026-07-02 09:27:18 UTC
-->

# AGENT_REVIEW_PROTOCOL.md

**Integrated Business Operations Suite — Review Protocol**  
**Mode:** DB-Preserve (Existing Database Only — No Schema Changes)  
**Version:** 1.0  
**Date:** 2026-06-16

---

## Layer 1: DB CONNECTION LAYER

**Verification Checklist:**
1. Is the database connection implemented using the provided SQL Server connection string template and loaded from the `DB_CONNECTION_STRING` (and related) environment variable(s)?
2. Does `db/callProcedure.ts` exist and encapsulate all calls to stored procedures via parameterised access (never string concatenation)?
3. Are ALL database writes/reads performed through `callProcedure()`?
4. Is there NO direct use of raw SQL queries or direct table access anywhere in the codebase, except as dictated by step 3 of DB-Preserve Access Strategy (use a view for reads if available)?
5. Is every stored procedure in `DB_CONNECTION_SPEC.md` callable via the backend, with correct parameter and output mapping?
6. Is there NO table/schema creation, migration, or DDL in the codebase or startup logic?
7. Are all connection errors, pool timeouts, and SQL exceptions handled and surfaced as typed errors according to `error-handling.md`?
8. Are all connection parameters (host, db, user, password) loaded only from environment configuration and never hardcoded in source?
9. For all multi-tenant or test environments, is there support for reading from an alternate connection string without any code changes?
10. Is the connection pool size/recycling strategy compliant with the `db-connection-guide.md`?

---

## Layer 2: API LAYER

**Verification Checklist:**
1. Does every API endpoint listed in `api-endpoints.md` exist at the correct HTTP method + path?
2. For every endpoint, does the backend call the mapped stored procedure with parameter values mapped directly from the HTTP request (query/body/path) per `stored-procedure-mapping.md`?
3. Are the request and response shapes strictly matching those described in the respective markdown specs, with all fields present and correct typing?
4. Is access control (authentication + authorization by role) enforced for every endpoint as per `api-contracts.md`, `authentication.md`, and the PRD's access control matrix?
5. Are all error codes, status codes, and error response payloads matched exactly as specified, including for validation, permission, database, and application errors?
6. Are list endpoints paginated according to API spec (default page size, max page size, total count in response)?
7. Are monetary values, dates, and decimals formatted as specified (e.g., 4 decimal places for currency)?
8. Does the OpenAPI/Swagger/OpenAPI v3 or Postman collection exactly document the endpoints, parameters, responses, and example error codes?
9. Are all "write" (POST/PUT/PATCH/DELETE) endpoints mapped from the legacy app's write detection list present and functioning as direct stored procedure wrappers (no in-app data merging or custom logic outside validation and mapping)?
10. Do endpoints for sensitive areas (e.g., user management, permissions) enforce RBAC and log all changes as per requirements?

---

## Layer 3: BUSINESS LOGIC LAYER

**Verification Checklist:**  
For each PRD business rule, a concrete implementation or test should map directly to the rule's requirement and number. Each assertion must be checked with test/evidence or a code walk.

**USER AUTHENTICATION & CONTROL**
- [ ] BR-01: User unique identifier/password is required and enforced.
- [ ] BR-02: Lockout occurs after N failed sign in attempts (configurable).
- [ ] BR-03: Password complexity (min. length, upper/lower, numeric, symbol) enforced on all set/change/reset.
- [ ] BR-04: Password changes/resets require verification via current password or secure reset. 
- [ ] BR-05: User session expires after inactivity (timeout config present and functional).
- [ ] BR-06: Only proper roles can view authentication logs or manage accounts.
- [ ] BR-07: User log report accessible only to supervisors/administrators.
- [ ] BR-08: Changing sensitive account settings triggers a re-authentication prompt.
- [ ] BR-09: Per-incident notification (email/SMS) sent to user on password changes/resets.
- [ ] BR-10: All auth/account ops available via documented API endpoints mapped to service logic.

**USER & ROLE MANAGEMENT**
- [ ] BR-11: Only administrators can assign/modify user/group permissions.
- [ ] BR-12: User email addresses unique—duplicate checked at create/import.
- [ ] BR-13: Deactivated users cannot log in or access any system endpoint.
- [ ] BR-14: All account management actions logged (who, when, what).
- [ ] BR-15: (Repeat) Password complexity as in BR-03.
- [ ] BR-16: Highest assigned role governs access for users with multiple roles.
- [ ] BR-17: Only users with appropriate reporting roles can view/export/design reports.
- [ ] BR-18: Bulk user import checks for duplicates before create.
- [ ] BR-19: Temporary/fixed user access expires automatically at end of assignment period.
- [ ] BR-20: Role/permission changes effective immediately upon save.

**CUSTOMER, SUPPLIER, CONTACTS**
- [ ] BR-21: Customer uniqueness = name + main contact number.
- [ ] BR-22: Suppliers may not be deactivated if associated with active transactions (SP-level check or validation).
- [ ] BR-23: All contact records require at least one phone or email.
- [ ] BR-24: Merging duplicates requires supervisor/administrator action.
- [ ] BR-25: A vehicle links to only one active customer (checked on link/merge).
- [ ] BR-26: Adding record with an existing unique ID triggers duplicate warning/walkthrough.
- [ ] BR-27: Bulk import must validate data and uniqueness before commit.
- [ ] BR-28: Edits to master records (customer, supplier, etc) logged with user/time.
- [ ] BR-29: Sensitive contact info in reports only for authorized users/roles.
- [ ] BR-30: Validation rules (field requirements, etc) are admin-configurable.

**ATTACHMENTS & DOCUMENT MANAGEMENT**
- [ ] BR-31: Upload/view/edit/delete permissions enforced per role (all routes).
- [ ] BR-32: Attachments link to at least one valid transaction/order.
- [ ] BR-33: Each attachment records user, upload date, and version.
- [ ] BR-34: Every additional remark attributed to the correct user, with a timestamp.
- [ ] BR-35: Only admin can restore deleted attachments/remarks; standard users cannot.
- [ ] BR-36: All bulk deletes/downloads require explicit confirmation step.
- [ ] BR-37: Audit logs (all edits/deletes) readable by administrators (with access control).
- [ ] BR-38: Document headers/categories are standardized and assignable by admin only.

**JOBS, WORK ORDERS, ESTIMATION**
- [ ] BR-39: Estimation submissions require customer, description, and at least one cost line.
- [ ] BR-40: Only supervisor/admin can approve/reject estimations.
- [ ] BR-41: Only assigned or authorized users can update job status.
- [ ] BR-42: Inactive job statuses can't be assigned.
- [ ] BR-43: User job assign limit ("X" active jobs) enforced unless supervisor overrides. [NEEDS CONFIRMATION]
- [ ] BR-44: Only jobs in user's department/scope reported in their reports.
- [ ] BR-45: All job status/assignment/approval changes logged (who, when, old/new).
- [ ] BR-46: Job can only be completed if all required job card fields/info present.
- [ ] BR-47: Assignment notification sent to assignee within 5 min.
- [ ] BR-48: Job completion requires digital signature of responsible user (with audit trail).
- [ ] BR-49: Mobile-access users require MFA at login [BEST PRACTICE].
- [ ] BR-50: Only administrators can change the job status master list.

**ORDERS & SALES**
- [ ] BR-51: Cannot delete order with an issued delivery note.
- [ ] BR-52: All sales order required fields must be filled before submit.
- [ ] BR-53: Only authorized roles can change customer assignment or status.
- [ ] BR-54: Automated confirmation emails sent immediately on order create.
- [ ] BR-55: All delivery notes are digital and auditable.
- [ ] BR-56: All order status changes logged per user/date/reason.
- [ ] BR-57: Delivered orders' products/quantities become read-only.
- [ ] BR-58: Only admin can access all-customer summary sales reports.
- [ ] BR-59: Discounts/taxes calculated by company-approved formulas (unit-tested, enforced).
- [ ] BR-60: Delivery notes must reference a valid sales order and customer.

**PURCHASING, PROCUREMENT**
- [ ] BR-61: Purchases above threshold require supervisor approval before process.
- [ ] BR-62: Every purchase delivery order must reference an existing purchase order.
- [ ] BR-63: Received goods must match items/quantities from source PO.
- [ ] BR-64: Access to purchase order screen/actions gated by role.
- [ ] BR-65: Supporting docs required if order exceeds configured value threshold.
- [ ] BR-66: Purchase order numbers unique.
- [ ] BR-67: Purchase/delivery orders not deletable post-approval.
- [ ] BR-68: All PO/DO changes go to audit log.
- [ ] BR-69: Overdue delivery orders trigger alerts to responsible purchase officer(s).
- [ ] BR-70: Only admin may configure approval workflows/access rules.

**INVENTORY & STOCK**
- [ ] BR-71: All stock receipts have item, quantity, date, warehouse location.
- [ ] BR-72: Cannot issue stock exceeding current inventory at the selected warehouse.
- [ ] BR-73: Stock adjustments require supervisor approval, logged with original and updated val.
- [ ] BR-74: Stock valuation method (FIFO, avg) follows finance configuration.
- [ ] BR-75: Low/inadequate stock triggers notification/alert.
- [ ] BR-76: All stock movement logs (add, edit, delete) list user, action, date.
- [ ] BR-77: Only roles with proper permission can edit, approve, or export inventory data.
- [ ] BR-78: Mobile stock data is validated for item/location accuracy.
- [ ] BR-79: System blocks duplicate adjustment for same item/location/period.
- [ ] BR-80: Only valid roles can access sensitive/financial inventory exports.

**BANKING & RECONCILIATION**
- [ ] BR-81: Only finance/bank roles can edit or reconcile bank/cash transactions.
- [ ] BR-82: All unreconciled transactions must be addressed/documented within 3 days.
- [ ] BR-83: All reconcile actions logged with user/timestamp.
- [ ] BR-84: Only proper roles access or export CBPBook, PendingBills reports.
- [ ] BR-85: Transaction without serial cannot be posted/finalized.
- [ ] BR-86: Imported bank statements go through required format/completeness checks.
- [ ] BR-87: Supervisor notified if reconcile exception is unaddressed in allowed time.
- [ ] BR-88: Help resources present for all primary reconciliation screens.
- [ ] BR-89: Only specifically assigned users/roles can use advanced reconciliation/report design.

**LEDGER & ACCOUNTS**
- [ ] BR-90: Account names unique in each group.
- [ ] BR-91: Referenced accounts (by transactions) CANNOT be deleted—must be deactivated.
- [ ] BR-92: Only current/active parent heads can be assigned to child accounts.
- [ ] BR-93: Account creation requires name, type, group, status.
- [ ] BR-94: Account CRUD actions gated by role permission.
- [ ] BR-95: All account changes are logged with who, when, what.
- [ ] BR-96: Ledger entry only allowed for active accounts.
- [ ] BR-97: Bulk import of accounts validates for required/duplicate entries.
- [ ] BR-98: Failed import/export triggers notification to supervisor(s).
- [ ] BR-99: Orphaned heads (no parent) flagged for admin/supervisor review.

**RECEIPTS & PAYMENTS**
- [ ] BR-100: Only supervisor/admin can approve/finalize receipts/payments.
- [ ] BR-101: Receipts/payments allocated accurately to intended party/account.
- [ ] BR-102: Posted/settled payments/receipts cannot be edited/deleted.
- [ ] BR-103: All pending records require approval before posting.
- [ ] BR-104: Petty cash never goes negative.
- [ ] BR-105: Only authorized roles access backup and special audit reports.
- [ ] BR-106: Only external, authoritative payment systems set payment 'confirmed' statuses.
- [ ] BR-107: All audit trail entries include user, date, action.
- [ ] BR-108: Only permitted users/systems can perform receipt/payment CRUD; actions are logged.
- [ ] BR-109: Advanced reporting/design features are permissioned per user or role.

**VOUCHERS & TRANSACTIONS**
- [ ] BR-110: Debits = credits enforced for every journal entry.
- [ ] BR-111: Voucher number unique in financial year.
- [ ] BR-112: Only supervisors or higher can approve/reject batches.
- [ ] BR-113: All required fields for a transaction are enforced as mandatory.
- [ ] BR-114: All voucher/transaction changes logged by user/timestamp.
- [ ] BR-115: Attachments on vouchers allowed only in permitted formats and sizes.
- [ ] BR-116: Only authorized system/users can access voucher APIs.
- [ ] BR-117: All reporting access is RBAC.
- [ ] BR-118: Bulk ops (import/approve/delete) restricted to proper permission.
- [ ] BR-119: Draft entries are only visible/editable to creator until submitted.

**FINANCIAL REPORTING, DASHBOARDS**
- [ ] BR-120: Only defined roles can access financial/statutory reports.
- [ ] BR-121: All required report params enforced before view/export.
- [ ] BR-122: Financial/Age-wise data uses up-to-date closing books/dates.
- [ ] BR-123: Only supervisors/administrators can schedule automated reports.
- [ ] BR-124: Reports always exportable as Excel and PDF, at minimum.
- [ ] BR-125: Account statements match company-branded or plain template formats.
- [ ] BR-126: All report generate/export/email events logged (who, what, when).
- [ ] BR-127: Only admin or assigned designers may create/modify report templates.
- [ ] BR-128: Test/backup/alternate layout reports restricted to admin access.
- [ ] BR-129: Automated/scheduled report failures send alert to responsible parties.

**AUDIT LOGGING & CHANGE TRACKING**
- [ ] BR-130: All changes to account/customer/supplier data logged (who, when, what).
- [ ] BR-131: Only authorized users may view/export audit/change logs (with RBAC).
- [ ] BR-132: Duplicates/merges tracked in audit trail w/ user/detail.
- [ ] BR-133: Audit records retained as per company retention policy.
- [ ] BR-134: Suspicious/high-risk actions trigger audit/alert to supervisor/admin.
- [ ] BR-135: Audit log/read access is itself RBAC and all access is logged.
- [ ] BR-136: Audit logs cannot be deleted/altered except via retention/archive logic.
- [ ] BR-137: All audit-related stored procedures are exposed via API endpoints.

---

## Layer 4: ACCEPTANCE CRITERIA LAYER

For each Given/When/Then scenario from the PRD, test (with evidence or step-by-step) that the acceptance flow passes.

**Authentication & Security**
- [ ] Sign In: Given a valid username and password; When the user submits the sign in form; Then the system grants access and starts a session.
- [ ] Password Change: Given a signed-in user; When the user enters current/new password (meeting policy); Then password is updated securely and confirmed.
- [ ] Password Reset: Given a user who has forgotten their password; When they start reset and verify; Then system sends reset link and allows password update.
- [ ] Account Lockout: Given a user fails to sign in repeatedly; When limit reached; Then account locked and user notified.
- [ ] Session Timeout: Given a signed in but inactive user; When idle time limit reached; Then user is signed out with timeout notice.
- [ ] User Log Report: Given authorized supervisor; When accessing; Then user log data is displayed with export options.
- [ ] Password Policy: Given user creates/changes password; When not meeting policy; Then system shows error and blocks change.
- [ ] MFA: Given MFA enabled; When user signs in; Then must complete MFA step.
- [ ] Role Access Management: Given admin; When reviewing/setting permissions; Then role access is viewable and editable.
- [ ] Password Change Notification: Given user’s password is changed; When change succeeds; Then user notified via email/SMS.

**User & Role Management**
- [ ] User List: Given supervisor logged in; When opening User List; All users show with correct status/filters.
- [ ] User Management: Given admin creates a user; When saving; New user appears in list.
- [ ] Rights Management: Given admin updates role; When saving; User permissions updated instantly.
- [ ] Bulk Import: Given admin uploads valid CSV; When processed; All users added and logged.
- [ ] Admin Change Password: Given admin selects a user; When sets password; Change is reflected and audited.
- [ ] Audit Log (UserLogReport): Given supervisor uses UserLogReport; When filtering; Only matching records shown and exportable.
- [ ] EmployeeList: Given admin uses report; When filtering; Only selected department shown.
- [ ] API Sync: Given valid API credentials; When requesting a user; User details provided and access logged.
- [ ] Role Assignment: Given new role assigned; When permissions configured; Access matches new role.
- [ ] Account Deactivation: Given multiple users deactivated; When confirming; Accounts are inactive and denied login.

**Customer, Supplier, Contact**
- [ ] [See PRD Acceptance Criteria for all CRUD/merge/import/report/validation flows.]

**Attachments/Remarks/Documents**
- [ ] [As per all PRD Given/When/Then for upload, view, delete, batch ops, audit, permissions, reports, and notification flows.]

**Jobs/Estimation**
- [ ] [As per PRD: estimation create/approve, job assign/status, in-progress, digital signature, mobile interface, Gantt/calendar, overdue, etc.]

**Order/Sales**
- [ ] [As per PRD for order create, change status, API updates, report/export, mobile, notifications, etc.]

**Purchase/Procurement**
- [ ] [As per PRD for all creation, approval, import, receipt, alerting, audit, access control, session security.]

**Stock/Inventory**
- [ ] [As per PRD for stock entry, adjustment, availability, import, barcode, dashboard, audit, etc.]

**Banking/Reconciliation**
- [ ] [As per PRD for cash/bank book, reconciliation, attachment, auditing, notifications, report restrictions.]

**Ledger/Account**
- [ ] [As per PRD for accounts CRUD, reporting, bulk, audit, mobile support.]

**Receipts/Payments**
- [ ] [As per PRD for entry, allocation, posting, approval, audit, external confirmation, backup/export.]

**Vouchers/Transactions**
- [ ] [All PRD Given/When/Then for creation, batch, approval, validation, error, API access, reporting, attachment.]

**Financial Reporting**
- [ ] [All PRD flows for report selection, filter, export, scheduling, template design, error handling, notification, etc.]

**Audit Logging**
- [ ] [All PRD flows for change log, duplicate/merge audit, export, access/log scoping, alerting, replay, annotation.]

---

## Layer 5: FRONTEND / UI LAYER

Every PRD-identified screen must be present as a **real, functional route/page/component**, matching sample screens for layout, colors, spacing, and UX details as shown. For every screen below, confirm:

- [ ] The screen exists at the documented frontend route (`/login`, `/users`, `/orders/:id`, etc).
- [ ] All expected input fields, search/filter controls, table columns, action buttons, select dropdowns, etc are present and labelled.
- [ ] All required field validations and error messages are visually correct and fire in all error/edge cases.
- [ ] Focus, keyboard nav, screen-reader label, and tab order work (WCAG AA).
- [ ] Loading, error, and empty states are visible and visually styled.
- [ ] Role/permission-based controls/fields only render for allowed groups.
- [ ] Navigation to and from the screen is end-to-end testable.
- [ ] Detail/drawer/modals open as specified for view/edit/create.
- [ ] All linked flows (e.g., "Add User" button on /users takes you to user creation screen, back/cancel navigates, etc) are operational.
- [ ] Bulk selection and export flows (Table > select > Export) function as described.
- [ ] List and form screens use correct colors, typography, spacing, and component patterns from the UI DESIGN SYSTEM and SAMPLE SCREENS.

**Screens for Mandatory Verification:**  
1. Sign In  
2. Password Change  
3. ODBC Sign In  
4. Bypass/Forgot Password  
5. User Log Report  
6. User List  
7. User Rights Management  
8. User Management  
9. Legacy User Management  
10. Admin Change Password  
11. Page/User Info  
12. UserLogReport  
13. EmployeeList  
14. Customer Management  
15. Supplier Management  
16. Contact Entry  
17. Contact Search  
18. Customer Help  
19. Supplier Help  
20. Customer Vehicle Entry  
21. Customer Vehicle Help  
22. Merge Customer Duplicates  
23. Merge Supplier Duplicates  
24. Merge Vehicle Duplicates  
25. Customer/Supplier List Report  
26. Check Duplicate Contacts  
27. Cust Age Wise  
28. Items Help New  
29. Local Porder Search  
30. Menu  
31. Supp Age Wise  
32. Document Help  
33. Main Menu (OLD & Current)  
34. Declare Module  
35. DMS Module  
36. Functions  
37. Inventory  
38. Log Module  
39. Main Module  
40. Utility Module  
41. Numto Words  
42. Payroll  
43. Process Status Module  
44. Read Offline Message  
45. Settings  
46. Form1 (Placeholder/Test Interface)  
47. Report Test (Sample/Diagnostics Report)  
48. CustomerList (Report Screen)  
49. SupplierList (Report Screen)  
50. Attachments  
51. Additional Remarks  
52. Document Entry  
53. Document Menu  
54. Document Head Management  
55. Additional Remarks Reports  
56. Service Estimation Entry  
57. Estimation Approval  
58. Job Order Status  
59. Job Status Master  
60. Job Status Help  
61. Work Status  
62. Work Status Management  
63. Work Status Report  
64. Pending Job Card Help  
65. Job Status Advisor Wise (Report)  
66. Work Status Report (rptWorkStatus)  
67. Work Status Summary Report (rptWorkStatusSummary)  
68. Work In Progress Report (work_In_Progress)  
69. Sales Order Entry  
70. Sales Order Help  
71. Order Status  
72. Pending Orders List  
73. Delivery Log  
74. Delivery Note Entry  
75. Change Order Customer  
76. Sales Order Report  
77. Order Status Report  
78. Pending Order Register Report  
79. Delivery Note Report  
80. Foreign Purchase Entry  
81. Local Purchase Entry  
82. Local Purchase Order Entry  
83. Local Purchase Order Management  
84. Pending Purchase Delivery Order  
85. Purchase Delivery Order  
86. Purchase DO Search  
87. PurchaseOrder Report  
88. PurchaseDo01PDO Report  
89. pendingPurchaseDo Report  
90. Stock In Entry  
91. Stock Out Entry  
92. Stock Movements In/Out  
93. Physical Stock Adjustment  
94. New Physical Stock Adjustment  
95. Stock Availability  
96. Stock Display  
97. Stock Updates  
98. Stock Valuation  
99. StockLedger Report  
100. StockAgingReport  
101. StockStatement  
102. StockValuationReport  
103. Bank Book  
104. Cash Book  
105. Bank Reconciliation  
106. Select Bank for Reconciliation  
107. CBPBook (Report)  
108. PendingBillsLetter (Report)  
109. acFilterFrm (Audit Support Screen)  
110. missingAcSrlFrm (Audit Correction Screen)  
111. GroupHlpFrm (Help/Support Screen)  
112. SectionFrm (Data Maintenance Screen)  
113. Table1 (Data Entity Support Screen)  
114. aaaaaaaaaaaaaa (Custom Data/Business Logic Screen)  
115. Form1 (General Data Review Screen)  
116. Account Create/Delete/Update  
117. Account Head Creation  
118. Account Head Help  
119. Account Head List  
120. New Account Head List  
121. Account Head Tree  
122. Account Head Resorting  
123. Account Selector  
124. Account Subdetails Display  
125. Account Transaction Error  
126. Account Tree in List View  
127. AcheadList Report  
128. Ledger Report  
129. Ledger_ActualDate Report  
130. Ledger_Pdc Report  
131. LedgerSummary Report  
132. Auto Receipt Entry  
133. Payment Entry  
134. Receipt Entry  
135. Petty Cash Entry  
136. Payment Finalization  
137. Pending Add Payment  
138. Pending Add Receipt  
139. Receipts (Report)  
140. Payments (Report)  
141. Receipt-Backup (Report)  
142. Pdc_Issue_Voucher (Report)  
143. Pdc_Receipt_Voucher (Report)  
144. Bulk Journal Voucher Entry  
145. Bulk PDC Receipt Transactions  
146. Bulk PDC Transactions  
147. Journal Entry  
148. Voucher List  
149. Voucher Help  
150. Account Voucher Display  
151. Journal Voucher Report  
152. Daily Voucher List Report  
153. Voucher Details List Report  
154. Voucher List Report  
155. Report Selection and Generation  
156. Group Ledger Summary  
157. Report Preview Screen  
158. Ledger Short Report  
159. Voucher Details Report  
160. LedgerSummary  
161. AgeWise  
162. TrialBalance  
163. PandLReport  
164. VoucherDetailsList  
165. SalesAnalysis  
166. SalesRegister  
167. Profitandlossfrm  
168. a1  
169. AcheadList  
170. AcSrlList-MissingList  
171. AcSrlList  
172. AcStatement-Preprented  
173. AcStatementPlainPaper  
174. AdditionalRemarksReports  
175. agewisesummary  
176. CBPBook  
177. Company_Report_Header  
178. Copy of DOPrnt  
179. Copy of SaleBillPrnt-back  
180. CreditNote  
181. CustomerBillDetailedSummary  
182. CustomerBillWisePending-old  
183. CustomerBillWisePending  
184. CustomerBillWisePending1  
185. CustomerBillWiseSummary-New  
186. CustomerBillWiseSummary  
187. CustomerBillWiseSummary_advisorwise  
188. CustomerList  
189. CustomerOurstandgReport_SalesMan  
190. CustomerVisit  
191. DailyVoucherList  
192. DebitNote  
193. DEPOSIT_CERTIFICATE_TEMPLATE  
194. DischargeReceipt  
195. DiscountSummaryReport  
196. DOPrnt-old  
197. DOPrnt  
198. DOPrntold  
199. DoRegister  
200. EmployeeAttendanceList  
201. EmployeeList  
202. EstimationReport  
203. InsuraceInvReport  
204. InvoiceDetailsServ  
205. invoiceDetailsSub  
206. ItemDOList  
207. ItemDOSumm  
208. ItemList  
209. ItemPendingDOList  
210. ItemPurchaseList-Import  
211. ItemPurchaseList-Local  
212. ItemPurchaseReturnList  
213. ItemPurchaseReturnSumm  
214. ItemPurchaseSumm-Import  
215. ItemPurchaseSumm-Local  
216. ItemSalesList  
217. ItemSalesListJobCard  
218. ItemSalesReturnSumm  
219. ItemSalesSumm  
220. ItemSreturnList  
221. itemtranscount  
222. JobDetailsSub  
223. JobStatusAdvisorWise  
224. JournalVoucher  
225. Ledger  
226. LedgerSummaryActual  
227. Ledger_ActualDate  
228. Ledger_Pdc  
229. LPOAnalysis  
230. LPODetailsReport  
231. mailreport  
232. OMastersReport  
233. OpeningStkList  
234. OrderStatus  
235. OrderStatus1  
236. Outstanding_OrderStatus  
237. partsAvailabilityforWorksheet  
238. Payments  
239. Pdc_Issue_Voucher  
240. Pdc_Receipt_Voucher  
241. PendingBillsLetter  
242. PendingDoList  
243. pendingOrderRegister  
244. pendingPurchaseDo  
245. PreturnReg  
246. ProdRequest  
247. ProformaSaleBillPrnt  
248. PurchaseBill-Import  
249. PurchaseBill-Local  
250. PurchaseDo01PDO  
251. PurchaseDoItemRegister  
252. PurchaseDoItemRegisterSummary  
253. PurchaseOrder  
254. Purchasereg-Ac  
255. Purchasereg-Import  
256. Purchasereg-Local  
257. PurchaseregSupp-Local  
258. PurchaseReturnBill  
259. Receipts-Backup  
260. Receipts  
261. Report1  
262. Report222rpt  
263. Report_stk_ledger  
264. rptWorkStatus  
265. rptWorkStatusSummary  
266. SalaryRegister  
267. Salaryslip  
268. SaleBillPrnt-12  
269. SaleBillPrnt  
270. SaleBillPrnt_2  
271. SaleBillPrnt_Insurance  
272. SaleBillPrnt_plain  
273. SaleBillPrnt_ribu  
274. SaleBillPrnt_Sectionwise  
275. SalesAnalysisNEW  
276. SalesAnalysisOne  
277. SalesItemCategorySub  
278. SalesLabourPartsReport  
279. SalesMarginReport  
280. SalesMarginReportNew  
281. SalesOrder  
282. SalesOrderNEW  
283. SalesOrderNEW_-bACKUP  
284. SalesOrderNEW_backup  
285. SalesOrderStatus  
286. SalesRegister-Cust  
287. SalesRegister-detailed  
288. SalesRegisterServ  
289. SalesReturnBill  
290. SalesReturnRegister  
291. salesSummary  
292. SplitInvoiceSummary  
293. StkLedgerNew  
294. StkReportNew  
295. StockAgingReport  
296. StockIN  
297. StockINList  
298. StockLedger  
299. StockOUT  
300. StockOUTList  
301. StockRe-OrderStatus  
302. StockStatement-1  
303. StockStatement-dd  
304. StockStatement-FromItemFile  
305. StockStatement  
306. StockStatement1  
307. StockValuationReport  
308. StockValuationSummaryReport  
309. SupplierAgeWiseSummary-Foreign-old  
310. SupplierAgeWiseSummary-Foreign  
311. SupplierAgeWiseSummary-Local-old  
312. SupplierAgeWiseSummary-Local  
313. SupplierAgeWiseSummary  
314. SupplierBillWisePending-Both  
315. SupplierBillWisePending-Foreign-old  
316. SupplierBillWisePending-Foreign  
317. SupplierBillWisePending-local  
318. SupplierBillWisePending  
319. SupplierList  
320. SupplierOutstandingSummary  
321. TechnicianEfficency  
322. test  
323. TotalSalesReport  
324. TrialBalance-test  
325. TrialBalance-test111  
326. TrialBalanceSummary  
327. UsedCars  
328. UserLogReport  
329. VehicleAttendanceList  
330. VoucherList  
331. VoucherListErrFind  
332. VoucherListNEW  
333. work_In_Progress  
334. xxx  
335. z  
336. Account Modification Log  
337. Edit Change Log Viewer  
338. Duplicate Record Removal Audit  
339. User Action Log Report

---

## Layer 6: SECURITY & STANDARDS

**Verification Checklist:**
1. **Route Protection:** All routes matching protected API endpoints reject unauthenticated requests with a proper JSON 401 error; all forbidden routes for underprivileged roles return 403, NOT generic 404.
2. **Input Handling:** All user/parameter input is both validated and sanitized (XSS, SQLi, shell inject proof); no raw request is passed to the DB or any system call.
3. **Logging:** No PII, password, token, or access credentials (DB_CONNECTION_STRING, DB_USER, DB_PASSWORD) appear in any log file, error message, or frontend source bundle. Logs for errors/audits scrub sensitive fields.
4. **Stored Procedure Security:** All calls to stored procedures use only parameterized inputs; never build queries by string concatenation—this must be true across all layers for all dynamic parameters.
5. **Config/Secrets Safety:** No database or auth credentials are ever checked into source control; .env files are .gitignored; accidental print/logging of connection strings is tested for and blocked in code/PR lint.
6. **RBAC Enforcement:** All privilege-checking requires both authentication (token/session) and authorization (role/group). Public, protected, and admin-only endpoints are strictly separated.
7. **Error Boundaries (Frontend):** All unhandled errors on the frontend display a user-friendly (and non-leaky) notification; no stack trace, stack, or sensitive content is ever shown to normal users.
8. **Session & Token Security:** Session tokens are signed, tamper-proof, kept out of URL query params, and subject to expiry/refresh (per `authentication.md`).
9. **Stored Procedure Outputs:** No stored procedure result is echoed to HTTP response without explicit shape mapping and filtering; any untrusted output (esp. rich text blobs) is encoded or sanitized before rendering to frontend/UI.
10. **API Response Envelope:** All API responses conform to the envelope pattern as specified (`data`, `meta`, `errors` arrays); no custom/freeform responses.
11. **No New Schema:** No table, view, or field was added, altered, or dropped in the database—this must be validated by git diff for DDL and by checking that only stored procs are called.
12. **End-to-End Penetration Testing:** Pen test simulates privilege escalation, SQLi, XSS, CSRF, SSRF, replay, and session stealing; any failure = automatic zero on this layer.

---

## Final Review SIGN-OFF

| Layer                     | Score  | Comment                                                      |
|---------------------------|--------|--------------------------------------------------------------|
| 1. DB CONNECTION          |  /10   |                                                              |
| 2. API                    |  /10   |                                                              |
| 3. BUSINESS LOGIC         |  /10   | Every PRD business rule must be a testable assertion.        |
| 4. ACCEPTANCE CRITERIA    |  /10   | Every Given/When/Then in the PRD must pass as an E2E test.   |
| 5. FRONTEND / UI          |  /10   | Every PRD screen must exist as a working, styled page/comp.  |
| 6. SECURITY & STANDARDS   |  /10   | No DB changes; all inputs and outputs fully safe and RBAC.    |
| **TOTAL**                 |  /60   |                                                              |


**NOTE:**  
A 10/10 score per layer is **mandatory** for production sign-off.  
Any failure in red rules above (especially security, direct SQL, business rules, or screen omissions) requires a complete inspection and resubmission.

---

**END OF AGENT REVIEW PROTOCOL**