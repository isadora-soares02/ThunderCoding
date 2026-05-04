import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-fetch";
import type { Question } from "@/types";

type Letter = "a" | "b" | "c" | "d";

export interface QuestionResponse {
    question: Question;
}

interface QuestionsResponse {
    questions: Question[];
}

interface AnswerQuestionResponse {
    correct: boolean;
    correctAnswer: Letter;
    explanation: string;
    unlockedAchievements: string[];
    xpEarned: number;
}

export function useQuestion(id?: string) {
    return useQuery({
        queryKey: ["question", id],
        queryFn: () => apiFetch<QuestionResponse>(`/api/questions/${id}`),
        enabled: !!id,
    });
}

export function useCourseQuestions(courseId?: string) {
    return useQuery({
        queryKey: ["course-questions", courseId],
        queryFn: () => apiFetch<QuestionsResponse>(`/api/quizzes/${courseId}`),
        enabled: !!courseId,
    });
}

export function useAnswerQuestion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: { questionId: string; answer: Letter }) =>
            apiFetch<AnswerQuestionResponse>("/api/quizzes/answer", {
                method: "POST",
                body: JSON.stringify(payload),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
            queryClient.invalidateQueries({ queryKey: ["profile"] });
            queryClient.invalidateQueries({ queryKey: ["courses"] });
            queryClient.invalidateQueries({ queryKey: ["course"] });
            queryClient.invalidateQueries({ queryKey: ["course-lessons"] });
            queryClient.invalidateQueries({ queryKey: ["course-tasks"] });
            queryClient.invalidateQueries({ queryKey: ["course-questions"] });
            queryClient.invalidateQueries({ queryKey: ["achievements"] });
        },
    });
}
