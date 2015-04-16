console.log("main.js");

// --------- WebRTC ---------------------------------------------
// Script inspiré de l'article suivant:
// https://developer.mozilla.org/fr/docs/Web/Guide/API/WebRTC/WebRTC_basics
// Source github : https://github.com/louisstow/WebRTC/blob/master/media.html

// flag de connexion
var isStarted = false;
// console.log("isStarted = "+ isStarted);

// shims!
var PeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
var SessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;
var IceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;
navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;


// grab the video elements from the document
var video = document.getElementById("video");
var video2 = document.getElementById("otherPeer");


// dataChannel elements
var chatlog = document.getElementById("chatlog");
var message = document.getElementById("dataChannelSend");


// Gestion des messages d'erreur
function errorHandler (err) {
	console.error(err);
}

// Variables de rôles
// var type = "appelant";
// var otherType = "appelé";

// Quand on reçoit une mise à jour de la liste 
// des connectés de cette session websocket
socket.on('updateUsers', function(data) {
    console.log(">> socket.on('updateUsers',...");
    // Si on est seul et qu'on as pas déjà instancié la connexion p2p
    // Autrement dit, si on est le premier dans la session,
    // On prend de facto le rôle "d'apelé"
    /*
    if (data.nbUsers == 1) {
		type = "appelé";
		otherType = "appelant";
    };
    /**/
})



var sources = [];

/*// Détection des devices...
if (type == "appelé") {
	
	MediaStreamTrack.getSources(function (media_sources) {
	    for (var i = 0; i < media_sources.length; i++) {
	        var media_source = media_sources[i];
	        var listOfDevices = common.stringObjectDump(media_sources);
	        console.log(listOfDevices,"media_sources");
	    }
	});
}
/**/

// Configuration des caméras du robot:
var cameraTopLabel = "HP HD Webcam (04f2:b3ed)";
var cameraSolLabel = "Logitech HD Pro Webcam C910 (046d:0821)";

var cameraTop = {};
var cameraSol = {};
var micro = {};

var listSources = null;

if (type == "appelé") {

	if (typeof MediaStreamTrack === 'undefined'){
	  alert('This browser does not support MediaStreamTrack.\n\nTry Chrome Canary.');
	} else {
	  // MediaStreamTrack.getSources( onSourcesAcquired);
	  listSources = MediaStreamTrack.getSources(getDevices);
	}

	/*
	function onSourcesAcquired(sources) {
	  for (var i = 0; i != sources.length; ++i) {
	    var source = sources[i];
	    // source.id -> DEVICE ID
	    // source.label -> DEVICE NAME
	    // source.kind = "audio" OR "video"
	    // TODO: add this to some datastructure of yours or a selection dialog
	    if (source.label == cameraTopLabel) {cameraTop.label = source.label};
	    if (source.label == cameraSolLabel) {cameraSol.label = source.label};
	    console.log("---------------");
	    console.log("source.kind -> " + source.kind );
	    console.log("source.label -> " + source.label);
	    console.log("source.id -> "+ source.id);
	  }
	  console.log("---------------");
	}
	/**/

	
	function getDevices(sources) {
	  for (var i = 0; i != sources.length; ++i) {
	    var source = sources[i];
	    // source.id -> DEVICE ID
	    // source.label -> DEVICE NAME
	    // source.kind = "audio" OR "video"
	    // TODO: add this to some datastructure of yours or a selection dialog
	    //if (source.label == cameraTopLabel) {cameraTop.label = source.label};
	    //if (source.label == cameraSolLabel) {cameraSol.label = source.label};
	    console.log("---------------");
	    console.log("source.kind -> " + source.kind );
	    console.log("source.label -> " + source.label);
	    console.log("source.id -> "+ source.id);
	  }
	  console.log("---------------");
	  return sources;
	}




	//console.log(sources);

	// And then when calling getUserMedia, specify the id in the constraints:
	/*
	var constraints = {
	  audio: {
	    optional: [{sourceId: selected_audio_source_id}]
	  },
	  video: {
	    optional: [{sourceId: selected_video_source_id}]
	  }
	};
	
	/**/// navigator.getUserMedia(constraints, onSuccessCallback, onErrorCallback);

}

console.log(listSources);
// console.log(cameraSol.label);
// options pour l'objet PeerConnection

var server = {'iceServers':[{'url':'stun:23.21.150.121'}]};
server.iceServers.push({url: 'stun:stun.l.google.com:19302'});
server.iceServers.push({url: 'stun:stun.anyfirewall.com:3478'});
server.iceServers.push({url: 'stun:turn1.xirsys.com'});
// Ajout de serveurs TURN
server.iceServers.push({url: "turn:turn.bistri.com:80", credential: "homeo", username: "homeo"});
server.iceServers.push({url: 'turn:turn.anyfirewall.com:443?transport=tcp', credential: 'webrtc', username: 'azkarproject'});
server.iceServers.push({url: "turn:numb.viagenie.ca", credential: "webrtcdemo", username: "temp20fev2015@gmail.com"});
server.iceServers.push({url: "turn:turn.anyfirewall.com:443?transport=tcp", credential: "webrtc", username: "webrtc"});
server.iceServers.push({url: "turn:turn1.xirsys.com:443?transport=tcp", credential: "b8631283-b642-4bfc-9222-352d79e2d793", username: "e0f4e2b6-005f-440b-87e7-76df63421d6f"});
// TODO: Tester les TURNS un par un pour déterminer celui qui fonctionne le mieux



