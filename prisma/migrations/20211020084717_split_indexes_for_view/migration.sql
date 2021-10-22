-- DropIndex
DROP INDEX "View_createdBy_organizationId_dataSourceId_idx";

-- CreateIndex
CREATE INDEX "View_createdBy_idx" ON "View"("createdBy");

-- CreateIndex
CREATE INDEX "View_organizationId_idx" ON "View"("organizationId");

-- CreateIndex
CREATE INDEX "View_dataSourceId_idx" ON "View"("dataSourceId");
