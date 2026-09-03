const canvas = document.querySelector('#machineCanvas');
const ctx = canvas.getContext('2d');

const els = {
  machineName: document.querySelector('#machineName'),
  machineTag: document.querySelector('#machineTag'),
  turnText: document.querySelector('#turnText'),
  durabilityText: document.querySelector('#durabilityText'),
  durabilityBar: document.querySelector('#durabilityBar'),
  repairText: document.querySelector('#repairText'),
  repairBar: document.querySelector('#repairBar'),
  intentText: document.querySelector('#intentText'),
  statusLine: document.querySelector('#statusLine'),
  statusText: document.querySelector('#statusLine p'),
  phaseCard: document.querySelector('#phaseCard'),
  phaseDirection: document.querySelector('#phaseDirection'),
  handSection: document.querySelector('.hand-section'),
  hand: document.querySelector('#hand'),
  deckCount: document.querySelector('#deckCount'),
  hintText: document.querySelector('#hintText'),
  introModal: document.querySelector('#introModal'),
  rewardModal: document.querySelector('#rewardModal'),
  rewardOptions: document.querySelector('#rewardOptions'),
  resultModal: document.querySelector('#resultModal'),
  resultKicker: document.querySelector('#resultKicker'),
  resultSeal: document.querySelector('#resultSeal'),
  resultTitle: document.querySelector('#resultTitle'),
  resultDescription: document.querySelector('#resultDescription'),
  resultMachines: document.querySelector('#resultMachines'),
  resultSlaps: document.querySelector('#resultSlaps'),
  resultParts: document.querySelector('#resultParts'),
  impactFlash: document.querySelector('#impactFlash'),
  steps: [...document.querySelectorAll('.progress-step')],
  sideButtons: [...document.querySelectorAll('.side-button')]
};

const CARD_LIBRARY = {
  normal: { id: 'normal', name: '普通一拍', type: '稳定', desc: '力度适中，没有额外副作用。', power: 1.55, damage: 3, range: '中', color: '#ff6b35' },
  gentle: { id: 'gentle', name: '轻柔复位掌', type: '精准', desc: '将最接近工作区的零件向目标吸附。', power: .72, damage: 1, range: '小', color: '#39b980', snap: .48 },
  heavy: { id: 'heavy', name: '大力金刚掌', type: '重击', desc: '震幅极大，可以撼动重型零件。', power: 3.15, damage: 8, range: '大', color: '#e95050' },
  deep: { id: 'deep', name: '隔山打牛掌', type: '深层', desc: '主要作用于机器深处，减少外壳损耗。', power: 2.35, damage: 3, range: '深层', color: '#7c65d6', deep: true },
  sponge: { id: 'sponge', name: '海绵掌', type: '防御', desc: '几乎不伤机器，并抵挡本回合反击。', power: .45, damage: 0, range: '小', color: '#4085f5', guard: true },
  directed: { id: 'directed', name: '定向推掌', type: '控制', desc: '零件沿拍击方向稳定移动，偏差较小。', power: 1.9, damage: 4, range: '窄', color: '#f09c2f', precise: true },
  magnet: { id: 'magnet', name: '磁力掌', type: '金属', desc: '金属零件额外向工作区域靠拢。', power: 1.18, damage: 2, range: '金属', color: '#3f70ca', magnet: true },
  echo: { id: 'echo', name: '余震掌', type: '连锁', desc: '拍击后产生一次方向相同的微弱余震。', power: 1.15, damage: 3, range: '两段', color: '#d66ab0', echo: true },
  ice: { id: 'ice', name: '冰敷掌', type: '维护', desc: '震动很小，但为机器恢复 5 点耐久。', power: .35, damage: -5, range: '小', color: '#3ba6bf' }
};

const MACHINE_LIBRARY = [
  {
    id: 'radio', name: '老式收音机', tag: '新手订单', maxDurability: 35, maxTurns: 6,
    accent: '#f6c445', body: '#78563d', hint: '电池沿黄色导轨移动：进入接口捕获区后会直接完整归位并锁定。',
    parts: [
      part('电池', 'battery', 315, 306, 490, 290, 54, 32, '#f6c445', 28, 1.05, .25, true, {
        captureScale: 2.45,
        guide: [[315, 306], [374, 306], [428, 292], [490, 290]]
      }),
      part('旋钮', 'gear', 510, 145, 430, 176, 45, 42, '#ff7b48', 24, .8, .7, true),
      part('天线座', 'bolt', 270, 125, 315, 195, 38, 34, '#77c7b0', 24, .75, .45, true),
      part('硬币', 'coin', 390, 330, 610, 345, 35, 34, '#ccd2da', 24, .45, .6, true)
    ],
    intent(turn) { return turn % 2 === 0 ? '释放静电：额外损失 4 点耐久' : '电流蓄积中，本回合不会反击'; },
    action(turn) { return turn % 2 === 0 ? { damage: 4, text: '静电击穿了老化外壳，耐久 -4' } : null; }
  },
  {
    id: 'washer', name: '暴走洗衣机', tag: '精英订单', maxDurability: 58, maxTurns: 8,
    accent: '#48b5cc', body: '#dfe6e7', hint: '洗衣机每两回合自动旋转。可利用旋转归位，也可用海绵掌抵挡。',
    parts: [
      part('滚筒轴', 'gear', 165, 170, 350, 235, 59, 48, '#ff7657', 23, 1.25, .8, true),
      part('减震簧', 'spring', 525, 140, 485, 255, 48, 45, '#f6c445', 22, .72, .42, true),
      part('传动带', 'belt', 465, 340, 335, 330, 60, 33, '#7f8ca3', 23, .75, .6, false),
      part('硬币', 'coin', 210, 330, 565, 330, 34, 30, '#d2d7df', 16, .4, .3, true),
      part('袜子', 'sock', 345, 115, 110, 330, 44, 42, '#b476d5', 16, .55, .55, false)
    ],
    intent(turn) { return turn % 2 === 0 ? '脱水循环：全部零件旋转并损失 5 点耐久' : '滚筒正在蓄力，本回合相对平稳'; },
    action(turn) { return turn % 2 === 0 ? { damage: 5, spin: true, text: '滚筒开始暴走，内部零件被再次甩动' } : null; }
  },
  {
    id: 'vending', name: '暴走售货机', tag: '最终 Boss', maxDurability: 88, maxTurns: 10,
    accent: '#ff6b35', body: '#d8473f', hint: 'Boss 会随修复度改变行为。重掌很快，但漏电阶段会造成额外损耗。',
    parts: [
      part('主电机', 'gear', 140, 335, 370, 300, 62, 45, '#f6c445', 22, 1.35, .8, true),
      part('线路板', 'board', 545, 110, 470, 300, 58, 40, '#39b980', 21, .85, .8, true),
      part('退币簧', 'spring', 155, 135, 250, 285, 48, 42, '#66b7dd', 18, .65, .4, true),
      part('可乐罐', 'can', 520, 340, 275, 150, 45, 38, '#ff785e', 18, .85, .35, true),
      part('硬币A', 'coin', 305, 355, 590, 175, 33, 28, '#d7dbe0', 11, .35, .25, true),
      part('硬币B', 'coin', 410, 120, 590, 230, 33, 28, '#bdc4ce', 10, .35, .5, true)
    ],
    intent(turn, repair) {
      if (repair >= 75) return '线路漏电：自动损失 4 点耐久';
      if (repair >= 40) return '发射饮料罐：造成 6 点耐久损失';
      return turn % 2 === 0 ? '吞币故障：造成 3 点耐久损失' : '货道卡顿，本回合不会反击';
    },
    action(turn, repair) {
      if (repair >= 75) return { damage: 4, text: '线路板持续漏电，耐久 -4' };
      if (repair >= 40) return { damage: 6, text: '饮料罐猛烈弹出，耐久 -6' };
      return turn % 2 === 0 ? { damage: 3, text: '退币器发生冲撞，耐久 -3' } : null;
    }
  }
];

function part(name, type, x, y, tx, ty, radius, weight, color, points, mass, depth, metal, options = {}) {
  return {
    name, type, x, y, tx, ty, radius, weight, color, points, mass, depth, metal,
    vx: 0, vy: 0, active: false, connection: 'loose',
    captureScale: options.captureScale || (type === 'coin' ? 2.1 : 1.85),
    guide: options.guide || null
  };
}

