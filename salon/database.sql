-- Run in Supabase Dashboard > SQL Editor. Customer information is private.
create table if not exists public.bookings (
  id bigint generated always as identity primary key,
  reference text not null unique,
  name text not null,
  email text not null,
  phone text not null,
  notes text not null default '',
  services jsonb not null,
  stylist text not null,
  package_id text,
  appointment_date date not null,
  appointment_time text not null,
  promo text not null default '',
  status text not null default 'pending' check (status in ('pending','confirmed','cancelled','completed')),
  created_at timestamptz not null default now()
);
alter table public.bookings enable row level security;
-- No public access policies: bookings can only be viewed in dashboard or via trusted server credentials.
revoke all on public.bookings from anon, authenticated;
