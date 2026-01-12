/**
 * Scan Ring Graphics
 * Creates and updates the expanding scan ring visual effect
 */
import { Graphics } from 'pixi.js';

const SCAN_COLOR = 0x44aaff;

/**
 * Creates a scan ring graphics object
 */
export function createScanRingGraphics() {
  const graphics = new Graphics();
  graphics.visible = false;
  return graphics;
}

/**
 * Updates scan ring based on scanner state
 */
export function updateScanRing(graphics, scanner, maxRadius) {
  if (!scanner.isScanning) {
    graphics.visible = false;
    return;
  }

  graphics.visible = true;
  graphics.clear();

  // Easing function for smooth expansion
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  const progress = easeOutCubic(scanner.scanProgress);

  // Current radius based on progress
  const currentRadius = progress * maxRadius;

  // Fade out as ring expands
  const alpha = 1 - progress;

  // Draw the expanding ring
  graphics
    .circle(0, 0, currentRadius)
    .stroke({ color: SCAN_COLOR, width: 2, alpha: alpha * 0.8 });

  // Inner glow ring
  if (progress < 0.5) {
    const innerAlpha = (0.5 - progress) * 2;
    graphics
      .circle(0, 0, currentRadius * 0.3)
      .stroke({ color: SCAN_COLOR, width: 1, alpha: innerAlpha * 0.5 });
  }
}
