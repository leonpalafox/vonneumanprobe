/**
 * Rendering System
 * Syncs PixiJS graphics positions with ECS entity positions
 */
import { renderables } from '../world.js';

export function renderingSystem() {
  for (const entity of renderables) {
    if (entity.renderable.graphics) {
      entity.renderable.graphics.x = entity.position.x;
      entity.renderable.graphics.y = entity.position.y;
    }
  }
}
