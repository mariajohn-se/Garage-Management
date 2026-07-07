import { Router } from 'express';
import { authController } from './AuthController';
import { healthController } from './HealthController';
import { userController } from './UserController';
import { customerController } from './CustomerController';
import { supplierController } from './SupplierController';
import { vehicleController } from './VehicleController';
import { attachmentController, uploadMiddleware } from './AttachmentController';
import { remarksController } from './RemarksController';
import { estimationController } from './EstimationController';
import { jobController } from './JobController';
import { jobStatusMasterController } from './JobStatusMasterController';
import { orderController } from './OrderController';
import { salesController } from './SalesController';
import { purchaseController } from './PurchaseController';
import { itemController } from './ItemController';
import { inventoryController } from './InventoryController';
import { bankingController } from './BankingController';
import { ledgerController } from './LedgerController';
import { receiptsPaymentsController } from './ReceiptsPaymentsController';
import { reportingController } from './ReportingController';
import { requireAuth, requireRole } from '../auth/middleware';

export const apiRouter = Router();

apiRouter.get('/health', healthController.check.bind(healthController));

apiRouter.post('/auth/login', authController.login.bind(authController));
apiRouter.post('/auth/logout', requireAuth, authController.logout.bind(authController));
apiRouter.post('/auth/refresh', authController.refresh.bind(authController));
apiRouter.post('/auth/password-reset-request', authController.passwordResetRequest.bind(authController));
apiRouter.post('/auth/reset-password', authController.resetPassword.bind(authController));
apiRouter.put('/auth/change-password', requireAuth, authController.changePassword.bind(authController));
apiRouter.post(
  '/auth/unlock-account',
  requireAuth,
  requireRole('Administrator'),
  authController.unlockAccount.bind(authController)
);
apiRouter.get(
  '/auth/user-log',
  requireAuth,
  requireRole('Supervisor', 'Administrator'),
  authController.userLog.bind(authController)
);
apiRouter.get('/auth/session', requireAuth, authController.session.bind(authController));
apiRouter.post('/auth/odbc-test-connection', authController.odbcTestConnection.bind(authController));
apiRouter.post('/auth/odbc-login', authController.odbcLogin.bind(authController));

// --- Phase 2: User & Role Management ---
const adminOnly = [requireAuth, requireRole('Administrator')];
const supervisorUp = [requireAuth, requireRole('Supervisor', 'Administrator')];

apiRouter.get('/users', ...supervisorUp, userController.list.bind(userController));
apiRouter.post('/users', ...adminOnly, userController.create.bind(userController));
apiRouter.put('/users/:id', ...adminOnly, userController.update.bind(userController));
apiRouter.delete('/users/:id', ...adminOnly, userController.remove.bind(userController));
apiRouter.put('/users/:id/activate', ...adminOnly, userController.activate.bind(userController));
apiRouter.put('/users/bulk-activate', ...adminOnly, userController.bulkActivate.bind(userController));
apiRouter.put('/users/:id/roles', ...adminOnly, userController.setRoles.bind(userController));
apiRouter.put('/users/:id/reset-password', ...adminOnly, userController.resetPassword.bind(userController));
apiRouter.get('/users/:id/permissions', ...supervisorUp, userController.getMenuPermissions.bind(userController));
apiRouter.put('/users/:id/permissions', ...adminOnly, userController.setMenuPermission.bind(userController));
apiRouter.post('/users/import', ...adminOnly, userController.importUsers.bind(userController));
apiRouter.get('/users/export', ...supervisorUp, userController.exportUsers.bind(userController));

apiRouter.get('/employees', ...supervisorUp, userController.employees.bind(userController));
apiRouter.get('/legacy-users', ...adminOnly, userController.legacyUsers.bind(userController));
apiRouter.get('/action-logs', ...supervisorUp, userController.actionLog.bind(userController));

// --- Phase 3: Customers, Suppliers, Contacts, Vehicles ---
// Literal sub-paths (help/agewise/export) must be registered before the generic
// /:custId /:suppId param routes, or Express would match e.g. "help" as an id.
apiRouter.get('/customers', requireAuth, customerController.list.bind(customerController));
apiRouter.get('/customers/help', requireAuth, customerController.help.bind(customerController));
apiRouter.get('/customers/agewise', ...supervisorUp, customerController.agewise.bind(customerController));
apiRouter.get('/customers/export', ...supervisorUp, customerController.exportCsv.bind(customerController));
apiRouter.post('/customers', requireAuth, customerController.create.bind(customerController));
apiRouter.get('/customers/:custId', requireAuth, customerController.get.bind(customerController));
apiRouter.put('/customers/:custId', requireAuth, customerController.update.bind(customerController));
apiRouter.delete('/customers/:custId', ...adminOnly, customerController.remove.bind(customerController));

