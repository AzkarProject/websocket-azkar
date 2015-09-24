// Script inspiré de l'article suivant:
// https://developer.mozilla.org/fr/docs/Web/Guide/API/WebRTC/WebRTC_basics
// Source github : https://github.com/louisstow/WebRTC/blob/master/media.html

//------ PHASE 1 : Pré-signaling ----------------------------------------------------------


// socket.on('updateUsers', function(data) {
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

// socket.on("requestConnect", function(data) {
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

// socket.on("readyForSignaling_1toN_VtoP", function(data) {
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
    peerCnxCollection[peerCnxId] =new PeerConnection(server, options);
    console.log("new peerCnxCollection_1toN_VtoP["+peerCnxId+"]"); 
    //console.log(peerCnxCollection); 

    
    // Un foi l'objet onnexion crée
    // Le pilote rafraichi le module de liste de visiteurs
	// qui doit tester la collection d'objets connexion du pilote
    if (type == "pilote-appelant") 	updateListUsers();		
			



    /*// ----- mémo -------
    localStream_1toN_VtoP = null;
    remoteStream_1toN_VtoP = null; // remoteStream 1to
    remoteStreamCollection_1toN_VtoP = {}; // 1toN > Tableau des remoteStreams visiteurs
    /**/
    
    // Initialisation du localStream et lancement connexion
    navigator.getUserMedia(videoConstraint_1toN_VtoP, function(stream) {

        localStream_1toN_VtoP = stream;
        
        // Le pilote n'as pas besoin d'afficher 2 fois son image....
        if (type == "visiteur-appelé") video1_1toN_VtoP.src = URL.createObjectURL( localStream_1toN_VtoP);
        else if (type == "pilote-appelant") {
        	// On vérifie que la connexion avec le robot n'est pas en route...
        	// if (piloteCnxStatus == "new") video1.src = URL.createObjectURL( localStream_1toN_VtoP);
        }
        
        peerCnxCollection[peerCnxId].addStream( localStream_1toN_VtoP);
        connect_1toN_VtoP(peerCnxId);

    }, errorHandler);
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
    peerCnxCollection[peerCnxId].onicecandidate = function(e) {
        // vérifie que le candidat ne soit pas nul
        if (!e.candidate) {
            // console.log("  > !e.candidate): return ");
            return;
        }
        
        var cible = ""; // TODO: choisir la cible en fonction de l'ID PeerConnexion....
        if (type == "visiteur-appelé") cible = getClientBy('typeClient','Pilote'); // Si c'est le Visiteur > client = pilote
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
                var cible = getCibleFromPeerConnectionID(peerCnxId, prefix_peerCnx_1toN_VtoP);

        } 
       
        console.log ("------------ _1toN_VtoP Candidate to >>> "+cible.typeClient+"----------");
        var data = {from: localObjUser, message: e.candidate, cible: cible, peerCnxId: peerCnxId}
        // console.log (data.message);
        socket.emit("candidate2", data);
        /**/
    
    };


    // Ecouteur déclenché a la reception d'un remoteStream
    peerCnxCollection[peerCnxId].onaddstream = function(e) {
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
    peerCnxCollection[peerCnxId].oniceconnectionstatechange = function(e) {

        var dateE = tools.dateER('E');
        console.log("@ pc["+peerCnxId+"].oniceconnectionstatechange_1toN_VtoP > " + dateE);

        //console.log(">>> stateConnection Event > " + peerCnxCollection_1toN_VtoP[peerCnxId].iceConnectionState);
        //$(chatlog).prepend(dateE + ' [stateConnection Event] ' + peerCnxCollection_1toN_VtoP[peerCnxId].iceConnectionState + '\n');

        console.log(">>> pc["+peerCnxId+"] stateConnection Event > " + peerCnxCollection[peerCnxId].iceConnectionState);
        //$(chatlog).prepend(dateE + ' pc['+peerCnxId+'] stateConnection Event: ' + peerCnxCollection_1toN_VtoP[peerCnxId].iceConnectionState + '\n');


        // Si la connexion est neuve, on remet le flag de renégo à sa position par défaut...
        if ( peerCnxCollection[peerCnxId].iceConnectionState == 'new') isRenegociate_1toN_VtoP = false; 





            // On informe l'autre pair de son statut de connexion   
            if (type == 'pilote-appelant') {
                // piloteCnxStatus = peerCnxCollection[peerCnxId].iceConnectionState;

                /*
                socket.emit("piloteCnxStatus", piloteCnxStatus);
                // Si on change de status suite à une déco du robot
                // On redéclenche l'ouverture des formulaires de connexion 
                // a la condition que le robot soit lui aussi prêt a se reconnecter... (new...)
                if (piloteCnxStatus == 'new' && robotCnxStatus == 'new') {
                    activeManageDevices(); // On active les formulaires permettant de relancer la connexion
                }
                /**/




            } else if (type == 'visiteur-appelé') {
                //robotCnxStatus = peerCnxCollection_1toN_VtoP[peerCnxId].iceConnectionState;
                //socket.emit("robotCnxStatus", robotCnxStatus);
            }
     
            // si le pair distant  est déconnecté en WebRTC,
            if (peerCnxCollection[peerCnxId].iceConnectionState == 'disconnected') {   
                
                // A tous les Visiteurs: Signal de perte de la connexion WebRTC principale (Pilote <> Robot)
                // socket.emit('closeMasterConnection','disconnected')
                
                // on lance le processus préparatoire a une reconnexion
                onDisconnect_1toN_VtoP(peerCnxId);
            }



    };

    // Ecouteur ... Todo...
    peerCnxCollection[peerCnxId].onremovestream = function(e) {
        console.log("@ pc["+peerCnxId+"].onremovestream(e) _1toN_VtoP> timestamp:" + Date.now());
        console.log(e);
    }

    
    // Si on est l'apellant (pilote) - create channel + create Offer 
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
			var cible = getCibleFromPeerConnectionID(peerCnxId, prefix_peerCnx_1toN_VtoP);



            peerCnxCollection[peerCnxId].createOffer(function(sdp){
                        peerCnxCollection[peerCnxId].setLocalDescription(sdp);
                        console.log ("------------ _1toN_VtoP offer >>> to "+cible.typeClient+"----------");
                        var data = {from: localObjUser, message: sdp, cible: cible, peerCnxId: peerCnxId}
                        // console.log (data);
                        socket.emit("offer2", data);
                    }
                    , errorHandler, 
                    constraints
                );


    //  Si on est l'apellé (visiteur) - écouteur on data channel + bindEvents  - 
    } else if (type === "visiteur-appelé") {
        


            // l'appelé doit attendre l'ouverture d'un dataChannel pour lancer son écouteur d'èvènement data...
            // Ecouteur d'ouverture d'un data channel
            peerCnxCollection[peerCnxId].ondatachannel = function(e) {
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

	            console.log (cible);

	            // création de l'offre SDP
	            peerCnxCollection[idPeerConnection].createAnswer(function(sdp){
	                    peerCnxCollection[idPeerConnection].setLocalDescription(sdp);
	                    console.log ("------------ _1toN_VtoP Answer to >>> "+cible.typeClient+"----------");
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
	        console.log ("------------ >>> _1toN_VtoP answer from "+data.from.typeClient+"----------");
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
	        console.log ("------------ >>>> _1toN_VtoP Candidate from "+data.from.typeClient+"----------");
	        //console.log("- candidate From: " + data.from.pseudo +"("+data.from.id+")");
	        //console.log("- Cible: " + data.cible.pseudo +"("+data.cible.id+")");
	        //console.log("- peerconnection: " + data.peerCnxId);
	        // console.log (data.message);
	        // TODO : ici intercepter et filter le candidate
	        peerCnxCollection[data.peerCnxId].addIceCandidate(new IceCandidate(data.message)); // OK
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
	        peerCnxCollection[data.peerCnxId].setRemoteDescription(new SessionDescription(data.message));
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
	        peerCnxCollection[data.peerCnxId].addIceCandidate(new IceCandidate(data.message)); // OK
	    }
	});
}