const state = {
  machineIndex: 0,
  machine: null,
  parts: [],
  durability: 0,
  turn: 1,
  deck: [],
  drawPile: [],
  discard: [],
  hand: [],
  selectedCard: null,
  busy: false,
  guard: false,
  bonusDurability: 0,
  totalSlaps: 0,
  repairedMachines: 0,
  fixedParts: 0,
  bestHit: 0,
  particles: [],
  stallTurns: 0,
  previewSide: null,
  hoveredPart: null,
  selectedPart: null,
  started: false
};

function cloneCard(id, upgrade = 0) {
  return { ...CARD_LIBRARY[id], uid: `${id}-${Math.random().toString(36).slice(2)}`, upgrade };
}

function initialDeck() {
  return [cloneCard('normal'), cloneCard('normal'), cloneCard('gentle'), cloneCard('gentle'), cloneCard('heavy'), cloneCard('deep'), cloneCard('sponge'), cloneCard('directed')];
}

function resetRun() {
  state.machineIndex = 0;
  state.deck = initialDeck();
  state.drawPile = [];
  state.discard = [];
  state.hand = [];
  state.selectedCard = null;
  state.busy = false;
  state.bonusDurability = 0;
  state.totalSlaps = 0;
  state.repairedMachines = 0;
  state.fixedParts = 0;
  state.bestHit = 0;
  state.stallTurns = 0;
  state.previewSide = null;
  state.hoveredPart = null;
  state.selectedPart = null;
  els.rewardModal.classList.remove('visible');
  els.resultModal.classList.remove('visible');
  loadMachine(0);
}

function loadMachine(index) {
  state.machineIndex = index;
  state.machine = MACHINE_LIBRARY[index];
  state.parts = state.machine.parts.map(p => ({ ...p }));
  state.durability = state.machine.maxDurability + state.bonusDurability;
  state.bonusDurability = 0;
  state.turn = 1;
  state.drawPile = shuffle([...state.deck]);
  state.discard = [];
  state.hand = [];
  state.selectedCard = null;
  state.busy = false;
  state.guard = false;
  state.stallTurns = 0;
  state.previewSide = null;
  state.hoveredPart = null;
  state.selectedPart = null;
  els.sideButtons.forEach(button => {
    button.disabled = false;
    button.classList.remove('ready');
  });
  updatePartStates(false);
  drawHand();
  updateInteractionPhase();
  updateUI();
  drawScene();
  setStatus(index === 0 ? '第 1 步：先选一张掌法' : `第 1 步：为${state.machine.name}选择掌法`, 'neutral');
  updateSteps();
}

function shuffle(cards) {
  for (let i = cards.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

function drawHand() {
  while (state.hand.length < 3) {
    if (!state.drawPile.length) {
      state.drawPile = shuffle([...state.discard]);
      state.discard = [];
    }
    const card = state.drawPile.pop();
    if (!card) break;
    state.hand.push(card);
  }
  renderHand();
}

function renderHand() {
  els.hand.innerHTML = '';
  state.hand.forEach(card => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `card${state.selectedCard?.uid === card.uid ? ' selected' : ''}`;
    button.style.setProperty('--card-color', card.color);
    button.disabled = state.busy;
    button.innerHTML = `
      <span class="card-type">${card.type}${card.upgrade ? ` · +${card.upgrade}` : ''}</span>
      <h3>${card.name}</h3>
      <p>${card.desc}</p>
      <div class="card-stats"><span>力度 ${formatPower(card)}</span><span>损耗 ${Math.max(0, card.damage - card.upgrade)}</span></div>
    `;
    button.addEventListener('click', () => selectCard(card));
    els.hand.appendChild(button);
  });
  els.deckCount.textContent = `牌库 ${state.drawPile.length} · 弃牌 ${state.discard.length}`;
}

function formatPower(card) {
  const value = card.power + card.upgrade * .25;
  if (value < .8) return '轻';
  if (value < 2.2) return '中';
  return '重';
}

function updateInteractionPhase() {
  const choosingCard = !state.selectedCard;
  els.statusLine.dataset.phase = choosingCard ? 'card' : 'direction';
  els.phaseCard.classList.toggle('active', choosingCard);
  els.phaseCard.classList.toggle('done', !choosingCard);
  els.phaseDirection.classList.toggle('active', !choosingCard);
  els.handSection.classList.toggle('awaiting-card', choosingCard);
  els.sideButtons.forEach(button => {
    button.classList.toggle('locked', choosingCard && !state.busy);
    button.classList.toggle('ready', !choosingCard && !state.busy);
    button.setAttribute('aria-disabled', String(choosingCard || state.busy));
  });
}

function guideHandSelection() {
  els.handSection.classList.remove('needs-attention');
  void els.handSection.offsetWidth;
  els.handSection.classList.add('needs-attention');
  setStatus('先完成第 1 步：请从底部选择一张掌法', 'bad');
  setTimeout(() => els.handSection.classList.remove('needs-attention'), 650);
}

function selectCard(card) {
  if (state.busy) return;
  state.selectedCard = card;
  state.previewSide = null;
  if (window.matchMedia('(hover: none), (pointer: coarse)').matches) {
    document.activeElement?.blur();
  }
  renderHand();
  updateInteractionPhase();
  drawScene();
  setStatus(`第 2 步：已选择「${card.name}」，点击一个方向立即拍击`, 'neutral');
}

async function strike(side) {
  if (state.busy) return;
  if (!state.selectedCard) {
    guideHandSelection();
    return;
  }

  state.busy = true;
  state.totalSlaps += 1;
  state.guard = Boolean(state.selectedCard.guard);
  els.sideButtons.forEach(button => {
    button.classList.remove('ready', 'locked');
    button.disabled = true;
  });
  updateInteractionPhase();
  renderHand();

  const card = state.selectedCard;
  const damage = Math.max(0, card.damage - card.upgrade);
  const beforeRepair = repairPercent();
  const beforeFixed = state.parts.filter(p => p.active).length;
  state.previewSide = null;
  state.durability = Math.min(state.machine.maxDurability + 8, state.durability - damage + (card.damage < 0 ? Math.abs(card.damage) : 0));
  state.bestHit = Math.max(state.bestHit, card.power);
  setStatus(`${card.name}从${sideName(side)}落下，内部零件开始震动`, 'neutral');
  playImpact(side, card);
  await simulateImpact(side, card);

  const capturedParts = updatePartStates();
  if (capturedParts.length) await animatePartCaptures(capturedParts);
  const assistedPart = updateStallAssist(beforeRepair);
  if (assistedPart) await animatePartCaptures([assistedPart], true);
  const afterFixed = state.parts.filter(p => p.active).length;
  if (afterFixed > beforeFixed) state.fixedParts += afterFixed - beforeFixed;
  updateUI();
  drawScene();

  if (repairPercent() >= 100) {
    machineRepaired();
    return;
  }
  if (state.durability <= 0) {
    finishRun(false, '这台机器被彻底拍报废了。');
    return;
  }

  const action = state.machine.action(state.turn, repairPercent());
  if (action) await resolveMachineAction(action);

  if (state.durability <= 0) {
    finishRun(false, '机器在反击中彻底报废。');
    return;
  }

  const usedIndex = state.hand.findIndex(item => item.uid === card.uid);
  state.hand.splice(usedIndex, 1);
  state.discard.push(card);
  state.selectedCard = null;
  state.turn += 1;

  if (state.turn > state.machine.maxTurns) {
    finishRun(false, `${state.machine.name}过热停机，维修超时。`);
    return;
  }

  state.busy = false;
  els.sideButtons.forEach(button => { button.disabled = false; });
  drawHand();
  updateInteractionPhase();
  updateUI();
  drawScene();
  if (afterFixed > beforeFixed) {
    setStatus(`咔哒！${afterFixed - beforeFixed} 个零件已完整归位并锁定`, 'good');
  } else {
    setStatus('零件未进入捕获区，保持自然落点；可预览其他拍击方向', 'neutral');
  }
}

function sideName(side) {
  return { left: '左侧', right: '右侧', top: '上方', bottom: '下方' }[side];
}

function getDirection(side) {
  return {
    left: { x: 1, y: 0 }, right: { x: -1, y: 0 },
    top: { x: 0, y: 1 }, bottom: { x: 0, y: -1 }
  }[side];
}

function playImpact(side, card) {
  els.impactFlash.classList.remove('play');
  void els.impactFlash.offsetWidth;
  els.impactFlash.classList.add('play');
  const direction = getDirection(side);
  for (let i = 0; i < 18; i += 1) {
    state.particles.push({
      x: 360 - direction.x * 260 + (Math.random() - .5) * 80,
      y: 240 - direction.y * 175 + (Math.random() - .5) * 60,
      vx: direction.x * (3 + Math.random() * 5),
      vy: direction.y * (3 + Math.random() * 5),
      life: 1,
      color: card.color
    });
  }
}

function simulateImpact(side, card) {
  const direction = getDirection(side);
  const power = card.power + card.upgrade * .25;
  let nearest = null;
  let nearestDistance = Infinity;

  state.parts.forEach(partItem => {
    if (partItem.active || (card.deep && partItem.depth < .5)) return;
    const massFactor = 1 / Math.max(.45, partItem.mass);
    const spread = card.precise ? .08 : .34;
    const force = power * 7.2 * massFactor;
    partItem.vx += direction.x * force + (Math.random() - .5) * spread * force;
    partItem.vy += direction.y * force + (Math.random() - .5) * spread * force;

    const dist = distance(partItem.x, partItem.y, partItem.tx, partItem.ty);
    if (dist < nearestDistance) {
      nearest = partItem;
      nearestDistance = dist;
    }
  });

  if (card.snap && nearest) {
    nearest.vx += (nearest.tx - nearest.x) * card.snap * .12;
    nearest.vy += (nearest.ty - nearest.y) * card.snap * .12;
  }

  if (card.magnet) {
    state.parts.filter(p => p.metal).forEach(p => {
      p.vx += (p.tx - p.x) * .055;
      p.vy += (p.ty - p.y) * .055;
    });
  }

  return animatePhysics(card.echo ? 66 : 44, card.echo ? { direction, power: .8 } : null);
}

function animatePhysics(frames, echo) {
  return new Promise(resolve => {
    let frame = 0;
    function tick() {
      frame += 1;
      if (echo && frame === 30) {
        state.parts.forEach(p => {
          p.vx += echo.direction.x * echo.power * 2.4;
          p.vy += echo.direction.y * echo.power * 2.4;
        });
      }
      stepPhysics();
      drawScene();
      if (frame < frames) requestAnimationFrame(tick);
      else resolve();
    }
    requestAnimationFrame(tick);
  });
}

function stepPhysics() {
  const bounds = { left: 88, right: 632, top: 77, bottom: 400 };
  state.parts.forEach(p => {
    if (p.active) {
      p.x = p.tx;
      p.y = p.ty;
      p.vx = 0;
      p.vy = 0;
      return;
    }
    if (p.guide) {
      const guidePoint = nearestPointOnGuide(p.x, p.y, p.guide);
      p.vx += (guidePoint.x - p.x) * .022;
      p.vy += (guidePoint.y - p.y) * .022;
    }
    p.vy += .018;
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= .9;
    p.vy *= .9;
    if (p.x - p.radius < bounds.left) { p.x = bounds.left + p.radius; p.vx *= -.42; }
    if (p.x + p.radius > bounds.right) { p.x = bounds.right - p.radius; p.vx *= -.42; }
    if (p.y - p.radius < bounds.top) { p.y = bounds.top + p.radius; p.vy *= -.42; }
    if (p.y + p.radius > bounds.bottom) { p.y = bounds.bottom - p.radius; p.vy *= -.42; }
  });

  for (let i = 0; i < state.parts.length; i += 1) {
    for (let j = i + 1; j < state.parts.length; j += 1) resolveCollision(state.parts[i], state.parts[j]);
  }

  state.particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= .94;
    p.vy *= .94;
    p.life -= .045;
  });
  state.particles = state.particles.filter(p => p.life > 0);
}

