 var gamepad = new Gamepad();
 var btHommeMort = 'false';

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
     $('#step-commands').hide();
     $('#drive-commands').show();
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
             console.log(' >>>>> START gamepad');
             btHommeMort = true;

             var TargetLinearSpeedPos = gamepad.state["RIGHT_BOTTOM_SHOULDER"]; // vitesse marche avant
             var TargetLinearSpeedNeg = gamepad.state["LEFT_BOTTOM_SHOULDER"]; // vitesse marche arrière
             var aSpeed = gamepad.axes[0]; // vitesse angulaire

             TargetLinearSpeedNeg = TargetLinearSpeedNeg * -1; // changement de signe de la vitesse car marche arrière
             var lSpeed = TargetLinearSpeedPos + TargetLinearSpeedNeg; // Mixage des 2 variables linearspeed pour marche avant et neglinearspeed pour marche arrière...


             var deadzoneX = 0.16; // zone +/- en dessous de laquelle la commande angulaire vaut 0 

             aSpeed = (Math.abs(aSpeed) < deadzoneX ? 0 : aSpeed); // test d'ajustement pour la dead zone 
             aSpeed = (lSpeed > 0 ? -aSpeed : aSpeed); // changement de sens dans l'orientation en cas de marche avant

             /*  if (lSpeed > 0) {
                   aSpeed = aSpeed * (-1); // changement de sens dans l'orientation en cas de marche avant
               }*/

             // console.log('@onMoveOrder >> angular speed :' + aSpeed + '  et linear speed :' + lSpeed);

             // envoi des valeurs au serveur
             socket.emit("moveOrder", {
                 command: 'onDrive',
                 aSpeed: aSpeed,
                 lSpeed: lSpeed,
                 enable: 'true'
             });
         } else {
             if (btHommeMort) {
                 console.log(' >>>>> STOP gamepad');
                 socket.emit("moveOrder", {
                     command: 'onStop',
                     aSpeed: 0,
                     lSpeed: 0,
                     enable: 'false'
                 });

                 btHommeMort = false;
             }

         }

         //debug = common.dateER('GAMEPAD')
         //console.log (debug);

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

 if (!gamepad.init()) {
     alert('Your browser does not support gamepads, get the latest Google Chrome or Firefox.');
 }
