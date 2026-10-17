import { getCookie, setCookie } from "./storage.js";

export function handleAchievementCollision(x, y, level, name, description, sprite) {
    // Get existing achievements from the cookie
    var achievements = getCookie("achievements") ?? "";
    
    // Append the new achievement to the string
    var newAchievements = achievements + level + "," + x + "," + y + "," + name + "," + description + "," + sprite + "--";
    
    // Save the updated achievements string to the cookie
    setCookie("achievements", newAchievements, 365);
}

// Parses the "achievements" cookie into objects, dropping entries with invalid coordinates.
function parseAchievements() {
    const achievements = getCookie("achievements");
    if (!achievements) {
        return [];
    }

    return achievements
        .split("--")
        .map(achievement => {
            const [level, x, y, name, description, sprite] = achievement.split(",");
            return { level, x: parseFloat(x), y: parseFloat(y), name, description, sprite };
        })
        .filter(achievement => !isNaN(achievement.x) && !isNaN(achievement.y));
}

export function checkAchievements() {
    return parseAchievements();
}

// Returns true if the achievement with this name has been completed.
export function hasAchievement(name) {
    return checkAchievements().some(achievement => achievement.name === name);
}
