/**
 * Discovery System
 * Reveals planets when they are within scan range during a scan
 */
import { scanners, planets } from '../world.js';

/**
 * Checks if a scan has completed and reveals nearby planets
 */
export function discoverySystem(delta) {
  for (const scanner of scanners) {
    // Only check when scan animation completes (progress crosses 1.0)
    if (!scanner.scanner.isScanning) continue;

    // Check at the peak of the scan (around 50% progress for instant feedback)
    if (scanner.scanner.scanProgress >= 0.5 && scanner.scanner.scanProgress < 0.5 + delta * 2) {
      revealPlanetsInRange(scanner);
    }
  }
}

/**
 * Reveals all undiscovered planets within scanner range
 */
function revealPlanetsInRange(scannerEntity) {
  const { position, scanner } = scannerEntity;

  for (const planetEntity of planets) {
    if (planetEntity.planet.discovered) continue;

    const dx = planetEntity.position.x - position.x;
    const dy = planetEntity.position.y - position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Include planet radius in distance check
    const effectiveDistance = distance - planetEntity.planet.radius;

    if (effectiveDistance <= scanner.range) {
      planetEntity.planet.discovered = true;
      console.log(`Discovered ${planetEntity.planet.oreType} planet!`);
    }
  }
}
