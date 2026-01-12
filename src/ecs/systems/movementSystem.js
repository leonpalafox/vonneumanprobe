/**
 * Movement System
 * Handles click-to-move with smooth acceleration/deceleration
 */
import { movables } from '../world.js';

const PROBE_SPEED = 120; // pixels per second
const ARRIVAL_THRESHOLD = 5; // distance to consider "arrived"
const SMOOTHING = 0.08; // interpolation factor for smooth movement

export function movementSystem(delta) {
  for (const entity of movables) {
    const { position, velocity, movementTarget } = entity;

    // Skip if no target set
    if (movementTarget.x === null || movementTarget.y === null) {
      // Decelerate to stop
      velocity.x *= 0.9;
      velocity.y *= 0.9;

      // Apply remaining velocity
      position.x += velocity.x * delta;
      position.y += velocity.y * delta;
      continue;
    }

    // Calculate direction to target
    const dx = movementTarget.x - position.x;
    const dy = movementTarget.y - position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Check if arrived
    if (distance < ARRIVAL_THRESHOLD) {
      movementTarget.x = null;
      movementTarget.y = null;
      velocity.x = 0;
      velocity.y = 0;
      continue;
    }

    // Normalize direction and apply speed
    const targetVelX = (dx / distance) * PROBE_SPEED;
    const targetVelY = (dy / distance) * PROBE_SPEED;

    // Smooth interpolation toward target velocity
    velocity.x += (targetVelX - velocity.x) * SMOOTHING;
    velocity.y += (targetVelY - velocity.y) * SMOOTHING;

    // Update position
    position.x += velocity.x * delta;
    position.y += velocity.y * delta;

    // Rotate probe to face movement direction (update graphics rotation)
    if (entity.renderable?.graphics) {
      const angle = Math.atan2(velocity.y, velocity.x) + Math.PI / 2;
      entity.renderable.graphics.rotation = angle;
    }
  }
}
