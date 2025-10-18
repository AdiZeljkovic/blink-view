-- ============================================
-- APP STORAGE TABLE - Kompletna SQL Skripta
-- ============================================
-- Ova skripta kreira app_storage tabelu sa svim potrebnim 
-- defaultnim vrijednostima i RLS politikama.
-- ============================================

-- 1. Kreiraj app_storage tabelu (ako ne postoji)
CREATE TABLE IF NOT EXISTS public.app_storage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Kreiraj index za brže pretraživanje po ključu
CREATE INDEX IF NOT EXISTS idx_app_storage_key ON public.app_storage(key);

-- 3. Omogući Row Level Security (RLS)
ALTER TABLE public.app_storage ENABLE ROW LEVEL SECURITY;

-- 4. Kreiraj RLS politike - ALLOW ALL za autentifikovane korisnike
-- Politika za SELECT (čitanje)
CREATE POLICY "Allow all authenticated users to select app_storage"
  ON public.app_storage
  FOR SELECT
  TO authenticated
  USING (true);

-- Politika za INSERT (kreiranje)
CREATE POLICY "Allow all authenticated users to insert app_storage"
  ON public.app_storage
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Politika za UPDATE (ažuriranje)
CREATE POLICY "Allow all authenticated users to update app_storage"
  ON public.app_storage
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Politika za DELETE (brisanje)
CREATE POLICY "Allow all authenticated users to delete app_storage"
  ON public.app_storage
  FOR DELETE
  TO authenticated
  USING (true);

-- 5. Kreiraj funkciju za automatsko ažuriranje updated_at timestampa
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Kreiraj trigger za automatsko ažuriranje updated_at
DROP TRIGGER IF EXISTS update_app_storage_updated_at ON public.app_storage;
CREATE TRIGGER update_app_storage_updated_at
  BEFORE UPDATE ON public.app_storage
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. Popuni tabelu sa defaultnim vrijednostima
-- ============================================

