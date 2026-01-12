/**
 * AI System
 * Handles autonomous behavior for probes and rovers
 */
import { probes, planets, rovers, stations } from '../world.js';
import { BUILD_COSTS } from '../components.js';

const THINK_INTERVAL = 0.5; // Seconds between AI decisions
const WANDER_RADIUS = 300; // How far AI will wander to explore
const MINING_RANGE = 30;
const STATION_DEPOSIT_RANGE = 60; // Range to deposit at station

/**
 * Main AI system update
 */
export function aiSystem(delta) {
  // Update probe AI
  for (const entity of probes) {
    if (!entity.probe.isAutonomous || !entity.ai) continue;
    updateProbeAI(entity, delta);
  }

  // Update rover AI
  for (const entity of rovers) {
    if (!entity.ai) continue;
    updateRoverAI(entity, delta);
  }
}

/**
 * AI behavior for probes
 */
function updateProbeAI(entity, delta) {
  const { ai, probe, position, movementTarget, scanner } = entity;

  ai.thinkTimer -= delta;
  if (ai.thinkTimer > 0) return;
  ai.thinkTimer = THINK_INTERVAL;

  // If building, don't do anything else
  if (probe.isBuilding) {
    ai.state = 'building';
    return;
  }

  // Decision tree based on current task
  switch (ai.task) {
    case 'explore':
      handleExploreTask(entity);
      break;
    case 'mine':
      handleMineTask(entity);
      break;
    case 'deposit':
      handleDepositTask(entity);
      break;
    case 'build':
      handleBuildTask(entity);
      break;
    default:
      // If idle, pick a task based on situation
      pickTask(entity);
  }
}

/**
 * Explore: scan and move to unexplored areas
 */
function handleExploreTask(entity) {
  const { position, movementTarget, scanner } = entity;

  // If we can scan, do it
  if (scanner && scanner.currentCooldown <= 0 && !scanner.isScanning) {
    triggerScan(entity);
  }

  // If not moving, pick a new destination
  if (movementTarget.x === null) {
    // Find undiscovered planets or random direction
    const undiscovered = findUndiscoveredPlanet(position);
    if (undiscovered) {
      // Move toward undiscovered area (but we don't know exact position)
      // So just move in a random direction
      setRandomDestination(entity, WANDER_RADIUS);
    } else {
      // All discovered, switch to mining
      entity.ai.task = 'mine';
    }
  }
}

/**
 * Mine: find and mine discovered planets
 * Probe will stay at a planet until storage is full or commanded to move
 * Continuously tracks moving planets while traveling
 */
function handleMineTask(entity) {
  const { probe, position, movementTarget, ai } = entity;

  // Check if we're currently at a planet (within mining range)
  const currentPlanet = findPlanetInRange(position);

  if (currentPlanet && !currentPlanet.planet.depleted) {
    // Check if storage is full first
    if (probe.matter >= probe.maxMatter) {
      // Storage full! Check if there's a station to deposit at
      const nearestStation = findNearestStation(position);
      if (nearestStation) {
        ai.state = 'traveling';
        entity.ai.task = 'deposit';
        return;
      }
      // No station, just build something
      ai.state = 'idle';
      entity.ai.task = 'build';
      return;
    }

    // We're at a planet and not full - LOCK IN and mine
    ai.state = 'mining';
    ai.targetEntity = currentPlanet; // Track which planet we're mining
    // Keep position locked at planet (follow it as it orbits)
    movementTarget.x = currentPlanet.position.x;
    movementTarget.y = currentPlanet.position.y;
    return;
  }

  // Not at a planet or planet is depleted - travel to find one
  ai.state = 'traveling';

  // If storage is already full, check if we should deposit or build
  if (probe.matter >= probe.maxMatter) {
    const nearestStation = findNearestStation(position);
    if (nearestStation) {
      entity.ai.task = 'deposit';
      return;
    }
    entity.ai.task = 'build';
    return;
  }

  // Find nearest minable planet and continuously track it (planets move!)
  const target = findNearestMinablePlanet(position);

  if (target) {
    // Always update target to track orbiting planet
    ai.targetEntity = target;
    movementTarget.x = target.position.x;
    movementTarget.y = target.position.y;
  } else {
    // No planets to mine, go explore to discover more
    ai.targetEntity = null;
    entity.ai.task = 'explore';
  }
}

/**
 * Deposit: go to nearest station and transfer matter
 */
