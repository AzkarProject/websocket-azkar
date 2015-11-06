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
