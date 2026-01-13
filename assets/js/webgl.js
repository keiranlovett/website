!function() {
	'use strict';

	var canvas = document.querySelector('#webgl');

	// Scroll variables
	var scroll = 0.0, velocity = 0.0, lastScroll = 0.0;

	// Current invert value (0 = normal, 1 = inverted)
	var currentInvertValue = 0;

	// Transition uniforms (non-uniform mask) sourced from bgTransitionDriver if present.
	// Defaults represent "light" (no dark mask).
	var transitionUniforms = {
		uStart0: 0.0,
		uStart2: 1.0,
		uStartX: 0.0,
		uStartY: 0.1,
		uMultiX: -0.4,
		uMultiY: 0.45,
		uThemeMix: 0.0
	};

	// Expose setter globally (so toggle button can call it)
	window.setShaderDoInvert = function(value) {
		currentInvertValue = value;
	};

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

		// Create a REGL draw command
		var draw = regl({
			frag: document.querySelector('#fragmentShader').textContent,
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
				doInvertImage: regl.prop('doInvertImage'),

				// Bg transition (non-uniform mask) uniforms
				uStart0: regl.prop('uStart0'),
				uStart2: regl.prop('uStart2'),
				uStartX: regl.prop('uStartX'),
				uStartY: regl.prop('uStartY'),
				uMultiX: regl.prop('uMultiX'),
				uMultiY: regl.prop('uMultiY'),
				uThemeMix: regl.prop('uThemeMix')
			}
		});

		// Hook a callback to execute each frame
		regl.frame(function(ctx) {

			// Resize a canvas element with the aspect ratio (100vw, 100vh)
			var aspect = canvas.scrollWidth / canvas.scrollHeight;
			canvas.width = 1024 * aspect;
			canvas.height = 1024;

			// Scroll amount (0.0 to 1.0)
			scroll = window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight);
			
			// Scroll Velocity
			// Inertia example:
			velocity = velocity * 0.99 + (scroll - lastScroll);
			//velocity = 0;
			lastScroll = scroll;

			// Clear the draw buffer
			regl.clear({ color: [0, 0, 0, 0] });

			// Pull latest transition uniforms (if the driver is present)
			// This allows dark-mode-toggle (and any other controller) to animate
			// the same non-uniform mask over the existing WebGL background.
			if (window.bgTransitionDriver && typeof window.bgTransitionDriver.getUniforms === 'function') {
				transitionUniforms = window.bgTransitionDriver.getUniforms();
			}

			// Execute a REGL draw command
			draw({
				globaltime: ctx.time,
				resolution: [ctx.viewportWidth, ctx.viewportHeight],
				aspect: aspect,
				scroll: scroll,
				velocity: velocity,
				doInvertImage: currentInvertValue, // Pass current value

				uStart0: transitionUniforms.uStart0,
				uStart2: transitionUniforms.uStart2,
				uStartX: transitionUniforms.uStartX,
				uStartY: transitionUniforms.uStartY,
				uMultiX: transitionUniforms.uMultiX,
				uMultiY: transitionUniforms.uMultiY,
				uThemeMix: transitionUniforms.uThemeMix
			});
		});
	};

}();
