# Changelog

All notable changes to the Stray Alley project will be documented in this file.
> [!IMPORTANT]
> **Version Understanding:** Patch Updates: `X.X.**X**` (Bug Fixes), Feature Updates: `X.**X**.X` (New Features), Major Updates: `**X**.X.X` (Breaking / Major Changes).

## v2.3.3 - 2026-07-24

### Added
- **Automatic Custom RPC Reversion:** Configured `questManager` and `daemon` to automatically disable `LIVE-RPC` and restore the user's Custom RPC / status presence as soon as all active quests finish processing.
- **Dynamic Live Preview Elapsed Timer:** Replaced static `1:37 elapsed` mockup string in the dashboard Live Preview card with a real-time live counting timer (`0:01 elapsed`, `0:02 elapsed`...).
- **Default App ID Asset Resolution:** Resolved fallback asset key resolution for official application ID `1527635163591348254` across both Live Preview cards and Gateway payloads.

### Fixed
- **Dynamic Remote Update Notification Banner:** Replaced static version string checks in `/api/status` with dynamic GitHub remote `package.json` version fetching (`isVersionNewer`), ensuring deployed instances trigger amber update notifications whenever a newer release is published on `main`.

## v2.3.2 - 2026-07-24

### Fixed
- **Discord API HTTP 429 Rate Limit Handling:** Integrated explicit `retry_after` backoff handling across `QuestManager` heartbeat and video progress loops, preventing quest progress from getting stuck.
- **Active Gateway Token Verification Fallback:** Added active gateway status verification fallback to `/api/check-token` so temporary 429 rate limits do not mark active client tokens as invalid in the dashboard.
- **Active Quests Cache Fallback:** Cached active quest lists in `/api/quests` to prevent `TOTAL QUESTS` from dropping to 0 during temporary API rate limit spikes.

## v2.3.1 - 2026-07-24

### Fixed
- **Discord API Rate Limit Error Formatting:** Differentiated HTTP 429 rate limit responses from HTTP 401 unauthorized errors in `/api/check-token`, displaying explicit temporary rate limit notices instead of false negative invalid token errors.

## v2.3.0 - 2026-07-24

### Changed
- **Website UI/UX Redesign:** Fully revamped the informational website's design system utilizing a modern 2026 glassmorphic aesthetic.
- **Enhanced Animations:** Added fluid micro-interactions, gradient borders, and animated backgrounds across the website landing pages.

## v2.2.3 - 2026-07-24

### Fixed
- **Real-Time Uncompleted Quests Count Filter:** Updated `fetchQuests()` to exclude both completed (`completed_at`) and claimed quests, dynamically updating `TOTAL QUESTS` in the dashboard UI as quests complete.
- **Direct Application ID Logo for Live-RPC:** Removed external asset wrappers and bound `application_id: "1018195507560063039"` directly, displaying the official Discord Developer Portal app icon cleanly on user profile cards.

## v2.2.2 - 2026-07-24

### Fixed
- **Stray-DB Backup Commit Deduplication:** Implemented payload hash caching (`lastSyncedHash`) to bypass unnecessary network requests, reducing automated GitHub backup commits from 5,000+ per day to 0 unless profile settings actually change.

## v2.2.1 - 2026-07-24

### Fixed
- **Render Production Build Error:** Upgraded `"tailwindcss"` to `"^4.0.0"` in `dependencies` to resolve Next.js 16 (Turbopack) `@tailwindcss/postcss` module resolution failures on Render.

## v2.2.0 - 2026-07-24

### Added
- **Live Quest RPC Broadcasting with Stray Buttons:** Added real-time OP 3 Presence Updates for active Discord Quests over WebSocket, attaching interactive Stray buttons (`Completing with Stray`, `Get Stray`) to profile cards.
- **Dynamic Presence Triggering:** Quest progress milestones (e.g. 2%, 4%, 14%, 63%) instantly trigger WebSocket presence frames across Discord client and Stray Alley Live Preview.
- **Auto-Connect Gateway Daemon:** Triggering **"COMPLETE ALL"** or enabling **"LIVE-RPC"** automatically connects the Gateway daemon using restored credentials without requiring manual "Publish".
- **Toggle Mutual Exclusion:** Enforced mutual exclusion between Custom Rich Activity (RPC) and Quest LIVE-RPC to eliminate Discord presence payload conflicts.

### Fixed
- **100% Token Auto-Backup Synchronization:** Resolved multi-key encryption fallback so restored token credentials remain 100% valid across cloud container reboots.
- **Catalog Quests Count Filter:** Removed expired/catalog history `excluded_quests`, accurately displaying active targetable quests only.

## v2.1.0 - 2026-07-22

### Added
- **Restructured Dashboard Hierarchy:**
  - **Top:** Stray Parameters & Live Profile Preview side-by-side cards.
  - **Middle 1:** Active Discord Quests with individual **"Complete Quest"** buttons and a **"COMPLETE ALL AVAILABLE"** action button.
  - **Middle 2:** Settings Menu containing Cloud DB Auto-Backup toggle and Webhook Log Stream toggle (with conditional Webhook URL input).
  - **Bottom:** Gateway Connection & Quest Logs Terminal Console.
- **Initial Data Synchronization Modal:** Displays a **"Syncing Your Data..."** loading popup upon entering your Stray Key while checking `Stray-DB` for encrypted configuration backups.
- **Official Client Rewards Notice:** Displayed notice explaining that reward claiming can only be performed in official Discord app/web UI.

### Fixed
- **Discord Token Validation:** Sanitized token strings and appended browser User-Agent headers to prevent valid tokens from returning false negative error responses.

## v2.0.0 - 2026-07-22

### Added
- **DQACS Integration (Discord Quest Auto-Completer):** Integrated full quest auto-completion engine supporting video progress heartbeats, game/desktop presence spoofing, and mobile tasks.
- **Active Quests Dashboard Card:** Real-time active quests listing, task type badges, completion status badges, and manual trigger controls.
- **Cloud Quest Persistence:** DQACS settings automatically sync to `Stray-DB` cloud storage.

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
