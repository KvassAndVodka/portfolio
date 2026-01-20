# Portfolio

A self-hosted personal portfolio and blog platform built with Next.js 16, featuring an admin dashboard, analytics, and Docker-based deployments.

## Features

- **Portfolio & Blog** – Showcase projects and publish blog posts with Markdown support
- **Admin Dashboard** – Manage content, media, and view analytics from a premium dark-themed UI
- **Media Library** – Upload and manage images for your posts
- **Visit Analytics** – Track page views with geo-location data
- **Authentication** – Secure admin access via NextAuth.js
- **Self-Hosted** – Deploy on your own infrastructure with Docker

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Styling | Tailwind CSS 4 |
| Auth | NextAuth.js v5 |
| Deployment | Docker + Docker Compose |
| Networking | Tailscale (optional) |

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- npm / yarn / pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/portfolio.git
   cd portfolio
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and fill in your database URL and auth secrets.

4. Initialize the database:
   ```bash
   npx prisma migrate dev
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to view your portfolio.

## Deployment

This project is designed for self-hosting on servers like Proxmox LXC containers.

See **[DEPLOY.md](./DEPLOY.md)** for detailed deployment instructions including:
- Docker Compose setup
- Tailscale Funnel for public access
- Production environment configuration

### Quick Deploy

```bash
# Bundle for production
./bundle_for_prod.sh

# Transfer to server
scp portfolio-deploy.tar.gz user@server:~/

# On server: unpack and launch
docker compose up -d --build
```

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── admin/       # Admin dashboard pages
│   │   ├── api/         # API routes
│   │   ├── projects/    # Public project pages
│   │   └── archives/    # Blog archive pages
│   └── ...
├── prisma/
│   └── schema.prisma    # Database schema
├── docker-compose.yml   # Production Docker config
└── Dockerfile
```

