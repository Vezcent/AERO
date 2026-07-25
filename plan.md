Deeploy WebGPU for Aero info 


# ASTI Website — WebGPU Project Plan

> **Viện Khoa học và Công nghệ Hàng không (ASTI)**
> Aviation Science & Technology Institute
> Generated: 2026-07-16

---

## 1. Organisation Profile (collected from Info/)

| Field | Value |
|-------|-------|
| Vietnamese name | Viện Khoa học và Công nghệ Hàng không |
| English name | Aviation Science & Technology Institute |
| Abbreviation | **ASTI** (also AviaSTI) |
| Address | 156/12 Cộng Hòa, Phường Bảy Hiền, Quận Tân Bình, TP. HCM |
| Phone | 028.38426046 |
| Email | vienhangkhong2008@gmail.com |
| Website (current) | vienhangkhong.com |
| Tax code | 0302790160 |
| Working capital | 9,076,800,000 VND |
| Director | Dr. Nguyễn Văn Lý (Tiến sỹ) |
| Quality slogan | **Chất lượng – Hiệu quả – Sáng tạo** (Quality · Efficiency · Innovation) |
| ISO certificate | ISO 9001:2008 (Quacert No. 14893, 28/12/2016) |
| Lab cert | LAS-XD 216 (Ministry of Construction, renewed 2015) |
| Founded | 1996 (restructured and renamed 2007) |

### Core Business Lines
1. Research, experimental production & technology transfer (construction, transport, aviation)
2. Construction materials testing & inspection (LAS-XD 216)
3. Aviation training and professional development
4. **Flight training center**
5. Construction supervision & consulting
6. Bridge/road design with new materials and technologies

### Internal Departments
| Department/Centre | Role |
|---|---|
| Trung tâm nghiên cứu & chuyển giao công nghệ | R&D / Tech Transfer |
| Trung tâm đào tạo & bồi dưỡng nghiệp vụ | Professional Training |
| **Trung tâm huấn luyện bay** | Flight Training |
| Trung tâm tư vấn xây dựng | Construction Consulting |
| Trung tâm thí nghiệm LAS-XD 216 | Certified Testing Lab |
| Phòng hành chính – kế hoạch | Admin & Planning |
| Ban Tài chính – Kế toán | Finance & Accounting |

### Lab Locations
- Main: 156/12 Cộng Hòa, Q. Tân Bình, TP.HCM
- Field 02: Dương Đông, Phú Quốc, Kiên Giang
- Field 03: Mộc Hóa, Long An (border patrol road project)
- Field 04: KCN Quốc phòng Long Bình, Biên Hòa, Đồng Nai

### Notable Past Projects
- Thủy điện Đồng Nai 4 (Bảo Lộc, Lâm Đồng)
- Border patrol roads (Gia Lai, Đồng Tháp, Long An)
- Aircraft apron load testing – A321 (Da Nang Airport A41, 917)
- ĐHQG TP.HCM student dormitory complex
- KCN Quốc Phòng Long Bình industrial zone roads

---

## 2. Visual Identity

### Logo
- Shape: Blue triangle with white aircraft silhouette pointing top-right
- Accent: Purple/navy horizontal stripes below triangle
- Text: Bold red **ASTI** wordmark
- Tone: Professional, aerospace, trust

### UI/UX Inspiration (idea.jpeg)
| Element | Description |
|---------|-------------|
| Background | Deep dark blue-black (space/night-sky aesthetic) |
| Layout | Split hero: large featured image left + news card grid right |
| Navigation | Horizontal top bar — Logo · Nav links · Search icon |
| Left accent | Numbered slide indicator (01–05) with vertical line |
| Content cards | Dark-tinted image thumbnails with overlay title |
| CTAs | "Read more", "Watch the Video", "Share on Facebook" (text links) |
| Social | Facebook · Twitter · LinkedIn icons, bottom-left |
| Typography | Large, bold, white sans-serif headlines; light body text |
| Mood | Scientific, high-tech, dark aerospace — similar to space agency sites |

---

## 3. Technology Stack