function nearestPointOnGuide(x, y, guide) {
  let best = { x: guide[0][0], y: guide[0][1], distance: Infinity };
  for (let i = 0; i < guide.length - 1; i += 1) {
    const [x1, y1] = guide[i];
    const [x2, y2] = guide[i + 1];
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lengthSquared = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / lengthSquared));
    const px = x1 + dx * t;
    const py = y1 + dy * t;
    const pointDistance = distance(x, y, px, py);
    if (pointDistance < best.distance) best = { x: px, y: py, distance: pointDistance };
  }
  return best;
}

function resolveCollision(a, b) {
  if (a.active || b.active) return;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.max(1, Math.hypot(dx, dy));
  const minimum = (a.radius + b.radius) * .72;
  if (dist >= minimum) return;
  const overlap = minimum - dist;
  const nx = dx / dist;
  const ny = dy / dist;
  a.x -= nx * overlap * .5;
  a.y -= ny * overlap * .5;
  b.x += nx * overlap * .5;
  b.y += ny * overlap * .5;
  const impulse = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
  a.vx -= impulse * nx * .35;
  a.vy -= impulse * ny * .35;
  b.vx += impulse * nx * .35;
  b.vy += impulse * ny * .35;
}

async function resolveMachineAction(action) {
  if (state.guard) {
    state.guard = false;
    setStatus('海绵掌吸收了机器的反击，耐久没有损失', 'good');
    await wait(650);
    return;
  }
  state.durability -= action.damage;
  setStatus(action.text, 'bad');
  if (action.spin) {
    state.parts.forEach(p => {
      if (p.active) return;
      const dx = p.x - 360;
      const dy = p.y - 240;
      p.vx += -dy * .018;
      p.vy += dx * .018;
    });
    await animatePhysics(34);
    const capturedParts = updatePartStates();
    if (capturedParts.length) await animatePartCaptures(capturedParts);
  }
  updateUI();
  await wait(650);
}

function updatePartStates(allowCapture = true) {
  const capturedParts = [];
  state.parts.forEach(p => {
    if (p.active) {
      p.connection = 'locked';
      p.x = p.tx;
      p.y = p.ty;
      p.vx = 0;
      p.vy = 0;
      return;
    }

    const targetDistance = distance(p.x, p.y, p.tx, p.ty);
    const captureRadius = (p.radius * p.captureScale + 24) * .5;
    if (allowCapture && p.connection !== 'capturing' && targetDistance <= captureRadius) {
      p.connection = 'capturing';
      p.vx = 0;
      p.vy = 0;
      capturedParts.push({ part: p, startX: p.x, startY: p.y });
    }
  });
  return capturedParts;
}

function animatePartCaptures(captures, assisted = false) {
  if (!captures.length) return Promise.resolve();
  const duration = assisted ? 780 : 620;
  const names = captures.map(item => item.part.name).join('、');
  setStatus(`${names}被接口捕获，正在滑入目标位置…`, 'good');

  return new Promise(resolve => {
    const startTime = performance.now();
    function animate(now) {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = progress < .5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      captures.forEach(item => {
        const p = item.part;
        p.x = item.startX + (p.tx - item.startX) * eased;
        p.y = item.startY + (p.ty - item.startY) * eased;
      });
      drawScene();

      if (progress < 1) {
        requestAnimationFrame(animate);
        return;
      }

      captures.forEach(item => {
        const p = item.part;
        p.x = p.tx;
        p.y = p.ty;
        p.vx = 0;
        p.vy = 0;
        p.connection = 'locked';
        p.active = true;
      });
      drawScene();
      resolve();
    }
    requestAnimationFrame(animate);
  });
}

function updateStallAssist(beforeRepair) {
  if (repairPercent() > beforeRepair) {
    state.stallTurns = 0;
    return null;
  }
  state.stallTurns += 1;
  if (state.machineIndex !== 0 || state.stallTurns < 2) return null;

  const candidate = state.parts
    .filter(p => !p.active && p.connection !== 'capturing')
    .sort((a, b) => distance(a.x, a.y, a.tx, a.ty) - distance(b.x, b.y, b.tx, b.ty))[0];
  if (!candidate) return null;
  candidate.vx = 0;
  candidate.vy = 0;
  candidate.connection = 'capturing';
  state.stallTurns = 0;
  return { part: candidate, startX: candidate.x, startY: candidate.y };
}

