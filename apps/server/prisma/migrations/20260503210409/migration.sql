-- AlterTable
ALTER TABLE "lesson" ADD COLUMN     "questionId" TEXT,
ADD COLUMN     "taskId" TEXT;

-- AddForeignKey
ALTER TABLE "lesson" ADD CONSTRAINT "lesson_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson" ADD CONSTRAINT "lesson_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
