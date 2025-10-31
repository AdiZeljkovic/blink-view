-- ============================================
-- SUPABASE DATABASE SETUP ZA ADI ZELJKOVIĆ APP
-- ============================================
-- Pokrenite ovu skriptu u vašem Supabase SQL editoru

-- ============================================
-- CRM MODULE TABLES
-- ============================================

-- Clients table
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ime TEXT NOT NULL,
  kompanija TEXT NOT NULL,
  email TEXT NOT NULL,
  telefon TEXT,
  adresa TEXT,
  biljeske TEXT,
  datum_zadnjeg_kontakta TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deals table
CREATE TABLE IF NOT EXISTS public.deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  naziv TEXT NOT NULL,
  vrijednost DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT CHECK (status IN ('novi', 'pregovori', 'ponuda', 'dobijeno', 'izgubljeno')) NOT NULL DEFAULT 'novi',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  broj_fakture TEXT NOT NULL,
  iznos DECIMAL(10,2) NOT NULL DEFAULT 0,
  datum_izdavanja DATE NOT NULL,
  rok_placanja DATE NOT NULL,
  status TEXT CHECK (status IN ('nacrt', 'poslano', 'placeno', 'kasni')) NOT NULL DEFAULT 'nacrt',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  naziv TEXT NOT NULL,
  rok DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Communication entries table
CREATE TABLE IF NOT EXISTS public.communication_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  datum TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  tip TEXT CHECK (tip IN ('email', 'poziv', 'sastanak')) NOT NULL,
  sazetak TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Proposals table
CREATE TABLE IF NOT EXISTS public.proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  naziv TEXT NOT NULL,
  stavke JSONB NOT NULL DEFAULT '[]'::jsonb,
  ukupan_iznos DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT CHECK (status IN ('nacrt', 'poslano', 'prihvaceno', 'odbijeno')) NOT NULL DEFAULT 'nacrt',
  datum_kreiranja DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  naziv TEXT NOT NULL,
  status TEXT CHECK (status IN ('planirano', 'u_toku', 'na_cekanju', 'zavrseno')) NOT NULL DEFAULT 'planirano',
  budzet DECIMAL(10,2) NOT NULL DEFAULT 0,
  rok DATE,
  datum_pocetka DATE NOT NULL DEFAULT CURRENT_DATE,
  utroseni_sati INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project tasks table
CREATE TABLE IF NOT EXISTS public.project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  naziv TEXT NOT NULL,
  opis TEXT,
  rok DATE,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  naziv_usluge TEXT NOT NULL,
  mjesecni_iznos DECIMAL(10,2) NOT NULL DEFAULT 0,
  datum_pocetka DATE NOT NULL,
  dan_naplate INTEGER CHECK (dan_naplate >= 1 AND dan_naplate <= 31) NOT NULL,
  aktivna BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vault entries table
CREATE TABLE IF NOT EXISTS public.vault_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  tip TEXT CHECK (tip IN ('login', 'boja', 'link', 'licenca')) NOT NULL,
  naziv TEXT NOT NULL,
  vrijednost TEXT NOT NULL,
  dodatne_informacije TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Support tickets table
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  opis_problema TEXT NOT NULL,
  prioritet TEXT CHECK (prioritet IN ('nizak', 'srednji', 'visok')) NOT NULL DEFAULT 'srednji',
  status TEXT CHECK (status IN ('otvoren', 'u_radu', 'riješen')) NOT NULL DEFAULT 'otvoren',
  datum_kreiranja TIMESTAMPTZ DEFAULT NOW(),
  datum_rjesavanja TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FINANCE MODULE TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tip TEXT CHECK (tip IN ('prihod', 'rashod')) NOT NULL,
  kategorija TEXT NOT NULL,
  iznos DECIMAL(10,2) NOT NULL,
  datum DATE NOT NULL,
  opis TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BOARDS/KANBAN MODULE TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS public.boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  naziv TEXT NOT NULL,
  boja TEXT DEFAULT '#3b82f6',
  pozicija INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID REFERENCES public.boards(id) ON DELETE CASCADE,
  sadrzaj TEXT NOT NULL,
  pozicija INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CALENDAR MODULE TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  naslov TEXT NOT NULL,
  datum DATE NOT NULL,
  vrijeme TEXT,
  tip TEXT CHECK (tip IN ('zadatak', 'dogadjaj', 'podsjetnik')) NOT NULL DEFAULT 'dogadjaj',
  zavrseno BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BOOKMARKS MODULE TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  naziv TEXT NOT NULL,
  url TEXT NOT NULL,
  kategorija TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.bookmark_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  naziv TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- NOTES MODULE TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sadrzaj TEXT NOT NULL,
  boja TEXT DEFAULT '#fef08a',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- HABITS & GOALS MODULE TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS public.habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  naziv TEXT NOT NULL,
  ciljna_frekvencija INTEGER NOT NULL DEFAULT 7,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.habit_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID REFERENCES public.habits(id) ON DELETE CASCADE,
  datum DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(habit_id, datum)
);

CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  naziv TEXT NOT NULL,
  tip TEXT CHECK (tip IN ('mjesecni_prihod', 'godisnji_prihod', 'broj_klijenata', 'custom')) NOT NULL,
  ciljana_vrijednost DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- HOMELAB APPS MODULE TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS public.homelab_apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  naziv TEXT NOT NULL,
  url TEXT NOT NULL,
  ikona TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RSS FEEDS MODULE TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS public.rss_feeds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  naziv TEXT NOT NULL,
  url TEXT NOT NULL,
  tip TEXT CHECK (tip IN ('vijesti', 'tech', 'gaming')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- NOTIFICATIONS MODULE TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  naslov TEXT NOT NULL,
  poruka TEXT NOT NULL,
  tip TEXT NOT NULL,
  procitano BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SETTINGS MODULE TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kljuc TEXT UNIQUE NOT NULL,
  vrijednost TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vault_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmark_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homelab_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rss_feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES (Allow all for now - can be tightened later with auth)
-- ============================================

CREATE POLICY "Allow all on clients" ON public.clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on deals" ON public.deals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on invoices" ON public.invoices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on tasks" ON public.tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on communication_entries" ON public.communication_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on proposals" ON public.proposals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on projects" ON public.projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on project_tasks" ON public.project_tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on subscriptions" ON public.subscriptions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on vault_entries" ON public.vault_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on support_tickets" ON public.support_tickets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on boards" ON public.boards FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on cards" ON public.cards FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on calendar_events" ON public.calendar_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on bookmarks" ON public.bookmarks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on bookmark_categories" ON public.bookmark_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on notes" ON public.notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on habits" ON public.habits FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on habit_completions" ON public.habit_completions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on goals" ON public.goals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on homelab_apps" ON public.homelab_apps FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on rss_feeds" ON public.rss_feeds FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on app_settings" ON public.app_settings FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- CREATE INDEXES FOR BETTER PERFORMANCE
-- ============================================

-- CRM Indexes
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);
CREATE INDEX IF NOT EXISTS idx_deals_client_id ON public.deals(client_id);
CREATE INDEX IF NOT EXISTS idx_deals_status ON public.deals(status);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON public.invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_tasks_client_id ON public.tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON public.tasks(completed);
CREATE INDEX IF NOT EXISTS idx_communication_entries_client_id ON public.communication_entries(client_id);
CREATE INDEX IF NOT EXISTS idx_proposals_client_id ON public.proposals(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON public.projects(client_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_project_id ON public.project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_client_id ON public.subscriptions(client_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_aktivna ON public.subscriptions(aktivna);
CREATE INDEX IF NOT EXISTS idx_vault_entries_client_id ON public.vault_entries(client_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_client_id ON public.support_tickets(client_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);

-- Other Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_datum ON public.transactions(datum);
CREATE INDEX IF NOT EXISTS idx_transactions_tip ON public.transactions(tip);
CREATE INDEX IF NOT EXISTS idx_cards_board_id ON public.cards(board_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_datum ON public.calendar_events(datum);
CREATE INDEX IF NOT EXISTS idx_bookmarks_kategorija ON public.bookmarks(kategorija);
CREATE INDEX IF NOT EXISTS idx_habit_completions_habit_id ON public.habit_completions(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_completions_datum ON public.habit_completions(datum);
CREATE INDEX IF NOT EXISTS idx_rss_feeds_tip ON public.rss_feeds(tip);
CREATE INDEX IF NOT EXISTS idx_notifications_procitano ON public.notifications(procitano);
