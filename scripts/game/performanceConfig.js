// Performance configuration for different quality levels
// This helps players with slower devices enjoy the game

export const PerformanceProfiles = {
  // Ultra Low - for very slow devices
  ultraLow: {
    batchedGroundRendering: true,
    cullingDistance: 400,
  },
  
  // Low - for slow devices
  low: {
    batchedGroundRendering: true,
    cullingDistance: 600,
  },
  
  // Medium - balanced performance
  medium: {
    batchedGroundRendering: true,
    cullingDistance: 1000,
  },
  
  // High - full quality
  high: {
    batchedGroundRendering: false, // Full sprite rendering for high-end devices
    cullingDistance: 2000,
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
