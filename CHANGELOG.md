# Changelog

Railway shows an update notice when this repository's `main` branch changes. Read the entry for the new version before you apply it.

## 1.6.0 (2026-11-22)

- First release: EmDash 1.6.0 (`emdash-cms/emdash` tag `emdash@1.6.0`) with the official Blog starter, Astro 7.3.2, on `node:24.22.3-bookworm-slim` pinned by digest.
- SQLite database, uploaded media and login sessions on the `/data` volume.
- The setup wizard is locked behind the generated `EMDASH_SETUP_PASSWORD` until the admin account exists.
- Deploy on Railway button added to this README.