### Frontend
| Layer | Choice | Reason |
|-------|--------|--------|
| Core | Vanilla HTML5 + CSS3 + JS (ES2022 modules) | Zero framework overhead, full WebGPU control |
| GPU effects | **WebGPU API** | Hardware-accelerated particle system for hero background |
| Fallback | WebGL 2 canvas | Browser compatibility when WebGPU unavailable |
| Styling | CSS custom properties + CSS Grid/Flexbox | Responsive, maintainable |
| i18n | Custom JS i18n module | Vietnamese / English toggle |

### Backend (local-first)
| Layer | Choice |
|-------|--------|
| Runtime | **Node.js 20 LTS** |
| Server framework | **Express 4** |
| Database | **SQLite 3** (via `better-sqlite3`) |
| Auth (admin) | JWT stored in HttpOnly cookie |
| GeoIP (visitor counter) | `geoip-lite` (offline, no external API) |
| Password hashing | `bcrypt` |

### Dev Tooling
- `nodemon` for hot-reload during development
- Static file serving via `express.static`

---

## 4. Site Architecture

```
/
├── index.html              ← Landing / Hero
├── about.html              ← About ASTI
├── services.html           ← Services & Functions
├── research.html           ← Research & News
├── training.html           ← Training Programmes
├── projects.html           ← Past Projects / Portfolio
├── certifications.html     ← Legal & Certificates
├── contact.html            ← Contact
└── admin/
    ├── login.html          ← Admin login (hidden from public)
    └── dashboard.html      ← Visitor stats (admin only)
```

### Navigation Bar
```
[ASTI logo]   Tin tức & Khám phá | Lĩnh vực | Dịch vụ | Đào tạo | Về chúng tôi   [🔍]
```

---

## 5. Pages & Sections Detail

### 5.1 Hero / Home (`index.html`)
- **WebGPU Particle Background**: aircraft-trail / starfield particle system on fullscreen `<canvas>`
- Hero headline: *"Khoa học – Công nghệ – Hàng không"*
- Sub-headline EN: *"Aviation Science & Technology Institute"*
- Numbered 01–05 editorial indicator and four featured research/service cards
- Right card grid: 4 latest news/research thumbnails with dark overlay titles
- Scrollable landing-page sections: ASTI history, five core capabilities, LAS-XD 216 / ISO 9001:2008 credentials, notable projects, and contact CTA
- CTAs: "Tìm hiểu về ASTI" · "Khám phá dự án"

### 5.2 About (`about.html`)
- Organisation overview, history (1996 → 2007 restructure)
- Director profile card: Dr. Nguyễn Văn Lý
- Org chart (SVG)
- Quality slogan highlight section

### 5.3 Services (`services.html`)
- Icon cards for each service line
- LAS-XD 216 lab highlight with ISO badge

### 5.4 Research & News (`research.html`)
- Filterable article grid (Research · Projects · Training · Events)
- Search bar, pagination

### 5.5 Training (`training.html`)
- Course catalogue: aviation professional, construction tech, flight training
- Enrolment contact form

### 5.6 Projects (`projects.html`)
- Timeline of notable past projects
- Leaflet.js map showing project locations across Vietnam
- Filter by domain (Aviation · Hydro · Roads · Buildings)

### 5.7 Certifications (`certifications.html`)
- Certificate gallery: ISO 9001, LAS-XD 216, Ministry of Construction approvals
- Legal documents overview

### 5.8 Contact (`contact.html`)
- Contact form (name, org, email, message)
- Embedded OpenStreetMap via Leaflet (no Google API key)
- Address / phone / email info block

### 5.9 Admin Dashboard (`admin/`) ⚠️ Admin Only — not linked publicly
- **Login page**: username + password → POST /api/auth/login → JWT HttpOnly cookie
- **Dashboard**: visitor stats panel
  - Total visits: all-time / today / this week / this month
  - Domestic (VN) vs International — count + percentage
  - Country breakdown table for international visitors
  - Chart.js pie chart + time-series line chart
  - Auto-refresh every 30 seconds

---

## 6. Visitor Counter Feature

### How It Works
```
Any page request
  → Express recordVisit() middleware
      → ignore static assets (.css/.js/.png/etc.)
      → ignore known bot user-agents
      → geoip-lite.lookup(req.ip) → { country: 'VN' | 'US' | ... }
      → INSERT INTO visits (ip, country, is_domestic)
  → Admin hits GET /api/admin/stats (JWT required)
      → Aggregated counts returned as JSON
```

