// Optimized Mobile Touch Controls System
// High-performance touch controls with virtual joystick and gesture support

export class OptimizedTouchControls {
    constructor(k, onion, config = {}) {
        this.k = k;
        this.onion = onion;
        this.config = {
            joystickSize: 120,
            joystickDeadzone: 0.15,
            jumpSwipeThreshold: 50,
            doubleTapTime: 300,
            hapticEnabled: true,
            opacity: 0.3,
            fadeInTime: 0.2,
            fadeOutTime: 0.5,
            ...config
        };
        
        // State management
        this.touches = new Map();
        this.joystickTouch = null;
        this.gestureTouch = null;
        this.lastTapTime = 0;
        this.isVisible = false;
        this.isDragging = false;
        
        // Performance optimizations
        this.rafId = null;
        this.lastUpdate = 0;
        this.updateThrottle = 16; // 60fps
        
        // Cached values
        this.screenWidth = k.width();
        this.screenHeight = k.height();
        this.joystickCenter = { x: this.config.joystickSize, y: this.screenHeight - this.config.joystickSize };
        this.jumpZoneX = this.screenWidth * 0.6;
        
        // Control elements
        this.controls = null;
        this.joystickBase = null;
        this.joystickKnob = null;
        this.jumpIndicator = null;
        
        this.init();
    }
    
    init() {
        // Create control overlay container
        this.createControlOverlay();
        
        // Setup event listeners with passive option for better performance
        this.setupTouchListeners();
        
        // Handle screen resize
        this.k.onResize(() => {
            this.screenWidth = this.k.width();
            this.screenHeight = this.k.height();
            this.updateControlPositions();
        });
    }
    
    createControlOverlay() {
        // Create a single container for all controls
        this.controls = this.k.add([
            this.k.rect(this.screenWidth, this.screenHeight),
            this.k.pos(0, 0),
            this.k.fixed(),
            this.k.z(1000),
            this.k.opacity(0),
            this.k.color(0, 0, 0, 0),
            "touchControls"
        ]);
        
        // Virtual joystick base
        this.joystickBase = this.k.add([
            this.k.circle(this.config.joystickSize / 2),
            this.k.pos(this.joystickCenter.x, this.joystickCenter.y),
            this.k.fixed(),
            this.k.z(1001),
            this.k.opacity(0),
            this.k.color(255, 255, 255),
            this.k.outline(2, this.k.rgb(200, 200, 200)),
            "joystickBase"
        ]);
        
        // Virtual joystick knob
        this.joystickKnob = this.k.add([
            this.k.circle(this.config.joystickSize / 4),
            this.k.pos(this.joystickCenter.x, this.joystickCenter.y),
            this.k.fixed(),
            this.k.z(1002),
            this.k.opacity(0),
            this.k.color(200, 200, 200),
            "joystickKnob"
        ]);
        
        // Jump zone indicator (right side)
        this.jumpIndicator = this.k.add([
            this.k.text("Swipe Up to Jump", { size: 24 }),
            this.k.pos(this.screenWidth - 150, this.screenHeight - 100),
            this.k.fixed(),
            this.k.z(1001),
            this.k.opacity(0),
            this.k.color(255, 255, 255),
            "jumpIndicator"
        ]);
    }
    
    setupTouchListeners() {
        // Use a single touch handler for all events
        const canvas = this.k.canvas;
        
        // Touch start
        canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        
        // Touch move
        canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        
        // Touch end
        canvas.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
        canvas.addEventListener('touchcancel', this.handleTouchEnd.bind(this), { passive: false });
    }
    
    handleTouchStart(e) {
        e.preventDefault();
        
        for (const touch of e.changedTouches) {
            const pos = this.getTouchPos(touch);
            this.touches.set(touch.identifier, {
                startPos: pos,
                currentPos: pos,
                startTime: Date.now(),
                type: this.determineTouchType(pos)
            });
            
            if (pos.x < this.screenWidth * 0.4 && !this.joystickTouch) {
                // Left side - joystick
                this.joystickTouch = touch.identifier;
                this.showJoystick();
                this.updateJoystick(pos);
            } else if (pos.x > this.screenWidth * 0.6 && !this.gestureTouch) {
                // Right side - gestures
                this.gestureTouch = touch.identifier;
                this.checkDoubleTap(pos);
            }
        }
        
        this.triggerHaptic('light');
    }
    
    handleTouchMove(e) {
        e.preventDefault();
        
        const now = Date.now();
        if (now - this.lastUpdate < this.updateThrottle) return;
        this.lastUpdate = now;
        
        for (const touch of e.changedTouches) {
            const touchData = this.touches.get(touch.identifier);
            if (!touchData) continue;
            
            const pos = this.getTouchPos(touch);
            touchData.currentPos = pos;
            
            if (touch.identifier === this.joystickTouch) {
                this.updateJoystick(pos);
            } else if (touch.identifier === this.gestureTouch) {
                this.checkSwipeGesture(touchData);
            }
        }
    }
    
