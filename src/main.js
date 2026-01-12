/**
 * Von Neumann Explorer - Main Entry Point
 */
import { Application } from 'pixi.js';
import { world, scanners, planets, probes, rovers, stations } from './ecs/world.js';
import {
  createPosition,
  createVelocity,
  createProbe,
  createRenderable,
  createMovementTarget,
  createScanner,
  createPlanet,
  createMineable,
  createRover,
  createAI,
  createSpaceStation,
  createOrbital,
  ORE_TYPES
} from './ecs/components.js';
import { movementSystem } from './ecs/systems/movementSystem.js';
import { renderingSystem } from './ecs/systems/renderingSystem.js';
import { scanningSystem } from './ecs/systems/scanningSystem.js';
import { discoverySystem } from './ecs/systems/discoverySystem.js';
import { miningSystem } from './ecs/systems/miningSystem.js';
import { aiSystem } from './ecs/systems/aiSystem.js';
import { constructionSystem, setSpawnCallbacks } from './ecs/systems/constructionSystem.js';
import { setMergeCallbacks, canMerge } from './ecs/systems/mergeSystem.js';
import { initInputSystem, getSelectedEntity, refreshSelection } from './systems/inputSystem.js';
import { createProbeGraphics } from './rendering/probeGraphics.js';
import { createScanRingGraphics, updateScanRing } from './rendering/scanRingGraphics.js';
import { createPlanetGraphics, updatePlanetGraphics } from './rendering/planetGraphics.js';
import { createRoverGraphics } from './rendering/roverGraphics.js';
import { createStationGraphics, updateStationGraphics } from './rendering/stationGraphics.js';
import { createSunGraphics, updateSunGraphics } from './rendering/sunGraphics.js';
import { orbitalSystem } from './ecs/systems/orbitalSystem.js';
import { generateProbeName, generateRoverName, generateStationName } from './utils/nameGenerator.js';
import {
  initCamera,
  updateCamera,
  applyCameraTransform,
  setCameraPosition,
  setCameraZoom,
  getCamera
} from './systems/cameraSystem.js';
import { researchSystem, setResearchCallback } from './ecs/systems/researchSystem.js';

// Game state
const gameState = {
  probeCount: 1,
  roverCount: 0,
  stationCount: 0,
  totalMatter: 0,
  systemsUnlocked: 1
};

// Store sun graphics for each system
const solarSystems = [];

let appRef = null;
let worldContainer = null;

// Planet generation settings
const PLANET_COUNT = 12;
const MIN_PLANET_DISTANCE = 100;
const SPAWN_RADIUS_MIN = 150;
const SPAWN_RADIUS_MAX = 500;

async function init() {
  const app = new Application();
  appRef = app;

  await app.init({
    background: 0x0a0a12,
    resizeTo: window,
    antialias: true,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true
  });

  document.getElementById('game-container').appendChild(app.canvas);

  // Create world container for camera transforms
  const { Container } = await import('pixi.js');
  worldContainer = new Container();
  app.stage.addChild(worldContainer);

  // Initialize camera
  initCamera(worldContainer, app.screen.width, app.screen.height);
  setCameraPosition(app.screen.width / 2, app.screen.height / 2);

  // Set up spawn callbacks
  setSpawnCallbacks(
    (x, y, isAutonomous) => spawnProbe(app, x, y, isAutonomous),
    (x, y) => spawnRover(app, x, y)
  );

  // Set up merge callbacks
  setMergeCallbacks(
    (x, y, matter) => spawnStation(app, x, y, matter),
    (probe) => removeProbe(app, probe)
  );

  // Set up research callback
  setResearchCallback(onResearchComplete);

  // Create first solar system at center
  const centerX = app.screen.width / 2;
  const centerY = app.screen.height / 2;
  createSolarSystem(app, centerX, centerY, 0);

  // Generate planets for first system
  generatePlanets(app, centerX, centerY);

  // Create the seed ship (slightly offset from sun center)
  const seedShip = spawnProbe(app, app.screen.width / 2 + 80, app.screen.height / 2, false);
  seedShip.probe.name = 'Pioneer-Prime';

  // Initialize input handling
  initInputSystem(app, onSelectionChange);

  // Start the game loop
  let totalTime = 0;
  app.ticker.add((ticker) => {
    const delta = ticker.deltaTime / 60;
    totalTime += ticker.deltaMS;

    // Update camera
    updateCamera(delta);
    applyCameraTransform(worldContainer, app.screen.width, app.screen.height);

    // Run ECS systems
    movementSystem(delta);
    orbitalSystem(delta);
    scanningSystem(delta);
    discoverySystem(delta);
    miningSystem(delta, gameState);
    aiSystem(delta);
    constructionSystem(delta, gameState);
    researchSystem(delta, gameState);
    renderingSystem();

    // Update visuals
    updateScanRings();
    updatePlanets();
    updateRovers();
    updateStations();
    updateAllSuns(totalTime);

    // Update UI
    updateUI();
  });

  console.log('Von Neumann Explorer initialized');
}

