# Cloudflare-Only Production Ingress

**Status:** Production cutover complete
**Completed:** 2026-07-28
**Production URL:** `https://portfolio.jmraut.dev`
**Hosting:** Proxmox LXC, Docker Compose, Next.js, PostgreSQL
**Public ingress:** Remotely managed Cloudflare Tunnel

## 1. Final Architecture

```text
Visitor
  |
  | HTTPS
  v
Cloudflare DNS, TLS, and edge
  |
  | outbound Cloudflare Tunnel
  v
cloudflared container
  |
  | http://web:3000 on portfolio_default
  v
Next.js web container
  |
  | postgresql://...@postgres:5432/portfolio
  v
PostgreSQL container and persistent volume
```

There is no public router port forward and no host port published for Next.js
or PostgreSQL.

Tailscale is installed directly on the LXC host only for private administration:

```bash
ssh root@portfolio
```

Tailscale Funnel is disabled. Tailscale is not part of the application Compose
stack.

## 2. As-Built Production State

Verified on the `portfolio` LXC after cutover:

- [x] Host `tailscaled` system service is active.
- [x] Host Tailscale SSH remains reachable.
- [x] Host Funnel configuration is empty (`tailscale funnel status --json`
      returned `{}`).
- [x] No `tailscale` application container exists.
- [x] No `portfolio_tailscale_data` volume exists.
- [x] `portfolio_web` is healthy.
- [x] `portfolio_db` is healthy.
- [x] `portfolio_cloudflared` is running.
- [x] `web` and `cloudflared` use the private `portfolio_default` network.
- [x] `web` has no published host ports.
- [x] PostgreSQL has no published host ports.
- [x] Cloudflare registered four QUIC tunnel connections.
- [x] The remotely managed tunnel routes both configured hostnames to
      `http://web:3000`.
- [x] Restarting `cloudflared` restored the public route without the temporary
      token-staging file.

The production connector is pinned to:

```text
cloudflared 2026.7.3
cloudflare/cloudflared@sha256:e39ee8da81ad5e05d77f38d2f51c60ca51bf2a8450ac3abab50c17fdb91d91bf
```

## 3. Implemented Repository Changes

### `docker-compose.yml`

- [x] Removed the Tailscale service.
- [x] Removed `tailscale_data`.
- [x] Removed `network_mode: service:tailscale` from `web`.
- [x] Removed the Tailscale dependency from `web`.
- [x] Kept PostgreSQL private and its persistent volume unchanged.
- [x] Added internal-only `expose: ["3000"]` to `web`.
- [x] Added a Docker health check using Node from the runtime image.
- [x] Added `AUTH_URL` to the `web` environment.
- [x] Kept `NEXTAUTH_URL` for compatibility.
- [x] Added the pinned `cloudflared` service.
- [x] Passed the tunnel token only as:

  ```yaml
  TUNNEL_TOKEN: ${CLOUDFLARE_TUNNEL_TOKEN}
  ```

- [x] Did not put the token on the command line.
- [x] Did not pass the tunnel token to `web`.
- [x] Did not publish a connector port.

### `.env.example`

- [x] Added `AUTH_URL`.
- [x] Added `CLOUDFLARE_TUNNEL_TOKEN`.
- [x] Removed `TS_AUTHKEY`.
- [x] Kept local Auth.js URL examples usable for development.
- [x] Did not add a real secret.

### `.github/workflows/deploy.yml`

- [x] Removed Tailscale startup and namespace-stability checks.
- [x] Removed all Funnel enable/restore commands.
- [x] Added a production preflight for the Cloudflare token.
- [x] Enforced:

  ```dotenv
  AUTH_URL=https://portfolio.jmraut.dev
  NEXTAUTH_URL=https://portfolio.jmraut.dev
  ```

- [x] Preserved the explicit one-shot database migrator.
- [x] Preserved the previous-image rollback tag.
- [x] Added Docker health-status polling for `web`.
- [x] Made application rollback recreate only `web`.
- [x] Added connector stability checks.
- [x] Added an external HTTPS health check for
      `https://portfolio.jmraut.dev`.
- [x] Added one-time cleanup for any legacy Tailscale application container and
      volume.
- [x] Kept PostgreSQL and `cloudflared` independent from application-image
      rollback.

### Documentation

- [x] Updated `README.md` to identify Cloudflare Tunnel as production ingress.
- [x] Updated `DEPLOY.md` with the Cloudflare-only topology and commands.
- [x] Documented the production Auth.js URL and GitHub OAuth callback.
- [x] Documented host-level Tailscale as optional private SSH only.
- [x] Removed Tailscale Funnel deployment instructions.

## 4. Cloudflare Configuration

The Cloudflare account and zone were configured before deployment:

- [x] `jmraut.dev` is active in Cloudflare.
- [x] Authoritative nameservers are:
  - `dora.ns.cloudflare.com`
  - `dante.ns.cloudflare.com`
- [x] Remotely managed tunnel `portfolio-prod` exists.
- [x] `portfolio.jmraut.dev` is published through the tunnel.
- [x] Its service URL is `http://web:3000`.
- [x] The tunnel-generated proxied DNS route exists.
- [x] No public origin IP or router port forward is required.

