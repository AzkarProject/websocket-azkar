
// DriveCommands
// -------------------------------------------------------------------------------------------------------------------

var gamepad = new Gamepad();

var btHommeMort = 'false';

// Michael & Thierry ------------
function gamePadController() {

    gamepad.bind(Gamepad.Event.CONNECTED, function(device) {


         $('#gamepads').append('<li id="gamepad-' + device.index + '">Gamepad n°' + device.index + '</li>');

         var mainWrap = $('#gamepad-' + device.index);
         var statesWrap, logWrap, control, i;

         mainWrap.append('<ul id="states-' + device.index + '"></ul>');
         statesWrap = $('#states-' + device.index)

         enable = device.state["FACE_1"];
         statesWrap.append("<li>Bouton A" + ': <span id="state-' + device.index + '-' + "FACE_1" + '">' + enable + '</span></li>');

         targetLinearSpeedNeg = device.state["LEFT_BOTTOM_SHOULDER"];
         statesWrap.append('<li>Bouton Bas Droite' + ': <span id="state-' + device.index + '-' + "LEFT_BOTTOM_SHOULDER" + '">' + targetLinearSpeedNeg + '</span></li>');

         targetLinearSpeedPos = device.state["RIGHT_BOTTOM_SHOULDER"];
         statesWrap.append('<li>Bouton Bas Gauche' + ': <span id="state-' + device.index + '-' + "RIGHT_BOTTOM_SHOULDER" + '">' + targetLinearSpeedPos + '</span></li>');

         targetAngularSpeed = device.axes[0];
         statesWrap.append('<li>Axe Horizontal ' + 0 + ': <span id="axis-' + device.index + '-' + 0 + '">' + targetAngularSpeed + '</span></li>');

         console.log('Connected', device);
         console.log("enable  : " + enable);
         console.log("targetLinearSpeed : " + targetLinearSpeedNeg);
         console.log("targetLinearSpeed : " + targetLinearSpeedPos);
         console.log("targetAngularSpeed : " + targetAngularSpeed);


         // Modif de la notice et affichage des onglets idoines
         $('#connect-notice').replaceWith(" <span id ='connect-notice'>  -- Gamepad activé !</span>");
         //$('#step-commands').hide();
         //$('#drive-commands').show();
    });

    // Alerte de Gamepad non détecté
    gamepad.bind(Gamepad.Event.DISCONNECTED, function(device) {
         console.log('Disconnected', device);
         $('#gamepad-' + device.index).remove();
         if (gamepad.count() == 0) {
             $('#connect-notice').replaceWith(" <span id ='connect-notice'>  -- Gamepad déconnecté !</span>");
             $('#step-commands').show();
             $('#drive-commands').hide();
         }
    });

    gamepad.bind(Gamepad.Event.TICK, function(gamepads) {
         var gamepad,
             wrap,
             control,
             value,
             i, j;

         gamepad = gamepads[0];
         wrap = $('#gamepad-' + 0);

         if (gamepad) {

             if (gamepad.state["FACE_1"] === 1) {
                 //console.log(' >>>>> INPUT gamepad');
                 onMove = true;
                 btHommeMort = true;

		         $('#step-commands').hide();
		         $('#drive-commands').show();
                 //console.log ("navCh: "+navCh);
                 //console.log ("parameters.navCh: "+ parameters.navCh);

                 var TargetLinearSpeedPos = gamepad.state["RIGHT_BOTTOM_SHOULDER"]; // vitesse marche avant
                 var TargetLinearSpeedNeg = gamepad.state["LEFT_BOTTOM_SHOULDER"]; // vitesse marche arrière
                 var aSpeed = gamepad.axes[0]; // vitesse angulaire

                 TargetLinearSpeedNeg = TargetLinearSpeedNeg * -1; // changement de signe de la vitesse car marche arrière
                 var lSpeed = TargetLinearSpeedPos + TargetLinearSpeedNeg; // Mixage des 2 variables linearspeed pour marche avant et neglinearspeed pour marche arrière...


                 var deadzoneX = 0.20; // zone +/- en dessous de laquelle la commande angulaire vaut 0 

                 aSpeed = (Math.abs(aSpeed) < deadzoneX ? 0 : aSpeed); // test d'ajustement pour la dead zone 
                 aSpeed = (lSpeed >= 0 ? -aSpeed : aSpeed); // changement de sens dans l'orientation en cas de marche avant


                 // TODO: Switcher entre webSockets et WebRTCdatachannel selon paramètrages du pilote - OK
                 // TODO: Inverser les Axes - OK
                 // TODO: Ajouter une pente pour l'accélération ou limiter la vitesse du linear speed... 

                 // Bridage des vitesses pour gagner en précision...
                 // aSpeed = aSpeed/5;
                 // lSpeed = lSpeed/10;

                 //var dateA = Date.now();

                 //navCh = 'webSocket'; // webRTC
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
             
             } else {
                 if (btHommeMort) {
                     
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
                     $('#step-commands').show();
             		     $('#drive-commands').hide();
                 }

             }

             enable = gamepad.state["FACE_1"];
             $('#state-' + gamepad.index + '-' + "FACE_1" + '').html(enable);

             targetLinearSpeedNeg = gamepad.state["LEFT_BOTTOM_SHOULDER"];
             targetLinearSpeedNeg = targetLinearSpeedNeg * -1;
             $('#state-' + gamepad.index + '-' + "LEFT_BOTTOM_SHOULDER" + '').html(targetLinearSpeedNeg);

             targetLinearSpeedPos = gamepad.state["RIGHT_BOTTOM_SHOULDER"];
             $('#state-' + gamepad.index + '-' + "RIGHT_BOTTOM_SHOULDER" + '').html(targetLinearSpeedPos);

             targetAngularSpeed = gamepad.axes[0];
             $('#axis-' + gamepad.index + '-' + 0 + '').html(targetAngularSpeed);

         }
    });

    if (!gamepad.init()) alert('Your browser does not support gamepads, get the latest Google Chrome or Firefox.');
} // function gamePadController() {...

