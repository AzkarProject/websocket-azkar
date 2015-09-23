// Script inspiré de l'article suivant:
// https://developer.mozilla.org/fr/docs/Web/Guide/API/WebRTC/WebRTC_basics
// Source github : https://github.com/louisstow/WebRTC/blob/master/media.html

// Initialisation des variables, objets et paramètres du script
// NB toutes les variables sont déclarées en global...
function mainSettings_1toN() {
    console.log("@ mainSettings_1toN()");
    
    
    

    // pré-signaling -------------------------------------------------

        // webRTC -------------------------------

    // flag de connexion
    isStarted_1toN = false;
    // console.log("isStarted = "+ isStarted);

    // shims!
    PeerConnection_1toN = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
    SessionDescription_1toN = window.mozRTCSessionDescription || window.RTCSessionDescription;
    IceCandidate_1toN = window.mozRTCIceCandidate || window.RTCIceCandidate;
    navigator.getUserMedia_1toN = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;


    /*// Eléments videos du document html
    video1 = document.getElementById("video");
    video2 = document.getElementById("otherPeer");
    video3 = document.getElementById("videosVisitors");
    /**/

    if (type != "pilote-appelant") video1 = document.getElementById("1to1_localVideo"); // Sur IHM Robot, pilote, visiteur
    if (type != "pilote-appelant") video2 = document.getElementById("1to1_remoteVideo"); // Sur IHM Robot, pilote, visiteur
    


    // RTC DataChannel
    // Zone d'affichage (textarea)
    chatlog_1toN = document.getElementById("zone_chat_WebRTC");
    // Zone de saisie (input)
    message_1toN = document.getElementById("input_chat_WebRTC");

    // options pour l'objet PeerConnection
    server_1toN = {
        'iceServers': [{
            'url': 'stun:23.21.150.121'
        }]
    };
    server_1toN.iceServers.push({
        url: 'stun:stun.l.google.com:19302'
    });
    server_1toN.iceServers.push({
        url: 'stun:stun.anyfirewall.com:3478'
    });
    server_1toN.iceServers.push({
        url: 'stun:turn1.xirsys.com'
    });
    // Ajout de serveurs TURN
    server_1toN.iceServers.push({
        url: "turn:turn.bistri.com:80",
        credential: "homeo",
        username: "homeo"
    });
    server_1toN.iceServers.push({
        url: 'turn:turn.anyfirewall.com:443?transport=tcp',
        credential: 'webrtc',
        username: 'azkarproject'
    });
    server_1toN.iceServers.push({
        url: "turn:numb.viagenie.ca",
        credential: "webrtcdemo",
        username: "temp20fev2015@gmail.com"
    });
    server_1toN.iceServers.push({
        url: "turn:turn.anyfirewall.com:443?transport=tcp",
        credential: "webrtc",
        username: "webrtc"
    });
    server_1toN.iceServers.push({
        url: "turn:turn1.xirsys.com:443?transport=tcp",
        credential: "b8631283-b642-4bfc-9222-352d79e2d793",
        username: "e0f4e2b6-005f-440b-87e7-76df63421d6f"
    });
    // TODO: Tester les TURNS individuelements pour déterminer celui qui fonctionne le mieux


    // TODO:
    options_1toN = {
        optional: [{
                DtlsSrtpKeyAgreement: true
            }, {
                RtpDataChannels: true
            } //required for Firefox
        ]
    }


    // 1toN > Liste de clients de type 'Visiteurs'
    //visitorsList_1toN = {};

    // 1toN > Tableau des connexions WebRTC
    peerCnxCollection_1toN = {};
    //peerCnx1to1_1toN = "Pilote-to-Robot"; // connexion principale Pilote/Robot
    peerCnxId_1toN = "default"; // Nom par défaut

    // Création de l'objet PeerConnection (CAD la session de connexion WebRTC)
    //pc = new PeerConnection(server, options);
    // peerCnxCollection[peerCnxId] =new PeerConnection(server, options);
    // console.log(peerCnxCollection); 

    localStream_1toN = null;
    remoteStream_1toN = null; // remoteStream 1to
    remoteStreamCollection_1toN = {}; // 1toN > Tableau des remoteStreams visiteurs
    
    // Constraints de l'offre SDP. 
    constraints_1toN = {
        mandatory: {
            OfferToReceiveAudio: 1,
            OfferToReceiveVideo: 1
        }
    };

    // définition de la variable channel
    channel_1toN = null;
    debugNbConnect_1toN = 0;

    // Si une renégociation à déjas eu lieu
    // >> pour éviter de réinitialiser +sieurs fois le même écouteur
    isRenegociate_1toN = false;




    // console.log ("!!! pc["+peerCnxId+"].iceConnectionState >>>>>> " + pc["+peerCnxId+"].iceConnectionState);
}
mainSettings_1toN();

