# Materni-Tracker: Project Context & Architecture

**Materni-Tracker** is a specialized patient tracking and maternity management application designed for healthcare clinics. It enables medical staff and administrators to register patients, monitor antenatal care (ANC) milestones, coordinate follow-up interactions, and track delivery outcomes.

---

## 📂 Project Directory Structure

```
Materni-Tracker/
├── .env                  # Supabase credentials (URL, Anon Key)
├── .env.local            # Local environment configurations (same as .env)
├── .gitignore            # Git exclusion rules
├── eslint.config.js      # ESLint linting rules
├── index.html            # Core entry point HTML
├── package.json          # Dependency mappings & NPM script commands
├── setup-admin.mjs       # CLI utility for linking Supabase Auth users to staff
├── vite.config.js        # Vite configurations using @tailwindcss/vite
├── public/               # Static assets
└── src/
    ├── App.css           # Global typography and basic component styles
    ├── App.jsx           # Application shell, AuthGate, AppContent layout
    ├── index.css         # Tailwind v4 import rules & custom root tokens
    ├── main.jsx          # ReactDOM mounting script
    ├── components/       # Reusable UI components & dialogs
    │   ├── AddPatientModal.jsx       # Register new patients
    │   ├── Badge.jsx                 # Custom status indicators
    │   ├── ConfirmModal.jsx          # Unified action validation modal
    │   ├── ManageListCard.jsx        # Admin list item management widget
    │   ├── PatientCard.jsx           # Dashboard alert summary card
    │   ├── PatientDetailModal.jsx    # Demographics edit, interactions log, outcome tracker
    │   └── Toast.jsx                 # Global notification triggers
    ├── context/          # Application global state layers
    │   ├── AppContext.jsx            # Core CRUD hooks, filtering, calendar, bulk uploads
    │   └── AuthContext.jsx           # Session management & User RBAC
    ├── layouts/          # Main viewport structures
    │   ├── Header.jsx                # Search, user dropdown, notifications menu
    │   └── Sidebar.jsx               # Left-hand navigation routes
    ├── lib/              # Core configs, constants, and utilities
    │   ├── constants.js              # Dropdown defaults & case outcomes
    │   ├── mockData.js               # Dummy patient records for debugging
    │   ├── pdfParser.js              # PDF text-extraction & pattern matching parser
    │   └── supabase.js               # Supabase JS Client initialization
    ├── pages/            # Core views mounted by Sidebar/App.jsx
    │   ├── CalendarPage.jsx          # Month-by-month delivery calendar (EDD)
    │   ├── Dashboard.jsx             # Key indicators, alert highlights, work queues
    │   ├── MyPatients.jsx            # Staff member's assigned workload
    │   ├── PatientDirectory.jsx      # Global clinic registry with deep filtering
    │   ├── SettingsPage.jsx          # Configurations, list manager, CSV/PDF uploaders
    │   └── TeamPerformance.jsx       # Admin analytics & staff action logger
    ├── utils/            # Shared formatting helpers
    │   └── helpers.js                # CNIC/Phone formatters, alert calculators, CSV exporters
    └── views/            # Full-page interface flows
        └── LoginView.jsx             # Secure login screen
```

---

## 🛠️ Technology Stack

1. **Frontend Core**: React 19 & Vite 7 (using ES Module structure).
2. **Styling**: Tailwind CSS v4.0 with customized CSS theme variables.
3. **Database & Authentication**: Supabase (PostgreSQL engine + Supabase Auth).
4. **Icons**: Lucide React.
5. **PDF Processing**: `pdfjs-dist` for automated text extraction from official medical registers.

---

## 🗄️ Database Schema & Relationships

The database is built on Supabase (PostgreSQL). The key tables and their relationships are:

### 1. `staff`
Stores clinical staff and admin records. Linked directly to Supabase Auth.
* `id` (bigint, PK)
* `name` (text, not null)
* `role` (text, not null) — either `'Admin'` or `'Staff'`
* `auth_id` (uuid, Unique, FK to `auth.users(id)`)
* `created_at` (timestamptz)

### 2. `patients`
Tracks demographic, assignment, and pregnancy milestone data.
* `id` (text, PK) — Patient's CNIC (format: `12345-1234567-1`)
* `name` (text, not null)
* `phone` (text) — Format: `0300-1234567`
* `area` (text) — References the area names
* `caste` (text)
* `reference` (text)
* `assigned_to` (bigint, FK to `staff(id)`)
* `assignment_type` (text) — `'Primary'` or `'Secondary'` (Defaults to `'Secondary'`)
* `edd` (date) — Estimated Date of Delivery
* `intent` (text) — Patient interest level: `'High'`, `'Medium'`, `'Low'` (Defaults to `'Medium'`)
* `preference` (text) — Planned delivery location: `'Undecided'`, `'Clinic'`, `'Home'`, `'Other Hospital'`
* `status` (text) — Patient state: `'Active'`, `'Delivered (Clinic)'`, `'Delivered (MNHC)'`, `'Delivered (Home Dai)'`, `'Moved Away'`, etc. (Defaults to `'Active'`)
* `registration_date` (timestamptz, Defaults to `now()`)
* `last_contact` (timestamptz)
* `next_interaction_date` (date) — Scheduled date for next follow-up

