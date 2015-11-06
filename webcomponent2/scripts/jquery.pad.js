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
		try { $ = require('jquery'); } catch (e) {}
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
