/**
 * Probe Graphics Factory
 * Creates the visual representation of a Probe (triangle)
 */
import { Graphics } from 'pixi.js';

const PROBE_SIZE = 12;
const PROBE_COLOR = 0x88ccff;

/**
 * Creates a triangle graphics object for a probe
 */
export function createProbeGraphics() {
  const graphics = new Graphics();

  // Draw a triangle pointing upward
  graphics
    .poly([
      0, -PROBE_SIZE,           // Top point
      -PROBE_SIZE * 0.7, PROBE_SIZE * 0.6,  // Bottom left
      PROBE_SIZE * 0.7, PROBE_SIZE * 0.6    // Bottom right
    ])
    .fill({ color: PROBE_COLOR, alpha: 0.9 })
    .stroke({ color: 0xffffff, width: 1, alpha: 0.5 });

  return graphics;
}
