const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');

function fixture(reduce = false) {
  const callbacks = new Map();
  const timers = new Map();
  let id = 0;
  let time = 1;
  class Element {
    constructor() { this.listeners = {}; this.attrs = {}; this.scrollLeft = 0; this.links = []; }
    addEventListener(type, listener) { (this.listeners[type] ||= []).push(listener); }
    emit(type, event = {}) { (this.listeners[type] || []).forEach(fn => fn({ target: this, ...event })); }
    setAttribute(key, value) { this.attrs[key] = value; }
    cloneNode() { const clone = new Element(); clone.links = Array.from({ length: 4 }, () => new Element()); return clone; }
    querySelectorAll() { return this.links; }
    getBoundingClientRect() { return { width: 726 }; }
    contains(target) { return target === this || this.links.includes(target); }
  }
  const section = new Element(), viewport = new Element(), track = new Element(), group = new Element();
  const document = new Element(), window = new Element(), reduced = new Element(), hover = new Element();
  document.hidden = false;
  document.activeElement = null;
  reduced.matches = reduce;
  hover.matches = true;
  const groups = [group];
  track.prepend = node => groups.unshift(node);
  track.append = node => groups.push(node);
  viewport.links = [new Element()];
  section.querySelector = selector => ({ '.client-viewport': viewport, '.client-track': track, '.client-group': group })[selector];
  document.querySelector = () => section;
  let intersection;
  vm.runInNewContext(readFileSync('previously.js', 'utf8'), {
    document, window, matchMedia: query => query.includes('reduced') ? reduced : hover,
    requestAnimationFrame: fn => { callbacks.set(++id, fn); return id; },
    cancelAnimationFrame: key => callbacks.delete(key),
    setTimeout: (fn, delay) => { timers.set(++id, { fn, remaining: delay }); return id; },
    clearTimeout: key => timers.delete(key), queueMicrotask: fn => fn(),
    ResizeObserver: class { observe() {} },
    IntersectionObserver: class { constructor(fn) { intersection = fn; } observe() {} }
  });
  function frames(count = 60) {
    for (let i = 0; i < count; i++) {
      time += 1000 / 60;
      const pending = [...callbacks.values()]; callbacks.clear(); pending.forEach(fn => fn(time));
    }
  }
  function idle(milliseconds = Infinity) {
    for (const [key, timer] of [...timers]) {
      timer.remaining -= milliseconds;
      if (timer.remaining <= 0) { timers.delete(key); timer.fn(); }
    }
  }
  function show(value) { intersection([{ isIntersecting: value }]); }
  show(true);
  return { viewport, group, groups, document, window, reduced, frames, idle, show, callbacks };
}

test('idle motion loops without changing the logical position at the seam', () => {
  const f = fixture(); const start = f.viewport.scrollLeft;
  f.frames(61); assert.ok(Math.abs(f.viewport.scrollLeft - start - 24) < 0.01);
  f.frames(1800); assert.ok(f.viewport.scrollLeft >= 1452 && f.viewport.scrollLeft < 2178);
});

test('hover pauses immediately and resumes only after leave and idle', () => {
  const f = fixture(); f.frames(); f.viewport.emit('pointerenter', { pointerType: 'mouse' });
  const at = f.viewport.scrollLeft; f.frames(); assert.equal(f.viewport.scrollLeft, at);
  f.viewport.emit('pointerleave', { pointerType: 'mouse' }); f.frames(); assert.equal(f.viewport.scrollLeft, at);
  f.idle(); f.frames(); assert.ok(f.viewport.scrollLeft > at);
});

test('touch and momentum retain position, first tap pauses, pointer focus does not block resumption', () => {
  const f = fixture(); f.frames(); f.viewport.emit('pointerdown', { pointerType: 'touch', pointerId: 1 });
  f.document.activeElement = f.viewport; f.viewport.emit('focusin');
  let prevented = false; f.viewport.emit('click', { preventDefault() { prevented = true; } }); assert.ok(prevented);
  f.viewport.scrollLeft += 175; f.viewport.emit('scroll');
  const at = f.viewport.scrollLeft; f.idle(); f.frames(); assert.equal(f.viewport.scrollLeft, at);
  f.window.emit('pointerup', { pointerId: 1 }); f.viewport.scrollLeft += 40; f.viewport.emit('scroll');
  const coast = f.viewport.scrollLeft; f.frames(); assert.equal(f.viewport.scrollLeft, coast);
  f.idle(); f.frames(); assert.ok(f.viewport.scrollLeft > coast);
});

test('resumes one second after the last manual scroll, resetting the delay during momentum', () => {
  const f = fixture(); f.viewport.emit('wheel'); f.viewport.scrollLeft += 150; f.viewport.emit('scroll');
  f.idle(600); f.viewport.scrollLeft += 40; f.viewport.emit('scroll');
  const at = f.viewport.scrollLeft;
  f.idle(999); f.frames(); assert.equal(f.viewport.scrollLeft, at);
  f.idle(1); f.frames(); assert.ok(f.viewport.scrollLeft > at);
});

test('keyboard focus freezes movement, arrow keys scroll immediately, focus exit resumes', () => {
  const f = fixture(); f.document.emit('keydown'); f.document.activeElement = f.viewport; f.viewport.emit('focusin');
  const at = f.viewport.scrollLeft; f.frames(); assert.equal(f.viewport.scrollLeft, at);
  f.viewport.emit('keydown', { key: 'ArrowRight', preventDefault() {} }); assert.equal(f.viewport.scrollLeft, at + 120);
  f.idle(); f.frames(); assert.equal(f.viewport.scrollLeft, at + 120);
  f.document.activeElement = null; f.viewport.emit('focusout'); f.idle(); f.frames(); assert.ok(f.viewport.scrollLeft > at + 120);
});

test('hidden and offscreen work stops, reduced motion never starts autoplay', () => {
  const f = fixture(); f.frames(); f.show(false); assert.equal(f.callbacks.size, 0);
  f.show(true); f.document.hidden = true; f.document.emit('visibilitychange'); assert.equal(f.callbacks.size, 0);
  const r = fixture(true); r.frames(); assert.equal(r.viewport.scrollLeft, 0); assert.equal(r.callbacks.size, 0);
  r.viewport.scrollLeft = 120; r.viewport.emit('scroll'); r.idle(); r.frames(); assert.equal(r.viewport.scrollLeft, 120);
});

test('live reduced-motion switch retains logical offset and stops movement', () => {
  const f = fixture(); f.frames(); const offset = f.viewport.scrollLeft % 726;
  f.reduced.matches = true; f.reduced.emit('change'); assert.ok(Math.abs(f.viewport.scrollLeft - offset) < 0.01); assert.equal(f.callbacks.size, 0);
});

test('loop copies add neither announcements nor tab stops', () => {
  const f = fixture(); assert.equal(f.groups.length, 5);
  for (const group of f.groups.filter(group => group !== f.group)) {
    assert.equal(group.attrs['aria-hidden'], 'true'); assert.ok(group.links.every(link => link.tabIndex === -1));
  }
});