apiRouter.get('/suppliers', requireAuth, supplierController.list.bind(supplierController));
apiRouter.get('/suppliers/help', requireAuth, supplierController.help.bind(supplierController));
apiRouter.get('/suppliers/export', ...supervisorUp, supplierController.exportCsv.bind(supplierController));
apiRouter.post('/suppliers', requireAuth, supplierController.create.bind(supplierController));
apiRouter.get('/suppliers/:suppId', requireAuth, supplierController.get.bind(supplierController));
apiRouter.put('/suppliers/:suppId', requireAuth, supplierController.update.bind(supplierController));
apiRouter.delete('/suppliers/:suppId', ...adminOnly, supplierController.remove.bind(supplierController));

apiRouter.get('/vehicles', requireAuth, vehicleController.list.bind(vehicleController));
apiRouter.post('/vehicles', requireAuth, vehicleController.create.bind(vehicleController));
apiRouter.get('/vehicles/:id', requireAuth, vehicleController.get.bind(vehicleController));
apiRouter.put('/vehicles/:id', requireAuth, vehicleController.update.bind(vehicleController));
apiRouter.delete('/vehicles/:id', ...adminOnly, vehicleController.remove.bind(vehicleController));

// --- Phase 4: Document & Attachment Management ---
// Of the ~16 modules IMPLEMENTATION_PHASE4_v12.md lists, only AttachmentMaster and
// AdditionalRemarks have any real backing table (verified live) - Document01/DocHead/
// DocumentAuditLog don't exist, so there are no Documents/DocHead/DMS/Audit-Trail routes.
apiRouter.get('/attachments', requireAuth, attachmentController.list.bind(attachmentController));
apiRouter.post('/attachments', requireAuth, uploadMiddleware, attachmentController.upload.bind(attachmentController));
apiRouter.get('/attachments/:id', requireAuth, attachmentController.get.bind(attachmentController));
apiRouter.get('/attachments/:id/download', requireAuth, attachmentController.download.bind(attachmentController));
apiRouter.put('/attachments/:id', requireAuth, attachmentController.update.bind(attachmentController));
apiRouter.delete('/attachments/:id', ...supervisorUp, attachmentController.remove.bind(attachmentController));

apiRouter.get('/remarks/report', ...supervisorUp, remarksController.report.bind(remarksController));
apiRouter.get('/remarks', requireAuth, remarksController.list.bind(remarksController));
apiRouter.post('/remarks', requireAuth, remarksController.create.bind(remarksController));
apiRouter.put('/remarks/:id', requireAuth, remarksController.update.bind(remarksController));
apiRouter.delete('/remarks/:id', ...supervisorUp, remarksController.remove.bind(remarksController));

// --- Phase 5: Jobs, Work Orders & Estimation ---
apiRouter.get('/estimations', requireAuth, estimationController.list.bind(estimationController));
apiRouter.get('/estimations/:id', requireAuth, estimationController.get.bind(estimationController));
apiRouter.put('/estimations/:id/approve', ...supervisorUp, estimationController.approve.bind(estimationController));

apiRouter.get('/jobs/work-in-progress', requireAuth, jobController.listWorkInProgress.bind(jobController));
apiRouter.get('/jobs/assigned', requireAuth, jobController.listAssigned.bind(jobController));
apiRouter.post('/jobs/assign', requireAuth, jobController.assign.bind(jobController));
apiRouter.get('/jobs/status-master', requireAuth, jobStatusMasterController.list.bind(jobStatusMasterController));
apiRouter.post('/jobs/status-master', ...adminOnly, jobStatusMasterController.create.bind(jobStatusMasterController));
apiRouter.put(
  '/jobs/status-master/:id',
  ...adminOnly,
  jobStatusMasterController.update.bind(jobStatusMasterController)
);
apiRouter.delete(
  '/jobs/status-master/:id',
  ...adminOnly,
  jobStatusMasterController.remove.bind(jobStatusMasterController)
);
apiRouter.get('/jobs', requireAuth, jobController.list.bind(jobController));
apiRouter.get('/jobs/:id', requireAuth, jobController.get.bind(jobController));
apiRouter.put('/jobs/:id/status', requireAuth, jobController.updateStatus.bind(jobController));

