// Language and theme toggle functionality extracted from index.html to improve page performance.

// Initialize language toggle button and translations
document.addEventListener('DOMContentLoaded', () => {
  const langToggle = document.querySelector('.lang-toggle');
  const translations = {
    en: {
      projects: 'Active Projects',
      viewProject: 'View Project →',
      telegram: 'telegram',
      tgChannel: 'tg blog',
      discord: 'discord',
      themeDark: 'dark',
      themeLight: 'light'
    },
    ru: {
      projects: 'Активные проекты',
      viewProject: 'Открыть проект →',
      telegram: 'телеграм',
      tgChannel: 'тг блог',
      discord: 'дискорд',
      themeDark: 'темная',
      themeLight: 'светлая'
    }
  };

  // Theme switching
  const themeToggle = document.querySelector('.theme-toggle');
  const themeIcon = document.querySelector('.theme-icon');
  const themeText = document.querySelector('.theme-text');
  const body = document.body;

  function updateThemeUI(isLight) {
    themeIcon.textContent = isLight ? '🌞' : '🌙';
    themeText.textContent = translations[currentLang][isLight ? 'themeLight' : 'themeDark'];
  }

  themeToggle.addEventListener('click', () => {
    const isLight = !body.classList.contains('light-theme');
    body.classList.toggle('light-theme');
    body.classList.toggle('dark-theme');
    updateThemeUI(isLight);
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    updatePixiColors();
  });

  let currentLang = localStorage.getItem('lang') || 'ru'; // Default to Russian

  function updateLanguage() {
    // Update projects title
    const projectTitle = document.querySelector('.projects-title');
    if (projectTitle) projectTitle.textContent = translations[currentLang].projects;

    // Update project links (if any future ones)
    document.querySelectorAll('.project-link').forEach(link => {
      link.textContent = translations[currentLang].viewProject;
    });

    // Update social links
    const tg = document.querySelector('.telegram');
    const tgCh = document.querySelector('.tg-channel');
    const discord = document.querySelector('.discord');
    if (tg) tg.textContent = translations[currentLang].telegram;
    if (tgCh) tgCh.textContent = translations[currentLang].tgChannel;
    if (discord) discord.textContent = translations[currentLang].discord;

    // Update project descriptions
    document.querySelectorAll('.project-description[data-en][data-ru]').forEach(desc => {
      desc.innerHTML = desc.getAttribute(`data-${currentLang}`);
    });

    // Update theme text label
    themeText.textContent = translations[currentLang][body.classList.contains('light-theme') ? 'themeLight' : 'themeDark'];
  }

  langToggle.addEventListener('click', () => {
    currentLang = currentLang === 'en' ? 'ru' : 'en';
    langToggle.textContent = currentLang.toUpperCase();
    localStorage.setItem('lang', currentLang);
    updateLanguage();
  });

  // ===== PixiJS GPU background =====
  let pixiApp = null;
  let piShapes = [];

  function initPixiBackground() {
    if (pixiApp || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; // already init or reduce motion

    const canvas = document.getElementById('bg-canvas');
    if (!canvas || typeof PIXI === 'undefined') return;

    pixiApp = new PIXI.Application({
      view: canvas,
      resizeTo: window,
      antialias: true,
      autoDensity: true,
      backgroundAlpha: 0
    });

    // Limit FPS to 24 for power savings
    pixiApp.ticker.maxFPS = 24;

    const numShapes = 4; // fewer shapes for lower CPU
    const colorsDark = 0xffffff;
    const colorsLight = 0x6496ff;

    for (let i = 0; i < numShapes; i++) {
      const g = new PIXI.Graphics();
      drawBlob(g, body.classList.contains('light-theme') ? colorsLight : colorsDark);
      g.alpha = 0.06 + Math.random() * 0.05;
      resetPosition(g);
      pixiApp.stage.addChild(g);
      piShapes.push(g);
    }

    // Animation ticker
    pixiApp.ticker.add((delta) => {
      piShapes.forEach((g, idx) => {
        g.rotation += 0.002 * (idx % 2 === 0 ? 1 : -1) * delta; // slower rotation
        g.x += g._dx * delta;
        g.y += g._dy * delta;
        // bounce off bounds
        if (g.x < -200 || g.x > window.innerWidth + 200) g._dx *= -1;
        if (g.y < -200 || g.y > window.innerHeight + 200) g._dy *= -1;
      });
    });
    // Resize listener: just updates renderer (auto by Pixi). Optionally clamp shapes inside new bounds.
    window.addEventListener('resize', () => {
      if (!pixiApp) return;
      piShapes.forEach((g) => {
        // if shape is outside new bounds, wrap it to opposite edge smoothly
        if (g.x > window.innerWidth + 150) g.x = -150;
        if (g.x < -150) g.x = window.innerWidth + 150;
        if (g.y > window.innerHeight + 150) g.y = -150;
        if (g.y < -150) g.y = window.innerHeight + 150;
      });
    });

    // Pause ticker when tab is hidden
    document.addEventListener('visibilitychange', () => {
      if (!pixiApp) return;
      if (document.hidden) {
        pixiApp.ticker.stop();
      } else {
        pixiApp.ticker.start();
      }
    });
  }

  function drawBlob(g, color) {
    g.clear();
    g.beginFill(color);
    const r = 120 + Math.random() * 100;
    g.drawCircle(0, 0, r);
    g.endFill();
    g._radius = r;
  }

  function resetPosition(g) {
    g.x = Math.random() * window.innerWidth;
    g.y = Math.random() * window.innerHeight;
    const speed = 0.05 + Math.random() * 0.05;
    const angle = Math.random() * Math.PI * 2;
    g._dx = Math.cos(angle) * speed;
    g._dy = Math.sin(angle) * speed;
  }

  function updatePixiColors() {
    if (!pixiApp) return;
    const color = body.classList.contains('light-theme') ? 0x6496ff : 0xffffff;
    piShapes.forEach((g) => drawBlob(g, color));
  }

  // Initialize Pixi background
  initPixiBackground();

  // Initial setup
  (function init() {
    // Apply saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      body.classList.remove('dark-theme');
      body.classList.add('light-theme');
      updateThemeUI(true);
    } else {
      updateThemeUI(false);
    }

    // Apply saved language
    langToggle.textContent = currentLang.toUpperCase();
    updateLanguage();

    // Clean up old preference
    localStorage.removeItem('effects');
  })();
}); 