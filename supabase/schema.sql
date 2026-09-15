create extension if not exists "pgcrypto";

create table if not exists public.pets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  rarity text not null check (rarity in ('common', 'uncommon', 'rare', 'ultra_rare', 'legendary')),
  is_neon boolean not null default false,
  is_mega_neon boolean not null default false,
  is_flyable boolean not null default false,
  is_rideable boolean not null default false,
  price numeric(12, 2) not null check (price > 0),
  currency text not null default 'PHP' check (currency in ('PHP', 'USD')),
  notes text,
  image_url text,
  image_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists pets_updated_at on public.pets;
create trigger pets_updated_at before update on public.pets
for each row execute function public.set_updated_at();

insert into storage.buckets (id, name, public)
values ('pet-images', 'pet-images', true)
on conflict (id) do update set public = true;
