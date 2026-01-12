/**
 * ECS World setup using Miniplex
 */
import { World } from 'miniplex';

// Create the main ECS world
export const world = new World();

// Create queries for different entity types
export const probes = world.with('position', 'probe', 'renderable');
export const movables = world.with('position', 'velocity', 'movementTarget');
export const renderables = world.with('position', 'renderable');
export const scanners = world.with('position', 'scanner', 'renderable');
export const planets = world.with('position', 'planet', 'renderable');
export const mineables = world.with('position', 'planet', 'mineable');
export const rovers = world.with('position', 'rover', 'renderable');
export const aiControlled = world.with('position', 'ai', 'movementTarget');
export const stations = world.with('position', 'station', 'renderable');
