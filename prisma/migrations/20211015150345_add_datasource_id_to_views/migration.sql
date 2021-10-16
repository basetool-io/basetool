/*
  Warnings:

  - Added the required column `datasourceId` to the `View` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "View_createdBy_organizationId_idx";

-- AlterTable
ALTER TABLE "View" ADD COLUMN     "datasourceId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "View_createdBy_organizationId_datasourceId_idx" ON "View"("createdBy", "organizationId", "datasourceId");

-- AddForeignKey
ALTER TABLE "View" ADD CONSTRAINT "View_datasourceId_fkey" FOREIGN KEY ("datasourceId") REFERENCES "DataSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
