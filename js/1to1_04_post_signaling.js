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


// Réception d'un ordre de déconnexion
socket.on("closeConnectionOrder",function(data) {
   console.log (">> socket.on('closeConnectionOrder',...");
    if (data.cible.id == myPeerID) {
        // A priori on est dans la peerConnection principale (Pilote <> Robot) >> peerCnx1to1
        //console.log ("------------ >>> closeConnectionOrder "+data.from.typeClient+"----------");
        // on lance le processus préparatoire à une reconnexion
        onDisconnect(peerCnx1to1);
    }
});


// A la déconnection du pair distant:
function onDisconnect(peerCnxId) {

    console.log("@ onDisconnect()");


    // Robustesse:
    if (type == "pilote-appelant") {

        IS_WebRTC_Connected = false;
        console.log(">>> sessionConnection :"+sessionConnection)
        console.log(">>> robotDisconnection :"+robotDisconnection)
        // On referme le formulaire sélection des cams du robot
        ihm.manageSubmitForm("robotDevices","deactivate");

        // Pour éviter un lancement intempestif de la connexion webRTC
        // si coté pilote la session de connexion webRTC nest pas ouverte
        // on teste le dabord Flag d'ouverture de session webRTC coté pilote
        // Valeurs possibles: Pending (par défaut), Launched
        if ( sessionConnection != "Pending") {
            // si la déconnexion du robot est involontaire
            // On relance le processus de connexion automatiquement
            if (robotDisconnection == "Unexpected") {
                var title = "Connexion robot perdue !"
                var message = " Reconnexion WebRTC en cours..."
                notifications.writeMessage ("error",title,message,3000)
                localManageDevices(); 
            }
       }
        
        // On remet le flag de déconnexion à "involontaire"
        robotDisconnection = "Unexpected";
        //notifications.writeMessage ("error","",message,3000)
        
    
    } else if (type == "robot-appelé") {
        piloteDisconnection = "Unexpected";
    }

    // On vérifie le flag de connexion
    if (isStarted == false) return;


    if (!!localStream) {
         video1.src = null;
         // localStream.stop(); // Ok Chrome 44 >> Bug Chrome 49 et au dela...
         stopStream (localStream); // Ok Chrome 44 > 51
    }

    if (!!remoteStream) {
         video2.src = null;
         // remoteStream.stop(); // Ok Chrome 44 >> Bug Chrome 49 et au dela...
         stopStream (remoteStream); // Ok Chrome 44 > 51
    }


    // on retire le flux remoteStream
    video1.src = "";
    video2.src = "";

    // on coupe le RTC Data channel
    if (channel) channel.close();
    channel = null;

    // On vide et on ferme la connexion courante
    peerCnxCollection[peerCnxId].close();
    peerCnxCollection[peerCnxId] = null;
    stopAndStart(peerCnxId);
}


// fonction polyfill pour arréter le stream
// Fonctionne avec mediaStream et mediaStreamTrack
function stopStream (stream) {
        if (stream.getVideoTracks) {
            // get video track to call stop on it
            var tracks = stream.getVideoTracks();
            if (tracks && tracks[0] && tracks[0].stop) tracks[0].stop();
        }
        else if (stream.stop) {
            // deprecated, may be removed in future
            stream.stop();
        }
        stream = null;
}




// Fermeture et relance de la connexion p2p par l'apellé (Robot)
function stopAndStart(peerCnxId) {

    console.log("@ stopAndStart()");
    
    if (type == "pilote-appelant") usersConnection.updateListUsers(); // Rafraichissement de la liste des visiteurs
    input_chat_WebRTC.disabled = true;
    input_chat_WebRTC.placeholder = "RTCDataChannel close";
    env_msg_WebRTC.disabled = true;
    // Rétablissement du canal par défaut pour les commande Drive (websocket)
    // et désactivation du bouton radio de select du canal webRTC
    if (type == "pilote-appelant") raZNavChannel(); 

    peerCnxCollection[peerCnxId] = new PeerConnection(server, options);
    
    // On informe la machine à état que c'est une renégociation
    isRenegociate = true;
};