/**
 * Creates a new solar system at the specified position
 */
function createSolarSystem(app, centerX, centerY, systemIndex) {
  const sunGraphics = createSunGraphics();
  sunGraphics.x = centerX;
  sunGraphics.y = centerY;
  worldContainer.addChild(sunGraphics);

  solarSystems.push({
    index: systemIndex,
    centerX,
    centerY,
    sunGraphics
  });

  return solarSystems[solarSystems.length - 1];
}

/**
 * Update all sun graphics
 */
function updateAllSuns(time) {
  for (const system of solarSystems) {
    updateSunGraphics(system.sunGraphics, time);
  }
}

/**
 * Called when research completes
 */
function onResearchComplete(station, researchType, gameState) {
  if (researchType === 'newSystem') {
    // Calculate position for new system (offset from current)
    const systemCount = gameState.systemsUnlocked;
    const offset = 1200; // Distance between systems
    const newCenterX = appRef.screen.width / 2 + (systemCount * offset);
    const newCenterY = appRef.screen.height / 2;

    // Create new solar system
    createSolarSystem(appRef, newCenterX, newCenterY, systemCount);
    generatePlanets(appRef, newCenterX, newCenterY);

    gameState.systemsUnlocked++;

    // Zoom out to show both systems
    const midX = appRef.screen.width / 2 + ((systemCount * offset) / 2);
    setCameraPosition(midX, appRef.screen.height / 2);
    setCameraZoom(0.4);

    console.log(`New system unlocked! Total systems: ${gameState.systemsUnlocked}`);
  }
}

/**
 * Spawns a new probe
 */
function spawnProbe(app, x, y, isAutonomous = false) {
  const name = generateProbeName();
  const graphics = createProbeGraphics();
  const scanRing = createScanRingGraphics();

  worldContainer.addChild(scanRing);
  worldContainer.addChild(graphics);

  const entity = world.add({
    position: createPosition(x, y),
    velocity: createVelocity(0, 0),
    movementTarget: createMovementTarget(),
    probe: createProbe(name),
    scanner: createScanner(150),
    ai: createAI(),
    renderable: createRenderable(graphics),
    scanRingGraphics: scanRing
  });

  entity.probe.isAutonomous = isAutonomous;
  if (isAutonomous) {
    entity.ai.task = 'mine';
  }

  refreshSelection();
  return entity;
}

/**
 * Remove a probe (for merging)
 */
function removeProbe(app, probe) {
  if (probe.renderable?.graphics) {
    worldContainer.removeChild(probe.renderable.graphics);
  }
  if (probe.scanRingGraphics) {
    worldContainer.removeChild(probe.scanRingGraphics);
  }
  world.remove(probe);
  gameState.probeCount--;
}

/**
 * Spawns a new rover
 */
function spawnRover(app, x, y) {
  const name = generateRoverName();
  const graphics = createRoverGraphics();
  const scanRing = createScanRingGraphics();

  worldContainer.addChild(scanRing);
  worldContainer.addChild(graphics);

  const entity = world.add({
    position: createPosition(x, y),
    velocity: createVelocity(0, 0),
    movementTarget: createMovementTarget(),
    rover: createRover(name),
    scanner: createScanner(100),
    ai: createAI(),
    renderable: createRenderable(graphics),
    scanRingGraphics: scanRing
  });

  entity.ai.task = 'explore';
  gameState.roverCount++;

  return entity;
}

/**
 * Spawns a new space station
 */
function spawnStation(app, x, y, initialMatter = 0) {
  const name = generateStationName();
  const graphics = createStationGraphics();

  worldContainer.addChild(graphics);

  const entity = world.add({
    position: createPosition(x, y),
    station: createSpaceStation(name),
    renderable: createRenderable(graphics)
  });

  entity.station.matter = Math.min(initialMatter, entity.station.maxMatter);
  gameState.stationCount++;

  refreshSelection();
  return entity;
}

/**
 * Generates planets in orbital rings around a sun
 * Each planet stores its sun center for independent orbital calculations
 */
