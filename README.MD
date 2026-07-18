# Stray Alley

Stray Alley is a self-hosted, secure Discord presence playground built on Next.js. It features active session device spoofing, custom rich activity presence, and client connection management.

---

## Features

* **Node.js Native:** Fully compatible with standard Node.js runtimes. Easy to deploy on cloud services (Render, Railway, etc.).
* **Zero Database Configuration:** Uses a local JSON file database (`db.json`) that sets itself up on first boot. No SQLite or PostgreSQL servers needed.
* **Auto-generated Secrets:** Dynamically generates and persists cryptographic keys for token encryption and session signing.
* **Hassle-Free Login:** Uses the official Stray application login proxy, eliminating the need to create personal Discord Developer applications.
* **Single Environment Variable:** The only setting required in your environment is the list of authorized Discord user IDs.
* **Device Spoofing:** Pretend you are logged in on a custom device (Mobile Android client, Desktop, Web, or Xbox console).
* **Rich Presence:** Live updates for custom activity states, details, timestamps, and dynamic image assets.

---

## Quick Start

Ensure you have Node.js (v18+) and npm installed.

### 1. Clone the Codebase
```bash
git clone https://github.com/BadCmdName/Stray.git
cd Stray/Alley
```

### 2. Configure Allowed Users
Create a `.env` file in the `Alley` folder:
```bash
ALLOWED_USER_IDS="1018195507560063039"
```

### 3. Install & Start
```bash
npm install
npm run build
npm start
```

Open `http://localhost:3000` in your browser, click login to authenticate with Discord, and configure your presence.

---

## Credits

Stray is built using designs and connection payloads derived from the awesome [Ghost-Selfbot](https://github.com/ghostselfbot/ghost) project. Massive thanks to the original creators.

---

## License

Stray is licensed under the **PolyForm Noncommercial License 1.0.0**. See the `LICENSE.MD` file for details.

*Disclaimer: This is for educational and personal customization purposes. Using custom client presence scripts is against the Discord Terms of Service. Use at your own risk.*
