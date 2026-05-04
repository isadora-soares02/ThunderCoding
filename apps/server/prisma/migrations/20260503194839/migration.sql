-- DropIndex
DROP INDEX "session_token_key";

-- CreateTable
CREATE TABLE "userQuestionProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "correct" BOOLEAN NOT NULL DEFAULT false,
    "answer" "AnswerKey",
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "userQuestionProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "userQuestionProgress_userId_questionId_key" ON "userQuestionProgress"("userId", "questionId");

-- AddForeignKey
ALTER TABLE "userQuestionProgress" ADD CONSTRAINT "userQuestionProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userQuestionProgress" ADD CONSTRAINT "userQuestionProgress_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
