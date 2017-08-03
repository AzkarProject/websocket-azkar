/*
*
* Copyright © CNRS (Laboratoire I3S) / université de Nice
* Contributeurs: Michel Buffa & Thierry Bergeron, 2015-2016
* 
* Ce logiciel est un programme informatique servant à piloter un Robot à distance
* Ce logiciel est régi par la licence CeCILL-C soumise au droit français et
* respectant les principes de diffusion des logiciels libres. Vous pouvez
* utiliser, modifier et/ou redistribuer ce programme sous les conditions
* de la licence CeCILL-C telle que diffusée par le CEA, le CNRS et l'INRIA 
* sur le site "http://www.cecill.info".
*
* En contrepartie de l'accessibilité au code source et des droits de copie,
* de modification et de redistribution accordés par cette licence, il n'est
* offert aux utilisateurs qu'une garantie limitée.  Pour les mêmes raisons,
* seule une responsabilité restreinte pèse sur l'auteur du programme,  le
* titulaire des droits patrimoniaux et les concédants successifs.

* A cet égard  l'attention de l'utilisateur est attirée sur les risques
* associés au chargement,  à l'utilisation,  à la modification et/ou au
* développement et à la reproduction du logiciel par l'utilisateur étant 
* donné sa spécificité de logiciel libre, qui peut le rendre complexe à 
* manipuler et qui le réserve donc à des développeurs et des professionnels
* avertis possédant  des  connaissances  informatiques approfondies.  Les
* utilisateurs sont donc invités à charger  et  tester  l'adéquation  du
* logiciel à leurs besoins dans des conditions permettant d'assurer la
* sécurité de leurs systèmes et ou de leurs données et, plus généralement, 
* à l'utiliser et l'exploiter dans les mêmes conditions de sécurité. 

* Le fait que vous puissiez accéder à cet en-tête signifie que vous avez 
* pris connaissance de la licence CeCILL-C, et que vous en avez accepté les
* termes.
*
*/


