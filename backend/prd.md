# VENDORA — Backend PRD
### FastAPI + Supabase | v1.0

---

## TABLE OF CONTENTS

1. Backend Identity & Philosophy
2. Tech Stack & Dependencies
3. Application Architecture & Folder Structure
4. Frontend ↔ Backend Connection Map
5. Database Schema (Supabase PostgreSQL)
6. API Routes — Complete Specification
7. Service Layer — Business Logic
8. Utility Modules
9. PDF & Email Templates
10. Environment Configuration
11. Supabase Realtime Strategy
12. Row Level Security (RLS) Policies
13. Seeding & Demo Data

---

## 1. BACKEND IDENTITY & PHILOSOPHY

**Backend Name:** VENDORA API
**Framework:** FastAPI (Python 3.11+)
**Database:** Supabase (PostgreSQL + Realtime + Storage + Auth)
**Deployment Target:** Antigravity

### Core Principles

Every route in this backend exists because a specific component in the frontend PRD needs it. Nothing is built speculatively. Every service function maps to a user action described in sections 5.1–5.15 of the frontend PRD.

**Three layers of logic:**
- **Routers** receive HTTP requests, validate input, call services, return responses
- **Services** contain all business logic — calculations, orchestration, side effects
- **Supabase client** handles all database reads/writes and storage

**What FastAPI owns:**
- Business logic (composite scores, tax calculations, health scores, savings)
- PDF generation (PO, Invoice, Thread Export)
- Email sending (RFQ invitations, invoice delivery)
- Sequential number generation (RFQ-2025-XXXX, PO-2025-XXXX, INV-2025-XXX)
- Activity logging and notification creation
- All automated trigger chains (approve → create PO → lock thread → notify)

**What Supabase owns:**
- Data persistence
- Auth (JWT tokens)
- Realtime subscriptions (frontend subscribes directly)
- File storage (PDFs, attachments)

---

## 2. TECH STACK & DEPENDENCIES

### requirements.txt
```
fastapi==0.111.0
uvicorn[standard]==0.29.0
supabase==2.4.0
python-jose[cryptography]==3.3.0
python-multipart==0.0.9
pydantic==2.7.0
pydantic-settings==2.2.1
pydantic[email]==2.7.0
weasyprint==61.2
jinja2==3.1.4
resend==0.8.0
python-dotenv==1.0.1
httpx==0.27.0
date-fns-py==0.1.0
pillow==10.3.0
```

### Python Version
```
python >= 3.11
```

---

## 3. APPLICATION ARCHITECTURE & FOLDER STRUCTURE

### Complete Backend Folder Structure
```
vendora-backend/
│
├── main.py
├── .env
├── .env.example
├── requirements.txt
├── README.md
│
├── app/
│   │
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── security.py
│   │   ├── dependencies.py
│   │   └── exceptions.py
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── vendor.py
│   │   ├── rfq.py
│   │   ├── quotation.py
│   │   ├── approval.py
│   │   ├── purchase_order.py
│   │   ├── invoice.py
│   │   ├── negotiation.py
│   │   ├── analytics.py
│   │   └── notification.py
│   │
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── vendors.py
│   │   ├── rfqs.py
│   │   ├── quotations.py
│   │   ├── approvals.py
│   │   ├── purchase_orders.py
│   │   ├── invoices.py
│   │   ├── negotiations.py
│   │   ├── analytics.py
│   │   ├── notifications.py
│   │   └── utility.py
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── vendor_service.py
│   │   ├── rfq_service.py
│   │   ├── quotation_service.py
│   │   ├── approval_service.py
│   │   ├── po_service.py
│   │   ├── invoice_service.py
│   │   ├── negotiation_service.py
│   │   ├── analytics_service.py
│   │   ├── notification_service.py
│   │   └── activity_log_service.py
│   │
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── pdf_generator.py
│   │   ├── email_sender.py
│   │   ├── number_generator.py
│   │   ├── tax_calculator.py
│   │   ├── savings_calculator.py
│   │   └── storage.py
│   │
│   └── templates/
│       ├── pdf/
│       │   ├── purchase_order.html
│       │   ├── invoice.html
│       │   └── negotiation_export.html
│       └── email/
│           ├── rfq_invitation.html
│           ├── invoice_email.html
│           └── approval_notification.html
│
└── tests/
    ├── __init__.py
    ├── test_auth.py
    ├── test_rfq.py
    ├── test_quotation.py
    ├── test_approval.py
    ├── test_invoice.py
    └── test_analytics.py
```

### Frontend ↔ Backend Folder Connection
```
vendora/
├── vendora-frontend/          ← React + Vite + TS (Kiro)
│   └── src/
│       ├── lib/
│       │   ├── supabase.ts    ← Direct Supabase (realtime only)
│       │   └── api.ts         ← ALL calls to FastAPI base URL
│       ├── hooks/
│       │   ├── useAuth.ts     → POST /api/auth/login
│       │   ├── useRealtime.ts → Supabase direct subscriptions
│       │   └── useSavings.ts  → GET /api/analytics/savings
│       └── pages/ ...
│
└── vendora-backend/           ← FastAPI (Antigravity)
    └── app/ ...
```

### `src/lib/api.ts` (frontend) — Base Configuration
```typescript
// This file in the frontend connects every page to FastAPI
const API_BASE = import.meta.env.VITE_API_URL  // http://localhost:8000

export const api = {
  get: (path: string) => fetch(`${API_BASE}${path}`, { headers: authHeaders() }),
  post: (path: string, body: any) => fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }),
  // put, patch, delete same pattern
}
```

---

## 4. FRONTEND ↔ BACKEND CONNECTION MAP

Every frontend page mapped to exact backend routes it calls.

### 5.1 Login Page (`src/pages/Login.tsx`)
```
POST /api/auth/login
  → body: { email, password }
  → returns: { token, user: { id, name, role, company } }
  → frontend stores token, routes to /{role}/dashboard
```

### 5.2 Officer Dashboard (`src/pages/officer/Dashboard.tsx`)
```
GET  /api/analytics/officer-kpis
  → returns: { pending_approvals, active_rfqs, pos_this_month,
               invoices_pending, savings_this_month, trends }
  → feeds: KPI strip (5 tiles)

GET  /api/rfqs?status=sent,quotes_in,comparing,approval,po_issued,invoiced
  → returns: RFQ list with stage
  → feeds: Procurement Pipeline kanban

GET  /api/activity-logs?limit=20
  → returns: recent activity events
  → feeds: Live Activity Feed (right panel)

GET  /api/analytics/savings?period=month
  → returns: { total, last_po_savings, trend }
  → feeds: Savings Widget (right panel, compact)

── Supabase Realtime (direct, no FastAPI) ──
SUBSCRIBE activity_logs         → new rows → Live Feed updates
SUBSCRIBE notifications         → user's new notifications → toast fires
```

### 5.3 RFQ Creation (`src/pages/officer/RFQCreate.tsx`)
```
GET  /api/vendors?status=active
  → returns: vendor list with rating, avg_response_hours, category
  → feeds: Vendor Selection grid

POST /api/rfqs
  → body: { title, category, priority, deadline, items[], vendor_ids[] }
  → returns: { rfq_id, rfq_number }
  → triggers: email to each vendor, activity log, notifications

POST /api/rfqs/{rfq_id}/attachments
  → multipart/form-data: file
  → returns: { file_url, file_name }
  → feeds: attachment pills on form

POST /api/rfqs/{rfq_id}/send
  → triggers full send flow
  → returns: { rfq_number, vendor_count, deadline }
  → feeds: Success screen ("RFQ #2853 SENT TO 3 VENDORS")
```