//------ PHASE 1 : Pré-signaling ----------------------------------------------------------

// rejectConnexion', message:message, url:indexUrl);
socket.on('error', errorHandler);
socket.on('rejectConnexion', function(data) {
    alertAndRedirect(data.message, data.url)
})




// ---- PHASE 2 : Signaling --------------------------------------------------

// initialisation du localStream et appel connexion
function initLocalMedia_1toN(peerCnxId) {

    console.log("@ initLocalMedia_1toN("+peerCnxId+")");

    var constraint_1toN = {
        audio: true,
        video: true
        }
    }

    peerCnxCollection[peerCnxId] =new PeerConnection(server_1toN, options_1toN);
    console.log("new peerCnxCollection["+peerCnxId+"]"); 


    // Initialisation du localStream et lancement connexion
    navigator.getUserMedia_1toN(constraint_1toN, function(stream) {

        //console.log(parameters.lRview);
        localStream_1toN = stream;
        var showLocalVideo = true;
        if (showLocalVideo == true) video1.src = URL.createObjectURL(localStream);
        
        peerCnxCollection[peerCnxId].addStream(localStream);
        connect1toN(peerCnxId);

    }, errorHandler);
};

// initialisation de la connexion
function connect1toN(peerCnxId) {

    //console.log ("@ connect()");
    debugNbConnect += 1;
    console.log("@ connect("+peerCnxId+") n°"+debugNbConnect+"> rôle: " + type);
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
        // Réinitialise l'écouteur "candidate" de la connexion courante
        // pc["+peerCnxId+"].onicecandidate = null; // Provoque un BUG sur Openshift ! 
        // >>>>>> Et si on teste sans ???
        // >>>>>> en local > OK, c'est juste plus long... 
        // >>>>>> en ligne > OK en filaire... 
        // conclusion: La réinitialisation n'a d'intéret 
        // que pour réduire les délais de signaling des tests locaux
        // -----------------------------------------
        // Envoi du candidate généré à l'autre pair
        // socket.emit("candidate", e.candidate);
    
        var cible = ""; // TODO: choisir la cible en fonction de l'ID PeerConnexion....
        // Si on est dans la peerConnection principale (Pilote <> Robot)
        if (peerCnxId == peerCnx1to1) {
            if (type === "pilote-appelant" ) cible = getClientBy('typeClient','Robot');
            else if ( type === "robot-appelé") cible = getClientBy('typeClient','Pilote');
        
        } else {
                // sinon On peux retrouver l'ID du pair distant en analysant l'ID de la connexion:
                // Le peerID de la connexion est constitué d'une concaténation
                // d'un préfixe et de l'id client du visiteur
                // Il suffit donc d'oter le préfixe pour retrouver l'id du pair distant... 
                var cibleID = peerCnxId;
                cibleID = cibleID.replace('pilote-Visiteur-', "");
                cible = getClientBy('id',cibleID); 
        }
        console.log ("------------ Candidate to >>> "+cible.typeClient+"----------");
        var data = {from: localObjUser, message: e.candidate, cible: cible, peerCnxId: peerCnxId}
        // console.log (data);
        socket.emit("candidate2", data);
    
    };


    // Ecouteur déclenché a la reception d'un remoteStream
    peerCnxCollection[peerCnxId].onaddstream = function(e) {
        console.log("@ @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
        console.log("@ pc["+peerCnxId+"].onaddstream > timestamp:" + Date.now());
        console.log(e);


        var showRemoteVideo = true;
        // Add 1toN
        var originStream = ""; 
        originStream = peerCnxId.indexOf('pilote-Visiteur-'); //Retourne -1 si faux
        if (originStream != -1) {
            // si 
            if (type == "pilote-appelant") originStream = "Visiteur";
            else originStream = "Pilote";
        }
        

        // Bug refacto 1to1 > 1toN : Le remoteStream doit rester dédié au 1to1 Pilote/Robot ou Robot/visiteur 
        // Les remoteStream en provenance des visiteurs doivent être mis dans une collection.
        // remoteStream = e.stream;
        if (originStream != "Visiteur") remoteStream = e.stream; // Uniquement si c'est le pilote ou le robot qui s'affiche
        else remoteStreamCollection[peerCnxId] = e.stream; // sinon on met le stream dans un tableau  



        if (type == "pilote-appelant") {
            if (parameters.rPview == 'hide') showRemoteVideo = false;
            // showRemoteVideo = false;

            if (originStream != "Visiteur") remoteStream = e.stream;
        
        } else if (type == "robot-appelé") {
            if (parameters.rRView == 'hide') showRemoteVideo = false;
        }
        


        if (originStream != "Visiteur" && showRemoteVideo == true) video2.src = URL.createObjectURL(remoteStream);
        
        // if (originStream == "Visiteur") addRemoteMultiVideo(remoteStreamCollection[peerCnxId]);
        if (originStream == "Visiteur") addSimpleVideo(remoteStreamCollection[peerCnxId]);   
    };


    // Ecouteurs de changement de statut de connexion
    // Permet de déterminer si le pair distant s'est déconnecté. (Version 1to1)
    peerCnxCollection[peerCnxId].oniceconnectionstatechange = function(e) {

        var dateE = tools.dateER('E');
        console.log("@ pc["+peerCnxId+"].oniceconnectionstatechange > " + dateE);

        //console.log(">>> stateConnection Event > " + peerCnxCollection[peerCnxId].iceConnectionState);
        //$(chatlog).prepend(dateE + ' [stateConnection Event] ' + peerCnxCollection[peerCnxId].iceConnectionState + '\n');

        console.log(">>> pc["+peerCnxId+"] stateConnection Event > " + peerCnxCollection[peerCnxId].iceConnectionState);
        $(chatlog).prepend(dateE + ' pc['+peerCnxId+'] stateConnection Event: ' + peerCnxCollection[peerCnxId].iceConnectionState + '\n');


        // Si la connexion est neuve, on remet le flag de renégo à sa position par défaut...
        if ( peerCnxCollection[peerCnxId].iceConnectionState == 'new') isRenegociate = false; 


        /*// si on est un Visiteur 
        if (type == 'robot-appelé') {
            // Si on est déconnecté de sa liaison principale avec le pilote
            if (...) {
               // Todo
            } else if (...) { // Si on est déconnecté de sa liaison secondaire avec le Robot
               // Todo
            }  
        }
        /**/
        


        // Si on est dans la peerConnection principale (Pilote <> Robot)
        if (peerCnxId == peerCnx1to1) {

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


                // ---- Add 1toN -------------------
                // On envoie aussi le GO broadcasté pour tout nouveau Visiteur connecté en attente de clearance
                if ( piloteCnxStatus == "connected" || piloteCnxStatus == "completed") { 
                    socket.emit('signaleClearance', {
                        from: localObjUser,
                        message: "ready"
                    }); 
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

        } // endif connexion principale (Pilote <> Robot)

    };

    // Ecouteur ... Todo...
    peerCnxCollection[peerCnxId].onremovestream = function(e) {
        console.log("@ pc["+peerCnxId+"].onremovestream(e) > timestamp:" + Date.now());
        console.log(e);
    }

    
    // Si on est l'apellant
    if (type === "pilote-appelant") {
        
        // Si on est dans la peerConnection principale (Pilote <> Robot)
        if (peerCnxId == peerCnx1to1) {

            // l'apellant crée un dataChannel
            channel = peerCnxCollection[peerCnxId].createDataChannel("mychannel", {});
            // et peut maintenant lancer l'écouteur d'évènement sur le datachannel
            bindEvents();

            // création et envoi de l'offre SDP
            var cible = getClientBy('typeClient','Robot');
            peerCnxCollection[peerCnxId].createOffer(function(sdp){
                        peerCnxCollection[peerCnxId].setLocalDescription(sdp);
                        console.log ("------------ offer >>> to "+cible.typeClient+"----------");
                        var data = {from: localObjUser, message: sdp, cible: cible, peerCnxId: peerCnxId}
                        // console.log (data);
                        socket.emit("offer2", data);
                    }
                    , errorHandler, 
                    constraints
                );

        } else {// endif connexion principale (Pilote <> Robot)
                // On peux retrouver l'ID du pair distant en analysant l'ID de la connexion:
                // Le peerID de la connexion est constitué d'une concaténation
                // d'un préfixe et de l'id client du visiteur
                // Il suffit donc d'oter le préfixe pour retrouver l'id du pair distant... 
                var cibleID = peerCnxId;
                cibleID = cibleID.replace('pilote-Visiteur-', ""); 
                // var cibleID = 'pilote-Visiteur-' peerCnxId
                // 2 On récupère l'objet Visiteur (cible)
                var cible = getClientBy('id',cibleID);
                peerCnxCollection[peerCnxId].createOffer(function(sdp){
                        peerCnxCollection[peerCnxId].setLocalDescription(sdp);
                        console.log ("------------ offer >>> to "+cible.typeClient+"----------");
                        var data = {from: localObjUser, message: sdp, cible: cible, peerCnxId: peerCnxId}
                        // console.log (data);
                        socket.emit("offer2", data);
                    }
                    , errorHandler, 
                    constraints
                );
                /**/
        }

    // Sinon si on est l'apellé (Robot)
    } else if (type === "robot-appelé") {
        
        // Si on est dans la peerConnection principale (Pilote <> Robot)
        if (peerCnxId == peerCnx1to1) {

            // l'appelé doit attendre l'ouverture d'un dataChannel pour lancer son écouteur d'èvènement data...
            // Ecouteur d'ouverture d'un data channel
            peerCnxCollection[peerCnxId].ondatachannel = function(e) {
                channel = e.channel;
                console.log("pc["+peerCnxId+"].ondatachannel(e)... ");
                bindEvents(); //now bind the events
            };
        } // endif connexion principale (Pilote <> Robot)

    }
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
    
    if (data.cible.id == myPeerID) {
        console.log ("------------ >>> offer from "+data.from.typeClient+"----------");
        console.log ("isRenegociate:"+isRenegociate);
        if (isRenegociate == false) {            

            //console.log("(apellé)>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
            //peerCnxCollection[peerCnxId].setRemoteDescription(new SessionDescription(data.message));
            //peerCnxCollection[peerCnxId].createAnswer(doAnswer, errorHandler, constraints);           

            // ------------- Version 1toN
            var offer = new SessionDescription(data.message);
            
            //console.log("- Offer From: " + data.from.pseudo +"("+data.from.id+")");
            //console.log("- Cible: " + data.cible.pseudo +"("+data.cible.id+")");
            //console.log("- peerconnection: " + data.peerCnxId);
            //console.log (offer);
            peerCnxCollection[data.peerCnxId].setRemoteDescription(offer); 
            
            // Une foi l'offre reçue et celle-ci enregistrée dans un setRemoteDescription,
            // on peu enfin générer une réponse SDP 
            var cible = getClientBy('id', data.from.id);
            var idPeerConnection = data.peerCnxId;

            // création de l'offre SDP
            peerCnxCollection[idPeerConnection].createAnswer(function(sdp){
                    peerCnxCollection[idPeerConnection].setLocalDescription(sdp);
                    console.log ("------------ Answer to >>> "+cible.typeClient+"----------");
                    var data = {from: localObjUser, message: sdp, cible: cible, peerCnxId: idPeerConnection}
                    //console.log (data);
                    socket.emit("answer2", data);
                }
                , errorHandler, 
                constraints
            );
        }
    }
});
/**/


