// Script inspiré de l'article suivant:
// https://developer.mozilla.org/fr/docs/Web/Guide/API/WebRTC/WebRTC_basics
// Source github : https://github.com/louisstow/WebRTC/blob/master/media.html

//------ PHASE 1 : Pré-signaling ----------------------------------------------------------


// socket.on("requestConnect", function(data) {
// (Visiteur) à la reception de la demande de connexion du pilote
// >>> socket.emit("isVisitorReady", data)... on lance aussi l'initlocalmedia
// Et on prévient le pilote qui fera de même...
// if (type == "OLDvisiteur-appelé") {
if (type == "robot-appelé") {    
	socket.on("VtoR_requestConnect", function(data) {
		// Si on est la bonne cible...
		if (data.cible.id === myPeerID ) {
			// mémo: data = {from: localObjUser, cible: cible}
			console.log(">> socket.on('VtoR_requestConnect',...");
			var peerID = prefix_peerCnx_VtoR+myPeerID; // On fabrique l'ID de la connexion
			initLocalMedia_VtoR(peerID); // Et on l'ance l'initlocalmedia avec sa nouvelle id de connexion
		}
		var data = {from: localObjUser, cible: data.from}
    	socket.emit("VtoR_readyForSignaling", data);
	})
}

// socket.on("readyForSignaling_VtoR", function(data) {
// (Pilote) à la reception du signal de fin pré-signaling du visiteur
// Le pilote lance son initLocalMedia 
// if (type == "OLDpilote-appelant") {
if (type == "robot-appellé") {
	socket.on("VtoR_ReadyForSignaling", function(data) {
	    console.log(">> socket.on('VtoR_readyForSignaling',...");
    	// Si on est la bonne cible
		if (data.cible.id === myPeerID ) {
	        // mémo: data = {from: localObjUser, cible: cible}
	        var cibleID = data.from.id; // On récupère l'Id du visiteur
            var peerID = prefix_peerCnx_VtoR+cibleID; // On la concatène avec le préfixe 
			initLocalMedia_VtoR(peerID); // Et on l'ance l'initlocalmedia avec sa nouvelle id de connexion
		}
	})
 }




// ---- PHASE 2 : Signaling --------------------------------------------------

// initialisation du localStream et initialisation connexion
function initLocalMedia_VtoR(peerCnxId) {

    console.log("@ initLocalMedia_VtoR("+peerCnxId+")");
    var videoConstraint_VtoR = {
        audio: true,
        video: true
    }
    peerCnxCollection[peerCnxId] =new PeerConnection(server, options);
    console.log("new peerCnxCollection_VtoR["+peerCnxId+"]"); 
    //console.log(peerCnxCollection); 

    
    // Un foi l'objet onnexion crée
    // Le pilote rafraichi le module de liste de visiteurs
	// qui doit tester la collection d'objets connexion du pilote
    // if (type == "pilote-appelant") 	updateListUsers();		
			



    /*// ----- mémo -------
    localStream_VtoR = null;
    remoteStream_VtoR = null; // remoteStream 1to
    remoteStreamCollection_VtoR = {}; // 1toN > Tableau des remoteStreams visiteurs
    /**/
    
    // Initialisation du localStream et lancement connexion
    navigator.getUserMedia(videoConstraint_VtoR, function(stream) {

        localStream_VtoR = stream;
        
        // Le visiteur n'as pas besoin d'afficher 2 fois son image....
        if (type == "pilote-appelé") {
            video1_VtoR.src = URL.createObjectURL(localStream_VtoR);
            peerCnxCollection[peerCnxId].addStream(localStream_VtoR);
        
        } else if (type == "visiteur-appelé") {
        	// On vérifie que la connexion avec le robot n'est pas en route...
        	// if (piloteCnxStatus == "new") video1.src = URL.createObjectURL( localStream_VtoR);
            
            var streamToRemote = localStream_VtoR
            // On met le stream du robot en lieu et place du stream du piulote
            if (parameters.rStoV == 'open') streamToRemote = remoteStream;
            peerCnxCollection[peerCnxId].addStream( streamToRemote); 
        }
        
        // peerCnxCollection[peerCnxId].addStream( localStream_VtoR);
        
        connect_VtoR(peerCnxId);

    }, errorHandler);
};

