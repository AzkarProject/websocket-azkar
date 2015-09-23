// Script inspiré de l'article suivant:
// https://developer.mozilla.org/fr/docs/Web/Guide/API/WebRTC/WebRTC_basics
// Source github : https://github.com/louisstow/WebRTC/blob/master/media.html

// Initialisation des variables, objets et paramètres du script
// NB toutes les variables sont déclarées en global...
function mainSettings_1toN_VtoP() {
    console.log("@ mainSettings()");
    

    

    // pré-signaling -------------------------------------------------

    // webRTC -------------------------------

    // flag de connexion
    isStarted_1toN_VtoP = false;
    // console.log("isStarted = "+ isStarted);

    // shims!
    PeerConnection_1toN_VtoP = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
    SessionDescription_1toN_VtoP = window.mozRTCSessionDescription || window.RTCSessionDescription;
    IceCandidate_1toN_VtoP = window.mozRTCIceCandidate || window.RTCIceCandidate;
    navigator.getUserMedia_1toN_VtoP = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;


    video1_1toN_VtoP = document.getElementById("1to1_localVideo"); // Sur IHM Robot, pilote, visiteur
    video2_1toN_VtoP = document.getElementById("1to1_remoteVideo"); // Sur IHM Robot, pilote, visiteur
    if (type == "pilote-appelant") {
    videoVisitor1 = document.getElementById("1toN_remoteVideos"); // Vue des visiteurs sur IHM Pilote
	videoVisitor2 = document.getElementById("1toN_remoteVideos2"); // Vue des visiteurs sur IHM Pilote
	videoVisitor3 = document.getElementById("1toN_remoteVideos3"); // Vue des visiteurs sur IHM Pilote
	videoVisitor4 = document.getElementById("1toN_remoteVideos4"); // Vue des visiteurs sur IHM Pilote
	videoVisitor5 = document.getElementById("1toN_remoteVideos3"); // Vue des visiteurs sur IHM Pilote
	videoVisitor6 = document.getElementById("1toN_remoteVideos4"); // Vue des visiteurs sur IHM Pilote

    //video3 = document.getElementById("1toN_remoteVideos"); // Vue des visiteurs sur IHM Pilote
    //video4 = document.getElementById("1toN_remoteVideoRobot"); // Vue du Robot sur IHM Visiteur
    }

    // RTC DataChannel
    // Zone d'affichage (textarea)
    // chatlog = document.getElementById("zone_chat_WebRTC");
    // Zone de saisie (input)
    // message = document.getElementById("input_chat_WebRTC");

    // options pour l'objet PeerConnection
    server_1toN_VtoP = {
        'iceServers': [{
            'url': 'stun:23.21.150.121'
        }]
    };
    server_1toN_VtoP.iceServers.push({
        url: 'stun:stun.l.google.com:19302'
    });
    server_1toN_VtoP.iceServers.push({
        url: 'stun:stun.anyfirewall.com:3478'
    });
    server_1toN_VtoP.iceServers.push({
        url: 'stun:turn1.xirsys.com'
    });
    // Ajout de serveurs TURN
    server_1toN_VtoP.iceServers.push({
        url: "turn:turn.bistri.com:80",
        credential: "homeo",
        username: "homeo"
    });
    server_1toN_VtoP.iceServers.push({
        url: 'turn:turn.anyfirewall.com:443?transport=tcp',
        credential: 'webrtc',
        username: 'azkarproject'
    });
    server_1toN_VtoP.iceServers.push({
        url: "turn:numb.viagenie.ca",
        credential: "webrtcdemo",
        username: "temp20fev2015@gmail.com"
    });
    server_1toN_VtoP.iceServers.push({
        url: "turn:turn.anyfirewall.com:443?transport=tcp",
        credential: "webrtc",
        username: "webrtc"
    });
    server_1toN_VtoP.iceServers.push({
        url: "turn:turn1.xirsys.com:443?transport=tcp",
        credential: "b8631283-b642-4bfc-9222-352d79e2d793",
        username: "e0f4e2b6-005f-440b-87e7-76df63421d6f"
    });
    /**/// 


    // TODO:
    options_1toN_VtoP = {
        optional: [{
                DtlsSrtpKeyAgreement: true
            }, {
                RtpDataChannels: true
            } //required for Firefox
        ]
    }


    // 1toN > Tableau des connexions WebRTC
    peerCnxCollection_1toN_VtoP = {};
    prefix_peerCnx_1toN_VtoP = "Pilote-to-Visiteur-"; // connexion principale Pilote/Robot
    peerCnxId_1toN_VtoP = "default"; // Nom par défaut

    // Création de l'objet PeerConnection (CAD la session de connexion WebRTC)
    // pc = new PeerConnection(server, options);
    // peerCnxCollection_1toN_VtoP[peerCnxId] =new PeerConnection(server, options);
    // console.log(peerCnxCollection); 

    localStream_1toN_VtoP = null;
    remoteStream_1toN_VtoP = null; // remoteStream 1to
    remoteStreamCollection_1toN_VtoP = {}; // 1toN > Tableau des remoteStreams visiteurs
    
    // Constraints de l'offre SDP. 
    constraints_1toN_VtoP = {
        mandatory: {
            OfferToReceiveAudio: true,
            OfferToReceiveVideo: true
        }
    };

    // définition de la variable channel
    //channel = null;
    //debugNbConnect = 0;
    debugNbConnect_1toN_VtoP = 0;
    // Si une renégociation à déja eu lieu
    // >> pour éviter de réinitialiser +sieurs fois le même écouteur
    isRenegociate_1toN_VtoP = false;
}
mainSettings_1toN_VtoP();

