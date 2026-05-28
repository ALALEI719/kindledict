create table if not exists public.customer_access (
  user_id uuid primary key references auth.users(id) on delete cascade,
  access_status text not null default 'free'
    check (access_status in ('free', 'active', 'paid', 'lifetime', 'revoked')),
  plan_slug text,
  source text,
  trial_granted_at timestamptz,
  trial_consumed_at timestamptz,
  purchased_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.touch_customer_access_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_customer_access_updated_at on public.customer_access;
create trigger trg_customer_access_updated_at
before update on public.customer_access
for each row execute function public.touch_customer_access_updated_at();

alter table public.customer_access enable row level security;

create policy "Users can read their own access"
on public.customer_access
for select
to authenticated
using (auth.uid() = user_id);

create policy "Service role manages customer access"
on public.customer_access
for all
to service_role
using (true)
with check (true);
