/**
 * Research System
 * Handles station research progress and completion
 */
import { stations } from '../world.js';
import { RESEARCH_TIMES, RESEARCH_COSTS } from '../components.js';

let onResearchComplete = null;

/**
 * Set callback for research completion
 */
export function setResearchCallback(callback) {
  onResearchComplete = callback;
}

/**
 * Start research at a station
 */
export function startResearch(station, researchType) {
  if (!station.station) return false;

  const cost = RESEARCH_COSTS[researchType];
  if (!cost || station.station.matter < cost) return false;
  if (station.station.isResearching || station.station.isBuilding) return false;

  station.station.matter -= cost;
  station.station.isResearching = true;
  station.station.researchProgress = 0;
  station.station.researchTarget = researchType;

  return true;
}

/**
 * Check if station can research
 */
export function canResearch(station, researchType) {
  if (!station?.station) return false;

  const cost = RESEARCH_COSTS[researchType];
  return (
    cost &&
    station.station.matter >= cost &&
    !station.station.isResearching &&
    !station.station.isBuilding
  );
}

/**
 * Main research system update
 */
export function researchSystem(delta, gameState) {
  for (const entity of stations) {
    if (!entity.station.isResearching) continue;

    const { station } = entity;
    const researchTime = RESEARCH_TIMES[station.researchTarget] || 10;

    station.researchProgress += delta / researchTime;

    if (station.researchProgress >= 1) {
      // Research complete
      station.isResearching = false;
      station.researchProgress = 0;

      const completedResearch = station.researchTarget;
      station.researchTarget = null;

      // Trigger callback
      if (onResearchComplete) {
        onResearchComplete(entity, completedResearch, gameState);
      }
    }
  }
}
