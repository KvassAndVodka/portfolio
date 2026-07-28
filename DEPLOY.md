# Deployment Guide: Proxmox LXC

Production deployment requires `DEPLOY_TARGET=production` in `deployment.env`. The repository pre-push hook and deployment workflow both enforce this value.

This guide walks you through deploying your portfolio to a Proxmox LXC container.

## Prerequisites (On Server)
Ensure your Proxmox LXC container has the following installed:
1.  **Docker & Docker Compose**: [Install Guide](https://docs.docker.com/engine/install/)
2.  **Cloudflare**: A remotely managed tunnel with a token and the
    `portfolio.jmraut.dev` published hostname.
3.  **Tailscale** (optional): Install it directly on the LXC host for private
    SSH administration. It is not part of the application Compose stack.

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
> **IMPORTANT**: Fill in `DATABASE_URL`, `ADMIN_EMAIL`,
> `CLOUDFLARE_TUNNEL_TOKEN`, your OAuth/Auth secrets,
> `ANALYTICS_HASH_SECRET`, and the Resend variables used by the contact form
> (`RESEND_API_KEY`, `CONTACT_TO_EMAIL`, and `CONTACT_FROM_EMAIL`).

Set both Auth.js URLs to the production hostname:

```dotenv
AUTH_URL=https://portfolio.jmraut.dev
NEXTAUTH_URL=https://portfolio.jmraut.dev
CLOUDFLARE_TUNNEL_TOKEN=<secret copied from Cloudflare>
```

The Cloudflare token is passed to the connector as `TUNNEL_TOKEN`; it is not
passed to the application container or placed on the command line.

Before deploying, configure `portfolio.jmraut.dev` as a published hostname on
the remotely managed tunnel. Its origin service is:

```text
http://web:3000
```

The `web` and `cloudflared` containers communicate only over the private Compose
network. Port `3000` is not published on the LXC host.

## 5. Launch
Build the web runtime and migrator. Apply migrations before replacing the web
container:

```bash
docker compose build web migrator
docker compose up -d postgres
docker compose run --rm migrator
docker compose up -d --no-deps web
docker compose up -d --no-deps cloudflared
```

The web image contains only the Next.js standalone runtime. Prisma CLI and
`tsx` are available only in the one-shot migrator image.

Database seeding is never performed during web startup. Run it explicitly when
you intend to create the configured admin user or seed other repository content:

```bash
docker compose run --rm --build migrator db seed
```

Application rollback does not reverse database migrations. Keep production
migrations backward-compatible with the previously deployed application.

## 6. Verify Cloudflare Ingress

```bash
docker inspect -f '{{.State.Health.Status}}' portfolio_web
docker compose ps
docker compose logs --tail=100 cloudflared
curl -sSIL --max-time 15 https://portfolio.jmraut.dev
```

The public URL must load without `502`, `503`, or `525` responses. Test public
pages, credentials login, GitHub OAuth, the admin dashboard, uploads, the
contact form, analytics, and application rollback.

After the Cloudflare URL passes those checks, remove any legacy host-level
Funnel configuration without disabling host-level Tailscale:

```bash
sudo tailscale funnel reset
tailscale funnel status
```

The GitHub OAuth application must use:

- Homepage: `https://portfolio.jmraut.dev`
- Callback: `https://portfolio.jmraut.dev/api/auth/callback/github`

Tailscale Funnel is not used. Host-level Tailscale may remain active strictly
for private SSH administration.

## Troubleshooting
-   **View Web Logs**: `docker compose logs -f web`
-   **View Tunnel Logs**: `docker compose logs -f cloudflared`
-   **Restart**: `docker compose restart web`
-   **Check Database**: `docker exec -it portfolio_db psql -U postgres -d portfolio`
-   **Run Migrations**: `docker compose run --rm --build migrator`
-   **Seed Explicitly**: `docker compose run --rm --build migrator db seed`
