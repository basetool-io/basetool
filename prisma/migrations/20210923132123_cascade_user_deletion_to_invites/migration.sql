-- DropForeignKey
ALTER TABLE "OrganizationInvitation" DROP CONSTRAINT "OrganizationInvitation_organizationUserId_fkey";

-- DropForeignKey
ALTER TABLE "OrganizationUser" DROP CONSTRAINT "OrganizationUser_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "OrganizationUser" DROP CONSTRAINT "OrganizationUser_roleId_fkey";

-- DropForeignKey
ALTER TABLE "OrganizationUser" DROP CONSTRAINT "OrganizationUser_userId_fkey";

-- AddForeignKey
ALTER TABLE "OrganizationUser" ADD CONSTRAINT "OrganizationUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationUser" ADD CONSTRAINT "OrganizationUser_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationUser" ADD CONSTRAINT "OrganizationUser_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationInvitation" ADD CONSTRAINT "OrganizationInvitation_organizationUserId_fkey" FOREIGN KEY ("organizationUserId") REFERENCES "OrganizationUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
