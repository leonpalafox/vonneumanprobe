/**
 * Name Generator
 * Generates random sci-fi names for probes and rovers
 */

const PREFIXES = [
  'Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Theta', 'Omega',
  'Nova', 'Pulsar', 'Quasar', 'Nebula', 'Comet', 'Stellar', 'Cosmic', 'Astro',
  'Pioneer', 'Voyager', 'Explorer', 'Seeker', 'Wanderer', 'Pathfinder',
  'Echo', 'Apex', 'Zenith', 'Horizon', 'Vector', 'Vertex', 'Helix', 'Axis'
];

const SUFFIXES = [
  'Prime', 'One', 'Zero', 'Core', 'Node', 'Unit', 'Mark', 'Gen',
  'X', 'V', 'IX', 'VII', 'III', 'II'
];

const NUMBERS = ['01', '02', '03', '04', '05', '07', '09', '11', '13', '17', '23', '42', '77', '99'];

const STATION_NAMES = [
  'Citadel', 'Bastion', 'Sanctuary', 'Nexus', 'Hub', 'Forge', 'Foundry',
  'Outpost', 'Haven', 'Beacon', 'Waystation', 'Stronghold', 'Spire'
];

const GREEK_LETTERS = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta'];

let probeCounter = 0;
let roverCounter = 0;
let stationCounter = 0;

/**
 * Generates a random probe name
 */
export function generateProbeName() {
  probeCounter++;
  const prefix = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
  const useSuffix = Math.random() > 0.5;

  if (useSuffix) {
    const suffix = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
    return `${prefix}-${suffix}`;
  } else {
    const number = NUMBERS[Math.floor(Math.random() * NUMBERS.length)];
    return `${prefix}-${number}`;
  }
}

/**
 * Generates a random rover name
 */
export function generateRoverName() {
  roverCounter++;
  const number = String(roverCounter).padStart(3, '0');
  const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  return `RV-${letter}${number}`;
}

/**
 * Generates a random station name
 */
export function generateStationName() {
  stationCounter++;
  const baseName = STATION_NAMES[Math.floor(Math.random() * STATION_NAMES.length)];
  const letter = GREEK_LETTERS[Math.floor(Math.random() * GREEK_LETTERS.length)];
  return `${baseName}-${letter}`;
}

/**
 * Resets counters (for new game)
 */
export function resetNameCounters() {
  probeCounter = 0;
  roverCounter = 0;
  stationCounter = 0;
}
