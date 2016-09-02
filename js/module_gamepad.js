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


	// Todo: Passer en mode exports ???
	console.log ("module_gamepad chargé");

	var gamepad;
	var buttonStatusDiv;
	var analogicValueProgressBar;


	// Add titi:
	var buttonA = null; // 0
	var buttonY = null; // 1
	var buttonB = null; // 2
	var buttonX = null; // 3

	var	buttonLB = null; // 4
	var buttonRB = null; // 5

	//var reverseButton = null; // 6
	//var advanceButton = null; // 7

	var	buttonLT = null; // 6
	var buttonRT = null; // 7

	var buttonBack = null; // 8
	var buttonStart = null; // 9

	var crossUp = null; // 12
	var crossDown = null; // 13
	var crossLeft = null; // 14
	var crossRight = null; // 15

	// Flag d'états du Gamepad
	var activeGamePad = false;
	var connectedGamePad = false;
	var btHommeMort = false;
	// var onMove = false;
	onMove = false; // onMove en variable globale pour être accédée depuis un autre script...
	var onMessage = false;
	// Dernier bouton activé
	var lastButtonName = "";

	// ----------------

	window.onload = function() {
	  
	  buttonStatusDiv = document.querySelector("#buttonStatus");
	  analogicValueProgressBar = document.querySelector("#buttonValue");
	  advanceValueBar = document.querySelector("#advanceValue"); 
	  reverseValueBar = document.querySelector("#reverseValue");
	  leftRightValueBar = document.querySelector("#leftRight");


	 // requestAnimationFrame(mainloop);
	 // Note titi: un simple setInterval est amplement suffisant
	 // pour envoyer des ordres de mouvement tous les 100 ms
	  setInterval(mainloop, 100);


	};

	function mainloop() {
	  
	  // clear, draw objects, etc...
	  scangamepads();
	  
	  // Check gamepad button states
	  checkButtons(gamepad);
	  
	  // Check joysticks
	  // checkAxes(gamepad);
	  // Note Titi: Inutile de contrôler systématiquement les axes des joysticks
	  // Si les boutons A ou B ne sont pas préssé (homme mort). 
	  // Donc l'appel à la fonction se fera en fonction de l'homme mort.
	  
	  
	  // animate at 60 frames/s
	  // requestAnimationFrame(mainloop);
	  // Note Titi: Désactivé pour être remplacé par un simple un simple setinterval de 100ms, 
	  // ce qui est amplement suffisant et diminue le risque de surcharge des envois websockets/webRTC 
	  
	}



	//----------------------------------
	// gamepad utility code
	//----------------------------------


	window.addEventListener("gamepadconnected", function(e) {
	   // now as a global var
	   gamepad = e.gamepad;
	   var index = gamepad.index;
	   var id = gamepad.id;
	   var nbButtons = gamepad.buttons.length;
	   var nbAxes = gamepad.axes.length;
	   
	   var  msg = "Gamepad N° " + index +"\n";
	        msg += "ID: " + id + "\n";
	        msg += "Buttons: " + nbButtons + "\n"; 
	        msg += "Axes: " + nbAxes;

	   console.log(gamepad)
	   connectedGamePad = true;
	   //$('#connect-notice').replaceWith(" <span id ='connect-notice'>  -- Gamepad activé !</span>");
	   ihm.driveConnectNotice("  -- Gamepad activé !");
	});


	window.addEventListener("gamepaddisconnected", function(e) {
	   var gamepad = e.gamepad;
	   var index = gamepad.index;
	   // console.log("Gamepad No " + index + " has been disconnected");
	   // alert("Gamepad No " + index + " has been disconnected")
	   connectedGamePad = false;
	   //$('#connect-notice').replaceWith(" <span id ='connect-notice'>  -- Gamepad déconnecté !</span>");
	   ihm.driveConnectNotice("  -- Gamepad déconnecté !");
	   ihm.driveCommandBlock('close')
	});

	function scangamepads() {
	  var gamepads = navigator.getGamepads();
	  
	  for (var i = 0; i < gamepads.length; i++) {
	    if(gamepads[i])
	        gamepad = gamepads[i]; 
	  }

	  // Si le GamePad est déja connecté au chargement de la page, 
	  // l'eventListener "gamepadconnected" n'est pas apellé. 
	  // Donc il faut utiliser un flag d'état.
	  if ( connectedGamePad == false ) {
	  	if (gamepads[0]) {
	  		//$('#connect-notice').replaceWith(" <span id ='connect-notice'>  -- Gamepad connecté !</span>");
	  		ihm.driveConnectNotice("  -- Gamepad connecté !");
	  	}
	 
	  }

	}


	var once = false;
	function checkCompatibility(Gamepad) {
		
		if (once == false) {
			console.log(gamepad.id);
			once = true;
		}
		
		var isCompatible = false ;
		if ( gamepad.id == "Xbox 360 Controller (XInput STANDARD GAMEPAD)") {
			isCompatible = true;	
		} else {
			ihm.driveConnectNotice("  -- Gamepad Incompatible !");
		}
		return isCompatible
		/**/
	}



	// Detect button states
	function checkButtons(gamepad) {
		  
		if(gamepad === undefined) return;
		if(!gamepad.connected) return;
		
		// Check si le gamepad est un XBox 360
		if(checkCompatibility(Gamepad) == false) return;


		var atLeastOneButtonPressed = false;

		/*
		for (var i = 0; i < gamepad.buttons.length; i++) {  
		 var b = gamepad.buttons[i];
		 if(b.pressed) {
		   alert ("Button " + i + " is pressed");
		   atLeastOneButtonPressed = true;
		   buttonStatusDiv.innerHTML = 
		    "Button " + i + " is pressed<br>";
		   
		   if(b.value !== undefined)
		    analogicValueProgressBar.value = b.value;
		 }
		}
		/**/

		// Utilisation de variables nommées
		// plutot qu'une boucle sur un tableau d'objet 
		// pour une meilleure compréhension 
		// des affectations de touche et du code métier

		// mode normal (vert)
		buttonA = gamepad.buttons[0]; 
		// fermeture connexion (rouge) 
		buttonB = gamepad.buttons[1]; 
		// mode précision (bleu)
		buttonX = gamepad.buttons[2]; 
		// ouverture connexion (orange)
		buttonY = gamepad.buttons[3]; 

		// frontal droit - Cycle sélection caméra distante up + connexion
		buttonLB = gamepad.buttons[4]; 
		// LB_LastState = false;
		// frontal gauche - Cycle définition caméra robot up + connexion
		buttonRB = gamepad.buttons[5]; 

		// gachette gauche - marche arrière
		buttonLT = gamepad.buttons[6]; 
		// gachette droite - marche avant
		buttonRT = gamepad.buttons[7]; 

		buttonBack = gamepad.buttons[8]; // efface les notifications
		buttonStart = gamepad.buttons[9]; // switche fullScreen

		crossUp = gamepad.buttons[12]; // non utilisé
		crossDown = gamepad.buttons[13]; // non utilisé
		crossLeft = gamepad.buttons[14]; // non utilisé
		crossRight = gamepad.buttons[15]; // non utilisé

		// Si les boutons homme mort sont préssés
		// bouton Homme mort avec vitesses en mode normal
		if (buttonA.pressed) {
		    // checkAxes(gamepad,"standard");
		    //console.log('Gamepad Bouton A');
		    atLeastOneButtonPressed = true;
		    buttonStatusDiv.innerHTML = "(A) Drive mode standard";
		    prepareDriveCommand(gamepad, buttonRT.value, buttonLT.value,"standard","onDrive" );
		    btHommeMort = true;
		    onMove = true;
		    lastButtonName = "buttonA";
		    ihm.driveCommandBlock('open')
		    return;

		// Bouton Homme mort avec vitesses en mode précision
		} else if (buttonX.pressed) {
		   // checkAxes2(gamepad,"precision");
		   // console.log('X');
		   //console.log('Gamepad Bouton X');
		    atLeastOneButtonPressed = true;
		    buttonStatusDiv.innerHTML = " (X) Drive mode précision";
		    prepareDriveCommand(gamepad, buttonRT.value, buttonLT.value,"precision","onDrive" )
		    btHommeMort = true;
		    onMove = true;
		    lastButtonName = "buttonX";
		    ihm.driveCommandBlock('open')
		    return;
		
		
		}   else if (crossUp.pressed) {
				// console.log('Gamepad UP');
				atLeastOneButtonPressed = true;
		    	buttonStatusDiv.innerHTML = "(CrossUp) Drive mode full Axes";
		    	prepareDriveCommand(gamepad, buttonRT.value, buttonLT.value,"standard","onDriveAxe" );
		    	btHommeMort = true;
		    	onMove = true;
		    	lastButtonName = "crossUp";
		    	ihm.driveCommandBlock('open');
		   		return;

		// Si bouton homme mort non activés, on traite les autres commandes
		} else {

			// Si Homme mort : 
			// Si la précedénte commande était un Drive
			// On lance un Stop
			if (onMove == true ) {
				onMove = false;
				prepareDriveCommand(gamepad,0,0,null,"onStop");
			}

			// Ouverture connexion
			if (buttonY.pressed) {
			      
			      //console.log('Gamepad Bouton Y');
			      // empécher l'appui continu sur la même touche 
			      // if (lastButtonName == "buttonY" ) return

			    // Ralentir l'appui continu sur la même touche
				var newTimer = Date.now();
				if (lastButtonName == "buttonY" ) {
				   	var testDelay = newTimer - lastTimer;
				   	if ( testDelay < 5000 ) {
				   		notifications.writeMessage ("standard","GAMEPAD","(Y) Ouverture/fermeture de connexion en cours, veuillez patienter...",5000)
				   		return
						}				
				} lastTimer = newTimer;
			      
			      
			      if (IS_WebRTC_Connected == true ) {
			      	
			      	/*
			      	notifications.writeMessage ("error","GAMEPAD","(Y) Connexion déjà ouverte ! ",3000)
			      	return;
			      	/**/

				   	notifications.writeMessage ("standard","GAMEPAD","(Y) Fermeture connexion",3000)
				   	notifications.spawnNotification("GAMEPAD","(Y) Fermeture connexion",3000)
				   	usersConnection.closeRobotConnexion();
				    lastButtonName = "buttonY";
				    onMove = false;
				   	return;
			      


			      }
			      //driveCommandBlock('open')
			      //buttonStatusDiv.innerHTML = "(Y) Ouverture connexion";
			      atLeastOneButtonPressed = true;
			      lastButtonName = "buttonY";
			      //writeMessage ("success","GAMEPAD","(Y) Ouverture connexion",3000)
			  	  //spawnNotification("GAMEPAD","(Y) Ouverture connexion",3000)
			  	  notifications.writeMessage ("standard","GAMEPAD","(Y) Ouverture connexion",3000)
			  	  notifications.spawnNotification("GAMEPAD","(Y) Ouverture connexion",3000)
			  	  usersConnection.openRobotConnexion();
			      
			      onMove = false;
			      return;
			      // Todo: connexion
			
			// Fermeture connexion
			} else if (buttonB.pressed) {
				  /*//console.log('Gamepad Bouton B');
				  // empécher l'appui continu sur la même touche 
				  if (lastButtonName == "buttonB" ) return;
				  if (IS_WebRTC_Connected == false ) {
				  	notifications.writeMessage ("error","GAMEPAD","(B) Connexion déjà fermée ! ",3000)
				  	return;
				  }	
				  //driveCommandBlock('open')
			      //buttonStatusDiv.innerHTML = "(B) Fermeture connexion<br>";
			      atLeastOneButtonPressed = true;
			      lastButtonName = "buttonB";
			      //writeMessage ("error","GAMEPAD","(B) Fermeture connexion",3000)
			      //spawnNotification("GAMEPAD","(B) Fermeture connexion",3000)
			      notifications.writeMessage ("standard","GAMEPAD","(B) Fermeture connexion",3000)
			      notifications.spawnNotification("GAMEPAD","(B) Fermeture connexion",3000)
			      usersConnection.closeRobotConnexion();
			      lastButtonName = "buttonB";
			      onMove = false;
			      return;
			      /**/

			      // Test STOP
			      var data = { command: 'onFullStop'}
				  navigation_interface.sendToRobot("", "", "Gamepad",data);
				  onMove = false;
				  return;

			// Cycle sélection caméra
			} else if (buttonLB.pressed) {
				
				//console.log('Gamepad Bouton LB');
				// Ralentir l'appui continu sur la même touche
				var newTimer = Date.now();
				if (lastButtonName == "buttonLB" ) {
				   	var testDelay = newTimer - lastTimer;
				   	if ( testDelay < 1000 ) return
				} lastTimer = newTimer;

				lastButtonName = "buttonLB";
				atLeastOneButtonPressed = true;

				// Version Originale 
				if (IS_WebRTC_Connected == true ) {
			      	
			      	//notifications.writeMessage ("error","GAMEPAD (LB) ","Sélection caméra impossible !</br/> Veuillez dabord déconnecter le robot !! ",500)
			      	//return;

					// Sélection et activation a la volée
					SelectAndOpenCam()

			    } else {
			    
				    var idSelect = '#remote_videoSource';
				    var textCounter = 'Caméras robot disponibles: ';
				    var selectCamText =  incrementSelectList(idSelect,textCounter)
				    	  
				  	notifications.writeMessage ("standard","GAMEPAD (LB)", selectCamText);

				}
				
				return;

				
			// Cycle selection définitions
			} else if (buttonRB.pressed)  {
				
				//console.log('Gamepad Bouton RB');
				// Ralentir l'appui continu sur la même touche
				var newTimer = Date.now();
				if (lastButtonName == "buttonRB" ) {
				   	var testDelay = newTimer - lastTimer;
				   	if ( testDelay < 1000 ) return
				} lastTimer = newTimer;

				atLeastOneButtonPressed = true;
				lastButtonName = "buttonRB";


				if (IS_WebRTC_Connected == true ) {
			      	
			      	//writeMessage ("warning","GAMEPAD (RB) ","Settings Impossibles !</br/> Veuillez dabord déconnecter le robot !! ",500)
			      	//notifications.writeMessage ("error","GAMEPAD (RB) ","Settings Impossibles !</br/> Veuillez dabord déconnecter le robot !! ",500)
			      	//return;
			      
					// Sélection et activation a la volée
					SelectResolutionAndOpenCam();


			      } else {
			    
			    
				    var idSelect = '#robot_camdef_select';
				    var textCounter = 'Définitions caméras robot disponibles: ';
				    var selectDefText =  incrementSelectList(idSelect,textCounter)		  
				  	//writeMessage ("info","GAMEPAD (RB)", selectDefText);
				  	notifications.writeMessage ("standard","GAMEPAD (RB)", selectDefText);

			  	}

				return;

			// Ferme toutes les notifications
			} else if (buttonBack.pressed)  {
				
			    //console.log('Gamepad Bouton BACK');
			    atLeastOneButtonPressed = true;
			    lastButtonName = "buttonBack";
				// hideAllMessages();
				notifications.hideAllMessages();
			
			// Switche mode embed/plein écran
			} else if (buttonStart.pressed)  {

				 //console.log('Gamepad Bouton START');
				 // Ralentir l'appui continu sur la même touche
			     var newTimer = Date.now();
			     if (lastButtonName == "buttonStart" ) {
			     	var testDelay = newTimer - lastTimer;
			     	if ( testDelay < 500 ) return
			     } lastTimer = newTimer;
				
			    atLeastOneButtonPressed = true;
			    lastButtonName = "buttonStart";

				ihm.toggleFullScreen();
				//ihm.navigationView('center','bottom');
		    	ihm.toggleHUD();
			
			// Test Homme mort axe 2
			} 
	  }

	  if(!atLeastOneButtonPressed) {
	    buttonStatusDiv.innerHTML = "";
	    ihm.driveJauges(0,0,0,'grey');
		if (activeGamePad == true ) {
			// console.log ('CLOSE');
			ihm.driveCommandBlock('close');
		}
	  }

	}


	function SelectAndOpenCam() {
		console.log("SelectAndOpenCam()");
		console.log("sélection caméra");	
		callback1()
	

		function callback1() {
			console.log("on déconnecte");
			usersConnection.closeRobotConnexion();
			onMove = false;
		    setTimeout(callback2, 500);

		}

		function callback2() {   
		    
	    	// 2 on cycle sur la caméra suivante
		    var idSelect = '#remote_videoSource';
		    var textCounter = 'Caméras robot disponibles: ';
		    var selectCamText =  incrementSelectList(idSelect,textCounter)
		  	notifications.writeMessage ("standard","GAMEPAD (LB)", selectCamText);
		    setTimeout(callback3, 1000);

		}

		function callback3() {
			console.log("on connecte");
			setTimeout(usersConnection.openRobotConnexion(),100)
	      	onMove = false;

		}

	}


	function SelectResolutionAndOpenCam() {
		console.log("SelectResolutionAndOpenCam()");
		console.log("sélection résolution");	
		callback1(); 
	

		function callback1() {
			console.log("on déconnecte");
			usersConnection.closeRobotConnexion();
			onMove = false;
		    setTimeout(callback2, 500);

		}

		function callback2() {   
		   var idSelect = '#robot_camdef_select';
		   var textCounter = 'Définitions caméras robot disponibles: ';
		   var selectDefText =  incrementSelectList(idSelect,textCounter)		  
		   notifications.writeMessage ("standard","GAMEPAD (RB)", selectDefText);
		   setTimeout(callback3, 1000);

		}

		function callback3() {
			console.log("on connecte");
			setTimeout(usersConnection.openRobotConnexion(),100)
	      	onMove = false;

		}

	}






	// Author:Thierry: 
	// fonction permettant de cycler sur une liste d'option
	// Pratique quand on ne dispose que d'un bouton...
	function incrementSelectList(idSelect,textCounter) {

				var nbSelect = $(idSelect+'>option').length;
			    var indexSelect = $(idSelect+" option:selected").prevAll().size();
			    
			    // Pour selectionner automatiquement l'option suivante:
			    // On récupère l'index sélectionné et on l'incrémente de 1
			    // s'il est égal au nombre total d'options (-1) on remet le selecteur a l'index 0...
			    var newIndex = indexSelect + 1;
			    var lastIndex = nbSelect - 1;
			    if (indexSelect == lastIndex) newIndex = 0;
	        	$(idSelect+' option').eq(newIndex).prop('selected',true);
			    
				// Affichage de la nouvelle sélection
				var selectText = textCounter+nbSelect+"<hr/>";
				var prefix = "  ", selectClass = ""
			    $(idSelect+" > option").each(function() {
	    			if(this.selected) {
	    				prefix = ">>>>>> ", selectClass = "selected";
	    			}
	    			selectText += "<br><span class ='"+selectClass+"'>"+ prefix + " " + this.text+"</span>";
	    			prefix = "  ", selectClass = "";
				});

				return selectText

	}



	// Thierry: Construction & envoi de la commande Drive
	function prepareDriveCommand(gamepad, speedPos, speedNeg, mode, command ) {

	    if(gamepad === undefined) return;
	    if(!gamepad.connected) return;

	    var jaugeClass = 'green';

	    if (command == 'onStop') {
	    	jaugeClass = 'red';
	    	// Gamepad - Affichage du module FullAxes (param 'jauges' ou 'joystick' ou 'none')
			ihm.switchGamepadDisplayMode("jauges")	
	    	ihm.driveJauges(0,0,0,jaugeClass);
	    	// console.log ('onStop');
	    	
			var driveStop = {
				driveSettings: '',
				channel: parameters.navCh,
				system: parameters.navSys,
				source:"Gamepad",
				dateA: '',
				command: 'onStop',
				aSpeed: 0,
				lSpeed: 0,
				enable: 'false'
			}
			     
			navigation_interface.sendToRobot("", "", "Gamepad",driveStop);
			btHommeMort = false;
	    
	    } else if (command == 'onDrive'){

		    
		    // --- Code Michaël

		    var TargetLinearSpeedPos = speedPos; // vitesse marche avant
		    var TargetLinearSpeedNeg = speedNeg; // vitesse marche arrière
		    var aSpeed = gamepad.axes[0]; // vitesse angulaire

		    // changement de signe de la vitesse car marche arrière
		    TargetLinearSpeedNeg = TargetLinearSpeedNeg * -1;
		    // Mixage des 2 variables linearspeed pour marche avant et neglinearspeed pour marche arrière...
		    var lSpeed = TargetLinearSpeedPos + TargetLinearSpeedNeg; 
		    // zone +/- en dessous de laquelle la commande angulaire vaut 0
		    var deadzoneX = 0.20;  
		    // test d'ajustement pour la dead zone 
		    aSpeed = (Math.abs(aSpeed) < deadzoneX ? 0 : aSpeed); 
		    // changement de sens dans l'orientation en cas de marche avant
		    aSpeed = (lSpeed >= 0 ? -aSpeed : aSpeed); 

		    // --- Fin Code Michaël

	        // Correction des vitesses pour gagner en précision...
	        if (mode == 'precision') {
	        	jaugeClass = 'blue';
	        	aSpeed = aSpeed/5;
	         	lSpeed = lSpeed/5; // 10
	       	} else {
	       		aSpeed = aSpeed/2;
	       		lSpeed = lSpeed/2; // 10

	       	
	       	// Test de commande alternative
	       	} 

	       	// Gamepad - Affichage du module FullAxes (param 'jauges' ou 'joystick' ou 'none')
			ihm.switchGamepadDisplayMode("jauges")	
	       	ihm.driveJauges(speedPos,speedNeg,gamepad.axes[0],jaugeClass)

		    // envoi de l'ordre
		     var driveCommand = {
		         driveSettings: '',
		         channel: parameters.navCh,
		         system: parameters.navSys,
		         source:"Gamepad",
		         dateA: '',
		         command: 'onDrive',
		         aSpeed: aSpeed,
		         lSpeed: lSpeed,
		         enable: 'true'
		     }             
		    navigation_interface.sendToRobot("", "", "Gamepad",driveCommand);
		
		}  
			else if (command == 'onDriveAxe') {

				
				jaugeClass = 'red';
				
			    var aSpeed = gamepad.axes[2]; // vitesse angulaire
			    var lSpeed = gamepad.axes[3]; // Vitesse linéaire
			    
			    var deadzoneX = 0.20;  
			    // test d'ajustement pour la dead zone 
			    aSpeed = (Math.abs(aSpeed) < deadzoneX ? 0 : aSpeed); 
			    lSpeed = (Math.abs(lSpeed) < deadzoneX ? 0 : lSpeed); 
		        
				// Gamepad - Affichage du module FullAxes (param 'jauges' ou 'joystick' ou 'none')
				ihm.switchGamepadDisplayMode("joystick")
				//ihm.drawJoystick( aSpeed, lSpeed );
				ihm.directionnalArrow (aSpeed,lSpeed)

				// changement de sens dans l'orientation en cas de marche avant
		    	aSpeed = (lSpeed > 0 ? -aSpeed : aSpeed); 


		        mode = "precision";
		        // Correction des vitesses pour gagner en précision...
		        if (mode == 'precision') { 
		        	aSpeed = aSpeed/2;
		         	lSpeed = lSpeed/5; // 10
		       	} else {
		       		aSpeed = aSpeed/2;
		       		lSpeed = lSpeed/2; // 10
		       	
		       	}
		       				    
			    // envoi de l'ordre
			     var driveCommand = {
			         driveSettings: '',
			         channel: parameters.navCh,
			         system: parameters.navSys,
			         source:"Gamepad",
			         dateA: '',
			         command: 'onDrive',
			         aSpeed: -aSpeed,
			         lSpeed: -lSpeed,
			         enable: 'true'
			     }             
			    
			   navigation_interface.sendToRobot("", "", "Gamepad",driveCommand);
	       	
	    }
	       	


	}

})(typeof exports === 'undefined'? this['module_gamepad']={}: exports);