// Ecouteurs message d'erreur et contrôle d'accès
// if (type == "visiteur-appelé") pour éviter 
// double instanciation coté pilote & Robot
if (type == "visiteur-appelé") {
	socket.on('error', errorHandler_1toN_VtoP);
	socket.on('rejectConnexion', function(data) {
	    alertAndRedirect_1toN_VtoP(data.message, data.url)
	})
}


//------ PHASE 1 : Pré-signaling ----------------------------------------------------------



// Quand on reçoit un update de la liste des clients websockets 
// C.A.D à chaque nouveln arrivant... 
if (type == "visiteur-appelé") {
	socket.on('updateUsers', function(data) {
	    console.log(">> socket.on('updateUsers',...");
	    // On met à jour la liste locale des connectés...
	    oldUsers = users;
	    users = data;

	})
}


// (Visiteur) à la reception de la demande de connexion du pilote
// >>> socket.emit("isVisitorReady", data)... on lance aussi l'initlocalmedia
// Et on prévient le pilote qui fera de même...
if (type == "visiteur-appelé") {
	socket.on("requestConnect", function(data) {
		// Si on est la bonne cible...
		if (data.cible.id === myPeerID ) {
			// mémo: data = {from: localObjUser, cible: cible}
			console.log(">> socket.on('requestConnect',...");
			var peerID = prefix_peerCnx_1toN_VtoP+myPeerID; // On fabrique l'ID de la connexion
			initLocalMedia_1toN_VtoP(peerID); // Et on l'ance l'initlocalmedia avec sa nouvelle id de connexion
		}
		var data = {from: localObjUser, cible: data.from}
    	socket.emit("readyForSignaling_1toN_VtoP", data);
	})
}

// (Pilote) à la reception du signal de fin pré-signaling du visiteur
// Le pilote lance son initLocalMedia 
if (type == "pilote-appelant") {
	socket.on("readyForSignaling_1toN_VtoP", function(data) {
	    console.log(">> socket.on('readyForSignaling_1toN_VtoP',...");
    	// Si on est la bonne cible
		if (data.cible.id === myPeerID ) {
	        // mémo: data = {from: localObjUser, cible: cible}
	        var cibleID = data.from.id; // On récupère l'Id du visiteur
            var peerID = prefix_peerCnx_1toN_VtoP+cibleID; // On la concatène avec le préfixe 
			initLocalMedia_1toN_VtoP(peerID); // Et on l'ance l'initlocalmedia avec sa nouvelle id de connexion
		}
	})
 }




// ---- PHASE 2 : Signaling --------------------------------------------------

