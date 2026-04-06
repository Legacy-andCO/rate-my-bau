# BauPOS - Production-Oriented Restaurant POS Platform

BauPOS is a **Windows-first restaurant operations platform** built with Next.js + Supabase and structured for commercial evolution (multi-branch, delivery integrations, mobile manager app, AI analytics assistant).

> This repository delivers a **Stage 1 production-ready foundation** with clean architecture boundaries and a modern POS UI/UX, not a throwaway student demo.

## Stack

- Front end: Next.js 16 (App Router), React 19
- Data/Auth: Supabase (PostgreSQL + Auth)
- Styling: custom modern design system in `app/globals.css`
- Money logic: integer cents-based helpers (no float arithmetic for totals/change)

## Architecture (Extensible by Design)

### Layers

- **UI Layer**: `src/modules/pos/components/`
- **Business Logic / Service Layer**: `src/modules/pos/services/`
- **Auth & Permissions Layer**: `src/modules/auth/`
- **Data Source / Mock Seed Layer**: `src/data/mock/`
- **Platform Helpers**: `src/lib/` and `lib/supabase.js`

This separation prevents business logic from being hardcoded into UI and allows migration toward a custom API gateway later without rewriting core UI flows.

### Current Screens (Connected)

1. Cashier POS
2. Manager Dashboard
3. Inventory
4. Menu Management
5. Employee Attendance
6. Reports
7. Settings

## Critical Cash Workflow (Implemented)

Cash payment panel includes:
- Amount Due
- Money Received
- Change to Return
- Validation to block completion when money received < amount due
- Quick cash shortcut buttons

Formula:
`Change = Money Received - Amount Due`

Implemented in: `src/modules/pos/services/orderService.js` and used in cashier UI.

## Supabase Schema / Migrations

- Main schema: `supabase/migrations/20260406_pos_schema.sql`
- Seed starter data: `supabase/seed/seed.sql`

Schema includes core operational tables and future-ready placeholders for:
- Delivery integrations (Yemeksepeti / Trendyol Go style ingestion)
- AI query logs
- Mobile manager sessions
- Forecasting
- Accountant export records
- Branch-specific pricing

## Setup

1. Install deps:
   ```bash
   npm install
   ```
2. Copy env template:
   ```bash
   cp .env.example .env.local
   ```
3. Fill Supabase variables in `.env.local`.
4. Run database migration SQL and seed SQL in your Supabase SQL editor.
5. Start app:
   ```bash
   npm run dev
   ```

## Build / Production

```bash
npm run build
npm run start
```

For Windows deployment, package this front-end into a desktop shell (e.g. Electron/Tauri) while keeping services and schema unchanged.

## Future Integration Hooks

### Delivery platforms
- `orders.external_order_id`
- `orders.external_source`
- `orders.order_sync_status`
- `delivery_integrations`
- `external_delivery_orders`
- `webhook_logs`

### AI assistant
Service helper surface (already created):
- `getSalesToday`
- `getTopSellingItems`
- `getLeastSellingItems`
- `getHourlySales`
- `getInventoryAlerts`
- `getWeeklySalesComparison`

### Mobile manager app
- Reporting and summaries are exposed through reusable services now.
- `mobile_device_sessions` and `notification_logs` tables are prepared.

### Accounting automation
- `daily_summaries`, `expenses`, `purchase_entries`, `accountant_exports` are in schema.

## Notes

- Replace mock seed data in `src/data/mock/seedData.js` with repository + Supabase queries incrementally.
- Add RLS policies per role as next hardening step.
- Add receipt printer service adapter in a dedicated infra module (already isolated by architecture direction).
