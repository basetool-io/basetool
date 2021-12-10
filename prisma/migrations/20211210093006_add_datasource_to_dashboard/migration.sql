/*
  Warnings:

  - Added the required column `dataSourceId` to the `Dashboard` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Dashboard" ADD COLUMN     "dataSourceId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "Dashboard_dataSourceId_idx" ON "Dashboard"("dataSourceId");

-- AddForeignKey
ALTER TABLE "Dashboard" ADD CONSTRAINT "Dashboard_dataSourceId_fkey" FOREIGN KEY ("dataSourceId") REFERENCES "DataSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