function generatePlanets(app, sunCenterX, sunCenterY) {
  const centerX = sunCenterX !== undefined ? sunCenterX : app.screen.width / 2;
  const centerY = sunCenterY !== undefined ? sunCenterY : app.screen.height / 2;
  const oreTypes = Object.keys(ORE_TYPES);

  // Create orbital rings - each ring has planets at a fixed distance
  const orbitalRings = [
    { radius: 150, count: 2, speed: 0.15 },
    { radius: 250, count: 3, speed: 0.10 },
    { radius: 350, count: 4, speed: 0.07 },
    { radius: 450, count: 3, speed: 0.05 }
  ];

  let totalPlanets = 0;

  for (const ring of orbitalRings) {
    const angleStep = (Math.PI * 2) / ring.count;
    const baseAngle = Math.random() * Math.PI * 2; // Randomize starting angle

    for (let i = 0; i < ring.count; i++) {
      const startAngle = baseAngle + angleStep * i + (Math.random() * 0.3 - 0.15); // Slight variation
      const orbitSpeed = ring.speed * (0.8 + Math.random() * 0.4); // Slight speed variation

      // Calculate initial position
      const x = centerX + Math.cos(startAngle) * ring.radius;
      const y = centerY + Math.sin(startAngle) * ring.radius;

      const oreType = oreTypes[Math.floor(Math.random() * oreTypes.length)];
      const radius = 15 + Math.random() * 20;
      const resources = 50 + Math.random() * 150;

      // Pass the sun center so each planet knows which sun to orbit
      createPlanetEntity(app, x, y, oreType, resources, radius, ring.radius, orbitSpeed, startAngle, centerX, centerY);
      totalPlanets++;
    }
  }

  console.log(`Generated ${totalPlanets} orbiting planets at (${centerX}, ${centerY})`);
}

/**
 * Creates a planet entity with orbital mechanics
 * Each planet stores its own sun center position for independent orbits
 */
function createPlanetEntity(app, x, y, oreType, resources, radius, orbitRadius, orbitSpeed, startAngle, sunCenterX, sunCenterY) {
  const graphics = createPlanetGraphics(oreType, radius);
  worldContainer.addChild(graphics);

  const entity = {
    position: createPosition(x, y),
    planet: createPlanet(oreType, resources, radius),
    mineable: createMineable(),
    renderable: createRenderable(graphics)
  };

  // Add orbital component if parameters provided - include sun position
  if (orbitRadius !== undefined) {
    entity.orbital = createOrbital(orbitRadius, orbitSpeed, startAngle, sunCenterX, sunCenterY);
  }

  return world.add(entity);
}

/**
 * Update scan rings
 */
function updateScanRings() {
  for (const entity of scanners) {
    if (entity.scanRingGraphics) {
      entity.scanRingGraphics.x = entity.position.x;
      entity.scanRingGraphics.y = entity.position.y;
      updateScanRing(entity.scanRingGraphics, entity.scanner, entity.scanner.range);
    }
  }
}

/**
 * Update planets
 */
function updatePlanets() {
  for (const entity of planets) {
    if (entity.renderable?.graphics) {
      updatePlanetGraphics(entity.renderable.graphics, entity.planet, entity.mineable);
    }
  }
}

/**
 * Update rovers
 */
function updateRovers() {
  for (const entity of rovers) {
    if (entity.renderable?.graphics && entity.velocity) {
      const speed = Math.sqrt(entity.velocity.x ** 2 + entity.velocity.y ** 2);
      if (speed > 1) {
        const angle = Math.atan2(entity.velocity.y, entity.velocity.x);
        entity.renderable.graphics.rotation = angle;
      }
    }
  }
}

/**
 * Update stations
 */
function updateStations() {
  for (const entity of stations) {
    if (entity.renderable?.graphics) {
      updateStationGraphics(entity.renderable.graphics, entity.station);
    }
  }
}

/**
 * Selection change callback
 */
function onSelectionChange(entity, type) {
  updateSelectedEntityUI(entity, type);
}

/**
 * Update selected entity UI
 */
