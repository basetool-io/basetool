/*
  Warnings:

  - Added the required column `action` to the `Activity` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "action" VARCHAR(255) NOT NULL,
ALTER COLUMN "changes" DROP NOT NULL;
