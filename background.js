(() => {
  const root = document.documentElement;
  const effect = 'stars';
  root.dataset.effect = effect;
  const colour = true;
  root.dataset.colour = String(colour);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const modeButton = document.querySelector('#mode-toggle');
  const layers = [...document.querySelectorAll('.layer')];
  const depths = [...document.querySelectorAll('.depth')];
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  let mode = new URLSearchParams(location.search).get('mode') === 'light' ? 'light' : 'dark';
  let transition;
  let sequence = 0;
  let fieldSize = Math.ceil(Math.max(innerWidth, innerHeight) + 192);

  function texture(index) {
    let seed = 2157 + index * 101;
    const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    const size = fieldSize;
    const count = Math.round([90, 36, 0][index] * size * size / 490000);
    const tokens = getComputedStyle(root);
    const fill = tokens.getPropertyValue('--star-neutral').trim();
    const colours = ['blue', 'teal', 'amber', 'rose'].map(name => tokens.getPropertyValue(`--star-${name}`).trim());
    let circles = '';
    for (let i = 0; i < count; i++) {
      const x = random() * size;
      const y = random() * size;
      const radius = ([.65, 1.1, 1.3][index] + random() * .65) * (colour && mode === 'light' ? 1.12 : 1);
      const tint = colour && mode === 'light' && (i % 5 < 3 || index === 2) ? colours[(i + index) % colours.length] : fill;
      const alpha = (colour && mode === 'light' ? .88 + random() * .12 : .45 + random() * .5);
      circles += `<circle fill="${tint}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${radius.toFixed(2)}" opacity="${alpha.toFixed(2)}"/>`;
    }
    return `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" fill="${fill}">${circles}</svg>`)}")`;
  }
  function buildGlints() {
    const layer = layers[2];
    if (layer.childElementCount) return;
    let seed = 517;
    const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    const count = Math.max(5, Math.min(18, Math.round(innerWidth * innerHeight / 110000)));
    for (let i = 0; i < count; i++) {
      const glint = document.createElement('span');
      glint.className = 'glint';
      glint.dataset.tint = ['blue', 'teal', 'amber', 'rose'][i % 4];
      glint.style.left = `${4 + random() * 92}%`;
      glint.style.top = `${4 + random() * 92}%`;
      glint.style.animationDuration = `${(4 + random() * 5).toFixed(2)}s, ${(30 + random() * 30).toFixed(2)}s`;
      glint.style.animationDelay = `${(-random() * 14).toFixed(2)}s, ${(-random() * 60).toFixed(2)}s`;
      glint.innerHTML = '<svg viewBox="-7 -7 14 14" width="14" height="14" fill="currentColor"><circle r="6" opacity=".06"/><path d="M0-5 1-1 5 0 1 1 0 5-1 1-5 0-1-1Z" opacity=".65"/><circle r="1.6" opacity=".85"/></svg>';
      layer.append(glint);
    }
  }
  function paint() {
    root.dataset.mode = mode;
    document.querySelectorAll('.project-link, [data-home-link]').forEach(link => {
      const url = new URL(link.href);
      url.searchParams.set('mode', mode);
      link.href = url;
    });
    layers.slice(0, 2).forEach((layer, index) => {
      layer.style.backgroundImage = texture(index);
      if (effect === 'stars') {
        layer.style.setProperty('--field-size', `${fieldSize}px`);
        layer.style.animationDuration = `${fieldSize / (index ? 12.5 : 5)}s`;
      }
    });
    buildGlints();
    const label = `Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`;
    modeButton.setAttribute('aria-label', label);
    modeButton.title = label;
  }
  modeButton.addEventListener('click', event => {
    mode = mode === 'dark' ? 'light' : 'dark';
    const ticket = ++sequence;
    transition?.skipTransition();
    if (document.hidden || reduced.matches || !document.startViewTransition || event.detail === 0) {
      paint();
      delete root.dataset.switching;
      transition = null;
      return;
    }
    root.dataset.switching = 'true';
    transition = document.startViewTransition(() => { if (ticket === sequence) paint(); });
    transition.ready.catch(error => { if (!['AbortError', 'InvalidStateError'].includes(error.name)) console.error(error); });
    transition.finished.finally(() => { if (ticket === sequence) { delete root.dataset.switching; transition = null; } });
  });
  reduced.addEventListener('change', () => {
    if (reduced.matches) {
      transition?.skipTransition();
      depths.forEach(depth => { depth.style.transform = ''; });
    }
  });
  document.addEventListener('visibilitychange', () => { root.dataset.hidden = String(document.hidden); });
  document.addEventListener('pointermove', event => {
    if (!pointer.matches || reduced.matches || document.hidden) return;
    const x = (event.clientX / innerWidth - .5) * 2;
    const y = (event.clientY / innerHeight - .5) * 2;
    depths.forEach((depth, index) => {
      const distance = [10, 26, 40][index];
      depth.style.transform = `translate3d(${x * distance}px, ${y * distance}px, 0)`;
    });
  }, {passive: true});
  document.addEventListener('pointerleave', () => { depths.forEach(depth => { depth.style.transform = ''; }); });
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const nextSize = Math.ceil(Math.max(innerWidth, innerHeight) + 192);
      if (nextSize === fieldSize) return;
      fieldSize = nextSize;
      layers[2].replaceChildren();
      paint();
    }, 150);
  });
  paint();
})();
