```html screen_01_dashboard.html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Integrated Business Operations Suite — Dashboard</title>
  <meta name="viewport" content="width=1280">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
:root {
  --color-primary:         #3831c4;
  --color-primary-dark:    #2a2597;
  --color-primary-light:   #6c65ea;
  --color-primary-surface: #f5f6ffb3;
  --color-primary-border:  #cfd2fc;
  --color-bg-page:      #e8eafc;
  --color-bg-card:      #ffffffcc;
  --color-bg-dark-card: #1c1b38cc;
  --color-text-primary:   #232233;
  --color-text-secondary: #595987;
  --color-text-muted:     #959ac7;
  --color-success: #2eae6c;
  --color-warning: #f7be43;
  --color-error:   #d23b41;
  --color-info:    #368aad;
  --color-border:        #ebecf5;
  --color-border-strong: #d3d6ee;
  --text-h1-size: 28px;      --text-h1-weight: 700;  --text-h1-line-height: 1.2;
  --text-h2-size: 22px;      --text-h2-weight: 600;  --text-h2-line-height: 1.3;
  --text-h3-size: 18px;      --text-h3-weight: 600;  --text-h3-line-height: 1.4;
  --text-h4-size: 15px;      --text-h4-weight: 600;  --text-h4-line-height: 1.4;
  --text-body-lg-size: 15px; --text-body-lg-weight: 400; --text-body-lg-line-height: 1.6;
  --text-body-size: 13px;    --text-body-weight: 400;    --text-body-line-height: 1.6;
  --text-sm-size: 12px;      --text-sm-weight: 400;      --text-sm-line-height: 1.5;
  --text-xs-size: 11px;      --text-xs-weight: 500;      --text-xs-line-height: 1.4;
  --space-1: 4px;  --space-2: 8px;   --space-3: 12px;
  --space-4: 16px; --space-5: 20px;  --space-6: 24px;
  --space-8: 32px; --space-10: 40px; --space-12: 48px;
  --radius-sm:   12px;
  --radius-md:   16px;
  --radius-lg:   20px;
  --radius-xl:   24px;
  --radius-full: 9999px;
  --shadow-sm:    0 2px 8px 0 rgba(56,49,196,0.08);
  --shadow-md:    0 4px 16px 0 rgba(56,49,196,0.10);
  --shadow-lg:    0 8px 32px 0 rgba(56,49,196,0.13);
  --shadow-focus: 0 0 0 3px #3831c433;
}
html {
  background: linear-gradient(108deg,#3831c4 0%, #6c65ea 100%);
  min-height: 100%;
}
body {
  margin: 0;
  background: transparent;
  font-family: 'Inter', -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  color: var(--color-text-primary);
  min-height: 100dvh;
}

.glasstopbar {
  position: sticky;
  top: 0;
  z-index: 30;
  margin-bottom: var(--space-8);
  width: 100vw;
  left: 0;
  background: linear-gradient(90deg, #f5f6ffb3 70%, #e8eafceb 100%);
  -webkit-backdrop-filter: blur(16px);
  backdrop-filter: blur(16px);
  box-shadow: var(--shadow-sm);
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  border-bottom-left-radius: var(--radius-lg);
  border-bottom-right-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-2) var(--space-12) var(--space-2) var(--space-10);
  border-bottom: 1px solid var(--color-border);
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.brand-icon {
  width:32px;
  height:32px;
  border-radius: var(--radius-md);
  background: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
}
.brand-icon svg {
  display:block;
  width:24px;
  height:24px;
  color: #fff;
}

.brand-title {
  font-size: var(--text-h3-size);
  font-weight: var(--text-h2-weight);
  letter-spacing: 0.0em;
  color: var(--color-primary-dark);
  text-shadow: 0 1px 2px #fff3;
}

.profilebar {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.profile-info {
  text-align: right;
  margin-right: var(--space-2);
}

.profile-info .name {
  font-size: var(--text-sm-size);
  font-weight: 500;
  color: var(--color-text-primary);
}
.profile-info .role {
  font-size: var(--text-xs-size);
  color: var(--color-text-secondary);
  text-transform: uppercase;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  background: var(--color-primary-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: var(--color-primary);
  font-size: 16px;
  box-shadow: 0 1px 3px 0 #3831c422;
}

.topbar-btn {
  background: none;
  border: none;
  color: var(--color-primary-dark);
  padding: var(--space-1) var(--space-2);
  font-size: var(--text-body-size);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background 0.2s;
}
.topbar-btn:hover,
.topbar-btn:focus {
  background: var(--color-primary-surface);
  outline: none;
}

/* Main content frame "glass" effect */
.dashboard-frame {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100dvh;
  width: 100vw;
  background: none;
  z-index: 1;
}

/* Glass container effect */
.glass-main-container {
  margin: var(--space-8) auto 0 auto;
  max-width: 1160px;
  width: 90vw;
  background: linear-gradient(120deg, #ffffff1a 65%, #f5f6ffb3 100%);
  -webkit-backdrop-filter: blur(32px);
  backdrop-filter: blur(32px);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  border-top: 1px solid #ffffff33;
  border-left: 1px solid #ffffff26;
  /* Glass edge highlight (directional) */
  border-right: 1px solid #ffffff18;
  border-bottom: 1px solid #ffffff12;
  padding: var(--space-12) var(--space-10) var(--space-8) var(--space-10);
  position: relative;
}
@media (max-width: 900px) {
  .glass-main-container { padding: var(--space-8) var(--space-4) var(--space-8) var(--space-4); }
  .main-kpis { flex-direction: column; gap: var(--space-6);}
}

.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-8);
  margin-bottom: var(--space-8);
}
.dashboard-header-title {
  font-size: var(--text-h1-size);
  font-weight: var(--text-h1-weight);
  color: var(--color-primary-dark);
  letter-spacing: -0.01em;
  text-shadow: 0 2px 6px #fff6, 0 1px 4px #6c65ea36;
}
.dashboard-header-meta {
  display: flex;
  color: var(--color-text-secondary);
  font-size: var(--text-body-size);
  gap: var(--space-4);
}

.main-kpis {
  display: flex;
  flex-direction: row;
  gap: var(--space-8);
  justify-content: flex-start;
  align-items: stretch;
  margin-bottom: var(--space-10);
}

.kpi-card {
  min-width: 220px;
  background: linear-gradient(95deg, #f5f6ffb3 85%, #fffffffa 100%);
  -webkit-backdrop-filter: blur(24px);
  backdrop-filter: blur(24px);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-primary-border);
  padding: var(--space-6) var(--space-6) var(--space-5) var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  position: relative;
  transition: box-shadow 0.18s, transform 0.12s, border-color .18s;
}
.kpi-card:hover,
.kpi-card:focus-within {
  border-color: var(--color-primary-light);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px) scale(1.015);
  outline: none;
}
.kpi-card .kpi-icon {
  width:32px; height:32px;
  background: var(--color-primary-surface);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px 0 #3831c42a;
  margin-bottom: var(--space-2);
}
.kpi-card .kpi-icon svg { color: var(--color-primary); width: 20px; height: 20px;}
.kpi-title {
  font-size: var(--text-h4-size);
  font-weight: var(--text-h4-weight);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 0;
}
.kpi-value {
  font-size: 2.1rem;
  line-height: 1.18;
  font-weight: 700;
  color: var(--color-primary-dark);
  margin: 0;
}
.kpi-subtext {
  font-size: var(--text-sm-size);
  color: var(--color-text-muted);
  text-shadow: 0 1px 2px #fff4;
}

.kpi-trend {
  position: absolute;
  bottom: var(--space-4);
  right: var(--space-6);
  display: flex;
  align-items: center;
  font-size: var(--text-sm-size);
  font-weight: 500;
  gap: 6px;
  border-radius: var(--radius-full);
  background: none;
  padding: 0 8px;
}
.kpi-trend.up { color: var(--color-success);}
.kpi-trend.down { color: var(--color-error);}
.kpi-trend.flat { color: var(--color-text-muted);}
.kpi-trend svg {width: 15px; height: 15px;}

.section-title {
  font-size: var(--text-h2-size);
  font-weight: var(--text-h2-weight);
  color: var(--color-text-primary);
  letter-spacing: -0.01em;
  margin-bottom: var(--space-4);
}
.section-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.quick-actions {
  display: flex;
  gap: var(--space-4);
}
.quick-action-btn {
  border: none;
  outline: none;
  background: var(--color-primary);
  color: #fff;
  border-radius: var(--radius-sm);
  font-size: var(--text-body-size);
  font-weight: 500;
  padding: var(--space-2) var(--space-6);
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: background 0.2s, box-shadow 0.16s;
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.quick-action-btn:hover, .quick-action-btn:focus {
  background: var(--color-primary-dark);
  box-shadow: var(--shadow-focus);
}

.dashboard-sections {
  display: flex;
  gap: var(--space-8);
  width: 100%;
  margin-bottom: var(--space-8);
}
@media (max-width: 1200px) {
  .dashboard-sections {
    flex-direction: column;
    gap: var(--space-6);
  }
}

.section-panel {
  flex: 2;
  background: linear-gradient(117deg, #ffffffcc 94%, #f5f6ffb3 100%);
  -webkit-backdrop-filter: blur(18px);
  backdrop-filter: blur(18px);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
  padding: var(--space-8) var(--space-6) var(--space-6) var(--space-6);
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 285px;
  transition: box-shadow 0.19s, border-color .16s;
}
.section-panel:hover,
.section-panel:focus-within {
  border-color: var(--color-primary-border);
  box-shadow: var(--shadow-md);
}
.section-panel.fullwidth {
  flex: 1 1 100%;
}

.section-panel .panel-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-body-size);
  border-spacing: 0;
}

.panel-table thead th {
  font-size: var(--text-xs-size);
  font-weight: 600;
  color: var(--color-text-secondary);
  letter-spacing: 0.03em;
  background: #f5f6ff57;
  text-transform: uppercase;
  text-align: left;
  padding: var(--space-2) var(--space-3);
  border-bottom: 1px solid var(--color-border);
}

.panel-table tbody tr {
  background: none;
  transition: background 0.18s;
  cursor: pointer;
}

.panel-table tbody tr:hover,
.panel-table tbody tr:focus {
  background: #3831c40a;
  outline: none;
}

.panel-table td {
  padding: var(--space-2) var(--space-3);
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text-primary);
  vertical-align: middle;
}

.status-pill {
  display: inline-block;
  font-size: var(--text-xs-size);
  font-weight: 600;
  text-transform: uppercase;
  padding: 2px var(--space-2);
  border-radius: var(--radius-full);
  letter-spacing: 0.02em;
  vertical-align: middle;
  background: var(--color-bg-dark-card);
  color: var(--color-text-secondary);
  margin-right: var(--space-2);
}
.status-success {
  background: #2eae6c1a;
  color: var(--color-success);
}
.status-warning {
  background: #f7be431a;
  color: var(--color-warning);
}
.status-error {
  background: #d23b411a;
  color: var(--color-error);
}
.status-info {
  background: #368aad1a;
  color: var(--color-info);
}

a.section-link {
  color: var(--color-primary);
  text-decoration: none;
  font-size: var(--text-sm-size);
  font-weight: 500;
  border-radius: var(--radius-full);
  padding: 2px 10px;
  transition: background 0.14s;
}
a.section-link:hover, a.section-link:focus {
  background: #6c65ea18;
  outline: none;
}
.empty-table-row td {
  color: var(--color-text-muted);
  font-style: italic;
  font-size: var(--text-sm-size);
}
.section-panel .panel-table tbody tr:last-child td { border-bottom: none; }

.activity-stream {
  margin-top: var(--space-2);
  width: 100%;
}
.activity-event {
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--color-border);
}
.activity-bullet {
  width: 16px;
  flex: 0 0 16px;
  height: 16px;
  margin-top:2px;
  border-radius: var(--radius-full);
  background: var(--color-primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
}
.activity-bullet .event-icon {
  width:12px;height:12px;color: var(--color-primary-dark);margin: 0 auto;
}
.activity-text {
  flex: 4;
  font-size: var(--text-sm-size);
  color: var(--color-text-primary);
}
.activity-event .event-meta {
  flex: 1.3;
  text-align: right;
  color: var(--color-text-muted);
  font-size: var(--text-xs-size);
}

@media (max-width: 700px) {
  .glass-main-container { padding: var(--space-4);}
  .dashboard-header { flex-direction: column; gap:var(--space-3);}
  .main-kpis { flex-direction: column; gap:var(--space-4);}
  .dashboard-sections { flex-direction:column; gap:var(--space-4);}
  .section-panel { min-height: 0; padding: var(--space-4);}
}

::-webkit-scrollbar {width:9px;background:transparent;}
::-webkit-scrollbar-thumb {background:#23223314;border-radius:5px;}
  </style>
</head>
<body>
<header class="glasstopbar">
  <div class="brand-logo">
    <span class="brand-icon" aria-label="App Logo">
      <!-- Brand SVG placeholder -->
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"  stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="4"/><path d="M3 9h18"/></svg>
    </span>
    <span class="brand-title">Integrated Business Operations Suite</span>
  </div>
  <nav class="profilebar">
    <div class="profile-info">
      <div class="name">Priya Nair</div>
      <div class="role">Supervisor</div>
    </div>
    <span class="avatar" aria-label="User avatar">PN</span>
    <button class="topbar-btn" aria-label="Help"><svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" stroke-width="1.7"/><path d="M8 11v-.8c0-1.1 2-1.2 2-3a2 2 0 10-3.6 1M8 13h.007" stroke-width="1.7"/></svg></button>
    <button class="topbar-btn" aria-label="Sign out"><svg width="16" height="16" viewBox="0 0 16 16" stroke="currentColor" stroke-width="1.6" fill="none"><path d="M11 4l.009 3.206M8.05 8h7m-7 4l7-4-7-4"/><rect x="1.5" y="3.5" width="7" height="9" rx="2.2"/></svg></button>
  </nav>
</header>
<main class="dashboard-frame">
  <section class="glass-main-container">
    <div class="dashboard-header">
      <div>
        <span class="dashboard-header-title">Welcome back, Priya</span>
        <div class="dashboard-header-meta">
          <span>Location: Main HQ</span>
          <span>Last login: 2026-06-16 09:42</span>
        </div>
      </div>
      <div class="quick-actions">
        <button class="quick-action-btn" tabindex="0">
          <svg viewBox="0 0 20 20" stroke="currentColor" fill="none" width="17" height="17" stroke-width="2"><circle cx="10" cy="10" r="8"/><path d="M10 6v6l3.5 2.2"/></svg>
          Run Report
        </button>
        <button class="quick-action-btn" tabindex="0">
          <svg viewBox="0 0 20 20" stroke="currentColor" fill="none" width="17" height="17" stroke-width="2"><rect x="4" y="4" width="12" height="12" rx="4"/><path d="M8 10h4"/><path d="M10 8v4"/></svg>
          New Order
        </button>
        <button class="quick-action-btn" tabindex="0">
          <svg viewBox="0 0 20 20" stroke="currentColor" fill="none" width="17" height="17" stroke-width="2"><circle cx="10" cy="10" r="7"/><path d="M16 7v1a6 6 0 11-2.817-5.1"/></svg>
          Add Customer
        </button>
      </div>
    </div>

    <section class="main-kpis" aria-label="Key Metrics Overview">
      <div class="kpi-card" tabindex="0">
        <div class="kpi-icon">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor"><rect x="3.5" y="8.5" width="13" height="8" rx="2.5"/><path d="M10 8V5a2 2 0 114 0v1.5"/></svg>
        </div>
        <div class="kpi-title">Open Orders</div>
        <div class="kpi-value">46</div>
        <div class="kpi-subtext">+4 new today</div>
        <div class="kpi-trend up">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor"><path d="M2.5 9.5l4.5-4.5 2.5 2.5 4-4"/><path d="M14 4.5v4h-4"/></svg>
          21% ▲
        </div>
      </div>
      <div class="kpi-card" tabindex="0">
        <div class="kpi-icon">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor"><circle cx="10" cy="10" r="6"/><path d="M12.5 9.5a2 2 0 11-5 0 2 2 0 015 0z"/></svg>
        </div>
        <div class="kpi-title">Receipts Pending</div>
        <div class="kpi-value">7</div>
        <div class="kpi-subtext">3 for review today</div>
        <div class="kpi-trend flat">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor"><path d="M2 8h12"/></svg>
          0%
        </div>
      </div>
      <div class="kpi-card" tabindex="0">
        <div class="kpi-icon">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor"><rect x="4.5" y="6.5" width="11" height="8" rx="3"/><path d="M10 8v4"/><path d="M7 10h6"/></svg>
        </div>
        <div class="kpi-title">Inventory Alerts</div>
        <div class="kpi-value" style="color:var(--color-error);">2</div>
        <div class="kpi-subtext" style="color:var(--color-error);">Stock re-order needed</div>
        <div class="kpi-trend down">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor"><path d="M2 6l4.33 6.5 3.2-5L14 13"/><path d="M14 7.5v4h-4"/></svg>
          -50% ▼
        </div>
      </div>
      <div class="kpi-card" tabindex="0">
        <div class="kpi-icon">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor"><rect x="5" y="5" width="10" height="6" rx="2"/><path d="M10 11v4M8.5 15h3"/></svg>
        </div>
        <div class="kpi-title">Jobs In Progress</div>
        <div class="kpi-value">4</div>
        <div class="kpi-subtext">1 overdue by 2 days</div>
        <div class="kpi-trend warning" style="color:var(--color-warning)">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor"><path d="M8 3v8"/><circle cx="8" cy="12.5" r="1"/></svg>
          1 warning
        </div>
      </div>
    </section>

    <section class="dashboard-sections">
      <!-- Recent Orders/Work -->
      <div class="section-panel" style="min-width: 0; flex:3;">
        <div class="section-header-row">
          <div class="section-title">Recent Orders</div>
          <a class="section-link" href="#">View All Orders &rarr;</a>
        </div>
        <table class="panel-table" aria-label="Recent Orders">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Status</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr tabindex="0">
              <td>#SO-4272</td>
              <td>Omega Industries</td>
              <td>2026-06-16</td>
              <td><span class="status-pill status-warning">Pending</span></td>
              <td>&#8377; 56,700</td>
            </tr>
            <tr tabindex="0">
              <td>#SO-4271</td>
              <td>Nova Electric</td>
              <td>2026-06-15</td>
              <td><span class="status-pill status-success">Completed</span></td>
              <td>&#8377; 43,000</td>
            </tr>
            <tr tabindex="0">
              <td>#SO-4270</td>
              <td>Springfield Solutions</td>
              <td>2026-06-15</td>
              <td><span class="status-pill status-error">With Issues</span></td>
              <td>&#8377; 23,500</td>
            </tr>
            <tr tabindex="0">
              <td>#SO-4269</td>
              <td>Unity Stores</td>
              <td>2026-06-14</td>
              <td><span class="status-pill status-success">Completed</span></td>
              <td>&#8377; 74,900</td>
            </tr>
            <tr tabindex="0">
              <td>#SO-4268</td>
              <td>Pristine Services</td>
              <td>2026-06-13</td>
              <td><span class="status-pill status-warning">Pending</span></td>
              <td>&#8377; 18,250</td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Alerts & To-Do -->
      <div class="section-panel" style="flex:2;">
        <div class="section-header-row">
          <div class="section-title">Alerts & To-Do</div>
          <a class="section-link" href="#">View All Tasks</a>
        </div>
        <div class="activity-stream">
          <div class="activity-event">
            <span class="activity-bullet" title="Inventory">
              <span class="event-icon">
                <svg viewBox="0 0 14 14" stroke-width="1.5" stroke="currentColor" fill="none"><rect x="2" y="2" width="10" height="6" rx="2"/><path d="M7 8v3"/></svg>
              </span>
            </span>
            <div class="activity-text"><span class="status-pill status-error">Stock Low</span> Critical component (SKF-311-Bearing) at <strong>1 remaining</strong>. <a href="#" class="section-link">Reorder now</a></div>
            <div class="event-meta">Just now</div>
          </div>
          <div class="activity-event">
            <span class="activity-bullet" title="Order Pending">
              <span class="event-icon">
                <svg viewBox="0 0 14 14" stroke-width="1.5" stroke="currentColor" fill="none"><circle cx="7" cy="7" r="6"/><path d="M7 4.5v3l2 1.5"/></svg>
              </span>
            </span>
            <div class="activity-text"><span class="status-pill status-warning">Action Required</span> 3 receipts awaiting your review.</div>
            <div class="event-meta">7m ago</div>
          </div>
          <div class="activity-event">
            <span class="activity-bullet" title="Job Overdue">
              <span class="event-icon">
                <svg viewBox="0 0 14 14" stroke-width="1.5" stroke="currentColor" fill="none"><path d="M7 2v6.5"/><circle cx="7" cy="10.5" r="1.2"/></svg>
              </span>
            </span>
            <div class="activity-text"><span class="status-pill status-warning">Job Overdue</span> Work Order #W-224 needs update (assigned to Aman G.), overdue since 14-Jun.</div>
            <div class="event-meta">38m ago</div>
          </div>
          <div class="activity-event">
            <span class="activity-bullet" title="Audit Log">
              <span class="event-icon">
                <svg viewBox="0 0 14 14" stroke-width="1.5" stroke="currentColor" fill="none"><rect x="3" y="3" width="8" height="8" rx="1.8"/><path d="M7 5.2v2.4"/><circle cx="7" cy="9.1" r=".7"/></svg>
              </span>
            </span>
            <div class="activity-text"><span class="status-pill status-info">Audit</span> 2 new user access logs require review for compliance.</div>
            <div class="event-meta">1h ago</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Quick Insights Section -->
    <section class="section-panel fullwidth" style="margin-bottom:0;">
      <div class="section-header-row">
        <div class="section-title">Recent Activity</div>
        <a class="section-link" href="#">View Full Audit Trail</a>
      </div>
      <table class="panel-table" aria-label="Recent Activity">
        <thead>
          <tr>
            <th>User</th>
            <th>Activity</th>
            <th>Date/Time</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr tabindex="0">
            <td>
              <span class="avatar" style="width:24px;height:24px;font-size:11px;vertical-align:middle;margin-right:5px;">PN</span>
              Priya Nair
            </td>
            <td>Approved <b>Receipt #RC-3411</b> <span style="color:var(--color-text-muted)">(Sales - Unity Stores)</span></td>
            <td>2026-06-16 09:41</td>
            <td><span class="status-pill status-success">Completed</span></td>
          </tr>
          <tr tabindex="0">
            <td>
              <span class="avatar" style="width:24px;height:24px;font-size:11px;vertical-align:middle;margin-right:5px;">AG</span>
              Aman Gupta
            </td>
            <td>Updated job status: <b>Work Order #W-224</b> set to <span class="status-warning">In Progress</span></td>
            <td>2026-06-16 08:55</td>
            <td><span class="status-pill status-warning">Pending</span></td>
          </tr>
          <tr tabindex="0">
            <td>
              <span class="avatar" style="width:24px;height:24px;font-size:11px;vertical-align:middle;margin-right:5px;">MG</span>
              Mehul Ghosh
            </td>
            <td>Created new <b>Supplier</b>: Universal Tools Ltd.</td>
            <td>2026-06-16 08:50</td>
            <td><span class="status-pill status-success">Completed</span></td>
          </tr>
          <tr tabindex="0">
            <td>
              <span class="avatar" style="width:24px;height:24px;font-size:11px;vertical-align:middle;margin-right:5px;">PN</span>
              Priya Nair
            </td>
            <td>Exported <b>User Log Report</b> (PDF)</td>
            <td>2026-06-16 08:31</td>
            <td><span class="status-pill status-info">Exported</span></td>
          </tr>
          <tr tabindex="0">
            <td>
              <span class="avatar" style="width:24px;height:24px;font-size:11px;vertical-align:middle;margin-right:5px;">MB</span>
              Maya Batra
            </td>
            <td>Attempted <b>login</b> (incorrect password, account locked for 15 min.)</td>
            <td>2026-06-16 07:44</td>
            <td><span class="status-pill status-error">Locked</span></td>
          </tr>
        </tbody>
      </table>
    </section>
  </section>
</main>
</body>
</html>
```
---