// connexion
function connect_VtoR(peerCnxId) {

    //console.log ("@ connect()");
    debugNbConnect_VtoR += 1;
    console.log("@ connect_VtoR("+peerCnxId+") n°"+debugNbConnect_VtoR+"> rôle: " + type);
    isStarted_VtoR = true;

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
        if (type == "visiteur-appelé") cible = getClientBy('typeClient','Robot'); // Si c'est le Visiteur > client = pilote
        else { // Sinon si c'est le Pilote >> Client visiteur
        	    // On peux retrouver l'ID du pair distant en analysant l'ID de la connexion:
                // Le peerID de la connexion est constitué d'une concaténation
                // d'un préfixe et de l'id client du visiteur
                // Il suffit donc d'oter le préfixe pour retrouver l'id du pair distant... 
                /*// ----------
                var cibleID = peerCnxId;
                cibleID = cibleID.replace(prefix_peerCnx_VtoR, "");
                cible = getClientBy('id',cibleID); 
                /**///-----------
                var cible = getCibleFromPeerConnectionID(peerCnxId, prefix_peerCnx_VtoR);

        } 
       
        console.log ("------------ _VtoR Candidate to >>> "+cible.typeClient+"----------");
        var data = {from: localObjUser, message: e.candidate, cible: cible, peerCnxId: peerCnxId}
        // console.log (data.message);
        socket.emit("candidate3", data);
        /**/
    
    };


    // Ecouteur déclenché a la reception d'un remoteStream
    peerCnxCollection[peerCnxId].onaddstream = function(e) {
        console.log("@ @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@_VtoR");
        console.log("@ pc["+peerCnxId+"].onaddstream_VtoR");
        // console.log(e);
     
        /*// Version 1to1 
        if (type == "visiteur-appelé") {
            // if (parameters.rRView == 'hide') showRemoteVideo = false;
            video2_VtoR.src = URL.createObjectURL(e.stream);
        } else if (type == "pilote-appelant") {
			videoVisitor1.src = URL.createObjectURL(e.stream);
        }
        
        /**/// -------------------------------------------------------------
        // version 1toN multiview

        var originStream = ""; 
        originStream = peerCnxId.indexOf(prefix_peerCnx_VtoR); //Retourne -1 si faux
        if (originStream != -1) {
            if (type == "robot-appellé") originStream = "Visiteur";
            else originStream = "Robot";
        }
        
        
        // Les remoteStream en provenance des visiteurs doivent Ãªtre mis dans une collection.
        // remoteStream = e.stream;
        //if (originStream != "Visiteur") remoteStream = e.stream; // Uniquement si c'est le pilote ou le robot qui s'affiche
        //else remoteStreamCollection[peerCnxId] = e.stream; // sinon on met le stream dans un tableau  

		if (type == "visiteur-appelé") {
            video2_VtoR.src = URL.createObjectURL(e.stream);
        
        } else if (type == "robot-appellé") {
			
            if (originStream == "Visiteur") {
				addRemoteMultiVideo(e.stream,peerCnxId);
			}
        }
        
       	/**/// ----------------------------------------------------------------------------------




    };


    // Ecouteurs de changement de statut de connexion
    // Permet de déterminer si le pair distant s'est déconnecté. (Version 1to1)
    peerCnxCollection[peerCnxId].oniceconnectionstatechange = function(e) {

        var dateE = tools.dateER('E');
        console.log("@ pc["+peerCnxId+"].oniceconnectionstatechange_VtoR > " + dateE);

        //console.log(">>> stateConnection Event > " + peerCnxCollection_VtoR[peerCnxId].iceConnectionState);
        //$(chatlog).prepend(dateE + ' [stateConnection Event] ' + peerCnxCollection_VtoR[peerCnxId].iceConnectionState + '\n');

        console.log(">>> pc["+peerCnxId+"] stateConnection Event > " + peerCnxCollection[peerCnxId].iceConnectionState);
        //$(chatlog).prepend(dateE + ' pc['+peerCnxId+'] stateConnection Event: ' + peerCnxCollection_VtoR[peerCnxId].iceConnectionState + '\n');

        // Si la connexion est neuve, on remet le flag de renégo à sa position par défaut...
        if ( peerCnxCollection[peerCnxId].iceConnectionState == 'new') isRenegociate_VtoR = false; 

		// On informe l'autre pair de son statut de connexion   
        if (type == 'robot-appellé') {
        	// todo
        } else if (type == 'visiteur-appelé') {
            
        	var myIceState = peerCnxCollection[peerCnxId].iceConnectionState;
        	var data = {from: localObjUser, iceState: myIceState}
        	socket.emit("visitorCnxRobotStatus", data); // ca concerne le p2p robot/visiteur
			
			/*//Si la variable isForPilote reçoit la valeur -1, l'ID de connexion de contient pas le préfixe.
        	var isForPilote = peerCnxId.indexOf(prefix_peerCnx_VtoR); 
	        if (isForPilote != -1 ) { // Si différent de -1
	        	socket.emit("visitorCnxPiloteStatus", data); // ca concerne le p2p pilote/visiteur
	        }
	        else {
	        	// Todo ????
	        }
	        /**/
            
        }
     
        // si le pair distant  est déconnecté en WebRTC,
        if (peerCnxCollection[peerCnxId].iceConnectionState == 'disconnected') {   
                        
            // on lance le processus préparatoire a une reconnexion
            onDisconnect_VtoR(peerCnxId);
        }



    };

    // Ecouteur ... Todo...
    peerCnxCollection[peerCnxId].onremovestream = function(e) {
        console.log("@ pc["+peerCnxId+"].onremovestream(e) _VtoR> timestamp:" + Date.now());
        console.log(e);
    }

    
    // Si on est l'apellant (pilote) - create channel + create Offer 
    if (type === "pilote-appelant") {
        
            // l'apellant crée un dataChannel
            // channel = peerCnxCollection_VtoR[peerCnxId].createDataChannel("mychannel", {});
            // et peut maintenant lancer l'écouteur d'évènement sur le datachannel
            // bindEvents();

            // création et envoi de l'offre SDP
            
            // On peux retrouver l'ID du pair distant en analysant l'ID de la connexion:
			// Le peerID de la connexion est constitué d'une concaténation
			// d'un préfixe et de l'id client du visiteur
			// Il suffit donc d'oter le préfixe pour retrouver l'id du pair distant...
			var cible = getCibleFromPeerConnectionID(peerCnxId, prefix_peerCnx_VtoR);



            peerCnxCollection[peerCnxId].createOffer(function(sdp){
                        peerCnxCollection[peerCnxId].setLocalDescription(sdp);
                        console.log ("------------ _VtoR offer >>> to "+cible.typeClient+"----------");
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
                console.log("pc["+peerCnxId+"].ondatachannel(e) _VtoR ... ");
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
	        console.log ("------------ >>> _VtoR offer from "+data.from.typeClient+"----------");
	        console.log ("isRenegociate_VtoR:"+isRenegociate_VtoR);
	        if (isRenegociate_VtoR == false) {            

	            //console.log("(apellé)>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
	            //peerCnxCollection_VtoR[peerCnxId].setRemoteDescription(new SessionDescription(data.message));
	            //peerCnxCollection_VtoR[peerCnxId].createAnswer(doAnswer, errorHandler, constraints);           

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
	                    console.log ("------------ _VtoR Answer to >>> "+cible.typeClient+"----------");
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
	        console.log ("------------ >>> _VtoR answer from "+data.from.typeClient+"----------");
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
	        console.log ("------------ >>>> _VtoR Candidate from "+data.from.typeClient+"----------");
	        //console.log("- candidate From: " + data.from.pseudo +"("+data.from.id+")");
	        //console.log("- Cible: " + data.cible.pseudo +"("+data.cible.id+")");
	        //console.log("- peerconnection: " + data.peerCnxId);
	        // console.log (data.message);
	        // TODO : ici intercepter et filter le candidate
	        peerCnxCollection[data.peerCnxId].addIceCandidate(new IceCandidate(data.message)); // OK
	    }
	});
}