// ----- Phase 3 Post-Signaling --------------------------------------------


// Réception d'un ordre de déconnexion
socket.on("closeConnectionOrder", function(data) {
    if (data.cible.id == myPeerID) {
    	// On reconstruit l'Id de connexion en concaténant le préfixe de connexion pilote/visiteur:
    	// prefix_peerCnx_1toN_VtoP = "Pilote-to-Visiteur-";
    	var thisPeerCnx = prefix_peerCnx_1toN_VtoP+myPeerID;
        // A priori on est dans la peerConnection principale (Pilote <> Robot) >> peerCnx1to1
        console.log ("------------ >>> closeConnectionOrder"+data.from.typeClient+"----------");
        // on lance le processus préparatoire a une reconnexion
        onDisconnect_1toN_VtoP(thisPeerCnx);
    }
});


// A la déconnection du pair distant:
function onDisconnect_1toN_VtoP(peerCnxId) {

    console.log("@ onDisconnect_1toN_VtoP()");

    // On vérifie le flag de connexion
    if (isStarted_1toN_VtoP == false) return;

    // on retire le flux remoteStream
    if (type == 'visiteur-appelé') {
    	video1_1toN_VtoP.src = ""; //localVideo
    	video2_1toN_VtoP.src = ""; //RemotevideoPilote
    } else if (type == "pilote-appelant") {
    	videoVisitor1.src = ""; // RemoteVideoVisiteur
    }



    //videoElement.src = null;
    //window.stream.stop();

    // on coupe le RTC Data channel
    // if (channel) channel.close();
    // channel = null;

    // On vide et on ferme la connexion courante
    // pc["+peerCnxId+"].onicecandidate = null;
    //pc["+peerCnxId+"].close();
    //pc = null;

    peerCnxCollection[peerCnxId].close();
    peerCnxCollection[peerCnxId] = null;
    stopAndStart_1toN_VtoP(peerCnxId);
}

// Fermeture et relance de la connexion p2p par l'apellé (Robot)
function stopAndStart_1toN_VtoP(peerCnxId) {

    console.log("@ stopAndStart()");
    //input_chat_WebRTC.disabled = true;
    //input_chat_WebRTC.placeholder = "RTCDataChannel close";
    //env_msg_WebRTC.disabled = true;
   if (type == "pilote-appelant") {
        updateListUsers();
    }
    

    peerCnxCollection[peerCnxId] = new PeerConnection(server, options);

    // console.log("------pc = new PeerConnection(server, options);-----");

    // On informe la machine à état que c'est une renégociation
    isRenegociate_1toN_VtoP = true;

    /*

    /**/
};






 
