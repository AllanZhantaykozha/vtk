-- DropForeignKey
ALTER TABLE "public"."GroupSubject" DROP CONSTRAINT "GroupSubject_subjectId_fkey";

-- AddForeignKey
ALTER TABLE "public"."GroupSubject" ADD CONSTRAINT "GroupSubject_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
