-- ============================================================
-- 001_initial_schema.sql — nsfw-directory
-- Execute no Supabase SQL Editor (projeto NOVO, separado)
-- ============================================================

-- Extensions
create extension if not exists "pg_trgm";
create extension if not exists "unaccent";

-- ============================================================
-- ENUMS
-- ============================================================
create type content_status  as enum ('active', 'broken', 'pending', 'premium');
create type indexing_status as enum ('draft', 'queued', 'published', 'submitted', 'indexed', 'deindexed');
create type entity_type     as enum ('channel', 'group', 'bot');

-- ============================================================
-- CATEGORIES
-- ============================================================
create table public.categories (
  id          serial primary key,
  slug        text not null unique,
  name        text not null,
  type        text not null check (type in ('genre', 'country')),
  icon        text,
  sort_order  integer not null default 0,
  is_trending boolean not null default false,
  created_at  timestamptz not null default now()
);

create index idx_categories_type on public.categories (type);
create index idx_categories_sort on public.categories (sort_order);

-- ============================================================
-- GROUPS (channels + groups)
-- ============================================================
create table public.groups (
  id               serial primary key,
  slug             text not null unique,
  name             text not null,
  description      text,
  telegram_url     text,
  telegram_handle  text,
  thumbnail_url    text,
  category_slug    text not null references public.categories (slug) on delete restrict,
  country          text not null default 'All',
  tags             text[],
  member_count     integer not null default 0,
  view_count       integer not null default 0,
  click_count      integer not null default 0,
  is_featured      boolean not null default false,
  is_premium       boolean not null default false,
  is_verified      boolean not null default false,
  is_new           boolean not null default true,
  entity_type      entity_type not null default 'group',
  status           content_status not null default 'active',
  hidden           boolean not null default false,
  broken           boolean not null default false,
  published_at     timestamptz,
  indexing_status  indexing_status not null default 'draft',
  submitted_at     timestamptz,
  quality_score    integer not null default 0 check (quality_score between 0 and 100),
  seo_title        text,
  seo_description  text,
  source           text,
  batch_number     integer,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Indexes for groups
create index idx_groups_category     on public.groups (category_slug);
create index idx_groups_status       on public.groups (status);
create index idx_groups_indexing     on public.groups (indexing_status);
create index idx_groups_hidden       on public.groups (hidden);
create index idx_groups_featured     on public.groups (is_featured);
create index idx_groups_published_at on public.groups (published_at desc);
create index idx_groups_click_count  on public.groups (click_count desc);
create index idx_groups_member_count on public.groups (member_count desc);
create index idx_groups_slug         on public.groups (slug);
create index idx_groups_country      on public.groups (lower(country));
create index idx_groups_batch        on public.groups (batch_number);

-- Full-text search index
create index idx_groups_fts on public.groups
  using gin(to_tsvector('english', coalesce(name,'') || ' ' || coalesce(description,'')));

-- ============================================================
-- BOTS
-- ============================================================
create table public.bots (
  id               serial primary key,
  slug             text not null unique,
  name             text not null,
  description      text,
  telegram_url     text,
  thumbnail_url    text,
  category_slug    text references public.categories (slug) on delete set null,
  tags             text[],
  click_count      integer not null default 0,
  is_featured      boolean not null default false,
  status           content_status not null default 'active',
  indexing_status  indexing_status not null default 'draft',
  published_at     timestamptz,
  quality_score    integer not null default 0 check (quality_score between 0 and 100),
  seo_title        text,
  seo_description  text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index idx_bots_status      on public.bots (status);
create index idx_bots_indexing    on public.bots (indexing_status);
create index idx_bots_featured    on public.bots (is_featured);
create index idx_bots_click_count on public.bots (click_count desc);

-- ============================================================
-- AI TOOLS
-- ============================================================
create table public.ai_tools (
  id              serial primary key,
  slug            text not null unique,
  name            text not null,
  tagline         text,
  description     text,
  thumbnail_url   text,
  website_url     text,
  affiliate_url   text,
  category        text,
  payment_types   text[],
  price_monthly   numeric(10,2),
  is_free         boolean not null default true,
  is_featured     boolean not null default false,
  upvote_count    integer not null default 0,
  sort_order      integer not null default 0,
  status          content_status not null default 'active',
  seo_title       text,
  seo_description text,
  created_at      timestamptz not null default now()
);

create index idx_ai_tools_status   on public.ai_tools (status);
create index idx_ai_tools_featured on public.ai_tools (is_featured);
create index idx_ai_tools_sort     on public.ai_tools (sort_order, upvote_count desc);

-- ============================================================
-- ARTICLES
-- ============================================================
create table public.articles (
  id              serial primary key,
  slug            text not null unique,
  title           text not null,
  excerpt         text,
  content         text,
  cover_image_url text,
  author          text not null default 'Editorial',
  read_time_min   integer not null default 5,
  tags            text[],
  is_published    boolean not null default false,
  published_at    timestamptz,
  seo_title       text,
  seo_description text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_articles_published    on public.articles (is_published, published_at desc);
create index idx_articles_slug         on public.articles (slug);

-- ============================================================
-- TOP LISTS
-- ============================================================
create table public.top_lists (
  id              serial primary key,
  slug            text not null unique,
  title           text not null,
  description     text,
  category_slug   text references public.categories (slug) on delete set null,
  seo_title       text,
  seo_description text
);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_groups_updated_at
  before update on public.groups
  for each row execute function public.set_updated_at();

create trigger trg_bots_updated_at
  before update on public.bots
  for each row execute function public.set_updated_at();

create trigger trg_articles_updated_at
  before update on public.articles
  for each row execute function public.set_updated_at();

-- ============================================================
-- RPC: increment_group_click (chamado pelo /api/join/[slug])
-- ============================================================
create or replace function public.increment_group_click(group_slug text)
returns void language plpgsql security definer as $$
begin
  update public.groups
  set click_count = click_count + 1
  where slug = group_slug;
end;
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.categories enable row level security;
alter table public.groups     enable row level security;
alter table public.bots       enable row level security;
alter table public.ai_tools   enable row level security;
alter table public.articles   enable row level security;
alter table public.top_lists  enable row level security;

-- Public read (anon key pode ler linhas visíveis)
create policy "public_read_categories" on public.categories
  for select using (true);

create policy "public_read_groups" on public.groups
  for select using (
    hidden = false
    and status = 'active'
    and indexing_status in ('published', 'submitted', 'indexed')
  );

create policy "public_read_bots" on public.bots
  for select using (
    status = 'active'
    and indexing_status in ('published', 'submitted', 'indexed')
  );

create policy "public_read_ai_tools" on public.ai_tools
  for select using (status = 'active');

create policy "public_read_articles" on public.articles
  for select using (is_published = true);

create policy "public_read_top_lists" on public.top_lists
  for select using (true);

-- Service role bypassa RLS automaticamente (scripts Python usam service_role_key)

-- ============================================================
-- SEED: categorias iniciais
-- ============================================================
insert into public.categories (slug, name, type, sort_order, is_trending) values
  ('amateur',   'Amateur',   'genre',   1,  true),
  ('milf',      'MILF',      'genre',   2,  true),
  ('lesbian',   'Lesbian',   'genre',   3,  true),
  ('threesome', 'Threesome', 'genre',   4,  false),
  ('anal',      'Anal',      'genre',   5,  false),
  ('onlyfans',  'OnlyFans',  'genre',   6,  true),
  ('bdsm',      'BDSM',      'genre',   7,  false),
  ('cosplay',   'Cosplay',   'genre',   8,  false),
  ('fetish',    'Fetish',    'genre',   9,  false),
  ('anime',     'Anime',     'genre',   10, false),
  ('asian',     'Asian',     'genre',   11, true),
  ('latina',    'Latina',    'genre',   12, true),
  ('brazil',    'Brazil',    'country', 20, false),
  ('usa',       'USA',       'country', 21, false),
  ('europe',    'Europe',    'country', 22, false)
on conflict (slug) do nothing;