var options = {
	optional: [
		{DtlsSrtpKeyAgreement: true},
		{RtpDataChannels: true} //required for Firefox
	]
}


// Création de l'objet PeerConnection (CAD la session de connexion WebRTC)
var pc = new PeerConnection(server, options);
// console.log("------pc = new PeerConnection(server, options);-----");
// console.log(pc);
var localStream = null;
var remoteStream = null;
var ws_remoteStream = null; // Stream transmit par websocket...

// constraints on the offer SDP. Easier to set these
// to true unless you don't want to receive either audio
// or video.
var constraints = {
	mandatory: {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true
    }
};

// define the channel var
var channel;
var debugNbConnect = 0;
var debugNbOffer = 0;
var debugNbOnOffer = 0;
// Si une renégociation à déjas eu lieu
// >> pour éviter de réinitialiser +sueurs fois le même écouteur
var isRenegociate = false;


// initialisation du localStream et lancement connexion
function initLocalMedia() {
	// get the user's media, in this case just video
	navigator.getUserMedia({video: true}, function (stream) {
		localStream = stream;
		console.log ("@ initLocalMedia()");
		//console.log (common.testObject(stream));
		video.src = URL.createObjectURL(localStream);
		pc.addStream(localStream);
		//console.log("localStream >> "+localStream);
		//console.log(localStream);
		//console.log (common.testObject(localStream));
		
		// set one of the video src to the stream
		//video.src = URL.createObjectURL(stream);
		//pc.addStream(stream);
		// now we can connect to the other peer
		connect();
	}, errorHandler);
};

initLocalMedia();







// initialisation de la connexion
function connect () {
	debugNbConnect += 1;
	console.log("@ connect("+debugNbConnect+") > rôle: " + type);
	isStarted = true;

	// Ecouteurs communs apellant/apellé
	// ---------------------------------
	
	// Ecouteurs de l'API WebRTC -----------------
	
	// Ecouteur déclenché à la génération d'un candidate 
	pc.onicecandidate = function (e) {
		// console.log("@ pc.onicecandidate()");
		// vérifie que le candidat ne soit pas nul
		if (!e.candidate) { 
			// console.log("  > !e.candidate): return ");
			return; 
		}
		// Réinitialise l'écouteur "candidate" de la connexion courante
		// pc.onicecandidate = null; // Provoque un BUG sur Openshift ! 
		// >>>>>> Et si on teste sans ???
		// >>>>>> en local > OK, c'est juste plus long... 
		// >>>>>> en ligne > OK en filaire... 
		// conclusion: Lé rinitialisation n'a d'intéret 
		// que pour réduire les délais de signaling des tests locaux
		// -----------------------------------------
		// Envoi du candidate généré à l'autre pair
		socket.emit("candidate", e.candidate);
	};


	// Ecouteur déclenché a la reception d'un remoteStream
	pc.onaddstream = function (e) {
		console.log("@ pc.onaddstream > timestamp:" + Date.now());
		remoteStream = e.stream;
		video2.src = URL.createObjectURL(remoteStream);
	};


	// Ecouteurs de changement de statut de connexion
	// Permet de déterminer si le pair distant s'est décionnecté.
	pc.oniceconnectionstatechange = function (e) {
		console.log("@ pc.oniceconnectionstatechange > timestamp:" + Date.now());
		console.log(">>> stateConnection Event > " + pc.iceConnectionState);
		console.log(">>> isStarted = "+ isStarted);
		// Statut connected: env 1 seconde de latence
		// Statut completed: env 13 secondes de latence
		// Statut deconnected: env 7 secondes de latence
		// Par contre, coté websocket, on est informé immédiatement d'une décco...
		// En utilisant l'ecouteur coté serveur. DONC : 
		// PLAN B > Utiliser Websocket +tôt que l'écouteur webRTC
		// Because c'est nettement plus rapide et réactif...
	};

	// Ecouteur ... // OK instancié...
	pc.onremovestream = function (e) {
		console.log ("@ pc.onremovestream(e) > timestamp:" + Date.now());
		console.log (e);
	}

	// Ecouteurs de l'API websocket -----------------

	// Réception d'un ICE Candidate
	socket.on("candidate", function(data) { 
		console.log(">> socket.on('candidate',...");
		// TODO : ici intercepter et filter le candidate
		// >> ex >>> if (candidate == stun) {addIceCandidate} else {return;}
		//console.log( ">>> candidate from ("+data.placeListe+")"+data.pseudo);    
		// console.log(data);
		pc.addIceCandidate(new IceCandidate(data.message)); // OK
	});

	// Réception d'une réponse à une offre
	socket.on("answer", function(data) { 
		console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
		console.log(">> socket.on('answer',...");
		//console.log( ">>> answer from ("+data.placeListe+")"+data.pseudo); 
		console.log(data.message);
		pc.setRemoteDescription(new SessionDescription(data.message));
	});

	// Réception d'une info de deconnexion 
	// >>> plus réactif que l'écouteur de l'API WebRTC
	socket.on("disconnected", function(data) { 
		console.log(">> socket.on('disconnected',...");
	    // On lance la méthode de préparatoire a la renégo
	    onDisconnect();
	});

	// Fonctions communes apellant/apellé
	
	function doAnswer(sessionDescription) {
		// Hack > correction Bub de renégo
		// objet MediaStream du sdp est vide si renégo
		// Plan B >> passer par websocket +tôt que par l'API WebRTC
		// Pour faire passer le localStram de l'apellé à l'apellant
		// socket.emit("stream", localStream);
		// ------------
		// 
		pc.setLocalDescription(sessionDescription);
		socket.emit("answer", sessionDescription);
	}


	function doOffer(sessionDescription) {
		  pc.setLocalDescription(sessionDescription);
		  socket.emit("offer", sessionDescription);
	}


	// Si on est l'apellant
	if (type === "appelant") { 
		console.log("+++++++++ apellant ++++++++++++++ ");
		
		// l'apellant crée un dataChannel
		channel = pc.createDataChannel("mychannel", {});
		// can bind events right away
		bindEvents();

		// création de l'offre SDP
		pc.createOffer(doOffer, errorHandler, constraints);

	
	// Sinon si on est l'apellé
	} else { 
		console.log("+++++++++ apellé ++++++++++++++ ");
		// dataChannel
		// answerer must wait for the data channel
		
		//console.log("channel: "+channel);
		// Ecouteur d'ouverture d'un data channel
		pc.ondatachannel = function (e) {
			channel = e.channel;
			console.log("pc.ondatachannel(e)... ");
			//console.log("channel: "+channel);
			bindEvents(); //now bind the events
		};
		/**/

		// L'apellé doit attendre de recevoir une offre SDP
		// avant de générer une réponse SDP
		// ---------------------------------
		// Ok au premier passage
		// BUG a la renégo > ne déclenches plus le onAddStream... 
		// FIX: réinstancier onAddStream après reinstanciation PeerConnection
		// BUG a la renégo > Envoie 2 answers...
		// Cause: L'écouteur de reception "offer"est instancié 2 fois...
		// FIX: ajout d'un flag "isRenegociate = false;" 
		if (isRenegociate == false) {
			socket.on("offer", function(data) { 	
				//console.log("(apellé)>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
				console.log( ">>> offer from ("+data.placeListe+")"+data.pseudo);
				//console.log (data.message);
				pc.setRemoteDescription(new SessionDescription(data.message));
				// Une foi l'offre reçue et celle-ci enregistrée
				// dans un setRemoteDescription, on peu enfin générer
				// une réponse SDP
				pc.createAnswer(doAnswer, errorHandler, constraints);	
			});	
		} 
		
	}
}

