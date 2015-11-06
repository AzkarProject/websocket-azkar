'use strict';

var autobahn = require('autobahn'),
	$ = require('jquery');

global.DEBUG = true; // Uncomment to log values
//global.DEBUG_SAFE = true; // Uncomment to prevent sending values to komcom

console.log('Autobahn %s loaded', autobahn.version);

/**
 * Example of requiring DifferentialDrive
 * var DifferentialDrive = require('differential-drive');
 */

var KOMCOM_SERVER = 'komcom.53js.fr',
	KOMCOM_REALM = 'com.kompai2',
	connection = new autobahn.Connection({ url: 'wss://' + KOMCOM_SERVER, realm: KOMCOM_REALM });

connection.onopen = function(session, details) {
	// Publish, Subscribe, Call and Register
	console.log('OPEN', session, details);
	$('body').addClass('komcom-connected');
	document.querySelector('kom-remote').start(session);
};

connection.onclose = function(reason, details) {
	// handle connection lost
	console.log('CLOSE', reason, details);
	$('body').removeClass('komcom-connected');
	document.querySelector('kom-remote').destroy();
};

connection.open();
