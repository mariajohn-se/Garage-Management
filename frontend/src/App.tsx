import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppShell } from './layouts/AppShell';
import { SignInPage } from './pages/SignInPage';
import { OdbcSignInPage } from './pages/OdbcSignInPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ChangePasswordPage } from './pages/ChangePasswordPage';
import { UserLogReportPage } from './pages/UserLogReportPage';
import { HealthPage } from './pages/HealthPage';
import { HomePage } from './pages/HomePage';
import { UserListPage } from './pages/UserListPage';
import { UserFormPage } from './pages/UserFormPage';
import { RolesManagementPage } from './pages/RolesManagementPage';
import { LegacyUsersPage } from './pages/LegacyUsersPage';
import { UserInfoPage } from './pages/UserInfoPage';
import { AdminChangePasswordPage } from './pages/AdminChangePasswordPage';
import { EmployeeListPage } from './pages/EmployeeListPage';
import { ActionLogPage } from './pages/ActionLogPage';
import { CustomerListPage } from './pages/CustomerListPage';
import { CustomerFormPage } from './pages/CustomerFormPage';
import { CustomerHelpPage } from './pages/CustomerHelpPage';
import { CustomerAgewisePage } from './pages/CustomerAgewisePage';
import { CustomerVisitReportPage } from './pages/CustomerVisitReportPage';
import { BookingListPage } from './pages/BookingListPage';
import { BookingFormPage } from './pages/BookingFormPage';
import { SalesReturnListPage } from './pages/SalesReturnListPage';
import { SalesReturnFormPage } from './pages/SalesReturnFormPage';
import { CrDrNoteListPage } from './pages/CrDrNoteListPage';
import { CrDrNoteFormPage } from './pages/CrDrNoteFormPage';
import { InsuranceInvoiceListPage } from './pages/InsuranceInvoiceListPage';
import { InsuranceInvoiceFormPage } from './pages/InsuranceInvoiceFormPage';
import { MessagesPage } from './pages/MessagesPage';
import { SupplierListPage } from './pages/SupplierListPage';
import { SupplierFormPage } from './pages/SupplierFormPage';
import { SupplierHelpPage } from './pages/SupplierHelpPage';
import { VehicleListPage } from './pages/VehicleListPage';
import { VehicleFormPage } from './pages/VehicleFormPage';
import { AttachmentsPage } from './pages/AttachmentsPage';
import { RemarksReportPage } from './pages/RemarksReportPage';
import { EstimationListPage } from './pages/EstimationListPage';
import { EstimationDetailPage } from './pages/EstimationDetailPage';
import { EstimationFormPage } from './pages/EstimationFormPage';
import { JobListPage } from './pages/JobListPage';
import { WorkInProgressPage } from './pages/WorkInProgressPage';
import { AssignedJobsPage } from './pages/AssignedJobsPage';
import { JobStatusMasterPage } from './pages/JobStatusMasterPage';
import { OrderListPage } from './pages/OrderListPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { DeliveryNotesPage } from './pages/DeliveryNotesPage';
import { SalesInvoicesPage } from './pages/SalesInvoicesPage';
import { ProformasPage } from './pages/ProformasPage';
import { LocalPurchaseListPage } from './pages/LocalPurchaseListPage';
import { ForeignPurchaseListPage } from './pages/ForeignPurchaseListPage';
import { PurchaseDeliveryOrdersPage } from './pages/PurchaseDeliveryOrdersPage';
import { PendingPurchaseDOPage } from './pages/PendingPurchaseDOPage';
import { PurchaseDeliveryItemsPage } from './pages/PurchaseDeliveryItemsPage';
import { ProdRequestsPage } from './pages/ProdRequestsPage';
import { PurchaseReturnsPage } from './pages/PurchaseReturnsPage';
import { PurchaseVehicleLinkPage } from './pages/PurchaseVehicleLinkPage';
import { OrderFormPage } from './pages/OrderFormPage';
import { DeliveryNoteFormPage } from './pages/DeliveryNoteFormPage';
import { OrderHelpPage } from './pages/OrderHelpPage';
import { OrderCustomerChangePage } from './pages/OrderCustomerChangePage';
import { SalesBillReportPage } from './pages/SalesBillReportPage';
import { SalesMarginReportPage } from './pages/SalesMarginReportPage';
import { SalesLabourPartsReportPage } from './pages/SalesLabourPartsReportPage';
import { SalesAnalysisReportPage } from './pages/SalesAnalysisReportPage';
import { SalesSplitReportPage } from './pages/SalesSplitReportPage';
import { LocalPurchaseFormPage } from './pages/LocalPurchaseFormPage';
import { ForeignPurchaseFormPage } from './pages/ForeignPurchaseFormPage';
import { LPODetailsReportPage } from './pages/LPODetailsReportPage';
import { PurchaseDeliveryOrderDetailPage } from './pages/PurchaseDeliveryOrderDetailPage';
import { ItemListPage } from './pages/ItemListPage';
import { ItemDetailPage } from './pages/ItemDetailPage';
import { StockInPage } from './pages/StockInPage';
import { StockOutPage } from './pages/StockOutPage';
import { StockMovementFormPage } from './pages/StockMovementFormPage';
import { StockMovementsPage } from './pages/StockMovementsPage';
import { CurrentStockPage } from './pages/CurrentStockPage';
import { ReorderStatusPage } from './pages/ReorderStatusPage';
import { StockValuationReportPage } from './pages/StockValuationReportPage';
import { StockAgingReportPage } from './pages/StockAgingReportPage';
import { StockMovementFrequencyPage } from './pages/StockMovementFrequencyPage';
import { VoucherListPage } from './pages/VoucherListPage';
import { JournalVoucherFormPage } from './pages/JournalVoucherFormPage';
import { ReceiptPaymentFormPage } from './pages/ReceiptPaymentFormPage';
import { VoucherDetailPage } from './pages/VoucherDetailPage';
import { CashBankBookPage } from './pages/CashBankBookPage';
import { VoucherVerificationPage } from './pages/VoucherVerificationPage';
import { AccountFilterPage } from './pages/AccountFilterPage';
import { VoucherActionLogPage } from './pages/VoucherActionLogPage';
import { AccountHeadListPage } from './pages/AccountHeadListPage';
import { AccountHeadDetailPage } from './pages/AccountHeadDetailPage';
import { AccountHeadTreePage } from './pages/AccountHeadTreePage';
import { TrialBalanceReportPage } from './pages/TrialBalanceReportPage';
import { BalanceSheetReportPage } from './pages/BalanceSheetReportPage';
import { OpeningBalanceLookupPage } from './pages/OpeningBalanceLookupPage';
import { BulkJournalsPage } from './pages/BulkJournalsPage';
import { BulkPdcReceiptsPage } from './pages/BulkPdcReceiptsPage';
import { BulkPdcsPage } from './pages/BulkPdcsPage';
import { ReceiptsListPage } from './pages/ReceiptsListPage';
import { PaymentsListPage } from './pages/PaymentsListPage';
import { BillAllocationsPage } from './pages/BillAllocationsPage';
import { DiscountHistoryPage } from './pages/DiscountHistoryPage';
import { CustomerOutstandingBySalespersonPage } from './pages/CustomerOutstandingBySalespersonPage';
import { SupplierOutstandingSummaryPage } from './pages/SupplierOutstandingSummaryPage';
import { CompanyHeaderPage } from './pages/CompanyHeaderPage';
import { MainMenuPage } from './pages/MainMenuPage';

