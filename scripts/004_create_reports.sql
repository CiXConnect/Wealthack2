-- Create reports table for generated reports
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  report_type text not null, -- 'cashflow', 'balance_sheet', 'tax_summary', 'sars_itr14', 'sars_vat201'
  report_period_start date not null,
  report_period_end date not null,
  report_data jsonb not null,
  file_url text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.reports enable row level security;

-- RLS Policies
create policy "reports_select_own"
  on public.reports for select
  using (auth.uid() = user_id);

create policy "reports_insert_own"
  on public.reports for insert
  with check (auth.uid() = user_id);

create policy "reports_delete_own"
  on public.reports for delete
  using (auth.uid() = user_id);

-- Create index for faster queries
create index reports_user_id_idx on public.reports(user_id);
create index reports_type_idx on public.reports(report_type);
