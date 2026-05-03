import type { Achievement, Course, Lesson, Trail, User } from "@/types";

export interface DashboardResponse {
    inProgressCourses: Course[];
    recentAchievements: Achievement[];
    recommendedCourses: Course[];
    trails: Trail[];
    user: User & {
        currentXp: number;
        xpPerLevel: number;
        levelProgressPercentage: number;
    };
}

export interface CourseDetailResponse {
    course: Course;
    lessons: Lesson[];
    totalQuestions: number;
    totalTasks: number;
}

export interface CoursesResponse {
    courses: Course[];
}

export interface TrailsResponse {
    trails: Trail[];
}

export interface AchievementsResponse {
    achievements: Achievement[];
}
