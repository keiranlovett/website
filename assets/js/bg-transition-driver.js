/*
  BgTransitionDriver
  ------------------
  A lightweight, framework-agnostic driver that reuses the non-uniform transition
  mapping from the background transition plugin, but outputs only shader uniforms.

  Integration points:
    - assets/js/webgl.js (regl): pull uniforms each frame via window.bgTransitionDriver.getUniforms().
    - assets/js/dark-mode-toggle.js: call transitionTo() / setProgress() to sync the effect with theme changes.

  Notes:
    - This file intentionally does NOT touch WebGL context or canvas ownership.
    - It preserves the same non-uniform staging used in the plugin (uStart0/uStart2 segments).
*/

(function () {
  'use strict';

  function clamp01(x) {
    return Math.max(0, Math.min(1, x));
  }

  // Approximate GSAP power2.inOut.
  function easeInOut(x) {
    return (x < 0.5)
      ? 2 * x * x
      : 1 - Math.pow(-2 * x + 2, 2) / 2;
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function nowMs() {
    return (typeof performance !== 'undefined' && performance.now)
      ? performance.now()
      : Date.now();
  }

  function defaultMapping() {
    return {
      // Normalized segment lengths (0..1 progress)
      start0Span: 0.3,     // uStart0 ramps during 0..0.3
      start2Start: 0.3,    // uStart2 ramps during 0.3..0.8
      start2Span: 0.5,

      // Uniform endpoints (copied from the plugin defaults)
      uStartX: [0.0, -0.1],
      uMultiX: [-0.4, 0.1],
      uStartY: [0.1, 0.95],
      uMultiY: [0.45, 0.3],
    };
  }

  /**
   * Compute the mask uniforms expected by the non-uniform transition shader.
   *
   * Semantic contract:
   *   - t=0 => light
   *   - t=1 => dark
   *   - invert flips the semantic direction (t=0 => dark, t=1 => light)
   */
  function computeUniforms(t, mapping, invert) {
    var pUser = clamp01(t);
    var pSemantic = invert ? (1 - pUser) : pUser;
    // Underlying shader timeline domain is reversed (theme used timeline.progress(1 - prog)).
    var p = 1 - pSemantic;

    var eFull = easeInOut(p);

    var u0t = clamp01(p / mapping.start0Span);
    var e0 = easeInOut(u0t);
    var uStart0 = lerp(0, 1, e0);

    var uStartX = lerp(mapping.uStartX[0], mapping.uStartX[1], eFull);
    var uMultiX = lerp(mapping.uMultiX[0], mapping.uMultiX[1], eFull);
    var uStartY = lerp(mapping.uStartY[0], mapping.uStartY[1], eFull);
    var uMultiY = lerp(mapping.uMultiY[0], mapping.uMultiY[1], eFull);

    var u2t = clamp01((p - mapping.start2Start) / mapping.start2Span);
    var e2 = easeInOut(u2t);
    var uStart2 = lerp(1, 0, e2);

    return {
      uStart0: uStart0,
      uStart2: uStart2,
      uStartX: uStartX,
      uStartY: uStartY,
      uMultiX: uMultiX,
      uMultiY: uMultiY,
      // For convenience if consumers want a simple scalar too
      uThemeMix: pSemantic,
    };
  }

  function BgTransitionDriver(opts) {
    opts = opts || {};

    this.invert = !!opts.invert;
    this.mapping = opts.mapping || defaultMapping();

    // Current semantic progress (0=light,1=dark)
    this.progress = clamp01(opts.initialProgress != null ? opts.initialProgress : 0);

    // Active tween state (if any)
    this._tween = null;
  }

  BgTransitionDriver.prototype.setInvert = function (v) {
    this.invert = !!v;
  };

  BgTransitionDriver.prototype.setProgress = function (p) {
    this._tween = null;
    this.progress = clamp01(p);
  };

  BgTransitionDriver.prototype.transitionTo = function (p, options) {
    options = options || {};
    var target = clamp01(p);
    var duration = Math.max(1, options.duration != null ? options.duration : 900);

    var start = this.progress;
    var startTime = nowMs();

    this._tween = {
      start: start,
      target: target,
      startTime: startTime,
      duration: duration,
      onUpdate: (typeof options.onUpdate === 'function') ? options.onUpdate : null,
      onComplete: (typeof options.onComplete === 'function') ? options.onComplete : null,
    };
  };

  BgTransitionDriver.prototype.toggle = function (options) {
    var target = (this.progress >= 0.5) ? 0 : 1;
    this.transitionTo(target, options);
  };

  BgTransitionDriver.prototype._updateTween = function () {
    if (!this._tween) return;

    var t = (nowMs() - this._tween.startTime) / this._tween.duration;
    if (t >= 1) {
      this.progress = this._tween.target;
      var done = this._tween;
      this._tween = null;
      if (done.onUpdate) done.onUpdate(this.progress);
      if (done.onComplete) done.onComplete(this.progress);
      return;
    }

    var e = easeInOut(clamp01(t));
    this.progress = lerp(this._tween.start, this._tween.target, e);
    if (this._tween.onUpdate) this._tween.onUpdate(this.progress);
  };

  BgTransitionDriver.prototype.getUniforms = function () {
    this._updateTween();
    return computeUniforms(this.progress, this.mapping, this.invert);
  };

  // Export globally
  window.BgTransitionDriver = BgTransitionDriver;

  // Optional: auto-create a singleton instance for convenience.
  // Consumers can also ignore this and instantiate their own.
  if (!window.bgTransitionDriver) {
    var initial = 0;
    try {
      var stored = window.localStorage && window.localStorage.getItem('theme');
      if (stored === 'dark') initial = 1;
      if (stored === 'light') initial = 0;
    } catch (e) {}

    window.bgTransitionDriver = new BgTransitionDriver({
      invert: false,
      initialProgress: initial,
    });
  }

})();