function handleDepositTask(entity) {
  const { probe, position, movementTarget, ai } = entity;

  const nearestStation = findNearestStation(position);

  if (!nearestStation) {
    // No station available, go build
    entity.ai.task = 'build';
    return;
  }

  const dx = nearestStation.position.x - position.x;
  const dy = nearestStation.position.y - position.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance <= STATION_DEPOSIT_RANGE) {
    // At station - deposit matter
    ai.state = 'depositing';
    movementTarget.x = null;
    movementTarget.y = null;

    // Transfer matter to station
    const { station } = nearestStation;
    const spaceInStation = station.maxMatter - station.matter;
    const transferAmount = Math.min(probe.matter, spaceInStation);

    if (transferAmount > 0) {
      probe.matter -= transferAmount;
      station.matter += transferAmount;
    }

    // If probe is empty or station is full, go back to mining
    if (probe.matter <= 0 || spaceInStation <= 0) {
      ai.state = 'idle';
      entity.ai.task = 'mine';
    }
  } else {
    // Travel to station
    ai.state = 'traveling';
    movementTarget.x = nearestStation.position.x;
    movementTarget.y = nearestStation.position.y;
  }
}

/**
 * Build: create new probes or rovers when we have enough matter
 */
function handleBuildTask(entity) {
  const { probe } = entity;

  // Check what we can build
  if (probe.matter >= BUILD_COSTS.probe) {
    // Prefer building probes
    startBuilding(entity, 'probe');
  } else if (probe.matter >= BUILD_COSTS.rover) {
    startBuilding(entity, 'rover');
  } else {
    // Not enough matter, go mine
    entity.ai.task = 'mine';
  }
}

/**
 * Pick a task based on current situation
 * Default behavior: mine (seek planets automatically)
 */
function pickTask(entity) {
  const { probe } = entity;

  // If we have enough matter to build, do that
  if (probe.matter >= BUILD_COSTS.probe) {
    entity.ai.task = 'build';
    return;
  }

  // Check if there are any discovered planets to mine
  const hasDiscoveredPlanets = findNearestMinablePlanet(entity.position) !== null;

  if (hasDiscoveredPlanets) {
    // Default: go mine planets
    entity.ai.task = 'mine';
  } else {
    // No discovered planets, need to explore
    entity.ai.task = 'explore';
  }
}

/**
 * AI behavior for rovers (simpler - just scan randomly)
 */
function updateRoverAI(entity, delta) {
  const { ai, rover, position, movementTarget, scanner } = entity;

  ai.thinkTimer -= delta;
  if (ai.thinkTimer > 0) return;
  ai.thinkTimer = THINK_INTERVAL * 2; // Rovers think slower

  // Rovers just wander and scan
  if (scanner && scanner.currentCooldown <= 0 && !scanner.isScanning) {
    triggerScan(entity);
  }

  // Pick random destination when idle
  if (movementTarget.x === null) {
    setRandomDestination(entity, 200);
  }
}

/**
 * Helper: trigger a scan
 */
function triggerScan(entity) {
  if (entity.scanner) {
    entity.scanner.isScanning = true;
    entity.scanner.scanProgress = 0;
  }
}

/**
 * Helper: set a random destination
 */
function setRandomDestination(entity, radius) {
  const angle = Math.random() * Math.PI * 2;
  const distance = 50 + Math.random() * radius;
  entity.movementTarget.x = entity.position.x + Math.cos(angle) * distance;
  entity.movementTarget.y = entity.position.y + Math.sin(angle) * distance;
}

/**
 * Helper: find undiscovered planet (returns true if any exist)
 */
function findUndiscoveredPlanet(position) {
  for (const planet of planets) {
    if (!planet.planet.discovered) {
      return planet;
    }
  }
  return null;
}

/**
 * Helper: find planet currently in mining range
 */
function findPlanetInRange(position) {
  for (const planet of planets) {
    if (!planet.planet.discovered) continue;

    const dx = planet.position.x - position.x;
    const dy = planet.position.y - position.y;
    const distance = Math.sqrt(dx * dx + dy * dy) - planet.planet.radius;

    if (distance <= MINING_RANGE) {
      return planet;
    }
  }
  return null;
}

/**
 * Helper: find nearest minable planet
 */
function findNearestMinablePlanet(position) {
  let closest = null;
  let closestDist = Infinity;

  for (const planet of planets) {
    if (!planet.planet.discovered || planet.planet.depleted) continue;

    const dx = planet.position.x - position.x;
    const dy = planet.position.y - position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < closestDist) {
      closestDist = dist;
      closest = planet;
    }
  }

  return closest;
}

/**
 * Helper: find nearest station
 */
function findNearestStation(position) {
  let closest = null;
  let closestDist = Infinity;

  for (const station of stations) {
    const dx = station.position.x - position.x;
    const dy = station.position.y - position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < closestDist) {
      closestDist = dist;
      closest = station;
    }
  }

  return closest;
}

/**
 * Helper: start building something
 */
function startBuilding(entity, target) {
  const { probe } = entity;
  if (probe.matter >= BUILD_COSTS[target]) {
    probe.isBuilding = true;
    probe.buildProgress = 0;
    probe.buildTarget = target;
    entity.ai.state = 'building';
  }
}
