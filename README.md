# Admission Application System

A React + TypeScript application for managing university admission applications, built with Vite, Supabase, and Tailwind CSS.

## 📁 Project Structure

```
project/
├── dist/                    # Production build output
│   ├── assets/             # Compiled CSS and JS files
│   ├── index.html
│   └── _redirects
│
├── src/                    # Source code
│   ├── contexts/          # React contexts (AuthContext)
│   ├── lib/               # Library files (Supabase client)
│   ├── pages/             # Page components
│   │   ├── admin/        # Admin pages (Dashboard, ApplicationReview)
│   │   ├── student/      # Student pages (Dashboard, CreateApplication)
│   │   └── Login.tsx     # Login page
│   ├── App.tsx            # Main App component with routing
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
│
├── supabase/              # Supabase migrations
│   └── migrations/        # Database migration files
│
├── .env                   # Environment variables (not in git)
├── package.json           # Dependencies and scripts
├── vite.config.ts         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── tsconfig.json          # TypeScript configuration
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher recommended)
- **npm** or **yarn** package manager
- **Supabase account** with a project set up

### Installation Steps

1. **Install Dependencies**
   ```bash
   npm install --no-workspaces
   ```
   
   **Note:** If you encounter "No workspaces found!" errors, use the `--no-workspaces` flag with npm commands.

2. **Set Up Environment Variables**

   Create a `.env` file in the root directory (if it doesn't exist) with the following variables:

   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   To get these values:
   - Go to your Supabase project dashboard
   - Navigate to Settings → API
   - Copy the "Project URL" as `VITE_SUPABASE_URL`
   - Copy the "anon/public" key as `VITE_SUPABASE_ANON_KEY`

3. **Set Up Supabase Database**

   The project includes a migration file at `supabase/migrations/20251207191604_update_applications_schema.sql`. You need to:
   - Apply this migration to your Supabase database
   - Or manually create the required tables (profiles, universities, programs, applications, document_types, application_documents)

4. **Run the Development Server**

   ```bash
   npm run dev -- --no-workspaces
   ```
   
   Or if the standard command works:
   ```bash
   npm run dev
   ```

   The application will start on `http://localhost:5173` (or another port if 5173 is busy).

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## 🏗️ Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Supabase** - Backend (database and authentication)
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## 📝 Features

- **Authentication** - User login with Supabase Auth
- **Role-based Access** - Separate dashboards for students and admins
- **Student Features**:
  - Create admission applications
  - View application status
- **Admin Features**:
  - Review applications
  - Manage application status

## 🔧 Troubleshooting

- **"No workspaces found!" error**: If you encounter this error with npm commands, add the `--no-workspaces` flag:
  - `npm install --no-workspaces`
  - `npm run dev -- --no-workspaces`
- **Port already in use**: If port 5173 is busy, Vite will automatically use the next available port
- **Environment variables not working**: Make sure your `.env` file is in the root directory and restart the dev server
- **Supabase connection issues**: Verify your Supabase URL and anon key are correct in the `.env` file

