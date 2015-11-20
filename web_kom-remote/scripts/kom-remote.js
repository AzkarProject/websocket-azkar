require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
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
			$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],2:[function(require,module,exports){
(function (global){
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
		try { $ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null); } catch (e) {}
		exports = factory(root, $);

	// Finally, as a browser global.
	} else {
		root[name] = factory(root, (root.jQuery || root.Zepto || root.ender || root.$));
	}

}('Pad', function(root, $, undefined) {

	var pluginName = 'pad',
		defaults = {},
		$document = $(document);

	function Pad($element, options) {
        this.$element = $element;
        this.settings = $.extend( {}, defaults, options) ;
        this.init();
    }

    Pad.prototype.init = function() {
    	this.$element
    		.off('mousedown.' + pluginName, '.pad-arrow')
			.on('mousedown.' + pluginName, '.pad-arrow', $.proxy(Pad.prototype.onmousedown, this));
		return this;
    };

    Pad.prototype.destroy = function() {
    	this.$element.off('mousedown.' + pluginName, '.pad-arrow');
    	$document.off('mouseup.' + pluginName + ' mousemove.' + pluginName);
    };

    Pad.prototype.onmousedown = function(event) {
    	$document
    		.off('mouseup.' + pluginName)
			.on('mouseup.' + pluginName, $.proxy(Pad.prototype.onmouseup, this));

    	var direction = $(event.target).data('direction');
    	this.trigger(direction);
		return this;
    };

    Pad.prototype.trigger = function(direction) {
    	// Without jQuery because jQuery events do not bubble
		var e = new CustomEvent(pluginName + ':pressed', {
    		bubbles: true,
    		detail: {
				direction: direction || 'none'
			}
    	});
		this.$element[0].dispatchEvent(e);
		return this;
    };

    Pad.prototype.onmouseup = function() {
    	$document.off('mouseup.' + pluginName);
    	this.trigger();
    };

     $.fn[pluginName] = function(options) {
        return this.each(function () {
        	var $this = $(this);
            if (!$.data($this, 'plugin_' + pluginName)) {
                $.data($this, 'plugin_' + pluginName,
                new Pad($this, options));
            }
        });
    };

	return Pad;
}));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],3:[function(require,module,exports){
(function (global){
'use strict';

var utils = {
	round: function(value, decimals) {
		var divider = Math.pow(10, decimals ||  0);
		return Math.round(value * divider) / divider;
	},
	bound: function(value, min, max) {
		return Math.min(Math.max(value, min), max);
	},
	min: function(value, minValue) {
		var result = Math.min(value, minValue);
		result = result * (value ? value / Math.abs(value) : 1);
		return result;
	},
	extend: function(target, source) {
		target = target || {};
		for (var prop in source) {
			if (typeof source[prop] === 'object') {
				target[prop] = this.extend(target[prop], source[prop]);
			} else {
				target[prop] = source[prop];
			}
		}
		return target;
	}
};

var Animator = utils.Animator = function(interval) {
	this.interval = interval || 16;
	this.id = null;
};

Animator.prototype.cancel = function() {
	if (this.id) {
		global.clearTimeout(this.id);
	}
	return this;
};

Animator.prototype.execute = function(callback) {
	this.cancel();
	if (callback() !== false) {
		this.id = global.setTimeout(this.execute.bind(this, callback), this.interval);
	}
};

module.exports = utils;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],"differential-drive":[function(require,module,exports){
(function (global){
'use strict';

/**
 * Differential Drive Manager.
 * @module  differential-drive
 */

var utils = require('./utils.js');

/**
 * Default DifferentialDrive settings.
 */
var defaults = {
	linear: 0,										// initial linear speed
	radial: 0,										// initial radial speed
	linearMin: -1,									// minimum linear speed
	linearMax: 1,									// maximum linear speed
	radialMin: -1,									// minimum radial speed
	radialMax: 1,									// maximum radial speed
	interval: 16,									// animation interval delay
	acceleration: 500,								// time to reach requested speed in milliseconds
	rpcMethodName: 'com.thaby.drive',				// RPC method provided by KomNav
	transportSession: null,							// Provided transport session (mandatory)
};

/**
 * Kompai differential drive manager.
 * @constructor
 * @param {Object} options - options will be merged with defaults
 */
function DifferentialDrive(options) {
	var settings = this.settings = utils.extend(utils.extend({}, defaults), options);
	// Override transportSession because it is not an instance of Session anymore
	this.settings.transportSession = options.transportSession;
	if (!settings.transportSession || !settings.transportSession.call) {
		throw new Error('options.transportSession is invalid');
	}
	this.animator = new utils.Animator(settings.interval);
	this._set(settings.linear, settings.radial);
}

/**
 * Get the current rounded linear and radial values as Array.
 * @return {Array} - array of 2 elements containing the current linear and radial values rounded with 4 decimals.
 */
DifferentialDrive.prototype.getValues = function() {
	return [this.linear, this.radial].map(function(v) { 
		return utils.round(v, 4);
	});
};

/**
 * Updates the current linear and radial values.
 * @param  {Number} linear
 * @param  {Number} radial
 */
DifferentialDrive.prototype.update = function(linear, radial) {
	var boundedUpdate = this._getBoundedUpdate(linear, radial);

	this.animator.execute(function() {
		boundedUpdate();
		this.send();
		return (!!this.linear || !!this.radial);
	}.bind(this));
};

/**
 * Sends the current values to the connected KomNav.
 * @return {DifferentialDrive}
 */
DifferentialDrive.prototype.send = function() {
	if (!global.DEBUG_SAFE) {
		this.settings.transportSession.call(this.settings.rpcMethodName, this.getValues());
	}
	if (global.DEBUG || global.DEBUG_SAFE) {
		var values = this.getValues();
		console.log('DifferentialDrive [%f, %f]', values[0], values[1]);
	}
	return this;
};

/**
 * Get the update function with bounded new values.
 * @param  {Number} linear
 * @param  {Number} radial
 * @return {Function}
 */
DifferentialDrive.prototype._getBoundedUpdate = function(linear, radial) {

	// steps are computed from the delta and the acceleration setting
	var linearStep = (linear - this.linear) / (this.settings.acceleration / this.settings.interval),
		radialStep = (radial - this.radial) / (this.settings.acceleration / this.settings.interval);

	return function() {
		// Compute next value by adding the step to the current value.
		var nextLinear = this.linear + linearStep,
			nextRadial = this.radial + radialStep;

		// Ensure that next value has not exceed (from bottom or top) the requested value.
		nextLinear = (linear - nextLinear) * (linear - this.linear) <= 0 ? linear : nextLinear;
		nextRadial = (radial - nextRadial) * (radial - this.radial) <= 0 ? radial : nextRadial;

		return this._set(nextLinear, nextRadial);
	}.bind(this);

};

/**
 * Updates the current linear and radial values.
 * @param  {Number}	linear
 * @param  {Number}	radial
 * @return {DifferentialDrive}
 */
DifferentialDrive.prototype._set = function(linear, radial) {
	// if parameters are undefined or NaN, do not update the value
	linear = linear !== undefined && !isNaN(radial) ? linear : this.linear ||  0;
	radial = linear !== undefined && !isNaN(radial)  ? radial : this.radial ||  0;
	// Ensure that values are in the limits
	this.linear = utils.bound(linear, this.settings.linearMin, this.settings.linearMax);
	this.radial = utils.bound(radial, this.settings.radialMin, this.settings.radialMax);
	return this;
};

module.exports = DifferentialDrive;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./utils.js":3}],"kom-remote":[function(require,module,exports){
(function (global){
'use strict';

var $,
	DifferentialDrive = require('differential-drive');

function onDocumentReady(callback) {
	if (document.readyState === 'complete') {
		callback();
	} else {
		document.addEventListener('DOMContentLoaded', function() {
			callback();
		});
	}
}

/**
 * Load jQuery dependencies when jQuery is available (ie DOMContentLoaded)
 */
onDocumentReady(function() {
	$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
	require('./jquery.joystick.js');
	require('./jquery.pad.js');
});

var template = document.currentScript.ownerDocument.querySelector('#kom-remote');

/**
 * KomRemoteElementPrototype
 */
var KomRemoteElementPrototype = Object.create(HTMLElement.prototype);

KomRemoteElementPrototype.init = function() {
	this.$element = $(this);
	var $shadow = this.$shadow = $(this.shadowRoot);

	var $joystickContainer = $shadow.find('.joystick'),
		radiusMax = Math.min($joystickContainer.innerWidth(), $joystickContainer.outerWidth()) / 2;
	this.$joystick = $shadow.find('.joystick-stick').joystick({ radiusMax: radiusMax });
	this.$pad = $shadow.find('.pad').pad();
	this.$switch = $shadow.find('input[name=switch-remote]');

	this.$switch.on('change.komremote', this.onswitch.bind(this));

	// kom-remote custom element is now ready for use!
	this.ready = true;
	this.dispatchEvent(new CustomEvent('ready'));

	return this;
};

/**
 * Destroy KomRemoteElementPrototype: removes event listeners and calls destroy on joystick and pad jQuery plugins
 * @return {KomRemoteElementPrototype}
 */
KomRemoteElementPrototype.destroy = function() {
	this.$element.off('joystick:move.komremote pad:pressed.komremote');
	this.$switch.off('change.komremote');
	this.$joystick.data('joystick').destroy();
	this.$pad.data('joystick').destroy();
	return this;
};

KomRemoteElementPrototype.start = function(options) {
	this.differentialDrive = new DifferentialDrive(options);
	this.$element.on('joystick:move.komremote', this.onjoystickmove.bind(this));
	this.$element.on('pad:pressed.komremote', this.onpadpressed.bind(this));
	return this;
};

KomRemoteElementPrototype.onjoystickmove = function(event) {
	var values = event.originalEvent.detail;
	this.differentialDrive.update(-values.ratioY / 2, -values.ratioX);
};

KomRemoteElementPrototype.onpadpressed = function(event) {
	switch (event.originalEvent.detail.direction) {
		case 'top':
			this.differentialDrive.update(0.2, 0);
			break;
		case 'right':
			this.differentialDrive.update(0, -0.2);
			break;
		case 'bottom':
			this.differentialDrive.update(-0.2, 0);
			break;
		case 'left':
			this.differentialDrive.update(0, 0.2);
			break;
		default:
			this.differentialDrive.update(0, 0);
			break;
	}
};

KomRemoteElementPrototype.onswitch = function(event) {
	var type = event.target.value;
	switch (type) {
		case 'pad':
			this.$element.addClass('is-pad');
			break;
		case 'joystick':
		/* falls through */
		default:
			this.$element.removeClass('is-pad');
	}
	return this;
};

KomRemoteElementPrototype.createdCallback = function() {
	var clone = document.importNode(template.content, true);
	this.createShadowRoot().appendChild(clone);

	onDocumentReady(this.init.bind(this));
	return this;
};

module.exports = KomRemoteElementPrototype;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./jquery.joystick.js":1,"./jquery.pad.js":2,"differential-drive":"differential-drive"}]},{},[])


//# sourceMappingURL=kom-remote.js.map
