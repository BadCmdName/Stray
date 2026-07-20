# Stray Alley Self-Hosted Application

This folder contains the self-hosted Stray Alley web portal to configure your custom Discord presence parameters.

---

## Deployment Instructions

### 1. Requirements
* Node.js (v18 or higher) or Bun
* npm (comes with Node.js) or Bun Package Manager

### 2. Set Up Environment
Create a `.env` file in this directory (`Alley/.env`):
```bash
ALLOWED_USER_IDS="your_discord_user_id"
```
*(You can specify multiple IDs separated by commas, e.g. `123456789,987654321`)*

### 3. Run Locally

#### Using npm:
```bash
npm install
npm run build
npm start
```

#### Using Bun:
```bash
bun install
bun run build
bun run start
```
Go to `http://localhost:3000` to start customizing.

### 4. Deploying to Cloud Services (Render, Railway, etc.)
When deploying to remote hosting services directly from the public Git repository:
1. **Root Directory:** Set to `Alley` (since the repository is a monorepo).
2. **Build Command:** Set to `npm install && npm run build` (or `bun install && bun run build`) to ensure dependencies are installed.
3. **Start Command:** Set to `npm start` (or `bun run start`).
4. **Health Check Path:** Set to `/api/ping` (this monitors the service health and keeps the container active).
5. **Environment Variable:** Add `ALLOWED_USER_IDS` with your Discord user ID.
6. **Persistence:** Ensure the service mounts a persistent volume or has write access to persist the `db.json` file across deployments (otherwise config and session logs will reset when the server restarts).

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
