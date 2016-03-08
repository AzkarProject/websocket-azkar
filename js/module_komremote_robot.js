'use strict';

var SESSION = null;

var KOMCOM_SERVER = '127.0.0.1', // wss://127.0.0.1
	KOMCOM_REALM = 'com.thaby', // com.thaby / com.kompai2
	KOMNAV_METHOD_DRIVE = KOMCOM_REALM + '.drive',
	connection = new autobahn.Connection({ url: 'wss://' + KOMCOM_SERVER, realm: KOMCOM_REALM });

var isRobubox = appSettings.isRobubox();


if (isRobubox == true) {

	console.log("module_komnav");

	
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


	} else if (fakeRobubox == true) {


		var myTransportSession = {
			call: function(rpcMethodName, values) {
				console.log ('Drive Command >>> ');
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



	}






}