function repairPercent() {
  const total = state.parts.reduce((sum, p) => sum + p.points, 0);
  const fixed = state.parts.reduce((sum, p) => sum + (p.active ? p.points : 0), 0);
  return Math.min(100, Math.round((fixed / total) * 100));
}

function machineRepaired() {
  state.repairedMachines += 1;
  state.fixedParts += state.parts.filter(p => p.active).length;
  updateUI();
  setStatus(`${state.machine.name}恢复运转，维修成功`, 'good');
  state.busy = true;
  setTimeout(() => {
    if (state.machineIndex === MACHINE_LIBRARY.length - 1) finishRun(true);
    else showRewards();
  }, 900);
}

function showRewards() {
  const rewards = rewardPoolForStage(state.machineIndex);
  els.rewardOptions.innerHTML = '';
  rewards.forEach(reward => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'reward-option';
    button.innerHTML = `<span class="reward-icon">${reward.icon}</span><span class="reward-copy"><strong>${reward.name}</strong><span>${reward.desc}</span></span><span class="reward-arrow">→</span>`;
    button.addEventListener('click', () => chooseReward(reward));
    els.rewardOptions.appendChild(button);
  });
  els.rewardModal.classList.add('visible');
}

function rewardPoolForStage(stage) {
  if (stage === 0) {
    return [
      { icon: '磁', name: '加入磁力掌', desc: '金属零件会额外靠近工作区域', action: () => state.deck.push(cloneCard('magnet')) },
      { icon: '稳', name: '精修轻柔掌', desc: '所有轻柔掌力度与耐久表现提升', action: () => upgradeCards('gentle') },
      { icon: '甲', name: '加装缓冲外壳', desc: '下一台机器初始耐久 +8', action: () => { state.bonusDurability = 8; } }
    ];
  }
  return [
    { icon: '震', name: '加入余震掌', desc: '一回合产生两次不同强度的震动', action: () => state.deck.push(cloneCard('echo')) },
    { icon: '冰', name: '加入冰敷掌', desc: '恢复机器耐久，适合 Boss 收尾', action: () => state.deck.push(cloneCard('ice')) },
    { icon: '刚', name: '精修金刚掌', desc: '提高力量，并降低耐久损耗', action: () => upgradeCards('heavy') }
  ];
}

function upgradeCards(id) {
  state.deck.filter(card => card.id === id).forEach(card => { card.upgrade += 1; });
}

function chooseReward(reward) {
  reward.action();
  els.rewardModal.classList.remove('visible');
  loadMachine(state.machineIndex + 1);
}

function finishRun(success, failureReason = '') {
  state.busy = true;
  const remainingRatio = state.durability / Math.max(1, state.machine.maxDurability);
  els.resultMachines.textContent = state.repairedMachines;
  els.resultSlaps.textContent = state.totalSlaps;
  els.resultParts.textContent = state.fixedParts;
  if (success) {
    els.resultKicker.textContent = '今日结算 · 营业完成';
    els.resultSeal.textContent = remainingRatio > .55 ? '神' : '修';
    els.resultTitle.textContent = remainingRatio > .55 ? '祖传一掌' : '老师傅手艺';
    els.resultDescription.textContent = `三台机器全部恢复运转，售货机还剩 ${Math.max(0, Math.round(state.durability))} 点耐久。`;
  } else {
    els.resultKicker.textContent = '今日结算 · 维修中止';
    els.resultSeal.textContent = '碎';
    els.resultTitle.textContent = '这次拍重了';
    els.resultDescription.textContent = failureReason;
  }
  els.resultModal.classList.add('visible');
}

function updateUI() {
  if (!state.machine) return;
  const repair = repairPercent();
  const maxShown = state.machine.maxDurability + (state.durability > state.machine.maxDurability ? 8 : 0);
  els.machineName.textContent = state.machine.name;
  els.machineTag.textContent = state.machine.tag;
  els.turnText.textContent = `${state.turn} / ${state.machine.maxTurns}`;
  els.durabilityText.textContent = `${Math.max(0, Math.round(state.durability))} / ${maxShown}`;
  els.durabilityBar.style.width = `${Math.max(0, Math.min(100, state.durability / maxShown * 100))}%`;
  els.repairText.textContent = `${repair}%`;
  els.repairBar.style.width = `${repair}%`;
  els.intentText.textContent = state.machine.intent(state.turn, repair);
  els.hintText.textContent = state.machine.hint;
}

function updateSteps() {
  els.steps.forEach((step, index) => {
    step.classList.toggle('active', index === state.machineIndex);
    step.classList.toggle('done', index < state.machineIndex);
  });
}

function setStatus(text, kind) {
  els.statusText.textContent = text;
  els.statusLine.classList.remove('good', 'bad');
  if (kind === 'good' || kind === 'bad') els.statusLine.classList.add(kind);
}

function drawScene() {
  const machine = state.machine || MACHINE_LIBRARY[0];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground(machine);
  drawMachineStructure(machine, 'back');
  drawGuides();
  drawTargets();
  if (state.selectedCard && state.previewSide) drawImpactPreview(state.previewSide, state.selectedCard);
  [...state.parts].sort((a, b) => a.depth - b.depth).forEach(drawPart);
  drawMachineStructure(machine, 'front');
  drawParticles();
  drawOverlay(machine);
}

function drawBackground(machine) {
  const gradient = ctx.createLinearGradient(0, 0, 720, 480);
  gradient.addColorStop(0, '#303a3e');
  gradient.addColorStop(.55, '#1d262a');
  gradient.addColorStop(1, '#11181b');
  ctx.fillStyle = gradient;
  roundRect(0, 0, 720, 480, 20, true);

  ctx.save();
  ctx.fillStyle = machine.body;
  ctx.globalAlpha = .62;
  roundRect(28, 34, 664, 414, 38, true);
  ctx.globalAlpha = 1;

  const cavity = ctx.createLinearGradient(72, 58, 640, 420);
  cavity.addColorStop(0, '#3c474a');
  cavity.addColorStop(.48, '#242e31');
  cavity.addColorStop(1, '#172024');
  ctx.fillStyle = cavity;
  roundRect(55, 57, 610, 365, 29, true);
  ctx.strokeStyle = 'rgba(255,255,255,.23)';
  ctx.lineWidth = 3;
  roundRect(55, 57, 610, 365, 29, false, true);

  ctx.strokeStyle = 'rgba(255,255,255,.045)';
  ctx.lineWidth = 1;
  for (let x = 80; x < 650; x += 32) {
    ctx.beginPath(); ctx.moveTo(x, 70); ctx.lineTo(x, 410); ctx.stroke();
  }
  for (let y = 82; y < 410; y += 32) {
    ctx.beginPath(); ctx.moveTo(67, y); ctx.lineTo(653, y); ctx.stroke();
  }

  ctx.strokeStyle = machine.accent;
  ctx.globalAlpha = .85;
  ctx.lineWidth = 4;
  roundRect(42, 46, 636, 389, 34, false, true);
  ctx.globalAlpha = 1;

  [[48, 52], [672, 52], [48, 430], [672, 430]].forEach(([x, y]) => drawScrew(x, y, 8));
  ctx.restore();
}

function drawMachineStructure(machine, layer) {
  if (machine.id === 'radio') drawRadioStructure(layer);
  else if (machine.id === 'washer') drawWasherStructure(layer);
  else drawVendingStructure(layer);
}

