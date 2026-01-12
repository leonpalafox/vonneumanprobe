/**
 * Input System
 * Handles mouse/touch input for selection, movement, scanning, building, merging,
 * camera zoom and panning
 */
import { probes, stations } from '../ecs/world.js';
import { startManualBuild, startStationBuild } from '../ecs/systems/constructionSystem.js';
import { canMerge, getProbeCluster, executeMerge } from '../ecs/systems/mergeSystem.js';
import { BUILD_COSTS, RESEARCH_COSTS } from '../ecs/components.js';
import { startResearch, canResearch } from '../ecs/systems/researchSystem.js';
import {
  zoomCamera,
  startPan,
  updatePan,
  stopPan,
  isPanning,
  screenToWorld
} from './cameraSystem.js';

let selectedEntity = null; // Can be probe or station
let selectedType = null; // 'probe' or 'station'
let canvas = null;
let onSelectionChange = null;
let isMiddleMouseDown = false;

export function initInputSystem(app, selectionCallback) {
  canvas = app.canvas;
  onSelectionChange = selectionCallback;

  // Mouse wheel zoom
  canvas.addEventListener('wheel', (event) => {
    event.preventDefault();
    const zoomDelta = event.deltaY > 0 ? -0.1 : 0.1;
    zoomCamera(zoomDelta, event.clientX, event.clientY);
  }, { passive: false });

  // Middle mouse / right mouse for panning
  canvas.addEventListener('mousedown', (event) => {
    if (event.button === 1) { // Middle mouse
      event.preventDefault();
      isMiddleMouseDown = true;
      startPan(event.clientX, event.clientY);
    }
  });

  canvas.addEventListener('mousemove', (event) => {
    if (isMiddleMouseDown) {
      updatePan(event.clientX, event.clientY);
    }
  });

  canvas.addEventListener('mouseup', (event) => {
    if (event.button === 1) {
      isMiddleMouseDown = false;
      stopPan();
    }
  });

  canvas.addEventListener('mouseleave', () => {
    if (isMiddleMouseDown) {
      isMiddleMouseDown = false;
      stopPan();
    }
  });

  // Left-click: select entity or move (convert to world coords)
  canvas.addEventListener('mousedown', (event) => {
    if (event.button !== 0) return; // Only left click
    if (isPanning()) return;

    const worldPos = screenToWorld(event.clientX, event.clientY);

    // Check for probe click first
    const clickedProbe = findProbeAtPosition(worldPos.x, worldPos.y);
    if (clickedProbe) {
      selectEntity(clickedProbe, 'probe');
      return;
    }

    // Check for station click
    const clickedStation = findStationAtPosition(worldPos.x, worldPos.y);
    if (clickedStation) {
      selectEntity(clickedStation, 'station');
      return;
    }

    // Move selected probe (manual or autonomous with user override)
    if (selectedType === 'probe' && selectedEntity) {
      selectedEntity.movementTarget.x = worldPos.x;
      selectedEntity.movementTarget.y = worldPos.y;
    }
  });

  // Right-click to trigger scan
  canvas.addEventListener('contextmenu', (event) => {
    event.preventDefault();

    if (selectedType === 'probe' && selectedEntity?.scanner && !selectedEntity.probe.isAutonomous) {
      triggerScan(selectedEntity);
    }
  });

  // Keyboard controls
  window.addEventListener('keydown', (event) => {
    switch (event.code) {
      case 'Space':
        if (selectedType === 'probe' && selectedEntity?.scanner && !selectedEntity.probe.isAutonomous) {
          event.preventDefault();
          triggerScan(selectedEntity);
        }
        break;

      case 'Tab':
        event.preventDefault();
        cycleSelection(event.shiftKey ? -1 : 1);
        break;

      case 'KeyA':
        if (selectedType === 'probe' && selectedEntity) {
          toggleAutonomy(selectedEntity);
        }
        break;

      case 'KeyP':
        // Build probe
        if (selectedType === 'probe' && selectedEntity && !selectedEntity.probe.isAutonomous) {
          if (selectedEntity.probe.matter >= BUILD_COSTS.probe) {
            startManualBuild(selectedEntity, 'probe');
          }
        } else if (selectedType === 'station' && selectedEntity) {
          if (selectedEntity.station.matter >= BUILD_COSTS.stationProbe) {
            startStationBuild(selectedEntity, 'probe');
          }
        }
        break;

      case 'KeyR':
        // Build rover
        if (selectedType === 'probe' && selectedEntity && !selectedEntity.probe.isAutonomous) {
          if (selectedEntity.probe.matter >= BUILD_COSTS.rover) {
            startManualBuild(selectedEntity, 'rover');
          }
        } else if (selectedType === 'station' && selectedEntity) {
          if (selectedEntity.station.matter >= BUILD_COSTS.stationRover) {
            startStationBuild(selectedEntity, 'rover');
          }
        }
        break;

      case 'KeyM':
        // Merge 3 probes into station
        if (selectedType === 'probe' && selectedEntity) {
          tryMerge(selectedEntity);
        }
        break;

      case 'KeyT':
        // Start research (new system)
        if (selectedType === 'station' && selectedEntity) {
          if (canResearch(selectedEntity, 'newSystem')) {
            startResearch(selectedEntity, 'newSystem');
            console.log('Starting research: New System');
          } else {
            console.log(`Need ${RESEARCH_COSTS.newSystem} matter to research`);
          }
        }
        break;
    }
  });

  // Auto-select first probe
  selectFirstProbe();
}

