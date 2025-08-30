-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'USER',
ALTER COLUMN "password" DROP NOT NULL;
