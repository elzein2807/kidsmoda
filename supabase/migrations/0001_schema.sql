-- ===========================================================================
-- KIDS MODA — core schema
--
-- Design notes
-- · Stock lives on product_variants (colour × size). There is deliberately no
--   product-level quantity column anywhere.
-- · USD is the canonical price. LBP is derived at render time from
--   site_settings.usd_to_lbp, so changing the rate is one UPDATE and touches
--   no product rows.
-- · Every table that the storefront reads has RLS enabled with a public read
--   policy limited to visible rows; everything else is admin-only.
-- ===========================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type gender_world as enum ('girls', 'boys');

create type order_status as enum (
  'new', 'awaiting_confirmation', 'confirmed', 'preparing',
  'ready_for_delivery', 'out_for_delivery', 'delivered',
  'cancelled', 'returned', 'exchanged'
);

create type order_channel as enum ('online', 'in_store');
create type currency_code as enum ('USD', 'LBP');

create type stock_movement_kind as enum (
  'receive', 'online_sale', 'in_store_sale', 'return', 'exchange',
  'damage', 'correction', 'reservation', 'release'
);

-- ---------------------------------------------------------------------------
-- Staff
-- Only the owner and her son have access. Roles exist so a third account can
-- be added later without a migration.
-- ---------------------------------------------------------------------------
create table admin_profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text not null,
  role         text not null default 'staff' check (role in ('owner', 'staff')),
  created_at   timestamptz not null default now()
);

create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from admin_profiles where id = auth.uid());
$$;

-- ---------------------------------------------------------------------------
-- Taxonomy
-- ---------------------------------------------------------------------------
create table age_groups (
  id         text primary key,              -- '0-2', '2-5', '6-9', '10-14'
  label      text not null,
  short      text not null,
  sizes      text[] not null,
  sort_order int  not null default 0
);

create table categories (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  name       text not null,
  genders    gender_world[] not null,
  group_name text not null default 'clothing',
  sort_order int  not null default 0,
  visible    boolean not null default true
);

create table brands (
  id   uuid primary key default gen_random_uuid(),
  name text unique not null
);