```html screen_02_user_list.html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>User Management · Integrated Business Operations Suite</title>
  <meta name="viewport" content="width=1280">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
:root {
  --color-primary:         #3831c4;
  --color-primary-dark:    #2a2597;
  --color-primary-light:   #6c65ea;
  --color-primary-surface: #f5f6ffb3;
  --color-primary-border:  #cfd2fc;
  --color-bg-page:      #e8eafc;
  --color-bg-card:      #ffffffcc;
  --color-bg-dark-card: #1c1b38cc;
  --color-text-primary:   #232233;
  --color-text-secondary: #595987;
  --color-text-muted:     #959ac7;
  --color-success: #2eae6c;
  --color-warning: #f7be43;
  --color-error:   #d23b41;
  --color-info:    #368aad;
  --color-border:        #ebecf5;
  --color-border-strong: #d3d6ee;
  --text-h1-size: 28px;      --text-h1-weight: 700;  --text-h1-line-height: 1.2;
  --text-h2-size: 22px;      --text-h2-weight: 600;  --text-h2-line-height: 1.3;
  --text-h3-size: 18px;      --text-h3-weight: 600;  --text-h3-line-height: 1.4;
  --text-h4-size: 15px;      --text-h4-weight: 600;  --text-h4-line-height: 1.4;
  --text-body-lg-size: 15px; --text-body-lg-weight: 400; --text-body-lg-line-height: 1.6;
  --text-body-size: 13px;    --text-body-weight: 400;    --text-body-line-height: 1.6;
  --text-sm-size: 12px;      --text-sm-weight: 400;      --text-sm-line-height: 1.5;
  --text-xs-size: 11px;      --text-xs-weight: 500;      --text-xs-line-height: 1.4;
  --space-1: 4px;  --space-2: 8px;   --space-3: 12px;
  --space-4: 16px; --space-5: 20px;  --space-6: 24px;
  --space-8: 32px; --space-10: 40px; --space-12: 48px;
  --radius-sm:   12px;
  --radius-md:   16px;
  --radius-lg:   20px;
  --radius-xl:   24px;
  --radius-full: 9999px;
  --shadow-sm:    0 2px 8px 0 rgba(56,49,196,0.08);
  --shadow-md:    0 4px 16px 0 rgba(56,49,196,0.10);
  --shadow-lg:    0 8px 32px 0 rgba(56,49,196,0.13);
  --shadow-focus: 0 0 0 3px #3831c433;
}

html {
  background: linear-gradient(112deg,#3831c4 0%, #6c65ea 100%);
  min-height: 100%;
}
body {
  margin: 0;
  min-height: 100dvh;
  background: transparent;
  font-family: 'Inter', -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  color: var(--color-text-primary);
}
.page-wrap {
  min-height: 100dvh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: var(--space-8);
}

.glass-card {
  margin-top: 0;
  background: linear-gradient(120deg, #f5f6ffb3 85%, #ffffffee 100%);
  -webkit-backdrop-filter: blur(28px);
  backdrop-filter: blur(28px);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  border-top: 1px solid #ffffff33;
  border-left: 1px solid #ffffff26;
  border-right: 1px solid #ffffff18;
  border-bottom: 1px solid #ffffff13;
  padding: var(--space-8) var(--space-8) var(--space-6) var(--space-8);
  width: 1160px;
  max-width: 96vw;
 }

.section-title {
  font-size: var(--text-h1-size);
  font-weight: var(--text-h1-weight);
  color: var(--color-primary-dark);
  margin-bottom: var(--space-2);
  letter-spacing: -0.01em;
}
.section-desc {
  color: var(--color-text-secondary);
  font-size: var(--text-body-lg-size);
  margin-bottom: var(--space-6);
}

/* Top controls */
.user-list-controls {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: var(--space-6);
  margin-bottom: var(--space-7, 28px);
}
.user-filter-form {
  display: flex;
  gap: var(--space-3);
  align-items: flex-end;
}
.input-wrap label {
  font-size: var(--text-xs-size);
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-bottom: 2px;
  display: block;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.input-wrap input, .input-wrap select {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-body-size);
  font-family: inherit;
  color: var(--color-text-primary);
  width: 140px;
  height: 34px;
  transition: border 0.16s, box-shadow 0.16s;
}
.input-wrap input::placeholder {
  color: var(--color-text-muted);
}
.input-wrap input:focus, .input-wrap select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--shadow-focus);
}
.input-wrap select {
  width: 120px;
}

/* Action buttons */
.bulk-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
.bulk-btn {
  background: var(--color-primary);
  color: #fff;
  border: none;
  font-size: var(--text-body-size);
  font-weight: 500;
  border-radius: var(--radius-sm);
  padding: var(--space-2) var(--space-5);
  min-width: 77px;
  cursor: pointer;
  transition: background 0.18s, box-shadow 0.16s;
  box-shadow: var(--shadow-sm);
}
.bulk-btn:hover,
.bulk-btn:focus {
  background: var(--color-primary-dark);
  box-shadow: var(--shadow-focus);
  outline: none;
}
.bulk-btn.export {
  background: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary-border);
}
.bulk-btn.export:hover,
.bulk-btn.export:focus {
  background: var(--color-primary-surface);
  color: var(--color-primary-dark);
  outline: none;
}
.bulk-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.user-table-wrap {
  overflow-x: auto;
  background: transparent;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--space-8);
}

.user-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-body-size);
  background: transparent;
}
.user-table thead tr {
  background: #f5f6ff55;
}
.user-table thead th {
  font-size: var(--text-xs-size);
  font-weight: 600;
  color: var(--color-text-secondary);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: var(--space-2) var(--space-3);
  text-align: left;
  border-bottom: 1px solid var(--color-border);
}
.user-table tbody tr {
  background: none;
  transition: background 0.15s;
  cursor: pointer;
}
.user-table tbody tr:hover,
.user-table tbody tr:focus {
  background: #3831c406;
  outline: none;
}
.user-table td {
  padding: var(--space-2) var(--space-3);
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text-primary);
  vertical-align: middle;
}

.user-table .avatar {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  background: var(--color-primary-surface);
  font-weight: 600;
  color: var(--color-primary);
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  box-shadow: 0 1px 2px #23223314;
}

.role-tag {
  font-size: var(--text-xs-size);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-radius: var(--radius-full);
  padding: 2px 10px;
  margin-right: 3px;
  display: inline-block;
  vertical-align: middle;
  color: var(--color-primary-dark);
  background: var(--color-primary-surface);
}
.role-administrator { color: #fff; background: var(--color-primary);}
.role-supervisor { color: var(--color-primary); background: #cfd2fc90; }
.role-standard { color: var(--color-primary-dark); background: #f5f6ffbb;}
.status-pill {
  font-size: var(--text-xs-size);
  font-weight: 600;
  border-radius: var(--radius-full);
  text-transform: uppercase;
  padding: 2px 8px;
  margin-right: 2px;
  background: var(--color-bg-dark-card);
  color: var(--color-text-secondary);
}
.status-active {
  background: #2eae6c1a;
  color: var(--color-success);
}
.status-inactive {
  background: #959ac71b;
  color: var(--color-text-muted);
}
.status-locked {
  background: #d23b411a;
  color: var(--color-error);
}

/* Table action icons */
.action-btn {
  background: none;
  border: none;
  padding: 0 8px;
  color: var(--color-primary);
  font-size: 18px;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: background 0.11s;
  vertical-align: middle;
  display: inline-flex; align-items: center; justify-content: center;
}
.action-btn:hover,
.action-btn:focus {
  background: var(--color-primary-surface);
  color: var(--color-primary-dark);
  outline: none;
}
.action-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.bulk-select {
  accent-color: var(--color-primary);
  width: 18px;
  height: 18px;
  vertical-align: middle;
}

/* Pagination */
.pager {
  display: flex;
  gap: var(--space-1);
  align-items: center;
  margin-right: 10px;
  float: right;
}
.pager-btn {
  background: none;
  border: none;
  color: var(--color-primary-dark);
  font-weight: 500;
  font-size: var(--text-sm-size);
  padding: 6px 12px;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: background 0.15s;
}
.pager-btn:hover,
.pager-btn:focus {
  background: var(--color-primary-surface);
  outline: none;
}
.pager-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

@media (max-width: 850px) {
  .glass-card { padding: var(--space-6) var(--space-3); width:98vw;}
  .user-list-controls { flex-direction:column; gap:var(--space-3);}
  .user-table td, .user-table th { min-width: 90px;}
}
::-webkit-scrollbar {width:9px;background:transparent;}
::-webkit-scrollbar-thumb {background:#23223314;border-radius:5px;}
  </style>
</head>
<body>
<main class="page-wrap">
  <section class="glass-card">
    <header>
      <div class="section-title">User Management</div>
      <div class="section-desc">View, search, and manage all registered user accounts and their access roles.</div>
    </header>
    <section class="user-list-controls">
      <form class="user-filter-form" autocomplete="off" aria-label="User Filters">
        <div class="input-wrap">
          <label for="filter-name">Name</label>
          <input type="text" id="filter-name" name="filter-name" placeholder="Search name..." value="">
        </div>
        <div class="input-wrap">
          <label for="filter-role">Role</label>
          <select id="filter-role" name="filter-role">
            <option value="">All Roles</option>
            <option value="Administrator">Administrator</option>
            <option value="Supervisor">Supervisor</option>
            <option value="Standard">Standard</option>
          </select>
        </div>
        <div class="input-wrap">
          <label for="filter-status">Status</label>
          <select id="filter-status" name="filter-status">
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Locked">Locked</option>
          </select>
        </div>
        <div class="input-wrap">
          <label for="filter-lastlogin">Last Login</label>
          <input type="date" id="filter-lastlogin" name="filter-lastlogin" value="">
        </div>
        <button class="bulk-btn export" style="margin-top:var(--space-1);" aria-label="Apply filters">
          <svg width="14" height="14" style="vertical-align:-2px; margin-right:2px;" stroke="currentColor" fill="none" stroke-width="1.7" viewBox="0 0 14 14"><path d="M2 4h10"/><path d="M4 6v3.5l3 2 3-2V6"/><rect x="4.75" y="1.75" width="4.5" height="3.5" rx="1.75"/></svg> Filter
        </button>
      </form>
      <div class="bulk-actions">
        <button class="bulk-btn" aria-label="Add user">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke-width="2" stroke="currentColor"><circle cx="8" cy="8" r="7"/><path d="M8 5v6"/><path d="M5 8h6"/></svg>
          Add User
        </button>
        <button class="bulk-btn" aria-label="Bulk import users">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke-width="2" stroke="currentColor"><rect x="3" y="3" width="10" height="10" rx="2"/><path d="M8 6v4"/><path d="M6 10l2 2 2-2"/></svg>
          Import
        </button>
        <button class="bulk-btn export" aria-label="Export user list">
          <svg width="14" height="14" viewBox="0 0 14 14" stroke-width="1.7" stroke="currentColor" fill="none"><rect x="2.5" y="1.8" width="9" height="7" rx="2"/><path d="M7 8v3.5"/><path d="M5.5 11l1.5 1.2L10 11"/></svg>
          Export
        </button>
        <button class="bulk-btn" aria-label="Deactivate selected" disabled>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke-width="2" stroke="currentColor"><circle cx="6.5" cy="6.5" r="5.5"/><path d="M4.5 8.5l4-4"/><path d="M8.5 8.5l-4-4"/></svg>
          Deactivate
        </button>
      </div>
    </section>
    <section class="user-table-wrap" aria-label="User List">
      <table class="user-table">
        <thead>
          <tr>
            <th><input type="checkbox" class="bulk-select" aria-label="Select all users"></th>
            <th>Name</th>
            <th>Email</th>
            <th>Role(s)</th>
            <th>Status</th>
            <th>Date Created</th>
            <th>Last Login</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr tabindex="0">
            <td><input type="checkbox" class="bulk-select" aria-label="Select user"></td>
            <td>
              <span class="avatar">PN</span>
              Priya Nair
            </td>
            <td>priya.nair@ibosuite.in</td>
            <td>
              <span class="role-tag role-supervisor">Supervisor</span>
            </td>
            <td><span class="status-pill status-active">Active</span></td>
            <td>2023-05-12</td>
            <td>2026-06-16 09:41</td>
            <td>
              <button class="action-btn" aria-label="Edit user"><svg width="16" height="16" viewBox="0 0 16 16" stroke-width="1.85" stroke="currentColor" fill="none"><path d="M11.5 3.5l1 1c.4.4.4 1 0 1.4L7 11.4l-2.5.6.6-2.5 5.5-5.6c.4-.4 1-.4 1.4 0z"/></svg></button>
              <button class="action-btn" aria-label="Deactivate user"><svg width="16" height="16" viewBox="0 0 16 16" stroke-width="1.7" stroke="currentColor" fill="none"><circle cx="8" cy="8" r="6"/><path d="M5 11l6-6"/></svg></button>
            </td>
          </tr>
          <tr tabindex="0">
            <td><input type="checkbox" class="bulk-select" aria-label="Select user"></td>
            <td>
              <span class="avatar">MG</span>
              Mehul Ghosh
            </td>
            <td>mehul.ghosh@ibosuite.in</td>
            <td>
              <span class="role-tag role-administrator">Administrator</span>
            </td>
            <td><span class="status-pill status-active">Active</span></td>
            <td>2022-09-29</td>
            <td>2026-06-15 18:14</td>
            <td>
              <button class="action-btn" aria-label="Edit user"><svg width="16" height="16" viewBox="0 0 16 16" stroke-width="1.85" stroke="currentColor" fill="none"><path d="M11.5 3.5l1 1c.4.4.4 1 0 1.4L7 11.4l-2.5.6.6-2.5 5.5-5.6c.4-.4 1-.4 1.4 0z"/></svg></button>
              <button class="action-btn" aria-label="Deactivate user"><svg width="16" height="16" viewBox="0 0 16 16" stroke-width="1.7" stroke="currentColor" fill="none"><circle cx="8" cy="8" r="6"/><path d="M5 11l6-6"/></svg></button>
            </td>
          </tr>
          <tr tabindex="0">
            <td><input type="checkbox" class="bulk-select" aria-label="Select user"></td>
            <td>
              <span class="avatar">AG</span>
              Aman Gupta
            </td>
            <td>aman.gupta@ibosuite.in</td>
            <td>
              <span class="role-tag role-standard">Standard</span>
            </td>
            <td ><span class="status-pill status-active">Active</span></td>
            <td>2026-01-08</td>
            <td>2026-06-14 10:05</td>
            <td>
              <button class="action-btn" aria-label="Edit user"><svg width="16" height="16" viewBox="0 0 16 16" stroke-width="1.85" stroke="currentColor" fill="none"><path d="M11.5 3.5l1 1c.4.4.4 1 0 1.4L7 11.4l-2.5.6.6-2.5 5.5-5.6c.4-.4 1-.4 1.4 0z"/></svg></button>
              <button class="action-btn" aria-label="Deactivate user"><svg width="16" height="16" viewBox="0 0 16 16" stroke-width="1.7" stroke="currentColor" fill="none"><circle cx="8" cy="8" r="6"/><path d="M5 11l6-6"/></svg></button>
            </td>
          </tr>
          <tr tabindex="0" style="opacity: 0.7;">
            <td><input type="checkbox" class="bulk-select" aria-label="Select user"></td>
            <td>
              <span class="avatar">MB</span>
              Maya Batra
            </td>
            <td>maya.batra@ibosuite.in</td>
            <td>
              <span class="role-tag role-standard">Standard</span>
            </td>
            <td><span class="status-pill status-locked">Locked</span></td>
            <td>2025-11-17</td>
            <td>2026-06-16 07:44</td>
            <td>
              <button class="action-btn" aria-label="Unlock user"><svg width="16" height="16" viewBox="0 0 16 16" stroke-width="1.85" stroke="currentColor" fill="none"><rect x="4.5" y="7" width="7" height="4" rx="1.3"/><circle cx="8" cy="6" r="1.8"/><path d="M8 10V11"/></svg></button>
            </td>
          </tr>
          <tr tabindex="0">
            <td><input type="checkbox" class="bulk-select" aria-label="Select user"></td>
            <td>
              <span class="avatar">SK</span>
              Sanjay Kumar
            </td>
            <td>sanjay.kumar@ibosuite.in</td>
            <td>
              <span class="role-tag role-supervisor">Supervisor</span>
            </td>
            <td ><span class="status-pill status-inactive">Inactive</span></td>
            <td>2025-06-08</td>
            <td>2026-04-26 17:23</td>
            <td>
              <button class="action-btn" aria-label="Activate user"><svg width="16" height="16" viewBox="0 0 16 16" stroke-width="1.85" stroke="currentColor" fill="none"><circle cx="8" cy="8" r="6"/><path d="M6.3 8l1.4 1.7 2.4-2.0"/></svg></button>
            </td>
          </tr>
          <tr tabindex="0">
            <td><input type="checkbox" class="bulk-select" aria-label="Select user"></td>
            <td>
              <span class="avatar">KH</span>
              Kavita Hegde
            </td>
            <td>kavita.hegde@ibosuite.in</td>
            <td>
              <span class="role-tag role-standard">Standard</span>
              <span class="role-tag role-supervisor">Supervisor</span>
            </td>
            <td><span class="status-pill status-active">Active</span></td>
            <td>2024-12-09</td>
            <td>2026-06-15 15:28</td>
            <td>
              <button class="action-btn" aria-label="Edit user"><svg width="16" height="16" viewBox="0 0 16 16" stroke-width="1.85" stroke="currentColor" fill="none"><path d="M11.5 3.5l1 1c.4.4.4 1 0 1.4L7 11.4l-2.5.6.6-2.5 5.5-5.6c.4-.4 1-.4 1.4 0z"/></svg></button>
              <button class="action-btn" aria-label="Deactivate user"><svg width="16" height="16" viewBox="0 0 16 16" stroke-width="1.7" stroke="currentColor" fill="none"><circle cx="8" cy="8" r="6"/><path d="M5 11l6-6"/></svg></button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
    <nav class="pager" aria-label="Pagination">
      <button class="pager-btn" disabled>&laquo;</button>
      <button class="pager-btn" aria-current="page" style="background:var(--color-primary-surface);font-weight:600;">1</button>
      <button class="pager-btn">2</button>
      <button class="pager-btn">3</button>
      <span style="font-size:var(--text-sm-size);color:var(--color-text-muted);">of 7</span>
      <button class="pager-btn">&raquo;</button>
    </nav>
  </section>
</main>
</body>
</html>
```
---

