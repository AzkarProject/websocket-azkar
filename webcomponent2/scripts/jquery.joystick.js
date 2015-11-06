'use strict';

(function(name, factory) {

	// Establish the root object, `window` (`self`) in the browser, or `global` on the server.
	// We use `self` instead of `window` for `WebWorker` support.
	var root = (typeof self == 'object' && self.self == self && self) ||
		(typeof global == 'object' && global.global == global && global);

	// Start with AMD.
	if (typeof define === 'function' && define.amd) {
		define(['jquery'], function($) {
			return (root[name] = factory(root, exports, $));
		});

	// Next for Node.js or CommonJS. jQuery may not be needed as a module.
	} else if (typeof exports !== 'undefined') {
		var $;
		try {
			$ = require('jquery');
		} catch (e) {}
		exports = factory(root, $);

	// Finally, as a browser global.
	} else {
		root[name] = factory(root, (root.jQuery || root.Zepto || root.ender || root.$));
	}

}('Joystick', function(root, $, undefined) {

	function quadratic(value) {
		return Math.pow(value, 2) * (value ? (value < 0 ? -1 : 1) : 0);
	}

	var pluginName = 'joystick',
		defaults = { radiusMax: 50 },
		$document = $(document);

	function Joystick($element, options) {
        this.$element = $element;
        this.settings = $.extend({}, defaults, options) ;
        this.init();
    }

    /**
     * Initializes the Joystick element by adding a mousedown event listener
     * @return {Joystick}
     */
    Joystick.prototype.init = function() {
    	this.$element
    		.off('mousedown.' + pluginName)
			.on('mousedown.' + pluginName, $.proxy(Joystick.prototype.onmousedown, this));
		return this;
    };

    Joystick.prototype.destroy = function() {
    	this.$element.off('mousedown.' + pluginName);
    	$document.off('mouseup.' + pluginName + ' mousemove.' + pluginName);
    };

    Joystick.prototype.move = function(x, y) {
    	var distance = Math.sqrt((x * x) + (y * y));
		if (distance > this.settings.radiusMax) {
			var normalizedX = x / distance;
			var normalizedY = y / distance;
			x = Math.round(normalizedX * this.settings.radiusMax);
			y = Math.round(normalizedY * this.settings.radiusMax);
		}
		this.$element.css('transform', 'translate(' + x + 'px,' + y + 'px)');
		this.trigger(x, y);
		return this;
    };

    Joystick.prototype.trigger = function(x, y) {
    	// Without jQuery because jQuery events do not bubble
		var e = new CustomEvent(pluginName + ':move', {
			bubbles: true,
			detail: {
				x: x,
				y: y,
				ratioX: Math.round(quadratic(x) / quadratic(this.settings.radiusMax) * 100) / 100,
				ratioY: Math.round(quadratic(y) / quadratic(this.settings.radiusMax) * 100) / 100
			}
		});
		this.$element[0].dispatchEvent(e);
    };

    Joystick.prototype.onmousedown = function(event) {
    	this.position = { x: event.clientX, y: event.clientY };
    	this.$element.css('transition', '0s');

    	$document.off('mousemove.' + pluginName + ' mouseup.' + pluginName)
				.on('mousemove.' + pluginName, $.proxy(Joystick.prototype.onmousemove, this))
				.on('mouseup.' + pluginName, $.proxy(Joystick.prototype.onmouseup, this));
    };

    Joystick.prototype.onmousemove = function(event) {
    	var x = event.clientX - this.position.x,
			y = event.clientY - this.position.y;
		this.move(x, y);
    };

    Joystick.prototype.onmouseup = function() {
    	$document.off('mousemove.' + pluginName + ' mouseup.' + pluginName);
    	this.$element.css('transition', '');
    	this.move(0, 0);
    };

     $.fn[pluginName] = function(options) {
        return this.each(function () {
        	var $this = $(this);
            if (!$.data($this, 'plugin_' + pluginName)) {
                $.data($this, 'plugin_' + pluginName,
                new Joystick($this, options));
            }
        });
    };

	return Joystick;
}));
