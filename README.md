<div align="center">

```
██╗   ██╗███████╗███╗   ██╗██████╗  ██████╗ ██████╗  █████╗
██║   ██║██╔════╝████╗  ██║██╔══██╗██╔═══██╗██╔══██╗██╔══██╗
██║   ██║█████╗  ██╔██╗ ██║██║  ██║██║   ██║██████╔╝███████║
╚██╗ ██╔╝██╔══╝  ██║╚██╗██║██║  ██║██║   ██║██╔══██╗██╔══██║
 ╚████╔╝ ███████╗██║ ╚████║██████╔╝╚██████╔╝██║  ██║██║  ██║
  ╚═══╝  ╚══════╝╚═╝  ╚═══╝╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝
```

**Procurement, Commanded.**
*Where every purchase decision lives — tracked, negotiated, approved, and documented.*

[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Python](https://img.shields.io/badge/Python_3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)

[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](CONTRIBUTING.md)
[![Made for India](https://img.shields.io/badge/Made_for-Indian_SMEs-FF9933?style=for-the-badge&logo=india&logoColor=white)]()

[🚀 Live Demo](#) • [📖 Backend API Docs](#) • [🎬 Watch Demo Video](#)

</div>

---

## ⚡ The Problem VENDORA Solves

In Indian SMEs, procurement runs on WhatsApp groups, Excel sheets, and phone calls. Decisions worth lakhs are made in DMs. There is no audit trail. No accountability. No intelligence.

| ❌ How It Works Today | ✅ How VENDORA Changes It |
|---|---|
| Vendors contacted on WhatsApp — no record | Vendors invited via structured RFQs — trackable |
| Quotes compared on Excel — no intelligence | Quotes compared on a Bloomberg-style table — intelligent |
| Approvals via phone calls — no audit trail | Approvals via hold-to-confirm mechanic — accountable |
| Invoices sent via email attachments — no tracking | Invoices generated as GST-compliant PDFs — professional |
| Finance team has zero visibility until it's too late | Finance team has real-time visibility at every step |
| Post-order negotiations happen outside the system | All negotiations locked after PO — no renegotiation |

---

## 🎬 Demo

Login as any role. Watch the entire procurement cycle — from RFQ to Invoice — happen in one platform.

> [!NOTE]
> **All demo accounts use password:** `demo123`

| 🔐 Role | 📧 Email | 🔑 Password |
|---|---|---|
| Procurement Officer | officer@vendora.com | demo123 |
| Vendor | vendor@vendora.com | demo123 |
| Manager / Approver | manager@vendora.com | demo123 |
| Admin | admin@vendora.com | demo123 |

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    FE["🖥️ React Frontend\nVite + TypeScript + Tailwind\nLogin → RFQ → Compare → Approve → PO → Invoice"]
    BE["⚙️ FastAPI Backend\n/auth /rfqs /quotations /approvals\n/purchase-orders /threads /analytics\nPDF Generation · Email via Resend"]
    SB["🗄️ Supabase\nPostgreSQL · 16 Tables · RLS Policies\nRealtime · Auth · Storage Buckets"]

    FE -->|REST API calls| BE
    BE -->|DB reads/writes| SB
    FE -->|Realtime subscriptions direct| SB

    style FE fill:#1e3a5f,stroke:#61DAFB,color:#ffffff
    style BE fill:#0d3b2e,stroke:#009688,color:#ffffff
    style SB fill:#1a3a2a,stroke:#3ECF8E,color:#ffffff
```

---

## 🔄 The Complete Procurement Journey

```mermaid
sequenceDiagram
    actor O as 🧑 Officer
    actor V as 🏭 Vendor
    actor M as ✅ Manager

    O->>V: Creates RFQ (items, deadline, vendor selection)
    Note over V: Gets email invite
    V->>O: Submits Quote (price, delivery, confidence mood)
    O->>O: Compares Quotes (Bloomberg table + Decision sliders)
    O->>M: Selects Vendor → Approval Request
    Note over M: Reviews "Why not cheapest?"<br/>Reads negotiation thread
    M->>O: HOLD TO APPROVE ✓ → PO Auto-Created
    M->>V: Thread LOCKED 🔒
    O->>O: Invoice Generated (GST-compliant PDF)
    O->>V: Email Invoice ✉️
    Note over O,V: DONE ✓
```

---

## 📁 Folder Structure

```
vendora/
├── vendora-frontend/                        # React + Vite + TypeScript + Tailwind CSS
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── index.html
│   ├── .env                                 # VITE_API_URL, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
│   ├── .env.example
│   │
│   └── src/
│       ├── main.tsx
│       ├── App.tsx                          # Route tree + role-based guards
│       │
│       ├── lib/
│       │   ├── supabase.ts                  # Supabase realtime client (direct subscriptions only)
│       │   ├── api.ts                       # ALL FastAPI calls — single source of truth
│       │   └── hardcodedAuth.ts             # Demo credentials for 4 roles
│       │
│       ├── hooks/
│       │   ├── useAuth.ts                   # → POST /api/auth/login
│       │   ├── useRealtime.ts               # → Supabase direct subscriptions
│       │   └── useSavings.ts                # → GET /api/analytics/savings
│       │
│       ├── context/
│       │   ├── AuthContext.tsx
│       │   └── NotificationContext.tsx
│       │
│       ├── types/
│       │   └── index.ts                     # Message, Thread, RFQ, Vendor, etc.
│       │
│       ├── utils/
│       │   ├── formatCurrency.ts
│       │   ├── calculateSavings.ts
│       │   └── generatePDF.ts
│       │
│       ├── assets/
│       │   ├── logo.svg
│       │   └── fonts/
│       │
│       ├── components/
│       │   ├── shared/
│       │   │   ├── Sidebar.tsx
│       │   │   ├── TopBar.tsx
│       │   │   ├── KPICard.tsx              # Count-up animation on mount
│       │   │   ├── StatusBadge.tsx          # Pulsing dot variants
│       │   │   ├── Toast.tsx                # react-hot-toast custom styles
│       │   │   ├── LiveActivityFeed.tsx     # Supabase realtime, Framer Motion slide-in
│       │   │   ├── Modal.tsx
│       │   │   ├── SavingsWidget.tsx        # Compact (dashboard) + full (reports)
│       │   │   └── NegotiationBadge.tsx     # Unread count on nav rail
│       │   │
│       │   ├── officer/
│       │   │   ├── PipelineKanban.tsx       # RFQ stage columns
│       │   │   ├── ComparisonTable.tsx      # Bloomberg-style vendor table
│       │   │   ├── DecisionEngine.tsx       # Weighted sliders + live recalculation
│       │   │   ├── RFQPreview.tsx           # Live document preview (right panel)
│       │   │   ├── PODocument.tsx           # Live PO document (right panel)
│       │   │   ├── InvoiceDocument.tsx      # GST-compliant live invoice
│       │   │   └── EmailSlideOver.tsx       # Slide-in email composer
│       │   │
│       │   ├── vendor/
│       │   │   ├── RFQCard.tsx              # Border color: amber/blue/green/gray by status
│       │   │   ├── QuoteSummaryCard.tsx     # Live quote totals as vendor types
│       │   │   ├── MoodIndicator.tsx        # Confidence level selector
│       │   │   └── ThreadCard.tsx           # Compact thread with unread badge
│       │   │
│       │   ├── manager/
│       │   │   ├── ApprovalCard.tsx
│       │   │   ├── HoldToApproveBtn.tsx     # SVG ring fill mechanic (1.5s hold)
│       │   │   ├── ApprovalChain.tsx        # Officer → Manager → Finance steps
│       │   │   └── UrgencyBanner.tsx        # "N approvals waiting — oldest Xh"
│       │   │
│       │   └── admin/
│       │       ├── HealthScoreGauge.tsx     # SVG circle, stroke-dashoffset animation
│       │       ├── SpendingHeatmap.tsx      # 12×5 month/category grid
│       │       ├── FunnelChart.tsx          # Procurement funnel with drop-off %
│       │       ├── VendorLeaderboard.tsx    # Top 5 / Bottom 5
│       │       └── UserTable.tsx            # Role badge + actions
│       │
│       └── pages/
│           ├── Login.tsx                    # Role tile grid + credential auto-fill
│           │
│           ├── officer/
│           │   ├── Dashboard.tsx            # KPI strip, pipeline kanban, live feed
│           │   ├── RFQCreate.tsx            # Smart form + live document preview
│           │   ├── QuotationComparison.tsx  # Comparison table + decision engine
│           │   ├── PurchaseOrder.tsx        # Split screen — controls + PO document
│           │   ├── Invoice.tsx              # Split screen — controls + invoice document
│           │   └── Negotiations.tsx         # Thread list + active thread
│           │
│           ├── vendor/
│           │   ├── Dashboard.tsx            # Trust score, open invitations, history
│           │   ├── QuoteSubmit.tsx          # Per-item pricing + live summary card
│           │   ├── NegotiationThread.tsx    # Realtime chat, system messages, lock state
│           │   └── VendorOrders.tsx
│           │
│           ├── manager/
│           │   ├── Dashboard.tsx            # Urgency banner, approval queue, 3 charts
│           │   └── ApprovalDetail.tsx       # "Why not cheapest?" + hold-to-approve
│           │
│           └── admin/
│               ├── Dashboard.tsx            # Health score gauge, user mgmt, audit log
│               ├── Reports.tsx              # Savings spotlight, heatmap, funnel
│               ├── VendorManagement.tsx
│               └── UserManagement.tsx
│
│
└── vendora-backend/                         # FastAPI · Python 3.11+ · Supabase
    ├── main.py                              # FastAPI app init, CORS middleware, router mounts
    ├── requirements.txt
    ├── .env                                 # SUPABASE_URL, SERVICE_KEY, RESEND_API_KEY, JWT_SECRET
    ├── .env.example
    ├── README.md
    │
    ├── app/
    │   │
    │   ├── core/
    │   │   ├── __init__.py
    │   │   ├── config.py                    # Pydantic BaseSettings — all env vars
    │   │   ├── database.py                  # Supabase client initialization
    │   │   ├── security.py                  # JWT encode / decode (python-jose)
    │   │   ├── dependencies.py              # get_current_user(), require_role() — injected via Depends()
    │   │   └── exceptions.py
    │   │
    │   ├── models/                          # Pydantic request/response schemas
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
    │   ├── routers/                         # HTTP layer — validate input, call services, return responses
    │   │   ├── __init__.py
    │   │   ├── auth.py                      # POST /api/auth/login|signup|logout  GET /api/auth/me
    │   │   ├── vendors.py                   # GET|POST /api/vendors  GET /api/vendors/me  PATCH status
    │   │   ├── rfqs.py                      # GET|POST /api/rfqs  POST send|attachments  GET compare
    │   │   ├── quotations.py                # GET|PUT /api/quotations/{id}  POST select
    │   │   ├── approvals.py                 # GET /api/approvals  POST approve|reject
    │   │   ├── purchase_orders.py           # GET|POST /api/purchase-orders  POST pdf  PATCH status
    │   │   ├── invoices.py                  # GET|POST /api/invoices  POST pdf|email  PATCH status
    │   │   ├── negotiations.py              # GET|POST /api/threads  POST messages|lock|export
    │   │   ├── analytics.py                 # GET officer-kpis|admin-kpis|savings|health-score|funnel
    │   │   ├── notifications.py             # GET /api/notifications  PATCH read|read-all
    │   │   └── utility.py                   # GET /api/health  GET|POST saved-addresses  PATCH users
    │   │
    │   ├── services/                        # Business logic — all calculations, orchestration, side effects
    │   │   ├── __init__.py
    │   │   ├── auth_service.py
    │   │   ├── vendor_service.py            # recalculate_trust_score()
    │   │   ├── rfq_service.py               # create_rfq(), assign_vendors()
    │   │   ├── quotation_service.py         # calculate_composite_scores(), calculate_totals()
    │   │   ├── approval_service.py          # auto_create_po() — triggers PO + thread lock + notify
    │   │   ├── po_service.py
    │   │   ├── invoice_service.py
    │   │   ├── negotiation_service.py       # lock_thread(), create_system_message()
    │   │   ├── analytics_service.py         # calculate_health_score(), calculate_savings(), procurement_funnel()
    │   │   ├── notification_service.py
    │   │   └── activity_log_service.py
    │   │
    │   ├── utils/                           # Stateless utility functions
    │   │   ├── __init__.py
    │   │   ├── pdf_generator.py             # WeasyPrint + Jinja2 → PO, Invoice, Thread Export PDFs
    │   │   ├── email_sender.py              # Resend SDK — RFQ invitations, invoice delivery
    │   │   ├── number_generator.py          # RFQ-2025-XXXX  PO-2025-XXXX  INV-2025-XXX
    │   │   ├── tax_calculator.py            # CGST+SGST (intra-state) / IGST (inter-state)
    │   │   ├── savings_calculator.py        # max(quotes) − PO value per cycle
    │   │   └── storage.py                   # Supabase Storage upload — PDFs + RFQ attachments
    │   │
    │   └── templates/
    │       ├── pdf/
    │       │   ├── purchase_order.html      # Jinja2 template → WeasyPrint
    │       │   ├── invoice.html             # GST-compliant tax invoice layout
    │       │   └── negotiation_export.html  # Full conversation log for compliance
    │       │
    │       └── email/
    │           ├── rfq_invitation.html      # Sent to each vendor on RFQ dispatch
    │           ├── invoice_email.html       # Invoice delivery with PDF attachment
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

---

## 🚀 Features

### 🔐 Role-Based Access — 4 Distinct Worlds

Each role gets a completely different dashboard, permissions, and workflow. One login page, four experiences.

```
PROCUREMENT OFFICER         VENDOR                MANAGER             ADMIN
─────────────────────       ──────────────        ────────────        ─────────
• Create & send RFQs        • See invitations     • Approval queue    • Health score
• Compare quotes            • Submit quotes       • Hold-to-approve   • User management
• Generate POs & Invoices   • Negotiate           • Read threads      • Vendor registry
• Live activity feed        • Track outcomes      • Analytics charts  • Audit log
```

---

### 📊 Bloomberg-Style Quotation Comparison

> [!TIP]
> **The standout feature.** Drag any weight slider and composite scores recalculate live with rolling number animation. The recommended column shifts dynamically.

```
                    MEHTA IND.     SHARMA TRADERS    GLOBAL SUPPLIES
────────────────────────────────────────────────────────────────────
Rating              4.2★           3.1★              4.8★  ✦ BEST
Unit Price          ₹450           ₹380  ✦ LOWEST    ₹420
Delivery            12 days        15 days           9 days ✦ FASTEST
Total Value         ₹1,12,500      ₹95,000  ✦        ₹1,05,000
Past Orders         12             4                 28  ✦ MOST
Disputes            0  ✦           1                 0  ✦
────────────────────────────────────────────────────────────────────
COMPOSITE SCORE     74 / 100       61 / 100          89 / 100  ← REC.
```

**Decision Engine:** Three weight sliders (Price / Delivery / Rating) — drag any slider and composite scores recalculate live with rolling number animation. The recommended column shifts dynamically.

---

### 💬 Negotiation Thread — Replaces WhatsApp Forever

> [!IMPORTANT]
> **The #1 unprofessional behavior in Indian SME procurement is WhatsApp. VENDORA eliminates it.**

- Linear/Notion-style messages — not WhatsApp bubbles
- System messages auto-appear on key events: `"Quote revised to ₹97,000 · Oct 12"`
- Thread **locks automatically** after PO is issued — no post-approval renegotiation
- Every message timestamped and audit-logged
- Manager can read the full thread before approving — full context, zero surprises
- Export as PDF — one click, full conversation for compliance teams

---

### ✅ Hold-to-Approve — Friction by Design

For orders above ₹1 lakh, a standard button click isn't enough.

```
  [  ✓  APPROVE  →  ]
         ↓
  Hold mouse/finger down...
         ↓
  Circular SVG ring fills over 1.5 seconds
         ↓
  Release early → ring resets + button wobbles
         ↓
  Complete → PO auto-created + thread locked + officer notified
```

This mechanic exists because high-value decisions deserve deliberate action, not accidental clicks.

---

### 📈 Savings Tracker — The ROI Moment

```
VENDORA HAS SAVED YOUR ORGANIZATION

  ₹8,23,450  ← this number counts up from ₹0 over 2 seconds

THIS YEAR — through competitive procurement
```

**How savings are calculated:**
```
For each completed PO:
  savings = highest quote received − actual PO value

Example: Sharma quoted ₹1,12,500. You chose Global at ₹95,000.
         Savings = ₹17,500 on that single order.
```

---

### 🏥 Procurement Health Score — Admin's Control Room

```
         PROCUREMENT HEALTH SCORE
                  87
               ────────
               HEALTHY

RFQ COMPETITION RATE   ████████░░  82%   (% RFQs with 3+ quotes)
APPROVAL SPEED         ███████░░░  74%   (avg approval < 24h)
DELIVERY COMPLIANCE    █████████░  91%   (POs delivered on time)
VENDOR RESPONSIVENESS  ████████░░  85%   (vendors responding in time)

"Your procurement is healthy. Approval speed needs attention."
```

---

### ⚡ Live Activity Feed — Proof It's Real

```
LIVE ACTIVITY  ●

● 2m    Mehta Industries submitted quote for RFQ #2847
● 15m   Manager approved PO #1203 — ₹38,000
● 1h    New vendor: Sharma Traders registered
● 2h    Invoice #INV-089 emailed to Global Supplies
```

Powered by Supabase Realtime — new events slide in from the top without a single page refresh.

---

### 🧾 GST-Compliant Invoice Generation

```
                              TAX INVOICE
                              INV-2025-089
                              Date: Oct 12, 2025
Bill To:
Mehta Industries Pvt. Ltd.
GSTIN: 27YYYYY

ITEM                    QTY    RATE       AMOUNT
────────────────────────────────────────────────
Industrial Bearings     250    ₹380      ₹95,000

Subtotal:                                ₹95,000
CGST 9%:                                  ₹8,550
SGST 9%:                                  ₹8,550
────────────────────────────────────────────────
TOTAL:                                 ₹1,12,100
```

Toggle between CGST+SGST (intra-state) and IGST (inter-state). Download as PDF, print, or email directly to the vendor — all from one screen.

---

## 🛠️ Tech Stack

<div align="center">

| Layer | Technology | Purpose |
|---|---|---|
| ![React](https://img.shields.io/badge/-React_18-20232A?style=flat-square&logo=react&logoColor=61DAFB) | React 18 + Vite 5 + TypeScript | Frontend framework |
| ![Tailwind](https://img.shields.io/badge/-Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white) | Tailwind CSS 3 | Utility-first styling |
| ![Framer](https://img.shields.io/badge/-Framer_Motion-0055FF?style=flat-square&logo=framer&logoColor=white) | Framer Motion | Animations & micro-interactions |
| ![Recharts](https://img.shields.io/badge/-Recharts-FF6384?style=flat-square) | Recharts | Analytics charts |
| ![FastAPI](https://img.shields.io/badge/-FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white) | FastAPI + Python 3.11 | Backend framework |
| ![Supabase](https://img.shields.io/badge/-Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white) | Supabase | DB + Realtime + Auth + Storage |
| ![WeasyPrint](https://img.shields.io/badge/-WeasyPrint-4B8BBE?style=flat-square) | WeasyPrint + Jinja2 | Server-side PDF generation |
| ![Resend](https://img.shields.io/badge/-Resend-000000?style=flat-square) | Resend SDK | Transactional emails |

</div>

---

## 💾 Database — 16 Tables

```
profiles          → All users (officer, vendor, manager, admin)
vendors           → Vendor registry with trust scores
rfqs              → Request for Quotation headers
rfq_items         → Line items per RFQ
rfq_attachments   → Uploaded files per RFQ
rfq_vendors       → Which vendors are invited to which RFQ
quotations        → Vendor quotes with totals
quotation_items   → Per-item pricing from vendors
approvals         → Manager approval records
purchase_orders   → Generated POs post-approval
invoices          → GST-compliant invoices
negotiation_threads   → One thread per (RFQ × vendor) pair
negotiation_messages  → All messages, including system events
activity_logs     → Every action, every user, timestamped
notifications     → Per-user notification queue
saved_addresses   → Company delivery address book
```

---

## 📡 API Overview

```
/api/auth/           → Login, signup, JWT verification
/api/rfqs/           → Create, send, track RFQs
/api/quotations/     → Submit, revise, select vendor quotes
/api/approvals/      → Approve (with PO auto-creation) or reject
/api/purchase-orders/→ Generate, track, download PO PDFs
/api/invoices/       → Create, download, email GST invoices
/api/threads/        → Negotiation messages, lock, export PDF
/api/analytics/      → KPIs, health score, savings, funnel, heatmap
/api/notifications/  → User notification feeds
/api/vendors/        → Vendor registry, trust scores, performance
```

---

## ⚡ Quick Start

> [!WARNING]
> Make sure you have **Node.js 18+**, **Python 3.11+**, a **Supabase** account, and a **Resend** account before proceeding. All free tiers work.

**1️⃣ Clone the Repository**
```bash
git clone https://github.com/your-team/vendora.git
cd vendora
```

**2️⃣ Backend Setup**
```bash
cd vendora-backend
pip install -r requirements.txt
cp .env.example .env        # Fill in: SUPABASE_URL, SUPABASE_SERVICE_KEY, RESEND_API_KEY
python seed.py              # Seeds demo data
uvicorn main:app --reload --port 8000
```

**3️⃣ Frontend Setup**
```bash
cd vendora-frontend
npm install
cp .env.example .env        # Fill in: VITE_API_URL, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
npm run dev                 # → http://localhost:5173
```

**4️⃣ Login and Explore**
```
http://localhost:5173/login

officer@vendora.com   → Full procurement workflow
vendor@vendora.com    → Quote submission + negotiations
manager@vendora.com   → Approval queue + analytics
admin@vendora.com     → Health score + reports
```

---

## 🗺️ Roadmap

**✅ Phase 1 — Hackathon Build (Complete)**
- [x] Role-based access (4 roles, 4 worlds)
- [x] Complete RFQ → Quote → Compare → Approve → PO → Invoice flow
- [x] Bloomberg-style comparison table with weighted decision engine
- [x] Negotiation thread with audit trail and thread locking
- [x] Hold-to-approve mechanic for high-value orders
- [x] Savings tracker with animated counter
- [x] Procurement Health Score gauge
- [x] Live activity feed via Supabase Realtime
- [x] GST-compliant invoice PDF generation
- [x] Email invoice via Resend integration

**🔄 Phase 2 — Post-Hackathon**
- [ ] AI Quote Analyser — one-paragraph vendor summary auto-generated
- [ ] Price Benchmarking — "Last time you bought this, you paid ₹420/unit"
- [ ] Repeat Order — one click to re-issue a past PO
- [ ] Vendor Blacklist with reason log
- [ ] Budget vs Actual tracker per category

**💡 Phase 3 — Production Scale**
- [ ] Mobile-responsive vendor portal
- [ ] Multi-company / SaaS multi-tenancy
- [ ] ERP integrations (Tally, Zoho)
- [ ] WhatsApp Business API — auto-send RFQ notifications
- [ ] ML-powered vendor shortlisting

---

## 📊 Why Judges Should Pick VENDORA

| What We Built | Why It's Different |
|---|---|
| ![](https://img.shields.io/badge/-Bloomberg_Table-1a1a2e?style=flat-square) Bloomberg-style comparison table | No other procurement tool visualizes vendor data this way |
| ![](https://img.shields.io/badge/-Decision_Engine-0d3b2e?style=flat-square) Weighted Decision Engine sliders | Score recalculates live — feels intelligent, not static |
| ![](https://img.shields.io/badge/-Hold_to_Approve-7b2d00?style=flat-square) Hold-to-Approve mechanic | Friction by design — shows we understand real-world risk |
| ![](https://img.shields.io/badge/-Audit_Thread-1a237e?style=flat-square) Negotiation Thread with audit trail | Directly replaces WhatsApp — a real, documented pain point |
| ![](https://img.shields.io/badge/-Thread_Lock-4a0072?style=flat-square) Thread lock after PO | Prevents post-approval renegotiation — a real governance gap |
| ![](https://img.shields.io/badge/-Savings_Tracker-1b5e20?style=flat-square) Savings Tracker counting up | Answers "what's the ROI?" in under 3 seconds |
| ![](https://img.shields.io/badge/-Health_Score-b71c1c?style=flat-square) Procurement Health Score | No other hackathon team will think of this |
| ![](https://img.shields.io/badge/-Live_Feed-e65100?style=flat-square) Live Activity Feed | Supabase Realtime — proof it's a live system, not a mockup |
| ![](https://img.shields.io/badge/-GST_Invoice-006064?style=flat-square) GST-compliant invoices | Actually useful in India — not a generic "invoice" feature |

---

<div align="center">

**VENDORA — Built for Indian SMEs. Designed for production.**

*Procurement, Commanded.*

---

Made with ☕ and too little sleep for a hackathon that matters.

</div>
