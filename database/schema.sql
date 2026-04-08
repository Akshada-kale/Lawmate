-- ============================================================
-- LawMate Database Schema for Supabase (PostgreSQL)
-- Run this entire file in Supabase SQL Editor
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email          TEXT UNIQUE NOT NULL,
  password_hash  TEXT NOT NULL,
  full_name      TEXT NOT NULL,
  phone          TEXT,
  role           TEXT NOT NULL CHECK (role IN ('lawyer','client')),
  bar_reg_id     TEXT,
  firm_name      TEXT,
  experience     TEXT,
  office_address TEXT,
  specializations TEXT[],
  city           TEXT,
  address        TEXT,
  is_approved    BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CASES
CREATE TABLE IF NOT EXISTS cases (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_number        TEXT UNIQUE NOT NULL,
  title              TEXT NOT NULL,
  case_type          TEXT NOT NULL,
  description        TEXT,
  description_simple TEXT,
  court              TEXT,
  priority           TEXT DEFAULT 'medium' CHECK (priority IN ('urgent','high','medium','low')),
  status             TEXT DEFAULT 'filed' CHECK (status IN ('filed','hearing','evidence','judgment','closed')),
  stage_step         INTEGER DEFAULT 1,
  filing_date        DATE,
  next_hearing       DATE,
  lawyer_id          UUID REFERENCES users(id) ON DELETE SET NULL,
  client_id          UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- 3. HEARINGS
CREATE TABLE IF NOT EXISTS hearings (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id      UUID REFERENCES cases(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  hearing_date DATE NOT NULL,
  hearing_time TIME NOT NULL,
  court_room   TEXT,
  status       TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled','completed','postponed')),
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 4. DOCUMENTS
CREATE TABLE IF NOT EXISTS documents (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id     UUID REFERENCES cases(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  doc_type    TEXT NOT NULL,
  file_url    TEXT NOT NULL,
  file_size   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TASKS
CREATE TABLE IF NOT EXISTS tasks (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id     UUID REFERENCES cases(id) ON DELETE CASCADE,
  lawyer_id   UUID REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  due_date    DATE,
  priority    TEXT DEFAULT 'medium' CHECK (priority IN ('high','medium','low')),
  status      TEXT DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 6. FEES
CREATE TABLE IF NOT EXISTS fees (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id     UUID REFERENCES cases(id) ON DELETE CASCADE,
  client_id   UUID REFERENCES users(id) ON DELETE CASCADE,
  lawyer_id   UUID REFERENCES users(id) ON DELETE SET NULL,
  total_fee   NUMERIC(12,2) NOT NULL DEFAULT 0,
  paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  status      TEXT DEFAULT 'pending' CHECK (status IN ('pending','partial','paid')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 7. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  message    TEXT NOT NULL,
  type       TEXT DEFAULT 'info' CHECK (type IN ('info','hearing','document','fee','case')),
  is_read    BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_cases_lawyer  ON cases(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_cases_client  ON cases(client_id);
CREATE INDEX IF NOT EXISTS idx_hearings_case ON hearings(case_id);
CREATE INDEX IF NOT EXISTS idx_docs_case     ON documents(case_id);
CREATE INDEX IF NOT EXISTS idx_tasks_lawyer  ON tasks(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_fees_client   ON fees(client_id);
CREATE INDEX IF NOT EXISTS idx_notif_user    ON notifications(user_id);

-- RLS (backend uses service_role key which bypasses RLS)
ALTER TABLE users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases         ENABLE ROW LEVEL SECURITY;
ALTER TABLE hearings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents     ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks         ENABLE ROW LEVEL SECURITY;
ALTER TABLE fees          ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
