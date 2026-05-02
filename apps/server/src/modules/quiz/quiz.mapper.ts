import { fromAnswerKey, fromDifficulty } from "../../utils/enums.js";

export function questionToResponse(question: any) {
    return {
        id: question.id,
        courseId: question.cursoId,
        question: question.pergunta,
        options: {
            a: question.optionA,
            b: question.optionB,
            c: question.optionC,
            d: question.optionD,
        },
        correct: fromAnswerKey(question.correct),
        explanation: question.explanation,
        xp: question.xp,
        difficulty: fromDifficulty(question.difficulty),
    };
}