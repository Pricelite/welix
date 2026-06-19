alter table public.clients
  add column if not exists archived_at timestamptz;

create index if not exists clients_archived_at_idx on public.clients(user_id, archived_at);
