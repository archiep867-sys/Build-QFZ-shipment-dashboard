# Apparel QFZ DC Dispatch Shipment Tracker

Apparel QFZ DC Dispatch Shipment Tracker replaces the August outbound-shipment spreadsheet with a searchable dashboard. General users have a read-only view; administrators can manage shipment data and import/export Excel workbooks.

## Features

- Read-only General Dashboard with search, status filters, sortable table and shipment timeline.
- Server-authenticated admin login with add, edit, delete, Excel import, and Excel export controls.
- Automatic elapsed-time calculations from PL Received to Attestation and to Dispatched.
- Local SQLite database, Excel `.xlsx` import and business-ready Excel export.
- Responsive layout with horizontal table scrolling on small screens.

## Install and run

1. Copy `.env.example` to `.env` and set a strong, unique `ADMIN_PASSWORD`. Optionally set `SESSION_SECRET` to a random value. Do not commit `.env`.
2. Run `npm install`.
3. Run `npm run dev` and open `http://localhost:5173`.

The database is automatically created at `data/shipments.db`. In production, run `npm run build` then `npm start`.

For the public Render deployment, follow [DEPLOYMENT.md](DEPLOYMENT.md). Set `DATABASE_PATH` to a file on Render's persistent disk so shipment changes survive redeployments and restarts.

## Security

Admin operations are protected by a server-side authenticated cookie. In production the application refuses to start with default credentials or a session secret shorter than 32 characters; deploy it behind HTTPS so the Secure cookie setting is effective. Login attempts are limited, state-changing browser requests validate their origin, uploads are limited to safe `.xlsx` files, and API responses never include internal error details.

## Using the dashboard

On the default dashboard, search by QFZ Ref, Packing List, or Brand; use the status filters; click a shipment’s QFZ Ref or Packing List to open its complete detail timeline. It is read-only.

Select **Admin Login** and use the credentials configured in `.env`. Admins can use **+ Add Shipment** to add a row or **Edit** to update an existing row; QFZ Ref, Packing List, and PL Received date are required. Delete asks for confirmation.

## Calculations

Attestation Duration is PL Received date/time → Apply for Attestation date/time. Total Dispatch Duration is PL Received date/time → Dispatched date/time. Missing endpoints display `—`; reversed timestamps are rejected. Durations use elapsed calendar time including weekends and holidays.

## Excel

From the Admin Dashboard select an `.xlsx` file with **Import Excel**, then choose **Upload & Import Data**. Existing QFZ Refs update their matching record; new QFZ Refs are added. Export downloads the current data with source fields, durations, and status. A preserved copy of the August workbook is included at `source/Tracker for Aug 2026 - QFZ outbound shipments.xlsx`. Use `npm run import:excel -- "/path/to/file.xlsx"` as a development reminder/entry point; the Admin import is the supported workflow.

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
