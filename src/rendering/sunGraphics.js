/**
 * Sun Graphics Factory
 * Creates the visual representation of the sun at the center
 */
import { Graphics, Container } from 'pixi.js';

const SUN_RADIUS = 40;
const SUN_COLOR = 0xffdd44;
const SUN_GLOW_COLOR = 0xffaa00;

/**
 * Creates the sun graphics container
 */
export function createSunGraphics() {
  const container = new Container();

  // Outer glow
  const glow = new Graphics();
  glow
    .circle(0, 0, SUN_RADIUS * 1.5)
    .fill({ color: SUN_GLOW_COLOR, alpha: 0.1 });

  // Middle glow
  const midGlow = new Graphics();
  midGlow
    .circle(0, 0, SUN_RADIUS * 1.2)
    .fill({ color: SUN_GLOW_COLOR, alpha: 0.2 });

  // Sun body
  const body = new Graphics();
  body
    .circle(0, 0, SUN_RADIUS)
    .fill({ color: SUN_COLOR, alpha: 0.9 });

  // Inner highlight
  const highlight = new Graphics();
  highlight
    .circle(-SUN_RADIUS * 0.2, -SUN_RADIUS * 0.2, SUN_RADIUS * 0.4)
    .fill({ color: 0xffffff, alpha: 0.3 });

  container.addChild(glow);
  container.addChild(midGlow);
  container.addChild(body);
  container.addChild(highlight);

  return container;
}

/**
 * Updates sun graphics (subtle pulsing effect)
 */
export function updateSunGraphics(container, time) {
  const pulse = 1 + Math.sin(time * 0.002) * 0.05;
  container.scale.set(pulse);
}
