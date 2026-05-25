-- Run this in Supabase SQL Editor
-- Go to: supabase.com → your project → SQL Editor → New Query → paste this → Run

create table if not exists portfolio_images (
  id uuid default gen_random_uuid() primary key,
  url text not null,
  public_id text,
  label text default '',
  category text default 'all',
  position bigint default 0,
  created_at timestamptz default now()
);

create table if not exists portfolio_settings (
  key text primary key,
  value text
);

-- Allow public read
alter table portfolio_images enable row level security;
alter table portfolio_settings enable row level security;

create policy "Public read images" on portfolio_images for select using (true);
create policy "Public read settings" on portfolio_settings for select using (true);
