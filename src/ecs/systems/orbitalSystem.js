/**
 * Orbital System
 * Updates planet positions as they orbit their respective suns
 */
import { planets } from '../world.js';

/**
 * Updates all orbiting bodies
 * Each planet uses its own stored sun position
 */
export function orbitalSystem(delta) {
  for (const entity of planets) {
    if (!entity.orbital) continue;

    const { orbital, position } = entity;

    // Update orbital angle
    orbital.currentAngle += orbital.orbitSpeed * delta;

    // Keep angle in 0-2PI range
    if (orbital.currentAngle > Math.PI * 2) {
      orbital.currentAngle -= Math.PI * 2;
    }

    // Calculate new position based on orbit around THIS planet's sun
    position.x = orbital.sunX + Math.cos(orbital.currentAngle) * orbital.orbitRadius;
    position.y = orbital.sunY + Math.sin(orbital.currentAngle) * orbital.orbitRadius;
  }
}