// initialisation du localStream et initialisation connexion
function initLocalMedia_1toN_VtoP(peerCnxId) {

    console.log("@ initLocalMedia_1toN_VtoP("+peerCnxId+")");
    var videoConstraint_1toN_VtoP = {
        audio: true,
        video: true
    }
    peerCnxCollection_1toN_VtoP[peerCnxId] =new PeerConnection_1toN_VtoP(server_1toN_VtoP, options_1toN_VtoP);
    console.log("new peerCnxCollection_1toN_VtoP["+peerCnxId+"]"); 
    console.log(peerCnxCollection_1toN_VtoP); 

   
    /*// ----- mémo -------
    localStream_1toN_VtoP = null;
    remoteStream_1toN_VtoP = null; // remoteStream 1to
    remoteStreamCollection_1toN_VtoP = {}; // 1toN > Tableau des remoteStreams visiteurs
    /**/
    
    // Initialisation du localStream et lancement connexion
    navigator.getUserMedia_1toN_VtoP(videoConstraint_1toN_VtoP, function(stream) {

        localStream_1toN_VtoP = stream;
        
        // Le pilote n'as pas besoin d'afficher 2 fois son image....
        if (type == "visiteur-appelé") video1_1toN_VtoP.src = URL.createObjectURL( localStream_1toN_VtoP);
        else if (type == "pilote-appelant") {
        	// On vérifie que la connexion avec le robot n'est pas en route...
        	if (piloteCnxStatus == "new") video1.src = URL.createObjectURL( localStream_1toN_VtoP);
        }
        
        peerCnxCollection_1toN_VtoP[peerCnxId].addStream( localStream_1toN_VtoP);
        connect_1toN_VtoP(peerCnxId);

    }, errorHandler_1toN_VtoP);
};