// Réception d'une réponse à une offre
socket.on("answer", function(data) {
    if (data.cible.id == myPeerID) {
        console.log ("------------ >>> answer from "+data.from.typeClient+"----------");
        //console.log("- Answer From: " + data.from.pseudo +"("+data.from.id+")");
        //console.log("- Cible: " + data.cible.pseudo +"("+data.cible.id+")");
        //console.log("- peerconnection: " + data.peerCnxId);
        //console.log (data.message);
        peerCnxCollection[data.peerCnxId].setRemoteDescription(new SessionDescription(data.message));
    }
});

// Réception d'un ICE Candidate
socket.on("candidate", function(data) {
    if (data.cible.id == myPeerID) {
        console.log ("------------ >>>> Candidate from "+data.from.typeClient+"----------");
        //console.log("- candidate From: " + data.from.pseudo +"("+data.from.id+")");
        //console.log("- Cible: " + data.cible.pseudo +"("+data.cible.id+")");
        //console.log("- peerconnection: " + data.peerCnxId);
        //console.log (data.message);
        // TODO : ici intercepter et filter le candidate
        peerCnxCollection[data.peerCnxId].addIceCandidate(new IceCandidate(data.message)); // OK
    }
});


// ----- Phase 3 Post-Signaling --------------------------------------------

