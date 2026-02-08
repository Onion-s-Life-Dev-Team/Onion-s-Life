// Mobile Touch Controls - Simple button-based for platformer
// Uses Kaplay's built-in touch API (not raw canvas events)

export class OptimizedTouchControls {
    constructor(k, onion, config = {}) {
        this.k = k;
        this.onion = onion;
        this.config = {
            hapticEnabled: true,
            opacity: 0.6,
            ...config
        };

        this.holding = { left: false, right: false };
        this.screenWidth = k.width();
        this.screenHeight = k.height();

        this.leftBtn = null;
        this.rightBtn = null;
        this.jumpBtn = null;

        this.init();
    }

    init() {
        this.createButtons();
        this.setupTouchHandlers();
        this.setupMovementLoop();
    }

    createButtons() {
        const k = this.k;
        const bottomY = this.screenHeight * 0.8;

        // Left button
        this.leftBtn = k.add([
            k.sprite("leftmove"),
            k.pos(20, bottomY),
            k.fixed(),
            k.z(1001),
            k.opacity(this.config.opacity),
            k.scale(2),
            k.area(),
            "mobileLeft"
        ]);

        // Right button
        this.rightBtn = k.add([
            k.sprite("rightmove"),
            k.pos(120, bottomY),
            k.fixed(),
            k.z(1001),
            k.opacity(this.config.opacity),
            k.scale(2),
            k.area(),
            "mobileRight"
        ]);

        // Jump button (right side)
        this.jumpBtn = k.add([
            k.sprite("jumpbutton"),
            k.pos(this.screenWidth * 0.8, bottomY),
            k.fixed(),
            k.z(1001),
            k.opacity(this.config.opacity),
            k.scale(2),
            k.area(),
            "mobileJump"
        ]);
    }

    setupTouchHandlers() {
        const k = this.k;

        k.onTouchStart((pos) => {
            if (this.leftBtn.hasPoint(pos)) {
                this.holding.left = true;
                this.leftBtn.scale = k.vec2(1.8);
            }
            if (this.rightBtn.hasPoint(pos)) {
                this.holding.right = true;
                this.rightBtn.scale = k.vec2(1.8);
            }
            if (this.jumpBtn.hasPoint(pos)) {
                this.jumpBtn.scale = k.vec2(1.8);
                if (this.onion.isGrounded() || this.getJumpCount() < 2) {
                    k.play("jump");
                    this.onion.jump();
                    this.incrementJumpCount();
                    this.triggerHaptic('medium');
                }
            }
        });

        k.onTouchEnd(() => {
            this.holding.left = false;
            this.holding.right = false;
            this.leftBtn.scale = k.vec2(2);
            this.rightBtn.scale = k.vec2(2);
            this.jumpBtn.scale = k.vec2(2);
        });
    }

    setupMovementLoop() {
        this.k.onUpdate(() => {
            if (this.holding.left) {
                this.onion.move(-400, 0);
            }
            if (this.holding.right) {
                this.onion.move(400, 0);
            }
        });
    }

    triggerHaptic(style = 'light') {
        if (!this.config.hapticEnabled) return;
        if ('vibrate' in navigator) {
            switch (style) {
                case 'light': navigator.vibrate(10); break;
                case 'medium': navigator.vibrate(20); break;
                case 'heavy': navigator.vibrate(30); break;
            }
        }
    }

    getJumpCount() {
        return this.onion.jumpCount || 0;
    }

    incrementJumpCount() {
        this.onion.jumpCount = (this.onion.jumpCount || 0) + 1;
    }

    resetJumpCount() {
        this.onion.jumpCount = 0;
    }

    destroy() {
        const k = this.k;
        if (this.leftBtn) k.destroy(this.leftBtn);
        if (this.rightBtn) k.destroy(this.rightBtn);
        if (this.jumpBtn) k.destroy(this.jumpBtn);
    }
}

// Export registration function
export default function registerOptimizedTouchControls(k, onion, moveOnion, levelId, setHighLevel, rEnabled, music, applyRandomEffects, continuouslyChangeEffects, jumpCount) {
    if (!isTouchscreen()) return null;

    const touchControls = new OptimizedTouchControls(k, onion, {
        hapticEnabled: true,
        opacity: 0.6
    });

    // Game-specific buttons (restart, home, dj)
    const restart = k.add([
        k.sprite("restart"),
        k.pos(k.width() * 0.85, 40),
        k.fixed(),
        k.area(),
        k.scale(1.5),
        k.opacity(0.5),
        "restartBtn"
    ]);

    const home = k.add([
        k.sprite("home"),
        k.pos(k.width() * 0.92, 40),
        k.fixed(),
        k.area(),
        k.scale(1.5),
        k.opacity(0.5),
        "homeBtn"
    ]);

    const dj = k.add([
        k.sprite("dj"),
        k.pos(k.width() * 0.78, 40),
        k.fixed(),
        k.area(),
        k.scale(1.5),
        k.opacity(0.5),
        "djBtn"
    ]);

    k.onTouchStart((pos) => {
        if (restart.hasPoint(pos) && rEnabled) {
            touchControls.triggerHaptic('medium');
            music.stop();
            k.go("game", { levelId: levelId });
        }
        if (home.hasPoint(pos)) {
            touchControls.triggerHaptic('medium');
            music.stop();
            setHighLevel(levelId);
            k.go("title");
        }
        if (dj.hasPoint(pos)) {
            touchControls.triggerHaptic('light');
            dj.scaleTo(1.8);
            k.wait(0.1, () => dj.scaleTo(1.5));
            if (music && music.paused) {
                applyRandomEffects();
            } else {
                applyRandomEffects();
                continuouslyChangeEffects();
            }
        }
    });

    // Reset jump count when grounded
    k.onUpdate(() => {
        if (onion.isGrounded()) {
            touchControls.resetJumpCount();
        }
    });

    return {
        touchControls,
        buttons: { restart, home, dj },
        destroy: () => {
            touchControls.destroy();
            k.destroy(restart);
            k.destroy(home);
            k.destroy(dj);
        }
    };
}
