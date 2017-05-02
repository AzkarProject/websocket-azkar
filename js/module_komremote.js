/*
*
* Authors: François Michaudon & Hugo Mallet (53JS)
. Contributors: Thierry Bergeron (I3S)
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

	

var myTransportSession = {
	call: function(rpcMethodName, values) {
		// Sample
		// Rewrite with your own call method
		// console.log('send on my transport: ' + rpcMethodName + '[' + values + ']');
		var controlDevice = "kom-remote";
		
		 if (type === "robot-appelé") {

			
			driveCommand = {
                 // driveSettings: this.settings.rpcMethod,
                 driveSettings: rpcMethodName,
                 channel: parameters.navCh,
                 system: parameters.navSys,
                 source: controlDevice,
                 dateA: null,
                 command: 'onDrive',
                 aSpeed: values[1],
                 lSpeed: values[0],
                 enable: 'true'
            }




			onMove = true;
            lastMoveTimeStamp = Date.now(); // on met a jour le timestamp du dernier ordre de mouvement...
            // Envoi commande Robubox
            // robubox.sendDrive(data.enable, data.aSpeed, data.lSpeed);
            komcom.sendDrive(data);

        } else {

			// On stoppe toute trajectoire en cours pour reprendre la main...
			var data = { command: 'onFullStop'}
			navigation_interface.sendToRobot("", "", "Gamepad",data);


			navigation_interface.sendToRobot(rpcMethodName, values, controlDevice,"");
		}
	}
};

// Ensure that kom-remote is ready before start
onWebComponentReady(document.querySelector('kom-remote'), function() {
	$('body').addClass('komcom-connected');
	this.start({ transportSession: myTransportSession }); // Use your own transport session
});








