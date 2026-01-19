# Deployment Guide: Proxmox LXC

This guide walks you through deploying your portfolio to a Proxmox LXC container.

## Prerequisites (On Server)
Ensure your Proxmox LXC container has the following installed:
1.  **Docker & Docker Compose**: [Install Guide](https://docs.docker.com/engine/install/)
2.  **Tailscale** (Optional, if you want to access via Tailnet): `curl -fsSL https://tailscale.com/install.sh | sh`

## 1. Bundle Your Application (Local Machine)
Run the helper script to create a deployment archive. This excludes unnecessary development folders (`node_modules`, `.git`, etc.).

```bash
chmod +x bundle_for_prod.sh
./bundle_for_prod.sh
```
This will create `portfolio-deploy.tar.gz`.

## 2. Transfer to Server
Use `scp` to copy the archive to your server. Replace `user` and `192.168.x.x` with your actual LXC credentials.

```bash
scp portfolio-deploy.tar.gz root@192.168.1.100:~/
```

## 3. Setup on Server
SSH into your server:
```bash
ssh root@192.168.1.100
```

Unpack the application and enter the directory:
```bash
mkdir portfolio
tar -xzf portfolio-deploy.tar.gz -C portfolio
cd portfolio
```

## 4. Configuration
Create your production environment file from the example.

```bash
cp .env.example .env
nano .env
```
> **IMPORTANT**: Fill in `DATABASE_URL`, `ADMIN_EMAIL`, `TS_AUTHKEY`, and your OAuth/Auth secrets.

## 5. Launch
Start the containers. The initial build might take a few minutes.

```bash
docker compose up -d --build
```
> Note: We use `docker-compose.yml` which is already configured for production.

## 6. Public Access (Tailscale Funnel)
To expose your site to the public internet:

```bash
docker exec tailscale tailscale funnel --bg --https=443 http://localhost:3000
```
Your public URL will be `https://portfolio.<your-tailnet>.ts.net`.

## Troubleshooting
-   **View Logs**: `docker logs -f portfolio_web`
-   **Restart**: `docker compose restart web`
-   **Check Database**: `docker exec -it portfolio_db psql -U postgres -d portfolio`
