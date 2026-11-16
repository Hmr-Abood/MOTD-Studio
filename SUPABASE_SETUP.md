# Supabase setup for MOTD Studio

This connects the GitHub Pages site to a shared community template library.

## 1. Create a Supabase project

1. Create a project at https://supabase.com/dashboard.
2. Choose a strong database password and keep it private.
3. Open **Project Settings → API Keys** (or the project's **Connect** dialog).
4. Copy the **Project URL** and the **Publishable key** (starts with `sb_publishable_`).
5. Do not copy a Secret key or legacy `service_role` key into this repository.

## 2. Create the database safely

1. Open **SQL Editor → New query** in your Supabase project.
2. Paste the full contents of `supabase/migrations/001_community_templates.sql`.
3. Run it once and confirm it completes successfully.

The migration enables RLS on the exposed templates table and private admin/rate-limit tables, revokes broad table permissions, allows public reads only for approved templates, requires authenticated authors for submissions, restricts moderation to a private admin allowlist, and limits accounts to five submissions per rolling 24 hours. The rate-limit ledger is separate from template rows, so withdrawing a pending submission does not reset the limit.

## 3. Configure the website

Edit `js/supabase-config.js` and replace the two placeholders:

- `YOUR_SUPABASE_PROJECT_URL` with the Project URL.
- `YOUR_SUPABASE_PUBLISHABLE_KEY` with the Publishable key.

The publishable key is intentionally visible in browser code. Database RLS is the security boundary. Never put a Secret or service_role key in this file.

## 4. Configure authentication

In Supabase **Authentication → URL Configuration**:

- Set Site URL to your deployed GitHub Pages URL, for example `https://hmr-abood.github.io/MOTD-Studio/`.
- Add that same URL to the Redirect URLs allowlist.
- Keep email confirmation enabled.
- Configure SMTP/custom email delivery before inviting public users; the default email service has strict limits.

Create your own account from the Templates page and confirm the email before continuing.

## 5. Make yourself the moderator

After your account is confirmed, open SQL Editor and run this command, replacing the email with the exact email used for your account:

```sql
insert into private.motd_admins (user_id)
select id from auth.users where lower(email) = lower('YOUR_ACCOUNT_EMAIL')
on conflict (user_id) do nothing;
```

This is a one-time dashboard-only admin action. Never add an admin-management control to the public website. The private allowlist is not exposed through the Data API.

## 6. Verify the security rules

- Open **Database → Tables → motd_templates** and confirm RLS is enabled.
- Open **Database → Policies** and confirm the policies from the migration exist.
- Open **Security Advisor** and review any findings.
- Test signed-out browsing: only approved templates should appear.
- Test a new account: it should be able to submit, but not approve or publish.
- Test the moderator account: it should see pending submissions and approve/reject them.

## Notes

- Community submissions are stored globally; the original built-in presets remain bundled with the site.
- Pending submissions are visible only to their author and moderators.
- Rejected submissions remain visible to their author and moderators, not to the public.
- Users can withdraw their own pending submissions.
- This first version intentionally has no public likes, comments, uploads, or arbitrary HTML.
- The database limits submissions to five per account per rolling 24 hours. Email confirmation and RLS reduce abuse, but they do not replace CAPTCHA or dedicated abuse monitoring at larger scale.
