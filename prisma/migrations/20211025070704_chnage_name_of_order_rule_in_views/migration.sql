/*
  Warnings:

  - You are about to drop the column `orderRule` on the `View` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "View" DROP COLUMN "orderRule",
ADD COLUMN     "defaultOrder" JSONB DEFAULT E'{}';
