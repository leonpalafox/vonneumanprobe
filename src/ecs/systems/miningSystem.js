/**
 * Mining System
 * Handles resource extraction when probes are near discovered planets
 */
import { probes, mineables } from '../world.js';
import { ORE_TYPES } from '../components.js';

const MINING_RANGE = 30; // Distance from planet surface to mine
const BASE_MINING_RATE = 5; // Resources per second

/**
 * Updates mining for all probes near mineable planets
 */
export function miningSystem(delta, gameState) {
  // Reset all mining states
  for (const mineable of mineables) {
    mineable.mineable.isBeingMined = false;
  }

  // Check each probe for mining opportunities
  for (const probe of probes) {
    if (probe.probe.matter >= probe.probe.maxMatter) continue; // Probe full

    // Find closest discovered, non-depleted planet
    let closestPlanet = null;
    let closestDistance = Infinity;

    for (const planetEntity of mineables) {
      const { planet, position } = planetEntity;

      // Skip undiscovered or depleted planets
      if (!planet.discovered || planet.depleted) continue;

      const dx = position.x - probe.position.x;
      const dy = position.y - probe.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const surfaceDistance = distance - planet.radius;

      if (surfaceDistance < closestDistance) {
        closestDistance = surfaceDistance;
        closestPlanet = planetEntity;
      }
    }

    // Mine if within range
    if (closestPlanet && closestDistance <= MINING_RANGE) {
      const { planet, mineable } = closestPlanet;
      const ore = ORE_TYPES[planet.oreType] || ORE_TYPES.iron;

      // Calculate extraction amount
      const miningRate = BASE_MINING_RATE * ore.miningRate;
      const spaceInProbe = probe.probe.maxMatter - probe.probe.matter;
      const availableResources = planet.resources;
      const extracted = Math.min(miningRate * delta, spaceInProbe, availableResources);

      // Transfer resources
      planet.resources -= extracted;
      probe.probe.matter += extracted;
      gameState.totalMatter += extracted;

      // Update mining visual state
      mineable.isBeingMined = true;
      mineable.miningProgress += delta * 3; // Animation speed

      // Check if depleted
      if (planet.resources <= 0) {
        planet.resources = 0;
        planet.depleted = true;
        console.log(`${ore.name} planet depleted!`);
      }
    }
  }
}
