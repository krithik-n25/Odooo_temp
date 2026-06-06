# VENDORA — Visual Guide

## 🎨 What You'll See When You Run the App

### 1. Login Page (http://localhost:5174/)

**Left Side (50%):**
```
┌─────────────────────────────────────────┐
│                                         │
│    ⭘  [VENDORA Logo - Amber Circle]    │
│                                         │
│                                         │
│        VENDORA.                         │
│        PROCUREMENT,                     │
│        COMMANDED.  [Amber]              │
│                                         │
│    ──────── ◆ ────────                 │
│                                         │
│    "Where every purchase                │
│     decision lives."                    │
│                                         │
└─────────────────────────────────────────┘
```

**Right Side (50%):**
```
┌─────────────────────────────────────────┐
│    SELECT YOUR ROLE                     │
│                                         │
│  ┌──────────┐  ┌──────────┐           │
│  │ 👤       │  │ 🏢       │           │
│  │ PROCURE  │  │ VENDOR   │           │
│  │ OFFICER  │  │          │           │
│  └──────────┘  └──────────┘           │
│                                         │
│  ┌──────────┐  ┌──────────┐           │
│  │ ✓        │  │ ⚙️       │           │
│  │ MANAGER  │  │ ADMIN    │           │
│  │          │  │          │           │
│  └──────────┘  └──────────┘           │
│                                         │
│  EMAIL ADDRESS                          │
│  [___________________________]         │
│                                         │
│  PASSWORD                 👁            │
│  [___________________________]         │
│                                         │
│  [ ENTER VENDORA → ]                   │
│                                         │
│  Demo Credentials:                      │
│  ▸ officer@vendora.com                 │
│  ▸ vendor@vendora.com                  │
│  password: demo123                      │
└─────────────────────────────────────────┘
```

---

### 2. Officer Dashboard

**Layout:**
```
┌─┬──────────────────────────────────────┬────────┐
│🎯│           MAIN CANVAS                │  LIVE  │
│📄│                                      │ PANEL  │
│🏢│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   │        │
│⚖│  │ KPI │ │ KPI │ │ KPI │ │ KPI │   │ ● 2m   │
│🛒│  │  3  │ │  7  │ │14.2L│ │  5  │   │ Quote  │
│📃│  └─────┘ └─────┘ └─────┘ └─────┘   │        │
│💬│                                      │ ● 15m  │
│  │  PROCUREMENT PIPELINE                │ PO     │
│🔔│  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐    │        │
│👤│  │RFQ│ │QUO│ │CMP│ │APR│ │PO │    │ ● 1h   │
│🚪│  │SNT│ │IN │ │   │ │   │ │ISS│    │ Vendor │
│  │  └───┘ └───┘ └───┘ └───┘ └───┘    │        │
│  │                                      │        │
│  │  [+ CREATE RFQ] [VIEW POs] [INV]   │ ₹8.23L │
│  │                                      │ SAVED  │
└─┴──────────────────────────────────────┴────────┘
```

**KPI Cards (Top Row):**
```
┌─────────────────────┐ ┌─────────────────────┐
│ PENDING APPROVALS   │ │ ACTIVE RFQs         │
│                     │ │                     │
│       3             │ │       7             │
│   ⚠ 1 urgent        │ │   2 expiring        │
│ ▓▓▓▓▓▓▓░░░         │ │ ▓▓▓▓▓▓▓░░░         │
└─────────────────────┘ └─────────────────────┘
```

**Pipeline Cards:**
```
RFQ SENT
┌─────────────────────┐
│ Industrial Bearings │ [Amber left border]
│ ₹1.12L              │
│ 🏢 3 vendors        │
│ ⏰ 3d 4h left       │
└─────────────────────┘
```

**Live Activity Feed:**
```
LIVE ACTIVITY  ● (green pulsing)
────────────────────────

● 2m   Mehta Industries 
       submitted quote for 
       RFQ #2847

● 15m  Manager approved 
       PO #1203 — ₹38,000

● 1h   New vendor: Sharma 
       Traders registered

───────────────────────
SAVINGS THIS YEAR
₹8,23,450
+₹45,000 from last PO
[VIEW BREAKDOWN →]
```

