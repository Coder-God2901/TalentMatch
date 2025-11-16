# Project Summary — TalentMatch

This document lists, in detail and as separate points, what has been implemented, changed, fixed and integrated in the project so far.

## Project overview
- TalentMatch: AI-assisted recruitment platform (React + Vite frontend, Supabase backend, optional Flask fitment service).
- Purpose: recruiters post jobs, candidates apply, system scores and ranks candidates via fitment model; JD generator utilities included.

## Features implemented (frontend)
- Role-based UI:
  - Recruiter and Job Seeker pages and flows implemented (routes, ProtectedRoute).
- Dashboards:
  - RecruiterDashboard and RecruiterDashboard1 (job management, candidate ranking UI scaffolding).
  - JobSeekerDashboard and JobSeekerDashboard1 (profile power, matches, applications UI, actions).
- Candidate ranking:
  - RankingCandidates1 component integrated to fetch applications + candidate profiles and render ranked lists.
  - Recompute/ranking action wired to optional backend endpoint.
- Job listing & apply flow:
  - Jobs fetched from Supabase; Apply button persists application rows (with optional scoring).
  - UI fallback when scoring backend is unavailable.
- Component library:
  - Reusable UI primitives under src/components/ui (button, card, dialog, avatar, tabs, etc.)
  - Dialog wrappers updated to forward refs (fixes Radix "Function components cannot be given refs" warnings).
- Theme & UX:
  - Theme toggle (dark mode via `.dark`), progress components, badges, avatars, toasts placeholders.
- Supabase integration:
  - supabaseClient used across components to read/write jobs, candidates, applications.
  - Query fixes for PostgREST embedding (explicit relationship names like candidates!applications_candidate_id_fkey).

## Backend / ML / tooling
- Fitment service:
  - Flask app (Fitment_7th Sem - 2/app.py) hosts model scoring endpoints (`/score`, `/rank`).
  - Model training scripts present under train_model (train_attrition_model.py).
  - README for fitment service with install and run instructions (pip requirements, spacy).
- JD generator:
  - jd-backend scripts (generate_jd.js, generate_jd_server.js, run_fitment_rank.js) for JD generation & ranking helpers.
- Supabase schema changes (SQL migrations created and run recommendations given):
  - Added new tables: companies, interviews, offers, notifications, messages, job_views.
  - Extended existing tables: applications (skill_match, cultural_fit, growth_potential, attrition_risk, recruiter_notes, interview fields), candidates (avatar_url, years_of_experience, technical_skills, soft_skills, culture_fit, response_rate, summary, portfolio_url), jobs (department, urgency, employment_type, min/max_experience, remote, views, company_id), profiles/recruiters (user_id, avatar_url, bio, company_id).
  - Indexes added for common query patterns (applications.job_id, jobs.posted_at, candidates email GIN for skills).

## Bugs fixed / integration issues handled
- Replaced Tailwind CDN usage with guidance to install Tailwind as PostCSS plugin (removed CDN from index.html recommended). Addressed installHook warning.
- Resolved PostgREST embedding error (PGRST201) by selecting explicit relationship names when embedding (candidates!applications_candidate_id_fkey).
- Resolved missing-column errors (42703) by removing non-existent columns from selects (e.g., portfolio) or adding SQL migration instructions.
- Fixed Radix/Dialog ref warnings by forwarding refs in dialog wrapper components.
- Replaced static/mocked datasets with dynamic Supabase queries in JobSeekerDashboard1 and RankingCandidates1.
- Made apply flow robust:
  - Only call scoring backend when VITE_FLASK_BASE provided.
  - Fallback to inserting application directly into Supabase if scoring service unreachable (prevents network errors).
- Normalized skills format in frontend (handles arrays, CSV strings, jsonb).
- Added extraction and storage plan to move sub_scores JSON into separate numeric columns (skill_match, cultural_fit, growth_potential, attrition_risk) with SQL migration and Flask endpoint changes.

## Files changed / created (high level)
- Frontend:
  - src/components/JobSeekerDashboard1.tsx — dynamic jobs + apply logic + fallback.
  - src/components/RankingCandidates1.tsx — supabase queries, relationship disambiguation, mapping to UI model.
  - src/components/ui/dialog.tsx — ref-forwarding wrappers for Radix dialog primitives.
  - src/components/RecruiterDashboard1.tsx — recruiter UI scaffold (data fetch wiring recommended).
  - src/lib/supabaseClient.js — used for all DB interactions.
  - index.html — recommended removal of Tailwind CDN script.
- Backend / ML:
  - Fitment_7th Sem - 2/app.py — scoring endpoints integration (changes recommended to persist separate score fields).
  - jd-backend/* — JD generation and fitment runner scripts.
- Database:
  - SQL migration scripts provided (ALTER TABLE / CREATE TABLE statements) for new columns/tables and indexes.

## How data flows (high level)
1. Frontend fetches jobs, candidates, applications from Supabase via REST client (supabase-js).
2. When user applies:
   - If scoring backend configured, frontend POSTs candidate+job payload to Flask `/score` endpoint → receives fitment and breakdown → persists into applications table via Supabase (or backend persists).
   - If scoring backend unavailable, frontend persists application row directly into Supabase (no score).
3. Recruiter dashboard fetches applications joined with candidates (explicit relationship embedding) and shows ranked lists. Recompute button triggers backend `/rank` to update application score columns.

## Remaining suggestions / next steps
- Run the provided SQL migration in Supabase SQL editor to add missing columns/tables.
- Start the Flask scoring service or set VITE_FLASK_BASE to its URL; ensure SUPABASE_SERVICE_ROLE_KEY is provided for server-side upserts if backend handles persistence.
- Replace any remaining mock data with live queries and add pagination for large lists.
- Add server-side validation and auth checks on scoring endpoints.
- Add unit/integration tests for critical flows (apply, rank, recruiter actions).
- Add a LICENSE and update README with deployment steps.

## Commands (dev)
- Install frontend deps: npm install
- Start dev server: npm run dev
- Install tailwind (production): npm install -D tailwindcss postcss autoprefixer && npx tailwindcss init -p
- Run Flask fitment service: python app.py (from Fitment_7th Sem - 2 folder) — ensure virtualenv & pip deps installed
- Run SQL migrations: paste migration SQL into Supabase SQL editor and execute

## Contact / notes
- For any remaining runtime errors, paste the browser console logs and the SQL error text; mapping and fixes were applied incrementally and further small schema mismatches may remain.
