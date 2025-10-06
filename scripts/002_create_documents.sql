-- Create documents table for uploaded files
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  file_name text not null,
  file_type text not null, -- 'bank_statement', 'irp5', 'receipt', 'invoice'
  file_size integer not null,
  file_url text not null,
  status text default 'pending', -- 'pending', 'processing', 'completed', 'failed'
  processing_error text,
  uploaded_at timestamptz default now(),
  processed_at timestamptz
);

-- Enable RLS
alter table public.documents enable row level security;

-- RLS Policies
create policy "documents_select_own"
  on public.documents for select
  using (auth.uid() = user_id);

create policy "documents_insert_own"
  on public.documents for insert
  with check (auth.uid() = user_id);

create policy "documents_update_own"
  on public.documents for update
  using (auth.uid() = user_id);

create policy "documents_delete_own"
  on public.documents for delete
  using (auth.uid() = user_id);

-- Create index for faster queries
create index documents_user_id_idx on public.documents(user_id);
create index documents_status_idx on public.documents(status);
