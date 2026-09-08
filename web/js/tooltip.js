// Real tooltips: instant, readable, positioned, and they show on keyboard
// focus too. Native title attributes take a second to appear, render in a
// tiny system box, and never show on touch screens, so every title in the
// page is moved into data-tip and handled here instead.

let tip = null;
let anchor = null;
let pinned = false; // opened by tap on a help button; stays until tapped away

function ensure() {
  if (tip) return tip;
  tip = document.createElement('div');
  tip.id = 'tip';
  tip.setAttribute('role', 'tooltip');
  tip.hidden = true;
  document.body.append(tip);
  return tip;
}

function place(el) {
  const t = ensure();
  const r = el.getBoundingClientRect();
  t.hidden = false;
  const tw = t.offsetWidth;
  const th = t.offsetHeight;
  let x = r.left + r.width / 2 - tw / 2;
  x = Math.max(8, Math.min(x, window.innerWidth - tw - 8));
  let y = r.bottom + 8;
  if (y + th > window.innerHeight - 8) y = r.top - th - 8;
  t.style.left = `${x}px`;
  t.style.top = `${Math.max(8, y)}px`;
  t.classList.add('show');
}

function show(el) {
  const text = el.dataset.tip;
  if (!text) return;
  anchor = el;
  const t = ensure();
  t.textContent = text;
  place(el);
}

function hide(force = false) {
  if (pinned && !force) return;
  pinned = false;
  anchor = null;
  if (!tip) return;
  tip.classList.remove('show');
  tip.hidden = true;
}

const target = (e) => (e.target instanceof Element ? e.target.closest('[data-tip]') : null);

export function installTooltips() {
  // Anything still carrying a native title gets converted.
  for (const el of document.querySelectorAll('[title]')) {
    if (!el.dataset.tip) el.dataset.tip = el.getAttribute('title');
    el.removeAttribute('title');
  }

  document.addEventListener('mouseover', (e) => {
    const el = target(e);
    if (el && el !== anchor && !pinned) show(el);
  });
  document.addEventListener('mouseout', (e) => {
    const el = target(e);
    if (el && el === anchor && !pinned) hide();
  });
  document.addEventListener('focusin', (e) => {
    const el = target(e);
    if (el) show(el);
  });
  document.addEventListener('focusout', () => hide());
  // Help buttons toggle on tap, which is how touch users get here.
  document.addEventListener('click', (e) => {
    const el = e.target instanceof Element ? e.target.closest('.help') : null;
    if (el) {
      if (pinned && anchor === el) {
        hide(true);
      } else {
        pinned = false;
        show(el);
        pinned = true;
      }
      return;
    }
    if (pinned) hide(true);
  });
  // Follow the anchor while the page scrolls or resizes instead of vanishing.
  const follow = () => {
    if (anchor && tip && !tip.hidden) place(anchor);
  };
  window.addEventListener('scroll', follow, { passive: true });
  window.addEventListener('resize', follow);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hide(true);
  });
}