### SQLite Schema (`db/schema.sql`)
```sql
CREATE TABLE IF NOT EXISTS visits (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  ip           TEXT,
  country      TEXT,          -- ISO 2-letter code: 'VN', 'US', 'JP' ...
  is_domestic  INTEGER,       -- 1 = Vietnam, 0 = international
  visited_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_users (
  id        INTEGER PRIMARY KEY,
  username  TEXT UNIQUE NOT NULL,
  pw_hash   TEXT NOT NULL     -- bcrypt hash
);

CREATE INDEX IF NOT EXISTS idx_visits_date ON visits(visited_at);
CREATE INDEX IF NOT EXISTS idx_visits_domestic ON visits(is_domestic);
```

### REST API
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | — | Login, set JWT cookie |
| POST | `/api/auth/logout` | JWT | Clear cookie |
| GET | `/api/admin/stats` | JWT | Summary counts |
| GET | `/api/admin/stats/countries` | JWT | Per-country breakdown |

---

## 7. WebGPU Particle System

### Concept
- Fullscreen `<canvas id="gpu-canvas">` behind all hero content (z-index: 0)
- **Compute shader** (WGSL): update 5 000 particle positions each frame
  - Particles simulate aircraft-trail streaks across the dark sky
  - Each particle has: position (vec2), velocity (vec2), age (f32), brightness (f32)
- **Render shader** (WGSL): draw particles as additive-blend point quads
- Colour palette: deep blue `#0a1628` bg, cyan `#00d4ff` trails, white `#ffffff` hotspots
- Performance: scales max particle count to `adapter.limits.maxComputeWorkgroupsPerDimension`

### Fallback Chain
```
navigator.gpu available?   → WebGPU WGSL pipeline        ✓ best
  ↓ No
WebGL2 context available?  → WebGL2 canvas GLSL system   ✓ good
  ↓ No
CSS animation only         → @keyframes star-twinkle      ✓ minimal
```

---

### Implemented VFX Enhancement (2026-07-16)
- Animated full-screen WebGPU fragment shader with a sparse circular starfield and restrained blue/violet atmospheric glow.
- Matching WebGL2 shader and a static CSS background fallback; intrusive radial beams are intentionally excluded.
- Pointer-driven 3D parallax between hero content and story cards, with 3D card hover depth.
- Fade-out / fade-in transition on public-page navigation, with a no-motion path for `prefers-reduced-motion`.

## 8. Colour & Typography Tokens

```css
:root {
  --bg-deep:       #060c17;
  --bg-card:       #0d1a2e;
  --bg-overlay:    rgba(6, 12, 23, 0.72);

  --brand-blue:    #1565c0;   /* ASTI triangle blue */
  --brand-red:     #c62828;   /* ASTI wordmark red */
  --brand-cyan:    #00d4ff;   /* WebGPU glow / accent */
  --brand-purple:  #4a148c;   /* ASTI stripe accent */

  --text-primary:  #e8eaf6;
  --text-secondary:#90a4ae;
  --text-accent:   #00d4ff;

  --font-heading:  'Inter', 'Be Vietnam Pro', sans-serif;
  --font-body:     'Inter', sans-serif;
}
```

---

## 9. Project Directory Structure

```
Aero-Web/
├── plan.md                       ← this file
├── package.json
├── .env                          ← PORT, JWT_SECRET, ADMIN creds (gitignored)
├── server.js                     ← Express entry point
├── db/
│   ├── schema.sql                ← table definitions
│   └── asti.db                   ← auto-created on first run
├── public/                       ← Express static root
│   ├── index.html
│   ├── about.html
│   ├── services.html
│   ├── research.html
│   ├── training.html
│   ├── projects.html
│   ├── certifications.html
│   ├── contact.html
│   ├── css/
│   │   ├── global.css            ← tokens, reset, typography, nav, footer
│   │   ├── hero.css              ← hero + carousel
│   │   └── admin.css             ← admin dashboard styles
│   ├── js/
│   │   ├── main.js               ← page bootstrap, carousel, nav
│   │   ├── webgpu-particles.js   ← WebGPU pipeline
│   │   ├── webgl-fallback.js     ← WebGL2 fallback
│   │   └── i18n.js               ← VI/EN language toggle
│   ├── shaders/
│   │   ├── particles.wgsl        ← compute + render WGSL
│   │   ├── particles.vert        ← WebGL2 vertex shader
│   │   └── particles.frag        ← WebGL2 fragment shader
│   ├── admin/
│   │   ├── login.html
│   │   └── dashboard.html
│   ├── assets/
│   │   ├── logo.png              ← copied from /Aero-Web/logo.png
│   │   └── images/               ← hero + news images
│   └── data/
│       ├── news.json             ← static news content
│       └── projects.json         ← past projects data
└── Info/                         ← source documents (read-only)
```

