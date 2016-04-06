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
// Sources originales:
// https://developer.mozilla.org/fr/docs/Web/Guide/API/WebRTC/WebRTC_basics
// https://github.com/louisstow/WebRTC/blob/master/media.html


// ------ PHASE 1 : Pré-signaling ----------------------------------------------------------

// Récupération de la liste des devices (Version2)
// Voir: https://www.chromestatus.com/feature/4765305641369600
// MediaStreamTrack.getSources(gotSources) utilisée jusqu'a présent n'est implémentée que dans Chrome.
// La page https://developers.google.com/web/updates/2015/10/media-devices indique qu'à partir de la version 47
// sont implémentées de nouvelles méthodes crossBrowser: navigator.mediaDevices.enumerateDevices().
// Je passe donc par une méthode passerelle getAllAudioVideoDevices() qui switche entre les 2 méthodes
// selon les implémentation du navigateur.
var origin = "local"; // On prévient la fonction apellée que la source sera locale

getAllAudioVideoDevices(function(result) {
    populateListDevices(result,origin);
}, function(error) {
    if (error == null) error = "erreur getAllAudioVideoDevices()";
    alert(error);
});
/**/

// ------ PHASE 2 : Signaling --------------------------------------------------

// initialisation du localStream et appel connexion
function initLocalMedia(peerCnxId) {

    console.log("@ initLocalMedia("+peerCnxId+")");

    peerCnxCollection[peerCnxId] =new PeerConnection(server, options);
    // console.log("new peerCnxCollection["+peerCnxId+"]"); 
    // console.log(peerCnxCollection); 

    // Récupération et affectation des caméras et micros selectionnés  
    constraint = getLocalConstraint();

    
    // On renseigne le Flag d'ouverture de session webRTC
    sessionConnection = "Launched";


    // Initialisation du localStream et lancement connexion
    navigator.getUserMedia(constraint, function(stream) {

        
        // console.log(" >>>> @  navigator.getUserMedia(constraint, function(stream)");
        // console.log(stream);    

        localStream = stream;
        
        var showLocalVideo = true;
        if (type == "pilote-appelant") {
            //if (parameters.lPview != 'show') showLocalVideo = false;            
            if (parameters.piloteLocalView != 'show') showLocalVideo = false;
        } else if (type == "robot-appelé") {
            //if (parameters.lRview != 'show') showLocalVideo = false;
        	if (parameters.robotLocalView != 'show') showLocalVideo = false;
            // On prévient l'autre pair qu'il peut lui aussi ouvrir sa caméra
            socket.emit('readyForSignaling', {
	            objUser: localObjUser,
	            message: "ready"
			});
			/**/
        }
        if (showLocalVideo == true) video1.src = URL.createObjectURL(localStream);
        
        peerCnxCollection[peerCnxId].addStream(localStream);
        connect(peerCnxId);
    }, errorHandler);
};