gamePadController();



// StepCommands ( Michael)
/*// -------------------------------------------------------------------------------------------------------------------

function jaugeSpeedSetting() {
   var ava = document.getElementById("jaugeSpeedSetting");
   var prc = document.getElementById("speedSetting");
   prc.innerHTML = ava.value + " m.s";
}


jaugeSpeedSetting();


function cmdSpeed(val) {
   var ava = document.getElementById("jaugeSpeedSetting");
   if ((ava.value + val) <= ava.max && (ava.value + val) >= 0) {
       ava.value += val;
   }

   jaugeSpeedSetting();
}

var cmdLeft = function() {
   var rot = document.getElementById("stepRotation").value;
   var speed = document.getElementById("jaugeSpeedSetting").value;
   var angle;
  
   angle = degToRad(rot);
  
   var dateE = Date.now();
   var commandeStep = {
       dateE: dateE,
       command: 'onStep',
       distance: angle,
       MaxSpeed: speed,
       typeMove: "relative"  
    }
    // envoi des valeurs au serveur par websocket
    if (parameters.navCh == 'webSocket') {
        socket.emit("piloteOrder", commandeStep);
    // envoi des valeurs au serveur par webRtc
    } else if (parameters.navCh == 'webRTC') {
        sendCommand(commandeStep);
    }

}


var cmdRight = function() {
   var rot = document.getElementById("stepRotation").value;
   var speed = document.getElementById("jaugeSpeedSetting").value;
   var angle;

   angle = degToRad(rot);

   var dateE = Date.now();
   var commandeStep = {
       dateE: dateE,
       command: 'onStep',
       distance: -angle,
       MaxSpeed: speed,
       typeMove: "relative"   
    }
    // envoi des valeurs au serveur par websocket
    if (parameters.navCh == 'webSocket') {
        socket.emit("piloteOrder", commandeStep);
    // envoi des valeurs au serveur par webRtc
    } else if (parameters.navCh == 'webRTC') {
        sendCommand(commandeStep);
    }
}


var cmdUp = function() {
   var speed = document.getElementById("jaugeSpeedSetting").value;
   var dist = document.getElementById("stepDistance").value;

   var dateE = Date.now();
   var commandeStep = {
       dateE: dateE,
       command: 'onStep',
       distance: dist,
       MaxSpeed: speed,
       typeMove: "translate"    
    }
    // envoi des valeurs au serveur par websocket
    if (parameters.navCh == 'webSocket') {
        socket.emit("piloteOrder", commandeStep);
    // envoi des valeurs au serveur par webRtc
    } else if (parameters.navCh == 'webRTC') {
        sendCommand(commandeStep);
    }

}


var cmdDown = function() {
   var speed = document.getElementById("jaugeSpeedSetting").value;
   var dist = document.getElementById("stepDistance").value;
  var dateE = Date.now();
   var commandeStep = {
       dateE: dateE,
       command: 'onStep',
       distance: -dist,
       MaxSpeed: speed,
       typeMove: "translate"    
    }
    // envoi des valeurs au serveur par websocket
    if (parameters.navCh == 'webSocket') {
        socket.emit("piloteOrder", commandeStep);
    // envoi des valeurs au serveur par webRtc
    } else if (parameters.navCh == 'webRTC') {
        sendCommand(commandeStep);
    }
}


//fonction pour convertir les degres --> rad
var degToRad = function(val) {
   return val * (Math.PI / 180);
}


/**/



