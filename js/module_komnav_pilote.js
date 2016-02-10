'use strict';

//var $ = require('jquery');

//global.DEBUG = true; // Uncomment to log values
// global.DEBUG_SAFE = true; // Uncomment to prevent sending values to komcom

// console.log('Sample without KomCom');

var myTransportSession = {
	call: function(rpcMethodName, values) {
		// Sample
		// Rewrite with your own call method
		// console.log('send on my transport: ' + rpcMethodName + '[' + values + ']');
		var controlDevice = "kom-remote";
		commandes.sendToRobot(rpcMethodName, values, controlDevice,"");


	}
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

// Ensure that kom-remote is ready before start
onWebComponentReady(document.querySelector('kom-remote'), function() {
	$('body').addClass('komcom-connected');
	this.start({ transportSession: myTransportSession }); // Use your own transport session
});