(function(exports){

	// if (isPanTiltCamera == false) return
	console.log ("module_foscam chargé");

	
	// Mode de controle de la caméra au clavier
	// Pas a pas ou continu. par défaut c'est pas à pas...
	var modeKeyboard = "modeSbS"; // "modeContinue"

	
	// Formulaire de sélection du mode de controle
	//selectModeSbS = document.querySelector('input#modeSbS');
	//selectModeContinue = document.querySelector('input#modeContinue');

	FoscamStatusDiv = document.querySelector("#buttonStatus");

	// Switch du mode de controle
	function switchCameraMode(mode) {
		console.log("switchCameraMode("+mode+")")
		modeKeyboard = mode;
	}


	// Méthode publique passerelle
	// pour traiter les commandes en provenance
	// d'une inteface graphique faite de simples boutons onclic
	// Et si elle s'apelle WTF, cest pas pour rien...
	exports.WTF = function(command) {
		
		if (command == "modeSbS" || command == "modeContinue") {
			switchCameraMode(command);
			return;
		}
		
		
		if (command == 'onCameraGoToDefaultPosition') {
			// On lance la comande de recentrage...
			foscam.resetCamera();
			return;
		
		} else if (command == 'onStop') {
			foscam.sendCameraOrder("onCameraZoomStop");
			sendCameraCommand("onCameraSetSpeed",2 );
			sendCameraCommand("onCameraStop");
			return;
		}


		if (modeKeyboard == 'modeSbS') {

			// Si c'est un Zoom, on envoie la commande et un stopZoom juste derrière
			if (command == "onCameraZoomIn" || command == "onCameraZoomOut") {
				foscam.zoomCamera(command,1)
				foscam.sendCameraOrder("onCameraZoomStop");
				return;
			} else {
				// Si c'est un move, On met la vitesse au max (0)
				sendCameraCommand("onCameraSetSpeed",0 );
				// On envoie la commande
				sendCameraCommand(command );
				// On envoie aussitot un StopMove derrière
				sendCameraCommand("onCameraStop");
				// On remet la vitesse a moyen
				sendCameraCommand("onCameraSetSpeed",2 );
				return;
			}



		} else if (modeKeyboard == 'modeContinue') {

			// Si c'est un Zoom, on envoie la commande et un stopZoom juste derrière
			if (command == "onCameraZoomIn" || command == "onCameraZoomOut") {
				foscam.zoomCamera(command,1)
				return;
			} else {
				// Si c'est un move, On met la vitesse au minimum (5)
				sendCameraCommand("onCameraSetSpeed",5 );
				// On envoie la commande
				console.log( 'sendCameraCommand("onCamera"'+command+' )' );
				sendCameraCommand(command );
				return;
			}
		} 
		/**/

	}


	// Méthode publique passerelle
	exports.sendCameraOrder = function(command) {
		sendCameraCommand(command);
	}


	// Méthode publique de traitement des mouvements directionnels de la caméra
	exports.moveCamera = function(axe){
		// console.log("moveCamera("+axe+")")

		sendCameraCommand("onCameraSetSpeed",2 );
		sendCameraCommand("onCamera"+axe );
	}

	// Méthode publique de traitement des reset de position de la caméra
	exports.resetCamera = function(presetPoint){
		// On met les vitesses de caméra au maximum
		sendCameraCommand("onCameraSetSpeed",0 );
		sendCameraCommand("onCameraSetZoomSpeed",3); 

		if (!presetPoint) {
			// console.log ("resetCamera()");
			sendCameraCommand("onCameraGoToDefaultPosition" );
		} else {
			// console.log ("resetCamera("+presetPoint+")");
			sendCameraCommand("onCameraGoToDefaultPosition" );
			// Petite temporisation en fonction de la vitesse de la webcam
			// Le temps pour elle de se positionner correctement au neutre...
			// 7 secondes étant le délais maximum constaté en vitesse rapide 
			// pour aller d'un extrème vertical/horizontal a la position neutre
			presetPoint = presetPoint = "onCameraGoToPreset"+presetPoint
			var gotoPreset = setTimeout(function() { gotoPresetPoint(presetPoint); }, 7000); 
			var resetZoom = setTimeout(function() { stopAndResetZoom(); }, 14000);
			//var resetZoom = setTimeout(function() { zoomCamera(onCameraZoomOut,3); }, 14000); 
			//var stopZoom = setTimeout(function() { sendCameraCommand ("onCameraZoomStop"); }, 21000);
			//presetPoint = presetPoint = "onCameraGoToPreset"+presetPoint
			//foscam.sendCameraCommand(presetPoint);
		}

		
	}

	// Méthode publique de traitement des reset de position de la caméra
	exports.zoomCamera = function(zoom, speed) {

		// Encore un Bug de l'API Foscam:
		// Les commandes de vitesse de Zoom ne sont pas prises en compte...
		// avec le bug qui empèche de supprimer un preset, ca fait beaucoup !!!
		// Et bien entendu perssonne ne répond a mon ticket sur leur forum de support...
		// Ca me gonfle, j'ai passé 2 heures à mettre au point l'algo de Zoom
		// en tenant compte de la vitesse, et tout ca pour rien.
		// Conclusion: Foscam c'est vraiment de la MERDE !!!!!!
		/*
		if (speed) {	
			// Par defaut, on met la vitesse de zoom la plus lente
			var speedZoom = 1;
			speedZoom = speed;
			sendCameraCommand("onCameraSetZoomSpeed",speedZoom);
		}
		/**/
		FoscamStatusDiv.innerHTML = "(Right Stick) Camera Zoom";
		sendCameraCommand(zoom);
	}

	exports.setCameraZoomSpeed = function(value) {
		sendCameraCommand("onCameraSetZoomSpeed",value );
	}

	
	exports.getCameraInfo = function() {
		// Todo
	}



	// Méthode privée (pour appel dans un setTimeout)  
	function gotoPresetPoint(presetPoint) {
		sendCameraCommand(presetPoint);
	}

	// idem
	function stopAndResetZoom() {
		// Répeter pendant 8 secondes:
		foscam.zoomCamera("onCameraZoomOut",3)
		// Puis une foi fini:
		// sendCameraCommand ("onCameraZoomStop");
	} 


	// Méthode privée: Envoi des commandes de caméra
	function sendCameraCommand (command, value){
	// function sendCameraCommand(gamepad, speedPos, speedNeg, mode, command ) { 
		
		/*// onCameraGoToDefaultPosition
		var debug = command
		if (value) debug +=" , "+value;
		console.log("sendCameraCommand("+debug+")")
		/**/

			var cmd = command;
			var setValue = null
			if (value) setValue = value     
			
			var cameraCommand = {
		         channel: parameters.navCh,
		         command: cmd,
		         value: setValue,
		         target: 'camera' 

		    }  

		navigation_interface.sendToRobot("", "", "",cameraCommand);

	}


})(typeof exports === 'undefined'? this['foscam']={}: exports);