// --- Phase 6: Order & Sales Management ---
// SalesReturn tables don't exist in the schema (verified) - no sales-return routes.
// PendingOrder view exists but throws a live binding error - no pending-orders route.
apiRouter.get('/orders/deliveries', requireAuth, orderController.deliveries.bind(orderController));
apiRouter.get('/orders/help', requireAuth, orderController.help.bind(orderController));
apiRouter.get('/orders', requireAuth, orderController.list.bind(orderController));
apiRouter.post('/orders', requireAuth, orderController.create.bind(orderController));
apiRouter.get('/orders/:id', requireAuth, orderController.get.bind(orderController));
apiRouter.put('/orders/:id', requireAuth, orderController.update.bind(orderController));
apiRouter.put('/orders/:id/customer', ...supervisorUp, orderController.changeCustomer.bind(orderController));
apiRouter.put('/orders/:id/status', ...supervisorUp, orderController.updateStatus.bind(orderController));
apiRouter.delete('/orders/:id', ...supervisorUp, orderController.remove.bind(orderController));

apiRouter.get('/delivery-notes', requireAuth, salesController.deliveryNotes.bind(salesController));
apiRouter.post('/delivery-notes', requireAuth, salesController.createDeliveryNote.bind(salesController));
apiRouter.put('/delivery-notes/:id', requireAuth, salesController.updateDeliveryNote.bind(salesController));
apiRouter.get('/sales', requireAuth, salesController.invoices.bind(salesController));
apiRouter.get('/proformas', requireAuth, salesController.proformas.bind(salesController));
apiRouter.get('/reports/sales-bill', ...supervisorUp, salesController.salesBillReport.bind(salesController));
apiRouter.get('/reports/sales-margins', ...supervisorUp, salesController.salesMarginDetails.bind(salesController));

apiRouter.get('/items/help', requireAuth, itemController.help.bind(itemController));

// --- Phase 7: Purchase & Procurement Management ---
// PendingPurchaseDO is a real stored procedure (verified live), not a table/view.
// PurchaseReturn01Sql does not exist - Preturn01 (base table, no resolved view) is used
// instead, per STANDARDS.md's "no view exists" allowance.
// Literal sub-paths must be registered before /purchases/:id, or Express would match them
// as an id.
apiRouter.get('/foreign-purchases', requireAuth, purchaseController.listForeignPurchases.bind(purchaseController));
apiRouter.post('/foreign-purchases', requireAuth, purchaseController.createForeignPurchase.bind(purchaseController));
apiRouter.get('/foreign-purchases/:id', requireAuth, purchaseController.getForeignPurchase.bind(purchaseController));
apiRouter.put('/foreign-purchases/:id', requireAuth, purchaseController.updateForeignPurchase.bind(purchaseController));

apiRouter.get(
  '/purchases/delivery-orders/pending',
  requireAuth,
  purchaseController.listPendingDeliveryOrders.bind(purchaseController)
);
apiRouter.get(
  '/purchases/delivery-orders',
  requireAuth,
  purchaseController.listDeliveryOrders.bind(purchaseController)
);
apiRouter.get(
  '/purchases/delivery-orders/:id',
  requireAuth,
  purchaseController.getDeliveryOrder.bind(purchaseController)
);
apiRouter.get('/purchases/delivery-items', requireAuth, purchaseController.listDeliveryItems.bind(purchaseController));
apiRouter.get('/purchases/returns', requireAuth, purchaseController.listReturns.bind(purchaseController));
apiRouter.get('/purchases/vehicle-link', requireAuth, purchaseController.listVehicleLinks.bind(purchaseController));
apiRouter.post('/purchases/vehicle-link', requireAuth, purchaseController.createVehicleLink.bind(purchaseController));
apiRouter.delete(
  '/purchases/vehicle-link/:id',
  ...supervisorUp,
  purchaseController.deleteVehicleLink.bind(purchaseController)
);

apiRouter.get('/prodrequest', requireAuth, purchaseController.listProdRequests.bind(purchaseController));
apiRouter.post('/prodrequest', requireAuth, purchaseController.createProdRequest.bind(purchaseController));
apiRouter.delete('/prodrequest/:id', ...supervisorUp, purchaseController.deleteProdRequest.bind(purchaseController));

apiRouter.get('/reports/lpo-details', ...supervisorUp, purchaseController.lpoDetailsReport.bind(purchaseController));

apiRouter.get('/purchases', requireAuth, purchaseController.listLocalPurchases.bind(purchaseController));
apiRouter.post('/purchases', requireAuth, purchaseController.createLocalPurchase.bind(purchaseController));
apiRouter.get('/purchases/:id', requireAuth, purchaseController.getLocalPurchase.bind(purchaseController));
apiRouter.put('/purchases/:id', requireAuth, purchaseController.updateLocalPurchase.bind(purchaseController));
apiRouter.delete('/purchases/:id', ...supervisorUp, purchaseController.deleteLocalPurchase.bind(purchaseController));

