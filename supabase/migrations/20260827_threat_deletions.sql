-- Sincroniza exclusões entre dispositivos sem permitir que uma cópia local
-- antiga recrie uma ficha removida.
create table if not exists public.threat_deletions (
  id uuid not null,
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  deleted_at timestamptz not null default now(),
  primary key (owner_id, id)
);

alter table public.threat_deletions enable row level security;

revoke all on table public.threat_deletions from anon;
grant select, insert, update, delete on table public.threat_deletions to authenticated;

create policy "Usuários leem somente as próprias exclusões"
on public.threat_deletions
for select
to authenticated
using ((select auth.uid()) = owner_id);

create policy "Usuários criam somente as próprias exclusões"
on public.threat_deletions
for insert
to authenticated
with check ((select auth.uid()) = owner_id);

create policy "Usuários alteram somente as próprias exclusões"
on public.threat_deletions
for update
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

create policy "Usuários apagam somente as próprias exclusões"
on public.threat_deletions
for delete
to authenticated
using ((select auth.uid()) = owner_id);

create index if not exists threat_deletions_owner_deleted_idx
on public.threat_deletions (owner_id, deleted_at desc);