### 5.4 Quotation Comparison (`src/pages/officer/QuotationComparison.tsx`)
```
GET  /api/rfqs/{rfq_id}/compare
  → returns: comparison object with all vendor quotes,
             pre-calculated composite scores (default weights),
             best tags per row
  → feeds: Bloomberg-style comparison table

POST /api/rfqs/{rfq_id}/compare
  → body: { price_weight, delivery_weight, rating_weight }
  → returns: recalculated composite scores + new recommended vendor
  → feeds: Decision Engine slider recalculation

GET  /api/quotations/{quotation_id}
  → returns: full quotation detail
  → feeds: "VIEW FULL QUOTE" slide-over

POST /api/quotations/{quotation_id}/select
  → triggers: approval record creation, manager notification
  → returns: { approval_id }
  → frontend routes to approval pending state
```

### 5.5 Purchase Order (`src/pages/officer/PurchaseOrder.tsx`)
```
POST /api/purchase-orders
  → body: { approval_id, delivery_address, special_instructions,
             expected_delivery_date }
  → returns: { po_id, po_number }
  → feeds: PO Number display (non-editable, amber)

GET  /api/purchase-orders/{po_id}
  → returns: full PO with vendor, items, GST breakdown, totals
  → feeds: Live PO Document (right panel)

GET  /api/saved-addresses
  → returns: list of saved delivery addresses
  → feeds: address dropdown

POST /api/purchase-orders/{po_id}/pdf
  → triggers: WeasyPrint PDF generation, Supabase Storage upload
  → returns: { pdf_url }
  → frontend: window.open(pdf_url) for download/print

PATCH /api/purchase-orders/{po_id}/status
  → body: { status: 'sent' | 'acknowledged' | 'fulfilled' }
  → updates status tracker display
```

### 5.6 Invoice Generation (`src/pages/officer/Invoice.tsx`)
```
POST /api/invoices
  → body: { po_id, tax_type, freight_charges, handling_charges, notes }
  → returns: { invoice_id, invoice_number, invoice_date,
               payment_due_date, subtotal, tax_amount, total }
  → feeds: Live Invoice Document (right panel)

GET  /api/invoices/{invoice_id}
  → returns: full invoice with GST breakdown
  → feeds: document preview

POST /api/invoices/{invoice_id}/pdf
  → triggers: WeasyPrint GST-compliant PDF, Supabase Storage upload
  → returns: { pdf_url }
  → frontend: download / print

POST /api/invoices/{invoice_id}/email
  → body: { to, cc, subject, body_note }
  → triggers: PDF attachment, email send via Resend
  → returns: { sent_at }
  → feeds: "INVOICE SENT SUCCESSFULLY" toast
```

### 5.7 Vendor Dashboard (`src/pages/vendor/Dashboard.tsx`)
```
GET  /api/rfqs?vendor_id=me&invited=true
  → returns: RFQ cards with status, deadline, countdown
  → feeds: Open Invitations left column

GET  /api/quotations?vendor_id=me
  → returns: quote history with WON/LOST/PENDING outcomes
  → feeds: My Quote History timeline

GET  /api/threads?vendor_id=me
  → returns: thread list with unread counts, last message preview
  → feeds: Negotiation Threads (bottom half, right column)

GET  /api/vendors/me
  → returns: { trust_score, company_name, ... }
  → feeds: Header trust score display

── Supabase Realtime ──
SUBSCRIBE rfq_vendors (vendor_id = me) → status updates → card border changes
SUBSCRIBE notifications (user_id = me) → new toasts
```

### 5.8 Quote Submission (`src/pages/vendor/QuoteSubmit.tsx`)
```
GET  /api/rfqs/{rfq_id}
  → returns: full RFQ with items, specs, deadline
  → feeds: RFQ Brief (read-only top section)

POST /api/rfqs/{rfq_id}/quotations
  → body: { items[], delivery_days, valid_until, gst_rate,
             payment_terms, notes, confidence_level }
  → triggers: subtotal/GST/total calculation, officer notification,
               system message in negotiation thread
  → returns: { quotation_id, total_amount }
  → feeds: Post-Submit Confirmation screen

PUT  /api/quotations/{quotation_id}
  → body: same as POST (revision)
  → triggers: system message "Quote revised to ₹X"
  → returns: updated quotation
```

### 5.9 Negotiation Thread (`src/pages/vendor/NegotiationThread.tsx` + `src/pages/officer/negotiations/`)
```
GET  /api/threads
  → returns: thread list for current user
  → feeds: Left Panel thread list

GET  /api/threads/{thread_id}
  → returns: { thread, messages[], is_locked, participants }
  → feeds: Active Thread right panel, all messages

POST /api/threads/{thread_id}/messages
  → body: { content }
  → triggers: Supabase insert (realtime fires to other party)
  → returns: { message_id, created_at }

PATCH /api/threads/{thread_id}/messages/{msg_id}/read
  → marks as read → updates unread badge

POST /api/threads/{thread_id}/export
  → triggers: WeasyPrint conversation PDF
  → returns: { pdf_url }
  → frontend: download

── Supabase Realtime ──
SUBSCRIBE negotiation_messages (thread_id) → new messages appear instantly
```

### 5.10 Manager Dashboard (`src/pages/manager/Dashboard.tsx`)
```
GET  /api/approvals?status=pending&manager_id=me
  → returns: pending approvals with age (hours pending), value
  → feeds: Approval Queue left panel + urgency banner count

GET  /api/analytics/approval-velocity
  → returns: daily avg approval hours for last 30 days
  → feeds: Chart 1 (Recharts line chart)

GET  /api/analytics/spend-by-category
  → returns: spend per category
  → feeds: Chart 2 (Recharts horizontal bar)

GET  /api/analytics/vendor-concentration
  → returns: % spend per vendor with warning flags
  → feeds: Chart 3 (concentration risk bars)
```

### 5.11 Approval Detail (`src/pages/manager/ApprovalDetail.tsx`)
```
GET  /api/approvals/{approval_id}
  → returns: {
      rfq, selected_quotation, all_quotations (for comparison),
      lowest_quote, price_premium, officer_note,
      approval_chain, vendor_stats
    }
  → feeds: entire Approval Detail card including
           "WHY NOT THE CHEAPEST?" section

GET  /api/threads?rfq_id={rfq_id}
  → returns: thread with messages (read-only for manager)
  → feeds: "VIEW N MESSAGES →" modal

POST /api/approvals/{approval_id}/approve
  → triggers: PO auto-creation, thread lock, officer notification,
               system messages, activity log
  → returns: { po_id, po_number }

POST /api/approvals/{approval_id}/reject
  → body: { remarks }  ← required, validated server-side
  → triggers: officer notification with remarks, rfq status rollback
  → returns: { rejected_at }
```