// A la déconnection du pair distant:
function onDisconnect(peerCnxId) {

    console.log("@ onDisconnect()");

    // On vérifie le flag de connexion
    if (isStarted == false) return;

    // on retire le flux remoteStream
    video1.src = "";
    video2.src = "";

    //videoElement.src = null;
    //window.stream.stop();

    // on coupe le RTC Data channel
    if (channel) channel.close();
    channel = null;

    // On vide et on ferme la connexion courante
    // pc["+peerCnxId+"].onicecandidate = null;
    //pc["+peerCnxId+"].close();
    //pc = null;

    peerCnxCollection[peerCnxId].close();
    peerCnxCollection[peerCnxId] = null;
    stopAndStart(peerCnxId);
}

// Fermeture et relance de la connexion p2p par l'apellé (Robot)
function stopAndStart(peerCnxId) {

    console.log("@ stopAndStart()");
    input_chat_WebRTC.disabled = true;
    input_chat_WebRTC.placeholder = "RTCDataChannel close";
    env_msg_WebRTC.disabled = true;

    peerCnxCollection[peerCnxId] = new PeerConnection(server, options);

    // console.log("------pc = new PeerConnection(server, options);-----");

    // On informe la machine à état que c'est une renégociation
    isRenegociate = true;
};

// -------------------- Méthodes RTCDataChannel ----------------------

