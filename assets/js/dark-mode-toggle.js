$(function () {
  'use strict';

  window.onpageshow = function (event) {
    if (event.persisted) window.location.reload();
  };

  var body = document.body;
  var toggleButton = document.querySelector('.bts button');
  var lightIcon = toggleButton ? toggleButton.querySelector('.lightToggle') : null;
  var darkIcon  = toggleButton ? toggleButton.querySelector('.darkToggle') : null;

  window.BG_WAVE_SETTINGS = Object.assign({
    durationMs: 450,
    smoothing: 0.045,
    direction: 'down',     // 'down' or 'up' – your driver interprets this
    cssFlipAt: 0.45,    // threshold in VISUAL semantic domain (0 light..1 dark)
    cssInvert: true    // visual dark => css light (and vice versa)
  }, window.BG_WAVE_SETTINGS || {});

  function forceThemeMeta(isDarkCss) {
    var light = document.getElementById('theme-color-light');
    var dark  = document.getElementById('theme-color-dark');
    if (!light || !dark) return;
    dark.media  = isDarkCss ? 'all'     : 'not all';
    light.media = isDarkCss ? 'not all' : 'all';
  }

  function setCssDark(isDarkCss) {
    if (isDarkCss) body.classList.add('dark');
    else body.classList.remove('dark');

    if (lightIcon && darkIcon && toggleButton) {
      if (isDarkCss) {
        lightIcon.style.display = 'none';
        darkIcon.style.display = 'inline';
        toggleButton.title = 'Switch to light mode (currently dark mode)';
      } else {
        lightIcon.style.display = 'inline';
        darkIcon.style.display = 'none';
        toggleButton.title = 'Switch to dark mode (currently light mode)';
      }
      toggleButton.setAttribute('aria-label', toggleButton.title);
    }
    // theme-color meta should match CSS theme
    forceThemeMeta(isDarkCss);
  }

  function readInitialVisualIsDark() {
    var stored = localStorage.getItem('theme');
    if (stored === 'dark') return true;
    if (stored === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function visualToCssIsDark(visualIsDark) {
    return window.BG_WAVE_SETTINGS.cssInvert ? !visualIsDark : visualIsDark;
  }

  // Ensure driver exists + configure
  if (window.bgTransitionDriver && window.BgTransitionDriver) {
    window.bgTransitionDriver.configure({
      durationMs: window.BG_WAVE_SETTINGS.durationMs,
      smoothing: window.BG_WAVE_SETTINGS.smoothing
    });
  } else if (window.BgTransitionDriver) {
    window.bgTransitionDriver = new window.BgTransitionDriver({
      durationMs: window.BG_WAVE_SETTINGS.durationMs,
      smoothing: window.BG_WAVE_SETTINGS.smoothing
    });
  }

  // CSS sync loop: derive CSS from VISUAL progress, then invert if requested
  var raf = 0;

  function tickCssSync() {
    raf = 0;
    if (!window.bgTransitionDriver) return;

    var st = window.bgTransitionDriver.getState();
    var p = (st.smoothed != null) ? st.smoothed : st.semantic; // VISUAL 0..1

    var flipAt = window.BG_WAVE_SETTINGS.cssFlipAt;

    // VISUAL decision
    var visualShouldBeDark = (p >= flipAt);

    // CSS decision
    var cssShouldBeDark = window.BG_WAVE_SETTINGS.cssInvert ? !visualShouldBeDark : visualShouldBeDark;

    setCssDark(cssShouldBeDark);

    if (!st.animating) {
      // Final VISUAL settle
      var finalVisualIsDark = (st.target >= 0.5);

      // Persist VISUAL preference so refresh always matches WebGL
      localStorage.setItem('theme', finalVisualIsDark ? 'dark' : 'light');

      // Apply final CSS based on final VISUAL
      setCssDark(visualToCssIsDark(finalVisualIsDark));
      return;
    }

    raf = requestAnimationFrame(tickCssSync);
  }

  function startCssSync() {
    if (raf) return;
    raf = requestAnimationFrame(tickCssSync);
  }

  // Init
  var initialVisualIsDark = readInitialVisualIsDark();

  if (window.bgTransitionDriver) {
    window.bgTransitionDriver.setDirection(window.BG_WAVE_SETTINGS.direction);
    window.bgTransitionDriver.setProgress(initialVisualIsDark ? 1 : 0); // VISUAL
  }

  // CSS derives from VISUAL (this fixes hard-refresh desync)
  setCssDark(visualToCssIsDark(initialVisualIsDark));

  // Toggle click
  if (toggleButton) {
    toggleButton.addEventListener('click', function () {
      if (!window.bgTransitionDriver) {
        // No driver: toggle VISUAL preference directly
        var currentVisualIsDark = (localStorage.getItem('theme') === 'dark');
        var nextVisualIsDark = !currentVisualIsDark;
        localStorage.setItem('theme', nextVisualIsDark ? 'dark' : 'light');
        setCssDark(visualToCssIsDark(nextVisualIsDark));
        return;
      }

      var st = window.bgTransitionDriver.getState();
      var nextTarget = (st.target < 0.5) ? 1 : 0; // VISUAL target

      window.bgTransitionDriver.setDirection(window.BG_WAVE_SETTINGS.direction);
      window.bgTransitionDriver.transitionTo(nextTarget, {
        durationMs: window.BG_WAVE_SETTINGS.durationMs,
        smoothing: window.BG_WAVE_SETTINGS.smoothing
      });

      startCssSync();
    });
  }

  // System preference changes (only if user hasn't explicitly chosen)
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    var userSet = localStorage.getItem('theme');
    if (userSet === 'dark' || userSet === 'light') return;

    var visualIsDark = e.matches;

    if (window.bgTransitionDriver) {
      window.bgTransitionDriver.setDirection(window.BG_WAVE_SETTINGS.direction);
      window.bgTransitionDriver.transitionTo(visualIsDark ? 1 : 0, {
        durationMs: window.BG_WAVE_SETTINGS.durationMs,
        smoothing: window.BG_WAVE_SETTINGS.smoothing
      });
      startCssSync();
    } else {
      setCssDark(visualToCssIsDark(visualIsDark));
    }
  });
});