### 5.12 Admin Dashboard (`src/pages/admin/Dashboard.tsx`)
```
GET  /api/analytics/admin-kpis
  → returns: { total_users, active_vendors, rfqs_this_month,
               total_spend, savings_total }
  → feeds: System Health Strip (count-up numbers)

GET  /api/analytics/health-score
  → returns: {
      overall_score, label,
      rfq_competition_rate, approval_speed,
      delivery_compliance, vendor_responsiveness,
      insight_sentence
    }
  → feeds: Procurement Health Score gauge + sub-score bars

GET  /api/users
  → returns: user list with role, last_login, is_active
  → feeds: User Management table

PATCH /api/users/{user_id}/role
  → body: { role }
  → feeds: EDIT ROLE action

PATCH /api/users/{user_id}/deactivate
  → feeds: DEACTIVATE action

GET  /api/vendors?include_stats=true
  → returns: vendor list with performance ring data
  → feeds: Vendor Registry panel

GET  /api/activity-logs?limit=50
  → returns: full audit log with filters
  → feeds: System Audit Log panel
```

### 5.13 Admin Reports (`src/pages/admin/Reports.tsx`)
```
GET  /api/analytics/savings?period=year&breakdown=monthly
  → returns: { annual_total, monthly_breakdown[], per_po_table[] }
  → feeds: Savings Spotlight + line chart + per-PO table

GET  /api/analytics/spending-heatmap
  → returns: 12×5 matrix { month, category, amount }
  → feeds: Monthly Spending Heatmap

GET  /api/analytics/vendor-performance
  → returns: { top_5[], bottom_5[] } with composite scores
  → feeds: Vendor Performance Leaderboard

GET  /api/analytics/procurement-funnel
  → returns: { stage, count, percentage, drop_off }[]
               + auto_insight string
  → feeds: Procurement Funnel bars + insight sentence

POST /api/analytics/export
  → triggers: generates full analytics PDF report
  → returns: { pdf_url }
  → feeds: "EXPORT ALL REPORTS →" button
```

---

## 5. DATABASE SCHEMA

All tables in Supabase PostgreSQL. Run as SQL migrations in Supabase dashboard.

### Table 1: `profiles` (extends auth.users)
```sql
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  role        TEXT NOT NULL CHECK (role IN ('officer','vendor','manager','admin')),
  company_name TEXT,
  company_gstin TEXT,
  phone       TEXT,
  is_active   BOOLEAN DEFAULT TRUE,
  last_login  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```
**Connected to frontend:** `useAuth.ts`, Login page, Admin user table, all role-based routing

### Table 2: `vendors`
```sql
CREATE TABLE vendors (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID REFERENCES profiles(id),
  company_name        TEXT NOT NULL,
  gstin               TEXT,
  category            TEXT CHECK (category IN (
                        'raw_materials','services','equipment',
                        'consumables','other')),
  contact_name        TEXT,
  contact_email       TEXT,
  contact_phone       TEXT,
  address             TEXT,
  status              TEXT DEFAULT 'pending' CHECK (status IN (
                        'active','pending','blacklisted')),
  rating              FLOAT DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  avg_response_hours  FLOAT DEFAULT 0,
  total_orders        INT DEFAULT 0,
  total_disputes      INT DEFAULT 0,
  trust_score         INT DEFAULT 0 CHECK (trust_score >= 0 AND trust_score <= 100),
  created_at          TIMESTAMPTZ DEFAULT NOW()
);
```
**Connected to frontend:** RFQ vendor selection grid (5.3), Vendor Dashboard header trust score (5.7), Comparison table vendor stats (5.4), Admin vendor registry (5.12)

### Table 3: `rfqs`
```sql
CREATE TABLE rfqs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_number  TEXT UNIQUE NOT NULL,   -- RFQ-2025-0001
  title       TEXT NOT NULL,
  category    TEXT CHECK (category IN (
                'raw_materials','services','equipment','consumables','other')),
  priority    TEXT DEFAULT 'standard' CHECK (priority IN ('standard','urgent')),
  status      TEXT DEFAULT 'draft' CHECK (status IN (
                'draft','sent','quotes_in','comparing',
                'approval','po_issued','completed','cancelled')),
  created_by  UUID REFERENCES profiles(id),
  deadline    TIMESTAMPTZ NOT NULL,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
```
**Connected to frontend:** Pipeline kanban columns (5.2), RFQ creation form (5.3), Vendor invited RFQ cards (5.7), Procurement funnel analytics (5.13)

### Table 4: `rfq_items`
```sql
CREATE TABLE rfq_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id        UUID REFERENCES rfqs(id) ON DELETE CASCADE,
  item_name     TEXT NOT NULL,
  specification TEXT,
  quantity      INT NOT NULL,
  unit          TEXT DEFAULT 'units',
  target_price  FLOAT
);
```
**Connected to frontend:** Line items table in RFQ form (5.3), RFQ Brief in quote submission (5.8), per-item row in comparison table (5.4)

### Table 5: `rfq_attachments`
```sql
CREATE TABLE rfq_attachments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id      UUID REFERENCES rfqs(id) ON DELETE CASCADE,
  file_name   TEXT NOT NULL,
  file_url    TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);
```
**Connected to frontend:** Attachment pills in RFQ form (5.3), document preview (5.3 right panel)

### Table 6: `rfq_vendors`
```sql
CREATE TABLE rfq_vendors (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id      UUID REFERENCES rfqs(id) ON DELETE CASCADE,
  vendor_id   UUID REFERENCES vendors(id),
  status      TEXT DEFAULT 'invited' CHECK (status IN (
                'invited','submitted','declined','won','lost')),
  invited_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(rfq_id, vendor_id)
);
```
**Connected to frontend:** Vendor card border colors on vendor dashboard (5.7) — amber=invited, blue=submitted, green=won, gray=lost. Realtime subscription for live border updates.

### Table 7: `quotations`
```sql
CREATE TABLE quotations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id            UUID REFERENCES rfqs(id),
  vendor_id         UUID REFERENCES vendors(id),
  status            TEXT DEFAULT 'draft' CHECK (status IN (
                      'draft','submitted','under_review',
                      'accepted','rejected')),
  valid_until       DATE,
  gst_rate          FLOAT DEFAULT 18,
  payment_terms     TEXT DEFAULT '30 days NET',
  delivery_days     INT,
  notes             TEXT,
  confidence_level  TEXT CHECK (confidence_level IN (
                      'stretched','fair','comfortable','very_competitive')),
  subtotal          FLOAT DEFAULT 0,
  gst_amount        FLOAT DEFAULT 0,
  total_amount      FLOAT DEFAULT 0,
  submitted_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
```
**Connected to frontend:** Quote submission form (5.8), comparison table all rows (5.4), Approval detail card (5.11), vendor quote history WON/LOST/PENDING (5.7)

### Table 8: `quotation_items`
```sql
CREATE TABLE quotation_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id  UUID REFERENCES quotations(id) ON DELETE CASCADE,
  rfq_item_id   UUID REFERENCES rfq_items(id),
  unit_price    FLOAT NOT NULL,
  total_price   FLOAT NOT NULL,
  availability  TEXT DEFAULT 'in_stock' CHECK (availability IN (
                  'in_stock','on_order','limited'))
);
```
**Connected to frontend:** Per-item pricing rows in quote form (5.8), per-item rows in comparison table (5.4), line items in invoice (5.6)

### Table 9: `approvals`
```sql
CREATE TABLE approvals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id          UUID REFERENCES rfqs(id),
  quotation_id    UUID REFERENCES quotations(id),
  requested_by    UUID REFERENCES profiles(id),
  manager_id      UUID REFERENCES profiles(id),
  status          TEXT DEFAULT 'pending' CHECK (status IN (
                    'pending','approved','rejected')),
  officer_note    TEXT,
  manager_remarks TEXT,
  submitted_at    TIMESTAMPTZ DEFAULT NOW(),
  decided_at      TIMESTAMPTZ
);
```
**Connected to frontend:** Approval queue list (5.10), Approval Detail card (5.11), Approval chain display (5.11), KPI "PENDING APPROVALS" tile (5.2), urgency banner (5.10)

