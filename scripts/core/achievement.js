import { getCookie, setCookie } from "./storage.js";

export function handleAchievementCollision(x, y, level, name, description, sprite) {
    // Get existing achievements from the cookie
    var achievements = getCookie("achievements") ?? "";
    
    // Append the new achievement to the string
    var newAchievements = achievements + level + "," + x + "," + y + "," + name + "," + description + "," + sprite + "--";
    
    // Save the updated achievements string to the cookie
    setCookie("achievements", newAchievements, 365);
}

export function checkAchievements() {
    var achievements = getCookie("achievements");
    if (!achievements) {
        return [];
    }
    
    // Parse the cookie
    var achievementsArray = achievements.split("--").map(achievement => {
        var [level, x, y, name, description, sprite] = achievement.split(",");
        return { level, x: parseFloat(x), y: parseFloat(y), name, description, sprite };
    });

    // Filter out invalid achievements
    achievementsArray = achievementsArray.filter(achievement => !isNaN(achievement.x) && !isNaN(achievement.y));

    // Return the parsed achievements array
    return achievementsArray;
}

//write a function that checks if a certain achievement has been completed
export function hasAchievement(name) {
    var achievements = getCookie("achievements");
    if (!achievements) {
        return false;
    }
    
    // Parse the cookie
    var achievementsArray = achievements.split("--").map(achievement => {
        var [level, x, y, name, description, sprite] = achievement.split(",");
        return { level, x: parseFloat(x), y: parseFloat(y), name, description, sprite };
    });

    // Filter out invalid achievements
    achievementsArray = achievementsArray.filter(achievement => !isNaN(achievement.x) && !isNaN(achievement.y));

    //return true if the achievement has been completed
    //don't return the achievement itself
    return achievementsArray.some(achievement => achievement.name === name);
}
