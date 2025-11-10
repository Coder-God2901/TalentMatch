# TalentMatch — TalentAI Recruitment Platform

TalentMatch is an AI-assisted recruitment platform prototype that helps companies post jobs, discover ranked candidates, and accelerate hiring with intelligent match suggestions. This repository contains a React + Vite frontend, UI primitives, integrations with Supabase for authentication and persistence, and several supporting backend scripts for Job Description generation and fitment scoring.

Original design / inspiration: https://www.figma.com/design/W85r4wRbtFNxfZBoG3FW4W/TalentAI-Recruitment-Platform

---

## Key Features

- Role-based authentication (Recruiter / Job Seeker)
- Recruiter dashboard
  - Post and manage jobs
  - Job description generation helper (scripts in `jd-backend/`)
  - View active job postings and analytics
  - View ranked candidate lists and candidate details
  - Candidate ranking & fitment scoring (local scripts / ML assets present)
  - Theme switching (light / dark) with persisted preference
  - Notifications, settings, profile management
- Job seeker flow
  - Browse jobs, apply, and view fitment/ranking
  - Theme switching (light / dark) with persisted preference
  - Notifications, settings, profile management
- Responsive UI built with Tailwind CSS and accessible Radix primitives
- Component library (buttons, dialogs, cards, inputs) with variant system
- Supabase integration for Auth, Database (Postgres), and Storage
- UI animations with Framer Motion and icons via Lucide

---

## Application Flow

1. Landing page — marketing CTAs for both job seekers & recruiters.
2. Sign up / Sign in — choose role (Recruiter or Job Seeker).
3. Recruiter:
   - Redirect to Recruiter Dashboard.
   - Post new jobs via modal form and manage existing postings.
   - View candidate lists, open ranked candidate profiles, run analytics.
4. Job Seeker:
   - Create / update profile and apply to jobs.
   - See fitment score / ranking against posted roles.
5. Shared:
   - Theme toggle affects global root class (`.dark`) for Tailwind dark-mode variants.
   - Profile and account management via Supabase Auth.

---

## Tech Stack

- Frontend
  - React + TypeScript
  - Vite (dev server / build)
  - Tailwind CSS (utility-first styling)
  - Radix UI primitives (accessible components)
  - class-variance-authority (cva) for component variants
  - Framer Motion for animations
  - Lucide React icons
- Backend / Services
  - Supabase (Auth + Postgres + Storage)
  - Local Node scripts: `jd-backend/` (job description and fitment helpers)
  - Python/ML artifacts (fitment model) are present in `Fitment_7th Sem - 2/` (optional integration)
- Tooling
  - npm / Node.js
  - Optional: ESLint / Prettier (project friendly)

---

## Repo Layout (high level)

- src/
  - components/ — UI pages and feature components
  - components/ui/ — button, dialog, card, input primitives (Radix wrappers)
  - pages/recruiter/ — recruiter-specific pages
  - lib/ — supabase client, auth providers
  - styles/ — global styles, Tailwind entry
- jd-backend/ — small node helpers for JD generation & fitment
- Fitment_7th Sem - 2/ — model and scripts for fitment scoring (research artifacts)
- supabase/ — local metadata (project-ref, versions)

---

## Installation & Local Development

1. Clone the repo and change directory:
   - cd c:\Users\akjai\OneDrive\Desktop\Projects\TalentMatch

2. Install dependencies:
   - npm install

3. Configure Supabase environment variables (create `.env` or set in your shell):
   - SUPABASE_URL=<your-supabase-url>
   - SUPABASE_ANON_KEY=<your-supabase-anon-key>

   Update `src/lib/supabaseClient.js` if you use different variable names.

4. Tailwind / PostCSS (production)
   - Remove the CDN script from `index.html` (there is a dev-time warning if the CDN is present).
   - Ensure Tailwind is installed as a PostCSS plugin for production builds:
     - npm install -D tailwindcss postcss autoprefixer
     - npx tailwindcss init -p
   - Verify `postcss.config.js` contains:
     ```js
     export default {
       plugins: {
         tailwindcss: {},
         autoprefixer: {},
       },
     };
     ```

5. Start dev server:
   - npm run dev
   - Open http://localhost:3000

---

## Database / Supabase Notes

Recommended tables (examples used by UI)
- users — profile, role, metadata
- jobs — job postings (title, company, location, salary, skills, posted_at)
- candidates — candidate profiles and skills
- applications — job <-> candidate applications

Adjust SQL schema in Supabase to match UI expectations. The app expects basic `jobs` and `candidates` selects/inserts (see `RecruiterDashboard*.tsx` and `lib/supabaseClient.js`).

---

## UI & Component Notes

- Dialogs: Radix + custom wrapper. Dialog content is portaled and centered. Ensure wrappers forward refs to avoid ref warnings when used with `asChild` or Slot.
- Buttons: `class-variance-authority` + `cn` util to append incoming classNames after generated variants — this allows caller classes (e.g., `!text-white`) to override component defaults.
- Theme toggle: toggles `.dark` on `document.documentElement` and persists choice to localStorage. Tailwind config must use `darkMode: "class"`.

---

## Troubleshooting / Known Issues

- installHook.js warning: remove the <script src="https://cdn.tailwindcss.com"></script> from `index.html` and use Tailwind as a PostCSS plugin for correct production builds.
- Function components cannot be given refs: ensure Radix wrappers (Dialog, Overlay, Trigger, Content, etc.) forward refs — fix is applied in `src/components/ui/dialog.tsx`.
- Dialog centering: If modal appears off-center, ensure Dialog uses a portal and the content is wrapped in a full-screen fixed flex container (no transformed ancestor interfering with `fixed`).
- Candidate skills null errors: normalize `candidate.skills` before calling array/string methods (defensive checks).
- If HMR shows 500 errors on file saves: stop the dev server, run `npm install`, and restart `npm run dev` to clear caching issues.

---

## How to Contribute

- Fork the repo, open a feature branch, and submit a pull request.
- Follow existing code patterns in `src/components/ui/` for new primitives.
- Add tests (if applicable) and keep commits focused and atomic.

---

## Deployment

- Build for production:
  - npm run build
  - Serve `dist/` with your preferred static host (Vercel, Netlify, or a container).
- Ensure Tailwind is built with PostCSS (no CDN) and environment variables for Supabase are set in your deployment platform.

---

## Acknowledgements

- UI design inspiration: TalentAI Figma file
- Radix UI primitives, Tailwind CSS, Supabase, Framer Motion, Lucide icons
- Fitment & JD model assets included as research artifacts (not production-ready out-of-the-box)

---

## License

Specify license (add a LICENSE file). If none is chosen, this repository is provided "as-is" for development and reference.
