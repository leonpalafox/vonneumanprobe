/**
 * Space Station Graphics Factory
 * Creates the visual representation of a Space Station (hexagon)
 */
import { Graphics, Container } from 'pixi.js';

const STATION_SIZE = 30;
const STATION_COLOR = 0xffcc44;
const STATION_ACCENT = 0x88ccff;

/**
 * Creates a hexagon graphics container for a space station
 */
export function createStationGraphics() {
  const container = new Container();

  // Main hexagon body
  const body = new Graphics();
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    points.push(Math.cos(angle) * STATION_SIZE);
    points.push(Math.sin(angle) * STATION_SIZE);
  }

  body
    .poly(points)
    .fill({ color: STATION_COLOR, alpha: 0.3 })
    .stroke({ color: STATION_COLOR, width: 2, alpha: 0.9 });

  // Inner hexagon
  const inner = new Graphics();
  const innerPoints = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    innerPoints.push(Math.cos(angle) * STATION_SIZE * 0.5);
    innerPoints.push(Math.sin(angle) * STATION_SIZE * 0.5);
  }

  inner
    .poly(innerPoints)
    .fill({ color: STATION_ACCENT, alpha: 0.2 })
    .stroke({ color: STATION_ACCENT, width: 1, alpha: 0.5 });

  // Center dot
  const center = new Graphics();
  center
    .circle(0, 0, 4)
    .fill({ color: 0xffffff, alpha: 0.8 });

  // Build progress ring (hidden by default)
  const buildRing = new Graphics();
  buildRing.label = 'buildRing';
  buildRing.visible = false;

  container.addChild(body);
  container.addChild(inner);
  container.addChild(center);
  container.addChild(buildRing);

  return container;
}

/**
 * Updates station graphics based on state
 */
export function updateStationGraphics(container, station) {
  const buildRing = container.getChildByLabel('buildRing');

  if (buildRing && station.isBuilding) {
    buildRing.visible = true;
    buildRing.clear();

    const progress = station.buildProgress;
    const radius = STATION_SIZE + 5;

    // Draw progress arc
    buildRing
      .arc(0, 0, radius, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * progress))
      .stroke({ color: 0x66ff88, width: 3, alpha: 0.8 });
  } else if (buildRing) {
    buildRing.visible = false;
  }

  // Slow rotation for visual interest
  container.rotation += 0.002;
}
