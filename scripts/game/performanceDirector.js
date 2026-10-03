// performanceDirector.js
// Single consolidated performance manager.
//
// One FPS sample buffer and one quality decision loop avoid duplicate tracking.

import { detectBestProfile, applyPerformanceProfile, PerformanceProfiles } from './performanceConfig.js';

const QUALITY_LEVELS = ['ultraLow', 'low', 'medium', 'high'];

export class PerformanceDirector {
  constructor(k, config = {}) {
    this.k = k;
    this.config = {
      targetFPS: 60,
      minFPS: 30,
      sampleSize: 60,
      adjustmentInterval: 5000,
      showDebugInfo: false,
      cooldownDuration: 300,
      ...config,
    };

    // Single FPS sample buffer (was spread across 3 classes).
    this.fpsHistory = [];
    this.lastFrameTime = performance.now();
    this.avgFPS = 60;
    this.lowestFPS = 60;
    this.adjustmentTimer = 0;
    this.cooldown = 0;

    // Quality state.
    const initialQuality = this.detectInitialQuality();
    this.currentQuality = null;
    this.debugText = null;
    this.qualityChangeHandler = (event) => this.applyQualitySettings(event.detail.settings);
    if (typeof window !== 'undefined') window.addEventListener('qualityChanged', this.qualityChangeHandler);

    if (this.config.showDebugInfo) this.createDebugDisplay();
    if (this.k) this.k.onUpdate(() => this.tick());
    this.setQualityInternal(initialQuality, 'initial');
  }

  // Shared device heuristic used for initial profile detection.
  detectInitialQuality() {
    // Prefer persisted preference, then device detection.
    try {
      const saved = localStorage.getItem('mobileQualityLevel');
      if (saved && PerformanceProfiles[saved]) return saved;
    } catch (e) { /* storage unavailable */ }
    return detectBestProfile();
  }

  // Feed an FPS value, or pass nothing to measure from frame time.
  tick(currentFPS) {
    const now = performance.now();
    const delta = now - this.lastFrameTime;
    this.lastFrameTime = now;

    if (currentFPS == null) {
      currentFPS = delta > 0 ? 1000 / delta : 60;
    }

    this.fpsHistory.push(currentFPS);
    if (this.fpsHistory.length > this.config.sampleSize) this.fpsHistory.shift();

    if (this.fpsHistory.length > 10) {
      let sum = 0;
      for (const f of this.fpsHistory) sum += f;
      this.avgFPS = sum / this.fpsHistory.length;
      this.lowestFPS = Math.min(...this.fpsHistory);
    }

    // Debug overlay.
    if (this.debugText) {
      this.debugText.text = `FPS: ${Math.round(this.avgFPS)} (Low: ${Math.round(this.lowestFPS)})\nQuality: ${this.currentQuality}`;
    }

    // Cooldown + periodic adjustment.
    if (this.cooldown > 0) this.cooldown--;
    this.adjustmentTimer += delta;
    if (this.adjustmentTimer >= this.config.adjustmentInterval) {
      this.adjustmentTimer = 0;
      this.adjustQuality();
    }
  }

  adjustQuality() {
    if (this.cooldown > 0) return;
    // Emit a warning when average performance falls below the configured minimum.
    if (this.avgFPS < this.config.minFPS) {
      console.warn(`Low performance: ${this.avgFPS.toFixed(1)} FPS`);
    }

    const idx = QUALITY_LEVELS.indexOf(this.currentQuality);

    if (this.avgFPS < this.config.targetFPS * 0.8 && idx > 0) {
      // Downgrade (target => below 80% of target).
      this.setQualityInternal(QUALITY_LEVELS[idx - 1], 'downgrade');
      this.cooldown = this.config.cooldownDuration;
    } else if (this.avgFPS > this.config.targetFPS * 0.95 && idx < QUALITY_LEVELS.length - 1) {
      // Upgrade attempt with revert if it doesn't hold.
      this.upgradeQuality(idx);
    }
  }