// Robot & Pilote: envoi d'un message par WebRTC
function sendMessage() {
    console.log ("@ sendMessage()");
    var dateE = tools.humanDateER('E');
    //var msgToSend = dateE + ' [' + localObjUser.typeClient + '] ' + message.value;
    var msgToSend = localObjUser.pseudo + ': ' + message.value;
    channel.send(msgToSend);
    message.value = "";
    // Affiche trace du message dans le chatlog websocket local
    $(chatlog).prepend(msgToSend + "\n");
}

// Pilote: Envoi au robot d'une commande par WebRTC
function sendCommand(commandToSend) {
    console.log ("@ sendCommand("+commandToSend.command+")");

    // Affiche trace de la commande dans le chatlog webRTC local
    var dateE = tools.humanDateER('E');
    //commandToSend.dateE = dateE;
    $(chatlog).prepend(dateE+" SEND "+commandToSend.command + "\n");
    
    // sérialisation et envoi de la commande au robot via WebRTC
    commandToSend = JSON.stringify(commandToSend);
    channel.send(commandToSend);
}




// --------------------- Gestion des commandes du robot -------------------
// Robot: fonction homme mort...
if (type == "robot-appelé") {
    function deathMan(){
    
         // console.log("@ deathMan() >> onMove:"+onMove+" "+"lastMoveTimeStamp:"+lastMoveTimeStamp);          

         var dateA = Date.now();
         // if (settings.isBenchmark() == true ) dateA = Date.now(ts.now()), // date synchronisée avec le serveur (V1 timesync.js)
         // if (appSettings.isBenchmark() == true ) dateA = ServerDate.now(); // date synchronisée avec le serveur (V2 ServerDate.js)

         var data = {
                 channel: "Local-Robot",
                 source: "Homme-Mort",
                 system: parameters.navSys,
                 // dateA: Date.now(),
                 // dateA: Date.now(ts.now()), // date synchronisée avec le serveur (V1 timesync.js)
                 // dateA: ServerDate.now(), // date synchronisée avec le serveur (V2 ServerDate.js)
                 dateA: dateA,
                 command: 'deathMan',
                 aSpeed: 0,
                 lSpeed: 0,
                 enable: false
             }

        if (onMove == true || lastMoveTimeStamp != 0) {
            var now = Date.now();
            // if (settings.isBenchmark() == true )  now = Date.now(ts.now()); // date synchronisée avec le serveur (V1 timesync.js)
            // if (appSettings.isBenchmark() == true ) now = ServerDate.now(); // date synchronisée avec le serveur (V2 ServerDate.js)
            
            var test = now - lastMoveTimeStamp;
            if (test >= 1000 ) {
               komcom.sendDrive(data); // Envoi de la commande a la Robubox
               //console.log("@ >> deathMan() ---> STOP");
            }
        }
        setTimeout(deathMan,1000); /* rappel après 1000 millisecondes */
    }
    deathMan();
}


// Robot: Reception webSocket d'une commande pilote
// On la renvoie au client robot qui exécuté sur la même machine que la Robubox.
// Il pourra ainsi faire un GET ou un POST de la commande à l'aide d'un proxy et éviter le Cross Origin 
socket.on("piloteOrder", function(data) {
    //console.log('onPiloteOrder >> command:' + data.command);
    console.log (">> socket.on('piloteOrder',...");
    if (type == "robot-appelé") {
        
        if (data.command == "onDrive") {
            // Flags homme mort
            onMove = true;
            lastMoveTimeStamp = Date.now(); // on met a jour le timestamp du dernier ordre de mouvement...
            // Envoi commande Robubox
            // robubox.sendDrive(data.enable, data.aSpeed, data.lSpeed);
            komcom.sendDrive(data);
       

        } else if (data.command == "onStop") {
            // Flags homme mort
            onMove = false;
            lastMoveTimeStamp = 0;
            // Envoi commande Robubox
            // robubox.sendDrive(data.enable, data.aSpeed, data.lSpeed);
            komcom.sendDrive(data);
        

        } else if (data.command == 'onFullStop') {
            komcom.sendStepStop() ;
        
        } else if (data.command == 'onStep') {
            komcom.sendStep(data.typeMove,data.distance,data.MaxSpeed) ;
        

        } 
        

        
        
    }
});


// Robot: Selection du système embarqué (Robubox ou KomNAV)
// pour l'exécution des commandes reçues en WebRTC et webSocket
socket.on('changeNavSystem', function(data) {
   console.log (">> socket.on('changeNavSystem',...");  
   parameters.navSys = data.navSystem;
});





