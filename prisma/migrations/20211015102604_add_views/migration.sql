-- CreateTable
CREATE TABLE "View" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "public" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" INTEGER NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "tableName" VARCHAR(255) NOT NULL,
    "filters" JSONB NOT NULL DEFAULT E'{}',
    "orderRules" JSONB NOT NULL DEFAULT E'{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "View_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "View_createdBy_organizationId_idx" ON "View"("createdBy", "organizationId");

-- AddForeignKey
ALTER TABLE "View" ADD CONSTRAINT "View_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "View" ADD CONSTRAINT "View_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