/**
 * Try to merge selected probe with nearby probes
 */
function tryMerge(probe) {
  const cluster = getProbeCluster(probe);
  if (cluster) {
    executeMerge(cluster);
    // Selection will be cleared, select first available probe
    setTimeout(() => selectFirstProbe(), 100);
  } else {
    console.log('Need 3 probes within merge radius (50px) to form a station');
  }
}

/**
 * Find probe at screen position
 */
function findProbeAtPosition(x, y) {
  const clickRadius = 20;

  for (const probe of probes) {
    const dx = probe.position.x - x;
    const dy = probe.position.y - y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < clickRadius) {
      return probe;
    }
  }
  return null;
}

/**
 * Find station at screen position
 */
function findStationAtPosition(x, y) {
  const clickRadius = 35;

  for (const station of stations) {
    const dx = station.position.x - x;
    const dy = station.position.y - y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < clickRadius) {
      return station;
    }
  }
  return null;
}

/**
 * Select an entity (probe or station)
 */
function selectEntity(entity, type) {
  // Deselect previous
  if (selectedType === 'probe' && selectedEntity?.probe) {
    selectedEntity.probe.isSelected = false;
  }

  selectedEntity = entity;
  selectedType = type;

  if (type === 'probe' && entity?.probe) {
    entity.probe.isSelected = true;
  }

  updateHighlights();

  if (onSelectionChange) {
    onSelectionChange(selectedEntity, selectedType);
  }
}

/**
 * Select the first available probe
 */
function selectFirstProbe() {
  for (const probe of probes) {
    selectEntity(probe, 'probe');
    return;
  }
  // If no probes, try selecting a station
  for (const station of stations) {
    selectEntity(station, 'station');
    return;
  }
  selectedEntity = null;
  selectedType = null;
}

/**
 * Cycle through all selectable entities
 */
function cycleSelection(direction) {
  const allEntities = [
    ...Array.from(probes).map(p => ({ entity: p, type: 'probe' })),
    ...Array.from(stations).map(s => ({ entity: s, type: 'station' }))
  ];

  if (allEntities.length === 0) return;

  const currentIndex = allEntities.findIndex(
    e => e.entity === selectedEntity && e.type === selectedType
  );

  let newIndex = currentIndex + direction;
  if (newIndex < 0) newIndex = allEntities.length - 1;
  if (newIndex >= allEntities.length) newIndex = 0;

  const next = allEntities[newIndex];
  selectEntity(next.entity, next.type);
}

/**
 * Toggle autonomy for a probe
 */
function toggleAutonomy(probe) {
  if (!probe.probe) return;

  probe.probe.isAutonomous = !probe.probe.isAutonomous;

  if (!probe.probe.isAutonomous && probe.movementTarget) {
    probe.movementTarget.x = null;
    probe.movementTarget.y = null;
  }

  if (probe.probe.isAutonomous && probe.ai) {
    probe.ai.task = 'explore';
    probe.ai.state = 'idle';
    probe.ai.thinkTimer = 0;
  }

  updateHighlights();

  if (onSelectionChange) {
    onSelectionChange(selectedEntity, selectedType);
  }

  const mode = probe.probe.isAutonomous ? 'AUTONOMOUS' : 'MANUAL';
  console.log(`${probe.probe.name} set to ${mode}`);
}

/**
 * Update visual highlights for all entities
 */
function updateHighlights() {
  // Probes
  for (const probe of probes) {
    if (probe.renderable?.graphics) {
      const isSelected = probe === selectedEntity;
      const isAuto = probe.probe?.isAutonomous;

      if (isSelected) {
        probe.renderable.graphics.alpha = 1;
      } else if (isAuto) {
        probe.renderable.graphics.alpha = 0.7;
      } else {
        probe.renderable.graphics.alpha = 0.5;
      }
    }
  }

  // Stations
  for (const station of stations) {
    if (station.renderable?.graphics) {
      const isSelected = station === selectedEntity;
      station.renderable.graphics.alpha = isSelected ? 1 : 0.7;
    }
  }
}

/**
 * Trigger a scan for a probe
 */
function triggerScan(probe) {
  const { scanner } = probe;

  if (!scanner || scanner.currentCooldown > 0 || scanner.isScanning) {
    return;
  }

  scanner.isScanning = true;
  scanner.scanProgress = 0;
}

/**
 * Get currently selected entity and type
 */
export function getSelectedEntity() {
  return { entity: selectedEntity, type: selectedType };
}

/**
 * Legacy: get selected probe (for compatibility)
 */
export function getSelectedProbe() {
  return selectedType === 'probe' ? selectedEntity : null;
}

/**
 * Refresh selection after entities are created/destroyed
 */
export function refreshSelection() {
  updateHighlights();
}
