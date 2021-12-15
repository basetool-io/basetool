-- CreateTable
CREATE TABLE "DashboardItem" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "dashboardId" INTEGER NOT NULL,
    "query" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "options" JSONB NOT NULL DEFAULT E'{}',
    "createdBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DashboardItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DashboardItem_createdBy_idx" ON "DashboardItem"("createdBy");

-- CreateIndex
CREATE INDEX "DashboardItem_dashboardId_idx" ON "DashboardItem"("dashboardId");

-- AddForeignKey
ALTER TABLE "DashboardItem" ADD CONSTRAINT "DashboardItem_dashboardId_fkey" FOREIGN KEY ("dashboardId") REFERENCES "Dashboard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DashboardItem" ADD CONSTRAINT "DashboardItem_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