// bind the channel events
function bindEvents() {

    // écouteur d'ouverture
    channel.onopen = function() {
        //console.log("RTCDataChannel is Open");
        input_chat_WebRTC.focus();
        input_chat_WebRTC.placeholder = "RTCDataChannel is Open !";
        input_chat_WebRTC.disabled = false;
        env_msg_WebRTC.disabled = false;
        //isStarted = true;
        //console.log("isStarted = "+ isStarted);
    };

    // écouteur de reception message
    channel.onmessage = function(e) {
        // add the message to the chat log
        //var dateR = tools.dateER('R');
        var dateR = Date.now();
        //console.log("@ channel.onmessage");
        // si c'est u message string
        if (tools.isJson(e.data) == false) {
            $(chatlog).prepend(dateR + ' ' + e.data + "\n");
        }
        // sinon si c'est un objet Json
        else if (tools.isJson(e.data) == true || type == "robot-appelé"){
            var cmd = e.data;
            cmd = JSON.parse(cmd);
            if (cmd.command) {
                var delta = dateR-cmd.dateE;
                //$(chatlog).prepend(cmd.dateE +' ' +dateR + ' ' + cmd.command + "\n");
                $(chatlog).prepend('[ ' +delta+' ms ] ' + cmd.command + "\n");
                //if (type == "robot-appelé") {
                    if (cmd.command == "onDrive") robubox.sendDrive(cmd.enable, cmd.aSpeed, cmd.lSpeed);
                    else if (cmd.command == "onStop") robubox.sendDrive(cmd.enable, cmd.aSpeed, cmd.lSpeed);
                    // ...
                //}
            }
        }
        /**/
    };
}

// envoi message par WebRTC
function sendMessage() {
    var dateE = tools.dateER('E');
    var msgToSend = dateE + ' [' + localObjUser.typeClient + '] ' + message.value;
    channel.send(msgToSend);
    message.value = "";
    // Affiche le message dans le chatlog websocket
    $(chatlog).prepend(msgToSend + "\n");
}

