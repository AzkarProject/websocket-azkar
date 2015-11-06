
//var activKomkom = "false";
var activKomkom = "true";

if ( activKomkom == "true") {

	/*
	var connection = new autobahn.Connection({
		url: 'wss://komcom.53js.fr:443',
		realm: 'com.kompai2'
	});
	/**/

	var connection = new autobahn.Connection({
		url: 'wss://127.0.0.1:443',
		realm: 'com.kompai2'
	});
	/**/

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


