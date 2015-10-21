// Script inspiré de l'article suivant:
// https://developer.mozilla.org/fr/docs/Web/Guide/API/WebRTC/WebRTC_basics
// Source github : https://github.com/louisstow/WebRTC/blob/master/media.html

//------ PHASE 1 : Pré-signaling ----------------------------------------------------------

var prefix_peerCnx_VtoR = "Robot-to-Visiteur-"
var debugNbConnect_VtoR = 0;
var VtoR_localStream;
var isRenegociate_VtoR = false;
// Constraints de l'offre SDP. 
robotConstraints = {
    mandatory: {
        OfferToReceiveAudio: false,
        OfferToReceiveVideo: false
    }
};

// Constraints de l'offre SDP. 
visitorConstraints = {
    mandatory: {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true
    }
};

// socket.on("VtoR_requestConnect", function(data) {
if (type == "robot-appelé") {    
	socket.on("VtoR_requestConnect", function(data) {
		// Si on est la bonne cible...
		if (data.cible.id === myPeerID ) {
			// mémo: data = {from: localObjUser, cible: cible}
            
			console.log(">> socket.on('VtoR_requestConnect',...");
            console.log(data);
			var peerID = prefix_peerCnx_VtoR+data.from.id; // On fabrique l'ID de la connexion
			initLocalMedia_VtoR(peerID); // Et on l'ance l'initlocalmedia avec sa nouvelle id de connexion
		    // var data = {from: localObjUser, cible: data.from}
            // socket.emit("VtoR_readyForSignaling", data);
        }

	})
}

