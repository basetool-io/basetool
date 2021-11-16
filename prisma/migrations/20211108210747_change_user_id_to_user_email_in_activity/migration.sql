/*
  Warnings:

  - You are about to drop the column `userId` on the `Activity` table. All the data in the column will be lost.
  - Added the required column `userEmail` to the `Activity` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_userId_fkey";

-- DropIndex
DROP INDEX "Activity_userId_idx";

-- AlterTable
ALTER TABLE "Activity" DROP COLUMN "userId",
ADD COLUMN     "userEmail" TEXT NOT NULL;
