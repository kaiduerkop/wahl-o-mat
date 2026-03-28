'use strict';

const express = require('express');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const { mkdirSync, readFileSync } = require('fs');
const { execSync } = require('child_process');

function getVersion() {
  try {
    const { tag, commit } = JSON.parse(readFileSync(path.join(__dirname, 'version.json'), 'utf8'));
    if (commit) return { tag: tag || null, commit, version: tag ? `${tag}+${commit}` : commit };
  } catch {
    try {
      const tag = execSync('git describe --tags --abbrev=0', {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
      }).trim();

      const commit = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
      return { tag, commit, version: `${tag}+${commit}` };
    } catch {
      return { tag: null, commit: null, version: 'unknown' };
    }
  }
}

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'config.sqlite');
const JWT_SECRET =
  process.env.JWT_SECRET || 'change-me-in-production-' + Math.random().toString(36);
const INIT_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

// ── Seed data ─────────────────────────────────────────────────────────────────

const SEED_DATA = {
  title: 'Wahl-O-Mat 2026',
  description: 'Finde heraus, welche Partei am besten zu deinen politischen Ansichten passt.',
  parties: [
    { id: 'cdu', name: 'Christlich Demokratische Union', shortName: 'CDU', color: '#000000' },
    {
      id: 'spd',
      name: 'Sozialdemokratische Partei Deutschlands',
      shortName: 'SPD',
      color: '#E3000F',
    },
    { id: 'grüne', name: 'Bündnis 90/Die Grünen', shortName: 'Grüne', color: '#1AA037' },
    { id: 'fdp', name: 'Freie Demokratische Partei', shortName: 'FDP', color: '#FFED00' },
    { id: 'linke', name: 'Die Linke', shortName: 'Linke', color: '#BE3075' },
  ],
  questions: [
    {
      id: 'q1',
      category: 'Wirtschaft',
      text: 'Der Mindestlohn soll auf 15 Euro pro Stunde erhöht werden.',
      positions: { cdu: -1, spd: 1, grüne: 1, fdp: -1, linke: 1 },
    },
    {
      id: 'q2',
      category: 'Klimaschutz',
      text: 'Deutschland soll bis 2035 vollständig auf erneuerbare Energien umsteigen.',
      positions: { cdu: 0, spd: 1, grüne: 1, fdp: 0, linke: 1 },
    },
    {
      id: 'q3',
      category: 'Finanzen',
      text: 'Die Schuldenbremse im Grundgesetz soll abgeschafft werden.',
      positions: { cdu: -1, spd: 1, grüne: 1, fdp: -1, linke: 1 },
    },
    {
      id: 'q4',
      category: 'Migration',
      text: 'Deutschland soll mehr Geflüchtete aufnehmen als bisher.',
      positions: { cdu: -1, spd: 0, grüne: 1, fdp: 0, linke: 1 },
    },
    {
      id: 'q5',
      category: 'Gesellschaft',
      text: 'Cannabis soll für Erwachsene legal und in Geschäften kaufbar sein.',
      positions: { cdu: -1, spd: 1, grüne: 1, fdp: 1, linke: 1 },
    },
  ],
};

// ── Database ──────────────────────────────────────────────────────────────────

