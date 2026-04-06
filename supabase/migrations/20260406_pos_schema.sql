-- BauPOS stage-1 production-oriented schema
create extension if not exists pgcrypto;

create table if not exists branches (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  timezone text not null default 'UTC',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists permissions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text
);

create table if not exists role_permissions (
  role_id uuid references roles(id) on delete cascade,
  permission_id uuid references permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

create table if not exists employees (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  branch_id uuid references branches(id),
  full_name text not null,
  email text,
  phone text,
  is_active boolean not null default true,
  hired_at date,
  created_at timestamptz not null default now()
);

create table if not exists employee_roles (
  employee_id uuid references employees(id) on delete cascade,
  role_id uuid references roles(id) on delete cascade,
  primary key (employee_id, role_id)
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid references branches(id),
  name text not null,
  sort_order int not null default 0,
  is_active boolean not null default true
);

create table if not exists menu_items (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid references branches(id),
  category_id uuid references categories(id),
  sku text,
  name text not null,
  description text,
  image_url text,
  price_cents bigint not null,
  tax_rate numeric(5,2) not null default 8,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists menu_item_modifiers (
  id uuid primary key default gen_random_uuid(),
  menu_item_id uuid references menu_items(id) on delete cascade,
  name text not null,
  min_select int default 0,
  max_select int default 1,
  is_required boolean default false
);

create table if not exists menu_item_modifier_options (
  id uuid primary key default gen_random_uuid(),
  modifier_id uuid references menu_item_modifiers(id) on delete cascade,
  name text not null,
  price_delta_cents bigint not null default 0,
  is_active boolean not null default true
);

create table if not exists branch_item_prices (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid references branches(id),
  menu_item_id uuid references menu_items(id),
  price_cents bigint not null,
  is_available boolean not null default true,
  unique (branch_id, menu_item_id)
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid references branches(id),
  cashier_id uuid references employees(id),
  order_number text not null,
  order_type text not null check (order_type in ('DINE_IN','TAKEAWAY','DELIVERY')),
  status text not null default 'OPEN',
  subtotal_cents bigint not null default 0,
  tax_cents bigint not null default 0,
  discount_cents bigint not null default 0,
  total_cents bigint not null default 0,
  external_order_id text,
  external_source text,
  order_sync_status text,
  cancelled_reason text,
  suspended_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  menu_item_id uuid references menu_items(id),
  item_name_snapshot text not null,
  unit_price_cents bigint not null,
  quantity int not null,
  note text,
  line_subtotal_cents bigint not null,
  created_at timestamptz not null default now()
);

create table if not exists order_item_modifiers (
  id uuid primary key default gen_random_uuid(),
  order_item_id uuid references order_items(id) on delete cascade,
  modifier_name_snapshot text not null,
  option_name_snapshot text not null,
  price_delta_cents bigint not null default 0
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  method text not null check (method in ('cash','card','mixed','other')),
  amount_cents bigint not null,
  money_received_cents bigint,
  change_returned_cents bigint,
  processor_reference text,
  created_at timestamptz not null default now()
);

create table if not exists refunds (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id),
  approved_by uuid references employees(id),
  amount_cents bigint not null,
  reason text not null,
  created_at timestamptz not null default now()
);

create table if not exists discounts (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  discount_type text not null,
  value_cents bigint not null,
  reason text
);

create table if not exists suppliers (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid references branches(id),
  name text not null,
  contact_name text,
  phone text,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists inventory_items (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid references branches(id),
  supplier_id uuid references suppliers(id),
  sku text,
  name text not null,
  unit text not null,
  quantity numeric(12,3) not null default 0,
  low_stock_threshold numeric(12,3) not null default 0,
  average_cost_cents bigint default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists inventory_transactions (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid references branches(id),
  inventory_item_id uuid references inventory_items(id),
  transaction_type text not null check (transaction_type in ('stock_in','stock_out','adjustment','waste','sale_deduction')),
  quantity_delta numeric(12,3) not null,
  reference_type text,
  reference_id uuid,
  reason text,
  performed_by uuid references employees(id),
  created_at timestamptz not null default now()
);

create table if not exists recipe_items (
  id uuid primary key default gen_random_uuid(),
  menu_item_id uuid references menu_items(id) on delete cascade,
  inventory_item_id uuid references inventory_items(id),
  qty_required numeric(12,3) not null,
  unit text not null
);

create table if not exists purchase_entries (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid references branches(id),
  supplier_id uuid references suppliers(id),
  inventory_item_id uuid references inventory_items(id),
  quantity numeric(12,3) not null,
  unit_cost_cents bigint not null,
  total_cost_cents bigint not null,
  invoice_ref text,
  purchased_at timestamptz not null default now(),
  created_by uuid references employees(id)
);

create table if not exists employee_time_logs (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid references branches(id),
  employee_id uuid references employees(id),
  clock_in_at timestamptz,
  clock_out_at timestamptz,
  source text default 'pos',
  notes text,
  edited_by uuid references employees(id),
  created_at timestamptz not null default now()
);

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid references branches(id),
  category text not null,
  amount_cents bigint not null,
  description text,
  expense_date date not null,
  created_by uuid references employees(id),
  created_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid references branches(id),
  actor_employee_id uuid references employees(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  before_data jsonb,
  after_data jsonb,
  ip_address text,
  created_at timestamptz not null default now()
);

create table if not exists app_settings (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid references branches(id),
  key text not null,
  value jsonb not null,
  updated_by uuid references employees(id),
  updated_at timestamptz not null default now(),
  unique(branch_id, key)
);

create table if not exists daily_summaries (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid references branches(id),
  summary_date date not null,
  gross_sales_cents bigint not null default 0,
  net_sales_cents bigint not null default 0,
  cash_sales_cents bigint not null default 0,
  card_sales_cents bigint not null default 0,
  refunds_cents bigint not null default 0,
  discounts_cents bigint not null default 0,
  generated_at timestamptz not null default now(),
  unique(branch_id, summary_date)
);

-- Future-ready placeholders
create table if not exists delivery_integrations (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid references branches(id),
  provider text not null,
  is_enabled boolean not null default false,
  config jsonb,
  created_at timestamptz not null default now()
);

create table if not exists external_delivery_orders (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid references branches(id),
  provider text not null,
  external_order_id text not null,
  order_id uuid references orders(id),
  sync_status text,
  raw_payload jsonb,
  created_at timestamptz not null default now()
);

create table if not exists webhook_logs (
  id uuid primary key default gen_random_uuid(),
  integration_id uuid references delivery_integrations(id),
  event_name text,
  payload jsonb,
  processed boolean default false,
  created_at timestamptz not null default now()
);

create table if not exists ai_query_logs (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid references branches(id),
  employee_id uuid references employees(id),
  query_text text not null,
  query_type text,
  response_meta jsonb,
  created_at timestamptz not null default now()
);

create table if not exists stock_forecasts (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid references branches(id),
  inventory_item_id uuid references inventory_items(id),
  forecast_date date not null,
  projected_usage numeric(12,3),
  confidence numeric(5,2),
  model_version text,
  created_at timestamptz not null default now()
);

create table if not exists notification_logs (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid references branches(id),
  channel text,
  event_type text,
  payload jsonb,
  delivered_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists mobile_device_sessions (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references employees(id),
  device_name text,
  device_os text,
  push_token text,
  last_seen_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists accountant_exports (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid references branches(id),
  export_type text,
  date_from date,
  date_to date,
  file_url text,
  status text,
  created_by uuid references employees(id),
  created_at timestamptz not null default now()
);