// Ecouteurs Answer et Candidate différents du 1to1 pour le pilote
if (type == "pilote-appelant") {

	// Réception d'une réponse à une offre
	socket.on("answerFromVisitor", function(data) {
	    if (data.cible.id == myPeerID) {
	        console.log ("------------ >>> _VtoR answer from "+data.from.typeClient+"----------");
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
	        console.log ("------------ >>>> _VtoR Candidate from "+data.from.typeClient+"----------");
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

// Réception du statut P2P d'un visiteur
socket.on('visitorCnxPiloteStatus', function(data) {
	if (type == "pilote-appelant") {
		console.log('>> socket.on("visitorCnxPiloteStatus", (from '+data.from.id+ ') - Status:'+data.iceState);
		updateListUsers(); // refresh contrôles de manage Users
	}
});

// Réception d'un ordre de déconnexion
socket.on("closeConnectionOrder", function(data) {
    if (data.cible.id == myPeerID) {
    	// On reconstruit l'Id de connexion en concaténant le préfixe de connexion pilote/visiteur:
    	// prefix_peerCnx_VtoR = "Pilote-to-Visiteur-";
    	var thisPeerCnx = prefix_peerCnx_VtoR+myPeerID;
        // A priori on est dans la peerConnection principale (Pilote <> Robot) >> peerCnx1to1
        console.log ("------------ >>> closeConnectionOrder"+data.from.typeClient+"----------");
        // on lance le processus préparatoire a une reconnexion
        onDisconnect_VtoR(thisPeerCnx);
    }
});


// A la déconnection du pair distant:
function onDisconnect_VtoR(peerCnxId) {

    console.log("@ onDisconnect_VtoR()");

    // On vérifie le flag de connexion
    if (isStarted_VtoR == false) return;

    // on retire le flux remoteStream
    if (type == 'visiteur-appelé') {
    	video1_VtoR.src = ""; //localVideo
    	video2_VtoR.src = ""; //RemotevideoPilote
    } else if (type == "pilote-appelant") {
    	removeRemoteVideo(peerCnxId);
    	// videoVisitor1.src = ""; // RemoteVideoVisiteur
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
    
    if (type == "pilote-appelant")  updateListUsers();

    stopAndStart_VtoR(peerCnxId);
}

// Fermeture et relance de la connexion p2p par l'apellé (Robot)
function stopAndStart_VtoR(peerCnxId) {

    console.log("@ stopAndStart()");
    //input_chat_WebRTC.disabled = true;
    //input_chat_WebRTC.placeholder = "RTCDataChannel close";
    //env_msg_WebRTC.disabled = true;
    

    peerCnxCollection[peerCnxId] = new PeerConnection(server, options);

    // console.log("------pc = new PeerConnection(server, options);-----");

    // On informe la machine à état que c'est une renégociation
    isRenegociate_VtoR = true;

    /*

    /**/
};






 
