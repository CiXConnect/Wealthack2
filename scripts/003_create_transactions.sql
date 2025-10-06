-- Create transactions table for parsed transactions
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  document_id uuid references public.documents(id) on delete cascade,
  transaction_date date not null,
  description text not null,
  amount decimal(15, 2) not null,
  type text not null, -- 'debit', 'credit'
  category text,
  sars_category text,
  is_deductible boolean default false,
  notes text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.transactions enable row level security;

-- RLS Policies
create policy "transactions_select_own"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "transactions_insert_own"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create policy "transactions_update_own"
  on public.transactions for update
  using (auth.uid() = user_id);

create policy "transactions_delete_own"
  on public.transactions for delete
  using (auth.uid() = user_id);

-- Create indexes for faster queries
create index transactions_user_id_idx on public.transactions(user_id);
create index transactions_date_idx on public.transactions(transaction_date);
create index transactions_category_idx on public.transactions(category);