// envoi commande par WebRTC
function sendCommand(commandToSend) {
    //var dateE = tools.dateER('E');
    var dateE = Date.now()
    commandToSend.dateE = dateE;
    //tools.traceObjectDump(commandToSend,'commandToSend');
     $(chatlog).prepend(dateE + " "+commandToSend.command + "\n");
    commandToSend = JSON.stringify(commandToSend);
    //console.log('toto');
    channel.send(commandToSend);
    
}


// Bouton d'envoi du formulaire de chat WebRTC
$('#formulaire_chat_webRTC').submit(function() {
    var message = $('#send_chat_WebRTC').val() + '\n';
    channel.send(msg);
    message.value = "";
    $('#send_chat_WebRTC').val('').focus(); // Vide la zone de Chat et remet le focus dessus
    return false; // Permet de bloquer l'envoi "classique" du formulaire
});

// --------------------- Gestion des commandes du robot -------------------

// fonction homme mort...
if (type == "robot-appelé") {
    function deathMan(){
        if (onMove == true || lastMoveTimeStamp != 0) {
            var now = Date.now();
            var test = now - lastMoveTimeStamp;
            if (test >= 1000 ) {
               sendCommandDriveInterface('onStop',false,0,0) 
            }
        
        }
        setTimeout(deathMan,1000); /* rappel après 100 millisecondes */
    }
    deathMan();
}


function sendCommandDriveInterface(command,enable,aSpeed,lSpeed) {
        // onMove = false; // Flag > Si un mouvement est en cours
        // lastMoveTimeStamp =  Date.now(); // on met a jour le timestamp du dernier ordre de mouvement...
        if (command == "onDrive") {
            onMove = true;
            lastMoveTimeStamp = Date.now(); // on met a jour le timestamp du dernier ordre de mouvement...
            robubox.sendDrive(enable, aSpeed, lSpeed); // Et on envoie le mouvement
        }
        if (command == "onStop") {
            onMove = false;
            lastMoveTimeStamp = 0;
            robubox.sendDrive(enable, aSpeed, lSpeed); // Et on envoie le mouvement
        };
        /*
        if (command == "onStep") {};
        if (command == "onGoto") {};
        if (command == "onClicAndGo") {};
        /**/
}

// Reception d'une commande pilote
// On la renvoie au client robot qui exécuté sur la même machine que la Robubox.
// Il pourra ainsi faire un GET ou un POST de la commande à l'aide d'un proxy et éviter le Cross Origin 
socket.on("piloteOrder", function(data) {
    console.log('@onPiloteOrder >> command:' + data.command);
    if (type == "robot-appelé") {
        
        //if (data.command == "onDrive" && data.command == "onStop") sendCommandDriveInterface(data.command,data.enable, data.aSpeed, data.lSpeed);
        /*
        if (data.command == "onStop") {};
        if (data.command == "onStep") {};
        if (data.command == "onGoto") {};
        if (data.command == "onClicAndGo") {};
        /**/
        sendCommandDriveInterface(data.command,data.enable, data.aSpeed, data.lSpeed);
    }
});

// --------------------- Gestion des messages d'erreur ------------------

function errorHandler(err) {
    console.log("ON-ERROR");
    console.error(err);
}

function alertAndRedirect(message, url) {
    //alert (message);
    window.alert(message)
    window.location.href = url;
}


// ------ fonctions diverses ---------------


function getClientBy(key,value) {
    for (i in users.listUsers) {
        if (users.listUsers[i][key] == value) {
                return users.listUsers[i];
                break;
        }
    }
};


// ------------   multiview Michel

