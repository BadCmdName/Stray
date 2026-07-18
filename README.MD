# Stray Alley

Stray Alley is a self-hosted, secure Discord presence playground built on Next.js and Bun. It features active session device spoofing, custom rich activity presence, and client connection management.

---

## Features

* **Bun Integration:** Runs directly on Bun. Highly responsive WebSocket gateway connections and near-zero memory footprint.
* **Device Spoofing:** Pretend you are logged in on a custom device (Mobile Android client, Desktop, Web, or Xbox console).
* **Rich Presence & Custom Statuses:** Live updates for playing, custom text, details, and dynamic image assets.
* **Symmetric Token Security:** Store account credentials encrypted locally inside your database using AES-256-GCM.
* **Secure Access List:** Restrict dashboard access by listing authorized Discord IDs inside your environment configuration.
* **Interactive Dashboard:** Save configuration changes locally or Publish them online instantly.

---

## Quick Start

Ensure you have [Bun](https://bun.sh) and PostgreSQL installed on your system.

### 1. Clone the Repository
```bash
git clone https://github.com/BadCmdName/Stray.git
cd Stray/packages/alley
```

### 2. Configure Environment Parameters
Create a `.env` file in the `packages/alley` folder:
```bash
DATABASE_URL="postgresql://user:pass@localhost:5432/stray"
ENCRYPTION_KEY="your_32_bytes_hex_encryption_key"
JWT_SECRET="your_secure_session_secret"
DISCORD_CLIENT_ID="your_discord_application_id"
DISCORD_CLIENT_SECRET="your_discord_application_secret"
DISCORD_REDIRECT_URI="http://localhost:3000/api/auth/callback"
ALLOWED_USER_IDS="1018195507560063039"
```

### 3. Sync Database and Start
```bash
bun install
bunx prisma db push
bun run dev
```

Open `http://localhost:3000` in your web browser, log in through your Discord Application, and start configuring your custom status parameters.

---

## Credits

Stray is built using ideas, connection designs, and payloads derived from the [Ghost-Selfbot](https://github.com/ghostselfbot/ghost) project. Massive thanks to the original authors for laying the groundwork.

---

## License

Stray is licensed under the **PolyForm Noncommercial License 1.0.0**. See the `LICENSE.MD` file for details.

*Disclaimer: This is for educational and personal customization purposes. Using custom client presence scripts is against the Discord Terms of Service. Use at your own risk.*
