create extension if not exists pgcrypto;

create or replace function public.parse_money_to_numeric(raw_value text)
returns numeric
language plpgsql
immutable
as $$
declare
  normalized text;
begin
  if raw_value is null or btrim(raw_value) = '' then
    return 0;
  end if;

  normalized := regexp_replace(raw_value, '[^0-9,.\-]', '', 'g');
  normalized := replace(normalized, ',', '.');

  if normalized = '' or normalized = '.' or normalized = '-' then
    return 0;
  end if;

  return normalized::numeric;
exception
  when others then
    return 0;
end;
$$;

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  contact text,
  email text,
  city text,
  revenue numeric(12, 2) not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  client_id uuid references public.clients(id) on delete restrict,
  quote_number text not null unique,
  trade text,
  status text not null default 'Brouillon',
  date text,
  description text not null,
  material text,
  labor text,
  estimated_time text,
  recommended_price numeric(12, 2),
  vat_rate numeric(5, 2),
  vat numeric(12, 2) not null default 0,
  subtotal numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  amount numeric(12, 2) not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete restrict,
  quote_id uuid references public.quotes(id) on delete set null,
  invoice_number text not null unique,
  stripe_invoice_id text unique,
  stripe_payment_intent_id text,
  status text not null default 'Brouillon',
  issued_at date,
  due_at date,
  paid_at timestamptz,
  subtotal numeric(12, 2) not null default 0,
  vat numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  amount numeric(12, 2) not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.clients
  add column if not exists revenue numeric(12, 2) default 0;

alter table public.clients
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

alter table public.clients
  add column if not exists created_at timestamptz not null default timezone('utc', now());

alter table public.clients
  add column if not exists user_id uuid;

alter table public.clients
  add column if not exists name text;

alter table public.clients
  add column if not exists contact text;

alter table public.clients
  add column if not exists email text;

alter table public.clients
  add column if not exists city text;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'clients'
      and column_name = 'revenue'
      and data_type <> 'numeric'
  ) then
    alter table public.clients add column if not exists revenue_tmp numeric(12, 2) not null default 0;
    update public.clients
    set revenue_tmp = public.parse_money_to_numeric(revenue::text);
    alter table public.clients drop column revenue;
    alter table public.clients rename column revenue_tmp to revenue;
  end if;
end $$;

alter table public.quotes
  add column if not exists user_id uuid;

alter table public.quotes
  add column if not exists client_id uuid;

alter table public.quotes
  add column if not exists quote_number text;

alter table public.quotes
  add column if not exists trade text;

alter table public.quotes
  add column if not exists status text default 'Brouillon';

alter table public.quotes
  add column if not exists date text;

alter table public.quotes
  add column if not exists description text;

alter table public.quotes
  add column if not exists material text;

alter table public.quotes
  add column if not exists labor text;

alter table public.quotes
  add column if not exists estimated_time text;

alter table public.quotes
  add column if not exists recommended_price numeric(12, 2);

alter table public.quotes
  add column if not exists vat_rate numeric(5, 2);

alter table public.quotes
  add column if not exists vat numeric(12, 2) not null default 0;

alter table public.quotes
  add column if not exists subtotal numeric(12, 2) not null default 0;

alter table public.quotes
  add column if not exists total numeric(12, 2) not null default 0;

alter table public.quotes
  add column if not exists amount numeric(12, 2) not null default 0;

alter table public.quotes
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

alter table public.quotes
  add column if not exists created_at timestamptz not null default timezone('utc', now());

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'quotes'
      and column_name = 'recommended_price'
      and data_type <> 'numeric'
  ) then
    alter table public.quotes add column if not exists recommended_price_tmp numeric(12, 2);
    update public.quotes
    set recommended_price_tmp = public.parse_money_to_numeric(recommended_price::text);
    alter table public.quotes drop column recommended_price;
    alter table public.quotes rename column recommended_price_tmp to recommended_price;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'quotes'
      and column_name = 'vat_amount'
  ) then
    update public.quotes
    set vat = public.parse_money_to_numeric(vat_amount::text)
    where vat = 0;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'quotes'
      and column_name = 'total'
      and data_type <> 'numeric'
  ) then
    alter table public.quotes add column if not exists total_tmp numeric(12, 2) not null default 0;
    update public.quotes
    set total_tmp = public.parse_money_to_numeric(total::text);
    alter table public.quotes drop column total;
    alter table public.quotes rename column total_tmp to total;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'quotes'
      and column_name = 'amount'
      and data_type <> 'numeric'
  ) then
    alter table public.quotes add column if not exists amount_tmp numeric(12, 2) not null default 0;
    update public.quotes
    set amount_tmp = public.parse_money_to_numeric(amount::text);
    alter table public.quotes drop column amount;
    alter table public.quotes rename column amount_tmp to amount;
  end if;
end $$;

update public.quotes
set amount = coalesce(nullif(amount, 0), total);

update public.quotes
set vat = coalesce(nullif(vat, 0), total - coalesce(recommended_price, subtotal), 0);

update public.quotes
set subtotal = coalesce(
  nullif(subtotal, 0),
  recommended_price,
  case when total > 0 then total - vat else 0 end,
  amount
);

