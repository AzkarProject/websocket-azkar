// Script inspiré de l'article suivant:
// https://developer.mozilla.org/fr/docs/Web/Guide/API/WebRTC/WebRTC_basics
// Source github : https://github.com/louisstow/WebRTC/blob/master/media.html


RtoV_PeerCnx_Collection = [];

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
        // On affiche la liste des disparus...
        // TODO >>>>>>>> 

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
		// var data = {from: localObjUser, cible: data.from}
    	// socket.emit("readyForSignaling_1toN_VtoP", data);
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
    
   // console.log(peerCnxCollection);

   //if (type == "visiteur-appelé") {
        var videoConstraint_1toN_VtoP = {
            audio: true,
            video: true
        }
    //}
    /**/
    
    
    if (type == "pilote-appelant") {
        // Récupération et affectation des caméras et micros selectionnés  
        var audioSource = local_AudioSelect.value;
        var videoSource = local_VideoSelect.value;

        videoConstraint_1toN_VtoP = {
            audio: {
                optional: [{
                    sourceId: audioSource
                }]
            },

            video: {
                optional: [{
                    sourceId: videoSource
                }]
            }
        } 
    }
    /**/

    if (peerCnxCollection[peerCnxId]) {
        // alert ("peerCnxCollection[peerCnxId]") // en cas de renégo

    } else if (!peerCnxCollection[peerCnxId]) {
        // alert (" No peerCnxCollection[peerCnxId]") // si c'est la première connexion
        peerCnxCollection[peerCnxId] =new PeerConnection(server, options);
        console.log("new peerCnxCollection_1toN_VtoP["+peerCnxId+"]"); 
    }
    
    // peerCnxCollection[peerCnxId] =new PeerConnection(server, options);
    // console.log("new peerCnxCollection_1toN_VtoP["+peerCnxId+"]"); 
    console.log(peerCnxCollection); 

    
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

        //console.log("----------------localStream_1toN_VtoP-----------------");
        //console.log(localStream_1toN_VtoP);
        //console.log("----------------------------------------");
        
        // Le  n'as pas besoin d'afficher 2 fois son image....
        if (type == "visiteur-appelé") {
            video1_1toN_VtoP.src = URL.createObjectURL( localStream_1toN_VtoP);
            peerCnxCollection[peerCnxId].addStream( localStream_1toN_VtoP);
        
            var pilote = getClientBy('typeClient','Pilote');
            var data = {from: localObjUser, cible: pilote }
            socket.emit("readyForSignaling_1toN_VtoP", data);





        } else if (type == "pilote-appelant") {
        	// On vérifie que la connexion avec le robot n'est pas en route...
        	// if (piloteCnxStatus == "new") video1.src = URL.createObjectURL( localStream_1toN_VtoP);
            
            var streamToRemote = localStream_1toN_VtoP
            // On met le stream du robot en lieu et place du stream du piulote
            
            console.log ("-- navigator.getUserMedia(videoConstraint_1toN_VtoP, function(stream) --");
            




            if (parameters.rStoV == 'open') {
                streamToRemote = remoteStream;
                console.log("-----------remoteStream-----------");
            } else {
                console.log("-----------localStream-----------");
            }
            console.log(stream);
            peerCnxCollection[peerCnxId].addStream(streamToRemote); 
        }
        
        // peerCnxCollection[peerCnxId].addStream( localStream_1toN_VtoP);
        
        connect_1toN_VtoP(peerCnxId);

    }, errorHandler);
};

