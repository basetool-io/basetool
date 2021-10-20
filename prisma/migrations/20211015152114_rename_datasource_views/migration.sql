/*
  Warnings:

  - You are about to drop the column `datasourceId` on the `View` table. All the data in the column will be lost.
  - Added the required column `dataSourceId` to the `View` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "View" DROP CONSTRAINT "View_datasourceId_fkey";

-- DropIndex
DROP INDEX "View_createdBy_organizationId_datasourceId_idx";

-- AlterTable
ALTER TABLE "View" DROP COLUMN "datasourceId",
ADD COLUMN     "dataSourceId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "View_createdBy_organizationId_dataSourceId_idx" ON "View"("createdBy", "organizationId", "dataSourceId");

-- AddForeignKey
ALTER TABLE "View" ADD CONSTRAINT "View_dataSourceId_fkey" FOREIGN KEY ("dataSourceId") REFERENCES "DataSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