function drawRadioStructure(layer) {
  const powered = isPartActive('电池');
  const tuned = isPartActive('旋钮');
  const antennaReady = isPartActive('天线座');

  if (layer === 'back') {
    drawWire([[492, 290], [465, 290], [465, 236], [400, 236]], powered ? '#f6c445' : '#8f574d', powered);
    drawWire([[400, 190], [325, 190], [285, 245]], '#d95b4f', powered);
    drawWire([[400, 210], [348, 230], [274, 285]], '#4b9ec3', powered);
    drawWire([[315, 195], [292, 141], [265, 86]], antennaReady ? '#77c7b0' : '#737d80', antennaReady);

    drawSpeaker(190, 270, 104, powered);
    drawCircuitBoard(390, 92, 188, 132, powered, '#346b55');

    ctx.save();
    ctx.strokeStyle = tuned ? '#f6c445' : '#7d8584';
    ctx.lineWidth = 7;
    ctx.beginPath(); ctx.moveTo(430, 176); ctx.lineTo(522, 176); ctx.stroke();
    drawStaticGear(520, 176, 32, tuned ? '#f6c445' : '#657075', state.turn * .16);
    drawPulley(574, 176, 19, '#8d9697');
    ctx.strokeStyle = '#a97547';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(520, 145); ctx.lineTo(574, 157); ctx.lineTo(574, 195); ctx.lineTo(520, 207); ctx.stroke();
    ctx.restore();

    ctx.fillStyle = '#20282a';
    roundRect(455, 263, 132, 86, 12, true);
    ctx.strokeStyle = powered ? '#f6c445' : '#697477';
    ctx.lineWidth = 3;
    roundRect(455, 263, 132, 86, 12, false, true);
    ctx.fillStyle = 'rgba(255,255,255,.5)';
    ctx.font = '700 11px Microsoft YaHei';
    ctx.fillText('电池供电仓', 472, 338);

    ctx.fillStyle = '#252e31';
    roundRect(574, 306, 65, 76, 10, true);
    ctx.strokeStyle = '#798285';
    ctx.lineWidth = 3;
    roundRect(574, 306, 65, 76, 10, false, true);
    ctx.fillStyle = 'rgba(255,255,255,.48)';
    ctx.font = '700 10px Microsoft YaHei';
    ctx.fillText('异物盒', 588, 397);
  } else {
    ctx.save();
    ctx.strokeStyle = 'rgba(210,221,217,.58)';
    ctx.lineWidth = 10;
    ctx.beginPath(); ctx.arc(190, 270, 112, -.2, Math.PI * 1.7); ctx.stroke();
    [[112, 191], [267, 192], [109, 347], [269, 346]].forEach(([x, y]) => drawScrew(x, y, 6));
    drawCasingRails('#b58a55');
    ctx.restore();
  }
}

