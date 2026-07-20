# Setup and Installation Guide

Follow this guide to host Stray Alley locally on your system or deploy it to cloud hosting platforms.

---

## 1. Prerequisites

Ensure you have one of the following runtimes installed on your host system:
* **Node.js** (v18.0.0 or higher)
* **Bun** runtime (v1.1.0 or higher)

---

## 2. Local Installation

To run Stray Alley on your local machine:

### Step 1: Clone the Repository
Clone the repository using git and navigate into the `Alley` project directory:
```bash
git clone https://github.com/BadCmdName/Stray.git
cd Stray/Alley
```

### Step 2: Configure Environment Variables
Create a file named `.env` in the `Alley` directory:
```bash
ALLOWED_USER_IDS="your_discord_user_id"
```
*Note: You can specify multiple user IDs separated by commas, for example: `ALLOWED_USER_IDS="12345678,98765432"`.*

### Step 3: Install Dependencies and Start Server

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

### Step 4: Access the Dashboard
Once the server starts, open `http://localhost:3000` in your web browser. Click the login link to authenticate, copy your token key, paste it into the prompt, and begin configuring your custom presence.

---

## 3. Cloud Deployment (Render, Railway, Koyeb, etc.)

> [!IMPORTANT]
> **Deploy from your own Fork (Do NOT use the public repository directly):** 
> If you deploy Render/Railway/Etc. services pointing directly to our public repository (`https://github.com/BadCmdName/Stray`), any code updates we commit to our repository will trigger an automatic redeployment of your server. This will wipe your local `db.json` database configuration and take your presence offline.
> 
> To prevent this, always **Fork the repository** to your own GitHub account first, configure your cloud service to deploy from your personal fork, and manually sync your fork when you want to retrieve the latest stable updates.

Stray Alley is built as a Next.js monorepo. Follow these parameters when deploying directly from your GitHub fork:

* **Repository Branch:** `main`
* **Root Directory:** `Alley`
* **Build Command:** `npm install && npm run build` (or `bun install && bun run build`)
* **Start Command:** `npm start` (or `bun run start`)
* **Health Check Path:** `/api/ping`
* **Environment Variables:**
  * Add `ALLOWED_USER_IDS` with your authorized Discord user ID(s).

> [!WARNING]
> **Beta Branch warning:** Do not deploy from the `beta` branch. The `beta` branch is strictly reserved for developer testing and pre-releases. Absolutely no support is provided for deployments running on the `beta` branch.

---

## 4. Prevent Idle Shutdowns (UptimeRobot Integration)

Free container hosts (like Render for example) will spin down your web service after 15 to 60 minutes of inactivity. Because the gateway client relies on a persistent WebSocket connection to keep your Discord account status online, an idle container shutdown will take your presence offline.

To keep your container active 24/7, use UptimeRobot to ping the built-in keep-alive endpoint:

1. Create a free account at [UptimeRobot](https://uptimerobot.com/).
2. Click **Add New Monitor** in your dashboard.
3. Configure the monitor details:
   * **Monitor Type:** HTTP(s)
   * **Friendly Name:** Stray Keep-Alive or Whatever you want it to be
   * **URL (or IP):** `https://your-app-name.yourhost.com/api/ping` (Replace with your actual deployed URL)
   * **Monitoring Interval:** Every 5 minutes (or 10 minutes)
4. Save and confirm the monitor.

UptimeRobot will now ping the `/api/ping` route every 5 minutes, preventing the container from sleeping.

---

## 5. FAQs & Troubleshooting

### Why is my status not showing up on Discord?
1. Check the **Gateway Connection Logs** near the bottom of the Alley dashboard. It will show detailed heartbeats or close error codes.
2. Verify that your Discord Token is correct. Click **Verify Token** next to the token input in Alley to validate.
3. Make sure you have turned off the "Show current activity as a status message" setting in your personal Discord client if it conflicts.

### How do I update my instance to the latest version? (Locally Hosted)
Simply pull the latest commits from the `main` branch:
```bash
git pull origin main
npm install
npm run build
npm start
```
> [!IMPORTANT]
> Re-deployment wipes all data. This environment uses temporary server storage for security reasons, making data loss irreversible.

### How do I update my instance to the latest version? (Cloud Hosted)
Simply Re-sync your Fork with the latest Main branch.
Your server will re-deploy automatically (unless the setting is turned off and need a manual deploy) and the updates should be live.
> [!IMPORTANT]
> Re-deployment wipes all data. This environment uses temporary server storage for security reasons, making data loss irreversible.