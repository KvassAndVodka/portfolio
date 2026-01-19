#!/bin/bash

# Output file name
OUTPUT_FILE="portfolio-deploy.tar.gz"

echo "📦 Bundling project for deployment..."

# Create tarball using git ls-files to respect .gitignore, plus essential config files
# verifying if they are tracked or ignored, ensuring we grab what we need.

# We need:
# - All source code (tracked by git)
# - prisma schema & config
# - docker config
# - .env.example (for reference)
# - public/ (tracked)
# - content/ (tracked)

# Create the archive
# We use git ls-files for source, plus manually adding untracked but necessary files if any
# Since we might have local changes not committed, git ls-files might miss them if we rely only on HEAD.
# Instead, we'll use tar with exclude patterns roughly matching .gitignore but ensuring specific inclusions.

tar -czf "$OUTPUT_FILE" \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.git' \
    --exclude='*.tar.gz' \
    --exclude='.DS_Store' \
    --exclude='.env.local' \
    --exclude='.env' \
    .

echo "✅ Created $OUTPUT_FILE"
echo ""
echo "📝 Next Steps:"
echo "1. Copy this file to your Proxmox server:"
echo "   scp $OUTPUT_FILE user@your-server-ip:~/"
echo ""
echo "2. SSH into your server and run:"
echo "   mkdir portfolio && tar -xzf $OUTPUT_FILE -C portfolio"
echo "   cd portfolio"
echo "   cp .env.example .env"
echo "   # Edit .env with your secrets!"
echo "   nano .env"
echo "   docker compose up -d --build"
echo ""
