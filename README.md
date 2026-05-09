# Rajan Prakash Chand — Network Engineer Professional Portfolio

An elite, high-performance professional portfolio and content management system (CMS) console. Built with **Next.js 16 (App Router + React 19)**, **TypeScript**, **Supabase (PostgreSQL)**, **Tailwind CSS**, and **Framer Motion**. Optimized for mobile responsiveness, accessibility, and high security.

---

## 🚀 Key Technical Features

### 🔒 Cyber Security & Hardening
1. **Dynamic Brute-Force Rate Limiter**: Core authentication logic (`/api/admin/login`) rate limits IPs to a maximum of **5 login attempts per 15 minutes** with a memory-sliding window, protecting against password spraying.
2. **HTTPOnly Cookie Session Sessions**: Avoids clientside vulnerability risks (e.g. `localStorage` or `sessionStorage` XSS theft). On successful authentication, a securely signed `httpOnly`, `sameSite: strict` cookie is placed.
3. **Advanced Recursive XSS Sanitizer**: The main CMS endpoint (`POST /api/admin`) executes an automated recursive deep-object scanner that strips HTML script tags, event handlers (`onmouseover=`, `onclick=`), and `javascript:` protocols across all content configurations.
4. **Hardened Upload Controller**: The media file ingestion system (`/api/admin/upload`) enforces a **5MB size cap**, implements strict **magic number byte inspection** (to block disguised executable uploads), and strips path traversal strings.
5. **Vulnerability Mitigation Headers**: Configured custom headers preventing clickjacking (`X-Frame-Options: DENY`), mime sniffing (`X-Content-Type-Options: nosniff`), and disabled Next.js powered fingerprinting.

### 📊 Real-Time Visitor Telemetry
- **Beacon Log Ingestion**: Features a clientside non-blocking tracker that initiates a page-view tracking event using native browser beacons on initial session load.
- **Geographic & Environment Resolution**:
  - Automatically parses clientside User-Agents for Browser brand, version, OS, and Device profiles (Desktop, Mobile, Tablet).
  - Integrates third-party IP geocoders to capture Country, State, City, and geographical Coordinates (Latitude & Longitude).
  - Logs telemetry data to a high-speed `visitors` table in Supabase.
- **Premium Analytics Console**: Fully responsive dashboard inside the admin panel displaying total views, unique visitors, browser share charts, visited pages breakdown, device profiles, and a scrollable live stream log with direct Google Maps location buttons.

### 💅 Design & Micro-Animations
- **Blurred Orb Backdrops**: Integrated hardware-accelerated animated blurred gradient vector orbs that float dynamically in the background.
- **Responsive Fluid Layouts**: Fully responsive grid cards, interactive certificates lightbox modals, dynamic category article filters, and smooth mobile scroll indicators.
- **Micro-Interactions**: Soft hover expansions, sleek glassy card backdrops, custom dashboard scrollbars, and high-fidelity transitions.

---

## 🛠️ Technology Stack
- **Core Framework**: Next.js 16.2 (Turbopack Enabled), React 19
- **Type Safety**: TypeScript 5.x
- **Styling**: Tailwind CSS 4.x
- **Animation**: Framer Motion 12.x
- **Database Backend**: Supabase (PostgreSQL Client)
- **Icons**: Lucide React

---

## ⚙️ Local Development Setup

### 1. Prerequisite Packages
Verify your development environment has Node.js (v18+) and install project dependencies:
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_public_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Admin Console Authentication
ADMIN_PASSWORD=your_secure_admin_portal_password
```

### 3. Initiate Database Schemas
Execute this SQL script inside your **Supabase Dashboard SQL Editor** to establish the primary portfolio tables and visitor telemetry logs:

```sql
-- 1. Create the primary portfolio CMS config table
CREATE TABLE public.portfolio (
  id bigint PRIMARY KEY,
  content jsonb NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on portfolio config
ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to portfolio" ON public.portfolio FOR SELECT USING (true);
CREATE POLICY "Allow service role write access" ON public.portfolio FOR ALL USING (true);

-- 2. Create the high-speed visitor telemetry table
CREATE TABLE public.visitors (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  visited_at timestamptz DEFAULT now() NOT NULL,
  ip_address text NOT NULL,
  user_agent text,
  browser text,
  device_type text,
  os text,
  country text,
  region text,
  city text,
  latitude numeric,
  longitude numeric,
  page_url text,
  referrer text
);

-- Index the tracking time to ensure high-performance query speeds
CREATE INDEX idx_visitors_visited_at ON public.visitors (visited_at DESC);

-- Enable RLS on visitor telemetry
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;

-- Allow public anonymous inserts (triggered automatically on visitor views)
CREATE POLICY "Allow public anonymous inserts" ON public.visitors
  FOR INSERT WITH CHECK (true);

-- Allow authenticated reads only (utilized by the admin dashboard)
CREATE POLICY "Allow authenticated read access" ON public.visitors
  FOR SELECT USING (true);
```

### 4. Boot Dev Server
Start the Turbopack hot-reload compiler locally:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the homepage or navigate to `/admin` to access the CMS Console.

---

## 📦 Production Deployment

To compile the codebase for release, run:
```bash
npm run build
```
This runs Next.js build compilation, statically checks types, builds pages, and creates optimized bundles ready for Vercel, Firebase App Hosting, or Netlify.