// socket.on("VtoR_ReadyForSignaling", function(data) {
if (type == "visiteur-appelé") {
	

    socket.on("VtoR_initPreSignaling", function(data) {
        if (data.cible.id === myPeerID ) {
            console.log(">> socket.on('VtoR_initPreSignaling',...");
            var data = {from: localObjUser, cible: data.cible};  
            socket.emit('VtoR_requestConnect', data);
        }
    });

    socket.on("VtoR_ReadyForSignaling", function(data) {
	    console.log(">> socket.on('VtoR_readyForSignaling',...");
    	// Si on est la bonne cible
		if (data.cible.id === myPeerID ) {
            var peerID = prefix_peerCnx_VtoR+myPeerID; // On la concatène avec le préfixe 
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
 
    // Récupération des caméras sélectionnées par le pilote
    if (type == "robot-appelé"){

        var audioSource = local_AudioSelect.value;
        var videoSource = local_VideoSelect.value;

        var videoConstraint_VtoR = {
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

        console.log(videoConstraint_VtoR);

    }








    // Initialisation du localStream et lancement connexion
    navigator.getUserMedia(videoConstraint_VtoR, function(stream) {
        // Pas besoin d'afficher les caméras locales...
        // Par contre il faut les ajouter a la peerconnecion
        // pour activer correctement le signaling
        VtoR_localStream = stream;
        peerCnxCollection[peerCnxId].addStream(VtoR_localStream);
        
        if (type == "robot-appelé") { 
            var cible = getCibleFromPeerConnectionID(peerCnxId, prefix_peerCnx_VtoR);
            var data = {from: localObjUser, cible: cible}
            socket.emit("VtoR_readyForSignaling", data);
        }

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
    // Ecouteur déclenché à la génération d'un candidate 
    peerCnxCollection[peerCnxId].onicecandidate = function(e) {
        // si candidat nul
        if (!e.candidate) return;
        // Choix de la cible en fonction de l'ID PeerConnexion....
        var cible = ""; 
        if (type == "visiteur-appelé") cible = getClientBy('typeClient','Robot'); // Si c'est le Visiteur > client = robot
        // Sinon récupération de l'objet "Visiteur" a partir de l'ID de peerconnection
        else cible = getCibleFromPeerConnectionID(peerCnxId, prefix_peerCnx_VtoR);
       
        console.log ("------------ _VtoR Candidate to >>> "+cible.typeClient+"----------");
        var data = {from: localObjUser, message: e.candidate, cible: cible, peerCnxId: peerCnxId}
        socket.emit("candidate2", data);
    };


    // Ecouteur déclenché a la reception d'un remoteStream
    peerCnxCollection[peerCnxId].onaddstream = function(e) {
        console.log("@ @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@_VtoR");
        console.log("@ pc["+peerCnxId+"].onaddstream_VtoR");
        if (type == "visiteur-appelé") video3_VtoR.src = URL.createObjectURL(e.stream);
        // else if (type == "robot-appelé") // On ne fait rien. Le visiteur n'est pas sensé être affiché...
    };


    // Ecouteurs de changement de statut de connexion
    // Permet de déterminer si le pair distant s'est déconnecté. (Version 1to1)
    peerCnxCollection[peerCnxId].oniceconnectionstatechange = function(e) {

        var dateE = tools.dateER('E');
        console.log("@ pc["+peerCnxId+"].oniceconnectionstatechange_VtoR > " + dateE);
        console.log(">>> pc["+peerCnxId+"] stateConnection Event > " + peerCnxCollection[peerCnxId].iceConnectionState);

        // Si la connexion est neuve, on remet le flag de renégo à sa position par défaut...
        if ( peerCnxCollection[peerCnxId].iceConnectionState == 'new') isRenegociate_VtoR = false; 

		// On informe l'autre pair de son statut de connexion   
        if (type == 'robot-appellé') // Todo
        // else if (type == 'visiteur-appelé') // Todo
     
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

    
    // Si on est l'apellant (visiteur) - create channel + create Offer 
    if (type === "visiteur-appelé") {
            // création et envoi de l'offre SDP
			var cible = getClientBy('typeClient','Robot');

            peerCnxCollection[peerCnxId].createOffer(function(sdp){
                        peerCnxCollection[peerCnxId].setLocalDescription(sdp);
                        console.log ("------------ _VtoR offer >>> to "+cible.typeClient+"----------");
                        var data = {from: localObjUser, message: sdp, cible: cible, peerCnxId: peerCnxId}
                        console.log (data);
                        socket.emit("offer_VtoR", data);
                    }
                    , errorHandler, 
                    //constraints
                    visitorConstraints
                );


    //  Si on est l'apellé (robot) - écouteur on data channel + bindEvents  - 
    } else if (type === "robot-appelé") {
        
            // l'appelé doit attendre l'ouverture d'un dataChannel pour lancer son écouteur d'èvènement data...
            // Ecouteur d'ouverture d'un data channel
            peerCnxCollection[peerCnxId].ondatachannel = function(e) {
                //channel = e.channel;
                console.log("pc["+peerCnxId+"].ondatachannel(e) _VtoR ... ");
                //bindEvents(); //now bind the events
            };


    }
}


// Ecouteur signaling
if (type == "robot-appelé") {
	
	socket.on("offer_VtoR", function(data) {
	    
	    if (data.cible.id == myPeerID) {
	        console.log(data);
	        console.log ("------------ >>> _VtoR offer from "+data.from.typeClient+"----------");
	        console.log ("isRenegociate_VtoR:"+isRenegociate_VtoR);
	        if (isRenegociate_VtoR == false) {                      

	            // ------------- Version 1toN
	            var offer = new SessionDescription(data.message);
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
	                //constraints
                    robotConstraints
	            );
	        }
	    }
	});


    /*// Réception d'un ICE Candidate
    socket.on("candidate_VtoR", function(data) {
        if (data.cible.id == myPeerID) {
            console.log ("------------ >>>> _1toN_VtoP Candidate from "+data.from.typeClient+"----------");

            var candidateFromVisitor = new IceCandidate(data.message);
            peerCnxCollection[data.peerCnxId].addIceCandidate(candidateFromVisitor);
        }
    });
    /**/
	


}

// ----- Phase 3 Post-Signaling --------------------------------------------

/*// Réception du statut P2P d'un visiteur
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
/**/

// ---------------------------

// A la déconnection du pair distant:
function onDisconnect_VtoR(peerCnxId) {

    console.log("@ onDisconnect_VtoR()");

    /*// On vérifie le flag de connexion
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
    /**/
}

// Fermeture et relance de la connexion p2p par l'apellé (Robot)
function stopAndStart_VtoR(peerCnxId) {

    console.log("@ stopAndStart_VtoR()");
 
    /*
    peerCnxCollection[peerCnxId] = new PeerConnection(server, options);
    // On informe la machine à état que c'est une renégociation
    isRenegociate_VtoR = true;
    /**/
};

/**/




 
