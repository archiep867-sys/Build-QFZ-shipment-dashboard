# Implementation Report — Apparel QFZ Shipment Tracker

## 1. Executive summary

A complete local V1 shipment-tracking application was implemented: React/Vite dashboard, Express API, SQLite persistence, cookie-based admin authentication, Excel import/export, and practical responsive UI.

## 2. Requirements implemented

General dashboard (read-only, summary, search, filters, sorting, details and timeline), protected admin dashboard (login, add, inline edit, yellow unsaved state, save/discard, delete confirmation), derived durations/status, SQLite auto-initialization, validation, Excel import/export, environment configuration, README, and this handover report are implemented. No external cloud service is used.

## 3. Architecture

`React frontend → Express API → SQLite database`.

Vite serves the frontend in development and Express serves the built frontend in production. The database lives at `data/shipments.db`.

## 4. Data model

`shipments` contains identifier, SL number, QFZ Ref (unique), packing list, brand, the date/time inputs for each workflow stage, metrology documents received, remarks, and created/updated timestamps. Duration and status are derived at API response time, never stored as editable values.

## 5. Calculation logic

PL Received → Attestation and PL Received → Dispatched are calculated in a single server utility using local ISO date/time values and elapsed minutes. It produces Days/Hrs/Mins, returns empty when a timestamp is incomplete, and reports invalid reversed values. Weekend/holiday/business-hour exclusion is intentionally not applied.

## 6. Excel analysis

The supplied `Tracker for Aug 2026 - QFZ outbound shipments.xlsx` has one sheet (`Sheet1`) and range `A1:AB152`. It uses a two-row, merged header; shipment data begins on row 3. Core source columns are A–F, H–J, M–N, Q–R, U–V, X–Y and AB. Calculated weekday/duration columns (G, K, L, O, P, S, T, Z and AA) are formulas and are deliberately recalculated by the application instead. Brands are displayed values backed by external `[1]Sheet1` VLOOKUP formulas, so the importer uses the usable cached brand values and does not preserve external dependencies. The workbook also contains mixed time cells (Excel times, `1:30PM`, `6:00PM`) and free-text metrology timestamps such as `04-AUG-26 / 11 : 17 AM`; those source values are retained safely.

## 7. Excel import strategy

The importer uses SheetJS, extracts displayed values, recognizes day-first numeric and month-name dates where unambiguous, recognizes AM/PM times, and does not create external-formula dependencies. Blank fields stay blank. Matching QFZ Refs update rather than duplicate; invalid mandatory rows are reported and not saved.

## 8. Authentication and security

Credentials are environment-configured, compared with bcrypt, and create an HTTP-only, same-site signed JWT cookie. Every mutating API route and import/export is server-authorized. Input validation and SQLite parameter binding guard malformed data and injection.

## 9–10. Workflows

Admins log in, add/edit cells, review yellow unsaved changes, save or discard, delete after confirmation, and import/export Excel. General users search, filter, sort and inspect records without any write capability.

## 11. API

`GET /api/shipments`, `GET /api/shipments/:id`, `POST/PUT/DELETE /api/shipments/:id`, `POST /api/admin/login`, `POST /api/admin/logout`, `GET /api/admin/me`, `POST /api/import`, and `GET /api/export`.

## 12. Testing

The live Vite frontend and Express API were started together with `npm run dev` and opened successfully at `http://localhost:5173`. The General Dashboard was verified with the real records: 147 total, 140 dispatched and 7 in progress. Status filtering and the shipment detail timeline were exercised in the live UI. Admin login was exercised in the live UI; the server-side unauthenticated write protection, create/update/delete flow, duration examples, and Excel export were tested through the API. A temporary test record was removed afterwards, leaving 147 production records. The production build (`npm run build`) passed. The supplied workbook was imported successfully: 147 records were added, then refreshed through the duplicate-safe update path (147 updated, 0 errors). Representative QFZ1074 values and calculated durations were verified against the displayed Excel date/time values.

## 13. Assumptions

- Duration calculations use straightforward elapsed time; weekends, holidays and business hours are included.
- QFZ Ref is unique when present.
- The first worksheet is the shipment sheet unless a future workbook-specific mapping is added.
- A supplied workbook was unavailable, so its exact header hierarchy may require a small mapping adjustment after first import.

## 14. Future enhancements

Cloud deployment, multiple admin roles, audit history, PDF reports, email notifications, and analytics are sensible later extensions, intentionally excluded from V1.

## Security Hardening

The application now uses server-side JWT verification for every admin mutation, HTTP-only same-site cookies (with `Secure` enabled in production), HS256-only token verification, login throttling (8 attempts per IP per 15 minutes), origin validation for state-changing browser requests, 100 KB JSON body limits, and explicit security response headers (CSP, frame denial, MIME sniffing protection, referrer and permissions policies). Input strings are length-limited and control characters removed before parameterized SQLite writes. Excel imports require an `.xlsx` extension, accepted MIME type, ZIP signature, one-file/5 MB limit, bounded workbook dimensions and safe SheetJS parsing. Production can accept `ADMIN_PASSWORD` from the host's encrypted environment settings and hashes it only in memory; a bcrypt `ADMIN_PASSWORD_HASH` remains supported. `.env` remains ignored by Git. Remaining limitation: this is a local application; a production deployment must be served through HTTPS by its hosting/reverse-proxy layer for transport encryption and Secure cookies.

## Railway Deployment Preparation

The application is configured as one Railway web service. `railway.toml` runs the production build and starts the compiled Express server; the server uses Railway's `PORT`, binds to `0.0.0.0`, serves the React build, and provides `/api/health`. `DATABASE_PATH` controls the SQLite location and should be set to `/data/shipments.db` on a Railway persistent volume mounted at `/data`. An empty database seeds once from the included source workbook, preserving the existing 147-record dataset without overwriting later changes. `DEPLOYMENT.md` contains the complete account, volume, environment-variable, domain, verification, redeploy, and backup procedure. A Railway account was not available in this environment, so no remote service or public URL was created.
