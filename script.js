(() => {
  const panels = Array.from(document.querySelectorAll('.panel'));
  let activeIndex = panels.findIndex(p => p.classList.contains('active')) || 0;

  // Cambia panel activo y sincroniza aria + hash
  const setActive = (idx, {focus=false, updateHash=true} = {}) => {
    panels.forEach((p, i) => {
      const isActive = i === idx;
      p.classList.toggle('active', isActive);
      p.setAttribute('aria-selected', String(isActive));
      if (isActive) activeIndex = i;
    });
    if (focus) panels[idx].focus({preventScroll:true});
    if (updateHash) history.replaceState(null, '', `#panel=${idx+1}`);
  };

  // Click + teclado para tabs
  panels.forEach((panel, i) => {
    panel.dataset.index = String(i+1);
    panel.addEventListener('click', () => setActive(i));
    panel.addEventListener('keydown', (e) => {
      const { key } = e;
      if (key === 'ArrowRight' || key === 'ArrowDown'){
        e.preventDefault(); setActive((i + 1) % panels.length, {focus:true});
      } else if (key === 'ArrowLeft' || key === 'ArrowUp'){
        e.preventDefault(); setActive((i - 1 + panels.length) % panels.length, {focus:true});
      } else if (key === 'Home'){
        e.preventDefault(); setActive(0, {focus:true});
      } else if (key === 'End'){
        e.preventDefault(); setActive(panels.length - 1, {focus:true});
      }
    });
  });

  // ===== Deep linking: lee #panel=3 al cargar y al cambiar hash
  const parseHash = () => {
    const params = new URLSearchParams(location.hash.slice(1));
    const n = parseInt(params.get('panel'), 10);
    if (!Number.isFinite(n)) return null;
    return Math.max(1, Math.min(panels.length, n)) - 1;
  };
  const initial = parseHash();
  if (initial !== null) setActive(initial, {focus:false, updateHash:false});
  window.addEventListener('hashchange', () => {
    const idx = parseHash();
    if (idx !== null) setActive(idx, {focus:true, updateHash:false});
  });

  // ===== Panel de control (tema, duración, easing, radio) + persistencia
  const root = document.documentElement;
  const $ = (sel) => document.querySelector(sel);
  const themeToggle = $('#themeToggle');
  const duration = $('#duration');
  const durationOut = $('#durationOut');
  const easing = $('#easing');
  const radius = $('#radius');
  const radiusOut = $('#radiusOut');

  // Cargar preferencias guardadas
  const prefs = JSON.parse(localStorage.getItem('exp-cards:prefs') || '{}');
  if (prefs.theme === 'dark') root.setAttribute('data-theme','dark');
  if (themeToggle) themeToggle.checked = root.getAttribute('data-theme') === 'dark';

  if (prefs.speed) { root.style.setProperty('--speed', prefs.speed + 'ms'); if (duration) duration.value = prefs.speed; }
  if (prefs.easing) { root.style.setProperty('--easing', prefs.easing); if (easing) easing.value = prefs.easing; }
  if (prefs.radius) { root.style.setProperty('--radius', prefs.radius + 'px'); if (radius) radius.value = prefs.radius; }
  if (durationOut && duration) durationOut.textContent = duration.value;
  if (radiusOut && radius) radiusOut.textContent = radius.value;

  const save = () => {
    const data = {
      theme: root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light',
      speed: duration ? parseInt(duration.value, 10) : 480,
      easing: easing ? easing.value : 'cubic-bezier(.2,.8,.2,1)',
      radius: radius ? parseInt(radius.value, 10) : 32,
    };
    localStorage.setItem('exp-cards:prefs', JSON.stringify(data));
  };

  themeToggle && themeToggle.addEventListener('change', () => {
    const dark = themeToggle.checked;
    root.setAttribute('data-theme', dark ? 'dark' : 'light');
    save();
  });
  duration && duration.addEventListener('input', () => {
    root.style.setProperty('--speed', duration.value + 'ms');
    if (durationOut) durationOut.textContent = duration.value;
  });
  duration && duration.addEventListener('change', save);

  easing && easing.addEventListener('change', () => {
    root.style.setProperty('--easing', easing.value);
    save();
  });

  radius && radius.addEventListener('input', () => {
    root.style.setProperty('--radius', radius.value + 'px');
    if (radiusOut) radiusOut.textContent = radius.value;
  });
  radius && radius.addEventListener('change', save);
})();
