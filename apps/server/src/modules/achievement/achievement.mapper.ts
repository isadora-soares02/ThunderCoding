import type {
    Achievement,
    UserAchievement,
} from "../../generated/prisma/client.js";
import { fromCourseStatus } from "../../utils/enums.js";

type AchievementWithUser = Achievement & {
    users?: UserAchievement[];
};

export function achievementToResponse(achievement: AchievementWithUser) {
    const userAchievement = achievement.users?.[0];

    return {
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        criterion: achievement.criterion,
        xpBonus: achievement.xpBonus,
        unlocked: userAchievement?.unlocked ?? false,
        progress: userAchievement?.progress ?? 0,
        status: fromCourseStatus(achievement.status),
        createdAt: achievement.createdAt,
        updatedAt: achievement.updatedAt,
    };
}