---

### 3. Vendor Dashboard

**Layout:**
```
┌──────────────────────────────────────────────────┐
│ VENDORA                           🛡 87/100     │
│ Welcome back, Mehta Industries    [LOGOUT]     │
└──────────────────────────────────────────────────┘

┌────────────────────────┬──────────────────────┐
│ OPEN INVITATIONS  [2]  │  MY QUOTE HISTORY    │
│                        │                      │
│ ┌──────────────────┐  │  #2840  WON ₹95K    │
│ │ RFQ #2847    ⏰3d│  │  #2835  LOST ₹1.12L │
│ │ Industrial       │  │  #2831  PENDING      │
│ │ Bearings         │  │                      │
│ │ [VIEW] [QUOTE→] │  │  ──────────────────  │
│ └──────────────────┘  │                      │
│                        │  NEGOTIATION THREADS │
│ ┌──────────────────┐  │                      │
│ │ RFQ #2851    ⏰5d│  │  💬 RFQ #2847       │
│ │ Safety Equip     │  │  3 unread messages  │
│ │ [VIEW] [QUOTE→] │  │  [OPEN THREAD →]    │
│ └──────────────────┘  │                      │
│                        │  YOUR PERFORMANCE    │
│ ┌──────────────────┐  │  Response: 2h ████  │
│ │ RFQ #2843   DONE │  │  Win Rate: 45% ████ │
│ │ [VIEW QUOTE]     │  │  Orders: 12         │
│ └──────────────────┘  │                      │
└────────────────────────┴──────────────────────┘
```

---

### 4. Manager Dashboard

**Urgency Banner:**
```
┌───────────────────────────────────────────────┐
│ ⚡ 3 APPROVALS WAITING — OLDEST IS 18 HOURS │
│    REVIEW NOW →                              │
└───────────────────────────────────────────────┘
```

**Main Layout:**
```
┌─────────────┬────────────────────────────────┐
│ QUEUE       │  APPROVAL DETAIL               │
│             │                                │
│ ● RFQ #2847 │  RFQ #2847 — IND. BEARINGS    │
│   ₹1.12L    │                               │
│   [18h]     │  SELECTED VENDOR              │
│             │  ┌─────────────────────────┐  │
│ ● RFQ #2851 │  │ Global Supplies  ★★★★★ │  │
│   ₹45K      │  │ ₹1,12,100               │  │
│   [6h]      │  │ 9 days delivery         │  │
│             │  └─────────────────────────┘  │
│ ● RFQ #2856 │                               │
│   ₹8.23L⚠  │  VS LOWEST QUOTE              │
│   [1h]      │  Sharma: ₹95K                 │
│             │  PREMIUM: +₹17,100 (+18%)    │
│             │                               │
│             │  OFFICER NOTE                 │
│             │  "Global never missed         │
│             │   a deadline..."              │
│             │                               │
│             │  APPROVAL CHAIN               │
│             │  ✓ Ramesh (Officer)          │
│             │  ⏰ Priya (You) Pending      │
│             │  ○ Finance Head              │
│             │                               │
│             │  [✗ REJECT]  [✓ APPROVE→]   │
└─────────────┴────────────────────────────────┘
```

---

### 5. Admin Dashboard

**Health Score Gauge:**
```
┌────────────────────────────────────────┐
│                                        │
│            PROCUREMENT                 │
│            HEALTH SCORE                │
│                                        │
│               ████                     │
│             ██    ██                   │
│            ██  87  ██                  │
│            ██      ██                  │
│             ██    ██                   │
│               ████                     │
│                                        │
│             HEALTHY                    │
│                                        │
└────────────────────────────────────────┘

RFQ COMPETITION RATE      ████████░░  82%
APPROVAL SPEED            ███████░░░  74%
DELIVERY COMPLIANCE       █████████░  91%
VENDOR RESPONSIVENESS     ████████░░  85%

"Your procurement is healthy. 
 Approval speed needs attention."
```

