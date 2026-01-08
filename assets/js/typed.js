!function($) {

  "use strict";

  // ——————————————————————————————————————————————————
  // TextScramble
  // ——————————————————————————————————————————————————
  class TextScramble {
    constructor(el, opts = {}) {
      this.el = el;
      this.chars = opts.chars || '!<>-_\\/[]{}—=+*^?#________';
      this.update = this.update.bind(this);

      // Output routing (supports input/attr/plain elements)
      this.isInput = !!opts.isInput;
      this.attr = opts.attr || null;
      this.useSpans = opts.useSpans !== false; // spans only make sense for non-input, non-attr, html-capable outputs

      // NEW: tunable timing/intensity
      this.startMax = Number.isFinite(opts.startMax) ? opts.startMax : 40;     // scramble start window
      this.endMax = Number.isFinite(opts.endMax) ? opts.endMax : 40;          // scramble end window
      this.dudChance = Number.isFinite(opts.dudChance) ? opts.dudChance : 0.28; // dud re-roll probability per frame
    }

    _getText() {
      if (this.attr) return this.el.getAttribute(this.attr) || '';
      if (this.isInput) return this.el.value || '';
      return this.el.innerText || '';
    }

    _setOutput(htmlOrText) {
      if (this.attr) {
        // attributes cannot carry spans safely; set plain text
        this.el.setAttribute(this.attr, this._stripTags(htmlOrText));
        return;
      }
      if (this.isInput) {
        this.el.value = this._stripTags(htmlOrText);
        return;
      }

      // normal element
      if (this.useSpans) {
        this.el.innerHTML = htmlOrText;
      } else {
        this.el.innerText = this._stripTags(htmlOrText);
      }
    }

    _stripTags(s) {
      // fast-ish stripping for our generated outputs
      return String(s).replace(/<[^>]*>/g, '');
    }

    setText(newText) {
      const oldText = this._getText();
      const toText = String(newText);

      const length = Math.max(oldText.length, toText.length);
      const promise = new Promise((resolve) => (this.resolve = resolve));
      this.queue = [];

      for (let i = 0; i < length; i++) {
        const from = oldText[i] || '';
        const to = toText[i] || '';
        const start = Math.floor(Math.random() * this.startMax);
        const end = start + Math.floor(Math.random() * this.endMax);
        this.queue.push({ from, to, start, end });
      }

      cancelAnimationFrame(this.frameRequest);
      this.frame = 0;
      this.update();
      return promise;
    }

    update() {
      let output = '';
      let complete = 0;

      for (let i = 0, n = this.queue.length; i < n; i++) {
        let { from, to, start, end, char } = this.queue[i];

        if (this.frame >= end) {
          complete++;
          output += to;
        } else if (this.frame >= start) {
          if (!char || Math.random() < this.dudChance) {
            char = this.randomChar();
            this.queue[i].char = char;
          }

          // If we can't (or shouldn't) emit spans, emit raw dud characters.
          output += this.useSpans ? `<span class="typed-dud">${char}</span>` : char;
        } else {
          output += from;
        }
      }

      this._setOutput(output);

      if (complete === this.queue.length) {
        this.resolve();
      } else {
        this.frameRequest = requestAnimationFrame(this.update);
        this.frame++;
      }
    }

    randomChar() {
      return this.chars[Math.floor(Math.random() * this.chars.length)];
    }

    cancel() {
      cancelAnimationFrame(this.frameRequest);
    }
  }

  // ——————————————————————————————————————————————————
  // Typed (framework preserved)
  // ——————————————————————————————————————————————————

  var Typed = function(el, options) {

    this.el = $(el);
    this.options = $.extend({}, $.fn.typed.defaults, options);

    this.isInput = this.el.is('input');
    this.attr = this.options.attr;

    this.showCursor = this.isInput ? false : this.options.showCursor;

    this.contentType = this.options.contentType;

    this.startDelay = this.options.startDelay;
    this.backDelay = this.options.backDelay;

    this.stringsElement = this.options.stringsElement;
    this.strings = this.options.strings;

    this.arrayPos = 0;

    this.loop = this.options.loop;
    this.loopCount = this.options.loopCount;
    this.curLoop = 0;

    this.stop = false;

    this.cursorChar = this.options.cursorChar;

    this.shuffle = this.options.shuffle;
    this.sequence = [];

    this._original = this.attr ? this.el.attr(this.attr) : (this.isInput ? this.el.val() : this.el.html());

    this.build();
  };

  Typed.prototype = {

    constructor: Typed,

    init: function() {
      var self = this;

      // No strings => no-op (no fallback)
      if (!self.strings || self.strings.length === 0) return;

      self.timeout = setTimeout(function() {

        for (var i = 0; i < self.strings.length; ++i) self.sequence[i] = i;
        if (self.shuffle) self.sequence = self.shuffleArray(self.sequence);

        // Configure whether we can safely use spans (HTML) for the scramble effect
        var useSpans = !(self.isInput || !!self.attr) && (self.contentType === 'html');

        self.fx = new TextScramble(self.el.get(0), {
          isInput: self.isInput,
          attr: self.attr,
          useSpans: useSpans,

          // pass-through options
          chars: self.options.chars,
          startMax: self.options.startMax,
          endMax: self.options.endMax,
          dudChance: self.options.dudChance
        });

        // Start cycling
        self._next();

      }, self.startDelay);
    },

    build: function() {
      var self = this;

      // Insert cursor
      if (this.showCursor === true) {
        this.cursor = $("<span class=\"typed-cursor\">" + this.cursorChar + "</span>");
        this.el.after(this.cursor);
      }

      // Load strings from stringsElement <p>
      if (this.stringsElement) {
        self.strings = [];
        this.stringsElement.hide();

        var ps = this.stringsElement.find('p');

        $.each(ps, function(_, p) {
          // Scramble operates over text, not markup.
          var raw = (self.contentType === 'html') ? $(p).html() : $(p).text();
          var text = $('<div/>').html(raw).text().trim(); // strip tags + trim
          if (text) self.strings.push(text);
        });
      }

      this.init();
    },

    _next: function() {
      var self = this;
      if (self.stop === true) return;

      var idx = self.sequence[self.arrayPos];
      var phrase = self.strings[idx];

      // pre-string callback (matches old behavior)
      self.options.preStringTyped(self.arrayPos);

      self.fx.setText(phrase).then(function() {
        if (self.stop === true) return;

        self.options.onStringTyped(self.arrayPos);

        var isLast = (self.arrayPos === self.strings.length - 1);
        if (isLast) {
          self.options.callback();
          self.curLoop++;

          // stop if not looping or loop count reached
          if (self.loop === false) return;
          if (self.loopCount !== false && self.curLoop >= self.loopCount) return;
        }

        self.timeout = setTimeout(function() {
          // advance
          self.arrayPos++;

          if (self.arrayPos >= self.strings.length) {
            self.arrayPos = 0;
            if (self.shuffle) self.sequence = self.shuffleArray(self.sequence);
          }

          self._next();
        }, self.backDelay);
      });
    },

    shuffleArray: function(array) {
      var tmp, current, top = array.length;
      if (top) while (--top) {
        current = Math.floor(Math.random() * (top + 1));
        tmp = array[current];
        array[current] = array[top];
        array[top] = tmp;
      }
      return array;
    },

    reset: function() {
      var self = this;
      self.stop = true;
      clearTimeout(self.timeout);

      if (self.fx) self.fx.cancel();

      // restore original
      if (self.attr) {
        self.el.attr(self.attr, self._original || '');
      } else if (self.isInput) {
        self.el.val(self._original || '');
      } else {
        // original captured as html
        self.el.html(self._original || '');
      }

      if (typeof self.cursor !== 'undefined') {
        self.cursor.remove();
      }

      self.options.resetCallback();
    }

  };

  $.fn.typed = function(option) {
    return this.each(function() {
      var $this = $(this),
        data = $this.data('typed'),
        options = typeof option == 'object' && option;

      if (!data) $this.data('typed', (data = new Typed(this, options)));
      if (typeof option == 'string') data[option]();
    });
  };

  $.fn.typed.defaults = {
    strings: [],
    stringsElement: null,

    // Scramble character set (override per instance via { chars: "..." })
    chars: '!<>-_\\/[]{}—=+*^?#________',

    startMax: 40,
    endMax: 40,
    dudChance: 0.28,

    startDelay: 0,
    shuffle: false,
    backDelay: 1800,

    loop: false,
    loopCount: false,

    showCursor: true,
    cursorChar: "|",

    attr: null,
    contentType: 'html',

    callback: function() {},
    preStringTyped: function() {},
    onStringTyped: function() {},
    resetCallback: function() {}
  };

}(window.jQuery);