function drawWasherStructure(layer) {
  const drumReady = isPartActive('滚筒轴');
  const springReady = isPartActive('减震簧');
  const beltReady = isPartActive('传动带');

  if (layer === 'back') {
    ctx.save();
    ctx.fillStyle = '#151d20';
    ctx.beginPath(); ctx.arc(350, 235, 151, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#9aa8a9';
    ctx.lineWidth = 14;
    ctx.beginPath(); ctx.arc(350, 235, 143, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = '#526063';
    ctx.lineWidth = 8;
    ctx.beginPath(); ctx.arc(350, 235, 111, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#2e3a3e';
    ctx.beginPath(); ctx.arc(350, 235, 103, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 18; i += 1) {
      const angle = i * Math.PI * 2 / 18 + state.turn * (drumReady ? .035 : 0);
      const radius = i % 2 ? 72 : 92;
      ctx.fillStyle = 'rgba(184,205,205,.3)';
      ctx.beginPath(); ctx.arc(350 + Math.cos(angle) * radius, 235 + Math.sin(angle) * radius, 5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();

    drawWire([[158, 95], [210, 120], [238, 175]], springReady ? '#f6c445' : '#768183', springReady);
    drawWire([[552, 92], [520, 130], [485, 255]], springReady ? '#f6c445' : '#768183', springReady);
    drawShockSpring(210, 105, 242, 168, springReady);
    drawShockSpring(542, 102, 497, 164, springReady);

    ctx.fillStyle = '#273237';
    roundRect(275, 333, 150, 58, 14, true);
    ctx.strokeStyle = beltReady ? '#6fd7ae' : '#7a8588';
    ctx.lineWidth = 4;
    roundRect(275, 333, 150, 58, 14, false, true);
    drawPulley(314, 361, 25, '#5f6d72');
    drawPulley(389, 361, 20, '#5f6d72');
    ctx.strokeStyle = beltReady ? '#6fd7ae' : '#252a2b';
    ctx.lineWidth = 7;
    ctx.beginPath(); ctx.ellipse(351, 361, 56, 28, 0, 0, Math.PI * 2); ctx.stroke();

    drawWire([[126, 330], [155, 365], [250, 391]], '#4b9ec3', false);
    ctx.fillStyle = '#20292c';
    roundRect(76, 296, 85, 79, 12, true);
    ctx.strokeStyle = '#657276';
    ctx.lineWidth = 3;
    roundRect(76, 296, 85, 79, 12, false, true);
    ctx.fillStyle = '#20292c';
    roundRect(532, 295, 78, 73, 12, true);
    ctx.strokeStyle = '#657276';
    roundRect(532, 295, 78, 73, 12, false, true);
  } else {
    ctx.save();
    ctx.strokeStyle = 'rgba(218,229,229,.72)';
    ctx.lineWidth = 17;
    ctx.beginPath(); ctx.arc(350, 235, 157, .08, Math.PI * 1.92); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.18)';
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(325, 207, 120, 3.55, 5.35); ctx.stroke();
    drawCasingRails('#8da7aa');
    ctx.restore();
  }
}

function drawVendingStructure(layer) {
  const motorReady = isPartActive('主电机');
  const boardReady = isPartActive('线路板');
  const canReady = isPartActive('可乐罐');

  if (layer === 'back') {
    ctx.fillStyle = '#20282b';
    roundRect(86, 78, 330, 180, 13, true);
    ctx.strokeStyle = '#788285';
    ctx.lineWidth = 3;
    roundRect(86, 78, 330, 180, 13, false, true);
    [142, 204].forEach(y => {
      ctx.strokeStyle = '#596366';
      ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(98, y); ctx.lineTo(403, y); ctx.stroke();
      for (let x = 125; x < 390; x += 68) drawProductCoil(x, y - 22, 44, canReady && y === 142);
    });

    ctx.fillStyle = '#242d30';
    roundRect(500, 75, 124, 212, 14, true);
    ctx.strokeStyle = '#6f7b7d';
    ctx.lineWidth = 4;
    roundRect(500, 75, 124, 212, 14, false, true);
    drawCoinRail(590, 110, 590, 260, boardReady);
    ctx.fillStyle = 'rgba(255,255,255,.48)';
    ctx.font = '700 11px Microsoft YaHei';
    ctx.fillText('投币通道', 534, 99);

    ctx.fillStyle = '#1d2528';
    roundRect(86, 276, 538, 116, 14, true);
    ctx.strokeStyle = '#657174';
    ctx.lineWidth = 3;
    roundRect(86, 276, 538, 116, 14, false, true);
    drawStaticGear(420, 325, 28, motorReady ? '#f6c445' : '#697477', state.turn * .13);
    drawPulley(335, 345, 25, '#788488');
    ctx.strokeStyle = motorReady ? '#f6c445' : '#3d4649';
    ctx.lineWidth = 7;
    ctx.beginPath(); ctx.ellipse(378, 337, 51, 30, -.15, 0, Math.PI * 2); ctx.stroke();
    drawWire([[420, 325], [470, 325], [470, 300]], boardReady ? '#6fd7ae' : '#7d5149', boardReady);
    drawWire([[470, 300], [540, 300], [575, 265]], '#4b9ec3', boardReady);

    ctx.fillStyle = '#20282a';
    roundRect(438, 270, 102, 76, 10, true);
    ctx.strokeStyle = boardReady ? '#6fd7ae' : '#657174';
    ctx.lineWidth = 3;
    roundRect(438, 270, 102, 76, 10, false, true);
  } else {
    ctx.save();
    ctx.strokeStyle = 'rgba(225,228,219,.5)';
    ctx.lineWidth = 9;
    [142, 204, 263].forEach(y => {
      ctx.beginPath(); ctx.moveTo(88, y); ctx.lineTo(418, y); ctx.stroke();
    });
    ctx.strokeStyle = 'rgba(255,255,255,.16)';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(104, 89); ctx.lineTo(104, 252); ctx.stroke();
    drawCasingRails('#bd5c51');
    ctx.restore();
  }
}

function drawGuides() {
  state.parts.filter(p => p.guide && !p.active).forEach(p => {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(246,196,69,.18)';
    ctx.lineWidth = 30;
    ctx.beginPath();
    ctx.moveTo(p.guide[0][0], p.guide[0][1]);
    p.guide.slice(1).forEach(([x, y]) => ctx.lineTo(x, y));
    ctx.stroke();
    ctx.strokeStyle = 'rgba(246,196,69,.62)';
    ctx.lineWidth = 5;
    ctx.setLineDash([10, 9]);
    ctx.stroke();
    ctx.setLineDash([]);

    const entry = p.guide[Math.max(0, p.guide.length - 2)];
    const angle = Math.atan2(p.ty - entry[1], p.tx - entry[0]);
    ctx.translate(entry[0], entry[1]);
    ctx.rotate(angle);
    ctx.fillStyle = 'rgba(246,196,69,.75)';
    ctx.beginPath(); ctx.moveTo(15, 0); ctx.lineTo(-8, -10); ctx.lineTo(-8, 10); ctx.closePath(); ctx.fill();
    ctx.restore();
  });
}

function drawImpactPreview(side, card) {
  const direction = getDirection(side);
  const power = card.power + card.upgrade * .25;
  state.parts.filter(p => !p.active).forEach(p => {
    const force = power * 19 / Math.max(.65, p.mass);
    let ghostX = p.x + direction.x * force;
    let ghostY = p.y + direction.y * force;
    const captureRadius = (p.radius * p.captureScale + 24) * .5;
    const reachesCapture = distance(ghostX, ghostY, p.tx, p.ty) <= captureRadius;
    if (reachesCapture) {
      ghostX += (p.tx - ghostX) * .55;
      ghostY += (p.ty - ghostY) * .55;
    }

    ctx.save();
    ctx.strokeStyle = reachesCapture ? '#6fe0ad' : 'rgba(255,255,255,.42)';
    ctx.fillStyle = reachesCapture ? 'rgba(111,224,173,.16)' : 'rgba(255,255,255,.06)';
    ctx.lineWidth = 3;
    ctx.setLineDash([7, 6]);
    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(ghostX, ghostY); ctx.stroke();
    ctx.beginPath(); ctx.arc(ghostX, ghostY, Math.max(14, p.radius * .48), 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  });
}

function focusedPart() {
  return state.hoveredPart || state.selectedPart;
}

function drawTargets() {
  const focused = focusedPart();
  const capturing = state.parts.filter(p => p.connection === 'capturing');
  state.parts.forEach(drawSocket);
  capturing.forEach(drawTargetIndicator);
  if (focused && focused.connection !== 'capturing') drawTargetIndicator(focused);
}

function drawTargetIndicator(p) {
  ctx.save();
  const color = p.active ? '#6fe0ad' : '#f6c445';
  const dx = p.tx - p.x;
  const dy = p.ty - p.y;
  const length = Math.max(1, Math.hypot(dx, dy));
  const startX = p.x + dx / length * Math.min(p.radius * .72, length * .25);
  const startY = p.y + dy / length * Math.min(p.radius * .72, length * .25);
  const endX = p.tx - dx / length * Math.min(p.radius * .72, length * .25);
  const endY = p.ty - dy / length * Math.min(p.radius * .72, length * .25);

  if (!p.active) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.setLineDash([10, 8]);
    ctx.shadowColor = color;
    ctx.shadowBlur = 9;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.setLineDash([]);

    const angle = Math.atan2(dy, dx);
    ctx.translate(endX, endY);
    ctx.rotate(angle);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(13, 0);
    ctx.lineTo(-7, -8);
    ctx.lineTo(-7, 8);
    ctx.closePath();
    ctx.fill();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  const label = p.active ? `${p.name} · 已归位` : `${p.name}的目标位置`;
  ctx.font = '800 13px Microsoft YaHei';
  const labelWidth = ctx.measureText(label).width + 20;
  const labelX = Math.max(72, Math.min(648 - labelWidth, p.tx - labelWidth / 2));
  const labelY = Math.max(68, p.ty - p.radius - 39);
  ctx.shadowColor = 'rgba(0,0,0,.38)';
  ctx.shadowBlur = 10;
  ctx.fillStyle = p.active ? '#287b59' : '#9a6c00';
  roundRect(labelX, labelY, labelWidth, 26, 13, true);
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.fillText(label, labelX + labelWidth / 2, labelY + 18);
  ctx.restore();
}

function drawSocket(p) {
  ctx.save();
  ctx.translate(p.tx, p.ty);
  const activeColor = '#6fe0ad';
  const capturing = p.connection === 'capturing';
  const focused = focusedPart() === p;
  const passive = !p.active && !capturing && !focused;
  const socketColor = capturing ? '#f6c445' : (focused ? p.color : activeColor);
  ctx.globalAlpha = passive ? .28 : 1;
  ctx.strokeStyle = p.active || capturing || focused ? socketColor : p.color;
  ctx.fillStyle = p.active ? 'rgba(73,203,145,.18)' : (capturing ? 'rgba(246,196,69,.2)' : 'rgba(11,18,20,.48)');
  ctx.lineWidth = p.active || capturing || focused ? 5 : 3;
  if (p.active || capturing || focused) {
    ctx.shadowColor = socketColor;
    ctx.shadowBlur = 18;
  }

  if (p.type === 'gear') drawGearSocket(p.radius);
  else if (p.type === 'battery') drawBatterySocket(p.radius);
  else if (p.type === 'spring') drawSpringSocket(p.radius);
  else if (p.type === 'coin') drawCoinSocket(p.radius);
  else if (p.type === 'belt') drawBeltSocket(p.radius);
  else if (p.type === 'sock') drawFilterSocket(p.radius);
  else if (p.type === 'board') drawBoardSocket(p.radius);
  else if (p.type === 'can') drawCanSocket(p.radius);
  else drawBoltSocket(p.radius);
  ctx.restore();
}

function drawGearSocket(r) {
  ctx.beginPath(); ctx.arc(0, 0, r * .62, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, r * .18, 0, Math.PI * 2); ctx.stroke();
  for (let i = 0; i < 8; i += 1) {
    const angle = i * Math.PI / 4;
    ctx.beginPath(); ctx.moveTo(Math.cos(angle) * r * .7, Math.sin(angle) * r * .7); ctx.lineTo(Math.cos(angle) * r * .92, Math.sin(angle) * r * .92); ctx.stroke();
  }
}

function drawBatterySocket(r) {
  roundRect(-r * .82, -r * .55, r * 1.64, r * 1.1, 10, true, true);
  ctx.fillStyle = '#c6a64a';
  ctx.fillRect(-r * .67, -r * .23, 7, r * .46);
  ctx.fillRect(r * .58, -r * .23, 7, r * .46);
}

function drawSpringSocket(r) {
  ctx.beginPath(); ctx.arc(-r * .62, 0, 8, 0, Math.PI * 2); ctx.arc(r * .62, 0, 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.globalAlpha = .4;
  drawSpring(r * .9);
  ctx.globalAlpha = 1;
}

function drawCoinSocket(r) {
  roundRect(-r * .8, -r * .95, r * 1.6, r * 1.9, 9, true, true);
  ctx.beginPath(); ctx.moveTo(-r * .34, -r * .52); ctx.lineTo(r * .34, -r * .52); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.35)';
  ctx.font = `700 ${Math.max(9, r * .28)}px Microsoft YaHei`;
  ctx.textAlign = 'center';
  ctx.fillText('回收', 0, r * .62);
}

function drawBeltSocket(r) {
  ctx.beginPath(); ctx.ellipse(0, 0, r * .78, r * .48, -.16, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(-r * .38, 0, r * .18, 0, Math.PI * 2); ctx.arc(r * .38, 0, r * .18, 0, Math.PI * 2); ctx.stroke();
}

function drawFilterSocket(r) {
  roundRect(-r * .78, -r * .7, r * 1.56, r * 1.4, 8, true, true);
  for (let x = -r * .48; x <= r * .48; x += r * .24) {
    ctx.beginPath(); ctx.moveTo(x, -r * .5); ctx.lineTo(x, r * .5); ctx.stroke();
  }
}

function drawBoardSocket(r) {
  roundRect(-r * .86, -r * .62, r * 1.72, r * 1.24, 7, true, true);
  for (let x = -r * .56; x <= r * .56; x += r * .28) {
    ctx.beginPath(); ctx.moveTo(x, r * .62); ctx.lineTo(x, r * .78); ctx.stroke();
  }
}

function drawCanSocket(r) {
  roundRect(-r * .55, -r * .84, r * 1.1, r * 1.68, 8, true, true);
  ctx.beginPath(); ctx.moveTo(-r * .4, r * .53); ctx.lineTo(r * .4, r * .53); ctx.stroke();
}

function drawBoltSocket(r) {
  ctx.beginPath();
  for (let i = 0; i < 6; i += 1) {
    const angle = i * Math.PI / 3;
    const x = Math.cos(angle) * r * .72;
    const y = Math.sin(angle) * r * .72;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, r * .22, 0, Math.PI * 2); ctx.stroke();
}

function drawPart(p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  const capturing = p.connection === 'capturing';
  ctx.shadowColor = p.active ? 'rgba(82,222,161,.7)' : (capturing ? 'rgba(246,196,69,.78)' : 'rgba(0,0,0,.5)');
  ctx.shadowBlur = p.active || capturing ? 19 : 13;
  ctx.shadowOffsetY = p.active || capturing ? 0 : 6;
  ctx.fillStyle = p.color;
  ctx.strokeStyle = p.active ? '#8cf0c0' : (capturing ? '#ffe083' : 'rgba(255,255,255,.68)');
  ctx.lineWidth = p.active || capturing ? 5 : 3;

  if (p.type === 'gear') drawGear(p.radius * .62, 10);
  else if (p.type === 'battery') drawBattery(p.radius);
  else if (p.type === 'spring') drawSpring(p.radius);
  else if (p.type === 'coin') drawCoin(p.radius);
  else if (p.type === 'belt') drawBelt(p.radius);
  else if (p.type === 'sock') drawSock(p.radius);
  else if (p.type === 'board') drawBoard(p.radius);
  else if (p.type === 'can') drawCan(p.radius);
  else drawBolt(p.radius);

  if (focusedPart() === p) {
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = p.active ? '#6fe0ad' : '#f6c445';
    ctx.lineWidth = 4;
    ctx.setLineDash([7, 6]);
    ctx.beginPath();
    ctx.arc(0, 0, p.radius + 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.shadowColor = 'transparent';
  const label = p.active ? '已锁定' : (capturing ? '吸附中' : p.name);
  ctx.font = '800 14px Microsoft YaHei';
  const labelWidth = ctx.measureText(label).width + 18;
  ctx.fillStyle = p.active ? '#287b59' : (capturing ? '#906a08' : 'rgba(10,16,19,.82)');
  roundRect(-labelWidth / 2, p.radius + 12, labelWidth, 24, 12, true);
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.fillText(label, 0, p.radius + 29);
  ctx.restore();
}

function drawGear(radius, teeth) {
  ctx.beginPath();
  for (let i = 0; i < teeth * 2; i += 1) {
    const angle = i * Math.PI / teeth;
    const r = i % 2 ? radius * .82 : radius * 1.16;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#1b2428';
  ctx.beginPath(); ctx.arc(0, 0, radius * .29, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.35)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(-radius * .18, -radius * .2, radius * .42, 3.7, 5.5); ctx.stroke();
}

function drawBattery(r) {
  roundRect(-r * .72, -r * .45, r * 1.44, r * .9, 8, true, true);
  ctx.fillRect(r * .72, -r * .16, 9, r * .32);
  ctx.fillStyle = 'rgba(255,255,255,.28)';
  roundRect(-r * .58, -r * .34, r * .28, r * .68, 4, true);
  ctx.fillStyle = '#172033'; ctx.font = `900 ${r * .5}px sans-serif`; ctx.textAlign = 'center'; ctx.fillText('+', r * .18, r * .18);
}

function drawSpring(r) {
  ctx.shadowColor = 'transparent'; ctx.lineWidth = 8; ctx.lineCap = 'round';
  ctx.beginPath();
  for (let i = 0; i <= 18; i += 1) {
    const x = -r * .7 + i * r * 1.4 / 18;
    const y = Math.sin(i * Math.PI) * r * .45;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function drawCoin(r) {
  ctx.beginPath(); ctx.arc(0, 0, r * .62, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = 'rgba(70,78,90,.55)';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(0, 0, r * .44, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#586274'; ctx.font = `900 ${r * .48}px serif`; ctx.textAlign = 'center'; ctx.fillText('¥', 0, r * .18);
}

function drawBelt(r) {
  ctx.lineWidth = 10; ctx.beginPath(); ctx.ellipse(0, 0, r * .75, r * .43, -.22, 0, Math.PI * 2); ctx.stroke();
}

function drawSock(r) {
  ctx.beginPath(); ctx.moveTo(-r*.35,-r*.65); ctx.lineTo(r*.28,-r*.65); ctx.lineTo(r*.18,r*.12); ctx.quadraticCurveTo(r*.65,r*.28,r*.45,r*.65); ctx.quadraticCurveTo(0,r*.8,-r*.45,r*.35); ctx.closePath(); ctx.fill(); ctx.stroke();
}

function drawBoard(r) {
  roundRect(-r*.75,-r*.52,r*1.5,r*1.04,7,true,true);
  ctx.fillStyle='#173d31';
  for(let i=-1;i<=1;i+=1){ctx.beginPath();ctx.arc(i*r*.35,0,5,0,Math.PI*2);ctx.fill();}
  ctx.strokeStyle='rgba(255,220,115,.75)'; ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(-r*.55,-r*.25);ctx.lineTo(0,-r*.25);ctx.lineTo(0,r*.2);ctx.lineTo(r*.5,r*.2);ctx.stroke();
}

function drawCan(r) {
  roundRect(-r*.42,-r*.72,r*.84,r*1.44,8,true,true);
  ctx.strokeStyle='rgba(255,255,255,.55)'; ctx.beginPath(); ctx.moveTo(-r*.33,-r*.5); ctx.lineTo(r*.33,-r*.5); ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.22)';roundRect(-r*.28,-r*.38,r*.15,r*.78,4,true);
}

function drawBolt(r) {
  ctx.beginPath();
  for (let i=0;i<6;i+=1){const a=i*Math.PI/3;const x=Math.cos(a)*r*.62;const y=Math.sin(a)*r*.62;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle='#172033';ctx.fillRect(-r*.1,-r*.35,r*.2,r*.7);
}

function drawSpeaker(x, y, r, powered) {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = '#111719'; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#687477'; ctx.lineWidth = 10; ctx.stroke();
  ctx.fillStyle = powered ? '#344a45' : '#252e31'; ctx.beginPath(); ctx.arc(0, 0, r * .72, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = powered ? '#6fd7ae' : '#586366'; ctx.lineWidth = 4; ctx.stroke();
  ctx.fillStyle = '#151b1e'; ctx.beginPath(); ctx.arc(0, 0, r * .27, 0, Math.PI * 2); ctx.fill();
  for (let i = 0; i < 8; i += 1) {
    const angle = i * Math.PI / 4;
    ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(Math.cos(angle) * r * .34, Math.sin(angle) * r * .34); ctx.lineTo(Math.cos(angle) * r * .68, Math.sin(angle) * r * .68); ctx.stroke();
  }
  ctx.restore();
}

function drawCircuitBoard(x, y, width, height, powered, color) {
  ctx.save();
  ctx.fillStyle = color;
  roundRect(x, y, width, height, 10, true);
  ctx.strokeStyle = powered ? '#6fd7ae' : '#6f827b'; ctx.lineWidth = 4;
  roundRect(x, y, width, height, 10, false, true);
  ctx.strokeStyle = 'rgba(246,205,104,.56)'; ctx.lineWidth = 2;
  [[18,28,80,28,80,55,143,55],[24,96,66,96,66,72,120,72],[145,18,145,90,166,90]].forEach(points => {
    ctx.beginPath(); ctx.moveTo(x + points[0], y + points[1]);
    for (let i = 2; i < points.length; i += 2) ctx.lineTo(x + points[i], y + points[i + 1]);
    ctx.stroke();
  });
  [[32,36],[96,34],[142,78],[42,101],[122,104]].forEach(([cx, cy], index) => {
    ctx.fillStyle = index % 2 ? '#d96755' : '#e4c358';
    ctx.beginPath(); ctx.arc(x + cx, y + cy, index % 2 ? 6 : 4, 0, Math.PI * 2); ctx.fill();
  });
  ctx.restore();
}

function drawWire(points, color, powered) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = powered ? 6 : 4;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (powered) { ctx.shadowColor = color; ctx.shadowBlur = 9; }
  ctx.beginPath(); ctx.moveTo(points[0][0], points[0][1]);
  points.slice(1).forEach(([x, y]) => ctx.lineTo(x, y));
  ctx.stroke();
  points.forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill(); });
  ctx.restore();
}

function drawStaticGear(x, y, r, color, rotation = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rotation); ctx.fillStyle = color; ctx.strokeStyle = 'rgba(255,255,255,.36)'; ctx.lineWidth = 3; drawGear(r, 10); ctx.restore();
}

function drawPulley(x, y, r, color) {
  ctx.save(); ctx.translate(x, y); ctx.fillStyle = color; ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#20282b'; ctx.beginPath(); ctx.arc(0, 0, r * .36, 0, Math.PI * 2); ctx.fill(); ctx.restore();
}

function drawShockSpring(x1, y1, x2, y2, active) {
  ctx.save();
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const length = Math.hypot(x2 - x1, y2 - y1);
  ctx.translate(x1, y1); ctx.rotate(angle);
  ctx.strokeStyle = active ? '#f6c445' : '#7f898a'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, 0);
  for (let i = 1; i < 12; i += 1) ctx.lineTo(length * i / 12, i % 2 ? -7 : 7);
  ctx.lineTo(length, 0); ctx.stroke(); ctx.restore();
}

function drawProductCoil(x, y, width, active) {
  ctx.save(); ctx.translate(x, y);
  ctx.strokeStyle = active ? '#f6c445' : '#717b7d'; ctx.lineWidth = 4;
  ctx.beginPath();
  for (let i = 0; i <= 16; i += 1) {
    const px = -width / 2 + width * i / 16;
    const py = Math.sin(i * Math.PI / 2) * 10;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.stroke(); ctx.restore();
}

function drawCoinRail(x1, y1, x2, y2, active) {
  ctx.save();
  ctx.strokeStyle = active ? '#6fd7ae' : '#677275'; ctx.lineWidth = 8;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.strokeStyle = '#20282b'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.restore();
}

function drawScrew(x, y, r) {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = '#b7bec0'; ctx.strokeStyle = '#313a3d'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-r * .55, r * .2); ctx.lineTo(r * .55, -r * .2); ctx.stroke();
  ctx.restore();
}

function drawCasingRails(color) {
  ctx.save();
  ctx.strokeStyle = color; ctx.globalAlpha = .62; ctx.lineWidth = 12;
  ctx.beginPath(); ctx.moveTo(70, 76); ctx.lineTo(70, 402); ctx.lineTo(650, 402); ctx.stroke();
  ctx.globalAlpha = 1;
  [[76,84],[644,84],[76,396],[644,396]].forEach(([x,y]) => drawScrew(x,y,6));
  ctx.restore();
}

function isPartActive(name) {
  return state.parts.some(p => p.name === name && p.active);
}

function drawParticles() {
  state.particles.forEach(p => {
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, 4 + p.life * 5, 0, Math.PI * 2); ctx.fill();
  });
  ctx.globalAlpha = 1;
}

function drawOverlay(machine) {
  ctx.save();
  ctx.fillStyle = 'rgba(7,12,14,.8)';
  roundRect(75, 14, 145, 28, 14, true);
  ctx.fillStyle = 'rgba(255,255,255,.82)';
  ctx.font = '800 13px Microsoft YaHei';
  ctx.textAlign = 'left';
  ctx.fillText('机械剖面 · 检修层', 91, 33);

  const statusText = machine.id === 'vending' ? '高危设备' : '结构诊断中';
  ctx.font = '800 13px Microsoft YaHei';
  const statusWidth = ctx.measureText(statusText).width + 28;
  ctx.fillStyle = 'rgba(7,12,14,.8)';
  roundRect(638 - statusWidth, 14, statusWidth, 28, 14, true);
  ctx.textAlign = 'right';
  ctx.fillStyle = machine.accent;
  ctx.fillText(statusText, 624, 33);

  const glass = ctx.createLinearGradient(80, 64, 360, 310);
  glass.addColorStop(0, 'rgba(255,255,255,.1)');
  glass.addColorStop(.42, 'rgba(255,255,255,.018)');
  glass.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = glass;
  ctx.beginPath();
  ctx.moveTo(82, 70); ctx.lineTo(280, 70); ctx.lineTo(430, 405); ctx.lineTo(315, 405); ctx.closePath(); ctx.fill();

  ctx.fillStyle = 'rgba(7,12,14,.76)';
  roundRect(230, 432, 260, 31, 15, true);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ff9a63';
  ctx.beginPath(); ctx.arc(252, 447, 5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.76)';
  ctx.font = '700 11px Microsoft YaHei';
  ctx.fillText('可动故障件', 263, 451);
  ctx.fillStyle = '#6fe0ad';
  ctx.beginPath(); ctx.arc(374, 447, 5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.76)';
  ctx.fillText('机械接口', 385, 451);
  ctx.restore();
}

function roundRect(x, y, width, height, radius, fill, stroke = false) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

function distance(x1, y1, x2, y2) { return Math.hypot(x2 - x1, y2 - y1); }
function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * canvas.width / rect.width,
    y: (event.clientY - rect.top) * canvas.height / rect.height
  };
}

function partAtPoint(point) {
  return [...state.parts]
    .sort((a, b) => b.depth - a.depth)
    .find(p => distance(point.x, point.y, p.x, p.y) <= Math.max(30, p.radius * .9)) || null;
}

function showPartTarget(partItem, pinned = false) {
  if (pinned) state.selectedPart = state.selectedPart === partItem ? null : partItem;
  else state.hoveredPart = partItem;
  drawScene();
  const focused = focusedPart();
  if (focused) {
    const stateText = focused.active ? '已经完整归位' : '目标位置已用黄色接口和引导线标出';
    setStatus(`${focused.name}：${stateText}`, focused.active ? 'good' : 'neutral');
  }
}

canvas.addEventListener('pointermove', event => {
  if (event.pointerType !== 'mouse') return;
  const hovered = partAtPoint(canvasPoint(event));
  if (hovered === state.hoveredPart) return;
  state.hoveredPart = hovered;
  canvas.style.cursor = hovered ? 'pointer' : 'default';
  drawScene();
});

canvas.addEventListener('pointerleave', () => {
  if (!state.hoveredPart) return;
  state.hoveredPart = null;
  canvas.style.cursor = 'default';
  drawScene();
});

canvas.addEventListener('click', event => {
  const clicked = partAtPoint(canvasPoint(event));
  if (clicked) {
    showPartTarget(clicked, true);
    return;
  }
  state.selectedPart = null;
  drawScene();
});

function previewStrike(side) {
  if (!state.selectedCard || state.busy) return;
  state.previewSide = side;
  drawScene();
  setStatus(`预计从${sideName(side)}拍击：绿色落点表示会进入接口捕获区`, 'neutral');
}

let lastDirectionPointerType = 'mouse';

els.sideButtons.forEach(button => {
  button.addEventListener('pointerdown', event => {
    lastDirectionPointerType = event.pointerType || 'mouse';
  });
  button.addEventListener('pointerenter', event => {
    if (event.pointerType === 'mouse') previewStrike(button.dataset.side);
  });
  button.addEventListener('click', () => {
    const side = button.dataset.side;
    if (state.busy) return;
    if (!state.selectedCard) {
      guideHandSelection();
      return;
    }

    const touchLike = lastDirectionPointerType !== 'mouse' || window.matchMedia('(hover: none), (pointer: coarse)').matches;
    if (touchLike || state.previewSide === side) {
      strike(side);
      return;
    }
    previewStrike(side);
  });
});
document.querySelector('#startButton').addEventListener('click', () => {
  els.introModal.classList.remove('visible');
  state.started = true;
  resetRun();
});
document.querySelector('#restartButton').addEventListener('click', () => {
  if (!state.started) return;
  resetRun();
});
document.querySelector('#playAgainButton').addEventListener('click', resetRun);

resetRun();
