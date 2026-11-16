# Supabase setup

This guide connects the MOTD Studio website to its shared community template library.

## 1. Open the Supabase project

Create a project at https://supabase.com/dashboard, or open the project you want to use.

Under **Project Settings → API Keys** (or the project's **Connect** dialog), copy:
- The project URL.
- The publishable key (starts with sb_publishable_).

The publishable key is intended for browser use. Never use a Secret key or legacy service_role key in frontend code.

## 2. Create the database

1. Open **SQL Editor → New query**.
2. Paste the contents of supabase/migrations/001_community_templates.sql.
3. Run the migration and confirm it completes successfully.

The migration enables Row Level Security, limits public reads to approved templates, restricts moderation to a private administrator allowlist, and enforces the per-account submission limit.

## 3. Configure the website

Set the project URL and publishable key in js/supabase-config.js:

    export const SUPABASE_URL = "https://YOUR_PROJECT_ID.supabase.co";
    export const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_YOUR_KEY";

These values are public browser configuration. Do not add database passwords, SMTP credentials, or Supabase secret/service-role keys to this file or the repository.

## 4. Configure authentication URLs

In Supabase **Authentication → URL Configuration**:

- Set **Site URL** to https://motdedtior.vercel.app.
- Add https://motdedtior.vercel.app/** to the allowed Redirect URLs.
- Keep email confirmation enabled.

For local development, add your local origin (for example, http://localhost:8000/**) to the Redirect URLs.

Configure a custom SMTP provider in Supabase before opening registration to the public. Keep SMTP credentials in the Supabase dashboard, not in this repository.

## 5. Add the administrator account

1. Create an account through the Templates page.
2. Confirm the account's email.
3. In Supabase SQL Editor, run the following query after replacing the email:

    insert into private.motd_admins (user_id)
    select id
    from auth.users
    where lower(email) = lower('YOUR_ACCOUNT_EMAIL')
    on conflict (user_id) do nothing;

This is a dashboard-only administrator setup step. Do not add public admin-management controls to the website.

## 6. Verify the setup

- Confirm Row Level Security is enabled for the exposed templates table.
- Review the policies created by the migration.
- Test browsing while signed out: only approved templates should be visible.
- Test a normal account: it can submit templates but cannot approve them.
- Test the administrator account: it can review pending submissions.

## Notes

- Built-in templates are stored in presets/templates.json; community submissions are stored in Supabase.
- Pending and rejected submissions are not shown publicly.
- The submission limit is enforced in the database, not just by browser code.
- Email confirmation and Row Level Security help reduce abuse, but they do not replace CAPTCHA or dedicated abuse monitoring for a large public service.
