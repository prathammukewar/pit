// A short guided tour for the first visit: a spotlight on one panel at a
// time with a few sentences about it. Six stops, skippable at any point,
// and it remembers that it ran.

const STEPS = [
  {
    target: 'ladder-panel',
    title: 'the book',
    body:
      'Every price where someone is waiting to trade. Buyers on the green side, sellers on the red side, biggest lines are the deepest. Click a price to rest your own order there.',
  },
  {
    target: 'chart-panel',
    title: 'the market',
    body:
      'The solid line is where it actually trades. The dashed line is a hidden "true" value the price keeps chasing. When the chart shades red, a trader who knows where the value is going has arrived.',
  },
  {
    target: 'desks-panel',
    title: 'the desks',
    body:
      'Everyone trading here, with their position and profit updated live. Hover a name to learn how that desk thinks. The interesting one is mm-wary, which usually ends up ahead.',
  },
  {
    target: 'user-panel',
    title: 'your desk',
    body:
      'Buy or sell at market, join the best price with a resting order, or flatten to get out of everything. Your fills show on the tape tagged "you", and your profit updates as the price moves.',
  },
  {
    target: 'bot-lab',
    title: 'the bot lab',
    body:
      'When clicking gets old, write a strategy in JavaScript or load a preset, hire it onto the floor, and backtest it against a whole season in about a second.',
  },
  {
    target: 'primary-controls',
    title: 'the controls',
    body:
      'Seed picks the market and the same seed always replays the same one. Pause, speed, and share do what they say. Settings has sound, themes, and dials for the market weather. Hover anything for an explanation.',
  },
];

export class Tour {
  constructor(onDone) {
    this.onDone = onDone;
    this.step = -1;
    this.root = null;
    this.onResize = () => this.layout();
    this.onKey = (e) => {
      if (this.step < 0) return;
      if (e.key === 'Escape') this.finish();
      if (e.key === 'Enter' || e.key === 'ArrowRight') this.go(1);
      if (e.key === 'ArrowLeft') this.go(-1);
    };
  }

  start() {
    if (this.root) this.finish();
    this.root = document.createElement('div');
    this.root.id = 'tour-overlay';
    this.root.innerHTML =
      '<div class="spot"></div>' +
      '<div class="card" role="dialog" aria-live="polite">' +
      '<div class="step"></div><h3></h3><p></p>' +
      '<div class="row"><button class="back">back</button>' +
      '<button class="next">next</button>' +
      '<button class="skip">skip the tour</button></div></div>';
    document.body.append(this.root);
    this.root.querySelector('.back').addEventListener('click', () => this.go(-1));
    this.root.querySelector('.next').addEventListener('click', () => this.go(1));
    this.root.querySelector('.skip').addEventListener('click', () => this.finish());
    window.addEventListener('resize', this.onResize);
    document.addEventListener('keydown', this.onKey);
    this.step = 0;
    this.render();
  }

  go(delta) {
    const next = this.step + delta;
    if (next >= STEPS.length) return this.finish();
    if (next < 0) return;
    this.step = next;
    this.render();
  }

  render() {
    const s = STEPS[this.step];
    const card = this.root.querySelector('.card');
    card.querySelector('.step').textContent = `${this.step + 1} of ${STEPS.length}`;
    card.querySelector('h3').textContent = s.title;
    card.querySelector('p').textContent = s.body;
    card.querySelector('.back').disabled = this.step === 0;
    card.querySelector('.next').textContent = this.step === STEPS.length - 1 ? 'done' : 'next';
    const el = document.getElementById(s.target);
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    // Let the scroll settle before measuring.
    setTimeout(() => this.layout(), 350);
    this.layout();
    card.querySelector('.next').focus();
  }

  layout() {
    if (!this.root || this.step < 0) return;
    const el = document.getElementById(STEPS[this.step].target);
    const r = el.getBoundingClientRect();
    const spot = this.root.querySelector('.spot');
    const pad = 6;
    spot.style.left = `${r.left - pad}px`;
    spot.style.top = `${r.top - pad}px`;
    spot.style.width = `${r.width + pad * 2}px`;
    spot.style.height = `${r.height + pad * 2}px`;

    const card = this.root.querySelector('.card');
    const cw = card.offsetWidth;
    const ch = card.offsetHeight;
    let x = r.left + r.width / 2 - cw / 2;
    x = Math.max(10, Math.min(x, window.innerWidth - cw - 10));
    let y = r.bottom + 14;
    if (y + ch > window.innerHeight - 10) y = r.top - ch - 14;
    if (y < 10) y = Math.max(10, window.innerHeight / 2 - ch / 2);
    card.style.left = `${x}px`;
    card.style.top = `${y}px`;
  }

  finish() {
    if (!this.root) return;
    this.root.remove();
    this.root = null;
    this.step = -1;
    window.removeEventListener('resize', this.onResize);
    document.removeEventListener('keydown', this.onKey);
    this.onDone?.();
  }
}
