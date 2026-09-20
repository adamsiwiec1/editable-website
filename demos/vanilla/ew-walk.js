export const WALK_ACTIVE = 'ew-walk:active';
export const WALK_STEP = 'ew-walk:step';
export const WALK_SEEN = 'ew-walk:seen-v2';
export const HIDDEN_PATH = '/desk-x7k2';
export const OWNER_KEY = 'editable-demo:owner';

const ANCHOR_TRIES = 40;
const HOLE_PAD = 8;
const GAP = 14;
const POP_WIDTH = 340;
const VIEW_INSET = 16;
const POINTER_SIZE = 44;
const POINTER_GAP = 10;
const POINTER_ROTATE = { right: 0, down: 90, left: 180, up: -90 };
const ARROW_SVG =
  '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M3 11h12.17l-4.88-4.88L12 4.71 19.29 12 12 19.29l-1.71-1.71L15.17 13H3z"/></svg>';

function read(key) {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key, value) {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // private mode
  }
}

function seen() {
  try {
    return localStorage.getItem(WALK_SEEN) === '1';
  } catch {
    return false;
  }
}

function markSeen() {
  try {
    localStorage.setItem(WALK_SEEN, '1');
  } catch {
    // private mode
  }
}

function isOwner() {
  try {
    return sessionStorage.getItem(OWNER_KEY) === '1';
  } catch {
    return false;
  }
}

function clearOwner() {
  try {
    sessionStorage.removeItem(OWNER_KEY);
  } catch {
    // private mode
  }
}

export function continueWalkthrough(step) {
  write(WALK_ACTIVE, '1');
  write(WALK_STEP, step);
}

export function currentPath() {
  const raw = window.location.pathname.replace(/\/$/, '') || '/';
  if (raw.endsWith('/index.html') || raw === '') return '/';
  if (raw.endsWith('desk-x7k2.html')) return HIDDEN_PATH;
  return raw;
}

