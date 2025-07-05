// Performance configuration for different quality levels
// This helps players with slower devices enjoy the game

export const PerformanceProfiles = {
  // Ultra Low - for very slow devices (targets 30 FPS)
  ultraLow: {
    tileBatching: true,
    aggressiveCulling: true,
    cullingDistance: 400,
    disableParticles: true,
    disableWaterEffects: true,
    reducedPhysicsRate: 4, // Update physics every 4 frames
    simplifiedCollisions: true,
    maxDrawDistance: 600,
    disableMultiplayer: true,
    targetFPS: 30
  },
  
  // Low - for slow devices (targets 45 FPS)
  low: {
    tileBatching: true,
    aggressiveCulling: true,
    cullingDistance: 600,
    disableParticles: false,
    disableWaterEffects: false,
    reducedPhysicsRate: 2, // Update physics every 2 frames
    simplifiedCollisions: true,
    maxDrawDistance: 800,
    disableMultiplayer: false,
    targetFPS: 45
  },
  
  // Medium - balanced performance (targets 60 FPS)
  medium: {
    tileBatching: true,
    aggressiveCulling: false,
    cullingDistance: 1000,
    disableParticles: false,
    disableWaterEffects: false,
    reducedPhysicsRate: 1, // Normal physics
    simplifiedCollisions: false,
    maxDrawDistance: 1200,
    disableMultiplayer: false,
    targetFPS: 60
  },
  
  // High - full quality (targets 60+ FPS)
  high: {
    tileBatching: false, // Use original rendering
    aggressiveCulling: false,
    cullingDistance: 2000,
    disableParticles: false,
    disableWaterEffects: false,
    reducedPhysicsRate: 1,
    simplifiedCollisions: false,
    maxDrawDistance: 2000,
    disableMultiplayer: false,
    targetFPS: 60
  }
};

// Auto-detect best performance profile based on device
export function detectBestProfile() {
  // Check if running on mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Check device memory if available
  const deviceMemory = navigator.deviceMemory || 4; // Default to 4GB if not available
  
  // Check hardware concurrency (CPU cores)
  const cpuCores = navigator.hardwareConcurrency || 4;
  
  // Simple heuristic for auto-detection
  if (isMobile) {
    if (deviceMemory <= 2 || cpuCores <= 2) {
      return 'ultraLow';
    } else if (deviceMemory <= 4 || cpuCores <= 4) {
      return 'low';
    } else {
      return 'medium';
    }
  } else {
    // Desktop
    if (deviceMemory <= 4 || cpuCores <= 2) {
      return 'low';
    } else if (deviceMemory <= 8 || cpuCores <= 4) {
      return 'medium';
    } else {
      return 'high';
    }
  }
}

// Apply performance profile to game config
export function applyPerformanceProfile(profileName, gameConfig) {
  const profile = PerformanceProfiles[profileName] || PerformanceProfiles.medium;
  
  // Merge with existing config
  Object.assign(gameConfig, {
    ...gameConfig,
    performanceProfile: profileName,
    ...profile
  });
  
  console.log(`Applied performance profile: ${profileName}`, profile);
  
  return gameConfig;
}

// Dynamic performance adjustment based on FPS
export class DynamicPerformanceManager {
  constructor(gameConfig) {
    this.gameConfig = gameConfig;
    this.fpsHistory = [];
    this.historySize = 60; // 1 second of history at 60 FPS
    this.adjustmentCooldown = 0;
    this.cooldownDuration = 300; // 5 seconds between adjustments
    this.currentQuality = gameConfig.performanceProfile || 'medium';
  }
  
  update(currentFPS) {
    // Add to history
    this.fpsHistory.push(currentFPS);
    if (this.fpsHistory.length > this.historySize) {
      this.fpsHistory.shift();
    }
    
    // Update cooldown
    if (this.adjustmentCooldown > 0) {
      this.adjustmentCooldown--;
      return;
    }
    
    // Check if we need to adjust
    const avgFPS = this.getAverageFPS();
    const targetFPS = this.gameConfig.targetFPS || 60;
    
    if (avgFPS < targetFPS * 0.8) {
      // Performance is too low, downgrade
      this.downgradeQuality();
    } else if (avgFPS > targetFPS * 0.95 && this.currentQuality !== 'high') {
      // Performance is good, consider upgrading
      this.upgradeQuality();
    }
  }
  
  getAverageFPS() {
    if (this.fpsHistory.length === 0) return 60;
    const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
    return sum / this.fpsHistory.length;
  }
  
  downgradeQuality() {
    const qualityLevels = ['ultraLow', 'low', 'medium', 'high'];
    const currentIndex = qualityLevels.indexOf(this.currentQuality);
    
    if (currentIndex > 0) {
      this.currentQuality = qualityLevels[currentIndex - 1];
      applyPerformanceProfile(this.currentQuality, this.gameConfig);
      console.log(`Performance downgraded to: ${this.currentQuality}`);
      this.adjustmentCooldown = this.cooldownDuration;
      
      // Notify the game to reload the level with new settings
      if (window.reloadLevelWithSettings) {
        window.reloadLevelWithSettings();
      }
    }
  }
  
  upgradeQuality() {
    const qualityLevels = ['ultraLow', 'low', 'medium', 'high'];
    const currentIndex = qualityLevels.indexOf(this.currentQuality);
    
    if (currentIndex < qualityLevels.length - 1) {
      this.currentQuality = qualityLevels[currentIndex + 1];
      applyPerformanceProfile(this.currentQuality, this.gameConfig);
      console.log(`Performance upgraded to: ${this.currentQuality}`);
      this.adjustmentCooldown = this.cooldownDuration;
      
      // Notify the game to reload the level with new settings
      if (window.reloadLevelWithSettings) {
        window.reloadLevelWithSettings();
      }
    }
  }
}