!function() {
  'use strict';
  
  var canvas = document.querySelector('#webgl');

  // Scroll variables
  var scroll = 0.0, velocity = 0.0, lastScroll = 0.0;

  // Initialize REGL from a canvas element
  var regl = createREGL({
    canvas: canvas,
    onDone: function(error, regl) {
      if (error) { alert(error); }
    }
  });

  // Loading a texture
  var img = new Image();
  img.src = imageurl;
  img.onload = function() {

    function defaultUniforms() {
      return {
        // Plugin staging defaults (light)
        uStart0: 0.0,
        uStart2: 1.0,
        uStartX: 0.0,
        uStartY: 0.1,
        uMultiX: -0.4,
        uMultiY: 0.45,

        // New model uniforms
        uDarkness: 0.0,
        uRawT: 0.0,
        uDir: 1.0,
        uPushPull: 0.0,

        uEdge: 0.10,
        uCurveAmp: 0.18,
        uCurvePower: 1.15,
        uCurvePhase: 0.0,
        uCurveBias: -0.08,
        uSkew: 0.26,

        uMaskContrast: 1.6,
        uGradientPow: 1.45,

        uShadowStrength: 0.22,
        uRimStrength: 0.35,
        uRimWidth: 0.028,
        uTintStrength: 0.12,

        uBgBlend: 0.25,
        uBgLight: [1, 1, 1],
        uBgDark: [0.149, 0.149, 0.176],
        uThemeMix: 0.0
      };
    }

    var transitionUniforms = defaultUniforms();

    // Create a REGL draw command
    var draw = regl({
      frag: (function () {
        var el = document.querySelector('#fragmentShader');
        if (el && el.textContent && el.textContent.trim().length) return el.textContent;
      })(),
      vert: 'attribute vec2 position; void main() { gl_Position = vec4(3.0 * position, 0.0, 1.0); }',
      attributes: { position: [-1, 0, 0, -1, 1, 1] },
      count: 3,
      uniforms: {
        globaltime: regl.prop('globaltime'),
        resolution: regl.prop('resolution'),
        aspect: regl.prop('aspect'),
        scroll: regl.prop('scroll'),
        velocity: regl.prop('velocity'),
        texture: regl.texture(img),

        // Plugin staging
        uStart0: regl.prop('uStart0'),
        uStart2: regl.prop('uStart2'),
        uStartX: regl.prop('uStartX'),
        uStartY: regl.prop('uStartY'),
        uMultiX: regl.prop('uMultiX'),
        uMultiY: regl.prop('uMultiY'),

        // New model
        uDarkness: regl.prop('uDarkness'),
        uRawT: regl.prop('uRawT'),
        uDir: regl.prop('uDir'),
        uPushPull: regl.prop('uPushPull'),

        uEdge: regl.prop('uEdge'),
        uCurveAmp: regl.prop('uCurveAmp'),
        uCurvePower: regl.prop('uCurvePower'),
        uCurvePhase: regl.prop('uCurvePhase'),
        uCurveBias: regl.prop('uCurveBias'),
        uSkew: regl.prop('uSkew'),

        uMaskContrast: regl.prop('uMaskContrast'),
        uGradientPow: regl.prop('uGradientPow'),

        uShadowStrength: regl.prop('uShadowStrength'),
        uRimStrength: regl.prop('uRimStrength'),
        uRimWidth: regl.prop('uRimWidth'),
        uTintStrength: regl.prop('uTintStrength'),

        uBgBlend: regl.prop('uBgBlend'),
        uBgLight: regl.prop('uBgLight'),
        uBgDark: regl.prop('uBgDark'),
        uThemeMix: regl.prop('uThemeMix'),
      }
    });

    // Hook a callback to execute each frame
    regl.frame(function(ctx) {

      // Resize a canvas element with the aspect ratio (100vw, 100vh)
      var aspect = canvas.scrollWidth / canvas.scrollHeight;
      canvas.width = canvas.scrollWidth;
      canvas.height = canvas.scrollHeight;

      // Update scroll and velocity
      scroll = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      velocity = scroll - lastScroll;
      lastScroll = scroll;

      // Pull uniforms from the driver (if present)
      if (window.bgTransitionDriver && typeof window.bgTransitionDriver.getUniforms === 'function') {
        var u = window.bgTransitionDriver.getUniforms();
        // Merge into our known set.
        // Safe-merge: do not clobber defaults with undefined/null.
        for (var k in u) {
          if (!Object.prototype.hasOwnProperty.call(u, k)) continue;
          if (u[k] === undefined || u[k] === null) continue;
          transitionUniforms[k] = u[k];
        }
      }

      draw({
        globaltime: ctx.time,
        resolution: [canvas.width, canvas.height],
        aspect: aspect,
        scroll: scroll,
        velocity: velocity,
        // Merge transition uniforms into props
        uStart0: transitionUniforms.uStart0,
        uStart2: transitionUniforms.uStart2,
        uStartX: transitionUniforms.uStartX,
        uStartY: transitionUniforms.uStartY,
        uMultiX: transitionUniforms.uMultiX,
        uMultiY: transitionUniforms.uMultiY,

        uDarkness: transitionUniforms.uDarkness,
        uRawT: transitionUniforms.uRawT,
        uDir: transitionUniforms.uDir,
        uPushPull: transitionUniforms.uPushPull,

        uEdge: transitionUniforms.uEdge,
        uCurveAmp: transitionUniforms.uCurveAmp,
        uCurvePower: transitionUniforms.uCurvePower,
        uCurvePhase: transitionUniforms.uCurvePhase,
        uCurveBias: transitionUniforms.uCurveBias,
        uSkew: transitionUniforms.uSkew,

        uMaskContrast: transitionUniforms.uMaskContrast,
        uGradientPow: transitionUniforms.uGradientPow,

        uShadowStrength: transitionUniforms.uShadowStrength,
        uRimStrength: transitionUniforms.uRimStrength,
        uRimWidth: transitionUniforms.uRimWidth,
        uTintStrength: transitionUniforms.uTintStrength,

        uBgBlend: transitionUniforms.uBgBlend,
        uBgLight: transitionUniforms.uBgLight,
        uBgDark: transitionUniforms.uBgDark,
        uThemeMix: transitionUniforms.uThemeMix
      });
    });
  };
}();