// initialisation de la connexion
function connect(peerCnxId) {

    console.log ("@ connect()");
    debugNbConnect += 1;
    // console.log("@ connect("+peerCnxId+") n°"+debugNbConnect+"> rôle: " + type);
    isStarted = true;

    // Ecouteurs communs apellant/apellé
    // ---------------------------------

    // Ecouteurs de l'API WebRTC -----------------

    // Ecouteur déclenché à la génération d'un candidate 
    peerCnxCollection[peerCnxId].onicecandidate = function(e) {
        //console.log("@ pc["+peerCnxId+"].onicecandidate > timestamp:" + Date.now());
        // vérifie que le candidat ne soit pas nul
        if (!e.candidate) {
            // console.log("  > !e.candidate): return ");
            return;
        }
    
        var cible = ""; 
        // Si on est bien dans la peerConnection principale (Pilote <> Robot)
        if (peerCnxId == peerCnx1to1) {
            if (type === "pilote-appelant" ) cible = usersConnection.getClientBy('typeClient','Robot');
            else if ( type === "robot-appelé") cible = usersConnection.getClientBy('typeClient','Pilote');
        
        } 
        // console.log ("------------ Candidate to >>> "+cible.typeClient+"----------");
        var data = {from: localObjUser, message: e.candidate, cible: cible, peerCnxId: peerCnxId}
        // console.log (data);
        socket.emit("candidate2", data);
    
    };


    // Ecouteur déclenché a la reception d'un remoteStream
    peerCnxCollection[peerCnxId].onaddstream = function(e) {
        // console.log("@ @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
        // console.log("@ pc["+peerCnxId+"].onaddstream > timestamp:" + Date.now());
        // console.log(e);


        var showRemoteVideo = true;
        
        // Version 1to1
        remoteStream = e.stream;

        if (type == "pilote-appelant") {
            // if (parameters.rPview == 'hide') showRemoteVideo = false;
            if (parameters.piloteRemoteView == 'hide') showRemoteVideo = false;

        
        } else if (type == "robot-appelé") {
            // if (parameters.rRView == 'hide') showRemoteVideo = false;
            if (parameters.robotRemoteView == 'hide') showRemoteVideo = false;

        }
        
        // Version 1to1
		if (showRemoteVideo == true) video2.src = URL.createObjectURL(remoteStream);

    };


    // Ecouteurs de changement de statut de connexion
    // Permet de déterminer si le pair distant s'est déconnecté. (Version 1to1)
    peerCnxCollection[peerCnxId].oniceconnectionstatechange = function(e) {

        var dateE = tools.humanDateER("E");
        // console.log(">>> pc["+peerCnxId+"] stateConnection Event > " + peerCnxCollection[peerCnxId].iceConnectionState);
        var iceState = peerCnxCollection[peerCnxId].iceConnectionState
        $(chatlog).prepend(dateE + ' pc['+peerCnxId+'] stateConnection Event: ' + peerCnxCollection[peerCnxId].iceConnectionState + '\n');

        

        var message = "iceConnectionState > "+ iceState;
        var typeNotify = 'info'
        if (iceState == "connected") typeNotify = 'success';
        else if (iceState == "failed" || iceState == "disconnected") typeNotify = 'error';
        notifications.writeMessage (typeNotify,"WEBRTC Status",message ,3000)

        // Si la connexion est neuve, on remet le flag de renégo à sa position par défaut...
        if ( peerCnxCollection[peerCnxId].iceConnectionState == 'new') isRenegociate = false; 

        // Si on est dans la peerConnection principale (Pilote <> Robot)
        //if (peerCnxId == peerCnx1to1) {

            // On informe l'autre pair de son statut de connexion   
            if (type == 'pilote-appelant') {
                piloteCnxStatus = peerCnxCollection[peerCnxId].iceConnectionState;

                socket.emit("piloteCnxStatus", piloteCnxStatus);
                // Si on change de status suite à une déco du robot
                // On redéclenche l'ouverture des formulaires de connexion 
                // a la condition que le robot soit lui aussi prêt a se reconnecter... (new...)
                if (piloteCnxStatus == 'new' && robotCnxStatus == 'new') {
                    activeManageDevices(); // On active les formulaires permettant de relancer la connexion
                }


            } else if (type == 'robot-appelé') {
                robotCnxStatus = peerCnxCollection[peerCnxId].iceConnectionState;
                socket.emit("robotCnxStatus", robotCnxStatus);
            }
     
            // si le pair distant (Robot ou Pilote) est déconnecté en WebRTC,
            if (peerCnxCollection[peerCnxId].iceConnectionState == 'disconnected') {   
                
                // A tous les Visiteurs: Signal de perte de la connexion WebRTC principale (Pilote <> Robot)
                socket.emit('closeMasterConnection','disconnected')
                
                // on lance le processus préparatoire a une reconnexion
                onDisconnect(peerCnxId);
            }

        //} // endif connexion principale (Pilote <> Robot)

    };

    // Ecouteur ... Todo...
    peerCnxCollection[peerCnxId].onremovestream = function(e) {
        //console.log("@ pc["+peerCnxId+"].onremovestream(e) > timestamp:" + Date.now());
        //console.log(e);
    }

    
    // CreateOffer - Si on est l'apellant (Pilote)
    if (type === "pilote-appelant") {
        
        // Si on est dans la peerConnection principale (Pilote <> Robot)
        if (peerCnxId == peerCnx1to1) {

            
	        channel = peerCnxCollection[peerCnxId].createDataChannel("1to1_PtoR", {reliable: false});
    		var tStp = tools.humanDateER("date");

            // et on peut maintenant lancer l'écouteur d'évènement sur le datachannel
            bindEvents();

            // création et envoi de l'offre SDP
            var cible = usersConnection.getClientBy('typeClient','Robot');
            peerCnxCollection[peerCnxId].createOffer(function(sdp){
                        peerCnxCollection[peerCnxId].setLocalDescription(sdp);
                        var data = {from: localObjUser, message: sdp, cible: cible, peerCnxId: peerCnxId}
                        socket.emit("offer2", data);
                    }
                    , errorHandler, 
                    constraints // Pilote
                    // piloteConstraints
                );

        } 

    // Sinon CreateAnswer si on est l'apellé (Robot)
    } else if (type === "robot-appelé") {
        
        // Si on est dans la peerConnection principale (Pilote <> Robot)
        if (peerCnxId == peerCnx1to1) {
            var tStp1 = tools.humanDateER("date");
            // l'appelé doit attendre l'ouverture d'un dataChannel pour lancer son écouteur d'èvènement data...
            // Ecouteur d'ouverture d'un data channel
            peerCnxCollection[peerCnxId].ondatachannel = function(e) {
                //console.log("+++++++++++++++++++++++++++++++++++++")
                var tStp2 = tools.humanDateER("date");
                channel = e.channel;
                bindEvents(); //now bind the events
            };
            
        } // endif connexion principale (Pilote <> Robot)
        
    }
}