-- POČETNA STRANICA (Index)
-- Task List
INSERT INTO public.app_storage (key, value) 
VALUES ('task-list', '[]'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Quick Notes List
INSERT INTO public.app_storage (key, value) 
VALUES ('quick-notes-list', '[]'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Homelab Apps (sa defaultnim aplikacijama)
INSERT INTO public.app_storage (key, value) 
VALUES ('homelab-apps', '[
  {
    "id": "1",
    "name": "Portainer",
    "url": "https://portainer.io",
    "icon": "container"
  },
  {
    "id": "2",
    "name": "Grafana",
    "url": "https://grafana.com",
    "icon": "chart"
  },
  {
    "id": "3",
    "name": "Proxmox",
    "url": "https://proxmox.com",
    "icon": "server"
  }
]'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Widget Bookmarks (sa defaultnim bookmarksima)
INSERT INTO public.app_storage (key, value) 
VALUES ('widget-bookmarks', '[
  {
    "id": "1",
    "title": "GitHub",
    "url": "https://github.com",
    "category": "Razvoj"
  },
  {
    "id": "2",
    "title": "Stack Overflow",
    "url": "https://stackoverflow.com",
    "category": "Razvoj"
  },
  {
    "id": "3",
    "title": "Figma",
    "url": "https://figma.com",
    "category": "Dizajn"
  }
]'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Calendar Events
INSERT INTO public.app_storage (key, value) 
VALUES ('calendar-events', '[]'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- VIJESTI STRANICA
-- Vijesti RSS Feeds (sa defaultnim feedovima)
INSERT INTO public.app_storage (key, value) 
VALUES ('vijesti-rss-feeds', '[
  {
    "id": "1",
    "name": "BBC",
    "url": "http://feeds.bbci.co.uk/news/rss.xml",
    "type": "news"
  },
  {
    "id": "2",
    "name": "Al Jazeera Balkans",
    "url": "https://balkans.aljazeera.net/rss",
    "type": "news"
  },
  {
    "id": "3",
    "name": "r/worldnews",
    "url": "https://www.reddit.com/r/worldnews.json",
    "type": "reddit"
  }
]'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- TECH STRANICA
-- Tech RSS Feeds (sa defaultnim feedovima)
INSERT INTO public.app_storage (key, value) 
VALUES ('tech-rss-feeds', '[
  {
    "id": "1",
    "name": "TechCrunch",
    "url": "https://techcrunch.com/feed/",
    "type": "news"
  },
  {
    "id": "2",
    "name": "The Verge",
    "url": "https://www.theverge.com/rss/index.xml",
    "type": "news"
  },
  {
    "id": "3",
    "name": "r/technology",
    "url": "https://www.reddit.com/r/technology.json",
    "type": "reddit"
  }
]'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- GAMING STRANICA
-- Gaming RSS Feeds (sa defaultnim feedovima)
INSERT INTO public.app_storage (key, value) 
VALUES ('gaming-rss-feeds', '[
  {
    "id": "1",
    "name": "IGN",
    "url": "https://www.ign.com/feed.xml",
    "type": "news"
  },
  {
    "id": "2",
    "name": "Polygon",
    "url": "https://www.polygon.com/rss/index.xml",
    "type": "news"
  },
  {
    "id": "3",
    "name": "r/gaming",
    "url": "https://www.reddit.com/r/gaming.json",
    "type": "reddit"
  }
]'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- BOARDS STRANICA (Kanban)
-- Kanban Columns (prazno - korisnik će kreirati svoje)
INSERT INTO public.app_storage (key, value) 
VALUES ('kanban-columns', '[]'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Kanban Tasks (prazno - korisnik će kreirati svoje)
INSERT INTO public.app_storage (key, value) 
VALUES ('kanban-tasks', '[]'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- BOOKMARKS STRANICA
-- Bookmarks Data (prazno - korisnik će dodati svoje)
INSERT INTO public.app_storage (key, value) 
VALUES ('bookmarks-data', '[]'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Bookmarks Categories (sa defaultnim kategorijama)
INSERT INTO public.app_storage (key, value) 
VALUES ('bookmarks-categories', '[
  "Razvoj",
  "Dizajn",
  "Marketing",
  "Ostalo"
]'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- FINALNA LISTA SVIH KLJUČEVA U app_storage:
-- ============================================
-- 
-- 1.  task-list               - [] (prazna lista zadataka)
-- 2.  quick-notes-list         - [] (prazne bilješke)
-- 3.  homelab-apps             - [defaultne aplikacije] 
-- 4.  widget-bookmarks         - [defaultni bookmarks]
-- 5.  calendar-events          - [] (prazni eventi)
-- 6.  vijesti-rss-feeds        - [defaultni vijesti feedovi]
-- 7.  tech-rss-feeds           - [defaultni tech feedovi]
-- 8.  gaming-rss-feeds         - [defaultni gaming feedovi]
-- 9.  kanban-columns           - [] (prazne kolone)
-- 10. kanban-tasks             - [] (prazni taskovi)
-- 11. bookmarks-data           - [] (prazni bookmarks)
-- 12. bookmarks-categories     - [defaultne kategorije]
--
-- NAPOMENA: Aplikacija još uvijek koristi localStorage za:
-- - weather-api-key (API ključ za vrijeme)
-- - weather-city (grad za vremensku prognozu)
-- - tech-widget-title (naslov Tech stranice)
-- - gaming-widget-title (naslov Gaming stranice)
-- - vijesti-widget-title (naslov Vijesti stranice)
-- - kalendar-widget-title (naslov Kalendar stranice)
-- - custom_supabase_url (URL custom Supabase instance)
-- - custom_supabase_key (Ključ custom Supabase instance)
-- ============================================

-- KAKO POKRENUTI OVU SKRIPTU:
-- 1. Otvori Supabase Dashboard
-- 2. Idi na "SQL Editor"
-- 3. Kopiraj cijelu skriptu
-- 4. Klikni "Run" da izvršiš sve komande
-- 5. Provjeri da li je tabela kreirana: SELECT * FROM public.app_storage;
