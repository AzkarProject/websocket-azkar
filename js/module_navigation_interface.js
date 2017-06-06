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

// todo: rename module_navigation_interface
console.log("module_navigation_interface chargé");

exports.sendToRobot = function (rpcMethodName, values, controlDevice, driveCommand){     

        //From keyboard: navigation_interface.sendToRobot("", "", "Keyboard",driveCommand);
        //console.log(" @sendToRobot")
        //console.log(" rpcMethodName: " + rpcMethodName + " values: " + values + " controlDevice: " + controlDevice + " driveCommand: " + driveCommand)
        
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
        
        } else if (controlDevice == "Keyboard") {
            driveCommand.driveSettings = rpcMethodName;
            driveCommand.channel = parameters.navCh;

        } else {
            driveCommand.channel = parameters.navCh;
        }
        

        if (type === "pilote-appelant") {
            //console.log("navigation_interface.sendToRobot >>")
            //console.log(driveCommand)
            // envoi des valeurs au serveur par websocket
            if (parameters.navCh == 'webSocket') socket.emit("piloteOrder", driveCommand);
            // envoi des valeurs au serveur par webRtc
            else if (parameters.navCh == 'webRTC') sendCommand(driveCommand);
            
        

        } else {


        }




};


Flag_DEBUG = false;

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
            
            // console.log("@ sendToPilote >>> map_parameters");
            socket.emit('navigation', {
                        command: typeData,
                        dataMap: data
                    
                    });

        } else if (typeData == "map_parameters2") {
            
            // console.log("@ sendToPilote >>> map_parameters2");
            socket.emit('navigation', {
                        command: typeData,
                        dataMap: data.dataMap,
                        listPOI: data.listPOI
                    
                    });

         /**/
         } else if (typeData == "robot_localization") {
            
            // console.log("@ sendToPilote >>> robot_localization");

            socket.emit('navigation', {
                        command: typeData,
                        robotInfo: data
                    });

        
        }


};


})(typeof exports === 'undefined'? this['navigation_interface']={}: exports);