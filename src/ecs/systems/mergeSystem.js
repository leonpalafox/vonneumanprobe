/**
 * Merge System
 * Detects when 3 probes are close enough to merge into a space station
 */
import { probes } from '../world.js';
import { MERGE_RADIUS } from '../components.js';

// Callback for spawning station (set from main.js)
let spawnStationCallback = null;
let removeProbeCallback = null;

/**
 * Set callbacks from main
 */
export function setMergeCallbacks(stationCallback, removeCallback) {
  spawnStationCallback = stationCallback;
  removeProbeCallback = removeCallback;
}

/**
 * Find probes that can merge (3 probes within MERGE_RADIUS of each other)
 * Returns array of probe groups that can merge
 */
export function findMergeableClusters() {
  const probeList = Array.from(probes);
  const clusters = [];

  // Check each probe as potential cluster center
  for (let i = 0; i < probeList.length; i++) {
    const centerProbe = probeList[i];
    const nearby = [centerProbe];

    // Find all probes within merge radius of this probe
    for (let j = 0; j < probeList.length; j++) {
      if (i === j) continue;

      const otherProbe = probeList[j];
      const dx = otherProbe.position.x - centerProbe.position.x;
      const dy = otherProbe.position.y - centerProbe.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= MERGE_RADIUS) {
        nearby.push(otherProbe);
      }
    }

    // If we have 3+ probes in cluster, it's mergeable
    if (nearby.length >= 3) {
      // Only take the first 3
      clusters.push(nearby.slice(0, 3));
    }
  }

  // Remove duplicate clusters (same probes in different order)
  const uniqueClusters = [];
  const seen = new Set();

  for (const cluster of clusters) {
    // Create a unique key for this cluster
    const ids = cluster.map(p => p.probe.name).sort().join('|');
    if (!seen.has(ids)) {
      seen.add(ids);
      uniqueClusters.push(cluster);
    }
  }

  return uniqueClusters;
}

/**
 * Check if a specific probe is part of a mergeable cluster
 */
export function getProbeCluster(targetProbe) {
  const probeList = Array.from(probes);
  const nearby = [targetProbe];

  for (const otherProbe of probeList) {
    if (otherProbe === targetProbe) continue;

    const dx = otherProbe.position.x - targetProbe.position.x;
    const dy = otherProbe.position.y - targetProbe.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= MERGE_RADIUS) {
      nearby.push(otherProbe);
    }
  }

  return nearby.length >= 3 ? nearby.slice(0, 3) : null;
}

/**
 * Execute merge of 3 probes into a station
 */
export function executeMerge(cluster) {
  if (!cluster || cluster.length < 3) return false;
  if (!spawnStationCallback || !removeProbeCallback) return false;

  // Calculate center position and total matter
  let totalX = 0;
  let totalY = 0;
  let totalMatter = 0;

  for (const probe of cluster) {
    totalX += probe.position.x;
    totalY += probe.position.y;
    totalMatter += probe.probe.matter;
  }

  const centerX = totalX / 3;
  const centerY = totalY / 3;

  // Remove the 3 probes
  for (const probe of cluster) {
    removeProbeCallback(probe);
  }

  // Spawn the station with combined matter
  const station = spawnStationCallback(centerX, centerY, totalMatter);

  console.log(`Merged 3 probes into ${station.station.name} with ${Math.floor(totalMatter)} matter!`);

  return true;
}

/**
 * Check if selected probe can merge
 */
export function canMerge(probe) {
  const cluster = getProbeCluster(probe);
  return cluster !== null;
}
