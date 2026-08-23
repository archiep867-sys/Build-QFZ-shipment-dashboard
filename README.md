# Apparel QFZ Shipment Tracker

Apparel QFZ Shipment Tracker replaces the August outbound-shipment spreadsheet with a locally run, searchable dashboard. General users have a read-only view; administrators can manage shipment data and import/export Excel workbooks.

## Features

- Read-only General Dashboard with search, status filters, sortable table and shipment timeline.
- Admin login, add/delete records and editable table cells. Changed cells are highlighted yellow until **Save All Changes**.
- Automatic elapsed-time calculations from PL Received to Attestation and to Dispatched.
- Local SQLite database, Excel `.xlsx` import and business-ready Excel export.
- Responsive layout with horizontal table scrolling on small screens.

## Install and run

1. Copy `.env.example` to `.env` and set a strong, unique admin password plus a random session secret of at least 32 characters. Do not commit `.env`. For production, set `ADMIN_PASSWORD_HASH` to a bcrypt hash (rather than `ADMIN_PASSWORD`).
2. Run `npm install`.
3. Run `npm run dev` and open `http://localhost:5173`.

The database is automatically created at `data/shipments.db`. In production, run `npm run build` then `npm start`.

For a public Railway deployment, follow [DEPLOYMENT.md](DEPLOYMENT.md). Railway must mount a persistent volume at `/data`; set `DATABASE_PATH=/data/shipments.db` so shipment changes survive redeployments and restarts.

## Security

Admin operations are protected by a server-side authenticated cookie. In production the application refuses to start with default credentials or a session secret shorter than 32 characters; deploy it behind HTTPS so the Secure cookie setting is effective. Login attempts are limited, state-changing browser requests validate their origin, uploads are limited to safe `.xlsx` files, and API responses never include internal error details.

## Using the dashboard

On the default dashboard, search by QFZ Ref, Packing List, or Brand; use the status filters; click a shipment’s QFZ Ref or Packing List to open its complete detail timeline. It is read-only.

Select **Admin Login** and use the credentials configured in `.env`. Admins can click any source-data cell, edit it, and then select **Save All Changes**. **Discard Changes** restores the downloaded data. Use **+ Add Shipment** to add a row; QFZ Ref, Packing List, and PL Received date are required. Delete asks for confirmation.

## Calculations

Attestation Duration is PL Received date/time → Apply for Attestation date/time. Total Dispatch Duration is PL Received date/time → Dispatched date/time. Missing endpoints display `—`; reversed timestamps are rejected. Durations use elapsed calendar time including weekends and holidays.

## Excel

From the Admin Dashboard choose an `.xlsx` file and **Import Excel**. Existing QFZ Refs update their matching record; new QFZ Refs are added. Export downloads the current data with source fields, durations, and status. A preserved copy of the August workbook is included at `source/Tracker for Aug 2026 - QFZ outbound shipments.xlsx`. Use `npm run import:excel -- "/path/to/file.xlsx"` as a development reminder/entry point; the Admin import is the supported workflow.

## Project layout

- `client/` React/Vite interface
- `server/` Express API, SQLite initialization, authentication, import/export
- `data/` local SQLite database (created on first run)
- `uploads/` transient import files
- `scripts/` developer helpers

## Troubleshooting

- If login fails, check the values in `.env` and restart the server.
- If import reports invalid rows, correct QFZ Ref, Packing List, and PL Received date in the workbook; dates must be recognizable and are normalized to YYYY-MM-DD.
- If port 5173 or 3001 is in use, stop the conflicting process or set `PORT` for the API and update Vite’s proxy if needed.