function resolveAnchor(el) {
  if (!el) return null;
  const inner = el.shadowRoot?.querySelector('button, [part="button"]');
  return inner ?? el;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function overlap(a, b) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

/** Keep in sync with lib/demo-place.ts (FeatureDemo). */
function placePopover(padded, popWidth, popH, viewport) {
  const maxLeft = Math.max(VIEW_INSET, viewport.w - popWidth - VIEW_INSET);
  const maxTop = Math.max(VIEW_INSET, viewport.h - popH - VIEW_INSET);
  const midX = padded.left + padded.width / 2;
  const centeredTarget = padded.width > 260 && Math.abs(midX - viewport.w / 2) < 90;
  const centerLeft = clamp(midX - popWidth / 2, VIEW_INSET, maxLeft);

  if (centeredTarget) {
    if (padded.bottom + GAP + popH <= viewport.h - VIEW_INSET) {
      return { left: centerLeft, top: padded.bottom + GAP };
    }
    if (padded.top - GAP - popH >= VIEW_INSET) {
      return { left: centerLeft, top: padded.top - GAP - popH };
    }
  }

  const rightSide = midX > viewport.w * 0.58;
  const bottomSide = padded.bottom > viewport.h * 0.72;
  const spaceRight = viewport.w - padded.right - VIEW_INSET;
  const spaceLeft = padded.left - VIEW_INSET;
  const spaceBelow = viewport.h - padded.bottom - VIEW_INSET;
  const spaceAbove = padded.top - VIEW_INSET;
  const sideRoom = Math.max(spaceLeft, spaceRight);
  const tall = padded.height > viewport.h * 0.34;

  if (bottomSide && rightSide && spaceLeft >= popWidth + GAP) {
    return {
      left: clamp(padded.left - GAP - popWidth, VIEW_INSET, maxLeft),
      top: clamp(padded.bottom - popH, VIEW_INSET, maxTop),
    };
  }
  if (bottomSide && !rightSide && spaceRight >= popWidth + GAP) {
    return {
      left: padded.right + GAP,
      top: clamp(padded.bottom - popH, VIEW_INSET, maxTop),
    };
  }
  if ((tall || bottomSide) && spaceRight >= popWidth + GAP) {
    return { left: padded.right + GAP, top: clamp(padded.top, VIEW_INSET, maxTop) };
  }
  if ((tall || bottomSide) && spaceLeft >= popWidth + GAP) {
    return { left: padded.left - GAP - popWidth, top: clamp(padded.top, VIEW_INSET, maxTop) };
  }
  if (tall && sideRoom < popWidth) {
    return { left: maxLeft, top: clamp(VIEW_INSET, VIEW_INSET, maxTop) };
  }

  const left = clamp(rightSide ? padded.right - popWidth : padded.left, VIEW_INSET, maxLeft);
  if (!bottomSide && spaceBelow >= popH + GAP) {
    return { left, top: padded.bottom + GAP };
  }
  if (spaceAbove >= popH + GAP) {
    return { left, top: padded.top - GAP - popH };
  }
  if (spaceRight >= popWidth + GAP) {
    return { left: padded.right + GAP, top: clamp(padded.top, VIEW_INSET, maxTop) };
  }
  if (spaceLeft >= popWidth + GAP) {
    return { left: padded.left - GAP - popWidth, top: clamp(padded.top, VIEW_INSET, maxTop) };
  }
  if (spaceBelow >= spaceAbove) {
    return { left, top: clamp(padded.bottom + GAP, VIEW_INSET, maxTop) };
  }
  return { left, top: clamp(padded.top - GAP - popH, VIEW_INSET, maxTop) };
}

function placePointer(padded, pop, popWidth, popH, viewport) {
  const size = POINTER_SIZE;
  const gap = POINTER_GAP;
  const midY = padded.top + padded.height / 2 - size / 2;
  const midX = padded.left + padded.width / 2 - size / 2;
  const popBox = {
    left: pop.left - 4,
    top: pop.top - 4,
    right: pop.left + popWidth + 4,
    bottom: pop.top + popH + 4,
  };
  const hole = { left: padded.left, top: padded.top, right: padded.right, bottom: padded.bottom };
  const candidates = [
    { left: padded.left - gap - size, top: midY, dir: 'right' },
    { left: padded.right + gap, top: midY, dir: 'left' },
    { left: midX, top: padded.top - gap - size, dir: 'down' },
    { left: midX, top: padded.bottom + gap, dir: 'up' },
  ];

  for (const candidate of candidates) {
    const box = {
      left: candidate.left,
      top: candidate.top,
      right: candidate.left + size,
      bottom: candidate.top + size,
    };
    const inView = box.left >= 8 && box.top >= 8 && box.right <= viewport.w - 8 && box.bottom <= viewport.h - 8;
    if (!inView) continue;
    if (overlap(box, hole) || overlap(box, popBox)) continue;
    return candidate;
  }

  return {
    left: clamp(midX, 8, Math.max(8, viewport.w - size - 8)),
    top: Math.max(8, padded.top - gap - size),
    dir: 'down',
  };
}

function dimAll(masks, vw, vh) {
  masks.top.style.top = '0px';
  masks.top.style.left = '0px';
  masks.top.style.width = '100%';
  masks.top.style.height = `${vh}px`;
  masks.bottom.style.top = `${vh}px`;
  masks.bottom.style.left = '0px';
  masks.bottom.style.width = '100%';
  masks.bottom.style.bottom = '0px';
  masks.bottom.style.height = '0px';
  masks.left.style.top = '0px';
  masks.left.style.left = '0px';
  masks.left.style.width = '0px';
  masks.left.style.height = '0px';
  masks.right.style.top = '0px';
  masks.right.style.left = `${vw}px`;
  masks.right.style.right = '0px';
  masks.right.style.height = '0px';
}

function applyHole(masks, padded) {
  const { top, left, width, height } = padded;
  const right = left + width;
  const bottom = top + height;
  masks.top.style.top = '0px';
  masks.top.style.left = '0px';
  masks.top.style.width = '100%';
  masks.top.style.height = `${Math.max(0, top)}px`;
  masks.bottom.style.top = `${bottom}px`;
  masks.bottom.style.left = '0px';
  masks.bottom.style.width = '100%';
  masks.bottom.style.bottom = '0px';
  masks.bottom.style.height = '';
  masks.left.style.top = `${top}px`;
  masks.left.style.left = '0px';
  masks.left.style.width = `${Math.max(0, left)}px`;
  masks.left.style.height = `${Math.max(0, height)}px`;
  masks.right.style.top = `${top}px`;
  masks.right.style.left = `${right}px`;
  masks.right.style.right = '0px';
  masks.right.style.height = `${Math.max(0, height)}px`;
}

function placeCoach(card, masks, ring, arrow, anchor, showPointer) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const viewport = { w: vw, h: vh };
  const popWidth = Math.min(POP_WIDTH, Math.max(240, vw - 32));
  card.style.width = `${popWidth}px`;
  const popH = Math.max(card.offsetHeight, 120);

  if (!anchor) {
    ring.hidden = true;
    arrow.hidden = true;
    dimAll(masks, vw, vh);
    const top = Math.max(VIEW_INSET, (vh - popH) / 2);
    const left = Math.max(VIEW_INSET, (vw - popWidth) / 2);
    card.style.top = `${top}px`;
    card.style.left = `${left}px`;
    return;
  }

  const r = anchor.getBoundingClientRect();
  const padded = {
    top: r.top - HOLE_PAD,
    left: r.left - HOLE_PAD,
    right: r.left + r.width + HOLE_PAD,
    bottom: r.top + r.height + HOLE_PAD,
    width: r.width + HOLE_PAD * 2,
    height: r.height + HOLE_PAD * 2,
  };
  applyHole(masks, padded);
  ring.hidden = false;
  ring.style.top = `${padded.top}px`;
  ring.style.left = `${padded.left}px`;
  ring.style.width = `${padded.width}px`;
  ring.style.height = `${padded.height}px`;

  const placed = placePopover(padded, popWidth, popH, viewport);
  card.style.top = `${placed.top}px`;
  card.style.left = `${placed.left}px`;

  if (showPointer) {
    const pointer = placePointer(padded, placed, popWidth, popH, viewport);
    arrow.hidden = false;
    arrow.dataset.dir = pointer.dir;
    arrow.style.top = `${pointer.top}px`;
    arrow.style.left = `${pointer.left}px`;
    arrow.style.transform = `rotate(${POINTER_ROTATE[pointer.dir]}deg)`;
  } else {
    arrow.hidden = true;
  }
}

