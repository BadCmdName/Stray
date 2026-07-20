# Changelog

All notable changes to the Stray Alley project will be documented in this file.

---

## v1.0.3 - 2026-07-20

### Added
- Live gateway log streaming option to Discord Webhooks.
- Forced connection reconnecting within 1 second on gateway session conflicts or timeouts.
- Dynamic version mismatch alert banners customized for local hosting (`Clone the latest build!`), git forks (`Resync your fork now!`), and direct cloud deployments (`Please manually deploy to the latest commit!`).

---

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

---

## v1.0.0 - 2026-07-18

### Added
- Initial stable release of the self-hosted Stray Alley application.
- Interactive Live Preview Discord profile card layout.
- Low-latency gateway WebSocket client.
- Custom Discord status and Rich Presence (RPC) parameters configurations.
- Custom device spoofing support (Mobile, Desktop, Web, Xbox).
- Zero-dependency local file database configuration (`db.json`).
- Live gateway connection milestones log streaming.