---

## 10. Local Deployment

### Prerequisites
- Node.js ≥ 20 LTS (`node --version`)
- npm ≥ 10
- WebGPU-capable browser: Chrome 113+, Edge 113+, or Firefox Nightly

### Install & Run
```bash
cd /home/sirin/User/Workspace/Aero-Web
npm install
node server.js
# Open http://localhost:3000
```

### `.env` File
```
PORT=3000
JWT_SECRET=replace_with_strong_random_string
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
```

### First-Run Behaviour
`server.js` detects if `db/asti.db` exists; if not, it runs `db/schema.sql` and creates the default admin user from `.env` credentials automatically.

---

## 11. Implementation Phases

### Phase 1 — Server & Database (Day 1)
- [ ] `npm init` + install: express, better-sqlite3, bcryptjs, jsonwebtoken, geoip-lite, dotenv, nodemon
- [ ] `server.js`: Express static serving, visit-recording middleware, auth routes
- [ ] `db/schema.sql` + auto-init on startup
- [ ] Admin API: `/api/auth/login`, `/api/auth/logout`, `/api/admin/stats`, `/api/admin/stats/countries`

### Phase 2 — Global CSS & Layout (Day 1–2)
- [ ] CSS tokens (`global.css`), reset, responsive typography
- [ ] Navigation bar with ASTI logo + language toggle
- [ ] Footer with contact info + social links

### Phase 3 — Hero Page + WebGPU (Day 2–3)
- [ ] `index.html` hero layout matching idea.jpeg design
- [ ] `webgpu-particles.js`: WGSL compute + render pipeline (aircraft-trail particles)
- [ ] `webgl-fallback.js`: WebGL2 canvas fallback
- [ ] CSS animation CSS-only fallback
- [ ] Slide carousel: numbered 01–05 indicator, auto-advance 5 s

### Phase 4 — Content Pages (Day 3–4)
- [ ] About, Services, Research, Training, Projects, Certifications, Contact pages
- [ ] Populate `news.json` and `projects.json` with ASTI content
- [ ] Leaflet.js map on Projects and Contact pages
- [ ] Certificate / legal document gallery

### Phase 5 — Admin Dashboard (Day 4–5)
- [ ] `admin/login.html` with auth flow
- [ ] `admin/dashboard.html` with Chart.js: pie + line charts
- [ ] Country breakdown table
- [ ] Auto-refresh every 30 s via `setInterval` + fetch

### Phase 6 — Polish & Verification (Day 5)
- [ ] Cross-browser: Chrome, Edge, Firefox Nightly
- [ ] Mobile responsive (375 px → 1440 px)
- [ ] WebGPU → WebGL2 → CSS fallback chain verified
- [ ] Admin flow: login, view stats, logout
- [ ] Visitor counter accuracy (VN IP vs non-VN IP test)
- [ ] Accessibility: aria-labels, keyboard navigation, contrast ratios
- [ ] Performance: LCP < 2.5 s, particles lazy-inited after LCP

---

## 12. Key Constraints & Notes

- **Local-first, no external CDNs at runtime** — bundle Chart.js and Leaflet locally under `public/`
- **geoip-lite** uses an offline MaxMind database — no API key or internet required
- WebGPU canvas initialises **after** the main content loads — must not block LCP
- Admin routes are **never linked** from any public page
- Visitor IP stored for analytics only; country-level aggregation shown in dashboard
- Vietnamese is the **primary** language; English is secondary toggle
- Logo source: `logo.png` in workspace root → copy to `public/assets/logo.png`
- The two image-only PDFs (`_p01.pdf`, `_p02.pdf`) require OCR for full content extraction
