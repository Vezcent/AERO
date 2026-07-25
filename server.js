const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const express = require("express");
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const geoip = require("geoip-lite");
const jwt = require("jsonwebtoken");

dotenv.config();

const root = __dirname;
const port = Number(process.env.PORT || 3000);
const jwtSecret = process.env.JWT_SECRET || "local-development-secret-change-before-production";
const adminUsername = process.env.ADMIN_USERNAME || "admin";
const adminPassword = process.env.ADMIN_PASSWORD || "change-me-before-production";
const dbDirectory = path.join(root, "db");
const databasePath = path.join(dbDirectory, "asti.db");

fs.mkdirSync(dbDirectory, { recursive: true });
const db = new Database(databasePath);
db.pragma("journal_mode = WAL");
db.exec(fs.readFileSync(path.join(dbDirectory, "schema.sql"), "utf8"));

const adminExists = db.prepare("SELECT id FROM admin_users WHERE username = ?").get(adminUsername);
if (!adminExists) {
  db.prepare("INSERT INTO admin_users (username, pw_hash) VALUES (?, ?)")
    .run(adminUsername, bcrypt.hashSync(adminPassword, 12));
}

const app = express();
app.set("trust proxy", 1);
app.use(express.json({ limit: "20kb" }));
app.use(cookieParser());

function isBot(userAgent = "") {
  return /bot|crawler|spider|crawling|lighthouse|headless/i.test(userAgent);
}

function normaliseIp(ip = "") {
  return ip.replace(/^::ffff:/, "").replace(/^::1$/, "127.0.0.1");
}

function visitorId(request, response) {
  let id = request.cookies.asti_visit;
  if (!id || !/^[a-f0-9]{32}$/.test(id)) {
    id = crypto.randomBytes(16).toString("hex");
    response.cookie("asti_visit", id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 365
    });
  }
  return id;
}

app.use((request, response, next) => {
  const isDocumentRequest = request.path === "/" || request.path.endsWith(".html") || !path.extname(request.path);
  if (request.method !== "GET" || request.path.startsWith("/api/") || request.path.startsWith("/admin/") || !isDocumentRequest) {
    return next();
  }
  if (isBot(request.get("user-agent"))) {
    return next();
  }

  const location = geoip.lookup(normaliseIp(request.ip));
  const country = location?.country || "UN";
  db.prepare("INSERT INTO visits (session_id, country, is_domestic) VALUES (?, ?, ?)")
    .run(visitorId(request, response), country, country === "VN" ? 1 : 0);
  next();
});

function requireAdmin(request, response, next) {
  const token = request.cookies.asti_admin;
  if (!token) return response.status(401).json({ error: "Authentication required." });
  try {
    request.admin = jwt.verify(token, jwtSecret);
    return next();
  } catch {
    return response.status(401).json({ error: "Session expired. Please sign in again." });
  }
}

app.post("/api/auth/login", (request, response) => {
  const { username, password } = request.body || {};
  if (typeof username !== "string" || typeof password !== "string") {
    return response.status(400).json({ error: "Username and password are required." });
  }
  const user = db.prepare("SELECT id, username, pw_hash FROM admin_users WHERE username = ?").get(username.trim());
  if (!user || !bcrypt.compareSync(password, user.pw_hash)) {
    return response.status(401).json({ error: "Invalid username or password." });
  }
  const token = jwt.sign({ sub: user.id, username: user.username }, jwtSecret, { expiresIn: "8h" });
  response.cookie("asti_admin", token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 8
  });
  return response.json({ username: user.username });
});

app.post("/api/auth/logout", requireAdmin, (_request, response) => {
  response.clearCookie("asti_admin");
  response.status(204).end();
});

app.get("/api/admin/stats", requireAdmin, (_request, response) => {
  const totals = db.prepare(`
    SELECT
      COUNT(*) AS allTime,
      COUNT(DISTINCT session_id) AS uniqueVisitors,
      SUM(is_domestic) AS domestic,
      SUM(CASE WHEN is_domestic = 0 THEN 1 ELSE 0 END) AS international,
      SUM(CASE WHEN visited_at >= datetime('now', 'localtime', 'start of day') THEN 1 ELSE 0 END) AS today,
      SUM(CASE WHEN visited_at >= datetime('now', '-6 days', 'localtime', 'start of day') THEN 1 ELSE 0 END) AS week,
      SUM(CASE WHEN visited_at >= datetime('now', 'start of month', 'localtime') THEN 1 ELSE 0 END) AS month
    FROM visits
  `).get();
  const trend = db.prepare(`
    SELECT substr(visited_at, 1, 10) AS date, COUNT(*) AS visits
    FROM visits
    WHERE visited_at >= datetime('now', '-6 days')
    GROUP BY date ORDER BY date
  `).all();
  response.json({ totals: Object.fromEntries(Object.entries(totals).map(([key, value]) => [key, value || 0])), trend });
});

app.get("/api/admin/stats/countries", requireAdmin, (_request, response) => {
  const countries = db.prepare(`
    SELECT country, COUNT(*) AS visits
    FROM visits
    WHERE is_domestic = 0
    GROUP BY country
    ORDER BY visits DESC, country ASC
    LIMIT 20
  `).all();
  response.json({ countries });
});

app.use(express.static(path.join(root, "public"), { extensions: ["html"] }));
app.use((_request, response) => response.sendFile(path.join(root, "public", "index.html")));

app.listen(port, () => {
  console.log(`ASTI local site is running at http://localhost:${port}`);
});
