// The site is readable without JavaScript. Enhancement is limited to navigation
// and copying the public share text. Numerical publication is on review hold.
(() => {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('#primary-menu');
  if (menuButton && menu) {
    document.documentElement.classList.add('js');
    menuButton.hidden = false;
    const setMenuOpen = (open) => {
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.textContent = open ? 'Close menu' : 'Menu';
      menu.classList.toggle('is-open', open);
    };
    menuButton.addEventListener('click', () => {
      setMenuOpen(menuButton.getAttribute('aria-expanded') !== 'true');
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
        setMenuOpen(false);
        menuButton.focus();
      }
    });
  }

  const setStatus = (button, message) => {
    const panel = button.closest('[data-caption-card], [data-share-project]');
    const status = panel?.querySelector('[data-action-status]');
    if (status) status.textContent = message;
  };
  const copyText = async (text, button, success) => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      setStatus(button, success);
    } catch {
      setStatus(button, 'Copy is unavailable in this browser. Please select and copy the caption text.');
    }
  };
  document.querySelectorAll('[data-copy-caption]').forEach((button) => {
    const caption = button.closest('[data-caption-card]')?.querySelector('[data-caption-text]');
    if (!caption) return;
    button.hidden = false;
    button.addEventListener('click', () => copyText(caption.textContent.trim(), button, 'Caption copied.'));
  });
  document.querySelectorAll('[data-copy-link]').forEach((button) => {
    button.hidden = false;
    button.addEventListener('click', async () => {
      try {
        if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText('https://waitingroom.kingchillithepug.com/');
        setStatus(button, 'Website link copied.');
      } catch {
        setStatus(button, 'Copy this website link: https://waitingroom.kingchillithepug.com/');
      }
    });
  });
})();
