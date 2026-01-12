/**
 * Scanning System
 * Handles scan cooldowns and animation progress
 */
import { scanners } from '../world.js';

const SCAN_DURATION = 1.5; // seconds for full scan animation

export function scanningSystem(delta) {
  for (const entity of scanners) {
    const { scanner } = entity;

    // Update cooldown
    if (scanner.currentCooldown > 0) {
      scanner.currentCooldown -= delta;
      if (scanner.currentCooldown < 0) {
        scanner.currentCooldown = 0;
      }
    }

    // Update scan animation
    if (scanner.isScanning) {
      scanner.scanProgress += delta / SCAN_DURATION;

      if (scanner.scanProgress >= 1) {
        // Scan complete
        scanner.isScanning = false;
        scanner.scanProgress = 0;
        scanner.currentCooldown = scanner.cooldown;
      }
    }
  }
}