// -------------------- Méthodes RTCDataChannel ----------------------

// bind the channel events
function bindEvents() {

    console.log("@ bindEvents()");

    // écouteur d'ouverture
    channel.onopen = function() {
        //console.log("RTCDataChannel is Open");
        input_chat_WebRTC.focus();
        input_chat_WebRTC.placeholder = "RTCDataChannel is Open !";
        input_chat_WebRTC.disabled = false;
        env_msg_WebRTC.disabled = false;
        // ouverture du formulaire de selection  de canal webRTC/Websocket pour kes commandes drive
        if (type == "pilote-appelant")  setNavChannelform("open"); 

    };

    // écouteur de reception message
    channel.onmessage = function(e) {
        //var dateR = Date.now();
        var dateR = tools.humanDateER('R');
        // si c'est u message string
        if (tools.isJson(e.data) == false) {
            //$(chatlog).prepend(dateR + ' ' + e.data + "\n");
            $(chatlog).prepend('Message from ' + e.data + "\n");
            notifications.writeMessage ("info","Chat WebRTC",e.data,3000)
        }
        
        // sinon si c'est un objet Json (donc un objet de de type commande)
        else if (tools.isJson(e.data) == true || type == "robot-appelé"){
            var cmd = e.data;
            cmd = JSON.parse(cmd);
            
            // S'il existe une propriété "command" (commande via webRTC))
            if (cmd.command) {
                
                // Affiche la trace de la commande dans le chatlog webRTC
                // $(chatlog).prepend(dateR+' '+cmd.command + "\n");
                
                // Envoi de la commande à la Robubox...
                if (cmd.command == "onDrive") {
                    // Flags homme mort
                    onMove = true;
                    lastMoveTimeStamp = Date.now(); // on met a jour le timestamp du dernier ordre de mouvement...
                    // Envoi commande  
                    // robubox.sendDrive(cmd.enable, cmd.aSpeed, cmd.lSpeed);
                    komcom.sendDrive(cmd);
                }
                
                else if (cmd.command == "onStop") {
                    // Flags homme mort
                    onMove = false;
                    lastMoveTimeStamp = 0;
                    // Envoi commande    
                    //robubox.sendDrive(cmd.enable, cmd.aSpeed, cmd.lSpeed);
                    komcom.sendDrive(cmd);
                }
                
            }
        }
    };
}




