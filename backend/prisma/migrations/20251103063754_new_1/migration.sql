-- AlterTable
ALTER TABLE "public"."Task" ADD COLUMN     "status" "public"."TestSubmissionStatus" NOT NULL DEFAULT 'PENDING';
