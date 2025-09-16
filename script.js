import { clamp, collides, createStarfield, advanceFloatingTexts } from './game-utils.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const scoreEl = document.getElementById('score');
const levelEl = document.getElementById('level');
const livesEl = document.getElementById('lives');
const bestEl = document.getElementById('best');
const messageEl = document.getElementById('message');

const player = {
  x: canvas.width / 2,
  y: canvas.height - 90,
  width: 90,
  height: 26,
  baseSpeed: 360,
  dashMultiplier: 1.85,
  dashTime: 0,
  dashCooldown: 0,
  shieldTime: 0,
  trail: [],
};

const controls = {
  left: false,
  right: false,
};

const items = [];
const floatingTexts = [];
const particles = [];
const starfield = createStarfield(70, canvas.width, canvas.height);

const state = {
  playing: false,
  gameOver: false,
  score: 0,
  lives: 3,
  level: 1,
  spawnTimer: 0,
  highScore: 0,
  newHighScoreThisRun: false,
};

const STORAGE_KEY = 'meteor-chaser-best-score';
let messageTimer = null;
let storageAvailable = false;

init();
requestAnimationFrame(loop);

function init() {
  try {
    const stored = Number(localStorage.getItem(STORAGE_KEY));
    if (!Number.isNaN(stored)) {
      state.highScore = stored;
      bestEl.textContent = stored;
    }
    storageAvailable = true;
  } catch (error) {
    storageAvailable = false;
  }

  startButton.addEventListener('click', () => {
    if (!state.playing) {
      startGame();
    }
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    switch (event.code) {
      case 'ArrowLeft':
      case 'KeyA':
        controls.left = true;
        break;
      case 'ArrowRight':
      case 'KeyD':
        controls.right = true;
        break;
      case 'Space':
        if (state.playing) {
          event.preventDefault();
          dash();
        }
        break;
      case 'Enter':
        if (state.gameOver) {
          startGame();
        }
        break;
      default:
        break;
    }
  });

  window.addEventListener('keyup', (event) => {
    switch (event.code) {
      case 'ArrowLeft':
      case 'KeyA':
        controls.left = false;
        break;
      case 'ArrowRight':
      case 'KeyD':
        controls.right = false;
        break;
      default:
        break;
    }
  });

  canvas.addEventListener('pointerdown', (event) => {
    if (!state.playing) return;
    canvas.setPointerCapture?.(event.pointerId);
    movePlayerToPointer(event);
  });

  canvas.addEventListener('pointermove', (event) => {
    if (!state.playing) return;
    if (event.pointerType === 'mouse' && event.buttons === 0) return;
    movePlayerToPointer(event);
  });

  canvas.addEventListener('pointerup', (event) => {
    canvas.releasePointerCapture?.(event.pointerId);
  });
}

function startGame() {
  state.playing = true;
  state.gameOver = false;
  state.score = 0;
  state.level = 1;
  state.lives = 3;
  state.spawnTimer = 0;
  state.newHighScoreThisRun = false;
  items.length = 0;
  floatingTexts.length = 0;
  particles.length = 0;
  player.x = canvas.width / 2;
  player.dashTime = 0;
  player.dashCooldown = 0.3;
  player.shieldTime = 0;
  player.trail.length = 0;

  scoreEl.textContent = '0';
  levelEl.textContent = '1';
  livesEl.textContent = '3';
  bestEl.textContent = state.highScore;
  updateMessage('準備好追光冒險！祝你高分！', 2200);
}

function gameOver() {
  state.gameOver = true;
  state.playing = false;
  updateMessage('遊戲結束！按 Enter 或 點擊「開始遊戲」重試。', 4000);
  if (state.newHighScoreThisRun) {
    if (storageAvailable) {
      localStorage.setItem(STORAGE_KEY, String(state.highScore));
    }
    floatingTexts.push(createFloatingText('⭐ 新的最高分！ ⭐', canvas.width / 2, canvas.height / 2, '#ffd166'));
  }
}

function dash() {
  if (player.dashCooldown > 0 || player.dashTime > 0) return;
  player.dashTime = 0.35;
  player.dashCooldown = 1.6;
  floatingTexts.push(createFloatingText('閃避疾跑！', player.x, player.y - 40, '#8ec5ff'));
  spawnBurst(player.x, player.y + 20, '#79f2ff', 12);
  updateMessage('疾跑啟動！掌握好距離～', 1500);
}

