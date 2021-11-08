-- CreateTable
CREATE TABLE "Activity" (
    "id" SERIAL NOT NULL,
    "recordId" VARCHAR(255),
    "tableName" VARCHAR(255),
    "dataSourceId" INTEGER,
    "viewId" INTEGER,
    "userId" INTEGER NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "changes" JSONB NOT NULL DEFAULT E'{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Activity_dataSourceId_idx" ON "Activity"("dataSourceId");

-- CreateIndex
CREATE INDEX "Activity_viewId_idx" ON "Activity"("viewId");

-- CreateIndex
CREATE INDEX "Activity_userId_idx" ON "Activity"("userId");

-- CreateIndex
CREATE INDEX "Activity_organizationId_idx" ON "Activity"("organizationId");

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_dataSourceId_fkey" FOREIGN KEY ("dataSourceId") REFERENCES "DataSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_viewId_fkey" FOREIGN KEY ("viewId") REFERENCES "View"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