function steps() {
  return [
    {
      id: 'intro',
      path: '/',
      title: 'See it work in a minute.',
      body: 'This is a finished page — not a CMS dashboard. Start the demo and we’ll walk you through the hidden login, editing copy, and how to put this in your repo.',
      primary: 'Start demo',
    },
    {
      id: 'invite',
      path: '/',
      title: 'Owners use a hidden page.',
      body: 'Login is not in the nav and not linked from the marketing page. Owners bookmark a random URL (/desk-x7k2). This demo opens it for you.',
      primary: 'Open hidden login',
      href: HIDDEN_PATH,
    },
    {
      id: 'sign-in',
      path: HIDDEN_PATH,
      anchor: '[data-demo="login-card"]',
      title: 'Access hidden login',
      body: 'Any valid email and password works. This does not create a real session. Fill the form, then tap Sign in — you return as someone who can edit.',
      primary: 'Sign in',
    },
    {
      id: 'edit-chip',
      path: '/',
      anchor: '[data-demo="edit-chip"]',
      title: 'Click Edit the site.',
      body: 'The chip in the corner. Outlines appear on copy you can change. Visitors never see this.',
      primary: 'Next',
      disableEditing: true,
    },
    {
      id: 'click-copy',
      path: '/',
      anchor: '[data-demo="tour-copy"]',
      title: 'Click the words. Change them.',
      body: 'Try the highlighted line — tap, type, click away. This demo save stays in your browser.',
      primary: 'Next',
      enableEditing: true,
    },
    {
      id: 'install',
      path: '/',
      anchor: '[data-demo="install"]',
      title: 'Install it in your repo.',
      body: 'In your project: npm i editable-website. Zero runtime dependencies. You keep your own login.',
      primary: 'Next',
    },
    {
      id: 'mark',
      path: '/',
      anchor: '[data-demo="mark"]',
      title: 'Mark the sentences you already have.',
      body: 'Put data-copy="hero.title" on the heading. The text on the page is the default. No CMS schema.',
      primary: 'Next',
    },
    {
      id: 'mount',
      path: '/',
      anchor: '[data-demo="mount"]',
      title: 'Call mount() after paint.',
      body: 'Pass isAdmin from your session. The package only talks to the DOM. Gate PUT /api/copy yourself.',
      primary: 'Next',
    },
    {
      id: 'persist',
      path: '/',
      anchor: '[data-demo="persist"]',
      title: 'Save through an API you run.',
      body: 'GET/PUT /api/copy → a JSON file is enough. Clone examples/express. After a save, call triggerCi() if you want GitHub Actions, GCP Cloud Build, or AWS CodePipeline to rebuild.',
      primary: 'Next',
    },
    {
      id: 'finish',
      path: '/',
      title: 'You can implement this today.',
      body: 'Ship a marketing site the founder can edit — instead of going back and forth on copy.',
      html: '<p>Developers: <a href="https://www.npmjs.com/package/editable-website" target="_blank" rel="noreferrer">editable-website</a> on npm, or <code>npx editable-website</code> to bootstrap an existing app.</p><p>Business owners: <a href="mailto:adam@freeech.co">adam@freeech.co</a> — we’ll implement this on your site for as little as $500.</p>',
      primary: 'Finish the demo',
    },
  ];
}

