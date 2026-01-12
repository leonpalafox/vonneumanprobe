/**
 * Construction System
 * Handles building new probes and rovers from probes and stations
 */
import { probes, stations } from '../world.js';
import { BUILD_COSTS, BUILD_TIMES } from '../components.js';

// Callbacks for spawning new entities (set from main.js)
let spawnProbeCallback = null;
let spawnRoverCallback = null;

/**
 * Set spawn callbacks from main
 */
export function setSpawnCallbacks(probeCallback, roverCallback) {
  spawnProbeCallback = probeCallback;
  spawnRoverCallback = roverCallback;
}

/**
 * Update construction progress for all building entities
 */
export function constructionSystem(delta, gameState) {
  // Process probe construction
  for (const entity of probes) {
    const { probe, position } = entity;

    if (!probe.isBuilding) continue;

    const buildTime = BUILD_TIMES[probe.buildTarget] || 5;
    probe.buildProgress += delta / buildTime;

    if (probe.buildProgress >= 1) {
      completeProbeConstruction(entity, gameState);
    }
  }

  // Process station construction
  for (const entity of stations) {
    const { station, position } = entity;

    if (!station.isBuilding) continue;

    // Stations use faster build times
    const buildTimeKey = 'station' + station.buildTarget.charAt(0).toUpperCase() + station.buildTarget.slice(1);
    const buildTime = BUILD_TIMES[buildTimeKey] || 3;
    station.buildProgress += delta / buildTime;

    if (station.buildProgress >= 1) {
      completeStationConstruction(entity, gameState);
    }
  }
}

/**
 * Complete construction from a probe
 */
function completeProbeConstruction(entity, gameState) {
  const { probe, position } = entity;
  const target = probe.buildTarget;
  const cost = BUILD_COSTS[target];

  probe.matter -= cost;

  const angle = Math.random() * Math.PI * 2;
  const offset = 30;
  const spawnX = position.x + Math.cos(angle) * offset;
  const spawnY = position.y + Math.sin(angle) * offset;

  if (target === 'probe' && spawnProbeCallback) {
    spawnProbeCallback(spawnX, spawnY, true);
    gameState.probeCount++;
    console.log(`${probe.name} built a new probe!`);
  } else if (target === 'rover' && spawnRoverCallback) {
    spawnRoverCallback(spawnX, spawnY);
    console.log(`${probe.name} built a new rover!`);
  }

  probe.isBuilding = false;
  probe.buildProgress = 0;
  probe.buildTarget = null;

  if (entity.ai) {
    entity.ai.task = 'mine';
    entity.ai.state = 'idle';
  }
}

/**
 * Complete construction from a station
 */
function completeStationConstruction(entity, gameState) {
  const { station, position } = entity;
  const target = station.buildTarget;
  const costKey = 'station' + target.charAt(0).toUpperCase() + target.slice(1);
  const cost = BUILD_COSTS[costKey];

  station.matter -= cost;

  const angle = Math.random() * Math.PI * 2;
  const offset = 50;
  const spawnX = position.x + Math.cos(angle) * offset;
  const spawnY = position.y + Math.sin(angle) * offset;

  if (target === 'probe' && spawnProbeCallback) {
    spawnProbeCallback(spawnX, spawnY, true);
    gameState.probeCount++;
    console.log(`${station.name} manufactured a new probe!`);
  } else if (target === 'rover' && spawnRoverCallback) {
    spawnRoverCallback(spawnX, spawnY);
    console.log(`${station.name} manufactured a new rover!`);
  }

  station.isBuilding = false;
  station.buildProgress = 0;
  station.buildTarget = null;
}

/**
 * Start building from a probe (manual)
 */
export function startManualBuild(entity, target) {
  const { probe } = entity;
  const cost = BUILD_COSTS[target];

  if (!probe || probe.isBuilding) return false;
  if (probe.matter < cost) return false;

  probe.isBuilding = true;
  probe.buildProgress = 0;
  probe.buildTarget = target;

  return true;
}

/**
 * Start building from a station
 */
export function startStationBuild(entity, target) {
  const { station } = entity;
  const costKey = 'station' + target.charAt(0).toUpperCase() + target.slice(1);
  const cost = BUILD_COSTS[costKey];

  if (!station || station.isBuilding) return false;
  if (station.matter < cost) return false;

  station.isBuilding = true;
  station.buildProgress = 0;
  station.buildTarget = target;

  console.log(`${station.name} starting to build ${target}...`);

  return true;
}