### Table 10: `purchase_orders`
```sql
CREATE TABLE purchase_orders (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number             TEXT UNIQUE NOT NULL,   -- PO-2025-0001
  rfq_id                UUID REFERENCES rfqs(id),
  quotation_id          UUID REFERENCES quotations(id),
  approval_id           UUID REFERENCES approvals(id),
  vendor_id             UUID REFERENCES vendors(id),
  created_by            UUID REFERENCES profiles(id),
  status                TEXT DEFAULT 'draft' CHECK (status IN (
                          'draft','sent','acknowledged','fulfilled','cancelled')),
  delivery_address      TEXT,
  special_instructions  TEXT,
  expected_delivery_date DATE,
  subtotal              FLOAT,
  gst_amount            FLOAT,
  total_amount          FLOAT,
  pdf_url               TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);
```
**Connected to frontend:** PO number display (5.5), status tracker `DRAFT→SENT→ACKNOWLEDGED→FULFILLED` (5.5), Live PO document (5.5), KPI "POs THIS MONTH" (5.2), Pipeline "PO ISSUED" column (5.2), savings calculation source

### Table 11: `invoices`
```sql
CREATE TABLE invoices (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number    TEXT UNIQUE NOT NULL,   -- INV-2025-001
  po_id             UUID REFERENCES purchase_orders(id),
  vendor_id         UUID REFERENCES vendors(id),
  created_by        UUID REFERENCES profiles(id),
  status            TEXT DEFAULT 'draft' CHECK (status IN (
                      'draft','sent','paid','overdue')),
  invoice_date      DATE DEFAULT CURRENT_DATE,
  payment_due_date  DATE,
  tax_type          TEXT DEFAULT 'cgst_sgst' CHECK (tax_type IN (
                      'cgst_sgst','igst')),
  freight_charges   FLOAT DEFAULT 0,
  handling_charges  FLOAT DEFAULT 0,
  subtotal          FLOAT,
  tax_amount        FLOAT,
  total_amount      FLOAT,
  notes             TEXT,
  pdf_url           TEXT,
  emailed_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
```
**Connected to frontend:** Invoice number display (5.6), GST-compliant invoice document (5.6), email slide-over (5.6), KPI "INVOICES PENDING" (5.2), Pipeline "INVOICED" column (5.2)

### Table 12: `negotiation_threads`
```sql
CREATE TABLE negotiation_threads (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id        UUID REFERENCES rfqs(id),
  officer_id    UUID REFERENCES profiles(id),
  vendor_id     UUID REFERENCES vendors(id),
  is_locked     BOOLEAN DEFAULT FALSE,
  locked_at     TIMESTAMPTZ,
  locked_reason TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(rfq_id, vendor_id)
);
```
**Connected to frontend:** Thread list panel (5.9), Thread header (5.9), Manager read-only modal (5.11), thread lock display (5.9)

### Table 13: `negotiation_messages`
```sql
CREATE TABLE negotiation_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id   UUID REFERENCES negotiation_threads(id) ON DELETE CASCADE,
  sender_id   UUID REFERENCES profiles(id),
  sender_name TEXT NOT NULL,
  sender_role TEXT CHECK (sender_role IN ('officer','vendor','system')),
  content     TEXT NOT NULL,
  is_read     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```
**Connected to frontend:** Message area chat display (5.9), system messages (5.9), unread badge on nav rail (5.2/5.7), Supabase realtime subscription target

### Table 14: `activity_logs`
```sql
CREATE TABLE activity_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES profiles(id),
  action_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id   UUID,
  description TEXT NOT NULL,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```
**Connected to frontend:** Live Activity Feed right panel (5.2), dot color by action_type, Admin Audit Log (5.12), Supabase realtime subscription target

### Table 15: `notifications`
```sql
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES profiles(id),
  type        TEXT NOT NULL,
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  entity_type TEXT,
  entity_id   UUID,
  is_read     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```
**Connected to frontend:** Bell icon badge count (5.2 nav rail), toast notifications triggered via Supabase realtime, Notifications page

### Table 16: `saved_addresses`
```sql
CREATE TABLE saved_addresses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    TEXT NOT NULL,
  label         TEXT NOT NULL,
  address_line1 TEXT,
  address_line2 TEXT,
  city          TEXT,
  state         TEXT,
  pincode       TEXT,
  is_default    BOOLEAN DEFAULT FALSE
);
```
**Connected to frontend:** Delivery address dropdown in PO creation (5.5)

---

## 6. API ROUTES — COMPLETE SPECIFICATION

### `main.py`
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import (auth, vendors, rfqs, quotations, approvals,
                          purchase_orders, invoices, negotiations,
                          analytics, notifications, utility)

app = FastAPI(title="VENDORA API", version="1.0.0")

