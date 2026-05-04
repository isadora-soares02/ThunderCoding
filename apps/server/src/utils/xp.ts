export function calculateLevel(xp: number) {
    const xpPerLevel = 500;

    const level = Math.floor(xp / xpPerLevel) + 1;
    const currentXp = xp % xpPerLevel;

    return {
        level,
        currentXp,
        xpPerLevel,
        percentage: (currentXp / xpPerLevel) * 100,
    };
}