// Ecouteurs Signaling de l'API websocket -----------------


// L'apellé doit attendre de recevoir une offre SDP
// avant de générer une réponse SDP
// ---------------------------------
// Ok au premier passage
// BUG a la renégo > ne déclenches plus le onAddStream... 
// FIX: réinstancier onAddStream après reinstanciation PeerConnection
// BUG a la renégo > Envoie 2 answers...
// Cause: L'écouteur de reception "offer"est instancié 2 fois...
// FIX: ajout d'un flag "isRenegociate = false;" 
socket.on("offer", function(data) {
    console.log (">> socket.on('offer',...");
    if (data.cible.id == myPeerID) {
        
    	var tStp = tools.humanDateER("R");
		//console.log ("------------ >>> offer from "+data.from.typeClient+" "+tStp);
       


        if (isRenegociate == false) {            

       

            // ------------- Version 1toN
            var offer = new SessionDescription(data.message);
            
            //console.log("- Offer From: " + data.from.pseudo +"("+data.from.id+")");
            //console.log("- Cible: " + data.cible.pseudo +"("+data.cible.id+")");
            //console.log("- peerconnection: " + data.peerCnxId);
            //console.log (offer);
            peerCnxCollection[data.peerCnxId].setRemoteDescription(offer); 
            
            // Une foi l'offre reçue et celle-ci enregistrée dans un setRemoteDescription,
            // on peu enfin générer une réponse SDP 
            var cible = usersConnection.getClientBy('id', data.from.id);
            var idPeerConnection = data.peerCnxId;

            // création de l'offre SDP
            peerCnxCollection[idPeerConnection].createAnswer(function(sdp){
                    peerCnxCollection[idPeerConnection].setLocalDescription(sdp);
                    //console.log ("------------ Answer to >>> "+cible.typeClient+"----------");
                    var data = {from: localObjUser, message: sdp, cible: cible, peerCnxId: idPeerConnection}
                    //console.log (data);
                    socket.emit("answer2", data);
                }
                , errorHandler, 
                constraints // Robot
            );
        }
    }
});



// Réception d'une réponse à une offre
socket.on("answer", function(data) {
    console.log (">> socket.on('Answer',...");
    if (data.cible.id == myPeerID) {
        var tStp = tools.humanDateER("R");
		//console.log ("------------ >>> answer from "+data.from.typeClient+" "+tStp);
        //console.log("- Answer From: " + data.from.pseudo +"("+data.from.id+")");
        //console.log("- Cible: " + data.cible.pseudo +"("+data.cible.id+")");
        //console.log("- peerconnection: " + data.peerCnxId);
        //console.log (data.message);
        peerCnxCollection[data.peerCnxId].setRemoteDescription(new SessionDescription(data.message));
    }
});

// Réception d'un ICE Candidate
socket.on("candidate", function(data) {
    console.log (">> socket.on('Candidate',...");
    if (data.cible.id == myPeerID) {
        //console.log ("------------ >>>> Candidate from "+data.from.typeClient+"----------");
        //console.log("- candidate From: " + data.from.pseudo +"("+data.from.id+")");
        //console.log("- Cible: " + data.cible.pseudo +"("+data.cible.id+")");
        //console.log("- peerconnection: " + data.peerCnxId);
        //console.log (data.message);
        // TODO : ici intercepter et filter le candidate
        // console.log (data.message);
        peerCnxCollection[data.peerCnxId].addIceCandidate(new IceCandidate(data.message)); // OK
    }
});

// Pour débugg:
video1.addEventListener("playing", function () {
    console.log ("LocalStream dimensions: " + video1.videoWidth + "x" + video1.videoHeight)
});

video2.addEventListener("playing", function () {
    console.log ("RemoteStream dimensions: " + video2.videoWidth + "x" + video2.videoHeight)
});








// ----- Phase 3 Post-Signaling --------------------------------------------


