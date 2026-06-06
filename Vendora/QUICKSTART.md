# VENDORA — Quick Start Guide

## 🚀 Get Started in 30 Seconds

```bash
cd Vendora
npm install
npm run dev
```

Visit **http://localhost:5174/**

## 🔐 Login with Demo Accounts

| Role | Email | What You'll See |
|------|-------|-----------------|
| **Officer** | officer@vendora.com | Complete procurement command center |
| **Vendor** | vendor@vendora.com | RFQ invitations and quote history |
| **Manager** | manager@vendora.com | Approval queue with urgency alerts |
| **Admin** | admin@vendora.com | System health and analytics |

**Password for all:** `demo123`

## ✨ What's Implemented

### 🎨 Premium Design System
- Dark luxury aesthetic (Bloomberg + Linear)
- Amber (#F0A500) as the ONLY accent color
- Three Google Fonts: Bebas Neue, Syne, Space Mono
- Noise texture overlay for premium feel
- Sharp corners, subtle borders

### 🎭 Beautiful Login Page
- Animated VENDORA branding
- Four role selector tiles with auto-fill
- Password visibility toggle
- Smooth Framer Motion animations

### 📊 Four Complete Dashboards

#### Procurement Officer
- 5 KPI cards with count-up animations
- Procurement pipeline (6-stage kanban)
- Live activity feed
- Savings widget (₹8.23L this year)
- Icon navigation rail

#### Vendor
- Trust score badge (87/100)
- Open RFQ invitations
- Quote history timeline
- Negotiation threads preview
- Performance metrics

#### Manager/Approver
- Urgency banner for pending approvals
- Approval queue (3 pending)
- Detailed approval card with vendor comparison
- Approval chain visualization
- Analytics: avg time, approved count, total value

#### Admin
- System health metrics (5 cards)
- Circular health score gauge (87/100)
- Four sub-score progress bars
- User, vendor, and audit panels

## 🎯 Key Features

### Animations
- ✅ Count-up numbers
- ✅ Slide-in activity feed
- ✅ Pulsing status indicators
- ✅ Smooth transitions
- ✅ Progress bar fills

### Design Elements
- ✅ Amber accent used sparingly
- ✅ Professional font hierarchy
- ✅ Custom scrollbars
- ✅ Toast notifications
- ✅ Badge components
- ✅ Card components

## 🏗️ Tech Stack

- React 19.2.6
- Vite 8.0.16
- Tailwind CSS 3.x
- Framer Motion
- React Router DOM 6.x
- Lucide React Icons
- React Hot Toast

## 📁 Project Structure

```
src/
├── pages/
│   ├── Login.jsx              ← Beautiful animated login
│   ├── officer/Dashboard.jsx  ← 3-column command center
│   ├── vendor/Dashboard.jsx   ← Trust score + invitations
│   ├── manager/Dashboard.jsx  ← Approval workflow
│   └── admin/Dashboard.jsx    ← Health metrics
├── context/AuthContext.jsx    ← Auth management
├── lib/hardcodedAuth.js       ← Demo credentials
├── App.jsx                    ← Routing + Protected routes
└── index.css                  ← Tailwind + Custom styles
```

## 🎨 Design Philosophy

### The "Why"
VENDORA should feel like **Bloomberg Terminal meets Linear** — authoritative, premium, and intentional.

### The Rules
1. **Amber is sacred** — Only use #F0A500 for CTAs, active states, key values
2. **Sharp corners** — No rounded cards (max 4px)
3. **Generous whitespace** — Everything breathes
4. **Three fonts, three purposes**:
   - Bebas Neue → Power (headings)
   - Syne → Clarity (UI text)
   - Space Mono → Precision (numbers)

## 🎬 What Judges Will Notice

1. **Login page** — Animated, beautiful, premium (first 10 seconds)
2. **Procurement pipeline** — No other ERP visualizes this way
3. **Health score gauge** — Unique circular animation
4. **Live activity feed** — Feels like a real-time system
5. **Count-up animations** — Professional and engaging
6. **Trust score** — Builds vendor credibility
7. **Urgency banner** — Clear prioritization
8. **Dark luxury** — Looks expensive

## ⚡ Performance Notes

- Vite for instant HMR
- Minimal bundle size (only used dependencies)
- Smooth 60fps animations
- Optimized re-renders with React 19
- No unnecessary effects

## 🚧 Ready for Extension

The codebase is ready for:
- Supabase backend integration
- Real-time subscriptions
- PDF generation (jsPDF ready)
- Charts (Recharts ready)
- More pages from the PRD

## 🎯 Next 5 Features to Build

1. **RFQ Creation** — Smart form with live preview
2. **Quotation Comparison** — Weighted decision engine
3. **Negotiation Thread** — Real-time chat
4. **Purchase Order** — PDF generation
5. **Reports & Analytics** — Recharts visualizations

---

## 💎 Pro Tips

### Customization
- Colors: `tailwind.config.js`
- Fonts: Already loaded in `index.html`
- Animations: `index.css` utilities

### Adding New Pages
1. Create in `src/pages/[role]/`
2. Add route in `App.jsx`
3. Follow the dashboard patterns

### Testing All Roles
Just logout and login with different emails — instant role switching!

---

**VENDORA** — Procurement, Commanded.

🎨 **Design**: Premium dark luxury
⚡ **Tech**: React + Vite + Tailwind
🎭 **UX**: Smooth animations throughout
📊 **Data**: Mock data, ready for backend