if (type == "pilote-appelant") {

    var buttonAdd, buttonChangePos, videoSection;
    var nbVideos = 0;
    var width, height;
    var tabVideos = [];

    /*
    window.onload = function(evt) {
      
      videoSection = document.querySelector("#videos");
      
      //buttonAdd = document.querySelector("#addVideoButton");
      //buttonAdd.addEventListener("click", addVideo);
      
      buttonAdd = document.querySelector("#removeVideoButton");
      buttonAdd.addEventListener("click", removeVideoCallback);
      buttonAdd = document.querySelector("#layout2videos");
      buttonAdd.addEventListener("click", setLayoutForTwoVideos);
      
      
      var rect = videoSection.getBoundingClientRect();
      
      videoSection.style.height="340px";
      
      width= rect.width;
      height = rect.height;
      
      window.onresize = function() {
        setLayoutForTwoVideos();
      };
    };
    /**/


    
    function addSimpleVideo(remoteStream) {  
        console.log("Add video Visiteur");
        video3.src = URL.createObjectURL(remoteStream);
    }

    function addRemoteMultiVideo(remoteStream) {  
      
        // create a video element  
        var v = document.createElement("video");
        var largeurVideo=150;
        var hauteurVideo=150;
         
        var xVideo = Math.round((width-largeurVideo)/2);
        var yVideo = Math.round((height+hauteurVideo)/2);

        v.style.width=largeurVideo + "px";
        v.style.height=hauteurVideo + "px";

        v.style.left=xVideo + "px";
        //v.style.top=yVideo + "px";

        v.id = 'vid'+ tabVideos.length;
        v.setAttribute("controls", "true");
        //v.innerHTML="<source src='http://html5doctor.com/demos/video-canvas-magic/video.webm' type='video/webm'/>";
        v.src = URL.createObjectURL(remoteStream);
          
        tabVideos.push(v);
        videoSection.appendChild(v);
        indexVideo = tabVideos.length-1;
        console.log("Add video Visiteur - on ajoute la video id=" + indexVideo);
        setLayoutForTwoVideos();
    }

    function removeVideoCallback(evt) {
      removeVideo();
    }

    /*
    function addVideo() {  
      
      // create a video element  
      var v = document.createElement("video");
      var largeurVideo=150;
      var hauteurVideo=150;
      
      var xVideo = Math.round((width-largeurVideo)/2);
      var yVideo = Math.round((height+hauteurVideo)/2);

      v.style.width=largeurVideo + "px";
      v.style.height=hauteurVideo + "px";

      v.style.left=xVideo + "px";
      //v.style.top=yVideo + "px";

      v.id = 'vid'+ tabVideos.length;
      v.setAttribute("controls", "true");
      //v.innerHTML="<source src='http://html5doctor.com/demos/video-canvas-magic/video.webm' type='video/webm'/>";
      v.src="http://html5doctor.com/demos/video-canvas-magic/video.webm";
      tabVideos.push(v);

      videoSection.appendChild(v);
      setLayoutForTwoVideos();
    }
    /**/

    function removeVideoCallback(evt) {
      removeVideo();
    }

    function removeVideo(indexVideo) {
      if(! indexVideo) indexVideo = tabVideos.length-1;
      
      console.log("on supprime video id=" + indexVideo);
      
      // On supprime du tableau
      tabVideos.splice(indexVideo, 1);
      
      // Et du DOM
      var id = "vid"+indexVideo;
      //console.log("removing #"+id);
      
      var v = document.querySelector("#"+id);
      //console.log(v);
      videoSection.removeChild(v);
      
      // et on repositionne les videos restantes
      setLayoutForTwoVideos();
    }


    function setLayoutForTwoVideos() {
      var nbVideos = tabVideos.length;
      var nbHorizontalMargins = nbVideos+1;
        
      var rect = videoSection.getBoundingClientRect();
        
      width= rect.width;
      height = rect.height;
      
      // width and height = size of the container
      // 5% pour chaque marge horizontale, pour deux vidéos il y en a 3
      var horizontalPercentageForMargin = 0.05;
      var horizontalMargin = width*horizontalPercentageForMargin;
      
      // Percentage of total width for the sum of video width
      var percentageWidthForVideos = 1 - horizontalPercentageForMargin;
      var percentageHeightForVideos = 0.9;
      
      // size of each video
      var videoWidth = (width - (nbHorizontalMargins * horizontalMargin))  / nbVideos;
      var videoHeight = height * percentageHeightForVideos;
     
      
      var x= rect.left, y, oldx=0;
      
      for(var i=0; i < nbVideos; i++) {
        var v = tabVideos[i];
        
        x += horizontalMargin;
        y = height - rect.top - videoHeight;
        
        v.style.width=videoWidth + "px";
        v.style.height=videoHeight + "px";

        v.style.left = x + "px";
        //v.style.top  = y + "px";
      
        x+=videoWidth;
      }
    }

    function changePos(id, x, y, width, height) {
        v = document.querySelector("#"+id);
        v.style.width=width+"px";
        v.style.height=height+"px";
        v.style.left=x+"px";
        v.style.y="px";
    }
   
}



/**/