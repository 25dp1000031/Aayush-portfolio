-- ════════════════════════════════════════════════════════════════════════════
--  PORTFOLIO SUPABASE SCHEMA
--  Paste this into: Supabase Dashboard → SQL Editor → New Query → Run
-- ════════════════════════════════════════════════════════════════════════════
--
--  ① Run SECTION A  (table creation) on a fresh project.
--  ② Run SECTION B  (RLS + policies) after tables exist.
--  ③ Run SECTION C  (diagnostics) any time to check what's in the DB.
--  ④ Run SECTION D  (migration) ONLY if you had the OLD schema
--     (columns: hero / github / experience / metrics, UUID primary key).
--
-- ════════════════════════════════════════════════════════════════════════════


-- ── SECTION A: Table Creation ────────────────────────────────────────────
-- (Safe to re-run — IF NOT EXISTS prevents errors on existing tables)

-- A1. Single-row JSONB content store
--     The code uses id = 'main_content' (plain text, NOT a UUID).
CREATE TABLE IF NOT EXISTS portfolio_content (
  id              text        PRIMARY KEY,          -- value: 'main_content'
  hero_data       jsonb,                            -- hero section
  skills_data     jsonb,                            -- radar + skill groups
  dsa_data        jsonb,                            -- LeetCode / DSA stats
  metrics_data    jsonb,                            -- dashboard numbers
  github_showcase jsonb,                            -- GitHub pinned repos array
  updated_at      timestamptz DEFAULT now()
);

-- A2. Per-row projects table
CREATE TABLE IF NOT EXISTS portfolio_projects (
  id            text        PRIMARY KEY,            -- slug e.g. 'placement-route'
  display_order integer     DEFAULT 0,              -- controls section order
  name          text,
  tagline       text,
  affiliation   text,
  description   text,
  stack         jsonb,                              -- string[]
  highlights    jsonb,                              -- {icon,color,title,desc}[]
  github        text,
  live          text,
  updated_at    timestamptz DEFAULT now()
);

-- A3. Per-row experience table
CREATE TABLE IF NOT EXISTS portfolio_experience (
  id            text        PRIMARY KEY,            -- slug e.g. 'e1'
  display_order integer     DEFAULT 0,
  company       text,
  role          text,
  period        text,
  location      text,
  bullets       jsonb,                              -- string[]
  tags          jsonb,                              -- string[]
  updated_at    timestamptz DEFAULT now()
);

-- A4. Contact form submissions
CREATE TABLE IF NOT EXISTS contact_messages (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  from_name   text        NOT NULL,
  from_email  text        NOT NULL,
  subject     text,
  message     text        NOT NULL,
  created_at  timestamptz DEFAULT now()
);


-- ── SECTION B: Row-Level Security ────────────────────────────────────────
-- (Drop existing policies first in case you're re-running)

ALTER TABLE portfolio_content    ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_projects   ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages     ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist (idempotent re-run safety)
DROP POLICY IF EXISTS "public_read_content"    ON portfolio_content;
DROP POLICY IF EXISTS "auth_write_content"     ON portfolio_content;
DROP POLICY IF EXISTS "public_read_projects"   ON portfolio_projects;
DROP POLICY IF EXISTS "auth_write_projects"    ON portfolio_projects;
DROP POLICY IF EXISTS "public_read_experience" ON portfolio_experience;
DROP POLICY IF EXISTS "auth_write_experience"  ON portfolio_experience;
DROP POLICY IF EXISTS "public_insert_contact"  ON contact_messages;
DROP POLICY IF EXISTS "auth_read_contact"      ON contact_messages;

-- Portfolio tables: anyone can read, only authenticated users can write
CREATE POLICY "public_read_content"    ON portfolio_content    FOR SELECT USING (true);
CREATE POLICY "auth_write_content"     ON portfolio_content    FOR ALL    USING (auth.role() = 'authenticated');

CREATE POLICY "public_read_projects"   ON portfolio_projects   FOR SELECT USING (true);
CREATE POLICY "auth_write_projects"    ON portfolio_projects   FOR ALL    USING (auth.role() = 'authenticated');

CREATE POLICY "public_read_experience" ON portfolio_experience FOR SELECT USING (true);
CREATE POLICY "auth_write_experience"  ON portfolio_experience FOR ALL    USING (auth.role() = 'authenticated');

-- Contact: anyone can INSERT, only authenticated (admin) can read
CREATE POLICY "public_insert_contact"  ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "auth_read_contact"      ON contact_messages FOR SELECT USING (auth.role() = 'authenticated');


-- ── SECTION C: Diagnostics ───────────────────────────────────────────────
-- Run this any time to see what's in your database and spot issues.

-- C1. Row counts + last-update per table
SELECT
  'portfolio_content'    AS table_name,
  COUNT(*)               AS row_count,
  MAX(updated_at)        AS last_updated
FROM portfolio_content
UNION ALL
SELECT 'portfolio_projects',   COUNT(*), MAX(updated_at) FROM portfolio_projects
UNION ALL
SELECT 'portfolio_experience', COUNT(*), MAX(updated_at) FROM portfolio_experience
UNION ALL
SELECT 'contact_messages',     COUNT(*), MAX(created_at) FROM contact_messages;

-- C2. Inspect the content row (should show id = 'main_content' once committed)
SELECT id,
       hero_data IS NOT NULL       AS has_hero,
       skills_data IS NOT NULL     AS has_skills,
       dsa_data IS NOT NULL        AS has_dsa,
       metrics_data IS NOT NULL    AS has_metrics,
       github_showcase IS NOT NULL AS has_github,
       jsonb_array_length(github_showcase) AS github_count,
       updated_at
FROM portfolio_content;

-- C3. List all projects in display order
SELECT id, display_order, name, tagline, affiliation,
       array_length(ARRAY(SELECT jsonb_array_elements_text(stack)), 1) AS stack_count,
       highlights IS NOT NULL AS has_highlights,
       updated_at
FROM portfolio_projects
ORDER BY display_order;

-- C4. Check RLS policies
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename IN ('portfolio_content','portfolio_projects','portfolio_experience','contact_messages')
ORDER BY tablename, policyname;

-- C5. Verify column names match what the code expects
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('portfolio_content','portfolio_projects','portfolio_experience')
  AND table_schema = 'public'
ORDER BY table_name, ordinal_position;


-- ── SECTION D: Migration from OLD schema ─────────────────────────────────
-- Run this ONLY if you created the old schema (from the .env.example comment).
-- Old schema had: id uuid, columns hero / github / experience / metrics.
-- New schema has: id text = 'main_content', columns hero_data / skills_data / etc.

-- D1. Rename old table out of the way (keeps data safe)
-- ALTER TABLE portfolio_content RENAME TO portfolio_content_old;

-- D2. Create new table (run Section A above first)

-- D3. Migrate data from old → new (adjust column names as needed)
-- INSERT INTO portfolio_content (id, hero_data, metrics_data, updated_at)
-- SELECT
--   'main_content'  AS id,
--   hero            AS hero_data,
--   metrics         AS metrics_data,
--   updated_at
-- FROM portfolio_content_old
-- LIMIT 1;

-- D4. Drop old table once you've verified the new one is correct
-- DROP TABLE IF EXISTS portfolio_content_old;


-- ── SECTION E: Reset / Re-seed ────────────────────────────────────────────
-- ⚠ DANGER: clears all DB data. The app will fall back to local defaults.
-- Use this to start fresh and re-commit from the admin panel.

-- TRUNCATE portfolio_content, portfolio_projects, portfolio_experience RESTART IDENTITY CASCADE;