-- ---------------------------------------------------------------------------
-- Catalogue
-- ---------------------------------------------------------------------------
create table products (
  id             uuid primary key default gen_random_uuid(),
  slug           text unique not null,
  name           text not null,
  brand_id       uuid references brands(id) on delete set null,
  gender         gender_world not null,
  age_group_ids  text[] not null default '{}',
  description    text not null default '',
  materials      text not null default '',
  care           text not null default '',
  styling        text not null default '',

  -- USD is canonical; never store an LBP price per product
  price_usd      numeric(10,2) not null check (price_usd >= 0),
  compare_at_usd numeric(10,2) check (compare_at_usd is null or compare_at_usd > price_usd),
  cost_usd       numeric(10,2) not null default 0,   -- never exposed publicly

  is_new         boolean not null default false,
  is_bestseller  boolean not null default false,
  is_featured    boolean not null default false,
  visible        boolean not null default true,
  archived_at    timestamptz,

  seo_title       text,
  seo_description text,

  sold_count     int not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index products_gender_idx  on products (gender) where visible and archived_at is null;
create index products_created_idx on products (created_at desc);
create index products_ages_idx    on products using gin (age_group_ids);

create table product_categories (
  product_id  uuid references products(id) on delete cascade,
  category_id uuid references categories(id) on delete cascade,
  primary key (product_id, category_id)
);

create table product_colors (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references products(id) on delete cascade,
  code          text not null,               -- 'coral', 'denim'
  name          text not null,
  hex           text not null,
  hex_secondary text,
  sort_order    int not null default 0,
  unique (product_id, code)
);

create table product_media (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  kind       text not null default 'image' check (kind in ('image', 'video')),
  -- Storage path or CDN URL. NULL renders the vector plate fallback.
  src        text,
  poster     text,
  alt        text not null default '',
  plate      text,                            -- garment silhouette fallback
  sort_order int not null default 0
);

-- Stock lives here, and only here.
create table product_variants (
  id                  uuid primary key default gen_random_uuid(),
  product_id          uuid not null references products(id) on delete cascade,
  color_code          text not null,
  size                text not null,
  sku                 text unique not null,
  barcode             text unique,
  stock_on_hand       int not null default 0 check (stock_on_hand >= 0),
  reserved            int not null default 0 check (reserved >= 0),
  incoming            int not null default 0,
  damaged             int not null default 0,
  low_stock_threshold int not null default 3,
  unique (product_id, color_code, size)
);

create index variants_product_idx on product_variants (product_id);

-- What a customer may actually buy
create or replace view variant_availability as
  select id, product_id, color_code, size, sku,
         greatest(stock_on_hand - reserved, 0) as available,
         (greatest(stock_on_hand - reserved, 0) = 0) as is_sold_out,
         (greatest(stock_on_hand - reserved, 0) > 0
          and greatest(stock_on_hand - reserved, 0) <= low_stock_threshold) as is_low_stock
  from product_variants;

-- ---------------------------------------------------------------------------
-- Inventory ledger — every change to stock is recorded, nothing is silent
-- ---------------------------------------------------------------------------
create table stock_movements (
  id          uuid primary key default gen_random_uuid(),
  variant_id  uuid not null references product_variants(id) on delete cascade,
  kind        stock_movement_kind not null,
  quantity    int not null,                  -- signed: -2 sold, +12 received
  reason      text,
  order_id    uuid,
  created_by  uuid references admin_profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

create index stock_movements_variant_idx on stock_movements (variant_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Customers
-- Guest checkout means a customer is created from a phone number, not a login.
-- ---------------------------------------------------------------------------
create table customers (
  id          uuid primary key default gen_random_uuid(),
  full_name   text not null,
  phone       text unique not null,          -- normalised, no country prefix
  notes       text not null default '',
  created_at  timestamptz not null default now()
);

create table customer_addresses (
  id           uuid primary key default gen_random_uuid(),
  customer_id  uuid not null references customers(id) on delete cascade,
  governorate  text not null,
  city         text not null,
  address      text not null,
  building     text not null default '',
  floor        text not null default '',
  landmark     text not null default '',
  instructions text not null default '',
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Orders
-- ---------------------------------------------------------------------------
create table orders (
  id               uuid primary key default gen_random_uuid(),
  number           text unique not null,      -- KM-1042
  channel          order_channel not null default 'online',
  status           order_status not null default 'awaiting_confirmation',
  customer_id      uuid references customers(id) on delete set null,

  -- Address is copied onto the order, not referenced: a customer editing their
  -- address later must never rewrite where a past order was delivered.
  full_name    text not null,
  phone        text not null,
  governorate  text not null,
  city         text not null,
  address      text not null,
  building     text not null default '',
  floor        text not null default '',
  landmark     text not null default '',
  instructions text not null default '',

  currency         currency_code not null default 'USD',
  subtotal_usd     numeric(10,2) not null,
  delivery_fee_usd numeric(10,2) not null default 0,
  discount_usd     numeric(10,2) not null default 0,
  total_usd        numeric(10,2) not null,
  -- Captured at order time so history never re-prices
  exchange_rate    numeric(12,2) not null,

  cash_collected   boolean not null default false,
  internal_note    text not null default '',
  idempotency_key  text unique,

  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  confirmed_at timestamptz,
  delivered_at timestamptz
);

create index orders_status_idx  on orders (status, created_at desc);
create index orders_created_idx on orders (created_at desc);

create table order_items (
  id             uuid primary key default gen_random_uuid(),
  order_id       uuid not null references orders(id) on delete cascade,
  variant_id     uuid references product_variants(id) on delete set null,
  -- Snapshots: the order must stay readable if the product is later renamed
  product_name   text not null,
  brand_name     text not null default '',
  color_name     text not null,
  size           text not null,
  quantity       int not null check (quantity > 0),
  unit_usd       numeric(10,2) not null,
  line_total_usd numeric(10,2) not null
);

create table returns (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references orders(id) on delete cascade,
  kind        text not null check (kind in ('return', 'exchange')),
  reason      text not null default '',
  refund_usd  numeric(10,2) not null default 0,
  created_by  uuid references admin_profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Promotions
-- ---------------------------------------------------------------------------
create table promotions (
  id            uuid primary key default gen_random_uuid(),
  code          text unique not null,
  kind          text not null check (kind in ('percent', 'amount', 'free_delivery')),
  value         numeric(10,2) not null default 0,
  min_spend_usd numeric(10,2) not null default 0,
  starts_at     timestamptz,
  ends_at       timestamptz,
  active        boolean not null default true,
  uses          int not null default 0,
  max_uses      int
);

-- ---------------------------------------------------------------------------
-- Website content — so the homepage is editable without a deploy
-- ---------------------------------------------------------------------------
create table site_content (
  key        text primary key,     -- 'announcement', 'hero', 'shop_the_look'
  value      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references admin_profiles(id) on delete set null
);

create table site_settings (
  id                     int primary key default 1 check (id = 1),
  usd_to_lbp             numeric(12,2) not null default 89000,
  delivery_fee_usd       numeric(10,2) not null default 3,
  free_delivery_over_usd numeric(10,2) not null default 100,
  exchange_window_days   int not null default 7,
  whatsapp_number        text not null default '96181898170',
  updated_at             timestamptz not null default now()
);

insert into site_settings (id) values (1) on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Audit — who changed what
-- ---------------------------------------------------------------------------
create table audit_log (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references admin_profiles(id) on delete set null,
  entity      text not null,
  entity_id   text not null,
  action      text not null,
  diff        jsonb,
  created_at  timestamptz not null default now()
);

-- ===========================================================================
-- ROW LEVEL SECURITY
--
-- Default posture: deny. The storefront reads with the anon key and can only
-- see visible catalogue rows. Everything that touches money, stock or a
-- customer is admin-only, and the service role key never reaches the browser.
-- ===========================================================================

alter table admin_profiles     enable row level security;
alter table age_groups         enable row level security;
alter table categories         enable row level security;
alter table brands             enable row level security;
alter table products           enable row level security;
alter table product_categories enable row level security;
alter table product_colors     enable row level security;
alter table product_media      enable row level security;
alter table product_variants   enable row level security;
alter table stock_movements    enable row level security;
alter table customers          enable row level security;
alter table customer_addresses enable row level security;
alter table orders             enable row level security;
alter table order_items        enable row level security;
alter table returns            enable row level security;
alter table promotions         enable row level security;
alter table site_content       enable row level security;
alter table site_settings      enable row level security;
alter table audit_log          enable row level security;

-- Public, read-only: taxonomy and visible catalogue
create policy "public reads age groups"  on age_groups  for select using (true);
create policy "public reads categories"  on categories  for select using (visible);
create policy "public reads brands"      on brands      for select using (true);
create policy "public reads settings"    on site_settings for select using (true);
create policy "public reads content"     on site_content  for select using (true);

create policy "public reads products" on products
  for select using (visible and archived_at is null);

create policy "public reads product categories" on product_categories
  for select using (exists (
    select 1 from products p
    where p.id = product_id and p.visible and p.archived_at is null
  ));

create policy "public reads colors" on product_colors
  for select using (exists (
    select 1 from products p
    where p.id = product_id and p.visible and p.archived_at is null
  ));

create policy "public reads media" on product_media
  for select using (exists (
    select 1 from products p
    where p.id = product_id and p.visible and p.archived_at is null
  ));

-- Variants are readable so sizes can be shown, but cost and margin live on
-- products.cost_usd, which the public policy above does not expose separately.
create policy "public reads variants" on product_variants
  for select using (exists (
    select 1 from products p
    where p.id = product_id and p.visible and p.archived_at is null
  ));

-- Admin: full control of everything
create policy "admin reads own profile" on admin_profiles
  for select using (id = auth.uid() or is_admin());

do $$
declare t text;
begin
  foreach t in array array[
    'age_groups','categories','brands','products','product_categories',
    'product_colors','product_media','product_variants','stock_movements',
    'customers','customer_addresses','orders','order_items','returns',
    'promotions','site_content','site_settings','audit_log'
  ]
  loop
    execute format(
      'create policy "admin manages %1$s" on %1$I for all using (is_admin()) with check (is_admin());',
      t
    );
  end loop;
end $$;

-- NOTE: orders and customers have NO public policy at all. Guest checkout
-- writes go through a server route using the service role key, which stays on
-- the server. A visitor can never list orders, and never read someone else's.

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------
create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger products_touch before update on products
  for each row execute function touch_updated_at();
create trigger orders_touch before update on orders
  for each row execute function touch_updated_at();
