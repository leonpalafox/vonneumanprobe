/**
 * Rover Graphics Factory
 * Creates the visual representation of a Rover (small square)
 */
import { Graphics } from 'pixi.js';

const ROVER_SIZE = 6;
const ROVER_COLOR = 0x66ff88;

/**
 * Creates a square graphics object for a rover
 */
export function createRoverGraphics() {
  const graphics = new Graphics();

  // Draw a small square
  graphics
    .rect(-ROVER_SIZE / 2, -ROVER_SIZE / 2, ROVER_SIZE, ROVER_SIZE)
    .fill({ color: ROVER_COLOR, alpha: 0.9 })
    .stroke({ color: 0xffffff, width: 1, alpha: 0.5 });

  return graphics;
}

/**
 * Updates rover graphics based on state
 */
export function updateRoverState(graphics, rover) {
  // Pulse when scanning
  if (rover.state === 'scanning') {
    const pulse = 0.7 + Math.sin(Date.now() * 0.01) * 0.3;
    graphics.alpha = pulse;
  } else {
    graphics.alpha = 0.9;
  }
}
