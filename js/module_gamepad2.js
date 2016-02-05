var gamepad;
var buttonStatusDiv;
var analogicValueProgressBar;


// Add titi:
var buttonA = null; // 0
var buttonY = null; // 1
var buttonB = null; // 2
var buttonX = null; // 3

var cycleLeft = null; // 4
var cycleRight = null; // 5

var reverseButton = null; // 6
var advanceButton = null; // 7

var backButton = null; // 8
var startButton = null; // 9

var crossUp = null; // 12
var crossDown = null; // 13
var crossLeft = null; // 14
var crossRight = null; // 15

// Flag d'états du Gamepad
var activeGamePad = false;
var connectedGamePad = false;
var btHommeMort = false;
var onMove = false;
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
   // setInterval(scangamepads, 500);
  
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
  // ce qui est amplement suffisant et ne surcharge pas les envois websockets/webRTC 
  
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
   
   // alert(msg)
   connectedGamePad = true;
   $('#connect-notice').replaceWith(" <span id ='connect-notice'>  -- Gamepad activé !</span>");
});


window.addEventListener("gamepaddisconnected", function(e) {
   var gamepad = e.gamepad;
   var index = gamepad.index;
   // console.log("Gamepad No " + index + " has been disconnected");
   // alert("Gamepad No " + index + " has been disconnected")
   connectedGamePad = false;
   $('#connect-notice').replaceWith(" <span id ='connect-notice'>  -- Gamepad déconnecté !</span>");
   driveCommandBlock('close')
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
  		$('#connect-notice').replaceWith(" <span id ='connect-notice'>  -- Gamepad connecté !</span>");
  	}
 
  }

}

// Detect button states
function checkButtons(gamepad) {
	  
	if(gamepad === undefined) return;
	if(!gamepad.connected) return;

	var atLeastOneButtonPressed = false;

	/*
	for (var i = 0; i < gamepad.buttons.length; i++) {  
	 var b = gamepad.buttons[i];
	 if(b.pressed) {
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
	cycleLeft = gamepad.buttons[4]; 
	// frontal gauche - Cycle définition caméra robot up + connexion
	cycleRight = gamepad.buttons[5]; 

	// gachette gauche - marche arrière
	reverseButton = gamepad.buttons[6]; 
	// gachette droite - marche avant
	advanceButton = gamepad.buttons[7]; 

	backButton = gamepad.buttons[8]; // non utilisé
	startButton = gamepad.buttons[9]; // non utilisé

	crossUp = gamepad.buttons[12]; // non utilisé
	crossDown = gamepad.buttons[13]; // non utilisé
	crossLeft = gamepad.buttons[14]; // non utilisé
	crossRight = gamepad.buttons[15]; // non utilisé

	// Si les boutons homme mort sont préssés
	// bouton Homme mort avec vitesses en mode normal
	if (buttonA.pressed) {
	    // checkAxes(gamepad,"standard");
	    // console.log('A');
	    atLeastOneButtonPressed = true;
	    buttonStatusDiv.innerHTML = "(A) Drive mode standard";
	    // 
	    prepareDriveCommand(gamepad, advanceButton.value, reverseButton.value,"standard","onDrive" );
	    btHommeMort = true;
	    onMove = true;
	    lastButtonName = "buttonA";
	    driveCommandBlock('open')
	    return;

	// Bouton Homme mort avec vitesses en mode précision
	} else if (buttonX.pressed) {
	   // checkAxes2(gamepad,"precision");
	   // console.log('X');
	    atLeastOneButtonPressed = true;
	    buttonStatusDiv.innerHTML = " (X) Drive mode précision";
	    prepareDriveCommand(gamepad, advanceButton.value, reverseButton.value,"precision","onDrive" )
	    btHommeMort = true;
	    onMove = true;
	    lastButtonName = "buttonX";
	    driveCommandBlock('open')
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
		      //checkAxes(gamepad,"precision");
		      driveCommandBlock('open')
		      atLeastOneButtonPressed = true;
		      buttonStatusDiv.innerHTML = "(Y) Ouverture connexion";
		      lastButtonName = "buttonY";
		      onMove = false;
		      return;
		      // Todo: connexion
		
		// Fermeture connexion
		} else if (buttonB.pressed) {
			  driveCommandBlock('open')
		      //checkAxes(gamepad,"precision");
		      atLeastOneButtonPressed = true;
		      buttonStatusDiv.innerHTML = "(B) Fermeture connexion<br>";
		      lastButtonName = "buttonB";
		      onMove = false;
		      return;
		      // Todo: deconnexion

		// Cycle select caméra
		} /* else if () {
		 	// todo select camera
		 	// todo connexion/reconnexion
		
		// Cycle select définitions
		} /* else if ()  {
			// todo select défitiion
			// todo connexion/reconnexion
		} 
		/**/
		

  }

  if(!atLeastOneButtonPressed) {
    buttonStatusDiv.innerHTML = "";
    Jauges(0,0,0,'grey');
	if (activeGamePad == true ) {
		// console.log ('CLOSE');
		driveCommandBlock('close');
	}
  }

}


// Construction & envoi de la commande Drive
function prepareDriveCommand(gamepad, speedPos, speedNeg, mode, command ) {

    if(gamepad === undefined) return;
    if(!gamepad.connected) return;

    var jaugeClass = 'green';

    if (command == 'onStop') {
    	jaugeClass = 'red';
    	Jauges(0,0,0,jaugeClass);
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
		     
		commandes.sendToRobot("", "", "Gamepad",driveStop);
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

        // Bridage des vitesses pour gagner en précision...

        if (mode == 'precision') {
        	jaugeClass = 'blue';
        	aSpeed = aSpeed/5;
         	lSpeed = lSpeed/10;
       	} else {

       	}

       	Jauges(speedPos,speedNeg,gamepad.axes[0],jaugeClass)

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
	    commandes.sendToRobot("", "", "Gamepad",driveCommand);
	}


}


function Jauges(speedPos,speedNeg,axes,jaugeClass) {
	advanceValueBar.setAttribute("class", jaugeClass)
	advanceValueBar.value = speedPos;
    reverseValueBar.setAttribute("class", jaugeClass)
    reverseValueBar.value = speedNeg;
    leftRightValueBar.innerHTML = 0 + ": " + axes.toFixed(4);
    leftRightValueBar.setAttribute("class", jaugeClass)
    leftRightValueBar.setAttribute("value", axes + 1);
}



function driveCommandBlock(order){
	
	if ( order == 'open' ) {
		activeGamePad = true;
		$('#step-commands').hide();
		$('#drive-commands').show();
	} else if ( order == 'close' ) {
		activeGamePad = false;
		$('#step-commands').show();
   		$('#drive-commands').hide(); 
	}
}











