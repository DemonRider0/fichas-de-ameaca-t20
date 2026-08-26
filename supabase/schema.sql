create table if not exists public.threat_sheets (
  id uuid not null,
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  schema_version integer not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (owner_id, id)
);

alter table public.threat_sheets enable row level security;

revoke all on table public.threat_sheets from anon;
grant select, insert, update, delete on table public.threat_sheets to authenticated;

create policy "Usuários leem somente as próprias fichas"
on public.threat_sheets
for select
to authenticated
using ((select auth.uid()) = owner_id);

create policy "Usuários criam somente as próprias fichas"
on public.threat_sheets
for insert
to authenticated
with check ((select auth.uid()) = owner_id);

create policy "Usuários alteram somente as próprias fichas"
on public.threat_sheets
for update
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

create policy "Usuários apagam somente as próprias fichas"
on public.threat_sheets
for delete
to authenticated
using ((select auth.uid()) = owner_id);

create index if not exists threat_sheets_owner_updated_idx
on public.threat_sheets (owner_id, updated_at desc);
