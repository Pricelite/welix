create table if not exists public.weli_memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  label text not null,
  value text not null,
  category text not null check (category in ('preference', 'pricing', 'writing', 'supplier', 'workflow', 'customer-care')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists weli_memories_user_id_idx on public.weli_memories(user_id);
create index if not exists weli_memories_user_created_at_idx on public.weli_memories(user_id, created_at desc);
create index if not exists weli_memories_user_category_idx on public.weli_memories(user_id, category);

drop trigger if exists weli_memories_set_updated_at on public.weli_memories;
create trigger weli_memories_set_updated_at
before update on public.weli_memories
for each row
execute function public.set_updated_at();

alter table public.weli_memories enable row level security;

drop policy if exists "weli_memories_select_own" on public.weli_memories;
create policy "weli_memories_select_own"
on public.weli_memories
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "weli_memories_insert_own" on public.weli_memories;
create policy "weli_memories_insert_own"
on public.weli_memories
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "weli_memories_update_own" on public.weli_memories;
create policy "weli_memories_update_own"
on public.weli_memories
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "weli_memories_delete_own" on public.weli_memories;
create policy "weli_memories_delete_own"
on public.weli_memories
for delete
to authenticated
using (auth.uid() = user_id);