// connexion
function connect_1toN_VtoP(peerCnxId) {

    //console.log ("@ connect()");
    debugNbConnect_1toN_VtoP += 1;
    console.log("@ connect_1toN_VtoP("+peerCnxId+") n°"+debugNbConnect_1toN_VtoP+"> rôle: " + type);
    isStarted_1toN_VtoP = true;

    // Ecouteurs communs apellant/apellé
    // ---------------------------------

    // Ecouteurs de l'API WebRTC -----------------

    // Ecouteur déclenché à la génération d'un candidate 
    peerCnxCollection_1toN_VtoP[peerCnxId].onicecandidate = function(e) {
        //console.log("@ pc["+peerCnxId+"].onicecandidate_1toN_VtoP > timestamp:" + Date.now());
        // vérifie que le candidat ne soit pas nul
        if (!e.candidate) {
            // console.log("  > !e.candidate): return ");
            return;
        }
        
        var cible = ""; // TODO: choisir la cible en fonction de l'ID PeerConnexion....
        if (type == "visiteur-appelé") cible = getClientBy_1toN_VtoP('typeClient','Pilote'); // Si c'est le Visiteur > client = pilote
        else { // Sinon si c'est le Pilote >> Client visiteur
        	    // On peux retrouver l'ID du pair distant en analysant l'ID de la connexion:
                // Le peerID de la connexion est constitué d'une concaténation
                // d'un préfixe et de l'id client du visiteur
                // Il suffit donc d'oter le préfixe pour retrouver l'id du pair distant... 
                /*// ----------
                var cibleID = peerCnxId;
                cibleID = cibleID.replace(prefix_peerCnx_1toN_VtoP, "");
                cible = getClientBy('id',cibleID); 
                /**///-----------
                var cible = getCibleFromPeerConnectionID_1toN_VtoP(peerCnxId, prefix_peerCnx_1toN_VtoP);

        } 
       
        console.log ("------------ _1toN_VtoP Candidate to >>> "+cible.typeClient+"----------");
        var data = {from: localObjUser, message: e.candidate, cible: cible, peerCnxId: peerCnxId}
        // console.log (data.message);
        socket.emit("candidate2", data);
        /**/
    
    };


    // Ecouteur déclenché a la reception d'un remoteStream
    peerCnxCollection_1toN_VtoP[peerCnxId].onaddstream = function(e) {
        console.log("@ @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@_1toN_VtoP");
        console.log("@ pc["+peerCnxId+"].onaddstream_1toN_VtoP");
        console.log(e);


        // var showRemoteVideo = true;
        
        // Version 1to1
        remoteStream_1toN_VtoP = e.stream;

        if (type == "visiteur-appelé") {
            // if (parameters.rRView == 'hide') showRemoteVideo = false;
            video2_1toN_VtoP.src = URL.createObjectURL(remoteStream_1toN_VtoP);
        } else if (type == "pilote-appelant") {
			videoVisitor1.src = URL.createObjectURL(remoteStream_1toN_VtoP);
        }
        

    };


    // Ecouteurs de changement de statut de connexion
    // Permet de déterminer si le pair distant s'est déconnecté. (Version 1to1)
    peerCnxCollection_1toN_VtoP[peerCnxId].oniceconnectionstatechange = function(e) {

        var dateE = tools.dateER('E');
        console.log("@ pc["+peerCnxId+"].oniceconnectionstatechange_1toN_VtoP > " + dateE);

        //console.log(">>> stateConnection Event > " + peerCnxCollection_1toN_VtoP[peerCnxId].iceConnectionState);
        //$(chatlog).prepend(dateE + ' [stateConnection Event] ' + peerCnxCollection_1toN_VtoP[peerCnxId].iceConnectionState + '\n');

        console.log(">>> pc["+peerCnxId+"] stateConnection Event > " + peerCnxCollection_1toN_VtoP[peerCnxId].iceConnectionState);
        //$(chatlog).prepend(dateE + ' pc['+peerCnxId+'] stateConnection Event: ' + peerCnxCollection_1toN_VtoP[peerCnxId].iceConnectionState + '\n');


        // Si la connexion est neuve, on remet le flag de renégo à sa position par défaut...
        if ( peerCnxCollection_1toN_VtoP[peerCnxId].iceConnectionState == 'new') isRenegociate_1toN_VtoP = false; 





            // On informe l'autre pair de son statut de connexion   
            if (type == 'pilote-appelant') {
                piloteCnxStatus = peerCnxCollection_1toN_VtoP[peerCnxId].iceConnectionState;

                socket.emit("piloteCnxStatus", piloteCnxStatus);
                // Si on change de status suite à une déco du robot
                // On redéclenche l'ouverture des formulaires de connexion 
                // a la condition que le robot soit lui aussi prêt a se reconnecter... (new...)
                if (piloteCnxStatus == 'new' && robotCnxStatus == 'new') {
                    activeManageDevices(); // On active les formulaires permettant de relancer la connexion
                }


                // ---- Add 1toN -------------------
                /*// On envoie aussi le GO broadcasté pour tout nouveau Visiteur connecté en attente de clearance
                if ( piloteCnxStatus == "connected" || piloteCnxStatus == "completed") { 
                    socket.emit('signaleClearance', {
                        from: localObjUser,
                        message: "ready"
                    }); 
                } */


            } else if (type == 'visiteur-appelé') {
                //robotCnxStatus = peerCnxCollection_1toN_VtoP[peerCnxId].iceConnectionState;
                //socket.emit("robotCnxStatus", robotCnxStatus);
            }
     
            // si le pair distant  est déconnecté en WebRTC,
            if (peerCnxCollection_1toN_VtoP[peerCnxId].iceConnectionState == 'disconnected') {   
                
                // A tous les Visiteurs: Signal de perte de la connexion WebRTC principale (Pilote <> Robot)
                // socket.emit('closeMasterConnection','disconnected')
                
                // on lance le processus préparatoire a une reconnexion
                // onDisconnect(peerCnxId);
            }



    };

    // Ecouteur ... Todo...
    peerCnxCollection_1toN_VtoP[peerCnxId].onremovestream = function(e) {
        console.log("@ pc["+peerCnxId+"].onremovestream(e) _1toN_VtoP> timestamp:" + Date.now());
        console.log(e);
    }

    
    // Si on est l'apellant
    if (type === "pilote-appelant") {
        


            // l'apellant crée un dataChannel
            // channel = peerCnxCollection_1toN_VtoP[peerCnxId].createDataChannel("mychannel", {});
            // et peut maintenant lancer l'écouteur d'évènement sur le datachannel
            // bindEvents();

            // création et envoi de l'offre SDP
            
            // On peux retrouver l'ID du pair distant en analysant l'ID de la connexion:
			// Le peerID de la connexion est constitué d'une concaténation
			// d'un préfixe et de l'id client du visiteur
			// Il suffit donc d'oter le préfixe pour retrouver l'id du pair distant...
			var cible = getCibleFromPeerConnectionID_1toN_VtoP(peerCnxId, prefix_peerCnx_1toN_VtoP);



            peerCnxCollection_1toN_VtoP[peerCnxId].createOffer(function(sdp){
                        peerCnxCollection_1toN_VtoP[peerCnxId].setLocalDescription(sdp);
                        console.log ("------------ _1toN_VtoP offer >>> to "+cible.typeClient+"----------");
                        var data = {from: localObjUser, message: sdp, cible: cible, peerCnxId: peerCnxId}
                        // console.log (data);
                        socket.emit("offer2", data);
                    }
                    , errorHandler_1toN_VtoP, 
                    constraints_1toN_VtoP
                );


    // Sinon si on est l'apellé (visiteur)
    } else if (type === "visiteur-appelé") {
        


            // l'appelé doit attendre l'ouverture d'un dataChannel pour lancer son écouteur d'èvènement data...
            // Ecouteur d'ouverture d'un data channel
            peerCnxCollection_1toN_VtoP[peerCnxId].ondatachannel = function(e) {
                //channel = e.channel;
                console.log("pc["+peerCnxId+"].ondatachannel(e) _1toN_VtoP ... ");
                //bindEvents(); //now bind the events
            };


    }
}


