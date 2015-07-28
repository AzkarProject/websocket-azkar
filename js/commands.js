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

    gamepad.bind(Gamepad.Event.CONNECTED, function(device) {
        console.log('Connected', device);

        $('#gamepads').append('<li id="gamepad-' + device.index + '"><h1>Gamepad #' + device.index + ': &quot;' + device.id + '&quot;</h1></li>');

        var mainWrap = $('#gamepad-' + device.index),
            statesWrap, logWrap, control, i;

        mainWrap.append('<strong>State</strong><ul id="states-' + device.index + '"></ul>');

        statesWrap = $('#states-' + device.index)

        enable = device.state["FACE_1"];
        statesWrap.append('<li>' + "FACE_1" + ': <span id="state-' + device.index + '-' + "FACE_1" + '">' + enable + '</span></li>');
        console.log("enable  : " + enable);
        //alert(enable2);
        targetLinearSpeedNeg = device.state["LEFT_BOTTOM_SHOULDER"];
        statesWrap.append('<li>' + "LEFT_BOTTOM_SHOULDER" + ': <span id="state-' + device.index + '-' + "LEFT_BOTTOM_SHOULDER" + '">' + targetLinearSpeedNeg + '</span></li>');
        console.log("targetLinearSpeed : " + targetLinearSpeedNeg);

        targetLinearSpeedPos = device.state["RIGHT_BOTTOM_SHOULDER"];
        statesWrap.append('<li>' + "RIGHT_BOTTOM_SHOULDER" + ': <span id="state-' + device.index + '-' + "RIGHT_BOTTOM_SHOULDER" + '">' + targetLinearSpeedPos + '</span></li>');
        console.log("targetLinearSpeed : " + targetLinearSpeedPos);

        targetAngularSpeed = device.axes[0];
        statesWrap.append('<li>Raw Axis ' + 0 + ': <span id="axis-' + device.index + '-' + 0 + '">' + targetAngularSpeed + '</span></li>');
        console.log("targetAngularSpeed : " + targetAngularSpeed);

        // On cache la notice 
        //$('#connect-notice').hide();
        $('#connect-notice').replaceWith(" Gamepad OK");
        $('#disconnected-gamepad').hide();
        $('#connected-gamepad').show();
    });

    // Alerte de Gamepad non détecté
    gamepad.bind(Gamepad.Event.DISCONNECTED, function(device) {
        console.log('Disconnected', device);
        $('#gamepad-' + device.index).remove();
        if (gamepad.count() == 0) {
            // On affiche la notice
            $('#connect-notice').show();
            $('#disconnected-gamepad').show();
            $('#connected-gamepad').hide();
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
            //alert('TOTO');
            if (gamepad.state["FACE_1"] === 1) {
                // alert("Bouton A Gamepad activé")

                //var TargetAngularSpeed = 0.1;
                var TargetAngularSpeed = gamepad.axes[0];
                var TargetLinearSpeed = gamepad.state["RIGHT_BOTTOM_SHOULDER"];

                // TODO >>>> Mixer les 2 variables linearspeed pour marche avant et neglinearspeed pour marche arrière...
                // Ex faire positif + négatif et envoyer la somme des 2...
                var targetLinearSpeedNeg = gamepad.state["LEFT_BOTTOM_SHOULDER"];
                targetLinearSpeedNeg = targetLinearSpeedNeg * -1;

                var HttpsProxyAgent = require('https-proxy-agent');
                var request = require('request');
                var proxy = 'http://127.0.0.1:2000';
                var agent = new HttpsProxyAgent(proxy);
                request({
                    uri: "http://localhost:50000/api/drive",
                    method: "POST",
                    headers: {
                        'content-type': 'application/json'
                    },
                    agent: agent,
                    timeout: 10000,
                    followRedirect: true,
                    maxRedirects: 10,
                    body: JSON.stringify({
                        "Enable": true,
                        "TargetAngularSpeed": TargetAngularSpeed,
                        "TargetLinearSpeed": TargetLinearSpeed
                    })
                }, function(error, response, body) {
                    console.log("Error" + error);
                    console.log("Response: " + response);
                    console.log("Body: " + body);
                });

                /*
                                var url = 'http://localhost:50000/api/drive';
                                var xmlhttp = new XMLHttpRequest(); // new HttpRequest instance 
                                xmlhttp.open("POST", url);
                                xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                                xmlhttp.send(JSON.stringify({
                                    "Enable": true,
                                    "TargetAngularSpeed": TargetAngularSpeed,
                                    "TargetLinearSpeed": TargetLinearSpeed
                                }));
                */

                /*****fin de la requete *****************/
                console.log(' >>>>> START gamepad');

            } else {

                var TargetAngularSpeed = 0;
                var TargetLinearSpeed = 0;
                var url = 'http://localhost:50000/api/drive';

                var HttpsProxyAgent = require('https-proxy-agent');
                var request = require('request');
                var proxy = 'http://127.0.0.1:2000';
                var agent = new HttpsProxyAgent(proxy);
                request({
                    uri: "http://localhost:50000/api/drive",
                    method: "POST",
                    headers: {
                        'content-type': 'application/json'
                    },
                    agent: agent,
                    timeout: 10000,
                    followRedirect: true,
                    maxRedirects: 10,
                    body: JSON.stringify({
                        "Enable": true,
                        "TargetAngularSpeed": TargetAngularSpeed,
                        "TargetLinearSpeed": TargetLinearSpeed
                    })
                }, function(error, response, body) {
                    console.log("Error" + error);
                    console.log("Response: " + response);
                    console.log("Body: " + body);
                });


                /*
                var xmlhttp = new XMLHttpRequest(); // new HttpRequest instance 
                xmlhttp.open("POST", url);
                xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                xmlhttp.send(JSON.stringify({
                    "Enable": true,
                    "TargetAngularSpeed": TargetAngularSpeed,
                    "TargetLinearSpeed": TargetLinearSpeed
                }));

    */
                console.log(' >>>>> STOP gamepad');


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


    //   });