const LAZY_EMAIL = 'lazy@demo.test';
const LAZY_PASSWORD = 'lazy';

function hiddenLoginForm() {
  return (
    document.querySelector('[data-demo="hidden-login-form"]') ??
    document.querySelector('[data-demo="login-card"] form') ??
    document.querySelector('form')
  );
}

function setNativeValue(el, value) {
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, 'value')?.set?.call(el, value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
}

function fillHiddenLogin() {
  const form = hiddenLoginForm();
  if (!form) return false;
  const email =
    form.querySelector('input[type="email"]') ??
    form.querySelector('#hidden-login-email, #email, input[autocomplete="username"]');
  const pass =
    form.querySelector('input[type="password"]') ??
    form.querySelector('#hidden-login-pass, #pass, input[autocomplete="current-password"]');
  if (email instanceof HTMLInputElement) setNativeValue(email, LAZY_EMAIL);
  if (pass instanceof HTMLInputElement) setNativeValue(pass, LAZY_PASSWORD);
  return Boolean(email && pass);
}

let instance = null;

export function bootWalkthrough(options = {}) {
  if (instance) {
    instance.update(options);
    instance.sync();
    return instance;
  }

  const list = steps();
  let setEditing = options.setEditing ?? (() => {});
  let isAdmin = options.isAdmin ?? isOwner;
  let active = read(WALK_ACTIVE) === '1';
  let id = read(WALK_STEP) || 'intro';
  let root = null;
  let tries = 0;
  let scrolledFor = '';
  let chipTarget = null;
  const numbered = list.filter((item) => item.id !== 'intro');

  function current() {
    return list.find((item) => item.id === id) ?? list[0];
  }

  function persist(nextActive, nextId) {
    active = nextActive;
    id = nextId;
    write(WALK_ACTIVE, nextActive ? '1' : '0');
    write(WALK_STEP, nextId);
  }

  function refs() {
    return {
      card: root.querySelector('.ew-walk-card'),
      ring: root.querySelector('.ew-walk-ring'),
      arrow: root.querySelector('.ew-walk-arrow'),
      masks: {
        top: root.querySelector('.ew-walk-mask-top'),
        bottom: root.querySelector('.ew-walk-mask-bottom'),
        left: root.querySelector('.ew-walk-mask-left'),
        right: root.querySelector('.ew-walk-mask-right'),
      },
    };
  }

  function layout() {
    if (!root || !active) return;
    const step = current();
    if (step.path !== currentPath()) return;
    const live = step.anchor ? resolveAnchor(document.querySelector(step.anchor)) : null;
    const { card, masks, ring, arrow } = refs();
    if (!card) return;
    placeCoach(card, masks, ring, arrow, live, step.id === 'edit-chip');
  }

  function advanceFromChip() {
    if (id !== 'edit-chip') return;
    const index = list.findIndex((item) => item.id === 'edit-chip');
    const next = list[index + 1];
    if (next) go(next.id);
  }

  function bindChipAdvance(el) {
    if (chipTarget) {
      chipTarget.removeEventListener('click', advanceFromChip);
      chipTarget = null;
    }
    if (!el || current().id !== 'edit-chip') return;
    chipTarget = el;
    chipTarget.addEventListener('click', advanceFromChip);
  }

  function stop() {
    persist(false, 'intro');
    markSeen();
    root?.remove();
    root = null;
    tries = 0;
    scrolledFor = '';
    bindChipAdvance(null);
    setEditing(false);
  }

  function go(nextId) {
    persist(true, nextId);
    scrolledFor = '';
    const step = list.find((item) => item.id === nextId);
    if (step && step.path !== currentPath()) {
      window.location.assign(step.path);
      return;
    }
    tries = 0;
    render();
  }

  function onPrimary() {
    const step = current();
    if (step.id === 'intro') {
      const wasAdmin = isAdmin();
      clearOwner();
      persist(true, 'invite');
      if (wasAdmin) {
        window.location.assign('/');
        return;
      }
      render();
      return;
    }
    if (step.id === 'invite') {
      persist(true, 'sign-in');
      return;
    }
    if (step.id === 'sign-in') {
      hiddenLoginForm()?.requestSubmit();
      return;
    }
    if (step.id === 'finish') {
      stop();
      return;
    }
    const index = list.findIndex((item) => item.id === step.id);
    const next = list[index + 1];
    if (next) go(next.id);
    else stop();
  }

  function ensureRoot() {
    if (root) return;
    root = document.createElement('div');
    root.className = 'ew-walk';
    root.innerHTML = `
      <div class="ew-walk-mask ew-walk-mask-top"></div>
      <div class="ew-walk-mask ew-walk-mask-bottom"></div>
      <div class="ew-walk-mask ew-walk-mask-left"></div>
      <div class="ew-walk-mask ew-walk-mask-right"></div>
      <div class="ew-walk-ring" hidden></div>
      <div class="ew-walk-arrow" hidden data-demo="tour-pointer" aria-hidden="true">
        <span class="ew-walk-arrow-nub">${ARROW_SVG}</span>
      </div>
      <div class="ew-walk-card" role="dialog" aria-modal="false">
        <p class="ew-walk-step"></p>
        <h2 class="ew-walk-title"></h2>
        <p class="ew-walk-body"></p>
        <div class="ew-walk-extra"></div>
        <div class="ew-walk-actions">
          <button type="button" class="ew-walk-skip">Skip tour</button>
          <button type="button" class="ew-walk-back">Back</button>
          <div class="ew-walk-primary">
            <a class="ew-walk-next"></a>
            <button type="button" class="ew-walk-lazy" hidden>fill for me. im lazy</button>
          </div>
        </div>
      </div>
    `;
    document.body.append(root);
    root.querySelector('.ew-walk-skip').addEventListener('click', stop);
    root.querySelector('.ew-walk-back').addEventListener('click', () => {
      const index = list.findIndex((item) => item.id === id);
      const prev = list[index - 1];
      if (prev) go(prev.id);
    });
    root.querySelector('.ew-walk-next').addEventListener('click', (event) => {
      const stepNow = current();
      if (stepNow.href) persist(true, 'sign-in');
      else {
        event.preventDefault();
        onPrimary();
      }
    });
    root.querySelector('.ew-walk-lazy').addEventListener('click', (event) => {
      event.preventDefault();
      fillHiddenLogin();
    });
  }

  function render() {
    const step = current();
    if (!active || !step) {
      root?.remove();
      root = null;
      return;
    }
    if (step.path !== currentPath()) return;

    if (step.disableEditing) setEditing(false);
    if (step.enableEditing) setEditing(true);

    const el = step.anchor ? resolveAnchor(document.querySelector(step.anchor)) : null;
    if (step.anchor && !el && tries < ANCHOR_TRIES) {
      tries += 1;
      window.setTimeout(render, 80);
      return;
    }
    tries = 0;

    ensureRoot();

    const index = numbered.findIndex((item) => item.id === step.id);
    root.querySelector('.ew-walk-step').textContent =
      step.id === 'intro' || index < 0 ? '' : `Step ${index + 1} of ${numbered.length}`;
    root.querySelector('.ew-walk-title').textContent = step.title;
    root.querySelector('.ew-walk-body').textContent = step.body;
    root.querySelector('.ew-walk-extra').innerHTML = step.html ?? '';
    root.querySelector('.ew-walk-back').hidden = step.id === 'intro';
    root.querySelector('.ew-walk-skip').hidden = step.id === 'intro';
    const next = root.querySelector('.ew-walk-next');
    next.textContent = step.primary;
    next.setAttribute('href', step.href ?? '#');
    root.querySelector('.ew-walk-lazy').hidden = step.id !== 'sign-in';

    if (el && scrolledFor !== step.id) {
      scrolledFor = step.id;
      if (step.id !== 'edit-chip') el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    layout();
    requestAnimationFrame(layout);
    bindChipAdvance(el);
  }

  function sync() {
    if (new URLSearchParams(location.search).get('featureDemo') === '1' && !active) {
      persist(true, 'intro');
    }

    const path = currentPath();
    if (active) {
      const step = current();
      if (step.path !== path) {
        if (path === HIDDEN_PATH) persist(true, 'sign-in');
        else if (path === '/' && (id === 'invite' || id === 'sign-in') && isAdmin()) {
          persist(true, 'edit-chip');
        }
      }
      render();
      return;
    }

    if (!seen() && !isAdmin() && path === '/') {
      persist(true, 'intro');
      window.setTimeout(render, 350);
    }
  }

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest('[data-demo="try-demo"], [data-demo="open-login"]')) {
      persist(true, 'sign-in');
    }
  });

  window.addEventListener('resize', layout);
  window.addEventListener('scroll', layout, true);

  instance = {
    update(next) {
      if (next.setEditing) setEditing = next.setEditing;
      if (next.isAdmin) isAdmin = next.isAdmin;
    },
    sync,
    start() {
      persist(true, 'intro');
      render();
    },
  };

  sync();
  return instance;
}
