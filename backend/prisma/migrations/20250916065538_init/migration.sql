/*
  Warnings:

  - You are about to drop the column `subjects` on the `Group` table. All the data in the column will be lost.
  - You are about to drop the column `subject` on the `Lecture` table. All the data in the column will be lost.
  - You are about to drop the column `subjects` on the `Teacher` table. All the data in the column will be lost.
  - You are about to drop the column `subject` on the `Test` table. All the data in the column will be lost.
  - Added the required column `subjectId` to the `Lecture` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subjectId` to the `Test` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Group" DROP COLUMN "subjects";

-- AlterTable
ALTER TABLE "public"."Lecture" DROP COLUMN "subject",
ADD COLUMN     "subjectId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."Teacher" DROP COLUMN "subjects";

-- AlterTable
ALTER TABLE "public"."Test" DROP COLUMN "subject",
ADD COLUMN     "subjectId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "public"."Subject" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GroupSubject" (
    "groupId" INTEGER NOT NULL,
    "subjectId" INTEGER NOT NULL,

    CONSTRAINT "GroupSubject_pkey" PRIMARY KEY ("groupId","subjectId")
);

-- CreateTable
CREATE TABLE "public"."TeacherSubject" (
    "teacherId" INTEGER NOT NULL,
    "subjectId" INTEGER NOT NULL,

    CONSTRAINT "TeacherSubject_pkey" PRIMARY KEY ("teacherId","subjectId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subject_name_key" ON "public"."Subject"("name");

-- AddForeignKey
ALTER TABLE "public"."GroupSubject" ADD CONSTRAINT "GroupSubject_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "public"."Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GroupSubject" ADD CONSTRAINT "GroupSubject_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeacherSubject" ADD CONSTRAINT "TeacherSubject_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeacherSubject" ADD CONSTRAINT "TeacherSubject_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Test" ADD CONSTRAINT "Test_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Lecture" ADD CONSTRAINT "Lecture_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
