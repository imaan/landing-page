(() => {
  const links = [...document.querySelectorAll('.project-link')];
  const animations = new Map();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const hover = matchMedia('(hover: hover) and (pointer: fine)');

  function leave(link) {
    link.classList.remove('is-engaged');
    (animations.get(link) || []).forEach(animation => animation.cancel());
    animations.delete(link);
  }
  function reset() { links.forEach(leave); }
  function enter(link) {
    reset();
    if (reduced.matches) return;
    link.classList.add('is-engaged');
    animations.set(link, [...link.querySelectorAll('.glitch-copy')].map((copy, i) => {
      const animation = copy.animate([
        {transform:'translateX(0)',opacity:0,offset:0},
        {transform:`translateX(${i ? -4 : 4}px)`,opacity:.7,offset:.025,easing:'steps(1,end)'},
        {transform:`translateX(${i ? 2 : -2}px)`,opacity:.55,offset:.055,easing:'steps(1,end)'},
        {transform:'translateX(0)',opacity:0,offset:.09},
        {transform:'translateX(0)',opacity:0,offset:1}
      ], {duration:3200, iterations:Infinity, easing:'linear'});
      animation.id = 'project-glitch';
      return animation;
    }));
  }
  links.forEach(link => {
    link.addEventListener('pointerenter', event => {
      if (event.pointerType === 'mouse' && hover.matches) enter(link);
    });
    link.addEventListener('pointerleave', () => leave(link));
    ['pointercancel', 'focus', 'click'].forEach(event => link.addEventListener(event, reset));
  });
  window.addEventListener('blur', reset);
  window.addEventListener('resize', reset);
  document.addEventListener('visibilitychange', () => { if (document.hidden) reset(); });
  reduced.addEventListener('change', reset);
  hover.addEventListener('change', reset);
  document.getElementById('mode-toggle')?.addEventListener('click', reset);
})();
