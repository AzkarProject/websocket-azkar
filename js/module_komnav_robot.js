'use strict';

//var autobahn = require('autobahn'),
//	$ = require('jquery');

// global.DEBUG = true; // Uncomment to log values
//global.DEBUG_SAFE = true; // Uncomment to prevent sending values to komcom

// console.log('Autobahn %s loaded', autobahn.version);

/**
 * Example of requiring DifferentialDrive
 * var DifferentialDrive = require('differential-drive');
 */

var SESSION = null;

var KOMCOM_SERVER = '127.0.0.1', // wss://127.0.0.1
	KOMCOM_REALM = 'com.kompai2', // com.thaby / com.kompai2
	KOMNAV_METHOD_DRIVE = KOMCOM_REALM + '.drive',
	connection = new autobahn.Connection({ url: 'wss://' + KOMCOM_SERVER, realm: KOMCOM_REALM });

var isRobubox = settings.isRobubox();


if (isRobubox == true) {

	connection.onopen = function(session, details) {
		// Publish, Subscribe, Call and Register
		console.log('OPEN', session, details);
		SESSION = session;
		$('body').addClass('komcom-connected');
		document.querySelector('kom-remote')
			.start({
				transportSession: session,
				rpcMethodName: KOMNAV_METHOD_DRIVE
			});
	};

	connection.onclose = function(reason, details) {
		// handle connection lost
		console.log('CLOSE', reason, details);
		$('body').removeClass('komcom-connected');
		document.querySelector('kom-remote').destroy();
	};

	function onWebComponentReady(element, callback) {
		if (element.ready) { // already loaded
			callback.call(element);
		} else {
			element.addEventListener('ready', function() {  // wait for ready event
				callback.call(element);
			});
		}
	}

	onWebComponentReady(document.querySelector('kom-remote'), function() {
		connection.open();
	});

}