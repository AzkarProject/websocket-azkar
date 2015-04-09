// --------- WebRTC ---------------------------------------------
// Script inspiré de l'article suivant:
// https://developer.mozilla.org/fr/docs/Web/Guide/API/WebRTC/WebRTC_basics
// Source github : https://github.com/louisstow/WebRTC/blob/master/media.html

// shims!
var PeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
var SessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;
var IceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;
navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;


// Gestion des messages d'erreur
function errorHandler (err) {
	console.error(err);
}

// Variables de rôles
var type = "appelant";
var otherType = "appelé";

// Quand on reçoit une mise à jour de la liste 
// des connectés de cette session websocket
socket.on('updateUsers', function(data) {
    console.log(">> socket.on('updateUsers',...");
    // Si on est seul et qu'on as pas déjà instancié la connexion p2p
    // Autrement dit, si on est le premier dans la session,
    // On prend de facto le rôle "d'apelé"
    if (data.nbUsers == 1) {
		type = "appelé";
		otherType = "appelant";
    };
})

// options pour l'objet PeerConnection
var server = {
	iceServers: [
		{url: "stun:23.21.150.121"},
		{url: "stun:stun.l.google.com:19302"}
	]
};
var options = {
	optional: [
		{DtlsSrtpKeyAgreement: true}
	]
}


// Création de l'objet PeerConnection (CAD la session de connexion WebRTC)
var pc = new PeerConnection(server, options);

// Ecouteur déclenché à la génération d'un candidate 
pc.onicecandidate = function (e) {
	console.log("@ pc.onicecandidate()");
	// vérifie que le candidat ne soit pas nul
	if (!e.candidate) { return; }
	// Réinitialise l'écouteur "candidate" de la connexion courante
	pc.onicecandidate = null;
	// envoi le candidate généré à l'autre pair
	socket.emit("candidate", e.candidate);
};

// grab the video elements from the document
var video = document.getElementById("video");
var video2 = document.getElementById("otherPeer");

// get the user's media, in this case just video
navigator.getUserMedia({video: true}, function (stream) {
	// set one of the video src to the stream
	video.src = URL.createObjectURL(stream);
	// add the stream to the PeerConnection
	pc.addStream(stream);
	// now we can connect to the other peer
	connect();
}, errorHandler);

// when we get the other peer's stream, add it to the second video element.
pc.onaddstream = function (e) {
	console.log("@ onaddstream()");
	console.log(e);
	video2.src = URL.createObjectURL(e.stream);
};

// constraints on the offer SDP. Easier to set these
// to true unless you don't want to receive either audio
// or video.
var constraints = {
	mandatory: {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true
    }
};
/**/

// Déclaration des constraints pour l'audio et la vidéo
/*// Note: Les constraints de taille ne semblent actuellement pas prises en compte dans Mozzilla
var constraints = {
  audio:true,
  video: {
    mandatory: {
      maxWidth: 302,
      maxHeight: 168
    }
  }
};
/**/

// initialisation de la connexion
function connect () {
	console.log("@ connect() > rôle: " + type);
	
	// Si on est l'apellant
	if (type === "appelant") { 
		// création de l'offre SDP
		pc.createOffer(function (offer) {
			pc.setLocalDescription(offer);
			socket.emit("offer", offer);
		}, errorHandler, constraints);	
	
	// Sinon si on est l'apellé
	} else { 
		// L'apellé doit attendre de recevoir une offre SDP
		// avant de générer une réponse SDP
		socket.on("offer", function(data) { 
			console.log( ">>> offer from ("+data.placeListe+")"+data.pseudo);
			pc.setRemoteDescription(new SessionDescription(data.message));
			// Une foi l'offre reçue et celle-ci enregistrée
			// dans un setRemoteDescription, on peu enfin générer
			// une réponse SDP
			pc.createAnswer(function (answer) {
				pc.setLocalDescription(answer);
				socket.emit("answer", answer);
			}, errorHandler, constraints);	
		
		});	
	}
}

// BUG: écouteur onaddStream non déclenché:
// La différenciation des workflows entre l'apellant et l'appellé n'était pas claire!
// Pour faire simple, si l'apellé répondait bien à une offre par une answer
// l'apellant lui répondait par une autre offre au lieu d'une answer... 
// Cette architecture péchée sur le MDN mozzila était plus claire et m'a permis 
// de mettre enfin en évidence la confusion dans l'enchainement des méthodes...

// BUG: Ecran noir au déclenchement de l'écouteur onaddstream
// Il fallait déplacer les écouteurs de signaling candidate et answer
// en dehors de la méthode connect() pour les initialiser indifférenment
// que l'on soit apellant ou apellé...

// Réception d'un ICE Candidate
socket.on("candidate", function(data) { 
	console.log(">> socket.on('candidate',...");
	// console.log(data);
	console.log( ">>> candidate from ("+data.placeListe+")"+data.pseudo);    
	pc.addIceCandidate(new IceCandidate(data.message)); // OK
});

// Réception d'une réponse à une offre
socket.on("answer", function(data) { 
	console.log(">> socket.on('answer',...");
	console.log( ">>> answer from ("+data.placeListe+")"+data.pseudo); 
	pc.setRemoteDescription(new SessionDescription(data.message));
});
/**/