let lastTime = performance.now();

function loop(timestamp) {
  const delta = Math.min((timestamp - lastTime) / 1000, 0.035);
  lastTime = timestamp;

  update(delta);
  draw();

  requestAnimationFrame(loop);
}

function update(delta) {
  updateStarfield(delta);

  if (!state.playing) {
    updateParticles(delta);
    advanceFloatingTexts(floatingTexts, delta);
    return;
  }

  const dashActive = player.dashTime > 0;
  if (player.dashTime > 0) {
    player.dashTime -= delta;
    if (player.dashTime <= 0) {
      player.dashTime = 0;
      updateMessage('疾跑冷卻中…', 1200);
    }
  } else if (player.dashCooldown > 0) {
    player.dashCooldown -= delta;
    if (player.dashCooldown <= 0) {
      player.dashCooldown = 0;
      updateMessage('疾跑準備就緒！', 1400);
      spawnBurst(player.x, player.y, '#ffb703', 8);
    }
  }

  if (player.shieldTime > 0) {
    player.shieldTime -= delta;
    if (player.shieldTime <= 0) {
      player.shieldTime = 0;
      floatingTexts.push(createFloatingText('護盾消失', player.x, player.y - 50, '#ff595e'));
    }
  }

  const playerSpeed = player.baseSpeed * (dashActive ? player.dashMultiplier : 1);
  if (controls.left) {
    player.x -= playerSpeed * delta;
  }
  if (controls.right) {
    player.x += playerSpeed * delta;
  }
  player.x = clamp(player.x, player.width / 2 + 12, canvas.width - player.width / 2 - 12);

  if (dashActive) {
    player.trail.push({ x: player.x, y: player.y, alpha: 0.7 });
    if (player.trail.length > 18) {
      player.trail.shift();
    }
  } else if (player.trail.length > 0) {
    player.trail.shift();
  }

  state.spawnTimer -= delta;
  if (state.spawnTimer <= 0) {
    spawnItem();
    const interval = Math.max(0.35, 1.2 - state.level * 0.1);
    state.spawnTimer = interval * (0.8 + Math.random() * 0.5);
  }

  for (let i = items.length - 1; i >= 0; i -= 1) {
    const item = items[i];
    item.y += item.speed * delta;
    if (item.wobbleSpeed) {
      item.wobblePhase += delta * item.wobbleSpeed;
      item.x += Math.sin(item.wobblePhase) * item.wobbleRange * delta;
    }

    if (item.y - item.radius > canvas.height + 40) {
      items.splice(i, 1);
      continue;
    }

    if (collides(item, player)) {
      items.splice(i, 1);
      handleCollision(item);
    }
  }

  updateParticles(delta);
  advanceFloatingTexts(floatingTexts, delta);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawStarfield();

  drawParticles();

  for (const item of items) {
    drawItem(item);
  }

  drawPlayer();

  drawFloatingTexts();
}

function spawnItem() {
  const random = Math.random();
  const x = 60 + Math.random() * (canvas.width - 120);
  const baseSpeed = 120 + state.level * 35;

  if (random < 0.58) {
    const isSilver = Math.random() < 0.22;
    items.push({
      type: isSilver ? 'silver-star' : 'gold-star',
      x,
      y: -20,
      radius: isSilver ? 16 : 14,
      speed: baseSpeed * (isSilver ? 1.2 : 1),
      wobbleSpeed: 3 + Math.random() * 2,
      wobblePhase: Math.random() * Math.PI * 2,
      wobbleRange: 45,
      value: isSilver ? 20 : 10,
    });
  } else if (random < 0.84) {
    items.push({
      type: 'void-orb',
      x,
      y: -30,
      radius: 22,
      speed: baseSpeed * 1.3,
      wobbleSpeed: 1 + Math.random() * 1.5,
      wobblePhase: Math.random() * Math.PI * 2,
      wobbleRange: 70,
    });
  } else {
    items.push({
      type: 'shield-orb',
      x,
      y: -25,
      radius: 18,
      speed: baseSpeed * 0.9,
      wobbleSpeed: 4,
      wobblePhase: Math.random() * Math.PI * 2,
      wobbleRange: 30,
    });
  }
}