function updateSelectedEntityUI(entity, type) {
  const nameEl = document.getElementById('entity-name');
  const typeEl = document.getElementById('entity-type');
  const typeRowEl = document.getElementById('entity-type-row');
  const modeEl = document.getElementById('entity-mode');
  const modeRowEl = document.getElementById('entity-mode-row');
  const matterEl = document.getElementById('entity-matter');
  const matterMaxEl = document.getElementById('entity-matter-max');
  const buildingEl = document.getElementById('entity-building-status');
  const researchEl = document.getElementById('entity-research-status');
  const mergeEl = document.getElementById('entity-merge-status');

  if (!entity) {
    if (nameEl) nameEl.textContent = '---';
    return;
  }

  if (type === 'probe' && entity.probe) {
    const { probe } = entity;

    if (nameEl) {
      nameEl.textContent = probe.name;
      nameEl.className = 'entity-name entity-probe';
    }
    if (typeEl) typeEl.textContent = 'PROBE';
    if (typeRowEl) typeRowEl.style.display = 'block';
    if (modeRowEl) modeRowEl.style.display = 'block';

    if (modeEl) {
      modeEl.textContent = probe.isAutonomous ? 'AUTO' : 'MANUAL';
      modeEl.className = probe.isAutonomous ? 'mode-auto' : 'mode-manual';
    }

    if (matterEl) matterEl.textContent = Math.floor(probe.matter);
    if (matterMaxEl) matterMaxEl.textContent = probe.maxMatter;

    if (buildingEl) {
      if (probe.isBuilding) {
        const percent = Math.floor(probe.buildProgress * 100);
        buildingEl.innerHTML = `<span class="building">BUILDING ${probe.buildTarget.toUpperCase()}: ${percent}%</span>`;
      } else if (probe.isAutonomous && entity.ai) {
        // Show AI state for autonomous probes
        const state = entity.ai.state;
        if (state === 'mining') {
          const percent = Math.floor((probe.matter / probe.maxMatter) * 100);
          buildingEl.innerHTML = `<span class="mining">MINING... ${percent}%</span>`;
        } else if (state === 'depositing') {
          buildingEl.innerHTML = `<span class="depositing">DEPOSITING...</span>`;
        } else if (state === 'traveling') {
          buildingEl.innerHTML = `<span class="traveling">TRAVELING...</span>`;
        } else {
          buildingEl.textContent = '';
        }
      } else {
        buildingEl.textContent = '';
      }
    }

    if (mergeEl) {
      if (canMerge(entity)) {
        mergeEl.innerHTML = '<span class="can-merge">READY TO MERGE (M)</span>';
      } else {
        mergeEl.textContent = '';
      }
    }

  } else if (type === 'station' && entity.station) {
    const { station } = entity;

    if (nameEl) {
      nameEl.textContent = station.name;
      nameEl.className = 'entity-name entity-station';
    }
    if (typeEl) typeEl.textContent = 'STATION';
    if (typeRowEl) typeRowEl.style.display = 'block';
    if (modeRowEl) modeRowEl.style.display = 'none';

    if (matterEl) matterEl.textContent = Math.floor(station.matter);
    if (matterMaxEl) matterMaxEl.textContent = station.maxMatter;

    if (buildingEl) {
      if (station.isBuilding) {
        const percent = Math.floor(station.buildProgress * 100);
        buildingEl.innerHTML = `<span class="building">BUILDING ${station.buildTarget.toUpperCase()}: ${percent}%</span>`;
      } else {
        buildingEl.textContent = '';
      }
    }

    if (researchEl) {
      if (station.isResearching) {
        const percent = Math.floor(station.researchProgress * 100);
        researchEl.innerHTML = `<span class="researching">RESEARCHING NEW SYSTEM: ${percent}%</span>`;
      } else if (station.matter >= 500) {
        researchEl.innerHTML = `<span class="researching">READY TO RESEARCH (T)</span>`;
      } else {
        researchEl.textContent = '';
      }
    }

    if (mergeEl) mergeEl.textContent = '';
  }

  // Clear research status for probes
  if (type === 'probe' && researchEl) {
    researchEl.textContent = '';
  }
}

/**
 * Update main UI
 */
function updateUI() {
  const probeCountEl = document.getElementById('probe-count');
  const roverCountEl = document.getElementById('rover-count');
  const stationCountEl = document.getElementById('station-count');
  const planetsDiscoveredEl = document.getElementById('planets-discovered');
  const planetsTotalEl = document.getElementById('planets-total');

  // Count probes
  let probeCount = 0;
  for (const _ of probes) probeCount++;
  gameState.probeCount = probeCount;

  // Count stations
  let stationCount = 0;
  for (const _ of stations) stationCount++;
  gameState.stationCount = stationCount;

  if (probeCountEl) probeCountEl.textContent = probeCount;
  if (roverCountEl) roverCountEl.textContent = gameState.roverCount;
  if (stationCountEl) stationCountEl.textContent = stationCount;

  // Count planets
  let discovered = 0;
  let total = 0;
  for (const planet of planets) {
    total++;
    if (planet.planet.discovered) discovered++;
  }

  if (planetsDiscoveredEl) planetsDiscoveredEl.textContent = discovered;
  if (planetsTotalEl) planetsTotalEl.textContent = total;

  // Update selected entity
  const { entity, type } = getSelectedEntity();
  updateSelectedEntityUI(entity, type);
}

// Start the game
init().catch(console.error);
