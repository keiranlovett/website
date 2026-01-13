
(function () {
  'use strict';

  function clamp01(x) { return Math.max(0, Math.min(1, x)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeInOut(x) {
    return (x < 0.5) ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
  }
  function nowMs() {
    return (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
  }

  function defaultConfig() {
    return {
      durationMs: 900,
      smoothing: 0.045,
      invert: false,
      mapping: {
        uStartX: [0.00, 0.18],
        uMultiX: [-0.40, -0.55],
        uStartY: [0.10, 0.18],
        uMultiY: [0.45, 0.60]
      }
    };
  }

  function computeUniformsFromSemantic(semanticProgress, cfg) {
    var pSemantic = clamp01(semanticProgress);
    if (cfg.invert) pSemantic = 1 - pSemantic;
    var p = 1 - pSemantic;

    var start0 = easeInOut(Math.min(1, p / 0.30));
    var start2 = 1 - easeInOut(Math.min(1, Math.max(0, p - 0.30) / 0.50));
    var eFull = easeInOut(p);

    var m = cfg.mapping;
    var uStartX = lerp(m.uStartX[0], m.uStartX[1], eFull);
    var uMultiX = lerp(m.uMultiX[0], m.uMultiX[1], eFull);
    var uStartY = lerp(m.uStartY[0], m.uStartY[1], eFull);
    var uMultiY = lerp(m.uMultiY[0], m.uMultiY[1], eFull);

    return {
      uStart0: start0,
      uStart2: start2,
      uStartX: uStartX,
      uStartY: uStartY,
      uMultiX: uMultiX,
      uMultiY: uMultiY,
      uThemeMix: clamp01(semanticProgress),
      uSemantic: clamp01(semanticProgress),
      uInvert: cfg.invert ? 1.0 : 0.0
    };
  }

  function BgTransitionDriver(opts) {
    opts = opts || {};
    this.cfg = defaultConfig();
    this.configure(opts);

    this.progress = clamp01(typeof opts.initialProgress === 'number' ? opts.initialProgress : 0); // semantic
    this.target = this.progress;

    this._lastMs = nowMs();
    this._animating = false;
  }

  BgTransitionDriver.prototype.configure = function (cfg) {
    if (!cfg) return;
    for (var k in cfg) {
      if (!Object.prototype.hasOwnProperty.call(cfg, k)) continue;
      if (k === 'mapping' && cfg.mapping) {
        this.cfg.mapping = Object.assign({}, this.cfg.mapping, cfg.mapping);
      } else {
        this.cfg[k] = cfg[k];
      }
    }
  };

  BgTransitionDriver.prototype.setInvert = function (v) {
    this.cfg.invert = !!v;
  };

  BgTransitionDriver.prototype.setDirection = function (dir) {
    // "down" == normal plugin (invert=false), "up" == invert=true
    if (dir === 'down') this.setInvert(false);
    if (dir === 'up') this.setInvert(true);
  };

  BgTransitionDriver.prototype.setProgress = function (semanticProgress) {
    this.progress = clamp01(semanticProgress);
    this.target = this.progress;
    this._animating = false;
  };

  BgTransitionDriver.prototype.transitionTo = function (semanticProgress, opts) {
    opts = opts || {};
    if (typeof opts.durationMs === 'number') this.cfg.durationMs = opts.durationMs;
    if (typeof opts.smoothing === 'number') this.cfg.smoothing = opts.smoothing;
    if (typeof opts.invert !== 'undefined') this.cfg.invert = !!opts.invert;

    this.target = clamp01(semanticProgress);
    this._animating = true;
    this._lastMs = nowMs();
  };

  BgTransitionDriver.prototype.toggle = function (opts) {
    this.transitionTo(this.target < 0.5 ? 1 : 0, opts);
  };

  BgTransitionDriver.prototype._step = function () {
    // Smoothing-only mode when not animating: still apply weight if desired.
    var ms = nowMs();
    var dt = Math.max(0, ms - this._lastMs);
    this._lastMs = ms;

    var dur = Math.max(1, this.cfg.durationMs);
    var speed = dt / dur;

    if (this._animating) {
      if (this.progress < this.target) this.progress = clamp01(this.progress + speed);
      else if (this.progress > this.target) this.progress = clamp01(this.progress - speed);

      if (Math.abs(this.progress - this.target) < 1e-5) {
        this.progress = this.target;
        this._animating = false;
      }
    }

    // Apply smoothing toward current progress (gives the "weighty" curtain feel).
    var s = Math.max(0, Math.min(1, this.cfg.smoothing));
    if (s > 0) {
      this._smoothed = (this._smoothed == null) ? this.progress : lerp(this._smoothed, this.progress, s);
    } else {
      this._smoothed = this.progress;
    }
  };

  BgTransitionDriver.prototype.getState = function () {
    this._step();
    return {
      semantic: this.progress,
      smoothed: this._smoothed,
      target: this.target,
      animating: this._animating,
      invert: !!this.cfg.invert
    };
  };

  BgTransitionDriver.prototype.getUniforms = function () {
    this._step();
    return computeUniformsFromSemantic(this._smoothed != null ? this._smoothed : this.progress, this.cfg);
  };

  window.BgTransitionDriver = BgTransitionDriver;
  if (!window.bgTransitionDriver) window.bgTransitionDriver = new BgTransitionDriver();
})();