function handleCollision(item) {
  if (item.type === 'gold-star' || item.type === 'silver-star') {
    state.score += item.value;
    updateScoreDisplay();
    floatingTexts.push(createFloatingText(`+${item.value}`, item.x, player.y - 20, '#ffe066'));
    spawnBurst(item.x, item.y, item.type === 'silver-star' ? '#b5f5ff' : '#f3d34a', 14);
    state.level = Math.min(15, 1 + Math.floor(state.score / 80));
    levelEl.textContent = state.level;
  } else if (item.type === 'shield-orb') {
    const bonus = 30;
    state.score += bonus;
    updateScoreDisplay();
    player.shieldTime = Math.min(player.shieldTime + 5, 8);
    floatingTexts.push(createFloatingText('護盾加持 +5秒', item.x, player.y - 20, '#7dffb7'));
    spawnBurst(item.x, item.y, '#72efdd', 16);
    updateMessage('獲得護盾！暫時無敵！', 1800);
  } else if (item.type === 'void-orb') {
    if (player.shieldTime > 0) {
      floatingTexts.push(createFloatingText('護盾抵禦！', player.x, player.y - 40, '#6afcff'));
      spawnBurst(item.x, item.y, '#6afcff', 16);
      state.score += 5;
      updateScoreDisplay();
    } else {
      state.lives -= 1;
      livesEl.textContent = state.lives;
      floatingTexts.push(createFloatingText('被暗物質撞擊！', player.x, player.y - 50, '#ff6b6b'));
      spawnBurst(item.x, item.y, '#ff4d6d', 20);
      if (state.lives <= 0) {
        gameOver();
      }
    }
  }
}

function createFloatingText(text, x, y, color) {
  return {
    text,
    x,
    y,
    color,
    life: 1.2,
  };
}

function drawFloatingTexts() {
  for (const entry of floatingTexts) {
    ctx.globalAlpha = Math.max(entry.life, 0);
    ctx.fillStyle = entry.color;
    ctx.font = '20px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(entry.text, entry.x, entry.y);
  }
  ctx.globalAlpha = 1;
}

function updateParticles(delta) {
  for (let i = particles.length - 1; i >= 0; i -= 1) {
    const particle = particles[i];
    particle.x += particle.vx * delta;
    particle.y += particle.vy * delta;
    particle.life -= delta;
    if (particle.life <= 0) {
      particles.splice(i, 1);
    }
  }
}

function drawParticles() {
  for (const particle of particles) {
    ctx.globalAlpha = Math.max(particle.life, 0);
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function spawnBurst(x, y, color, count) {
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 120 + Math.random() * 180;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color,
      size: 3 + Math.random() * 4,
      life: 0.5 + Math.random() * 0.6,
    });
  }
}

