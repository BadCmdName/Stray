# Stray 🐾

A zero-dependency, ultra-lightweight, and self-hosted Discord Presence & Status daemon powered by **Bun**. Spoof your active session devices, broadcast custom activities, and keep your status alive indefinitely without any memory bloat.

---

## 🐈 Features

* **Lightweight Purr-formance:** Built on Bun-native WebSockets and fetch APIs. Zero npm dependencies.
* **Device Spoofing:** Pretend you are logged in on a custom device (Mobile Android, Desktop, Web, or Xbox console).
* **Rich Presence & Custom Statuses:** Live updates for playing, listening, watching, or custom text activities.
* **Automatic Assets API Registration:** Dynamically registers custom HTTPS image links with the Discord API to display custom logos.
* **Double-lane Deployment:**
  * **Stray Skeletal:** A headless daemon for Raspberry Pi, AWS, or Docker runtimes.
  * **Stray Dashboard:** A self-hosted Next.js web application for visual configuration and instance control.

---

## 📦 Skeletal Quick Start

Ensure you have [Bun](https://bun.sh) installed.

### 1. Grab the Yarn (Clone)
```bash
git clone https://github.com/yourusername/Stray.git
cd Stray/packages/skeletal
```

### 2. Prepare the Cardboard Box (Config)
Copy the example config and add your catnip (Discord Token):
```bash
cp stray.config.json.example stray.config.json
```

Edit `stray.config.json`:
```json
{
  "token": "YOUR_SECRET_DISCORD_TOKEN",
  "status": "online",
  "device": "mobile",
  "custom_status": {
    "text": "Napping in a cardboard box"
  }
}
```

### 3. Let the Cat Out (Run)
```bash
bun install
bun start
```

---

## ⚙️ Configuration File Anatomy

The `stray.config.json` allows full control over your cat's status:

| Parameter | Options | Description |
| :--- | :--- | :--- |
| `token` | `string` | Your Discord account token (your secret catnip). |
| `status` | `online`, `idle`, `dnd`, `invisible` | The online status shown on Discord. |
| `device` | `desktop`, `mobile`, `web`, `embedded` | The platform icon displayed (mobile shows a phone icon). |
| `custom_status` | `object` | Text and emoji displayed on your profile. |
| `rich_presence` | `object` | Advanced activity details including large/small images. |

---

## 🐳 Docker Deployment

Stray Skeletal can run in a background container.

```yaml
version: '3.8'
services:
  stray-skeletal:
    build: ./packages/skeletal
    volumes:
      - ./packages/skeletal/stray.config.json:/app/stray.config.json
    restart: always
```

---

## 🤝 Credits

Stray is built using ideas, connection designs, and payloads derived from the awesome [Ghost-Selfbot](https://github.com/ghostselfbot/ghost) project. Massive thanks to the original authors for laying the groundwork!

---

## ⚖️ License

Stray is licensed under the **PolyForm Noncommercial License 1.0.0**. See the [LICENSE.MD](file:///c:/Users/Prince%20Prashant/Desktop/Stray/LICENSE.MD) file for details.

*Disclaimer: This is for educational and personal customization purposes. Using selfbots is against the Discord Terms of Service. Use at your own risk.*
