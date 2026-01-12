/**
 * ECS Components for Von Neumann Explorer
 * Components are plain data objects attached to entities
 */

/**
 * Position in 2D space
 * @typedef {Object} Position
 * @property {number} x
 * @property {number} y
 */

/**
 * Velocity for movement
 * @typedef {Object} Velocity
 * @property {number} x
 * @property {number} y
 */

/**
 * Probe component - marks entity as a probe unit
 * @typedef {Object} Probe
 * @property {number} matter - Current matter storage
 * @property {number} maxMatter - Maximum matter capacity
 * @property {boolean} isScanning - Currently scanning area
 */

/**
 * Renderable component - links to PixiJS display object
 * @typedef {Object} Renderable
 * @property {import('pixi.js').Graphics} graphics
 */

/**
 * Movement target for click-to-move behavior
 * @typedef {Object} MovementTarget
 * @property {number|null} x - Target x position (null = no target)
 * @property {number|null} y - Target y position
 */

/**
 * Scanner component for fog of war removal
 * @typedef {Object} Scanner
 * @property {number} range - Scan detection range
 * @property {number} cooldown - Time between scans
 * @property {number} currentCooldown - Current cooldown timer
 * @property {boolean} isScanning - Currently in scan animation
 * @property {number} scanProgress - Animation progress (0-1)
 */

/**
 * Creates a new Position component
 */
export function createPosition(x = 0, y = 0) {
  return { x, y };
}

/**
 * Creates a new Velocity component
 */
export function createVelocity(x = 0, y = 0) {
  return { x, y };
}

/**
 * Creates a new Probe component
 */
export function createProbe(name = 'Probe') {
  return {
    name,
    matter: 0,
    maxMatter: 100,
    isScanning: false,
    isAutonomous: false,
    isSelected: false,
    isBuilding: false,
    buildProgress: 0,
    buildTarget: null // 'probe' or 'rover'
  };
}

/**
 * Creates a new Renderable component
 */
export function createRenderable(graphics) {
  return { graphics };
}

/**
 * Creates a new MovementTarget component
 */
export function createMovementTarget(x = null, y = null) {
  return { x, y };
}

/**
 * Creates a new Scanner component
 */
export function createScanner(range = 150) {
  return {
    range,
    cooldown: 3,
    currentCooldown: 0,
    isScanning: false,
    scanProgress: 0
  };
}

/**
 * Ore types with their colors and mining rates
 */
export const ORE_TYPES = {
  iron: { color: 0x8b7355, name: 'Iron', miningRate: 1.0 },
  copper: { color: 0xcd7f32, name: 'Copper', miningRate: 1.2 },
  titanium: { color: 0x878787, name: 'Titanium', miningRate: 0.8 },
  crystal: { color: 0x88ddff, name: 'Crystal', miningRate: 0.5 },
  rare: { color: 0xaa44ff, name: 'Rare Earth', miningRate: 0.3 }
};

/**
 * Planet component
 * @typedef {Object} Planet
 * @property {string} oreType - Type of ore on this planet
 * @property {number} resources - Current resources available
 * @property {number} maxResources - Maximum resources
 * @property {number} radius - Visual radius
 * @property {boolean} discovered - Has been revealed by scanning
 * @property {boolean} depleted - All resources extracted
 */

/**
 * Creates a new Planet component
 */
export function createPlanet(oreType = 'iron', resources = 100, radius = 20) {
  return {
    oreType,
    resources,
    maxResources: resources,
    radius,
    discovered: false,
    depleted: false
  };
}

/**
 * Mineable component - marks entity as currently being mined
 * @typedef {Object} Mineable
 * @property {boolean} isBeingMined
 * @property {number} miningProgress - Visual progress indicator
 */

/**
 * Creates a new Mineable component
 */
export function createMineable() {
  return {
    isBeingMined: false,
    miningProgress: 0
  };
}

/**
 * Rover component - mobile scanning unit
 * @typedef {Object} Rover
 * @property {string} name
 * @property {string} state - 'idle', 'moving', 'scanning'
 * @property {number} scanCooldown
 */

/**
 * Creates a new Rover component
 */
export function createRover(name = 'Rover') {
  return {
    name,
    state: 'idle',
    scanCooldown: 0
  };
}

/**
 * AI component for autonomous behavior
 * @typedef {Object} AI
 * @property {string} state - Current AI state
 * @property {object|null} targetEntity - Current target
 * @property {number} thinkTimer - Time until next decision
 * @property {string} task - Current task: 'explore', 'mine', 'build', 'idle'
 */

/**
 * Creates a new AI component
 */
export function createAI() {
  return {
    state: 'idle',
    targetEntity: null,
    thinkTimer: 0,
    task: 'mine'
  };
}

/**
 * Costs for building units
 */
export const BUILD_COSTS = {
  probe: 50,
  rover: 25,
  stationProbe: 30,  // Stations build probes cheaper
  stationRover: 15   // Stations build rovers cheaper
};

/**
 * Build times in seconds
 */
export const BUILD_TIMES = {
  probe: 5,
  rover: 3,
  stationProbe: 3,  // Stations build faster
  stationRover: 2
};

/**
 * SpaceStation component - created by merging 3 probes
 * @typedef {Object} SpaceStation
 * @property {string} name
 * @property {number} matter - Current matter storage
 * @property {number} maxMatter - Much higher capacity (500)
 * @property {boolean} isBuilding
 * @property {number} buildProgress
 * @property {string|null} buildTarget
 */

/**
 * Creates a new SpaceStation component
 */
export function createSpaceStation(name = 'Station') {
  return {
    name,
    matter: 0,
    maxMatter: 500,
    isBuilding: false,
    buildProgress: 0,
    buildTarget: null,
    isResearching: false,
    researchProgress: 0,
    researchTarget: null
  };
}

/**
 * Research costs
 */
export const RESEARCH_COSTS = {
  newSystem: 500
};

/**
 * Research times in seconds
 */
export const RESEARCH_TIMES = {
  newSystem: 10
};

/**
 * Merge radius - probes must be within this distance to merge
 */
export const MERGE_RADIUS = 50;

/**
 * Orbital component for planets orbiting the sun
 * @typedef {Object} Orbital
 * @property {number} orbitRadius - Distance from sun center
 * @property {number} orbitSpeed - Radians per second
 * @property {number} currentAngle - Current position in orbit
 */

/**
 * Creates a new Orbital component
 * Each planet stores its own sun center position
 */
export function createOrbital(orbitRadius, orbitSpeed, startAngle = 0, sunX = 0, sunY = 0) {
  return {
    orbitRadius,
    orbitSpeed,
    currentAngle: startAngle,
    sunX,
    sunY
  };
}

/**
 * Sun position (center of solar system)
 */
export let sunPosition = { x: 0, y: 0 };

export function setSunPosition(x, y) {
  sunPosition.x = x;
  sunPosition.y = y;
}
