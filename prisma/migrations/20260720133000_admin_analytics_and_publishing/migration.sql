-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'SCHEDULED');

-- AlterTable
ALTER TABLE "Post" ADD COLUMN "status" "PostStatus" NOT NULL DEFAULT 'PUBLISHED';

-- AlterTable
ALTER TABLE "Visit"
ADD COLUMN "latitude" DOUBLE PRECISION,
ADD COLUMN "longitude" DOUBLE PRECISION,
ADD COLUMN "event" TEXT NOT NULL DEFAULT 'page_view';

-- CreateIndex
CREATE INDEX "Visit_event_createdAt_idx" ON "Visit"("event", "createdAt");
