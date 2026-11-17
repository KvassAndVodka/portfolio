-- AlterTable
ALTER TABLE "Post" ADD COLUMN "revisionOfId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Post_revisionOfId_key" ON "Post"("revisionOfId");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_revisionOfId_fkey" FOREIGN KEY ("revisionOfId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;
