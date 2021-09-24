-- CreateTable
CREATE TABLE "OrganizationMembershipInvite" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "organizationUserId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER,
    "roleId" INTEGER,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrganizationMembershipInvite.organizationUserId_index" ON "OrganizationMembershipInvite"("organizationUserId");

-- AddForeignKey
ALTER TABLE "OrganizationMembershipInvite" ADD FOREIGN KEY ("organizationUserId") REFERENCES "OrganizationUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMembershipInvite" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMembershipInvite" ADD FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;
