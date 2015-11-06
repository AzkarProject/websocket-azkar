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
	acceleration: 1000,								// time to reach requested speed in milliseconds
	rpcMethod: 'com.kompai2.drive'	// RPC method provided by KomNav
};

/**
 * Kompai differential drive manager.
 * @constructor
 * @param {Session} session - websocket session of komcom client
 * @param {Object} options - options will be merged with defaults
 */
function DifferentialDrive(session, options) {
	var settings = this.settings = utils.extend(utils.extend({}, defaults), options);
	this.session = session;
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
		this.session.call(this.settings.rpcMethod, this.getValues());
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
