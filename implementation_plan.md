# ASTI Website Full Rebuild

Rebuild the entire ASTI website from the existing codebase, bringing every page, feature, and visual element to production quality as specified in [plan.md](file:///run/media/sirin/fedora/home/sirin/User/Workspace/AERO/plan.md).

## Current State Assessment

The existing codebase has:
- ✅ **Server** (`server.js`): Express + SQLite + JWT auth + visitor tracking — fully functional
- ✅ **Database** (`db/schema.sql`): visits + admin_users tables — working
- ✅ **Home page** (`index.html`): Well-structured hero with slide index, story cards, capabilities, quality panel, projects, contact CTA — **good foundation**
- ✅ **WebGPU/WebGL** (`webgpu-particles.js`, `webgl-fallback.js`): Starfield shader with fallback chain — working
- ✅ **CSS** (`global.css`, `home.css`): Dark aerospace theme with design tokens — solid
- ✅ **Admin** (`admin/login.html`, `admin/dashboard.html`): Login + stats dashboard — functional
- ⚠️ **Content pages** (about, services, research, training, projects, certifications, contact): **Skeleton-level** — minified single-line HTML, minimal content, no nav-toggle, missing footers, inconsistent headers
- ❌ **Missing**: `i18n.js`, `data/news.json`, `data/projects.json`, Leaflet maps, contact form, certificate gallery, project timeline, search, page-specific CSS

## Proposed Changes

### 1. Global CSS Enhancement

#### [MODIFY] [global.css](file:///run/media/sirin/fedora/home/sirin/User/Workspace/AERO/public/css/global.css)
- Add Google Fonts import (`Inter`, `Be Vietnam Pro`)
- Add CSS custom properties for page-specific themes (pages CSS)
- Add scroll-reveal animation keyframes
- Add shared `.page-content` layout styles for content pages
- Improve `.info-card` hover effects with glassmorphism
- Add contact form styles
- Add project timeline styles
- Add certificate gallery styles
- Add Leaflet map container styles
- Add search overlay styles
- Add filter/tab UI styles
- Add scroll-to-top button styles

#### [NEW] [pages.css](file:///run/media/sirin/fedora/home/sirin/User/Workspace/AERO/public/css/pages.css)
- Shared styles for all content pages (about, services, research, training, projects, certifications, contact)
- Director profile card
- Org chart section
- Timeline component
- Contact form styles
- Filter bar styles
- Map container
- Certificate gallery grid
- Scroll-reveal animations

---

### 2. Content Pages — Full Rebuild

Each page will be rebuilt as properly formatted HTML with:
- Full header with nav-toggle (mobile menu)
- Meta descriptions for SEO
- Rich, detailed content matching plan.md specifications
- Proper footer with contact info
- Page-specific interactive elements
- Scroll-reveal animations on sections

#### [MODIFY] [about.html](file:///run/media/sirin/fedora/home/sirin/User/Workspace/AERO/public/about.html)
- Organisation overview & history (1996 → 2007 restructure)
- Director profile card: Dr. Nguyễn Văn Lý
- Org chart showing all 7 departments
- Quality slogan highlight section
- Lab locations section (4 locations)

#### [MODIFY] [services.html](file:///run/media/sirin/fedora/home/sirin/User/Workspace/AERO/public/services.html)
- Icon cards for each of the 6 service lines
- LAS-XD 216 lab highlight with ISO badge
- Detailed service descriptions

#### [MODIFY] [research.html](file:///run/media/sirin/fedora/home/sirin/User/Workspace/AERO/public/research.html)
- Filterable article grid (Research · Projects · Training · Events)
- Search bar
- Pagination UI
- Article cards with tags and dates

#### [MODIFY] [training.html](file:///run/media/sirin/fedora/home/sirin/User/Workspace/AERO/public/training.html)
- Course catalogue: aviation professional, construction tech, flight training
- Detailed course cards
- Enrollment contact form

#### [MODIFY] [projects.html](file:///run/media/sirin/fedora/home/sirin/User/Workspace/AERO/public/projects.html)
- Timeline of notable past projects
- Leaflet.js map showing project locations across Vietnam
- Filter by domain (Aviation · Hydro · Roads · Buildings)

#### [MODIFY] [certifications.html](file:///run/media/sirin/fedora/home/sirin/User/Workspace/AERO/public/certifications.html)
- Certificate gallery: ISO 9001, LAS-XD 216, Ministry of Construction
- Legal documents overview
- Detailed certification cards with badge styling

#### [MODIFY] [contact.html](file:///run/media/sirin/fedora/home/sirin/User/Workspace/AERO/public/contact.html)
- Contact form (name, org, email, message)
- Embedded OpenStreetMap via Leaflet.js
- Address / phone / email info block
- All 4 lab locations listed

---

### 3. JavaScript Enhancements

#### [MODIFY] [main.js](file:///run/media/sirin/fedora/home/sirin/User/Workspace/AERO/public/js/main.js)
- Add scroll-reveal observer for `.reveal` elements
- Search overlay toggle
- Carousel auto-advance (5s)
- Active nav link highlighting

#### [NEW] [i18n.js](file:///run/media/sirin/fedora/home/sirin/User/Workspace/AERO/public/js/i18n.js)
- Vietnamese/English language toggle
- Translate `[data-i18n]` elements
- Store preference in `localStorage`

---

### 4. Data Files

#### [NEW] [news.json](file:///run/media/sirin/fedora/home/sirin/User/Workspace/AERO/public/data/news.json)
- Static news/research content for the research page

#### [NEW] [projects.json](file:///run/media/sirin/fedora/home/sirin/User/Workspace/AERO/public/data/projects.json)
- Past projects data with coordinates for Leaflet map

---

### 5. Minor Updates

#### [MODIFY] [index.html](file:///run/media/sirin/fedora/home/sirin/User/Workspace/AERO/public/index.html)
- Add `pages.css` link
- Add `i18n.js` script
- Add search overlay markup
- Add language toggle button in header

#### [MODIFY] [home.css](file:///run/media/sirin/fedora/home/sirin/User/Workspace/AERO/public/css/home.css)
- No major changes — already strong. Minor polish on card hover effects.

#### Server & Admin — No changes needed
- `server.js`, `admin/login.html`, `admin/dashboard.html`, `admin.css`, `schema.sql` are all functional and will remain unchanged.

---

## Open Questions

> [!NOTE]
> **Leaflet.js bundling**: The plan says "no external CDNs at runtime — bundle locally". I will download Leaflet CSS+JS into `public/lib/leaflet/` so it's served from the Express static folder. This requires an `npm` or `curl` fetch during build. Is that acceptable?

> [!NOTE]
> **Chart.js for admin**: The plan mentions Chart.js for admin dashboard pie + line charts, but the current dashboard uses simple HTML bars. Shall I add Chart.js charts, or is the current bar-based dashboard sufficient?

## Verification Plan

### Automated Tests
```bash
cd /run/media/sirin/fedora/home/sirin/User/Workspace/AERO
node server.js &
# Test all pages load
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/about
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/services
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/research
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/training
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/projects
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/certifications
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/contact
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/admin/login
```

### Manual Verification
- Open `http://localhost:3000` in browser to verify:
  - Hero page renders with WebGPU/WebGL starfield
  - All navigation links work with page transitions
  - Content pages have rich, detailed content
  - Mobile responsive at 375px–1440px
  - Leaflet maps render on Projects & Contact pages
  - Contact form submits
  - Admin login → dashboard flow works
  - Language toggle switches VI ↔ EN