/*// KeyBoards
// -------------------------------------------
function keyBoardController() {
    var Input = {

        gamepad: null,
        ticking: false,

        // Previous timestamps for gamepad state; used in Chrome to not bother with
        // analyzing the polled data if nothing changed (timestamp is the same
        // as last time).
        prevTimestamp: null,

        init: function() {
            // Set up the keyboard events
            document.onkeydown  = function(e) { Input.changeKey((e||window.event).keyCode, 1); }
            document.onkeyup    = function(e) { Input.changeKey((e||window.event).keyCode, 0); }
            // Checks Chrome to see if the GamePad API is supported.
            var gamepadSupportAvailable = !!navigator.webkitGetGamepads || !!navigator.webkitGamepads;
            if(gamepadSupportAvailable) {
                // Since Chrome only supports polling, we initiate polling loop straight
                // away. For Firefox, we will only do it if we get a connect event.
                if (!!navigator.webkitGamepads || !!navigator.webkitGetGamepads) {
                    Input.startPolling();
                }
            }
        },

        // called on key up and key down events
        changeKey: function(which, to) {
            switch (which){
                case 65: case 37: key[0]=to; break; // left
                case 87: case 38: key[2]=to; break; // up
                case 68: case 39: key[1]=to; break; // right
                case 83: case 40: key[3]=to; break;// down
                case 32: key[4]=to; break; // attack (space bar)
                case 91: key[5]=to; break; // use item (cmd)
                case 88: key[6]=to; break; // start (x)
                case 90: key[7]=to; break; // select (z)
            }
        },
        
        // Starts a polling loop to check for gamepad state.
        startPolling: function() {
            // Don’t accidentally start a second loop, man.
            if (!Input.ticking) {
                Input.ticking = true;
                Input.tick();
            }
        },

       
        // Stops a polling loop by setting a flag which will prevent the next
        // requestAnimationFrame() from being scheduled.
        stopPolling: function() {
            Input.ticking = false;
        },

        
        // A function called with each requestAnimationFrame(). Polls the gamepad
        // status and schedules another poll.
        tick: function() {
            Input.pollStatus();
            Input.scheduleNextTick();
        },

        scheduleNextTick: function() {
            // Only schedule the next frame if we haven’t decided to stop via
            // stopPolling() before.
            if (Input.ticking) {
                requestAnimationFrame(Input.tick);
            }
        },

        
        // Checks for the gamepad status. Monitors the necessary data and notices
        // the differences from previous state (buttons and connects/disconnects for Chrome). If differences are noticed, asks
        // to update the display accordingly. Should run as close to 60 frames per second as possible.
        pollStatus: function() {
            // We're only interested in one gamepad, which is the first.
            gamepad = navigator.webkitGetGamepads && navigator.webkitGetGamepads()[0];

            if(!gamepad)
                return;

            // Don’t do anything if the current timestamp is the same as previous
            // one, which means that the state of the gamepad hasn’t changed.
            // The first check makes sure we’re not doing anything if the timestamps are empty or undefined.
            if (gamepad.timestamp && (gamepad.timestamp == Input.prevTimestamp)) {
                return
            }

            Input.prevTimestamp = gamepad.timestamp;

            Input.updateKeys();
        },

        updateKeys: function() {

             console.log(gamepad.buttons)

            // Map the d-pad
            key[0] = gamepad.axes[0] <= -0.5 // left
            key[1] = gamepad.axes[0] >= 0.5 // right
            key[2] = gamepad.axes[1] <= -0.5  // up
            key[3] = gamepad.axes[1] >= 0.5 // down

            // Map the Buttons
            key[4] = gamepad.buttons[0]; // attack (A)
            key[5] = gamepad.buttons[1]; // use item (B)

            key[6] = gamepad.buttons[10]; // start
            key[7] = gamepad.buttons[9]; // select
        }

    }
} // function keyboardController() {...
/**/// keyboardController();