-- ApplyTrack MVP schema. This public, anon-key policy is suitable only for a
-- single-user personal MVP. Anyone with the project URL/key can access rows.
create extension if not exists pgcrypto;

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  role text not null,
  application_url text,
  status text not null default 'Applied'
    check (status in ('Applied', 'Interview', 'Rejected', 'Offer')),
  date_applied date default current_date,
  notes text,
  created_at timestamptz default now()
);

alter table public.applications enable row level security;

drop policy if exists "Allow public read applications" on public.applications;
drop policy if exists "Allow public insert applications" on public.applications;
drop policy if exists "Allow public update applications" on public.applications;
drop policy if exists "Allow public delete applications" on public.applications;

create policy "Allow public read applications" on public.applications
  for select to anon, authenticated using (true);
create policy "Allow public insert applications" on public.applications
  for insert to anon, authenticated with check (true);
create policy "Allow public update applications" on public.applications
  for update to anon, authenticated using (true) with check (true);
create policy "Allow public delete applications" on public.applications
  for delete to anon, authenticated using (true);

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.applications to anon, authenticated;