app.add_middleware(
  CORSMiddleware,
  allow_origins=[settings.FRONTEND_URL],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

app.include_router(auth.router,           prefix="/api/auth")
app.include_router(vendors.router,        prefix="/api/vendors")
app.include_router(rfqs.router,           prefix="/api/rfqs")
app.include_router(quotations.router,     prefix="/api/quotations")
app.include_router(approvals.router,      prefix="/api/approvals")
app.include_router(purchase_orders.router,prefix="/api/purchase-orders")
app.include_router(invoices.router,       prefix="/api/invoices")
app.include_router(negotiations.router,   prefix="/api/threads")
app.include_router(analytics.router,      prefix="/api/analytics")
app.include_router(notifications.router,  prefix="/api/notifications")
app.include_router(utility.router,        prefix="/api")
```

---

### AUTH — `app/routers/auth.py`

```
POST   /api/auth/login
  Body:    { email: str, password: str }
  Returns: { token: str, user: UserOut }
  Logic:   supabase.auth.sign_in_with_password → fetch profile → return

POST   /api/auth/signup
  Body:    { email, password, name, role, company_name }
  Returns: { user: UserOut }

POST   /api/auth/logout
  Headers: Authorization: Bearer {token}
  Returns: { message: "logged out" }

GET    /api/auth/me
  Headers: Authorization: Bearer {token}
  Returns: { user: UserOut }
  Logic:   decode JWT → fetch profile from profiles table
```

---

### VENDORS — `app/routers/vendors.py`

```
GET    /api/vendors
  Query:   status?, category?, search?, include_stats?
  Returns: VendorList with trust_score, rating, avg_response_hours
  Used by: RFQ vendor selection grid (5.3), Admin vendor registry (5.12)

POST   /api/vendors
  Body:    VendorCreate
  Returns: VendorOut
  Roles:   admin, officer

GET    /api/vendors/me
  Returns: VendorOut for logged-in vendor user
  Used by: Vendor Dashboard header trust score (5.7)

GET    /api/vendors/{vendor_id}
  Returns: VendorOut + performance stats
  Used by: Vendor profile slide-over (Admin 5.12)

PUT    /api/vendors/{vendor_id}
  Body:    VendorUpdate
  Roles:   admin

PATCH  /api/vendors/{vendor_id}/status
  Body:    { status: 'active' | 'blacklisted' | 'pending' }
  Roles:   admin
  Used by: Admin vendor registry status filter chips (5.12)

GET    /api/vendors/{vendor_id}/performance
  Returns: { rating, on_time_rate, disputes, response_time,
             trust_score, order_history[] }
  Used by: Comparison table vendor stats row (5.4)
```

---

### RFQs — `app/routers/rfqs.py`

```
GET    /api/rfqs
  Query:   status?, vendor_id?, invited?, created_by?, limit?
  Returns: RFQList with countdown, vendor_count, item_count
  Used by: Pipeline kanban (5.2), Vendor invited cards (5.7)

POST   /api/rfqs
  Body:    { title, category, priority, deadline,
             items: RFQItemCreate[], vendor_ids: UUID[] }
  Returns: { rfq_id, rfq_number }
  Triggers:
    → rfq_service.create_rfq()
    → number_generator.generate_rfq_number()
    → rfq_service.assign_vendors()
    → activity_log_service.log()
  Used by: RFQ Creation form SEND button (5.3)

GET    /api/rfqs/{rfq_id}
  Returns: RFQDetail with items, vendors, attachment_urls
  Used by: RFQ Brief in quote submission (5.8), Vendor RFQ detail

PUT    /api/rfqs/{rfq_id}
  Body:    RFQUpdate (only if status=draft)
  Roles:   officer who created it

POST   /api/rfqs/{rfq_id}/send
  Returns: { rfq_number, vendor_count, deadline }
  Triggers:
    → status = 'sent'
    → email_sender.send_rfq_invitations() to each vendor
    → notification_service.notify_vendors()
    → activity_log_service.log()
  Used by: Success screen in RFQ creation (5.3)

POST   /api/rfqs/{rfq_id}/attachments
  Body:    multipart/form-data file
  Returns: { file_name, file_url }
  Triggers: storage.upload_to_supabase()
  Used by: Attachment drag-drop zone (5.3)

GET    /api/rfqs/{rfq_id}/quotations
  Returns: all quotations for this RFQ
  Used by: Quotation Comparison (5.4)

GET    /api/rfqs/{rfq_id}/compare
  Query:   price_weight?, delivery_weight?, rating_weight?
           (defaults: 60, 20, 20)
  Returns: ComparisonResult with composite_scores, best_tags, recommended
  Triggers:
    → quotation_service.calculate_composite_scores()
  Used by: Bloomberg comparison table (5.4)

POST   /api/rfqs/{rfq_id}/compare
  Body:    { price_weight: float, delivery_weight: float, rating_weight: float }
  Returns: ComparisonResult (recalculated)
  Used by: Decision Engine sliders (5.4) — called on every slider drag
```

---

### QUOTATIONS — `app/routers/quotations.py`

```
GET    /api/quotations/{quotation_id}
  Returns: QuotationDetail with items, vendor info
  Used by: "VIEW FULL QUOTE" slide-over (5.4)

POST   /api/rfqs/{rfq_id}/quotations
  Body:    { items: QuotationItemCreate[], delivery_days, valid_until,
             gst_rate, payment_terms, notes, confidence_level }
  Returns: { quotation_id, subtotal, gst_amount, total_amount }
  Triggers:
    → quotation_service.calculate_totals()
    → rfq_vendors update status='submitted'
    → notification_service.notify_officer()
    → negotiation_service.create_system_message("Quote submitted · ₹X")
    → activity_log_service.log()
  Used by: Quote Submit form (5.8)

PUT    /api/quotations/{quotation_id}
  Body:    QuotationUpdate (revision)
  Returns: QuotationDetail updated
  Triggers:
    → recalculate totals
    → negotiation_service.create_system_message("Quote revised to ₹X")
    → notification_service.notify_officer()
  Used by: Vendor quote revision (5.8)

GET    /api/quotations
  Query:   vendor_id?, rfq_id?, status?
  Returns: list with WON/LOST/PENDING outcome
  Used by: Vendor quote history timeline (5.7)

POST   /api/quotations/{quotation_id}/select
  Returns: { approval_id }
  Triggers:
    → this quotation → status='under_review'
    → other quotations for same RFQ → status='rejected'
    → rfq status → 'approval'
    → approval_service.create_approval()
    → notification_service.notify_manager()
    → negotiation_service.create_system_message("Sent for approval")
    → activity_log_service.log()
  Used by: "SELECT THIS VENDOR" button (5.4)
```

---

### APPROVALS — `app/routers/approvals.py`

```
GET    /api/approvals
  Query:   status?, manager_id?, limit?
  Returns: ApprovalList with hours_pending, is_high_value (>5L)
  Used by: Approval Queue (5.10), KPI tile (5.2)

GET    /api/approvals/{approval_id}
  Returns: ApprovalDetail {
    rfq, selected_quotation, all_quotations,
    lowest_quote, price_premium, price_premium_pct,
    officer_note, approval_chain, vendor_stats
  }
  Used by: Approval Detail card (5.11)
  Note: "WHY NOT THE CHEAPEST?" section is built from this

POST   /api/approvals/{approval_id}/approve
  Returns: { po_id, po_number }
  Triggers:
    → approval status = 'approved', decided_at = now
    → po_service.auto_create_po()           ← PO auto-generated
    → rfq status = 'po_issued'
    → quotation status = 'accepted'
    → negotiation_service.lock_thread()
    → negotiation_service.create_system_message("PO #XXXX generated · 🔒 Thread locked")
    → notification_service.notify_officer("APPROVED — PO being generated")
    → activity_log_service.log()
  Used by: Hold-to-Approve mechanic (5.11)

POST   /api/approvals/{approval_id}/reject
  Body:    { remarks: str }   ← server validates non-empty
  Returns: { rejected_at }
  Triggers:
    → approval status = 'rejected'
    → rfq status = 'comparing'
    → notification_service.notify_officer with remarks
    → activity_log_service.log()
  Used by: REJECT button + remarks field (5.11)

GET    /api/approvals/stats
  Returns: { avg_hours, pending_count, oldest_hours }
  Used by: Urgency Banner text (5.10)
```

---

### PURCHASE ORDERS — `app/routers/purchase_orders.py`

```
GET    /api/purchase-orders
  Query:   status?, vendor_id?, created_by?, limit?
  Returns: POList
  Used by: Pipeline "PO ISSUED" column (5.2), KPI count (5.2)

POST   /api/purchase-orders
  Body:    { approval_id, delivery_address, special_instructions,
             expected_delivery_date }
  Returns: { po_id, po_number, subtotal, gst_amount, total_amount }
  Triggers:
    → number_generator.generate_po_number()
    → copies amounts from approved quotation
    → activity_log_service.log()
  Used by: PO screen GENERATE PO button (5.5)

GET    /api/purchase-orders/{po_id}
  Returns: PODetail with vendor, items, GST breakdown, totals
  Used by: Live PO Document right panel (5.5)

PUT    /api/purchase-orders/{po_id}
  Body:    { delivery_address?, special_instructions?,
             expected_delivery_date? }
  Returns: PODetail updated
  Used by: Left controls panel edits (5.5)

PATCH  /api/purchase-orders/{po_id}/status
  Body:    { status }
  Returns: PODetail updated
  Used by: Status tracker clicks (5.5)

POST   /api/purchase-orders/{po_id}/pdf
  Returns: { pdf_url }
  Triggers:
    → pdf_generator.generate_po_pdf()
    → storage.upload_pdf()
    → po.pdf_url = saved_url
  Used by: DOWNLOAD PDF + PRINT buttons (5.5)
```

---

### INVOICES — `app/routers/invoices.py`

```
GET    /api/invoices
  Query:   status?, vendor_id?, limit?
  Returns: InvoiceList
  Used by: KPI "INVOICES PENDING" (5.2), Pipeline "INVOICED" column

POST   /api/invoices
  Body:    { po_id, tax_type, freight_charges, handling_charges, notes }
  Returns: InvoiceDetail {
    invoice_number, invoice_date, payment_due_date,
    subtotal, tax_amount, total_amount
  }
  Triggers:
    → number_generator.generate_invoice_number()
    → tax_calculator.calculate(tax_type, subtotal, gst_rate)
    → payment_due_date from PO quotation payment_terms
    → rfq status = 'invoiced'
    → activity_log_service.log()
  Used by: Invoice screen (5.6) on load

GET    /api/invoices/{invoice_id}
  Returns: InvoiceDetail with full GST breakdown
  Used by: Live Invoice Document right panel (5.6)

PUT    /api/invoices/{invoice_id}
  Body:    { invoice_date?, tax_type?, freight_charges?, notes? }
  Returns: InvoiceDetail recalculated
  Used by: Left controls panel edits (5.6)

POST   /api/invoices/{invoice_id}/pdf
  Returns: { pdf_url }
  Triggers:
    → pdf_generator.generate_invoice_pdf()  ← GST-compliant layout
    → storage.upload_pdf()
  Used by: DOWNLOAD PDF + PRINT buttons (5.6)

POST   /api/invoices/{invoice_id}/email
  Body:    { to, cc, subject, body_note }
  Returns: { sent_at }
  Triggers:
    → pdf_generator.generate_invoice_pdf() if not already done
    → email_sender.send_invoice_email(to, cc, subject, pdf_url)
    → invoice.emailed_at = now, status = 'sent'
    → notification_service.notify_vendor()
    → activity_log_service.log("Invoice INV-XXX emailed")
  Used by: EMAIL TO VENDOR slide-over SEND button (5.6)

PATCH  /api/invoices/{invoice_id}/status
  Body:    { status: 'paid' | 'overdue' }
  Returns: InvoiceDetail
```

---

### NEGOTIATIONS — `app/routers/negotiations.py`

```
GET    /api/threads
  Query:   vendor_id?, officer_id?, rfq_id?
  Returns: ThreadList with unread_count, last_message_preview
  Used by: Thread List left panel (5.9), Vendor Dashboard threads (5.7)

POST   /api/threads
  Body:    { rfq_id, vendor_id }
  Returns: ThreadOut
  Triggers: auto-created when vendor is invited to RFQ
  Note: UNIQUE constraint on (rfq_id, vendor_id) prevents duplicates

GET    /api/threads/{thread_id}
  Returns: ThreadDetail { thread, messages[], is_locked, participants }
  Used by: Active thread right panel (5.9)

POST   /api/threads/{thread_id}/messages
  Body:    { content: str }
  Returns: MessageOut
  Triggers:
    → inserts to negotiation_messages
    → Supabase realtime fires to other party instantly
    → notification_service.notify_other_party()
  Used by: Message input box (5.9)

PATCH  /api/threads/{thread_id}/messages/{msg_id}/read
  Returns: { updated: true }
  Triggers: is_read = true, unread badge recalculates
  Used by: Opening a thread

POST   /api/threads/{thread_id}/lock
  Returns: { locked_at, locked_reason }
  Note: called internally by approval_service.approve()
  Triggers:
    → is_locked = true
    → system message "🔒 Thread locked — PO issued"

POST   /api/threads/{thread_id}/export
  Returns: { pdf_url }
  Triggers:
    → pdf_generator.generate_thread_export_pdf()
    → storage.upload_pdf()
  Used by: EXPORT CONVERSATION → button on locked thread (5.9)

GET    /api/threads/unread-count
  Returns: { count: int }
  Used by: MessageSquare nav icon badge (5.2, 5.7)
```

---

### ANALYTICS — `app/routers/analytics.py`

```
GET    /api/analytics/officer-kpis
  Returns: {
    pending_approvals: int,
    active_rfqs: int,
    pos_this_month: { count, value, mom_trend },
    invoices_pending: { count, value },
    savings_this_month: { amount, trend }
  }
  Used by: KPI Strip 5 tiles (5.2)

GET    /api/analytics/admin-kpis
  Returns: {
    total_users, active_vendors, rfqs_this_month,
    total_spend, savings_total
  }
  Used by: System Health Strip (5.12)

GET    /api/analytics/savings
  Query:   period (month|year), breakdown (monthly)?
  Returns: {
    total: float,
    last_po_savings: float,
    monthly_breakdown: [{ month, amount }],
    per_po_table: [{ po_number, item, highest_quote, po_value, saved }]
  }
  Used by: Savings Widget compact (5.2), full savings report (5.13)

GET    /api/analytics/health-score
  Returns: {
    overall_score: int,
    label: 'HEALTHY' | 'NEEDS ATTENTION' | 'CRITICAL',
    rfq_competition_rate: float,
    approval_speed: float,
    delivery_compliance: float,
    vendor_responsiveness: float,
    insight_sentence: str
  }
  Used by: Health Score gauge + sub-bars (5.12)

GET    /api/analytics/approval-velocity
  Returns: [{ date, avg_hours }] for last 30 days
  Used by: Manager Chart 1 line chart (5.10)

GET    /api/analytics/spend-by-category
  Returns: [{ category, amount }]
  Used by: Manager Chart 2 horizontal bars (5.10)

GET    /api/analytics/vendor-concentration
  Returns: [{ vendor_name, percentage, flag: 'normal'|'warning'|'danger' }]
  Used by: Manager Chart 3 concentration risk (5.10)

GET    /api/analytics/spending-heatmap
  Returns: { matrix: [{ month, category, amount }] }  12×5
  Used by: Admin Monthly Spending Heatmap (5.13)

GET    /api/analytics/vendor-performance
  Returns: { top_5: VendorRank[], bottom_5: VendorRank[] }
  Used by: Vendor Performance Leaderboard (5.13)

GET    /api/analytics/procurement-funnel
  Returns: {
    stages: [{ stage, count, percentage, drop_off }],
    auto_insight: str
  }
  Used by: Procurement Funnel bars (5.13)

POST   /api/analytics/export
  Returns: { pdf_url }
  Triggers: generates full analytics PDF
  Used by: EXPORT ALL REPORTS → button (5.13)
```

---

### NOTIFICATIONS — `app/routers/notifications.py`

```
GET    /api/notifications
  Returns: NotificationList
  Used by: Bell icon page, toast trigger via realtime

PATCH  /api/notifications/{notification_id}/read
  Returns: { updated: true }

PATCH  /api/notifications/read-all
  Returns: { updated_count: int }
```

### UTILITY — `app/routers/utility.py`

```
GET    /api/health
  Returns: { status: "ok", version: "1.0.0" }

GET    /api/saved-addresses
  Returns: AddressList
  Used by: Delivery address dropdown in PO (5.5)

POST   /api/saved-addresses
  Body:    AddressCreate
  Returns: AddressOut

GET    /api/users
  Returns: UserList (admin only)
  Used by: User Management table (5.12)

PATCH  /api/users/{user_id}/role
  Body:    { role }
  Roles:   admin only
  Used by: EDIT ROLE action (5.12)

PATCH  /api/users/{user_id}/deactivate
  Roles:   admin only
  Used by: DEACTIVATE action (5.12)
```

---

## 7. SERVICE LAYER — BUSINESS LOGIC

### `app/services/quotation_service.py`

**`calculate_composite_scores(quotations, price_w, delivery_w, rating_w)`**
```python
# Called by: GET/POST /api/rfqs/{id}/compare
# Powers: Decision Engine sliders (5.4)

def calculate_composite_scores(quotations, price_w=60, delivery_w=20, rating_w=20):
    min_price    = min(q.total_amount for q in quotations)
    min_days     = min(q.delivery_days for q in quotations)
    max_rating   = max(q.vendor.rating for q in quotations)

    for q in quotations:
        price_score    = (min_price / q.total_amount) * 100
        delivery_score = (min_days / q.delivery_days) * 100
        rating_score   = (q.vendor.rating / 5) * 100

        q.composite = (
            (price_w    / 100 * price_score) +
            (delivery_w / 100 * delivery_score) +
            (rating_w   / 100 * rating_score)
        )

    # Tag best in each category
    # Return sorted by composite desc, recommended = highest composite
```

**`calculate_totals(items, gst_rate)`**
```python
# Called when vendor submits/revises quotation
# Powers: Live Quote Summary card (5.8)

subtotal   = sum(item.unit_price * item.quantity for item in items)
gst_amount = subtotal * (gst_rate / 100)
total      = subtotal + gst_amount
```

### `app/services/approval_service.py`

**`auto_create_po(approval_id)`**
```python
# Called immediately after approval
# Powers: "APPROVED — PO being generated now" toast (5.10/5.11)

approval   = fetch approval
quotation  = fetch accepted quotation
po_number  = number_generator.generate_po_number()

po = create purchase_order record copying:
  - vendor_id from quotation
  - subtotal, gst_amount, total_amount from quotation
  - expected_delivery_date from quotation.delivery_days + today

lock_thread(rfq_id, vendor_id)
create_system_message("PO #{po_number} generated")
notify_officer(approval, po_number)
log_activity()
return po
```

### `app/services/analytics_service.py`

**`calculate_savings(period, breakdown)`**
```python
# Powers: Savings Widget (5.2, 5.13)
# The number that counts up dramatically on admin reports

completed_pos = fetch all POs with status='fulfilled'
savings_list  = []

for po in completed_pos:
    all_quotes    = fetch quotations for po.rfq_id
    max_quote     = max(q.total_amount for q in all_quotes)
    savings       = max_quote - po.total_amount
    savings_list.append({ po_number, savings, month })

annual_total      = sum(s.savings for s in savings_list if s.year == current_year)
monthly_breakdown = group_by_month(savings_list)
```

**`calculate_health_score()`**
```python
# Powers: Procurement Health Score gauge (5.12)

rfq_competition_rate = (
    count(rfqs where quote_count >= 3) / count(all_rfqs)
) * 100

approval_speed = (
    count(approvals decided in < 24h) / count(all_approvals)
) * 100

delivery_compliance = (
    count(pos fulfilled on or before expected_date) / count(fulfilled_pos)
) * 100

vendor_responsiveness = (
    count(rfq_vendors where status != 'invited') / count(all_rfq_vendors)
) * 100

overall = weighted_avg(rfq_competition_rate * 0.25,
                       approval_speed       * 0.25,
                       delivery_compliance  * 0.30,
                       vendor_responsiveness* 0.20)

label = 'HEALTHY' if overall >= 75 else 'NEEDS ATTENTION' if overall >= 50 else 'CRITICAL'

insight = generate_insight_sentence(sub_scores)
# e.g. "Your procurement is healthy. Approval speed needs attention."
```

**`calculate_procurement_funnel()`**
```python
# Powers: Procurement Funnel bars (5.13)
# Finds the biggest drop-off for auto_insight

rfqs_created    = count all RFQs
quotes_received = count RFQs with at least 1 quotation submitted
comparisons     = count RFQs that reached 'comparing' status
approvals       = count approved approvals
pos_issued      = count purchase_orders created
invoices_done   = count invoices with status != 'draft'

stages = build percentage chain
drop_offs = [stage_n-1 - stage_n for each stage]
worst_stage = max(drop_offs)
auto_insight = f"⚠ {worst_stage.name} stage has highest drop-off..."
```

### `app/services/vendor_service.py`

**`recalculate_trust_score(vendor_id)`**
```python
# Called after PO fulfilled or dispute logged
# Powers: Trust Score display on Vendor Dashboard header (5.7)

rating_component      = vendor.rating * 20             # max 100
on_time_component     = on_time_rate  * 30             # max 30
dispute_component     = (0 if disputes > 0 else 20)    # binary
response_component    = response_time_score * 15       # max 15
history_component     = min(total_orders / 50, 1) * 15 # max 15

trust_score = sum of all, capped at 100
```

---

## 8. UTILITY MODULES

### `app/utils/number_generator.py`

```python
# Powers: PO-2025-1203, RFQ-2025-2847, INV-2025-089 displays

def generate_rfq_number(db) -> str:
    count = db.count("rfqs") + 1
    return f"RFQ-{datetime.now().year}-{count:04d}"

def generate_po_number(db) -> str:
    count = db.count("purchase_orders") + 1
    return f"PO-{datetime.now().year}-{count:04d}"

def generate_invoice_number(db) -> str:
    count = db.count("invoices") + 1
    return f"INV-{datetime.now().year}-{count:03d}"
```

### `app/utils/tax_calculator.py`

```python
# Powers: Live Invoice Document GST breakdown (5.6)

def calculate_tax(subtotal: float, gst_rate: float, tax_type: str) -> dict:
    if tax_type == 'cgst_sgst':
        half_rate  = gst_rate / 2
        cgst       = subtotal * (half_rate / 100)
        sgst       = subtotal * (half_rate / 100)
        return { 'cgst': cgst, 'sgst': sgst, 'igst': 0,
                 'total_tax': cgst + sgst,
                 'grand_total': subtotal + cgst + sgst }
    else:  # igst
        igst = subtotal * (gst_rate / 100)
        return { 'cgst': 0, 'sgst': 0, 'igst': igst,
                 'total_tax': igst,
                 'grand_total': subtotal + igst }
```

### `app/utils/pdf_generator.py`

```python
# Three PDF types. All use Jinja2 HTML → WeasyPrint → bytes

def generate_po_pdf(po_data: dict) -> bytes:
    template = jinja_env.get_template("pdf/purchase_order.html")
    html     = template.render(**po_data)
    return weasyprint.HTML(string=html).write_pdf()
    # Powers: DOWNLOAD PDF / PRINT buttons on PO screen (5.5)

def generate_invoice_pdf(invoice_data: dict) -> bytes:
    template = jinja_env.get_template("pdf/invoice.html")
    html     = template.render(**invoice_data)
    return weasyprint.HTML(string=html).write_pdf()
    # Powers: DOWNLOAD PDF / PRINT / EMAIL buttons on invoice (5.6)
    # GST-compliant layout matching the right panel preview

def generate_thread_export_pdf(thread_data: dict) -> bytes:
    template = jinja_env.get_template("pdf/negotiation_export.html")
    html     = template.render(**thread_data)
    return weasyprint.HTML(string=html).write_pdf()
    # Powers: EXPORT CONVERSATION → on locked thread (5.9)
    # Full conversation log with timestamps for compliance
```

### `app/utils/email_sender.py`

```python
# All emails via Resend SDK

def send_rfq_invitations(vendors: list, rfq: dict):
    # Powers: POST /api/rfqs/{id}/send → vendor email invite
    for vendor in vendors:
        resend.Emails.send({
            "from": settings.FROM_EMAIL,
            "to": vendor.contact_email,
            "subject": f"RFQ Invitation: {rfq['title']} — {rfq['rfq_number']}",
            "html": render_template("email/rfq_invitation.html", ...)
        })

def send_invoice_email(to, cc, subject, pdf_bytes, invoice_data):
    # Powers: EMAIL TO VENDOR slide-over (5.6)
    resend.Emails.send({
        "from": settings.FROM_EMAIL,
        "to": to, "cc": cc, "subject": subject,
        "html": render_template("email/invoice_email.html", ...),
        "attachments": [{"filename": f"{invoice_data['number']}.pdf",
                         "content": base64(pdf_bytes)}]
    })
```

### `app/utils/storage.py`

```python
# Supabase Storage — two buckets

def upload_pdf(pdf_bytes: bytes, filename: str, bucket: str) -> str:
    supabase.storage.from_(bucket).upload(filename, pdf_bytes)
    return supabase.storage.from_(bucket).get_public_url(filename)

def upload_attachment(file: UploadFile, rfq_id: str) -> str:
    path = f"rfq-{rfq_id}/{file.filename}"
    supabase.storage.from_("vendora-attachments").upload(path, file.file.read())
    return supabase.storage.from_("vendora-attachments").get_public_url(path)
```

---

## 9. CORE MODULES

### `app/core/config.py`
```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SUPABASE_URL: str
    SUPABASE_SERVICE_KEY: str
    SUPABASE_ANON_KEY: str
    JWT_SECRET: str
    RESEND_API_KEY: str
    FROM_EMAIL: str
    STORAGE_BUCKET_PDFS: str = "vendora-pdfs"
    STORAGE_BUCKET_ATTACHMENTS: str = "vendora-attachments"
    FRONTEND_URL: str = "http://localhost:5173"
    APP_ENV: str = "development"

    class Config:
        env_file = ".env"

settings = Settings()
```

### `app/core/dependencies.py`
```python
# Injected into every protected route via Depends()

async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserOut:
    payload  = jose.decode(token, settings.JWT_SECRET)
    user_id  = payload.get("sub")
    profile  = supabase.table("profiles").select("*").eq("id", user_id).single()
    return UserOut(**profile.data)

def require_role(*roles: str):
    def checker(user = Depends(get_current_user)):
        if user.role not in roles:
            raise HTTPException(403, "Insufficient role")
        return user
    return checker

# Usage in routers:
# @router.post("/rfqs", dependencies=[Depends(require_role("officer", "admin"))])
```

---

## 10. ENVIRONMENT CONFIGURATION

### `.env`
```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...   # service role — backend only, never exposed to frontend
SUPABASE_ANON_KEY=eyJ...      # anon key — for verifying user JWTs

JWT_SECRET=your-supabase-jwt-secret

RESEND_API_KEY=re_xxxx
FROM_EMAIL=noreply@vendora.com

STORAGE_BUCKET_PDFS=vendora-pdfs
STORAGE_BUCKET_ATTACHMENTS=vendora-attachments

FRONTEND_URL=http://localhost:5173
APP_ENV=development
```

### Frontend `.env` (for reference — lives in vendora-frontend/)
```
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

---

## 11. SUPABASE REALTIME STRATEGY

The frontend subscribes directly to Supabase. FastAPI inserts data. Supabase fires the event. No WebSocket in FastAPI needed.

```
Frontend useRealtime.ts subscribes to:

1. activity_logs table (INSERT)
   → filter: none (officer sees all company activity)
   → fires: Live Activity Feed slides in new event (5.2)
   → dot color by action_type field

2. negotiation_messages table (INSERT)
   → filter: thread_id = current thread
   → fires: new message appears instantly in thread (5.9)

3. notifications table (INSERT)
   → filter: user_id = current user
   → fires: react-hot-toast with custom styling
   → bell badge count increments

4. rfq_vendors table (UPDATE)
   → filter: vendor_id = me (vendor only)
   → fires: RFQ card border color changes (5.7)

5. approvals table (UPDATE)
   → filter: manager_id = me (manager only)
   → fires: urgency banner updates count
```

---

## 12. ROW LEVEL SECURITY POLICIES

Set in Supabase dashboard. Ensures users only see their own data.

```sql
-- Vendors only see RFQs they're invited to
CREATE POLICY "vendor_rfqs" ON rfq_vendors
  FOR SELECT USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  );

-- Officers only see their company's data
-- (simplified: in hackathon context, all officers share company data)
CREATE POLICY "officer_rfqs" ON rfqs
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('officer','manager','admin')
    )
  );

-- Users only see their own notifications
CREATE POLICY "own_notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

-- Messages: only thread participants
CREATE POLICY "thread_messages" ON negotiation_messages
  FOR SELECT USING (
    thread_id IN (
      SELECT id FROM negotiation_threads
      WHERE officer_id = auth.uid() OR vendor_id IN (
        SELECT id FROM vendors WHERE user_id = auth.uid()
      )
    )
  );
```

---

## 13. SEEDING & DEMO DATA

Run this once to populate Supabase with demo data matching the hardcoded frontend credentials.

**What gets seeded:**

```
4 users (matching hardcodedAuth.ts exactly):
  officer@vendora.com  → profiles row, role=officer
  vendor@vendora.com   → profiles row + vendors row (Mehta Industries, trust_score=87)
  manager@vendora.com  → profiles row, role=manager
  admin@vendora.com    → profiles row, role=admin

3 additional vendors (for comparison table demo):
  Sharma Traders       → rating=3.1, 4 orders, 1 dispute
  Global Supplies      → rating=4.8, 28 orders, 0 disputes
  Mehta Industries     → rating=4.2, 12 orders, 0 disputes

2 RFQs:
  RFQ-2025-2847: Industrial Bearings, 250 units, status=comparing
  RFQ-2025-2851: Office Supplies, status=sent

3 quotations for RFQ-2025-2847:
  Mehta: ₹1,12,500  delivery=12d  rating=4.2  composite=74
  Sharma: ₹95,000   delivery=15d  rating=3.1  composite=61
  Global: ₹1,05,000 delivery=9d   rating=4.8  composite=89  ← recommended

1 approval (pending):
  RFQ-2847, Global Supplies selected, manager_id=Priya Mehta

1 negotiation thread with 4 messages for RFQ-2847

2 purchase orders (historical, fulfilled):
  PO-2025-1198: Office Supplies ₹26,000 (saved ₹6,000)
  PO-2025-1185: Safety Equipment ₹1,45,000 (saved ₹40,000)

1 invoice (sent):
  INV-2025-089 for PO-2025-1198

Activity logs: 10 realistic entries for live feed demo
```

This seed data means the demo starts with the savings widget showing `₹46,000`, the comparison table pre-populated, and the approval queue showing 1 pending item — all the dramatic moments land immediately during the hackathon demo.

---

*VENDORA Backend PRD v1.0 — FastAPI + Supabase | Aligned with Frontend PRD v1.0*