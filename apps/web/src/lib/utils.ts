import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function xpToNextLevel(xp: number) {
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
