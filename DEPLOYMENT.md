# Deploy Apparel QFZ DC Dispatch Shipment Tracker on Render

## Production architecture

```text
GitHub repository → Render Web Service → https://build-qfz-shipment-dashboard.onrender.com/
```

This is one application, not separate frontend and backend deployments. On Render, the production Express server serves the React files built by Vite and handles every `/api/*` request. Shipment data is stored in SQLite at `DATABASE_PATH`.

## Render service settings

The connected GitHub `main` branch is deployed automatically. The service should use:

```text
Build command: npm run build
Start command: npm start
Health check path: /api/health
```

Render provides `PORT`; do not set it manually in production. The server already listens on that value and on `0.0.0.0`.

## Persistent shipment data

SQLite needs a Render persistent disk. Mount the disk at `/var/data` and set:

```text
DATABASE_PATH=/var/data/shipments.db
```

Without a persistent disk, the service can restart with a new filesystem and administrative changes may not persist. Keep the disk attached when redeploying.

## Render environment variables

Add these through Render's encrypted environment-variable settings. Never commit them or send them in chat.

```text
ADMIN_USERNAME=your-admin-name
ADMIN_PASSWORD=your-strong-admin-password
SESSION_SECRET=long-random-secret
DATABASE_PATH=/var/data/shipments.db
SEED_WORKBOOK_PATH=source/Tracker for Aug 2026 - QFZ outbound shipments.xlsx
```

`SESSION_SECRET` is optional because the application can generate and store one in its SQLite database, but setting it explicitly is preferred for a production service. The built-in default admin credentials are only for local setup; use `ADMIN_PASSWORD` on Render.

## Verify a deployment

1. Open the [live dashboard](https://build-qfz-shipment-dashboard.onrender.com/).
2. Open `/api/health` on the same domain and confirm it returns `{"ok":true}`.
3. Sign in as admin, make a small update, refresh the page, then restart/redeploy the service to confirm the persistent disk is attached.
4. Use the admin Excel export before substantial data changes as a business-data backup.

## Future updates

Push changes to the connected GitHub branch. Render automatically builds and deploys the service. Deployment settings are maintained in Render rather than in a provider-specific repository configuration file.
