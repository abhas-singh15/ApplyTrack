# ApplyTrack

A small job application dashboard built with React, Vite, and Supabase. Application records are read and changed directly through `@supabase/supabase-js`; the app does not use mock records or browser storage.

## 1. Install dependencies

```sh
npm install
```

## 2. Create a Supabase project

Create a project at [supabase.com](https://supabase.com/). In the project dashboard, open **Project Settings → API** and copy the Project URL and publishable key.

## 3. Create the database table

Open **SQL Editor → New query** in Supabase, paste the contents of [`supabase/schema.sql`](supabase/schema.sql), and run it. The script creates the `applications` table, enables RLS, and sets CRUD policies for the anon and authenticated roles.

**MVP access note:** These policies allow anyone with the project's public URL and publishable key to read and change every application row. This is appropriate only for a private, single-user demo. Before inviting multiple users or handling sensitive records, add Supabase Auth and scope policies to `auth.uid()` using a user ownership column.

## 4. Configure environment variables

Copy `.env.example` to `.env` and set:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

Use the publishable (or legacy anon) key only. Never put a Supabase service role key in this frontend.

## 5. Run locally

```sh
npm run dev
```

Open the local URL printed by Vite. The app shows a setup notice when the variables are missing. Restart Vite after editing `.env`.

## 6. Deploy to Vercel

1. Push this project to a Git provider, or import the project directory with the Vercel CLI.
2. In Vercel, create a project from the repository. Vercel detects Vite; use `npm run build` as the build command and `dist` as the output directory.
3. In **Project Settings → Environment Variables**, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` for the environments you will deploy.
4. Deploy (or redeploy after adding variables). Confirm the deployed page can load and create an application.

The included `vercel.json` is not required; Vite's static output works with Vercel defaults.
