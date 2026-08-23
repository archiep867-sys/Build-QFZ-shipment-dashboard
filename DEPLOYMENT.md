# Deploy Apparel QFZ Shipment Tracker on Railway

This guide creates one normal HTTPS web address that your dad can open from any phone or computer. Your Mac does not need to remain on after deployment.

## Before you start

1. Put this project in a private GitHub repository. Include the `source/Tracker for Aug 2026 - QFZ outbound shipments.xlsx` file, but **do not** include `.env` or `data/shipments.db`.
2. Create or sign in to your Railway account at [railway.app](https://railway.app).

## Create the Railway service

1. In Railway, select **New Project** → **Deploy from GitHub repo**.
2. Authorize GitHub if prompted and select the private Apparel QFZ Shipment Tracker repository.
3. Railway detects `railway.toml`: it will run `npm run build`, then `npm start`, and checks `/api/health`.

## Add persistent storage

1. In the service, choose **Volumes** → **Add Volume**.
2. Set the mount path exactly to `/data`.
3. In **Variables**, add `DATABASE_PATH` with this exact value:

   ```text
   /data/shipments.db
   ```

SQLite then lives on the Railway volume, rather than the temporary application filesystem. Restarts and normal redeployments retain shipment records.

## Add required variables

In the Railway service **Variables** page, set:

```text
ADMIN_USERNAME=your-admin-name
DATABASE_PATH=/data/shipments.db
SEED_WORKBOOK_PATH=source/Tracker for Aug 2026 - QFZ outbound shipments.xlsx
```

`ADMIN_PASSWORD_HASH` and `SESSION_SECRET` are optional. If both are omitted, the app generates a unique admin password and session secret on its first start. The bcrypt hash and secret are saved in its database; only the one-time admin password is written to the server startup log. If you choose to control the password yourself later, set `ADMIN_PASSWORD_HASH`:

```bash
node -e "require('bcryptjs').hash(process.argv[1], 12).then(console.log)" "choose-a-long-unique-password"
```

Generate a session secret locally:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Never commit, email, or paste your real password, bcrypt hash, or session secret into source code.

## First deployment and data import

On its first start with an empty `/data/shipments.db`, the application imports the included source workbook once. It does not seed when the database already has records, so later restarts cannot overwrite edits. Confirm the dashboard shows 147 records after the first successful deployment. If the source workbook was not included in Git, sign in as admin and use **Import Excel** to load it.

## Create the public link

1. Open the service **Settings** → **Networking**.
2. Select **Generate Domain**.
3. Railway supplies an HTTPS address similar to `https://qfz-shipment-tracker-production.up.railway.app`.
4. Open the link yourself, then send that exact HTTPS link to your dad.

The **General Dashboard** works without login. Keep the admin credentials private.

## Verify deployment

Check these after deployment:

1. Open the generated HTTPS domain—the shipment table should load.
2. Visit `https://your-domain/api/health`; it should return `{"ok":true}`.
3. Sign in as admin, make a small update, save it, and refresh the browser.
4. Redeploy once from Railway. The saved edit should still be present, proving the volume is attached correctly.

## Future updates and backups

Push code changes to the connected GitHub branch; Railway redeploys automatically. Do not delete or detach the `/data` volume when redeploying. Before substantial changes, use the admin **Export Excel** function as a business-data backup. For a full SQLite backup, use Railway's service shell to copy `/data/shipments.db` from the volume to a secure local backup location.

## Costs and limits

Railway billing and free-tier availability can change. Review the current Railway pricing page before deployment. A small always-on web service plus persistent volume may incur monthly usage charges.
