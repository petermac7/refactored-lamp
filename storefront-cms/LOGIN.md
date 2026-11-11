# Storefront CMS — test login

| | |
|---|---|
| Site | http://localhost:3100 |
| Admin panel | http://localhost:3100/admin |
| Email | `admin@storefront.test` |
| Password | the `SEED_ADMIN_PASSWORD` value in [.env](.env) |

This account exists only in the local SQLite database (`storefront.db`). Change the
password under **Users** in the admin panel before deploying anywhere.

## Run it

```bash
pnpm dev
```

## Where things are in the admin

- **Visual Builder** — `/admin/builder` — drag-and-drop editor (Puck) with Content / Style / Advanced tabs; also the **Open in Visual Builder** button on any page
- **Templates** — `/admin/templates` — start a page or blog post from a pre-made layout
- **Pages / Posts** — block builder with the **Live Preview** toggle (eye icon, top right of the editor)
- **Inbox** — `/admin/inbox` — contact form messages, read/unread, reply, delete
- **Plugins** — `/admin/plugins` — official Payload plugins with copy-paste install prompts
- **Header** (Globals) — brand name, logo, navigation and dropdowns

## Start again from scratch

Stop the dev server, delete `storefront.db` and `public/media`, then run `pnpm seed`.

---

# Production (Vercel)

| | |
|---|---|
| Site | https://storefront-cms.vercel.app |
| Admin panel | https://storefront-cms.vercel.app/admin |
| Visual Builder | https://storefront-cms.vercel.app/admin/builder |
| Email | `admin@storefront.test` |
| Password | the `SEED_ADMIN_PASSWORD` value in [.env.production-admin](.env.production-admin) |

Change this password under **Users** after your first login.

- **Vercel project:** `storefront-cms` (team MundayWay)
- **Database:** Neon Postgres `storefront-cms-db` (connected through Vercel; sets `POSTGRES_URL`)
- **Photos:** Vercel Blob store `storefront-cms-media` (sets `BLOB_READ_WRITE_TOKEN`)
- Local development is unaffected: without those two variables it uses `storefront.db` and `public/media`.

## Deploy again

```bash
pnpm ship
```

One command does everything: it checks whether your collections, blocks or fields changed since the
last deploy, writes a database migration only if they did, then deploys. The Vercel build applies the
migration before the new version goes live. In PowerShell, use `pnpm.cmd ship`.

- `pnpm ship --check` runs the schema check without deploying.
- If you rename or delete a field, the check may ask whether it was renamed or removed. Answer it in the terminal.
- Commit `src/migrations` after a deploy that created a migration.
