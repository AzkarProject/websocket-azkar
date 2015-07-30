    /**
                                                                    window.gamepad = new Gamepad();

                                                                    gamepad.bind(Gamepad.Event.CONNECTED, function(device) {
                                                                        console.log("a new gamepad connected");
                                                                    });

                                                                    gamepad.bind(Gamepad.Event.DISCONNECTED, function(device) {
                                                                        console.log("gamepad disconnected");
                                                                    });

                                                                    gamepad.bind(Gamepad.Event.UNSUPPORTED, function(device) {
                                                                        // an unsupported gamepad connected (add new mapping)
                                                                        console.log(" an unsupported gamepad connected (add new mapping)");
                                                                    });

                                                                    gamepad.bind(Gamepad.Event.BUTTON_DOWN, function(e) {
                                                                        // e.control of gamepad e.gamepad pressed down  
                                                                        if (e.control == "FACE_1" || (e.control == "LEFT_BOTTOM_SHOULDER") || (e.control == "RIGHT_BOTTOM_SHOULDER"))
                                                                            console.log(e.control + " of gamepad  " + e.gamepad + "pressed down");
                                                                    });

                                                                    gamepad.bind(Gamepad.Event.BUTTON_UP, function(e) {
                                                                        // e.control of gamepad e.gamepad released
                                                                        if (e.control == "FACE_1" || (e.control == "LEFT_BOTTOM_SHOULDER") || (e.control == "RIGHT_BOTTOM_SHOULDER"))
                                                                            console.log(e.control + " of gamepad  " + e.gamepad + "released");
                                                                    });

                                                                    gamepad.bind(Gamepad.Event.AXIS_CHANGED, function(e) {
                                                                        // e.axis changed to value e.value for gamepad e.gamepad
                                                                        if (e.axis == "LEFT_STICK_X")
                                                                            console.log(e.axis + "changed to value  " + e.value + "for gamepad  " + e.gamepad);
                                                                    });
                                                                    /**/

    /* gamepad.bind(Gamepad.Event.TICK, function(gamepads) {
         // gamepads were updated (around 60 times a second)
         console.log("gamepads were updated (around 60 times a second)") ;
     });*/
    /*
        if (!gamepad.init()) {
            // Your browser does not support gamepads, get the latest Google Chrome or Firefox
            alert('Your browser does not support gamepads, get the latest Google Chrome or Firefox.');
        }*/

//$(document).ready(function() {

        // Attach it to the window so it can be inspected at the console.
        //window.gamepad = new Gamepad();
        var gamepad = new Gamepad();
        var btHommeMort = 'false';

        gamepad.bind(Gamepad.Event.CONNECTED, function(device) {
            

            $('#gamepads').append('<li id="gamepad-' + device.index + '">Gamepad n°' + device.index+ '</li>');

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

        
        // boucle au 1/60eme seconde sur les boutons du Gamepad
        // Voir js/lib/gamepad.js
        gamepad.bind(Gamepad.Event.TICK, function(gamepads) {
            var gamepad,
                wrap,
                control,
                value,
                i, j;

            gamepad = gamepads[0];
            wrap = $('#gamepad-' + 0);

            
            
            if (gamepad) {
                
                // Si bouton A (homme mort) appuyé:
                if (gamepad.state["FACE_1"] === 1 ) { 
                    console.log(' >>>>> START gamepad');
                   
                    btHommeMort = "true";
                    //var TargetAngularSpeed = 0.1;
                    var aSpeed = gamepad.axes[0];
                    var lSpeed = gamepad.state["RIGHT_BOTTOM_SHOULDER"];
                    
                    // Mixage des 2 variables linearspeed pour marche avant et neglinearspeed pour marche arrière...
                    var TargetLinearSpeedNeg = gamepad.state["LEFT_BOTTOM_SHOULDER"];
                    TargetLinearSpeedNeg = TargetLinearSpeedNeg * -1;
                    var lSpeed = lSpeed + TargetLinearSpeedNeg;

                    socket.emit("moveOrder",{ command:'Move', aSpeed:aSpeed, lSpeed:lSpeed, enable:'true' });
                    /**/

                } else {
                // Sinon si bouton A (homme mort) relaché:    
                    
                    if (btHommeMort == "true") {
                        console.log(' >>>>> STOP gamepad');
                        socket.emit("moveOrder",{command:'Stop',aSpeed:0, lSpeed:0, enable:'false'});
                        btHommeMort = "false";
                    }  
                    /**/


                }
                /**/


                
                // Affichage sur IHM
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


 //   });