alter table public.invoices
  add column if not exists user_id uuid;

alter table public.invoices
  add column if not exists client_id uuid;

alter table public.invoices
  add column if not exists quote_id uuid;

alter table public.invoices
  add column if not exists invoice_number text;

alter table public.invoices
  add column if not exists stripe_invoice_id text;

alter table public.invoices
  add column if not exists stripe_payment_intent_id text;

alter table public.invoices
  add column if not exists status text default 'Brouillon';

alter table public.invoices
  add column if not exists issued_at date;

alter table public.invoices
  add column if not exists due_at date;

alter table public.invoices
  add column if not exists paid_at timestamptz;

alter table public.invoices
  add column if not exists subtotal numeric(12, 2) not null default 0;

alter table public.invoices
  add column if not exists vat numeric(12, 2) not null default 0;

alter table public.invoices
  add column if not exists total numeric(12, 2) not null default 0;

alter table public.invoices
  add column if not exists amount numeric(12, 2) not null default 0;

alter table public.invoices
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

alter table public.invoices
  add column if not exists created_at timestamptz not null default timezone('utc', now());

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'invoices'
      and column_name = 'amount'
      and data_type <> 'numeric'
  ) then
    alter table public.invoices add column if not exists amount_tmp numeric(12, 2) not null default 0;
    update public.invoices
    set amount_tmp = public.parse_money_to_numeric(amount::text);
    alter table public.invoices drop column amount;
    alter table public.invoices rename column amount_tmp to amount;
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'quotes'
      and column_name = 'client_name'
  ) then
    insert into public.clients (user_id, name, revenue)
    select distinct q.user_id, q.client_name, 0
    from public.quotes q
    left join public.clients c
      on c.user_id = q.user_id
     and c.name = q.client_name
    where q.client_name is not null
      and btrim(q.client_name) <> ''
      and c.id is null;

    update public.quotes q
    set client_id = c.id
    from public.clients c
    where q.client_id is null
      and c.user_id = q.user_id
      and c.name = q.client_name;
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'clients'
      and column_name = 'last_quote'
  ) then
    alter table public.clients add column if not exists last_quote_id uuid;

    update public.clients c
    set last_quote_id = q.id
    from public.quotes q
    where c.last_quote_id is null
      and c.user_id = q.user_id
      and q.quote_number = c.last_quote;
  end if;
end $$;

alter table public.clients
  add column if not exists last_quote_id uuid references public.quotes(id) on delete set null;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'quotes'
      and column_name = 'vat_amount'
  ) then
    alter table public.quotes drop column vat_amount;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'quotes'
      and column_name = 'client_name'
  ) then
    alter table public.quotes drop column client_name;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'clients'
      and column_name = 'last_quote'
  ) then
    alter table public.clients drop column last_quote;
  end if;
end $$;

drop trigger if exists clients_set_updated_at on public.clients;
create trigger clients_set_updated_at
before update on public.clients
for each row
execute function public.set_updated_at();

drop trigger if exists quotes_set_updated_at on public.quotes;
create trigger quotes_set_updated_at
before update on public.quotes
for each row
execute function public.set_updated_at();

drop trigger if exists invoices_set_updated_at on public.invoices;
create trigger invoices_set_updated_at
before update on public.invoices
for each row
execute function public.set_updated_at();

create index if not exists clients_user_id_idx on public.clients(user_id);
create index if not exists clients_revenue_idx on public.clients(user_id, revenue desc);
create index if not exists quotes_user_id_idx on public.quotes(user_id);
create index if not exists quotes_client_id_idx on public.quotes(client_id);
create index if not exists quotes_status_idx on public.quotes(user_id, status);
create index if not exists quotes_created_at_idx on public.quotes(user_id, created_at desc);
create index if not exists invoices_user_id_idx on public.invoices(user_id);
create index if not exists invoices_client_id_idx on public.invoices(client_id);
create index if not exists invoices_quote_id_idx on public.invoices(quote_id);
create index if not exists invoices_status_idx on public.invoices(user_id, status);
create index if not exists invoices_due_at_idx on public.invoices(user_id, due_at desc);

alter table public.clients enable row level security;
alter table public.quotes enable row level security;
alter table public.invoices enable row level security;

drop policy if exists "clients_select_own" on public.clients;
create policy "clients_select_own"
on public.clients
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "clients_insert_own" on public.clients;
create policy "clients_insert_own"
on public.clients
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "clients_update_own" on public.clients;
create policy "clients_update_own"
on public.clients
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "quotes_select_own" on public.quotes;
create policy "quotes_select_own"
on public.quotes
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "quotes_insert_own" on public.quotes;
create policy "quotes_insert_own"
on public.quotes
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "quotes_update_own" on public.quotes;
create policy "quotes_update_own"
on public.quotes
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "invoices_select_own" on public.invoices;
create policy "invoices_select_own"
on public.invoices
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "invoices_insert_own" on public.invoices;
create policy "invoices_insert_own"
on public.invoices
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "invoices_update_own" on public.invoices;
create policy "invoices_update_own"
on public.invoices
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