// Ecouteurs Signaling de l'API websocket (Offer, Answer et Candidate) -----
// if (type == "visiteur-appelé") pour éviter 
// double instanciation coté pilote & Robot
if (type == "visiteur-appelé") {
	
	socket.on("offer", function(data) {
	    
	    if (data.cible.id == myPeerID) {
	        console.log(data);
	        console.log ("------------ >>> _1toN_VtoP offer from "+data.from.typeClient+"----------");
	        console.log ("isRenegociate_1toN_VtoP:"+isRenegociate_1toN_VtoP);
	        if (isRenegociate_1toN_VtoP == false) {            

	            //console.log("(apellé)>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
	            //peerCnxCollection_1toN_VtoP[peerCnxId].setRemoteDescription(new SessionDescription(data.message));
	            //peerCnxCollection_1toN_VtoP[peerCnxId].createAnswer(doAnswer, errorHandler, constraints);           

	            // ------------- Version 1toN
	            var offer = new SessionDescription_1toN_VtoP(data.message);
	            
	            //console.log("- Offer From: " + data.from.pseudo +"("+data.from.id+")");
	            //console.log("- Cible: " + data.cible.pseudo +"("+data.cible.id+")");
	            //console.log("- peerconnection: " + data.peerCnxId);
	            //console.log (offer);
	            peerCnxCollection_1toN_VtoP[data.peerCnxId].setRemoteDescription(offer); 
	            
	            // Une foi l'offre reçue et celle-ci enregistrée dans un setRemoteDescription,
	            // on peu enfin générer une réponse SDP 
	            var cible = getClientBy_1toN_VtoP('id', data.from.id);
	            var idPeerConnection = data.peerCnxId;

	            console.log (cible);

	            // création de l'offre SDP
	            peerCnxCollection_1toN_VtoP[idPeerConnection].createAnswer(function(sdp){
	                    peerCnxCollection_1toN_VtoP[idPeerConnection].setLocalDescription(sdp);
	                    console.log ("------------ _1toN_VtoP Answer to >>> "+cible.typeClient+"----------");
	                    var data = {from: localObjUser, message: sdp, cible: cible, peerCnxId: idPeerConnection}
	                    //console.log (data);
	                    socket.emit("answer2", data);
	                }
	                , errorHandler_1toN_VtoP, 
	                constraints_1toN_VtoP
	            );
	        }
	    }
	});
	/**/

	// Réception d'une réponse à une offre
	socket.on("answer", function(data) {
	    if (data.cible.id == myPeerID) {
	        console.log ("------------ >>> _1toN_VtoP answer from "+data.from.typeClient+"----------");
	        //console.log("- Answer From: " + data.from.pseudo +"("+data.from.id+")");
	        //console.log("- Cible: " + data.cible.pseudo +"("+data.cible.id+")");
	        //console.log("- peerconnection: " + data.peerCnxId);
	        //console.log (data.message);
	        peerCnxCollection_1toN_VtoP[data.peerCnxId].setRemoteDescription(new SessionDescription_1toN_VtoP(data.message));
	    }
	});

	// Réception d'un ICE Candidate
	socket.on("candidate", function(data) {
	    if (data.cible.id == myPeerID) {
	        console.log ("------------ >>>> _1toN_VtoP Candidate from "+data.from.typeClient+"----------");
	        //console.log("- candidate From: " + data.from.pseudo +"("+data.from.id+")");
	        //console.log("- Cible: " + data.cible.pseudo +"("+data.cible.id+")");
	        //console.log("- peerconnection: " + data.peerCnxId);
	        // console.log (data.message);
	        // TODO : ici intercepter et filter le candidate
	        peerCnxCollection_1toN_VtoP[data.peerCnxId].addIceCandidate(new IceCandidate_1toN_VtoP(data.message)); // OK
	    }
	});
}


