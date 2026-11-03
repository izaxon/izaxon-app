(() => {
  'use strict';

  const root = document.documentElement;
  const themeButton = document.querySelector('#theme-button');
  const installButton = document.querySelector('#install-button');
  const installDialog = document.querySelector('#install-dialog');
  const installInstructions = document.querySelector('#install-instructions');
  const status = document.querySelector('#app-status');
  const updateNotice = document.querySelector('#update-notice');
  const updateButton = document.querySelector('#update-button');
  const darkPreference = window.matchMedia('(prefers-color-scheme: dark)');
  const standalonePreference = window.matchMedia('(display-mode: standalone)');
  let savedTheme;
  let installPrompt;
  let registration;
  let refreshing = false;
  let requestedUpdate = false;

  try {
    const value = localStorage.getItem('izaxon-theme');
    if (value === 'light' || value === 'dark') savedTheme = value;
  } catch { /* Theme switching still works when storage is unavailable. */ }

  function renderTheme() {
    const theme = savedTheme || (darkPreference.matches ? 'dark' : 'light');
    root.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#000000' : '#FFFFFF';
    const label = theme === 'dark' ? 'Byt till ljust tema' : 'Byt till mörkt tema';
    themeButton.setAttribute('aria-label', label);
    themeButton.title = label;
    themeButton.hidden = false;
  }

  themeButton.addEventListener('click', () => {
    savedTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('izaxon-theme', savedTheme); } catch { /* Optional preference. */ }
    renderTheme();
  });
  darkPreference.addEventListener('change', renderTheme);
  renderTheme();

  function isStandalone() {
    return standalonePreference.matches || navigator.standalone === true;
  }

  function renderInstallButton() {
    installButton.hidden = isStandalone();
  }

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    installPrompt = event;
    renderInstallButton();
  });

  window.addEventListener('appinstalled', () => {
    installPrompt = undefined;
    installButton.hidden = true;
    if (installDialog.open) installDialog.close();
    status.textContent = 'izaxon är installerad.';
  });

  standalonePreference.addEventListener('change', renderInstallButton);
  renderInstallButton();

  installButton.addEventListener('click', async () => {
    if (installPrompt) {
      const prompt = installPrompt;
      installPrompt = undefined;
      try {
        await prompt.prompt();
        const choice = await prompt.userChoice;
        if (choice.outcome === 'accepted') installButton.hidden = true;
        return;
      } catch { /* Offer browser instructions if the native prompt expired. */ }
    }

    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (isIOS) {
      installInstructions.textContent = 'Öppna sidan i Safari. Tryck på Dela och välj Lägg till på hemskärmen. Öppna sedan izaxon med den nya ikonen.';
    } else if (/Android/.test(ua)) {
      installInstructions.textContent = 'Öppna webbläsarens meny och välj Installera app eller Lägg till på startskärmen. I Samsung Internet kan valet finnas under Lägg till sida i. Öppna sedan izaxon med den nya ikonen.';
    } else {
      installInstructions.textContent = 'Öppna sidan i Chrome eller Edge och välj installationsikonen i adressfältet, eller Installera app i webbläsarens meny. Du kan också fortsätta använda dashboarden här.';
    }
    installDialog.showModal();
  });

  document.querySelector('#close-install').addEventListener('click', () => installDialog.close());
  installDialog.addEventListener('click', (event) => {
    const bounds = installDialog.getBoundingClientRect();
    if (event.target === installDialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) {
      installDialog.close();
    }
  });

  function renderConnection() {
    status.textContent = navigator.onLine ? '' : 'Du är offline. Dashboarden finns kvar här; projekten behöver internet.';
  }
  window.addEventListener('online', renderConnection);
  window.addEventListener('offline', renderConnection);
  renderConnection();

  function offerUpdate() {
    updateNotice.hidden = !(registration?.waiting && navigator.serviceWorker.controller);
  }

  updateButton.addEventListener('click', () => {
    if (!registration?.waiting) {
      updateNotice.hidden = true;
      return;
    }
    requestedUpdate = true;
    updateButton.disabled = true;
    updateButton.textContent = 'Uppdaterar…';
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  });

  if ('serviceWorker' in navigator && window.isSecureContext) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (requestedUpdate && !refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });

    navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' }).then((result) => {
      registration = result;
      offerUpdate();
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        worker?.addEventListener('statechange', () => {
          if (worker.state === 'installed') offerUpdate();
        });
      });
    }).catch((error) => {
      console.warn('Offline support could not be enabled.', error);
    });
  }
})();
