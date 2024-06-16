export function handleAchievementCollision(x, y, level, name, description, sprite) {
    // Get existing achievements from the cookie
    var achievements = getCookie("achievements");
    
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

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
