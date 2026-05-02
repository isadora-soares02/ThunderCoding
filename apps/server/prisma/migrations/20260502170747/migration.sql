/*
  Warnings:

  - You are about to drop the column `imageSrc` on the `course` table. All the data in the column will be lost.
  - You are about to drop the column `unitId` on the `lesson` table. All the data in the column will be lost.
  - You are about to drop the `challenge` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `challengeOption` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `challengeProgress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `unit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `userProgress` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[courseId,order]` on the table `lesson` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `description` to the `course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duration` to the `course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `instructor` to the `course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `language` to the `course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `level` to the `course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `xp` to the `course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `content` to the `lesson` table without a default value. This is not possible if the table is not empty.
  - Added the required column `courseId` to the `lesson` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `lesson` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `lesson` table without a default value. This is not possible if the table is not empty.
  - Added the required column `xp` to the `lesson` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "CourseStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "LessonType" AS ENUM ('TEXT', 'VIDEO', 'ASSIGNMENT', 'QUIZ');

-- CreateEnum
CREATE TYPE "AnswerKey" AS ENUM ('A', 'B', 'C', 'D');

-- DropForeignKey
ALTER TABLE "challenge" DROP CONSTRAINT "challenge_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "challengeOption" DROP CONSTRAINT "challengeOption_challengeId_fkey";

-- DropForeignKey
ALTER TABLE "challengeProgress" DROP CONSTRAINT "challengeProgress_challengeId_fkey";

-- DropForeignKey
ALTER TABLE "challengeProgress" DROP CONSTRAINT "challengeProgress_userId_fkey";

-- DropForeignKey
ALTER TABLE "lesson" DROP CONSTRAINT "lesson_unitId_fkey";

-- DropForeignKey
ALTER TABLE "unit" DROP CONSTRAINT "unit_courseId_fkey";

-- DropForeignKey
ALTER TABLE "userProgress" DROP CONSTRAINT "userProgress_activeCourseId_fkey";

-- DropForeignKey
ALTER TABLE "userProgress" DROP CONSTRAINT "userProgress_userId_fkey";

-- AlterTable
ALTER TABLE "course" DROP COLUMN "imageSrc",
ADD COLUMN     "banner" TEXT,
ADD COLUMN     "color" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "duration" TEXT NOT NULL,
ADD COLUMN     "instructor" TEXT NOT NULL,
ADD COLUMN     "language" TEXT NOT NULL,
ADD COLUMN     "level" "Difficulty" NOT NULL,
ADD COLUMN     "status" "CourseStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "xp" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "lesson" DROP COLUMN "unitId",
ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "courseId" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "durationMin" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "type" "LessonType" NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "videoUrl" TEXT,
ADD COLUMN     "xp" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "completedCourses" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastStudyDate" TIMESTAMP(3),
ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'USER',
ADD COLUMN     "streak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "xp" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "challenge";

-- DropTable
DROP TABLE "challengeOption";

-- DropTable
DROP TABLE "challengeProgress";

-- DropTable
DROP TABLE "unit";

-- DropTable
DROP TABLE "userProgress";

-- DropEnum
DROP TYPE "ChallengeType";

-- CreateTable
CREATE TABLE "trail" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "level" "Difficulty" NOT NULL,
    "totalXp" INTEGER NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "status" "CourseStatus" NOT NULL DEFAULT 'DRAFT',
    "color" TEXT,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trailCourse" (
    "id" TEXT NOT NULL,
    "trailId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "trailCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "optionA" TEXT NOT NULL,
    "optionB" TEXT NOT NULL,
    "optionC" TEXT NOT NULL,
    "optionD" TEXT NOT NULL,
    "correct" "AnswerKey" NOT NULL,
    "explanation" TEXT NOT NULL,
    "xp" INTEGER NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "xp" INTEGER NOT NULL,
    "estimatedTime" TEXT NOT NULL,
    "requirements" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievement" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "criterion" TEXT NOT NULL,
    "xpBonus" INTEGER NOT NULL,
    "status" "CourseStatus" NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "userCourseProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "userCourseProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "userLessonProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "userLessonProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "userAchievement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlocked" BOOLEAN NOT NULL DEFAULT false,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "userAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "userTaskProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "answer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "userTaskProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "trailCourse_trailId_courseId_key" ON "trailCourse"("trailId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "userCourseProgress_userId_courseId_key" ON "userCourseProgress"("userId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "userLessonProgress_userId_lessonId_key" ON "userLessonProgress"("userId", "lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "userAchievement_userId_achievementId_key" ON "userAchievement"("userId", "achievementId");

-- CreateIndex
CREATE UNIQUE INDEX "userTaskProgress_userId_taskId_key" ON "userTaskProgress"("userId", "taskId");

-- CreateIndex
CREATE UNIQUE INDEX "lesson_courseId_order_key" ON "lesson"("courseId", "order");

-- AddForeignKey
ALTER TABLE "trailCourse" ADD CONSTRAINT "trailCourse_trailId_fkey" FOREIGN KEY ("trailId") REFERENCES "trail"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trailCourse" ADD CONSTRAINT "trailCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson" ADD CONSTRAINT "lesson_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question" ADD CONSTRAINT "question_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userCourseProgress" ADD CONSTRAINT "userCourseProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userCourseProgress" ADD CONSTRAINT "userCourseProgress_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userLessonProgress" ADD CONSTRAINT "userLessonProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userLessonProgress" ADD CONSTRAINT "userLessonProgress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userAchievement" ADD CONSTRAINT "userAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userAchievement" ADD CONSTRAINT "userAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userTaskProgress" ADD CONSTRAINT "userTaskProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userTaskProgress" ADD CONSTRAINT "userTaskProgress_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
