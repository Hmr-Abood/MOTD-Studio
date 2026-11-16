-- MOTD Studio community templates
-- Apply this entire migration in the Supabase SQL Editor.
-- Browser clients use only the publishable key. No service-role key is needed.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.motd_admins (
    user_id uuid primary key references auth.users(id) on delete cascade,
    created_at timestamptz not null default now()
);

-- A private audit ledger keeps the rate limit effective even if a pending
-- template is withdrawn or removed later.
create table if not exists private.motd_submission_events (
    id bigint generated always as identity primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    created_at timestamptz not null default now()
);

alter table private.motd_admins enable row level security;
alter table private.motd_submission_events enable row level security;
revoke all on table private.motd_admins, private.motd_submission_events from public, anon, authenticated;

create table if not exists public.motd_templates (
    id uuid primary key default gen_random_uuid(),
    name text not null check (char_length(btrim(name)) between 1 and 40),
    description text not null check (char_length(btrim(description)) between 1 and 500),
    line1 text not null check (char_length(line1) between 1 and 500 and char_length(btrim(line1)) > 0),
    line2 text not null check (char_length(line2) between 1 and 500 and char_length(btrim(line2)) > 0),
    language text not null check (language in ('English','Arabic','Spanish','French','German','Portuguese','Other')),
    category text not null check (category in ('Survival','SMP','PvP','Factions','Creative','Minigames','Network','Other')),
    style text not null check (style in ('Clean','Minimal','Colorful','Gradient','Seasonal')),
    author_id uuid not null references auth.users(id) on delete cascade,
    status text not null default 'pending' check (status in ('pending','approved','rejected')),
    created_at timestamptz not null default now(),
    reviewed_at timestamptz,
    reviewed_by uuid references auth.users(id) on delete set null
);

create index if not exists motd_templates_public_feed_idx
    on public.motd_templates (created_at desc) where status = 'approved';
create index if not exists motd_templates_author_idx
    on public.motd_templates (author_id, created_at desc);

alter table public.motd_templates enable row level security;

revoke all on table public.motd_templates from anon, authenticated;
grant select on table public.motd_templates to anon, authenticated;
grant insert (name, description, line1, line2, language, category, style, author_id)
    on table public.motd_templates to authenticated;
grant update (status, reviewed_at, reviewed_by)
    on table public.motd_templates to authenticated;
grant delete on table public.motd_templates to authenticated;

create or replace function public.is_motd_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1
        from private.motd_admins
        where user_id = (select auth.uid())
    );
$$;

revoke all on function public.is_motd_admin() from public, anon;
grant execute on function public.is_motd_admin() to authenticated;

create policy "Anyone can read approved MOTDs"
    on public.motd_templates for select
    to anon
    using (status = 'approved');

create policy "Users can read approved and own submissions; admins can read all"
    on public.motd_templates for select
    to authenticated
    using (
        status = 'approved'
        or author_id = (select auth.uid())
        or (select public.is_motd_admin())
    );

create policy "Signed-in users can submit pending MOTDs as themselves"
    on public.motd_templates for insert
    to authenticated
    with check (
        author_id = (select auth.uid())
        and status = 'pending'
    );

create policy "Only admins can moderate MOTDs"
    on public.motd_templates for update
    to authenticated
    using ((select public.is_motd_admin()))
    with check ((select public.is_motd_admin()));

create policy "Authors can withdraw pending MOTDs; admins can delete any"
    on public.motd_templates for delete
    to authenticated
    using (
        (author_id = (select auth.uid()) and status = 'pending')
        or (select public.is_motd_admin())
    );

-- Limit each account to five submissions in any rolling 24-hour period.
create or replace function private.limit_motd_submissions()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
    recent_count integer;
    submitting_user uuid := (select auth.uid());
begin
    if submitting_user is null or new.author_id <> submitting_user then
        raise exception 'A signed-in account is required to submit templates';
    end if;

    perform pg_advisory_xact_lock(hashtextextended(submitting_user::text, 0));

    select count(*)::integer
      into recent_count
      from private.motd_submission_events
     where user_id = submitting_user
       and created_at > now() - interval '24 hours';

    if recent_count >= 5 then
        raise exception 'submission limit reached: five templates per 24 hours';
    end if;

    insert into private.motd_submission_events (user_id)
    values (submitting_user);

    return new;
end;
$$;

revoke all on function private.limit_motd_submissions() from public, anon, authenticated;

drop trigger if exists enforce_motd_submission_limit on public.motd_templates;
create trigger enforce_motd_submission_limit
    before insert on public.motd_templates
    for each row execute function private.limit_motd_submissions();

-- Add the project owner as the first moderator AFTER creating and confirming
-- their Supabase account. See SUPABASE_SETUP.md for the one-time SQL command.