if (type == "pilote-appelant") {

	// Réception d'une réponse à une offre
	socket.on("answerFromVisitor", function(data) {
	    if (data.cible.id == myPeerID) {
	        console.log ("------------ >>> _1toN_VtoP answer from "+data.from.typeClient+"----------");
	        //console.log("- Answer From: " + data.from.pseudo +"("+data.from.id+")");
	        //console.log("- Cible: " + data.cible.pseudo +"("+data.cible.id+")");
	        //console.log("- peerconnection: " + data.peerCnxId);
	        //console.log (data.message);
	        peerCnxCollection_1toN_VtoP[data.peerCnxId].setRemoteDescription(new SessionDescription_1toN_VtoP(data.message));
	    }
	});

	// Réception d'un ICE Candidate
	socket.on("candidateFromVisitor", function(data) {
	    if (data.cible.id == myPeerID) {
	        console.log ("------------ >>>> _1toN_VtoP Candidate from "+data.from.typeClient+"----------");
	        //console.log("- candidate From: " + data.from.pseudo +"("+data.from.id+")");
	        //console.log("- Cible: " + data.cible.pseudo +"("+data.cible.id+")");
	        //console.log("- peerconnection: " + data.peerCnxId);
	        // console.log (data.message);
	        // TODO : ici intercepter et filter le candidate
	        peerCnxCollection_1toN_VtoP[data.peerCnxId].addIceCandidate(new IceCandidate_1toN_VtoP(data.message)); // OK
	    }
	});
}

// ----- Phase 3 Post-Signaling --------------------------------------------

// --------------------- Gestion des messages d'erreur ------------------

function errorHandler_1toN_VtoP(err) {
    console.log("ON-ERROR");
    console.error(err);
}

function alertAndRedirect_1toN_VtoP(message, url) {
    //alert (message);
    window.alert(message)
    window.location.href = url;
}


// ------ fonctions diverses ---------------


function getClientBy_1toN_VtoP(key,value) {
    for (i in users.listUsers) {
        if (users.listUsers[i][key] == value) {
                return users.listUsers[i];
                break;
        }
    }
};


// On peux retrouver l'ID du pair distant en analysant l'ID de la connexion:
// Le peerID de la connexion est constitué d'une concaténation
// d'un préfixe et de l'id client du visiteur
// Il suffit donc d'oter le préfixe pour retrouver l'id du pair distant...
function getCibleFromPeerConnectionID_1toN_VtoP(peerCnxId, prefix) {
    var cibleID = peerCnxId;
    cibleID = cibleID.replace(prefix, "");
    cible = getClientBy('id',cibleID); 
    return cible;
};





 
