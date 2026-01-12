/**
 * Camera System
 * Handles viewport zoom and panning
 */

const camera = {
  x: 0,
  y: 0,
  zoom: 1,
  targetZoom: 1,
  minZoom: 0.2,
  maxZoom: 2,
  zoomSpeed: 0.1,
  isPanning: false,
  lastMouseX: 0,
  lastMouseY: 0
};

let gameContainer = null;
let screenWidth = 0;
let screenHeight = 0;

/**
 * Initialize camera system
 */
export function initCamera(container, width, height) {
  gameContainer = container;
  screenWidth = width;
  screenHeight = height;

  // Center camera initially
  camera.x = width / 2;
  camera.y = height / 2;
}

/**
 * Get current camera state
 */
export function getCamera() {
  return camera;
}

/**
 * Set camera position
 */
export function setCameraPosition(x, y) {
  camera.x = x;
  camera.y = y;
}

/**
 * Set camera zoom
 */
export function setCameraZoom(zoom) {
  camera.targetZoom = Math.max(camera.minZoom, Math.min(camera.maxZoom, zoom));
}

/**
 * Zoom camera by delta amount
 */
export function zoomCamera(delta, centerX, centerY) {
  const oldZoom = camera.zoom;
  camera.targetZoom = Math.max(camera.minZoom, Math.min(camera.maxZoom, camera.zoom + delta));

  // Zoom toward mouse position
  if (centerX !== undefined && centerY !== undefined) {
    const worldX = (centerX - screenWidth / 2) / oldZoom + camera.x;
    const worldY = (centerY - screenHeight / 2) / oldZoom + camera.y;

    const newZoom = camera.targetZoom;
    camera.x = worldX - (centerX - screenWidth / 2) / newZoom;
    camera.y = worldY - (centerY - screenHeight / 2) / newZoom;
  }
}

/**
 * Start panning
 */
export function startPan(mouseX, mouseY) {
  camera.isPanning = true;
  camera.lastMouseX = mouseX;
  camera.lastMouseY = mouseY;
}

/**
 * Update pan position
 */
export function updatePan(mouseX, mouseY) {
  if (!camera.isPanning) return;

  const dx = (mouseX - camera.lastMouseX) / camera.zoom;
  const dy = (mouseY - camera.lastMouseY) / camera.zoom;

  camera.x -= dx;
  camera.y -= dy;

  camera.lastMouseX = mouseX;
  camera.lastMouseY = mouseY;
}

/**
 * Stop panning
 */
export function stopPan() {
  camera.isPanning = false;
}

/**
 * Check if currently panning
 */
export function isPanning() {
  return camera.isPanning;
}

/**
 * Update camera (smooth zoom interpolation)
 */
export function updateCamera(delta) {
  // Smooth zoom interpolation
  const zoomDiff = camera.targetZoom - camera.zoom;
  if (Math.abs(zoomDiff) > 0.001) {
    camera.zoom += zoomDiff * 0.15;
  } else {
    camera.zoom = camera.targetZoom;
  }
}

/**
 * Apply camera transform to container
 */
export function applyCameraTransform(container, width, height) {
  if (!container) return;

  screenWidth = width;
  screenHeight = height;

  // Apply zoom and position
  container.scale.set(camera.zoom);
  container.x = width / 2 - camera.x * camera.zoom;
  container.y = height / 2 - camera.y * camera.zoom;
}

/**
 * Convert screen coordinates to world coordinates
 */
export function screenToWorld(screenX, screenY) {
  return {
    x: (screenX - screenWidth / 2) / camera.zoom + camera.x,
    y: (screenY - screenHeight / 2) / camera.zoom + camera.y
  };
}

/**
 * Convert world coordinates to screen coordinates
 */
export function worldToScreen(worldX, worldY) {
  return {
    x: (worldX - camera.x) * camera.zoom + screenWidth / 2,
    y: (worldY - camera.y) * camera.zoom + screenHeight / 2
  };
}
