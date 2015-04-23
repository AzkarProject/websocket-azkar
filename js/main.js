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
var video1 = document.getElementById("video");
var video2 = document.getElementById("otherPeer");


// dataChannel elements
var chatlog = document.getElementById("chatlog");
var message = document.getElementById("dataChannelSend");


// Gestion des messages d'erreur
function errorHandler (err) {
	console.error(err);
}


// pré-signaling -------------------------------------------------

// sélecteurs de micros et caméras
var local_AudioSelect = document.querySelector('select#local_audioSource');
var local_VideoSelect = document.querySelector('select#local_videoSource');


// sélecteurs de micros et caméras (robot) affiché coté pilote 
var remote_AudioSelect = document.querySelector('select#remote_audioSource');
var remote_VideoSelect = document.querySelector('select#remote_videoSource');


// Désativation préalable des sélecteurs
if (type == "appelant") {
	local_ButtonDevices.disabled = true; 
}



local_AudioSelect.disabled = true; 
local_VideoSelect.disabled = true; 

if (type == "appelant") {
	remote_ButtonDevices.disabled = true; 
	remote_AudioSelect.disabled = true; 
	remote_VideoSelect.disabled = true; 
}

// Liste des sources cam/micro
var listeLocalSources = {};
var listeRemoteSources = {};
// flag d'origine des listes (local/remote)
var origin = null; 

// Bug qd --media-fake-ui activé sur Chromium...
// ----> le listeLocalSources n'est pas rempli...
function toObject(arr) {
  var rv = {};
  
  for (var i = 0; i < arr.length; ++i)
    
    rv[i] = arr[i];
  


  return rv;
}

function convertChromiumArrayToObject(arr) {
  var rv = {};
  
  for (var i = 0; i < arr.length; ++i)
    
    rv[i] = arr[i];
  


  return rv;
}



// Génération liste de sélection sources (cam/micro) 
// disponibles localement et a distance
function gotSources(sourceInfos) {
  
  // Si sources locales (pilote)
  if (origin == "local") {
  		listeLocalSources = sourceInfos; 
  	
  // Si sources distantes (Robot)
  } else if (origin == "remote") {
  		listeRemoteSources = sourceInfos;
  
  }

  for (var i = 0; i !== sourceInfos.length; ++i) {
    
    var sourceInfo = sourceInfos[i];
    var option = document.createElement('option');
    option.id = sourceInfo.id;
    option.value = sourceInfo.id;
  	
    // Reconstruction de l'objet sourceInfo
    // qui, pour une raison inconnue, n'est pas transmissible
    // tel quel par websocket quand il est construit sous Crhomium (V.44.0.2371.0).
    // Par contre, R.A.S quans il est construit sous Crhome ( V.42.0.2311.90) 
  	var sourceDevice = new common.sourceDevice();
  	sourceDevice.id = sourceInfo.id;
    sourceDevice.label= sourceInfo.label;
    sourceDevice.kind = sourceInfo.kind;
    sourceDevice.facing = sourceInfo.facing;
    sourceInfos[i] = sourceDevice;

    
    if (sourceInfo.kind === 'audio') {
      	
      	if (origin == "local") {	
	      	option.text = sourceInfo.label || 'microphone ' + (local_AudioSelect.length + 1);
	      	local_AudioSelect.appendChild(option);
	   	
	   	} else if (origin == "remote") {
	   		option.text = sourceInfo.label || 'microphone ' + (remote_AudioSelect.length + 1);
	      	remote_AudioSelect.appendChild(option);
	  	}
	
    
    } else if (sourceInfo.kind === 'video') {
      
      	if (origin == "local") {
		    option.text = sourceInfo.label || 'caméra ' + (local_VideoSelect.length + 1);
		    local_VideoSelect.appendChild(option);
  		
  		} else if (origin == "remote") {
   			option.text = sourceInfo.label || 'caméra ' + (local_VideoSelect.length + 1);
		    remote_VideoSelect.appendChild(option);
   		}
    
    } else {
      
      console.log('Some other kind of source: ', sourceInfo);
    
    }
  }
  // On fait un RAZ du flag d'origine
  origin = null;
}


// Quand on reçoit une mise à jour de la liste 
// des connectés de cette session websocket
// C.A.D un nouvel arrivant...
socket.on('updateUsers', function(data) {
    console.log(">> socket.on('updateUsers',...");
    
    // On renvoie à l'autre pair la liste de ses devices
    if (type == "appelé") {
    	console.log("contenu listeLocalSources >>> " + listeLocalSources);

    	socket.emit("remoteListDevices", listeLocalSources);
    }

})



