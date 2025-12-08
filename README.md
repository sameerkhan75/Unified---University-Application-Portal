# Unified University Application Platform

Single web app where students discover programs, submit applications, upload documents, and track status while admins manage applicant pipelines, verify submissions, and control document/eligibility requirements.

- **Live prototype:** https://admission-applicatio-yryb.bolt.host/
- **Stack:** Vite + React + TypeScript + Tailwind CSS, Supabase (PostgreSQL + Auth + Storage), REST APIs powered by Node.js/Express services, JWT-based auth context, and Supabase storage for documents. AI-assisted document checks and automated payment reconciliation are not enabled in this build.

---

## Architecture at a glance

- **Frontend (this repo):** Vite React SPA with role-based routing (`src/App.tsx`), auth context (`src/contexts/AuthContext.tsx`), student pages (`src/pages/student`) for dashboard, program search, application form, document upload, ticketing, and admin pages (`src/pages/admin`) for dashboards, applicant list, manual document review, and configuration screens.
- **Backend services:** Node.js/Express REST API (hosted separately) handling authentication, application workflow orchestration, manual document approval, ticketing, and notification hooks. Background jobs (Redis queues) process notifications and SLA reminders.
- **Database layer:** Supabase Postgres schema described in `src/lib/supabase.ts` with tables for `profiles`, `universities`, `programs`, `applications`, `document_types`, and `application_documents`. Each table uses foreign keys and timestamp columns for auditing.
- **Storage & auth:** Supabase Storage stores uploaded files; JWT tokens issued by Supabase secure API requests from the frontend.

---

## Setup & dependencies

### Prerequisites

- Node.js 20+
- npm 10+
- Supabase (or Postgres + an auth/storage layer) with the schema from `supabase/`

### Installation

```bash
git clone <repo-url>
cd project
npm install
cp .env.example .env   # fill values listed below
```

### Environment variables

| Variable | Description |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key for auth/storage |

---

## Development commands

```bash
npm run dev -- --no-workspaces   # start Vite dev server (http://localhost:5173)
npm run typecheck                # TypeScript project validation
npm run lint                     # ESLint (React + TS config)
npm run build                    # Production bundle for deployment
npm run preview                  # Serve the production build locally
```

---

## Deployment notes

- Deploy the frontend bundle (output of `npm run build`) to Bolt, Vercel, Netlify, or any static host.
- Host the Node.js/Express API and Supabase/Postgres in your preferred environment (Render/Railway/AWS). Ensure environment variables for API base URLs and Supabase credentials are set in the hosting platform.
- Payments and AI-based document validation are intentionally omitted; current workflows assume manual verification and offline payment confirmation logged by admins.

---

## Contact

This repository demonstrates the requested unified admissions experience, focusing on clean architecture, typed Supabase integration, and role-based UI flows. For additional details or walkthroughs, please reach out via the contact information shared in the application.