// --- Phase 8: Stock & Inventory Management ---
// Literal sub-paths (current-stock, valuation, aging, reorder-status, stock-in, stock-out,
// transactions) must be registered before /items/:itemCode, or Express would match them as
// an item code.
apiRouter.get('/inventory/current-stock', requireAuth, inventoryController.currentStock.bind(inventoryController));
apiRouter.get('/inventory/valuation', ...supervisorUp, inventoryController.stockValuation.bind(inventoryController));
apiRouter.get('/inventory/aging', ...supervisorUp, inventoryController.stockAging.bind(inventoryController));
apiRouter.get('/inventory/reorder-status', requireAuth, inventoryController.reorderStatus.bind(inventoryController));
apiRouter.get('/inventory/stock-in', requireAuth, inventoryController.listStockIn.bind(inventoryController));
apiRouter.get('/inventory/stock-out', requireAuth, inventoryController.listStockOut.bind(inventoryController));
apiRouter.get('/inventory/transactions', requireAuth, inventoryController.listTransactions.bind(inventoryController));

apiRouter.get('/items', requireAuth, inventoryController.listItems.bind(inventoryController));
apiRouter.get('/items/:itemCode', requireAuth, inventoryController.getItem.bind(inventoryController));
apiRouter.put('/items/:itemCode', ...supervisorUp, inventoryController.updateItem.bind(inventoryController));

// --- Phase 9: Banking & Reconciliation ---
// Literal sub-paths (accounts, cash-bank-details, verification) registered before
// /vouchers/:id, same convention as every prior phase.
apiRouter.get('/banking/accounts', requireAuth, bankingController.listBankAccounts.bind(bankingController));
apiRouter.get('/banking/cash-bank-details', ...supervisorUp, bankingController.cashBankDetails.bind(bankingController));
apiRouter.get('/banking/verification', ...supervisorUp, bankingController.listVerification.bind(bankingController));
apiRouter.put('/banking/verification/:vsrl', ...supervisorUp, bankingController.markVerified.bind(bankingController));
apiRouter.get(
  '/banking/account-filter',
  ...supervisorUp,
  bankingController.filterAccountEntries.bind(bankingController)
);
apiRouter.get('/banking/action-log', ...supervisorUp, bankingController.voucherActionLog.bind(bankingController));

apiRouter.get('/vouchers', requireAuth, bankingController.listVouchers.bind(bankingController));
apiRouter.get('/vouchers/:id', requireAuth, bankingController.getVoucher.bind(bankingController));

// --- Phase 10: Ledger & Account Management, Vouchers & Bulk Journals ---
// Literal sub-paths (tree, trial-balance, bulk-*) registered before /ledger/account-heads/:codes.
apiRouter.get('/ledger/account-heads/tree', requireAuth, ledgerController.accountHeadTree.bind(ledgerController));
apiRouter.get('/ledger/trial-balance', ...supervisorUp, ledgerController.trialBalance.bind(ledgerController));
apiRouter.get('/ledger/bulk-journals', ...supervisorUp, ledgerController.listBulkJournals.bind(ledgerController));
apiRouter.get(
  '/ledger/bulk-pdc-receipts',
  ...supervisorUp,
  ledgerController.listBulkPdcReceipts.bind(ledgerController)
);
apiRouter.get('/ledger/bulk-pdcs', ...supervisorUp, ledgerController.listBulkPdcs.bind(ledgerController));

apiRouter.get('/ledger/account-heads', requireAuth, ledgerController.listAccountHeads.bind(ledgerController));
apiRouter.post('/ledger/account-heads', ...adminOnly, ledgerController.createAccountHead.bind(ledgerController));
apiRouter.get('/ledger/account-heads/:codes', requireAuth, ledgerController.getAccountHead.bind(ledgerController));
apiRouter.put('/ledger/account-heads/:codes', ...adminOnly, ledgerController.updateAccountHead.bind(ledgerController));

// --- Phase 11: Receipts & Payments Processing ---
apiRouter.get('/receipts', requireAuth, receiptsPaymentsController.listReceipts.bind(receiptsPaymentsController));
apiRouter.get('/payments', requireAuth, receiptsPaymentsController.listPayments.bind(receiptsPaymentsController));
apiRouter.get(
  '/receipts/allocations/:bill',
  requireAuth,
  receiptsPaymentsController.getBillAllocations.bind(receiptsPaymentsController)
);
apiRouter.get(
  '/reports/discount-history',
  ...supervisorUp,
  receiptsPaymentsController.discountHistory.bind(receiptsPaymentsController)
);

// --- Phase 12: Reporting, Audit Logging & Analytics ---
apiRouter.get('/admin/company-header', requireAuth, reportingController.getCompanyHeader.bind(reportingController));
apiRouter.put('/admin/company-header', ...adminOnly, reportingController.updateCompanyHeader.bind(reportingController));
apiRouter.get('/schema/menu', requireAuth, reportingController.listMenu.bind(reportingController));
