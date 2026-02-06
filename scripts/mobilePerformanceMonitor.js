// Mobile Performance Monitor
// Tracks performance metrics and dynamically adjusts quality settings

export class MobilePerformanceMonitor {
    constructor(k, config = {}) {
        this.k = k;
        this.config = {
            targetFPS: 60,
            minFPS: 30,
            sampleSize: 60, // Number of frames to average
            adjustmentInterval: 5000, // Check every 5 seconds
            showDebugInfo: false,
            ...config
        };
        
        // Performance tracking
        this.frameTimes = [];
        this.lastFrameTime = performance.now();
        this.avgFPS = 60;
        this.lowestFPS = 60;
        this.adjustmentTimer = 0;
        
        // Quality levels
        this.qualityLevel = 'medium';
        this.qualitySettings = {
            ultraLow: {
                particlesEnabled: false,
                shadowsEnabled: false,
                maxRenderDistance: 400,
                spriteQuality: 0.5,
                effectsEnabled: false
            },
            low: {
                particlesEnabled: true,
                shadowsEnabled: false,
                maxRenderDistance: 600,
                spriteQuality: 0.75,
                effectsEnabled: false
            },
            medium: {
                particlesEnabled: true,
                shadowsEnabled: true,
                maxRenderDistance: 800,
                spriteQuality: 1,
                effectsEnabled: true
            },
            high: {
                particlesEnabled: true,
                shadowsEnabled: true,
                maxRenderDistance: 1000,
                spriteQuality: 1,
                effectsEnabled: true
            }
        };
        
        // Debug display
        this.debugText = null;
        if (this.config.showDebugInfo) {
            this.createDebugDisplay();
        }
        
        this.init();
    }
    
    init() {
        // Start monitoring
        this.k.onUpdate(() => this.update());
        
        // Detect initial quality based on device
        this.detectInitialQuality();
    }
    
    update() {
        // Track frame time
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;
        
        // Store frame time (convert to FPS)
        if (deltaTime > 0) {
            const fps = 1000 / deltaTime;
            this.frameTimes.push(fps);
            
            // Keep only recent samples
            if (this.frameTimes.length > this.config.sampleSize) {
                this.frameTimes.shift();
            }
            
            // Calculate average FPS
            if (this.frameTimes.length > 10) {
                this.avgFPS = this.frameTimes.reduce((a, b) => a + b) / this.frameTimes.length;
                this.lowestFPS = Math.min(...this.frameTimes);
            }
        }
        
        // Update debug display
        if (this.debugText) {
            this.debugText.text = `FPS: ${Math.round(this.avgFPS)} (Low: ${Math.round(this.lowestFPS)})\nQuality: ${this.qualityLevel}`;
        }
        
        // Check if we need to adjust quality
        this.adjustmentTimer += deltaTime;
        if (this.adjustmentTimer >= this.config.adjustmentInterval) {
            this.adjustmentTimer = 0;
            this.adjustQuality();
        }
    }
    
    detectInitialQuality() {
        // Check device capabilities
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const deviceMemory = navigator.deviceMemory || 4;
        const hardwareConcurrency = navigator.hardwareConcurrency || 4;
        
        // Detect WebGL capabilities
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        let maxTextureSize = 4096;
        
        if (gl) {
            maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
        }
        
        // Set initial quality based on detection
        if (isMobile) {
            if (deviceMemory <= 2 || hardwareConcurrency <= 2 || maxTextureSize <= 2048) {
                this.setQuality('ultraLow');
            } else if (deviceMemory <= 4 || hardwareConcurrency <= 4) {
                this.setQuality('low');
            } else {
                this.setQuality('medium');
            }
        } else {
            this.setQuality('high');
        }
    }
    
    adjustQuality() {
        // Don't adjust if FPS is good
        if (this.avgFPS >= this.config.targetFPS * 0.9) {
            return;
        }
        
        // Determine new quality level
        const currentIndex = Object.keys(this.qualitySettings).indexOf(this.qualityLevel);
        
        if (this.avgFPS < this.config.minFPS && currentIndex > 0) {
            // Decrease quality
            const newLevel = Object.keys(this.qualitySettings)[currentIndex - 1];
            this.setQuality(newLevel);
            console.log(`Decreasing quality to ${newLevel} due to low FPS: ${Math.round(this.avgFPS)}`);
        } else if (this.avgFPS > this.config.targetFPS * 0.95 && currentIndex < 3) {
            // Try increasing quality if we have headroom
            const testDuration = 2000; // Test for 2 seconds
            const originalLevel = this.qualityLevel;
            const newLevel = Object.keys(this.qualitySettings)[currentIndex + 1];
            
            this.setQuality(newLevel);
            
            // Revert if performance drops
            setTimeout(() => {
                if (this.avgFPS < this.config.targetFPS * 0.8) {
                    this.setQuality(originalLevel);
                    console.log(`Reverting quality to ${originalLevel}, couldn't maintain FPS`);
                }
            }, testDuration);
        }
    }
    
    setQuality(level) {
        if (!this.qualitySettings[level]) return;
        
        this.qualityLevel = level;
        const settings = this.qualitySettings[level];
        
        // Apply settings
        this.applyQualitySettings(settings);
        
        // Store preference
        localStorage.setItem('mobileQualityLevel', level);
    }
    
    applyQualitySettings(settings) {
        // This would integrate with your game's rendering system
        // For now, we'll dispatch a custom event that the game can listen to
        window.dispatchEvent(new CustomEvent('qualityChanged', {
            detail: {
                level: this.qualityLevel,
                settings: settings
            }
        }));
    }
    
    createDebugDisplay() {
        this.debugText = this.k.add([
            this.k.text("FPS: 0\nQuality: medium", { size: 16 }),
            this.k.pos(10, 10),
            this.k.fixed(),
            this.k.z(9999),
            this.k.color(255, 255, 255),
            this.k.outline(2, this.k.rgb(0, 0, 0))
        ]);
    }
    
    // Public API
    getAverageFPS() {
        return this.avgFPS;
    }
    
    getQualityLevel() {
        return this.qualityLevel;
    }
    
    getQualitySettings() {
        return this.qualitySettings[this.qualityLevel];
    }
    
    forceQuality(level) {
        if (this.qualitySettings[level]) {
            this.setQuality(level);
        }
    }
    
    toggleDebug() {
        this.config.showDebugInfo = !this.config.showDebugInfo;
        
        if (this.config.showDebugInfo && !this.debugText) {
            this.createDebugDisplay();
        } else if (!this.config.showDebugInfo && this.debugText) {
            this.k.destroy(this.debugText);
            this.debugText = null;
        }
    }
    
    destroy() {
        if (this.debugText) {
            this.k.destroy(this.debugText);
        }
    }
}

// Integration helper
export function setupMobilePerformance(k, options = {}) {
    const monitor = new MobilePerformanceMonitor(k, options);
    
    // Listen for quality changes and apply them
    window.addEventListener('qualityChanged', (e) => {
        const { settings } = e.detail;
        
        // Apply particle settings
        if (!settings.particlesEnabled) {
            // Disable particles in your game
            k.get("particle").forEach(p => p.paused = true);
        }
        
        // Apply render distance
        k.get("*").forEach(obj => {
            if (obj.pos) {
                const distance = obj.pos.dist(k.camPos());
                if (distance > settings.maxRenderDistance) {
                    obj.hidden = true;
                } else {
                    obj.hidden = false;
                }
            }
        });
    });
    
    return monitor;
}