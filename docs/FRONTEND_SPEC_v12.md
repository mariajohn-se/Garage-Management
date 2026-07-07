<!--
  Generated from : PRD_v1.0.0.md
  PRD hash       : 30974e2c05a9
  Spec version   : v12
  Generated at   : 2026-07-02 09:27:18 UTC
-->

# FRONTEND_SPEC.md

> This file was merged from 14 chunk files.
> Individual chunk files: FRONTEND_SPEC_1_v12.md, FRONTEND_SPEC_2_v12.md, FRONTEND_SPEC_3_v12.md, FRONTEND_SPEC_4_v12.md, FRONTEND_SPEC_5_v12.md, FRONTEND_SPEC_6_v12.md, FRONTEND_SPEC_7_v12.md, FRONTEND_SPEC_8_v12.md, FRONTEND_SPEC_9_v12.md, FRONTEND_SPEC_10_v12.md, FRONTEND_SPEC_11_v12.md, FRONTEND_SPEC_12_v12.md, FRONTEND_SPEC_13_v12.md, FRONTEND_SPEC_14_v12.md

---

# FRONTEND_SPEC.md — Part 1 of 14

---
## 1. Sign In

**Route Path:** `/sign-in`  
**Purpose:** User authentication entrypoint.  
**PRD Reference:** User Authentication & Security: Sign In  
**Access Roles:** Public (all users, including not signed-in)  
**Page Summary:**  
- Provides controlled access to the application via username & password, with SSO and MFA support where configured.  
- Must enforce the organization's password policy, present clear error states, and prompt for multi-factor auth as needed.  

### Layout & Structure
- Centered glassmorphic card (`glass-form-card` style, max-width 410px) over full-bleed brand gradient.
- App branding visible, with version/build below the form.
- All vertical spacing using `space-4` and `space-5` for form sections.

### Form Fields

| Label                | Field Type          | Validation         | Placeholder                | Notes                                           |
|----------------------|--------------------|--------------------|----------------------------|-------------------------------------------------|
| Username             | text               | required           | "Your username or email"   | Accepts username or email                       |
| Password             | password           | required           | "Your password"            | Hide/show icon to toggle visibility             |
| Organization         | select (optional)  | if multi-tenant    | "Select organization"      | Visible only if more than one org is allowed    |

**Supplementary (when org allows):**  
- "Sign in with SSO" button (displays only if SSO is configured/enabled for the org)
- Language selector (dropdown, top right of card; "English" by default)
- MFA prompt (if enabled and after password is accepted):  
  - Label: "Authentication code" (6 digits, one-time code from SMS/email/TOTP app)  
  - Required if step-up authentication is triggered.

### Buttons  
- **Primary:** "Sign In" (type=submit, disabled if loading or if required inputs are empty, `data-testid="sign-in-submit"`)
- **Secondary:**  
  - "Forgot Password?" — right-aligned below password, link to `/forgot-password`, `data-testid="sign-in-forgotpw"`
  - "Sign in with SSO" (if available), own button, left-aligned
- Accessibility: Enter triggers submit unless form incomplete.

### Form Validations  
- Username: Required. If blank: `Please enter your username or email.`
- Password: Required. If blank: `Please enter your password.`
- MFA code: Required when shown; must be 6 digits; Error if < 6 digits: `Enter the full 6-digit authentication code.`
- Org: Required if shown and value is missing.

### Loading & States
- Loading: All fields and primary button are disabled, primary button shows spinner, testid=`sign-in-submit-loading`.
- Success: On valid login, redirect to dashboard (`/dashboard`) or MFA step (if required).
- API error:  
  - `Incorrect username or password.` (401)
  - `Account is locked due to multiple failed sign-in attempts.` (423)
  - `Account is inactive. Contact your administrator.` (403)
  - If MFA: `Invalid or expired authentication code.`
  - Network: `Unable to contact authentication server. Please try again.`
- All error messages appear **adjacent to relevant input field**, not just as toast.

### Security Considerations
- Disable autocomplete for password.
- Password field supports "show password" toggle (`data-testid="sign-in-showpw"`).
- Password field `aria-describedby` points to error if present.
- Rate-limited on repeated submission (`Sign In` re-enables after each backend response).
- All error codes handled per backend error-handling spec.

### Empty State  
- No user input: Form is shown, all fields empty.

### Test Identifiers

| Element             | Data TestID                       |
|---------------------|-----------------------------------|
| Form                | `sign-in-form`                    |
| Username Field      | `sign-in-username`                |
| Password Field      | `sign-in-password`                |
| ShowPW Toggle       | `sign-in-showpw`                  |
| Org Dropdown        | `sign-in-organization`            |
| Sign In Button      | `sign-in-submit`                  |
| Loading Spinner     | `sign-in-submit-loading`          |
| Forgot PW Link      | `sign-in-forgotpw`                |
| SSO Button          | `sign-in-sso`                     |
| MFA Code Field      | `sign-in-mfa-code`                |
| MFA Submit Button   | `sign-in-mfa-submit`              |

---

## 2. Password Change

**Route Path:** `/change-password`  
**Purpose:** Allows any authenticated user to securely change their password.  
**PRD Reference:** Password Change, Password Policy Enforcement  
**Access Roles:** All signed-in user roles  
**Page Summary:**  
- Enforces strong password policy.  
- Shows helper on policy.  
- Requires confirmation of current password and new password twice.

### Layout & Structure
- Glass form card, centered, max-width 410px.
- Headline: "Change Your Password"
- Instruction: Display password policy below the "New Password" field as helper text.

### Form Fields

| Label                    | Field Type    | Validation               | Placeholder                 |
|--------------------------|--------------|--------------------------|-----------------------------|
| Current Password         | password     | required                 | "Current password"          |
| New Password             | password     | required, policy         | "New password"              |
| Confirm New Password     | password     | must match new password  | "Re-enter new password"     |

### Buttons  
- **Primary:** "Change Password" (submit, `data-testid="pwchange-submit"`)
- **Secondary:** "Cancel" (navigates to previous page or home, `data-testid="pwchange-cancel"`)

### Validations
- Current password: Required. Error: `Please enter your current password.`
- New password:  
  - Required.  
  - Min 10 chars, must include: uppercase, lowercase, number, special char.
  - If policy not met:  
    - Too short: `Password must be at least 10 characters.`
    - Lacks uppercase: `Include at least one uppercase letter.`
    - Lacks lowercase: `Include at least one lowercase letter.`
    - Lacks digit: `Include at least one number.`
    - Lacks special: `Include at least one special character (e.g. !@#...).`
- Confirmation: Must match new password. Error: `Passwords do not match.`

### Loading & States
- Loading: All fields disabled, primary button shows spinner.
- Success: "Password changed successfully." modal, then sign out and redirect to `/sign-in`.
- API error:  
  - Current password incorrect: `Current password is incorrect.`
  - Re-used recent password: `You cannot reuse a recent password.`
  - Server error / network: `Unable to change password. Please try again.`

### Security Considerations
- All password fields have show/hide toggle.
- Password user input is masked.
- Password fields clear on submission.

### Test Identifiers

| Element                   | Data TestID                       |
|---------------------------|-----------------------------------|
| Form                      | `pwchange-form`                   |
| Current Password Field    | `pwchange-current`                |
| New Password Field        | `pwchange-new`                    |
| Confirm Password Field    | `pwchange-confirm`                |
| ShowPW Toggles            | `pwchange-showpw-current` / `pwchange-showpw-new` / `pwchange-showpw-confirm` |
| Submit Button             | `pwchange-submit`                 |
| Cancel Button             | `pwchange-cancel`                 |

---

## 3. ODBC Sign In

**Route Path:** `/odbc-sign-in`  
**Purpose:** Advanced login for users needing access to external/ODBC data sources.  
**PRD Reference:** ODBC Sign In  
**Access Roles:** IT administrators, certain analyst users  
**Page Summary:**  
- Requests ODBC/external credentials in addition to standard login.

### Layout & Structure
- Glass card, max-width 410px, consistent with other sign-in forms.
- Secondary accent on the card to indicate "ODBC" mode.

### Form Fields

| Label                 | Field Type      | Validation   | Placeholder            |
|-----------------------|----------------|--------------|------------------------|
| ODBC Username         | text           | required     | "ODBC User"            |
| ODBC Password         | password       | required     | "ODBC Password"        |
| Connection String     | text           | required     | "ODBC DSN/Connection"  |

- "Test Connection" button (`data-testid="odbc-testconn"`), right next to connection string, not a submit.

### Buttons  
- **Primary:** "Log In" (submit, `data-testid="odbc-login"`)
- **Secondary:** "Cancel" (goes back, `data-testid="odbc-cancel"`)
- **Test Connection:** Triggers ODBC connect test, shows popover with result.

### Validations
- All fields required
- "Test Connection" must pass before "Log In" is enabled.

- If test fails:  
  - Red border on Connection String  
  - Error: `Could not connect to ODBC source. Check credentials and connection string.`

### Loading & States
- "Log In" disables while logging in; spinner in button.
- On API/network error: `Unable to contact ODBC source.`
- Success: Proceed to next step as normal user.

### Security Considerations
- Never store ODBC credentials after session.
- Password input masked, show/hide toggle (testid `odbc-showpw`).

### Test Identifiers

| Element             | Data TestID                    |
|---------------------|-------------------------------|
| Form                | `odbc-form`                   |
| ODBC Username       | `odbc-username`               |
| ODBC Password       | `odbc-password`               |
| ODBC ShowPw         | `odbc-showpw`                 |
| Connection String   | `odbc-connstr`                |
| Test Connection     | `odbc-testconn`               |
| TestConn Result     | `odbc-testconn-result`        |
| Log In Button       | `odbc-login`                  |
| Cancel Button       | `odbc-cancel`                 |

---

## 4. Bypass/Forgot Password

**Route Path:** `/forgot-password`  
**Purpose:** Secure self-service password reset/start of password recovery.  
**PRD Reference:** Bypass/Forgot Password  
**Access Roles:** Public (users not signed in)  
**Page Summary:**  
- Start recovery with username/email, verify via email/SMS, continue to password reset.

### Layout & Structure
- Glass card, centered.
- Steps:  
  1. Enter username or email  
  2. "Send Reset Link"  
  3. On submission, show confirmation (`A password reset email has been sent...`)

### Step 1 Form Fields

| Label                 | Field Type | Validation   | Placeholder                  |
|-----------------------|------------|--------------|------------------------------|
| Username or Email     | text       | required     | "Registered username or email"|

### Buttons  
- **Primary:** "Send Reset Link" (submit, `data-testid="forgotpw-submit"`)
- **Secondary:** "Back to Sign In" (navigates to `/sign-in`, `data-testid="forgotpw-back"`)

### Step 2 (Post-submission)
- Show confirmation state (`forgotpw-success-message`):  
  - "If the account exists, a password reset link has been sent to your email/SMS."

### Validations
- Field required (error: `Enter your username or email.`)
- If email not found, show generic "If the account exists..." message — never reveal presence/absence of userID/email.
- API/network error: `Unable to send reset link. Please try again later.`

### Security Considerations
- Email/SMS token must be single-use, expire after a short duration.

### Loading & States
- While submitting or sending code: spinner.  
- Form is disabled during load.

### Test Identifiers

| Element               | Data TestID                    |
|-----------------------|-------------------------------|
| Form                  | `forgotpw-form`               |
| Username/Email        | `forgotpw-username`           |
| Submit Button         | `forgotpw-submit`             |
| Success Message       | `forgotpw-success-message`    |
| Back to Sign In       | `forgotpw-back`               |

---

## 5. User Log Report

**Route Path:** `/admin/user-logs`  
**Purpose:** View, filter, and export user authentication and account security events.  
**PRD Reference:** User Log Report  
**Access Roles:** Supervisor, Administrator  
**Page Summary:**  
- Security overview of user sign-in events, failed attempts, password changes, resets.
- Allows filtering and export.

### Layout & Structure
- Section card over glass surface, fills (max 1200px)
- Title: "User Authentication Log"
- Filter bar above table, export/print controls top right.

### Filter Fields

| Filter Label   | Field Type  | Placeholder           | Notes           |
|----------------|-------------|-----------------------|-----------------|
| User           | autocomplete | "User name..."        | Dropdown from system user list |
| Date (from)    | date        |                       |                |
| Date (to)      | date        |                       |                |
| Event Type     | select      | "All events"          | ["Sign In", "Failed Sign In", "Password Change", "Reset", "Lockout"] |

### Table Columns

| Column        | Width    | Data                       |
|---------------|----------|----------------------------|
| User          | 160px    | Name + (username)          |
| Event Type    | 140px    | Sign In / Failed / etc.    |
| Date/Time     | 160px    | ISO datetime               |
| Status        | 120px    | Success, Failure, Locked   |
| IP Address    | 112px    | (if available)             |
| Machine Name  | 180px    | (if available)             |
| Details       | stretch  | Remarks, Reason, Extra info|

### Actions
- **Export CSV** (`userlog-export-csv`)  
- **Export Excel** (`userlog-export-xls`)  
- **Export PDF** (`userlog-export-pdf`)  
- **Print** (`userlog-print`)
- Filter auto-applies on change; no submit button required.

### Empty State  
- "No user log records match the current filters."

### Loading & Errors
- Loading: Table skeleton rows.
- API/network error: `Unable to load user logs. Please try again.`

### Security Considerations
- Data is accessible ONLY to Supervisor/Admin.
- No password hashes or raw tokens EVER visible.

### Test Identifiers

| Element           | Data TestID                      |
|-------------------|----------------------------------|
| Filter User       | `userlog-filter-user`            |
| Filter Dates      | `userlog-filter-from` / `userlog-filter-to` |
| Filter Event Type | `userlog-filter-eventtype`       |
| Export CSV Btn    | `userlog-export-csv`             |
| Export Excel Btn  | `userlog-export-xls`             |
| Export PDF Btn    | `userlog-export-pdf`             |
| Print Btn         | `userlog-print`                  |
| Table Row         | `userlog-row-[rowIndex]`         |

---

## 6. User List

**Route Path:** `/admin/users`  
**Purpose:** Master list of users for management, bulk action, and access.  
**PRD Reference:** User List  
**Access Roles:** Supervisor (view), Administrator (full)  
**Page Summary:**  
- View/search/filter users
- Perform create/edit, bulk activate/deactivate, export.

### Layout & Structure
- Glass card, title "User Management"
- Filter bar above table, action buttons top right.

### Filter Fields

| Label         | Type           | Placeholder             |
|---------------|----------------|-------------------------|
| Name          | text           | "Search name..."        |
| Role          | select         | "All Roles"             |
| Status        | select         | "All Statuses"          |
| Last Login    | date           | (optional)              |

### Table Columns

| Column        | Data                                      |
|---------------|-------------------------------------------|
| [ ]           | Bulk select checkbox                      |
| Name          | Name + Avatar initial                     |
| Email         | email                                     |
| Role(s)       | badges (Standard, Supervisor, Admin)      |
| Status        | pill (Active/Inactive/Locked)             |
| Date Created  | ISO date                                  |
| Last Login    | ISO datetime or "-" if never              |
| Actions       | Edit / Activate / Deactivate / Unlock     |

### Actions  
- **Add User** (`userlist-add`) — opens new user form.
- **Import** (`userlist-import`) — open file dialog/modal.
- **Export** (`userlist-export`) — exports current list/filter as Excel/PDF.
- **Bulk Deactivate** (`userlist-deactivate`) — disables selected users.
- Row Actions:  
  - Edit User (`userlist-row-[rowIndex]-edit`)
  - Activate (`userlist-row-[rowIndex]-activate`)
  - Deactivate (`userlist-row-[rowIndex]-deactivate`)
  - Unlock (`userlist-row-[rowIndex]-unlock`)

### Validations & Feedback
- Disabling self: Disallow, show `You cannot deactivate your own account.`
- Bulk/row actions disable for users with higher privilege than self.

### Loading/Empty/Error
- Loading: Table skeleton.
- Empty: "No users match current filters."
- Error: `Unable to load users. Please try again.`

### Pagination
- Standard (page, next, prev, etc.); controls bottom right.

### Test Identifiers

| Element           | Data TestID                         |
|-------------------|-------------------------------------|
| Filter Name       | `userlist-filter-name`              |
| Filter Role       | `userlist-filter-role`              |
| Filter Status     | `userlist-filter-status`            |
| Filter LastLogin  | `userlist-filter-lastlogin`         |
| Add User Btn      | `userlist-add`                      |
| Import Btn        | `userlist-import`                   |
| Export Btn        | `userlist-export`                   |
| Bulk Deactivate   | `userlist-deactivate`               |
| Bulk Select Box   | `userlist-selectall` / `userlist-row-[rowIndex]-select` |
| Table Row         | `userlist-row-[rowIndex]`           |
| Edit Btn          | `userlist-row-[rowIndex]-edit`      |
| Activate Btn      | `userlist-row-[rowIndex]-activate`  |
| Deactivate Btn    | `userlist-row-[rowIndex]-deactivate`|
| Unlock Btn        | `userlist-row-[rowIndex]-unlock`    |

---

## 7. User Rights Management

**Route Path:** `/admin/roles`  
**Purpose:** View and update user roles and permissions matrix.  
**PRD Reference:** User Rights Management  
**Access Roles:** Administrator (full CRUD), Supervisor (view only)  
**Page Summary:**  
- Assign, edit, or revoke user/group permissions; create/edit/delete roles.

### Layout & Structure
- Section panel, "Role & Permissions Management"
- Role table (vertical: features/modules; horizontal: roles)
- Role selector dropdown (top), plus management buttons

### Table Structure
- Columns: [Feature/Module Name, Standard User, Supervisor, Administrator, [custom roles...]]
- Each cell:  
  - Checkbox: permission granted (view/edit/create/delete/export — layout as inline icons)
  - For each feature, all relevant permissions shown as row of checkboxes per role.

### Actions
- **Add Role** (`roles-add-role`)
- **Edit Role** (per row, `roles-edit-role`)
- **Delete Role** (with confirmation, cannot delete built-in roles)
- **Save Changes** (`roles-save-changes`)
- **Reset** (`roles-reset`)

### Validations & Feedback
- Unsaved changes warning on leave: “You have unsaved changes…”
- Cannot remove all admins from "User Management" or "Role Management"

### Loading/States
- Loading: Table skeleton; overlay on save.
- Error: `Unable to update permissions. Please try again.`
- Success: `Changes saved.` toast

### Security
- No Admin can lock self out of rights management.

### Test Identifiers

| Element           | Data TestID                         |
|-------------------|-------------------------------------|
| Role Dropdown     | `roles-selector`                    |
| Add Role Btn      | `roles-add-role`                    |
| Edit Role Btn     | `roles-edit-role-[roleId]`          |
| Delete Role Btn   | `roles-delete-role-[roleId]`        |
| Save Changes Btn  | `roles-save-changes`                |
| Reset Btn         | `roles-reset`                       |
| Permission Box    | `roles-perm-[feature]-[role]`       |

---

## 8. User Management

**Route Paths:**  
- List: `/admin/users` (**see "User List" above, consolidated as per PAGE CONSOLIDATION RULE**)  
- Entry (create/edit): `/admin/users/new` (create), `/admin/users/:userId` (edit)

**Purpose:** Create/edit user account details.  
**PRD Reference:** User Management (creation, edit, reset, activation, audit)  
**Access Roles:** Administrator (full), Supervisor (edit, no create/activate)  
**Page Summary:**  
- Responsive form for add/edit, always via explicit page route.
- Enter all key fields; assign status and roles.

### Form Fields

| Label            | Field Type      | Validation           | Placeholder              | Notes |
|------------------|----------------|----------------------|--------------------------|-------|
| Full Name        | text           | required             | "As it will appear on reports" |      |
| Email            | email          | required, valid, unique | "name@example.com"     |      |
| Phone            | tel            | optional, pattern    | "+91 9XXXXXXXXX"         | Shows error if pattern invalid |
| Roles            | multi-select   | required (min 1)     |                          | Standard, Supervisor, Admin   |
| Status           | radio          | required             |                          | Active, Inactive, Locked      |
| Password         | password       | required on create, optional on edit | "Leave blank to keep existing" | Enforce password policy |
| Confirm Password | password       | required on create/password change | "" | Must match Password |

- On edit: Password fields hidden unless "Change password" toggled.

### Actions
- **Primary:** "Save User" (`userform-save`)
- **Secondary:** "Cancel" (nav back to user list, `userform-cancel`)
- **Reset Password** (edit only, admin only) -> see "Admin Change Password" screen

### Validations
- Full Name: required, min 2 characters. `Full Name is required.`
- Email: required, must be unique systemwide and valid. `Email is required.` `Not a valid email address.` `This email is already used.`
- Password: min 10 chars, per "Password Change" screen.
- Confirm: must match
- Roles: at least one selected: `Select at least one role.`
- Status: required
- Phone: must be numbers/+, 7-15 digits

### Feedback/States
- Loading: Form disables, spinner in button.
- Success: Toast "User saved", redirect to user list.
- Error: Error text adjacent to field/server.

### Security
- No admin can edit or demote their *own* status or role.

### Test Identifiers

| Element             | Data TestID                   |
|---------------------|------------------------------|
| Form                | `userform-form`              |
| Full Name           | `userform-fullname`           |
| Email               | `userform-email`              |
| Phone               | `userform-phone`              |
| Role                | `userform-roles`              |
| Status              | `userform-status`             |
| Password            | `userform-password`           |
| Confirm Password    | `userform-confirm`            |
| Save Btn            | `userform-save`               |
| Cancel Btn          | `userform-cancel`             |

---

## 9. Legacy User Management

**Route Paths:**  
- List: `/admin/legacy-users`  
- Entry: `/admin/legacy-users/:legacyUserId`

**Purpose:** View and migrate/import legacy/historic user entries.  
**PRD Reference:** Legacy User Management  
**Access Roles:** Administrator

### List Page Fields
- Table columns:  
  - Legacy Username
  - Email (if available)
  - Status (Active/Obsolete)
  - Date Created
  - Migrated To (new user account reference, if migrated)
  - Actions:  
    - "Migrate" (`legacyuser-row-[rowIndex]-migrate`)
    - "View" (`legacyuser-row-[rowIndex]-view`)

- Search bar (name/email), status filter.

### Entry Page Fields
- All data fields above (readonly)
- "Migrate to New User" button (initiates create-new-user flow w/pre-filled data, disables when already mapped)

### Feedback/States
- If record is already migrated, "Migrate" button disabled.
- No edits to legacy fields allowed — only migration action.

### Test Identifiers

| Element             | Data TestID                     |
|---------------------|---------------------------------|
| List Table          | `legacyuser-table`              |
| Search Bar          | `legacyuser-search`             |
| Status Filter       | `legacyuser-status-filter`      |
| Migrate Btn         | `legacyuser-row-[rowIndex]-migrate` |
| View Btn            | `legacyuser-row-[rowIndex]-view` |
| Entry Migrate Btn   | `legacyuser-detail-migrate`     |

---

## 10. Admin Change Password

**Route Path:** `/admin/users/:userId/change-password`  
**Purpose:** Admin can forcibly change or reset any user's password  
**PRD Reference:** Admin Change Password  
**Access Roles:** Administrator

### Fields

| Label               | Field Type      | Validation                     | Notes                         |
|---------------------|----------------|--------------------------------|-------------------------------|
| User Selector       | autocomplete   | required                       | Prefilled by route param, if in user context |
| New Password        | password       | required, policy-enforced      | Must validate as per password policy |
| Confirm New Password| password       | required, matches above        |                               |

### Actions
- **Primary:** "Set New Password" (`adminpwchange-set`)
- **Secondary:** "Cancel" (`adminpwchange-cancel`)

### Feedback
- Error if field blank or invalid.
- Error if password policy not met.
- On success: "Password updated for user [username]."
- Audit log entry is written.

### Security
- No way to view user's old password.
- Directly triggers password reset, notifies user via email/SMS.

### Test Identifiers

| Element             | Data TestID                    |
|---------------------|-------------------------------|
| User Select Field   | `adminpwchange-user`           |
| New Password        | `adminpwchange-new`            |
| Confirm New         | `adminpwchange-confirm`        |
| Set Btn             | `adminpwchange-set`            |
| Cancel Btn          | `adminpwchange-cancel`         |

---

## 11. Page/User Info

**Route Path:** `/user-info` (also available as a profile sidebar/modal on all pages)  
**Purpose:** Let user see their profile, contact info, assigned roles  
**PRD Reference:** Page/User Info  
**Access Roles:** All users

### Fields
- Name, Email, Phone
- Current Roles (badges, e.g. Standard, Supervisor, Admin; list all assigned)
- User status (Active, Locked, Inactive)
- Date of creation, last login time
- "Edit Profile" (link to edit page, where supported)

### Layout  
- Sidebar modal or modal dialog with glass overlay and user avatar.

### Actions
- None, unless self-profile editing is enabled (see PRD [GAP: confirm self-editable fields]).

### Test Identifiers

| Element             | Data TestID                     |
|---------------------|---------------------------------|
| Modal/Panel         | `userinfo-panel`                |
| Name                | `userinfo-name`                 |
| Email               | `userinfo-email`                |
| Phone               | `userinfo-phone`                |
| Roles               | `userinfo-roles`                |
| Status              | `userinfo-status`               |
| Last Login          | `userinfo-lastlogin`            |
| Edit Profile Btn    | `userinfo-edit`                 |

---

## 12. UserLogReport

**Route Path:** `/admin/action-logs`  
**Purpose:** View and export the full user action log (not only auth)  
**PRD Reference:** UserLogReport (activity logs, audit context)  
**Access Roles:** Supervisor (view), Administrator (full, export)  
**Page Summary:**  
- Table with all user actions: entity, action, object.

### Filter Fields

| Label         | Type      | Placeholder        |
|---------------|-----------|--------------------|
| User          | autocomplete | "All users"   |
| Date (from)   | date      |                   |
| Date (to)     | date      |                   |
| Object Type   | select    | "All types"       |
| Action Type   | select    | "All actions"     |

### Table Columns

| Column        | Data                            |
|---------------|---------------------------------|
| User          | Name/avatar                     |
| Action        | e.g. Create, Edit, Delete, Login, Export|
| Object        | Entity/ID (e.g. User: 146)      |
| Date/Time     | Localized                       |
| Details       | Brief free-text, API route, etc.|

### Actions  
- **Export Excel** (`ulogs-export-xls`)
- **Export PDF** (`ulogs-export-pdf`)
- **Print** (`ulogs-print`)

### Empty, Loading, Error
- Standard as above.

### Test Identifiers

| Element             | Data TestID                     |
|---------------------|---------------------------------|
| Table               | `ulogs-table`                   |
| User Filter         | `ulogs-filter-user`             |
| Action Filter       | `ulogs-filter-action`           |
| Object Filter       | `ulogs-filter-object`           |
| Date Range Filter   | `ulogs-filter-from`, `ulogs-filter-to` |
| Export Excel        | `ulogs-export-xls`              |
| Export PDF          | `ulogs-export-pdf`              |
| Print Btn           | `ulogs-print`                   |

---

## 13. EmployeeList

**Route Path:** `/admin/employees`  
**Purpose:** HR staff listing/lookup/report export  
**PRD Reference:** EmployeeList  
**Access Roles:** Supervisor, Administrator

### Filter Fields

| Label         | Type       | Placeholder         |
|---------------|------------|---------------------|
| Name          | text       | "Search name..."    |
| Department    | select     | "All Departments"   |
| Section       | select     | "All Sections"      |
| Role          | select     | "All Roles"         |
| Status        | select     | "All Statuses"      |

### Table Columns

| Column        | Data                               |
|---------------|------------------------------------|
| Name          | Name + avatar                      |
| Email         | -                                  |
| Phone         | -                                  |
| Department    | department name                    |
| Section       | section name                       |
| Role(s)       | badges                             |
| Activation    | active/locked/inactive pill        |
| Hire Date     | date                               |
| Actions       | View/Export/Print                  |

### Actions  
- **Export Excel** (`emplist-export-xls`)
- **Print** (`emplist-print`)

### Empty/Loading/Error States  
- As elsewhere.

### Test Identifiers

| Element             | Data TestID                     |
|---------------------|---------------------------------|
| Table               | `emplist-table`                 |
| Filter Name         | `emplist-filter-name`           |
| Filter Dept         | `emplist-filter-dept`           |
| Filter Section      | `emplist-filter-sect`           |
| Filter Role         | `emplist-filter-role`           |
| Filter Status       | `emplist-filter-status`         |
| Export              | `emplist-export-xls`            |
| Print               | `emplist-print`                 |

---

## 14. Customer Management

### Consists of two consolidated screens:
- `/customers` — List/Search/Filter/Export + "+ New Customer"
- `/customers/:id` — Entry Form (Add/Edit)

**Entity:** Customer  
**CRUD Completeness Rule:** Satisfied: List + Entry Form specified.

---

### (a) Customer List

**Route Path:** `/customers`  
**Purpose:** List, search, filter, export, and manage customers.  
**PRD Reference:** Customer Management (including Create, Search, Deactivate, Merge), Report  
**Access Roles:** Standard, Supervisor, Administrator (Role-based on action)  
**Table Columns**

| Column            | Data                               |
|-------------------|------------------------------------|
| Name              | Name + avatar initials             |
| Customer ID       | code                               |
| Phone             | contact number 1                   |
| Email             | contact email                      |
| Address           | concatted, brief                   |
| Active            | status pill (Active/Inactive)      |
| Age Group         | e.g. 0–90, 91–180d, etc.           |
| Tags              | pills                              |
| Created           | date                               |
| Actions           | Edit / View / Deactivate / Merge   |

### Filter & Search

| Label         | Type             | Placeholder             |
|---------------|------------------|-------------------------|
| Search        | text             | "Name, phone, email…"   |
| Status        | select           | "All statuses"          |
| Age Group     | select           | "All age groups"        |
| Tag(s)        | multi-select     | "All tags"              |
| Date Created  | date range       |                         |

### Actions  
- **+ New Customer** (`custlist-add`)  
- **Import** (`custlist-import`)  
- **Export** (`custlist-export`)  
- **Bulk Deactivate** (`custlist-bulkdeact`)  
- **Row Edit** (`custlist-row-[rowIndex]-edit`)
- **Row View** (`custlist-row-[rowIndex]-view`)
- **Row Deactivate** (`custlist-row-[rowIndex]-deactivate`)
- **Row Merge** (`custlist-row-[rowIndex]-merge`)
- **Merge Duplicates**: batch select, then "Merge" (`custlist-bulkmerge`; opens dedicated merge dialog, see below)

### Loading/Empty/Error/Pagination:  
- As per user list.

### Test Identifiers

| Element               | Data TestID                      |
|-----------------------|----------------------------------|
| Table                 | `custlist-table`                 |
| Search Bar            | `custlist-search`                |
| Status Filter         | `custlist-status`                |
| Age Filter            | `custlist-age`                   |
| Tag Filter            | `custlist-tag`                   |
| Date Filter           | `custlist-date`                  |
| Add Button            | `custlist-add`                   |
| Import                | `custlist-import`                |
| Export                | `custlist-export`                |
| Bulk Deactivate       | `custlist-bulkdeact`             |
| Row Edit              | `custlist-row-[rowIndex]-edit`   |
| Row View              | `custlist-row-[rowIndex]-view`   |
| Row Deactivate        | `custlist-row-[rowIndex]-deactivate` |
| Row Merge             | `custlist-row-[rowIndex]-merge`  |
| Bulk Merge            | `custlist-bulkmerge`             |

---

### (b) Customer Entry Form

**Route Path:** `/customers/new` (add), `/customers/:id/edit` (edit)  
**Purpose:** Create or update customer master entry  
**PRD Reference:** Customer Management (entry, edit, merge, audit)  
**Access Roles:** Standard, Supervisor, Admin (role/admission varies by field)

#### Fields

| Label                | Type         | Validation                  | Placeholder         | Notes                 |
|----------------------|--------------|-----------------------------|---------------------|-----------------------|
| Customer Name        | text         | required, unique            | "Company/Individual"|                       |
| Phone                | tel          | required, unique            | "+91..."            | Validates duplicates  |
| Email                | email        | optional, unique            |                     |                       |
| Address Line 1       | text         | required                    | ""                  |                       |
| Address Line 2       | text         | optional                    | ""                  |                       |
| Address Line 3       | text         | optional                    | ""                  |                       |
| Emirate (Region)     | select       | required                    | "Select region..."  | From reference list   |
| Contact Person       | text         | optional                    |                     |                       |
| Contact Phone        | tel          | optional                    |                     |                       |
| Fax                  | text         | optional                    |                     |                       |
| Tags                 | multi-select | optional                    | "Add tags..."       | For search/filter     |
| Status               | radio        | required                    |                     | Active/Inactive       |

#### Actions
- **Save Customer** (`custform-save`)
- **Cancel** (`custform-cancel`)
- **Check Duplicates** (`custform-checkdup`; runs server duplicate check, highlights fields)
  
#### Validations
- All fields: Required fields show red error + message under field.
- Phone/email: Must be unique in system, warn if duplicate found.
- All addresses: At least one address line required.
- Emirate: Required.
- Tag: Only tags from allowed dictionary may be added, or offer "Create new tag" prompt.

#### API/Feedback
- API error feedback shown below field, or as toast for server/network issues.
- Loading disables form & shows spinner.
- On Success: Toast and redirect to `/customers`; list auto-filters to highlight new/updated entry.

### Test Identifiers

| Element                 | Data TestID                   |
|-------------------------|-------------------------------|
| Form                    | `custform-form`               |
| Name                    | `custform-name`               |
| Phone                   | `custform-phone`              |
| Email                   | `custform-email`              |
| Address1                | `custform-address1`           |
| Address2                | `custform-address2`           |
| Address3                | `custform-address3`           |
| Emirate                 | `custform-emirate`            |
| Contact Person          | `custform-contactperson`      |
| Contact Phone           | `custform-contactphone`       |
| Fax                     | `custform-fax`                |
| Tag(s)                  | `custform-tags`               |
| Status                  | `custform-status`             |
| Save Button             | `custform-save`               |
| Cancel Button           | `custform-cancel`             |
| Duplicate Check Button  | `custform-checkdup`           |

---

## 15. Supplier Management

### Consolidated List & Entry Pattern (per CRUD Completeness Rule)

---

### (a) Supplier List

**Route Path:** `/suppliers`  
**CRUD Elements:** List, search, filter, add, edit, deactivate, merge, bulk ops, export  
**PRD Reference:** Supplier Management (create, edit, deactivate, merge, report)  
**Access Roles:** Standard, Supervisor, Admin (varies by action)  

#### Table Columns

| Column            | Data                                 |
|-------------------|--------------------------------------|
| Name              | name + avatar initials               |
| Supplier ID       | code                                 |
| Phone             | contact number 1                     |
| Email             | contact email                        |
| Address           | brief                                |
| Category          | category/group                       |
| Active            | status pill (Active/Inactive)        |
| Age Group         | e.g. 0–90, 91–180d, etc.             |
| Tags              | pills                                |
| Created           | date                                 |
| Actions           | Edit / View / Deactivate / Merge     |

#### Filters

| Label         | Type         | Placeholder             |
|---------------|--------------|-------------------------|
| Search        | text         | "Name, phone, email…"   |
| Status        | select       | "All statuses"          |
| Age           | select       | "All age groups"        |
| Tag(s)        | multi-select | "All tags"              |
| Category      | select       | "All categories"        |
| Date Created  | date range   |                         |

#### Actions  
- **+ New Supplier** (`supplist-add`)  
- **Import** (`supplist-import`)  
- **Export** (`supplist-export`)  
- **Bulk Deactivate** (`supplist-bulkdeact`)  
- **Row Edit** (`supplist-row-[rowIndex]-edit`)
- **Row View** (`supplist-row-[rowIndex]-view`)
- **Row Deactivate** (`supplist-row-[rowIndex]-deactivate`)
- **Row Merge** (`supplist-row-[rowIndex]-merge`)
- **Bulk Merge** (`supplist-bulkmerge`)

#### Loading/Empty/Error/Pagination:  
Standard as above.

#### Test Identifiers

| Element               | Data TestID                      |
|-----------------------|----------------------------------|
| Table                 | `supplist-table`                 |
| Search Bar            | `supplist-search`                |
| Status Filter         | `supplist-status`                |
| Age Filter            | `supplist-age`                   |
| Tag Filter            | `supplist-tag`                   |
| Category Filter       | `supplist-category`              |
| Date Filter           | `supplist-date`                  |
| Add Button            | `supplist-add`                   |
| Import                | `supplist-import`                |
| Export                | `supplist-export`                |
| Bulk Deactivate       | `supplist-bulkdeact`             |
| Row Edit              | `supplist-row-[rowIndex]-edit`   |
| Row View              | `supplist-row-[rowIndex]-view`   |
| Row Deactivate        | `supplist-row-[rowIndex]-deactivate` |
| Row Merge             | `supplist-row-[rowIndex]-merge`  |
| Bulk Merge            | `supplist-bulkmerge`             |

---

### (b) Supplier Entry Form

**Route Path:** `/suppliers/new` (add), `/suppliers/:id/edit` (edit)  
**Purpose:** Create or update supplier record  
**Fields**

| Label                | Type         | Validation                  | Placeholder         | Notes   |
|----------------------|--------------|-----------------------------|---------------------|---------|
| Supplier Name        | text         | required, unique            |                     |         |
| Phone                | tel          | required, unique            |                     |         |
| Email                | email        | optional, unique            |                     |         |
| Address Line 1       | text         | required                    |                     |         |
| Address Line 2       | text         | optional                    |                     |         |
| Address Line 3       | text         | optional                    |                     |         |
| Emirate (Region)     | select       | required                    |                     |         |
| Contact Person       | text         | optional                    |                     |         |
| Contact Phone        | tel          | optional                    |                     |         |
| Fax                  | text         | optional                    |                     |         |
| Category             | select       | required                    | "Supplier category…"| From lookup list |
| Tags                 | multi-select | optional                    | "Add tags..."       |         |
| Status               | radio        | required                    |                     | Active/Inactive   |

#### Actions
- **Save Supplier** (`supform-save`)
- **Cancel** (`supform-cancel`)
- **Check Duplicates** (`supform-checkdup`)
  
#### Validations
- Same as Customer above.

#### API/Feedback
- As above.

### Test Identifiers

| Element                 | Data TestID                   |
|-------------------------|-------------------------------|
| Form                    | `supform-form`                |
| Name                    | `supform-name`                |
| Phone                   | `supform-phone`               |
| Email                   | `supform-email`               |
| Address1                | `supform-address1`            |
| Address2                | `supform-address2`            |
| Address3                | `supform-address3`            |
| Emirate                 | `supform-emirate`             |
| Contact Person          | `supform-contactperson`       |
| Contact Phone           | `supform-contactphone`        |
| Fax                     | `supform-fax`                 |
| Tag(s)                  | `supform-tags`                |
| Category                | `supform-category`            |
| Status                  | `supform-status`              |
| Save Button             | `supform-save`                |
| Cancel Button           | `supform-cancel`              |
| Duplicate Check Button  | `supform-checkdup`            |

---

## 16. Contact Entry

### List & Entry Pattern for Contacts

---

### (a) Contact List

**Route Path:** `/contacts`  
**Purpose:** List, search, filter, and manage customer and supplier contacts  
**PRD Reference:** Contact Entry, Contact Search, Advanced Filter, Bulk Import  
**Access Roles:** Standard, Supervisor, Admin (varies)

#### Table Columns

| Column            | Data                                 |
|-------------------|--------------------------------------|
| Contact Name      | contact initials, name               |
| Phone             | phone                                |
| Email             | email                                |
| Linked Entity     | Customer/Supplier name, badge        |
| Role              | badge ("Manager", "Sales", etc.)     |
| Status            | Active/Inactive pill                 |
| Created           | date                                 |
| Actions           | Edit / Deactivate                    |

#### Filters

| Label         | Type     | Placeholder              |
|---------------|----------|--------------------------|
| Search        | text     | "Name, phone, entity..." |
| Status        | select   | "All"                    |
| Entity Type   | select   | "All, Customer, Supplier"|
| Role          | select   | "All Roles"              |

#### Actions  
- **+ New Contact** (`contactlist-add`)
- **Import** (`contactlist-import`)
- **Export** (`contactlist-export`)
- **Bulk Deactivate** (`contactlist-bulkdeact`)
- **Row Edit** (`contactlist-row-[rowIndex]-edit`)
- **Row Deactivate** (`contactlist-row-[rowIndex]-deactivate`)

#### Loading/Empty/Error/Pagination:  
Standard as above.

### Test Identifiers

| Element            | Data TestID                     |
|--------------------|---------------------------------|
| Table              | `contactlist-table`             |
| Search             | `contactlist-search`            |
| Status Filter      | `contactlist-status`            |
| Entity Filter      | `contactlist-entity`            |
| Role Filter        | `contactlist-role`              |
| Add                | `contactlist-add`               |
| Import             | `contactlist-import`            |
| Export             | `contactlist-export`            |
| Bulk Deactivate    | `contactlist-bulkdeact`         |
| Row Edit           | `contactlist-row-[rowIndex]-edit`       |
| Row Deactivate     | `contactlist-row-[rowIndex]-deactivate` |

---

### (b) Contact Entry Form

**Route Path:** `/contacts/new`, `/contacts/:id/edit`

| Label                 | Type         | Validation              | Placeholder         |
|-----------------------|--------------|-------------------------|---------------------|
| Contact Name          | text         | required, unique        |                     |
| Linked Entity         | search/autocomplete | required   |                     |
| Phone                 | tel          | required, unique        |                     |
| Email                 | email        | optional, unique        |                     |
| Role                  | select       | required                | "Contact role..."   |
| Address               | text         | optional                |                     |
| Status                | radio        | required                |                     |

#### Actions
- **Save Contact** (`contactform-save`)
- **Cancel** (`contactform-cancel`)
- **Check Duplicates** (`contactform-checkdup`)

#### Validations
- If similar contact exists (name/phone/email/address overlap), warning at submission.

### Test Identifiers

| Element                 | Data TestID             |
|-------------------------|-------------------------|
| Form                    | `contactform-form`      |
| Name                    | `contactform-name`      |
| Linked Entity           | `contactform-entity`    |
| Phone                   | `contactform-phone`     |
| Email                   | `contactform-email`     |
| Role                    | `contactform-role`      |
| Address                 | `contactform-address`   |
| Status                  | `contactform-status`    |
| Save Button             | `contactform-save`      |
| Cancel Button           | `contactform-cancel`    |
| Duplicate Check Button  | `contactform-checkdup`  |

---

## 17. Contact Search

- This is consolidated into `/contacts` (see above); all search/filter fields covered.

---

## 18. Customer Help

**Route Path:** `/customers/help`

**Purpose:** Search/guided help for finding a customer record  
**PRD Reference:** Customer Help  
**Access Roles:** All active users

### Panels/Widgets

- Search prompt: "Find a customer by name, phone, ID, or recent."
- Search bar, quick result list.
- Recent/frequent customers quick-pick table.
- Section: Tips for narrowing search ("Try partial name, city, or phone.")

### Table Columns (quick results)

| Column     | Data                     |
|------------|--------------------------|
| Name       |                         |
| Customer ID|                         |
| Phone      |                         |
| Address    |                         |
| Last Active| date                    |
| Status     | pill                    |

- Clicking row: navigates to customer detail page.

### Empty/Loading/Error
- Empty: "No matching customer records."  
- Loading: Skeleton rows

### Test Identifiers

| Element                  | Data TestID                  |
|--------------------------|-----------------------------|
| Search Bar               | `custhelp-search`           |
| Clear Recent Btn         | `custhelp-clearrecents`     |
| Table Row                | `custhelp-row-[rowIndex]`   |

---

## 19. Supplier Help

**Route Path:** `/suppliers/help`  
**Purpose:** Rapid search/guided help for finding supplier records  
**PRD Reference:** Supplier Help  
**Access Roles:** All active users

### Panels/Widgets

- Search as above, but referencing suppliers
- Filters: Category, status, recent/frequent

### Table Columns (quick results)

| Column         | Data                     |
|----------------|--------------------------|
| Name           |                         |
| Supplier ID    |                         |
| Phone          |                         |
| Address        |                         |
| Category       |                         |
| Status         | pill                    |

- Clicking row: navigates to supplier detail

### Empty/Loading/Error
- As above.

### Test Identifiers

| Element                  | Data TestID                  |
|--------------------------|-----------------------------|
| Search Bar               | `supphelp-search`           |
| Table Row                | `supphelp-row-[rowIndex]`   |

---

## 20. Customer Vehicle Entry

### List & Entry Pattern (vehicles per customer)

---

### (a) Vehicle List

**Route Path:** `/customers/:customerId/vehicles`  
**Purpose:** Manage vehicles linked to a customer  
**PRD Reference:** Customer Vehicle Entry  
**Access Roles:** Standard, Supervisor, Admin

#### Table Columns

| Column            | Data                         |
|-------------------|-----------------------------|
| Registration      | registration string/id       |
| Make/Model        | make, model                  |
| Year              | year                         |
| Linked Customer   | customer name                |
| Status            | pill                         |
| Actions           | Edit / Deactivate            |

#### Filters

| Label         | Type         | Placeholder         |
|---------------|--------------|---------------------|
| Search        | text         | reg, make, model... |
| Status        | select       | "All statuses"      |

#### Actions
- **+ Add Vehicle** (`vehlist-add`)
- **Bulk Deactivate** (`vehlist-bulkdeact`)
- **Row Edit** (`vehlist-row-[rowIndex]-edit`)
- **Row Deactivate** (`vehlist-row-[rowIndex]-deactivate`)
- **Row Unlink** (`vehlist-row-[rowIndex]-unlink`) [if allowed]

---

### (b) Vehicle Entry Form

**Route Path:** `/customers/:customerId/vehicles/new`, `/customers/:customerId/vehicles/:vehId/edit`

| Label            | Type         | Validation             | Placeholder         |
|------------------|-------------|------------------------|---------------------|
| Registration No. | text        | required, unique       |                     |
| Make             | text        | required               |                     |
| Model            | text        | optional               |                     |
| Year             | numeric     | optional (YYYY)        |                     |
| Linked Customer  | autocomplete| required, fixed        | prefilled           |
| Status           | radio       | required               |                     |

#### Actions
- **Save Vehicle** (`vehform-save`)
- **Cancel** (`vehform-cancel`)
- **Check Duplicates** (`vehform-checkdup`)

---

#### Test Identifiers

| Element                | Data TestID                     |
|------------------------|---------------------------------|
| Table                  | `vehlist-table`                 |
| Search                 | `vehlist-search`                |
| Status Filter          | `vehlist-status`                |
| Add Btn                | `vehlist-add`                   |
| Bulk Deact             | `vehlist-bulkdeact`             |
| Row Edit               | `vehlist-row-[rowIndex]-edit`   |
| Row Deactivate         | `vehlist-row-[rowIndex]-deactivate` |
| Form                   | `vehform-form`                  |
| Registration           | `vehform-reg`                   |
| Make                   | `vehform-make`                  |
| Model                  | `vehform-model`                 |
| Year                   | `vehform-year`                  |
| Customer               | `vehform-customer`              |
| Status                 | `vehform-status`                |
| Save Btn               | `vehform-save`                  |
| Cancel Btn             | `vehform-cancel`                |
| Check Dups             | `vehform-checkdup`              |

---

## 21. Customer Vehicle Help

**Route Path:** `/customers/:customerId/vehicles/help`  
**Purpose:** Help component for quickly filtering/selecting among customer's vehicles  
**PRD Reference:** Customer Vehicle Help  
**Access Roles:** Standard, Supervisor

### Panels/Widgets

- Search bar (registration, model, make)
- Filter (active/inactive)
- Table:
  - Registration | Model | Year | Status

- Clicking row: selects vehicle context for parent form/process

### Test Identifiers

| Element                  | Data TestID                  |
|--------------------------|-----------------------------|
| Search Bar               | `vehhelp-search`            |
| Table Row                | `vehhelp-row-[rowIndex]`    |

---

## 22. Merge Customer Duplicates

**Route Path:** `/customers/merge-duplicates`  
**Purpose:** Identify, review, and merge potential duplicate customer records  
**PRD Reference:** Merge Customer Duplicates, Data Quality  
**Access Roles:** Supervisor, Administrator

### Layout & Structure
- List of suspected duplicates, each expandable to show fields for both/all
- User selects "Retain" values field-by-field or "Master" record
- Confirmation step required before merge

### Fields Displayed (for each duplicate group)

| Field            | Side-by-side with each record; radio/select for "Retain" |
|------------------|---------------------------------------------------------|
| Name             |                                                         |
| Phone            |                                                         |
| Email            |                                                         |
| Address          |                                                         |
| Tags             |                                                         |
| Linked Vehicles  |                                                         |
| Notes            |                                                         |
| Age              |                                                         |
| Status           |                                                         |

### Actions  
- **Review Duplicates** (`mergecust-review-[groupId]`)
- **Merge Selected** (`mergecust-merge-[groupId]`)
- **Cancel** (`mergecust-cancel`)
- **Resolve Conflicts** — Per field, user must resolve conflicts before merging.

### Validations
- Must select value for all conflicting fields.
- Cannot merge if selection incomplete.
- On merge: disabling of involved records, new master created.

### Error/Feedback
- API/network errors shown in context.
- Merge completion toasts and audit logged.

### Test Identifiers

| Element                   | Data TestID                      |
|---------------------------|----------------------------------|
| List Group                | `mergecust-group-[groupId]`      |
| Field Select              | `mergecust-field-[groupId]-[field]` |
| Merge Btn                 | `mergecust-merge-[groupId]`      |
| Cancel Btn                | `mergecust-cancel`               |

---

## 23. Merge Supplier Duplicates

**Route Path:** `/suppliers/merge-duplicates`  
**Purpose:** As above, for supplier records  
**PRD Reference:** Merge Supplier Duplicates  
**Access Roles:** Supervisor, Admin

### Structure is identical to Customer Duplicates screen  
- TestIDs: replace `mergecust-` with `mergesupp-` accordingly

---

## 24. Merge Vehicle Duplicates

**Route Path:** `/vehicles/merge-duplicates`  
**Purpose:** Review/merge duplicate vehicle entries  
**PRD Reference:** Merge Vehicle Duplicates  
**Access Roles:** Supervisor, Admin

### Structure is identical to above  
- TestIDs: replace `mergecust-` with `mergeveh-` accordingly

---

## 25. Customer/Supplier List Report

**Route Path:** `/reports/customer-supplier-list`  
**Purpose:** Generate/export customer/supplier master reports  
**PRD Reference:** Customer/Supplier List Report  
**Access Roles:** Standard (view/export own), Supervisor/Admin (full)

### Filter Fields

| Label          | Type          | Placeholder      |
|----------------|---------------|------------------|
| Entity         | select        | Both/Customers/Suppliers |
| Status         | select        | All              |
| Date Added     | date range    |                  |
| Tag            | multi-select  |                  |
| Age Bucket     | select        | e.g. 0–90d, 91–180d, etc. |

### Table Columns

| Column         | Data                |
|----------------|---------------------|
| Name           |                     |
| Type (C/S)     |                     |
| ID             |                     |
| Phone          |                     |
| Email          |                     |
| Address        |                     |
| Tags           |                     |
| Status         |                     |
| Date Added     |                     |

### Actions
- **Export PDF** (`cslr-export-pdf`)
- **Export Excel** (`cslr-export-xls`)
- **Print** (`cslr-print`)

### Empty/Loading/Error
- Standard

### Test Identifiers

| Element                | Data TestID           |
|------------------------|----------------------|
| Filter Entity          | `cslr-entity`        |
| Filter Status          | `cslr-status`        |
| Filter Date Added      | `cslr-date`          |
| Filter Tag             | `cslr-tag`           |
| Filter Age             | `cslr-age`           |
| Export PDF             | `cslr-export-pdf`    |
| Export Excel           | `cslr-export-xls`    |
| Print                  | `cslr-print`         |

---

## COVERAGE CHECK

| Screen Name                        | Covered? |
|-------------------------------------|----------|
| 1. Sign In                         | ✅       |
| 2. Password Change                 | ✅       |
| 3. ODBC Sign In                    | ✅       |
| 4. Bypass/Forgot Password          | ✅       |
| 5. User Log Report                 | ✅       |
| 6. User List                       | ✅       |
| 7. User Rights Management          | ✅       |
| 8. User Management                 | ✅       |
| 9. Legacy User Management          | ✅       |
| 10. Admin Change Password          | ✅       |
| 11. Page/User Info                 | ✅       |
| 12. UserLogReport                  | ✅       |
| 13. EmployeeList                   | ✅       |
| 14. Customer Management            | ✅       |
| 15. Supplier Management            | ✅       |
| 16. Contact Entry                  | ✅       |
| 17. Contact Search                 | ✅       |
| 18. Customer Help                  | ✅       |
| 19. Supplier Help                  | ✅       |
| 20. Customer Vehicle Entry         | ✅       |
| 21. Customer Vehicle Help          | ✅       |
| 22. Merge Customer Duplicates      | ✅       |
| 23. Merge Supplier Duplicates      | ✅       |
| 24. Merge Vehicle Duplicates       | ✅       |
| 25. Customer/Supplier List Report  | ✅       |

---

---

# FRONTEND_SPEC.md

---

## 26. Check Duplicate Contacts

### Route

- `/contacts/duplicates`
- Modal popover version: `/contacts/duplicates/resolve` (opened for a selected duplicate group)

### Purpose

Identify, display, and resolve potential duplicate contact records based on similar names, addresses, phone numbers, or email addresses. Enables supervisors/administrators to review and manage duplicates for cleaner data.

**PRD Reference:** FR-72, FR-59, FR-55, US-54, US-55, US-66  
**Access Roles:** Supervisor, Administrator

### Main Components

| Component                    | Description                                                                                     |
|------------------------------|-------------------------------------------------------------------------------------------------|
| DuplicateGroupTable          | Table listing detected duplicate contact groups.                                                |
| DuplicateDetailsPanel/Modal  | Shows detailed side-by-side comparison of contacts in a duplicate group for merge actions.      |
| FiltersBar                   | Filters by matching type (name, email, phone), status (resolved/unresolved), date added.        |
| ActionsBar                   | Buttons for 'Merge', 'Flag as Not Duplicate', 'Export Results'.                                |

### Layout/Visual

- Centered glass card container with `var(--radius-xl)` and blur.
- Panel contains table of duplicate groups with sticky header and floating merge panel (slide-in modal) for comparison/merge.

### Fields / Table Columns

**DuplicateGroupTable**:

| Column              | Type     | UI Spec                                                         |
|---------------------|----------|-----------------------------------------------------------------|
| Group ID            | Text     | Hidden for user, used for test IDs; not visible in UI           |
| Primary Reference   | Text     | Name or email/phone of one contact in group, clickable          |
| Type of Match       | Badge    | e.g. "Phone", "Email", "Name" (colored using status-pill)       |
| # Contacts          | Number   | Number of contact records in this group                         |
| Created Date        | Date     | Date the first (or all) were entered                            |
| Last Updated        | Date     | Date of last update in this group                               |
| Actions             | Buttons  | 'Review/Merge' (primary), 'Flag as Not Duplicate' (ghost)       |

**DuplicateDetailsPanel** (when a group is selected):

| Field/Column      | Description                                                         |
|-------------------|---------------------------------------------------------------------|
| Contact ID        | Non-editable, internal                                             |
| Name              | Readability-focused, bold on conflicts                             |
| Email             | As above                                                           |
| Phone(s)          | All available phone numbers                                        |
| Organization      | Customer/supplier link (if exists)                                |
| Status            | 'Active', 'Inactive', 'Duplicate', etc.                            |
| Entry Date        | Creation timestamp                                                 |
| Last Modified     | Modified timestamp, by whom                                        |
| Merge/review flag | Checkbox to include/exclude in merge                               |
| Conflict fields   | If values disagree (e.g. different emails), both shown, editable   |

### Action Buttons & Icons

- [Merge Selected] (`primary-btn`) — merge all checked contacts into a master, launches confirm modal
- [Flag as Not Duplicate] (`secondary-btn`) — removes these from the duplicate group, moves to resolved
- [Export Results] (`export-btn`) — export current list/table to CSV/XLS/PDF
- [Refresh] (`ghost-btn`) — rerun duplicate check

**Icons:**  
- All icons are Lucide outline, 16px, with muted color.

### Form Validations & Error Messages

- On merge: If required master fields are empty or conflict unresolved, show error: "Please resolve all conflicting fields before merging."
- On flag as not duplicate: Confirmation modal, "This will cancel any merge action for this group. Proceed?"
- On API error: Banner above table, "Error loading duplicate contacts. [Retry]"

### Loading, Empty, Error, States

- **Loading:** Table skeleton loader (skeleton rows), search/filter bar shimmer
- **Empty:** "No duplicate contacts found. Your data is clean!"
- **Error:** Error banner with retry

### Interactions

- Clicking 'Review/Merge' opens modal panel for group (data-testid='dupcontacts-details-open').
- In modal, changes in merge selection update final merged preview.
- After successful merge or flag, UI updates in place and shows a success toast.

### Accessibility

- Table headers have scope.
- Modal and all buttons have explicit, readable ARIA labels.

#### Test Identifiers

- data-testid='dupcontacts-table'
- data-testid='dupcontacts-filterbar'
- data-testid='dupcontacts-actionsbar-merge'
- data-testid='dupcontacts-actionsbar-export'
- data-testid='dupcontacts-details-modal'
- data-testid='dupcontacts-details-merge-btn'
- data-testid='dupcontacts-details-flagnotdup-btn'
- data-testid='dupcontacts-details-field-[fieldname]'
- data-testid='dupcontacts-table-row-[groupid]'
- data-testid='dupcontacts-refresh-btn'
- data-testid='dupcontacts-error-banner'

---

## 27. Cust Age Wise

### Route

- `/customers/agewise`

### Purpose

Show an age-wise categorization or report of customer accounts for finance/supervisor review and follow-up, with export options.

**PRD Reference:** US-60, FR-68  
**Access Roles:** Standard User, Supervisor

### Main Components

- AgeWiseSummaryTable — main table of customers grouped by age buckets.
- FiltersBar — input for filter by bucket/period, name, status
- ExportActionsBar — PDF, Excel export

### Fields / Table Columns

| Column             | Type             | UI Spec                              |
|--------------------|------------------|--------------------------------------|
| Customer Name      | Text, clickable  | Always shown, bold                   |
| Contact            | Text             | Primary phone/email                  |
| Account Age Bucket | Pill/Badge       | '0–30', '31–60', '61–90', '91+', color-coded |
| Outstanding Days   | Number           | Computed days, right-aligned         |
| Status             | Pill/Badge       | 'Active', 'Inactive', etc            |
| Amount Due         | Currency         | &#8377;-format, right-aligned         |
| Last Payment Date  | Date             | ISO display, e.g. 2026-05-14         |

### Action Buttons

- [Export Table] (`export-btn`) — downloads current view
- [Refresh] (`ghost-btn`)
- [Search/Filter] — inline in filters bar

### Form Validations & Error Messages

- Date filter: both from and to required if used.
- On failed export: error "Could not export age-wise report."

### Loading, Empty, Error, States

- **Loading:** Table skeleton, shimmer on filters
- **Empty:** "No customers fall in this age group and filter."
- **Error:** Error banner + retry button

### Interactions

- Clicking on customer name opens `/customers/{customerId}`
- Filtering inline by bucket, status, name.

#### Test Identifiers

- data-testid='custagewise-table'
- data-testid='custagewise-filterbar'
- data-testid='custagewise-export-btn'
- data-testid='custagewise-refresh-btn'
- data-testid='custagewise-row-[customerid]'
- data-testid='custagewise-empty'
- data-testid='custagewise-error'

---

## 28. Items Help New

### Route

- `/items/help`

### Purpose

Help/lookup screen for quickly searching, filtering, and selecting items/products, with full detail for selection in other entry screens elsewhere (orders, inventory, etc.).

**PRD Reference:** FR-66  
**Access Roles:** Standard User

### Main Components

- SearchBar — entering item description, code, or tags
- ItemResultsTable — list of matched items
- ItemDetailsDrawer (optional)

### Fields / Table Columns

| Field/Column     | Type      | UI Spec                                  |
|------------------|-----------|------------------------------------------|
| Item Code        | Text      | Searchable column                        |
| Description      | Text      | Main display, bold                       |
| Category         | Badge     | From ItemType/Category                   |
| Unit             | Text      | Shows Denom                              |
| Location         | Text      | For warehouse/location                   |
| Current Stock    | Number    | Inline, color-coded warning if low stock |
| Cost             | Currency  | For reference only                       |
| Tags             | Chips     | Shows tags/tag1–tag4, comma separated    |

### Action Buttons

- [Select Item] (icon on row, right side)
- [View Details] (optional; opens drawer with expanded info)
- [Export Results] (`ghost-btn`), [Clear] (resets search fields)

### Form Validations & Error Messages

- At least one search criteria required: "Please enter an item description, code, or tag."
- On failed lookup: "No matching items found."

### Loading, Empty, Error, States

- **Loading:** 5-row skeleton with shimmer
- **Empty:** "No items match the search."
- **Error:** Banner, "Unable to load items. [Retry]"

### Interactions

- Any list row can be selected via [Select] icon (returns item for parent form context if embedded).
- If used for autocomplete in other screens, emits selected item and autocloses drawer.

#### Test Identifiers

- data-testid='itemshelp-table'
- data-testid='itemshelp-search'
- data-testid='itemshelp-select-btn-[itemid]'
- data-testid='itemshelp-details-drawer-[itemid]'
- data-testid='itemshelp-export-btn'
- data-testid='itemshelp-clear-btn'
- data-testid='itemshelp-empty'
- data-testid='itemshelp-error'

---

## 29. Local Porder Search

### Route

- `/purchases/local/search`

### Purpose

Search and review local purchase orders that are relevant to customers or suppliers, supporting filters and exports.  

**PRD Reference:** FR-69, FR-170  
**Access Roles:** Standard User, Supervisor

### Main Components

- SearchBar with filters — date range, supplier, item, order status.
- PurchOrdersTable — result grid with purchase order summary.
- OrderDetailsPanel (opened on row click)

### Fields / Table Columns

| Column         | Type       | UI Spec                                         |
|----------------|------------|-------------------------------------------------|
| P.O. Number    | Text       | Clickable, opens panel                          |
| Supplier Name  | Text       | Main display                                    |
| Order Date     | Date       | Formatted as yyyy-mm-dd                         |
| Status         | Badge/pill | Color-coded (pending, approved, received...)    |
| Total Amount   | Currency   | Right-aligned                                   |
| Item Count     | Number     | Number of items in order                        |
| Actions        | Icons      | View Details (eye), (future: print/export)      |

### Action Buttons

- [Export Results] (`export-btn`) — PDF, Excel
- [View Details] (icon on each row)

### Form Validations & Error Messages

- Date validation: if fromDate > toDate: "Start date must be before end date."
- On error: "Could not retrieve purchase orders."

### Loading, Empty, Error, States

- **Loading:** Table skeleton
- **Empty:** "No local purchase orders match your criteria."
- **Error:** Error banner with retry

### Interactions

- Row click opens OrderDetailsPanel
- Export applies current filters

#### Test Identifiers

- data-testid='localporders-table'
- data-testid='localporders-filters'
- data-testid='localporders-export-btn'
- data-testid='localporders-row-[id]'
- data-testid='localporders-viewdetails-btn-[id]'
- data-testid='localporders-details-panel'
- data-testid='localporders-empty'
- data-testid='localporders-error'

---

## 30. Menu

### Route

- `/customers-suppliers/menu` and left/nav sidebar everywhere

### Purpose

Provides navigation for users to all customer and supplier management features.  
**PRD Reference:** FR-74  
**Access Roles:** All active users

### Components

- MenuList (vertical, glassmorphic nav card)
- Section headings: Customer, Supplier, Vehicles, Reports
- Quick links/buttons to each relevant submodule:
    - Add/View Customers
    - Add/View Suppliers
    - Customer Vehicles
    - Merge Duplicates (each type)
    - Age Wise Reports
    - Documents/Attachments
    - Settings

### Action Buttons

- Navigation link buttons to each screen above

### Interaction

- Keyboard and click navigation; focus rings per accessibility standards

#### Test Identifiers

- data-testid='menu-nav'
- data-testid='menu-link-[route]'

---

## 31. Supp Age Wise

### Route

- `/suppliers/agewise`

### Purpose

Display age-wise summary/categorization of suppliers and their outstanding balances for supervisor/finance/management use.

**PRD Reference:** US-60, FR-68  
**Access Roles:** Standard User, Supervisor

### Components

- AgeWiseSupplierTable (main content)
- Filters: age bucket, status, category, name

### Fields / Table Columns

| Column             | Type     | UI Spec                      |
|--------------------|----------|------------------------------|
| Supplier Name      | Text     | Main, clickable              |
| Category           | Badge    | e.g. 'Local', 'Foreign'      |
| Age Bucket         | Pill     | '0–30', '31–60', etc.        |
| Outstanding Days   | Number   | Right-aligned                |
| Status             | Pill     | 'Active', 'Inactive'         |
| Amount Due         | Currency | Right-aligned, highlight due |
| Last Payment Date  | Date     | ISO                          |

### Actions

- [Export] (`export-btn`)
- [Search/Filter]

### States/Feedback

- Loading: Table skeleton
- Empty: "No suppliers found for selected criteria."
- Error: Banner

#### Test Identifiers

- data-testid='suppagewise-table'
- data-testid='suppagewise-filterbar'
- data-testid='suppagewise-export-btn'
- data-testid='suppagewise-empty'
- data-testid='suppagewise-error'

---

## 32. Document Help

### Route

- `/documents/help`

### Purpose

Assist users in finding and referencing documents related to customers or suppliers, often used as a lookup modal in entry/edit flows.

**PRD Reference:** FR-73  
**Access Roles:** Standard User, Supervisor

### Components

- SearchBar: document ID, customer/supplier, document type
- DocumentHelpTable: results
- DocumentDetailsPanel/Drawer: on row/view click

### Table Fields

| Column            | UI       | Description                              |
|-------------------|----------|------------------------------------------|
| Document ID       | Text     | Clickable, opens details                 |
| Linked Entity     | Text     | Customer/Supplier, clickable             |
| Type              | Badge    | Document category/type                   |
| Added/Uploaded By | Text     | User                                    |
| Upload Date       | Date     | Localized format                        |
| Actions           | Buttons  | View, Download                           |

### Action Buttons

- [View] icon per row (opens details)
- [Download] per row
- [Search]
- [Export] (visible if more than 10 results)

### Validations & Error

- At least one search field filled: "Enter at least one search or filter criterion."
- Error loading docs: banner

### Loading/Empty/Error

Loading: shimmer  
Empty: "No documents found for your search."  
Error: banner

#### Test Identifiers

- data-testid='documenthelp-table'
- data-testid='documenthelp-searchbar'
- data-testid='documenthelp-view-btn-[docid]'
- data-testid='documenthelp-download-btn-[docid]'
- data-testid='documenthelp-empty'
- data-testid='documenthelp-error'

---

## 33. Main Menu (OLD & Current)

### Route

- `/menu` (top-level), sidebar/persistent nav throughout

### Purpose

The application-wide navigation hub for all modules—customer/supplier, finance, sales, reports, admin.

**PRD Reference:** FR-74  
**Access Roles:** All roles, actions contextual to privilege

### Visuals/Structure

- Glassmorphic vertical menu bar (if sidebar) or a horizontal nav glass bar pinned to the top as in the sample screens, collapsible or auto-hiding on small screens.
- Menu sections, with Lucide outline icons

### Sections

- Dashboard
- Customers  
    - List, Add New, Merge Duplicates, Agewise, etc
- Suppliers
- Vehicles
- Sales, Purchase, Inventory, Job Orders, Banking, Ledger, Admin, Settings, Help

### Actions

- Each nav item is a button/link
- Active menu section highlighted (by color-pill, underline, or bold + bg)

### Accessibility

- All links have ARIA-label; keyboard accessible

#### Test Identifiers

- data-testid='mainmenu-nav'
- data-testid='mainmenu-link-[route]'
- data-testid='mainmenu-section-[modulename]'

---

## 34. Declare Module

### Route

- `/declare`

### Purpose

Manage declared/config items linked to customer/supplier operations (config values, statuses, settings).

**PRD Reference:** FR-75  
**Access Roles:** Supervisor, Administrator

### Pages

- Declare List (`/declare`)
- Declare Entry/Edit (`/declare/:id`)

### Main Components

- Table: list of declared configs
- Entry/Edit Form

#### Declare List (Table Columns)

| Column           | UI    | Description                |
|------------------|-------|----------------------------|
| Name/Key         | Text  | Identifier                 |
| Value            | Text  | Current value or display    |
| Type/Category    | Badge | e.g. "Status", "Group"     |
| Status           | Pill  | Active/Inactive            |
| Last Updated     | Date  | ISO, right                 |
| Actions          | Edit  | Edit, Deactivate           |

#### Declare Entry/Edit Form

| Field        | Type    | Required | Validation                              |
|--------------|---------|----------|------------------------------------------|
| Name/Key     | Text    | Yes      | "Required." Must be unique.              |
| Value        | Text    | Yes      | "Cannot be empty."                       |
| Type/Category| Select  | Yes      | "Select a category"                      |
| Status       | Switch  | Yes      | Default to "Active"                      |

**Actions (in entry form):**
- [Save] (primary-btn)
- [Cancel] (secondary-btn)

**Validations:**
- Show error under field on empty or duplicate key.

#### Test Identifiers

- data-testid='declare-table'
- data-testid='declare-edit-btn-[id]'
- data-testid='declare-entry-form'
- data-testid='declare-entry-save-btn'
- data-testid='declare-entry-cancel-btn'
- data-testid='declare-field-[fieldname]'
- data-testid='declare-error-[fieldname]'
- data-testid='declare-empty'

---

## 35. DMS Module

### Route

- `/documents/dms` and as modal in entity screens

### Purpose

Document Management: upload/search/link/unlink documents to customers/suppliers/orders. Glass card or drawer.

**PRD Reference:** FR-73, FR-74  
**Access Roles:** Standard User, Supervisor

### Main Components

- Upload area: drag-and-drop or file-picker (accepts multiple)
- Document table: lists docs linked to entity (with type, status, remarks)
- Linked entity: shows customer/supplier/order info being linked

### Table Columns

| Column      | UI     | Description                |
|-------------|--------|----------------------------|
| File Name   | Text   | Shows base name            |
| Type        | Badge  | Doc type/category          |
| Uploaded By | Text   | User name                  |
| Date        | Date   | Upload date                |
| Notes       | Text   | Optional user-provided     |
| Status      | Pill   | 'Active', 'Archived', etc  |
| Actions     | Icon   | Download/View/Unlink       |

### Actions

- [Upload] (button or dropzone)
- [Link] (if invoked from an entity)
- [Unlink] (per row)
- [Download/View] (per row)
- [Delete] (if permission)
- [Export List]

### Validations

- File size/type: error banner if invalid
- Empty: "No documents uploaded yet."

### Loading/Empty/Error

- Loading: spinner overlay during upload
- Empty: as above
- Error: per field/message

#### Test Identifiers

- data-testid='dms-upload'
- data-testid='dms-link-btn'
- data-testid='dms-unlink-btn-[docid]'
- data-testid='dms-delete-btn-[docid]'
- data-testid='dms-table'
- data-testid='dms-export-btn'
- data-testid='dms-entity-linkinfo'
- data-testid='dms-empty'
- data-testid='dms-error'

---

## 36. Functions

### Route

- `/utils/functions`

### Purpose

Access to utility functions and batch processes for supervisors/admins (mass update, batch data tasks, data clean-up).

**PRD Reference:** FR-75  
**Access Roles:** Supervisor, Administrator

### Main Components

- Utility List: Each utility/action is a row with description and 'Run'/'Configure' action
- Modal/drawer for utility config/execution

| Column     | UI      | Description              |
|------------|---------|--------------------------|
| Function Name | Text | Name of function         |
| Description | Text   | Brief description        |
| Last Run    | Date   | ISO, right               |
| Status      | Pill   | 'Ready', 'Error', ...    |
| Actions     | [Run]  | Button (primary)         |
| Configure   | [Edit] | Opens modal if supported |

### Function Config Modal

- Configurable parameters as specified per utility type (text/number/date fields, with labels)
- [Run Utility] (primary-btn), [Cancel]

### Validations

- Required parameters: show error under field
- Utility API errors: error banner, e.g. "Function failed — see logs"

### Loading/Empty/Error

- Loading: spinner if running
- Empty: "No utility functions available."
- Error: banner

#### Test Identifiers

- data-testid='utilsfuncs-table'
- data-testid='utilsfuncs-run-btn-[utilityid]'
- data-testid='utilsfuncs-config-btn-[utilityid]'
- data-testid='utilsfuncs-modal'
- data-testid='utilsfuncs-field-[param]'
- data-testid='utilsfuncs-error'
- data-testid='utilsfuncs-log-link-[utilityid]'
- data-testid='utilsfuncs-empty'

---

## 37. Inventory

### Route

- `/inventory` (list), `/inventory/:itemId` (entry/detail)

### Purpose

Review and management of inventory items/records, typically for customer/supplier-linked items. List + inline quick actions + entry (CRUD).

**PRD Reference:** FR-196, FR-164, FR-191  
**Access Roles:** Standard User, Supervisor

### Main Components

- InventoryTable — main table list of inventory items
- FiltersBar — filter by category, status, item, location
- InventoryEntryForm — create/edit

#### Inventory Table Columns

| Column        | UI          | Description            |
|---------------|-------------|------------------------|
| Item Code     | Text        |                        |
| Description   | Text        | main                   |
| Category      | Pill        | badge/ItemType         |
| Location      | Text        |                        |
| Quantity      | Number      | Colorized if low       |
| Cost          | Currency    |                        |
| Status        | Pill        | Active/Inactive        |
| Last Updated  | Date        |                        |
| Actions       | Icons       | Edit/View, Delete      |

#### Entry/Edit Form Fields

| Field         | Type        | Required | Validation               |
|---------------|-------------|----------|--------------------------|
| Item Code     | Text        | Yes      | Unique, Required         |
| Description   | Text        | Yes      | Required                 |
| Category      | Select      | Yes      | Must pick one            |
| Location      | Text        | Yes      | Required                 |
| Quantity      | Number      | Yes      | Must be non-negative     |
| Cost          | Number      | Yes      | >= 0                     |
| Tags          | Text/chips  | No       |                          |
| Status        | Switch      | Yes      | Active/Inactive          |

**Actions:**  
- [Save] (primary), [Cancel] (secondary)

**Validations:**  
All missing required show error under field. Error on duplicate Item Code on save.

### States

Loading: Table/form skeletons  
Empty: "No inventory items found."  
Error: error banner

#### Test Identifiers

- data-testid='inventory-table'
- data-testid='inventory-filterbar'
- data-testid='inventory-edit-btn-[itemid]'
- data-testid='inventory-delete-btn-[itemid]'
- data-testid='inventory-empty'
- data-testid='inventory-error'
- data-testid='inventory-entry-form'
- data-testid='inventory-field-[name]'
- data-testid='inventory-entry-save-btn'
- data-testid='inventory-entry-cancel-btn'

---

## 38. Log Module

### Route

- `/customers-suppliers/logs`

### Purpose

View change logs and audit trails for customer/supplier records, with filtering and export functions.

**PRD Reference:** FR-63, FR-67  
**Access Roles:** Supervisor, Administrator

### Main Components

- LogTable: list of audit log entries for customers/suppliers
- FilterBar: filter by entity, date, action, user

### Table Columns

| Column        | Type     | Description              |
|---------------|----------|--------------------------|
| Date/Time     | Date     | Localized with seconds   |
| Entity        | Text     | Customer/Supplier/Vehicle|
| Entity Name   | Text     |                           |
| Action        | Pill     | e.g. "Edit", "Delete"    |
| Field Changed | Text     | "Address1", "Email" etc. |
| Old Value     | Text     |                          |
| New Value     | Text     |                          |
| User          | Text     |                          |
| Notes         | Text     | Optional                  |

### Actions

- [Export] (primary-btn)
- [Search/Filter] (in bar)
- [Print] (`ghost-btn`)

### States

Loading: table shimmer  
Empty: "No changes recorded for selected filters."  
Error: banner

#### Test Identifiers

- data-testid='logmodule-table'
- data-testid='logmodule-filterbar'
- data-testid='logmodule-export-btn'
- data-testid='logmodule-print-btn'
- data-testid='logmodule-row-[logid]'
- data-testid='logmodule-empty'
- data-testid='logmodule-error'

---

## 39. Main Module

### Route

- `/customers-suppliers/main`

### Purpose

Summary home/landing page for the customer and supplier modules, containing key KPIs and quick links.

**PRD Reference:** FR-74  
**Access Roles:** All Roles

### Components

- Main KPIs cards:  
  - Total Customers, Active Customers, Total Suppliers, Active Suppliers, Recent Merges, Pending Imports, AgeWise Buckets
- Recent Activity table: recent merges, updates, deactivations
- Quick links to Add Customer, Add Supplier, Merge Duplicates, view Reports

### Layout

- Glassmorphic cards as in sample dashboard; responsive 4-column grid
- KPIs: show number, trend icon, short subtitle.
- Recent activity: 10 most recent events, colored by activity type (success/warning/error/info pill)

**Actions:**  
- [Add Customer] (primary)  
- [Add Supplier]  
- [Merge Duplicates]  
- [Quick Export Customers]  
- [Quick Export Suppliers]

### Empty/Loading/Error

Loading: shimmer for cards, skeleton table  
Empty: zero state  
Error: banner

#### Test Identifiers

- data-testid='mainmodule-dashboard'
- data-testid='mainmodule-kpi-[name]'
- data-testid='mainmodule-activity-table'
- data-testid='mainmodule-addcustomer-btn'
- data-testid='mainmodule-addsupplier-btn'
- data-testid='mainmodule-mergemerge-btn'
- data-testid='mainmodule-exportcustomers-btn'
- data-testid='mainmodule-exportsuppliers-btn'
- data-testid='mainmodule-activity-row-[eventid]'

---

## 40. Utility Module

### Route

- `/customers-suppliers/utilities`

### Purpose

Additional/batch tools for data hygiene and maintenance related to customer/supplier records — e.g. bulk update, duplicate clean-up, tag reassignment.

**PRD Reference:** FR-75  
**Access Roles:** Supervisor, Administrator

### Components

- UtilitiesListTable: each available tool as a row
- ActionBar: Run Utility, Configure, View Results

| Column     | UI      | Description             |
|------------|---------|-------------------------|
| Utility    | Text    | Name                    |
| Description| Text    | Function                |
| Last Run   | Date    | Right-aligned           |
| Status     | Pill    | Success/Error/In Progress|
| Actions    | Button  | [Run], [Configure]      |

### Utility Modal

- Parameters, as per each utility function
- [Run], [Cancel] buttons

### States

Loading: shimmer  
Empty: "No utility functions registered."
Error: error banner

#### Test Identifiers

- data-testid='utilitymodule-table'
- data-testid='utilitymodule-run-btn-[utilityid]'
- data-testid='utilitymodule-config-btn-[utilityid]'
- data-testid='utilitymodule-modal'
- data-testid='utilitymodule-empty'
- data-testid='utilitymodule-error'

---

## 41. Numto Words

### Route

- `/utils/num-to-words`

### Purpose

Convert numerical fields to their word representation (for documentation, reports).

**PRD Reference:** FR-75  
**Access Roles:** Standard User

### Layout

- Glass mini-card, centered: input on left, result on right or below.

### Fields

| Field             | UI     | Required | Validation             |
|-------------------|--------|----------|------------------------|
| Number            | Input  | Yes      | Must be a valid number |
| Convert Button    | Button |          |                        |
| Result            | Text   |          | Read-only, copyable    |

### Actions

- [Convert] (primary-btn)  
- [Copy to Clipboard] (adjacent to result)

### Validation/Error

- If not a number: "Please enter a valid number."
- Ajax/API error: banner

### Loading/Error

- Loading: spinner on convert
- Empty: input shown, result blank
- Error: banner

#### Test Identifiers

- data-testid='numtowords-input'
- data-testid='numtowords-convert-btn'
- data-testid='numtowords-result'
- data-testid='numtowords-copy-btn'
- data-testid='numtowords-error'

---

## 42. Payroll

### Route

- `/payroll`

### Purpose

Manages or references payroll (salary) data associated with customer/supplier contacts, mainly for supervisor/HR operations.

**PRD Reference:** FR-80  
**Access Roles:** Supervisor, Administrator

### Pages

- Payroll List (`/payroll`)
- Payroll Entry/Edit (`/payroll/:id`)

#### Payroll List Table Columns

| Column         | UI     | Description              |
|----------------|--------|--------------------------|
| Employee Name  | Text   | Main, bold               |
| Contact (linked entity) | Text | Customer/Supplier       |
| Period         | Month  | formatted                 |
| Amount         | Currency| Rs symbol                |
| Status         | Pill   | 'Processed', 'Pending'    |
| Payment Date   | Date   |                          |
| Actions        | Edit   | Edit/View, Delete         |

#### Payroll Entry/Edit Form

| Field            | Type          | Req. | Validation                  |
|------------------|---------------|------|-----------------------------|
| Employee         | Search        | Yes  | Must select                  |
| Linked Contact   | Search        | No   |                             |
| Period           | Month Picker  | Yes  | Required                    |
| Amount           | Number (Rs)   | Yes  | Must be ≥ 0                 |
| Status           | Select        | Yes  | Must select                  |
| Payment Date     | Date          | No   |                             |

**Actions:**  
- [Save] (primary)
- [Cancel]

**Validation:**  
- Missing required: error under field

#### Test Identifiers

- data-testid='payroll-table'
- data-testid='payroll-edit-btn-[payrollid]'
- data-testid='payroll-entry-form'
- data-testid='payroll-field-[fieldname]'
- data-testid='payroll-save-btn'
- data-testid='payroll-cancel-btn'
- data-testid='payroll-empty'
- data-testid='payroll-error'

---

## 43. Process Status Module

### Route

- `/process-status`

### Purpose

Tracks and manages processing statuses of customers, suppliers, or related workflow steps.

**PRD Reference:** FR-75  
**Access Roles:** Standard User, Supervisor

### Components

- StatusListTable — list of status entries with progress/progress bar
- FiltersBar — Status type, entity, period
- StatusEditDrawer — update status, add history note

#### Status List Table Columns

| Column        | UI       | Description                |
|---------------|----------|----------------------------|
| Entity        | Text     | Customer/Supplier/Vehicle  |
| Process       | Text     | e.g. "KYC Review"          |
| Status        | Pill     | Badge, current value       |
| Progress      | %/bar    | 0–100%, color by status    |
| Last Updated  | Date     |                            |
| History       | Button   | Opens history drawer/panel |

#### Status Edit / History

- Add Status Update (dropdown, required)
- Add Note (textarea, optional)
- Save

**Actions:**  
- [Update] (primary)
- [Cancel]

### Validations

- Status required: "Please select a status."
- Empty note allowed

### States

Loading: shimmer  
Empty: "No workflow statuses yet."  
Error: error banner

#### Test Identifiers

- data-testid='procstatus-table'
- data-testid='procstatus-edit-btn-[id]'
- data-testid='procstatus-history-btn-[id]'
- data-testid='procstatus-history-panel'
- data-testid='procstatus-update-form'
- data-testid='procstatus-field-[name]'
- data-testid='procstatus-update-btn'
- data-testid='procstatus-cancel-btn'
- data-testid='procstatus-error'

---

## 44. Read Offline Message

### Route

- `/messages/offline`

### Purpose

User-facing inbox for retrieving messages/notifications relevant to customers or suppliers that were received while the user was offline.

**PRD Reference:** FR-20  
**Access Roles:** Standard User

### Components

- MessagesTable: inbox style list of unread/read messages
- Filters: Unread/Read, Date, Sender

| Column       | UI     | Description                |
|--------------|--------|----------------------------|
| Status       | Pill   | Unread/Read                |
| Date         | Date   | Received                   |
| Sender       | Text   | User/Role                  |
| Entity Link  | Text   | Linked customer/supplier   |
| Subject      | Text   | Main, bold if unread       |
| Actions      | Buttons| Mark as Read, Flag         |

### Actions

- [Mark as Read] (per row)
- [Flag for Follow-up] (star button)
- [Filter Inbox] (top bar)
- [Select All] (bulk)

### States

Loading: shimmer  
Empty: "No messages waiting for you."
Error: banner

#### Test Identifiers

- data-testid='offline-messages-table'
- data-testid='offline-messages-filterbar'
- data-testid='offline-messages-read-btn-[id]'
- data-testid='offline-messages-flag-btn-[id]'
- data-testid='offline-messages-empty'
- data-testid='offline-messages-error'

---

## 45. Settings

### Route

- `/customers-suppliers/settings`

### Purpose

Access system and personal settings relevant to customer/supplier modules. Includes user preferences and notification settings.

**PRD Reference:** FR-78  
**Access Roles:** Standard user: personal; Supervisor/Admin: all

### Fields

| Setting                | UI          | Description                    |
|------------------------|-------------|--------------------------------|
| Display Preferences    | Toggles     | Show extra columns, compact    |
| Default Filters        | MultiSelect | Default views                  |
| Notification Settings  | Checkboxes  | Email/SMS alerts               |
| Import/Export Defaults | Select      | Preferred file format          |
| Color Theme            | Radio       | Light, dark, system            |
| Language               | Select      | Language picker                |

### Actions

- [Save] (primary-btn), [Reset to Defaults] (ghost-btn)
- Validation: At least one notification method must be enabled if not muted.

### Error States

Error on save: banner, retry possible

#### Test Identifiers

- data-testid='settings-form'
- data-testid='settings-field-[name]'
- data-testid='settings-save-btn'
- data-testid='settings-reset-btn'
- data-testid='settings-error'

---

## 46. Form1 (Placeholder/Test Interface)

### Route

- `/sandbox/form1`

### Purpose

Placeholder/dev interface; used for system development or internal test purposes only.

**PRD Reference:** Internal/testing only  
**Access Roles:** Administrator

### Layout

- Simple glass card with a single editable text box for arbitrary test values
- [Run Test] (`primary-btn`)
- Shows output below in a scrollable panel

### Fields

| Field        | UI         |
|--------------|------------|
| Test Input   | TextInput  |

### Actions

- [Run Test] (performs dummy action)
- [Clear] (resets input and output)

### States

- Loading: spinner overlay on test run
- Output scrollable, clears on clear

#### Test Identifiers

- data-testid='form1-input'
- data-testid='form1-run-btn'
- data-testid='form1-output'
- data-testid='form1-clear-btn'

---

## 47. Report Test (Sample/Diagnostics Report)

### Route

- `/reports/sample-test`

### Purpose

Generates and previews test or diagnostic reports for customer/supplier data.

**PRD Reference:** Diagnostics/Test  
**Access Roles:** Supervisor, Administrator

### Layout

- FiltersBar: Pick test parameters (entity, status, date)
- [Run Test Report] (`primary-btn`)
- Table preview of output, export as PDF/Excel

### Fields

| Field      | UI      | Required | Description         |
|------------|---------|----------|---------------------|
| Entity     | Select  | Yes      | Customers/Suppliers |
| Status     | Select  | No       |                     |
| Date From  | Date    | No       |                     |
| Date To    | Date    | No       |                     |

**Action Buttons:**  
- [Run Test Report]  
- [Export] (after run: enables PDF/Excel)

**Validations:**  
- Entity is required: "Please select customers or suppliers."

**States:**  
- Loading: table skeleton  
- Empty: "No results for parameters."  
- Error: error banner

#### Test Identifiers

- data-testid='reporttest-form'
- data-testid='reporttest-filterbar'
- data-testid='reporttest-run-btn'
- data-testid='reporttest-table'
- data-testid='reporttest-export-btn'
- data-testid='reporttest-empty'
- data-testid='reporttest-error'

---

## 48. CustomerList (Report Screen)

### Route

- `/reports/customers`

### Purpose

Lists all customers in a report view with search, filter, export, and summary statistics.

**PRD Reference:** FR-69  
**Access Roles:** Standard User, Supervisor, Administrator

### Components

- CustomerTable: tabular list with all exportable fields
- Filters/SearchBar: name, status, registration date, type

| Column           | UI         | Description          |
|------------------|------------|----------------------|
| Customer Name    | Text       | Main, bold           |
| Contact          | Text       |                      |
| Status           | Pill       | Active/Inactive      |
| Type             | Badge      | 'Local', 'Foreign', etc|
| Reg. Date        | Date       | yyyy-mm-dd           |
| Export           | Buttons    | PDF/Excel            |

### Empty/Loading/Error States

Loading: shimmer  
Empty: "No customers found."
Error: Banner

**Actions:**
- [Export] (PDF/Excel)
- [Print] (optional, if > 1 column selected)
- [Search/Filter]

#### Test Identifiers

- data-testid='customerlist-table'
- data-testid='customerlist-searchbar'
- data-testid='customerlist-export-btn'
- data-testid='customerlist-print-btn'
- data-testid='customerlist-row-[customerid]'
- data-testid='customerlist-empty'
- data-testid='customerlist-error'

---

## 49. SupplierList (Report Screen)

### Route

- `/reports/suppliers`

### Purpose

Lists all suppliers with filters, summary totals, export options.

**PRD Reference:** FR-69  
**Access Roles:** Standard User, Supervisor, Administrator

### Table Columns

| Column           | UI         | Description          |
|------------------|------------|----------------------|
| Supplier Name    | Text       | Main, bold           |
| Category         | Badge      | Local/Foreign/Other  |
| Contact          | Text       |                      |
| Status           | Pill       | Active/Inactive      |
| Reg. Date        | Date       | yyyy-mm-dd           |
| Export           | Buttons    | PDF/Excel            |

### Actions

- [Export] (PDF/Excel)
- [Print]
- [Search/Filter]

### States

Loading: shimmer  
Empty: "No suppliers match filters."
Error: Banner

#### Test Identifiers

- data-testid='supplierlist-table'
- data-testid='supplierlist-searchbar'
- data-testid='supplierlist-export-btn'
- data-testid='supplierlist-print-btn'
- data-testid='supplierlist-row-[supplierid]'
- data-testid='supplierlist-empty'
- data-testid='supplierlist-error'

---

## 50. Attachments

### Route

- `/attachments` (module), `/attachments/:entity/:entityId` (entity context)

### Purpose

Upload, view, manage, and organize digital attachments related to transactions, customers, orders, etc.

**PRD Reference:** FR-86, FR-87, FR-88, FR-93, US-75, US-76, US-77  
**Access Roles:** Standard user, Supervisor, Administrator (varied by upload/delete role checks)

### Components

#### Attachments List/Table

| Column        | UI     | Description                    |
|---------------|--------|--------------------------------|
| File Name     | Text   | Main, with extension           |
| File Type     | Badge  | MIME, color-coded (pdf/image)  |
| Size          | Text   | In KB/MB                       |
| Linked Entity | Chip   | E.g., order/customer           |
| Uploaded By   | Text   | User name                      |
| Uploaded Date | Date   |                                |
| Tags          | Chips  |                                |
| Version       | Text   | e.g. 'v1', 'v2'                |
| Status        | Pill   | 'Active', 'Archived', ...      |
| Actions       | Icons  | Download/View/Delete/EditMeta  |

#### Filters/Actions Bar

- Filter by entity, type, date, tag, uploader
- [Upload Attachments] (primary)
- [Bulk Download], [Bulk Delete] (if permissions)
- [Bulk Tag/Assign] (select mode)

#### Attachment Upload Panel

- Drag+drop or file picker
- Shows each file in queue, with progress bar/status
- Assign tag(s), description, link to entity (dropdown)

**Attachment Details Modal:**
- Preview (inline if possible)
- Metadata
- Download, Edit, Version history

### Validations

- File type/size: only certain types allowed (error: "Invalid file type/size")
- Tag required if workflow defines so
- Error on upload: banner, show which files failed

### Empty/Error/Loading

- Loading: spinner on upload
- Empty: "No attachments for this context."
- Error: error banner, specifics per action

#### Test Identifiers

- data-testid='attachments-table'
- data-testid='attachments-filterbar'
- data-testid='attachments-upload-btn'
- data-testid='attachments-bulkdownload-btn'
- data-testid='attachments-bulkdelete-btn'
- data-testid='attachments-upload-panel'
- data-testid='attachments-upload-progress-[fileid]'
- data-testid='attachments-details-modal-[fileid]'
- data-testid='attachments-view-btn-[fileid]'
- data-testid='attachments-delete-btn-[fileid]'
- data-testid='attachments-editmeta-btn-[fileid]'
- data-testid='attachments-versionhistory-btn-[fileid]'
- data-testid='attachments-empty'
- data-testid='attachments-error'

---

## COVERAGE CHECK

| Screen Name                | Status  |
|----------------------------|---------|
| Check Duplicate Contacts   | ✅ covered |
| Cust Age Wise              | ✅ covered |
| Items Help New             | ✅ covered |
| Local Porder Search        | ✅ covered |
| Menu                       | ✅ covered |
| Supp Age Wise              | ✅ covered |
| Document Help              | ✅ covered |
| Main Menu (OLD & Current)  | ✅ covered |
| Declare Module             | ✅ covered |
| DMS Module                 | ✅ covered |
| Functions                  | ✅ covered |
| Inventory                  | ✅ covered |
| Log Module                 | ✅ covered |
| Main Module                | ✅ covered |
| Utility Module             | ✅ covered |
| Numto Words                | ✅ covered |
| Payroll                    | ✅ covered |
| Process Status Module      | ✅ covered |
| Read Offline Message       | ✅ covered |
| Settings                   | ✅ covered |
| Form1 (Placeholder/Test Interface) | ✅ covered |
| Report Test (Sample/Diagnostics Report) | ✅ covered |
| CustomerList (Report Screen) | ✅ covered |
| SupplierList (Report Screen) | ✅ covered |
| Attachments                | ✅ covered |

---

# FRONTEND_SPEC.md

---

## 51. Additional Remarks

### Route Path
`/orders/:orderId/remarks`  
Accessible from the order, job, or transaction details page. May appear as a modal or side-panel in larger screens.

### Purpose
Allows users to add, edit, and view supplemental remarks/comments attached to a specific order/job/transaction. All changes are tracked with user and timestamp.

### PRD Reference
- FR-90, FR-91, FR-109 (see also FR-103, FR-112 for audit)
- User Stories: US-79, US-80, US-94

### Access Roles
- Standard User: Add, view own remarks
- Supervisor: Add, edit, delete any remark, view all remark history
- Administrator: Full access

### UI Structure

- **Remarks List Panel** (glass card)
    - Title: "Additional Remarks"
    - Table of existing remarks:
        - Columns:
            - Date/Time (`EntryDate`)
            - User (author)
            - Remark Text (`Remarks`)
            - Actions: Edit (if owner or Supervisor/Admin), Delete (role-based, confirm prompt)
        - Sort: Newest first
        - Empty State: "No remarks yet. Add context or notes about this order/job."
    - Action: "+ Add Remark" button (primary, top right or below list)

- **Add/Edit Remark Modal**
    - Field: "Remark" (textarea, required, 1–500 chars)
    - Validation:
        - Required: "Remark cannot be empty"
        - Max length: "Remark is too long (500 character max)"
    - Buttons: "Save" (primary), "Cancel" (secondary)
    - On Save: POST/PUT to remarks API, closes modal, reloads remarks list
    - On Cancel: Just closes modal, does not clear entered text

- **Audit Trail**  
    - Supervisor/Admin only: toggle row expansion shows user/role, date/time, previous value, edit history.

### Form Validations
- **Add/Edit**
    - Remark: required, 1–500 chars
        - Empty: `Remark cannot be empty`
        - Too long: `Remark must be 500 characters or fewer`
- **Delete**
    - Confirm dialog: "Are you sure you want to delete this remark? This action cannot be undone."

### States
- **Loading:** Skeleton for remarks list rows (animated outlines for each column, shimmer effect)
- **Saving:** Save button shows spinner, disables form
- **API error:** Banner above form:  
    - "Failed to save remark. Please try again."
    - Specific error text if available
- **Delete error:** Toast at top right:  
    - "Error deleting remark. You may not have permission."

### Actions → UI Elements
- Add remark: primary button `data-testid='remarks-add-btn'`
- Edit: row button/icon `data-testid='remarks-edit-btn'`
- Delete: row button/icon `data-testid='remarks-delete-btn'`
- View history: expand row, `data-testid='remarks-history-toggle-btn'`

### Test Identifiers
- `remarks-add-btn`
- `remarks-edit-btn`
- `remarks-delete-btn`
- `remarks-history-toggle-btn`
- `remarks-table`
- `remarks-table-row`
- `remarks-empty-state`
- `remarks-form`
- `remarks-form-error`
- `remarks-confirm-delete-dialog`

---

## 52. Document Entry

### Route Path
`/documents/:documentId?`  
(If `documentId` present, edit mode; else, create mode.)

### Purpose
Create, edit, and manage individual transaction-related documents, including key details, status, remarks, and associated attachments.

### PRD Reference
- FR-92, FR-107, FR-88, FR-89, FR-111
- User Story: US-81, US-86, US-94

### Access Roles
- Standard User: Create, edit own, view assigned
- Supervisor/Admin: Edit any, set workflow status, view audit/versions

### UI Structure

- **Document Form Card** (glass, xl)
    - Top: "Document Entry" (Title)
    - Fields:
        1. Document Title (text, required)
        2. Document Type (select/dropdown; from doc headers/categories)
        3. Status (select; e.g., Draft, Submitted, Approved, Archived)
        4. Linked Transaction/Order (autocomplete/ref field; must select 1)
        5. Document Date (date picker, required)
        6. Additional Remarks (textarea, optional)
        7. Attachments (file upload area, with preview/list. See Attachments spec)
        8. Tags (multi-select, optional)
        9. Version selector (if >1 version)
    - Buttons (footer, sticky):
        - Primary: "Save Document" (data-testid='doc-form-save')
        - Secondary: "Cancel" (returns to document list)
    - Delete (if edit mode, and role permits): "Delete" (danger, bottom left, must confirm)

- **Attachments Inline**
    - See Attachments spec for controls and validation

- **Status**
    - "Workflow Status" select: Draft, Submitted, Approved, Archived, role-permitted values only

- **History**
    - Version dropdown if more than one version; viewing past disables editing

### Form Validations
- Required fields: Title, Type, Status, Linked Transaction/Order, Document Date
    - If missing: red border, error text below
- Attachments: At least 1 if required by doc type (must warn: "At least 1 supporting attachment required" if so)
- File types: restrict to allowed (PDF, DOC, XLS(X), image)
    - On bad filetype: error "Only document or image files permitted"

### States
- **Loading:** Skeleton fields, spinner on Save
- **API error:** Banner above form: "Cannot save document. Please correct errors and try again."
- **Delete error:** Toast, "Error deleting document. It may be locked or already processed."
- **Read-only state:** If document is Approved/Archived, disable fields, show "Read-only" badge/banner.

### Actions → UI Elements
- Save: bottom sticky button, `data-testid='doc-form-save'`
- Cancel: button left of Save, `data-testid='doc-form-cancel'`
- Delete: button (if permitted), `data-testid='doc-form-delete'`
- Upload Attachment: `data-testid='doc-form-attach-upload'`
- Remove Attachment: `data-testid='doc-form-attach-remove'`
- Open Version: dropdown, `data-testid='doc-form-version-dropdown'`

### Test Identifiers
- `doc-form-title`
- `doc-form-type`
- `doc-form-status`
- `doc-form-link-txn`
- `doc-form-date`
- `doc-form-remarks`
- `doc-form-tags`
- `doc-form-attach-list`
- `doc-form-attach-upload`
- `doc-form-attach-remove`
- `doc-form-version-dropdown`
- `doc-form-save`
- `doc-form-cancel`
- `doc-form-delete`
- `doc-form-error`
- `doc-form-history-view`
- `doc-form-readonly-banner`

---

## 53. Document Menu

### Route Path
`/documents/menu`  
(Landing + links to all document-related screens.)

### Purpose
Centralized navigation and quick access to all document and attachment management features, templates, and recent work.

### PRD Reference
- FR-104, FR-97, FR-101

### Access Roles
- Standard User: All features visible as permitted; links to own recent docs
- Supervisor/Admin: All, including templates/history/config

### UI Structure

- Title: "Document Center"
- Menu Panel:
    - Main action buttons:
        - "New Document" — goes to `/documents/new`
        - "Document List" — `/documents`
        - "Attachments" — `/attachments`
        - "Document Templates" — `/documents/templates`
        - "Remarks Reports" — `/documents/remarks-report`
    - Recent documents/attachments
        - Table, 5–8 most recent, columns: Doc Title, Type, Date, Linked Txn, Status, (View/Edit)
    - Quick search by title/type (upper right)
    - List of "Your Recently Opened"
    - All-navigator: list of links to each module with `data-testid='doc-menu-link-[destination]'`

### States
- **Loading:** Table shimmer, disabled menu buttons while loading.
- **Empty state:** "No recent documents. Create your first document."
- **API error:** Banner: "Unable to load recent documents. Please reload."

### Actions → UI Elements
- New Document: `data-testid='doc-menu-new'`
- Document List: `data-testid='doc-menu-list'`
- Attachments: `data-testid='doc-menu-attachments'`
- Templates: `data-testid='doc-menu-templates'`
- Remarks Reports: `data-testid='doc-menu-remarks-report'`
- View/Edit Recent: row action button per doc `data-testid='doc-menu-recent-edit'`

### Test Identifiers
- `doc-menu-new`
- `doc-menu-list`
- `doc-menu-attachments`
- `doc-menu-templates`
- `doc-menu-remarks-report`
- `doc-menu-link-[destination]`
- `doc-menu-recent-table`
- `doc-menu-recent-edit`
- `doc-menu-search`
- `doc-menu-empty`
- `doc-menu-error`

---

## 54. Document Head Management

### Route Path
`/documents/templates`
(One list; `.../templates/:id` for add/edit entry.)

### Purpose
List, create, edit, and manage document headers/templates/categories. Includes status toggle, assignments to doc types, metadata/usage.

### PRD Reference
- FR-95, FR-107, FR-82

### Access Roles
- Supervisor/Admin only

### UI Structure

- **Document Header List**
    - Table:
        - Columns:
            - Name (header/category)
            - Status (Active/Inactive switch)
            - Assigned To (display doc types where used)
            - Metadata
            - Last Edited (user, date)
            - Actions: Edit, Delete (if not in use)
        - Filter/search by name/status/type
        - "+ New Header" button (top right, `data-testid='dochead-new-btn'`)

- **Document Header Detail Drawer/Modal (`/documents/templates/:id?`)**
    - Fields:
        1. Header Name (required)
        2. Category Type (select)
        3. Status (active toggle)
        4. Assign to Document Types (multi-select; must have at least one if in use)
        5. Metadata fields (optional; text, e.g., Description, Format)
    - Buttons: "Save" (primary), "Cancel" (secondary)
    - "Delete" (danger, only if not assigned/used; must confirm)

- **Usage Details**
    - On list, if in use: show number of docs using this header with link to that filtered list.

### Form Validations
- Header Name: required, min 2 chars: "Header name is required" / "Must be at least 2 characters"
- Assignment: At least one assigned type if status is active
- Uniqueness: On save, error if duplicate name: "Header name must be unique"
- Delete: If assigned/in use, forbid delete, display: "Cannot delete—this header is used by X document(s)."

### States
- **Loading:** Table skeleton, disabled buttons, spinner on entry form save
- **Empty:** "No document headers defined."
- **API Error:** Banner at top of card

### Actions → UI Elements
- New Header: `data-testid='dochead-new-btn'`
- Edit: `data-testid='dochead-edit-btn'`
- Delete: `data-testid='dochead-delete-btn'`
- Save: `data-testid='dochead-save-btn'`
- Cancel: `data-testid='dochead-cancel-btn'`
- Toggle Active: `data-testid='dochead-active-toggle'`

### Test Identifiers
- `dochead-list-table`
- `dochead-new-btn`
- `dochead-edit-btn`
- `dochead-delete-btn`
- `dochead-save-btn`
- `dochead-cancel-btn`
- `dochead-detail-form`
- `dochead-active-toggle`
- `dochead-usage-link`
- `dochead-error`
- `dochead-empty`

---

## 55. Additional Remarks Reports

### Route Path
`/documents/remarks-report`

### Purpose
Report of additional remarks – filterable by date, user, transaction/order, displays remarks history for compliance/audit.

### PRD Reference
- FR-98, FR-109
- User Story: US-87

### Access Roles
- Supervisor, Administrator

### UI Structure

- Page Title: "Additional Remarks Report"
- **Filter Bar** (top of card):
    - Date range (start–end)
    - User (select)
    - Transaction/Order/Job (autocomplete)
    - Free text search (remark content)
    - "Apply Filter" (primary), "Clear" (secondary); disables during loading
- **Table/List**
    - Columns:
        - Date/Time
        - User (author)
        - Transaction/Order/Job Ref
        - Remark Text (expand/collapse for >90 chars)
        - Link to original record
        - Actions: View full history (drawer/modal)
    - Paginated (server paged API)
    - Empty State: "No remarks match the selected filters."
- **Export**
    - "Export" button (top right)
    - Options: PDF, Excel

### States
- **Loading:** Filter disables, table skeleton/shimmer
- **API Error:** Toast + banner "Unable to load remarks report. Try again."
- **Exporting:** Spinner in button, disables during export

### Actions → UI Elements
- Apply Filters: primary button, `data-testid='remarks-report-filter-apply'`
- View history: row action `data-testid='remarks-report-history-btn'`
- Export: secondary button `data-testid='remarks-report-export-btn'`

### Test Identifiers
- `remarks-report-filter-apply`
- `remarks-report-export-btn`
- `remarks-report-history-btn`
- `remarks-report-table`
- `remarks-report-row`
- `remarks-report-empty`
- `remarks-report-error`
- `remarks-report-filter-user`
- `remarks-report-filter-date`
- `remarks-report-filter-txn`
- `remarks-report-filter-search`

---

## 56. Service Estimation Entry

### Route Path
`/estimations/:estimationId?`  
(Create: `/estimations/new`; Edit: `/estimations/:estimationId`)

### Purpose
Create or edit a service/job estimation for a customer, capturing details before work order creation and approval.

### PRD Reference
- FR-113, FR-137, FR-114 (approval), FR-117

### Access Roles
- Standard User: Add estimates for assigned jobs/customers, edit own drafts
- Supervisor/Admin: Edit any, submit for approval

### UI Structure

- **Estimation Form Card**
    - Title: "Service Estimation" (or "Edit Estimation")
    - Fields:
        1. Customer (autocomplete/search, required)
        2. Vehicle (autocomplete/search, required; filtered to selected customer)
        3. Estimation Date (date picker, required, default today)
        4. Service Description (textarea, required)
        5. Itemized List (table of [Part/Service, Qty, Unit Price, Labour, Subtotal], add/remove item, reorder by drag)
        6. Additional Notes (textarea, optional)
        7. Attachments (file upload, see Attachments spec)
        8. Status (readonly: Draft or Submitted)
        9. Submit for Approval (if user role allows)
    - Buttons:
        - Primary: "Save Estimation" (`data-testid='estimation-save'`)
        - Secondary: "Submit for Approval" (`data-testid='estimation-submit'`) — enabled if form valid, disables save (once submitted)
        - Cancel (back to list)

- **Itemized List**
    - Each row:
        - Part/Service (autocomplete)
        - Quantity (number, required, >0)
        - Unit Price (number, required, ≥0)
        - Labour Amt (number, optional)
        - Subtotal (auto-calculated)
        - Remove row ("X" button)
    - "+ Add Item" (`data-testid='estimation-item-add'`) below table

### Form Validations
- Required: Customer, Vehicle, Service Description, at least one Itemized row.
    - On missing: field highlights/error text "Required"
    - Quantity/unit price > 0: "Amount must be at least 1"
    - No item duplicated: "Duplicate part/service in list"
    - File attachments: allowed types/size
- Cannot Submit for Approval unless fully valid.

### States
- **Loading:** Skeleton fields/table; spinner on save/submit
- **API Error:** Inline form error above fields ("Failed to save estimation. Please correct errors and try again.")
- **Empty state:** For item table: "No items yet, add at least one to continue."

### Actions → UI Elements
- Add Item: button, `data-testid='estimation-item-add'`
- Remove Item: row button, `data-testid='estimation-item-remove'`
- Save: sticky bottom button, `data-testid='estimation-save'`
- Submit for Approval: side of save (if allowed), `data-testid='estimation-submit'`
- Attach upload: as in Attachments

### Test Identifiers
- `estimation-form`
- `estimation-customer`
- `estimation-vehicle`
- `estimation-date`
- `estimation-description`
- `estimation-item-table`
- `estimation-item-add`
- `estimation-item-remove`
- `estimation-note`
- `estimation-attachments`
- `estimation-save`
- `estimation-submit`
- `estimation-cancel`
- `estimation-status`

---

## 57. Estimation Approval

### Route Path
`/estimations/approvals`  
(For supervisor: list of submitted estimates pending approval. `/estimations/:estimationId/approve` = workflow screen)

### Purpose
Supervisor reviews, approves, or rejects submitted service/job estimations with comments for trace/audit.

### PRD Reference
- FR-114, FR-137

### Access Roles
- Supervisor, Administrator

### UI Structure

- **Estimation Approval List**
    - Table:
        - Columns: Estimation No, Customer, Vehicle, Date, Total, Requested By, Status, Actions (View, Approve, Reject)
        - Filters: Status (Submitted/Pending, Approved, Rejected), Date, Customer, Staff

- **Estimation Approval Drawer/Modal**
    - Detail view of estimation (all fields/lines, attached files)
    - Actions:
        - Approve: "Approve Estimation" (`data-testid='est-approval-approve-btn'`)
        - Reject: "Reject" (`data-testid='est-approval-reject-btn'`)
        - Comments (textarea, required for rejection, optional for approval)
        - Save comment with action, locks record, navigates out on completion

### Form Validations
- Approve/Reject: must confirm
- Reject: comments required
    - Empty: "You must supply comments when rejecting."

### States
- **Loading:** Table rows shimmer; modal spinner on approve/reject
- **API Error:** Banner per item: "Failed to update estimation status."
- **Empty:** "No estimations pending approval."

### Actions → UI Elements
- Approve: `data-testid='est-approval-approve-btn'`
- Reject: `data-testid='est-approval-reject-btn'`
- Comment: `data-testid='est-approval-comment'`
- View Details: `data-testid='est-approval-view-btn'`

### Test Identifiers
- `est-approval-table`
- `est-approval-view-btn`
- `est-approval-approve-btn`
- `est-approval-reject-btn`
- `est-approval-comment`
- `est-approval-error`
- `est-approval-empty`

---

## 58. Job Order Status

### Route Path
`/jobs/status`  
(List of current job/work orders with status. For detail: `/jobs/:jobId/status`.)

### Purpose
Display list of all job/work orders, their current status, assignment, and allow filtering/updating (where permitted).

### PRD Reference
- FR-115, FR-119, FR-120, FR-126

### Access Roles
- Standard User: View own/assigned jobs
- Supervisor/Admin: View all, update status

### UI Structure

- **Job Status Table**
    - Columns:
        - Job/Order Ref (Ordr)
        - Customer Name
        - Vehicle
        - Status (colored pill)
        - Date Started
        - Assigned Staff
        - Progress/Notes (icon to expand/see details)
        - Action: Edit Status (if permitted)
    - Filters:
        - Status (multi-select)
        - Date range
        - Customer
        - Staff
        - Free text
    - "+ New Job" (if permitted)

- **Status Update Modal**
    - Fields:
        - New Status (dropdown, available values per user role and job status master)
        - Progress/Notes (textarea)
    - Primary: "Update Status"

### Form Validations
- Status: required when updating
- Progress/Notes: optional unless business rule requires it for certain statuses

### States
- **Loading:** Table shimmer
- **Empty:** "No jobs to display for current filters."
- **API Error:** Table alert row or toast

### Actions → UI Elements
- Edit Status: row button, `data-testid='jobstatus-edit-btn'`
- Expand Details: row button, `data-testid='jobstatus-details-btn'`
- Filters: `data-testid='jobstatus-filter-[field]'`
- New Job: `data-testid='jobstatus-new-btn'`

### Test Identifiers
- `jobstatus-table`
- `jobstatus-row`
- `jobstatus-edit-btn`
- `jobstatus-details-btn`
- `jobstatus-filter-status`
- `jobstatus-filter-date`
- `jobstatus-filter-customer`
- `jobstatus-filter-staff`
- `jobstatus-new-btn`
- `jobstatus-update-modal`
- `jobstatus-update-status`
- `jobstatus-update-notes`
- `jobstatus-update-save`
- `jobstatus-error`
- `jobstatus-empty`

---

## 59. Job Status Master

### Route Path
`/jobs/status-master`

### Purpose
Admin interface for adding, editing, activating/deactivating, and deleting job status definitions (status codes, colors, workflow flags).

### PRD Reference
- FR-116, FR-50

### Access Roles
- Administrator only

### UI Structure

- **Status Master Table**
    - Columns:
        - Status Name
        - Status Code (unique, editable)
        - Description
        - Usage Flags (Check: Finished, PartsNotAvail, InProgress, Assigned, Approved)
        - Color (shows sample, editable)
        - Active (switch)
        - Actions: Edit, Delete
    - "+ Add Status" (top right)

- **Edit/Add Modal**
    - Fields:
        1. Status Name (required)
        2. Code (unique, required)
        3. Description
        4. Usage Flags (checkboxes)
        5. Color picker (from palette or custom, shows preview)
        6. Active switch
    - Save, Cancel, Delete buttons (Delete only if unused)

### Form Validations
- Name: required, unique
- Code: required, unique (error if duplicate: "Status code is already in use.")
- Cannot inactivate/delete if in use: "Cannot delete a status in use by jobs."

### States
- **Loading:** Table skeleton, modal spinner on save
- **Empty:** "No statuses defined. Add a status to begin."
- **API Error:** Banner at top

### Actions → UI Elements
- Add: `data-testid='statusmaster-add-btn'`
- Edit: `data-testid='statusmaster-edit-btn'`
- Delete: `data-testid='statusmaster-delete-btn'`
- Save: `data-testid='statusmaster-save-btn'`
- Color change: `data-testid='statusmaster-color-input'`
- Toggle active: `data-testid='statusmaster-active-toggle'`

### Test Identifiers
- `statusmaster-table`
- `statusmaster-add-btn`
- `statusmaster-edit-btn`
- `statusmaster-delete-btn`
- `statusmaster-save-btn`
- `statusmaster-color-input`
- `statusmaster-active-toggle`
- `statusmaster-modal`
- `statusmaster-error`
- `statusmaster-empty`

---

## 60. Job Status Help

### Route Path
`/jobs/status-help`

### Purpose
Reference/help page showing all job status values, codes, descriptions, and workflow flags. Helps users accurately choose statuses when updating jobs.

### PRD Reference
- FR-117

### Access Roles
- Standard User, Supervisor, Admin

### UI Structure

- Title: "Job Status Reference"
- Table/Card List:
    - Columns:
        - Status Name
        - Code
        - Description
        - Flags (Finished, PartsNotAvail, InProgress, etc.)
        - Color sample
    - Search by name/code
    - Export/Print buttons (top right)
- Printable summary view (opens simplified print layout of status table)

### States
- **Loading:** Table skeleton
- **Empty:** "No statuses available."
- **API Error:** Banner

### Actions → UI Elements
- Search: `data-testid='statushelp-search-input'`
- Print: `data-testid='statushelp-print-btn'`
- Export: `data-testid='statushelp-export-btn'`

### Test Identifiers
- `statushelp-table`
- `statushelp-search-input`
- `statushelp-print-btn`
- `statushelp-export-btn`
- `statushelp-error`
- `statushelp-empty`

---

## 61. Work Status

### Route Path
`/jobs/work-status`

### Purpose
List and track all jobs currently in progress; assign jobs to staff; monitor statuses, and update progress/notes.

### PRD Reference
- FR-118, FR-119, FR-126, FR-128, FR-129

### Access Roles
- Standard User: View assigned jobs, update their progress/status
- Supervisor/Admin: View all, assign, reassign, override status

### UI Structure

- **In-Progress Jobs Table**
    - Columns:
        - Job/Order Ref
        - Customer Name
        - Assigned Staff
        - Status (colored pill)
        - Start Date
        - Progress (%/bar)
        - Last Note (expandable)
        - Actions: "Update Status", "Add Note", "Mark Complete" (if permitted)
    - Filters:
        - Staff (select)
        - Status
        - Date
        - Customer

- **Assignment/Reassignment Modal**
    - Fields:
        1. Assign to Staff (autocomplete, required)
        2. Expected Start/End Date
    - Save/Cancel

- **Progress Update Modal**
    - Fields:
        1. Current progress (%) — slider or numeric
        2. Note (textarea, optional)
    - Save (primary), Cancel

### Form Validations
- Assign: Staff required
- Progress: 0–100, note optional unless progress decreases

### States
- **Loading:** Rows skeleton
- **Empty:** "No jobs in progress."
- **API Error:** Inline error row

### Actions → UI Elements
- Assign/Reassign: `data-testid='workstatus-assign-btn'`
- Update Progress: `data-testid='workstatus-progress-btn'`
- Mark Complete: `data-testid='workstatus-complete-btn'`
- Add Note: `data-testid='workstatus-note-btn'`
- Filters: `data-testid='workstatus-filter-[field]'`

### Test Identifiers
- `workstatus-table`
- `workstatus-row`
- `workstatus-assign-btn`
- `workstatus-progress-btn`
- `workstatus-complete-btn`
- `workstatus-note-btn`
- `workstatus-filter-staff`
- `workstatus-filter-status`
- `workstatus-filter-date`
- `workstatus-filter-customer`
- `workstatus-modal`
- `workstatus-error`
- `workstatus-empty`

---

## 62. Work Status Management

### Route Path
`/jobs/work-status/manage`

### Purpose
Supervisor/Admin view for batch updating statuses, mass assignment, setting priorities, and full audit/history review.

### PRD Reference
- FR-118, FR-119, FR-131, FR-133

### Access Roles
- Supervisor, Administrator

### UI Structure

- **Comprehensive Work Orders Table**
    - Columns:
        - Job/Work Order Ref
        - Customer
        - Assigned Staff
        - Status (dropdown inline for bulk edit)
        - Priority (editable tag)
        - Start/End Date
        - Progress
        - Last Updated
        - Actions: View, Edit, Assign, Set Priority
    - Bulk select checkboxes per row
    - Bulk action bar: Change Status, Assign Staff, Set Priority, Export, Print

- **Batch Update Drawer/Modal**
    - Action Chosen (Status, Assignment, Priority)
    - Multi-select jobs
    - Fields per action (status dropdown, staff, priority selector)

### Form Validations
- At least one row selected for bulk
- If changing status: new status required

### States
- **Loading:** Row shimmer, button disables while updating batch
- **Error:** Toast or error row/area
- **Empty:** "No jobs match current filters."

### Actions → UI Elements
- Bulk select: `data-testid='workmanage-bulk-select'`
- Bulk update: `data-testid='workmanage-bulk-btn'`
- Assign: `data-testid='workmanage-assign-btn'`
- Set priority: `data-testid='workmanage-priority-btn'`
- Export: `data-testid='workmanage-export-btn'`
- Print: `data-testid='workmanage-print-btn'`

### Test Identifiers
- `workmanage-table`
- `workmanage-bulk-select`
- `workmanage-bulk-btn`
- `workmanage-assign-btn`
- `workmanage-priority-btn`
- `workmanage-export-btn`
- `workmanage-print-btn`
- `workmanage-modal`
- `workmanage-error`
- `workmanage-empty`

---

## 63. Work Status Report

### Route Path
`/jobs/work-status/report`

### Purpose
Supervisor/Admin report page showing work/job status distribution, filterable by staff, date, status, exportable for reviews.

### PRD Reference
- FR-121, FR-122, FR-125, FR-136

### Access Roles
- Supervisor, Administrator

### UI Structure

- Title: "Work Status Report"
- Filter bar:
    - Date range
    - Staff (multi-select)
    - Status (multi-select)
    - Customer
    - Export button (Excel/PDF)
- Table/Report Grid:
    - Columns: Job Ref, Customer, Staff, Status, Start Date, End Date, Progress, Notes
    - Groupings/subtotals supported for some reports (by status, staff)
    - Pagination if large
- On Export: shows "Exporting..." with spinner, disables button during

### States
- **Loading:** Table shimmer
- **Empty:** "No jobs found for current filters."
- **Exporting:** Export button shows spinner
- **API Error:** Banner at top

### Actions → UI Elements
- Apply/Update Filter: `data-testid='workreport-filter-apply'`
- Export Excel: `data-testid='workreport-export-excel'`
- Export PDF: `data-testid='workreport-export-pdf'`

### Test Identifiers
- `workreport-table`
- `workreport-row`
- `workreport-filter-apply`
- `workreport-filter-staff`
- `workreport-filter-status`
- `workreport-filter-date`
- `workreport-filter-customer`
- `workreport-export-excel`
- `workreport-export-pdf`
- `workreport-error`
- `workreport-empty`

---

## 64. Pending Job Card Help

### Route Path
`/jobs/pending-job-cards`

### Purpose
Helps users/supervisors identify all jobs with pending or incomplete job cards and guides completion.

### PRD Reference
- FR-123, FR-46

### Access Roles
- Standard User: View/complete own
- Supervisor: View/manage all, mark as complete

### UI Structure

- List/Table:
    - Columns:
        - Job Card No
        - Customer
        - Assigned Staff
        - Pending Since (Date)
        - Missing/Incomplete Info (checkboxes or text, e.g., "Missing completion note")
        - Actions: "Mark as Complete", "View Details"
    - Filters: Staff, Date, Missing info

- Mark Complete Modal/Prompt:
    - Confirm, may require entering missing info if any
    - "Mark as Complete" (`data-testid='jobcardhelp-complete-btn'`)

### States
- Loading: Table shimmer
- Empty: "No pending job cards."
- API Error: Inline alert/row message

### Actions → UI Elements
- Mark as Complete: `data-testid='jobcardhelp-complete-btn'`
- View Details: `data-testid='jobcardhelp-details-btn'`
- Filter: field-specific, e.g., `data-testid='jobcardhelp-filter-staff'`

### Test Identifiers
- `jobcardhelp-table`
- `jobcardhelp-row`
- `jobcardhelp-complete-btn`
- `jobcardhelp-details-btn`
- `jobcardhelp-filter-staff`
- `jobcardhelp-filter-date`
- `jobcardhelp-filter-missing`
- `jobcardhelp-error`
- `jobcardhelp-empty`

---

## 65. Job Status Advisor Wise (Report)

### Route Path
`/jobs/status/advisor-report`

### Purpose
Report and grouping of job statuses by advisor/staff member for workload, monitoring, and performance.

### PRD Reference
- FR-124

### Access Roles
- Supervisor, Administrator

### UI Structure

- Filter bar
    - Advisor/Staff (multi-select)
    - Date range
    - Status (multi-select)
    - Export button

- Table:
    - Advisor/Staff name (row group)
    - Job Ref
    - Customer
    - Status (pill)
    - Start/End Date
    - Progress/Notes
    - Totals per staff at bottom/group header

### States
- Loading: Table skeleton
- Empty: "No jobs for selected advisors."
- API Error: Banner/top alert

### Actions → UI Elements
- Filter Apply: `data-testid='advisorreport-apply'`
- Export: `data-testid='advisorreport-export'`

### Test Identifiers
- `advisorreport-table`
- `advisorreport-row`
- `advisorreport-apply`
- `advisorreport-export`
- `advisorreport-filter-staff`
- `advisorreport-filter-date`
- `advisorreport-filter-status`
- `advisorreport-error`
- `advisorreport-empty`

---

## 66. Work Status Report (rptWorkStatus)

### Route Path
`/jobs/work-status/rpt`

### Purpose
Comprehensive current work/job statuses, with filtering and export.

### PRD Reference
- FR-121, FR-122, FR-136

### Access Roles
- Supervisor, Administrator

### UI Structure

- Title, filter bar as in work status report
- Table:
    - Job Ref
    - Customer
    - Staff
    - Status
    - Start, End, Progress, Notes

### States and Actions
As for 63. Work Status Report

### Test Identifiers
- `rptworkstatus-table`
- `rptworkstatus-row`
- `rptworkstatus-filter-staff`
- `rptworkstatus-filter-status`
- `rptworkstatus-filter-date`
- `rptworkstatus-export-excel`
- `rptworkstatus-export-pdf`
- `rptworkstatus-error`
- `rptworkstatus-empty`

---

## 67. Work Status Summary Report (rptWorkStatusSummary)

### Route Path
`/jobs/work-status/summary-report`

### Purpose
Summarizes all work/job status by status group, location, advisor, and period for strategic review.

### PRD Reference
- FR-125, FR-126

### Access Roles
- Supervisor, Administrator

### UI Structure

- Filter bar: Date range, group/status, advisor
- Table/report:
    - Groupings: status, location/advisor
    - Columns: Status, Count, % of Total, Group
    - Visuals: summary bar/mini chart per group (optional, not required)

### States
- Loading, Error, Empty as in previous reports

### Actions → UI Elements
- Filter: `data-testid='worksummary-filter'`
- Export: `data-testid='worksummary-export'`

### Test Identifiers
- `worksummary-table`
- `worksummary-row`
- `worksummary-filter`
- `worksummary-export`
- `worksummary-error`
- `worksummary-empty`

---

## 68. Work In Progress Report (work_In_Progress)

### Route Path
`/jobs/in-progress/report`

### Purpose
List/report of all jobs currently marked as 'in progress' for supervisors and managers.

### PRD Reference
- FR-126, FR-136, US-106

### Access Roles
- Supervisor, Administrator

### UI Structure

- Filter: Date range, staff/advisor, customer, status
- Table:
    - Job/Order Ref
    - Assigned Staff
    - Customer
    - Status
    - Estimated Completion
    - Actual Completion
    - % Complete
    - Overdue? (icon/flag)
- Export: Excel/PDF

### Actions → UI Elements
- Filter Apply: `data-testid='inprogressreport-apply'`
- Export: `data-testid='inprogressreport-export'`

### Test Identifiers
- `inprogressreport-table`
- `inprogressreport-row`
- `inprogressreport-apply`
- `inprogressreport-export`
- `inprogressreport-error`
- `inprogressreport-empty`

---

## 69. Sales Order Entry

### Route Path
`/orders/:orderId?`  
(Add: `/orders/new`; Edit: `/orders/:orderId`)

### Purpose
Create or update a sales order for a customer with products, quantities, pricing, discounts, and link to customer/vehicle.

### PRD Reference
- FR-138, FR-139, FR-140, FR-141, FR-142, FR-159

### Access Roles
- Sales Staff: Add, edit assigned
- Sales Supervisor/Admin: Add/edit all

### UI Structure

- **Sales Order Form Card**
    - Fields:
        1. Customer (autocomplete, required)
        2. Vehicle (autocomplete, optional, auto-filtered by customer)
        3. Order Date (date picker, required, default today)
        4. Product Items (table)
            - Item/Product (autocomplete, required)
            - Quantity (number, required, >0)
            - Unit Price (currency, required)
            - Discount (%, optional, default per policy)
            - Tax (auto, if enabled)
            - Total (auto)
            - Remove row
        5. Order Status (dropdown)
        6. Order Notes (textarea, optional)
        7. Attachments (see Attachments spec)
    - Buttons:
        - Primary: "Save Order" (`data-testid='order-form-save'`)
        - Secondary: "Submit", if relevant (`data-testid='order-form-submit'`)
        - Cancel: (`data-testid='order-form-cancel'`)

- **Items Table**
    - "+ Add Product" (`data-testid='order-form-add-item'`)
    - Remove (`data-testid='order-form-remove-item'`)
    - Validates duplicate products

### Form Validations
- Customer, Order Date required
- At least one item, quantity > 0
- All numeric fields validated as per business rules; error below field if invalid
- Discount/Tax per legal/approved formula, auto-applied
- Cannot submit with missing required fields

### States
- Loading: Field skeletons
- Error: Banner/inline field as appropriate

### Actions → UI Elements
- Add Product: `data-testid='order-form-add-item'`
- Remove Product: as above
- Save, Submit, Cancel: buttons as above
- Attach Upload/Remove: as in Attachments

### Test Identifiers
- `order-form-customer`
- `order-form-vehicle`
- `order-form-date`
- `order-form-items`
- `order-form-add-item`
- `order-form-remove-item`
- `order-form-status`
- `order-form-notes`
- `order-form-attachments`
- `order-form-save`
- `order-form-submit`
- `order-form-cancel`
- `order-form-error`

---

## 70. Sales Order Help

### Route Path
`/orders/help`

### Purpose
Provides guided help/search for sales orders, validation tips, and quick lookup.

### PRD Reference
- FR-141, FR-160

### Access Roles
- Sales Staff, Supervisor, Admin

### UI Structure

- Search fields:
    - Order Number
    - Customer (autocomplete)
    - Status (multi-select)
    - Date Range
- Results List:
    - Key fields: Order #, Customer, Date, Status, Amount
    - "View Details" button per row
- On "View", goes to order detail page

- Help Block (top, dismissible)
    - "To find orders, enter any of: Order #, Customer, or Status. Click on a row to view or edit details..."
    - Common validation FAQs

### States
- Loading, Empty, Error as above

### Actions → UI Elements
- Search: `data-testid='orderhelp-search-btn'`
- View Details: `data-testid='orderhelp-detail-btn'`
- Expand help: `data-testid='orderhelp-help-toggle'`

### Test Identifiers
- `orderhelp-search-btn`
- `orderhelp-detail-btn`
- `orderhelp-help-toggle`
- `orderhelp-table`
- `orderhelp-error`
- `orderhelp-empty`

---

## 71. Order Status

### Route Path
`/orders/status`  
(List of all orders/status, with filters.)

### Purpose
View current status of all placed sales orders, with filter/update on permitted fields.

### PRD Reference
- FR-142, FR-155, FR-156, FR-161

### Access Roles
- Sales Staff (view own)
- Supervisor/Admin (view/update all)

### UI Structure

- **Order Status Table**
    - Columns:
        - Order #
        - Customer
        - Date
        - Status (pill, editable if permitted)
        - Assigned Sales
        - Delivery Note #
        - Total
        - Actions: Update Status (per role)
    - Filters: Status, Date, Customer, Assigned Staff

- **Status Update Modal**
    - New Status (dropdown)
    - Comment/Reason (textarea, required for some transitions)

### Form Validations
- Status change: required, only to allowed transitions
- Comment: required for certain status changes

### States
- Loading, Empty, API Error as above

### Actions → UI Elements
- Update Status: `data-testid='orderstatus-update-btn'`
- View Details: `data-testid='orderstatus-detail-btn'`
- Filter: `data-testid='orderstatus-filter-[field]'`

### Test Identifiers
- `orderstatus-table`
- `orderstatus-row`
- `orderstatus-update-btn`
- `orderstatus-detail-btn`
- `orderstatus-filter-status`
- `orderstatus-filter-date`
- `orderstatus-filter-customer`
- `orderstatus-filter-staff`
- `orderstatus-error`
- `orderstatus-empty`

---

## 72. Pending Orders List

### Route Path
`/orders/pending`

### Purpose
Display all sales orders not yet fulfilled, allow action/processing as needed.

### PRD Reference
- FR-143, FR-161

### Access Roles
- Sales Staff/Supervisor/Admin

### UI Structure

- Table:
    - Order #
    - Customer Name
    - Order Date
    - Status (pill)
    - Total
    - Expected Delivery
    - Action: View/Edit, Print List

- Filters: Date range, customer, status

### States
- Loading, Empty, Error as above

### Actions → UI Elements
- Print: `data-testid='pendingorder-print-btn'`
- View/Edit: `data-testid='pendingorder-detail-btn'`
- Filter: `data-testid='pendingorder-filter-[field]'`

### Test Identifiers
- `pendingorder-table`
- `pendingorder-row`
- `pendingorder-detail-btn`
- `pendingorder-print-btn`
- `pendingorder-filter-status`
- `pendingorder-filter-date`
- `pendingorder-filter-customer`
- `pendingorder-error`
- `pendingorder-empty`

---

## 73. Delivery Log

### Route Path
`/orders/deliveries/log`

### Purpose
Record and present all delivered sales orders for audit and reconciliation.

### PRD Reference
- FR-146

### Access Roles
- Sales Staff: view
- Supervisor/Admin: view/export/print

### UI Structure

- **Delivery Log Table**
    - Delivery Note #
    - Linked Order #
    - Customer
    - Delivery Date/Time
    - Delivered By
    - Status (Completed, Failed, Returned, etc.)
    - Export/Print

- Filter bar as above

### States
- Loading, Empty, API Error as above

### Actions → UI Elements
- Export: `data-testid='deliverylog-export-btn'`
- Print: `data-testid='deliverylog-print-btn'`
- View Details: `data-testid='deliverylog-detail-btn'`
- Filter: `data-testid='deliverylog-filter-[field]'`

### Test Identifiers
- `deliverylog-table`
- `deliverylog-row`
- `deliverylog-export-btn`
- `deliverylog-print-btn`
- `deliverylog-detail-btn`
- `deliverylog-filter-date`
- `deliverylog-filter-status`
- `deliverylog-filter-customer`
- `deliverylog-error`
- `deliverylog-empty`

---

## 74. Delivery Note Entry

### Route Path
`/orders/:orderId/delivery-note/:deliveryNoteId?`  
(Add: `/orders/:orderId/delivery-note/new`)

### Purpose
Create, edit, and manage delivery notes linked to completed sales orders with full digital audit.

### PRD Reference
- FR-145, FR-148

### Access Roles
- Sales Staff: add for orders they've processed, edit if not completed
- Supervisor/Admin: edit any, audit trail

### UI Structure

- **Delivery Note Form**
    - Fields:
        1. Linked Order # (readonly)
        2. Delivery Note Number (assigned or entered)
        3. Customer (readonly)
        4. Delivered By (dropdown/select staff, required)
        5. Delivery Date/Time (picker, required, default now)
        6. Items Delivered (table, auto from order)
        7. Acknowledgement (checkbox: "I confirm delivery was made")
        8. Remarks (optional)
    - Buttons:
        - Primary: "Save Delivery Note" (`data-testid='deliverynote-save-btn'`)
        - Cancel: (`data-testid='deliverynote-cancel-btn'`)
    - If already confirmed, disables all fields, shows "Read-only" banner.

### Form Validations
- Delivered By: required
- Date/Time: <= now, required
- Acknowledgement: must check to save
- If not all order items: warn "All items must be delivered or partial delivery must be recorded according to business rule." (if partial allowed)

### States
- Loading: form skeleton
- Error: inline, above form

### Actions → UI Elements
- Save: `data-testid='deliverynote-save-btn'`
- Cancel: `data-testid='deliverynote-cancel-btn'`

### Test Identifiers
- `deliverynote-form`
- `deliverynote-save-btn`
- `deliverynote-cancel-btn`
- `deliverynote-order`
- `deliverynote-note`
- `deliverynote-error`
- `deliverynote-readonly`

---

## 75. Change Order Customer

### Route Path
`/orders/:orderId/change-customer`

### Purpose
Allow supervisor/admin to reassign the customer for an existing sales order (with confirmation/audit).

### PRD Reference
- FR-144

### Access Roles
- Supervisor, Administrator

### UI Structure

- Card with:
    - Current Order #: readonly
    - Current Customer: readonly (name, contact)
    - New Customer: autocomplete/search (required)
    - Reason for Change: textarea (required)
    - Confirm dialog: "Changing the customer will affect reporting, allocation and all linked documents. Are you sure?" Check to enable confirm
- Buttons:
    - "Change Customer" (primary, disabled until all fields valid, `data-testid='change-customer-save'`)
    - "Cancel"

### Form Validations
- New customer: required, must not be same as current
- Reason: required
- Must check confirmation box to save

### States
- Loading: card skeleton
- Saving: spinner on save btn
- API Error: inline, above form: "Could not change customer. Please try again."
- Success: navigates back to order detail, shows toast

### Actions → UI Elements
- Save: `data-testid='change-customer-save'`
- Cancel: `data-testid='change-customer-cancel'`

### Test Identifiers
- `change-customer-form`
- `change-customer-current`
- `change-customer-new`
- `change-customer-reason`
- `change-customer-confirm`
- `change-customer-save`
- `change-customer-cancel`
- `change-customer-error`

---

## COVERAGE CHECK

| Screen Name                                                 | Status      |
|-------------------------------------------------------------|-------------|
| 51. Additional Remarks                                      | ✅ covered  |
| 52. Document Entry                                          | ✅ covered  |
| 53. Document Menu                                           | ✅ covered  |
| 54. Document Head Management                                | ✅ covered  |
| 55. Additional Remarks Reports                              | ✅ covered  |
| 56. Service Estimation Entry                                | ✅ covered  |
| 57. Estimation Approval                                     | ✅ covered  |
| 58. Job Order Status                                        | ✅ covered  |
| 59. Job Status Master                                       | ✅ covered  |
| 60. Job Status Help                                         | ✅ covered  |
| 61. Work Status                                             | ✅ covered  |
| 62. Work Status Management                                  | ✅ covered  |
| 63. Work Status Report                                      | ✅ covered  |
| 64. Pending Job Card Help                                   | ✅ covered  |
| 65. Job Status Advisor Wise (Report)                        | ✅ covered  |
| 66. Work Status Report (rptWorkStatus)                      | ✅ covered  |
| 67. Work Status Summary Report (rptWorkStatusSummary)       | ✅ covered  |
| 68. Work In Progress Report (work_In_Progress)              | ✅ covered  |
| 69. Sales Order Entry                                       | ✅ covered  |
| 70. Sales Order Help                                        | ✅ covered  |
| 71. Order Status                                            | ✅ covered  |
| 72. Pending Orders List                                     | ✅ covered  |
| 73. Delivery Log                                            | ✅ covered  |
| 74. Delivery Note Entry                                     | ✅ covered  |
| 75. Change Order Customer                                   | ✅ covered  |

---

# FRONTEND_SPEC.md

---

## 76. Sales Order Report

### Route Path
```
/orders/report
```

### Purpose
Display a detailed, filterable, and exportable report of all sales orders, allowing users to review, filter, sort, and export sales order data for analysis or reporting.

### PRD References
- FR-152, FR-138, FR-139, FR-143
- US-129, US-157, US-115, US-117

### Access Roles
- Sales staff: view, filter, export
- Sales supervisor: full access (view, filter, export)
- Administrator: all roles, including report design where permitted

---

### Layout & Components

#### 1. Header/Card
- Title: "Sales Order Report"
- Description/subtitle: "View, filter, and analyze all customer sales orders. Use filters to narrow down results by date, customer, and status."
- Filter/search bar directly above the table (see below).

#### 2. Filters
All filter fields are above the table, inside a glass-style filter bar with shadow.

| Label            | Component                | Data Type / Validation                            |
|------------------|-------------------------|---------------------------------------------------|
| Order #          | Text input              | Alphanumeric (optional)                           |
| Customer         | Searchable autocomplete | Required for customer-based filter; selects by id |
| Order Date (From)| Date picker             | Optional                                          |
| Order Date (To)  | Date picker             | Optional                                          |
| Status           | Select dropdown         | Pending, Completed, Delivered, Cancelled, etc.    |

Buttons:
- Primary: "Filter" (`data-testid='salesorderreport-filter-submit'`)
- Secondary: "Reset" (`data-testid='salesorderreport-filter-reset'`) — clears all filters.
- Secondary: "Export" (Dropdown: PDF, Excel, CSV) (`data-testid='salesorderreport-export-btn'`)

#### 3. Table

| Column Label       | Field / Source        | Notes                                   |
|--------------------|----------------------|-----------------------------------------|
| Order #            | orderNumber/Ordr     | Always visible, clickable to view order |
| Customer           | customerName         | Human-readable, from CustomerSql view   |
| Order Date         | orderDate/Ordt       | Formatted to local date string          |
| Status             | status               | Colored pill: warning/pending, success, error |
| Created By         | createdBy            | Creator user display name               |
| Last Updated       | editedDt             | Last update datetime, locale string     |
| Total              | total                | Currency, localized                     |

Table features:
- Sortable by any column.
- Pagination (50 per page default, top/bottom controls).
- Responsive: on mobile wide columns wrap, dropdowns compact.
- Hover state on row: light overlay, never shadow.
- Row click: opens order view page (`/orders/:orderId`).

Empty State:
- "No sales orders found matching your filters." (`data-testid='salesorderreport-emptystate'`)
- Link/button: "+ New Sales Order" (if user has creation rights, routes to `/orders/new`, `data-testid='salesorderreport-new-btn'`)

Loading State:
- Table skeleton rows and pulsing skeleton filter bar.

Error State:
- Top error bar for API errors: "Failed to fetch sales orders. Please try again." (`data-testid='salesorderreport-error'`)

#### 4. Action Bar (Top/Right)
- "+ New Sales Order" (primary accent button if permitted) (`data-testid='salesorderreport-new-btn'`)
- "Export" button (PDF/Excel/CSV) (`data-testid='salesorderreport-export-btn'`)
- Print icon button (`data-testid='salesorderreport-print-btn'`)

---

### Form Validation & Error Handling

- Date field: must be valid date. If 'from' > 'to', show: "Start date must be before end date." Adjacent to dates.
- Customer field: if required, "Please select a customer."
- Status: always optional, defaults to "Any".

---

### Interactions

- On "Filter": disables all controls while fetching, shows spinner in Filter button, replaces table with skeletons.
- On "Export": menu dropdown (PDF, Excel, CSV); disables if table is empty.
- On any row click: navigates to detailed order page for selected order.

---

### Test Identifiers

- `salesorderreport-filter-submit`
- `salesorderreport-filter-reset`
- `salesorderreport-emptystate`
- `salesorderreport-new-btn`
- `salesorderreport-table`
- `salesorderreport-row-[orderNumber]`
- `salesorderreport-export-btn`
- `salesorderreport-print-btn`
- `salesorderreport-error`

---

## 77. Order Status Report

### Route Path
```
/orders/status-report
```

### Purpose

Display a summary and breakdown of sales orders by status across different dimensions (date, customer, status, totals) for operational monitoring and oversight.

### PRD References

- FR-142, FR-146, FR-152, FR-153, FR-155, FR-157
- US-119, US-129

### Access Roles

- Sales supervisor: all report actions
- Administrator: full access
- Sales staff: can view (if permitted)

---

### Layout & Components

#### 1. Header
- Title: "Order Status Report"
- Subtitle: "Summary and analysis of sales orders by status."

#### 2. Filters

| Label          | Component                | Data Type / Validation                          |
|----------------|-------------------------|-------------------------------------------------|
| Customer       | Searchable autocomplete | Optional                                        |
| Status         | Select dropdown         | All, Pending, Completed, Delivered, etc.        |
| Date (From)    | Date picker             | Optional                                        |
| Date (To)      | Date picker             | Optional                                        |

Buttons:
- "Filter" (primary) (`data-testid='orderstatusreport-filter-submit'`)
- "Reset" (secondary) (`data-testid='orderstatusreport-filter-reset'`)
- "Export" (secondary, dropdown: PDF, Excel, CSV) (`data-testid='orderstatusreport-export-btn'`)

#### 3. Table

| Column         | Field/Source            | Notes                     |
|----------------|------------------------|---------------------------|
| Order #        | orderNumber/Ordr       | Clickable                 |
| Customer       | customerName           | As above                  |
| Order Date     | orderDate              | Local time                |
| Status         | status                 | Colored pill              |
| Staff/Advisor  | staffName              | If available              |
| Last Updated   | editedDt               | DateTime                  |
| Total          | total                  | Currency, right aligned   |

Totals row at bottom:
- Groups orders by status (sum per status below table).

Pagination:
- As above (default 50/page).

Expandable Row:
- Per order, clicking to expand shows detailed status history (timeline: created → in progress → completed → delivered, with times and responsible users).

Empty State:
- "No records found for the selected filters." (`data-testid='orderstatusreport-emptystate'`)

Loading State:
- Similar skeletons as previous.

Error State:
- Shows top error banner.

---

### Validation

- From/To date validation, as above.
- No required fields; any combination allowed.

---

### Interactions

- Click column header sorts ascending/descending.
- Export downloads shown data (all filters applied).
- Clicking a row expands/collapses status timeline for that order.
- Row click otherwise opens detailed order page.

---

### Test Identifiers

- `orderstatusreport-filter-submit`
- `orderstatusreport-filter-reset`
- `orderstatusreport-export-btn`
- `orderstatusreport-print-btn`
- `orderstatusreport-emptystate`
- `orderstatusreport-table`
- `orderstatusreport-row-[orderNumber]`
- `orderstatusreport-expand-[orderNumber]`
- `orderstatusreport-error`

---

## 78. Pending Order Register Report

### Route Path
```
/orders/pending-register
```

### Purpose

Display all sales orders that have not yet been fulfilled (delivered or completed), prioritized by order date and urgency, with filtering, printing, and export capabilities.

### PRD References

- FR-143, FR-161, FR-154, FR-152
- US-120, US-157

### Access Roles

- Sales staff: view, print, export
- Sales supervisor: all actions
- Administrator: all actions

---

### Layout & Components

#### 1. Header
- Title: "Pending Order Register"
- Description: "All unfulfilled sales orders. Prioritized by date and urgency."

#### 2. Filters

| Label        | Component                | Data Type / Validation              |
|--------------|-------------------------|-------------------------------------|
| Customer     | Searchable autocomplete | Optional                            |
| Order Date (From) | Date picker        | Optional                            |
| Order Date (To) | Date picker          | Optional                            |
| Days Pending | Number input            | Filter for orders pending > X days (optional) |

Buttons:
- "Filter" (`data-testid='pendingorderregister-filter-submit'`)
- "Reset"  (`data-testid='pendingorderregister-filter-reset'`)
- "Export" (`data-testid='pendingorderregister-export-btn'`)

#### 3. Table

| Column      | Field          | Notes                      |
|-------------|----------------|----------------------------|
| Order #     | orderNumber    |                            |
| Customer    | customerName   |                            |
| Order Date  | orderDate      |                            |
| Days Pending| daysPending    | Calculated = today - orderDate |
| Status      | status         |                             |
| Expected Delivery | expectedDeliveryDate |                |
| Total       | total          | Currency                   |

- Sortable columns, pagination.
- Orders with most days pending appear first (default sort).

Empty State:
- "All orders fulfilled — no pending records!" (`data-testid='pendingorderregister-emptystate'`)

---

### Validation

- Date field checks as above.
- Days Pending: must be a positive integer or blank.

---

### Interactions

- On "Export", downloads filtered data.
- Clicking a row opens order details.

---

### Test Identifiers

- `pendingorderregister-filter-submit`
- `pendingorderregister-filter-reset`
- `pendingorderregister-export-btn`
- `pendingorderregister-emptystate`
- `pendingorderregister-row-[orderNumber]`
- `pendingorderregister-table`
- `pendingorderregister-error`

---

## 79. Delivery Note Report

### Route Path
```
/delivery-notes/report
```

### Purpose

Generate a printable/exportable report listing delivery notes linked to sales orders, showing all delivered items for audit and distribution.

### PRD References

- FR-145, FR-148, FR-152, FR-125
- US-122, US-129, US-123

### Access Roles

- Sales staff, supervisor, administrator

---

### Layout & Components

#### 1. Header
- Title: "Delivery Note Report"
- Subtitle: "Delivery notes generated for sales orders, including items and recipients."

#### 2. Filters

| Label            | Component                | Data Type / Validation      |
|------------------|-------------------------|----------------------------|
| Delivery Note #  | Text input              | Optional                   |
| Customer         | Searchable autocomplete | Optional                   |
| Delivery Date (From) | Date picker         | Optional                   |
| Delivery Date (To)   | Date picker         | Optional                   |

Buttons:
- "Filter"
- "Reset"
- "Export" (PDF, Excel, CSV)
- "Print" (uses print stylesheet)

#### 3. Table

| Column               | Field                  | Notes                        |
|----------------------|-----------------------|------------------------------|
| Delivery Note #      | DONo                   | Clickable for preview        |
| Associated Order #   | OrderNumber/Ordr       |                              |
| Customer             | customerName           |                              |
| Delivery Date        | deliveryDate/DODt      |                              |
| Delivery Status      | status                 | Pill: success/partial/error  |
| Recipient            | deliveredTo            | If tracked                   |
| Items Delivered      | itemsSummary           | Shows count/list summary     |
| Acknowledgement      | acknowledgement        | Printed for physical sign-off|

- Row click: view delivery note detail (modal overlay, summary + full item list).
- Rendering for print: enforces per-note separation and page breaks.

Empty State:
- "No delivery notes found."

---

### Interactions

- "Print": opens print dialog with print-optimized layout.
- "Export": downloads current filtered data.

---

### Test Identifiers

- `deliverynotereport-filter-submit`
- `deliverynotereport-filter-reset`
- `deliverynotereport-table`
- `deliverynotereport-row-[deliveryNoteNumber]`
- `deliverynotereport-rowmodal-[deliveryNoteNumber]`
- `deliverynotereport-export-btn`
- `deliverynotereport-print-btn`
- `deliverynotereport-emptystate`
- `deliverynotereport-error`

---

## 80. Foreign Purchase Entry

### Route Path
```
/purchases/foreign/new
/purchases/foreign/:purchaseOrderId/edit
```

### Purpose

Create or edit a new foreign purchase order; form collects supplier, item, delivery, and financial details.

### PRD References

- FR-163, FR-165, FR-168, FR-166, FR-188, FR-176
- US-130

### Access Roles

- Purchase officer: create/edit
- Supervisor: approval
- Procurement admin: edit/approval

---

### Layout & Components

#### Header
- Title: "New Foreign Purchase Order" (or "Edit Foreign Purchase Order" on edit route)
- Breadcrumb: Purchases > Foreign > [New | Edit]

#### Form Fields

| Label                   | Field                 | Type                            | Validation & Error Message                            |
|-------------------------|-----------------------|----------------------------------|-------------------------------------------------------|
| Supplier                | supplier              | Searchable autocomplete         | Required ("Please select a supplier.")                |
| Purchase Order #        | purchaseNo            | Autonumber or text (readonly on edit) | Required, unique, show if auto-generated             |
| Purchase Date           | purchaseDate          | Date picker                     | Required                                              |
| Currency                | currency              | Select (common currencies)      | Required                                              |
| Items                   | items                 | Array/in-grid; see below        | Min 1 required ("At least one item is required.")     |
| Expected Delivery Date  | expectedDeliveryDate  | Date picker                     | Optional                                              |
| Delivery Terms          | deliveryTerms         | Text input                      | Required                                              |
| Payment Terms           | paymentTerms          | Text input                      | Required                                              |
| Attach Invoice/Docs     | attachments           | Dropzone/file input             | Max 10 files, allowed types: pdf, jpg, png, doc, xls  |
| Notes/Remarks           | remarks               | Textarea                        | Optional                                              |

**Items Grid Subform**

Columns per row:
- Item (autocomplete from ItemsSql, required)
- Description (auto from item)
- Quantity (number > 0, required)
- Unit Price (currency, required)
- Currency (shows selected PO currency)
- Amount (auto-calc: qty * unit price)
- Remove row (icon button)

Action: "+ Add Item" (`data-testid='foreignpurchaseentry-additem'`)

#### Action Buttons

- "Save Purchase Order" (primary, submits form, disabled if pristine/invalid, `data-testid='foreignpurchaseentry-save-btn'`)
- "Cancel" (secondary, routes back to PO list, `data-testid='foreignpurchaseentry-cancel-btn'`)

If editing an existing PO:
- "Submit for Approval" (primary accent, visible if status allows)
- "Print PO" (icon, print preview/modal)

---

### Form Validation & Error Handling

- All required fields block submit with red border and error message.
- Items: validate at least 1 with all their requireds met (error row-wise).
- If duplicate item rows: error on item row "Duplicate item.".

API/network errors:
- Show top form error banner on failure to save: "Failed to save purchase order. Please try again."

File errors:
- "Attachment must be PDF, DOC, XLS, JPG, or PNG and less than 10MB."

---

### Loading/Error States

- Form: Loading pulsing skeletons if editing an existing record; otherwise empty.
- Error: All field errors shown inline, general errors as top banner.

---

### After Save/Navigate

- After successful save, route to `/purchases/foreign` (list page) and flash "Purchase order saved!".

---

### Test Identifiers

- `foreignpurchaseentry-save-btn`
- `foreignpurchaseentry-cancel-btn`
- `foreignpurchaseentry-form-supplier`
- `foreignpurchaseentry-form-purchaseno`
- `foreignpurchaseentry-form-date`
- `foreignpurchaseentry-form-currency`
- `foreignpurchaseentry-form-itemrow`
- `foreignpurchaseentry-additem`
- `foreignpurchaseentry-attachments`
- `foreignpurchaseentry-submitforapproval-btn`
- `foreignpurchaseentry-print-btn`
- `foreignpurchaseentry-error`

---

## 81. Local Purchase Entry

### Route Path
```
/purchases/local/new
/purchases/local/:purchaseOrderId/edit
```

### Purpose

Create or edit a new local purchase order; very similar to Foreign Purchase Entry but supplier options and currency likely default to local.

### PRD References

- FR-164, FR-165, FR-168, FR-166, FR-188, FR-176
- US-140

### Access Roles

- Purchase officer: create/edit
- Supervisor: approval
- Procurement admin: edit/approval

---

### Layout & Components

#### Header
- Title: "New Local Purchase Order" (or "Edit Local Purchase Order")
- Breadcrumb: Purchases > Local > [New | Edit]

Form fields (as above), but:
- Supplier: limited to suppliers marked "Local"
- Currency: defaulted to local (read-only if business rule)
- Expected Receipt Date: replaces Expected Delivery Date

**Otherwise field list and validation are the same as Foreign Purchase Entry.**

Additional possible fields per PRD:
- Attach supplier invoice (required if over configured value)
- Invoice # (required if attaching an invoice)

#### Action Buttons

- "Save Purchase Order" (primary, `data-testid='localpurchaseentry-save-btn'`)
- "Cancel" (secondary, back to PO list, `data-testid='localpurchaseentry-cancel-btn'`)
- "Submit for Approval" (if in draft/needs approval state)
- "Print PO"

---

### Form Validation & Error Handling

- Same as above, supplier must be local.
- If invoice attached, must provide invoice number.

---

### Loading/Error States

- As above.

---

### After Save/Navigate

- Route back to `/purchases/local`

---

### Test Identifiers

- `localpurchaseentry-save-btn`
- `localpurchaseentry-cancel-btn`
- `localpurchaseentry-form-supplier`
- `localpurchaseentry-form-purchaseno`
- `localpurchaseentry-form-date`
- `localpurchaseentry-form-currency`
- `localpurchaseentry-form-itemrow`
- `localpurchaseentry-additem`
- `localpurchaseentry-attachments`
- `localpurchaseentry-submitforapproval-btn`
- `localpurchaseentry-print-btn`
- `localpurchaseentry-error`

---

## 82. Local Purchase Order Entry

> Consolidated into Local Purchase Entry (`/purchases/local/new`, see above). No separate screen required — same form handles both entry and inline line item management.

---

## 83. Local Purchase Order Management

### Route Path
```
/purchases/local
```

### Purpose

List, search, filter, review, and take action on all local purchase orders in the system. Supports management workflow (review status, approval/rejection, view details, bulk import).

### PRD References

- FR-162, FR-170, FR-169, FR-173, FR-174, FR-184, FR-188
- US-136, US-138, US-134, US-140

### Access Roles

- Purchase officer: view, add new, filter/search, view detail
- Supervisor: approve/reject, export, print
- Procurement admin: all
- View only: standard user (as per role)

---

### Layout & Components

#### 1. Header
- Title: "Local Purchase Orders"
- Description: "Find, manage, and review all local purchase orders."

#### 2. Filter Bar

| Label              | Component                    | Data Type / Validation      |
|--------------------|-----------------------------|----------------------------|
| PO Number          | Text input                  | Optional                   |
| Supplier           | Searchable autocomplete     | Optional                   |
| Invoice #          | Text input                  | Optional                   |
| Status             | Select dropdown             | Draft, Submitted, Approved, Received, Closed |
| Date (From)        | Date picker                 | Optional                   |
| Date (To)          | Date picker                 | Optional                   |
| Bulk Import        | File input button           | Only admins/supervisors    |

Buttons:
- "+ New Purchase Order" (primary, routes to `/purchases/local/new`)
- "Bulk Import" (launches import dialog, `data-testid='localpurchase-bulkimport-btn'`)
- "Export" (PDF, Excel, CSV)
- "Print"

#### 3. Table

| Column               | Field/Source            | Notes                               |
|----------------------|------------------------|-------------------------------------|
| PO #                 | purchaseNo             |                                     |
| Supplier             | supplierName           |                                     |
| Invoice #            | supplierInvoiceNo      | If available                        |
| Status               | status                 | Pill: draft, approved, etc.         |
| Created On           | createdDate            |                                     |
| Approved On          | approvedDate           |                                     |
| Receipt Status       | receiptStatus          | "Pending," "Received," "Partial"    |
| Amount (Total)       | totalAmount            | Right aligned, currency             |
| Attachments          | attachmentIndicator    | Paperclip icon, click to preview    |
| Actions              | View, Edit, Approve, Reject, Print (permissions-based)

- Row click: open purchase order view/details (modal or `/purchases/local/:id`)
- Approve/Reject buttons only shown if status is submitted and user has authority.
- Bulk select (checkboxes per row) for multi-approve/reject (admin only).

---

### Empty, Loading, Error States

- Empty: "No purchase orders found" (data-testid)
- Loading: Table skeletons + fade-in
- Error: Banner (top of card): "Failed to load purchase order records."

---

### Pagination

- 20 per page default; "Page X of Y" at bottom; controls to navigate; dropdown to change per-page count.

---

### Interactions

- Inline filter bar disables during search.
- "Export" downloads full result set (filters applied).
- "Bulk Import": opens modal with file picker; after upload, results summary (success/failure); progress bar as per DS.

---

### Test Identifiers

- `localpurchase-list-add-btn`
- `localpurchase-list-bulkimport-btn`
- `localpurchase-list-export-btn`
- `localpurchase-list-print-btn`
- `localpurchase-list-table`
- `localpurchase-list-row-[poNumber]`
- `localpurchase-list-action-approve`
- `localpurchase-list-action-reject`
- `localpurchase-list-action-edit`
- `localpurchase-list-action-view`
- `localpurchase-list-row-attachment`
- `localpurchase-list-emptystate`
- `localpurchase-list-error`
- `localpurchase-list-pagination-[page]`

---

## 84. Pending Purchase Delivery Order

### Route Path
```
/purchases/delivery-orders/pending
```

### Purpose

Display all purchase delivery orders that are pending receipt. Allows filtering, viewing linked purchase data, and marking deliveries as received.

### PRD References

- FR-179, FR-180, FR-146, FR-144, FR-174, FR-145
- US-133, US-134, US-135, US-139

### Access Roles

- Purchase officer: view, filter, record receipt (allowed ones)
- Warehouse staff: record receipt
- Supervisor/Admin: full access (approve, export, action)

---

### Layout & Components

#### 1. Header
- Title: "Pending Purchase Delivery Orders"
- Description: "All purchase deliveries not yet marked as received."

#### 2. Filters

| Label           | Component              | Validation          |
|-----------------|-----------------------|---------------------|
| Delivery Order #| Text input             | Optional            |
| Supplier        | Searchable autocomplete| Optional            |
| PO #            | Text input             | Optional            |
| Delivery Date (From) | Date picker       | Optional            |
| Delivery Date (To)   | Date picker       | Optional            |
| Status          | Select dropdown        | Only "Pending"      |

Buttons:
- "Filter"
- "Reset"
- "Export"
- "Mark as Received" (for warehouse roles, per-row)

#### 3. Table

| Column                | Field/Source     | Notes                       |
|-----------------------|-----------------|-----------------------------|
| Delivery Order #      | PDONo           |                             |
| PO #                  | POrder          |                             |
| Supplier              | supplierName    |                             |
| Delivery Date         | deliveryDate    |                             |
| Status                | status          | Pill: always "Pending"      |
| Expected Delivery     | expectedDelivery|                             |
| Items Due             | itemsSummary    | "3 items / 12 units"        |
| Overdue?              | overdueDays     | Red badge if >0             |
| Actions               | View, Edit (if permitted), "Mark as Received"

#### 4. Row Actions

- "Mark as Received" (primary if allowed), launches inline modal with:
  - List of items (item, qty due), input for "Qty Received"
  - Date/Time (default now, editable)
  - Attach supporting docs (optional)
  - Remarks (optional)

Buttons (inside modal): "Confirm Receipt" (primary), "Cancel" (secondary)

---

### Empty, Loading, Error States

- Empty: "No pending delivery orders."
- Loading: Table skeletons, apply same to inline modals if fetching data.
- Error: Banner at top ("Failed to load delivery order data.")

---

### Validation

- "Qty Received": Required, numeric, cannot exceed "Qty Due"
- Date: Must not be in future
- Attachment: Valid type/size

---

### Interactions

- "Export": downloads filtered set (CSV/PDF/Excel)
- Editing a DO only if permitted status/user

---

### Test Identifiers

- `pendingpurchase-do-filter-submit`
- `pendingpurchase-do-filter-reset`
- `pendingpurchase-do-export-btn`
- `pendingpurchase-do-table`
- `pendingpurchase-do-row-[deliveryOrderNo]`
- `pendingpurchase-do-markreceived-btn`
- `pendingpurchase-do-markreceived-modal`
- `pendingpurchase-do-row-overdue`
- `pendingpurchase-do-emptystate`
- `pendingpurchase-do-error`

---

## 85. Purchase Delivery Order

### Route Path
```
/purchases/delivery-orders/:deliveryOrderNo
```

### Purpose

View full details of a single purchase delivery order: header, associated PO, items, receipt status, attachments, notes.

### PRD References

- FR-180, FR-181, FR-172, FR-144, FR-175
- US-134, US-133

### Access Roles

- Purchase officer, warehouse, supervisor, admin (roles per action as above)

---

### Layout & Components

#### 1. Header
- Title: "Purchase Delivery Order #[PDONo]"
- PO, Supplier names as subtitle

#### 2. Detail Card

| Field Label           | Value Component         | Notes   |
|-----------------------|------------------------|---------|
| Delivery Order #      | Text                   |         |
| Linked Purchase Order | Link to PO / text      | "/purchases/local/:poNo" |
| Supplier              | supplierName           |         |
| Delivery Date         | deliveryDate           |         |
| Status                | status pill            |         |
| Expected Delivery     | expectedDelivery       |         |
| Receipt Status        | receiptStatus          |         |
| Created By            | createdBy (name)       |         |
| Created On            | createdOn (date)       |         |
| Attachments           | Attachment chips/list  | Preview/download         |
| Notes                 | Text                   |         |

#### 3. Items Table

| Column    | Field               | Notes                |
|-----------|---------------------|----------------------|
| Item      | itemName            |                      |
| Description | itemDescription   |                      |
| Quantity  | qtyOrdered          |                      |
| Qty Received | qtyReceived      |                      |
| Unit Price | unitPrice          |                      |
| Amount     | amount             |                      |

#### 4. Actions

If not yet received and user permitted:
- "Mark as Received" (primary, see above — confirms entire DO/items)
- "Print" (secondary)
- "Download as PDF"
- "Back" (returns to pending DOs or list, `data-testid='purchasedodelivery-back-btn'`)

If already complete:
- "View Receipt Log" (modal or section — showing receiver, time, any docs/note)

---

### Loading, Error, Empty States

- Loading: Detail skeletons.
- Error: Top error ("Failed to load delivery order.").
- If DO not found: "Delivery order not found." (`data-testid='purchasedodelivery-notfound'`)

---

### Validation

- All display only except actions; "Mark as Received" launches modal (see previous).

---

### Test Identifiers

- `purchasedodelivery-header`
- `purchasedodelivery-itemtable`
- `purchasedodelivery-print-btn`
- `purchasedodelivery-download-btn`
- `purchasedodelivery-back-btn`
- `purchasedodelivery-markreceived-btn`
- `purchasedodelivery-receipthistory-btn`
- `purchasedodelivery-error`
- `purchasedodelivery-notfound`

---

## 86. Purchase DO Search

### Route Path
```
/purchases/delivery-orders/search
```

### Purpose

Search and filter all delivery orders (not just pending), allowing powerful multi-criteria queries and export.

### PRD References

- FR-170, FR-179, FR-188, FR-183
- US-135

### Access Roles

- All purchase-related roles

---

### Layout & Components

#### Header

- Title: "Search Purchase Delivery Orders"
- Subtitle: "Find any DO by multiple filters. Export results for auditing, reconciliation, or analysis."

#### Filters (multi-criteria)

| Label             | Component            | Validation         |
|-------------------|---------------------|--------------------|
| Delivery Order #  | Text input          | Optional           |
| PO #              | Text input          | Optional           |
| Supplier          | Searchable autocomplete | Optional           |
| Status            | Dropdown             | All/Pending/Received/Closed  |
| Created By        | Searchable autocomplete | Optional           |
| Created Date From | Date picker          | Optional           |
| Created Date To   | Date picker          | Optional           |
| Item Code         | Item autocomplete    | Optional           |
| Export as         | Dropdown             | CSV, Excel, PDF

Buttons:
- "Search" (`data-testid='purchasedosearch-search-btn'`)
- "Reset"
- "Export" (to download current search results)

#### Results Table

| Column           | Field                  | Notes                       |
|------------------|------------------------|-----------------------------|
| Delivery Order # | PDONo                  |                             |
| PO #             | POrder                 |                             |
| Supplier         | supplierName           |                             |
| Status           | status                 |                             |
| Created Date     | createdDate            |                             |
| Item(s)          | itemsSummary           |                             |
| Actions          | View (opens detail)

Empty State:
- "No delivery orders found for selected filters."

Pagination:
- Per usual standards; 20 per page default

---

### Loading, Error State

- Table skeletons loading.
- Error: "Could not load delivery order records."

---

### Interactions

- All filters client-side or server-side; Submit disables controls while searching.
- "Export" pulls filtered result set (not entire DO database).
- View button opens `/purchases/delivery-orders/:deliveryOrderNo`.

---

### Test Identifiers

- `purchasedosearch-search-btn`
- `purchasedosearch-reset-btn`
- `purchasedosearch-export-btn`
- `purchasedosearch-table`
- `purchasedosearch-row-[deliveryOrderNo]`
- `purchasedosearch-view-btn`
- `purchasedosearch-emptystate`
- `purchasedosearch-error`

---

## 87. PurchaseOrder Report

### Route Path
```
/purchases/report
```

### Purpose

Generate and export a detailed report of all purchase orders (local/foreign), itemized, filterable, with grouping, totals, and per-supplier breakdowns as needed.

### PRD References

- FR-172, FR-171, FR-186, FR-188
- US-137, US-138

### Access Roles

- Supervisor, procurement admin: all actions, export, print
- Purchase officer: view/export

---

### Layout & Components

#### 1. Header
- Title: "Purchase Order Report"
- Subtitle: "Analyze all purchase order activity. Group by period, supplier, status, or item."

#### Filters

| Label          | Component                | Validation       |
|----------------|-------------------------|------------------|
| Report Period  | Date range picker        | Required         |
| Supplier       | Searchable autocomplete  | Optional         |
| PO Status      | Dropdown (multi)         | Draft/Approved/Closed |
| PO #           | Text input               | Optional         |
| Group By       | Dropdown: Supplier/Date/Status/Item | Default: Supplier |

Buttons:
- "Generate Report" (primary)
- "Export" (dropdown: PDF, Excel, CSV)
- "Print"

#### Report Table

| Column          | Content                     | Notes                              |
|-----------------|----------------------------|------------------------------------|
| PO #            | purchaseOrderNo            |                                    |
| Supplier        | supplierName               |                                    |
| Created Date    | dateCreated                |                                    |
| Status          | status                     |                                    |
| Item(s)         | itemSummary                |                                    |
| Total           | totalAmount                |                                    |
| Attachments     | attachmentIndicator        | Icon if available, open preview    |

Totals (per group and grand total where applicable):

- Subtotals by supplier/status/item/period (expandable group rows)

Empty State:
- "No purchase orders in selected period or filters."

---

### Loading/Error State

- Report skeleton (rows, group rows)
- Error banner

---

### Interactions

- Group headers sticky in long tables
- Clicking a PO # or row opens PO detail

---

### Test Identifiers

- `purchaseorderreport-generate-btn`
- `purchaseorderreport-export-btn`
- `purchaseorderreport-print-btn`
- `purchaseorderreport-table`
- `purchaseorderreport-row-[purchaseOrderNo]`
- `purchaseorderreport-emptystate`
- `purchaseorderreport-error`

---

## 88. PurchaseDo01PDO Report

### Route Path
```
/purchases/delivery-orders/pdo-report
```

### Purpose

Generate detailed report linking purchase delivery orders to their parent purchase orders, showing linkage, item details, delivery and receipt info, and allowing filtering and export.

### PRD References

- FR-172, FR-179, FR-177
- US-146

### Access Roles

- Supervisor, procurement admin, warehouse

---

### Layout & Components

#### 1. Header
- Title: "Purchase DO to PO Report"
- Subtitle: "Detailed linkage and reconciliation of delivery orders to purchase orders."

#### Filters

| Label         | Component                | Validation    |
|---------------|-------------------------|---------------|
| Supplier      | Searchable autocomplete | Optional      |
| PO #          | Text input              | Optional      |
| Delivery Order # | Text input           | Optional      |
| Item          | Item autocomplete       | Optional      |
| Date (From)   | Date picker             | Optional      |
| Date (To)     | Date picker             | Optional      |

Buttons:
- "Filter"
- "Export"
- "Print"

#### Table

| Column            | Content                       | Notes            |
|-------------------|------------------------------|------------------|
| Delivery Order #  | PDONo                        |                  |
| Linked PO #       | POrder (link if permitted)   |                  |
| Supplier          | supplierName                 |                  |
| Item              | itemSummary                  |                  |
| Delivery Date     | deliveryDate                 |                  |
| Qty Ordered       | qtyOrdered                   |                  |
| Qty Delivered     | qtyDelivered                 |                  |
| Receipt Status    | receiptStatus                |                  |
| Actions           | View linked PO/DO detail

Totals:
- By supplier, PO, overall

Empty State:
- "No linked PO/DO records found."

---

### Test Identifiers

- `purchasedo01pdo-filter-btn`
- `purchasedo01pdo-export-btn`
- `purchasedo01pdo-print-btn`
- `purchasedo01pdo-table`
- `purchasedo01pdo-row-[pdoNo]`
- `purchasedo01pdo-emptystate`
- `purchasedo01pdo-error`

---

## 89. pendingPurchaseDo Report

### Route Path
```
/purchases/delivery-orders/pending-report
```

### Purpose

Analytical report of all purchase delivery orders currently pending/due, for procurement tracking and compliance/audit.

### PRD References

- FR-179, FR-180, FR-177, FR-186
- US-145

### Access Roles

- Supervisor, procurement admin, warehouse

---

### Layout & Components

#### 1. Header
- Title: "Pending Purchase Delivery Orders Report"
- Subtitle: "Detailed reporting of outstanding delivery orders."

#### Filters

| Label         | Component                      | Validation |
|---------------|-------------------------------|------------|
| Supplier      | Autocomplete                   | Optional   |
| PO #          | Text input                     | Optional   |
| Delivery DO # | Text input                     | Optional   |
| Date (From)   | Date picker                    | Optional   |
| Date (To)     | Date picker                    | Optional   |
| Overdue Only  | Checkbox                       | Optional   |

Buttons:
- "Filter"
- "Export"
- "Print"

#### Table

| Column             | Content                    | Notes                           |
|--------------------|---------------------------|----------------------------------|
| Delivery Order #   | PDONo                      |                                 |
| PO #               | POrder                     |                                 |
| Supplier           | supplierName               |                                 |
| Delivery Date      | deliveryDate               |                                 |
| Expected Delivery  | expectedDelivery           |                                 |
| Days Overdue       | daysOverdue                | Red badge if overdue            |
| Items Due          | itemsSummary               |                                 |
| Actions            | View, Mark as received     |                                 |

Totals at bottom (count, sum pending quantity/amount)

---

### Empty, Loading, Error States

- As standard.

---

### Interactions

- "Export" triggers download of current filter set.
- "Mark as received" launches inline modal on any row.

---

### Test Identifiers

- `pendingpurchasedo-filter-btn`
- `pendingpurchasedo-export-btn`
- `pendingpurchasedo-print-btn`
- `pendingpurchasedo-table`
- `pendingpurchasedo-row-[pdoNo]`
- `pendingpurchasedo-emptystate`
- `pendingpurchasedo-error`

---

## 90. Stock In Entry

### Route Path
```
/inventory/stock-in/new
/inventory/stock-in/:entryId/edit
```

### Purpose

Create or edit a new stock receipt entry, recording item inbound movement and updating inventory.

### PRD References

- FR-189
- US-151

### Access Roles

- Inventory Clerk: create/edit
- Supervisor: approve, edit
- Inventory Manager: all actions

---

### Layout & Components

#### Header
- Title: "New Stock In Entry" (or "Edit Stock In Entry")
- Breadcrumb: Inventory > Stock In > [New | Edit]

Form Fields

| Label                      | Field                | Type              | Validation / Error                 |
|----------------------------|----------------------|-------------------|------------------------------------|
| Supplier                   | supplier             | Autocomplete      | Required                           |
| Reference #                | stockRefNo           | Text              | Required, unique if not autogenerated |
| Received Date              | receivedDate         | Date Picker       | Required, not future date         |
| Warehouse/Location         | location             | Autocomplete      | Required                           |
| Items List                 | items[]              | Grid/Subform      | At least 1 row                     |
| Attach Supporting Docs     | attachments          | Dropzone/Input    | Max 10 files, see format rules     |
| Remarks                    | remarks              | Textarea          | Optional                           |

**Items Subform**

- Item (autocomplete from ItemsSql, required)
- Description (fetched)
- Quantity (required, positive number)
- Unit Price (required, positive number)
- Total (auto-calc: qty*unit)
- Remove (icon, data-testid='stockinentry-item-remove')

+ "Add Item" row (`data-testid='stockinentry-additem'`)

---

Action Buttons

- "Save Stock In" (primary, data-testid='stockinentry-save-btn')
- "Cancel" (secondary)
- "Print Entry" (on edit)

---

### Form Validation & Error Handling

- All requireds with explicit error messages: "Please select a supplier." etc.
- Quantity: must be > 0 and integer/decimal allowed per item settings.
- Duplicate item: error "Item already listed above."
- Attachments: type/size as above.

---

Loading

- Pulsing skeletons for form during fetch/edit.

Error State

- Banner at top if save fails: "Failed to save stock in entry."

---

After Save

- Navigates back to `/inventory/stock-in`, flashes "Entry saved."

---

### Test Identifiers

- `stockinentry-save-btn`
- `stockinentry-cancel-btn`
- `stockinentry-form-supplier`
- `stockinentry-form-ref`
- `stockinentry-form-date`
- `stockinentry-form-location`
- `stockinentry-items-table`
- `stockinentry-additem`
- `stockinentry-attachments`
- `stockinentry-print-btn`
- `stockinentry-error`

---

## 91. Stock Out Entry

### Route Path
```
/inventory/stock-out/new
/inventory/stock-out/:entryId/edit
```

### Purpose

Record or edit a new stock issuance/disbursement movement for inventory.

### PRD References

- FR-190
- US-152

### Access Roles

- Inventory Clerk, Supervisor, Inventory Manager

---

### Layout & Components

#### Header
- Title: "New Stock Out Entry" (or "Edit Stock Out Entry")

Form Fields

| Label                      | Field                | Type               | Validation / Error            |
|----------------------------|----------------------|--------------------|-------------------------------|
| Recipient/Dept             | recipient            | Autocomplete       | Required                      |
| Reference #                | stockOutRefNo        | Text               | Required, unique              |
| Issue Date                 | issueDate            | Date Picker        | Required, not future          |
| Warehouse/Location         | location             | Autocomplete       | Required                      |
| Items Issued               | items[]              | Subform Grid       | Min 1 row                     |
| Remarks                    | remarks              | Textarea           | Optional                      |

Items Subform

- Item (autocomplete)
- Description (auto)
- Quantity (must not exceed stock, required)
- Remove (icon)

+ "Add Item"

---

Action Buttons

- "Save Stock Out" (primary)
- "Cancel"
- "Print Entry"

---

Validation & Error Handling

- Quantity: max = current available for selected item/location; error: "Insufficient stock (X available)."
- Requireds as usual.

---

Loading/Error States

- As standard.

After Save:
- Returns to `/inventory/stock-out`.

---

### Test Identifiers

- `stockoutentry-save-btn`
- `stockoutentry-cancel-btn`
- `stockoutentry-form-recipient`
- `stockoutentry-form-ref`
- `stockoutentry-form-date`
- `stockoutentry-form-location`
- `stockoutentry-items-table`
- `stockoutentry-additem`
- `stockoutentry-print-btn`
- `stockoutentry-error`
---

## 92. Stock Movements In/Out

### Route Path
```
/inventory/movements
```

### Purpose

Display all inventory transactions (inbound and outbound), with filtering/search by date, item, location; show running balances.

### PRD References

- FR-191

### Access Roles

- All inventory-related roles, auditor

---

### Layout & Components

#### Header

- Title: "Stock Movements"
- Sub: "All item in/out movements with filter and running balance."

#### Filters

| Label      | Component         | Validation      |
|------------|------------------|-----------------|
| Date From  | Date Picker      | Optional        |
| Date To    | Date Picker      | Optional        |
| Item       | Autocomplete     | Optional        |
| Location   | Autocomplete     | Optional        |
| Movement   | Dropdown         | "Any/In/Out"    |

- "Filter"
- "Reset"
- "Export"

#### Table

| Column        | Field         | Notes                        |
|---------------|--------------|------------------------------|
| Date          | date         |                              |
| Item          | itemName     |                              |
| Description   | description  |                              |
| Movement Type | IN/OUT       | Badge: In=green, Out=red     |
| Quantity      | qty          |                              |
| Reference #   | refNo        |                              |
| Location      | location     |                              |
| Balance       | runningBalance| As of movement               |

Sort, pagination, and export as standard.
Row click opens linked stock in/out entry.

Empty/Loading/Error states as above.

---

### Test Identifiers

- `stockmovements-filter-btn`
- `stockmovements-reset-btn`
- `stockmovements-export-btn`
- `stockmovements-table`
- `stockmovements-row-[entryId]`
- `stockmovements-emptystate`
- `stockmovements-error`

---

## 93. Physical Stock Adjustment

### Route Path
```
/inventory/adjustments/new
/inventory/adjustments/:adjustmentId/edit
```

### Purpose

Enter a physical inventory adjustment, reconciling system vs. counted quantities.

### PRD References

- FR-192, FR-197

### Access Roles

- Supervisor, Inventory Manager

---

### Layout & Components

#### Header

- Title: "New Physical Stock Adjustment" (or "Edit Adjustment")

Form Fields

| Label              | Field           | Type        | Validation/Error                      |
|--------------------|----------------|-------------|---------------------------------------|
| Adjustment Date    | adjustmentDate | Date Picker | Required, not a future date           |
| Warehouse/Location | location       | Autocomplete| Required                              |
| Adjustment Reason  | reason         | Select      | Required (dropdown, e.g., Count, Damage, Loss) |
| Items/Batch Grid   | items[]        | Subform     | Min 1                                 |
| Attach Document    | attachments    | Input       | Optional                              |
| Notes              | remarks        | Textarea    | Optional                              |

Items Subform

- Item (autocomplete)
- Description (auto)
- System Qty (readonly)
- Counted Qty (required, >=0)
- Variance (system - counted, auto)
- Remove row

Action: "+ Add Item"

---

Action Buttons

- "Save Adjustment" (primary)
- "Cancel"
- "Print Adjustment"

---

Validation/Error

- Any variance row where variance ≠ 0: highlighted.
- Negative counted qty: error "Counted quantity cannot be negative."
- Empty batch: error.

---

Loading/Error states as standard.

After save, returns to `/inventory/adjustments`.

---

### Test Identifiers

- `stockadjentry-save-btn`
- `stockadjentry-cancel-btn`
- `stockadjentry-form-date`
- `stockadjentry-form-location`
- `stockadjentry-form-reason`
- `stockadjentry-items-table`
- `stockadjentry-additem`
- `stockadjentry-attachments`
- `stockadjentry-print-btn`
- `stockadjentry-error`

---

## 94. New Physical Stock Adjustment

(Consolidated into Physical Stock Adjustment above — single screen handles both standard and enhanced entry, including batch import from mobile. If mobile, show 'Scan Barcode' per item, otherwise allow direct add.)

---

## 95. Stock Availability

### Route Path
```
/inventory/availability
```

### Purpose

Show real-time inventory levels for all items at all locations; used for sale/issue confirmation, purchase planning.

### PRD References

- FR-194, FR-196

### Access Roles

- All inventory roles, Sales Team, Purchasing

---

### Layout & Components

#### Header

- Title: "Stock Availability"
- Sub: "Real-time balance by item and location."

Filters

| Label         | Component       |
|---------------|----------------|
| Item          | Autocomplete   |
| Category      | Dropdown       |
| Location      | Autocomplete   |
| Stock Status  | Dropdown (e.g., All/Available/Below Min/Reserved) |

Buttons: "Filter", "Reset", "Export"

Table

| Column         | Field             | Notes                             |
|----------------|-------------------|-----------------------------------|
| Item Code      | itemCode          |                                   |
| Item Name      | itemName          |                                   |
| Description    | description       |                                   |
| Category       | category          |                                   |
| Location       | location          |                                   |
| Current Stock  | availableQty      |                                   |
| Reserved       | reservedQty       | If tracked                        |
| Minimum Level  | reorderLevel      |                                   |
| Status         | status            | Pill, 'OK','Low','Reserved'       |

Alert Rows:
- Rows for items below reorder level highlighted (light warning).

Empty State:
- "No items match filters."

---

### Test Identifiers

- `stockavailability-filter-btn`
- `stockavailability-reset-btn`
- `stockavailability-export-btn`
- `stockavailability-table`
- `stockavailability-row-[itemCode]`
- `stockavailability-alertrow-[itemCode]`
- `stockavailability-emptystate`
- `stockavailability-error`

---

## 96. Stock Display

### Route Path
```
/inventory/dashboard
```

### Purpose

High-level visual summary of inventory state: totals, graphs, category splits, low-stock warnings, quick KPIs.

### PRD References

- FR-196, FR-208

### Access Roles

- Inventory manager, purchasing, supervisor

---

### Layout & Components

#### Header

- Title: "Inventory Dashboard"
- Quick KPI row: total in stock, total value, items below minimum, most recent stock movement date.

#### Sections

##### a) Summary Cards (KPI)
- Total Inventory Value
- Total Items In Stock
- Items Below Reorder
- Number of Locations

##### b) Visualizations

- Pie/bar chart: Items by category (top 5)
- Line: Inventory value trend (last 30 days)
- Table: "Low Stock Items" (item, current qty, min level, reorder link)
- Table: "Recent Movements" (last 10 items: item, date, in/out, qty)

All sections glassmorphic, grid layout.

---

### Loading, Error States

- Skeleton cards, chart placeholders.

---

### Test Identifiers

- `stockdashboard-kpi-totalvalue`
- `stockdashboard-kpi-totalitems`
- `stockdashboard-kpi-lowstock`
- `stockdashboard-kpi-locations`
- `stockdashboard-chart-category`
- `stockdashboard-chart-value-trend`
- `stockdashboard-table-lowstock`
- `stockdashboard-table-recentmovements`
- `stockdashboard-error`

---

## 97. Stock Updates

### Route Path
```
/inventory/stock-updates
```

### Purpose

View and edit manual stock updates/corrections, including opening balances, adjustments, with audit trail.

### PRD References

- FR-197, FR-174

### Access Roles

- Supervisor, Inventory Manager

---

### Layout & Components

#### Header

- Title: "Stock Updates & Corrections"
- Description: "View and edit all manual inventory updates. All changes are tracked."

Filters

| Label         | Component       |
|---------------|----------------|
| Item          | Autocomplete   |
| Location      | Autocomplete   |
| Date From     | Date picker    |
| Date To       | Date picker    |

Buttons: "Filter", "Export"

Table

| Column       | Field         | Notes                         |
|--------------|--------------|-------------------------------|
| Date         | date         |                               |
| Item         | itemName     |                               |
| Description  | description  |                               |
| Location     | location     |                               |
| Type         | updateType   | Opening Balance, Manual Correction, Adjustment |
| Original Qty | originalQty  |                               |
| New Qty      | newQty       |                               |
| Updated By   | userName     |                               |
| Approved By  | approver     |                               |
| Status       | status       | Approved, Pending             |
| Audit Log    | logLink      | View history of changes       |

Row click: opens detail/audit modal.

---

### Test Identifiers

- `stockupdates-filter-btn`
- `stockupdates-export-btn`
- `stockupdates-table`
- `stockupdates-row-[updateId]`
- `stockupdates-auditmodal-[updateId]`
- `stockupdates-emptystate`
- `stockupdates-error`

---

## 98. Stock Valuation

### Route Path
```
/inventory/valuation
```

### Purpose

Show current and historical value of inventory, with export, per item/group/method (FIFO, AVG, etc).

### PRD References

- FR-198, FR-203

### Access Roles

- Inventory Manager, Finance Team, Auditor

---

### Layout & Components

#### Header

- Title: "Inventory Valuation"
- Sub: "Calculate and review value of inventory by various methods and dates."

Filters

| Label         | Component            |
|---------------|---------------------|
| Date          | Date picker (default today) |
| Method        | Dropdown (FIFO, Weighted Average) |
| Category      | Dropdown            |
| Location      | Autocomplete        |

Buttons: "Calculate", "Export" (PDF, Excel, CSV), "Print"

Table

| Column        | Field          | Notes                  |
|---------------|---------------|------------------------|
| Item Code     | itemCode      |                        |
| Item Name     | itemName      |                        |
| Category      | category      |                        |
| Location      | location      |                        |
| Qty on Hand   | quantity      |                        |
| Unit Price    | unitPrice     | per selected method    |
| Total Value   | totalValue    | qty * unit price       |

Group and overall totals.
- Items with 0 or negative stock: shaded, value forced to zero.

---

### Test Identifiers

- `stockvaluation-calculate-btn`
- `stockvaluation-export-btn`
- `stockvaluation-print-btn`
- `stockvaluation-table`
- `stockvaluation-row-[itemCode]`
- `stockvaluation-emptystate`
- `stockvaluation-error`

---

## 99. StockLedger Report

### Route Path
```
/inventory/ledger
```

### Purpose

Printable and exportable detail of all inventory transactions by item, with running balances per movement.

### PRD References

- FR-200

### Access Roles

- Clerk, Supervisor, Manager, Auditor

---

### Layout & Components

#### Header

- Title: "Stock Ledger Report"
- Sub: "Detailed in/out movements and balances per item, filterable by item and date."

Filters

| Label     | Component     |
|-----------|--------------|
| Item      | Autocomplete |
| Date From | Date picker  |
| Date To   | Date picker  |

Buttons: "Run Report", "Export", "Print"

Table

| Column      | Field          | Notes                       |
|-------------|---------------|-----------------------------|
| Date        | date          |                             |
| Item Name   | itemName      |                             |
| Location    | location      |                             |
| In          | inQty         | Positive for receipts       |
| Out         | outQty        | Positive for issues         |
| Balance     | balance       | Running, per item           |
| Ref #       | referenceNo   |                             |
| Narration   | narration     |                             |

Export includes all filters applied. Print is page-headered, page-controlled.

Empty state: "No transactions for selected item/period."

---

### Test Identifiers

- `stockledger-runreport-btn`
- `stockledger-export-btn`
- `stockledger-print-btn`
- `stockledger-table`
- `stockledger-row-[transactionId]`
- `stockledger-emptystate`
- `stockledger-error`

---

## 100. StockAgingReport

### Route Path
```
/inventory/aging-report
```

### Purpose

Report on the age of inventory items, grouping by category and aging buckets (0-30d, 31-60d, …), to detect slow/overstock.

### PRD References

- FR-201

### Access Roles

- Inventory Manager, Finance, Auditor

---

### Layout & Components

#### Header

- Title: "Stock Aging Report"
- Sub: "Age classification of inventory. Identify slow- or over-stocked items."

Filters

| Label        | Component      |
|--------------|---------------|
| Category     | Dropdown      |
| Location     | Autocomplete  |
| Min Days Old | Number input  |
| Date         | Date picker   |

Buttons: "Run Report", "Export", "Print"

Table

| Column        | Field        | Notes                    |
|---------------|-------------|--------------------------|
| Item Code     | itemCode    |                          |
| Item Name     | itemName    |                          |
| Category      | category    |                          |
| Location      | location    |                          |
| Qty on Hand   | quantity    |                          |
| Entry Date    | entryDate   |                          |
| Age (days)    | ageDays     |                          |
| Age Bucket    | ageBucket   | 0-30, 31-60, 61-90, etc. |
| Value         | value       |                          |

Group by bucket. Totals per bucket and overall.

Row click: item detail.

---

### Test Identifiers

- `stockaging-runreport-btn`
- `stockaging-export-btn`
- `stockaging-print-btn`
- `stockaging-table`
- `stockaging-row-[itemCode]`
- `stockaging-bucket-[bucketName]`
- `stockaging-emptystate`
- `stockaging-error`

---

## COVERAGE CHECK

| # | Screen Name                      | Status   |
|---|----------------------------------|----------|
|76 | Sales Order Report               | ✅ covered |
|77 | Order Status Report              | ✅ covered |
|78 | Pending Order Register Report    | ✅ covered |
|79 | Delivery Note Report             | ✅ covered |
|80 | Foreign Purchase Entry           | ✅ covered |
|81 | Local Purchase Entry             | ✅ covered |
|82 | Local Purchase Order Entry       | ✅ covered (consolidated with 81) |
|83 | Local Purchase Order Management  | ✅ covered |
|84 | Pending Purchase Delivery Order  | ✅ covered |
|85 | Purchase Delivery Order          | ✅ covered |
|86 | Purchase DO Search               | ✅ covered |
|87 | PurchaseOrder Report             | ✅ covered |
|88 | PurchaseDo01PDO Report           | ✅ covered |
|89 | pendingPurchaseDo Report         | ✅ covered |
|90 | Stock In Entry                   | ✅ covered |
|91 | Stock Out Entry                  | ✅ covered |
|92 | Stock Movements In/Out           | ✅ covered |
|93 | Physical Stock Adjustment        | ✅ covered |
|94 | New Physical Stock Adjustment    | ✅ covered (consolidated with 93) |
|95 | Stock Availability               | ✅ covered |
|96 | Stock Display                    | ✅ covered |
|97 | Stock Updates                    | ✅ covered |
|98 | Stock Valuation                  | ✅ covered |
|99 | StockLedger Report               | ✅ covered |
|100| StockAgingReport                 | ✅ covered |

---

---

# FRONTEND_SPEC.md
### Integrated Business Operations Suite — Frontend Specification
### Part 5 of 14: Stock & Ledger/Account Management, Banking, Data Maintenance, Audit Support Section

---

## 101. StockStatement

**Route Path:** `/inventory/stock-statement`  
**Purpose:** Present an account-style statement for any selected item or group, showing all stock movements and balance for a user-selected period.  
**PRD Reference:** Stock & Inventory Management → StockStatement  
**Access Roles:** Inventory Clerk (read/write), Supervisor (read/write), Manager (read/write), Auditor (read-only)  
**Data Source:** StockStatement view (aggregate of StockIn/Out/Transaction views, per DB_CONNECTION_SPEC.md)  
**CRUD Completeness:** This is a report/list screen (no data-entry).  

### Page Layout & Structure
- **Top Bar (Glassmorphism):**
  - Title: `Stock Statement`
  - Export buttons: PDF, Excel, CSV (`data-testid="stock-statement-export-btn-[format]"`)
  - Primary Button: None (view-only/report)

- **Filters Panel (16px glass card with blur):**
  - Stock Item (Autocomplete) — **required**
    - Label: `Item`
    - Placeholder: `Search by name or code...`
    - Data source: ItemsSql
    - `data-testid="stock-statement-filter-item"`
    - Required: Yes, error on submit if empty.
  - Location (Autocomplete, optional):  
    - Label: `Location`
    - Placeholder: `Warehouse/location...`  
    - Data source: ItemsSql.Location
    - `data-testid="stock-statement-filter-location"`
  - Date Range Picker:
    - Label: `Period`
    - Fields: `From` (default: 1 month ago), `To` (default: today)
    - `data-testid="stock-statement-filter-dates"`
    - Required: Yes, error message for invalid range.
  - Transaction Type filter (Dropdown):  
    - Label: `Movement Type`
    - Options: All, Stock-In, Stock-Out, Adjustment
    - Default: All
    - `data-testid="stock-statement-filter-type"`
  - Secondary filter:  
    - Checkbox: `Show Zero Balance Entries`
    - `data-testid="stock-statement-filter-show-zero"`
  - Apply Filter primary button: `(data-testid="stock-statement-action-apply")`
  - Reset Filters button: `(data-testid="stock-statement-action-reset")`
  - Loading skeleton overlay on Apply

- **Statement Table (Glass card, horizontal scroll):**
  - Sticky headers, row hover highlight (`#3831c40a`).
  - Columns:  
    | Field              | Label              | Notes           | data-testid key                  |
    |--------------------|-------------------|-----------------|----------------------------------|
    | Date               | `Date`            | dd-mm-yyyy      | `stock-statement-row-date`       |
    | Reference No.      | `Reference`       |                | `stock-statement-row-reference`  |
    | Movement Type      | `Type`            | IN, OUT, ADJ    | `stock-statement-row-type`       |
    | Item Code          | `Item Code`       |                | `stock-statement-row-itemcode`   |
    | Description        | `Description`     | from ItemsSql   | `stock-statement-row-desc`       |
    | Warehouse/Location | `Location`        |                | `stock-statement-row-location`   |
    | Quantity In        | `In`              |                | `stock-statement-row-in`         |
    | Quantity Out       | `Out`             |                | `stock-statement-row-out`        |
    | Running Balance    | `Balance`         |                | `stock-statement-row-balance`    |
    | Unit               | `Unit`            |                | `stock-statement-row-unit`       |
    | Notes              | `Remarks`         |                | `stock-statement-row-remarks`    |

- **Table Functionality:**
  - Pagination: 30 rows/page, footer pager (`stock-statement-pager`)
  - Sorting: by date (default desc), reference, item code, location
  - Loading state: row skeletons (grey shimmer bars)
  - Empty state: "No transactions for selected filters." with suggestion to adjust filters

- **Errors:**
  - API failure: banner at top of table area (`stock-statement-error-api`)
  - Filter form: Red border + message below each required field invalid, e.g. "Item must be selected." 

- **Export Actions:**
  - PDF/Excel/CSV with loading spinner per button, disable during export
  - Error notification (toast) if export fails

- **Accessibility:**
  - All inputs, table cells, and export buttons have visible labels
  - Table rows focusable with keyboard; Enter shows details in modal (future phase)
  - Live region announces loading state
  
#### Test Identifiers
- stock-statement-filter-item
- stock-statement-filter-location
- stock-statement-filter-dates
- stock-statement-filter-type
- stock-statement-filter-show-zero
- stock-statement-action-apply
- stock-statement-action-reset
- stock-statement-row-[field]
- stock-statement-pager
- stock-statement-export-btn-pdf
- stock-statement-export-btn-excel
- stock-statement-export-btn-csv
- stock-statement-error-api

---

## 102. StockValuationReport

**Route Path:** `/inventory/valuation-report`  
**Purpose:** Provides the computed value of current inventory, using selected valuation method (FIFO, weighted average), date, product group, etc.  
**PRD Reference:** Stock & Inventory Management → StockValuationReport  
**Access Roles:** Inventory Manager, Finance Team, Supervisor, Auditor (read only)  
**Data Source:** spStockValuation stored procedure

### Page Layout & Structure
- **Top Bar:**
  - Title: `Stock Valuation Report`
  - Export: PDF, Excel, CSV (`data-testid="stock-valuation-export-btn-[format]"`)
  - Primary Button: None

- **Filters Panel:**
  - Valuation Method (Dropdown, required):
    - Label: `Valuation Method`
    - Options: FIFO, Weighted Average
    - Default: FIFO
    - Required; error: "Select a valuation method."
    - `stock-valuation-filter-method`
  - As of Date (Date Picker, required):
    - Label: `As of Date`
    - Default: today
    - `stock-valuation-filter-date`
    - Required
  - Product Group (Dropdown, optional):
    - Label: `Item Group`
    - Source: ItemType/Category from ItemsSql
    - `stock-valuation-filter-group`
  - Show only items with positive balance (checkbox)
    - Label: "Show only positive stock"
    - Default: checked
    - `stock-valuation-filter-positive`
  - Apply Filters (`stock-valuation-action-apply`)
  - Reset (`stock-valuation-action-reset`)

- **Table:**
  - Header:
    | Field           | Label         | TestId                          |
    |-----------------|--------------|---------------------------------|
    | Item Code       | `Item Code`  | stock-valuation-row-code        |
    | Description     | `Description`| stock-valuation-row-desc        |
    | Group           | `Group`      | stock-valuation-row-group       |
    | Location        | `Location`   | stock-valuation-row-location    |
    | Quantity        | `Qty On Hand`| stock-valuation-row-qty         |
    | Unit Price      | `Unit Price` | stock-valuation-row-unitprice   |
    | Value           | `Total Value`| stock-valuation-row-value       |
    | Method          | `Method`     | stock-valuation-row-method      |
  - Footer: Summation row for total quantity and value

- **Interactivity:**
  - Pagination: 25 rows per page
  - Sorting: Quantity, Value
  - Loading: shimmer skeleton on table for loading
  - Empty: "No items in stock for selected filters."

- **Export:**
  - Buttons disabled during export
  - Toast on success/error

- **Errors:**
  - Banner for API errors (`stock-valuation-error-api`)
  - Filter errors inline with red text + border below field

#### Test Identifiers
- stock-valuation-filter-method
- stock-valuation-filter-date
- stock-valuation-filter-group
- stock-valuation-filter-positive
- stock-valuation-action-apply
- stock-valuation-action-reset
- stock-valuation-row-[code|desc|group|location|qty|unitprice|value|method]
- stock-valuation-pager
- stock-valuation-export-btn-pdf
- stock-valuation-export-btn-excel
- stock-valuation-export-btn-csv
- stock-valuation-error-api

---

## 103. Bank Book

**Route Path:** `/banking/bank-book`  
**Purpose:** Display all bank account transactions with filtering and export, supporting bank account selection, date range, and transaction type.  
**PRD Reference:** Banking & Reconciliation → Bank Book  
**Access Roles:** Accountant, Finance Supervisor, Finance Administrator  
**Data Source:** SPCASHBANKDETAILS stored procedure (with ACHEAD.BANK=1 filter)

### Page Layout & Structure
- **Top Bar:**
  - Title: `Bank Book`
  - Export: PDF, Excel, CSV (`bank-book-export-btn-[format]`)
  - Print: Available if browser supports print (`bank-book-print-btn`)

- **Filters:**
  - Bank Account (Autocomplete, required):
    - Label: `Bank Account`
    - Data source: CashBankHead view (resolved names)
    - `bank-book-filter-account`
  - Date Range (DatePicker, from/to):
    - Label: `Period`
    - Required, default last month
    - `bank-book-filter-dates`
  - Transaction Type:
    - Label: `Transaction Type`
    - Options: All, Receipt, Payment, Transfer, Interest, Charges
    - Default: All
    - `bank-book-filter-type`
  - Text search (optional): `Narration or Reference`
    - Input box, placeholder "Search description..."
    - `bank-book-filter-search`
  - Apply (`bank-book-action-apply`), Reset (`bank-book-action-reset`)

- **Table:**
  | Field        | Label         | TestId                     |
  |--------------|--------------|----------------------------|
  | Date         | Date         | bank-book-row-date         |
  | Ref No.      | Reference    | bank-book-row-ref          |
  | Description  | Description  | bank-book-row-desc         |
  | Debit        | Debit        | bank-book-row-debit        |
  | Credit       | Credit       | bank-book-row-credit       |
  | Balance      | Balance      | bank-book-row-balance      |
  | Type         | Type         | bank-book-row-type         |
  | Branch       | Branch       | bank-book-row-branch       |
  | Narration    | Narration    | bank-book-row-narration    |
  | Cheque No    | Cheque No.   | bank-book-row-cheque       |

- **Features:**
  - Pagination (default 30/page)
  - Running balance updates per row (calculated client-side unless included)
  - Row highlighting for negative balances (red background, 7% opacity)
  - Loading: shimmer bar skeletons
  - Empty: "No bank transactions for selected filters."
  - Print view: condensed, marginless

- **Export/Print:**
  - Disables while exporting or printing
  - Toast or banner for errors

#### Test Identifiers
- bank-book-filter-account
- bank-book-filter-dates
- bank-book-filter-type
- bank-book-filter-search
- bank-book-action-apply
- bank-book-action-reset
- bank-book-row-[date|ref|desc|debit|credit|balance|type|branch|narration|cheque]
- bank-book-export-btn-pdf
- bank-book-export-btn-excel
- bank-book-export-btn-csv
- bank-book-print-btn
- bank-book-error-api

---

## 104. Cash Book

**Route Path:** `/banking/cash-book`  
**Purpose:** Show all cash transactions, easily filtered by date/type, with running balance.  
**PRD Reference:** Banking & Reconciliation → Cash Book  
**Access Roles:** Accountant, Finance Supervisor, Finance Administrator   
**Data Source:** SPCASHBANKDETAILS stored procedure (`BANK=0` filter)

### Page Layout & Structure

- **Top Bar:**
  - Title: `Cash Book`
  - Export: PDF, Excel, CSV (`cash-book-export-btn-[format]`)
  - Print: (`cash-book-print-btn`)

- **Filters:**
  - Date Range Picker (required): 
    - Label: `Period`
    - Default: Current Month
    - `cash-book-filter-dates`
  - Transaction Type (Dropdown, optional):
    - Label: `Transaction Type`
    - As in Bank Book
    - `cash-book-filter-type`
  - Search (Input, optional):
    - Label: `Narration/Description`
    - `cash-book-filter-search`
  - Apply/Reset buttons (`cash-book-action-apply`, `cash-book-action-reset`)

- **Table:**
  | Field      | Label       | TestId                  |
  |------------|------------|-------------------------|
  | Date       | Date       | cash-book-row-date      |
  | Ref No.    | Reference  | cash-book-row-ref       |
  | Description| Desc.      | cash-book-row-desc      |
  | Debit      | Debit      | cash-book-row-debit     |
  | Credit     | Credit     | cash-book-row-credit    |
  | Balance    | Balance    | cash-book-row-balance   |
  | Narration  | Narration  | cash-book-row-narration |
  | Mode       | Mode       | cash-book-row-mode      |

- **Features:**
  - Running balance calculation
  - Row highlight for negative balances
  - Export/print, error states as with Bank Book

#### Test Identifiers
- cash-book-filter-dates
- cash-book-filter-type
- cash-book-filter-search
- cash-book-action-apply
- cash-book-action-reset
- cash-book-row-[date|ref|desc|debit|credit|balance|narration|mode]
- cash-book-export-btn-pdf
- cash-book-export-btn-excel
- cash-book-export-btn-csv
- cash-book-print-btn
- cash-book-error-api

---

## 105. Bank Reconciliation

**Route Path:** `/banking/bank-reconciliation`  
**Purpose:** Allows reconciliation of internal financial records with imported external bank statements, with tool-assisted matching, status, and exception handling.  
**PRD Reference:** Banking & Reconciliation → Bank Reconciliation  
**Access Roles:** Accountant, Finance Supervisor, Finance Administrator  
**Data Source:** ACDETAILSSQL + imported statement (uploaded)  
**Write Operations:** None (write is to local reconciliation state, not DB in v1.0; mapped to approve/exception fields only)

### Page Layout & Structure

- **Header:**
  - Title: `Bank Reconciliation`
  - Current Account selector (autocomplete, required)
    - `recon-filter-account`
  - Date range (required): `recon-filter-dates`
  - Import bank statement (file input, .csv/.xls/.xml):
    - `recon-import-btn`
    - On upload: loading shimmer + status, errors shown inline/below
  - Help icon (popup): reconciliation process help

- **Reconciliation Table (split-view):**
  - **Left:** System Transactions Table
    - Columns: Date, Reference, Debit, Credit, Narration, Status, Linked Statement Row (if matched)
    - `recon-sys-row-[field]`
  - **Right:** Statement Table (imported)
    - Columns: Date, Reference, Debit, Credit, Narration, Match Status, Linked System Row
    - `recon-bank-row-[field]`
  - Match type icon (manual/auto/mismatch), status badges (matched, unmatched, exception)

- **Actions:**
  - Button: `Run Auto Match` (`recon-action-automatch`) — blurs, disables both tables during run
  - Button: `Approve Match` per row (`recon-sys-action-approve`)
  - Button: `Mark as Exception` per row (`recon-sys-action-exception`)
  - Button: `Export Reconciliation Report` (`recon-export-btn`)

- **Exception Highlight:**
  - Rows unreconciled >3 days: warning highlight (use `#f7be43` at 12% opacity)

- **Audit Trail Download:**
  - Action: Download reconciliation event log (`recon-audit-export-btn`)

- **Errors:**
  - Upload invalid file — error banner, red inline message
  - API/processing error: error banner at top
  - No matching account: error below account selector

- **Loading/Empty:**
  - Loading: shimmer on both tables
  - Empty: "No reconciliation entries for this filter/account."

#### Test Identifiers
- recon-filter-account
- recon-filter-dates
- recon-import-btn
- recon-sys-row-[date|ref|debit|credit|narration|status|statement]
- recon-bank-row-[date|ref|debit|credit|narration|status|system]
- recon-action-automatch
- recon-sys-action-approve
- recon-sys-action-exception
- recon-export-btn
- recon-audit-export-btn
- recon-error-api
- recon-error-upload

---

## 106. Select Bank for Reconciliation

**Route Path:** `/banking/reconciliation/select-account`  
**Purpose:** Allows user to select a specific bank account to start the reconciliation process  
**PRD Reference:** Banking & Reconciliation → Select Bank for Reconciliation  
**Access Roles:** Accountant, Finance Supervisor

### Structure
  
- **Simple glass card:**
  - Title: `Select Bank Account for Reconciliation`
  - Bank Account (autocomplete, required):
    - `select-bank-account`
    - Label: `Bank Account`
    - Placeholder: "Search by account or branch..."
    - Data: CashBankHead view
  - Info: Last reconciled date, current balance, number of unreconciled entries for account
    - `select-bank-meta-last-reconciled`, `select-bank-meta-balance`, `select-bank-meta-unmatched`
  - Primary Button: `Start Reconciliation` (`select-bank-action-start`)
    - Disabled if nothing selected
  - Loading: button spinner, meta skeletons
  - API error: shown near top

#### Test Identifiers
- select-bank-account
- select-bank-meta-last-reconciled
- select-bank-meta-balance
- select-bank-meta-unmatched
- select-bank-action-start
- select-bank-error-api

---

## 107. CBPBook (Report)

**Route Path:** `/reports/cbp-book`  
**Purpose:** Generate a comprehensive cash/bank payment book for audit, review, or export, with filterable options  
**PRD Reference:** Banking & Reconciliation → CBPBook  
**Access Roles:** Accountant, Finance Supervisor, Administrator, Auditor  
**Data Source:** CBPBook stored procedure/results

### Structure

- **Header:**
  - Title: `Cash & Bank Payment Book`
  - Report filters block
    - Account (autocomplete, required)
      - `cbpbook-filter-account`
    - Date Range (from/to, required)
      - `cbpbook-filter-dates`
    - Type (dropdown): cash, bank, all
      - `cbpbook-filter-type`
    - Apply (`cbpbook-action-apply`), Reset (`cbpbook-action-reset`)
  - Export as PDF, Excel, CSV (`cbpbook-export-btn-[format]`)
  - Print (`cbpbook-print-btn`)

- **Table:**
  | Field        | Label         | TestId                   |
  |--------------|--------------|--------------------------|
  | Date         | Date         | cbpbook-row-date         |
  | Ref No.      | Reference    | cbpbook-row-ref          |
  | Type         | Type         | cbpbook-row-type         |
  | Debit        | Debit        | cbpbook-row-debit        |
  | Credit       | Credit       | cbpbook-row-credit       |
  | Balance      | Running Bal  | cbpbook-row-balance      |
  | Narration    | Narration    | cbpbook-row-narration    |
  | Cheque No    | Cheque No.   | cbpbook-row-cheque       |
  | Account      | Account      | cbpbook-row-account      |

- **Features:**
  - Pagination: 35/page
  - Sorting: date, account, reference
  - Empty state: "No transactions for filter."
  - Export disables during processing
  - Skeleton loading
  - Error banner

#### Test Identifiers
- cbpbook-filter-account
- cbpbook-filter-dates
- cbpbook-filter-type
- cbpbook-action-apply
- cbpbook-action-reset
- cbpbook-row-[date|ref|type|debit|credit|balance|narration|cheque|account]
- cbpbook-export-btn-pdf
- cbpbook-export-btn-excel
- cbpbook-export-btn-csv
- cbpbook-print-btn
- cbpbook-error-api

---

## 108. PendingBillsLetter (Report)

**Route Path:** `/reports/pending-bills-letter`  
**Purpose:** Generates letters for outstanding bills/dues, with recipient/contact options, ready to print/export or send  
**PRD Reference:** Banking & Reconciliation → PendingBillsLetter  
**Access Roles:** Accountant, Finance Supervisor  
**Data Source:** PendingBillsLetter stored procedure

### Structure

- **Header:**
  - Title: `Pending Bills Letter`
  - Recipient Type (dropdown, required): Customer/Supplier
    - `pendingletter-filter-type`
  - As of Date (required): date picker
    - `pendingletter-filter-date`
  - Filter by Area (optional): area dropdown from Omasters
    - `pendingletter-filter-area`
  - Include contacts with phone/email only: checkbox
    - `pendingletter-filter-contactable`
  - Apply/Reset
    - `pendingletter-action-apply`, `pendingletter-action-reset`
  - Print (`pendingletter-print-btn`), Export (`pendingletter-export-btn-[format]`)

- **Letter Table:**
  | Field        | Label           | TestId                     |
  |--------------|-----------------|----------------------------|
  | Recipient    | Name            | pendingletter-row-name     |
  | Contact      | Phone/Email     | pendingletter-row-contact  |
  | Outstanding  | Amount Due      | pendingletter-row-due      |
  | Bills        | Bill Ids/Info   | pendingletter-row-bills    |
  | Area         | Area            | pendingletter-row-area     |
  | Last Contact | Date            | pendingletter-row-last     |

- **Preview:**
  - Generates per-recipient letter with template merge fields
  - Letter body live preview with outstanding summary, can copy/paste
  - Print/export disables during generation

- **Validation/Errors:**
  - Missing required: red border, error below
  - API error: banner

#### Test Identifiers
- pendingletter-filter-type
- pendingletter-filter-date
- pendingletter-filter-area
- pendingletter-filter-contactable
- pendingletter-action-apply
- pendingletter-action-reset
- pendingletter-row-[name|contact|due|bills|area|last]
- pendingletter-print-btn
- pendingletter-export-btn-pdf
- pendingletter-export-btn-excel
- pendingletter-error-api

---

## 109. acFilterFrm (Audit Support Screen)

**Route Path:** `/audit/account-filter`  
**Purpose:** Enables custom filtering for accounts, entries, and audit records by multi-field, multi-criteria parameters, with export  
**PRD Reference:** Banking & Reconciliation → acFilterFrm  
**Access Roles:** Finance Supervisor, Auditor, Administrator (read-only for non-auditors)  

### Structure

- **Header:**
  - Title: `Account/Audit Data Filter`
  - Filter form, all fields optional except at least one must be filled:
    - Account (autocomplete): `acfilter-account`
    - Date Range: `acfilter-dates`
    - User (autocomplete from user list): `acfilter-user`
    - Entry Type (dropdown): Debit, Credit, Receipt, Payment: `acfilter-type`
    - Min. Amount / Max. Amount (optional): number inputs: `acfilter-amount-min`, `acfilter-amount-max`
    - Transaction Reference (text): `acfilter-ref`
    - Only show records with error (checkbox): `acfilter-only-error`
    - Apply/Reset (`acfilter-action-apply`, `acfilter-action-reset`)
    - Export/Print: PDF/Excel (`acfilter-export-btn-[format]`, `acfilter-print-btn`)
  
- **Table:**
  | Field             | Label         | TestId                     |
  |-------------------|--------------|----------------------------|
  | Date              | Date         | acfilter-row-date          |
  | Account           | Account      | acfilter-row-account       |
  | Description       | Desc.        | acfilter-row-desc          |
  | Debit             | Debit        | acfilter-row-debit         |
  | Credit            | Credit       | acfilter-row-credit        |
  | User              | By           | acfilter-row-user          |
  | Reference         | Reference    | acfilter-row-ref           |
  | Error?            | Is Error     | acfilter-row-error         |
  | Remarks           | Remarks      | acfilter-row-remarks       |

- **Features:**
  - Pagination: 40/page
  - Focus highlight on error rows (red left border)
  - Loading: skeleton rows
  - Empty: "No entries found for filter."
  - Errors: API and missing filter shot near top
  - All filter state resets on navigation

#### Test Identifiers
- acfilter-account
- acfilter-dates
- acfilter-user
- acfilter-type
- acfilter-amount-min
- acfilter-amount-max
- acfilter-ref
- acfilter-only-error
- acfilter-action-apply
- acfilter-action-reset
- acfilter-row-[date|account|desc|debit|credit|user|ref|error|remarks]
- acfilter-export-btn-pdf
- acfilter-export-btn-excel
- acfilter-print-btn
- acfilter-error-api

---

## 110. missingAcSrlFrm (Audit Correction Screen)

**Route Path:** `/audit/missing-account-serials`  
**Purpose:** List and assist correction of records missing required account serial numbers, with correction workflow  
**PRD Reference:** Banking & Reconciliation → missingAcSrlFrm  
**Access Roles:** Finance Supervisor, Auditor, Administrator

### Structure

- **Header:** `Missing Account Serial Numbers`
  - Date Range (filter): `missingsrl-filter-dates`
  - Account Type (dropdown, optional): `missingsrl-filter-type`
  - Only show missing records (checkbox): `missingsrl-filter-only-missing`
  - Apply/Reset: `missingsrl-action-apply`, `missingsrl-action-reset`
  - Export: `missingsrl-export-btn-[format]`

- **Table:**
  | Field            | Label         | TestId                        |
  |------------------|--------------|-------------------------------|
  | Date             | Date         | missingsrl-row-date           |
  | Account Name     | Account      | missingsrl-row-account        |
  | Ref No.          | Reference    | missingsrl-row-ref            |
  | Serial No.       | Serial       | missingsrl-row-serial         |
  | User             | By           | missingsrl-row-user           |
  | Error?           | Error        | missingsrl-row-error          |
  | Correction Input | Correction   | missingsrl-row-correction     |
  | Fix Action       | Button       | missingsrl-action-fix         |

- **Editing:**
  - For any row with missing serial (blank/null), a correction input (text) + "Fix" button
  - On submit: disables button, shows loading and error/success toast
  - Update returns, row marks as corrected (green checkmark)
  - Errors: validation red, inline (e.g., "Serial number required"), API failures as banner

- **Loading/Empty:** As above

#### Test Identifiers
- missingsrl-filter-dates
- missingsrl-filter-type
- missingsrl-filter-only-missing
- missingsrl-action-apply
- missingsrl-action-reset
- missingsrl-row-[date|account|ref|serial|user|error|correction]
- missingsrl-action-fix
- missingsrl-export-btn-pdf
- missingsrl-export-btn-excel
- missingsrl-error-api

---

## 111. GroupHlpFrm (Help/Support Screen)

**Route Path:** `/help/account-groups`  
**Purpose:** Quick reference and search for account groups used in reconciliation and reporting.  
**PRD Reference:** Banking & Reconciliation → GroupHlpFrm  
**Access Roles:** All Users

### Structure

- **Header:** `Account Group Help`
  - Search Input: "Search group name/code..." (`grouphelp-search`)
  - Filter by group type (dropdown, optional): `grouphelp-filter-type`
  - Live filter results

- **List/Table:**
  | Field    | Label   | TestId              |
  |----------|---------|---------------------|
  | Group ID | ID      | grouphelp-row-id    |
  | Name     | Name    | grouphelp-row-name  |
  | Accounts | Accounts| grouphelp-row-accounts|
  | Type     | Type    | grouphelp-row-type  |

- **Actions:**
  - Copy Group ID/Name to clipboard (inline button: `grouphelp-copy-btn`)
  - Table limited to max 200 groups by perf (disable search if exceeded)

- **Loading, Errors, Empty:**
  - Show spinner/skeleton on delay
  - "No groups found." for empty

#### Test Identifiers
- grouphelp-search
- grouphelp-filter-type
- grouphelp-row-[id|name|accounts|type]
- grouphelp-copy-btn

---

## 112. SectionFrm (Data Maintenance Screen)

**Route Path:** `/admin/banking-sections`  
**Purpose:** Setup and manage bank sections and subgroupings for use in reconciliation and reporting  
**PRD Reference:** Banking & Reconciliation → SectionFrm  
**Access Roles:** Finance Supervisor (R/W), Administrator (R/W)

### Structure

- **Header & Table:**
  - Title: `Bank Sections Maintenance`
  - '+ New Section' (primary) button above table (`section-action-new`)
  - Table:
    | Field    | Label     | TestId               |
    |----------|-----------|----------------------|
    | Name     | Section   | section-row-name     |
    | Description | Desc.  | section-row-desc     |
    | Accounts | Accounts  | section-row-accounts |
    | Actions  | Edit/Del  | section-row-action   |

- **Add/Edit Form Modal:**
  - Section Name (`section-form-name`)
  - Description (`section-form-desc`)
  - Accounts (multi-select autocomplete, CashBankHead view) (`section-form-accounts`)
  - Buttons: Save (`section-form-save`), Cancel (`section-form-cancel`)
  - Validation: Name required, min 2 chars
  - Error—inline below field ("Section name is required.")

- **Delete Confirmation:** "Remove this section?" Yes/No

- **Empty, Error, Loading:**
  - Spinner, error banner, "No bank sections."

#### Test Identifiers
- section-action-new
- section-row-[name|desc|accounts|action]
- section-form-name
- section-form-desc
- section-form-accounts
- section-form-save
- section-form-cancel

---

## 113. Table1 (Data Entity Support Screen)

**Route Path:** `/admin/table-entities`  
**Purpose:** Manage custom table entities/or mappings required for data, batch and banking support  
**PRD Reference:** Banking & Reconciliation → Table1  
**Access Roles:** Admin only

### Structure

- **Table List View:**
  - Title: `Table1 Entities`
  - '+ New Entity' button (`table1-action-new`)
  - Table:
    | Field   | Label     | TestId               |
    |---------|-----------|----------------------|
    | ID      | ID        | table1-row-id        |
    | Name    | Table Name| table1-row-name      |
    | Sort    | Sort      | table1-row-sort      |
    | Active  | Active    | table1-row-active    |
    | Count   | Count     | table1-row-count     |
    | Actions | Edit/Del  | table1-row-action    |

- **Form Modal:**
  - Fields: Name (required, min 3), Sort (numeric), Active (toggle), Count (numeric)
  - Buttons: Save/Cancel
  - Field errors: "Name is required", "Sort must be number" etc.

- **Action Confirmations:**
  - Delete confirmation dialog

- **Spinner, Error, Empty:**
  - Loading skeleton for table, error banner, "No entities in Table1."

#### Test Identifiers
- table1-action-new
- table1-row-[id|name|sort|active|count|action]
- table1-form-name
- table1-form-sort
- table1-form-active
- table1-form-count
- table1-form-save
- table1-form-cancel

---

## 114. aaaaaaaaaaaaaa (Custom Data/Business Logic Screen)

**Route Path:** `/admin/custom-business-aa`  
**Purpose:** Support specialized/custom business data configurations for reconciliation processes, e.g., mapping catid/ItemType for integrations  
**PRD Reference:** Banking & Reconciliation → aaaaaaaaaaaaaa  
**Access Roles:** Admin (full), Finance Supervisor (read-only)

### Structure

- **Table List:**
  - Title: `Custom Business Data (aaaa...)`
  - "+ New Entry" (`aaa-action-new`)
  - Table:
    | Field   | Label     | TestId               |
    |---------|-----------|----------------------|
    | CatID   | Code      | aaa-row-catid        |
    | ItemType| Item Type | aaa-row-type         |
    | Actions | Edit/Del  | aaa-row-action       |

- **Entry/Edit Modal:**
  - CatID (required, string, max 10) — `aaa-form-catid`
  - ItemType (required, string, max 100) — `aaa-form-type`
  - Buttons: Save (`aaa-form-save`), Cancel (`aaa-form-cancel`)
  - Validations: Both required, error below each field.

- **Delete:** Confirmation dialog

- **Loading, Error:** As elsewhere

#### Test Identifiers
- aaa-action-new
- aaa-row-[catid|type|action]
- aaa-form-catid
- aaa-form-type
- aaa-form-save
- aaa-form-cancel

---

## 115. Form1 (General Data Review Screen)

**Route Path:** `/admin/data-overview`  
**Purpose:** Surface a general data grid of recent records for administrative overview, with export/search  
**PRD Reference:** Banking & Reconciliation → Form1  
**Access Roles:** Finance Supervisor, Admin

### Structure

- **Header:** `General Data Overview`
  - Search (text), Filters (date range): `dataoverview-search`, `dataoverview-filter-dates` 
  - Export: PDF/Excel (`dataoverview-export-btn-[format]`)

- **Table (generic):**
  | Field    | Label   | TestId                |
  |----------|---------|-----------------------|
  | ID       | ID      | dataoverview-row-id   |
  | Name     | Name    | dataoverview-row-name |
  | Value    | Value   | dataoverview-row-value|
  | Date     | Date    | dataoverview-row-date |

- **Features:** Pagination, sort, empty, loading, error for no data/API

#### Test Identifiers
- dataoverview-search
- dataoverview-filter-dates
- dataoverview-export-btn-pdf
- dataoverview-export-btn-excel
- dataoverview-row-[id|name|value|date]
- dataoverview-error-api

---

## 116. Account Create/Delete/Update

**Route Path:** `/accounts/accounts` (list), `/accounts/accounts/new`, `/accounts/accounts/:id`  
**PURPOSE:** Enable full CRUD for financial accounts (create, edit, deactivate, list/search)  
**PRD Reference:** Ledger & Account Management → Account Create/Delete/Update  
**CRUD Completeness:** List (table + filter + +New) and Add/Edit entry consolidated.  
**Access Roles:** Accountant, Finance Supervisor, Admin

### Account List Page (`/accounts/accounts`)

- **Top Bar:**  
  - Title: `Accounts`
  - '+ New Account' (primary) (`accounts-action-new`)
  - Export: PDF/Excel/CSV (`accounts-export-btn-[format]`)

- **Search/Filters:**  
  - Text search: Name/code — `accounts-filter-search`
  - Account Type: dropdown — 'Asset', 'Liability', 'Income', 'Expense' — `accounts-filter-type`
  - Group: dropdown (from account heads) — `accounts-filter-group`
  - Status: Active/Inactive/All — `accounts-filter-status`
  - Apply/Reset buttons

- **Table:**  
  | Field         | Label        | TestId                    |
  |---------------|-------------|---------------------------|
  | Name          | Name        | accounts-row-name         |
  | Code          | Code        | accounts-row-code         |
  | Type          | Type        | accounts-row-type         |
  | Group         | Group       | accounts-row-group        |
  | Status        | Status      | accounts-row-status       |
  | Contact       | Contact     | accounts-row-contact      |
  | Actions       | Edit/Del/React| accounts-row-action     |

- **Paging:** 30/page, sticky header, focus restores scroll position

#### Add/Edit Account Page (`/accounts/accounts/new` and `/accounts/accounts/:id`)

- **Header:** `Add/Edit Account`
- **Form Fields:**  
  - Account Name (required) — `accounts-form-name`  
  - Code (auto/readonly or editable) — `accounts-form-code`  
  - Type (dropdown, required) — `accounts-form-type`
  - Group (dropdown, required) — pulls from validated heads — `accounts-form-group`
  - Contact: (person/name) — `accounts-form-contact`
  - Phone/email — `accounts-form-phone`, `accounts-form-email`
  - Status: Active/Inactive toggle — `accounts-form-status`
  - Notes — `accounts-form-notes`
  - Buttons: Save (primary, `accounts-form-save`), Cancel
  
- **Validation:**  
  - Name required, min 2
  - Group required
  - Status required
  - Contact optional, phone/email optional (emails validated)
  - Field errors below fields

- **Delete/Deactivate:** Only accounts not referenced are deletable; else, only deactivate (with info).

- **Post-save:** Redirects back to `/accounts/accounts`, row highlighted

#### Test Identifiers
- accounts-action-new
- accounts-filter-search
- accounts-filter-type
- accounts-filter-group
- accounts-filter-status
- accounts-row-[name|code|type|group|status|contact|action]
- accounts-export-btn-pdf
- accounts-export-btn-excel
- accounts-export-btn-csv
- accounts-error-api
- accounts-form-name
- accounts-form-code
- accounts-form-type
- accounts-form-group
- accounts-form-contact
- accounts-form-phone
- accounts-form-email
- accounts-form-status
- accounts-form-notes
- accounts-form-save
- accounts-form-cancel

---

## 117. Account Head Creation

**Route Path:** `/accounts/account-heads` (list), `/accounts/account-heads/new`, `/accounts/account-heads/:id`  
**Purpose:** Manage account head (COA) records (create/edit/list)  
**PRD Reference:** Ledger & Account Management → Account Head Creation  
**CRUD Completeness:** List and Add/Edit entry consolidated  
**Access Roles:** Accountant, Supervisor, Admin

### List Page (`/accounts/account-heads`)

- **Top Bar:**  
  - Title: `Account Heads`
  - '+ New Head' (primary) — `achead-action-new`
  - Export: PDF/Excel/CSV

- **Filters:**  
  - Search (name/code): `achead-filter-search`
  - Group: dropdown — `achead-filter-group`
  - Type: dropdown — `achead-filter-type`
  - Status: Active/Inactive/All — `achead-filter-status`
  - Apply/Reset
  
- **Table:**    
  | Field         | Label    | TestId                |
  |---------------|----------|-----------------------|
  | Name          | Name     | achead-row-name       |
  | Code          | Code     | achead-row-code       |
  | Parent        | Parent   | achead-row-parent     |
  | Group         | Group    | achead-row-group      |
  | Type          | Type     | achead-row-type       |
  | Status        | Status   | achead-row-status     |
  | Actions       | Actions  | achead-row-action     |

### Add/Edit Page (`/accounts/account-heads/new`, `/accounts/account-heads/:id`)

- **Fields:**  
  - Name (required) — `achead-form-name`
  - Code (auto/readonly) — `achead-form-code`
  - Parent (dropdown, required) — `achead-form-parent`
  - Group (dropdown) — `achead-form-group`
  - Type (dropdown, required) — `achead-form-type`
  - Status — Active/Inactive toggle — `achead-form-status`
  - Description (text) — `achead-form-desc`
  - Buttons: Save (primary), Cancel

- **Validation:**  
  - Name required, min 2  
  - Parent required
  - Status required
  - No duplicate code

- **Delete/Deactivate:** Only heads not referenced can be deleted, else only deactivated

#### Test Identifiers
- achead-action-new
- achead-filter-search
- achead-filter-group
- achead-filter-type
- achead-filter-status
- achead-row-[name|code|parent|group|type|status|action]
- achead-form-name
- achead-form-code
- achead-form-parent
- achead-form-group
- achead-form-type
- achead-form-status
- achead-form-desc
- achead-form-save
- achead-form-cancel
- achead-error-api

---

## 118. Account Head Help

**Route Path:** `/accounts/help/account-heads`  
**Purpose:** Inline help for account head creation/form, with field guidance and 'reset' option  
**PRD Reference:** Ledger & Account Management → Account Head Help  
**Access Roles:** All Users, emphasis for form users

### Structure

- **Glass info panel:**  
  - Title: `Account Head Entry Help`
  - List:  
    | Field      | Guidance Example                 | data-testid                 |
    |------------|--------------------------|-----------------------------|
    | Name       | "Enter unique descriptive name" | ahelp-field-name           |
    | Code       | "Auto-generated or unique manual code" | ahelp-field-code |
    | Parent     | "Choose the parent head/group"  | ahelp-field-parent         |
    | Type       | "Select nature — Asset, Liability, ..."| ahelp-field-type |
    | Status     | "Set to Active unless deprecated"| ahelp-field-status         |

  - Reset Form button (returns add form to untouched state): `ahelp-action-reset`
  - Close/help link returns to last form.

#### Test Identifiers
- ahelp-field-name
- ahelp-field-code
- ahelp-field-parent
- ahelp-field-type
- ahelp-field-status
- ahelp-action-reset

---

## 119. Account Head List

**Route Path:** `/accounts/account-heads`  
**Purpose:** See consolidated under Account Head Creation above  
**Test Identifiers:** Included above

---

## 120. New Account Head List

**Route Path:** `/accounts/account-heads/new-list`  
**Purpose:** Show newly/recency-created heads with date/status; audit/review  
**PRD Reference:** Ledger & Account Management → New Account Head List  
**Access Roles:** Accountant, Supervisor, Admin

### Structure

- **Header:** `Recently Created Account Heads`
  - Created from date picker: `newachead-filter-date`
  - Status: Active/Inactive/All — `newachead-filter-status`
  - Apply/Export buttons

- **Table:**
  | Field      | Label           | TestId                    |
  |------------|-----------------|---------------------------|
  | Name       | Name            | newachead-row-name        |
  | Code       | Code            | newachead-row-code        |
  | Created    | Added On        | newachead-row-created     |
  | Status     | Status          | newachead-row-status      |

- Empty, Error, Loading as above

#### Test Identifiers
- newachead-filter-date
- newachead-filter-status
- newachead-action-apply
- newachead-export-btn-pdf
- newachead-export-btn-excel
- newachead-row-[name|code|created|status]
- newachead-error-api

---

## 121. Account Head Tree

**Route Path:** `/accounts/account-heads/tree`  
**Purpose:** Show the parent/child hierarchy tree of account heads; allow navigation and viewing details  
**PRD Reference:** Ledger & Account Management → Account Head Tree  
**Access Roles:** Accountant, Supervisor, Admin

### Structure

- **Header:** `Account Head Hierarchy`
- **Tree component:** glass card variant
  - Expand/collapse nodes by click/arrow (`acheadtree-node-expand`)
  - Show parent > child > child … unlimited depth
- Node display:
  - Name, code, type, status
  - Edit link (if permitted): `acheadtree-node-edit`
- Filter/search by name/code: `acheadtree-tree-filter`
- Focus, keyboard navigation, and contrast for a11y
- API error, skeletons

#### Test Identifiers
- acheadtree-tree-filter
- acheadtree-node-[id]
- acheadtree-node-expand
- acheadtree-node-edit

---

## 122. Account Head Resorting

**Route Path:** `/accounts/account-heads/resort`  
**Purpose:** Resort the order of account heads within hierarchy for reporting/order  
**PRD Reference:** Ledger & Account Management → Account Head Resorting  
**Access Roles:** Finance Supervisor, Administrator

### Structure

- **Glass card:**  
  - Title: `Resort Account Heads`
  - Drag-handle (mouse & keyboard) to reorder nodes in list/tree view: `acheadresort-drag-handle`
  - Display: Code, name, group
  - "Save New Order" primary button: `acheadresort-action-save`
  - "Reset Order" secondary: `acheadresort-action-reset`
  - Error: cannot save if cycles/inconsistencies detected, show inline message
  - Save: disables on submit, toasts on success/error

- Only accessible to Supervisor/Admin

#### Test Identifiers
- acheadresort-drag-handle
- acheadresort-action-save
- acheadresort-action-reset
- acheadresort-error-api

---

## 123. Account Selector

**Route Path:** `/accounts/account-selector`  
**Purpose:** Searchable-select widget for picking an account (for vouchers, reports, etc.)  
**PRD Reference:** Ledger & Account Management → Account Selector  
**Access Roles:** All finance/ops roles

### Structure

- **Component:**
  - Search bar for name, code, group: `accountselector-search`
  - Dropdown/autocomplete list:
    - Name, code, balance, group, type per row
    - Option to pick/inject the chosen account into parent form
    - testid base: `accountselector-row-[code]`
  - Inline badge: balance, status

- **Error:** None if collapsed/optional

#### Test Identifiers
- accountselector-search
- accountselector-row-[code]

---

## 124. Account Subdetails Display

**Route Path:** `/accounts/account-heads/:id/subdetails`  
**Purpose:** Show any subfields/custom details/notes for account head  
**PRD Reference:** Ledger & Account Management → Account Subdetails Display  
**Access Roles:** Accountant, Supervisor, Admin

### Structure

- **Header:** `Account Subdetails`
- **Subdetail sections:**
  - Notes (text) — `subdetails-notes`
  - Linked Entities (list) — `subdetails-linked`
  - Custom Fields (key/value) — `subdetails-custom-[field]`
  - Parent/child info
  - History (created/edited info) — `subdetails-history`
- **Edit (if permitted):** Save/cancel buttons, validations as per field

#### Test Identifiers
- subdetails-notes
- subdetails-linked
- subdetails-custom-[field]
- subdetails-history
- subdetails-edit-btn
- subdetails-save-btn
- subdetails-cancel-btn
- subdetails-error-api

---

## 125. Account Transaction Error

**Route Path:** `/accounts/account-errors`  
**Purpose:** List and resolve errors/validation issues in account/voucher transactions; provide corrective guidance  
**PRD Reference:** Ledger & Account Management → Account Transaction Error  
**Access Roles:** All roles

### Structure

- **Header:** `Account Transaction Errors`
- **Table:**
  | Field         | Label | TestId                   |
  |---------------|-------|--------------------------|
  | Date          | Date  | accerr-row-date          |
  | Ref No.       | Ref   | accerr-row-ref           |
  | Account       | Acct  | accerr-row-account       |
  | Error Message | Error | accerr-row-error         |
  | Suggestion    | Fix   | accerr-row-suggestion    |
  | Status        | Status| accerr-row-status        |

- **Actions:**
  - View error details (expander): `accerr-expand-btn`
  - 'Acknowledge' button per row for trivial errors (marks as acknowledged): `accerr-row-ack-btn`
  - If correctable: Correction input, 'Fix and Submit' (`accerr-row-fix-btn`)
  - General help link

- **Empty/error/loading:** as others

#### Test Identifiers
- accerr-row-[date|ref|account|error|suggestion|status]
- accerr-expand-btn
- accerr-row-ack-btn
- accerr-row-fix-btn
- accerr-general-help-link

---

## COVERAGE CHECK

| Screen Name                                | Status   |
|---------------------------------------------|----------|
| 101. StockStatement                        | ✅ covered |
| 102. StockValuationReport                  | ✅ covered |
| 103. Bank Book                             | ✅ covered |
| 104. Cash Book                             | ✅ covered |
| 105. Bank Reconciliation                   | ✅ covered |
| 106. Select Bank for Reconciliation        | ✅ covered |
| 107. CBPBook (Report)                      | ✅ covered |
| 108. PendingBillsLetter (Report)           | ✅ covered |
| 109. acFilterFrm (Audit Support Screen)    | ✅ covered |
| 110. missingAcSrlFrm (Audit Correction)    | ✅ covered |
| 111. GroupHlpFrm (Help/Support)            | ✅ covered |
| 112. SectionFrm (Data Maintenance)         | ✅ covered |
| 113. Table1 (Data Entity Support)          | ✅ covered |
| 114. aaaaaaaaaaaaaa (Custom BL screen)     | ✅ covered |
| 115. Form1 (General Data Review)           | ✅ covered |
| 116. Account Create/Delete/Update          | ✅ covered |
| 117. Account Head Creation                 | ✅ covered |
| 118. Account Head Help                     | ✅ covered |
| 119. Account Head List                     | ✅ covered |
| 120. New Account Head List                 | ✅ covered |
| 121. Account Head Tree                     | ✅ covered |
| 122. Account Head Resorting                | ✅ covered |
| 123. Account Selector                      | ✅ covered |
| 124. Account Subdetails Display            | ✅ covered |
| 125. Account Transaction Error             | ✅ covered |

---

# FRONTEND_SPEC.md — Part 6

---

## 126. Account Tree in List View

### Route

`/ledger/account-tree-list`  
**Parent Navigation:** "Ledger & Account Management" → "Account Tree / Hierarchy"

### Purpose

Display the hierarchical structure of account heads in a searchable, filterable **flat list view** for audit and review. Allows users to see the flattened tree and quickly identify relationships, orphaned accounts, and hierarchy structure.

**PRD references:** "Account Tree in List View" screen, Ledger & Account Management section (FR-243, FR-249, FR-258).

### Access Roles

- **Accountant**
- **Finance Supervisor**
- **Administrator**

### UI Structure

#### Main Layout

- **Glass-like card** (`.glass-main-container`) centered, max-width 1120px, padding as per design system.
- **Header:** Title "Account Tree List View" (text-h2), optional collapsible help panel (icon, text).
- **Search/Filter bar:** Search by "Account Name", dropdown filter by "Parent Head", filter by "Account Type", "Level", status (Active/Inactive).
- **Account Tree Table:** Flat table (not tree-grid) showing hierarchy with level indication.
- **Actions:** Export (Excel, PDF), Print, Refresh.

#### Table Columns

| Column             | Field Source    | Type    | Details                      |
|--------------------|----------------|---------|------------------------------|
| Account Name       | description    | string  | Indent with spaces per level |
| Code               | codes          | string  | Non-editable, unique         |
| Parent Head        | head           | string  | Show name of parent          |
| Level              | level          | int     | Calculated, begins at 0      |
| Account Type       | group/type     | string  | Display as "Asset", etc      |
| Status             | display/hidden | badge   | "Active"/"Inactive"          |
| Sort#              | sort           | number  | For sorting, editable inline |
| Actions            | —              | icons   | View, Edit head (if role)    |

Visual: Indent Account Name with `var(--space-3)` * level. Use a faint vertical guide for tree effect.

#### Actions Available (per requirements)

- **View Details** (`action-btn`, eye icon)
- **Edit Account Head** (if permitted) (`action-btn`, pencil icon)
- **Export** (primary button, Excel/PDF menu)
- **Print** (ghost/line icon button)
- **Refresh** (inline, circular arrow icon)

#### Bulk Actions

- Multi-row select for export/print only.
- No bulk edit/delete allowed for this view.

### Form Field Definitions & Validations

- **Search** (`Account Name`): Minimum 2 characters to trigger filter.
- **Parent Head Filter:** Dropdown, shows only valid parent heads (from head tree), "All" as default.
- **Account Type Filter:** Dropdown, values: "All", "Asset", "Liability", "Income", "Expense" (as per COA).
- **Level Filter:** Dropdown, "All" + integers 0–6.
- **Status Filter:** Dropdown, All/Active/Inactive (Active: `display`/`hidden`).

#### Error Handling

- **Load Error:** If API fails, show error banner at top: “Could not load account tree. Please try again.” (`data-testid='account-tree-list-error'`)
- **Empty State:** "No account heads found matching your filter." (`data-testid='account-tree-list-empty'`)
- **Export Errors:** On export fail, toast message. Print errors, display modal with reason.

#### Loading State

- Skeleton table rows (5–7), animated shimmer.
- Disable all actions during loading.

#### Visual/Glass Effect

- Main container: glassmorphism, border-radius-xl, shadow-lg, white border-top/left, subtle shadow (design system).
- Table: minimal glass, bordered on top and bottom only.

#### Modals

- **View Details Modal:** Shows all account head subdetail fields, hierarchy path, timestamps.
- **Edit Modal:** Reuses head-edit form (not inline, opens full modal, see other spec).

---

#### API Endpoints

- `GET /api/v1/ledger/account-tree` (loads full tree)
- `GET /api/v1/ledger/account-heads` (loads flat list, supports filtering)
- `POST /api/v1/ledger/account-heads/export` (on export)
- `POST /api/v1/ledger/account-heads/print` (on print)

---

#### Test Identifiers

| Element                   | data-testid                        |
|---------------------------|------------------------------------|
| Main Container            | account-tree-list-root             |
| Search Input              | account-tree-list-search           |
| Parent Head Filter        | account-tree-list-parent-filter    |
| Account Type Filter       | account-tree-list-type-filter      |
| Level Filter              | account-tree-list-level-filter     |
| Status Filter             | account-tree-list-status-filter    |
| Table                     | account-tree-list-table            |
| Table Row                 | account-tree-list-row              |
| Row Expand/Collapse Icon  | account-tree-list-expand-btn       |
| Row Edit Button           | account-tree-list-edit-btn         |
| Row View Button           | account-tree-list-view-btn         |
| Export Button             | account-tree-list-export-btn       |
| Print Button              | account-tree-list-print-btn        |
| Refresh Button            | account-tree-list-refresh-btn      |
| Loading Skeleton          | account-tree-list-loading          |
| Empty State               | account-tree-list-empty            |
| Error Banner              | account-tree-list-error            |
| View Modal                | account-tree-list-view-modal       |
| Edit Modal                | account-tree-list-edit-modal       |


---

## 127. AcheadList Report

### Route

`/ledger/account-heads/report`  
**Parent Navigation:** "Ledger & Account Management" → "Reports" → "Achead List"

### Purpose

Generates a comprehensive listing of all account heads (COA), with details for audit or review. Supports filtering, export, print.

**PRD References:** "AcheadList Report" screen (FR-250, FR-242).

### Access Roles

- **Accountant**
- **Finance Supervisor**
- **Auditor**
- **Administrator**

### UI Structure

#### Main Layout

- **Header:** Title "Account Heads List Report" (text-h2), Export & Print buttons as primary/ghost.
- **Filter Bar** (above table):
    - Account Type (dropdown: "All", "Asset", "Liability", etc.)
    - Status (All, Active, Inactive)
    - Parent Account (dropdown/autocomplete)
    - Search (by code or description)
    - Export (Excel, PDF)
    - Print (print icon)
- **Report Table**: Scrollable, glassmorphic table.

#### Table Columns

| Column           | Field           |
|------------------|-----------------|
| Account Code     | codes           |
| Account Name     | description     |
| Parent Head      | head            |
| Group            | group           |
| Type             | account type    |
| Status           | display/hidden  |
| Created Date     | createdDate     |
| Last Modified    | lastModified    |
| # Transactions   | TotRec          |

#### Actions Available

- **Export Table** (primary btn, menu: Excel, PDF, CSV)
- **Print** (ghost btn)
- **Filter/Refresh**

No per-row edit/view in report mode (links open full head view if permitted).

### Form Fields & Validation

- Search: Debounced, >2 chars.
- Account Type / Group / Status: All required for export/print.
- Date filters optional.
- “No account heads found for selected filters.” if none.

### Error Handling

- If load fails: `account-heads-report-error` banner.
- On export error: show modal with system reason.

### Loading State

- Skeleton for table rows, shimmer bar through headers.
- Export/print disabled (opacity 0.45) while loading.

### Visual/Glass

- Glass card with shadow-sm, border-radius-md.
- Table: light glass, faint vertical separator.

---

#### API Endpoints

- `GET /api/v1/ledger/account-heads?type&status&parent&search`
- `POST /api/v1/ledger/account-heads/export`
- `POST /api/v1/ledger/account-heads/print`

---

#### Test Identifiers

| Element                  | data-testid                          |
|--------------------------|--------------------------------------|
| Main Container           | account-heads-report-root            |
| Filter Type              | account-heads-report-type-filter     |
| Filter Status            | account-heads-report-status-filter   |
| Filter Parent            | account-heads-report-parent-filter   |
| Search                   | account-heads-report-search          |
| Report Table             | account-heads-report-table           |
| Table Row                | account-heads-report-row             |
| Export Button            | account-heads-report-export-btn      |
| Print Button             | account-heads-report-print-btn       |
| Refresh Button           | account-heads-report-refresh-btn     |
| Loading Skeleton         | account-heads-report-loading         |
| Error Banner             | account-heads-report-error           |
| Empty State              | account-heads-report-empty           |


---

## 128. Ledger Report

### Route

`/ledger/reports`  
**Parent Navigation:** "Ledger & Account Management" → "Reports"

### Purpose

Detailed financial ledger report for individual or grouped accounts, showing all transactions, debits, credits, and balances, filterable by date/account. Used for reconciliation, compliance, audit.

**PRD References:** "Ledger Report" screen (FR-251, FR-244, FR-245, FR-256).

### Access Roles

- **Accountant**
- **Finance Supervisor**
- **Auditor**
- **Administrator**

### UI Structure

#### Main Layout

- **Header:** "Ledger Report" (text-h2) + filter/search area.
- **Filter Bar**:
    - Account (autocomplete, required)
    - Date Range (from, to, required)
    - Transaction Type (optional: All, Debit, Credit)
    - Status (optional: Posted/Unposted)
    - Export (Excel, PDF, CSV)
    - Print (ghost)

- **Ledger Table**: Sticky header, scrollable.

#### Table Columns

| Column              | Source Field     | Type                |
|---------------------|------------------|---------------------|
| Date                | date             | date                |
| Type                | vtype            | string              |
| Voucher No.         | vsrl             | string              |
| Account             | ac_description   | string              |
| Description         | narration        | string              |
| Debit               | debt             | money               |
| Credit              | cred             | money               |
| Balance             | running bal.     | money (calc)        |
| Reference           | refno (if any)   | string              |
| Cheque No.          | chq              | string              |
| Status              | posted/pdc flag  | badge               |
| Actions             | view voucher     | icon                |

#### Actions Available

- View Transaction/Voucher (`action-btn`, opens voucher details)
- Export Table
- Print
- Refresh

### Form Fields & Validation

- Account: required, autocomplete (search by code/name).
- Dates: required. "From date must be before to date."
- Transaction Type: optional.
- Export/print enabled only if results are present.

#### Error Handling

- Load error: Banner, “Failed to load transactions.” (`ledger-report-error`)
- API fails: show message; retry enabled.
- No records: “No transactions found for selected filters.” (`ledger-report-empty`)

### Loading State

- Table: skeleton rows, shimmer heading.
- Export, print disabled.

### Visual/Glass

- Glassmorphic section panel, radius-md.
- Badge/status: use glass on ‘PDC’ and 'Posted' tags.

---

#### API Endpoints

- `GET /api/v1/ledger/account-transactions?account&from&to&type&status`
- `POST /api/v1/ledger/account-transactions/export`
- `POST /api/v1/ledger/account-transactions/print`

---

#### Test Identifiers

| Element            | data-testid                           |
|--------------------|---------------------------------------|
| Main Container     | ledger-report-root                    |
| Filter Account     | ledger-report-account-filter           |
| Filter Date From   | ledger-report-date-from               |
| Filter Date To     | ledger-report-date-to                 |
| Filter Type        | ledger-report-type-filter              |
| Table              | ledger-report-table                   |
| Table Row          | ledger-report-row                     |
| Voucher View Btn   | ledger-report-view-voucher-btn        |
| Export Btn         | ledger-report-export-btn              |
| Print Btn          | ledger-report-print-btn               |
| Loading Skeleton   | ledger-report-loading                 |
| Error Banner       | ledger-report-error                   |
| Empty State        | ledger-report-empty                   |

---

## 129. Ledger_ActualDate Report

### Route

`/ledger/reports/actual-date`  
**Parent Navigation:** "Ledger & Account Management" → "Reports" → "Ledger (Actual Date)"

### Purpose

Produces a financial ledger report based on the **actual transaction dates** as opposed to voucher/posting dates. Auditing, closing books, and period-end analysis.

**PRD References:** "Ledger_ActualDate Report" (FR-252).

### Access Roles

- **Accountant**
- **Finance Supervisor**
- **Auditor**
- **Administrator**

### UI Structure

Same frame and interactions as above (Ledger Report), but with “Actual Date” preselected and date picker UI disables non-actual date options.

- Header: “Ledger Report (Actual Date)”
- Filter: Account, Actual Date Range (calendar selects actual dates), Export/Print.
- Table: Same columns as Ledger Report, with “Actual Date” in place of “Date”.

### Differences from above

- All filters/query/result columns reference `actualDate` not `voucher/posting date`.
- Banner at top: “Report uses actual transaction dates (not voucher date).”

### Test Identifiers

All as above, but prefix every id with `ledger-actualdate-`, e.g.

| Element                 | data-testid                          |
|-------------------------|--------------------------------------|
| Main Container          | ledger-actualdate-report-root        |
| Filter Account          | ledger-actualdate-account-filter     |
| Filter Date From        | ledger-actualdate-date-from          |
| ... etc ...             | ...                                  |


---

## 130. Ledger_Pdc Report

### Route

`/ledger/reports/pdc`  
**Parent Navigation:** "Ledger & Account Management" → "Reports" → "Ledger (Post-dated Cheques)"

### Purpose

Shows all ledger entries involving **post-dated cheques**, grouped or filterable by posting date, cheque date, and cheque/account details.

**PRD References:** "Ledger_Pdc Report" (FR-253)

### Access Roles

- **Accountant**
- **Finance Supervisor**
- **Auditor**
- **Administrator**

### UI Structure

- Header: "Ledger Report (Post-dated Cheques)"
- Filter Bar:
    - Account (autocomplete, required)
    - Cheque Date Range (mandatory)
    - Cheque No. (optional)
    - Payee/Party (optional)
    - Export / Print
- Table Columns (as for main ledger; “Cheque Date” replaces/in addition to main date):

| Column              | Field           |
|---------------------|-----------------|
| Cheque Date         | qdate           |
| Voucher No.         | vsrl            |
| Account             | ac_description  |
| Description         | narration       |
| Cheque No.          | chq             |
| Debit               | debt            |
| Credit              | cred            |
| Balance             | running/calc    |
| Status              | posted/pdc      |
| Actions             | view voucher    |

### Actions & Interactions

As above. Cheque number searchable. Resulting rows badge "PDC" in status. Export must include PDC detail.

### Validation

Cheque date(s) required, account required.

### Loading/Empty/Error

As per Ledger Report, with pdc-specific IDs:  
e.g. `ledger-pdc-report-loading`, `ledger-pdc-report-empty`, etc.

---

## 131. LedgerSummary Report

### Route

`/ledger/reports/summary`  
**Parent Navigation:** "Ledger & Account Management" → "Reports" → "Summary"

### Purpose

Summarised ledger balances with opening, periodic, and closing balances for grouped or selected accounts over a set period.

**PRD References:** "LedgerSummary Report" (FR-254, FR-256, FR-258, FR-262).

### Access Roles

- **Accountant**
- **Finance Supervisor**
- **Auditor**
- **Administrator**

### UI Structure

- Header: "Ledger Summary Report"
- Filter Bar: 
    - Account Group / Individual (dropdown/autocomplete)
    - Period Start/End
    - Export/Print
- Table:

| Column            | Field              |
|-------------------|--------------------|
| Account Name      | description        |
| Code              | codes              |
| Opening Balance   | opening_balance    |
| Debits            | total_debits       |
| Credits           | total_credits      |
| Closing Balance   | closing_balance    |
| Status            | active/inactive    |

Actions (none per-row); export and print at top-right.

### Errors/Empty/Loading

See Ledger Report.

### Test Identifiers

Prefix: `ledger-summary-`
E.g., `ledger-summary-table`, `ledger-summary-export-btn`, etc.

---

## 132. Auto Receipt Entry

### Route

`/finance/receipts/auto`  
**Parent Navigation:** "Receipts & Payments Processing" → "Auto Receipt Entry"

### Purpose

Form for rapid input and allocation of multiple cash/bank receipts at once, including allocations, support for batch processing, audit logging.

**PRD References:** "Auto Receipt Entry", Receipts & Payments Processing (FR-266, FR-268, FR-273, FR-284, FR-287).

### Access Roles

- **Standard User**
- **Finance Supervisor**
- **Administrator**

### UI Structure

#### Main Layout

- Glass-form card (glass-form-card), width 700px.
- Header: Auto Receipt Entry (text-h2)
- Section Desc: “Enter/incoming multiple cash or bank receipts. All fields marked * are required.”

#### Fields

| Field                 | Type      | Validation                                            |
|-----------------------|-----------|-------------------------------------------------------|
| Receipt Date          | date      | Required; not in future                              |
| Payment Method        | select    | Required; values: "Cash", "Bank", "Cheque", "Other"  |
| Payer (Customer/Supp) | search/auto | Required; select from list; cannot enter new      |
| Amount                | number    | Required; > 0, up to 2 decimals, currency validated   |
| Allocation Details    | table w/ account selectors | At least one row required|
| Reference Number      | text      | Optional, max 20 chars                                |
| Memo / Notes          | textarea  | Optional, max 250 chars                               |
| Status                | badge     | System-managed (Pending, Posted, Rejected, etc)       |

**Allocation Table Columns:**

- Account: dropdown/autocomplete
- Amount: number; required, must sum to main Amount
- Allocation Reason: text; optional
- Remove Row: action-btn (trash icon)

#### Actions

- **Add Allocation Row** (`data-testid='auto-receipt-entry-add-allocation-btn'`)
- **Save Receipt** (primary, validation checked)
- **Reset Form** (ghost)
- **Cancel** (returns to receipts list)
- **Delete** (if editing existing)
- **Audit Log View** (modal of all change events)

#### Field-level Validation

- Requireds: date, payer, method, amount, at least one allocation row/account, allocation sum = amount
- Numeric validations: "Amount must be a positive number"
- Error: Show error under relevant input, never only in toast.
- Form-level: If allocations do not sum to total, sticky red error: "Allocation must equal total amount"
- Backend errors: In-form banner with backend error message.

#### Loading State

- Save: disables buttons, spinner in button.
- Loading: shimmer skeleton for allocation table if editing/view mode.

#### Empty State

- For new: all fields empty, allocations has one default row.

#### Upon Save

- On success: toast `Receipt saved successfully`, return to `/finance/receipts` list with new/updated record in place.
- On error: see error banner.

#### Data Test Identifiers

| Element                 | data-testid                                  |
|-------------------------|----------------------------------------------|
| Form Root               | auto-receipt-entry-root                      |
| Receipt Date            | auto-receipt-entry-date                      |
| Payment Method          | auto-receipt-entry-method                    |
| Payer                   | auto-receipt-entry-payer                     |
| Amount                  | auto-receipt-entry-amount                    |
| Allocation Table        | auto-receipt-entry-allocation-table          |
| Allocation Row          | auto-receipt-entry-alloc-row                 |
| Allocation Add Row Btn  | auto-receipt-entry-add-allocation-btn        |
| Reference Number        | auto-receipt-entry-ref                       |
| Memo Notes              | auto-receipt-entry-notes                     |
| Status Badge            | auto-receipt-entry-status                    |
| Save Button             | auto-receipt-entry-save-btn                  |
| Reset Button            | auto-receipt-entry-reset-btn                 |
| Cancel Button           | auto-receipt-entry-cancel-btn                |
| Delete Button           | auto-receipt-entry-delete-btn                |
| Audit Log Modal         | auto-receipt-entry-audit-modal               |
| Validation Error        | auto-receipt-entry-error                     |
| Loading Skeleton        | auto-receipt-entry-loading                   |

---

## 133. Payment Entry

### Route

`/finance/payments/entry/:id?`  
**Parent Navigation:** "Receipts & Payments Processing" → "Payment Entry"

### Purpose

Add or edit an outgoing payment entry, capture allocation, posting and approval details.

**PRD References:** "Payment Entry" (FR-267, FR-270, FR-273, FR-275, FR-284, FR-287).

### Access Roles

- **Standard User**
- **Finance Supervisor**
- **Administrator**

### UI Structure

#### Main Layout

- Glass form, max-width 700px.
- Header: Payment Entry (new or edit mode)
- Section: "Outgoing Payment to Supplier or Other Party. * fields required."

#### Fields

| Field            | Type      | Validation                                   |
|------------------|-----------|----------------------------------------------|
| Payment Date     | date      | Required, not in future                     |
| Payee (Supplier/Customer/Other) | autocomplete/search | Required   |
| Payment Method   | select    | Required: Cash/Bank/Cheque/Other            |
| Amount           | number    | Required, positive, 2 dp                    |
| Account          | autocomplete | Required, must be eligible                |
| Reference Number | text      | Optional, max 20 chars                      |
| Cheque Number    | text      | If method="Cheque"; 8-16 chars, required    |
| Settlement/Allocation | Table | Sum to total, as for receipts               |
| Memo             | textarea  | Optional, max 250                           |
| Status           | badge     | System-calculated, no input                 |
| Approval Status  | badge     | System, auto-set if approval pending        |

**Settlement Table:**

- Account to allocate to: select/account-lookup
- Allocation Amount: Required, sum to Amount
- Remove Row: action-btn

#### Actions

- Add Settlement Row (`payment-entry-add-allocation-btn`)
- Save Payment (primary)
- Reset
- Cancel
- Delete (if editing)
- View Audit Log

#### Validation

- All required marked
- Allocation must sum to Amount, must select valid accounts
- Cheque Number required for Cheque payments
- Error messages next to each field

#### Loading

- Save disables all actions, spinner in button
- Skeleton rows for edit

#### Empty State

- New: blank, default one allocation row

#### On Save

- Success: toast and return to `/finance/payments`
- Error: in-form error/banner

#### Data Test Identifiers

| Element                      | data-testid                        |
|------------------------------|------------------------------------|
| Form Root                    | payment-entry-root                 |
| Payment Date                 | payment-entry-date                 |
| Payee                        | payment-entry-payee                |
| Payment Method               | payment-entry-method               |
| Amount                       | payment-entry-amount               |
| Account                      | payment-entry-account              |
| Reference Number             | payment-entry-ref                  |
| Cheque Number                | payment-entry-cheque               |
| Allocation Table             | payment-entry-allocation-table     |
| Settlement Allocation Row    | payment-entry-alloc-row            |
| Allocation Add Row Button    | payment-entry-add-allocation-btn   |
| Memo                         | payment-entry-memo                 |
| Status Badge                 | payment-entry-status               |
| Approval Badge               | payment-entry-approval             |
| Save                         | payment-entry-save-btn             |
| Reset Button                 | payment-entry-reset-btn            |
| Cancel Button                | payment-entry-cancel-btn           |
| Delete Button                | payment-entry-delete-btn           |
| Audit Log Modal              | payment-entry-audit-modal          |
| Validation/Error Text        | payment-entry-error                |
| Loading Skeleton             | payment-entry-loading              |

---

## 134. Receipt Entry

### Route

`/finance/receipts/entry/:id?`  
**Parent Navigation:** "Receipts & Payments Processing" → "Receipt Entry"

### Purpose

Traditional receipt entry/edit page — single payment-in records, manual allocations, approval workflow visible.

**PRD References:** "Receipt Entry", Receipts & Payments Processing (FR-268, FR-273, FR-284, FR-287).

### Access Roles

- **Standard User**
- **Finance Supervisor**
- **Administrator**

### UI Structure

Same as Payment Entry, with slight swaps:

| Field               | Type      | Validation                                           |
|---------------------|-----------|------------------------------------------------------|
| Receipt Date        | date      | Required, not in future                              |
| Payer (Customer/Supplier/Other) | autocomplete/search | Required                  |
| Payment Method      | select    | Required                                             |
| Amount              | number    | Required, positive                                   |
| Account             | autocomplete | Required                                    |
| Reference Number    | text      | Optional                                             |
| Settlement Allocation | as above | Required, sum to amount                              |
| Memo/Notes          | textarea  | Optional                                             |
| Status              | badge     | Read-only                                            |
| Approval Status     | badge     | Read-only                                            |

#### Actions

Save (primary), Reset, Cancel, Delete, Audit Log view.

#### Field Validations

As in Payment Entry; error under each input.

#### Loading/Empty/Error/Success

As Payment Entry.

#### Data Test Identifiers

As for Payment Entry, prefix with `receipt-entry-`.  
e.g., `receipt-entry-root`, `receipt-entry-payer`, etc.

---

## 135. Petty Cash Entry

### Route

`/finance/petty-cash/entry/:id?`  
**Parent Navigation:** "Receipts & Payments Processing" → "Petty Cash Entry"

### Purpose

Input a petty cash inflow or outflow record; supports approval, balance monitoring.

**PRD References:** "Petty Cash Entry" (FR-269).

### Access Roles

- **Standard User**
- **Finance Supervisor**
- **Administrator**

### UI Structure

- Glass card, 600px max.
- Header: Petty Cash Entry
- Fields:

| Field             | Type      | Validation                    |
|-------------------|-----------|-------------------------------|
| Transaction Date  | date      | Required; not in future      |
| Type              | select    | 'Inflow', 'Outflow' required |
| Amount            | number    | Must be positive, <= balance(if outflow) |
| Purpose/Category  | select/text | Optional, max 50 chars      |
| Approval Status   | badge     | System badge                 |
| Reference Number  | text      | Optional max 20              |
| Memo              | textarea  | Optional                     |
| Running Balance   | computed  | Read-only display            |
| Attach document   | upload    | Optional, PDF only, max 2MB  |

#### Actions

- Save (primary), Reset, Cancel, Delete, Audit Log, Upload Document

#### Validations

- Amount cannot exceed balance in outflow mode
- Required fields show red error
- Document: PDF only, <2MB

#### Loading/Empty/Error

Standard form shells

#### Success

Back to `/finance/petty-cash`, see new/updated

#### Data Test Identifiers

Petty cash prefix on all: e.g., `pettycash-entry-save-btn`, `pettycash-entry-amount`, etc.

---

## 136. Payment Finalization

### Route

`/finance/payments/finalization`  
**Parent Navigation:** "Receipts & Payments Processing" → "Payment Finalization"

### Purpose

Allows authorized users to post ('finalize') pending payments by batch/posting date. Before posting, changes can still be made; after, locked.

**PRD References:** "Payment Finalization" (FR-270, FR-273, BR-100, BR-102).

### Access Roles

- **Finance Supervisor**
- **Administrator**

### UI Structure

- Section panel, max 1020px.
- Header: Payment Finalization
- Filter: Date range, Status (Pending/Finalized/Posted), Payment Type (All, Bank, Cheque, Petty Cash), Amount Range
- Table:

| Column         | Field          |
|----------------|---------------|
| Date           | payment date  |
| Payee          | payee         |
| Amount         | amount        |
| Account        | main account  |
| Method         | Cash/Bank/... |
| Status         | badge         |
| Approver       | approved by   |
| Finalization   | badge         |
| Actions        | Finalize/Post, Undo (pre-post) |

- Actions:

    - Finalize Payment (`Finalize` primary btn per-row; batch finalize at top if >1 selected)
    - Undo Finalization (ghost, only pre-post)
    - Refresh
    - View Details (sidecard/modal)

### Validations

- Confirm modal before batch operation
- Unable to finalize already posted
- On error, see error inline per row

### Loading/Error/Empty

- Skeleton rows
- Toast/errors for batch
- Empty state: "No payments awaiting finalization."

### Test Identifiers

Prefix: `payment-finalization-`.  
e.g., `payment-finalization-table`, `payment-finalization-finalize-btn`, etc.

---

## 137. Pending Add Payment

### Route

`/finance/payments/pending`  
**Parent Navigation:** "Receipts & Payments Processing" → "Pending Payments for Approval"

### Purpose

Lets standard users submit new payments for supervisor review; supervisors see all "Pending" payments and can approve/reject.

**PRD References:** "Pending Add Payment" (FR-271)

### Access Roles

- **Standard User/Entry:** submit new
- **Supervisor:** approve/reject

### UI Structure

- Add Payment: displays as per Payment Entry (reuse form, `status` pinned "Pending Approval")
- List: Table of all pending (unapproved) payments, with Approve/Reject per row (supervisor) and “Edit” (entry user, if still unapproved)
- Table Columns:

| Field         | Details    |
|---------------|-----------|
| Date          | Payment date  |
| Payee         |           |
| Amount        |           |
| Account       |           |
| Status        | badge     |
| Submitted by  |           |
| Actions       | Approve, Reject (supervisor); Edit (self, if not yet approved); View Audit  |

#### Actions

- Approve/Reject (supervisor): modal with comment box required
- Edit (if status=pending/self)
- View Changes/Audit

### Validations

- Approve/Reject actions confirm modal with reason.
- Supervisor must enter comment for rejection.

### Test Identifiers

| Element                  | data-testid                          |
|--------------------------|--------------------------------------|
| Add Payment Button       | pending-add-payment-add-btn          |
| Approve Button           | pending-add-payment-approve-btn      |
| Reject Button            | pending-add-payment-reject-btn       |
| Edit Button              | pending-add-payment-edit-btn         |
| Audit Modal              | pending-add-payment-audit-modal      |
| Table                    | pending-add-payment-table            |
| Table Row                | pending-add-payment-row              |
| Submitter Cell           | pending-add-payment-submittedby      |

---

## 138. Pending Add Receipt

### Route

`/finance/receipts/pending`  
**Parent Navigation:** "Receipts & Payments Processing" → "Pending Receipts for Approval"

### Purpose

Identical to Pending Add Payment but for receipts; shows pending receipts requiring supervisor approval.

**PRD References:** "Pending Add Receipt" (FR-272)

### Access Roles

- **Standard User:** submit new
- **Supervisor:** approve/reject

### UI Structure

- Add Receipt button (opens entry form, status "Pending")
- Table as above for Pending Add Payment, but for Receipts.

### Test Identifiers

All as above, prefix: `pending-add-receipt-`.

---

## 139. Receipts (Report)

### Route

`/finance/reports/receipts`  
**Parent Navigation:** "Receipts & Payments Processing" → "Reports" → "Receipts"

### Purpose

Detailed report of all receipts for period/entity, filterable and exportable.

**PRD References:** "Receipts (Report)" (FR-277, FR-276)

### Access Roles

- **Standard User**
- **Finance Supervisor**
- **Administrator**

### UI Structure

- Header: "Receipts Report"
- Filter Bar:
    - Date Range
    - Customer/Supplier (optional, autocomplete)
    - Status (Posted/Settled/Pending)
    - Payment Method (All/Cash/Bank/Cheque)
    - Export/Print
- Table:

| Field           | Type      |
|-----------------|----------|
| Date            | date     |
| Receipt No.     | string   |
| Payer           | name     |
| Amount          | money    |
| Method          | string   |
| Status          | badge    |
| Allocations     | sum      |
| Ref No          | string   |
| Actions         | view     |

### Loading/Error/Empty

Standard, as prior reports.

### Test Identifiers

Prefix: `receipts-report-` (e.g., `receipts-report-table`)

---

## 140. Payments (Report)

### Route

`/finance/reports/payments`  
**Parent Navigation:** "Receipts & Payments Processing" → "Reports" → "Payments"

### Purpose

Summary and detail report of all payments, similar filters and table as Receipts (Report).

**PRD References:** "Payments (Report)" (FR-278)

### Access Roles

- **Standard User**
- **Finance Supervisor**
- **Administrator**

### UI Structure

- Identical to Receipts (Report), but shows Payee column, allocation outflows, payment-specific reference, linking to supplier/customer.

### Test Identifiers

Prefix: `payments-report-` (e.g., `payments-report-table`)

---

## 141. Receipt-Backup (Report)

### Route

`/finance/reports/receipts/backup`  
**Parent Navigation:** "Receipts & Payments Processing" → "Reports" → "Receipts Backup"

### Purpose

Backup report of receipts, for regulatory recovery, compliance, etc.

**PRD References:** "Receipt-Backup (Report)" (FR-277, BR-105)

### Access Roles

- **Finance Supervisor**
- **Administrator**

### UI Structure

- Header: "Receipt Backup Report"
- Filter: Date Range, Status
- Table: as Receipts (Report) plus explicit backup timestamp column.

### Actions

Export, print; no edit.

### Test Identifiers

Prefix: `receipt-backup-report-`

---

## 142. Pdc_Issue_Voucher (Report)

### Route

`/finance/reports/pdc-issues`  
**Parent Navigation:** "Receipts & Payments Processing" → "Reports" → "PDC Issue Vouchers"

### Purpose

Report screen for all issued post-dated cheque vouchers.

**PRD References:** "Pdc_Issue_Voucher (Report)" (FR-277)

### Access Roles

- **Standard User**
- **Finance Supervisor**
- **Administrator**

### UI Structure

- Header: PDC Issue Voucher Report
- Filter: Date range, Payee, Bank, Cheque No., Status
- Table:

| Field                |         |
|----------------------|---------|
| Issue Date           | date    |
| Cheque No.           | string  |
| Payee                | string  |
| Amount               | money   |
| Bank                 | string  |
| Due Date             | date    |
| Status               | badge   |
| Reference            | string  |
| Actions              | view    |

### Loading/Empty/Error

Same as standard reports.

### Test Identifiers

Prefix: `pdc-issue-voucher-report-`

---

## 143. Pdc_Receipt_Voucher (Report)

### Route

`/finance/reports/pdc-receipts`  
**Parent Navigation:** "Receipts & Payments Processing" → "Reports" → "PDC Receipt Vouchers"

### Purpose

List of received post-dated cheque vouchers for payment tracking.

**PRD References:** "Pdc_Receipt_Voucher (Report)" (FR-277)

### Access Roles

As above.

### UI Structure

Similar to Pdc_Issue_Voucher, with Payer instead of Payee, and all necessary cheque fields.

### Test Identifiers

Prefix: `pdc-receipt-voucher-report-`

---

## 144. Bulk Journal Voucher Entry

### Route

`/finance/vouchers/bulk-journal-entry`  
**Parent Navigation:** "Voucher & Transaction Entry" → "Bulk Journal Voucher Entry"

### Purpose

Upload, import, and process multiple journal voucher transactions at once, for batch processing.

**PRD References:** "Bulk Journal Voucher Entry" (FR-300)

### Access Roles

- **Standard User**
- **Finance Supervisor**
- **Finance Administrator**

### UI Structure

- Header: Bulk Journal Voucher Entry
- Upload Box: Drag & drop or select spreadsheet file (.xlsx, .csv — show accepted)
- Instructions: Accepted columns, validation rules
- Imported Table Preview: Shows rows detected, color-coded errors, row numbers
- Editable: inline fix for simple validation errors before import if permitted
- Actions:
    - Import (primary) — submits batch
    - Cancel (reset workflow)
    - Download Sample Template (ghost)
    - Export Results (after import, Excel/PDF)

### Table Columns (configurable per imported file):

| Date   | Voucher Type | Account Code | Counter Account | Debit | Credit | Reference | Narration | Status/Error |

### Validation

- Failed rows: red X icon, error text in Status. User cannot proceed until errors resolved.
- Inline fixes: supported for all fields except account codes (must use dropdown/autocomplete for these).
- Max 200 rows per import file.
- On Import: only successful rows processed, show feedback on total inserted, failed.

### Loading/Progress

- Step-based progress bar.
- Rows in import table show shimmer on upload.

### Empty/Error

- On validation failure, errors display per-row in table.
- Backend error: in-form error banner.

### Test Identifiers

Prefix: `bulk-journal-voucher-` (e.g., `bulk-journal-voucher-import-btn`, `bulk-journal-voucher-upload-file`, etc.)

---

## 145. Bulk PDC Receipt Transactions

### Route

`/finance/vouchers/bulk-pdc-receipt`  
**Parent Navigation:** "Voucher & Transaction Entry" → "Bulk PDC Receipt Transactions"

### Purpose

Upload and process batches of post-dated cheque **receipt** transactions.

**PRD References:** "Bulk PDC Receipt Transactions" (FR-315)

### Access Roles

As Bulk Journal Voucher Entry.

### UI Structure

Same as above, but expected file columns are:

| Date | Cheque No. | Customer | Amount | Bank | Account | Due Date | Reference | Narration | Status/Error |

All validations as above.

### Test Identifiers

Prefix: `bulk-pdc-receipt-`

---

## 146. Bulk PDC Transactions

### Route

`/finance/vouchers/bulk-pdc`  
**Parent Navigation:** "Voucher & Transaction Entry" → "Bulk PDC Transactions"

### Purpose

Upload/process general (issue/receipt) batch of post-dated cheque transactions.

**PRD References:** "Bulk PDC Transactions" (FR-315)

### Access Roles

As above.

### UI Structure

- File columns to match operation (mode toggle: Issue/Receipt)
- Validation per transaction
- Table preview
- Download Template
- Error report per-entry

### Test Identifiers

Prefix: `bulk-pdc-transaction-`

---

## 147. Journal Entry

### Route

`/finance/vouchers/journal-entry/:id?`  
**Parent Navigation:** “Voucher & Transaction Entry” → “Journal Entry”

### Purpose

Classic double-entry journal voucher form, for both new and edit. Supports line splits, allocation, rules for balancing.

**PRD References:** "Journal Entry" (FR-310, FR-311, FR-317, FR-318)

### Access Roles

- **Standard User**
- **Finance Supervisor**
- **Finance Administrator**

### UI Structure

- Header: Journal Entry (Add/Edit)
- Fields:

| Field                | Type        | Validation                                               |
|----------------------|-------------|----------------------------------------------------------|
| Date                 | date        | Required, not future                                     |
| Voucher Type         | select      | Required, values from VoucherTypeSql                     |
| Voucher No           | auto/gen    | Must be unique (system warns on collision)               |
| Reference            | text        | Optional, max 20                                         |
| Narration            | text        | Optional, max 80                                         |
| Attachments          | upload      | Optional, accept common types, max 3MB                   |
| Line Items           | table       | At least 2, debits=credits, no blank lines allowed, add/remove lines |
| Status               | badge       | system, read-only                                        |

**Line Items Table:**

| Account     | autocomplete, required (valid accounts only) |
| Debit       | number, >=0, cant be both debit&credit       |
| Credit      | number, >=0, not both debit&credit           |
| Description | short text, optional                         |
| Remove      | icon action-btn                              |

#### Actions

- Add Line (`journal-entry-add-line-btn`)
- Save (primary, disabled if not balanced)
- Save as Draft
- Cancel
- Delete (if edit mode)
- Attach file
- Audit log view

### Validation

- Exactly: debits == credits
- No blank lines
- Voucher no. unique
- Date required
- Attachments: only allowed filetypes, size limit

#### Errors

- If not balanced: sticky error "Debits and credits must be equal for posting"
- If duplicate voucher: error under Voucher No "Voucher number already used this financial year"
- Attach error: “Attachment failed: ...”

#### Loading/Empty

- On add: at least 2 lines visible
- Save disables all actions, spinner in button

#### On Success

- Save: toast, return to `/finance/vouchers/list` with new/updated voucher at top.

### Test Identifiers

Prefix: `journal-entry-`

| Element            | data-testid                          |
|--------------------|--------------------------------------|
| Form Root          | journal-entry-root                   |
| Date Field         | journal-entry-date                   |
| Voucher Type       | journal-entry-type                   |
| Voucher No         | journal-entry-number                 |
| Reference          | journal-entry-ref                    |
| Narration          | journal-entry-narration              |
| Attachments        | journal-entry-attachments            |
| Line Items Table   | journal-entry-lines-table            |
| Line Add Btn       | journal-entry-add-line-btn           |
| Save Btn           | journal-entry-save-btn               |
| Draft Btn          | journal-entry-draft-btn              |
| Cancel             | journal-entry-cancel-btn             |
| Delete             | journal-entry-delete-btn             |
| Audit Log Modal    | journal-entry-audit-modal            |
| Error              | journal-entry-error                  |
| Loading            | journal-entry-loading                |

---

## 148. Voucher List

### Route

`/finance/vouchers/list`  
**Parent Navigation:** “Voucher & Transaction Entry” → “Voucher List”

### Purpose

List and filter all journal voucher records for searching, reporting, or batch actions.

**PRD References:** "Voucher List" (FR-302, FR-304, FR-314)

### Access Roles

- **Standard User**
- **Finance Supervisor**
- **Finance Administrator**

### UI Structure

- Header: Voucher List
- Filter Bar:
    - Date from/to
    - Voucher Type (dropdown)
    - Status (all/posted/draft/void)
    - Account (lookup)
    - Search (voucher number/reference)
    - Export/Print

- Table:

| Date       | Voucher Type | Number | Account | Amount | Status | Entered By | Attachments | Actions |

Actions per row:

- View (opens display modal/page)
- Edit (if status=draft or role)
- Delete (if allowed, with confirm)
- Print single voucher

#### Bulk Actions

- Checkbox (left); can bulk-delete, bulk-export (permitted by role)
- Download all as Excel/PDF

#### Empty/Error/Loading

As before.

### Test Identifiers

Prefix: `voucher-list-`, e.g.  
`voucher-list-table`, `voucher-list-row`, `voucher-list-edit-btn`, etc.

---

## 149. Voucher Help

### Route

`/finance/vouchers/help`  
**Parent Navigation:** "Voucher & Transaction Entry" → "Voucher Help"

### Purpose

Interactive, modal or panel-based help system linked directly from voucher forms/tables; explains voucher actions, field meanings, error explanations.

**PRD References:** "Voucher Help" (FR-321, BR-295)

### Access Roles

- **All user roles**

### UI Structure

- Panel/modal overlays current form
- Tabbed help: "Add/Edit Voucher", "Uploading Attachments", "Common Errors", "Field Descriptions"
- Search bar for help topics
- Expand/collapse sections (accordion cards)
- Reset function: “Reset Voucher Form” (only visible if invoked from journal entry — calls parent reset)
- Link: "Contact Support"

### Test Identifiers

Prefix: `voucher-help-`, e.g.  
`voucher-help-modal`, `voucher-help-topic-list`, `voucher-help-reset-btn`, `voucher-help-tab`, etc.

---

## 150. Account Voucher Display

### Route

`/finance/vouchers/view/:id`  
**Parent Navigation:** “Voucher & Transaction Entry” → “Account Voucher Display”

### Purpose

Read-only display of all voucher fields, lines, attachments, and approval/audit info. Used from list/table “View” button or cross-link from Ledger.

**PRD References:** "Account Voucher Display" (FR-305, FR-318)

### Access Roles

- **Standard User**
- **Finance Supervisor**
- **Finance Administrator**

### UI Structure

- Glass card, 720px.
- Sections:  
    - Voucher Info (Header: number, type, date, status, entered by, attachments)
    - Table: line items (debits/credits)
    - Reference, Narration (show all fields)
    - Audit trail (who created/edited/posted, timestamped)
    - Attachment preview: inline for PDFs/images, download for other types

- Actions:

    - Print
    - Download as PDF
    - View/change attachments (download only)
    - View audit history (modal or lower panel)

### Test Identifiers

Prefix: `voucher-display-`, e.g.  
`voucher-display-root`, `voucher-display-info`, `voucher-display-lines-table`, `voucher-display-attachments`, `voucher-display-print-btn`, etc.

---

## COVERAGE CHECK

| #   | Screen Name                       | Status   |
|-----|-----------------------------------|----------|
| 126 | Account Tree in List View         | ✅ covered |
| 127 | AcheadList Report                 | ✅ covered |
| 128 | Ledger Report                     | ✅ covered |
| 129 | Ledger_ActualDate Report          | ✅ covered |
| 130 | Ledger_Pdc Report                 | ✅ covered |
| 131 | LedgerSummary Report              | ✅ covered |
| 132 | Auto Receipt Entry                | ✅ covered |
| 133 | Payment Entry                     | ✅ covered |
| 134 | Receipt Entry                     | ✅ covered |
| 135 | Petty Cash Entry                  | ✅ covered |
| 136 | Payment Finalization              | ✅ covered |
| 137 | Pending Add Payment               | ✅ covered |
| 138 | Pending Add Receipt               | ✅ covered |
| 139 | Receipts (Report)                 | ✅ covered |
| 140 | Payments (Report)                 | ✅ covered |
| 141 | Receipt-Backup (Report)           | ✅ covered |
| 142 | Pdc_Issue_Voucher (Report)        | ✅ covered |
| 143 | Pdc_Receipt_Voucher (Report)      | ✅ covered |
| 144 | Bulk Journal Voucher Entry        | ✅ covered |
| 145 | Bulk PDC Receipt Transactions     | ✅ covered |
| 146 | Bulk PDC Transactions             | ✅ covered |
| 147 | Journal Entry                     | ✅ covered |
| 148 | Voucher List                      | ✅ covered |
| 149 | Voucher Help                      | ✅ covered |
| 150 | Account Voucher Display           | ✅ covered |

---

# FRONTEND_SPEC.md

---

# Journal Voucher Report

## Route Path

`/reports/vouchers/journal-voucher`

## Purpose

Display a tabular report of all journal voucher entries (financial transactions) created within a specified period, supporting filtering by date and account, export, and print.

**PRD Reference:** Voucher & Transaction Entry, Financial Reporting & Statements  
**Screens:** Journal Voucher Report  
**Access Roles:** Supervisor, Finance Administrator

---

## Layout & Structure

- **Card**: Glassmorphic main container with border and subtle shadow.
- **Section Title:** "Journal Voucher Report" (`text-h2`)
- **Filter Bar:** Row of filters above the table: date range, account (dropdown/autocomplete), voucher type.
- **Actions (top right):** [Primary] Export (dropdown: Excel/PDF/CSV), [Secondary] Print, [Secondary] Refresh.

### Table

| Column | Label | Details |
|---|---|---|
| 1 | Voucher No | Voucher identifier, right-aligned, monospace. |
| 2 | Date | Transaction date, formatted YYYY-MM-DD. |
| 3 | Account | Account name, uses resolved name via view. |
| 4 | Description | Transaction/remarks summary. |
| 5 | Debit | Amount, align right, color: default. |
| 6 | Credit | Amount, align right, color: default. |
| 7 | Created By | Username (resolved). |
| 8 | Status | [Badge] Draft / Approved / Posted. |
| 9 | Actions | [View] (eye icon), [Export] (download icon, row-level), all accessible via keyboard. |

#### Empty State

> “No journal voucher entries match your filters.”  
Centered, muted text, accompanied by documentation link (`data-testid='journal-voucher-empty-state'`).

#### Loading State

- Shimmer skeleton for filters and table rows (minimum 8 rows).

#### Error State

- Banner at top:  
  - “Failed to load journal voucher report.”  
  - [Retry] (button, testid: `journal-voucher-error-retry`).

---

## Filter Fields

| Field | Type | Label | Options/Widget | Validation | Required | Error Message |
|---|---|---|---|---|---|---|
| Start Date | date | "Start Date" | Date picker | Must not be after End Date | Yes | "Start date required" |
| End Date | date | "End Date" | Date picker | Must not precede Start Date | Yes | "End date required" |
| Account | autocomplete | "Account" | Searchable, chooses from account master | —  | No | — |
| Voucher Type | dropdown | "Voucher Type" | All types in system (e.g., 'Journal', 'Receipt', etc.) | — | No | — | 

#### Actions:

- [Apply Filters] (Primary button in filter bar; triggers API reload, testid: `journal-voucher-filter-apply`)
- [Reset] (text button, testid: `journal-voucher-filter-reset`) — resets all filters to default.

---

## Export & Print

- Export dropdown: download as Excel, PDF, or CSV (`data-testid='journal-voucher-export-excel'`, etc.).
- Print: Print-friendly page layout, with branding and filter summary.
- All exported files reflect the current filter state.

---

## Table Features

- Column sorting (Date, Voucher No, Debit, Credit).
- Pagination: 25 rows/page, paged at bottom.
- Keyboard accessible: Tab to each row and action.
- Hover state: 5% opacity darken.
- Visual distinction for Draft (muted badge) vs. Approved/Posted (colored).

---

## API Integration

- On mount and filter change, calls:
    - `GET /api/v1/vouchers/list?type=journal&dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD&accountId=&voucherType=`
    - On export, passes current params to `/api/v1/vouchers/list/export?format=pdf|excel|csv...`
- On View: navigates to voucher details page (`/vouchers/:id`).

---

## Form Validations

- Date range required.
- If Start > End: error below End Date ("End date cannot be before start date" — `data-testid='journal-voucher-date-error'`).
- Account & Voucher Type optional.

---

## Test Identifiers

- `journal-voucher-title`
- `journal-voucher-filter-start-date`
- `journal-voucher-filter-end-date`
- `journal-voucher-filter-account`
- `journal-voucher-filter-voucher-type`
- `journal-voucher-filter-apply`
- `journal-voucher-filter-reset`
- `journal-voucher-table`
- `journal-voucher-table-row`
- `journal-voucher-empty-state`
- `journal-voucher-error-banner`
- `journal-voucher-error-retry`
- `journal-voucher-export-excel`
- `journal-voucher-export-pdf`
- `journal-voucher-export-csv`
- `journal-voucher-print`
- `journal-voucher-actions-view`
- `journal-voucher-actions-export-row`
- `journal-voucher-pagination`

---

# Daily Voucher List Report

## Route Path

`/reports/vouchers/daily-list`

## Purpose

Lists all voucher entries created/posted on a selected date for daily reconciliation and review.

**PRD Reference:** Voucher & Transaction Entry  
**Screens:** Daily Voucher List Report  
**Access Roles:** Standard User, Supervisor

---

## Layout & Structure

- **Glass-card**: Standard report container.
- **Section Title:** "Daily Voucher List Report" (`text-h2`)
- **Date Picker Bar:** At the top, select a date (defaults to today).
- **Table**:
    | # | Voucher No | Date | Account | Description | Debit | Credit | Status | Actions |
    |---|----|----|---|---|---|---|---|---|
    - All columns align to design system, number columns right-aligned.
    
- [Export], [Print], [Refresh] actions in top right.

### Empty State / Loading State / Error State

- As above.

---

## Filter Fields

| Field | Type | Label | Validation | Required | Error |
|---|---|---|---|---|---|
| Date | date | "Date" | Must be valid date | Yes | "Please select a date" |

- [Apply] Primary button, testid: `daily-voucherlist-apply`
- [Reset] text button, testid: `daily-voucherlist-reset`

---

## Table Features

- Row click: opens voucher detail.
- Sortable by Voucher No, Debit, Credit.
- Pagination (25/page).

---

## API Integration

- `GET /api/v1/vouchers/list?date=YYYY-MM-DD`
- Export triggers: `GET /api/v1/vouchers/list/export?date=YYYY-MM-DD&format=pdf|csv|excel`
- Print uses visible table.

---

## Test Identifiers

- `daily-voucherlist-title`
- `daily-voucherlist-date-picker`
- `daily-voucherlist-apply`
- `daily-voucherlist-reset`
- `daily-voucherlist-table`
- `daily-voucherlist-table-row`
- `daily-voucherlist-empty-state`
- `daily-voucherlist-loading`
- `daily-voucherlist-error-banner`
- `daily-voucherlist-export-excel`
- `daily-voucherlist-export-pdf`
- `daily-voucherlist-export-csv`
- `daily-voucherlist-print`
- `daily-voucherlist-pagination`

---

# Voucher Details List Report

## Route Path

`/reports/vouchers/detail-list`

## Purpose

Detailed breakdown of individual voucher entry lines (line items), with filters for richer reconciliation.

**PRD Reference:** Voucher & Transaction Entry  
**Screens:** Voucher Details List Report  
**Access Roles:** Finance Supervisor, Administrator

---

## Layout & Structure

- **Card Glass**: Title: "Voucher Details List"
- **Filter Row:** Date range, Account, Voucher Type (searchable), Debits/Credits >, =, < (quick filters).
- **Table**:
    - Voucher No
    - Date
    - Line No
    - Account
    - Description
    - Debit
    - Credit
    - Narration
    - Reference
    - Status
    - Actions ([View], [Export-row])

- Export / Print at top right.

---

## Filter Fields

| Field | Type | Label | Validation | Required | Error |
|---|---|---|---|---|---|
| Start Date | date | "Start Date" | Not after End | Yes | "Required" |
| End Date | date | "End Date" | Not before Start | Yes | "Required" |
| Account | autocomplete | "Account" | — | No | — |
| Voucher Type | dropdown | "Voucher Type" | — | No | — |
| Min Debit | number | "Min Debit" | ≥ 0 | No | — |
| Min Credit | number | "Min Credit" | ≥ 0 | No | — |

- [Apply Filters] (primary), [Reset]
- All errors by input field.

---

## Table Features

- Sortable (all main columns).
- Paged (25/pg).
- Row [View] icon: opens voucher view.

---

## API Integration

- `GET /api/v1/vouchers/detail-list?...`
- Export/download: `/api/v1/vouchers/detail-list/export?...`

---

## Test Identifiers

- `voucher-detailslist-title`
- `voucher-detailslist-filter-start`
- `voucher-detailslist-filter-end`
- `voucher-detailslist-filter-account`
- `voucher-detailslist-filter-vtype`
- `voucher-detailslist-filter-min-debit`
- `voucher-detailslist-filter-min-credit`
- `voucher-detailslist-apply`
- `voucher-detailslist-reset`
- `voucher-detailslist-table`
- `voucher-detailslist-empty`
- `voucher-detailslist-error`
- `voucher-detailslist-export-excel`
- `voucher-detailslist-export-pdf`
- `voucher-detailslist-print`
- `voucher-detailslist-pagination`

---

# Voucher List Report

## Route Path

`/reports/vouchers/list`

## Purpose

List all vouchers in a period, supporting smart filtering, export, and print, for audit, finance, and general review.

**PRD Reference:** Voucher & Transaction Entry  
**Screens:** Voucher List Report  
**Access Roles:** Finance Supervisor, Administrator

---

## Layout & Structure

- **Glass-card** main layout.
- **Section Title:** "Voucher List Report" (`text-h2`)
- **Filters:** Date range, Account, Voucher Type, Voucher Status, Created By.
- **Actions**: [Export], [Print].
- **Table**:
    - Voucher No (sortable)
    - Date
    - Type
    - Account
    - Description/Narration
    - Debit
    - Credit
    - Status (Badge)
    - Created By
    - Approved By
    - Actions ([View], [Export Row])

- [Apply], [Reset] filter buttons.

---

### Table Features

- 25 rows per page, paged.
- Row click or View: opens details.
- State badges color-coded: Draft (muted), Posted (success), Approved (info), Rejected (error), etc.

---

## Empty/Error/Loading State

- Empty: "No vouchers found."
- Loading: table skeletons.
- Error: Banner with [Retry].

---

## API Integration

- `GET /api/v1/vouchers/list?...`

---

## Test Identifiers

- `voucherlist-title`
- `voucherlist-date-from`
- `voucherlist-date-to`
- `voucherlist-account`
- `voucherlist-type`
- `voucherlist-status`
- `voucherlist-created-by`
- `voucherlist-apply`
- `voucherlist-reset`
- `voucherlist-table`
- `voucherlist-table-row`
- `voucherlist-empty`
- `voucherlist-error-banner`
- `voucherlist-error-retry`
- `voucherlist-export-excel`
- `voucherlist-export-pdf`
- `voucherlist-print`
- `voucherlist-pagination`

---

# Report Selection and Generation

## Route Path

`/reports/`

## Purpose

Central entry point to select, search, and generate all available financial or management reports.  
Allows users to select a report, define its parameters, generate a preview, export, or schedule it.

**PRD Reference:** Financial Reporting & Statements  
**Screens:** Report Selection and Generation  
**Access Roles:** Standard User, Supervisor, Administrator (varying access by report)

---

## Layout & Structure

- **Glass container**: Centralized, max-width 900px.
- **Section Title:** “All Reports” (`text-h1`)
- **Report Search Bar:** At top, allows search by report name (fuzzy), filter by type (dropdown: Financial, Management, Inventory), and favorite/star (toggle) for quick access.
- **Report List Table:**
    - Report Name
    - Report Type
    - Description
    - [Preview] action (primary/link)
    - [Export] (secondary, icon menu)
    - [Schedule] (if permitted, icon)
- Empty state: “No reports found. Adjust your filters.”
- Loading: shimmer-skeleton for rows and action icons.

---

## Report Parameter Modal

- [When user clicks Preview or Export]:
    - Show modal sheet (glass, shadow) with:
        - Report Title and Description
        - Filter parameters for the report (e.g., date range, accounts)
        - [Preview], [Export] buttons

---

## Actions

- [Preview] — loads preview for given filters.
- [Export] menu — dropdown: Excel, PDF, CSV.
- [Schedule] (if permitted) — opens schedule modal.
- [Clear Filters] button in search/filter row.

---

## API Integration

- `GET /api/v1/reports/list` (lists all available)
- `GET /api/v1/reports/:reportId/preview?...params`
- `GET /api/v1/reports/:reportId/export?...params&format=...`
- `POST /api/v1/reports/:reportId/schedule` (if user has permission)

---

## Form Validations

- Every required parameter for each report is validated per report definition.
- Display field-level error message (always below input).

---

## Test Identifiers

- `reportsel-title`
- `reportsel-search-input`
- `reportsel-type-filter`
- `reportsel-favorite-toggle`
- `reportsel-list-table`
- `reportsel-list-row`
- `reportsel-preview-btn`
- `reportsel-export-btn`
- `reportsel-schedule-btn`
- `reportsel-clear-filters`
- `reportsel-empty`
- `reportsel-error`
- `reportsel-report-param-modal`
- `reportsel-report-param-form`
- `reportsel-report-preview-loader`
- `reportsel-report-export-menu`
- `reportsel-schedule-modal`

---

# Group Ledger Summary

## Route Path

`/reports/ledger/group-summary`

## Purpose

Show summarized financial positions for all defined account groups in the ledger/chart of accounts.

**PRD Reference:** Financial Reporting & Statements, Ledger & Account Management  
**Screens:** Group Ledger Summary  
**Access Roles:** Supervisor, Administrator

---

## Layout & Structure

- **Section Title:** "Group Ledger Summary"
- **Date Range Filter:** Start Date (default: start of period), End Date, [Apply], [Reset]
- **Account Group Dropdown:** Multi-select, lists all groups (with search).
- **Table:**
    - Group Name
    - Opening Balance
    - Debits Sum
    - Credits Sum
    - Closing Balance
    - # of Accounts
    - Last Activity Date
    - Actions ([View details]: navigates to group/accounts list)

---

## API Integration

- `GET /api/v1/ledger/account-summaries?group=...&dateFrom=...&dateTo=...`
- Export: `/api/v1/ledger/account-summaries/export?...`

---

## Table Features

- Sortable (by Opening/Closing balance)
- Expand/collapse: clicking group loads detail view (in-line or modal, design system appropriate)
- Totals row at foot.

---

## Test Identifiers

- `ledgergroup-title`
- `ledgergroup-datefrom`
- `ledgergroup-dateto`
- `ledgergroup-groups-filter`
- `ledgergroup-apply`
- `ledgergroup-reset`
- `ledgergroup-table`
- `ledgergroup-expand-row`
- `ledgergroup-row-details`
- `ledgergroup-totals-row`
- `ledgergroup-export-excel`
- `ledgergroup-export-pdf`
- `ledgergroup-print`
- `ledgergroup-pagination`
- `ledgergroup-empty`
- `ledgergroup-error`

---

# Report Preview Screen

## Route Path

`/reports/preview/:reportId`

## Purpose

Allow users to view a render/preview of any selected report before export or print, with context-aware filter parameters and UI to refilter as needed.

**PRD Reference:** Financial Reporting & Statements  
**Screens:** Report Preview Screen  
**Access Roles:** All roles (according to report access)

---

## Layout & Structure

- **Section Title:** "Report Preview: [Report Name]"
- **Filter Summary:** Display currently applied filters at the top (badges, pill style).
- **Preview Display:** 
    - PDF-style preview window of the report.
    - [Expand/Minimize] buttons (testid: `report-preview-expand`)
    - [Download] drop-down (Excel/PDF/CSV)
    - [Print] button
    - [Back to All Reports] (text link)
- If too much data: show warning “Preview limited to N records.”

---
 
## Error & Loading States

- Skeleton for preview window (gray bars/paper effect).
- If preview renders fail: “Could not generate report preview. Please check filters and try again.”

---

## Test Identifiers

- `report-preview-title`
- `report-preview-filters`
- `report-preview-pdf-view`
- `report-preview-expand`
- `report-preview-download-menu`
- `report-preview-print-btn`
- `report-preview-back-link`
- `report-preview-error`
- `report-preview-skeleton`
- `report-preview-limit-warning`

---

# Ledger Short Report

## Route Path

`/reports/ledger/short`

## Purpose

Show concise table of ledger accounts and major transactions for quick review, with quick filter fields.

**PRD Reference:** Financial Reporting & Statements, Ledger & Account Management  
**Screens:** Ledger Short Report  
**Access Roles:** User, Supervisor

---

## Layout & Structure

- **Section Title:** "Ledger Short Report"
- **Filter bar:** Account dropdown (searchable, multiple), Date Range, Account Type selector, [Apply Filters], [Reset]
- **Table:**
    - Account
    - Transaction Date
    - Description
    - Debit
    - Credit
    - Balance
    - Reference
- Footer: total row (Debits, Credits, Balance).

---

## Table Features

- Sortable by account/date.
- Row Details: Click shows transaction summary in modal or drawer.
- Pagination, 25/pg.

---

## API Integration

- `GET /api/v1/ledger/account-summaries?...`
- `GET /api/v1/ledger/account-short-report?...`

---

## Test Identifiers

- `ledgershort-title`
- `ledgershort-account-filter`
- `ledgershort-date-from`
- `ledgershort-date-to`
- `ledgershort-type-filter`
- `ledgershort-apply`
- `ledgershort-reset`
- `ledgershort-table`
- `ledgershort-row-details`
- `ledgershort-totals-row`
- `ledgershort-pagination`
- `ledgershort-empty`
- `ledgershort-error`
- `ledgershort-export`
- `ledgershort-print`

---

# Voucher Details Report

## Route Path

`/reports/vouchers/detail`

## Purpose

Detailed listing of every voucher and its line details, supports advanced filters for in-depth reconciliation and auditing.

**PRD Reference:** Financial Reporting & Statements  
**Screens:** Voucher Details Report  
**Access Roles:** Supervisor, Administrator

---

## Layout & Structure

- **Section Title:** "Voucher Details Report"
- **Filters:** Date Range, Account, Voucher Number, Debit/Credit min/max, Line Status, Narrative text search.
- **Table:**
    - Voucher No
    - Date
    - Account
    - Debit
    - Credit
    - Line Status
    - Reference
    - Narration
    - Actions ([View])

---

## Table Features

- Inline search (narration).
- Column sorting.
- Pagination.
- Totals footer.
- [Export], [Print] top right.

---

## Test Identifiers

- `voucherdet-title`
- `voucherdet-filters`
- `voucherdet-table`
- `voucherdet-pagination`
- `voucherdet-total-row`
- `voucherdet-export`
- `voucherdet-print`
- `voucherdet-loading`
- `voucherdet-empty`
- `voucherdet-error`

---

# LedgerSummary

## Route Path

`/reports/ledger/summary`

## Purpose

Presents a summary of debit, credit, and balance positions for selected accounts, per period.

**PRD Reference:** Financial Reporting & Statements, Ledger & Account Management  
**Screens:** LedgerSummary  
**Access Roles:** Standard User, Supervisor, Administrator

---

## Layout & Structure

- **Section Title:** "Ledger Summary Report"
- **Filters:** Account Range (start/end, auto-suggest), Date Range.
- **Actions:** [Export], [Print].
- **Table:**
    - Account
    - Opening Balance
    - Period Debits
    - Period Credits
    - Closing Balance
    - Last Transaction Date

---

## Table Features

- Sortable by balance/date.
- Totals/Footer.
- Pagination.

---

## Test Identifiers

- `ledgersummary-title`
- `ledgersummary-accountfrom`
- `ledgersummary-accountto`
- `ledgersummary-datefrom`
- `ledgersummary-dateto`
- `ledgersummary-apply`
- `ledgersummary-reset`
- `ledgersummary-table`
- `ledgersummary-total-row`
- `ledgersummary-export`
- `ledgersummary-print`
- `ledgersummary-pagination`
- `ledgersummary-error`
- `ledgersummary-empty`

---

# AgeWise

## Route Path

`/reports/ledger/agewise`

## Purpose

Show outstanding balances categorized by aging period (buckets: 0-15, 16-30, ... >360 days) for receivables/payables.

**PRD Reference:** Financial Reporting & Statements  
**Screens:** AgeWise  
**Access Roles:** Supervisor, Administrator

---

## Layout & Structure

- **Section Title:** "Age-Wise Outstanding Report"
- **Filters:**
    - Account/Head (autocomplete, multi-select)
    - As of Date
    - Customer/Supplier toggle
    - [Apply], [Reset]
- **Table:**
    - Account/Customer/Supplier Name
    - 0-15 days
    - 16-30 days
    - 31-45 days
    - 46-60 days
    - 61-90 days
    - 91-120 days
    - 121-360 days
    - >360 days
    - Total
    - Contact Number (hidden in export if no permission)
    - Actions ([View details])

---

## Table Features

- Sortable by account/name/total/age bucket.
- Pagination.
- Totals/footer.
- [Export], [Print].

---

## Test Identifiers

- `agewise-title`
- `agewise-accountfilter`
- `agewise-asof`
- `agewise-custsupp-toggle`
- `agewise-apply`
- `agewise-reset`
- `agewise-table`
- `agewise-total-row`
- `agewise-export`
- `agewise-print`
- `agewise-pagination`
- `agewise-detail-row`
- `agewise-error`
- `agewise-empty`

---

# TrialBalance

## Route Path

`/reports/ledger/trial-balance`

## Purpose

Show a trial balance across all ledgers/accounts for period-end closing and financial review.

**PRD Reference:** Financial Reporting & Statements  
**Screens:** TrialBalance  
**Access Roles:** Supervisor, Administrator

---

## Layout & Structure

- **Section Title:** "Trial Balance"
- **Filters:** Date Range, Account Range.
- **Actions:** [Export], [Print].
- **Table:**
    - Account
    - Debit
    - Credit
    - Balance
- Footer: totals validation: debit == credit.

---

## Table Features

- Sortable.
- [Expand] on Account shows line details in sub-table/modal.

---

## Test Identifiers

- `trialbalance-title`
- `trialbalance-datefrom`
- `trialbalance-dateto`
- `trialbalance-accountfrom`
- `trialbalance-accountto`
- `trialbalance-apply`
- `trialbalance-reset`
- `trialbalance-table`
- `trialbalance-expand-row`
- `trialbalance-total-row`
- `trialbalance-export`
- `trialbalance-print`
- `trialbalance-pagination`
- `trialbalance-error`
- `trialbalance-empty`

---

# PandLReport

## Route Path

`/reports/ledger/pandl`

## Purpose

Display the profit and loss statement for a period, with income and expense categories, subtotals, and grand totals.

**PRD Reference:** Financial Reporting & Statements  
**Screens:** PandLReport  
**Access Roles:** Supervisor, Administrator

---

## Layout & Structure

- **Section Title:** "Profit and Loss Statement"
- **Filters:** Period (date range, or by financial year/quarter), Branch (if multi-branch), Account Group, [Apply], [Reset].
- **Actions:** [Export], [Print], [Compare Periods] (optional).
- **Table**:  
    - Category | Account | Amount
    - Two main sections: Income, Expenses (each subtotaled)
    - Net Profit/Loss line.
- [Drilldown] on account/category opens detail modal or expands line.

---

## Table Features

- Sticky header.
- Expandable lines (drilldown).
- Totals in bold.

---

## Test Identifiers

- `pandl-title`
- `pandl-period-selector`
- `pandl-account-group`
- `pandl-branch`
- `pandl-apply`
- `pandl-reset`
- `pandl-table`
- `pandl-table-income`
- `pandl-table-expense`
- `pandl-netprofit`
- `pandl-export`
- `pandl-print`
- `pandl-compare`
- `pandl-drilldown`
- `pandl-error`
- `pandl-empty`

---

# VoucherDetailsList

## Route Path

`/reports/vouchers/line-details`

## Purpose

Complete listing (with filters) of all voucher lines for refined review and export.

**PRD Reference:** Financial Reporting & Statements  
**Screens:** VoucherDetailsList  
**Access Roles:** Supervisor, Administrator

---

## Layout & Structure

- Section Title, filter bar (date range, account, type, min/max debit/credit, free text search)
- Table:
    - Voucher No
    - Line No
    - Account
    - Narration
    - Debit
    - Credit
    - Status
    - Reference

---

## Actions

- [Export] (Excel/PDF/CSV), [Print]

---

## Table Features

- Per-row View action.
- Pagination.
- Totals row.

---

## Test Identifiers

- `voucherdetailslist-title`
- `voucherdetailslist-filters`
- `voucherdetailslist-table`
- `voucherdetailslist-table-row`
- `voucherdetailslist-empty`
- `voucherdetailslist-totals`
- `voucherdetailslist-pagination`
- `voucherdetailslist-export-excel`
- `voucherdetailslist-export-pdf`
- `voucherdetailslist-print`
- `voucherdetailslist-error`

---

# SalesAnalysis

## Route Path

`/reports/sales/analysis`

## Purpose

Comprehensive summary and drill-down reporting on sales, by time, product/category, region, or staff.

**PRD Reference:** Financial Reporting & Statements, Order & Sales Management  
**Screens:** SalesAnalysis  
**Access Roles:** Standard User, Supervisor

---

## Layout & Structure

- Title: "Sales Analysis"
- Filter/Dimension Bar: Date range, Group by (Selector: Product, Category, Salesperson, Customer, Region), [Apply]
- Chart: By default, bar chart showing metric over chosen breakdown.
- Table:
    - Metric fields depend on grouping, e.g.  
        - Product/Category: { Product Name, Qty Sold, Revenue, Margin, Returns }
        - Staff: { Name, Sales Count, Net Sales }
    - “Drilldown” button for each row to see transactions/lines in that bucket.

---

## Actions

- [Export] (Excel/PDF/CSV), [Print]
- Chart/Graph toggle.

---

## Table Features

- Sortable, expandable.
- Chart reflects same filter as table.

---

## Test Identifiers

- `salesanalysis-title`
- `salesanalysis-filter-datefrom`
- `salesanalysis-filter-dateto`
- `salesanalysis-filter-groupby`
- `salesanalysis-table`
- `salesanalysis-chart`
- `salesanalysis-empty`
- `salesanalysis-export`
- `salesanalysis-print`
- `salesanalysis-drilldown`
- `salesanalysis-error`
- `salesanalysis-pagination`

---

# SalesRegister

## Route Path

`/reports/sales/register`

## Purpose

Sequential listing of all sales transactions in a period (across customers/products), for tracking and review.

**PRD Reference:** Financial Reporting & Statements, Order & Sales Management  
**Screens:** SalesRegister  
**Access Roles:** User, Supervisor

---

## Layout & Structure

- **Section Title:** "Sales Register"
- **Filter bar:** Date range, Customer (autocomplete), Product (autocomplete), [Apply]/[Reset].
- **Table:**
    - Sale No
    - Date
    - Customer Name
    - Product
    - Quantity
    - Sale Value
    - Status (badge)
    - Action ([View details])

---

## Table Features

- Sortable columns
- Pagination
- Row click = details view

---

## Actions

- [Export], [Print]

---

## Test Identifiers

- `salesregister-title`
- `salesregister-datefrom`
- `salesregister-dateto`
- `salesregister-customer`
- `salesregister-product`
- `salesregister-table`
- `salesregister-pagination`
- `salesregister-export`
- `salesregister-print`
- `salesregister-drilldown`
- `salesregister-detailmodal`
- `salesregister-empty`
- `salesregister-error`

---

# Profitandlossfrm

## Route Path

`/reports/ledger/profit-loss-detailed`

## Purpose

Show a detailed, formatted profit & loss statement (classic format; all lines/items expanded), supporting filtering, printing, and exporting.

**PRD Reference:** Financial Reporting & Statements  
**Screens:** Profitandlossfrm  
**Access Roles:** Supervisor, Administrator

---

## Layout & Structure

- **Section Title:** "Detailed Profit and Loss Statement"
- **Filter bar:** Date/period selector, Account Group, Branch.
- **Table:** (2 columns, left: category/account, right: value)
    - Grouped: Income, Expenses, Non-Operating, Taxes, Net Profit/Loss.
    - Expand/collapse by default (fully expanded).
- [Export], [Print], [Back]

---

## Table Features

- Hierarchical indentation for groups/items.
- Totals bolded and sticky.
- All data accounted for (un-categorized lines shown as "Other").

---

## Test Identifiers

- `pandlform-title`
- `pandlform-filter-date`
- `pandlform-filter-group`
- `pandlform-filter-branch`
- `pandlform-apply`
- `pandlform-table`
- `pandlform-group-income`
- `pandlform-group-expenses`
- `pandlform-totals`
- `pandlform-export`
- `pandlform-print`
- `pandlform-back`
- `pandlform-error`
- `pandlform-empty`

---

# a1

## Route Path

`/reports/summary/a1`

## Purpose

Displays summary snapshot or ad-hoc financial test report as defined by management.  
**PRD Reference:** Financial Reporting & Statements  
**Screens:** a1  
**Access Roles:** Administrator

---

## Layout & Structure

- **Section Title:** "Financial Summary Snapshot (A1)"
- **Only available to admin.**
- Filter bar (if any): custom; always display as passed from backend config.
- Table: Key financial metrics (metrics, period, value; always read from API schema).
- [Export], [Print] actions.

---

## Test Identifiers

- `a1-title`
- `a1-filter-form`
- `a1-table`
- `a1-export`
- `a1-print`
- `a1-error`
- `a1-empty`

---

# AcheadList

## Route Path

`/reports/ledger/account-head-list`

## Purpose

Comprehensive listing of all account heads with details for audit/reference.

**PRD Reference:** Financial Reporting & Statements, Ledger & Account Management  
**Screens:** AcheadList  
**Access Roles:** Accountant, Supervisor, Auditor

---

## Layout & Structure

- Section Title: "Account Head List / Chart of Accounts"
- Filter: Search box (account name/code), Group, Status (active/all), Type (Parent/Child).
- Table:
    - Account Head
    - Account Code
    - Parent Head
    - Group
    - Type
    - Status (active/inactive)
    - Created Date
    - Last Edited Date

---

## Table Features

- Sortable, paged
- [Export], [Print] buttons.

---

## Test Identifiers

- `acheadlist-title`
- `acheadlist-filter-search`
- `acheadlist-filter-group`
- `acheadlist-table`
- `acheadlist-export`
- `acheadlist-print`
- `acheadlist-pagination`
- `acheadlist-empty`
- `acheadlist-error`

---

# AcSrlList-MissingList

## Route Path

`/reports/ledger/account-serials-missing`

## Purpose

Highlights gaps/inconsistencies in account serial numbers for quality checks.

**PRD Reference:** Ledger & Account Management, Financial Reporting  
**Screens:** AcSrlList-MissingList  
**Access Roles:** Administrator

---

## Layout & Structure

- Section Title: “Missing Account Serials”
- No filters. Table only.
    - Serial Number
    - Account Name
    - Account Code
    - Issue (gap/skipped/missing)
- [Export], [Print].

---

## Test Identifiers

- `acsrlmissing-title`
- `acsrlmissing-table`
- `acsrlmissing-export`
- `acsrlmissing-print`
- `acsrlmissing-empty`
- `acsrlmissing-error`

---

# AcSrlList

## Route Path

`/reports/ledger/account-serial-list`

## Purpose

Complete, ordered list of all account serial numbers for audit and reconciliation.

**PRD Reference:** Ledger & Account Management  
**Screens:** AcSrlList  
**Access Roles:** Supervisor, Administrator

---

## Layout & Structure

- Section Title: "Account Serial Numbers"
- Table:
    - Serial Number
    - Account Name
    - Account Code
    - Created Date
- [Export], [Print]

---

## Test Identifiers

- `acsrl-title`
- `acsrl-table`
- `acsrl-export`
- `acsrl-print`
- `acsrl-empty`
- `acsrl-error`

---

# AcStatement-Preprented

## Route Path

`/reports/ledger/account-statement/branded`

## Purpose

Generate preformatted account statements (with company branding, layout) for mailing or archival.

**PRD Reference:** Ledger & Account Management, Financial Reporting  
**Screens:** AcStatement-Preprented  
**Access Roles:** Standard User, Supervisor

---

## Layout & Structure

- Section Title: "Account Statement (Preprinted Format)"
- Filter bar: Account (search), Period (date/month), Statement Type (Summary/Detailed)
- Button: [Generate Statement] (primary)
- Upon generate: show PDF-style preview in glass container with company header.
- [Download] (PDF, Excel), [Print]
- "To be sent to" information displayed at top (for mailing).

---

## Test Identifiers

- `acstmtpre-title`
- `acstmtpre-account`
- `acstmtpre-period`
- `acstmtpre-type`
- `acstmtpre-generate`
- `acstmtpre-preview`
- `acstmtpre-download-pdf`
- `acstmtpre-download-excel`
- `acstmtpre-print`
- `acstmtpre-preview-skeleton`
- `acstmtpre-error`
- `acstmtpre-empty`

---

# AcStatementPlainPaper

## Route Path

`/reports/ledger/account-statement/plain`

## Purpose

As above, but with minimal/clean format for plain-paper printing.

**PRD Reference:** Ledger & Account Management, Financial Reporting  
**Screens:** AcStatementPlainPaper  
**Access Roles:** Standard User, Supervisor

---

## Layout & Structure

- Section Title: "Account Statement (Plain Paper Format)"
- Filter bar same as above.
- Preview: simple, monochrome, glass card. Download/Print as above.
- Watermark: None.

---

## Test Identifiers

- `acstmtplain-title`
- `acstmtplain-account`
- `acstmtplain-period`
- `acstmtplain-type`
- `acstmtplain-generate`
- `acstmtplain-preview`
- `acstmtplain-download-pdf`
- `acstmtplain-download-excel`
- `acstmtplain-print`
- `acstmtplain-preview-skeleton`
- `acstmtplain-error`
- `acstmtplain-empty`

---

# AdditionalRemarksReports

## Route Path

`/reports/additional-remarks`

## Purpose

Delivers reports and insights on additional remarks added to orders or transactions, filterable by date, user, and transaction.

**PRD Reference:** Document & Attachment Management  
**Screens:** AdditionalRemarksReports  
**Access Roles:** Supervisor, Administrator

---

## Layout & Structure

- Section Title: "Additional Remarks Report"
- Filter bar: Date Range, User (dropdown), Transaction/Order (autocomplete)
- [Export], [Print] actions.
- Table:
    - Date Added
    - Order/Transaction No.
    - Remark (preview — up to 100 chars, with tooltip/full on click)
    - User
    - Related Customer/Supplier
    - Actions ([Drilldown] to order)

---

## Table Features

- Drilldown/expand for full remark and order context.
- Pagination.

---

## Test Identifiers

- `addremarks-title`
- `addremarks-daterange`
- `addremarks-user`
- `addremarks-orderno`
- `addremarks-apply`
- `addremarks-table`
- `addremarks-export`
- `addremarks-print`
- `addremarks-empty`
- `addremarks-error`
- `addremarks-drilldown`

---

# agewisesummary

## Route Path

`/reports/ledger/agewise-summary`

## Purpose

Quick summary of balances by age range for outstanding management.

**PRD Reference:** Financial Reporting & Statements  
**Screens:** agewisesummary  
**Access Roles:** Supervisor

---

## Layout & Structure

- Section Title: "Age-wise Balance Summary"
- Filter: As-Of Date, Account/Customer/Supplier, Type (all/customer/supplier)
- Table:
    - Name/Account
    - 0-15 days … >360 days (each as column)
    - Outstanding Total

- [Export], [Print]

---

## Table Features

- Totals row.
- Pagination as needed.

---

## Test Identifiers

- `agewisesumm-title`
- `agewisesumm-asof`
- `agewisesumm-type`
- `agewisesumm-apply`
- `agewisesumm-table`
- `agewisesumm-total-row`
- `agewisesumm-export`
- `agewisesumm-print`
- `agewisesumm-pagination`
- `agewisesumm-empty`
- `agewisesumm-error`

---

# COVERAGE CHECK

| Screen Name                       | Status   |
|-----------------------------------|----------|
| Journal Voucher Report            | ✅ covered |
| Daily Voucher List Report         | ✅ covered |
| Voucher Details List Report       | ✅ covered |
| Voucher List Report               | ✅ covered |
| Report Selection and Generation   | ✅ covered |
| Group Ledger Summary              | ✅ covered |
| Report Preview Screen             | ✅ covered |
| Ledger Short Report               | ✅ covered |
| Voucher Details Report            | ✅ covered |
| LedgerSummary                     | ✅ covered |
| AgeWise                           | ✅ covered |
| TrialBalance                      | ✅ covered |
| PandLReport                       | ✅ covered |
| VoucherDetailsList                | ✅ covered |
| SalesAnalysis                     | ✅ covered |
| SalesRegister                     | ✅ covered |
| Profitandlossfrm                  | ✅ covered |
| a1                                | ✅ covered |
| AcheadList                        | ✅ covered |
| AcSrlList-MissingList             | ✅ covered |
| AcSrlList                         | ✅ covered |
| AcStatement-Preprented            | ✅ covered |
| AcStatementPlainPaper             | ✅ covered |
| AdditionalRemarksReports          | ✅ covered |
| agewisesummary                    | ✅ covered |

---

# FRONTEND_SPEC.md

---

## 176. CBPBook

### Route Path
`/reports/cbp-book`

### Purpose
View and export the Cash Book and Bank Book transactions for a selected date range and account, with filtering and export options. Used for reconciliation and audit support.

### PRD Reference
- Section: 4.9 Banking & Reconciliation
- User Stories: US-217, US-225, US-235, US-237
- Functional Requirements: FR-217, FR-225, FR-235, FR-237

### Access Roles
- Accountant (View, export)
- Finance Supervisor (Full access)
- Finance Administrator (Full access)

### Layout & Components

- **Page Title:** `Cash Book / Bank Book (CBPBook)`
- **Filter Panel:**
  - Account (Bank/Cash) (Autocomplete select, required)
  - Transaction type (Dropdown: Bank, Cash, All; required)
  - Date From (Date picker, required)
  - Date To (Date picker, required)
  - Search/Filter Button (primary)
  - Reset Filters Button
- **Table:**
  - Columns (from ACDETAILSSQL fields):  
    - Date
    - Voucher No.
    - Account Name
    - Narration
    - Debit
    - Credit
    - Running Balance
    - Type
    - Reference No.
    - Cheque No.
    - Status (Paid/Pending/Cleared)
  - Row hover highlights
  - Pagination (server-side, 20/50/100 per page)
- **Export & Print:**
  - Export as PDF
  - Export as Excel
  - Export as CSV
  - Print Report
- **Empty State:**  
  - "No transactions found for the filtering criteria."
- **Error State:**  
  - API/network error: show error banner above table with retry button.

### Actions Available
- Filter/search (`data-testid="cbpbook-filter-apply"`)
- Reset filters (`data-testid="cbpbook-filter-reset"`)
- Export as PDF/Excel/CSV (`data-testid="cbpbook-export-pdf"`, `data-testid="cbpbook-export-excel"`, `data-testid="cbpbook-export-csv"`)
- Print (`data-testid="cbpbook-print"`)

### Field Validations
- From/To dates required, From ≤ To
- Account is required
- Transaction type is required

### Loading/Skeleton State
- Placeholder skeleton rows matching the table columns.
- Filter panel is disabled while loading.

### API Integration
- Backend: GET `/api/v1/banking/cash-bank-details`
- Query params: account, fromDate, toDate, type
- Exports via `/api/v1/banking/cash-bank-details/export` (format param)

### Test Identifiers
- `cbpbook-filter-account`
- `cbpbook-filter-type`
- `cbpbook-filter-from`
- `cbpbook-filter-to`
- `cbpbook-filter-apply`
- `cbpbook-filter-reset`
- `cbpbook-table`
- `cbpbook-table-row`
- `cbpbook-export-pdf`
- `cbpbook-export-excel`
- `cbpbook-export-csv`
- `cbpbook-print`
- `cbpbook-skeleton`
- `cbpbook-error-banner`
- `cbpbook-empty-state`

---

## 177. Company_Report_Header

### Route Path
`/admin/company-report-header`

### Purpose
Configure and preview the company header block used in all generated/exported reports (brand, address, fiscal info).

### PRD Reference
- Section: 4.13 Financial Reporting & Statements
- User Stories: US-272
- Functional Requirements: FR-272

### Access Roles
- Administrator (Full access)

### Layout & Components

- **Form Card (Glass Panel)**
  - Company Name (Text input, required)
  - Address Line 1 (Text input, required)
  - Address Line 2 (Text input, optional)
  - Address Line 3 (Text input, optional)
  - Phone (Text input, optional)
  - Fax (Text input, optional)
  - Email (Text input, optional)
  - Fiscal Information (Text area, optional)
  - Company Logo (Image upload with preview, supports PNG/JPEG/SVG, max 256KB)
  - Save Button (primary)
- **Preview Panel:**  
  - Shows the rendered report header block exactly as it would appear on exported reports
- **Validation/Error**
  - Required fields (company name, at least one address line)
  - Logo: too large/invalid type, show error below field
- **Action Buttons**
  - Save (`data-testid="company-header-save"`)
  - Preview (`data-testid="company-header-preview"`)
  - Reset (`data-testid="company-header-reset"`)

### API Integration
- GET `/api/v1/admin/company-header`
- PUT `/api/v1/admin/company-header`
- POST `/api/v1/admin/company-header/logo`

### Test Identifiers
- `company-header-form`
- `company-header-companyname`
- `company-header-address1`
- `company-header-address2`
- `company-header-address3`
- `company-header-phone`
- `company-header-fax`
- `company-header-email`
- `company-header-fiscal`
- `company-header-logo-upload`
- `company-header-preview`
- `company-header-save`
- `company-header-reset`
- `company-header-error`
- `company-header-skeleton`

---

## 178. Copy of DOPrnt

### Route Path
`/sales/delivery-notes/:id/copy`

### Purpose
Generate and display a printable/exportable copy of a Delivery Order (DO) note, matching the previously issued original but marked as a copy.

### PRD Reference
- Section: 4.6 Order & Sales Management
- User Stories: US-122, US-125
- Functional Requirements: FR-145, FR-148

### Access Roles
- Sales Staff (View/print/export own delivery)
- Sales Supervisor (All owned)
- Administrator (All)

### Layout & Components

- **DO Copy PDF-Preview (Glass Sheet)**
  - Header: "Delivery Note (Copy)" (with watermarked "COPY", faded/glass effect)
  - Company header (from Company_Report_Header config)
  - DO Number, Customer Name, Date, Vehicle (if applicable)
  - Address, Contact, Delivery Details
  - Items Table:
    - S. No.
    - Item Description
    - Quantity
    - Unit
    - Remarks
  - Footer (prepared by, delivered by, sign fields, notes if any)
- **Actions**
  - Export as PDF
  - Print
  - Back to Delivery Orders List

### Loading/Skeleton State
- Progress spinner while fetching DO details.
- Error banner on failed load.

### Test Identifiers
- `doprntcopy-preview`
- `doprntcopy-export-pdf`
- `doprntcopy-print`
- `doprntcopy-back`
- `doprntcopy-skeleton`
- `doprntcopy-error`

---

## 179. Copy of SaleBillPrnt-back

### Route Path
`/sales/invoices/:id/copy-backup`

### Purpose
Generate and display a printable/exportable backup copy of a previously issued Sale Bill, matching original layout, and clearly marked as a non-original backup.

### PRD Reference
- Section: 4.6 Order & Sales Management, 4.13 Financial Reporting & Statements
- User Stories: US-280, US-125, US-278
- Functional Requirements: FR-145, FR-148, FR-278

### Access Roles
- Sales Staff
- Sales Supervisor
- Administrator

### Layout & Components

- **Invoice Copy PDF-Preview**
  - Banner: "Invoice (Backup Copy)" (clear watermark)
  - Company Report Header
  - Invoice No., Date, Customer Name, Address, Phone
  - Itemized Table:
    - S. No.
    - Item/Service
    - Description
    - Quantity
    - Unit Price
    - Total Price
  - Subtotals, Taxes, Discounts, Grand Total
  - Payment Terms, Authorized Signature blocks
- **Actions**
  - Export as PDF
  - Print
  - Back to Invoices List

### Loading/Error/Empty
- Skeleton placeholder
- Error banner on fetch failure

### Test Identifiers
- `salebillprntback-preview`
- `salebillprntback-export-pdf`
- `salebillprntback-print`
- `salebillprntback-back`
- `salebillprntback-skeleton`
- `salebillprntback-error`

---

## 180. CreditNote

### Route Path
`/finance/credit-notes`

### Purpose
Browse, filter, export, and print credit notes issued to customers or suppliers for sales returns or adjustments.

### PRD Reference
- Section: 4.13 Financial Reporting & Statements
- User Stories: US-215, US-269
- Functional Requirements: FR-277, FR-328

### Access Roles
- Finance Supervisor (Full access)
- Administrator (Full access)
- Standard User (View)

### Layout & Components

- **Page Title:** "Credit Notes"
- **Filter Bar:** (above table)
  - Credit Note No. (Text input)
  - Party Name (Autocomplete customer/supplier)
  - Date From (Date picker)
  - Date To (Date picker)
  - Apply Filter Button (primary)
  - Export PDF/Excel
- **Table:**
  - Credit Note No.
  - Date
  - Party Name
  - Linked Invoice No.
  - Reason
  - Amount
  - Status (Issued/Voided)
  - Actions: View | Print | (if allowed: Delete/Cancel)
- **Empty/Error:**  
  - No credit notes found for criteria.
  - Error banner for load/export errors.
- **Actions:**
  - Filter (`data-testid="creditnote-filter-apply"`)
  - Export PDF/Excel (`data-testid="creditnote-export-pdf"`, `data-testid="creditnote-export-excel"`)
  - Print single (`data-testid="creditnote-table-print"`)
  - View single (`data-testid="creditnote-table-view"`)

### API Integration
- GET `/api/v1/finance/credit-notes`
- Export endpoints

### Test Identifiers
- `creditnote-filter-no`
- `creditnote-filter-party`
- `creditnote-filter-from`
- `creditnote-filter-to`
- `creditnote-filter-apply`
- `creditnote-table`
- `creditnote-table-row`
- `creditnote-export-pdf`
- `creditnote-export-excel`
- `creditnote-table-view`
- `creditnote-table-print`
- `creditnote-skeleton`
- `creditnote-error`

---

## 181. CustomerBillDetailedSummary

### Route Path
`/reports/customer-bill-detailed-summary`

### Purpose
Display a detailed summary of all bills/invoices issued to each customer, with payment allocation and outstanding amounts, for audit and reconciliation.

### PRD Reference
- Section: 4.13 Financial Reporting & Statements
- User Stories: US-273, US-280, US-283
- Functional Requirements: FR-333, FR-334, FR-335

### Access Roles
- Supervisor
- Administrator

### Layout & Components

- **Page Title:** "Customer Bill Detailed Summary"
- **Filters:**
  - Customer (Autocomplete)
  - Date From/To (Date pickers)
  - Invoice Status (Dropdown)
  - Filter/Apply Button
- **Table:**
  - Customer Name
  - Invoice No.
  - Bill Date
  - Amount
  - Amount Received
  - Outstanding
  - Last Payment Date
  - Contact
  - Action: View Bill
- **Export/Print:** PDF, Excel, Print
- **Empty/Error:** Standard.

### Loading
- Table skeleton, filter disabled

### Actions Available
- Search (`data-testid="cusbilldet-filter-apply"`)
- Export/Print
- View Bill

### Test Identifiers
- `cusbilldet-filter-customer`
- `cusbilldet-filter-from`
- `cusbilldet-filter-to`
- `cusbilldet-filter-status`
- `cusbilldet-filter-apply`
- `cusbilldet-table`
- `cusbilldet-table-view`
- `cusbilldet-export-pdf`
- `cusbilldet-export-excel`
- `cusbilldet-print`
- `cusbilldet-skeleton`
- `cusbilldet-error`

---

## 182. CustomerBillWisePending-old

### Route Path
`/reports/customer-billwise-pending-old`

### Purpose
Show customer-wise pending bills (legacy format) for reference and historical comparison.

### PRD Reference
- Section: 4.13 Financial Reporting & Statements
- User Stories: US-273, US-280, US-333
- Functional Requirements: FR-333, FR-340

### Access Roles
- Supervisor
- Administrator

### Layout & Components

- **Title:** "Customer Billwise Pending (Old Format)"
- **Filters:**
  - Customer (Autocomplete)
  - Up to Date (Date picker)
  - Filter
  - Export/Print
- **Table:**
  - Customer Name
  - Invoice/Bill No.
  - Bill Date
  - Total Amount
  - Amount Received
  - Balance
- **Empty/Error/Export:** Standard.

### Test Identifiers
- `cbillpendingold-filter-customer`
- `cbillpendingold-filter-date`
- `cbillpendingold-filter-apply`
- `cbillpendingold-table`
- `cbillpendingold-export-pdf`
- `cbillpendingold-export-excel`
- `cbillpendingold-print`
- `cbillpendingold-skeleton`
- `cbillpendingold-error`

---

## 183. CustomerBillWisePending

### Route Path
`/reports/customer-billwise-pending`

### Purpose
Show pending invoices for every customer (current format), for receivable tracking and collection management.

### PRD Reference
- As above.

### Access Roles
- Supervisor
- Administrator

### Layout & Components

- Similar to screen 182, but using current table/view/procedure.
- Title: "Customer Billwise Pending"
- Filters: identical.
- Table: as above; ensure current field set.
- Actions/Exports: identical.

### Test Identifiers
- As above, but prefix `cbillpending-`
  - (e.g., `cbillpending-table`, `cbillpending-export-pdf`...)

---

## 184. CustomerBillWisePending1

### Route Path
`/reports/customer-billwise-pending1`

### Purpose
Alternative layout for pending customer bills (per legacy system, must be maintained for compliance).

### PRD Reference
- Section: 4.13
- Functional Requirements: FR-333

### Access Roles
- Supervisor
- Administrator

### Layout & Components

- As 183 but with the alternative columns/layout as per the existing report/table.
- Both table fields and exports MUST match the legacy version from the current DB view.

### Test Identifiers
- `cbillpending1-filter-customer`
- `cbillpending1-filter-date`
- etc.

---

## 185. CustomerBillWiseSummary-New

### Route Path
`/reports/customer-billwise-summary-new`

### Purpose
Exportable summary of all customer bills with current status, presented in new layout for contemporary reporting.

### PRD Reference
- Section: 4.13
- Functional Requirements: FR-340

### Access Roles
- Supervisor
- Administrator

### Layout & Components

- **Title:** "Customer Billwise Summary (New)"
- **Filters:** Customer, Status, Date From/To
- **Table:**
  - Customer Name
  - No. of Bills
  - Total Amount
  - Total Received
  - Outstanding
  - Last Invoice Date
  - Last Payment Date
- **Export/Print:** Standard.

### Test Identifiers
- `cbillsummarynew-*` for filter/table/actions

---

## 186. CustomerBillWiseSummary

### Route Path
`/reports/customer-billwise-summary`

### Purpose
Customer billing summary grouped by period, status, etc. (classic/legacy layout).

### PRD Reference
- Section: 4.13

### Access Roles
- Supervisor
- Administrator

### Layout & Components

- As in 185, but field order and content must match the legacy reporting screen/view.
- All fields and export formats as per existing DB view.

### Test Identifiers
- `cbillsummary-*` variants

---

## 187. CustomerBillWiseSummary_advisorwise

### Route Path
`/reports/customer-billwise-summary-advisor`

### Purpose
Summary of bills/outstandings, grouped/broken down by sales advisor for performance management.

### PRD Reference
- Section: 4.13
- Functional Requirements: FR-340, FR-333

### Access Roles
- Supervisor
- Administrator

### Layout & Components

- **Title:** "Customer Billwise Summary — Advisorwise"
- **Filters:** Advisor (autocomplete), Date range
- **Table**:
  - Advisor Name
  - Customer Name
  - No. of Bills
  - Total Invoiced
  - Total Received
  - Outstanding
- **Export/Print:** Standard.

### Test Identifiers
- `cbillsummary-adv-*`

---

## 188. CustomerList

### Route Path
`/customers`

### Purpose
Browse, search, and export all customers (master list). Supports navigation to add/edit/view pages per CRUD COMPLETENESS RULE.

### PRD Reference
- Section: 4.3 Customer & Supplier Management
- User Stories: US-61, US-46, US-50

### Access Roles
- Standard User (view, create)
- Supervisor (view, edit, deactivate)
- Administrator (full)

### Layout & Components

- **Title:** "Customers"
- **Filter/Search Bar:**  
  - Name/email/phone (free text)
  - Area (autocomplete)
  - Status (Active/Inactive dropdown)
  - Date Added (range picker)
  - Search/Reset
- **Add New Button**:  
  - Primary CTA ("+ New Customer"), top-right, navigates to `/customers/new`
- **Export**  
  - PDF, Excel, CSV
- **Table:**
  - Customer Name
  - Account Code
  - Phone 1
  - Email
  - Area
  - Status
  - Date Added
  - Actions:
    - View (`/customers/:id`)
    - Edit (`/customers/:id/edit`)
    - Deactivate
- **Bulk Select Box** (multi-row; for export only; not for delete, per PRD)
- **Pagination** (server-side)
- **Empty/Error:** Standard per DS

#### NOTE:  
- Consolidated: List + search + filter + export + navigation to entry.  
- Entry/Add/Edit covered in `FRONTEND_SPEC_Part4` (not repeated here, as per consolidation and assignment).

### Table Column Requirements
- All validated, required fields per PRD and CustomerSql view
- No raw IDs — always friendly names

### Actions Available
- Search/Filter (`data-testid="customerlist-filter-apply"`)
- Reset filters
- Export
- Add new (`data-testid="customerlist-add"`)
- Per-row: Edit, View, Deactivate

### Test Identifiers
- `customerlist-filter-name`
- `customerlist-filter-area`
- `customerlist-filter-status`
- `customerlist-filter-date`
- `customerlist-filter-apply`
- `customerlist-table`
- `customerlist-table-view`
- `customerlist-table-edit`
- `customerlist-table-deactivate`
- `customerlist-export-pdf`
- `customerlist-export-excel`
- `customerlist-export-csv`
- `customerlist-add`
- `customerlist-pagination`
- `customerlist-skeleton`
- `customerlist-error`
- `customerlist-empty`

---

## 189. CustomerOurstandgReport_SalesMan

### Route Path
`/reports/customer-outstanding-salesmanwise`

### Purpose
Show, filter, and export customer outstanding balances grouped by sales advisor/salesman.

### PRD Reference
- Section: 4.13 Financial Reporting & Statements
- User Stories: US-273, US-333
- Functional Requirements: FR-333, FR-340

### Access Roles
- Supervisor
- Administrator

### Layout & Components

- **Title:** "Customer Outstanding (Salesmanwise)"
- **Filter Bar:**  
  - Salesman (autocomplete, optional)
  - As Of Date (date picker, required)
  - Filter/Reset, Export PDF/Excel
- **Table Columns:**  
  - Salesman Name
  - Customer Name
  - Invoice No.
  - Invoice Date
  - Invoice Amount
  - Amount Received
  - Outstanding
  - Age in Days
- **Exports/Print:** PDF/Excel
- **Empty/Error:** Standard

### Test Identifiers
- `custoutstanding-sm-filter-salesman`
- `custoutstanding-sm-filter-date`
- `custoutstanding-sm-filter-apply`
- `custoutstanding-sm-table`
- `custoutstanding-sm-export-pdf`
- `custoutstanding-sm-export-excel`
- `custoutstanding-sm-print`
- `custoutstanding-sm-skeleton`
- `custoutstanding-sm-error`
- `custoutstanding-sm-empty`

---

## 190. CustomerVisit

### Route Path
`/reports/customer-visit`

### Purpose
Display the log and summary of customer visits for sales/service tracking, filterable by customer, date, or advisor.

### PRD Reference
- Section: 4.13 Financial Reporting & Statements
- User Stories: US-283

### Access Roles
- Standard User (view)
- Supervisor (view/export)
- Administrator (full)

### Layout & Components

- **Page Title:** "Customer Visit Report"
- **Filters:**  
  - Customer (autocomplete)
  - Date Range (pickers)
  - Sales/Service Advisor (autocomplete)
- **Table:**
  - Customer Name
  - Visit Date
  - Purpose/Remarks
  - Assigned Person (advisor/owner)
  - Contact (phone/email)
  - Visit Count
- **Export/Print:** PDF/Excel/Print
- **Empty/Error:** Standard

### Test Identifiers
- `customervisit-filter-customer`
- `customervisit-filter-from`
- `customervisit-filter-to`
- `customervisit-filter-advisor`
- `customervisit-filter-apply`
- `customervisit-table`
- `customervisit-export-pdf`
- `customervisit-export-excel`
- `customervisit-print`
- `customervisit-skeleton`
- `customervisit-error`
- `customervisit-empty`

---

## 191. DailyVoucherList

### Route Path
`/finance/vouchers/daily`

### Purpose
Show, search, and export a list of all journal vouchers posted for a given day.

### PRD Reference
- Section: 4.12 Voucher & Transaction Entry, 4.13 Reporting
- User Stories: US-260, US-307
- Functional Requirements: FR-307, FR-266

### Access Roles
- Standard User (view)
- Supervisor (full)
- Administrator (full)

### Layout & Components

- **Title:** "Daily Voucher List"
- **Date Filter:** (required)
  - Date (picker)
  - Account (autocomplete, optional)
  - Apply/Reset
- **Table:**
  - Voucher No.
  - Date
  - Account Name
  - Narration
  - Debit
  - Credit
  - Posted By
  - Actions: View | Print
- **Export:** PDF/Excel/CSV
- **Print:** Per voucher and full list
- **Empty/Error:** Standard

### Test Identifiers
- `voucherlist-filter-date`
- `voucherlist-filter-account`
- `voucherlist-filter-apply`
- `voucherlist-table`
- `voucherlist-table-view`
- `voucherlist-table-print`
- `voucherlist-export-pdf`
- `voucherlist-export-excel`
- `voucherlist-export-csv`
- `voucherlist-print`
- `voucherlist-skeleton`
- `voucherlist-empty`
- `voucherlist-error`

---

## 192. DebitNote

### Route Path
`/finance/debit-notes`

### Purpose
Browse, filter, print, and export debit notes issued (for supplier returns/adjustments).

### PRD Reference
- Section: 4.13 Financial Reporting & Statements
- Functional Requirements: FR-277, FR-328

### Access Roles
- Supervisor (full)
- Administrator (full)
- Standard User (view)

### Layout & Components

- **Title:** "Debit Notes"
- **Filters:**  
  - Debit Note No.
  - Supplier Name
  - Date From/To
  - Filter/Reset
  - Export/Print
- **Table:**
  - Debit Note No.
  - Date
  - Supplier
  - Linked Invoice
  - Reason
  - Amount
  - Status (Issued/Voided)
  - Actions: View | Print
- **Exports:** PDF/Excel/CSV

### Test Identifiers
- `debitnote-filter-no`
- `debitnote-filter-supplier`
- `debitnote-filter-from`
- `debitnote-filter-to`
- `debitnote-filter-apply`
- `debitnote-table`
- `debitnote-table-view`
- `debitnote-table-print`
- `debitnote-export-pdf`
- `debitnote-export-excel`
- `debitnote-export-csv`
- `debitnote-print`
- `debitnote-skeleton`
- `debitnote-error`
- `debitnote-empty`

---

## 193. DEPOSIT_CERTIFICATE_TEMPLATE

### Route Path
`/finance/deposit-certificates/:id/print`

### Purpose
Generate and print official deposit certificates for customer deposits, using the current company header and required legal verbiage.

### PRD Reference
- Section: 4.13 Financial Reporting & Statements
- User Stories: US-294, US-340

### Access Roles
- Supervisor (print/export own)
- Administrator (full)

### Layout & Components

- **Certificate View (Glass Print Card):**
  - Company Report Header
  - Certificate Title: "Deposit Certificate"
  - Certificate Number, Date, Customer Name, Address
  - Deposit Amount (in numerals & words)
  - Statement (verbiage: receipt of deposit from X, date, purpose, company authority)
  - Authorized signature/footer
  - Print/Export PDF Buttons

### Test Identifiers
- `depositcertificate-preview`
- `depositcertificate-print`
- `depositcertificate-export-pdf`

---

## 194. DischargeReceipt

### Route Path
`/finance/discharge-receipt/:id/print`

### Purpose
Generate, print, and export discharge receipts for final settlement/closure of a transaction (e.g., on delivery or contract closing).

### PRD Reference
- Section: 4.13 Financial Reporting & Statements
- User Stories: US-294, US-340

### Access Roles
- Supervisor
- Administrator

### Layout & Components

- **Receipt Print View:**
  - Company Report Header
  - Receipt Title: "Discharge Receipt"
  - Receipt Number, Date, Party Name
  - Amount Paid (in number/words)
  - Narrative text for full and final discharge
  - Authorized signature/footer
  - Print/Export PDF Buttons

### Test Identifiers
- `dischargereceipt-preview`
- `dischargereceipt-print`
- `dischargereceipt-export-pdf`

---

## 195. DiscountSummaryReport

### Route Path
`/reports/discount-summary`

### Purpose
Show summary report of discounts applied per customer, product, or document over a selected period.

### PRD Reference
- Section: 4.13 Financial Reporting & Statements
- Functional Requirements: FR-328

### Access Roles
- Supervisor
- Administrator

### Layout & Components

- **Title:** "Discount Summary"
- **Filters:**  
  - Customer/Product (dropdowns, multi-select)
  - Date From/To
  - Invoice/Sale Bill No. (optional)
  - Apply Filter
  - Export/Print
- **Table:**
  - Customer Name / Product Name
  - Invoice No.
  - Discount Type/Reason
  - Discount Amount
  - Net Amount After Discount
- **Exports:** PDF/Excel/CSV

### Test Identifiers
- `discountsumm-filter-customer`
- `discountsumm-filter-product`
- `discountsumm-filter-from`
- `discountsumm-filter-to`
- `discountsumm-filter-billno`
- `discountsumm-filter-apply`
- `discountsumm-table`
- `discountsumm-export-pdf`
- `discountsumm-export-excel`
- `discountsumm-export-csv`
- `discountsumm-print`
- `discountsumm-skeleton`
- `discountsumm-empty`
- `discountsumm-error`

---

## 196. DOPrnt-old

### Route Path
`/sales/delivery-notes/:id/print-old`

### Purpose
Display and print archived legacy-format delivery note (matched to historic delivery notes for compliance).

### PRD Reference
- Section: 4.6 Order & Sales Management
- Functional Requirements: FR-145, FR-148

### Access Roles
- Administrator

### Layout & Components

- **Printable DO View**
  - Company Report Header (historic format if possible)
  - DO No., Date, Customer Name, Address, Contact
  - Table of Items: S. No., Description, Quantity, Unit
  - Legacy Notes, signatures (if present)
  - Print/Export PDF

### Test Identifiers
- `doprntold-preview`
- `doprntold-print`
- `doprntold-export-pdf`

---

## 197. DOPrnt

### Route Path
`/sales/delivery-notes/:id/print`

### Purpose
Generate and print/export the current-format delivery note for a completed sale/order.

### PRD Reference
- Section: 4.6 Order & Sales Management
- Functional Requirements: FR-145, FR-148

### Access Roles
- Sales Staff (own), Supervisor (team/all), Administrator (all)

### Layout & Components

- **Printable DO Card:** See Copy of DOPrnt (178), but in current format.
- Company Report Header, labeled "Delivery Note"
- All required DO/invoice info and customer delivery data
- Table of Items as above
- Print/Export PDF

### Test Identifiers
- `doprnt-preview`
- `doprnt-print`
- `doprnt-export-pdf`

---

## 198. DOPrntold

### Route Path
`/sales/delivery-notes/:id/print-legacy`

### Purpose
Display/print earliest legacy format of delivery note (if DOPrnt-old is “mid-legacy”, this covers the oldest template).

### PRD Reference
- Section: 4.6 Order & Sales Management

### Access Roles
- Administrator

### Layout & Components

- As 196, but template and header block match oldest system version

### Test Identifiers
- `doprntlegacy-preview`
- `doprntlegacy-print`
- `doprntlegacy-export-pdf`

---

## 199. DoRegister

### Route Path
`/sales/delivery-notes/register`

### Purpose
List and export all issued delivery notes (DOs), filterable by customer, status, date, etc.

### PRD Reference
- Section: 4.6 Order & Sales Management
- User Stories: US-146, US-125, US-145

### Access Roles
- Sales Staff (own), Supervisor, Administrator (full)

### Layout & Components

- **Title:** "Delivery Order Register"
- **Filter/Search Bar:**  
  - DO Number (text)
  - Customer (autocomplete)
  - Date Range (pickers)
  - Status (dropdown: Pending/Delivered/Voided)
  - Filter/Reset, Export
- **Table Columns:**
  - DO Number
  - Date
  - Customer Name
  - Items Count
  - Status
  - Linked Invoice/Bill No.
  - Action: View/Print/Export
- **Export:** PDF/Excel/CSV
- **Empty/Loading/Error:** Standard

### Test Identifiers
- `doregister-filter-do`
- `doregister-filter-customer`
- `doregister-filter-from`
- `doregister-filter-to`
- `doregister-filter-status`
- `doregister-filter-apply`
- `doregister-table`
- `doregister-table-view`
- `doregister-table-print`
- `doregister-export-pdf`
- `doregister-export-excel`
- `doregister-export-csv`
- `doregister-print`
- `doregister-skeleton`
- `doregister-error`
- `doregister-empty`

---

## 200. EmployeeAttendanceList

### Route Path
`/hr/attendance/list`

### Purpose
Display/export detailed attendance records for employees within a date range, with search/filter.

### PRD Reference
- Section: 4.3 Customer & Supplier Management
- User Stories: US-41

### Access Roles
- Supervisor (own dept)
- Administrator (full)
- HR User (view)

### Layout & Components

- **Page Title:** "Employee Attendance List"
- **Filters:**  
  - Employee (autocomplete)
  - Department (autocomplete)
  - Date Range (pickers)
  - Status (dropdown: Present, Absent, Late)
  - Filter/Reset, Export/Print
- **Table Columns:**
  - Employee Name
  - Department
  - Date
  - Attendance Status
  - In Time
  - Out Time
  - Remarks
- **Export/Print:** PDF, Excel, Print

### Test Identifiers
- `empattend-filter-employee`
- `empattend-filter-dept`
- `empattend-filter-from`
- `empattend-filter-to`
- `empattend-filter-status`
- `empattend-filter-apply`
- `empattend-table`
- `empattend-export-pdf`
- `empattend-export-excel`
- `empattend-print`
- `empattend-skeleton`
- `empattend-error`
- `empattend-empty`

---

## COVERAGE CHECK

| Screen Name                             | Status  |
|----------------------------------------- |---------|
| CBPBook                                 | ✅ covered |
| Company_Report_Header                   | ✅ covered |
| Copy of DOPrnt                          | ✅ covered |
| Copy of SaleBillPrnt-back               | ✅ covered |
| CreditNote                              | ✅ covered |
| CustomerBillDetailedSummary             | ✅ covered |
| CustomerBillWisePending-old             | ✅ covered |
| CustomerBillWisePending                 | ✅ covered |
| CustomerBillWisePending1                | ✅ covered |
| CustomerBillWiseSummary-New             | ✅ covered |
| CustomerBillWiseSummary                 | ✅ covered |
| CustomerBillWiseSummary_advisorwise     | ✅ covered |
| CustomerList                            | ✅ covered |
| CustomerOurstandgReport_SalesMan        | ✅ covered |
| CustomerVisit                           | ✅ covered |
| DailyVoucherList                        | ✅ covered |
| DebitNote                               | ✅ covered |
| DEPOSIT_CERTIFICATE_TEMPLATE            | ✅ covered |
| DischargeReceipt                        | ✅ covered |
| DiscountSummaryReport                   | ✅ covered |
| DOPrnt-old                              | ✅ covered |
| DOPrnt                                  | ✅ covered |
| DOPrntold                               | ✅ covered |
| DoRegister                              | ✅ covered |
| EmployeeAttendanceList                  | ✅ covered |

---

---

# FRONTEND_SPEC.md

---

## 201. EmployeeList

### Route: `/hr/employees`

#### Purpose
View, search, filter, and export all company employee records. Supports review of employment data and HR listing functions.

#### PRD References
- Feature: Personnel and HR utilities
- US: US-41, US-34 | FR: FR-39, FR-40
- Section: Personnel and HR utilities, User & Role Management

#### Access Roles
- Supervisor: View, search, filter, export, print
- Administrator: Full access (incl. export, print)

---

### Page Structure

#### a) Header
- Title: `Employee List`
- Description: "View, filter, and export all company employees. For a printable staff summary, use the Export or Print buttons."

#### b) Filter Bar (above table)
- Input: Name/email search (`label: Search by name or email`)
- Input: Department dropdown (`label: Department`)
  - Autopopulate from HR/department master list
- Input: Role dropdown (`label: Role`)
  - Populated from available HR roles (`Employee`, `Manager`, etc.)
- Input: Status dropdown (`label: Employment Status`)
  - Choices: `Active`, `Inactive`, `Terminated`
- Input: Date of Joining: date picker (`label: Joining Date`)
- Primary Button: `+ New Employee` (navigates to `/hr/employees/new`)

#### c) Table (`employee-table`)
- Columns (All columns sortable, except Actions):
  | Column                   | Field                | Type         |
  |--------------------------|----------------------|--------------|
  | Name                     | EmpName              | string       |
  | Department               | Department           | string       |
  | Designation/Role         | Designation, Role    | string       |
  | Phone                    | tel1, telMob         | string       |
  | Email                    | [if present]         | string       |
  | Status                   | Active, Cancelled    | status tag   |
  | Date of Joining          | DOJ                  | Date         |
  | Last Updated             | UpdatedDt            | Date         |
  | Actions                  | Edit, View           | Button group |

- Row click: opens Employee Edit Form (`/hr/employees/:id`)

#### d) Bulk Actions
- Export (CSV, Excel, PDF)
- Print Employee List (opens print modal)
- Bulk select via checkboxes (for future batch HR actions)

#### e) Pagination
- Standard TanStack Query pagination controls at footer.
- Page size: 20 default, options: 20, 50, 100

#### f) Empty State
- "No employees found matching these criteria." (with a suggestion: "Check filters or add a new employee.")

#### g) Loading State
- Table skeleton with shimmer rows, filter/pagination disabled, show loading spinner in table area.

#### h) API Integration
- API: `GET /api/v1/hr/employees` (supports filter query string)

#### i) Error States
- Table error: "There was a problem loading employees." [Retry] button.
- Export failure: Toast "Export failed. Please try again."

---

### Field Validations
- All search fields: no required. Debounced search after 350ms input idle.
- Filters: validated for options.
- Edit/new navigates to Employee Entry Form (see adjacent spec if applicable).

---

### Action Buttons (per row)
- [View] — opens profile summary modal
- [Edit] — navigates to `/hr/employees/:id/edit`
- [Deactivate] (if active) — confirmation modal
- [Reactivate] (if not active) — confirmation modal

---

### Test Identifiers

| Component                         | testid                                              |
|------------------------------------|-----------------------------------------------------|
| Filter - name/email input          | `employee-list-filter-search`                       |
| Filter - department select         | `employee-list-filter-dept`                         |
| Filter - role select               | `employee-list-filter-role`                         |
| Filter - status select             | `employee-list-filter-status`                       |
| Filter - joining date input        | `employee-list-filter-joining-date`                 |
| Bulk - New Employee button         | `employee-list-new-employee-btn`                    |
| Table (main)                       | `employee-table`                                   |
| Table row N                        | `employee-table-row-{n}`                            |
| Table - bulk select                | `employee-table-select-all`/`employee-table-row-sel-{id}`|
| Table - export button(s)           | `employee-table-export-btn-{type}`                  |
| Table - print button               | `employee-table-print-btn`                          |
| Table - actions col (view/edit)    | `employee-table-action-edit-{id}` etc.              |
| Pagination controls                | `employee-table-pagination`                         |
| Loading skeleton                   | `employee-table-loading`                            |
| Empty state                        | `employee-table-empty`                              |
| Error state                        | `employee-table-error`                              |

---

## 202. EstimationReport

### Route: `/jobs/estimations/report`

#### Purpose
Produce a detailed estimation report for service jobs, including customer/account summaries, material/labour costs, and status.

#### PRD References
- Feature: Job, Work Order & Estimation Mgmt
- US: US-102, US-96, US-97 | FR: FR-121, FR-137
- Reporting view

#### Access Roles
- Standard User: View and export their own/department estimations
- Supervisor, Administrator: All reports

---

### Page Structure

#### a) Header
- Title: `Service Estimation Report`
- Description: "Generate and export detailed service estimation report by customer, vehicle, status, period, or advisor."

#### b) Filter Bar
- Input: Customer dropdown (searchable, from resolved list)
- Input: Vehicle dropdown (filtered by customer, optional)
- Input: Estimation Status dropdown (Approved, Pending, Cancelled)
- Input: Advisor (Staff) selector (multi, optional)
- Input: Date Range: From / To picker
- Button: `Run Report` (Primary)

#### c) Report Table (`estimation-report-table`)
- Columns:
  | Column              | Field                   |
  |---------------------|------------------------|
  | Estimation #        | EstimationNo           |
  | Job Card No         | JObCardNo              |
  | Customer            | custname               |
  | Vehicle             | VehNo / Make / ManYear |
  | Advisor             | StaffName              |
  | Date                | BillDt                 |
  | Status              | Approved/Pending       |
  | Total Labour        | totlabour              |
  | Total                | total                  |
  | Nett                | nett                   |
  | Actions             | View (opens estimation detail) |

#### d) Report Export
- Export: Excel, PDF, CSV
- Print: Statement, current view

#### e) Pagination
- Support for large result sets, standard control

#### f) Empty State
- "No estimation records found for these parameters."

#### g) Loading State
- Skeleton rows for full table

#### h) API Integration
- `GET /api/v1/jobs/estimations?filters...` (maps to reporting view or `spGetEstmationDetails`, or suitable reporting endpoint.)

#### i) Error States
- "Could not load estimation report." [Retry]

---

### Validations
- At least one filter field must be filled.
- Date range must be valid.
- Export disables if report is empty.

---

### Action Buttons
- [View] (per row)
- [Export] (above table)
- [Print] (above table)

---

### Test Identifiers

| Component                         | testid                                              |
|------------------------------------|-----------------------------------------------------|
| Filter - customer                  | `estimation-report-filter-customer`                 |
| Filter - vehicle                   | `estimation-report-filter-vehicle`                  |
| Filter - status                    | `estimation-report-filter-status`                   |
| Filter - advisor                   | `estimation-report-filter-advisor`                  |
| Filter - daterange                 | `estimation-report-filter-daterange`                |
| Run report btn                     | `estimation-report-run-report-btn`                  |
| Table                              | `estimation-report-table`                           |
| Row N                              | `estimation-report-table-row-{estimationno}`        |
| Action-View                        | `estimation-report-action-view-{estimationno}`      |
| Export btn                         | `estimation-report-export-btn`                      |
| Print btn                          | `estimation-report-print-btn`                       |
| Loading                            | `estimation-report-loading`                         |
| Empty                              | `estimation-report-empty`                           |
| Error                              | `estimation-report-error`                           |

---

## 203. InsuraceInvReport

### Route: `/finance/invoices/insurance`

#### Purpose
View, filter, and export all invoices related to insurance claims or reimbursements, including claim metadata.

#### PRD References
- Feature: Financial Reporting, Estimation
- US: [invoicing/reporting user stories], [FR: multi-domain reporting]
- Section: Finance, Insurance

#### Access Roles
- Supervisor: View, filter, export all insurance invoices
- Administrator: All access

---

### Page Structure

#### a) Header
- Title: `Insurance Invoice Report`
- Description: "Review and export all insurance-related invoices, claim numbers, and associated customers or vehicles."

#### b) Filter Bar
- Input: Insurance Company (dropdown, from Omasters/InsuranceSql)
- Input: Claim Number (text search)
- Input: Customer (dropdown, search)
- Input: Invoice Period: From/To picker
- Button: `Run Report` (Primary)

#### c) Report Table (`insurance-invoice-table`)
- Columns:
  | Column          | Field              |
  |-----------------|--------------------|
  | Invoice #       | BillNo             |
  | Claim Number    | ClaimNumber        |
  | Invoice Date    | InvoiceDt          |
  | Insurance Co.   | InsuranceCompany   |
  | Estimation #    | EstimationNo       |
  | Customer        | CustomerName       |
  | Amount          | Total/Less/Addition|
  | Vehicle         | VehicleId/EngineNo |
  | Actions         | View/Export        |

#### d) Export/Print Options
- Excel, PDF, CSV
- Print (with static company report header)

#### e) Empty State
- "No insurance invoices found for selected criteria."

#### f) Loading State
- Skeleton rows, disabling export

#### g) API Integration
- `GET /api/v1/reports/invoices/insurance?filters...`

#### h) Error States
- If failed: "Failed to load insurance invoice report." [Retry]

---

### Validations
- No required fields; date range/amount checked for validity.

---

### Action Buttons
- [View] (row)
- [Export] (top right)
- [Print]

---

### Test Identifiers

| Component                         | testid                                              |
|------------------------------------|-----------------------------------------------------|
| Filter - insurance company         | `insurance-invoice-filter-company`                  |
| Filter - claim number              | `insurance-invoice-filter-claim`                    |
| Filter - customer                  | `insurance-invoice-filter-customer`                 |
| Filter - date range                | `insurance-invoice-filter-daterange`                |
| Run report btn                     | `insurance-invoice-run-report-btn`                  |
| Table                              | `insurance-invoice-table`                           |
| Table row N                        | `insurance-invoice-table-row-{billno}`              |
| Action-View                        | `insurance-invoice-action-view-{billno}`            |
| Export btn                         | `insurance-invoice-export-btn`                      |
| Print btn                          | `insurance-invoice-print-btn`                       |
| Loading                            | `insurance-invoice-loading`                         |
| Empty                              | `insurance-invoice-empty`                           |
| Error                              | `insurance-invoice-error`                           |

---

## 204. InvoiceDetailsServ

### Route: `/finance/invoices/services/:invoiceId`

#### Purpose
Show all service invoice details for a given customer invoice — including line breakdowns of services, parts, labor, and taxes.

#### PRD References
- Feature: Service/Job Financials, Invoice drill-down
- US: US-274, US-255, US-211
- Drilldown/detail page, not a standalone list/search

#### Access Roles
- Standard User: May view invoices addressed to their department/role
- Supervisor: All invoices
- Administrator: All invoices

---

### Page Structure

#### a) Header
- Title: `Service Invoice #INV-{invoiceId}`
- Description: "Full detail of all service lines, labor charges, and parts included in this bill."

#### b) Customer & Job Summary (top section/card)
- Customer Name: from API
- Address
- Invoice Date
- Vehicle (if available)
- Advisor/Staff
- Linked Work Order(s) or Job Card(s) (if present)
- Claim Number / Insurance Company (if present)
- Status (paid/outstanding; tag)

#### c) Invoice Line Item Table (`service-invoice-details-table`)
- Columns:
  | Column         | Field         |
  |----------------|--------------|
  | Line #         | (auto)       |
  | Description    | Description  |
  | Qty            | Qty          |
  | Unit           | Denom        |
  | Unit Price     | UnitPrice    |
  | Line Total     | Amount       |
  | Labour         | labouramt    |
  | Type           | ItemType     |

#### d) Invoice Summary Card/Sidebar
- Subtotal
- Discounts
- Taxes
- Additional Charges
- Net Payable

#### e) Export / Print
- Export: PDF, Excel, CSV
- Print: Styled statement

#### f) API Integration
- API: `GET /api/v1/invoices/:id/details/services`

#### g) Loading State
- Summary cards and table skeletons

#### h) Error States
- Top-level "Could not load invoice details."

#### i) Empty State
- Table: "No service lines found on this invoice."

---

### Validations
- None (read-only; disables export if no line items)

---

### Test Identifiers

| Component                         | testid                                              |
|------------------------------------|-----------------------------------------------------|
| Header                            | `service-invoice-details-header`                    |
| Customer/job summary               | `service-invoice-details-summary`                   |
| Table                              | `service-invoice-details-table`                     |
| Table row N                        | `service-invoice-details-table-row-{i}`             |
| Sidebar summary                    | `service-invoice-details-summarycard`               |
| Export btn                         | `service-invoice-details-export-btn`                |
| Print btn                          | `service-invoice-details-print-btn`                 |
| Loading                            | `service-invoice-details-loading`                   |
| Empty                              | `service-invoice-details-table-empty`               |
| Error                              | `service-invoice-details-error`                     |

---

## 205. invoiceDetailsSub

### Route: `/finance/invoices/services/:invoiceId/subdetails`

#### Purpose
Display sub-item breakdowns or additional line-level details for the selected invoice, such as sub-services, nested parts/labour, or split charges.

#### PRD References
- Feature: Invoice/Job Card Detail
- US: US-254, US-255

#### Access Roles
- Supervisor, Administrator (full)
- Standard User (read-only, for their own/assigned invoices)

---

### Page Structure

#### a) Header
- Title: `Invoice #INV-{invoiceId} — Sub-items`
- Subtitle: "Line-item breakdown and allocation for all sub-services or split charges."

#### b) Table (`invoice-details-sub-table`)
- Columns:
  | Column         | Field         |
  |----------------|--------------|
  | Subline #      | (auto)       |
  | Main Service   | ParentDescription (if present) |
  | Sub-item       | Description  |
  | Qty            | Qty          |
  | Unit           | Denom        |
  | Unit Price     | UnitPrice    |
  | Line Total     | Amount       |
  | Remarks        | Remarks      |

#### c) API Integration
- `GET /api/v1/invoices/:invoiceId/details/sub`

#### d) Export/Print (same as parent but only sublines)

#### e) Loading State
- Skeleton table

#### f) Error States
- "Could not load sub-items for this invoice."

#### g) Empty State
- "No sub-item breakdowns available for this invoice."

---

### Validations
- None (read-only/report)

---

### Test Identifiers

| Component                         | testid                                              |
|------------------------------------|-----------------------------------------------------|
| Header                            | `invoice-details-sub-header`                        |
| Table                              | `invoice-details-sub-table`                         |
| Row N                              | `invoice-details-sub-table-row-{i}`                 |
| Export btn                         | `invoice-details-sub-export-btn`                    |
| Print btn                          | `invoice-details-sub-print-btn`                     |
| Loading                            | `invoice-details-sub-loading`                       |
| Empty                              | `invoice-details-sub-empty`                         |
| Error                              | `invoice-details-sub-error`                         |

---

## 206. ItemDOList

### Route: `/inventory/delivery-orders/items`

#### Purpose
Display all inventory items included in delivery orders for audit and logistics tracking.

#### PRD References
- Feature: Inventory, Delivery Tracking
- US: US-159, US-164, US-200

#### Access Roles
- Supervisor: Full
- Inventory Manager, Admin: All

---

### Page Structure

#### a) Header
- Title: `Delivery Order Items`
- Description: "Audit and track items included in each delivery order."

#### b) Filter Bar
- Input: Delivery Order Number (search)
- Input: Item Code/Name (search/autocomplete)
- Input: Date range (from/to)
- Button: `Search` (Primary)

#### c) Table (`delivery-order-items-table`)
- Columns:
  | Column         | Field           |
  |----------------|-----------------|
  | Delivery Order | DoNo            |
  | Date           | DoDt            |
  | Item           | ItemCode / Description |
  | Quantity       | Qty             |
  | Status         | Status          |
  | Recipient      | CustName        |
  | Remarks        | Remarks         |

#### d) Export / Print
- Excel, PDF, Print

#### e) Empty State
- "No delivery order items found."

#### f) Loading State
- Table skeleton rows, disables export

#### g) API Integration
- API: `GET /api/v1/inventory/delivery-orders/items?filters...`

---

### Validations
- At least one filter field required

---

### Test Identifiers

| Component                              | testid                                              |
|-----------------------------------------|-----------------------------------------------------|
| Filter - DO number                      | `delivery-order-items-filter-do`                    |
| Filter - item code/autocomplete         | `delivery-order-items-filter-item`                  |
| Table                                   | `delivery-order-items-table`                        |
| Row N                                   | `delivery-order-items-table-row-{i}`                |
| Export btn                              | `delivery-order-items-export-btn`                   |
| Print btn                               | `delivery-order-items-print-btn`                    |
| Loading                                 | `delivery-order-items-loading`                      |
| Empty                                   | `delivery-order-items-empty`                        |
| Error                                   | `delivery-order-items-error`                        |

---

## 207. ItemDOSumm

### Route: `/inventory/delivery-orders/summary`

#### Purpose
Summarize items across all delivery orders for reporting on logistics, fulfillment, or inventory trends.

#### PRD References
- Feature: Inventory, Reporting
- US: US-164, US-166, US-203

#### Access Roles
- Supervisor, Inventory Manager, Admin

---

### Page Structure

#### a) Header
- Title: `Delivery Order Item Summary`
- Description: "Summarize inventory items by delivery order for fulfillment trends and logistics planning."

#### b) Filter Bar
- Input: Item (autocomplete, by code or name)
- Input: Date range
- Button: `Run Summary` (Primary)

#### c) Table (`delivery-order-summary-table`)
- Columns:
  | Column         | Field           |
  |----------------|-----------------|
  | Item Code      | ItemCode        |
  | Item Name      | Description     |
  | Total Delivered| TotalQty        |
  | Number of DOs  | NumOrders       |
  | Last Delivered | LastDoDt        |
  | Status         | (if applicable) |

#### d) Export/Print
- Excel, PDF, Print

#### e) Empty State
- "No item delivery summary found for selected range."

#### f) Loading State
- Table skeleton

#### g) API Integration
- API: `GET /api/v1/inventory/delivery-orders/items/summary?filters...`

---

### Validations
- At least one filter required; date range valid

---

### Test Identifiers

| Component                              | testid                                              |
|-----------------------------------------|-----------------------------------------------------|
| Filter - item/autocomplete              | `delivery-order-summary-filter-item`                |
| Table                                   | `delivery-order-summary-table`                      |
| Row N                                   | `delivery-order-summary-table-row-{i}`              |
| Export btn                              | `delivery-order-summary-export-btn`                 |
| Print btn                               | `delivery-order-summary-print-btn`                  |
| Loading                                 | `delivery-order-summary-loading`                    |
| Empty                                   | `delivery-order-summary-empty`                      |
| Error                                   | `delivery-order-summary-error`                      |

---

## 208. ItemList

### Route: `/inventory/items`

#### Purpose
Browse, search, and export all inventory items/products, including current stock, category/type, and pricing metadata.

#### PRD References
- Feature: Inventory Management
- US: US-164; FR: FR-194, FR-214, FR-210

#### Access Roles
- Standard User: View
- Supervisor: View/Export
- Inventory Manager/Admin: All actions

---

### Page Structure

#### a) Header
- Title: `Inventory Items`
- Description: "Browse, filter, and export all items in the inventory master."

#### b) Filter Bar
- Input: Item Code/Name (search/autocomplete)
- Input: Category dropdown
- Input: Type dropdown (ItemType)
- Input: Location/warehouse selector
- Button: `+ New Item` (Primary, links to `/inventory/items/new`)

#### c) Table (`item-list-table`)
- Columns:
  | Column        | Field              |
  |---------------|--------------------|
  | Code          | ItemCode           |
  | Name/Desc     | Description        |
  | Category      | CatDescr           |
  | Type          | ItemType           |
  | Unit          | Denom              |
  | Current Stock | Stock (calculated) |
  | Location      | Location           |
  | Price (last)  | Srate/Prate        |
  | Actions       | View/Edit          |

#### d) Export / Print
- Excel, CSV, PDF; Print

#### e) Bulk Actions
- Checkboxes for multi-select (future bulk update)

#### f) Pagination
- Standard, 20 per page default

#### g) Empty State
- "No inventory items found."

#### h) Loading State
- Full table skeleton; disables actions

#### i) API Integration
- `GET /api/v1/items?filters...`

---

### Validations
- Item code required for edit/new

---

### Test Identifiers

| Component                              | testid                                              |
|-----------------------------------------|-----------------------------------------------------|
| Filter - code/name search               | `item-list-filter-search`                           |
| Filter - category select                | `item-list-filter-category`                         |
| Filter - type select                    | `item-list-filter-type`                             |
| Filter - location select                | `item-list-filter-location`                         |
| New Item btn                            | `item-list-new-item-btn`                            |
| Table                                   | `item-list-table`                                   |
| Row N                                   | `item-list-table-row-{i}`                           |
| View/Edit btn                           | `item-list-table-action-edit-{id}`                  |
| Export btn                              | `item-list-export-btn`                              |
| Print btn                               | `item-list-print-btn`                               |
| Bulk select                             | `item-list-bulk-select`                             |
| Pagination                              | `item-list-pagination`                              |
| Loading                                 | `item-list-loading`                                 |
| Empty                                   | `item-list-empty`                                   |
| Error                                   | `item-list-error`                                   |

---

## 209. ItemPendingDOList

### Route: `/inventory/delivery-orders/items/pending`

#### Purpose
List all items pending delivery or fulfillment, supporting tracking for logistics and warehouse action.

#### PRD References
- Feature: Inventory, Logistics
- US: US-163, US-164

#### Access Roles
- Warehouse, Supervisor, Manager, Admin

---

### Page Structure

#### a) Header
- Title: `Pending Delivery Order Items`
- Description: "Identify all items that are pending delivery to customers or job sites."

#### b) Filter Bar
- Input: Delivery Order (search/autocomplete)
- Input: Item Code/Name (search)
- Input: Customer/Site (dropdown)
- Date range picker
- Button: `Search` (Primary)

#### c) Table (`pending-delivery-items-table`)
- Columns:
  | Column         | Field           |
  |----------------|-----------------|
  | DO Number      | DoNo            |
  | Date           | DoDt            |
  | Customer/Site  | CustName        |
  | Item Code      | ItemCode        |
  | Description    | Description     |
  | Quantity Due   | Qty             |
  | Status         | Status          |
  | Expected By    | (if present)    |
  | Remarks        | Remarks         |

#### d) Export/Print
- Excel, PDF, Print

#### e) Empty State
- "All delivery order items have been fulfilled. No pending items found."

#### f) Loading State
- Table skeleton

#### g) API Integration
- API: `GET /api/v1/inventory/delivery-orders/items/pending?filters...`

---

### Validations
- At least one filter selected

---

### Test Identifiers

| Component                              | testid                                              |
|-----------------------------------------|-----------------------------------------------------|
| Filter - DO number                      | `pending-delivery-items-filter-do`                  |
| Filter - item                           | `pending-delivery-items-filter-item`                |
| Filter - customer/site                  | `pending-delivery-items-filter-customer`            |
| Table                                   | `pending-delivery-items-table`                      |
| Row N                                   | `pending-delivery-items-table-row-{i}`              |
| Export btn                              | `pending-delivery-items-export-btn`                 |
| Print btn                               | `pending-delivery-items-print-btn`                  |
| Loading                                 | `pending-delivery-items-loading`                    |
| Empty                                   | `pending-delivery-items-empty`                      |
| Error                                   | `pending-delivery-items-error`                      |

---

## 210. ItemPurchaseList-Import

### Route: `/inventory/purchases/imported`

#### Purpose
List all items that have been purchased via import — i.e., from overseas/external suppliers.

#### PRD References
- Feature: Inventory, Purchase Management
- US: US-211

#### Access Roles
- Purchasing Officer: View
- Supervisor/Manager/Admin: All actions

---

### Page Structure

#### a) Header
- Title: `Imported Item Purchases`
- Description: "Review all inventory items procured via import. Use filters to date-range or locate by supplier/item."

#### b) Filter Bar
- Input: Import Period (from/to)
- Input: Supplier (dropdown)
- Input: Item (autocomplete)
- Button: `Search` (Primary)

#### c) Table (`item-purchase-import-table`)
- Columns:
  | Column     | Field           |
  |------------|-----------------|
  | Import Date| ImportDt        |
  | PO Number  | PONumber        |
  | Item       | ItemCode / Desc |
  | Qty        | Qty             |
  | Unit Price | Rate            |
  | Total      | Amount          |
  | Currency   | Currency        |
  | Supplier   | SuppName        |

#### d) Export / Print
- Excel, CSV, PDF, Print

#### e) Pagination and Bulk Actions:
- Bulk export select

#### f) Empty State
- "No imported purchases found for selected range/items."

#### g) API Integration
- API: `GET /api/v1/inventory/purchases/imported?filters...`

---

### Validations
- Import Period required

---

### Test Identifiers

| Component                              | testid                                              |
|-----------------------------------------|-----------------------------------------------------|
| Filter - period                         | `item-purchase-import-filter-period`                |
| Filter - supplier                       | `item-purchase-import-filter-supplier`              |
| Filter - item                           | `item-purchase-import-filter-item`                  |
| Table                                   | `item-purchase-import-table`                        |
| Row N                                   | `item-purchase-import-table-row-{i}`                |
| Export btn                              | `item-purchase-import-export-btn`                   |
| Print btn                               | `item-purchase-import-print-btn`                    |
| Bulk select                             | `item-purchase-import-bulk-select`                  |
| Loading                                 | `item-purchase-import-loading`                      |
| Empty                                   | `item-purchase-import-empty`                        |
| Error                                   | `item-purchase-import-error`                        |

---

## 211. ItemPurchaseList-Local

### Route: `/inventory/purchases/local`

#### Purpose
List all items that have been purchased locally, supporting audit, comparison, and supplier analytics.

#### PRD References
- Feature: Inventory, Purchase Management
- US: US-211

#### Access Roles
- Purchasing Officer
- Supervisor/Manager/Admin

---

### Page Structure

#### a) Header
- Title: `Local Item Purchases`
- Description: "Track inventory items purchased from local suppliers. Filter by time, supplier, or item."

#### b) Filter Bar
- Input: Purchase Date (from/to)
- Input: Supplier (dropdown)
- Input: Item (autocomplete)
- Button: `Search` (Primary)

#### c) Table (`item-purchase-local-table`)
- Columns:
  | Column      | Field           |
  |-------------|-----------------|
  | Purchase Dt | InvDt           |
  | Invoice No  | Invoice         |
  | Item        | ItemCode/Desc   |
  | Qty         | Qty             |
  | Unit Price  | Rate            |
  | Amount      | Amount          |
  | Discount    | CostDisc        |
  | Supplier    | SuppName        |
  | Remarks     | suppremark      |

#### d) Export / Print
- Excel, CSV, Print

#### e) Bulk select (for Export/Print actions only)

#### f) API Integration
- `GET /api/v1/inventory/purchases/local?filters...`

---

### Validations
- Valid date range
- Supplier or Item required if date not filled

---

### Test Identifiers

| Component                              | testid                                              |
|-----------------------------------------|-----------------------------------------------------|
| Filter - date                           | `item-purchase-local-filter-period`                 |
| Filter - supplier                       | `item-purchase-local-filter-supplier`               |
| Filter - item                           | `item-purchase-local-filter-item`                   |
| Table                                   | `item-purchase-local-table`                         |
| Row N                                   | `item-purchase-local-table-row-{i}`                 |
| Export btn                              | `item-purchase-local-export-btn`                    |
| Print btn                               | `item-purchase-local-print-btn`                     |
| Bulk select                             | `item-purchase-local-bulk-select`                   |
| Loading                                 | `item-purchase-local-loading`                       |
| Empty                                   | `item-purchase-local-empty`                         |
| Error                                   | `item-purchase-local-error`                         |


---

## 212. ItemPurchaseReturnList

### Route: `/inventory/purchases/returns/list`

#### Purpose
Detailed listing of all returned purchased items, enabling supplier credit, audit, or claim workflows.

#### PRD References
- Feature: Inventory, Purchase Return
- US: US-211, US-214

#### Access Roles
- Purchasing, Warehouse, Supervisor, Admin

---

### Page Structure

#### a) Header
- Title: `Purchased Item Returns`
- Description: "Audit all item returns to suppliers. Filter by return date, supplier, or item for claims and reconciliation."

#### b) Filter Bar
- Input: Return Date (from/to)
- Input: Supplier (autocomplete)
- Input: Item (autocomplete)
- Button: `Search` (Primary)

#### c) Table (`purchase-return-list-table`)
- Columns:
  | Column      | Field      |
  |-------------|------------|
  | Return Dt   | ReturnDt   |
  | Return No   | ReturnNo   |
  | Supplier    | SuppName   |
  | Item        | ItemCode/Desc |
  | Qty         | Qty        |
  | Reason      | Reason     |
  | Status      | Status     |
  | Remarks     | Remarks    |

#### d) Export/Print
- Excel, PDF, Print

#### e) Paging
- Standard

#### f) API Integration
- `GET /api/v1/inventory/purchases/returns?filters...`

---

### Validations
- Date or Supplier/Item required for filter

---

### Test Identifiers

| Component                              | testid                                              |
|-----------------------------------------|-----------------------------------------------------|
| Filter - date                           | `purchase-return-list-filter-date`                  |
| Filter - supplier                       | `purchase-return-list-filter-supplier`              |
| Filter - item                           | `purchase-return-list-filter-item`                  |
| Table                                   | `purchase-return-list-table`                        |
| Row N                                   | `purchase-return-list-table-row-{i}`                |
| Export btn                              | `purchase-return-list-export-btn`                   |
| Print btn                               | `purchase-return-list-print-btn`                    |
| Loading                                 | `purchase-return-list-loading`                      |
| Empty                                   | `purchase-return-list-empty`                        |
| Error                                   | `purchase-return-list-error`                        |

---

## 213. ItemPurchaseReturnSumm

### Route: `/inventory/purchases/returns/summary`

#### Purpose
Summarized view of purchase returns for trend analysis, credits, or quality control.

#### PRD References
- Feature: Inventory, Purchase Return Summary
- US: US-211

#### Access Roles
- Supervisor, Admin

---

### Page Structure

#### a) Header
- Title: `Summary of Purchased Item Returns`
- Description: "Summarized data for all returned items across suppliers and periods."

#### b) Filter Bar
- Input: Period (from/to)
- Input: Supplier (dropdown)
- Input: Item (autocomplete)
- Button: `Run Summary` (Primary)

#### c) Table (`purchase-return-summary-table`)
- Columns:
  | Column      | Field      |
  |-------------|------------|
  | Item        | ItemCode/Desc |
  | Supplier    | SuppName   |
  | Total Returned| Qty      |
  | Value       | Amount     |
  | Return Count| Count      |
  | Period      | Range      |

#### d) Export/Print
- Excel, PDF, Print

#### e) Empty State
- "No returned items eligible for summary."

#### f) API Integration
- `GET /api/v1/inventory/purchases/returns/summary?filters...`

---

### Test Identifiers

| Component                              | testid                                              |
|-----------------------------------------|-----------------------------------------------------|
| Filter - period                         | `purchase-return-summary-filter-period`             |
| Filter - supplier                       | `purchase-return-summary-filter-supplier`           |
| Filter - item                           | `purchase-return-summary-filter-item`               |
| Table                                   | `purchase-return-summary-table`                     |
| Row N                                   | `purchase-return-summary-table-row-{i}`             |
| Export btn                              | `purchase-return-summary-export-btn`                |
| Print btn                               | `purchase-return-summary-print-btn`                 |
| Loading                                 | `purchase-return-summary-loading`                   |
| Empty                                   | `purchase-return-summary-empty`                     |
| Error                                   | `purchase-return-summary-error`                     |

---

## 214. ItemPurchaseSumm-Import

### Route: `/inventory/purchases/imported/summary`

#### Purpose
Summarized view of all imported items purchased per interval for procurement trend reporting.

#### PRD References
- Feature: Inventory, Purchase Analysis
- US: US-211, US-151, US-158

#### Access Roles
- Supervisor, Admin

---

### Page Structure

#### a) Header
- Title: `Summary of Imported Item Purchases`
- Description: "Consolidate all imported item purchases by supplier, item, and period for trend analysis."

#### b) Filter Bar
- Period (from/to)
- Supplier (dropdown)
- Item (autocomplete)
- Button: `Run Summary`

#### c) Table (`item-imported-purchase-summary-table`)
- Columns:
  | Column         | Field      |
  |----------------|------------|
  | Item           | ItemCode/Desc |
  | Supplier       | SuppName   |
  | Total Qty      | Qty        |
  | Total Value    | Amount     |
  | Import Period  | Date range |
  | Imports Count  | ImportCount|

#### d) Export/Print
- Excel, PDF, Print

#### e) Empty State/Loading/API
- As above

---

### Test Identifiers

| Component                              | testid                                              |
|-----------------------------------------|-----------------------------------------------------|
| Filter - period                         | `item-imported-purchase-summary-filter-period`      |
| Filter - supplier                       | `item-imported-purchase-summary-filter-supplier`    |
| Filter - item                           | `item-imported-purchase-summary-filter-item`        |
| Table                                   | `item-imported-purchase-summary-table`              |
| Row N                                   | `item-imported-purchase-summary-table-row-{i}`      |
| Export btn                              | `item-imported-purchase-summary-export-btn`         |
| Print btn                               | `item-imported-purchase-summary-print-btn`          |
| Loading                                 | `item-imported-purchase-summary-loading`            |
| Empty                                   | `item-imported-purchase-summary-empty`              |
| Error                                   | `item-imported-purchase-summary-error`              |

---

## 215. ItemPurchaseSumm-Local

### Route: `/inventory/purchases/local/summary`

#### Purpose
Summary of all locally purchased items for procurement/finance analysis.

#### PRD References
- Feature: Inventory, Purchase Analysis
- US: US-211

#### Access Roles
- Supervisor, Admin

---

### Page Structure

#### a) Header
- Title: `Summary of Local Item Purchases`
- Description: "Consolidate all local purchases by supplier, item, and date for management review."

#### b) Filter Bar
- Period (from/to)
- Supplier (dropdown)
- Item (autocomplete)
- Button: `Run Summary`

#### c) Table (`item-local-purchase-summary-table`)
- Columns:
  | Column         | Field      |
  |----------------|------------|
  | Item           | ItemCode/Desc |
  | Supplier       | SuppName   |
  | Total Qty      | Qty        |
  | Total Value    | Amount     |
  | Purchases Count| LocalCount |

#### d) Export/Print
- Excel, PDF, Print

#### e) Empty State/Loading/API
- As above

---

### Test Identifiers

| Component                              | testid                                              |
|-----------------------------------------|-----------------------------------------------------|
| Filter - period                         | `item-local-purchase-summary-filter-period`         |
| Filter - supplier                       | `item-local-purchase-summary-filter-supplier`       |
| Filter - item                           | `item-local-purchase-summary-filter-item`           |
| Table                                   | `item-local-purchase-summary-table`                 |
| Row N                                   | `item-local-purchase-summary-table-row-{i}`         |
| Export btn                              | `item-local-purchase-summary-export-btn`            |
| Print btn                               | `item-local-purchase-summary-print-btn`             |
| Loading                                 | `item-local-purchase-summary-loading`               |
| Empty                                   | `item-local-purchase-summary-empty`                 |
| Error                                   | `item-local-purchase-summary-error`                 |

---

## 216. ItemSalesList

### Route: `/sales/items/list`

#### Purpose
Display all sold items with invoice/date/customer breakdown for sales tracking and analytics.

#### PRD References
- Feature: Sales Management, Analytics
- US: US-211, US-278

#### Access Roles
- Standard User: Their department/role
- Supervisor/Admin: All

---

### Page Structure

#### a) Header
- Title: `Item Sales List`
- Description: "Browse all inventory items that have been sold. Use filters by date, customer, item, or invoice."

#### b) Filter Bar
- Period (from/to)
- Customer (dropdown)
- Item (autocomplete)
- Invoice No (text)
- Button: `Search`

#### c) Table (`item-sales-list-table`)
- Columns:
  | Column         | Field      |
  |----------------|------------|
  | Sale ID        | Bill/ID    |
  | Date           | BillDt     |
  | Customer       | CustName   |
  | Item           | ItemCode/Desc |
  | Qty            | Qty        |
  | Amount         | Amount     |
  | Invoice No     | Bill       |

#### d) Export/Print
- Excel, PDF, Print

#### e) Pagination/Empty/Loading/API
- As above

---

### Test Identifiers

| Component                              | testid                                              |
|-----------------------------------------|-----------------------------------------------------|
| Filter - period                         | `item-sales-list-filter-period`                     |
| Filter - customer                       | `item-sales-list-filter-customer`                   |
| Filter - item                           | `item-sales-list-filter-item`                       |
| Filter - invoice                        | `item-sales-list-filter-invoice`                    |
| Table                                   | `item-sales-list-table`                             |
| Row N                                   | `item-sales-list-table-row-{i}`                     |
| Export btn                              | `item-sales-list-export-btn`                        |
| Print btn                               | `item-sales-list-print-btn`                         |
| Loading                                 | `item-sales-list-loading`                           |
| Empty                                   | `item-sales-list-empty`                             |
| Error                                   | `item-sales-list-error`                             |

---

## 217. ItemSalesListJobCard

### Route: `/sales/items/jobcard`

#### Purpose
List all items sold in association with job cards/services for analytics/workshop performance tracking.

#### PRD References
- Feature: Service Job Analytics
- US: US-211

#### Access Roles
- Supervisor, Admin

---

### Page Structure

#### a) Header
- Title: `Items Sold by Job Card`
- Description: "Review all items sold for jobs or service orders for workshop/service analytics."

#### b) Filter Bar
- Period (from/to)
- Job Card No (autocomplete)
- Item (autocomplete)
- Button: `Search`

#### c) Table (`item-sales-jobcard-table`)
- Columns:
  | Column         | Field       |
  |----------------|-------------|
  | Job Card No    | JobCard/Ordr|
  | Date           | BillDt      |
  | Item           | ItemCode/Desc|
  | Qty            | Qty         |
  | Amount         | Amount      |
  | Service Type   | JobType     |
  | Customer       | CustName    |

#### d) Export/Print/Bulk/Paging/Empty/Loading — as above

---

### Test Identifiers

| Component                              | testid                                              |
|-----------------------------------------|-----------------------------------------------------|
| Filter - period                         | `item-sales-jobcard-filter-period`                  |
| Filter - job card                       | `item-sales-jobcard-filter-jobcard`                 |
| Filter - item                           | `item-sales-jobcard-filter-item`                    |
| Table                                   | `item-sales-jobcard-table`                          |
| Row N                                   | `item-sales-jobcard-table-row-{i}`                  |
| Export btn                              | `item-sales-jobcard-export-btn`                     |
| Print btn                               | `item-sales-jobcard-print-btn`                      |
| Loading                                 | `item-sales-jobcard-loading`                        |
| Empty                                   | `item-sales-jobcard-empty`                          |
| Error                                   | `item-sales-jobcard-error`                          |

---

## 218. ItemSalesReturnSumm

### Route: `/sales/returns/summary`

#### Purpose
Presents summary/overview of all item sales returns for finance, inventory, and quality rebalance.

#### PRD References
- Feature: Sales Return, Analytics
- US: US-211

#### Access Roles
- Supervisor, Admin

---

### Page Structure

#### a) Header
- Title: `Sales Return Summary`
- Description: "Summarize returned items by reason, volume, and category for financial and quality analysis."

#### b) Filter Bar
- Period (from/to)
- Customer (dropdown)
- Item (autocomplete)
- Return Reason (dropdown)
- Button: `Run Summary`

#### c) Table (`sales-return-summary-table`)
- Columns:
  | Column         | Field      |
  |----------------|------------|
  | Item           | ItemCode/Desc |
  | Customer       | CustName   |
  | Total Returns  | Qty        |
  | Total Refund   | Amount     |
  | Return Reason  | Reason     |

#### d) Export/Print/Bulk/Empty/Loading/API — as previous

---

### Test Identifiers

| Component                              | testid                                              |
|-----------------------------------------|-----------------------------------------------------|
| Filter - period                         | `sales-return-summary-filter-period`                |
| Filter - customer                       | `sales-return-summary-filter-customer`              |
| Filter - item                           | `sales-return-summary-filter-item`                  |
| Filter - reason                         | `sales-return-summary-filter-reason`                |
| Table                                   | `sales-return-summary-table`                        |
| Row N                                   | `sales-return-summary-table-row-{i}`                |
| Export btn                              | `sales-return-summary-export-btn`                   |
| Print btn                               | `sales-return-summary-print-btn`                    |
| Loading                                 | `sales-return-summary-loading`                      |
| Empty                                   | `sales-return-summary-empty`                        |
| Error                                   | `sales-return-summary-error`                        |

---

## 219. ItemSalesSumm

### Route: `/sales/items/summary`

#### Purpose
Summarizes item sales volume/value for management or analytics.

#### PRD References
- Feature: Sales, Reporting
- US: US-211, US-278

#### Access Roles
- Supervisor, Admin, Manager

---

### Page Structure

#### a) Header
- Title: `Item Sales Summary`
- Description: "Consolidate and review all item sales for analytics and stock planning."

#### b) Filter Bar
- Period (from/to)
- Item (autocomplete)
- Customer (dropdown)
- Button: `Run Summary`

#### c) Table (`item-sales-summary-table`)
- Columns:
  | Column         | Field      |
  |----------------|------------|
  | Item           | ItemCode/Desc|
  | Customer       | CustName   |
  | Total Sold     | Qty        |
  | Total Value    | Amount     |
  | Invoices Count | Count      |

#### d) Export/Print/Bulk/Empty/Loading/API as above

---

### Test Identifiers

| Component                              | testid                                              |
|-----------------------------------------|-----------------------------------------------------|
| Filter - period                         | `item-sales-summary-filter-period`                  |
| Filter - item                           | `item-sales-summary-filter-item`                    |
| Filter - customer                       | `item-sales-summary-filter-customer`                |
| Table                                   | `item-sales-summary-table`                          |
| Row N                                   | `item-sales-summary-table-row-{i}`                  |
| Export btn                              | `item-sales-summary-export-btn`                     |
| Print btn                               | `item-sales-summary-print-btn`                      |
| Loading                                 | `item-sales-summary-loading`                        |
| Empty                                   | `item-sales-summary-empty`                          |
| Error                                   | `item-sales-summary-error`                          |

---

## 220. ItemSreturnList

### Route: `/sales/returns/list`

#### Purpose
Lists all items returned by customers for warranty, refund, or service.

#### PRD References
- Feature: Sales Returns
- US: US-211

#### Access Roles
- Supervisor, Admin

---

### Page Structure

#### a) Header
- Title: `Sales Return Item List`
- Description: "View all items returned by customers for refund or warranty. Includes filter by period, customer, item, and return reason."

#### b) Filter Bar
- Period (from/to)
- Customer (dropdown)
- Item (autocomplete)
- Return Reason (dropdown)
- Button: `Search`

#### c) Table (`sales-return-list-table`)
- Columns:
  | Column         | Field      |
  |----------------|------------|
  | Return Date    | ReturnDt   |
  | Return No      | ReturnNo   |
  | Customer       | CustName   |
  | Item           | ItemCode/Desc |
  | Qty            | Qty        |
  | Return Reason  | Reason     |
  | Status         | Status     |
  | Remarks        | Remarks    |

#### d) Export, Print, Bulk, Empty, Loading, Error — as above

#### e) API
- `GET /api/v1/sales/returns/items?filters...`

---

### Test Identifiers

| Component                              | testid                                              |
|-----------------------------------------|-----------------------------------------------------|
| Filter - period                         | `sales-return-list-filter-period`                   |
| Filter - customer                       | `sales-return-list-filter-customer`                 |
| Filter - item                           | `sales-return-list-filter-item`                     |
| Filter - reason                         | `sales-return-list-filter-reason`                   |
| Table                                   | `sales-return-list-table`                           |
| Row N                                   | `sales-return-list-table-row-{i}`                   |
| Export btn                              | `sales-return-list-export-btn`                      |
| Print btn                               | `sales-return-list-print-btn`                       |
| Loading                                 | `sales-return-list-loading`                         |
| Empty                                   | `sales-return-list-empty`                           |
| Error                                   | `sales-return-list-error`                           |

---

## 221. itemtranscount

### Route: `/inventory/items/transaction-count`

#### Purpose
Show transaction counts of inventory items for reconciliation, analysis, trending.

#### PRD References
- Feature: Inventory, Analytics
- US: US-164, US-214

#### Access Roles
- Supervisor, Admin

---

### Page Structure

#### a) Header
- Title: `Inventory Item Transaction Counts`
- Description: "Review transaction frequency by item for inventory planning."

#### b) Filter Bar
- Period (from/to)
- Category/Type (dropdown)
- Minimum Transaction Count (number input, default: 10)
- Button: `Search`

#### c) Table (`item-transaction-count-table`)
- Columns:
  | Column         | Field      |
  |----------------|------------|
  | Item Code      | ItemCode   |
  | Name/Desc      | Description|
  | Tag            | Tag        |
  | Total Txn      | total      |

#### d) Export, Print, Loading, Empty/Error, etc.

---

### Test Identifiers

| Component                              | testid                                              |
|-----------------------------------------|-----------------------------------------------------|
| Filter - period                         | `item-transaction-count-filter-period`              |
| Filter - category/type                  | `item-transaction-count-filter-category`            |
| Filter - min count                      | `item-transaction-count-filter-min`                 |
| Table                                   | `item-transaction-count-table`                      |
| Row N                                   | `item-transaction-count-table-row-{i}`              |
| Export btn                              | `item-transaction-count-export-btn`                 |
| Print btn                               | `item-transaction-count-print-btn`                  |
| Loading                                 | `item-transaction-count-loading`                    |
| Empty                                   | `item-transaction-count-empty`                      |
| Error                                   | `item-transaction-count-error`                      |

---

## 222. JobDetailsSub

### Route: `/jobs/:jobId/details/sub`

#### Purpose
Display sub-job steps, lines, or data for ongoing jobs or completed work orders — analytic/support report.

#### PRD References
- Feature: Job, Work Order & Estimation
- US: US-102, US-101

#### Access Roles
- Supervisor, Admin

---

### Page Structure

#### a) Header
- Title: `Job #JOB-{jobId} — Sub-details`
- Description: "Steps, sub-tasks, or itemized actions within this job."

#### b) Job Summary (top)
- Job card: basic info (Customer, Vehicle, Advisor, Date, Status)

#### c) Table (`job-details-sub-table`)
- Columns:
  | Column         | Field          |
  |----------------|---------------|
  | Sub-step #     | (auto)        |
  | Description    | SubDesc       |
  | Status         | SubStatus     |
  | Technician     | EmpName       |
  | Start          | StartDt       |
  | End            | EndDt         |
  | Duration       | Duration/Hr   |
  | Notes          | SubNotes      |

#### d) API
- `GET /api/v1/jobs/:jobId/details/sub`

#### e) Export/Print

#### f) Loading/Empty/Error

---

### Test Identifiers

| Component                              | testid                                              |
|-----------------------------------------|-----------------------------------------------------|
| Header                                 | `job-details-sub-header`                            |
| Job summary                            | `job-details-sub-summary`                           |
| Table                                  | `job-details-sub-table`                             |
| Row N                                  | `job-details-sub-table-row-{i}`                     |
| Export btn                             | `job-details-sub-export-btn`                        |
| Print btn                              | `job-details-sub-print-btn`                         |
| Loading                                | `job-details-sub-loading`                           |
| Empty                                  | `job-details-sub-empty`                             |
| Error                                  | `job-details-sub-error`                             |

---

## 223. JobStatusAdvisorWise

### Route: `/jobs/status/advisorwise`

#### Purpose
Show job/work status by service advisor/staff member for workload or performance tracking.

#### PRD References
- Feature: Job, Work Order & Estimation
- US: US-104, US-107

#### Access Roles
- Supervisor, Admin

---

### Page Structure

#### a) Header
- Title: `Job Status by Advisor`
- Description: "Workload and status summary for all advisors. Use filters to select date or advisor."

#### b) Filter Bar
- Advisor (dropdown)
- Period (from/to)
- Job Status (dropdown)
- Button: `Run Report`

#### c) Table (`job-status-advisorwise-table`)
- Columns:
  | Column         | Field         |
  |----------------|--------------|
  | Advisor        | StaffName     |
  | Job #          | Ordr         |
  | Customer       | CustName     |
  | Status         | Status       |
  | Start Date     | Ordt         |
  | Due/Delivery   | CompletionDate|
  | Last Update    | LastUpdate   |
  | Notes          | JobNotes     |

#### d) API
- `GET /api/v1/jobs/status/advisorwise?filters...`

#### e) Export/Print

#### f) Empty/Loading/Error

---

### Test Identifiers

| Component                              | testid                                              |
|-----------------------------------------|-----------------------------------------------------|
| Filter - advisor                        | `job-status-advisorwise-filter-advisor`             |
| Filter - period                         | `job-status-advisorwise-filter-period`              |
| Filter - status                         | `job-status-advisorwise-filter-status`              |
| Table                                   | `job-status-advisorwise-table`                      |
| Row N                                   | `job-status-advisorwise-table-row-{i}`              |
| Export btn                              | `job-status-advisorwise-export-btn`                 |
| Print btn                               | `job-status-advisorwise-print-btn`                  |
| Loading                                 | `job-status-advisorwise-loading`                    |
| Empty                                   | `job-status-advisorwise-empty`                      |
| Error                                   | `job-status-advisorwise-error`                      |

---

## 224. JournalVoucher

### Route: `/finance/vouchers/journal`

#### Purpose
Show all journal vouchers created for a report period for audit/reconciliation.

#### PRD References
- Feature: Voucher & Transaction Entry
- US: US-306, US-310, US-313

#### Access Roles
- Standard User: Own or assigned journals
- Supervisor/Admin: All

---

### Page Structure

#### a) Header
- Title: `Journal Voucher Report`
- Description: "Review and export journal voucher entries for regulatory and audit needs."

#### b) Filter Bar
- Period (from/to): required
- Account (autocomplete)
- Voucher Type (dropdown)
- Status (dropdown: Pending, Posted, Rejected)
- Button: `Search`

#### c) Table (`journal-voucher-table`)
- Columns:
  | Column         | Field         |
  |----------------|--------------|
  | Voucher #      | Vsrl         |
  | Date           | Date         |
  | Account        | Ac/Description|
  | Debit          | Debt         |
  | Credit         | Cred         |
  | Type           | Vtype        |
  | Narration      | Narration    |
  | Status         | Status       |
  | Actions        | View/Export  |

#### d) Export/Print

#### e) API
- `GET /api/v1/finance/vouchers/journal?filters...`

#### f) Loading/Empty/Error

---

### Test Identifiers

| Component                              | testid                                              |
|-----------------------------------------|-----------------------------------------------------|
| Filter - period                         | `journal-voucher-filter-period`                     |
| Filter - account                        | `journal-voucher-filter-account`                    |
| Filter - type                           | `journal-voucher-filter-type`                       |
| Filter - status                         | `journal-voucher-filter-status`                     |
| Table                                   | `journal-voucher-table`                             |
| Row N                                   | `journal-voucher-table-row-{i}`                     |
| Export btn                              | `journal-voucher-export-btn`                        |
| Print btn                               | `journal-voucher-print-btn`                         |
| Loading                                 | `journal-voucher-loading`                           |
| Empty                                   | `journal-voucher-empty`                             |
| Error                                   | `journal-voucher-error`                             |

---

## 225. Ledger

### Route: `/finance/ledger`

#### Purpose
Display transaction history for selected ledgers for financial review.

#### PRD References
- Feature: Ledger & Account Management
- US: US-255, US-248, US-251

#### Access Roles
- Standard User: own department/accounts
- Supervisor/Admin: all access

---

### Page Structure

#### a) Header
- Title: `Ledger Report`
- Description: "Filter, review, and export ledger account activity for any account or group."

#### b) Filter Bar
- Date Range (from/to): required
- Account (autocomplete, required)
- Show Subaccounts (toggle)
- Include Zero Balances (checkbox)
- Button: `Run Report`

#### c) Table (`ledger-table`)
- Columns:
  | Column         | Field         |
  |----------------|--------------|
  | Date           | Date         |
  | Voucher #      | VoucherNo    |
  | Narration      | Narration    |
  | Debit          | Debit        |
  | Credit         | Credit       |
  | Balance        | Balance      |

#### d) Opening/Closing Balance Card

- Above/below table, summary card showing opening, movement, and closing for period.

#### e) Export/Print
- Excel, PDF, Print

#### f) Loading/Empty/Error, Pagination

---

### Test Identifiers

| Component                              | testid                                              |
|-----------------------------------------|-----------------------------------------------------|
| Filter - period                         | `ledger-filter-period`                              |
| Filter - account                        | `ledger-filter-account`                             |
| Toggle - show subaccounts               | `ledger-toggle-show-subaccounts`                    |
| Toggle - zero balances                  | `ledger-toggle-zero-balances`                       |
| Table                                   | `ledger-table`                                      |
| Row N                                   | `ledger-table-row-{i}`                              |
| Export btn                              | `ledger-export-btn`                                 |
| Print btn                               | `ledger-print-btn`                                  |
| Opening/closing card                    | `ledger-balance-summary`                            |
| Loading                                 | `ledger-loading`                                    |
| Empty                                   | `ledger-empty`                                      |
| Error                                   | `ledger-error`                                      |

---


## COVERAGE CHECK

| Screen Name               | Covered |
|--------------------------|---------|
| 201. EmployeeList        | ✅      |
| 202. EstimationReport    | ✅      |
| 203. InsuraceInvReport   | ✅      |
| 204. InvoiceDetailsServ  | ✅      |
| 205. invoiceDetailsSub   | ✅      |
| 206. ItemDOList          | ✅      |
| 207. ItemDOSumm          | ✅      |
| 208. ItemList            | ✅      |
| 209. ItemPendingDOList   | ✅      |
| 210. ItemPurchaseList-Import | ✅  |
| 211. ItemPurchaseList-Local | ✅   |
| 212. ItemPurchaseReturnList | ✅  |
| 213. ItemPurchaseReturnSumm | ✅  |
| 214. ItemPurchaseSumm-Import | ✅ |
| 215. ItemPurchaseSumm-Local | ✅  |
| 216. ItemSalesList       | ✅      |
| 217. ItemSalesListJobCard| ✅      |
| 218. ItemSalesReturnSumm | ✅      |
| 219. ItemSalesSumm       | ✅      |
| 220. ItemSreturnList     | ✅      |
| 221. itemtranscount      | ✅      |
| 222. JobDetailsSub       | ✅      |
| 223. JobStatusAdvisorWise| ✅      |
| 224. JournalVoucher      | ✅      |
| 225. Ledger              | ✅      |

---

---

# FRONTEND_SPEC.md

---

## 226. LedgerSummaryActual

### Route
`/ledger/summary-actual`

### Purpose
Displays real-time summary of ledger account balances, presenting opening, debit, credit, and closing balances for selected accounts or groups for a specific reporting period, always based on actual transaction dates (not voucher entry dates).

### PRD Reference
- Screen: LedgerSummaryActual
- Features: Financial Reporting & Statements (FR-251, FR-254, FR-333, FR-329, FR-335, PRD Reporting section)
- User Stories: US-211, US-254, US-215

### Access Roles
- Supervisor
- Administrator

### Page Structure

#### Filters Section

- **Account/Group Selector**  
  - **Label**: Account or Group  
  - **Type**: Searchable autocomplete  
  - **Source**: account/group list (GET /api/v1/ledger/account-heads, account heads and groups)  
  - **Required**: No (defaults to all)  
  - **Validation**: None

- **Date Range**  
  - **Label**: Reporting Period  
  - **Fields**:  
    - From: Required, type date  
    - To: Required, type date  
  - **Validation**:  
    - From date <= To date  
    - Error: “Start date must be before or equal to end date.”

- **Show only active accounts**  
  - **Label**: Only Active  
  - **Type**: Checkbox  
  - **Default**: Checked

- **Button**:  
  - Primary: “Generate Summary”  
    - data-testid="ledger-summary-actual-filters-generate"
  - Disabled if validation fails

#### Ledger Summary Table

- **Columns**:
    1. Account Name (`description`)
    2. Account Code (`codes`)
    3. Opening Balance (`opn`)
    4. Debit (`currDr`)
    5. Credit (`currCr`)
    6. Closing Balance (`closing`)
    7. Group (`group`)
    8. Bank Type (`bankType`)
    9. Status/Locked (`locked`/icon)
- **Sortable**: by any column
- **Pagination**: 25 rows/page
- **Row Click**: opens Ledger Report for that account in new tab
- **Totals**: aggregate row at bottom (sum of debit, credit, closing)

#### Actions

- **Export**:  
  - Button, “Export”, options: Excel / PDF  
    - data-testid="ledger-summary-actual-export"
- **Print**:  
  - Button, “Print”  
    - data-testid="ledger-summary-actual-print"
- **Refresh**:  
  - Button, icon (“⟳”), tooltip “Refresh Summary”  
    - data-testid="ledger-summary-actual-refresh"

#### Loading/Empty/Error

- **Loading**:  
  - Table skeleton rows (animated shimmer)  
    - data-testid="ledger-summary-actual-table-skeleton"
- **Empty**:  
  - Message: “No ledger data found for the selected period.”
- **Error**:  
  - Generic DB/API error message: “Unable to load ledger summary. Please try again.”  
    - Shown in a role ‘alert’ banner above the table.

### API Integration

- **Endpoint**:  
  - `GET /api/v1/ledger/account-summaries`  
  - Params: selected account/group, fromDate, toDate, activeOnly (calls AcSummary or AcSummary_balansheet with DateOption for ‘Actual Date’)
- **Export/Print**:  
  - `GET /api/v1/ledger/account-summaries/export?format=pdf|excel`

### Validations
- Date range required, From <= To
- Export actions disabled if no data

### Test Identifiers

- ledger-summary-actual-filters-account
- ledger-summary-actual-filters-dates
- ledger-summary-actual-filters-active
- ledger-summary-actual-filters-generate
- ledger-summary-actual-table
- ledger-summary-actual-table-row-[accountCode]
- ledger-summary-actual-export
- ledger-summary-actual-print
- ledger-summary-actual-refresh
- ledger-summary-actual-table-skeleton
- ledger-summary-actual-table-empty
- ledger-summary-actual-table-error

---

## 227. Ledger_ActualDate

### Route
`/ledger/actual-date-report`

### Purpose
Displays the full ledger report, listing all transactions for specified accounts over a selected period, with transactions shown strictly by their actual transaction date.

### PRD Reference
- Screen: Ledger_ActualDate
- Features: Ledger & Account Management (FR-252), Financial Reporting (FR-334, FR-329, FR-335)
- User Stories: US-213, US-211, US-212

### Access Roles
- Supervisor
- Administrator

### Page Structure

#### Filters Section

- **Account Selector**
  - **Label**: Account  
  - **Autocomplete**: accounts from /api/v1/ledger/account-heads  
  - **Required**: Yes  
  - **Validation**: Required, error: “Account is required.”

- **Date Range**
  - **Label**: Actual Date Range  
  - **From**: required date  
  - **To**: required date  
  - **Validation**: Required, from <= to, error as previous

- **Voucher Type** (optional)
  - **Label**: Voucher Type  
  - **Type**: dropdown  
  - **Options**: All, Payment, Receipt, Journal, etc. (/api/v1/vouchers/types)
  - **Validation**: None

- **Button**:  
  - Primary: “Show Ledger”  
    - data-testid="ledger-actual-date-filters-generate"

#### Ledger Report Table

- **Columns:**
    1. Date (transaction actual date)
    2. Voucher No / RefNo
    3. Description (from transaction/narration)
    4. Debit Amount (debit side)
    5. Credit Amount (credit side)
    6. Balance (running)
    7. Voucher Type
    8. Narration
    9. Branch

- **Row Highlight**:  
  - Red for negative balances
- **Pagination**: 25/page
- **Row click**: Show transaction details (modal or side sheet)  
  - data-testid="ledger-actual-date-row-detail-[vsrl]"
- **Totals**: show at bottom (sum debits, credits)

#### Actions

- **Export**:  
  - Button: “Export” (Excel/PDF)  
    - data-testid="ledger-actual-date-export"
- **Print**:  
  - Button: “Print”  
    - data-testid="ledger-actual-date-print"
- **Refresh**:  
  - Button: “Refresh”  
    - data-testid="ledger-actual-date-refresh"

#### Loading/Empty/Error

- **Loading**: Table skeleton
- **Empty**: “No transactions found for this period.”
- **Error**:  
  - Show error banner with: “Unable to load ledger. Try again.”

### API Integration

- **Endpoint**:
  - `GET /api/v1/ledger/account-heads/actual-date-report?accountCode=...&fromDate=...&toDate=...[&voucherType=...]`
  - Backend: Calls Ledger_ActualDate (actual date filter).

### Validations

- Must supply account and valid date range before fetching
- Filter must be changed to enable Generate button

### Test Identifiers

- ledger-actual-date-filters-account
- ledger-actual-date-filters-dates
- ledger-actual-date-filters-vouchertype
- ledger-actual-date-filters-generate
- ledger-actual-date-table
- ledger-actual-date-row-detail-[vsrl]
- ledger-actual-date-export
- ledger-actual-date-print
- ledger-actual-date-refresh
- ledger-actual-date-skeleton
- ledger-actual-date-empty
- ledger-actual-date-error

---

## 228. Ledger_Pdc

### Route
`/ledger/pdc-report`

### Purpose
Reports on ledger entries involving post-dated cheques (PDC) within the selected date range and/or by account.

### PRD Reference
- Screen: Ledger_Pdc
- Features: Ledger & Account Management (FR-253), Financial Reporting (FR-335, FR-329)
- User Stories: US-214, US-223

### Access Roles
- Supervisor
- Administrator

### Page Structure

#### Filters Section

- **Account Selector**
  - **Label**: Account (required)
  - **Autocomplete**, required
  - **Validation**: required

- **Date Range**
  - **Label**: Cheque Date Range
  - **From**: required date
  - **To**: required date

- **Voucher Type** (optional)
  - **Dropdown**: All, PDC Receipt, PDC Issue

- **Button**: Primary “Show PDC Ledger”  
  - data-testid="ledger-pdc-filters-generate"

#### PDC Ledger Table

- **Columns:**
    1. Cheque Date (`qdate`)
    2. Voucher/Ref No
    3. Description
    4. Amount
    5. PDC Type (Issue/Receipt)
    6. Narration
    7. Cheque Number
    8. Payee/Account

- **Highlight**: Future dates, overdue PDCs (dates in red if overdue)
- **Pagination**: 25 per page
- **Row click**: View full voucher details modal

#### Actions

- **Export**: “Export” (Excel/PDF), data-testid="ledger-pdc-export"
- **Print**: “Print", data-testid="ledger-pdc-print"
- **Refresh**: “Refresh”, data-testid="ledger-pdc-refresh"

#### Loading/Empty/Error

- Table skeleton; Empty state message; error banner for DB failure

### API Integration

- **Endpoint**:  
  - `GET /api/v1/vouchers/list/pdc?accountCode=...&fromDate=...&toDate=...&pdcType=...`
  - Backend: Calls VoucherList_Pdc stored procedure.

### Validations

- Account required, date range required

### Test Identifiers

- ledger-pdc-filters-account
- ledger-pdc-filters-dates
- ledger-pdc-filters-type
- ledger-pdc-filters-generate
- ledger-pdc-table
- ledger-pdc-row-detail-[vsrl]
- ledger-pdc-export
- ledger-pdc-print
- ledger-pdc-refresh
- ledger-pdc-skeleton
- ledger-pdc-empty
- ledger-pdc-error

---

## 229. LPOAnalysis

### Route
`/purchase/lpo-analysis`

### Purpose
Provides an analytical report of all local purchase orders (LPOs), along with their delivery status and item-level linkage to purchase delivery orders (PDOs) and goods delivered.

### PRD Reference
- Screen: LPOAnalysis
- Features: Purchase & Procurement Management (FR-170, FR-138, FR-172)
- User Stories: US-138

### Access Roles
- Supervisor
- Administrator

### Page Structure

#### Filters Section

- **Date Range**
  - **Label**: LPO Date  
  - **From**: required date  
  - **To**: required date

- **Supplier Selector**
  - **Label**: Supplier
  - **Autocomplete**: SupplierSql

- **Section**
  - **Dropdown**: All/Bodyshop/Workshop/Other

- **Button**: "Generate Report" (data-testid="lpo-analysis-generate")

#### LPO Analysis Table

- **Columns:**
    1. LPO Number (`Invoice`)
    2. LPO Date (`LPODate`)
    3. Supplier (`SuppName`)
    4. Item Code
    5. Item Description
    6. LPO Quantity (`LPOQty`)
    7. PDO Number (`PDONo`)
    8. PDO Qty (`PDOQty`)
    9. DO Number (`DoNo`)
    10. DO Qty (`DoQty`)
    11. Status (LPO Send/Received/Issued)
    12. Customer (for DO if available)
    13. Staff Name

- **Row Grouping**: By LPO Number, sub-group by item
- **Pagination**: 50 per page, sticky header
- **Summary Row**: Totals per LPO and page
- **Row Highlight**: Red for short/partial receipts, green for all items delivered

#### Actions

- **Export**: Excel/PDF, data-testid="lpo-analysis-export"
- **Print**: data-testid="lpo-analysis-print"

#### Loading/Empty/Error

- Loading skeleton for table; empty message if no data; error banner for query error.

### API Integration

- **Endpoint**:  
  - `GET /api/v1/reports/lpo-analysis?fromDate=...&toDate=...&supplier=...&section=...`
  - Backend: Calls `sp_LPOAnalysis` stored procedure.

### Validations

- Date range required, supplier optional

### Test Identifiers

- lpo-analysis-filters-dates
- lpo-analysis-filters-supplier
- lpo-analysis-filters-section
- lpo-analysis-generate
- lpo-analysis-table
- lpo-analysis-row-[lpoNo]-[itemCode]
- lpo-analysis-export
- lpo-analysis-print
- lpo-analysis-skeleton
- lpo-analysis-empty
- lpo-analysis-error

---

## 230. LPODetailsReport

### Route
`/purchase/lpo-details`

### Purpose
Shows a detailed report of all LPO (Local Purchase Order) item lines within a selected period, enriched with supplier, item, and staff (service advisor) details.

### PRD Reference
- Screen: LPODetailsReport
- Features: Purchase & Procurement Management (FR-171, FR-172)
- User Stories: US-145

### Access Roles
- Supervisor
- Administrator

### Page Structure

#### Filters Section

- **Date Range**
  - **Label**: LPO Item Date  
  - **From/To**: required

- **Supplier Selector**
  - **Autocomplete**: SupplierSql

- **Staff/Advisor Selector**
  - **Autocomplete**: StaffSql

- **Button**: "Show Details", data-testid="lpo-details-generate"

#### LPO Details Table

- **Columns:**
    1. LPO Number (`Invoice`)
    2. LPO Item Date (`DT`)
    3. Supplier
    4. Item Code
    5. Item Description
    6. Quantity
    7. Rate
    8. Job Card/Order Ref
    9. Staff Name
    10. Status
    11. Remarks

- **Pagination**: 40 per page
- **Sort**: By date/item
- **Export**: Excel/PDF

#### Actions

- **Export**: data-testid="lpo-details-export"
- **Print**: data-testid="lpo-details-print"

#### Loading/Empty/Error

- Skeleton rows; "No LPO items in this period." if empty; error banner if fetch fails

### API Integration

- **Endpoint**:  
  - `GET /api/v1/reports/lpo-details?fromDate=...&toDate=...&supplier=...&advisor=...`
  - Backend: Calls `spLPODetailsReport` stored procedure.

### Validations

- Require valid date range

### Test Identifiers

- lpo-details-filters-dates
- lpo-details-filters-supplier
- lpo-details-filters-advisor
- lpo-details-generate
- lpo-details-table
- lpo-details-row-[lpoNo]-[itemCode]
- lpo-details-export
- lpo-details-print
- lpo-details-skeleton
- lpo-details-empty
- lpo-details-error

---

## 231. mailreport

### Route
`/reports/mail`

### Purpose
Allows users to generate and send a report by email, with customizable selection of report type, recipient(s), and export format.

### PRD Reference
- Screen: mailreport
- Features: Financial Reporting, Report Delivery (FR-327, FR-344)
- User Stories: US-280, US-277

### Access Roles
- Supervisor
- Administrator

### Page Structure

- **Report Selector**  
  - **Label**: Report to Send  
  - **Dropdown**: All available standard/exportable reports  
  - **Required**  
  - **Validation**: required, “Please select a report.”

- **Recipient Email(s)**  
  - **Label**: Recipient Email  
  - **Multi-value**: comma-separated emails; lightweight input + tags  
  - **Validation**: valid email format for each, error for invalid addresses

- **Export Format**  
  - **Label**: Format  
  - **Radio Buttons**: PDF, Excel, CSV  
  - **Default**: PDF

- **Message Body (optional)**  
  - **Label**: Message  
  - **Textarea**: optional, max 500 chars

- **Send Button** (primary)
  - data-testid="mailreport-send"
  - Disabled if validation errors

- **Preview Button**  
  - Shows report preview in modal before send  
  - data-testid="mailreport-preview"

- **Status Panel**  
  - Shows: last sent timestamp, delivery status (success/failure), and error messages

### Loading/Empty/Error

- Skeleton for preview, spinner for send; error banner if send fails, error text below each field as needed

### API Integration

- **Endpoint**:  
  - `POST /api/v1/reports/send-email`  
  - Body: `{ reportId, emails, format, message }`  
  - Backend: triggers report generation and mails to recipients

### Validations

- At least one valid email
- Report type required
- Show error: “Invalid email address” (per address)
- Cannot send with missing/invalid required fields

### Test Identifiers

- mailreport-report-selector
- mailreport-recipient-input
- mailreport-format-radio
- mailreport-message-textarea
- mailreport-preview
- mailreport-send
- mailreport-status
- mailreport-loading
- mailreport-error

---

## 232. OMastersReport

### Route
`/admin/omasters/report`

### Purpose
Administrative and static reference report of Company, Business Area, Section, and other master info stored in Omasters — for master data review or clearing up inconsistencies.

### PRD Reference
- Screen: OMastersReport
- Features: Admin Reference, Configuration Reporting (FR-279, FR-338)
- User Stories: US-292, US-282

### Access Roles
- Administrator

### Page Structure

#### Filters

- **Company Selector**
  - **Label**: Company
  - **Dropdown**: populated from Company table

- **Type**  
  - **Label**: Master Type  
  - **Dropdown**: Area, Section, Department, Category, Insurance, etc. (from Omasters.Type)
  - **Required**: No

- **Name Search**  
  - **Label**: Name  
  - **Input**: text, optional substring

- **Button**: “Show Masters”, data-testid="omasters-report-generate"

#### OMasters Table

- **Columns:**
    1. Type
    2. Code (Ocode)
    3. Description
    4. Remarks
    5. Active/Inactive
    6. Valid From / To (if available)
    7. Company
    8. Last Used

- **Pagination**: 30/page
- **Sort**: by code or name

- **Export**: PDF/Excel

#### Loading/Empty/Error

- Loading table skeleton, "No master records found" empty state, error banner

### API Integration

- **Endpoint**:  
  - `GET /api/v1/admin/omasters?company=...&type=...&name=...`

### Validations

- No required fields
- Export/Print disabled if no data

### Test Identifiers

- omasters-report-filters-company
- omasters-report-filters-type
- omasters-report-filters-name
- omasters-report-generate
- omasters-report-table
- omasters-report-export
- omasters-report-print
- omasters-report-skeleton
- omasters-report-empty
- omasters-report-error

---

## 233. OpeningStkList

### Route
`/inventory/opening-stock`

### Purpose
View and export the opening stock balances for all items at a given period’s start date.

### PRD Reference
- Screen: OpeningStkList
- Features: Stock & Inventory Management (FR-199, FR-165, FR-200, FR-203, FR-194, FR-191)
- User Stories: US-161, US-165

### Access Roles
- Supervisor
- Inventory Manager

### Page Structure

#### Filters

- **Opening Date**
  - **Label**: As of Date
  - **Type**: Date picker
  - **Required**

- **Location**
  - **Label**: Warehouse/Location  
  - **Autocomplete**: from GetLocations

- **Category**
  - **Label**: Item Category  
  - **Dropdown**

- **Button**: “Load Opening Stock”, data-testid="openingstklist-generate"

#### Opening Stock Table

- **Columns:**
    1. Item Code
    2. Item Description
    3. Category
    4. Location
    5. Opening QTY
    6. Opening Value
    7. Unit Cost
    8. UOM

- **Row click**: drill down to item stock card
- **Export**: Excel, PDF
- **Pagination**: 50/page

#### Actions

- Export: data-testid="openingstklist-export"
- Print: data-testid="openingstklist-print"

#### Loading/Empty/Error

- Table skeleton rows for loading; “No stock on this date” empty state; error banner

### API Integration

- **Endpoint**:  
  - `GET /api/v1/inventory/opening-stock?date=...&location=...&category=...`
  - Uses Opening_Balance_NEW with proper params

### Validations

- Opening Date required

### Test Identifiers

- openingstklist-filters-date
- openingstklist-filters-location
- openingstklist-filters-category
- openingstklist-generate
- openingstklist-table
- openingstklist-row-[itemCode]
- openingstklist-export
- openingstklist-print
- openingstklist-skeleton
- openingstklist-empty
- openingstklist-error

---

## 234. OrderStatus

### Route
`/orders/status`

### Purpose
Displays the real-time status of all customer orders for fulfillment tracking, including the order number, customer, expected completion, and status.

### PRD Reference
- Screen: OrderStatus
- Features: Order & Sales Management (FR-142, FR-143, FR-157)
- User Stories: US-119, US-162, US-161

### Access Roles
- Sales Staff
- Supervisor

### Page Structure

#### Filters Section

- **Order Number**
  - **Label**: Order No
  - **Input**: Text, substring

- **Customer**
  - **Label**: Customer
  - **Autocomplete**: CustomerSql

- **Date Range**
  - **Label**: Order Date
  - **From/To**: date pickers

- **Order Status**
  - **Dropdown**: Pending, Processing, Completed, Cancelled, With Issues, All

- **Show Only My Orders**
  - **Checkbox**

- **Button**: “Show Status”, data-testid="order-status-generate"

#### Orders Status Table

- **Columns:**
    1. Order Number
    2. Customer Name
    3. Order Date
    4. Status (color-coded pill)
    5. Expected Delivery / Completion
    6. Total Amount
    7. Last Updated
    8. Assigned Staff

- **Row click**: view order details (drawer or side modal)
- **Export**: Excel/PDF
- **Pagination**: 40/page

#### Actions

- Export: data-testid="order-status-export"
- Print: data-testid="order-status-print"

#### Loading/Empty/Error

- Table skeleton; “No orders found for filters.”; error banner

### API Integration

- **Endpoint**:  
  - `GET /api/v1/orders/status?orderNo=...&customer=...&fromDate=...&toDate=...&status=...&mine=...`

### Validations

- None required to load all

### Test Identifiers

- order-status-filters-order
- order-status-filters-customer
- order-status-filters-dates
- order-status-filters-status
- order-status-filters-mine
- order-status-generate
- order-status-table
- order-status-row-[orderNo]
- order-status-export
- order-status-print
- order-status-skeleton
- order-status-empty
- order-status-error

---

## 235. OrderStatus1

### Route
`/orders/status-alt`

### Purpose
Alternative or enhanced view/layout of the order status screen, showing additional custom fields for specific tracking needs (e.g., showing custom workflow fields, internal process steps).

### PRD Reference
- Screen: OrderStatus1
- Features: Order & Sales Management
- User Stories: US-161, US-129

### Access Roles
- Sales Supervisor
- Administrator

### Page Structure

#### Filters
- Same as `/orders/status` screen, plus:
    - **Custom Field Filter**
        - **Label**: [Custom Field Name]
        - **Dropdown**: as per business configuration

- “Show Alt Status” button, data-testid="orderstatus1-generate"

#### Table

- **Columns** (extends OrderStatus):
    1. Order Number
    2. Customer Name
    3. Order Date
    4. Status
    5. Custom Field 1
    6. Custom Field 2
    7. Staff/Team
    8. Last Updated
    9. Expected Completion
    10. [Business-specific field as needed]

- All actions as in standard status table

#### Loading/Empty/Error

- As per /orders/status

### API Integration

- **Endpoint**:  
  - `GET /api/v1/orders/status-alt?...`

### Test Identifiers

- orderstatus1-filters-order
- orderstatus1-filters-customer
- orderstatus1-filters-dates
- orderstatus1-filters-status
- orderstatus1-filters-custom1
- orderstatus1-generate
- orderstatus1-table
- orderstatus1-row-[orderNo]
- orderstatus1-export
- orderstatus1-print
- orderstatus1-skeleton
- orderstatus1-empty
- orderstatus1-error

---

## 236. Outstanding_OrderStatus

### Route
`/orders/status-outstanding`

### Purpose
Highlights all outstanding orders requiring action or follow-up, for escalation and fulfilment management.

### PRD Reference
- Screen: Outstanding_OrderStatus
- Features: Order & Sales Management (FR-157, FR-161)
- User Stories: US-119, US-129

### Access Roles
- Supervisor
- Administrator

### Page Structure

#### Filters

- **Order Number**
- **Customer**
- **Overdue Only**
  - Checkbox
- **Status**: Overdue, Action Required, Pending, All

- “Show Outstanding” button, data-testid="outstanding-orderstatus-generate"

#### Table

- **Columns:**
    1. Order Number
    2. Customer
    3. Order Date
    4. Expected Due Date
    5. Days Overdue
    6. Status
    7. Escalation Level
    8. Last Action
    9. Assigned Person

#### Row highlight:  
Red for overdue
Yellow for action required
Normal for pending

#### Actions

- Export: data-testid="outstanding-orderstatus-export"
- Print: data-testid="outstanding-orderstatus-print"

#### Loading/Empty/Error

- Table skeleton, empty state, error banner

### API Integration

- `GET /api/v1/orders/outstanding?...`

### Test Identifiers

- outstanding-orderstatus-filters-order
- outstanding-orderstatus-filters-customer
- outstanding-orderstatus-filters-dates
- outstanding-orderstatus-filters-status
- outstanding-orderstatus-filters-overdue
- outstanding-orderstatus-generate
- outstanding-orderstatus-table
- outstanding-orderstatus-row-[orderNo]
- outstanding-orderstatus-export
- outstanding-orderstatus-print
- outstanding-orderstatus-skeleton
- outstanding-orderstatus-empty
- outstanding-orderstatus-error

---

## 237. partsAvailabilityforWorksheet

### Route
`/jobs/parts-availability`

### Purpose
Lists parts availability for ongoing service worksheet jobs, referencing all ordered/required, received, and currently in stock items for a selected job card.

### PRD Reference
- Screen: partsAvailabilityforWorksheet
- Features: Job, Work Order & Estimation Management (FR-119, FR-117, FR-121)
- User Stories: US-163, US-104, US-105

### Access Roles
- Standard User
- Supervisor

### Page Structure

#### Filters

- **Job Card Number**
  - **Label**: Job Card No
  - **Autocomplete**: ongoing jobs

- **Service Advisor**
  - **Dropdown**: StaffSql

- **Show Only Approved Items**
  - Checkbox

- **Button**: “Show Parts Availability” (data-testid="parts-availability-generate")

#### Parts Availability Table

- **Columns:**
    1. Item Code
    2. Part Description
    3. Required Qty (ordered)
    4. Received Qty (arrived)
    5. Current Stock Qty
    6. Unit
    7. Supplier
    8. Status (color code: Green/Yellow/Red)

- **Row click**: shows part detail (modal/panel), e.g. source, last received

#### Actions

- Export: data-testid="parts-availability-export"
- Print: data-testid="parts-availability-print"

#### Loading/Empty/Error

- Table skeleton; “No parts listed for worksheet.” if empty; error banner for error

### API Integration

- Endpoint:  
  - `GET /api/v1/jobs/{jobCard}/parts-availability?approved=...&advisor=...`  
  - Backend: Calls `PartsAvailability_Sp` stored procedure.

### Validations

- Job Card required

### Test Identifiers

- parts-availability-filters-jobcard
- parts-availability-filters-advisor
- parts-availability-filters-approved
- parts-availability-generate
- parts-availability-table
- parts-availability-row-[itemCode]
- parts-availability-export
- parts-availability-print
- parts-availability-skeleton
- parts-availability-empty
- parts-availability-error

---

## 238. Payments

### Route
`/payments/list`

### Purpose
Provides a searchable, filterable list and export of all outgoing payments for reconciliation and audit.

### PRD Reference
- Screen: Payments
- Features: Receipts & Payments Processing (FR-236, FR-277, FR-283, FR-275)
- User Stories: US-236, US-267, US-275

### Access Roles
- Standard User (view),  
- Finance Supervisor (full),  
- Administrator (full)

### Page Structure

#### Filters Section

- **Payment No**
  - Input

- **Payee**  
  - Autocomplete: SupplierSql, CustomerSql

- **Date Range**
  - From / To date pickers

- **Payment Status**
  - Dropdown: Pending, Settled, Rejected, All

- **Amount Min/Max**
  - Numeric inputs

- “Show Payments” button (data-testid="payments-generate")

#### Payment Table

- **Columns:**
    1. Payment Number
    2. Date
    3. Payee Name
    4. Payment Type
    5. Amount
    6. Status
    7. Reference
    8. Approval
    9. Exported

- **Row**: on click, open payment voucher/print
- **Bulk Select**: for export/print

#### Actions

- Export: data-testid="payments-export"
- Print: data-testid="payments-print"

#### Loading/Empty/Error

- Table skeleton, empty message, error banner

### API Integration

- `GET /api/v1/payments?payee=...&fromDate=...&toDate=...&status=...&amountMin=...&amountMax=...`

### Validations

- None required

### Test Identifiers

- payments-filters-payee
- payments-filters-dates
- payments-filters-status
- payments-filters-amountmin
- payments-filters-amountmax
- payments-generate
- payments-table
- payments-row-[paymentNo]
- payments-select-bulk
- payments-export
- payments-print
- payments-skeleton
- payments-empty
- payments-error

---

## 239. Pdc_Issue_Voucher

### Route
`/payments/pdc-issued`

### Purpose
Lists and allows export/printing of all post-dated cheque (PDC) issue vouchers for banking or follow-up, filtered by recipient and date.

### PRD Reference
- Screen: Pdc_Issue_Voucher
- Features: Receipts & Payments Processing (FR-277, FR-287, FR-278)
- User Stories: US-239

### Access Roles
- Standard User
- Finance Supervisor
- Administrator

### Page Structure

#### Filters

- **Recipient**  
  - Autocomplete: payee (SupplierSql/CustomerSql)

- **Date Range**
  - Issue date From/To

- **PDC Status**
  - Dropdown: Pending, Cleared, Cancelled

- “Show Vouchers” button (data-testid="pdc-issue-voucher-generate")

#### PDC Issue Voucher Table

- **Columns:**
    1. Voucher Number
    2. Issue Date
    3. Payee
    4. Cheque Number
    5. Due Date
    6. Bank
    7. Amount
    8. Status
    9. Remarks

- Row select/click for print

#### Actions

- Export: data-testid="pdc-issue-voucher-export"
- Print: data-testid="pdc-issue-voucher-print"

#### Loading/Empty/Error

- Table skeleton, empty state, error banner

### API Integration

- `GET /api/v1/payments/pdc-issued?recipient=...&fromDate=...&toDate=...&status=...`

### Validations

- None required

### Test Identifiers

- pdc-issue-voucher-filters-recipient
- pdc-issue-voucher-filters-dates
- pdc-issue-voucher-filters-status
- pdc-issue-voucher-generate
- pdc-issue-voucher-table
- pdc-issue-voucher-row-[voucherNo]
- pdc-issue-voucher-export
- pdc-issue-voucher-print
- pdc-issue-voucher-skeleton
- pdc-issue-voucher-empty
- pdc-issue-voucher-error

---

## 240. Pdc_Receipt_Voucher

### Route
`/payments/pdc-received`

### Purpose
Lists all post-dated cheque (PDC) receipts, with filtering and export/printing options for payment management.

### PRD Reference
- Screen: Pdc_Receipt_Voucher
- Features: Receipts & Payments Processing (FR-277, FR-287, FR-278)
- User Stories: US-239

### Access Roles
- Standard User
- Finance Supervisor
- Administrator

### Page Structure

#### Filters

- **Payer**  
  - Autocomplete: CustomerSql/SupplierSql

- **Date Range**
  - Receipt date from/to

- **Status**
  - Dropdown: Pending, Cleared, Cancelled

- “Show Receipts” (data-testid="pdc-receipt-voucher-generate")

#### PDC Receipt Voucher Table

- **Columns:**
    1. Receipt Number
    2. Received Date
    3. Payer
    4. Cheque Number
    5. Due Date
    6. Bank
    7. Amount
    8. Status
    9. Remarks

- Row select for print

#### Actions

- Export: data-testid="pdc-receipt-voucher-export"
- Print: data-testid="pdc-receipt-voucher-print"

#### Loading/Empty/Error

- Table skeleton, empty state, error banner

### API Integration

- `GET /api/v1/payments/pdc-received?payer=...&fromDate=...&toDate=...&status=...`

### Validations

- None required

### Test Identifiers

- pdc-receipt-voucher-filters-payer
- pdc-receipt-voucher-filters-dates
- pdc-receipt-voucher-filters-status
- pdc-receipt-voucher-generate
- pdc-receipt-voucher-table
- pdc-receipt-voucher-row-[receiptNo]
- pdc-receipt-voucher-export
- pdc-receipt-voucher-print
- pdc-receipt-voucher-skeleton
- pdc-receipt-voucher-empty
- pdc-receipt-voucher-error

---

## 241. PendingBillsLetter

### Route
`/reports/pending-bills-letter`

### Purpose
Generates and prints formal letters for pending customer bills, for use in notification and collection follow-up.

### PRD Reference
- Screen: PendingBillsLetter
- Features: Banking & Reconciliation (FR-226), Reporting (FR-290)
- User Stories: US-185, US-290

### Access Roles
- Supervisor
- Administrator

### Page Structure

#### Filters

- **Customer/Account**
  - Autocomplete: CustomerSql

- **Bill Age Bucket**
  - Dropdown: 0–15, 16–30, 31–60, 61–90, 91+, All

- **As of Date**
  - Date picker

- “Generate Letter” button (data-testid="pending-bills-letter-generate")

#### Letter Preview & Actions

- **Preview**: Renders merge-letter for all pending bills for selected customer/bucket
- **Columns (inline in letter/table):**
    1. Bill Number/Ref
    2. Bill Date
    3. Due Amount
    4. Days Overdue

- **Download/Export PDF**: data-testid="pending-bills-letter-export"
- **Print**: data-testid="pending-bills-letter-print"
- **Send by Email**: data-testid="pending-bills-letter-email"

#### Loading/Empty/Error

- Preview skeleton; “No pending bills as of this date.” if empty; error on merge/generation

### API Integration

- `GET /api/v1/reports/pending-bills-letter?customer=...&age=...&asOf=...`
- POST for email send

### Validations

- Customer and as-of date required

### Test Identifiers

- pending-bills-letter-filters-customer
- pending-bills-letter-filters-age
- pending-bills-letter-filters-date
- pending-bills-letter-generate
- pending-bills-letter-preview
- pending-bills-letter-export
- pending-bills-letter-print
- pending-bills-letter-email
- pending-bills-letter-skeleton
- pending-bills-letter-empty
- pending-bills-letter-error

---

## 242. PendingDoList

### Route
`/delivery/pending-do-list`

### Purpose
Shows all delivery orders yet to be fulfilled, supporting inventory/outbound planning.

### PRD Reference
- Screen: PendingDoList
- Features: Order & Sales Management (FR-157, FR-161)
- User Stories: US-144, US-161

### Access Roles
- Supervisor
- Administrator

### Page Structure

#### Filters

- **Order Number/Delivery No**
- **Customer**
- **Date Range**
- **Status**: Pending, Ready, All

- “Generate List“, data-testid="pendingdolist-generate"

#### Pending DO Table

- **Columns:**
    1. Delivery Order No
    2. Order No
    3. Customer
    4. Delivery Date
    5. Items Due
    6. Assigned Staff
    7. Status

- Row open: DO details view in modal

#### Actions

- Export: data-testid="pendingdolist-export"
- Print: data-testid="pendingdolist-print"

#### Loading/Empty/Error

- Skeleton, empty list, error banner

### API Integration

- `GET /api/v1/delivery/pending-do-list?order=...&customer=...&fromDate=...&toDate=...&status=...`

### Test Identifiers

- pendingdolist-filters-order
- pendingdolist-filters-customer
- pendingdolist-filters-dates
- pendingdolist-filters-status
- pendingdolist-generate
- pendingdolist-table
- pendingdolist-row-[doNo]
- pendingdolist-export
- pendingdolist-print
- pendingdolist-skeleton
- pendingdolist-empty
- pendingdolist-error

---

## 243. pendingOrderRegister

### Route
`/orders/pending-register`

### Purpose
Registers all orders still pending for action or escalation, including detailed information needed for bulk follow-up.

### PRD Reference
- Screen: pendingOrderRegister
- Features: Order & Sales Management (FR-157, FR-161)
- User Stories: US-161

### Access Roles
- Supervisor
- Administrator

### Page Structure

#### Filters

- **Order Number**
- **Customer**
- **Date Range**
- **Assigned Staff**

- “Show Pending Orders” (data-testid="pending-order-register-generate")

#### Pending Orders Table

- **Columns:**
    1. Order No
    2. Customer
    3. Order Date
    4. Expected Delivery
    5. Status
    6. Days Pending
    7. Assigned Staff
    8. Amount

- Row click: details

#### Actions

- Export: data-testid="pending-order-register-export"
- Print: data-testid="pending-order-register-print"

#### Loading/Empty/Error

- As above

### API Integration

- `GET /api/v1/orders/pending-register?order=...&customer=...&fromDate=...&toDate=...`

### Test Identifiers

- pending-order-register-filters-order
- pending-order-register-filters-customer
- pending-order-register-filters-dates
- pending-order-register-filters-staff
- pending-order-register-generate
- pending-order-register-table
- pending-order-register-row-[orderNo]
- pending-order-register-export
- pending-order-register-print
- pending-order-register-skeleton
- pending-order-register-empty
- pending-order-register-error

---

## 244. pendingPurchaseDo

### Route
`/purchase/pending-delivery-orders`

### Purpose
Tracks all pending purchase delivery orders (PDOs) for procurement management, filtered by supplier, item, or date.

### PRD Reference
- Screen: pendingPurchaseDo
- Features: Purchase & Procurement Management (FR-179, FR-145)
- User Stories: US-145

### Access Roles
- Supervisor
- Administrator

### Page Structure

#### Filters

- **Supplier**
  - Autocomplete: SupplierSql

- **Item**
  - Autocomplete: ItemsSql

- **Expected Delivery Date**
  - From/To

- **PDO Number**
  - Input

- “Show Pending DOs” (data-testid="pending-purchase-do-generate")

#### Pending Purchase DO Table

- **Columns:**
    1. PDO No
    2. Supplier
    3. Item
    4. Ordered Qty
    5. Pending Qty
    6. Expected Delivery Date
    7. Status
    8. Reference
    9. Date Created

- Export: data-testid="pending-purchase-do-export"
- Print: data-testid="pending-purchase-do-print"

#### Loading/Empty/Error

### API Integration

- `GET /api/v1/purchases/delivery-orders/pending?supplier=...&item=...&fromDate=...&toDate=...&pdonumber=...`
- Backend: Calls PendingPurchaseDO stored procedure.

### Test Identifiers

- pending-purchase-do-filters-supplier
- pending-purchase-do-filters-item
- pending-purchase-do-filters-dates
- pending-purchase-do-filters-pdo
- pending-purchase-do-generate
- pending-purchase-do-table
- pending-purchase-do-row-[pdoNo]-[itemCode]
- pending-purchase-do-export
- pending-purchase-do-print
- pending-purchase-do-skeleton
- pending-purchase-do-empty
- pending-purchase-do-error

---

## 245. PreturnReg

### Route
`/purchase/return-register`

### Purpose
Reports on all purchase returns for supplier reconciliation and refunds.

### PRD Reference
- Screen: PreturnReg
- Features: Purchase & Procurement Management (FR-172, FR-171)
- User Stories: US-145

### Access Roles
- Supervisor
- Administrator

### Page Structure

#### Filters

- **Return No**
- **Supplier**
- **Return Date** (from/to)
- **Item**
- **Status**: Pending, Completed

- “Show Purchase Returns” (data-testid="preturnreg-generate")

#### Purchase Return Register Table

- **Columns:**
    1. Return No
    2. Return Date
    3. Supplier
    4. Item Code
    5. Item Description
    6. Qty
    7. Rate
    8. Amount
    9. Status
    10. Reference

- Row: click for return details

#### Actions

- Export: data-testid="preturnreg-export"
- Print: data-testid="preturnreg-print"

#### Loading/Empty/Error

### API Integration

- `GET /api/v1/purchases/return-register?returnNo=...&supplier=...&fromDate=...&toDate=...&item=...&status=...`

### Test Identifiers

- preturnreg-filters-returnno
- preturnreg-filters-supplier
- preturnreg-filters-dates
- preturnreg-filters-item
- preturnreg-filters-status
- preturnreg-generate
- preturnreg-table
- preturnreg-row-[returnNo]-[itemCode]
- preturnreg-export
- preturnreg-print
- preturnreg-skeleton
- preturnreg-empty
- preturnreg-error

---

## 246. ProdRequest

### Route
`/purchase/product-requests`

### Purpose
Details product requests raised for replenishment or workflow processing.

### PRD Reference
- Screen: ProdRequest
- Features: Purchase & Procurement Management (FR-172)
- User Stories: US-140

### Access Roles
- Standard User
- Supervisor
- Administrator

### Page Structure

#### Filters

- **Request No**
- **Supplier**
- **Request Date** (from/to)
- **Request Status**: Pending, Processed

- “Show Requests” (data-testid="prodrequest-generate")

#### Product Request Table

- **Columns:**
    1. Request No
    2. Request Date
    3. Supplier
    4. Item Code
    5. Description
    6. Qty Requested
    7. Rate
    8. Status
    9. Processed On
    10. Reference

- Row click: request detail / history

#### Actions

- Export: data-testid="prodrequest-export"
- Print: data-testid="prodrequest-print"

#### Loading/Empty/Error

### API Integration

- `GET /api/v1/purchases/product-requests?requestNo=...&supplier=...&fromDate=...&toDate=...&status=...`

### Test Identifiers

- prodrequest-filters-requestno
- prodrequest-filters-supplier
- prodrequest-filters-dates
- prodrequest-filters-status
- prodrequest-generate
- prodrequest-table
- prodrequest-row-[requestNo]-[itemCode]
- prodrequest-export
- prodrequest-print
- prodrequest-skeleton
- prodrequest-empty
- prodrequest-error

---

## 247. ProformaSaleBillPrnt

### Route
`/sales/proforma-bill-print`

### Purpose
Prints proforma (preliminary) sales bills for customer quotations, ready for review or sharing.

### PRD Reference
- Screen: ProformaSaleBillPrnt
- Features: Order & Sales Management (FR-145, FR-152)
- User Stories: US-129

### Access Roles
- Standard User
- Supervisor

### Page Structure

#### Filters

- **Proforma Bill No**
  - Input, required

- “Preview Bill” button (data-testid="proforma-sale-billprnt-preview")

#### Proforma Bill Preview Section

- Renders printable version of the proforma bill
- Fields:
    - Bill No, Date, Customer, Address, Reference, Items Table
      - Columns: Item, Description, Qty, Rate, Amount
    - Totals: Subtotal, Tax, Discounts, Nett

- “Download PDF” (data-testid="proforma-sale-billprnt-download")
- “Print” (data-testid="proforma-sale-billprnt-print")
- "Send by Email" (data-testid="proforma-sale-billprnt-email")

#### Loading/Empty/Error

### API Integration

- `GET /api/v1/sales/proforma-bill-print?id=...`

### Validations

- Proforma Bill No required

### Test Identifiers

- proforma-sale-billprnt-filters-billno
- proforma-sale-billprnt-preview
- proforma-sale-billprnt-download
- proforma-sale-billprnt-print
- proforma-sale-billprnt-email
- proforma-sale-billprnt-skeleton
- proforma-sale-billprnt-empty
- proforma-sale-billprnt-error

---

## 248. PurchaseBill-Import

### Route
`/purchase/bills-import`

### Purpose
Shows details of all imported purchase bills, for accounting and compliance review.

### PRD Reference
- Screen: PurchaseBill-Import
- Features: Purchase & Procurement Management (FR-171)
- User Stories: US-145

### Access Roles
- Supervisor
- Administrator

### Page Structure

#### Filters

- **Bill No**
- **Supplier**
- **Import Date** (from/to)
- **Status**: All, Approved, Pending

- “Show Bills” button (data-testid="purchasebill-import-generate")

#### Purchase Bill Import Table

- **Columns:**
    1. Bill No
    2. Import Date
    3. Supplier
    4. Item Code
    5. Description
    6. Qty
    7. Rate
    8. Amount
    9. Currency
    10. Status
    11. Reference
    12. Remarks

- Click row: Bill detail

#### Actions

- Export: data-testid="purchasebill-import-export"
- Print: data-testid="purchasebill-import-print"

#### Loading/Empty/Error

### API Integration

- `GET /api/v1/purchases/bills-import?billNo=...&supplier=...&fromDate=...&toDate=...&status=...`

### Test Identifiers

- purchasebill-import-filters-billno
- purchasebill-import-filters-supplier
- purchasebill-import-filters-dates
- purchasebill-import-filters-status
- purchasebill-import-generate
- purchasebill-import-table
- purchasebill-import-row-[billNo]-[itemCode]
- purchasebill-import-export
- purchasebill-import-print
- purchasebill-import-skeleton
- purchasebill-import-empty
- purchasebill-import-error

---

## 249. PurchaseBill-Local

### Route
`/purchase/bills-local`

### Purpose
Lists locally sourced purchase bills for financial reconciliation/audit.

### PRD Reference
- Screen: PurchaseBill-Local
- Features: Purchase & Procurement Management (FR-171)
- User Stories: US-145

### Access Roles
- Supervisor
- Administrator

### Page Structure

#### Filters

- **Bill No**
- **Supplier**
- **Purchase Date** (from/to)
- **Status**: All, Approved, Pending

- “Show Bills” (data-testid="purchasebill-local-generate")

#### Purchase Bill Local Table

- **Columns:**
    1. Bill No
    2. Date
    3. Supplier
    4. Item Code
    5. Description
    6. Qty
    7. Rate
    8. Amount
    9. Currency
    10. Status
    11. Reference

- Row action: Bill detail

#### Actions

- Export: data-testid="purchasebill-local-export"
- Print: data-testid="purchasebill-local-print"

#### Loading/Empty/Error

### API Integration

- `GET /api/v1/purchases/bills-local?billNo=...&supplier=...&fromDate=...&toDate=...&status=...`

### Test Identifiers

- purchasebill-local-filters-billno
- purchasebill-local-filters-supplier
- purchasebill-local-filters-dates
- purchasebill-local-filters-status
- purchasebill-local-generate
- purchasebill-local-table
- purchasebill-local-row-[billNo]-[itemCode]
- purchasebill-local-export
- purchasebill-local-print
- purchasebill-local-skeleton
- purchasebill-local-empty
- purchasebill-local-error

---

## 250. PurchaseDo01PDO

### Route
`/purchase/delivery-orders-report`

### Purpose
Summarizes all purchase delivery orders (PDOs) with key analysis attributes for procurement and inventory management, including linkage to purchase orders, supplier, items, and dates.

### PRD Reference
- Screen: PurchaseDo01PDO
- Features: Purchase & Procurement Management (FR-172)
- User Stories: US-146

### Access Roles
- Supervisor
- Administrator

### Page Structure

#### Filters

- **PDO No**
- **Supplier**
- **PDO Date** from/to
- **Linked Purchase Order**
- **Status**: Pending, Completed, All

- “Show PDOs”, data-testid="purchasedo01pdo-generate"

#### PDO Report Table

- **Columns:**
    1. PDO No
    2. PDO Date
    3. Linked Purchase Order No
    4. Supplier
    5. Item Code
    6. Item Description
    7. Qty Ordered
    8. Qty Delivered
    9. Status
    10. Reference
    11. Remarks

- Row click: PDO detail

#### Actions

- Export: data-testid="purchasedo01pdo-export"
- Print: data-testid="purchasedo01pdo-print"

#### Loading/Empty/Error

### API Integration

- `GET /api/v1/purchases/delivery-orders/report?pdoNo=...&supplier=...&fromDate=...&toDate=...&purchaseNo=...&status=...`

### Test Identifiers

- purchasedo01pdo-filters-pdono
- purchasedo01pdo-filters-supplier
- purchasedo01pdo-filters-dates
- purchasedo01pdo-filters-purchase
- purchasedo01pdo-filters-status
- purchasedo01pdo-generate
- purchasedo01pdo-table
- purchasedo01pdo-row-[pdoNo]-[itemCode]
- purchasedo01pdo-export
- purchasedo01pdo-print
- purchasedo01pdo-skeleton
- purchasedo01pdo-empty
- purchasedo01pdo-error

---

## COVERAGE CHECK

| Screen Name                    | Status    |
|--------------------------------|-----------|
| 226. LedgerSummaryActual       | ✅ covered |
| 227. Ledger_ActualDate         | ✅ covered |
| 228. Ledger_Pdc                | ✅ covered |
| 229. LPOAnalysis               | ✅ covered |
| 230. LPODetailsReport          | ✅ covered |
| 231. mailreport                | ✅ covered |
| 232. OMastersReport            | ✅ covered |
| 233. OpeningStkList            | ✅ covered |
| 234. OrderStatus               | ✅ covered |
| 235. OrderStatus1              | ✅ covered |
| 236. Outstanding_OrderStatus   | ✅ covered |
| 237. partsAvailabilityforWorksheet | ✅ covered |
| 238. Payments                  | ✅ covered |
| 239. Pdc_Issue_Voucher         | ✅ covered |
| 240. Pdc_Receipt_Voucher       | ✅ covered |
| 241. PendingBillsLetter        | ✅ covered |
| 242. PendingDoList             | ✅ covered |
| 243. pendingOrderRegister      | ✅ covered |
| 244. pendingPurchaseDo         | ✅ covered |
| 245. PreturnReg                | ✅ covered |
| 246. ProdRequest               | ✅ covered |
| 247. ProformaSaleBillPrnt      | ✅ covered |
| 248. PurchaseBill-Import       | ✅ covered |
| 249. PurchaseBill-Local        | ✅ covered |
| 250. PurchaseDo01PDO           | ✅ covered |

---

# FRONTEND_SPEC.md — Part 11 of 14

This file specifies the following screens:

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

---

## 251. PurchaseDoItemRegister

### Route
`/purchases/delivery-items`

### Purpose
View all purchase delivery order items, with search, filter, and export capabilities.

### PRD References
- FR-171, FR-172, FR-170, FR-171, FR-179
- Feature: Purchase & Procurement Management

### Access Roles
- Supervisor, Procurement Administrator

### Layout
- Full-width card (`glassmorphism`, as per design system)
- Title bar: "Purchase Delivery Order Items"
- Filter/search row (sticky)
- Table of items (virtualized, paginated)
- Export buttons
- Actions per row: View Details

### Table Columns
| Field Label                  | Data Source (View/Field)  | Type     | Notes                          |
|------------------------------|---------------------------|----------|--------------------------------|
| PDONo (Delivery Order No)    | PurchaseDO02Sql.PDONo     | string   | Key/Link                      |
| Delivery Date                | PurchaseDO02Sql.dt        | date     |                                |
| Supplier                     | PurchaseDO02Sql.SuppName  | string   | Human-readable                 |
| Item Code                    | PurchaseDO02Sql.ItemCode  | string   |                                |
| Item Description             | PurchaseDO02Sql.Description| string  |                                |
| Denomination                 | PurchaseDO02Sql.Denom     | string   | Unit                           |
| Quantity                     | PurchaseDO02Sql.Qty       | number   |                                |
| Rate                         | PurchaseDO02Sql.Rate      | number   | Currency format                |
| Amount                       | PurchaseDO02Sql.Amount    | number   |                                |
| Received Quantity            | PurchaseDO02Sql.RcvdQty   | number   | Total received against PO      |
| Purchase Order Reference     | PurchaseDO02Sql.POrder    | string   |                                |
| Section/Category             | PurchaseDO02Sql.SectionDesc| string  |                                |

### Filter/Search
- Supplier: autocomplete
- PDONo: text
- Item Code/Description: autocomplete
- Date range: date from/to
- Purchase Order Ref: text
- Export: PDF/Excel/CSV

### Actions
- [Export as PDF] button (`data-testid="purchasedoitemregister-export-pdf"`)
- [Export as Excel] button (`data-testid="purchasedoitemregister-export-excel"`)
- [View Details] per row button (`data-testid="purchasedoitemregister-row-view"`) — opens item detail modal with full PurchaseDO02Sql data

### Validations & Error States
- API/network error: "Unable to load purchase delivery items. Please try again."
- Empty state: "No delivery order items found for selected filters."
- Loading: Show skeleton rows

### Test Identifiers
- `purchasedoitemregister-title`
- `purchasedoitemregister-filter-supplier`
- `purchasedoitemregister-filter-pdono`
- `purchasedoitemregister-filter-item`
- `purchasedoitemregister-filter-datefrom`
- `purchasedoitemregister-filter-dateto`
- `purchasedoitemregister-table`
- `purchasedoitemregister-row-view`
- `purchasedoitemregister-export-pdf`
- `purchasedoitemregister-export-excel`

---

## 252. PurchaseDoItemRegisterSummary

### Route
`/purchases/delivery-items/summary`

### Purpose
Summary (by item, supplier, or PO) of purchase delivery order items

### PRD References
- FR-171, FR-172

### Access Roles
- Supervisor, Procurement Administrator

### Layout
- Glass card section, title: "Purchase Delivery Items Summary"
- Filter row
- Grouped table, with summary rows
- Export & print controls

### Table Columns
| Label              | Type    | Description                          |
|--------------------|---------|--------------------------------------|
| Group Key (By)     | Derived | Supplier/Item/PO—per selected group  |
| Total DOs          | number  | Count of unique PDONo in group       |
| Total Items        | number  | Count of items                       |
| Total Quantity     | number  | SUM(Qty)                             |
| Total Amount       | number  | SUM(Amount)                          |

### Filters
- Group By: dropdown (Supplier, Item, Purchase Order)
- Date range: from/to
- Export: PDF/Excel/CSV

### Actions
- [Export as PDF] (`purchasedoitemregistersummary-export-pdf`)
- [Export as Excel] (`purchasedoitemregistersummary-export-excel`)
- [Print Summary] button

### Validations & Error States
- Invalid date range: error shown under filter ("Start date must be before end date.")
- Loading: summary row skeletons
- API error: "Could not load summary."

### Test Identifiers
- `purchasedoitemregistersummary-title`
- `purchasedoitemregistersummary-filter-groupby`
- `purchasedoitemregistersummary-filter-datefrom`
- `purchasedoitemregistersummary-filter-dateto`
- `purchasedoitemregistersummary-table`
- `purchasedoitemregistersummary-export-pdf`
- `purchasedoitemregistersummary-export-excel`
- `purchasedoitemregistersummary-print`

---

## 253. PurchaseOrder

### Route
`/purchases/orders`

### Purpose
View list of all Purchase Orders, details and export

### PRD References
- FR-171, FR-172, FR-169

### Access Roles
- Supervisor, Procurement Administrator

### Layout
- Glass main card, title: "Purchase Orders"
- Filters row/top bar
- Table of purchase orders

### Table Columns
| Label                   | Data Source                  | Type    |
|-------------------------|------------------------------|---------|
| Purchase Order No       | Porder01Sql.POrder           | string  |
| Date                    | Porder01Sql.POrdt            | date    |
| Supplier Name           | Porder01Sql.SuppName         | string  |
| PO Type                 | Porder01Sql.PurType          | string  |
| Reference (if any)      | Porder01Sql.Ref              | string  |
| Total Amount            | Porder01Sql.Total            | number  |
| Status                  | Computed (Closed)            | Enum    |
| Currency                | Porder01Sql.Currency         | string  |

### Filters
- Supplier: autocomplete
- PO No: text input
- Date range picker
- Status: dropdown (Open/Closed/All)

### Actions
- [Export as PDF] (`purchaseorder-export-pdf`)
- [Export as Excel] (`purchaseorder-export-excel`)
- [View Details] per row — pops a modal (`purchaseorder-row-view-details`)
- [Print] — print-optimized layout

### Validations & Error States
- Loading: skeleton table
- Empty: "No purchase orders found."
- Error: "Unable to load purchase orders."

### Test Identifiers
- `purchaseorder-title`
- `purchaseorder-filter-supplier`
- `purchaseorder-filter-pono`
- `purchaseorder-filter-datefrom`
- `purchaseorder-filter-dateto`
- `purchaseorder-filter-status`
- `purchaseorder-table`
- `purchaseorder-row-view-details`
- `purchaseorder-export-pdf`
- `purchaseorder-export-excel`
- `purchaseorder-print`

---

## 254. Purchasereg-Ac

### Route
`/purchases/register/account`

### Purpose
Register and audit purchase transactions against accounts; filter and export.

### PRD References
- FR-171, FR-172

### Access Roles
- Supervisor, Procurement Administrator

### Layout
- Glass card, title: "Purchase Register (By Account)"
- Filter/search bar
- Table

### Table Columns
| Label         | Data Source          | Type    |
|---------------|---------------------|---------|
| Purchase Date | LocalPurchase01Sql.InvDt | date  |
| PO / Invoice  | LocalPurchase01Sql.Invoice | string |
| Supplier      | LocalPurchase01Sql.SuppName | string |
| Account       | LocalPurchase01Sql.ac     | string |
| Amount        | LocalPurchase01Sql.Total   | number |
| Currency      | LocalPurchase01Sql.Currency| string |
| Narration     | LocalPurchase01Sql.DeliveryDet | string |

### Filters
- Date range: from/to
- Account: autocomplete
- Supplier: autocomplete
- Currency: dropdown

### Actions
- [Export as PDF] (`purchaseregac-export-pdf`)
- [Export as Excel] (`purchaseregac-export-excel`)
- [Print] (`purchaseregac-print`)

### Validations & Error States
- All fields must be valid; start date <= end date
- API error: "Unable to retrieve purchase register."
- Empty: "No purchases found for selection."
- Loading: table skeleton

### Test Identifiers
- `purchaseregac-title`
- `purchaseregac-filter-datefrom`
- `purchaseregac-filter-dateto`
- `purchaseregac-filter-account`
- `purchaseregac-filter-supplier`
- `purchaseregac-filter-currency`
- `purchaseregac-table`
- `purchaseregac-export-pdf`
- `purchaseregac-export-excel`
- `purchaseregac-print`

---

## 255. Purchasereg-Import

### Route
`/purchases/register/import`

### Purpose
Register of all import purchase transactions, with filter/export

### PRD References
- FR-171, FR-172

### Access Roles
- Supervisor, Procurement Administrator

### Layout
- Glass card, title: "Purchase Register (Import)"
- Filter/search bar
- Table

### Table Columns
| Label         | Data Source            | Type   |
|---------------|-----------------------|--------|
| Import Date   | LocalPurchase01Sql.InvDt  | date  |
| PO/Invoice No | LocalPurchase01Sql.Invoice| string|
| Supplier      | LocalPurchase01Sql.SuppName| string|
| Amount        | LocalPurchase01Sql.Total   | number|
| Currency      | LocalPurchase01Sql.Currency| string|
| Remarks       | LocalPurchase01Sql.Remarks | string|

### Filters
- Date range
- Supplier (autocomplete)
- Invoice/PO number (text)
- Currency

### Actions
- [Export as PDF] (`purchaseregimport-export-pdf`)
- [Export as Excel] (`purchaseregimport-export-excel`)
- [Print] (`purchaseregimport-print`)

### Validations & Error States
- Error messages as per Purchasereg-Ac
- Empty: "No import purchases found."
- Loading: table skeleton

### Test Identifiers
- `purchaseregimport-title`
- `purchaseregimport-filter-datefrom`
- `purchaseregimport-filter-dateto`
- `purchaseregimport-filter-supplier`
- `purchaseregimport-filter-invoice`
- `purchaseregimport-filter-currency`
- `purchaseregimport-table`
- `purchaseregimport-export-pdf`
- `purchaseregimport-export-excel`
- `purchaseregimport-print`

---

## 256. Purchasereg-Local

### Route
`/purchases/register/local`

### Purpose
Register of all local purchase transactions, filter and export.

### PRD References
- FR-171, FR-172

### Access Roles
- Supervisor, Procurement Administrator

### Layout
- Glass card, title: "Purchase Register (Local)"
- Filter bar as per import/ac
- Table

### Table Columns
| Label         | Data Source            | Type   |
|---------------|-----------------------|--------|
| Local Purchase Date | LocalPurchase01Sql.InvDt  | date  |
| Invoice/PO No      | LocalPurchase01Sql.Invoice | string|
| Supplier           | LocalPurchase01Sql.SuppName| string|
| Amount             | LocalPurchase01Sql.Total   | number|
| Currency           | LocalPurchase01Sql.Currency| string|
| Remarks            | LocalPurchase01Sql.Remarks | string|

### Filters
- As per Purchasereg-Import

### Actions
- [Export as PDF] (`purchasereglocal-export-pdf`)
- [Export as Excel] (`purchasereglocal-export-excel`)
- [Print] (`purchasereglocal-print`)

### Validations & Error States
- As above

### Test Identifiers
- `purchasereglocal-title`
- `purchasereglocal-filter-datefrom`
- `purchasereglocal-filter-dateto`
- `purchasereglocal-filter-supplier`
- `purchasereglocal-filter-invoice`
- `purchasereglocal-filter-currency`
- `purchasereglocal-table`
- `purchasereglocal-export-pdf`
- `purchasereglocal-export-excel`
- `purchasereglocal-print`

---

## 257. PurchaseregSupp-Local

### Route
`/purchases/register/local/suppliers`

### Purpose
Supplier-focused summary list for local purchases (supplier, summary by amount/PO count)

### PRD References
- FR-172

### Access Roles
- Supervisor, Procurement Administrator

### Layout
- Glass card title: "Local Supplier Purchase Register Summary"
- Filter/search bar
- Table

### Table Columns
| Label           | Type      |
|-----------------|----------|
| Supplier Name   | string   |
| No. of POs      | number   |
| Total Amount    | number   |
| Currency        | string   |

### Filters
- Supplier (autocomplete)
- Date range

### Actions
- [Export as PDF], [Export as Excel], [Print] (see previous pattern)

### Validations & Error States
- As previous

### Test Identifiers
- `purchaseregsupplocal-title`
- `purchaseregsupplocal-filter-supplier`
- `purchaseregsupplocal-filter-datefrom`
- `purchaseregsupplocal-filter-dateto`
- `purchaseregsupplocal-table`
- `purchaseregsupplocal-export-pdf`
- `purchaseregsupplocal-export-excel`
- `purchaseregsupplocal-print`

---

## 258. PurchaseReturnBill

### Route
`/purchases/returns/bills`

### Purpose
List all purchase return bills, search, filter, and export

### PRD References
- FR-172

### Access Roles
- Supervisor, Procurement Administrator

### Layout
- Glass card, title: "Purchase Return Bills"
- Filter row
- Table

### Table Columns
| Label                | Type      |
|----------------------|----------|
| Return Bill No       | string   |
| Return Date          | date     |
| Supplier             | string   |
| Purchase Invoice/PO  | string   |
| Return Amount        | number   |
| Currency             | string   |
| Reason/Remarks       | string   |

### Filters
- Supplier (autocomplete)
- Date range
- Invoice/PO
- Return bill number

### Actions
- [Export as PDF], [Export as Excel], [Print], [View Details] per row

### Validations & Error States
- Empty: "No purchase return bills found."
- Error: "Could not fetch purchase return bills."
- Loading: table skeleton

### Test Identifiers
- `purchasereturnbill-title`
- `purchasereturnbill-filter-supplier`
- `purchasereturnbill-filter-datefrom`
- `purchasereturnbill-filter-dateto`
- `purchasereturnbill-filter-invoice`
- `purchasereturnbill-filter-returnno`
- `purchasereturnbill-table`
- `purchasereturnbill-row-view`
- `purchasereturnbill-export-pdf`
- `purchasereturnbill-export-excel`
- `purchasereturnbill-print`

---

## 259. Receipts-Backup

### Route
`/receipts/backup`

### Purpose
Historic/backup receipt report, for data safety, reconciliation, and audit.

### PRD References
- FR-277, FR-248

### Access Roles
- Administrator, Supervisor

### Layout
- Glass panel, title: "Receipts Backup Report"
- Filter row
- Table

### Table Columns
| Label         | Type      |
|---------------|----------|
| Receipt No    | string   |
| Date          | date     |
| Payer/Party   | string   |
| Amount        | number   |
| Method        | string   |
| Status        | string   |
| Backup Date   | date     |

### Filters
- Date range
- Status (backed-up/active/archived)
- Payer (autocomplete)

### Actions
- [Export as PDF], [Export as Excel], [Print]

### Validations & Error States
- As above
- "No backup receipts found." for empty state

### Test Identifiers
- `receiptsbackup-title`
- `receiptsbackup-filter-daterange`
- `receiptsbackup-filter-status`
- `receiptsbackup-filter-payer`
- `receiptsbackup-table`
- `receiptsbackup-export-pdf`
- `receiptsbackup-export-excel`
- `receiptsbackup-print`

---

## 260. Receipts

### Route
`/receipts`

### Purpose
Browse, search, and export all standard receipts.

### PRD References
- FR-276, FR-277, FR-278, US-232, US-236

### Access Roles
- Supervisor, Finance Administrator, Standard User (view/export)

### Layout
- Glass card, title: "Receipts"
- Filter/search
- Table

### Table Columns
| Label         | Type      |
|---------------|----------|
| Receipt No    | string   |
| Date          | date     |
| Payer         | string   |
| Method        | string   | (Cash/Bank/Check/Other)
| Amount        | number   |
| Status        | string   | (Posted/Pending/Voided)
| Allocated?    | string   | (Yes/No)
| Remarks       | string   |

### Filters
- Date range
- Method
- Status
- Payer (autocomplete)
- Receipt No

### Actions
- [Export as PDF], [Export as Excel], [Print], [View Details]

### Validations & Error States
- Empty: "No receipts found."
- Error: "Unable to load receipts."
- Loading: skeleton

### Test Identifiers
- `receipts-title`
- `receipts-filter-daterange`
- `receipts-filter-method`
- `receipts-filter-status`
- `receipts-filter-payer`
- `receipts-filter-receiptno`
- `receipts-table`
- `receipts-row-view`
- `receipts-export-pdf`
- `receipts-export-excel`
- `receipts-print`

---

## 261. Report1

### Route
`/reports/custom/report1`

### Purpose
Custom, test, or diagnostics report (admin only). Format and content may be variable.

### PRD References
- Low-level diagnostic/test report

### Access Roles
- Administrator

### Layout
- Glass card
- Title: "Custom Report 1"
- Filter/set-parameter area — generic field for report details (date, id, etc.)
- Results table (configurable columns)
- Export options

### Table Columns
- Dynamic based on runtime selection — by admin

### Actions
- [Run Report] button (`report1-run`)
- [Export as PDF], [Export as Excel], [Print]

### Validations & Error States
- Any filter must be filled if required by the report
- Show empty state if no output
- Show generic "Report failed to generate." error

### Test Identifiers
- `report1-title`
- `report1-filterform`
- `report1-run`
- `report1-table`
- `report1-export-pdf`
- `report1-export-excel`
- `report1-print`

---

## 262. Report222rpt

### Route
`/reports/custom/report-222`

### Purpose
Custom or test report #222 for advanced diagnostics/internal development use.

### PRD References
- Diagnostics/Test (low priority)

### Access Roles
- Administrator

### Layout
- Glass card; title: "Report 222"
- Filter section (admin-defined parameters)
- Results table (columns flexible per backend)
- Export buttons

### Actions
- [Run Report], [Export as PDF], [Export as Excel], [Print]

### Validations & Error States
- As previous

### Test Identifiers
- `report222-title`
- `report222-filterform`
- `report222-run`
- `report222-table`
- `report222-export-pdf`
- `report222-export-excel`
- `report222-print`

---

## 263. Report_stk_ledger

### Route
`/reports/stock/ledger`

### Purpose
Stock ledger report for inventory tracking, filterable by item and date.

### PRD References
- FR-200

### Access Roles
- Supervisor, Inventory Manager, Auditor

### Layout
- Glass card, title: "Stock Ledger Report"
- Filter row
- Table of stock movements

### Table Columns
| Label           | Type    |
|-----------------|---------|
| Date            | date    |
| Item Code       | string  |
| Item Description| string  |
| In/Out          | string  | (Stock In/Stock Out)
| Quantity        | number  |
| Rate            | number  |
| Location        | string  |
| Reference       | string  | (PO/Invoice/DO/etc.)
| Balance         | number  |

### Filters
- Date range
- Item (autocomplete)
- Location

### Actions
- [Export as PDF], [Export as Excel], [Print]

### Validations & Error States
- Invalid date range: inline error next to dates
- No data: "No transactions found for selected criteria."
- Error: Standard API error display

### Test Identifiers
- `reportstkledger-title`
- `reportstkledger-filter-datefrom`
- `reportstkledger-filter-dateto`
- `reportstkledger-filter-item`
- `reportstkledger-filter-location`
- `reportstkledger-table`
- `reportstkledger-export-pdf`
- `reportstkledger-export-excel`
- `reportstkledger-print`

---

## 264. rptWorkStatus

### Route
`/reports/jobs/status`

### Purpose
Report showing all ongoing or recent work/job statuses for operations and tracking.

### PRD References
- FR-121, FR-126

### Access Roles
- Supervisor, Job Management, Administrator

### Layout
- Glass card: "Work Status Report"
- Filter row (date, status, assigned staff, customer, job id, etc.)
- Table showing work/job orders by status

### Table Columns
| Label           | Type      |
|-----------------|-----------|
| Work Order No   | string    |
| Customer        | string    |
| Vehicle         | string    |
| Status          | string    |
| Assigned Staff  | string    |
| Start Date      | date      |
| Due/Comp. Date  | date      |
| Progress Notes  | string    |
| Status Updated  | date/time |

### Filters
- Status (Open/In Progress/Completed/Cancelled/All)
- Date range (start/end)
- Staff (autocomplete)
- Customer (autocomplete)
- Job No

### Actions
- [Export as PDF], [Export as Excel], [Print], [View Details] per row

### Validations & Error States
- Loading: skeleton
- Empty: "No jobs found."
- Error: Standard

### Test Identifiers
- `rptworkstatus-title`
- `rptworkstatus-filter-status`
- `rptworkstatus-filter-datefrom`
- `rptworkstatus-filter-dateto`
- `rptworkstatus-filter-staff`
- `rptworkstatus-filter-customer`
- `rptworkstatus-filter-jobno`
- `rptworkstatus-table`
- `rptworkstatus-row-view`
- `rptworkstatus-export-pdf`
- `rptworkstatus-export-excel`
- `rptworkstatus-print`

---

## 265. rptWorkStatusSummary

### Route
`/reports/jobs/status-summary`

### Purpose
Summary of work/job status by date, advisor, staff, or overall

### PRD References
- FR-122, FR-125

### Access Roles
- Supervisor, Job Supervisor, Admin

### Layout
- Glass card: "Work Status Summary Report"
- Filters: group by (advisor/date), date range, status, staff

### Table Columns
| Label               | Type       |
|---------------------|------------|
| Group (Advisor/Date)| string     |
| Status              | string     |
| No. of Jobs         | number     |
| No. In Progress     | number     |
| No. Completed       | number     |
| No. Cancelled       | number     |

### Filters
- Group By: Advisor/Date
- Date range
- Status

### Actions
- [Export as PDF], [Export as Excel], [Print], [View Group] button

### Validations & Error States
- As above

### Test Identifiers
- `rptworkstatussummary-title`
- `rptworkstatussummary-filter-groupby`
- `rptworkstatussummary-filter-datefrom`
- `rptworkstatussummary-filter-dateto`
- `rptworkstatussummary-filter-status`
- `rptworkstatussummary-table`
- `rptworkstatussummary-row-view`
- `rptworkstatussummary-export-pdf`
- `rptworkstatussummary-export-excel`
- `rptworkstatussummary-print`

---

## 266. SalaryRegister

### Route
`/payroll/salary-register`

### Purpose
HR/payroll report — all salary/wage payment records for staff

### PRD References
- FR-294

### Access Roles
- Administrator, HR, Supervisor

### Layout
- Glass card, title: "Salary Register"
- Filters: date range, employee, department, status
- Table and export controls (see below)

### Table Columns
| Label          | Type   |
|----------------|--------|
| Employee Name  | string |
| Employee ID    | string |
| Department     | string |
| Period         | string |
| Amount         | number |
| Paid/Status    | string |
| Remarks        | string |

### Filters
- Date range (from-to)
- Employee (autocomplete)
- Department (autocomplete)
- Status (dropdown)

### Actions
- [Export as PDF], [Export as Excel], [Print], [View/Edit Salaryslip] per row

### Validations & Error States
- Empty: "No salary records found."
- Error: "Unable to load salary register."
- Loading: skeleton

### Test Identifiers
- `salaryregister-title`
- `salaryregister-filter-daterange`
- `salaryregister-filter-employee`
- `salaryregister-filter-department`
- `salaryregister-filter-status`
- `salaryregister-table`
- `salaryregister-row-salaryslip`
- `salaryregister-export-pdf`
- `salaryregister-export-excel`
- `salaryregister-print`

---

## 267. Salaryslip

### Route
`/payroll/salaryslip/:employeeId/:period`

### Purpose
Individual employee salary slip for a specific period, printable/exportable

### PRD References
- FR-294

### Access Roles
- Administrator, HR, Supervisor

### Layout
- Glass panel, center column
- Title: "Salary Slip: [Employee Name] — [Period]"
- Fields (read-only): Employee name/id, period, department, designation, gross pay, all allowances, all deductions, net pay, payment status, remarks
- Company branding at top (use Company_Report_Header fields per design system, logo/addr, etc.)

### Actions
- [Print Salary Slip] button (`salaryslip-print`)
- [Export as PDF] button (`salaryslip-export-pdf`)

### Fields/Labels
| Label             | Type   |
|-------------------|--------|
| Employee Name     | string |
| Employee ID       | string |
| Period            | string |
| Department        | string |
| Designation       | string |
| Gross Salary      | number |
| Allowances        | number/detail|
| Deductions        | number/detail|
| Net Salary        | number |
| Status            | string |
| Remarks           | string |

### Validations & Error States
- Show "Salary slip not found." when not found
- API/network errors visibly displayed

### Test Identifiers
- `salaryslip-title`
- `salaryslip-print`
- `salaryslip-export-pdf`
- `salaryslip-fields-*` (e.g. `salaryslip-fields-employeeName`, etc.)

---

## 268. SaleBillPrnt-12

### Route
`/sales/bill/print-12/:billId`

### Purpose
Print/export customer sale bill in format #12

### PRD References
- FR-280, FR-340

### Access Roles
- Standard User, Supervisor, Admin

### Layout
- A4 print-optimized glass panel overlay (use Company_Report_Header for top branding)
- All relevant sale bill, item, and customer fields (see SaleBillPrnt below)

### Actions
- [Print Bill] (`salebillprnt12-print`)
- [Export as PDF] (`salebillprnt12-export-pdf`)

### Test Identifiers
- `salebillprnt12-title`
- `salebillprnt12-print`
- `salebillprnt12-export-pdf`

---

## 269. SaleBillPrnt

### Route
`/sales/bill/print/:billId`

### Purpose
Standard customer sale bill — printable/exportable, includes products, customer, taxes.

### PRD References
- FR-280, FR-340

### Access Roles
- Standard User, Supervisor, Admin

### Layout
- Print-optimized with company branding
- Data:
  - Sale Bill No, Date
  - Customer Name, Phone, Address
  - Vehicle (if any, model/plate)
  - Advisor/Staff (if relevant)
  - List of items: code/description/unit/qty/rate/amount
  - Subtotals, tax, discounts, net payable
  - Footer/terms (from company settings)
  - Authorised signatory line

### Actions
- [Print Bill] (`salebillprnt-print`)
- [Export as PDF] (`salebillprnt-export-pdf`)

### Validations & Error States
- "Bill not found." when not found
- Errors on export/print shown inline

### Test Identifiers
- `salebillprnt-title`
- `salebillprnt-print`
- `salebillprnt-export-pdf`
- `salebillprnt-table`
- `salebillprnt-customerinfo`
- `salebillprnt-totals`

---

## 270. SaleBillPrnt_2

### Route
`/sales/bill/print-2/:billId`

### Purpose
Sale bill print in alternate format 2. Details as SaleBillPrnt; layout per legacy requirement.

### PRD References
- FR-280, FR-340

### Access Roles
- Standard User, Supervisor, Admin

### Layout
- All fields, table columns identical to SaleBillPrnt above
- Format/layout as per format 2 — driven by print template settings

### Actions
- [Print Bill] (`salebillprnt2-print`)
- [Export as PDF] (`salebillprnt2-export-pdf`)

### Test Identifiers
- `salebillprnt2-title`
- `salebillprnt2-print`
- `salebillprnt2-export-pdf`

---

## 271. SaleBillPrnt_Insurance

### Route
`/sales/bill/print-insurance/:billId`

### Purpose
Sale bill print in format required for insurance claims/settlement

### PRD References
- FR-280, FR-340

### Access Roles
- Standard User, Supervisor, Admin

### Layout
- As SaleBillPrnt, with all insurance company fields, claim number, insurance-claim-note at bottom, VAT as required

### Actions
- [Print Bill] (`salebillprntinsurance-print`)
- [Export as PDF] (`salebillprntinsurance-export-pdf`)

### Test Identifiers
- `salebillprntinsurance-title`
- `salebillprntinsurance-print`
- `salebillprntinsurance-export-pdf`

---

## 272. SaleBillPrnt_plain

### Route
`/sales/bill/print-plain/:billId`

### Purpose
Sale bill print in plain, non-branded format for plain paper (legal/statutory option)

### PRD References
- FR-280, FR-340

### Access Roles
- Standard User, Supervisor, Admin

### Layout
- As SaleBillPrnt, omitting company branding (minimal heading/format)

### Actions
- [Print Bill] (`salebillprntplain-print`)
- [Export as PDF] (`salebillprntplain-export-pdf`)

### Test Identifiers
- `salebillprntplain-title`
- `salebillprntplain-print`
- `salebillprntplain-export-pdf`

---

## 273. SaleBillPrnt_ribu

### Route
`/sales/bill/print-ribu/:billId`

### Purpose
Specialized sale bill printout for business variants with additional fields

### PRD References
- Sales documentation; business custom format

### Access Roles
- Standard User, Supervisor, Admin

### Layout
- All SaleBillPrnt fields, plus any "Ribu" variant fields as specified by product/business
- Displayed per business rules

### Actions
- [Print Bill] (`salebillprntribu-print`)
- [Export as PDF] (`salebillprntribu-export-pdf`)

### Test Identifiers
- `salebillprntribu-title`
- `salebillprntribu-print`
- `salebillprntribu-export-pdf`

---

## 274. SaleBillPrnt_Sectionwise

### Route
`/sales/bill/print-section/:billId`

### Purpose
Sale bill print, broken out by business section (e.g., labor, parts); alternate format for analysis

### PRD References
- FR-280, FR-340

### Access Roles
- Supervisor, Admin

### Layout
- As SaleBillPrnt, separated item lines per section with subtotals by section

### Actions
- [Print Bill] (`salebillprntsectionwise-print`)
- [Export as PDF] (`salebillprntsectionwise-export-pdf`)

### Test Identifiers
- `salebillprntsectionwise-title`
- `salebillprntsectionwise-print`
- `salebillprntsectionwise-export-pdf`

---

## 275. SalesAnalysisNEW

### Route
`/reports/sales/analysis-new`

### Purpose
Advanced sales analysis and segmentation dashboard/report for power users/supervisors.

### PRD References
- FR-283

### Access Roles
- Supervisor, Admin

### Layout
- Glass summary card — filter section with:
  - Date range
  - Customer (autocomplete)
  - Staff/Salesperson (autocomplete)
  - Product/item/category
  - Group By: select by Month, Staff, Category, Customer
  - (Extra: segmentation controls—Region, Item Type etc.)

- KPI bar with totals: Sales Amount, #Invoices, #Items, Avg. Sale, Top Customer, etc.
- Data Table: Results by row (see group by)
- Data chart/visualization (bar, line, or pie by chosen group)

### Table Columns (flexible—depends on group by, but always includes)
| Label       | Type    |
|-------------|---------|
| Group/Segment| string |
| Sales Value | number  |
| #Invoices   | number  |
| #Items      | number  |
| Discount    | number  |
| Avg. Sale   | number  |

### Actions
- [Export as PDF], [Export as Excel], [Print], [Drill Down/View]

### Validations & Error States
- Insufficient filters: "Please select at least a date range."
- Loading: KPI skeletons + table skeleton
- Empty: "No sales data found."

### Test Identifiers
- `salesanalysisnew-title`
- `salesanalysisnew-filter-daterange`
- `salesanalysisnew-filter-customer`
- `salesanalysisnew-filter-staff`
- `salesanalysisnew-filter-category`
- `salesanalysisnew-filter-groupby`
- `salesanalysisnew-table`
- `salesanalysisnew-chart`
- `salesanalysisnew-export-pdf`
- `salesanalysisnew-export-excel`
- `salesanalysisnew-print`
- `salesanalysisnew-row-drilldown`

---

## COVERAGE CHECK

| Screen Name                   | Status  |
|-------------------------------|---------|
| PurchaseDoItemRegister        | ✅ covered |
| PurchaseDoItemRegisterSummary | ✅ covered |
| PurchaseOrder                 | ✅ covered |
| Purchasereg-Ac                | ✅ covered |
| Purchasereg-Import            | ✅ covered |
| Purchasereg-Local             | ✅ covered |
| PurchaseregSupp-Local         | ✅ covered |
| PurchaseReturnBill            | ✅ covered |
| Receipts-Backup               | ✅ covered |
| Receipts                      | ✅ covered |
| Report1                       | ✅ covered |
| Report222rpt                  | ✅ covered |
| Report_stk_ledger             | ✅ covered |
| rptWorkStatus                 | ✅ covered |
| rptWorkStatusSummary          | ✅ covered |
| SalaryRegister                | ✅ covered |
| Salaryslip                    | ✅ covered |
| SaleBillPrnt-12               | ✅ covered |
| SaleBillPrnt                  | ✅ covered |
| SaleBillPrnt_2                | ✅ covered |
| SaleBillPrnt_Insurance        | ✅ covered |
| SaleBillPrnt_plain            | ✅ covered |
| SaleBillPrnt_ribu             | ✅ covered |
| SaleBillPrnt_Sectionwise      | ✅ covered |
| SalesAnalysisNEW              | ✅ covered |

---

---

# FRONTEND_SPEC.md

---

## 276. SalesAnalysisOne

### Route

`/reports/sales/analysis-one`

### Purpose

Advanced, focused sales analysis screen enabling dynamic slicing and dicing of sales data by key metrics (period, category, item, salesperson, customer). Designed for supervisors and administrators to view segment-specific KPIs and trends in a visually enriched format.

### PRD Reference

- FR-333
- US-283

### Access Roles

- Supervisor
- Administrator

### Components & Layout

- **Header**: "Sales Analysis (Segment/Metric Drilldown)"
- **Filter Bar** (top of page, collapsible for minimalism):
  - Period: Date Range Picker
  - Salesperson: Autocomplete
  - Customer: Autocomplete
  - Product Category: Dropdown (populated from Categories, ItemsSql)
  - Item: Autocomplete (dependent on chosen category)
  - Grouping: Dropdown (e.g., by Salesperson, by Category, by Month)
  - [Apply Filters] button (primary)
- **Main Data Visualization Area**:
  - Line/Bar chart visualizing selected metric over time or dimension.
  - Dynamic metric cards: e.g., Total Sales, Average Invoice Value, Top Item, Top Customer.
  - Data Table of drilldown results.

#### Table Columns

| Column                     | Notes                        |
|----------------------------|------------------------------|
| Date / Period              | ISO local date or label      |
| Salesperson                | Name                         |
| Customer                   | Name                         |
| Category                   | Product/service category     |
| Item                       | Desc/code                    |
| Quantity                   | Decimal as applicable        |
| Amount                     | Local currency, 2 decimals   |
| Discount                   | Value, if available          |
| Net Sales                  | Amount minus discount        |

#### Action Buttons

- Apply Filters (primary)
- Export (PDF, Excel): downloads current visible data
- [Drill Down] (per table row): opens popover/card with deeper data
- Reset Filters (outline)

#### Visuals

- Chart: Use the UI DS line/bar with hover and tap highlighting; color `var(--color-primary)`
- Table: scrollable; sticky headers

#### Validation

- Date range: Both start and end must be selected; show "Please select a start and end date" if missing.
- At least one grouping field must be selected; error: "Choose a grouping dimension to view analysis."
- Export: If table is empty, error: "No data available to export."

#### Loading States

- Chart skeleton shimmer
- Metric card skeleton (rectangle pulse shimmer)
- Table: Show 7+ skeleton rows

#### Empty States

- Chart area: "No sales data for selected criteria." Icon: analysis outline
- Table: "No records found. Try adjusting filters."

#### API Calls

- GET `/api/v1/reports/sales-analysis-one`
  - Params match filter fields above, mapped to existing stored procedure for analysis

#### Error States

- API/network error: Banner at top "Failed to load sales analysis data. Please try again." (toast + section banner)
- Per-filter error as above

---

#### Test Identifiers

- `salesanalysisone-filter-period`
- `salesanalysisone-filter-salesperson`
- `salesanalysisone-filter-customer`
- `salesanalysisone-filter-category`
- `salesanalysisone-filter-item`
- `salesanalysisone-filter-grouping`
- `salesanalysisone-btn-apply`
- `salesanalysisone-btn-reset`
- `salesanalysisone-btn-export`
- `salesanalysisone-chart`
- `salesanalysisone-table`
- `salesanalysisone-table-row`
- `salesanalysisone-drilldown-popover`
- `salesanalysisone-skeleton`
- `salesanalysisone-api-error`
- `salesanalysisone-empty-state`

---

## 277. SalesItemCategorySub

### Route

`/reports/sales/item-category-sub`

### Purpose

Report page displaying sales totals and analysis broken down by item category and subcategory, enabling supervisors to analyze demand and profitability across inventory groupings.

### PRD Reference

- FR-333

### Access Roles

- Supervisor
- Administrator

### Components & Layout

- **Header**: "Sales by Item Category/Subcategory"
- **Filter bar**:
  - Date Range Picker
  - Category Dropdown (populated from ItemsSql)
  - Subcategory Dropdown (populated dynamically by category)
  - Salesperson Autocomplete
  - [Apply Filters] button
- **Data Table**:
  - Category
  - Subcategory
  - Item Code/Name
  - Quantity Sold
  - Sales Value
  - Discount Applied

#### Table Columns

| Column         | Notes                                |
|----------------|--------------------------------------|
| Category       | Name (from ItemsSql.ItemType)        |
| Subcategory    | Name (from ItemsSql.ItemSubType)     |
| Item           | (Code + Description)                 |
| Quantity       | Unit-specific                        |
| Sales Value    | Number, currency format              |
| Discount       | Value, currency format if available  |

#### Action Buttons

- Apply Filters (primary)
- Export (PDF, Excel)
- Reset Filters (outline)

#### Visuals

- Category and Subcategory columns have sticky left
- Table supports vertical scrolling

#### Validation

- Category must be chosen before subcategory is activated
- Date range required; error: "Select a date range to proceed"

#### Loading State

- Table: 8 skeleton rows shimmer
- Export: loading spinner overlay

#### Empty State

- Table: "No sales records match the selected criteria."

#### API Calls

- GET `/api/v1/reports/sales-category-sub`
  - Params: date range, category, subcategory, salesperson

#### Error States

- Banner: "Unable to load category sales report. Retry or contact support."
- Field validation errors under respective fields

---

#### Test Identifiers

- `salesitemcategorysub-filter-date`
- `salesitemcategorysub-filter-category`
- `salesitemcategorysub-filter-subcategory`
- `salesitemcategorysub-filter-salesperson`
- `salesitemcategorysub-btn-apply`
- `salesitemcategorysub-btn-reset`
- `salesitemcategorysub-btn-export`
- `salesitemcategorysub-table`
- `salesitemcategorysub-table-row`
- `salesitemcategorysub-skeleton`
- `salesitemcategorysub-api-error`
- `salesitemcategorysub-empty-state`

---

## 278. SalesLabourPartsReport

### Route

`/reports/sales/labour-parts`

### Purpose

Generate and display a report separating revenue from labour charges and part sales for each job/service order, supporting profitability reviews and compliance.

### PRD References

- FR-333
- US-283

### Access Roles

- Supervisor
- Administrator

### Components & Layout

- **Header**: "Sales — Labour vs Parts Report"
- **Filter Bar**:
  - Date Range Picker (required)
  - Service Advisor: Autocomplete (optional)
  - Customer: Autocomplete (optional)
  - [Apply Filters] button (primary)
- **Data Table**:
  - Invoice Number
  - Date
  - Job Card Number
  - Customer Name
  - Vehicle/Reg No.
  - Service Advisor
  - Labour Total
  - Parts Total
  - Grand Total

#### Table Columns

| Column         | Notes                       |
|----------------|----------------------------|
| Invoice        | Sales01.Bill                |
| Date           | Sales01.BillDt              |
| Job Card       | SalesOrdr01.Ordr            |
| Customer       | SalesOrdr01.custname        |
| Vehicle        | SalesOrdr01.VehNo           |
| Service Adv.   | SalesOrdr01.StaffName       |
| Labour Total   | All 'labour' lines sum      |
| Parts Total    | All 'parts' lines sum       |
| Grand Total    | Invoice total, currency     |

#### Action Buttons

- Apply Filters (primary)
- Export (Excel, PDF)
- Reset Filters

#### Validation

- Both start and end dates are required. Error: "Please select a date range."
- Export only enabled if table has rows.

#### Loading State

- Table skeleton rows and card spin overlay

#### Empty State

- Table: "No jobs or sales invoices found for the selected period."

#### API Calls

- GET `/api/v1/reports/sales-labour-parts`
  - Query: date range, advisor, customer

#### Error States

- Banner: "Failed to load labour/parts sales report. Please refresh the page."

---

#### Test Identifiers

- `saleslabourparts-filter-date`
- `saleslabourparts-filter-advisor`
- `saleslabourparts-filter-customer`
- `saleslabourparts-btn-apply`
- `saleslabourparts-btn-reset`
- `saleslabourparts-btn-export`
- `saleslabourparts-table`
- `saleslabourparts-skeleton`
- `saleslabourparts-api-error`
- `saleslabourparts-empty-state`

---

## 279. SalesMarginReport

### Route

`/reports/sales/margin`

### Purpose

Analytical report presenting gross margin calculations on sales lines (by item, invoice, customer, salesperson), enabling detailed margin visibility for finance and management.

### PRD References

- FR-333

### Access Roles

- Supervisor
- Administrator

### Components & Layout

- **Header**: "Sales Margin Report"
- **Filter Bar**:
  - Date Range Picker (required)
  - Grouping: Dropdown (Invoice, Item, Customer, Salesperson)
  - Salesperson: Autocomplete
  - Customer: Autocomplete
  - [Apply Filters] (primary)
- **Data Table**:
  - Invoice
  - Date
  - Item (Code + Name)
  - Quantity
  - Sale Unit Price
  - Purchase Unit Price (latest)
  - Sale Amount
  - Purchase Amount
  - Margin Amount
  - Margin %
  - Customer
  - Salesperson

#### Table Columns

| Column           | Notes                   |
|------------------|------------------------|
| Invoice #        | Sales01.Bill           |
| Date             | Sales01.BillDt         |
| Item             | ItemsSql display       |
| Qty              | Decimal, unit          |
| Sale Price       | From sale line         |
| Purchase Price   | Derived                |
| Sale Amount      | Qty * sale price       |
| Purchase Amount  | Qty * purchase price   |
| Margin Amount    | Sale - Purchase        |
| Margin %         | Margin/Sale * 100      |
| Customer         | Name                   |
| Salesperson      | Name                   |

#### Action Buttons

- Apply Filters (primary)
- Export (Excel, PDF)
- Reset Filters

#### Validation

- Date range required: "Date range required for margin analysis."
- Grouping required: "Please select grouping."

#### Loading State

- Skeleton rows, spinner over table and export

#### Empty State

- "No sales margin data found for selected filters."

#### API Calls

- GET `/api/v1/reports/sales-margin`
  - Params: dates, grouping, advisor, customer

#### Error States

- Banner: "Failed to calculate/display sales margins."

---

#### Test Identifiers

- `salesmargin-filter-date`
- `salesmargin-filter-grouping`
- `salesmargin-filter-advisor`
- `salesmargin-filter-customer`
- `salesmargin-btn-apply`
- `salesmargin-btn-reset`
- `salesmargin-btn-export`
- `salesmargin-table`
- `salesmargin-skeleton`
- `salesmargin-api-error`
- `salesmargin-empty-state`

---

## 280. SalesMarginReportNew

### Route

`/reports/sales/margin-new`

### Purpose

Alternate or enhanced layout of the Sales Margin Report, with an emphasis on comparative visual metrics per transaction/period.

### PRD References

- FR-333

### Access Roles

- Supervisor
- Administrator

### Components & Layout

- **Header**: "Sales Margin Comparative (New Layout)"
- **Filter Bar**:
  - Date Range Picker (required)
  - Category: Dropdown
  - Salesperson: Autocomplete
  - Customer: Autocomplete
  - [Apply Filters] (primary)
- **Visualization Section**:
  - Bar chart: Margin % per invoice/item/customer (selected)
  - Highlight card: Best margin, worst margin item/customer

- **Data Table** (same basic columns as SalesMarginReport above), with these additions:
  - Top 10 margin items visually highlighted
  - Trend icon in margin % column

#### Action Buttons

- Apply Filters (primary)
- Export (Excel, PDF)
- Reset

#### Validation

- Date range required
- At least one grouping required

#### Loading State

- Chart skeleton bar shimmer
- Table skeleton

#### Empty State

- "No sales margin data in current view."

#### API Calls

- GET `/api/v1/reports/sales-margin-new`
  - As above

#### Error States

- "Could not load margin analysis (new layout)."

---

#### Test Identifiers

- `salesmarginnew-filter-date`
- `salesmarginnew-filter-category`
- `salesmarginnew-filter-advisor`
- `salesmarginnew-filter-customer`
- `salesmarginnew-btn-apply`
- `salesmarginnew-btn-reset`
- `salesmarginnew-btn-export`
- `salesmarginnew-table`
- `salesmarginnew-skeleton`
- `salesmarginnew-chart`
- `salesmarginnew-empty-state`
- `salesmarginnew-api-error`

---

## 281. SalesOrder

### Route

`/orders/sales`

### Purpose

Lists all sales orders with filtering, sorting, and status indicators; supports navigation to order detail/edit.

### PRD References

- FR-138 through FR-161

### Access Roles

- Sales Staff
- Supervisor
- Administrator

### Components & Layout

- **Header**: "Sales Orders"
- **Filter/Search Bar**:
  - Order # (text)
  - Customer (autocomplete)
  - Status (dropdown: Pending, Confirmed, Delivered, Cancelled, etc.)
  - Date Range (order date)
  - [Apply Filters] (primary)
  - [Reset]
- **Main Table**:
  - Order #
  - Customer Name
  - Order Date
  - Assigned Salesperson
  - Status
  - Total (currency)
  - Actions: View/Edit, Print

#### Table Columns

| Column        | Notes                       |
|---------------|----------------------------|
| Order #       | SalesOrdr01.Ordr           |
| Customer      | SalesOrdr01.custname       |
| Date          | SalesOrdr01.Ordt           |
| Salesperson   | SalesOrdr01.StaffName      |
| Status        | Status name, status pill   |
| Total         | SalesOrdr01.Nett           |
| Actions       | View/Edit, Print           |

#### Actions

- View/Edit (icon btn → opens order entry)
- Print Order (opens PDF/download)
- '+ New Order' button (primary, nav to order add form)

#### Validation

- Date fields must be valid/reasonable range
- Customer, status optional

#### Loading State

- Table: 10 skeleton rows
- Full page: skeleton header/filters

#### Empty State

- Table: "No sales orders found."

#### API Calls

- GET `/api/v1/orders/sales` (search/filter params as above)

#### Error States

- Banner: "Unable to retrieve sales orders. Please retry."

---

#### Test Identifiers

- `salesorder-filter-order`
- `salesorder-filter-customer`
- `salesorder-filter-status`
- `salesorder-filter-date`
- `salesorder-btn-apply`
- `salesorder-btn-reset`
- `salesorder-btn-new`
- `salesorder-table`
- `salesorder-table-row`
- `salesorder-table-action-view`
- `salesorder-table-action-print`
- `salesorder-skeleton`
- `salesorder-empty-state`
- `salesorder-api-error`

---

## 282. SalesOrderNEW

### Route

`/orders/sales-new`

### Purpose

Modern/alternate layout (v2) of sales orders list; optimized for wide screens and additional data metrics.

### PRD References

- FR-143, FR-150

### Access Roles

- Supervisor
- Administrator

### Components & Layout

- All as per `/orders/sales`, plus:
  - KPI summary bar: Total open, completed, delayed orders
  - Optionally, batch select for export/print
  - Tabs for quick status filtering (Pending, Delivered, All)

#### Additional Table Columns

- Delivery Date
- Last Updated
- Delivery Status
- Linked Delivery Note? (icon)

#### Actions

- As above, plus Export selected orders action

#### Validation, Loading, Empty, Error

- Same as `/orders/sales`

---

#### Test Identifiers

- `salesordernew-filter-*` (as above)
- `salesordernew-tab-all`
- `salesordernew-tab-pending`
- `salesordernew-tab-delivered`
- `salesordernew-kpi-totalopen`
- `salesordernew-kpi-completed`
- `salesordernew-kpi-delayed`
- `salesordernew-table`
- `salesordernew-btn-export`
- `salesordernew-table-action-select`
- `salesordernew-table-deliverynote-icon`
- Others as per `/orders/sales`

---

## 283. SalesOrderNEW_-bACKUP

### Route

`/orders/sales-new-backup`

### Purpose

Backup/export variant of sales order screen. Used for exporting historical/archival order lists in legacy format.

### PRD References

- FR-152

### Access Roles

- Administrator

### Components

- Header: "Sales Orders (Legacy/Backup)"
- Date range and status filters
- Table with all fields as above, but includes all legacy columns (hidden by default), and legacy export format selector

#### Actions

- Export as legacy (CSV, Excel) — includes all hidden columns

#### Loading/Empty/Validation/Error

- As above

---

#### Test Identifiers

- `salesordernewbackup-btn-export-legacy`
- `salesordernewbackup-table`
- Others as above

---

## 284. SalesOrderNEW_backup

### Route

`/orders/sales-new_backup` (note slightly different route)

### Purpose

Auxiliary backup or test variant of sales order list, used for admin/test access to alternate/snapshot data.

### PRD References

- FR-152

### Access Roles

- Administrator

### Components

- Same table as above, with snapshot/backup indicator
- Date/time of snapshot at top

#### Actions

- Export as backup
- Restore (if role allows)

---

#### Test Identifiers

- `salesordernew_backup-table`
- `salesordernew_backup-btn-export`
- `salesordernew_backup-btn-restore`

---

## 285. SalesOrderStatus

### Route

`/orders/sales/status`

### Purpose

Status summary and tracker for sales orders; displays status KPIs and allows navigation to children (orders).

### PRD References

- FR-156, FR-157

### Access Roles

- Supervisor
- Administrator

### Components & Layout

- Header: "Sales Order Status Overview"
- Filter bar: Status, Date Range, Customer
- KPI row: Orders by status (Pending, Confirmed, Delivered, Cancelled)
- Status Table:
  - Status
  - # Orders
  - # Delivered
  - # Pending
  - Total Value
  - Action: View Orders (navigate to `/orders/sales?status=<status>`)

#### Table Columns

| Column     | Notes                  |
|------------|------------------------|
| Status     | Name, colored pill     |
| # Orders   | Orders in status       |
| # Delivered| Delivered orders       |
| # Pending  | Not delivered/count    |
| Total Value| Sum of Nett            |
| Actions    | View Orders btn        |

---

#### Test Identifiers

- `salesorderstatus-table`
- `salesorderstatus-kpi-pending`
- `salesorderstatus-kpi-delivered`
- `salesorderstatus-kpi-cancelled`
- `salesorderstatus-btn-vieworders`
- Others for filter

---

## 286. SalesRegister-Cust

### Route

`/reports/sales/register-customer`

### Purpose

Tabular register of sales posted to each customer, with details and export for reconciliations.

### PRD References

- FR-333

### Access Roles

- Supervisor
- Administrator

### Components & Layout

- Filter bar: Date Range, Customer (autocomplete), Status
- Table:
  - Register Number or Invoice #
  - Date
  - Customer Name
  - Item/Service
  - Amount
  - Status

#### Table Columns

| Column     | Notes                    |
|------------|--------------------------|
| Register # | Sales01.Bill             |
| Date       | Sales01.BillDt           |
| Customer   | Name                     |
| Item       | Description, ItemsSql    |
| Amount     | Numeric, currency        |
| Status     | Status label/pill        |

---

#### Test Identifiers

- `salesregistercust-filter-date`
- `salesregistercust-filter-customer`
- `salesregistercust-table`
- `salesregistercust-btn-export`
- `salesregistercust-empty`
- `salesregistercust-error`

---

## 287. SalesRegister-detailed

### Route

`/reports/sales/register-detailed`

### Purpose

Detailed register of all sales — by transaction, for detailed audit and compliance.

### PRD References

- FR-333

### Access Roles

- Supervisor
- Administrator

### Components

- Filter bar: Date Range, Status, Salesperson
- Table:
  - Invoice #
  - Date
  - Customer
  - Salesperson
  - Item
  - Qty
  - Amount
  - Discount
  - Tax
  - Nett
  - Status

---

#### Test Identifiers

- `salesregisterdetailed-filter-date`
- `salesregisterdetailed-filter-status`
- `salesregisterdetailed-filter-salesperson`
- `salesregisterdetailed-table`
- `salesregisterdetailed-btn-export`
- Others as above

---

## 288. SalesRegisterServ

### Route

`/reports/sales/register-service`

### Purpose

List and analyze service-related sales invoices (service/repair/labour), supporting breakdown and audit.

### PRD References

- FR-333

### Access Roles

- Supervisor
- Administrator

### Components

- Filter bar: Date Range, Service Advisor, Customer
- Table:
  - Service Invoice #
  - Date
  - Customer
  - Advisor
  - Service Description
  - Labour
  - Parts
  - Total

---

#### Test Identifiers

- `salesregisterserv-filter-date`
- `salesregisterserv-filter-advisor`
- `salesregisterserv-filter-customer`
- `salesregisterserv-table`
- `salesregisterserv-btn-export`
- `salesregisterserv-empty`
- `salesregisterserv-error`

---

## 289. SalesReturnBill

### Route

`/reports/sales/return-bill`

### Purpose

View all sales return bills issued within a time period or for a particular customer, enabling refund, stock return, etc. workflow.

### PRD References

- FR-333

### Access Roles

- Supervisor
- Administrator

### Components

- Filter bar: Date Range, Customer
- Table:
  - Return Bill #
  - Date
  - Customer
  - Item
  - Reason/Remarks
  - Amount

---

#### Test Identifiers

- `salesreturnbill-filter-date`
- `salesreturnbill-filter-customer`
- `salesreturnbill-table`
- `salesreturnbill-btn-export`
- `salesreturnbill-empty`
- `salesreturnbill-error`

---

## 290. SalesReturnRegister

### Route

`/reports/sales/return-register`

### Purpose

Cumulative register of all sales returns, with reason and resolution data; supports filtering, export, and follow-up.

### PRD References

- FR-333

### Access Roles

- Supervisor
- Administrator

### Components

- Filter bar: Date Range, Customer, Item
- Table:
  - Return #/Voucher
  - Date
  - Customer
  - Item
  - Qty
  - Value
  - Reason
  - Status

---

#### Test Identifiers

- `salesreturnregister-filter-date`
- `salesreturnregister-filter-customer`
- `salesreturnregister-filter-item`
- `salesreturnregister-table`
- `salesreturnregister-btn-export`
- `salesreturnregister-empty`
- `salesreturnregister-error`

---

## 291. salesSummary

### Route

`/reports/sales/summary`

### Purpose

Display summarized sales by period, customer, product — trend/total analytic screen (management-level rollups).

### PRD References

- FR-333

### Access Roles

- Supervisor
- Administrator

### Components

- Filter bar: Date Range*, Customer (optional), Product (optional)
- Main: KPI cards (Total Sales, #Invoices, Avg Sale Value)
- Chart: Sales trend (by day/month — bar/line)
- Table:
  - Period/Customer/Product
  - Total Sales
  - # Transactions

---

#### Test Identifiers

- `salessummary-filter-date`
- `salessummary-filter-customer`
- `salessummary-filter-product`
- `salessummary-kpi-total`
- `salessummary-kpi-invoices`
- `salessummary-kpi-avg`
- `salessummary-chart`
- `salessummary-table`
- `salessummary-btn-export`
- `salessummary-empty`
- `salessummary-error`

---

## 292. SplitInvoiceSummary

### Route

`/reports/sales/split-invoice-summary`

### Purpose

Show breakdown of invoices that have been split across parties/items, with per-split transaction and reconciliation/cross-party tracking.

### PRD References

- FR-333

### Access Roles

- Administrator

### Components

- Filter bar: Date Range, Party, Item
- Table:
  - Invoice #
  - Party/Section
  - Item
  - Amount
  - Reason
  - Date
  - Status

---

#### Test Identifiers

- `splitinvoicesummary-filter-date`
- `splitinvoicesummary-filter-party`
- `splitinvoicesummary-filter-item`
- `splitinvoicesummary-table`
- `splitinvoicesummary-btn-export`
- `splitinvoicesummary-empty`
- `splitinvoicesummary-error`

---

## 293. StkLedgerNew

### Route

`/reports/inventory/stock-ledger-new`

### Purpose

Detailed stock ledger report for all stock movements and balances, supporting both period-based and rolling statements.

### PRD References

- FR-203, US-200

### Access Roles

- Inventory Supervisor
- Inventory Manager
- Administrator

### Components & Layout

- Filter bar: Date Range, Warehouse/Location, Item (autocomplete), Category
- Table:
  - Date
  - Item
  - Description
  - Transaction Type (Stock In/Out/Adj)
  - Reference #
  - Qty In
  - Qty Out
  - Balance After
  - Unit Cost
  - Value After

---

#### Test Identifiers

- `stkledgernew-filter-date`
- `stkledgernew-filter-location`
- `stkledgernew-filter-item`
- `stkledgernew-filter-category`
- `stkledgernew-table`
- `stkledgernew-btn-export`
- `stkledgernew-empty`
- `stkledgernew-error`

---

## 294. StkReportNew

### Route

`/reports/inventory/stock-report-new`

### Purpose

Comprehensive inventory status dashboard/report — shows present and historic stock for all items, with filters.

### PRD References

- FR-203

### Access Roles

- Inventory Manager
- Supervisor
- Administrator

### Components

- Filter bar: Location, Category, Item, Date (as-of date)
- KPI cards: Total Stock Value, #Items, #Below Reorder
- Table:
  - Item
  - Description
  - Category
  - Location
  - Current Quantity
  - Reorder Level
  - Item Value (Cost x Qty)
  - Status (Low, OK, Overmax, etc.)

---

#### Test Identifiers

- `stkreportnew-filter-location`
- `stkreportnew-filter-category`
- `stkreportnew-filter-item`
- `stkreportnew-filter-date`
- `stkreportnew-kpi-value`
- `stkreportnew-kpi-items`
- `stkreportnew-kpi-reorder`
- `stkreportnew-table`
- `stkreportnew-btn-export`
- `stkreportnew-empty`
- `stkreportnew-error`

---

## 295. StockAgingReport

### Route

`/reports/inventory/stock-aging`

### Purpose

Report age of all stocks, grouped into aging buckets — used to identify slow-moving or obsolete inventory.

### PRD References

- FR-201

### Access Roles

- Inventory Manager
- Supervisor
- Administrator

### Components

- Filter bar: Category, Location, Aging Bucket (>30 days, 60–90 days, etc.)
- Table:
  - Item
  - Description
  - Category
  - Qty
  - Unit Cost
  - Total Value
  - Age Bucket
  - Days In Stock

---

#### Test Identifiers

- `stockagingreport-filter-category`
- `stockagingreport-filter-location`
- `stockagingreport-filter-bucket`
- `stockagingreport-table`
- `stockagingreport-btn-export`
- `stockagingreport-empty`
- `stockagingreport-error`

---

## 296. StockIN

### Route

`/inventory/stock-in`

### Purpose

Show all stock entries/receipts into inventory for the period, supporting audit, tracking, and reporting.

### PRD References

- FR-189

### Access Roles

- Inventory Clerk
- Inventory Supervisor
- Inventory Manager

### Components

- Filter bar: Date Range, Item, Supplier, Location
- Table:
  - Receipt #
  - Date
  - Supplier
  - Item
  - Qty Received
  - Unit Cost
  - Total Value
  - Warehouse/Location
  - Reference

---

#### Test Identifiers

- `stockin-filter-date`
- `stockin-filter-item`
- `stockin-filter-supplier`
- `stockin-filter-location`
- `stockin-table`
- `stockin-btn-export`
- `stockin-empty`
- `stockin-error`

---

## 297. StockINList

### Route

`/inventory/stock-in-list`

### Purpose

Summarized/compact view of items received into stock within a range, facilitating comparison across periods/products.

### PRD References

- FR-189

### Access Roles

- Inventory Manager
- Supervisor

### Components

- Filter bar: Date Range, Item, Category
- Table:
  - Item
  - Date(s) Received
  - Total Qty Received (in period)
  - #Receipts
  - Avg. Unit Cost
  - Suppliers (comma separated)
  - Status

---

#### Test Identifiers

- `stockinlist-filter-date`
- `stockinlist-filter-item`
- `stockinlist-filter-category`
- `stockinlist-table`
- `stockinlist-btn-export`
- `stockinlist-empty`
- `stockinlist-error`

---

## 298. StockLedger

### Route

`/inventory/stock-ledger`

### Purpose

Legacy layout for stock ledger report (for users preferring classic view or for cross-check).

### PRD References

- FR-200

### Access Roles

- Inventory Supervisor
- Manager
- Administrator

### Components

- Same filters as StkLedgerNew
- Table same as StkLedgerNew but with legacy field order/labels

---

#### Test Identifiers

- `stockledger-table`
- `stockledger-filter-date`
- `stockledger-filter-location`
- `stockledger-filter-item`
- `stockledger-btn-export`
- `stockledger-empty`
- `stockledger-error`

---

## 299. StockOUT

### Route

`/inventory/stock-out`

### Purpose

Show all stock issues/dispatches from inventory for a period — supports tracking, reconciliation, and reporting.

### PRD References

- FR-190

### Access Roles

- Inventory Clerk
- Inventory Supervisor
- Inventory Manager

### Components

- Filter bar: Date Range, Department/Destination, Item, Location, Reason/Type
- Table:
  - Issue #
  - Date
  - Department/Destination
  - Item
  - Qty Issued
  - Unit Cost
  - Total Value
  - Reference/Reason

---

#### Test Identifiers

- `stockout-filter-date`
- `stockout-filter-department`
- `stockout-filter-item`
- `stockout-filter-location`
- `stockout-filter-reason`
- `stockout-table`
- `stockout-btn-export`
- `stockout-empty`
- `stockout-error`

---

## 300. StockOUTList

### Route

`/inventory/stock-out-list`

### Purpose

Period summary of all items dispatched from inventory, enabling supervisors/managers to analyze stock usage.

### PRD References

- FR-190

### Access Roles

- Inventory Manager
- Supervisor

### Components

- Filter bar: Date Range, Item, Department
- Table:
  - Item
  - Lead Department/Destination
  - Total Qty Issued
  - # Issues
  - Avg. Unit Cost
  - Date(s) Issued
  - Status

---

#### Test Identifiers

- `stockoutlist-filter-date`
- `stockoutlist-filter-item`
- `stockoutlist-filter-department`
- `stockoutlist-table`
- `stockoutlist-btn-export`
- `stockoutlist-empty`
- `stockoutlist-error`

---

## COVERAGE CHECK

| Screen                      | Covered |
|-----------------------------|---------|
| SalesAnalysisOne            | ✅      |
| SalesItemCategorySub        | ✅      |
| SalesLabourPartsReport      | ✅      |
| SalesMarginReport           | ✅      |
| SalesMarginReportNew        | ✅      |
| SalesOrder                  | ✅      |
| SalesOrderNEW               | ✅      |
| SalesOrderNEW_-bACKUP       | ✅      |
| SalesOrderNEW_backup        | ✅      |
| SalesOrderStatus            | ✅      |
| SalesRegister-Cust          | ✅      |
| SalesRegister-detailed      | ✅      |
| SalesRegisterServ           | ✅      |
| SalesReturnBill             | ✅      |
| SalesReturnRegister         | ✅      |
| salesSummary                | ✅      |
| SplitInvoiceSummary         | ✅      |
| StkLedgerNew                | ✅      |
| StkReportNew                | ✅      |
| StockAgingReport            | ✅      |
| StockIN                     | ✅      |
| StockINList                 | ✅      |
| StockLedger                 | ✅      |
| StockOUT                    | ✅      |
| StockOUTList                | ✅      |

---

All required screens are specified with field-level detail and supporting UI/validation definitions as per product and design requirements.

---

# FRONTEND_SPEC.md  
*Part 13 of 14 — Covers screens 301–325 as assigned (see below)*

---

## 301. StockRe-OrderStatus

### Route Path
`/inventory/reorder-status`

### Purpose
Displays a report of all stock items at or below their configured reorder level, allowing users to quickly identify items that must be reordered to avoid stockouts. 

### PRD Reference
- FR-195, FR-164, FR-168, FR-211, FR-215 ("Stock & Inventory Management")
- User Story US-157, US-154, US-169

### Access Roles
- Inventory Manager (full)
- Inventory Supervisor (full)
- Purchasing User (view/report only)
- View Only for Standard User

### Data Source
- GET `/api/v1/inventory/reorder-status`  
  [Assumed: reads from view exposing Items at/under reorder threshold, combines data from `ItemsSql` and stock count from `GetSockQty`/`StockPos` SP.]

### UI Structure

#### Page Structure
- **Page Section:** "Stock Re-Order Status"
- Filter/toolbar section (with export/print)
- Table of stock items meeting reorder trigger
- Info banner for context
- Error and empty states

#### Filters/Search Bar
- Item Code or Description (text search, autocomplete)
- Category (dropdown, from ItemType)
- Location (dropdown, populated via `GetLocations`)
- Show only: [ ] Below Reorder Level (always toggled ON)
- [Export], [Print]

#### Table Columns
| Column             | Label                | Type     | Format              |
|--------------------|----------------------|----------|---------------------|
| itemCode           | Code                 | text     | monospace, clickable to item report |
| description        | Description          | text     |                     |
| category           | Category             | text     |                     |
| location           | Location             | text     |                     |
| reorderLevel       | Reorder Level        | number   | right-align         |
| currentStock       | Current Stock        | number   | right-align, highlight if 0 |
| supplier           | Preferred Supplier   | text     |                     |
| lastPurchaseDate   | Last Purchased       | date     | yyyy-mm-dd, or ""   |
| lastIssued         | Last Issued          | date     | yyyy-mm-dd, or ""   |
| alert              | Alert                | status   | "Re-order now" if ≤ reorder level (status-pill) |

#### Actions Available
- Filter/search fields (see above)
- Export to Excel/PDF (`data-testid='stockreorder-export-btn'`)
- Print report (`data-testid='stockreorder-print-btn'`)
- Drilldown on item code to view item movement/history (`data-testid='stockreorder-item-drill-btn'`)
- If user has purchasing rights: Quick add to Purchase Request (`data-testid='stockreorder-purchase-btn'`), opens purchase entry form with selected item prefilled

#### Validations
- All filters are optional; search text min 2 chars
- If "Export" clicked and no data: disable button (with tooltip "No data to export.")

#### Loading/Error/Empty States
- **Loading:** Skeleton rows in table, spinner in the filter bar, `data-testid='stockreorder-loading'`
- **Error:** Banner at top, red border, "Error loading reorder status: [error]" (`data-testid='stockreorder-error'`)
- **Empty:** Info message: "No items currently at or below reorder level." (`data-testid='stockreorder-empty'`)

#### Accessibility
- Table headers use `<th scope='col'>`
- Row click/drill-down is keyboard accessible (`tab` focus)
- All buttons receive visible focus outlines

#### Test Identifiers
- `stockreorder-filter-search`
- `stockreorder-filter-category`
- `stockreorder-filter-location`
- `stockreorder-table`
- `stockreorder-table-row`
- `stockreorder-export-btn`
- `stockreorder-print-btn`
- `stockreorder-item-drill-btn`
- `stockreorder-purchase-btn`
- `stockreorder-error`
- `stockreorder-loading`
- `stockreorder-empty`

---

## 302. StockStatement-1

### Route Path
`/inventory/stock-statement/summary`

### Purpose
Displays a summary of all current stock positions (quantities, value, location, etc.) as of today or a selected date, grouped by item or category.

### PRD Reference
- FR-194, FR-198, FR-199, FR-213
- US-154, US-161, US-165

### Access Roles
- Inventory Manager, Inventory Supervisor, Finance Team (full)
- Standard User (read/report only)

### Data Source
- GET `/api/v1/inventory/stock-statement/summary` (reads from an API that runs a stock position summary as of the selected date; corresponds to summary report variant)

### UI Structure

#### Page Structure
- Page Heading: "Stock Statement (Summary)"
- Date selector
- Category/Location filters
- Export/print controls
- Table of item summaries

#### Filters
- As of Date (date picker, default = today) — `data-testid='stockstatement1-date'`
- Category (dropdown; all ItemTypes; `data-testid='stockstatement1-category'`)
- Location (dropdown; from GetLocations)
- [Filter] button (debounced or manual)

#### Table Columns
| Column         | Label          | Type   | Details                         |
|----------------|----------------|--------|---------------------------------|
| itemCode       | Code           | text   | monospace                      |
| description    | Description    | text   |                                 |
| category       | Category       | text   |                                 |
| location       | Location       | text   |                                 |
| openingQty     | Opening Qty    | number | for selected date               |
| receipts       | Receipts       | number |                                 |
| issues         | Issues         | number |                                 |
| closingQty     | Closing Qty    | number |                                 |
| unitCost       | Unit Cost      | money  |                                 |
| value          | Value          | money  | closingQty * unitCost           |

#### Actions Available
- Export as Excel/PDF (`data-testid='stockstatement1-export-btn'`)
- Print (`data-testid='stockstatement1-print-btn'`)
- Drilldown on itemCode to full detail (`data-testid='stockstatement1-drill-btn'`)

#### Validations
- Date must not be future
- Export/print only enabled if data exists

#### Loading/Error/Empty States
- Skeleton for table (rows+headers), spinner next to heading
- Error: Top alert bar, `data-testid='stockstatement1-error'`
- Empty: "No stock items for chosen filters/date.", `data-testid='stockstatement1-empty'`

#### Test Identifiers
- `stockstatement1-date`
- `stockstatement1-category`
- `stockstatement1-location`
- `stockstatement1-table`
- `stockstatement1-row`
- `stockstatement1-export-btn`
- `stockstatement1-print-btn`
- `stockstatement1-drill-btn`
- `stockstatement1-error`
- `stockstatement1-loading`
- `stockstatement1-empty`

---

## 303. StockStatement-dd

### Route Path
`/inventory/stock-statement/datewise`

### Purpose
Displays a date-driven view of inventory positions, letting the user analyze stock statement for a series of dates or a selected date, with changes highlighted across days.

### PRD Reference
- FR-202, US-154, US-165

### Access Roles
- Inventory Supervisor, Inventory Manager (full)
- Finance Team (view only)

### Data Source
- GET `/api/v1/inventory/stock-statement/datewise?date=YYYY-MM-DD`  
- Reads time-sliced statements for the selected date

### UI Structure

#### Page Structure
- Page Heading: "Stock Statement (Datewise)"
- Date picker
- Filter by item/category/location (see above)
- Export/print controls
- Table section

#### Table Columns
| Column         | Label        | Type   | Details                 |
|----------------|--------------|--------|-------------------------|
| date           | Date         | date   | fixed, left column      |
| itemCode       | Code         | text   |                         |
| description    | Description  | text   |                         |
| openingQty     | Opening Qty  | number |                         |
| closingQty     | Closing Qty  | number |                         |
| unitCost       | Unit Cost    | money  |                         |
| value          | Value        | money  |                         |

#### Actions Available
- Select date, filters ( triggers reload )
- Export/Print
- Drilldown to item history

#### Validations
- Date required, cannot be future

#### Loading/Error/Empty States
- Skeleton, top-level spinner, error banner, "No data for this date" in table if empty

#### Test Identifiers
- `stockstatementdd-date`
- `stockstatementdd-table`
- `stockstatementdd-export-btn`
- `stockstatementdd-print-btn`
- `stockstatementdd-drill-btn`
- `stockstatementdd-error`
- `stockstatementdd-loading`
- `stockstatementdd-empty`

---

## 304. StockStatement-FromItemFile

### Route Path
`/inventory/stock-statement/basefile`

### Purpose
Reports the inventory statement calculated from the base item file (i.e. initial records or master list, not transactional flows), used for reconciliation or validation with the live system.

### PRD Reference
- US-154 (compliance), FR-216, inferred need for static/itemfile reconciliation

### Access Roles
- Inventory Manager (full)
- Admin/IT/Finance (full)
- Supervisor (view only)

### Data Source
- GET `/api/v1/inventory/stock-statement/basefile`

### UI Structure

#### Page Structure
- Heading: "Stock Statement (From Item File)"
- Info banner: "Shows inventory position per the initial/master item file"
- Export/print
- Table section

#### Filters
- Category
- Location

#### Table Columns
| Column       | Label            | Type   | Details           |
|--------------|------------------|--------|-------------------|
| itemCode     | Code             | text   |                   |
| description  | Description      | text   |                   |
| category     | Category         | text   |                   |
| location     | Location         | text   |                   |
| quantity     | Initial Stock Qty| number | from base file    |
| unitCost     | Unit/Init. Cost  | money  |                   |
| value        | Value            | money  | quantity*unitCost |

#### Actions Available
- Export/Print

#### Validations
- None; all filters are optional

#### Loading/Error/Empty States
- Standard as above

#### Test Identifiers
- `stockstatementbasefile-category`
- `stockstatementbasefile-location`
- `stockstatementbasefile-table`
- `stockstatementbasefile-export-btn`
- `stockstatementbasefile-print-btn`
- `stockstatementbasefile-error`
- `stockstatementbasefile-loading`
- `stockstatementbasefile-empty`

---

## 305. StockStatement

### Route Path
`/inventory/stock-statement`

### Purpose
Shows the comprehensive inventory statement for any given period, including all stock movements, receipts, issues, adjustments, and balances.

### PRD Reference
- FR-202, FR-200, US-154, US-164, US-155

### Access Roles
- Inventory Manager, Inventory Supervisor, Finance Team (full)

### Data Source
- GET `/api/v1/inventory/stock-statement?from=YYYY-MM-DD&to=YYYY-MM-DD`

### UI Structure

#### Page Structure
- Heading: "Stock Statement"
- Date range selector: From/To, required, default: this month
- Filters: Item, Category, Location
- Export/Print
- Table

#### Table Columns
| Column         | Label        | Type   | Details                  |
|----------------|--------------|--------|--------------------------|
| itemCode       | Code         | text   |                          |
| description    | Description  | text   |                          |
| openingQty     | Opening Qty  | number |                          |
| receipts       | Receipts     | number |                          |
| issues         | Issues       | number |                          |
| adjustments    | Adjustments  | number | Stock corrections, zero if none|
| closingQty     | Closing Qty  | number | calculated               |
| unitCost       | Unit Cost    | money  |                          |
| value          | Value        | money  | closingQty * unitCost    |

#### Actions Available
- Filter/reload data
- Export/Print
- Drill to movement ledger for item

#### Validations
- Date range required; "From" must be before "To"; no future dates
- Show error if API fails

#### Loading/Error/Empty States
- Standard

#### Test Identifiers
- `stockstatement-from`
- `stockstatement-to`
- `stockstatement-category`
- `stockstatement-location`
- `stockstatement-table`
- `stockstatement-row`
- `stockstatement-export-btn`
- `stockstatement-print-btn`
- `stockstatement-drill-btn`
- `stockstatement-error`
- `stockstatement-loading`
- `stockstatement-empty`

---

## 306. StockStatement1

### Route Path
`/inventory/stock-statement/variant`

### Purpose
Alternate view of the inventory statement. Same data as StockStatement but with a simplified layout or distinct grouping for specific management reporting.

### PRD Reference
- US-154, FR-202 ("Stock Statement — alternate layout/variant")

### Access Roles
- Inventory Manager (full), Finance/Reports (full)

### Data Source
- GET `/api/v1/inventory/stock-statement/variant?...` (implementation may use same data as StockStatement)

### UI Structure

#### Table Columns
| Column         | Label        | Type   |
|----------------|--------------|--------|
| itemCode       | Item Code    | text   |
| description    | Description  | text   |
| openingQty     | Opening      | number |
| receipts       | In           | number |
| issues         | Out          | number |
| closingQty     | Closing      | number |
| value          | Value        | money  |

#### Actions
- Same as StockStatement (filter, export, print, drilldown)

#### All states, validations, identifiers as per StockStatement.

---

## 307. StockValuationReport

### Route Path
`/inventory/stock-valuation`

### Purpose
Shows a detailed report of the value of all inventory/stock as of a particular date, permitting selection of valuation method (FIFO, Weighted Avg, etc.), for financial and audit purposes.

### PRD Reference
- FR-198, FR-203, US-158, US-293

### Access Roles
- Inventory Manager, Finance Team, Auditor (full)

### Data Source
- GET `/api/v1/inventory/valuation-report?asOfDate=YYYY-MM-DD&method=fifo|weighted`

### UI Structure

#### Page Structure
- Heading: "Stock Valuation Report"
- Valuation Method selector (dropdown: FIFO, Weighted Avg, others from settings)
- As of Date (date picker, required)
- Filters: Item type, Location
- Table
- Export/print controls

#### Table Columns
| Column         | Label                | Type   |
|----------------|----------------------|--------|
| itemCode       | Item Code            | text   |
| description    | Description          | text   |
| category       | Category             | text   |
| location       | Location             | text   |
| quantity       | Quantity             | number |
| unitCost       | Eval. Unit Cost      | money  |
| value          | Value                | money  |
| method         | Valuation Method     | text   |

#### Actions Available
- Change valuation method (triggers reload)
- Date picker (triggers reload)
- Export to Excel/PDF
- Print

#### Validations
- As of Date required, cannot be future; Method required
- Show API errors inline; show "No items found" if empty

#### Loading/Error/Empty States
- Skeleton on table, spinner on heading
- Banner for errors

#### Test Identifiers
- `stockvaluation-method`
- `stockvaluation-date`
- `stockvaluation-category`
- `stockvaluation-location`
- `stockvaluation-table`
- `stockvaluation-row`
- `stockvaluation-export-btn`
- `stockvaluation-print-btn`
- `stockvaluation-error`
- `stockvaluation-loading`
- `stockvaluation-empty`

---

## 308. StockValuationSummaryReport

### Route Path
`/inventory/stock-valuation/summary`

### Purpose
Provides a summarized view of total inventory values grouped by category, location, or other dimension, as of a certain date, useful for financial reporting.

### PRD Reference
- US-158, FR-203 ("summary view")

### Access Roles
- Inventory Manager, Finance, Auditor

### Data Source
- GET `/api/v1/inventory/valuation-summary?asOfDate=YYYY-MM-DD&groupBy=category|location`

### UI Structure

#### Filters
- As of Date (date picker)
- Group By: Category/Location
- Export/Print

#### Table Columns
| Column         | Label        | Type   |
|----------------|--------------|--------|
| groupValue     | Category/Loc.| text   |
| totalQty       | Total Qty    | number |
| totalValue     | Total Value  | money  |

#### Actions
- Change groupby, date
- Export, print

#### States/Validation
- Date required

#### Test Identifiers
- `stockvaluationsummary-date`
- `stockvaluationsummary-groupby`
- `stockvaluationsummary-table`
- `stockvaluationsummary-row`
- `stockvaluationsummary-export-btn`
- `stockvaluationsummary-print-btn`
- `stockvaluationsummary-error`
- `stockvaluationsummary-loading`
- `stockvaluationsummary-empty`

---

## 309. SupplierAgeWiseSummary-Foreign-old

### Route Path
`/suppliers/agewise-summary/foreign-old`

### Purpose
Shows an agewise summary of outstanding balances for foreign suppliers (legacy method layout).

### PRD Reference
- US-273, US-273 (alternate/old)

### Access Roles
- Finance Supervisor, Administrator, Auditor

### Data Source
- GET `/api/v1/reports/suppliers/agewise-foreign-old?asOfDate=YYYY-MM-DD`

### UI Structure

#### Filters
- As of Date (date picker, required)
- Export/Print

#### Table Columns
| Column         | Label     | Type   |
|----------------|-----------|--------|
| supplierId     | Supplier  | text   |
| name           | Name      | text   |
| D15            | 0-15 days | money  |
| D30            | 16-30 days| money  |
| D60            | 31-60 days| money  |
| D90            | 61-90 days| money  |
| D120           | 91-120    | money  |
| D360           | 120+ days | money  |
| total          | Total     | money  |

#### Actions
- Export
- Print

#### Test Identifiers
- `suppagewiseforeignold-date`
- `suppagewiseforeignold-table`
- `suppagewiseforeignold-export-btn`
- `suppagewiseforeignold-print-btn`
- `suppagewiseforeignold-error`
- `suppagewiseforeignold-loading`
- `suppagewiseforeignold-empty`

---

## 310. SupplierAgeWiseSummary-Foreign

### Route Path
`/suppliers/agewise-summary/foreign`

### Purpose
Current agewise summary of foreign suppliers' outstanding payables. (Preferred for main use.)

### PRD Reference
- US-273
- Functional reporting for foreign suppliers (current method).

### Access Roles
- Finance Supervisor, Auditor

### Data Source
- GET `/api/v1/reports/suppliers/agewise-foreign?asOfDate=YYYY-MM-DD`

### UI/Columns
Same as previous screen, but API and report layout subject to improvements.

#### Test Identifiers
- Identical prefix: `suppagewiseforeign` vs previous.

---

## 311. SupplierAgeWiseSummary-Local-old

### Route Path
`/suppliers/agewise-summary/local-old`

### Purpose
Legacy report for local suppliers' agewise outstanding balances.

### PRD Reference
- US-273 (reporting, alternate/old)

### Access Roles
- Finance, Admin

### Data Source
- GET `/api/v1/reports/suppliers/agewise-local-old?asOfDate=YYYY-MM-DD`

### Table Columns
- [As per previous, but only local suppliers]

#### Test Identifiers
- `suppagewiselocalold-date`, etc.

---

## 312. SupplierAgeWiseSummary-Local

### Route Path
`/suppliers/agewise-summary/local`

### Purpose
Current report for agewise balance of local suppliers.

### PRD Reference
- US-273

### Access Roles
- Same as above

### Data Source
- GET `/api/v1/reports/suppliers/agewise-local?asOfDate=YYYY-MM-DD`

### Table/Fields
- As per other agewise supplier summary screens

#### Test Identifiers
- `suppagewiselocal-date`, etc.

---

## 313. SupplierAgeWiseSummary

### Route Path
`/suppliers/agewise-summary/all`

### Purpose
Aggregate agewise summary for all suppliers (local + foreign).

### PRD Reference
- US-273

### Access Roles
- Finance, Admin, Audit

### Data Source
- GET `/api/v1/reports/suppliers/agewise-all?asOfDate=YYYY-MM-DD`

### Table Columns
| Column     | Label    | Type   |
|------------|----------|--------|
| supplierId | Supplier | text   |
| name       | Name     | text   |
| country    | Country  | text   |
| ... D columns ...     |        |
| total      | Total    | money  |

#### Test Identifiers
- `suppagewiseall-date`, etc.

---

## 314. SupplierBillWisePending-Both

### Route Path
`/suppliers/billwise-pending/both`

### Purpose
Lists all pending supplier bills, both local and foreign, by supplier.

### PRD Reference
- US-273, US-61, FR-145

### Access Roles
- Finance, Supervisor, Auditor

### Data Source
- GET `/api/v1/reports/suppliers/billwise-pending/both?asOfDate=YYYY-MM-DD`

### Table Columns
| Column         | Label        | Type   |
|----------------|--------------|--------|
| supplierId     | Supplier     | text   |
| supplierName   | Name         | text   |
| type           | Local/Foreign| badge  |
| pendingAmount  | Pending      | money  |
| pendingSince   | Since        | date   |

#### Actions
- Export/Print

#### Test Identifiers
- `billwisependingboth-date`
- `billwisependingboth-table`
- `billwisependingboth-export-btn`
- `billwisependingboth-print-btn`
- etc.

---

## 315. SupplierBillWisePending-Foreign-old

### Route Path
`/suppliers/billwise-pending/foreign-old`

### Purpose
Pending foreign supplier bills (legacy view).

### PRD Reference
- US-273, FR-145 (legacy/old version)

### Data Source
- GET `/api/v1/reports/suppliers/billwise-pending/foreign-old?asOfDate=YYYY-MM-DD`

### Columns, Actions
- As above.

---

## 316. SupplierBillWisePending-Foreign

### Route Path
`/suppliers/billwise-pending/foreign`

### Purpose
Current pending foreign supplier bills.

### PRD Reference
- US-273, FR-145

### Data Source
- GET `/api/v1/reports/suppliers/billwise-pending/foreign?asOfDate=YYYY-MM-DD`

### Columns, Actions
- As above.

---

## 317. SupplierBillWisePending-local

### Route Path
`/suppliers/billwise-pending/local`

### Purpose
Current pending local supplier bills.

### Data Source
- GET `/api/v1/reports/suppliers/billwise-pending/local?asOfDate=YYYY-MM-DD`

### UI/Columns
- Same as previous.

---

## 318. SupplierBillWisePending

### Route Path
`/suppliers/billwise-pending`

### Purpose
All pending supplier bills; main/balanced reporting view.

### Data Source
- GET `/api/v1/reports/suppliers/billwise-pending?asOfDate=YYYY-MM-DD`

### UI/Columns/Actions
- As above.

---

## 319. SupplierList

### Route Path
`/suppliers`

### Purpose
Full list of supplier master records with filters/search, CSV/XML/Excel export, and per-row view/edit for users with permissions.

### PRD Reference
- US-61, US-51, US-52, US-62, FR-69, FR-56, FR-57, FR-58, FR-68

### Access Roles
- Standard User (view only)
- Supervisor, Admin (full, including add/edit)

### Data Source
- GET `/api/v1/suppliers`

### UI Structure

#### Filters/Search
- Supplier Name (autocomplete, `supplierlist-filter-name`)
- Code/ID (`supplierlist-filter-code`)
- Category (`supplierlist-filter-category`)
- Location/Area
- Status (active/inactive)
- Export/Import

#### Table Columns
| Column         | Label        | Type   |
|----------------|--------------|--------|
| supplierId     | Supplier ID  | text   |
| suppName       | Name         | text   |
| contactPerson  | Contact      | text   |
| phone1         | Phone        | text   |
| email          | Email        | text   |
| category       | Category     | text   |
| areaName       | Area         | text   |
| status         | Status       | badge/active/inactive|
| created        | Created      | date   |
| actions        | [View/Edit]  | buttons| if permitted

#### Actions
- Search, filter, export to Excel/PDF
- Add New Supplier [supervisor+], opens `/suppliers/new`
- Edit (per row, opens form)
- Bulk Import [supervisor+]
- View details (modal or drawer), for read-only users

#### Test Identifiers
- `supplierlist-filter-name`
- `supplierlist-filter-code`
- `supplierlist-filter-category`
- `supplierlist-table`
- `supplierlist-row`
- `supplierlist-export-btn`
- `supplierlist-import-btn`
- `supplierlist-add-btn`
- `supplierlist-edit-btn`
- `supplierlist-view-btn`
- `supplierlist-error`
- `supplierlist-loading`
- `supplierlist-empty`

---

## 320. SupplierOutstandingSummary

### Route Path
`/suppliers/outstanding-summary`

### Purpose
Summarizes all outstanding balances for all suppliers, grouped by supplier and age, for procurement/finance planning.

### PRD Reference
- US-273

### Data Source
- GET `/api/v1/reports/suppliers/outstanding-summary?asOfDate=YYYY-MM-DD`

### Table Columns
| Column         | Label        | Type   |
|----------------|--------------|--------|
| supplierId     | Supplier ID  | text   |
| suppName       | Name         | text   |
| totalDue       | Open Invoices| money  |
| due15          | 0-15 days    | money  |
| due30          | 16-30 days   | money  |
| dueOther...    | ...          | money  |

#### Actions
- Filter by asOfDate, export, print

#### Test Identifiers
- `supplieroutstandingsummary-date`
- `supplieroutstandingsummary-table`
- etc.

---

## 321. TechnicianEfficency

### Route Path
`/reports/technician-efficiency`

### Purpose
Business report dashboard for technician work output vs planned, time, or benchmark, to aid staff/capacity management.

### PRD Reference
- US-107, US-169, US-104

### Access Roles
- Supervisor, Admin, Manager (full)

### Data Source
- GET `/api/v1/reports/technicians/efficiency?from=YYYY-MM-DD&to=YYYY-MM-DD`

### UI Structure

#### Filters
- Date range (required)
- Technician (dropdown/all)

#### Table Columns
| Column         | Label        | Type   |
|----------------|--------------|--------|
| technicianId   | Technician   | text   |
| name           | Name         | text   |
| jobsCompleted  | Jobs Done    | int    |
| targetJobs     | Target       | int    |
| efficiency     | % Efficiency | percent|
| avgDuration    | Avg Duration | time   |
| totalHours     | Total Hours  | time   |

#### Actions
- Filter, export, print

#### Test Identifiers
- `technicanefficiency-from`
- `technicanefficiency-to`
- `technicanefficiency-technician`
- `technicanefficiency-table`
- etc.

---

## 322. test

### Route Path
`/reports/test`

### Purpose  
Test/diagnostic report (used by internal/admin only). Shows output of an ad-hoc/test SQL/report for system validation.

### PRD Reference
- Used for QA, no customer/business data.

### Access Roles
- Admin only

### Data Source
- GET `/api/v1/reports/test`

### Structure
- Heading: "Test Report"
- Info: "This report is for diagnostic/testing only"
- Output: Raw table, whatever columns SP returns
- Actions: Export/Print

#### Test Identifiers
- `testreport-table`
- ...

---

## 323. TotalSalesReport

### Route Path
`/reports/total-sales`

### Purpose
Shows sales totals for a given period, grouped by day/week/month/category as selected.

### PRD Reference
- US-283, US-270, US-270 (reports)

### Access Roles
- Supervisor, Admin, Standard (view only)

### Data Source
- GET `/api/v1/reports/sales/total?from=YYYY-MM-DD&to=YYYY-MM-DD&group=month|day|week`

### Filters
- Date range
- Group By: Month/Week/Day/Category

#### Table Columns
| Column         | Label        | Type   |
|----------------|--------------|--------|
| period         | Period (Month/Week/Day/etc.) | text/date |
| totalSales     | Sales Total  | money  |
| unitsSold      | Qty Sold     | int    |
| Others as per group... |

#### Actions
- Filter
- Export
- Print

#### Test Identifiers
- `totalsalesreport-from`
- `totalsalesreport-to`
- ...

---

## 324. TrialBalance-test

### Route Path
`/reports/trial-balance/test`

### Purpose
Experimental version of trial balance report (test/QA view for devs or auditors).

### PRD Reference
- US-292, US-278, US-284

### Access Roles
- Admin

### Data Source
- GET `/api/v1/reports/trial-balance/test?from=YYYY-MM-DD&to=YYYY-MM-DD`

#### Table Columns
| Column         | Label        | Type   |
|----------------|--------------|--------|
| account        | Account      | text   |
| debit          | Debit        | money  |
| credit         | Credit       | money  |
| net            | Net          | money  |

#### Actions
- Filter dates
- Export/Print

#### Test Identifiers
- `trialbalancetest-from`
- `trialbalancetest-to`
- etc.

---

## 325. TrialBalance-test111

### Route Path
`/reports/trial-balance/test111`

### Purpose
Another experimental trial balance layout, for test/verification. For admin/internal use.

### Data Source
- GET `/api/v1/reports/trial-balance/test111?from=YYYY-MM-DD&to=YYYY-MM-DD`

#### Table Columns
- As above, or as returned by API/DB

#### Actions
- Filter, export, print

#### Test Identifiers
- `trialbalancetest111-from`
- `trialbalancetest111-to`
- etc.

---

## COVERAGE CHECK

| Screen Name                              | Covered |
|-------------------------------------------|---------|
| 301. StockRe-OrderStatus                  |   ✅    |
| 302. StockStatement-1                     |   ✅    |
| 303. StockStatement-dd                    |   ✅    |
| 304. StockStatement-FromItemFile          |   ✅    |
| 305. StockStatement                       |   ✅    |
| 306. StockStatement1                      |   ✅    |
| 307. StockValuationReport                 |   ✅    |
| 308. StockValuationSummaryReport          |   ✅    |
| 309. SupplierAgeWiseSummary-Foreign-old   |   ✅    |
| 310. SupplierAgeWiseSummary-Foreign       |   ✅    |
| 311. SupplierAgeWiseSummary-Local-old     |   ✅    |
| 312. SupplierAgeWiseSummary-Local         |   ✅    |
| 313. SupplierAgeWiseSummary               |   ✅    |
| 314. SupplierBillWisePending-Both         |   ✅    |
| 315. SupplierBillWisePending-Foreign-old  |   ✅    |
| 316. SupplierBillWisePending-Foreign      |   ✅    |
| 317. SupplierBillWisePending-local        |   ✅    |
| 318. SupplierBillWisePending              |   ✅    |
| 319. SupplierList                         |   ✅    |
| 320. SupplierOutstandingSummary           |   ✅    |
| 321. TechnicianEfficency                  |   ✅    |
| 322. test                                 |   ✅    |
| 323. TotalSalesReport                     |   ✅    |
| 324. TrialBalance-test                    |   ✅    |
| 325. TrialBalance-test111                 |   ✅    |

**All assigned screens have been fully specified.**

---

# FRONTEND_SPEC.md

---

## 326. TrialBalanceSummary

### Route  
`/reports/trial-balance-summary`

### Purpose  
Display a summarized trial balance for all accounts, showing total debits and credits for a selected period. Used for finance/accounting reporting per PRD ("Financial Reporting & Statements").

### PRD References  
- US-292 (scheduled/automated reports, monitoring)
- FR-333, FR-329, FR-328 (summary/detail trial balance reporting, role-based)
- Screen: TrialBalanceSummary

### Access Roles  
- Supervisor  
- Administrator  

### Components

#### A. Filter Form  
- **Date Range:**  
  - Label: "Start Date"  
    - Input: Date picker  
    - Validation: Required  
    - Error: "Start date is required."  
  - Label: "End Date"  
    - Input: Date picker  
    - Validation: Required  
    - Error: "End date is required."  
- **Account Group:**  
  - Label: "Account Group"  
    - Input: Searchable dropdown (populated from `/api/v1/ledger/account-heads`)  
    - Placeholder: "All groups (default)"  
    - Error: "Account group selection invalid."  

#### B. Table: Trial Balance Summary  
| Column                 | Description                                      |
|------------------------|--------------------------------------------------|
| Account Name           | As returned by API/view; visible label           |
| Account Code           | Account code (short variant)                     |
| Group Name             | Resolved name from view                          |
| Debit Total            | Total debits for account in period (`string`, 2 decimals, right-aligned, sum at bottom)  |
| Credit Total           | Total credits for account in period (`string`, 2 decimals, right-aligned, sum at bottom) |
| Balance                | Calculated (Debit – Credit, show `Dr`/`Cr` tag)  |

- **Row hover** highlights row (`background: #3831c40a;`).
- **Sticky header** with slight blur/glass as per design, tokens.
- Pagination: 20 rows/page, with navigation at bottom.

#### C. Actions  
- **Primary Button:** "Run Report" (data-testid='trialbalancesummary-runreport-btn')
- **Export as:** Dropdown for "Excel", "PDF", "CSV" (data-testid='trialbalancesummary-export-dropdown')
- **Print**: Icon button, exports as print media (prints current view)
- **Schedule Report:** If access, "Schedule…" opens modal (future)

#### D. States  
- **Loading:** Skeleton for filters and table rows (3–4 rows shimmer).
- **API Error:** Banner `var(--color-error)`: "Unable to load trial balance summary. Please try again."
- **Empty State:**  
  - Icon (outline report/book), text: "No accounts found for selected criteria."
  - Suggest check filters or contact administrator.

### Field Validations  
- Date range required & "Start ≤ End Date".
- API errors show in banner AND suppress table.

### API Calls  
- **GET** `/api/v1/reports/trial-balance-summary?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD[&group=code]`
- For export, append `&format=pdf|csv|xlsx`
- All export/print actions are logged for audit.

### Test Identifiers  

| Element                        | data-testid                           |
|---------------------------------|--------------------------------------|
| Filter "Start Date" input       | trialbalancesummary-filter-start      |
| Filter "End Date" input         | trialbalancesummary-filter-end        |
| Filter "Account Group" select   | trialbalancesummary-filter-group      |
| Run Report button               | trialbalancesummary-runreport-btn     |
| Table                           | trialbalancesummary-table             |
| Table row                       | trialbalancesummary-row-[accountcode] |
| Export dropdown                 | trialbalancesummary-export-dropdown   |
| Print button                    | trialbalancesummary-print-btn         |
| Loading skeleton                | trialbalancesummary-loading           |
| Empty state box                 | trialbalancesummary-emptystate        |
| API error banner                | trialbalancesummary-errorbanner       |
| Pagination controls             | trialbalancesummary-pager             |

---

## 327. UsedCars

### Route  
`/inventory/used-cars`

### Purpose  
Maintain, view, and edit a list of all used cars in inventory (for used-car sales, appraisal, logistics). Includes search and per-car details/entry form.

### PRD References  
- US-164, US-165, US-154 (inventory list, export, real-time status)
- Screen: UsedCars

### Access Roles  
- Supervisor  
- Administrator  

### Components

#### A. List Bar / Table View

| Column           | Description                                           |
|------------------|------------------------------------------------------|
| Car ID           | Short unique code (from `VehId` or similar)          |
| Make/Model       | e.g., "Toyota Corolla" (combined from `Make`/`Vehname`)  |
| Year             | Model/manufacture year                               |
| Status           | Dropdown/Tag: "Available", "Sold", "Reserved", "In Inspection", color pill |
| Owner            | Customer name (linked to customer record)            |
| Current Price    | `string`, 2 decimals, currency                       |
| Date In Stock    | Date vehicle was added                               |
| Actions          | Edit, View (eye, pencil icons), Delete (if not reserved/sold) |

- **Filter/Search bar:**  
  - By make/model (free text, data-testid='usedcars-filter-make')
  - By year (dropdown — recent 20 years, data-testid='usedcars-filter-year')
  - By status (pill multi-select, data-testid='usedcars-filter-status')
  - By owner name (autosuggest dropdown, data-testid='usedcars-filter-owner')
  - "Add Car" button (primary, opens entry form)

#### B. Car Entry/Edit Form  
Route: `/inventory/used-cars/new` and `/inventory/used-cars/:vehId/edit`

- **Fields:**  
  - "Make" (input, required, data-testid='usedcars-form-make')
  - "Model" (input, required, data-testid='usedcars-form-model')
  - "Year" (dropdown, required, 1985–current, data-testid='usedcars-form-year')
  - "Status" (select, required, values as above, data-testid='usedcars-form-status')
  - "Owner" (customer autosuggest, required, data-testid='usedcars-form-owner')
  - "Current Price" (input, required, numeric, min 0, data-testid='usedcars-form-price')
  - "Date In Stock" (date picker, optional, defaults now, data-testid='usedcars-form-datein')
  - "Color" (input, optional)
  - "VIN/Chassis No" (input, unique, data-testid='usedcars-form-vin')
  - "Notes" (textarea, optional)
- **Actions:**   
  - "Save" (primary, data-testid='usedcars-form-save')
  - "Cancel" (secondary, return to list)
  - "Delete" (secondary, if edit, disables if not allowed)

- All edits validated inline; errors shown next to field.
- Save returns to list and highlights/scrolls new car.

- **Entry field edge cases:**  
  - VIN must be unique (API error: "VIN/Chassis Number already exists.")
  - Do not allow "Sold" status with no owner.

#### C. States

- **Loading:** Placeholder skeleton for table rows, shimmer for entry form.
- **API Error:** Banner: "Failed to load used car records. Please try again."
- **Empty State:**  
  - Text: "No used cars found. Add a car to get started."
  - "Add Car" prominent.

### Test Identifiers

| Element                   | data-testid                |
|---------------------------|---------------------------|
| Table                     | usedcars-table            |
| Add Car button            | usedcars-add-btn          |
| Filter Make               | usedcars-filter-make      |
| Filter Year               | usedcars-filter-year      |
| Filter Status             | usedcars-filter-status    |
| Filter Owner              | usedcars-filter-owner     |
| Table row                 | usedcars-row-[vehId]      |
| Edit button               | usedcars-edit-btn         |
| Delete button             | usedcars-del-btn          |
| Save (form)               | usedcars-form-save        |
| Cancel (form)             | usedcars-form-cancel      |
| VIN field                 | usedcars-form-vin         |
| Loading skeleton          | usedcars-loading          |
| Empty state               | usedcars-emptystate       |
| API error banner          | usedcars-errorbanner      |

---

## 328. UserLogReport

### Route  
`/admin/user-log-report`

### Purpose  
Audit and review all user actions and sign-in/out logs for system-wide monitoring and compliance.

### PRD References  
- US-30, US-44, US-45, US-298, US-299 (activity logs, critical events, exports)
- FR-354, FR-355, FR-357 (export logs, filter/search, restriction)
- Screen: UserLogReport

### Access Roles  
- Supervisor  
- Administrator  

### Components

#### A. Filter/Query Bar

- **User:**  
  - Autosuggest/search dropdown, lists all users including deactivated (data-testid='userlogreport-filter-user')
- **Date Range:**  
  - "From" date (picker, required; data-testid='userlogreport-filter-from')  
  - "To" date (picker, required; data-testid='userlogreport-filter-to')
- **Activity Type:**  
  - Dropdown: "All", "Login", "Logout", "Failed Login", "Password Change", "Export", "Unlock", "Audit Action", etc. (data-testid='userlogreport-filter-action')

#### B. Activity Log Table

| Column        | Description                              |
|---------------|------------------------------------------|
| Date/Time     | Exact timestamp, local zone              |
| User Name     | Full name, with role tag                 |
| Machine/IP    | Icon+hover for details of station        |
| Activity      | Main action type (Login/Logout/Export)   |
| Details       | Full details/remarks (truncate after 64, expand on click) |
| Affected Object | If any (e.g., Order #, User #, etc.)   |

- Table paginates, 30 per page.
- Shows "Export Selected" button and "Print" button with print preview.
- Row actions: expand for full detail (slide-in glass panel), audit trail jump.

#### C. Actions

- "Export as" dropdown (Excel/PDF), logs action in audit log (data-testid='userlogreport-export')
- "Print" button (icon, opens print preview, data-testid='userlogreport-print')
- "Filter" is primary (data-testid='userlogreport-filter-btn')
- Row click = expand details (modal, data-testid='userlogreport-details-btn')
- "Clear filters" link

#### D. States

- **Loading:** Table skeleton, progress bar for export.
- **API Error:** Banner: "Log data unavailable. Try again or contact admin."
- **Empty:** Text: "No activity matched your search filters."

### Test Identifiers

| Element                         | data-testid                      |
|----------------------------------|----------------------------------|
| Table                           | userlogreport-table              |
| Filter User                     | userlogreport-filter-user        |
| Filter From                     | userlogreport-filter-from        |
| Filter To                       | userlogreport-filter-to          |
| Filter Action                   | userlogreport-filter-action      |
| Export Dropdown                 | userlogreport-export             |
| Print Button                    | userlogreport-print              |
| Filter Button                   | userlogreport-filter-btn         |
| Log Row                         | userlogreport-row-[SLNo]         |
| Row Expand Details              | userlogreport-details-btn        |
| Empty State Box                 | userlogreport-emptystate         |
| Loading Skeleton                | userlogreport-loading            |
| API Error Banner                | userlogreport-errorbanner        |

---

## 329. VehicleAttendanceList

### Route  
`/reports/vehicle-attendance`

### Purpose  
Show historical in/out tracking for vehicles, for attendance/security and fleet movements.

### PRD References  
- Screen: VehicleAttendanceList
- US-329 (export/print, view logs, filter by vehicle), FR-350, FR-353

### Access Roles  
- Supervisor  
- Administrator  

### Components

#### A. Filter Bar

- **Vehicle:**  
  - Searchable dropdown (autocomplete) for all vehicles by Vehicle No/ID (data-testid='vehicleattendance-filter-veh')
- **Date Range:**  
  - Start: Date picker (required, data-testid='vehicleattendance-filter-from')
  - End: Date picker (required, data-testid='vehicleattendance-filter-to')
- **Movement Type:**  
  - Multi-select: "All", "Entry", "Exit" (pill buttons, data-testid='vehicleattendance-filter-type')

#### B. Attendance Table

| Column          | Description                                       |
|-----------------|---------------------------------------------------|
| Record Date/Time| Date/time of attendance log                       |
| Vehicle Number  | Plate, make/model (visible)                       |
| Movement Type   | "Entry" or "Exit" (pill with color)               |
| Driver/Staff    | Name, if recorded                                 |
| Remarks         | Optional comments from user or guard              |

- Pagination, 30 per page.
- Row action: Expand for full details.

#### C. Actions

- "Export" (PDF/Excel/CSV, data-testid='vehicleattendance-export-btn')
- "Print" (print current filtered table, data-testid='vehicleattendance-print-btn')
- Filter "Apply" (data-testid='vehicleattendance-filter-btn')

#### D. States

- Loading skeleton for table and filters.
- API error: Banner "Failed to load vehicle attendance records."
- Empty: "No attendance entries for selected criteria."

### Test Identifiers

| Element                    | data-testid                        |
|----------------------------|------------------------------------|
| Table                      | vehicleattendance-table            |
| Filter Vehicle             | vehicleattendance-filter-veh       |
| Filter From                | vehicleattendance-filter-from      |
| Filter To                  | vehicleattendance-filter-to        |
| Filter Type                | vehicleattendance-filter-type      |
| Filter Button              | vehicleattendance-filter-btn       |
| Export Button              | vehicleattendance-export-btn       |
| Print Button               | vehicleattendance-print-btn        |
| Row                        | vehicleattendance-row-[id]         |
| Loading Skeleton           | vehicleattendance-loading          |
| Empty State                | vehicleattendance-emptystate       |
| API Error Banner           | vehicleattendance-errorbanner      |

---

## 330. VoucherList

### Route  
`/finance/vouchers`

### Purpose  
Display tabular list of journal vouchers/transactions within selected period/accounts; launch add/edit/view for vouchers.

### PRD References  
- US-252, US-266, US-307, US-310 (listing, search, export, print), CRUD completeness rule
- FR-306, FR-309, FR-310, FR-314, FR-319 (list, search/filter, export/reporting, access control)
- Screen: VoucherList (+ implied per CRUD rule: entry page routes `/finance/vouchers/new`, `/finance/vouchers/:vsrl/edit`)

### Access Roles  
- Supervisor  
- Administrator

### Components

#### A. Filter/Query Bar

- **Date Range:**  
  - Start: Date picker (required, data-testid='voucherlist-filter-from')
  - End: Date picker (required, data-testid='voucherlist-filter-to')
- **Account:**  
  - Searchable dropdown, autocomplete from `/api/v1/ledger/account-heads` (data-testid='voucherlist-filter-ac')
- **Voucher Status:**  
  - Dropdown: "All", "Draft", "Posted", "Pending Approval", "Rejected", "Locked" (data-testid='voucherlist-filter-status')
- **Voucher Type:**  
  - Dropdown: From configuration/voucher types (data-testid='voucherlist-filter-type')
- **Reference Number:**  
  - Input, free text (data-testid='voucherlist-filter-ref')

#### B. Voucher Table

| Column         | Description                                         |
|----------------|-----------------------------------------------------|
| Voucher #      | Main voucher number/ID                              |
| Date           | Posting/entry date                                  |
| Account        | Account name (shortcut tag if applicable)           |
| Narration      | Main narration or summary, truncated 64 chars       |
| Debit Amount   | Summed debit; right-aligned                         |
| Credit Amount  | Summed credit; right-aligned                        |
| Status         | Pill: Posted, Draft, etc.                           |
| Last Edited By | User name, timestamp                                |
| Actions        | Edit, View (eye/pencil), Print, Export row (csv/pdf) |

- Row click opens detail/entry view (`/finance/vouchers/:vsrl`).

#### C. Actions

- "+ New Voucher" (primary, data-testid='voucherlist-add-btn')
- "Export" (current filter, data-testid='voucherlist-export-btn')
- "Print" (table view, data-testid='voucherlist-print-btn')
- Row Edit/View (icon buttons, data-testid='voucherlist-row-edit', 'voucherlist-row-view')
- Pagination, 30 per page.

#### D. States

- **Loading skeletons** for queries and table.
- **API error**: "Failed to load vouchers. Try again."
- **Empty**: "No vouchers/events found. Try changing filters."

#### E. Entry/Edit Page (`/finance/vouchers/new`, `/finance/vouchers/:vsrl/edit`)
- (**See main voucher form spec in previous parts; refer to CRUD COMPLETENESS RULE**)
- "Save", "Cancel", "Post/Approve" (actions reflect status/edit rights), disables if already posted/locked.

### Test Identifiers

| Element                       | data-testid                    |
|-------------------------------|-------------------------------|
| Table                         | voucherlist-table             |
| Add Voucher Button            | voucherlist-add-btn           |
| Filter Bar Account            | voucherlist-filter-ac         |
| Filter Bar From Date          | voucherlist-filter-from       |
| Filter Bar To Date            | voucherlist-filter-to         |
| Filter Bar Status             | voucherlist-filter-status     |
| Filter Bar Type               | voucherlist-filter-type       |
| Filter Reference Input        | voucherlist-filter-ref        |
| Export Button                 | voucherlist-export-btn        |
| Print Button                  | voucherlist-print-btn         |
| Row Edit Button               | voucherlist-row-edit          |
| Row View Button               | voucherlist-row-view          |
| Row Print/Export              | voucherlist-row-export        |
| Loading Skeleton              | voucherlist-loading           |
| Empty State Box               | voucherlist-emptystate        |
| API Error Banner              | voucherlist-errorbanner       |
| Pager Controls                | voucherlist-pager             |

---

## 331. VoucherListErrFind

### Route  
`/finance/voucher-list-errors`

### Purpose  
Special diagnostic list to find and review VoucherList entries with detected errors, anomalies, or inconsistencies for audit/QA.

### PRD References  
- US-222 (flagged errors/anomalies), US-261 (audit), US-228 (summary for audits)
- Screen: VoucherListErrFind

### Access Roles  
- Administrator  
- Supervisor

### Components

#### A. Filter Bar

- **Date Range**:  
  - Start/End: Date pickers (required, data-testid='voucherlisterrfind-filter-from', 'voucherlisterrfind-filter-to')
- **Error Type**:  
  - Dropdown: "All", "Unbalanced", "Duplicate Number", "Missing Account", "Mismatched Totals", "Other" (data-testid='voucherlisterrfind-filter-type')
- **Account**:  
  - Search dropdown (optional), from account heads (data-testid='voucherlisterrfind-filter-ac')

#### B. Error Table

| Column           | Description                                     |
|------------------|-------------------------------------------------|
| Voucher #        | ID                                             |
| Date             | Date                                           |
| Error Type       | Pill/Tag (color per error type)                |
| Description      | Brief error summary                            |
| Account          | Name                                           |
| Status           | Current voucher status (posted/draft/etc.)     |
| Actions          | View/Edit Voucher (per error), data-testid='voucherlisterrfind-row-fix' |

- Row click or action jumps to voucher edit with error highlighted.

#### C. Actions

- Filter "Apply" (primary), "Export" (current list, in Excel/PDF/CSV)
- "Fix All" (batch fix utility, admin only, runs in modal with feedback)
- Print list (current).

#### D. States

- Loading skeleton.
- API error.
- Empty: "No voucher errors found in selected date range."

### Test Identifiers

| Element                        | data-testid                           |
|------------------------------- |-------------------------------------- |
| Table                          | voucherlisterrfind-table              |
| Filter Bar From                 | voucherlisterrfind-filter-from        |
| Filter Bar To                   | voucherlisterrfind-filter-to          |
| Filter Bar Error Type           | voucherlisterrfind-filter-type        |
| Filter Account                  | voucherlisterrfind-filter-ac          |
| Export Button                   | voucherlisterrfind-export-btn         |
| Print Button                    | voucherlisterrfind-print-btn          |
| Row Fix/Edit Button             | voucherlisterrfind-row-fix            |
| Loading Skeleton                | voucherlisterrfind-loading            |
| Empty State                     | voucherlisterrfind-emptystate         |
| API Error Banner                | voucherlisterrfind-errorbanner        |

---

## 332. VoucherListNEW

### Route  
`/finance/vouchers/new-list`

### Purpose  
Render the upgraded or alternate layout for the voucher list/report with modern design and new filters as per PRD (distinct from standard VoucherList).

### PRD References  
- US-307 (detailed/modern reporting), US-256 (audit/support)
- Screen: VoucherListNEW

### Access Roles  
- Supervisor  
- Administrator

### Components

#### A. Super-Filter Bar

- **Hierarchical Account Tree Picker** (glass drop-down; data-testid='voucherlistnew-filter-actree')
- **Date Range:**  
  - Start/End (date pickers, data-testid='voucherlistnew-filter-date')
- **Amount Range**:  
  - Min/Max numeric inputs (data-testid='voucherlistnew-filter-amount-min', 'voucherlistnew-filter-amount-max')
- **Status Multi-select:**  
  - "All", "Draft", "Posted", "Approved", "Rejected", "Locked" (data-testid='voucherlistnew-filter-status')
- **Narration text:** Input (search, data-testid='voucherlistnew-filter-narration')

#### B. Modern Voucher Table

| Column         | Description                                         |
|----------------|-----------------------------------------------------|
| Voucher #      | Short ID, sticky/focusable                          |
| Account        | Human-readable, group tags                          |
| Date           | Short + time (if detailed)                          |
| Narration      | Truncated, with expand arrow                        |
| Debit Cr.      | Split column, badge for Dr/Cr; color per net side   |
| Status         | Pill/tag, color-coded                               |
| Audit Trail    | Popup button for quick-view audit log (modal, data-testid='voucherlistnew-row-auditlog') |
| Actions        | View/Edit/Print/Export (icon buttons)               |

- Supports column sort, freeze.
- Exportable, all filters applied.

#### C. Actions

- Primary: "Run/Refresh Report" (data-testid='voucherlistnew-run-btn')
- "Export" (dropdown, data-testid='voucherlistnew-export-dropdown')
- Print (current filters), Audit Trail viewer (row), Save as View (saves filters/layout for logged-in user).

#### D. States

- Loading shimmer.
- API errors (banner, disables table).
- Empty: Friendly "No vouchers in this layout for selection."

### Test Identifiers

| Element                        | data-testid                      |
|--------------------------------|----------------------------------|
| Table                          | voucherlistnew-table             |
| Filter Account Tree             | voucherlistnew-filter-actree     |
| Filter Date Range              | voucherlistnew-filter-date       |
| Filter Amount Min/Max          | voucherlistnew-filter-amount-min,<br>voucherlistnew-filter-amount-max |
| Filter Status                  | voucherlistnew-filter-status     |
| Run Report Button              | voucherlistnew-run-btn           |
| Export Dropdown                | voucherlistnew-export-dropdown   |
| Row Audit Log Button           | voucherlistnew-row-auditlog      |
| Row Edit/View/Print            | voucherlistnew-row-edit,<br>voucherlistnew-row-view,<br>voucherlistnew-row-print|
| Loading Skeleton               | voucherlistnew-loading           |
| Empty State Box                | voucherlistnew-emptystate        |
| API Error Banner               | voucherlistnew-errorbanner       |

---

## 333. work_In_Progress

### Route  
`/jobs/work-in-progress`

### Purpose  
Real-time display of ongoing task/job assignments, showing which jobs/works are started but not completed.

### PRD References  
- US-105, US-107 (work status, Gantt/calendar, report/export)
- FR-126, FR-127, FR-129 (current status, Gantt support, update on mobile/tablet, progress highlight)
- Screen: work_In_Progress

### Access Roles  
- Supervisor  
- Administrator  

### Components

#### A. Work Filter Bar

- **Date Range:**  
  - Start/End date (data-testid='workinprogress-filter-from', 'workinprogress-filter-to')
- **Staff Member:**  
  - Search dropdown, all staff (data-testid='workinprogress-filter-staff')
- **Job Type:**  
  - Multi-select type dropdown ("Service", "Repair", etc.) (data-testid='workinprogress-filter-jobtype')
- **Status:**  
  - Pill/toggles: "All", "Assigned", "In Progress", "Awaiting Parts", "Complete" (data-testid='workinprogress-filter-status')
- **Customer:**  
  - Autosuggest dropdown (data-testid='workinprogress-filter-customer')

#### B. Work Table

| Column         | Description                             |
|----------------|-----------------------------------------|
| Job/Work ID    | Unique, primary                         |
| Task/Job Title | Short description (expand for more)     |
| Staff Assigned | Person/people assigned                  |
| Start Date/Time| Time of first task                      |
| Status         | Pill ("In Progress", color)             |
| Progress       | %/step bar (graphical, starts at 0)     |
| Due/ETA        | Date, warning color if overdue          |
| Customer       | Link to customer                        |
| Gantt/Calendar | [View] opens calendar modal             |
| Actions        | View, Edit, Mark Done                   |

- Table rows click to detail/glass modal.
- "Show in Calendar" button (main UI) for visual layout.

#### C. Actions

- "Export" (current filter, pdf/excel, logs action)
- "Print" (current page)
- "Mark as Completed" (if eligible, confirmation modal, data-testid='workinprogress-markdone-btn')
- Add/assign job (if permitted)

#### D. States

- Loading skeleton for rows/cards.
- API errors.
- Empty: "No work in progress in selected range."

### Test Identifiers

| Element                         | data-testid                           |
|----------------------------------|---------------------------------------|
| Table/List                       | workinprogress-table                  |
| Filter Date Range                 | workinprogress-filter-from/workinprogress-filter-to |
| Filter Staff                      | workinprogress-filter-staff           |
| Filter Job Type                   | workinprogress-filter-jobtype         |
| Filter Status                     | workinprogress-filter-status          |
| Filter Customer                   | workinprogress-filter-customer        |
| Row Mark Done                     | workinprogress-markdone-btn           |
| Row Expand                        | workinprogress-row-expand             |
| Export Button                     | workinprogress-export-btn             |
| Print Button                      | workinprogress-print-btn              |
| Calendar View icon                | workinprogress-calendar-btn           |
| Loading Skeleton                  | workinprogress-loading                |
| Empty State                       | workinprogress-emptystate             |
| API Error                         | workinprogress-errorbanner            |

---

## 334. xxx

### Route  
`/admin/reports/xxx`

### Purpose  
Placeholder or specialized report/test/diagnostic screen for system administration. Used for ad-hoc inspection, queries, or direct export.

### PRD References  
- Screen: xxx  
- US-291 (test/backup/validation reports), possibly G-71 (cross-module audit/search).

### Access Roles  
- Administrator only

### Components

- **Query Editor/Input:**  
  - Free text input field (data-testid='xxx-query')
  - Optional "Select Report" dropdown for saved/specialized reports (data-testid='xxx-reports')
- **Run Report** (primary, data-testid='xxx-run-btn')
- **Table Output**  
  - Column headers auto-built from query/report selection  
  - Download as CSV, Excel, PDF (data-testid='xxx-export')
- **Raw Data View** (toggle for JSON/CSV, data-testid='xxx-rawtoggle')
- **States:**  
  - Loading shimmer  
  - Error: "Invalid query or report failed."  
  - Empty: "No results. Check syntax or filters."

### Test Identifiers

| Element                     | data-testid        |
|-----------------------------|-------------------|
| Query Input                 | xxx-query         |
| Report Select               | xxx-reports       |
| Run Button                  | xxx-run-btn       |
| Table Output                | xxx-table         |
| Export Button               | xxx-export        |
| Raw Data Toggle             | xxx-rawtoggle     |
| Loading Skeleton            | xxx-loading       |
| Empty State Box             | xxx-emptystate    |
| Error Banner                | xxx-errorbanner   |

---

## 335. z

### Route  
`/admin/reports/z`

### Purpose  
Catch-all/experimental/test or legacy diagnostic report for super admin purposes.

### PRD References  
- Screen: z (see also G-71 infer: cross-module/combination report)
- US-291, US-307

### Access Roles  
- Administrator only

### Components

- **Report/Function dropdown** (data-testid='z-reports')
- **Parameter Fields:**  
  - Dynamically render based on selected function/report (date, entity, etc.) (data-testid='z-param-[name]')
- **Run/Preview (primary)** (data-testid='z-run-btn')
- **Table Result:**  
  - Columns per returned view  
  - Supports export as Excel/CSV/PDF  
- **Print** (data-testid='z-print-btn')
- **States:**  
  - Loading  
  - Error — "Could not generate report."  
  - Empty — "No data for this selection."

### Test Identifiers

| Element                     | data-testid       |
|-----------------------------|------------------|
| Reports Dropdown            | z-reports        |
| Param Inputs                | z-param-[name]   |
| Run Button                  | z-run-btn        |
| Table Output                | z-table          |
| Export Button               | z-export         |
| Print Button                | z-print-btn      |
| Loading Skeleton            | z-loading        |
| Empty State Box             | z-emptystate     |
| Error Banner                | z-errorbanner    |

---

## 336. Account Modification Log

### Route  
`/audit/account-modification-log`

### Purpose  
Show complete log/history of all account-head / financial account record changes (create, edit, delete) for compliance and review.

### PRD References  
- US-295, US-349, BR-356, BR-357, FR-348, FR-349
- Screen: Account Modification Log

### Access Roles  
- Supervisor  
- Administrator

### Components

#### A. Filter/Query Bar

- **Account Head:**  
  - Searchable dropdown, shows tree (data-testid='accountmodlog-filter-ac')
- **Date Range:**  
  - Start/End (date pickers, data-testid='accountmodlog-filter-from', 'accountmodlog-filter-to')
- **User:**  
  - Dropdown, all users (data-testid='accountmodlog-filter-user')
- **Action:**  
  - Multi-select: create, update, delete (data-testid='accountmodlog-filter-action')

#### B. Modification Log Table

| Column           | Description                                            |
|------------------|--------------------------------------------------------|
| Date/Time        | Timestamp of change                                    |
| Account Name     | Human-friendly                                         |
| Action           | "Created", "Updated", "Deleted" (pill color)           |
| User             | Name (icon for explanation)                            |
| Field Changed    | Field name (for updates), "--" if not applicable       |
| Before Value     | For edits/deletes                                      |
| After Value      | For edits/creates                                      |
| Detail/Expand    | Expand/collapse for whole record before/after (drawer) |
| Export/Print     | Export button, Print (testId as below)                 |

#### C. Actions

- "Export as…" (dropdown .xlsx/.csv/.pdf, data-testid='accountmodlog-export-btn')
- "Print" (current selection or all filter, data-testid='accountmodlog-print-btn')
- Row can be expanded for full diff/detail
- Filter "Apply", Clear filters

#### D. States

- Loading skeleton
- API error
- Empty: "No account modifications for selected criteria."

### Test Identifiers

| Element                    | data-testid                            |
|----------------------------|----------------------------------------|
| Table                      | accountmodlog-table                    |
| Filter Account             | accountmodlog-filter-ac                |
| Filter From                | accountmodlog-filter-from              |
| Filter To                  | accountmodlog-filter-to                |
| Filter User                | accountmodlog-filter-user              |
| Filter Action              | accountmodlog-filter-action            |
| Export Button              | accountmodlog-export-btn               |
| Print Button               | accountmodlog-print-btn                |
| Row Expand                 | accountmodlog-row-expand               |
| Loading Skeleton           | accountmodlog-loading                  |
| Empty State                | accountmodlog-emptystate               |
| API Error Banner           | accountmodlog-errorbanner              |

---

## 337. Edit Change Log Viewer

### Route  
`/audit/edit-change-log`

### Purpose  
Review system-wide edit/change logs for key record edits and administrative actions, for investigation and compliance.

### PRD References  
- US-296, US-351, FR-350, FR-362
- Screen: Edit Change Log Viewer

### Access Roles  
- Administrator  
- Supervisor

### Components

#### A. Filter

- **Entity Type:**  
  - Dropdown: "Account", "Order", "Customer", "Supplier", "Item", "Voucher", "All" (data-testid='editchangelog-filter-entity')
- **Date Range:**  
  - Pickers (data-testid='editchangelog-filter-from', 'editchangelog-filter-to')
- **User:**  
  - Search dropdown (data-testid='editchangelog-filter-user')
- **Critical Only:**  
  - Toggle/switch (data-testid='editchangelog-filter-critical')

#### B. Change Log Table

| Column          | Description                                             |
|-----------------|--------------------------------------------------------|
| Date/Time       | Of change                                              |
| Entity Type     | Pill/tag                                               |
| Entity ID       | e.g., Account Code, Order #, etc.                      |
| Field           | Field changed                                          |
| Before Value    | --                                                     |
| After Value     | --                                                     |
| User            | Name                                                   |
| Action Type     | Update/Create/Delete (icon/color pill)                 |
| Critical        | Icon/flag ("!") if critical field/high risk            |
| Detail          | Expand row for full diff (modal, data-testid='editchangelog-row-expand') |

- Paginates, 40 per page.

#### C. Actions

- Filter "Apply" (primary)
- "Export", "Print" (dropdowns/buttons)
- Expand row for full details
- Jump-to-entity link (if access)

#### D. States

- Loading shimmer
- Error banner
- Empty: "No changes matched your filters."

### Test Identifiers

| Element                    | data-testid                      |
|----------------------------|----------------------------------|
| Table                      | editchangelog-table              |
| Filter Entity              | editchangelog-filter-entity      |
| Filter From                | editchangelog-filter-from        |
| Filter To                  | editchangelog-filter-to          |
| Filter User                | editchangelog-filter-user        |
| Filter Critical Only       | editchangelog-filter-critical    |
| Export Button              | editchangelog-export-btn         |
| Print Button               | editchangelog-print-btn          |
| Row Expand                 | editchangelog-row-expand         |
| Loading Skeleton           | editchangelog-loading            |
| Empty State Box            | editchangelog-emptystate         |
| API Error Banner           | editchangelog-errorbanner        |

---

## 338. Duplicate Record Removal Audit

### Route  
`/audit/duplicate-removal-audit`

### Purpose  
Track/audit all actions related to the merging or removal of duplicate data records — customers, suppliers, vehicles.

### PRD References  
- US-299, US-305 (audit of merged/removed duplicates), BR-132, FR-352, FR-353
- Screen: Duplicate Record Removal Audit

### Access Roles  
- Supervisor  
- Administrator

### Components

#### A. Filter Bar

- **Entity Type:** Dropdown, "Customer", "Supplier", "Vehicle", "All" (data-testid='dupeaudit-filter-entity')
- **Date Range:** Pickers (data-testid='dupeaudit-filter-from', 'dupeaudit-filter-to')
- **User:** Dropdown, search (data-testid='dupeaudit-filter-user')
- **Status:** Dropdown: "Merged", "Deleted", "Flagged Only" (data-testid='dupeaudit-filter-status')
- **Search by Entity ID/Name**: Search input (data-testid='dupeaudit-filter-search')

#### B. Audit Table

| Column         | Description                                 |
|----------------|---------------------------------------------|
| Date/Time      | When action occurred                        |
| Entity Type    | Pill                                         |
| Record(s) Before| List of all duplicate IDs/names before      |
| Merged/Kept ID | The final record retained                   |
| User           | Who performed action                        |
| Action         | Merge/Delete/Flag (color tag)               |
| Reason/Notes   | Supplied reason if any                      |
| Detail/Expand  | Comparison view (before/after), modal       |

- Each row expand = before/after table of all fields.
- Print/Export row.

#### C. Actions

- Export full log/filtered (Excel/pdf), Print current (data-testid below)
- Expand for diff
- "Clear filters"

#### D. States

- Loading shimmer
- API error
- Empty: "No duplicate record operations for these filters."

### Test Identifiers

| Element                       | data-testid                         |
|-------------------------------|-------------------------------------|
| Table                         | dupeaudit-table                     |
| Filter Entity                 | dupeaudit-filter-entity             |
| Filter From                   | dupeaudit-filter-from               |
| Filter To                     | dupeaudit-filter-to                 |
| Filter User                   | dupeaudit-filter-user               |
| Filter Status                 | dupeaudit-filter-status             |
| Filter Search                 | dupeaudit-filter-search             |
| Row Expand/Details            | dupeaudit-row-expand                |
| Export Button                 | dupeaudit-export-btn                |
| Print Button                  | dupeaudit-print-btn                 |
| Loading Skeleton              | dupeaudit-loading                   |
| Empty State                   | dupeaudit-emptystate                |
| API Error Banner              | dupeaudit-errorbanner               |


---

## 339. User Action Log Report

### Route  
`/audit/user-action-log-report`

### Purpose  
Display all user activities (not just auth), for security, internal review, and compliance — includes data ops, exports, permissions, etc.

### PRD References  
- US-354, US-355, BR-126, FR-360, FR-354–357
- Screen: User Action Log Report

### Access Roles  
- Supervisor  
- Administrator  

### Components

#### A. Filter/Query Bar

- **User:** Searchable dropdown (data-testid='useractionlog-filter-user')
- **Date Range:** Pickers (data-testid='useractionlog-filter-from', 'useractionlog-filter-to')
- **Action Type:** Dropdown, "All", plus list of critical actions ("Export", "Role change", "Object edit", etc.) (data-testid='useractionlog-filter-action')
- **Object Type:** Dropdown ("Order", "Invoice", "Customer", "Item", etc.) (data-testid='useractionlog-filter-object')

#### B. Action Log Table

| Column        | Description                                    |
|---------------|------------------------------------------------|
| Date/Time     | Action timestamp                               |
| User          | Name (correct role badge)                      |
| Action        | Pill/tag                                       |
| Entity Type   | Order/Customer/Item, etc.                      |
| Entity Detail | Populated info (e.g., "Order #14839", name)    |
| Success/Fail  | Icon; fail shows reason on hover               |
| Detail        | Expandable notes/log, all raw audit props      |
| Print/Export  | Export/print for all or selection              |

#### C. Actions

- "Export" button (current filter, data-testid='useractionlog-export-btn')
- "Print" (data-testid='useractionlog-print-btn')
- "Apply Filter" (primary)
- Row expand detail (drawer/modal)

#### D. States

- Loading shimmer  
- API error  
- Empty: "No matching user activity found for these filters."

### Test Identifiers

| Element                       | data-testid                          |
|-------------------------------|--------------------------------------|
| Table                         | useractionlog-table                  |
| Filter User                   | useractionlog-filter-user            |
| Filter From                   | useractionlog-filter-from            |
| Filter To                     | useractionlog-filter-to              |
| Filter Action                 | useractionlog-filter-action          |
| Filter Object                 | useractionlog-filter-object          |
| Export Button                 | useractionlog-export-btn             |
| Print Button                  | useractionlog-print-btn              |
| Row Expand Detail             | useractionlog-row-expand             |
| Loading Skeleton              | useractionlog-loading                |
| Empty State Box               | useractionlog-emptystate             |
| API Error Banner              | useractionlog-errorbanner            |

---

## COVERAGE CHECK

| Screen Name                     | Coverage |
|----------------------------------|----------|
| 326. TrialBalanceSummary         | ✅ covered |
| 327. UsedCars                    | ✅ covered |
| 328. UserLogReport               | ✅ covered |
| 329. VehicleAttendanceList       | ✅ covered |
| 330. VoucherList                 | ✅ covered |
| 331. VoucherListErrFind          | ✅ covered |
| 332. VoucherListNEW              | ✅ covered |
| 333. work_In_Progress            | ✅ covered |
| 334. xxx                         | ✅ covered |
| 335. z                           | ✅ covered |
| 336. Account Modification Log    | ✅ covered |
| 337. Edit Change Log Viewer      | ✅ covered |
| 338. Duplicate Record Removal Audit | ✅ covered |
| 339. User Action Log Report      | ✅ covered |

All assigned screens are fully specified above.

---