const ADMIN_ONLY = ['Administrator'] as const;
const SUPERVISOR_UP = ['Supervisor', 'Administrator'] as const;

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/odbc-sign-in" element={<OdbcSignInPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route path="/home" element={<HomePage />} />
            <Route path="/change-password" element={<ChangePasswordPage />} />
            <Route path="/health" element={<HealthPage />} />
            <Route path="/user-info" element={<UserInfoPage />} />

            <Route
              path="/admin/user-logs"
              element={
                <ProtectedRoute roles={[...SUPERVISOR_UP]}>
                  <UserLogReportPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/action-logs"
              element={
                <ProtectedRoute roles={[...SUPERVISOR_UP]}>
                  <ActionLogPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute roles={[...SUPERVISOR_UP]}>
                  <UserListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users/new"
              element={
                <ProtectedRoute roles={[...ADMIN_ONLY]}>
                  <UserFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users/:userId"
              element={
                <ProtectedRoute roles={[...SUPERVISOR_UP]}>
                  <UserFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users/:userId/change-password"
              element={
                <ProtectedRoute roles={[...ADMIN_ONLY]}>
                  <AdminChangePasswordPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/roles"
              element={
                <ProtectedRoute roles={[...SUPERVISOR_UP]}>
                  <RolesManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/legacy-users"
              element={
                <ProtectedRoute roles={[...ADMIN_ONLY]}>
                  <LegacyUsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/employees"
              element={
                <ProtectedRoute roles={[...SUPERVISOR_UP]}>
                  <EmployeeListPage />
                </ProtectedRoute>
              }
            />

            <Route path="/customers" element={<CustomerListPage />} />
            <Route path="/customers/help" element={<CustomerHelpPage />} />
            <Route
              path="/customers/agewise"
              element={
                <ProtectedRoute roles={[...SUPERVISOR_UP]}>
                  <CustomerAgewisePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customers/visit-summary"
              element={
                <ProtectedRoute roles={[...SUPERVISOR_UP]}>
                  <CustomerVisitReportPage />
                </ProtectedRoute>
              }
            />
            <Route path="/customers/new" element={<CustomerFormPage />} />
            <Route path="/customers/:custId/edit" element={<CustomerFormPage />} />

            <Route path="/suppliers" element={<SupplierListPage />} />
            <Route path="/suppliers/help" element={<SupplierHelpPage />} />
            <Route path="/suppliers/new" element={<SupplierFormPage />} />
            <Route path="/suppliers/:suppId/edit" element={<SupplierFormPage />} />

            <Route path="/vehicles" element={<VehicleListPage />} />
            <Route path="/vehicles/new" element={<VehicleFormPage />} />
            <Route path="/vehicles/:vehId/edit" element={<VehicleFormPage />} />

            <Route path="/attachments" element={<AttachmentsPage />} />
            <Route
              path="/documents/remarks-report"
              element={
                <ProtectedRoute roles={[...SUPERVISOR_UP]}>
                  <RemarksReportPage />
                </ProtectedRoute>
              }
            />

            <Route path="/estimations" element={<EstimationListPage />} />
            <Route path="/estimations/new" element={<EstimationFormPage />} />
            <Route path="/estimations/:estimationId" element={<EstimationDetailPage />} />
            <Route path="/estimations/:estimationId/edit" element={<EstimationFormPage />} />
            <Route path="/bookings" element={<BookingListPage />} />
            <Route path="/bookings/new" element={<BookingFormPage />} />
            <Route path="/jobs" element={<JobListPage />} />
            <Route path="/jobs/work-status" element={<WorkInProgressPage />} />
            <Route path="/jobs/assigned-jobs" element={<AssignedJobsPage />} />
            <Route
              path="/jobs/status-master"
              element={
                <ProtectedRoute roles={['Administrator']}>
                  <JobStatusMasterPage />
                </ProtectedRoute>
              }
            />

            <Route path="/orders" element={<OrderListPage />} />
            <Route path="/orders/help" element={<OrderHelpPage />} />
            <Route path="/orders/new" element={<OrderFormPage />} />
            <Route path="/orders/:orderId" element={<OrderDetailPage />} />
            <Route path="/orders/:orderId/edit" element={<OrderFormPage />} />
            <Route
              path="/orders/:orderId/change-customer"
              element={
                <ProtectedRoute roles={[...SUPERVISOR_UP]}>
                  <OrderCustomerChangePage />
                </ProtectedRoute>
              }
            />
            <Route path="/delivery-notes" element={<DeliveryNotesPage />} />
            <Route path="/delivery-notes/new" element={<DeliveryNoteFormPage />} />
            <Route path="/sales" element={<SalesInvoicesPage />} />
            <Route path="/proformas" element={<ProformasPage />} />
            <Route
              path="/reports/sales-bill"
              element={
                <ProtectedRoute roles={[...SUPERVISOR_UP]}>
                  <SalesBillReportPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports/sales-margins"
              element={
                <ProtectedRoute roles={[...SUPERVISOR_UP]}>
                  <SalesMarginReportPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports/sales-analysis"
              element={
                <ProtectedRoute roles={[...SUPERVISOR_UP]}>
                  <SalesAnalysisReportPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports/sales-split"
              element={
                <ProtectedRoute roles={[...SUPERVISOR_UP]}>
                  <SalesSplitReportPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports/sales-labour-parts"
              element={
                <ProtectedRoute roles={[...SUPERVISOR_UP]}>
                  <SalesLabourPartsReportPage />
                </ProtectedRoute>
              }
            />
            <Route path="/sales-returns" element={<SalesReturnListPage />} />
            <Route path="/sales-returns/new" element={<SalesReturnFormPage />} />
            <Route path="/insurance-invoices" element={<InsuranceInvoiceListPage />} />
            <Route path="/insurance-invoices/new" element={<InsuranceInvoiceFormPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route
              path="/cr-dr-notes"
              element={
                <ProtectedRoute roles={[...SUPERVISOR_UP]}>
                  <CrDrNoteListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cr-dr-notes/new"
              element={
                <ProtectedRoute roles={[...SUPERVISOR_UP]}>
                  <CrDrNoteFormPage />
                </ProtectedRoute>
              }
            />

            <Route path="/purchases/local" element={<LocalPurchaseListPage />} />
            <Route path="/purchases/local/new" element={<LocalPurchaseFormPage />} />
            <Route path="/purchases/local/:purchaseOrderId/edit" element={<LocalPurchaseFormPage />} />
            <Route path="/purchases/foreign" element={<ForeignPurchaseListPage />} />
            <Route path="/purchases/foreign/new" element={<ForeignPurchaseFormPage />} />
            <Route path="/purchases/foreign/:purchaseOrderId/edit" element={<ForeignPurchaseFormPage />} />
            <Route path="/purchases/delivery-orders" element={<PurchaseDeliveryOrdersPage />} />
            <Route path="/purchases/delivery-orders/pending" element={<PendingPurchaseDOPage />} />
            <Route path="/purchases/delivery-orders/:deliveryOrderNo" element={<PurchaseDeliveryOrderDetailPage />} />
            <Route path="/purchases/delivery-items" element={<PurchaseDeliveryItemsPage />} />
            <Route path="/purchase/product-requests" element={<ProdRequestsPage />} />
            <Route path="/purchases/return-register" element={<PurchaseReturnsPage />} />
            <Route
              path="/purchases/vehicle-link"
              element={
                <ProtectedRoute roles={[...SUPERVISOR_UP]}>
                  <PurchaseVehicleLinkPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/purchase/lpo-details"
              element={
                <ProtectedRoute roles={[...SUPERVISOR_UP]}>
                  <LPODetailsReportPage />
                </ProtectedRoute>
              }
            />

            <Route path="/inventory/items" element={<ItemListPage />} />
            <Route path="/inventory/items/:itemCode" element={<ItemDetailPage />} />
            <Route path="/inventory/stock-in" element={<StockInPage />} />
            <Route path="/inventory/stock-in/new" element={<StockMovementFormPage kind="in" />} />
            <Route path="/inventory/stock-out" element={<StockOutPage />} />
            <Route path="/inventory/stock-out/new" element={<StockMovementFormPage kind="out" />} />
            <Route path="/inventory/movements" element={<StockMovementsPage />} />
            <Route path="/inventory/current-stock" element={<CurrentStockPage />} />
            <Route path="/inventory/reorder-status" element={<ReorderStatusPage />} />
            <Route
              path="/inventory/valuation"
              element={
                <ProtectedRoute roles={[...SUPERVISOR_UP]}>
                  <StockValuationReportPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory/aging"
              element={
                <ProtectedRoute roles={[...SUPERVISOR_UP]}>
                  <StockAgingReportPage />
                </ProtectedRoute>
              }
            />
            <Route path="/inventory/movement-frequency" element={<StockMovementFrequencyPage />} />

            <Route path="/banking/vouchers" element={<VoucherListPage />} />
            <Route path="/banking/vouchers/:id" element={<VoucherDetailPage />} />
            <Route
              path="/ledger/journal-vouchers/new"
              element={
                <ProtectedRoute roles={[...SUPERVISOR_UP]}>
                  <JournalVoucherFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/banking/vouchers/new/:type"
              element={
                <ProtectedRoute roles={[...SUPERVISOR_UP]}>
                  <ReceiptPaymentFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/banking/cash-bank-book"
              element={
                <ProtectedRoute roles={[...SUPERVISOR_UP]}>
                  <CashBankBookPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/banking/verification"
              element={
                <ProtectedRoute roles={[...SUPERVISOR_UP]}>
                  <VoucherVerificationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/banking/account-filter"
              element={
                <ProtectedRoute roles={[...SUPERVISOR_UP]}>
                  <AccountFilterPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/banking/action-log"
              element={
                <ProtectedRoute roles={[...SUPERVISOR_UP]}>
                  <VoucherActionLogPage />
                </ProtectedRoute>
              }
            />

            <Route path="/ledger/account-heads" element={<AccountHeadListPage />} />
            <Route path="/ledger/account-heads/tree" element={<AccountHeadTreePage />} />
            <Route path="/ledger/account-heads/:codes" element={<AccountHeadDetailPage />} />
            <Route
              path="/ledger/trial-balance"
              element={
                <ProtectedRoute roles={[...SUPERVISOR_UP]}>
                  <TrialBalanceReportPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ledger/balance-sheet"
              element={
                <ProtectedRoute roles={[...SUPERVISOR_UP]}>
                  <BalanceSheetReportPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ledger/opening-balance"
              element={
                <ProtectedRoute roles={[...SUPERVISOR_UP]}>
                  <OpeningBalanceLookupPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ledger/bulk-journals"
              element={
                <ProtectedRoute roles={[...SUPERVISOR_UP]}>
                  <BulkJournalsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ledger/bulk-pdc-receipts"
              element={
                <ProtectedRoute roles={[...SUPERVISOR_UP]}>
                  <BulkPdcReceiptsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ledger/bulk-pdcs"
              element={
                <ProtectedRoute roles={[...SUPERVISOR_UP]}>
                  <BulkPdcsPage />
                </ProtectedRoute>
              }
            />

            <Route path="/receipts" element={<ReceiptsListPage />} />
            <Route path="/payments" element={<PaymentsListPage />} />
            <Route path="/receipts/allocations/:bill" element={<BillAllocationsPage />} />
            <Route
              path="/reports/discount-history"
              element={
                <ProtectedRoute roles={[...SUPERVISOR_UP]}>
                  <DiscountHistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports/customer-outstanding-salesperson"
              element={
                <ProtectedRoute roles={[...SUPERVISOR_UP]}>
                  <CustomerOutstandingBySalespersonPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports/supplier-outstanding-summary"
              element={
                <ProtectedRoute roles={[...SUPERVISOR_UP]}>
                  <SupplierOutstandingSummaryPage />
                </ProtectedRoute>
              }
            />

            <Route path="/admin/company-report-header" element={<CompanyHeaderPage />} />
            <Route path="/menu" element={<MainMenuPage />} />
          </Route>

          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