### 3. `interactions`
Logs time-series interaction details for patients.
* `id` (bigint, PK)
* `patient_id` (text, FK to `patients(id)` on delete cascade)
* `date` (timestamptz, Defaults to `now()`)
* `type` (text) — `'Call'`, `'Visit'`, `'Referral'`, or `'Outcome Logged'`
* `staff_id` (bigint, FK to `staff(id)`)
* `notes` (text)
* `intent` (text) — Recorded intent at time of contact
* `preference` (text) — Recorded preference at time of contact
* `next_interaction_date` (date) — Scheduled next checkup date

### 4. `custom_lists`
Utility configuration elements for app-wide custom dropdowns and patient tags.
* `id` (bigint, PK)
* `list_type` (text) — `'area'`, `'caste'`, `'reference'`, or `'tag'`
* `value` (text, not null)

### 5. `system_settings`
Global settings registry.
* `id` (bigint, PK)
* `key` (text, Unique) — e.g. `'alertConfig'`
* `value` (jsonb) — e.g. `{"eddProximity": 30, "contactGap": 14}`

---

## ⚡ Global React Contexts

State is managed through two main providers in the `src/context/` directory:

### 1. `AuthContext.jsx`
* Tracks the logged-in Supabase session.
* Handles login (`signInWithPassword`) and logout operations.
* Fetches the user profile details from the `staff` table based on `auth_id`.
* Distributes helper flags:
  * `isAdmin` (true if `role === 'Admin'`)
  * `isSuperAdmin` (true if authenticated email matches `usama786@gmail.com`)

### 2. `AppContext.jsx`
* Orchestrates core CRUD operations (adding/updating patients, logging interactions, deleting records, toggling custom tags).
* Fetches all settings, dropdown lists, custom tags, staff directories, patients, and interaction histories.
* Handles CSV bulk loading and export routines (with Tag support).
* Parses PDFs and maintains temporary upload preview states.
* Configures global dialog modals (`showAddModal`, `selectedPatient`, `confirmDialog`, `toastMessage`).
* Exposes filtered datasets based on global filters (Intent, Area, Caste, Reference, Custom Tags, Assignment, Registration Dates, and search tokens).

---

## ⏰ Alert System Logic

The application features a system to flag patients requiring attention based on critical thresholds. The calculations are handled in [helpers.js](file:///c:/Users/zubai/Desktop/React Projects/Materni-Tracker/src/utils/helpers.js):

* **Grace Period Configuration**: A constant `PAST_EDD_GRACE_DAYS = 14` is enforced. Patients whose EDD is older than 14 days do not trigger overdue alerts; they are flagged as requiring case closure.
* **Alert Types**:
  1. `Delivery Overdue` (Critical red): EDD has passed but is within the 14-day grace window.
  2. `Delivery Due` (Amber): EDD is approaching within the configured proximity threshold (default: 30 days).
  3. `Follow-up Due` (Blue): A scheduled next interaction date is overdue or due today (configured gap default: 14 days).
* **Alert Dismissals**:
  * Users can dismiss alerts temporarily.
  * Dismissals are cached locally in `localStorage` under `maternitrack_dismissed_alerts`.
  * The dismissal storage is localized and programmed to **auto-reset at midnight Pakistan Standard Time (PKT)** by checking dates against `getTodayPKT()`.
  * Dismissals only hide alerts in the header notification dropdown; they remain visible on dashboards to preserve clinical visibility.

---

## 📑 PDF Parsing Logic

The PDF parser in [pdfParser.js](file:///c:/Users/zubai/Desktop/React Projects/Materni-Tracker/src/lib/pdfParser.js) uses `pdfjs-dist` to programmatically extract plain text from patient reports and structures them.

### Support Formats:
1. **HISDU Maternal Health Register (Antenatal Care - ANC)**:
   * Recognizes matching markers `Maternal Health Register` combined with `Antenatal Care`, `(ANC)`, or `SrNo. Visit Date`.
   * Processes serial numbers, 13-digit CNIC sequences, and 11-digit mobile numbers (starting with `03`).
   * Calculates patient ages by matching strings containing `Years` (e.g. `24 Years`).
   * Identifies EDD dates by finding formatted `DD-MM-YYYY` sub-strings immediately adjacent to hemoglobin (`HB`) or `ANC-n` markings.
   * Strips out header/footer noise, page numbers, and system generation footnotes.
2. **Legacy OPD Export Reports**:
   * Scans for patterns combining `Female` directly followed by a `03` contact number.
   * Extracts CNIC and address segments, skipping generic drug prescription lines.

---

## 🚀 Development Quick Start

1. **Verify Environment Variables**: Check `.env` contains valid `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Run Dev Server**:
   ```bash
   npm run dev
   ```
4. **Seed Database / Add Admin**: Set `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in your environment, then run:
   ```bash
   node setup-admin.mjs
   ```
