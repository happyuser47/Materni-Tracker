# Materni-Tracker

A powerful, specialized patient tracking system for maternal health clinics. **Materni-Tracker** streamlines the management of patient registrations, clinical interactions, and delivery outcomes, providing real-time alerts and advanced data extraction from medical records.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Supabase account and project

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/happyuser47/Materni-Tracker.git
   cd Materni-Tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## 🛠 Tech Stack

- **Frontend**: React 19 + Vite
- **Styling**: Tailwind CSS 4.0
- **Database/Auth**: Supabase
- **PDF Extraction**: PDF.js (`pdfjs-dist`)

## 📋 Core Features

- **Dynamic Dashboard**: Monitor active cases, upcoming EDDs, and overdue follow-ups.
- **Smart Data Import**: Bulk import patients via CSV or directly by parsing HISDU/OPD PDF reports.
- **Assignment System**: Case-load management for staff members.
- **Interaction History**: Detailed logs of calls, visits, and clinical outcomes.
- **Mobile Responsive**: Fully optimized for tablets and mobile devices.

## 📄 Project Context

For a detailed breakdown of the application architecture, business logic, and database schema, please refer to [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md).

---
Built with ❤️ for improved maternal health tracking.
