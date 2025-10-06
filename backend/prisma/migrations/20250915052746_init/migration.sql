-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "login" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Teacher" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "subjects" TEXT[],

    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Student" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "group" TEXT NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Admin" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Test" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "teacherId" INTEGER NOT NULL,
    "uploadDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Test_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Question" (
    "id" SERIAL NOT NULL,
    "testId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "image" TEXT,
    "type" TEXT NOT NULL DEFAULT 'single',
    "correct" INTEGER[],

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Option" (
    "id" SERIAL NOT NULL,
    "questionId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "Option_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TestSubmission" (
    "id" SERIAL NOT NULL,
    "testId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "answers" JSONB NOT NULL,
    "score" INTEGER NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Lecture" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "instructorId" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "uploadDate" TIMESTAMP(3) NOT NULL,
    "fileContent" BYTEA NOT NULL,

    CONSTRAINT "Lecture_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_login_key" ON "public"."User"("login");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_userId_key" ON "public"."Teacher"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_userId_key" ON "public"."Student"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_userId_key" ON "public"."Admin"("userId");

-- AddForeignKey
ALTER TABLE "public"."Teacher" ADD CONSTRAINT "Teacher_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Student" ADD CONSTRAINT "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Admin" ADD CONSTRAINT "Admin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Test" ADD CONSTRAINT "Test_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Question" ADD CONSTRAINT "Question_testId_fkey" FOREIGN KEY ("testId") REFERENCES "public"."Test"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Option" ADD CONSTRAINT "Option_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TestSubmission" ADD CONSTRAINT "TestSubmission_testId_fkey" FOREIGN KEY ("testId") REFERENCES "public"."Test"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TestSubmission" ADD CONSTRAINT "TestSubmission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Lecture" ADD CONSTRAINT "Lecture_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "public"."Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
