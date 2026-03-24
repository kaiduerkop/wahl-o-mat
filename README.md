[![Release](https://github.com/kaiduerkop/wahl-o-mat/actions/workflows/release.yml/badge.svg?branch=main)](https://github.com/kaiduerkop/wahl-o-mat/actions/workflows/release.yml)

# Wahl-O-Mat

Eine konfigurierbare Wahlentscheidungshilfe (Voting Advice Application) auf Basis von Angular. Nutzer beantworten politische Thesen mit Zustimmung, Neutral oder Ablehnung und erhalten anschließend eine Übersicht, welche Parteien am besten zu ihrer Haltung passen.

> **Datenschutz:** Alle Antworten verbleiben ausschließlich im Browser-Speicher der laufenden Sitzung. Es werden keine persönlichen Daten übertragen oder gespeichert.

---

## Funktionen

- Fragen mit den Optionen **Stimme zu / Neutral / Stimme nicht zu / Überspringen**
- Fortschrittsanzeige während der Abstimmung
- Ergebnisseite mit prozentualem Übereinstimmungswert je Partei, absteigend sortiert
- Vollständig datenbankgetriebener Inhalt (Fragen, Parteien, Positionen) – kein Rebuild nötig
- Passwortgeschützter Admin-Bereich zur Verwaltung von Fragen, Parteien und Positionen
- Passwort- und JWT-basierte Authentifizierung für den Admin-Bereich
- Impressum- und Datenschutzseiten

---

## Tech-Stack

| Schicht   | Technologie                          |
| --------- | ------------------------------------ |
| Frontend  | Angular 21, TypeScript 5.9, SCSS     |
| Tests     | Vitest 4                             |
| Backend   | Node.js 22 + Express 4               |
| Datenbank | SQLite3 (better-sqlite3, WAL-Modus)  |
| Webserver | Nginx (Reverse Proxy + Static Files) |
| Container | Docker / Docker Compose              |

---

## Projektstruktur

```
src/
  app/
    components/
      start/           # Startseite
      question/        # Einzelne Frageanzeige
      results/         # Ergebnisse & Parteiscores
      admin/           # Admin-Dashboard
      admin-login/     # Admin-Login
      footer/          # Globale Fußzeile
      imprint/         # Impressum
      privacy/         # Datenschutzerklärung
    guards/
      auth.guard.ts    # Schützt /admin-Route
    interceptors/
      auth.interceptor.ts  # Fügt JWT-Header zu API-Anfragen hinzu
    models/
      config.model.ts  # Interfaces: Config, Party, Question, Answer, PartyResult
    services/
      config.service.ts  # Lädt Konfiguration von /api/public/config
      answers.service.ts # Verwaltet Antworten & berechnet Scores
      auth.service.ts    # Login / Logout / JWT-Verwaltung
      admin.service.ts   # Admin-API-Zugriffe
server/
  server.js            # Express-Backend mit SQLite-Datenbank
nginx/
  site.conf            # Nginx-Konfiguration
```

---

## Bewertungsalgorithmus

| Nutzerhaltung                   | Parteiposition | Punkte |
| ------------------------------- | -------------- | ------ |
| Gleich                          | Gleich         | 2      |
| Eine Seite neutral              | Beliebig       | 1      |
| Gegensätzlich (z. B. +1 vs. −1) | —              | 0      |

Der Gesamtscore ergibt sich aus `(erreichte Punkte / maximale Punkte) × 100`.

---

## Voraussetzungen

- [Docker](https://docs.docker.com/get-docker/) & Docker Compose  
  **oder**
- Node.js ≥ 22 + npm ≥ 10

---

## Schnellstart mit Docker

```bash
docker compose up --build
```

Die Anwendung ist anschließend unter **http://localhost:4200** erreichbar.

---

## Lokale Entwicklung (ohne Docker)

```bash
# 1. Abhängigkeiten installieren
npm install
cd server && npm install && cd ..

# 2. Backend starten (Port 3000)
node server/server.js

# 3. Frontend-Dev-Server starten (Port 4200, Proxy → 3000)
npm start
```

---

## Verfügbare npm-Skripte (Frontend)

| Skript          | Beschreibung                         |
| --------------- | ------------------------------------ |
| `npm start`     | Dev-Server auf http://localhost:4200 |
| `npm run build` | Produktions-Build nach `dist/`       |
| `npm test`      | Unit-Tests mit Vitest                |
| `npm run watch` | Build im Watch-Modus                 |

---

## API-Endpunkte

| Methode | Pfad                        | Auth | Beschreibung                       |
| ------- | --------------------------- | ---- | ---------------------------------- |
| POST    | `/api/auth/login`           | –    | Passwort → JWT-Token               |
| POST    | `/api/auth/change-password` | ✓    | Admin-Passwort ändern              |
| GET     | `/api/public/config`        | –    | Öffentliche Konfiguration (Quiz)   |
| GET     | `/api/config`               | ✓    | Vollständige Konfiguration (Admin) |
| PUT     | `/api/config`               | ✓    | Konfiguration speichern (Admin)    |

---

## Umgebungsvariablen (Backend)

| Variable         | Standard     | Beschreibung                               |
| ---------------- | ------------ | ------------------------------------------ |
| `ADMIN_PASSWORD` | `admin`      | Initiales Admin-Passwort beim ersten Start |
| `JWT_SECRET`     | _(zufällig)_ | Schlüssel zum Signieren von JWT-Tokens     |
| `PORT`           | `3000`       | Port des Express-Servers                   |

---

## Admin-Bereich

Der Admin-Bereich ist unter `/admin` erreichbar (erfordert Login unter `/admin/login`).

Dort können Fragen, Parteien und Positionen verwaltet werden, ohne die Anwendung neu bauen zu müssen. Änderungen werden sofort wirksam.

---

## Branch-Strategie

| Branch    | Zweck                                                  |
| --------- | ------------------------------------------------------ |
| `main`    | Geschützt; nur Merges aus `develop` (via Pull Request) |
| `develop` | Aktiver Entwicklungs-Branch                            |

---

## Unterstützung

Wenn dir dieses Projekt gefällt, freue ich mich über einen Kaffee! ☕

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://www.buymeacoffee.com/gorgil)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-FF5E5B?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/gorgil2026)

---

## Lizenz

Siehe [LICENSE](LICENSE).
