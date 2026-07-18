# Stray Alley Self-Hosted Application

This folder contains the self-hosted Stray Alley web portal to configure your custom Discord presence parameters.

---

## Deployment Instructions

### 1. Requirements
* Node.js (v18 or higher)
* npm (comes with Node.js)

### 2. Set Up Environment
Create a `.env` file in this directory (`packages/alley/.env`):
```bash
ALLOWED_USER_IDS="your_discord_user_id"
```
*(You can specify multiple IDs separated by commas, e.g. `123456789,987654321`)*

### 3. Run Locally
```bash
npm install
npm run build
npm start
```
Go to `http://localhost:3000` to start customizing.

### 4. Deploying to Cloud Services (Render, Railway, etc.)
When deploying to remote hosting services:
1. Set the Build Command to: `npm run build`
2. Set the Start Command to: `npm start`
3. Add the Environment Variable: `ALLOWED_USER_IDS` with your Discord user ID.
4. Ensure the service mounts a persistent volume or has write access to persist the `db.json` file across deployments (otherwise config and session logs will reset when the server restarts).
