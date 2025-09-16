export function clamp(value, min, max) {
  if (typeof value !== 'number' || typeof min !== 'number' || typeof max !== 'number') {
    throw new TypeError('clamp expects numeric arguments');
  }
  if (min > max) {
    throw new RangeError('clamp min cannot be greater than max');
  }
  return Math.min(Math.max(value, min), max);
}

export function collides(circle, rect) {
  const { x: cx, y: cy, radius } = circle;
  const { x: rx, y: ry, width, height } = rect;

  const halfWidth = width / 2;
  const halfHeight = height / 2;

  const closestX = clamp(cx, rx - halfWidth, rx + halfWidth);
  const closestY = clamp(cy, ry - halfHeight, ry + halfHeight);

  const dx = cx - closestX;
  const dy = cy - closestY;
  return dx * dx + dy * dy <= radius * radius;
}

export function createStarfield(count, width, height, random = Math.random) {
  if (!Number.isInteger(count) || count < 0) {
    throw new RangeError('count must be a non-negative integer');
  }
  if (typeof width !== 'number' || typeof height !== 'number') {
    throw new TypeError('width and height must be numbers');
  }
  const stars = [];
  for (let i = 0; i < count; i += 1) {
    stars.push({
      x: random() * width,
      y: random() * height,
      size: random() * 2 + 0.5,
      speed: 25 + random() * 60,
      color: random() > 0.4 ? '#9be7ff' : '#e0c3ff',
      opacity: 0.4 + random() * 0.6,
      swing: random() * 0.8,
      offset: random() * Math.PI * 2,
    });
  }
  return stars;
}

export function advanceFloatingTexts(entries, delta) {
  if (!Array.isArray(entries)) {
    throw new TypeError('entries must be an array');
  }
  if (typeof delta !== 'number' || Number.isNaN(delta)) {
    throw new TypeError('delta must be a number');
  }

  for (let i = entries.length - 1; i >= 0; i -= 1) {
    const entry = entries[i];
    entry.y -= delta * 40;
    entry.life -= delta;
    if (entry.life <= 0) {
      entries.splice(i, 1);
    }
  }
}
