require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"./utils.js":1}]},{},[])


//# sourceMappingURL=differential-drive.js.map