The production `.env` on the LXC contains the tunnel token and both canonical
Auth.js URLs. The token value must never be committed, printed in logs, or added
to this document.

## 5. Production Verification

The following checks passed after deployment:

| Check | Result |
|---|---|
| `https://portfolio.jmraut.dev/` | `200` |
| `/projects` | `200` |
| `/notes` | `200` |
| `/auth/signin` | `200` |
| `/icon.svg` | `200` |
| `/api/auth/providers` | `200` |
| Unauthenticated `/admin` | `307` to canonical production sign-in |
| Cloudflare response headers | Present |
| `portfolio_web` health | `healthy` |
| PostgreSQL health | `healthy` |
| Web published host ports | None |
| Connector restart recovery | Passed |
| Host Funnel status | Empty |
| Host Tailscale service | Active |

The production build also passed:

```bash
npm run build
```

Scoped application lint passed with zero errors:

```bash
npx eslint --config eslint.config.mjs src scripts next.config.ts
```

There is one unrelated existing warning in
`scripts/update-admin-password.ts`. The repository-wide lint command also scans
untracked `.agents` tooling and currently reports pre-existing tooling errors;
those are unrelated to this ingress migration.

## 6. Authentication

Production uses:

```dotenv
AUTH_URL=https://portfolio.jmraut.dev
NEXTAUTH_URL=https://portfolio.jmraut.dev
```

The GitHub OAuth application must remain configured with:

```text
Homepage:
https://portfolio.jmraut.dev

Authorization callback:
https://portfolio.jmraut.dev/api/auth/callback/github
```

Do not reintroduce the old `.ts.net` hostname as the canonical Auth.js URL.

## 7. Deployment and Rollback

Normal production deployment:

```bash
docker compose build web migrator
docker compose up -d postgres
docker compose run --rm --no-deps migrator
docker compose up -d --no-deps --force-recreate web
docker compose up -d --no-deps cloudflared
```

Application rollback:

1. Retag `portfolio:rollback` as `portfolio:latest`.
2. Recreate only `web`.
3. Wait for `portfolio_web` to become healthy.
4. Leave PostgreSQL and `cloudflared` running.

```bash
docker tag portfolio:rollback portfolio:latest
docker compose up -d --no-deps --force-recreate web
docker inspect -f '{{.State.Health.Status}}' portfolio_web
```

Connector troubleshooting:

```bash
docker compose ps
docker compose logs --tail=100 cloudflared
curl -sSIL --max-time 15 https://portfolio.jmraut.dev
```

Do not expose port `3000`, add router forwards, or restore Funnel as a shortcut.

## 8. Operational Checks

Useful commands:

```bash
ssh root@portfolio
cd /home/github/actions-runner/_work/portfolio/portfolio
docker compose ps
docker compose logs --tail=100 web
docker compose logs --tail=100 cloudflared
docker inspect -f '{{.State.Health.Status}}' portfolio_web
tailscale funnel status --json
systemctl is-active tailscaled
```

Expected state:

- `portfolio_web`: healthy
- `portfolio_db`: healthy
- `portfolio_cloudflared`: running
- `tailscale funnel status --json`: `{}`
- `tailscaled`: active

## 9. Remaining Source-Control and Secret Hygiene

These items do not block the currently running production tunnel, but must be
completed before relying on the next GitHub Actions deployment:

- [ ] Commit the Cloudflare migration files without including unrelated
      working-tree changes.
- [ ] Push/merge the migration into the branch that will become `main`.
- [ ] Update the GitHub repository secret `PORTFOLIO_ENV` from the authoritative
      production environment so it includes:

  ```dotenv
  AUTH_URL=https://portfolio.jmraut.dev
  NEXTAUTH_URL=https://portfolio.jmraut.dev
  CLOUDFLARE_TUNNEL_TOKEN=<secret>
  ```

- [ ] Confirm `PORTFOLIO_ENV` no longer contains `TS_AUTHKEY`.
- [ ] Do not trigger the old `main` deployment workflow until the migration code
      and updated secret are both in place.

## 10. Existing Non-Ingress Configuration Gaps

The production environment currently lacks:

- `RESEND_API_KEY`
- `CONTACT_TO_EMAIL`
- `CONTACT_FROM_EMAIL`
- A dedicated `ANALYTICS_HASH_SECRET`

Effects:

- Contact-form delivery returns `CONTACT_NOT_CONFIGURED` until Resend is
  configured.
- Analytics continues to use `AUTH_SECRET` as its hashing fallback, but a
  separate analytics secret is preferred.

These are pre-existing application configuration gaps and were not caused by
the Cloudflare migration.

## 11. Security Boundaries

- Never commit `.env`, tunnel tokens, OAuth secrets, database credentials, or
  generated backups.
- Keep PostgreSQL and Next.js unexposed on the host.
- Keep the tunnel token scoped to the `cloudflared` container.
- Keep host-level Tailscale for private administration only.
- Do not weaken Tailscale SSH policy from `check` to `accept` as part of this
  ingress migration.
- Rotate the old Tailscale application auth key if it is not used by another
  device.
- Rotate the Cloudflare tunnel token if it is ever exposed.
