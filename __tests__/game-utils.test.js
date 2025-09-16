import test from 'node:test';
import assert from 'node:assert/strict';
import { clamp, collides, createStarfield, advanceFloatingTexts } from '../game-utils.js';

test('clamp limits values within the provided range', () => {
  assert.equal(clamp(10, 0, 5), 5);
  assert.equal(clamp(-4, -2, 8), -2);
  assert.equal(clamp(3, 0, 10), 3);
});

test('clamp throws when arguments are invalid', () => {
  assert.throws(() => clamp('3', 0, 5), TypeError);
  assert.throws(() => clamp(3, 6, 2), RangeError);
});

test('collides detects intersections between a circle and a rectangle', () => {
  const rect = { x: 100, y: 100, width: 50, height: 20 };
  const circle = { x: 110, y: 105, radius: 15 };
  assert.equal(collides(circle, rect), true);
});

test('collides returns false when objects do not overlap', () => {
  const rect = { x: 100, y: 100, width: 50, height: 20 };
  const circle = { x: 200, y: 200, radius: 10 };
  assert.equal(collides(circle, rect), false);
});

test('createStarfield creates stars using deterministic randomness', () => {
  const values = [
    0.1, 0.2, 0.3, 0.4, 0.9, 0.5, 0.6, 0.7,
    0.9, 0.8, 0.7, 0.6, 0.3, 0.2, 0.1, 0.0,
  ];
  let index = 0;
  const random = () => {
    const value = values[index % values.length];
    index += 1;
    return value;
  };

  const stars = createStarfield(2, 200, 100, random);
  assert.equal(stars.length, 2);

  const [first, second] = stars;

  assert.deepEqual(
    { x: first.x, y: first.y, color: first.color },
    { x: 20, y: 20, color: '#9be7ff' },
  );
  assert.ok(Math.abs(first.size - (0.3 * 2 + 0.5)) < 1e-6);
  assert.ok(Math.abs(first.speed - (25 + 0.4 * 60)) < 1e-6);
  assert.ok(Math.abs(first.opacity - (0.4 + 0.5 * 0.6)) < 1e-6);
  assert.ok(Math.abs(first.swing - 0.6 * 0.8) < 1e-6);
  assert.ok(Math.abs(first.offset - 0.7 * Math.PI * 2) < 1e-6);

  assert.equal(second.color, '#e0c3ff');
  assert.ok(Math.abs(second.x - 0.9 * 200) < 1e-6);
  assert.ok(Math.abs(second.y - 0.8 * 100) < 1e-6);
  assert.ok(Math.abs(second.size - (0.7 * 2 + 0.5)) < 1e-6);
  assert.ok(Math.abs(second.speed - (25 + 0.6 * 60)) < 1e-6);
});

test('createStarfield validates input arguments', () => {
  assert.throws(() => createStarfield(-1, 100, 100), RangeError);
  assert.throws(() => createStarfield(1, '100', 100), TypeError);
});

test('advanceFloatingTexts updates entries and prunes expired ones', () => {
  const entries = [
    { text: 'A', x: 0, y: 10, color: '#fff', life: 1 },
    { text: 'B', x: 0, y: 5, color: '#fff', life: 0.1 },
  ];

  advanceFloatingTexts(entries, 0.2);

  assert.equal(entries.length, 1);
  assert.ok(Math.abs(entries[0].y - (10 - 0.2 * 40)) < 1e-6);
  assert.ok(Math.abs(entries[0].life - 0.8) < 1e-6);
});

test('advanceFloatingTexts throws when called with invalid arguments', () => {
  assert.throws(() => advanceFloatingTexts({}, 0.16), TypeError);
  assert.throws(() => advanceFloatingTexts([], Number.NaN), TypeError);
});
