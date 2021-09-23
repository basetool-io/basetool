/*
  Warnings:

  - The primary key for the `OrganizationInvitation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `OrganizationInvitation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "OrganizationInvitation" DROP CONSTRAINT "OrganizationInvitation_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "OrganizationInvitation_pkey" PRIMARY KEY ("uuid");
