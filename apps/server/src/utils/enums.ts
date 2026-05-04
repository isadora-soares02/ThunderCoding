import type {
    AnswerKey,
    CourseStatus,
    Difficulty,
    LessonType,
} from "../generated/prisma/enums";

export function toDifficulty(value: string): Difficulty {
    const map: Record<string, Difficulty> = {
        Iniciante: "BEGINNER",
        Intermediário: "INTERMEDIATE",
        Avançado: "ADVANCED",
    };

    return map[value] ?? "BEGINNER";
}

export function fromDifficulty(value: Difficulty) {
    const map: Record<Difficulty, string> = {
        BEGINNER: "Iniciante",
        INTERMEDIATE: "Intermediário",
        ADVANCED: "Avançado",
    };

    return map[value];
}

export function toCourseStatus(value: string): CourseStatus {
    const map: Record<string, CourseStatus> = {
        rascunho: "DRAFT",
        publicado: "PUBLISHED",
    };

    return map[value] ?? "DRAFT";
}

export function fromCourseStatus(value: CourseStatus) {
    const map: Record<CourseStatus, string> = {
        DRAFT: "rascunho",
        PUBLISHED: "publicado",
    };

    return map[value];
}

export function toLessonType(value: string): LessonType {
    const map: Record<string, LessonType> = {
        texto: "TEXT",
        vídeo: "VIDEO",
        tarefa: "ASSIGNMENT",
        quiz: "QUIZ",
    };

    return map[value] ?? "TEXT";
}

export function fromLessonType(value: LessonType) {
    const map: Record<LessonType, string> = {
        TEXT: "texto",
        VIDEO: "vídeo",
        ASSIGNMENT: "tarefa",
        QUIZ: "quiz",
    };

    return map[value];
}

export function toAnswerKey(value: string): AnswerKey {
    const map: Record<string, AnswerKey> = {
        a: "A",
        b: "B",
        c: "C",
        d: "D",
    };

    return map[value] ?? "A";
}

export function fromAnswerKey(value: AnswerKey) {
    const map: Record<AnswerKey, string> = {
        A: "a",
        B: "b",
        C: "c",
        D: "d",
    };

    return map[value];
}
