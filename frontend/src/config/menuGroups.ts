export interface MenuLink {
  label: string;
  to: string;
  requires?: 'privileged' | 'admin';
}

export interface MenuGroup {
  title: string;
  icon: string;
  links: MenuLink[];
}

export const MENU_GROUPS: MenuGroup[] = [
  {
    title: 'Customers & Suppliers',
    icon: '\u{1F91D}',
    links: [
      { label: 'Customers', to: '/customers' },
      { label: 'Customer Lookup', to: '/customers/help' },
      { label: 'Customer Agewise Report', to: '/customers/agewise', requires: 'privileged' },
      { label: 'Customer Visit Report', to: '/customers/visit-summary', requires: 'privileged' },
      { label: 'Suppliers', to: '/suppliers' },
      { label: 'Supplier Lookup', to: '/suppliers/help' },
      { label: 'Vehicles', to: '/vehicles' }
    ]
  },
  {
    title: 'Documents',
    icon: '\u{1F4CE}',
    links: [
      { label: 'Attachments', to: '/attachments' },
      { label: 'Remarks Report', to: '/documents/remarks-report', requires: 'privileged' }
    ]
  },
  {
    title: 'Jobs & Estimation',
    icon: '\u{1F527}',
    links: [
      { label: 'Estimations', to: '/estimations' },
      { label: 'Jobs / Work Orders', to: '/jobs' },
      { label: 'Work In Progress', to: '/jobs/work-status' },
      { label: 'Assigned Jobs', to: '/jobs/assigned-jobs' },
      { label: 'Job Status Master', to: '/jobs/status-master', requires: 'admin' }
    ]
  },
  {
    title: 'Sales & Orders',
    icon: '\u{1F4B0}',
    links: [
      { label: 'Sales Orders', to: '/orders' },
      { label: 'Order Lookup', to: '/orders/help' },
      { label: 'Delivery Notes', to: '/delivery-notes' },
      { label: 'Sales Invoices', to: '/sales' },
      { label: 'Proformas', to: '/proformas' },
      { label: 'Sales Bill Report', to: '/reports/sales-bill', requires: 'privileged' },
      { label: 'Sales Margin Details', to: '/reports/sales-margins', requires: 'privileged' },
      { label: 'Sales Analysis', to: '/reports/sales-analysis', requires: 'privileged' },
      { label: 'Sales Report - Section Wise', to: '/reports/sales-split', requires: 'privileged' },
      { label: 'Sales Labour & Parts Report', to: '/reports/sales-labour-parts', requires: 'privileged' }
    ]
  },
  {
    title: 'Purchasing',
    icon: '\u{1F4E6}',
    links: [
      { label: 'Local Purchase Orders', to: '/purchases/local' },
      { label: 'Foreign Purchase Orders', to: '/purchases/foreign' },
      { label: 'Purchase Delivery Orders', to: '/purchases/delivery-orders' },
      { label: 'Pending Delivery Orders', to: '/purchases/delivery-orders/pending' },
      { label: 'Purchase Item Register', to: '/purchases/delivery-items' },
      { label: 'Product Requests', to: '/purchase/product-requests' },
      { label: 'Purchase Returns', to: '/purchases/return-register' },
      { label: 'Purchase Vehicle Link', to: '/purchases/vehicle-link', requires: 'privileged' },
      { label: 'LPO Details Report', to: '/purchase/lpo-details', requires: 'privileged' }
    ]
  },
  {
    title: 'Stock & Inventory',
    icon: '\u{1F4CB}',
    links: [
      { label: 'Items', to: '/inventory/items' },
      { label: 'Stock In', to: '/inventory/stock-in' },
      { label: 'Stock Out', to: '/inventory/stock-out' },
      { label: 'Stock Movements', to: '/inventory/movements' },
      { label: 'Current Stock / Availability', to: '/inventory/current-stock' },
      { label: 'Reorder Status', to: '/inventory/reorder-status' },
      { label: 'Stock Valuation Report', to: '/inventory/valuation', requires: 'privileged' },
      { label: 'Stock Aging Report', to: '/inventory/aging', requires: 'privileged' },
      { label: 'Fast / Slow-Moving Items', to: '/inventory/movement-frequency' }
    ]
  },
  {
    title: 'Banking',
    icon: '\u{1F3E6}',
    links: [
      { label: 'Vouchers', to: '/banking/vouchers' },
      { label: 'Cash / Bank Book', to: '/banking/cash-bank-book', requires: 'privileged' },
      { label: 'Voucher Verification', to: '/banking/verification', requires: 'privileged' },
      { label: 'Account / Voucher Filter', to: '/banking/account-filter', requires: 'privileged' },
      { label: 'Voucher Action Log', to: '/banking/action-log', requires: 'privileged' }
    ]
  },
  {
    title: 'Ledger & Accounts',
    icon: '\u{1F4D2}',
    links: [
      { label: 'Account Heads', to: '/ledger/account-heads' },
      { label: 'Account Head Tree', to: '/ledger/account-heads/tree' },
      { label: 'Trial Balance', to: '/ledger/trial-balance', requires: 'privileged' },
      { label: 'Balance Sheet', to: '/ledger/balance-sheet', requires: 'privileged' },
      { label: 'Opening Balance', to: '/ledger/opening-balance', requires: 'privileged' },
      { label: 'Bulk Journal Entries', to: '/ledger/bulk-journals', requires: 'privileged' },
      { label: 'Bulk PDC Receipts', to: '/ledger/bulk-pdc-receipts', requires: 'privileged' },
      { label: 'Bulk PDCs', to: '/ledger/bulk-pdcs', requires: 'privileged' }
    ]
  },
  {
    title: 'Receipts & Payments',
    icon: '\u{1F9FE}',
    links: [
      { label: 'Receipts', to: '/receipts' },
      { label: 'Payments', to: '/payments' },
      { label: 'Discount History Audit', to: '/reports/discount-history', requires: 'privileged' },
      { label: 'Customer Outstanding by Salesperson', to: '/reports/customer-outstanding-salesperson', requires: 'privileged' },
      { label: 'Supplier Outstanding Summary', to: '/reports/supplier-outstanding-summary', requires: 'privileged' }
    ]
  },
  {
    title: 'Reporting & Admin',
    icon: '\u{2699}\u{FE0F}',
    links: [
      { label: 'Company Report Header', to: '/admin/company-report-header' },
      { label: 'Main Menu', to: '/menu' },
      { label: 'User Authentication Log', to: '/admin/user-logs', requires: 'privileged' },
      { label: 'User Action Log', to: '/admin/action-logs', requires: 'privileged' },
      { label: 'User Management', to: '/admin/users', requires: 'privileged' },
      { label: 'Role & Permissions', to: '/admin/roles', requires: 'privileged' },
      { label: 'Employee List', to: '/admin/employees', requires: 'privileged' },
      { label: 'Legacy Users', to: '/admin/legacy-users', requires: 'admin' }
    ]
  }
];

export function canSeeLink(link: MenuLink, isPrivileged: boolean, isAdmin: boolean): boolean {
  if (link.requires === 'admin') return isAdmin;
  if (link.requires === 'privileged') return isPrivileged;
  return true;
}