  upgradeQuality(idx) {
    const originalLevel = this.currentQuality;
    const newLevel = QUALITY_LEVELS[idx + 1];
    this.setQualityInternal(newLevel, 'upgrade');

    if (this.cooldown > 0) return;
    this.cooldown = this.config.cooldownDuration;

    // Test for 2s and revert if FPS didn't hold.
    setTimeout(() => {
      if (this.avgFPS < this.config.targetFPS * 0.8) {
        this.setQualityInternal(originalLevel, 'revert');
        console.log(`Reverting quality to ${originalLevel}, couldn't maintain FPS`);
      }
    }, 2000);
  }

  // Applies a profile to gameConfig AND dispatches the qualityChanged event.
  setQualityInternal(level, reason) {
    if (!PerformanceProfiles[level]) return;
    if (level === this.currentQuality) return;
    this.currentQuality = level;
    const profile = PerformanceProfiles[level];

    // Sync the selected quality profile into the game configuration.
    if (typeof window !== 'undefined' && window.gameConfig) {
      applyPerformanceProfile(level, window.gameConfig);
    }

    // Persist preference + dispatch event.
    try { localStorage.setItem('mobileQualityLevel', level); } catch (e) {}
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('qualityChanged', {
        detail: {
          level,
          settings: {
            maxRenderDistance: profile.cullingDistance,
          },
          reason,
        },
      }));
    }

    // Legacy: reload level with new settings if the game wired this up.
    if (reason === 'downgrade' && typeof window !== 'undefined' && typeof window.reloadLevelWithSettings === 'function') {
      window.reloadLevelWithSettings();
    }

    console.log(`Performance ${reason || 'changed'} to: ${level}`);
  }

  applyQualitySettings(settings) {
    if (!this.k) return;

    // Use squared distance to avoid the square root in Vec2.dist for every object.
    const camera = this.k.camPos();
    const maxDistanceSquared = settings.maxRenderDistance ** 2;
    this.k.get('*').forEach((obj) => {
      if (!obj.pos) return;
      const dx = obj.pos.x - camera.x;
      const dy = obj.pos.y - camera.y;
      obj.hidden = dx * dx + dy * dy > maxDistanceSquared;
    });
  }

  // Public API parity with the old MobilePerformanceMonitor.
  getAverageFPS() { return this.avgFPS; }
  getQualityLevel() { return this.currentQuality; }
  getQualitySettings() {
    const profile = PerformanceProfiles[this.currentQuality];
    return {
      maxRenderDistance: profile.cullingDistance,
    };
  }
  forceQuality(level) { this.setQualityInternal(level, 'manual'); }
  setQuality(level) { this.setQualityInternal(level, 'manual'); }

  toggleDebug() {
    if (!this.k) return;
    this.config.showDebugInfo = !this.config.showDebugInfo;
    if (this.config.showDebugInfo && !this.debugText) this.createDebugDisplay();
    else if (!this.config.showDebugInfo && this.debugText) { this.k.destroy(this.debugText); this.debugText = null; }
  }

  createDebugDisplay() {
    if (!this.k) return;
    this.debugText = this.k.add([
      this.k.text('FPS: 0\nQuality: medium', { size: 16 }),
      this.k.pos(10, 10),
      this.k.fixed(),
      this.k.z(9999),
      this.k.color(255, 255, 255),
      this.k.outline(2, this.k.rgb(0, 0, 0)),
    ]);
  }

  getStats() {
    return { fps: Math.round(this.avgFPS), lowest: Math.round(this.lowestFPS), quality: this.currentQuality };
  }

  destroy() {
    if (typeof window !== 'undefined') window.removeEventListener('qualityChanged', this.qualityChangeHandler);
    if (this.debugText && this.k) this.k.destroy(this.debugText);
    this.debugText = null;
  }
}

// Shared setup helper used by the game and the mobile-controls test page.
export function setupMobilePerformance(k, options = {}) {
  return new PerformanceDirector(k, options);
}

export function setupPerformanceDirector(k, options = {}) {
  return new PerformanceDirector(k, options);
}

