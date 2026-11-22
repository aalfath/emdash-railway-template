[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/new/template/emdash-1?utm_medium=integration&utm_source=button&utm_campaign=emdash)

# Deploy and Host EmDash on Railway

[EmDash](https://github.com/emdash-cms/emdash) is an open-source, MIT-licensed CMS written in TypeScript and built on Astro, positioned as a modern successor to WordPress. It has a block editor, media library, taxonomies, menus and widgets, revisions, scheduled publishing, plugins, full-text search and passkey sign-in. This template runs EmDash 1.6.0 with its official Blog starter.

## About Hosting EmDash

This template runs one service: the EmDash site, built from the official Blog starter in EmDash's own repository and served by Node.js 24. Following EmDash's Node.js deployment guide, it uses SQLite. The database, uploaded media and login sessions all live on one Railway volume at `/data`, so they survive redeploys and restarts. EmDash applies its migrations on start.

EmDash normally makes whoever opens the setup wizard first the site's admin. On a new public URL anyone could do that, so this template locks the wizard behind a generated password, `EMDASH_SETUP_PASSWORD`. After setup you sign in with your passkey.

**After deploying:**

1. Open `https://YOUR-DOMAIN/_emdash/admin`.
2. When the browser asks you to sign in, enter any username (for example `admin`) and the `EMDASH_SETUP_PASSWORD` value from the EmDash service's **Variables** tab.
3. Run the wizard: site title, whether to keep the sample content, your name and email, then create a passkey (Touch ID, Windows Hello, a phone or a password manager).

The site starts in staging mode, hidden from search engines, until you make it public in the admin's SEO settings.

**Custom domain:** passkeys are tied to the domain they were created on. If you want a custom domain, add it and set `EMDASH_SITE_URL` to `https://your-domain` **before** you run the wizard, then redeploy.

**Updates:** the template builds from [aalfath/emdash-railway-template](https://github.com/aalfath/emdash-railway-template), with EmDash, Astro and every other dependency pinned in a lockfile and the Node.js image pinned by digest. When a new EmDash version is tested and merged, Railway shows an update notice in your project and you choose when to apply it. Read [CHANGELOG.md](https://github.com/aalfath/emdash-railway-template/blob/main/CHANGELOG.md) first.

## Common Use Cases

* A blog or personal site with posts, pages, categories, tags, RSS and site search
* A small company or project site that non-developers edit in the browser
* A WordPress replacement for people who want TypeScript, Astro themes and passkey logins instead of PHP and passwords

## Dependencies for EmDash Hosting

* A Railway volume at `/data` (included): the SQLite database, uploaded media and login sessions
* A device or password manager that supports passkeys, for the admin login

### Deployment Dependencies

* EmDash source and releases: https://github.com/emdash-cms/emdash/releases
* EmDash documentation: https://docs.emdashcms.com
* Node.js deployment guide: https://docs.emdashcms.com/deployment/nodejs/
* This template's source: https://github.com/aalfath/emdash-railway-template

### Implementation Details

| Variable | What it does |
| --- | --- |
| `EMDASH_SETUP_PASSWORD` | Generated. Locks the setup wizard until the admin account exists. Any username works. |
| `EMDASH_ENCRYPTION_KEY` | Generated in EmDash's `emdash_enc_v1_…` format. Encrypts secrets that plugins store. It isn't in the database, so keep a copy with your backups. |
| `EMDASH_SITE_URL` | The public address, `https://${{RAILWAY_PUBLIC_DOMAIN}}` by default. Change it if you add a custom domain. |
| `PORT` | `8080`. |

* The health check is `/_emdash/api/health`. A crash exits non-zero, so Railway restarts the service.
* The site used about 0.1 GB of RAM in testing, so it runs within a 0.5 GB service.
* Back up the `/data` volume: it holds `emdash.db` (content, users, settings), `uploads/` and `sessions/`.
* Optional features are off until you configure them in the admin or with variables: email (magic links and invitations; outbound SMTP needs Railway's Pro plan), OAuth sign-in (`EMDASH_OAUTH_GITHUB_CLIENT_ID` and similar) and S3 media storage.
* Sandboxed marketplace plugins need EmDash's `workerd` runner, which this template doesn't include.
* To change the theme's code, fork the template repository and edit `app/src`.

## Why Deploy EmDash on Railway?

<!-- Recommended: Keep this section as shown below -->
Railway is a singular platform to deploy your infrastructure stack. Railway will host your infrastructure so you don't have to deal with configuration, while allowing you to vertically and horizontally scale it.

By deploying EmDash on Railway, you are one step closer to supporting a complete full-stack application with minimal burden. Host your servers, databases, AI agents, and more on Railway.
<!-- End recommended section -->
