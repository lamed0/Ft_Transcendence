/*
  Warnings:

  - The values [COOP_LOCAL] on the enum `GameMode` will be removed. If these variants are still used in the database, this will fail.
  - The values [CANCELED] on the enum `InviteStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "GameMode_new" AS ENUM ('ONEVONE_QUEUE', 'ONEVONE_INVITE');
ALTER TABLE "GameSession" ALTER COLUMN "mode" TYPE "GameMode_new" USING ("mode"::text::"GameMode_new");
ALTER TYPE "GameMode" RENAME TO "GameMode_old";
ALTER TYPE "GameMode_new" RENAME TO "GameMode";
DROP TYPE "GameMode_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "InviteStatus_new" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');
ALTER TABLE "GameInvite" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "GameInvite" ALTER COLUMN "status" TYPE "InviteStatus_new" USING ("status"::text::"InviteStatus_new");
ALTER TYPE "InviteStatus" RENAME TO "InviteStatus_old";
ALTER TYPE "InviteStatus_new" RENAME TO "InviteStatus";
DROP TYPE "InviteStatus_old";
ALTER TABLE "GameInvite" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;
