(function(exports){

exports.sendToRobot = function (rpcMethodName, values,controlDevice, driveCommand){     


        if (controlDevice == "kom-remote") {
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

        } else if (controlDevice == "Gamepad") {
            driveCommand.driveSettings = rpcMethodName;
            driveCommand.channel = parameters.navCh;
        }
		var dateA = Date.now();
        driveCommand.dateA = dateA;


        // envoi des valeurs au serveur par websocket
        if (parameters.navCh == 'webSocket') socket.emit("piloteOrder", driveCommand);
        // envoi des valeurs au serveur par webRtc
        else if (parameters.navCh == 'webRTC') sendCommand(driveCommand);

};


exports.sendToPilote = function (typeData, data){ 

        
        if (typeData == "battery_level") {

            // envoi des valeurs par websocket
            if (parameters.navCh == 'webSocket') {
                socket.emit(typeData, {
                    command: typeData,
                    percentage: data
                });

            }
            // envoi des valeurs par webRtc
            else if (parameters.navCh == 'webRTC') {
                // sendData(driveCommand);  
                socket.emit(typeData, {
                    command: typeData,
                    percentage: data
                });
            }     


        } else if (typeData == "map_parameters") {
            
            console.log("@ sendToPilote >>> map_parameters");
            socket.emit('navigation', {
                        command: typeData,
                        dataMap: data
                    });
         } else if (typeData == "robot_localization") {
            
            console.log("@ sendToPilote >>> robot_localization");

            socket.emit('navigation', {
                        command: typeData,
                        robotInfo: data
                    });

        
        }


};


})(typeof exports === 'undefined'? this['commandes']={}: exports);