// Quand on reçoit liste des devices distants
// ( Seulement si on est l'apellant (pilote) )
if (type == "appelant") {
	
	// Reception de la liste 
	socket.on('remoteListDevices', function(data) {
	    console.log(">> socket.on('remoteListDevices',...");
	    
	    console.log(data);
	    console.log("--------------------------------------");

	    // On renseigne  le flag d'ogigine
	    origin = "remote";

	    // On alimente les listes de micro/caméra distantes
	    gotSources(data.message);

	    // On active les sélecteurs de listes
		remote_ButtonDevices.disabled = false; 
		remote_AudioSelect.disabled = false; 
		remote_VideoSelect.disabled = false; 
	})

	// Reception du signal de fin pré-signaling
	socket.on("readyForSignaling", function(data) {
		if (data.message == "ready") {
			initLocalMedia();
		}
	})

}


// Quand on recoit les devices selectionnés par le pilote
if (type == "appelé") {
	
	socket.on('selectedRemoteDevices', function (data) {
		
		console.log(">> socket.on('selectedRemoteDevices',...");

		console.log(data);
	    console.log("--------------------------------------");   

		// On rebalance au formulaire les caméras/micros choisies par le pilote
		document.getElementById(data.message.selectAudio).selected = "selected";
		document.getElementById(data.message.selectVideo).selected = "selected";

		// TODO: On lance l'initlocalmedia
		initLocalMedia();

		var infoMessage = "<strong> Micro/Camera -- Activés</strong>"
		document.getElementById("messageDevicesState").innerHTML = infoMessage;
		// On rebalance a l'appelant le top-départ pour 
		// Qu'il lance son intilocalMedia de son  coté....
		socket.emit("readyForSignaling","ready");

	})
}

/**/// --------------------

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







// Ecouteurs des changements de sélection
//audioSelect.onchange = initLocalMedia;
//videoSelect.onchange = initLocalMedia;

// Lancement de la récupération des Devices disponibles
if (typeof MediaStreamTrack === 'undefined') {
  	alert('This browser does not support MediaStreamTrack.\n\nTry Chrome.');
} else {
  	origin = "local";
  	MediaStreamTrack.getSources(gotSources);
}

// initialisation du localStream et lancement connexion
function initLocalMedia() {


 	// Récupération des caméras et micros selectionnés	
	var audioSource = local_AudioSelect.value;
	var videoSource = local_VideoSelect.value;
	
	var constraint = 	{	audio: { 
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
		
	
	//console.log("audioSource sourceId: "+ audioSource);
	//console.log("videoSource sourceId: "+ videoSource);

	
	//console.log("--------- OBJET sourceInfos >-------------")
	//console.log(listeLocalSources);
	//console.log("--------- /OBJET sourceInfos -------------")

	// Initialisdation du localStream et lancement connexion
	navigator.getUserMedia(constraint, function (stream) {
		// alert ("Allow Open Camera"); // Utile si crhromium en mode media-fake-ui...
		// common.AlertObjectDump(constraints, "constraint")
		localStream = stream;
		console.log ("@ initLocalMedia()");
		
		//console.log (common.testObject(stream));
		//if (type == "appelant") {
			video1.src = URL.createObjectURL(localStream);
		//}
			pc.addStream(localStream);
		//}
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


function remoteManageDevices () {
	// On active les sélecteurs locaux
	if (type == "appelant") {
		local_ButtonDevices.disabled = false; 
	}

	local_AudioSelect.disabled = false; 
	local_VideoSelect.disabled = false; 
}


// Sélecteur locaux: 
// Envoi commande Ouverture Caméra et micro 
function localManageDevices () {
	if (type == "appelant") {
		local_ButtonDevices.disabled = true; 
	}

	local_AudioSelect.disabled = true; 
	local_VideoSelect.disabled = true; 

	remote_ButtonDevices.disabled = true; 
	remote_AudioSelect.disabled = true; 
	remote_VideoSelect.disabled = true; 

	// On balance coté robot les devices sélectionnés...
    if (type == "appelant") {
    	var selectAudio = remote_AudioSelect.value;
		var selectVideo = remote_VideoSelect.value;
		var selectList = {selectAudio,selectVideo}
    	socket.emit("selectedRemoteDevices", selectList);
    }
}


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
		// getStats(pc);
		console.log("@ pc.onaddstream > timestamp:" + Date.now());
		//if (type == "appelant") {
			remoteStream = e.stream;
			video2.src = URL.createObjectURL(remoteStream);
		//}

		//remoteStream = e.stream;
		//video2.src = URL.createObjectURL(remoteStream);
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

		// TEST: A la reception d'un statut "completed"
		// On vide les IceCandidates...


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
	video1.src="";
	video2.src="";
	
	//videoElement.src = null;
    //window.stream.stop();



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
  	// initLocalMedia();
  	// connect();



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

