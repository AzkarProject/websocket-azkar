'use strict';


/*//
//var activKomkom = "false";
var activKomkom = "true";

if ( activKomkom == "true") {

	
	// var connection = new autobahn.Connection({
		// url: 'wss://komcom.53js.fr:443',
		// realm: 'com.kompai2'
	// });

	var connection = new autobahn.Connection({
		url: 'wss://127.0.0.1',
		realm: 'com.thaby'
	});

	connection.onopen = function(session, details) {
		console.log('OPEN', session, details);
		$('body').addClass('komcom-connected');
		document.querySelector('kom-remote').start(session);
	};

	connection.onclose = function(reason, details) {
		console.log('CLOSE', reason, details);
		$('body').removeClass('komcom-connected');
		document.querySelector('kom-remote').destroy();
	};

connection.open();

}

/**/


var testOpen = function() {
	// Publish, Subscribe, Call and Register
	//console.log('OPEN', session, details);
	$('body').addClass('komcom-connected');
	document.querySelector('kom-remote').start();
};

var testClose = function() {
	// handle connection lost
	//console.log('CLOSE', reason, details);
	$('body').removeClass('komcom-connected');
	document.querySelector('kom-remote').destroy();
};

testOpen();
/**/