'use strict';

var $,
	DifferentialDrive = require('differential-drive');

/**
 * Load jQuery dependencies when jQuery is available (ie DOMContentLoaded)
 */
document.addEventListener('DOMContentLoaded', function() {
	$ = require('jquery');
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
	return this;
};

/**
 * Destroy KomRemoteElementPrototype: removes event listeners and calls destroy on joystick and pad jQuery plugins
 * @return {KomRemoteElementPrototype}
 */
KomRemoteElementPrototype.destroy = function () {
	this.$element.off('joystick:move.komremote pad:pressed.komremote');
	this.$switch.off('change.komremote');
	this.$joystick.data('joystick').destroy();
	this.$pad.data('joystick').destroy();
	return this;
};

KomRemoteElementPrototype.start = function (session) {
	this.differentialDrive = new DifferentialDrive(session, { acceleration: 500 });
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

	document.addEventListener('DOMContentLoaded', this.init.bind(this));
	return this;
};

module.exports = KomRemoteElementPrototype;