mkdirSync(path.dirname(DB_PATH), { recursive: true });
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS config (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS parties (
    id         TEXT PRIMARY KEY,
    name       TEXT NOT NULL,
    short_name TEXT NOT NULL,
    color      TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS questions (
    id         TEXT PRIMARY KEY,
    text       TEXT NOT NULL,
    category   TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS positions (
    question_id TEXT NOT NULL,
    party_id    TEXT NOT NULL,
    position    INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (question_id, party_id)
  );
  CREATE TABLE IF NOT EXISTS admin_auth (
    id            INTEGER PRIMARY KEY CHECK (id = 1),
    password_hash TEXT NOT NULL
  );
`);

// ── Config helpers ────────────────────────────────────────────────────────────

function readConfig() {
  const meta = db.prepare('SELECT key, value FROM config').all();
  const get = (k) => meta.find((r) => r.key === k)?.value ?? '';

  const parties = db
    .prepare('SELECT id, name, short_name, color FROM parties ORDER BY sort_order')
    .all()
    .map((p) => ({ id: p.id, name: p.name, shortName: p.short_name, color: p.color }));

  const questions = db
    .prepare('SELECT id, text, category FROM questions ORDER BY sort_order')
    .all()
    .map((q) => {
      const rows = db
        .prepare('SELECT party_id, position FROM positions WHERE question_id = ?')
        .all(q.id);
      const positions = {};
      for (const r of rows) positions[r.party_id] = r.position;
      return { id: q.id, text: q.text, category: q.category, positions };
    });

  return { title: get('title'), description: get('description'), parties, questions };
}

const writeConfig = db.transaction((config) => {
  const upsert = db.prepare('INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)');
  upsert.run('title', config.title ?? '');
  upsert.run('description', config.description ?? '');

  db.prepare('DELETE FROM parties').run();
  const insParty = db.prepare(
    'INSERT INTO parties (id, name, short_name, color, sort_order) VALUES (?, ?, ?, ?, ?)',
  );
  (config.parties ?? []).forEach((p, i) => insParty.run(p.id, p.name, p.shortName, p.color, i));

  db.prepare('DELETE FROM positions').run();
  db.prepare('DELETE FROM questions').run();
  const insQ = db.prepare(
    'INSERT INTO questions (id, text, category, sort_order) VALUES (?, ?, ?, ?)',
  );
  const insPos = db.prepare(
    'INSERT INTO positions (question_id, party_id, position) VALUES (?, ?, ?)',
  );
  (config.questions ?? []).forEach((q, i) => {
    insQ.run(q.id, q.text, q.category, i);
    for (const [partyId, pos] of Object.entries(q.positions ?? {})) insPos.run(q.id, partyId, pos);
  });
});

// ── Seed on first run ─────────────────────────────────────────────────────────

const { n } = db.prepare('SELECT COUNT(*) as n FROM parties').get();
if (n === 0) {
  writeConfig(SEED_DATA);
  console.log('Database seeded from defaults.');
}

const authRow = db.prepare('SELECT id FROM admin_auth WHERE id = 1').get();
if (!authRow) {
  const hash = bcrypt.hashSync(INIT_PASSWORD, 12);
  db.prepare('INSERT INTO admin_auth (id, password_hash) VALUES (1, ?)').run(hash);
  console.log(`Admin password initialised (use env ADMIN_PASSWORD to override).`);
}

// ── CORS ──────────────────────────────────────────────────────────────────────

const ALLOWED_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:4200';
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!origin || origin === ALLOWED_ORIGIN) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(express.json({ limit: '1mb' }));

// ── Auth middleware ───────────────────────────────────────────────────────────

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ── Auth routes ───────────────────────────────────────────────────────────────

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const { password } = req.body ?? {};
  if (typeof password !== 'string' || !password) {
    return res.status(400).json({ error: 'Password required' });
  }
  const row = db.prepare('SELECT password_hash FROM admin_auth WHERE id = 1').get();
  if (!row || !bcrypt.compareSync(password, row.password_hash)) {
    return res.status(401).json({ error: 'Invalid password' });
  }
  const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ token });
});

// POST /api/auth/change-password  (requires valid token)
app.post('/api/auth/change-password', requireAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body ?? {};
  if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
    return res.status(400).json({ error: 'currentPassword and newPassword required' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters' });
  }
  const row = db.prepare('SELECT password_hash FROM admin_auth WHERE id = 1').get();
  if (!bcrypt.compareSync(currentPassword, row.password_hash)) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }
  const hash = bcrypt.hashSync(newPassword, 12);
  db.prepare('UPDATE admin_auth SET password_hash = ? WHERE id = 1').run(hash);
  res.json({ ok: true });
});

// ── Config routes (protected) ─────────────────────────────────────────────────

app.get('/api/config', requireAuth, (req, res) => {
  try {
    res.json(readConfig());
  } catch (e) {
    console.error('Read error:', e.message);
    res.status(500).json({ error: 'Failed to read configuration' });
  }
});

app.put('/api/config', requireAuth, (req, res) => {
  const body = req.body;
  if (
    !body ||
    typeof body !== 'object' ||
    typeof body.title !== 'string' ||
    !Array.isArray(body.parties) ||
    !Array.isArray(body.questions)
  ) {
    return res.status(400).json({ error: 'Invalid config structure' });
  }
  try {
    writeConfig(body);
    res.json({ ok: true });
  } catch (e) {
    console.error('Write error:', e.message);
    res.status(500).json({ error: 'Failed to save configuration' });
  }
});

// ── Version route (public) ────────────────────────────────────────────────────

app.get('/api/version', (req, res) => {
  res.json(getVersion());
});

// ── Public config route for the quiz (read-only, no auth) ────────────────────

app.get('/api/public/config', (req, res) => {
  try {
    res.json(readConfig());
  } catch (e) {
    res.status(500).json({ error: 'Failed to read configuration' });
  }
});

app.listen(PORT, () => {
  console.log(`Admin API listening on port ${PORT}`);
  console.log(`Database: ${DB_PATH}`);
});
