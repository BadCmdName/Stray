<p align="center">
  <img src="Alley/public/Stray.png" alt="Stray Logo" width="120" height="120" />
</p>

# Stray Alley (v4.0.0)

Stray Alley is a self-hosted, secure Discord presence playground built on Next.js. It features active session device spoofing, custom rich activity presence, client connection management, automatic quest completion, and Discord profile badge spoofing.

> [!WARNING]
> **Violation of Discord Terms of Service (ToS):** Operating selfbots or custom presence scripts on personal user accounts is against the Discord Terms of Service. Using this project could result in your account being permanently banned or restricted. Use at your own risk.

> [!CAUTION]
> **Keep Your Token Safe:** Your Discord Account Token gives full access to your account. Stray Alley encrypts your token locally in `db.json` using AES-256-GCM (automatically generating encryption keys on start), but you must ensure your host environment remains secure. Never share your token.

---

## Documentation

To install, configure, or troubleshoot Stray Alley, navigate to the documents below:

* **[Installation and Setup Guide](SETUP.MD):** Step-by-step local setup, cloud deployments (Render, Railway, etc.), and UptimeRobot keep-alive setup.
* **[Changelog](CHANGELOG.MD):** Detailed version history and features summary.

---

## Preview

<p align="center">
  <img src="public/v3.0.0%20LTM.png" alt="Stray Dashboard Preview" width="100%" />
</p>

---

## Perks & Key Benefits

* **Discord Badge Spoofer (DBS):** Inflate profile playtime hours and games played badges via Discord's `/science` telemetry pipeline with custom hour increments, rate-limit backoff, and 800+ official detectable titles.
* **Auto-Quest Complete (DQACS):** Automatically process and complete Discord quests (video quests, game stream quests, and partner activities) in prioritized hierarchy mode without manual gameplay.
* **Interactive Live Preview:** A beautiful, responsive Discord profile card visualizer lets you configure and preview custom statuses and Rich Presence states instantly as you type.
* **Ultra-Low Latency (~7ms Handshake):** Lightweight Node.js WebSocket engine initiates connection handshakes and updates presence properties in milliseconds.
* **Stealth Log-Out:** Instantly goes invisible and offline when you stop the service, bypassing the usual 30-second to 2-minute Discord session timeout delay.
* **Live Connection Logging:** A built-in terminal log viewport displays gateway milestones (Hellos, Heartbeats, READY states, and error close codes) in real-time.
* **Zero Database Configuration:** Completely self-contained using a zero-dependency local JSON file database (`db.json`) that sets itself up on first boot.
* **Dynamic RPC Asset Loading:** Enter direct image URLs or application asset keys. The dashboard automatically resolves Developer Portal keys to the Discord CDN.
* **Emoji Integration:** Support for standard Unicode emojis and custom Discord emojis (including static and animated GIFs) directly inside status updates.
* **Device Spoofing:** Pretend you are logged in on a custom device (Mobile Android client, Desktop, Web, or Xbox console).

---

## Features Overview

### 🎮 Discord Badge Spoofer (DBS)
Stray now integrates Discord Badge Spoofer (DBS) to increment games played and playtime duration statistics directly on your Discord profile:
* **Playtime Hours Mode:** Choose custom hour increments (10h, 50h, 100h, 500h, or custom) to inflate playtime duration across detectable titles.
* **Games Played Mode:** Increment unique games played count across 800+ official Discord titles.
* **Telemetry Engine:** Batched events dispatched directly to Discord's `/api/v9/science` endpoint with Cloudflare `cf_clearance` cookie support and automatic rate-limit backoff.

Stray's Badge Spoofer is built using [DBS](https://github.com/revere-group/discord-badge-spoofer). Massive thanks to the original creator.

---

### ⚡ Auto-Quest Complete (DQACS)
Automate active Discord gaming and media quests in a prioritized 3-tier hierarchy:
1. **Tier 1: Orbs (Video):** Accelerated watch and media stream quests (Top priority)
2. **Tier 2: Orbs (Games):** Discord desktop stream and gameplay simulation (Second priority)
3. **Tier 3: Decorations & Other:** Avatar decorations, badges, and partner tasks (Optional last priority)
* **Live-RPC Mode:** Optionally broadcasts the currently active quest game directly onto your Discord Rich Presence.

Stray's Auto-Quest Complete is built using [DQACS](https://github.com/aiko-chan-ai/Discord-Quest-Auto-Completion-Selfbot). Massive thanks to the original creator.

---

## Credits

* **Base Client:** Stray's gateway core is built using connection payloads inspired by the [Ghost-Selfbot](https://github.com/ghostselfbot/ghost) project. Massive thanks to the original creator.
* **Auto-Quest Complete (DQACS):** Stray's Auto-Quest Complete is built using [DQACS](https://github.com/aiko-chan-ai/Discord-Quest-Auto-Completion-Selfbot). Massive thanks to the original creator.
* **Discord Badge Spoofer (DBS):** Stray's Badge Spoofer is built using [DBS](https://github.com/revere-group/discord-badge-spoofer). Massive thanks to the original creator.

---

## License

Stray is licensed under the **PolyForm Noncommercial License 1.0.0**. See the `LICENSE.MD` file for details.

