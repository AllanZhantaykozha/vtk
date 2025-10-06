/*
  Warnings:

  - You are about to drop the column `instructorId` on the `Lecture` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `User` table. All the data in the column will be lost.
  - Added the required column `teacherId` to the `Lecture` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Lecture" DROP CONSTRAINT "Lecture_instructorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Student" DROP CONSTRAINT "Student_groupId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Test" DROP CONSTRAINT "Test_teacherId_fkey";

-- AlterTable
ALTER TABLE "public"."Lecture" DROP COLUMN "instructorId",
ADD COLUMN     "teacherId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "fullName",
ADD COLUMN     "name" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "GroupSubject_subjectId_idx" ON "public"."GroupSubject"("subjectId");

-- CreateIndex
CREATE INDEX "Lecture_subjectId_teacherId_idx" ON "public"."Lecture"("subjectId", "teacherId");

-- CreateIndex
CREATE INDEX "Option_questionId_idx" ON "public"."Option"("questionId");

-- CreateIndex
CREATE INDEX "Question_testId_idx" ON "public"."Question"("testId");

-- CreateIndex
CREATE INDEX "Subject_name_idx" ON "public"."Subject"("name");

-- CreateIndex
CREATE INDEX "TeacherSubject_subjectId_idx" ON "public"."TeacherSubject"("subjectId");

-- CreateIndex
CREATE INDEX "Test_subjectId_teacherId_idx" ON "public"."Test"("subjectId", "teacherId");

-- CreateIndex
CREATE INDEX "TestSubmission_testId_studentId_idx" ON "public"."TestSubmission"("testId", "studentId");

-- AddForeignKey
ALTER TABLE "public"."Student" ADD CONSTRAINT "Student_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "public"."Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Test" ADD CONSTRAINT "Test_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Lecture" ADD CONSTRAINT "Lecture_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;
