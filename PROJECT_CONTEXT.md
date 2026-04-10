# Project: Materni-Tracker

## Overview
**Materni-Tracker** is a specialized patient tracking and maternity management application designed for healthcare clinics. It allows medical staff and administrators to monitor patient registration, antenatal care (ANC), delivery outcomes, and follow-up interactions.

The system is built to handle high volumes of patient data through manual entry, CSV uploads, and advanced PDF parsing of official medical registers.

## Tech Stack
- **Frontend Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4.0](https://tailwindcss.com/)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL + Auth)
- **Icons**: [Lucide React](https://lucide.dev/)
- **PDF Processing**: [pdfjs-dist](https://mozilla.github.io/pdf.js/) for automated data extraction from clinical reports.

## Core Features
### 1. Dashboard & Analytics
- **Live Stats**: Tracking Active Patients, Upcoming Deliveries (EDD), and Overdue Contacts.
- **Alert System**: Visual indicators for patients requiring immediate attention based on custom proximity (EDD) and gap (Contact) rules.

### 2. Patient Management
- **Directory**: searchable list with filters for CNIC, Phone, Area, Caste, and Reference.
- **My Patients**: Dedicated view for staff to manage their own case assignments.
- **Patient Detail**: Full history of clinical interactions and demographic data.

### 3. Interaction Logging
- **Multi-channel Tracking**: Log Calls, Visits, and Referrals.
- **Clinical Intents**: Monitor patient intent (High/Medium/Low) and preference (Undecided, Hospital, Home).
- **Outcome Management**: Track case closure reasons (Delivered Clinic, Delivered Outside, Miscarriage, etc.).

### 4. Data Import & Automation
- **CSV Import**: Template-based bulk registration.
- **Advanced PDF Parser**: Automated extraction logic for:
  - HISDU Maternal Health Register (ANC)
  - Legacy OPD Report Exports
- **Smart EDD Calculation**: Auto-parses delivery dates from medical reports.

### 5. Administration
- **Staff Management**: Role-based access (Admin vs. Staff) with Supabase Auth integration.
- **Customization**: Management of Area, Caste, and Reference lists.
- **System Settings**: Configurable alert thresholds for EDD proximity and contact gaps.

## Database Schema (Key Tables)
- `patients`: Core demographic and clinical state.
- `staff`: Staff profiles linked to Supabase Auth.
- `interactions`: Time-series log of all patient contacts.
- `custom_lists`: Utility table for dropdown values.
- `system_settings`: Global application configurations.

## Architecture
- **Context API**: Global state managed via `AuthContext` and `AppContext`.
- **Layouts**: Responsive Sidebar and Header design.
- **Security**: Role-based access control (RBAC) enforced in the React UI and through Postgres RLS (implied).
