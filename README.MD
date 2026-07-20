<p align="center">
  <img src="Alley/public/Stray.png" alt="Stray Logo" width="120" height="120" />
</p>

# Stray Alley

Stray Alley is a self-hosted, secure Discord presence playground built on Next.js. It features active session device spoofing, custom rich activity presence, and client connection management.

> [!WARNING]
> **Violation of Discord Terms of Service (ToS):** Operating selfbots or custom presence scripts on personal user accounts is against the Discord Terms of Service. Using this project could result in your account being permanently banned or restricted. Use at your own risk.

> [!CAUTION]
> **Keep Your Token Safe:** Your Discord Account Token gives full access to your account. Stray Alley encrypts your token locally in `db.json` using AES-256-GCM (automatically generating encryption keys on start), but you must ensure your host environment remains secure. Never share your token.

---

## Previews

<p align="center">
  <img src="public/image.png" alt="Dashboard Setup Screen" width="100%" />
</p>

<p align="center">
  <img src="public/image1.png" alt="RPC Parameters Customization" width="100%" />
</p>

<p align="center">
  <img src="public/image2-clean.png" alt="Live Status Preview Console" width="100%" />
</p>

---

## Perks & Key Benefits

* **Interactive Live Preview:** A beautiful, responsive Discord profile card visualizer lets you configure and preview custom statuses and Rich Presence states instantly as you type.
* **Ultra-Low Latency (~7ms Handshake):** Lightweight Node.js WebSocket engine initiates connection handshakes and updates presence properties in milliseconds.
* **Stealth Log-Out:** Instantly goes invisible and offline when you stop the service, bypassing the usual 30-second to 2-minute Discord session timeout delay.
* **Live Connection Logging:** A built-in terminal log viewport displays gateway milestones (Hellos, Heartbeats, READY states, and error close codes) in real-time.
* **Zero Database Configuration:** Completely self-contained using a zero-dependency local JSON file database (`db.json`) that sets itself up on first boot.
* **Dynamic RPC Asset Loading:** Enter direct image URLs or application asset keys. The dashboard automatically resolves Developer Portal keys to the Discord CDN.
* **Emoji Integration:** Support for standard Unicode emojis and custom Discord emojis (including static and animated GIFs) directly inside status updates.
* **Device Spoofing:** Pretend you are logged in on a custom device (Mobile Android client, Desktop, Web, or Xbox console).

---

## Quick Start

Ensure you have Node.js (v18+) and npm (or Bun) installed.

### 1. Download the Release
Download the latest release zip package from the [Stray Releases](https://github.com/BadCmdName/Stray/releases) page. Extract the files and navigate into the `Alley` directory.

### 2. Configure Allowed Users
Create a `.env` file in the `Alley` folder:
```bash
ALLOWED_USER_IDS="1018195507560063039"
```

### 3. Install & Start

Using **npm**:
```bash
npm install
npm run build
npm start
```

Using **Bun**:
```bash
bun install
bun run build
bun run start
```

Open `http://localhost:3000` in your browser, click login to generate and paste your key, and customize your presence.

### 4. Deploying to Cloud Services (Render, Railway, etc.)
When deploying to remote hosting services directly from the public Git repository:
* **Root Directory:** Set to `Alley` (since the repository is a monorepo).
* **Build Command:** Set to `npm install && npm run build` (or `bun install && bun run build`) to ensure dependencies are installed.
* **Start Command:** Set to `npm start` (or `bun run start`).
* **Health Check Path:** Set to `/api/ping` (this monitors the service health and keeps the container active).
* **Environment Variable:** Add `ALLOWED_USER_IDS` with your Discord user ID.
* **Persistence:** Ensure the service mounts a persistent volume or has write access to persist the `db.json` file across deployments (otherwise config and session logs will reset when the server restarts).

> [!WARNING]
> **Beta Branch Deployments:** Do NOT deploy from the `beta` branch. The `beta` branch is strictly for internal testing and development. Absolutely no support will be provided for deployments running on the `beta` branch. Always deploy from the `main` branch or use the latest stable release package.

---

## Prevent Idle Shutdowns (Keep-Alive Integration)

If you host Stray Alley on free hosting providers (such as Render, Koyeb, Glitch, etc.), the server may automatically shut down or sleep after 15 to 60 minutes of inactivity. Since the gateway client relies on a persistent WebSocket connection, a server shutdown will cause your presence status to go offline.

Stray Alley includes a built-in keep-alive endpoint: `/api/ping`. Pinging this endpoint periodically resets the inactivity timer of the host.

### Setting Up UptimeRobot
1. Create a free account at [UptimeRobot](https://uptimerobot.com/).
2. Navigate to your dashboard and click **Add New Monitor**.
3. Configure the monitor parameters:
   * **Monitor Type:** HTTP(s)
   * **Friendly Name:** Stray Keep-Alive
   * **URL (or IP):** `https://your-app-name.onrender.com/api/ping` (Replace with your actual self-hosted server domain URL)
   * **Monitoring Interval:** Every 5 minutes (or 10 minutes)
4. Click **Create Monitor** and confirm.

UptimeRobot will now request `/api/ping` every 5 minutes, keeping your self-hosted instance active 24/7!

---

## Credits

Stray is built using designs and connection payloads inspired by the [Ghost-Selfbot](https://github.com/ghostselfbot/ghost) project. Massive thanks to the original creator.

---

## License

Stray is licensed under the **PolyForm Noncommercial License 1.0.0**. See the `LICENSE.MD` file for details.
