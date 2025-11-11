$(function () {
  'use strict';

  window.onpageshow = function(event) {
    if (event.persisted) {
      window.location.reload();
    }
  };

  const body = document.body;
  const toggleButton = document.querySelector('.bts button');
  const lightIcon = toggleButton.querySelector('.lightToggle');
  const darkIcon = toggleButton.querySelector('.darkToggle');

  function forceThemeMeta(isDark) {
    const light = document.getElementById('theme-color-light');
    const dark  = document.getElementById('theme-color-dark');
    if (!light || !dark) return;
    dark.media  = isDark ? 'all'    : 'not all';
    light.media = isDark ? 'not all': 'all';
  }
    
  const updateToggleButton = (currentTheme) => {
    let labelText = '';

    if (currentTheme === 'dark') {
      body.classList.add('dark');
      lightIcon.style.display = 'none';
      darkIcon.style.display = 'inline';
      labelText = 'Switch to light mode (currently dark mode)';
      setShaderDoInvert(0); // dark → invert
    } else {
      body.classList.remove('dark');
      lightIcon.style.display = 'inline';
      darkIcon.style.display = 'none';
      labelText = 'Switch to dark mode (currently light mode)';
      setShaderDoInvert(1); // light → normal
    }

  forceThemeMeta(currentTheme === 'dark');
    toggleButton.title = labelText;
    toggleButton.setAttribute('aria-label', labelText);
  };

  // Initial setup — check localStorage first, else use system preference
  const storedTheme = localStorage.getItem('theme');
  if (storedTheme === 'dark' || storedTheme === 'light') {
    updateToggleButton(storedTheme);
  } else {
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    updateToggleButton(systemPrefersDark ? 'dark' : 'light');
  }

  // User click → toggle between light and dark
  toggleButton.addEventListener('click', () => {
    const isDark = body.classList.contains('dark');

    if (isDark) {
      body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      updateToggleButton('light');
    } else {
      body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      updateToggleButton('dark');
    }
  });

  // Optional: Listen to system preference change IF no user preference set
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    const userSetTheme = localStorage.getItem('theme');
    if (userSetTheme !== 'dark' && userSetTheme !== 'light') {
      updateToggleButton(e.matches ? 'dark' : 'light');
    }
  });

});