**Management Panels:**
```
┌──────────────┬──────────────┬──────────────┐
│ 👥 USERS     │ 🏢 VENDORS   │ 📊 AUDIT     │
│              │              │              │
│ Ramesh Shah  │ Mehta Ind.   │ PO approved  │
│ Officer  ●   │ ★★★★★  12    │ 2m ago       │
│              │              │              │
│ Priya Mehta  │ Sharma Tr.   │ RFQ created  │
│ Manager  ●   │ ★★★☆☆  8     │ 15m ago      │
│              │              │              │
│ Suresh Admin │ Global Sup.  │ Vendor reg.  │
│ Admin    ●   │ ★★★★★  28    │ 1h ago       │
│              │              │              │
│ [VIEW ALL]   │ [VIEW ALL]   │ [VIEW ALL]   │
└──────────────┴──────────────┴──────────────┘
```

---

## 🎨 Design Elements

### Color Usage

**Backgrounds:**
- `#0A0B0F` — Page background (near black)
- `#111318` — Cards, sidebar
- `#1A1D26` — Hover states
- `#21242F` — Nested elements

**Accent (ONLY amber):**
- `#F0A500` — Used for:
  - Active navigation borders
  - Primary buttons
  - KPI values
  - Progress indicators
  - Selected states
  - Key monetary values

**Text:**
- `#E8EAF0` — Primary text (off-white)
- `#4A5066` — Muted labels

**Status:**
- `#10B981` — Success (green)
- `#EF4444` — Danger (red)
- `#F59E0B` — Warning (orange)

### Typography Hierarchy

**Display Text (Bebas Neue):**
```
VENDORA.
PROCUREMENT COMMAND CENTER
```

**Body Text (Syne):**
```
Welcome back, Ramesh Shah
Create & track all purchases
```

**Numbers/Data (Space Mono):**
```
₹1,12,100
87/100
3 DAYS LEFT
```

### Animations

1. **Count-Up:** Numbers animate from 0 to target
2. **Pulse Dot:** Status indicators pulse slowly
3. **Slide-In:** Activity feed items slide from top
4. **Hover Lift:** Cards lift slightly on hover
5. **Progress Fill:** Bars fill from 0% to target

---

## 📱 Responsive Behavior

**Desktop (> 1024px):** Full three-column layout
**Tablet (768-1024px):** Sidebar collapses to icons
**Mobile (< 768px):** Single column, hamburger menu

---

## 🎯 Key Visual Differentiators

### What Makes It Look Premium:

1. **Near-black background** — Not pure black (#0A0B0F)
2. **Noise texture** — Subtle grain overlay
3. **Sharp corners** — Max 4px border-radius
4. **Amber as ONLY accent** — Never overused
5. **Three-font system** — Each with purpose
6. **Generous whitespace** — Never cramped
7. **Subtle borders** — rgba(255,255,255,0.06)
8. **Smooth animations** — 60fps throughout

### Visual Hierarchy:

```
1. Amber accent → Draws attention
2. White text → Primary content
3. Gray text → Secondary info
4. Borders → Subtle separation
5. Background → Fades away
```

---

## 🎬 Animation Timings

- **Count-up:** 2 seconds
- **Slide-in:** 0.3 seconds
- **Pulse:** 2 second loop
- **Hover:** 0.2 seconds
- **Progress fill:** 1-1.5 seconds

---

## 🔥 The "Wow" Moments

1. **Login page loads** → Animated branding + role tiles
2. **Dashboard KPIs** → Numbers count up from zero
3. **Pipeline cards** → Smooth hover effects
4. **Live activity** → New items slide in with pulse
5. **Health gauge** → Circular progress animates
6. **Approval chain** → Visual timeline with icons

---

*This is what judges will see in the first 30 seconds.*
