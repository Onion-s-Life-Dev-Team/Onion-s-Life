export default function registerTouchControls(onion, moveOnion, levelId, setHighLevel, rEnabled, music, applyRandomEffects, continuouslyChangeEffects, jumpCount) {
    if (isTouch()) {
        const leftArrow = add([
            sprite("leftmove"),
            "leftArrow",
            pos(20, height() * 0.8),
            fixed(),
            scale(2),
            area(),
        ]);
        const rightArrow = add([
            sprite("rightmove"),
            "rightArrow",
            pos(120, height() * 0.8),
            fixed(),
            scale(2),
            area(),
        ]);
        const jump = add([
            sprite("jumpbutton"),
            "jump",
            pos(width() * 0.8, height() * 0.8),
            fixed(),
            scale(2),
            area(),
        ]);
        const jumpright = add([
            sprite("jumpright"),
            "jumpright",
            pos(120, height() * 0.7),
            fixed(),
            scale(2),
            area(),
        ]);
        const jumpleft = add([
            sprite("jumpleft"),
            "jumpleft",
            pos(20, height() * 0.7),
            fixed(),
            scale(2),
            area(),
        ]);
        const restart = add([
            sprite("restart"),
            pos(width() * 0.8, height() * 0.15),
            fixed(),
            area(),
            scale(2),
        ]);
        const home = add([
            sprite("home"),
            "b",
            area(),
            fixed(),
            scale(2),
            pos(width() * 0.9, height() * 0.15),
        ]);
        const dj = add([
            sprite("dj"),
            area(),
            fixed(),
            scale(2),
            pos(width() * 0.7, height() * 0.15),
        ]);

        let touching = false;
        let arrowClicked = null;
        let maxJumps = 2;
        let djRotation = 0; // Variable to track the rotation angle
        let isDjAnimating = false; // Variable to track the animation state

        onTouchStart((id, pos) => {
        touching = true;
        if (rightArrow.hasPoint(pos)) {
            arrowClicked = "right";
            rightArrow.scale = vec2(1.8); // Scale down the right arrow
        }
        //basically replicate the crazy music behavior
        if (dj.hasPoint(pos)) {
            if (!isDjAnimating) {
            isDjAnimating = true;
            const startTime = time(); // Store the start time of the animation
            action(() => {
                const elapsedTime = time() - startTime; // Calculate the elapsed time since the animation started
                djRotation += dt() * 360; // Increase the rotation angle per frame
                dj.angle = djRotation; // Apply the rotation angle to the button

                // Add movement effect
                const movementAmount = Math.sin(time() * 4) * 4; // Adjust the movement intensity and speed
                dj.move(movementAmount, 0);

                // Add scaling effect
                const scaleAmount = 1 + Math.sin(time() * 4) * 0.2; // Adjust the scale intensity and speed
                dj.scale = vec2(scaleAmount);

                // Stop the spinning animation after a certain duration or condition
                if (elapsedTime >= 1) { // Adjust the duration as desired
                isDjAnimating = false;
                dj.angle = 0; // Reset the rotation angle
                dj.scale = vec2(2); // Reset the scale
                dj.pos = vec2(width() * 0.7, height() * 0.15); // Reset the position
                }
            });
            }
            if (music && music.isPaused()) {
            applyRandomEffects();
            } else {
            applyRandomEffects();
            continuouslyChangeEffects();
            }
        }

        if (leftArrow.hasPoint(pos)) {
            arrowClicked = "left";
            leftArrow.scale = vec2(1.8); // Scale down the left arrow
        }
        if (jump.hasPoint(pos)) {
            arrowClicked = "jump";
            jump.scale = vec2(1.8); // Scale down the jump button
            if (jumpCount < maxJumps || onion.isGrounded()) {
            play("jump");
            onion.jump();
            jumpCount++;
            }
        }
        if (jumpright.hasPoint(pos)) {
            arrowClicked = "jumpright";
            jumpright.scale = vec2(1.8); // Scale down the jumpright button
            if (jumpCount < maxJumps || onion.isGrounded()) {
            play("jump");
            onion.jump();
            if (!onion.isGrounded()) {
                // If onion is not on the ground, move it to the right while jumping
                moveOnion(false, 400);
            }
            jumpCount++;
            }
        }
        if (jumpleft.hasPoint(pos)) {
            arrowClicked = "jumpleft";
            jumpleft.scale = vec2(1.8); // Scale down the jumpleft button
            if (jumpCount < maxJumps || onion.isGrounded()) {
            play("jump");
            onion.jump();
            if (!onion.isGrounded()) {
                // If onion is not on the ground, move it
                moveOnion(true, 400);
            }
            jumpCount++;
            }
        }
        if (rEnabled) {
            if (restart.hasPoint(pos)) {
            music.pause();
            go("game", {
                levelId: levelId,
            });
            }
        }
        if (home.hasPoint(pos)) {
            music.pause();
            setHighLevel(levelId);
            go("title");
        }
        });

        action(() => {
        if (touching) {
            if (arrowClicked == "left") {
            moveOnion(true, 400)
            }
            if (arrowClicked == "right") {
            moveOnion(false, 400)
            }
        }
        if (onion.isGrounded()) {
            jumpCount = 0;
        }
        if (arrowClicked == "jumpright") {
            moveOnion(false, 400)
        }
        if (arrowClicked == "jumpleft") {
            moveOnion(true, 400)
        }
        });

        onTouchEnd(() => {
        touching = false;
        arrowClicked = null;
        leftArrow.scale = vec2(2); // Scale the left arrow back to normal
        rightArrow.scale = vec2(2); // Scale the right arrow back to normal
        jump.scale = vec2(2); // Scale the jump button back to normal
        jumpright.scale = vec2(2); // Scale the jumpright button back to normal
        jumpleft.scale = vec2(2); // Scale the jumpleft button back to normal
        });

    }
}