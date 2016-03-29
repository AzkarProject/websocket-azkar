/*
*
* Authors: François Michaudon & Hugo Mallet (53JS)
. Contributors: Thierry Bergeron (I3s)
*
*/

'use strict';
console.log ("module_komRemote chargé");

function onWebComponentReady(element, callback) {
	if (element.ready) { // already loaded
		callback.call(element);
	} else {
		element.addEventListener('ready', function() {  // wait for ready event
			callback.call(element);
		});
	}
}


if (type === "pilote-appelant") {

	var myTransportSession = {
		call: function(rpcMethodName, values) {
			// Sample
			// Rewrite with your own call method
			// console.log('send on my transport: ' + rpcMethodName + '[' + values + ']');
			var controlDevice = "kom-remote";
			navigation_interface.sendToRobot(rpcMethodName, values, controlDevice,"");


		}
	};

	// Ensure that kom-remote is ready before start
	onWebComponentReady(document.querySelector('kom-remote'), function() {
		$('body').addClass('komcom-connected');
		this.start({ transportSession: myTransportSession }); // Use your own transport session
	});


} else if (type === "robot-appelé") {

	var SESSION = null;

	var KOMCOM_SERVER = 'komcom.53js.fr', // wss://127.0.0.1
		KOMCOM_REALM = 'com.kompai2', // com.thaby / com.kompai2
		KOMNAV_METHOD_DRIVE = KOMCOM_REALM + '.drive',
		connection = new autobahn.Connection({ url: 'wss://' + KOMCOM_SERVER, realm: KOMCOM_REALM });

		if (fakeRobubox == false) {
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

			/*
			function onWebComponentReady(element, callback) {
				if (element.ready) { // already loaded
					callback.call(element);
				} else {
					element.addEventListener('ready', function() {  // wait for ready event
						callback.call(element);
					});
				}
			}
			/**/

			onWebComponentReady(document.querySelector('kom-remote'), function() {
				connection.open();
			});


		} else if (fakeRobubox == true) {


			var myTransportSession = {
				
				call: function(rpcMethodName, values) {
					console.log ('fakeRobubox: KomRemote-Robot Drive Command >>> ');
				}
			};


			/*
			function onWebComponentReady(element, callback) {
				if (element.ready) { // already loaded
					callback.call(element);
				} else {
					element.addEventListener('ready', function() {  // wait for ready event
						callback.call(element);
					});
				}
			}
			/**/

			// Ensure that kom-remote is ready before start
			onWebComponentReady(document.querySelector('kom-remote'), function() {
				$('body').addClass('komcom-connected');
				this.start({ transportSession: myTransportSession }); // Use your own transport session
			});
		}

}