    handleTouchEnd(e) {
        e.preventDefault();
        
        for (const touch of e.changedTouches) {
            if (touch.identifier === this.joystickTouch) {
                this.joystickTouch = null;
                this.resetJoystick();
                this.hideJoystick();
            } else if (touch.identifier === this.gestureTouch) {
                this.gestureTouch = null;
            }
            
            this.touches.delete(touch.identifier);
        }
    }
    
    getTouchPos(touch) {
        const rect = this.k.canvas.getBoundingClientRect();
        const scaleX = this.screenWidth / rect.width;
        const scaleY = this.screenHeight / rect.height;
        
        return {
            x: (touch.clientX - rect.left) * scaleX,
            y: (touch.clientY - rect.top) * scaleY
        };
    }
    
    determineTouchType(pos) {
        if (pos.x < this.screenWidth * 0.4) return 'joystick';
        if (pos.x > this.screenWidth * 0.6) return 'gesture';
        return 'button';
    }
    
    updateJoystick(pos) {
        const dx = pos.x - this.joystickCenter.x;
        const dy = pos.y - this.joystickCenter.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = this.config.joystickSize / 2;
        
        let knobX = pos.x;
        let knobY = pos.y;
        
        if (distance > maxDistance) {
            const angle = Math.atan2(dy, dx);
            knobX = this.joystickCenter.x + Math.cos(angle) * maxDistance;
            knobY = this.joystickCenter.y + Math.sin(angle) * maxDistance;
        }
        
        // Update knob position
        this.joystickKnob.pos.x = knobX;
        this.joystickKnob.pos.y = knobY;
        
        // Calculate input values
        const inputX = (knobX - this.joystickCenter.x) / maxDistance;
        const inputY = (knobY - this.joystickCenter.y) / maxDistance;
        
        // Apply deadzone
        const magnitude = Math.sqrt(inputX * inputX + inputY * inputY);
        if (magnitude > this.config.joystickDeadzone) {
            // Move the onion based on joystick input
            const moveSpeed = 400 * inputX;
            if (Math.abs(moveSpeed) > 0) {
                this.onion.move(moveSpeed, 0);
            }
        }
    }
    
    resetJoystick() {
        // Animate knob back to center
        const knob = this.joystickKnob;
        const duration = 0.1;
        const startX = knob.pos.x;
        const startY = knob.pos.y;
        const endX = this.joystickCenter.x;
        const endY = this.joystickCenter.y;
        
        let elapsed = 0;
        const animate = (dt) => {
            elapsed += dt;
            const t = Math.min(elapsed / duration, 1);
            const ease = t * t * (3 - 2 * t); // Smooth step
            
            knob.pos.x = startX + (endX - startX) * ease;
            knob.pos.y = startY + (endY - startY) * ease;
            
            if (t < 1) {
                this.rafId = requestAnimationFrame(() => animate(0.016));
            }
        };
        
        animate(0);
    }
    
    checkSwipeGesture(touchData) {
        const dy = touchData.currentPos.y - touchData.startPos.y;
        const dx = touchData.currentPos.x - touchData.startPos.x;
        const timeElapsed = Date.now() - touchData.startTime;
        
        // Vertical swipe for jump
        if (dy < -this.config.jumpSwipeThreshold && timeElapsed < 500) {
            if (this.onion.isGrounded() || this.getJumpCount() < 2) {
                this.k.play("jump");
                this.onion.jump();
                this.incrementJumpCount();
                
                // Jump direction based on horizontal component
                if (Math.abs(dx) > 20) {
                    const moveSpeed = dx > 0 ? 400 : -400;
                    this.onion.move(moveSpeed, 0);
                }
                
                this.triggerHaptic('medium');
                touchData.startPos = touchData.currentPos; // Reset to prevent multiple jumps
            }
        }
    }
    
    checkDoubleTap(pos) {
        const now = Date.now();
        if (now - this.lastTapTime < this.config.doubleTapTime) {
            // Double tap detected - could be used for special actions
            this.triggerHaptic('heavy');
        }
        this.lastTapTime = now;
    }
    
    showJoystick() {
        if (this.isVisible) return;
        this.isVisible = true;
        
        // Fade in controls
        this.fadeElement(this.joystickBase, this.config.opacity, this.config.fadeInTime);
        this.fadeElement(this.joystickKnob, this.config.opacity * 0.8, this.config.fadeInTime);
        this.fadeElement(this.jumpIndicator, this.config.opacity * 0.5, this.config.fadeInTime);
    }
    
