-- VENDORA DB SCHEMA

-- 1. profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
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

-- 2. vendors
CREATE TABLE IF NOT EXISTS vendors (
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

-- 3. rfqs
CREATE TABLE IF NOT EXISTS rfqs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_number  TEXT UNIQUE NOT NULL,
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

-- 4. rfq_items
CREATE TABLE IF NOT EXISTS rfq_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id        UUID REFERENCES rfqs(id) ON DELETE CASCADE,
  item_name     TEXT NOT NULL,
  specification TEXT,
  quantity      INT NOT NULL,
  unit          TEXT DEFAULT 'units',
  target_price  FLOAT
);

-- 5. rfq_attachments
CREATE TABLE IF NOT EXISTS rfq_attachments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id      UUID REFERENCES rfqs(id) ON DELETE CASCADE,
  file_name   TEXT NOT NULL,
  file_url    TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. rfq_vendors
CREATE TABLE IF NOT EXISTS rfq_vendors (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id      UUID REFERENCES rfqs(id) ON DELETE CASCADE,
  vendor_id   UUID REFERENCES vendors(id),
  status      TEXT DEFAULT 'invited' CHECK (status IN (
                'invited','submitted','declined','won','lost')),
  invited_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(rfq_id, vendor_id)
);

-- 7. quotations
CREATE TABLE IF NOT EXISTS quotations (
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

-- 8. quotation_items
CREATE TABLE IF NOT EXISTS quotation_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id  UUID REFERENCES quotations(id) ON DELETE CASCADE,
  rfq_item_id   UUID REFERENCES rfq_items(id),
  unit_price    FLOAT NOT NULL,
  total_price   FLOAT NOT NULL,
  availability  TEXT DEFAULT 'in_stock' CHECK (availability IN (
                  'in_stock','on_order','limited'))
);

-- 9. approvals
CREATE TABLE IF NOT EXISTS approvals (
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

-- 10. purchase_orders
CREATE TABLE IF NOT EXISTS purchase_orders (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number             TEXT UNIQUE NOT NULL,
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

-- 11. invoices
CREATE TABLE IF NOT EXISTS invoices (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number    TEXT UNIQUE NOT NULL,
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

-- 12. negotiation_threads
CREATE TABLE IF NOT EXISTS negotiation_threads (
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

-- 13. negotiation_messages
CREATE TABLE IF NOT EXISTS negotiation_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id   UUID REFERENCES negotiation_threads(id) ON DELETE CASCADE,
  sender_id   UUID REFERENCES profiles(id),
  sender_name TEXT NOT NULL,
  sender_role TEXT CHECK (sender_role IN ('officer','vendor','system')),
  content     TEXT NOT NULL,
  is_read     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 14. activity_logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES profiles(id),
  action_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id   UUID,
  description TEXT NOT NULL,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 15. notifications
CREATE TABLE IF NOT EXISTS notifications (
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

-- 16. saved_addresses
CREATE TABLE IF NOT EXISTS saved_addresses (
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

-- RLS Policies Setup

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfq_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfq_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE negotiation_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE negotiation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_addresses ENABLE ROW LEVEL SECURITY;

-- Note: In a hackathon context, we'll open these up for authenticated users to avoid blocking functionality, 
-- but we include the PRD requested policies as examples.
CREATE POLICY "vendor_rfqs" ON rfq_vendors
  FOR SELECT USING (
    vendor_id IN (
      SELECT id FROM vendors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "officer_rfqs" ON rfqs
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('officer','manager','admin')
    )
  );

CREATE POLICY "own_notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "thread_messages" ON negotiation_messages
  FOR SELECT USING (
    thread_id IN (
      SELECT id FROM negotiation_threads
      WHERE officer_id = auth.uid() OR vendor_id IN (
        SELECT id FROM vendors WHERE user_id = auth.uid()
      )
    )
  );

-- Auth Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (new.id, new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'role');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