// A la déconnection du pair distant:
function onDisconnect () {

	console.log("@ onDisconnect()");
	
	// On vérifie le flag de connexion
	if ( isStarted == false) return;

	// on retire le flux remoteStream
	// video1.src="";
	video2.src="";
	
	/*// on modifie les variables de rôle (On prend le statut d'apellé)
	type = "appelé";
	otherType = "appelant";
	console.log("Vous êtes maintenant l'"+type);
	/**/
	
	// on coupe le RTC Data channel
	if (channel) channel.close();
	channel = null;
	
	// On vide et on ferme la connexion courante
	// pc.onicecandidate = null;
	pc.close();
	pc = null;
	stopAndStart();
}

// Fermeture et relance de la connexion p2p par l'apellé (Robot)
function stopAndStart() {
  
  	console.log("@stopAndStart()");
 	dataChannelSend.disabled = true;
  	dataChannelSend.placeholder = "RTCDataChannel close";
  	sendButton.disabled = true; 

  	pc = new PeerConnection(server, options);
  	console.log("------pc = new PeerConnection(server, options);-----");

  	// On informe la machine à état que c'est une renégociation
  	isRenegociate = true;	
  	// On relance le processus
  	initLocalMedia();
  	connect();
};

// -------------------- Méthodes RTCDataChannel

// bind the channel events
function bindEvents () {
	
	// écouteur d'ouverture
	channel.onopen = function () { 
		//console.log("RTCDataChannel is Open");
		dataChannelSend.disabled = false;
    	dataChannelSend.focus();
    	dataChannelSend.placeholder = "RTCDataChannel is Open !";
    	sendButton.disabled = false; 
    	//isStarted = true;
    	//console.log("isStarted = "+ isStarted);
	};
	
	// écouteur de reception message
	channel.onmessage = function (e) {
		// add the message to the chat log
		chatlog.innerHTML += "<div>l'" +type+" écrit:"+ e.data + "</div>";
	};
}

// send a message the textbox throught
// the data channel for a chat program
function sendMessage () {
	var msg = message.value;
	channel.send(msg);
	message.value = "";
}