    hideJoystick() {
        if (!this.isVisible) return;
        this.isVisible = false;
        
        // Fade out controls
        this.fadeElement(this.joystickBase, 0, this.config.fadeOutTime);
        this.fadeElement(this.joystickKnob, 0, this.config.fadeOutTime);
        this.fadeElement(this.jumpIndicator, 0, this.config.fadeOutTime);
    }
    
    fadeElement(element, targetOpacity, duration) {
        const startOpacity = element.opacity;
        const deltaOpacity = targetOpacity - startOpacity;
        const startTime = Date.now();
        
        const update = () => {
            const elapsed = (Date.now() - startTime) / 1000;
            const progress = Math.min(elapsed / duration, 1);
            const ease = progress * progress * (3 - 2 * progress);
            
            element.opacity = startOpacity + deltaOpacity * ease;
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };
        
        update();
    }
    
    triggerHaptic(style = 'light') {
        if (!this.config.hapticEnabled) return;
        
        // Check if the Vibration API is available
        if ('vibrate' in navigator) {
            switch (style) {
                case 'light':
                    navigator.vibrate(10);
                    break;
                case 'medium':
                    navigator.vibrate(20);
                    break;
                case 'heavy':
                    navigator.vibrate(30);
                    break;
            }
        }
    }
    
    updateControlPositions() {
        // Update cached positions when screen resizes
        this.joystickCenter = { 
            x: this.config.joystickSize, 
            y: this.screenHeight - this.config.joystickSize 
        };
        
        this.joystickBase.pos = this.k.vec2(this.joystickCenter.x, this.joystickCenter.y);
        this.joystickKnob.pos = this.k.vec2(this.joystickCenter.x, this.joystickCenter.y);
        this.jumpIndicator.pos = this.k.vec2(this.screenWidth - 150, this.screenHeight - 100);
    }
    
    // Helper methods for game integration
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
        // Clean up event listeners
        const canvas = this.k.canvas;
        canvas.removeEventListener('touchstart', this.handleTouchStart);
        canvas.removeEventListener('touchmove', this.handleTouchMove);
        canvas.removeEventListener('touchend', this.handleTouchEnd);
        canvas.removeEventListener('touchcancel', this.handleTouchEnd);
        
        // Destroy game objects
        if (this.controls) this.k.destroy(this.controls);
        if (this.joystickBase) this.k.destroy(this.joystickBase);
        if (this.joystickKnob) this.k.destroy(this.joystickKnob);
        if (this.jumpIndicator) this.k.destroy(this.jumpIndicator);
        
        // Clear animation frames
        if (this.rafId) cancelAnimationFrame(this.rafId);
    }
}

// Export a simplified registration function for backward compatibility
export default function registerOptimizedTouchControls(k, onion, moveOnion, levelId, setHighLevel, rEnabled, music, applyRandomEffects, continuouslyChangeEffects, jumpCount) {
    // Use global isTouchscreen function from Kaplay
    if (!isTouchscreen()) return null;
    
    // Create the optimized touch control system
    const touchControls = new OptimizedTouchControls(k, onion, {
        hapticEnabled: true,
        opacity: 0.3
    });
    
    // Add game-specific button handlers
    const addGameButtons = () => {
        // Restart button
        const restart = k.add([
            k.sprite("restart"),
            k.pos(k.width() * 0.85, 40),
            k.fixed(),
            k.area(),
            k.scale(1.5),
            k.opacity(0.5),
            "restartBtn"
        ]);
        
        // Home button
        const home = k.add([
            k.sprite("home"),
            k.pos(k.width() * 0.92, 40),
            k.fixed(),
            k.area(),
            k.scale(1.5),
            k.opacity(0.5),
            "homeBtn"
        ]);
        
        // Music/effects button
        const dj = k.add([
            k.sprite("dj"),
            k.pos(k.width() * 0.78, 40),
            k.fixed(),
            k.area(),
            k.scale(1.5),
            k.opacity(0.5),
            "djBtn"
        ]);
        
        // Touch handlers for buttons
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
                // Animate DJ button
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
        
        return { restart, home, dj };
    };
    
    const buttons = addGameButtons();
    
    // Handle jump count reset
    k.onUpdate(() => {
        if (onion.isGrounded()) {
            touchControls.resetJumpCount();
        }
    });
    
    // Return controls for cleanup
    return {
        touchControls,
        buttons,
        destroy: () => {
            touchControls.destroy();
            k.destroy(buttons.restart);
            k.destroy(buttons.home);
            k.destroy(buttons.dj);
        }
    };
}