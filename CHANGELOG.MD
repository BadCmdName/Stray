# Changelog

All notable changes to the Stray Alley project will be documented in this file.
> [!IMPORTANT]
> **Version Understanding:** Patch Updates: `X.X.**X**` (Bug Fixes), Feature Updates: `X.**X**.X` (New Features), Major Updates: `**X**.X.X` (Breaking / Major Changes).

---

## v1.2.0 - 2026-07-22

### Added
- **Cloud DB Auto-Backup & Recovery:** End-to-end encrypted backup to private `Stray-DB` repository with zero PAT leakage in open-source Alley. Auto-restores user database and WebSocket client connection on free cloud container restarts.
- **30-Second Save & Publish Cooldown:** Enforced a 30-second rate-limit cooldown on save/publish actions across API endpoints and UI dashboard buttons.

### Fixed
- **Container Memory Wipe Recovery:** Automatically pulls cloud backups from `Stray-DB` when container starts and UptimeRobot pings `/api/ping`.



## v1.1.1 - 2026-07-22

### Added
- **Full RPC Activity Types:** Added support for selection of Discord activity types (Playing, Streaming, Listening, Watching, Competing) and custom Stream URLs.

### Fixed
- **RPC Gateway Payload Fix:** Fixed Rich Presence activity type being hardcoded to Playing (`type: 0`) in gateway identify and presence update payloads.



## v1.1.0 - 2026-07-20

### Added
- **Custom Status Rotation:** Rotate dynamically between up to 3 custom statuses (text + emoji) at a customizable interval (in seconds).

### Fixed
- **Waiver & Webhook Repositioning:** Repositioned the Discord Webhook logs integration input into the logs terminal console card.



## v1.0.3 - 2026-07-20

### Added
- Live gateway log streaming option to Discord Webhooks.
- Forced connection reconnecting within 1 second on gateway session conflicts or timeouts.
- Dynamic version mismatch alert banners customized for local hosting (`Clone the latest build!`), git forks (`Resync your fork now!`), and direct cloud deployments (`Please manually deploy to the latest commit!`).



## v1.0.1 - 2026-07-20

### Added
- Complete visual overhaul of the self-hosted Alley dashboard using a cohesive neo-brutalist dark mode theme.
- Context-aware logout dialog showing active token remaining validity countdown or token expiration prompts.
- Persistent liability agreement waiver overlay for first-time dashboard logins.
- Colorized gateway logs for improved readability (Red/Rose for errors, Green/Emerald for ready, Amber/Yellow for gateway handshake).
- Quick link to GitHub issue tracker directly inside gateway connection logs header.
- Added built-in keep-alive ping endpoint (`/api/ping`) and integration guidelines for UptimeRobot to prevent hosting provider idle timeouts.

### Fixed
- Fixed config updates overwriting the termsAccepted database value back to undefined on regular saves.
- Prevented waiver agreement bypass on database/network API connection failures.
- Fixed crashes and styling bugs caused by custom or non-existent Tailwind color stop classes.



## v1.0.0 - 2026-07-18

### Added
- Initial stable release of the self-hosted Stray Alley application.
- Interactive Live Preview Discord profile card layout.
- Low-latency gateway WebSocket client.
- Custom Discord status and Rich Presence (RPC) parameters configurations.
- Custom device spoofing support (Mobile, Desktop, Web, Xbox).
- Zero-dependency local file database configuration (`db.json`).
- Live gateway connection milestones log streaming.
