/*
  Warnings:

  - You are about to drop the column `group` on the `Student` table. All the data in the column will be lost.
  - Added the required column `groupId` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Student" DROP COLUMN "group",
ADD COLUMN     "groupId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."Test" ALTER COLUMN "description" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."Group" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "subjects" TEXT[],

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Group_name_key" ON "public"."Group"("name");

-- AddForeignKey
ALTER TABLE "public"."Student" ADD CONSTRAINT "Student_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "public"."Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
