(() => {
  const section = document.querySelector('.previously');
  if (!section) return;
  const viewport = section.querySelector('.client-viewport');
  const track = section.querySelector('.client-track');
  const group = section.querySelector('.client-group');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const hoverCapable = matchMedia('(hover: hover) and (pointer: fine)');
  const idleDelay = 1000;
  const speed = 24;
  let cycle = 0;
  let frame = 0;
  let previousTime = 0;
  let position = 0;
  let writtenPosition = 0;
  let idleTimer = 0;
  let idle = true;
  let hovering = false;
  let focused = false;
  let visible = false;
  let keyboardInput = false;
  let suppressTouchClick = false;
  const pointers = new Set();

  // Only the middle group participates in the accessibility tree and tab order.
  for (let i = 0; i < 4; i++) {
    const clone = group.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.querySelectorAll('a').forEach(link => { link.tabIndex = -1; });
    if (i < 2) track.prepend(clone);
    else track.append(clone);
  }

  function writePosition(value) {
    viewport.scrollLeft = value;
    writtenPosition = viewport.scrollLeft;
    position = value;
  }

  function normalize() {
    if (!cycle || reduced.matches) return;
    const offset = ((viewport.scrollLeft % cycle) + cycle) % cycle;
    writePosition(cycle * 2 + offset);
  }

  function canMove() {
    return cycle > 0 && !reduced.matches && idle && !hovering && !focused && !pointers.size && visible && !document.hidden;
  }

  function stopFrame() {
    cancelAnimationFrame(frame);
    frame = 0;
    previousTime = 0;
  }

  function tick(time) {
    if (!canMove()) { stopFrame(); return; }
    if (previousTime) {
      position += speed * Math.min(time - previousTime, 50) / 1000;
      if (position >= cycle * 3) position -= cycle;
      writePosition(position);
    }
    previousTime = time;
    frame = requestAnimationFrame(tick);
  }

  function sync() {
    if (!canMove()) stopFrame();
    else if (!frame) {
      normalize();
      frame = requestAnimationFrame(tick);
    }
  }

  function activity() {
    idle = false;
    clearTimeout(idleTimer);
    stopFrame();
    idleTimer = setTimeout(() => {
      idle = true;
      position = viewport.scrollLeft;
      sync();
    }, idleDelay);
  }

  viewport.addEventListener('pointerenter', event => {
    if (event.pointerType === 'mouse' && hoverCapable.matches) { hovering = true; sync(); }
  });
  viewport.addEventListener('pointerleave', event => {
    if (event.pointerType === 'mouse') { hovering = false; activity(); }
  });
  viewport.addEventListener('pointerdown', event => {
    suppressTouchClick = event.pointerType === 'touch' && canMove();
    keyboardInput = false;
    focused = false;
    pointers.add(event.pointerId);
    activity();
  }, { passive: true });
  function release(event) {
    if (pointers.delete(event.pointerId)) activity();
  }
  window.addEventListener('pointerup', release, { passive: true });
  window.addEventListener('pointercancel', release, { passive: true });
  viewport.addEventListener('click', event => {
    if (suppressTouchClick) {
      event.preventDefault();
      suppressTouchClick = false;
    }
  });
  viewport.addEventListener('wheel', activity, { passive: true });
  viewport.addEventListener('scroll', () => {
    // Ignore our own writes; native momentum keeps postponing the idle timer.
    if (Math.abs(viewport.scrollLeft - writtenPosition) > 1) {
      position = viewport.scrollLeft;
      activity();
    }
  }, { passive: true });
  document.addEventListener('keydown', () => {
    keyboardInput = true;
    focused = viewport.contains(document.activeElement);
    sync();
  });
  viewport.addEventListener('focusin', () => { focused = keyboardInput; sync(); });
  viewport.addEventListener('focusout', () => {
    queueMicrotask(() => {
      focused = keyboardInput && viewport.contains(document.activeElement);
      activity();
    });
  });
  viewport.addEventListener('keydown', event => {
    if (event.target !== viewport) return;
    const steps = { ArrowLeft: -120, ArrowRight: 120 };
    if (!(event.key in steps)) return;
    event.preventDefault();
    activity();
    viewport.scrollLeft += steps[event.key];
  });

  let initialized = false;
  function measure() {
    const oldCycle = cycle;
    const offset = oldCycle ? viewport.scrollLeft % oldCycle : 0;
    cycle = group.getBoundingClientRect().width;
    if (!initialized) {
      writePosition(reduced.matches ? 0 : cycle * 2);
      initialized = true;
    } else if (cycle !== oldCycle && !pointers.size && !focused) {
      writePosition((reduced.matches ? 0 : cycle * 2) + offset);
    }
    sync();
  }
  new ResizeObserver(measure).observe(group);
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    sync();
  }).observe(section);
  document.addEventListener('visibilitychange', () => {
    pointers.clear();
    sync();
  });
  window.addEventListener('blur', () => { pointers.clear(); hovering = false; activity(); });
  hoverCapable.addEventListener('change', () => { hovering = false; sync(); });
  reduced.addEventListener('change', () => {
    stopFrame();
    const offset = cycle ? position % cycle : 0;
    // CSS hides duplicate groups under reduce; restore the same logical offset.
    writePosition((reduced.matches ? 0 : cycle * 2) + offset);
    sync();
  });
  measure();
})();
