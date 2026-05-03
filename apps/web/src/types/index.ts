export type Difficulty = "Iniciante" | "Intermediário" | "Avançado";
export type CourseStatus = "rascunho" | "publicado";
export type LessonType = "texto" | "vídeo" | "tarefa" | "quiz";

export interface User {
    avatarUrl?: string;
    completedCourses: number;
    email: string;
    id: string;
    role: string
    level: number;
    name: string;
    streak: number;
    xp: number;
}

export interface Lesson {
    completed?: boolean;
    content: string;
    courseId: string;
    durationMin: number;
    id: string;
    order: number;
    questionId?: string | null;
    taskId?: string | null;
    title: string;
    type: LessonType;
    videoUrl?: string;
    xp: number;
}

export interface Course {
    banner: string;
    color: string;
    description: string;
    duration: string;
    id: string;
    instructor: string;
    language: string;
    level: Difficulty;
    progress: number; // 0-100
    status: CourseStatus;
    title: string;
    totalLessons: number;
    xp: number;
}

export interface Trail {
    color: string;
    courseIds: string[];
    description: string;
    icon: string;
    id: string;
    level: Difficulty;
    name: string;
    progress: number;
    status: CourseStatus;
    totalXp: number;
}

export interface Question {
    answer?: "a" | "b" | "c" | "d";
    completed?: boolean;
    correct?: boolean;
    correctAnswer: "a" | "b" | "c" | "d";
    courseId: string;
    difficulty: Difficulty;
    explanation: string;
    id: string;
    options: { A: string; B: string; C: string; D: string };
    question: string;
    xp: number;
    xpEarned?: number;
}

export interface Task {
    answer?: string;
    completed?: boolean;
    courseId: string;
    description: string;
    estimatedTime: string;
    id: string;
    objective: string;
    requirements: string[];
    title: string;
    xp: number;
}

export interface Achievement {
    criterion: string;
    description: string;
    icon: string;
    id: string;
    name: string;
    progress?: number; // 0-100
    status: CourseStatus;
    unlocked: boolean;
    xpBonus: number;
}
