(function(exports){

exports.sendToRobot = function (rpcMethodName, values,controlDevice, driveCommand){     

		
        
        

        if (controlDevice == "kom-remote") {
            driveCommand = {
                 // driveSettings: this.settings.rpcMethod,
                 driveSettings: rpcMethodName,
                 channel: parameters.navCh,
                 system: parameters.navSys,
                 dateA: null,
                 command: 'onDrive',
                 aSpeed: values[1],
                 lSpeed: values[0],
                 enable: 'true'
            }

        } else if (controlDevice == "Gamepad") {
            driveCommand.driveSettings = rpcMethodName;
        }
		var dateA = Date.now();
        driveCommand.dateA = dateA;


        // envoi des valeurs au serveur par websocket
        if (parameters.navCh == 'webSocket') socket.emit("piloteOrder", driveCommand);
        // envoi des valeurs au serveur par webRtc
        else if (parameters.navCh == 'webRTC') sendCommand(driveCommand);

};



})(typeof exports === 'undefined'? this['commandes']={}: exports);