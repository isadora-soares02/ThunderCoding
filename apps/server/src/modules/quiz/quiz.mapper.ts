import { fromAnswerKey, fromDifficulty } from "../../utils/enums.js";

export function questionToResponse(question: any) {
    const progress = question.progress?.[0]

    return {
        id: question.id,
        courseId: question.courseId,
        question: question.question,
        options: {
            a: question.optionA,
            b: question.optionB,
            c: question.optionC,
            d: question.optionD,
        },
        correctAnswer: fromAnswerKey(question.correct),
        explanation: question.explanation,
        xp: question.xp,
        difficulty: fromDifficulty(question.difficulty),
        completed: progress?.completed ?? false,
        correct: progress?.correct ?? false,
        answer: progress?.answer
            ? fromAnswerKey(progress.answer)
            : undefined,
        xpEarned: progress?.xpEarned ?? 0
    };
}