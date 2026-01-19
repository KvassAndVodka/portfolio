# Automated Deployment Setup (CI/CD)

This guide explains how to connect your Proxmox server to GitHub so it updates automatically when you push code.

## 1. Create a GitHub Secret
1.  Go to your GitHub Repository -> **Settings** -> **Secrets and variables** -> **Actions**.
2.  Click **New repository secret**.
3.  Name: `PROD_ENV_FILE`
4.  Value: **Paste the entire content of your server's `.env` file here.**
    *   This ensures your server always has the correct secrets during deployment.

## 2. Install the Runner on Proxmox
1.  Go to your GitHub Repository -> **Settings** -> **Actions** -> **Runners**.
2.  Click **New self-hosted runner**.
3.  Select **Linux** and **x64**.
4.  SSH into your Proxmox server (`ssh user@192.168.x.x`) and run the commands shown by GitHub.
    *   *Tip: Run these commands inside your `~/portfolio` directory or a dedicated `~/runner` directory.*
5.  When asked about the runner name, give it a recognizable name (e.g., `proxmox-runner`).
6.  When asked for labels, press Enter (default).

## 3. Start the Runner
To ensure the runner keeps running even if you disconnect, install it as a service:

```bash
sudo ./svc.sh install
sudo ./svc.sh start
```

## 4. Test It
1.  Make a small change to your code (e.g., update a README).
2.  `git push origin main`.
3.  Watch the "Actions" tab in GitHub. You should see it pick up the job and deploy to your server automatically! 🚀