// connexion
function connect_1toN_VtoP(peerCnxId) {

    //console.log ("@ connect()");
    debugNbConnect_1toN_VtoP += 1;
    console.log("@ connect_1toN_VtoP("+peerCnxId+") n°"+debugNbConnect_1toN_VtoP+"> rôle: " + type);
    isStarted_1toN_VtoP = true;

    // --- Ecouteurs communs apellant/apellé ----

    // Ecouteur déclenché à la génération d'un candidate 
    peerCnxCollection[peerCnxId].onicecandidate = function(e) {
        
        // Si candidat nul
        if (!e.candidate) return;

        // Choix de la cible en fonction de l'ID PeerConnexion....
        var cible = ""; 
        // Si on est le Visiteur > client = pilote
        if (type == "visiteur-appelé") cible = getClientBy('typeClient','Pilote'); 
        // Si on sest le Pilote >> Client = visiteur
        // On peux retrouver l'ID du pair distant en analysant l'ID de la connexion:
        // Le peerID de la connexion est constitué d'une concaténation
        // d'un préfixe et de l'id client du visiteur
        // Il suffit donc d'oter le préfixe pour retrouver l'id du pair distant... 
        else cible = getCibleFromPeerConnectionID(peerCnxId, prefix_peerCnx_1toN_VtoP);

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
        // console.log(e);
     
        /*// Version 1to1 
        if (type == "visiteur-appelé") {
            // if (parameters.rRView == 'hide') showRemoteVideo = false;
            video2_1toN_VtoP.src = URL.createObjectURL(e.stream);
        } else if (type == "pilote-appelant") {
			videoVisitor1.src = URL.createObjectURL(e.stream);
        }
        
        /**/// -------------------------------------------------------------
        // version 1toN multiview

        var originStream = ""; 
        originStream = peerCnxId.indexOf(prefix_peerCnx_1toN_VtoP); //Retourne -1 si faux
        if (originStream != -1) {
            if (type == "pilote-appelant") originStream = "Visiteur";
            else originStream = "Pilote";
        }
        
        // Les remoteStream en provenance des visiteurs doivent Ãªtre mis dans une collection.
        // remoteStream = e.stream;
        //if (originStream != "Visiteur") remoteStream = e.stream; // Uniquement si c'est le pilote ou le robot qui s'affiche
        //else remoteStreamCollection[peerCnxId] = e.stream; // sinon on met le stream dans un tableau  

		if (type == "visiteur-appelé") {
            video2_1toN_VtoP.src = URL.createObjectURL(e.stream);
        } else if (type == "pilote-appelant") {
			if (originStream == "Visiteur") {
				console.log("*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*")
                addRemoteMultiVideo(e.stream,peerCnxId);
			}
        }
        
       	/**/// ----------------------------------------------------------------------------------
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
        	// todo
        } else if (type == 'visiteur-appelé') {
            
        	var myIceState = peerCnxCollection[peerCnxId].iceConnectionState;
        	var data = {from: localObjUser, iceState: myIceState}
        	socket.emit("visitorCnxPiloteStatus", data); // ca concerne le p2p pilote/visiteur
			
			/*//Si la variable isForPilote reçoit la valeur -1, l'ID de connexion de contient pas le préfixe.
        	var isForPilote = peerCnxId.indexOf(prefix_peerCnx_1toN_VtoP); 
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


// Ecouteurs Signaling (Offer, Answer et Candidate) de l'API websocket  -----
// if (type == "visiteur-appelé") pour éviter 
// double instanciation coté pilote
if (type == "visiteur-appelé") {
	
	socket.on("offer", function(data) {
	    
	    if (data.cible.id == myPeerID) {
	        console.log(data);
	        console.log ("------------ >>> _1toN_VtoP offer from "+data.from.typeClient+"----------");
	        console.log ("isRenegociate_1toN_VtoP:"+isRenegociate_1toN_VtoP);
	        if (isRenegociate_1toN_VtoP == false) {            
        

	            // ------------- Version 1toN
	            var offer = new SessionDescription(data.message);
	            peerCnxCollection[data.peerCnxId].setRemoteDescription(offer); 
	            
	            // Une foi l'offre reçue et celle-ci enregistrée dans un setRemoteDescription,
	            // on peu enfin générer une réponse SDP 
	            var cible = getClientBy('id', data.from.id);
	            var idPeerConnection = data.peerCnxId;

	            // console.log (cible);

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

	// Réception d'une réponse à une offre
	socket.on("answer", function(data) {
	    if (data.cible.id == myPeerID) {
	        console.log ("------------ >>> _1toN_VtoP answer from "+data.from.typeClient+"----------");
	        peerCnxCollection[data.peerCnxId].setRemoteDescription(new SessionDescription(data.message));
	    }
	});

	// Réception d'un ICE Candidate
	socket.on("candidate", function(data) {
	    if (data.cible.id == myPeerID) {
	        console.log ("------------ >>>> _1toN_VtoP Candidate from "+data.from.typeClient+"----------");

            var candidateFromPilote = new IceCandidate(data.message);
            peerCnxCollection[data.peerCnxId].addIceCandidate(candidateFromPilote);
	    }
	});
}

// ----- Phase 3 Post-Signaling --------------------------------------------

// Pilote: A la réception du statut P2P d'un visiteur
socket.on('visitorCnxPiloteStatus', function(data) {
	if (type == "pilote-appelant") {
		console.log('>> socket.on("visitorCnxPiloteStatus", (from '+data.from.id+ ') - Status:'+data.iceState);
		updateListUsers(); // refresh contrôles de manage Users
	}
});

// Tous: Réception d'un ordre de déconnexion
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


// Visiteur & pilote: Réception d'une info de déconnexion pilote/Robot
socket.on("closeMasterConnection", function(data) {
    console.log ("------------ >>> closeMasterConnection");
    if (type == "pilote-appelant")  {
        updateListUsers();
    } else if (type == "visiteur-appelé") {
        // On coupe toutes les connexions p2p pilote/visiteurs
        // Pour pouvoir leur retransmettre le nouveau Stream si changement de caméra coté robot.

        // On reconstruit l'Id de connexion en concaténant le préfixe de connexion pilote/visiteur:
        // var thisPeerCnx = prefix_peerCnx_1toN_VtoP+myPeerID;
        // on lance le processus préparatoire a une reconnexion
        // onDisconnect_1toN_VtoP(thisPeerCnx); // provoque BUG de récession

        // Fix >>>> Réutiliser le process de déconnexion des visiteurs du manageVisiteurs
        // Comme ca la déconnexion de chaque client est initiée proprement par le Pilote.
        closeCnxwithAllVisitors();
    }
});


// Seul le pilote est sensé recevoir ces infos
socket.on('infoToPilote', function(data) {
    console.log ("------------ >>> closeMasterConnection"); 
    if (data.message = "VtoR_disconnected") {
        RtoV_PeerCnx_Collection[data.from.id].status = "Close";
        updateListUsers(); 
    }
});

// A la déconnection du pair distant:
function onDisconnect_1toN_VtoP(peerCnxId) {

    console.log("@ onDisconnect_1toN_VtoP()");


    // Dabord on vérifie que cette connexion existe dans le table des connexions
    // if (isStarted_1toN_VtoP == false) return;
    

    // on retire le flux remoteStream
    if (type == 'visiteur-appelé') {
        // Dabord on vérifie le flag de connexion
        if (isStarted_1toN_VtoP == false) return;
        video1_1toN_VtoP.src = ""; //localVideo
    	video2_1toN_VtoP.src = ""; //RemotevideoPilote
    } else if (type == "pilote-appelant") {
    	// Dabord on vérifie que cette connexion p2p existe
        if (!peerCnxCollection[peerCnxId])  return;
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

    peerCnxCollection[peerCnxId].onicecandidate = null;
    peerCnxCollection[peerCnxId].close();
    peerCnxCollection[peerCnxId] = null;
    
    if (type == "pilote-appelant")  updateListUsers();

    stopAndStart_1toN_VtoP(peerCnxId);
}

// Fermeture et relance de la connexion p2p par l'apellé (visiteur)
function stopAndStart_1toN_VtoP(peerCnxId) {

    console.log("@ stopAndStart()");
    //input_chat_WebRTC.disabled = true;
    //input_chat_WebRTC.placeholder = "RTCDataChannel close";
    //env_msg_WebRTC.disabled = true;
    

    peerCnxCollection[peerCnxId] = new PeerConnection(server, options);

    // console.log("------pc = new PeerConnection(server, options);-----");

    // On informe la machine à état que c'est une renégociation
    isRenegociate_1toN_VtoP = true;

    /*

    /**/
};






 