```html screen_03_user_form.html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Create User · Integrated Business Operations Suite</title>
  <meta name="viewport" content="width=600">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
:root {
  --color-primary:         #3831c4;
  --color-primary-dark:    #2a2597;
  --color-primary-light:   #6c65ea;
  --color-primary-surface: #f5f6ffb3;
  --color-primary-border:  #cfd2fc;
  --color-bg-page:      #e8eafc;
  --color-bg-card:      #ffffffcc;
  --color-bg-dark-card: #1c1b38cc;
  --color-text-primary:   #232233;
  --color-text-secondary: #595987;
  --color-text-muted:     #959ac7;
  --color-success: #2eae6c;
  --color-warning: #f7be43;
  --color-error:   #d23b41;
  --color-info:    #368aad;
  --color-border:        #ebecf5;
  --color-border-strong: #d3d6ee;
  --text-h1-size: 28px;      --text-h1-weight: 700;  --text-h1-line-height: 1.2;
  --text-h2-size: 22px;      --text-h2-weight: 600;  --text-h2-line-height: 1.3;
  --text-h3-size: 18px;      --text-h3-weight: 600;  --text-h3-line-height: 1.4;
  --text-h4-size: 15px;      --text-h4-weight: 600;  --text-h4-line-height: 1.4;
  --text-body-lg-size: 15px; --text-body-lg-weight: 400; --text-body-lg-line-height: 1.6;
  --text-body-size: 13px;    --text-body-weight: 400;    --text-body-line-height: 1.6;
  --text-sm-size: 12px;      --text-sm-weight: 400;      --text-sm-line-height: 1.5;
  --text-xs-size: 11px;      --text-xs-weight: 500;      --text-xs-line-height: 1.4;
  --space-1: 4px;  --space-2: 8px;   --space-3: 12px;
  --space-4: 16px; --space-5: 20px;  --space-6: 24px;
  --space-8: 32px; --space-10: 40px; --space-12: 48px;
  --radius-sm:   12px;
  --radius-md:   16px;
  --radius-lg:   20px;
  --radius-xl:   24px;
  --radius-full: 9999px;
  --shadow-sm:    0 2px 8px 0 rgba(56,49,196,0.08);
  --shadow-md:    0 4px 16px 0 rgba(56,49,196,0.10);
  --shadow-lg:    0 8px 32px 0 rgba(56,49,196,0.13);
  --shadow-focus: 0 0 0 3px #3831c433;
}
html {
  background: linear-gradient(109deg,#3831c4 0%, #6c65ea 100%);
  min-height: 100%;
}
body {
  margin: 0;
  background: transparent;
  min-height: 100dvh;
  font-family: 'Inter', -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  color: var(--color-text-primary);
}
.form-frame {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
}
.glass-form-card {
  background: linear-gradient(111deg, #ffffffee 84%, #f5f6ffdf 100%);
  -webkit-backdrop-filter: blur(28px);
  backdrop-filter: blur(28px);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  border-top: 1px solid #ffffff33;
  border-left: 1px solid #ffffff26;
  border-bottom: 1px solid #ffffff10;
  border-right: 1px solid #ffffff10;
  padding: var(--space-10) var(--space-8);
  width: 500px;
  max-width: 97vw;
  margin: 0 auto;
  position: relative;
}

.form-title {
  font-size: var(--text-h2-size);
  font-weight: var(--text-h2-weight);
  color: var(--color-primary-dark);
  margin-bottom: var(--space-3);
  letter-spacing: -0.01em;
}
.form-desc {
  color: var(--color-text-secondary);
  font-size: var(--text-body-lg-size);
  margin-bottom: var(--space-6);
}

/* form fields */
.form-group {
  margin-bottom: var(--space-5);
  display:flex;
  flex-direction: column;
  gap:2px;
}
.form-label {
  font-size: var(--text-sm-size);
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-bottom: 3px;
  letter-spacing: 0.01em;
}
.form-input,
.form-select {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--text-body-size);
  color: var(--color-text-primary);
  padding: var(--space-2) var(--space-3);
  height: 34px;
  font-family: inherit;
  margin-bottom: 0;
  transition: border 0.14s, box-shadow 0.14s;
}
.form-input:focus,
.form-select:focus {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-focus);
  outline: none;
}
.form-input:disabled {
  background: #e8eafc93;
  color: var(--color-text-muted);
}
.form-input::placeholder {
  color: var(--color-text-muted);
}
.form-hint {
  font-size: var(--text-xs-size);
  color: var(--color-text-muted);
  margin-top: 1px;
}
.form-error {
  font-size: var(--text-xs-size);
  color: var(--color-error);
  margin-top: 1px;
}
.password-policy {
  font-size: var(--text-xs-size);
  color: var(--color-text-secondary);
  margin-top: 1px;
  margin-bottom: 0px;
}

.input-has-error .form-input, .input-has-error .form-select { border-color: var(--color-error); }
.input-has-success .form-input { border-color: var(--color-success);}
.input-has-warning .form-input { border-color: var(--color-warning);}
.input-has-info .form-input { border-color: var(--color-info);}

/* role options */
.role-options {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3) var(--space-4);
  margin-top: 4px;
}
.role-checkbox {
  accent-color: var(--color-primary);
  width: 17px;
  height: 17px;
  vertical-align: middle;
  margin-right: 7px;
}
.role-label {
  font-size: var(--text-body-size);
  color: var(--color-text-primary);
  font-weight: 500;
  user-select: none;
  cursor: pointer;
}

.status-choice {
  display: flex;
  gap: var(--space-3);
  align-items: center;
}

.status-pill {
  font-size: var(--text-xs-size);
  font-weight: 600;
  border-radius: var(--radius-full);
  text-transform: uppercase;
  padding: 3px 14px;
  background: #2eae6c1a;
  color: var(--color-success);
  border: none;
  display: inline-block;
}
.status-inactive { background: #959ac71b; color: var(--color-text-muted);}
.status-locked { background: #d23b411a; color: var(--color-error);}
.status-pill.selected, .status-choice input:checked + .status-pill {
  outline: 2px solid var(--color-primary);
  background: var(--color-primary-surface);
  color: var(--color-primary-dark);
}
.status-choice input {
  display: none;
}

/* Buttons */
.form-actions {
  display: flex;
  gap: var(--space-4);
  justify-content: flex-end;
  margin-top: var(--space-8);
}
.primary-btn {
  background: var(--color-primary);
  color: #fff;
  border: none;
  font-size: var(--text-body-lg-size);
  font-weight: 500;
  border-radius: var(--radius-sm);
  padding: var(--space-2) var(--space-6);
  min-width: 110px;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: background 0.17s, box-shadow 0.15s;
  position: relative;
}
.primary-btn:hover, .primary-btn:focus {
  background: var(--color-primary-dark);
  box-shadow: var(--shadow-focus);
  outline: none;
}
.primary-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.secondary-btn {
  background: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary-border);
  font-size: var(--text-body-size);
  font-weight: 500;
  border-radius: var(--radius-sm);
  padding: var(--space-2) var(--space-6);
  min-width: 90px;
  cursor: pointer;
  transition: background 0.13s;
}
.secondary-btn:hover, .secondary-btn:focus {
  background: var(--color-primary-surface);
  color: var(--color-primary-dark);
  outline: none;
}
@media (max-width:600px) {
  .glass-form-card { padding: var(--space-8) var(--space-2);}
}
::-webkit-scrollbar {width:9px;background:transparent;}
::-webkit-scrollbar-thumb {background:#23223314;border-radius:5px;}
  </style>
</head>
<body>
<section class="form-frame">
  <form class="glass-form-card" autocomplete="off" aria-label="Create User">
    <div class="form-title">Create User Account</div>
    <div class="form-desc">Enter user details and assign access roles. <span style="font-size:var(--text-xs-size);color:var(--color-text-muted);">Fields marked <span style="color:var(--color-error)">*</span> are required.</span></div>
    <div class="form-group">
      <label class="form-label" for="user-fullname">Full Name <span style="color:var(--color-error);">*</span></label>
      <input class="form-input" id="user-fullname" name="user-fullname" type="text" placeholder="e.g. Riya Shetty" value="" required autocomplete="off">
      <span class="form-hint">As it should appear on reports.</span>
    </div>
    <div class="form-group">
      <label class="form-label" for="user-email">Email <span style="color:var(--color-error);">*</span></label>
      <input class="form-input" id="user-email" name="user-email" type="email" placeholder="e.g. riya.shetty@ibosuite.in" value="" required autocomplete="off">
    </div>
    <div class="form-group">
      <label class="form-label" for="user-phone">Phone</label>
      <input class="form-input" id="user-phone" name="user-phone" type="tel" placeholder="e.g. +91 9876543210" value="">
      <span class="form-hint">For alerts and verification messages.</span>
    </div>
    <div class="form-group">
      <label class="form-label" for="user-roles">Assign Roles <span style="color:var(--color-error)">*</span></label>
      <div class="role-options" id="user-roles">
        <label class="role-label"><input class="role-checkbox" type="checkbox" name="roles" value="Standard" checked>Standard</label>
        <label class="role-label"><input class="role-checkbox" type="checkbox" name="roles" value="Supervisor">Supervisor</label>
        <label class="role-label"><input class="role-checkbox" type="checkbox" name="roles" value="Administrator">Administrator</label>
      </div>
      <span class="form-hint">Tick one or more as required. Highest access applies.</span>
    </div>
    <div class="form-group">
      <label class="form-label" for="user-status">Status</label>
      <div class="status-choice">
        <input id="status-active" type="radio" name="user-status" value="active" checked>
        <label for="status-active" class="status-pill selected">Active</label>
        <input id="status-inactive" type="radio" name="user-status" value="inactive">
        <label for="status-inactive" class="status-pill status-inactive">Inactive</label>
        <input id="status-locked" type="radio" name="user-status" value="locked">
        <label for="status-locked" class="status-pill status-locked">Locked</label>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label" for="user-password">Set Password <span style="color:var(--color-error)">*</span></label>
      <input class="form-input" id="user-password" name="user-password" type="password" autocomplete="new-password" value="" pattern="^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*]).{10,}$" required placeholder="Strong password..." aria-describedby="password-policy">
      <span class="password-policy" id="password-policy">
        Minimum 10 characters, include uppercase, lowercase, number, special character.
      </span>
      <!-- Password error below -->
      <!-- <span class="form-error">Password must contain an uppercase letter, a number, and a symbol.</span> -->
    </div>
    <div class="form-actions">
      <button class="secondary-btn" type="button" tabindex="0" onclick="window.history.back()">Cancel</button>
      <button class="primary-btn" type="submit" tabindex="0">Create User</button>
    </div>
  </form>
</section>
</body>
</html>
```
