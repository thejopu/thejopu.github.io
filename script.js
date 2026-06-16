(function () {
  'use strict';

  const SERVER_IP = 'play.eggtopiamc.com';
  const API_URL = 'https://api.mcsrvstat.us/2/' + SERVER_IP;

  const header = document.getElementById('header');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const toast = document.getElementById('toast');
  const yearEl = document.getElementById('year');
  const particlesContainer = document.getElementById('heroParticles');

  const heroStatusDot = document.getElementById('heroStatusDot');
  const heroStatusText = document.getElementById('heroStatusText');
  const serverStatus = document.getElementById('serverStatus');
  const playerCount = document.getElementById('playerCount');
  const statusSignal = document.getElementById('statusSignal');
  const statusBeacon = document.getElementById('statusBeacon');

  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* ---- Scroll: header ---- */
  function handleScroll() {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  /* ---- Mobile Navigation ---- */
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.classList.toggle('active', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---- Toast ---- */
  let toastTimeout;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(function () {
      toast.classList.remove('show');
    }, 2500);
  }

  /* ---- Copy to Clipboard ---- */
  async function copyToClipboard(text, button) {
    try {
      await navigator.clipboard.writeText(text);
      showToast('Server IP copied to clipboard!');
      if (button) {
        button.classList.add('copied');
        const label = button.querySelector('span');
        if (label) label.textContent = 'Copied!';
        setTimeout(function () {
          button.classList.remove('copied');
          if (label) label.textContent = 'Copy';
        }, 2000);
      }
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        showToast('Server IP copied to clipboard!');
      } catch {
        showToast('Could not copy — please copy manually');
      }
      document.body.removeChild(textarea);
    }
  }

  document.querySelectorAll('.btn-copy').forEach(function (btn) {
    btn.addEventListener('click', function () {
      copyToClipboard(btn.dataset.ip || SERVER_IP, btn);
    });
  });

  /* ---- Server Status API ---- */
  function setStatusUI(mode) {
    if (statusSignal) {
      statusSignal.className = 'status-console-signal is-' + mode;
    }
    if (statusBeacon) {
      statusBeacon.classList.remove('is-online', 'is-offline', 'is-checking');
      statusBeacon.classList.add('is-' + mode);
    }
  }

  function setServerOnline(online, playersOnline, maxPlayers) {
    if (online) {
      heroStatusDot.className = 'status-dot online';
      heroStatusText.textContent = 'Server Online';
      serverStatus.textContent = 'Online';
      serverStatus.className = 'status-console-state';
      setStatusUI('online');

      if (typeof playersOnline === 'number' && typeof maxPlayers === 'number') {
        playerCount.textContent = playersOnline + ' / ' + maxPlayers;
      } else if (typeof playersOnline === 'number') {
        playerCount.textContent = String(playersOnline);
      } else {
        playerCount.textContent = '—';
      }
    } else {
      heroStatusDot.className = 'status-dot offline';
      heroStatusText.textContent = 'Server Offline';
      serverStatus.textContent = 'Offline';
      serverStatus.className = 'status-console-state is-offline';
      setStatusUI('offline');
      playerCount.textContent = '—';
    }
  }

  function setServerLoading() {
    heroStatusDot.className = 'status-dot';
    heroStatusText.textContent = 'Checking server…';
    serverStatus.textContent = 'Checking…';
    serverStatus.className = 'status-console-state';
    setStatusUI('checking');
    playerCount.textContent = '—';
  }

  async function fetchServerStatus() {
    setServerLoading();

    try {
      const response = await fetch(API_URL, {
        headers: { Accept: 'application/json' }
      });

      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();

      if (data.online) {
        setServerOnline(true, data.players?.online, data.players?.max);
      } else {
        setServerOnline(false);
      }
    } catch {
      heroStatusDot.className = 'status-dot offline';
      heroStatusText.textContent = 'Status unavailable';
      serverStatus.textContent = 'Unavailable';
      serverStatus.className = 'status-console-state is-offline';
      setStatusUI('offline');
      playerCount.textContent = '—';
    }
  }

  fetchServerStatus();
  setInterval(fetchServerStatus, 60000);

  /* ---- Scroll Reveal ---- */
  const revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
    );

    revealElements.forEach(function (el, index) {
      el.style.transitionDelay = (index % 4) * 0.07 + 's';
      revealObserver.observe(el);
    });
  } else {
    revealElements.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  window.addEventListener('load', function () {
    document.querySelectorAll('.hero .reveal').forEach(function (el, i) {
      setTimeout(function () {
        el.classList.add('visible');
      }, 200 + i * 100);
    });
  });

  /* ---- Hero particles: subtle pollen & glow ---- */
  if (particlesContainer && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var types = ['pollen', 'dust', 'glow'];
    var count = window.innerWidth < 768 ? 18 : 32;

    for (var i = 0; i < count; i++) {
      var type = types[Math.floor(Math.random() * types.length)];
      var el = document.createElement('span');
      el.className = 'particle particle--' + type;
      el.style.left = Math.random() * 100 + '%';
      el.style.bottom = Math.random() * 40 + '%';
      el.style.setProperty('--drift', (Math.random() * 40 - 20) + 'px');

      var size = type === 'glow' ? 4 + Math.random() * 6 : 2 + Math.random() * 3;
      el.style.width = size + 'px';
      el.style.height = size + 'px';

      el.style.animationDuration = 8 + Math.random() * 12 + 's';
      el.style.animationDelay = Math.random() * 10 + 's';
      particlesContainer.appendChild(el);
    }
  }
})();
