/**
 * Planet Graphics Factory
 * Creates visual representation of planets (colored circles)
 */
import { Graphics, Container } from 'pixi.js';
import { ORE_TYPES } from '../ecs/components.js';

/**
 * Creates a planet graphics container with body and resource ring
 */
export function createPlanetGraphics(oreType, radius) {
  const container = new Container();
  const ore = ORE_TYPES[oreType] || ORE_TYPES.iron;

  // Planet body
  const body = new Graphics();
  body
    .circle(0, 0, radius)
    .fill({ color: ore.color, alpha: 0.8 });

  // Inner glow/highlight
  const highlight = new Graphics();
  highlight
    .circle(-radius * 0.3, -radius * 0.3, radius * 0.3)
    .fill({ color: 0xffffff, alpha: 0.15 });

  // Resource ring (shows remaining resources)
  const resourceRing = new Graphics();
  resourceRing.label = 'resourceRing';

  // Mining indicator (pulsing ring when being mined)
  const miningIndicator = new Graphics();
  miningIndicator.label = 'miningIndicator';
  miningIndicator.visible = false;

  container.addChild(body);
  container.addChild(highlight);
  container.addChild(resourceRing);
  container.addChild(miningIndicator);

  // Start hidden (fog of war)
  container.visible = false;
  container.alpha = 0;

  return container;
}

/**
 * Updates planet graphics based on current state
 */
export function updatePlanetGraphics(container, planet, mineable) {
  // Handle discovery animation
  if (planet.discovered && container.alpha < 1) {
    container.visible = true;
    container.alpha = Math.min(1, container.alpha + 0.05);
  }

  if (!planet.discovered) return;

  const ore = ORE_TYPES[planet.oreType] || ORE_TYPES.iron;
  const resourceRing = container.getChildByLabel('resourceRing');
  const miningIndicator = container.getChildByLabel('miningIndicator');

  // Update resource ring
  if (resourceRing) {
    resourceRing.clear();

    if (!planet.depleted) {
      const resourcePercent = planet.resources / planet.maxResources;
      const ringRadius = planet.radius + 4;

      // Draw arc showing remaining resources
      resourceRing
        .arc(0, 0, ringRadius, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * resourcePercent))
        .stroke({ color: ore.color, width: 2, alpha: 0.6 });
    }
  }

  // Update mining indicator
  if (miningIndicator && mineable) {
    miningIndicator.clear();

    if (mineable.isBeingMined) {
      miningIndicator.visible = true;

      // Pulsing effect
      const pulse = 0.5 + Math.sin(mineable.miningProgress * Math.PI * 2) * 0.3;
      const miningRadius = planet.radius + 8;

      miningIndicator
        .circle(0, 0, miningRadius)
        .stroke({ color: 0x44ff88, width: 2, alpha: pulse });
    } else {
      miningIndicator.visible = false;
    }
  }

  // Dim depleted planets
  if (planet.depleted) {
    container.alpha = 0.4;
  }
}