function drawPlayer() {
  ctx.save();
  if (player.trail.length) {
    for (let i = 0; i < player.trail.length; i += 1) {
      const entry = player.trail[i];
      ctx.globalAlpha = (i + 1) / player.trail.length * 0.4;
      ctx.fillStyle = '#7a88ff';
      ctx.beginPath();
      ctx.ellipse(entry.x, entry.y + 8 + i * 3, player.width * 0.7, player.height, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  const gradient = ctx.createLinearGradient(player.x - player.width / 2, player.y, player.x + player.width / 2, player.y);
  gradient.addColorStop(0, '#7f5af0');
  gradient.addColorStop(0.5, '#2cb1ff');
  gradient.addColorStop(1, '#ff8906');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  drawRoundedRectPath(ctx, player.x - player.width / 2, player.y - player.height / 2, player.width, player.height, 16);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.lineWidth = 2;
  ctx.stroke();

  const cockpitX = player.x;
  const cockpitY = player.y - 5;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.beginPath();
  ctx.ellipse(cockpitX, cockpitY, 16, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  if (player.shieldTime > 0) {
    const pulse = Math.sin(performance.now() / 120) * 0.1 + 0.9;
    ctx.strokeStyle = `rgba(112, 255, 220, ${0.4 + Math.random() * 0.1})`;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 54 * pulse, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawItem(item) {
  if (item.type === 'gold-star' || item.type === 'silver-star') {
    const gradient = ctx.createRadialGradient(item.x - 4, item.y - 4, 2, item.x, item.y, item.radius * 1.2);
    if (item.type === 'silver-star') {
      gradient.addColorStop(0, '#f1f7ff');
      gradient.addColorStop(0.6, '#9be7ff');
      gradient.addColorStop(1, 'rgba(155, 231, 255, 0)');
    } else {
      gradient.addColorStop(0, '#ffe066');
      gradient.addColorStop(0.6, '#f79d65');
      gradient.addColorStop(1, 'rgba(247, 157, 101, 0)');
    }
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(item.x, item.y, item.radius * 1.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(item.x, item.y);
    ctx.rotate(Math.sin(performance.now() / 200 + item.x) * 0.3);
    ctx.fillStyle = item.type === 'silver-star' ? '#f1f7ff' : '#fcd34d';
    ctx.beginPath();
    for (let i = 0; i < 5; i += 1) {
      const angle = (i / 5) * Math.PI * 2;
      const outer = item.radius;
      const inner = item.radius * 0.45;
      ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
      ctx.lineTo(Math.cos(angle + Math.PI / 5) * inner, Math.sin(angle + Math.PI / 5) * inner);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  } else if (item.type === 'void-orb') {
    const gradient = ctx.createRadialGradient(item.x - 6, item.y - 6, 1, item.x, item.y, item.radius * 1.3);
    gradient.addColorStop(0, '#ff4d6d');
    gradient.addColorStop(0.7, '#240046');
    gradient.addColorStop(1, 'rgba(36, 0, 70, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(item.x, item.y, item.radius * 1.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 82, 82, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(item.x, item.y, item.radius - 4, 0, Math.PI * 2);
    ctx.stroke();
  } else if (item.type === 'shield-orb') {
    const gradient = ctx.createRadialGradient(item.x, item.y, 2, item.x, item.y, item.radius * 1.4);
    gradient.addColorStop(0, '#9dffda');
    gradient.addColorStop(0.6, '#72efdd');
    gradient.addColorStop(1, 'rgba(114, 239, 221, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(item.x, item.y, item.radius * 1.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(114, 239, 221, 0.8)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.arc(item.x, item.y, item.radius + 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

function movePlayerToPointer(event) {
  const rect = canvas.getBoundingClientRect();
  const relativeX = ((event.clientX - rect.left) / rect.width) * canvas.width;
  player.x = clamp(relativeX, player.width / 2 + 12, canvas.width - player.width / 2 - 12);
}

function updateStarfield(delta) {
  for (const star of starfield) {
    star.y += star.speed * delta;
    star.x += Math.sin((performance.now() / 1000 + star.offset) * 2) * star.swing * delta * 20;
    if (star.y > canvas.height + star.size) {
      star.y = -star.size;
      star.x = Math.random() * canvas.width;
    }
  }
}

function drawStarfield() {
  for (const star of starfield) {
    ctx.globalAlpha = star.opacity;
    ctx.fillStyle = star.color;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawRoundedRectPath(context, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  if (context.roundRect) {
    context.roundRect(x, y, width, height, r);
    return;
  }
  context.moveTo(x + r, y);
  context.lineTo(x + width - r, y);
  context.quadraticCurveTo(x + width, y, x + width, y + r);
  context.lineTo(x + width, y + height - r);
  context.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  context.lineTo(x + r, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - r);
  context.lineTo(x, y + r);
  context.quadraticCurveTo(x, y, x + r, y);
}

function updateScoreDisplay() {
  scoreEl.textContent = state.score;
  if (state.score > state.highScore) {
    state.highScore = state.score;
    state.newHighScoreThisRun = true;
    bestEl.textContent = state.highScore;
    if (storageAvailable) {
      localStorage.setItem(STORAGE_KEY, String(state.highScore));
    }
  }
}

function updateMessage(text, duration = 1500) {
  messageEl.textContent = text;
  messageEl.classList.add('visible');
  if (messageTimer) {
    clearTimeout(messageTimer);
  }
  messageTimer = setTimeout(() => {
    messageEl.classList.remove('visible');
  }, duration);
}
