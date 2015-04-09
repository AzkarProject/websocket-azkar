
// Contrôle des méthodes communes client/serveur
var commonTest = common.test();
console.log(commonTest + " correctement chargé coté client !!!");

// Flags divers
var isServerInfoReceived = false; 

// variables diverses
var otherPeerPseudo = "???";
var myPlaceListe = 0;


// Fonctions websocket générales -----------------------------

// Initialisation du canal de signalisation
var socket = io.connect();


// Pour contrôle hosting
// Affichage des variables d'environnement serveur ds la partie cliente
socket.on('infoServer', function(data) {
  if (!isServerInfoReceived) {
      isServerInfoReceived = true; 
      console.log(">> socket.on('infoServer', function(data)");
      console.log(" Infos serveur: " + data);
      $('#zone_info_server').prepend(data);
  }
})


// Fonctions websocket dédiées au tchat ---------------------------


// On demande le pseudo, on l'envoie au serveur et on l'affiche dans le titre
var pseudo = prompt('Quel est votre pseudo ?');
if (!pseudo) { pseudo = "?????";}
socket.emit('nouveau_client', pseudo);
document.title = pseudo + ' - ' + document.title;

// Updater le pseudo local (pour le fun...)
socket.on('position_liste', function(placeListe) {
     myPlaceListe = placeListe;
     console.log ("Ordre d'arrivée dans la session websocket: "+placeListe);
     document.title = "("+myPlaceListe+") " + document.title;
})


// Quand un nouveau client se connecte, on affiche l'information
socket.on('nouveau_client', function(data) {
    console.log(">> socket.on('nouveau_client', function(pseudo)");
    // otherPeerPseudo = pseudo; 
    $('#zone_chat').prepend('<p><em>(' +data.placeListe+')'+ data.pseudo + ' à rejoint le Chat !</em></p>');
})



// Quand on reçoit un message, on l'insère dans la page
socket.on('message', function(data) {
    console.log(">> socket.on('message', function(data)");
    insereMessage(data.pseudo, data.message, data.placeListe)
})


// Quand on reçoit un message de service
socket.on('service', function(data) {
    console.log(">> socket.on('message', function(data)");
    insereMessage(data.pseudo, data.message);
})


// ----------- Méthodes jquery d'affichage du tchat

// Lorsqu'on envoie le formulaire, on transmet le message et on l'affiche sur la page
$('#formulaire_chat').submit(function () {
    var message = $('#message').val();
    socket.emit('message', message); // Transmet le message aux autres
    insereMessage(pseudo, message, myPlaceListe); // Affiche le message aussi sur notre page
    $('#message').val('').focus(); // Vide la zone de Chat et remet le focus dessus
    return false; // Permet de bloquer l'envoi "classique" du formulaire
});

// Ajoute un message dans la page
function insereMessage(pseudo, message, placeListe) {
    $('#zone_chat').prepend('<p><strong>('+placeListe+') '+ pseudo + '</strong> ' + message + '</p>');
    console.log ((pseudo + " >> " + message));
}

// --------- / Méthodes Jquery ---------------------------------------------



// -------------------------------------------------------
// WebRTC ------------------------------------------------


// On renseigne les serveurs STUN et TURN
// Note Sécurité: Se démerder pour que les serveurs TURN et STUN
// N'apparaissent plus dans le code source visible de l'appli
var ice = {"iceServers": [
    {"url": "stun:stunserver.com:12345"}
  ]};

// On initialise une connexion ( un objet "connexion")
// Initialize peer connection object
var pc = new RTCPeerConnection(ice);

// Déclaration avec plusieurs préfixes de l'api de flux getUserMedia
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;


// Déclaration des constraints pour la vidéo
// TODO: Les constraintzs ne semblent pas prises en compte par Mozzilla
var constraints = {
  audio:true,
  video: {
    mandatory: {
      maxWidth: 302,
      maxHeight: 168
    }
  }
};


// On récupère le flux audio et vidéo local grace a getUserMedia
navigator.getUserMedia(constraints, gotStream, logError);

// Callback en cas d'echec de getUserMedia()
function logError(error) {
      console.log("@ logError(error)");
      console.log("getUserMedia error: " + error);
};


// Callback en cas de succès de getUserMedia()
function gotStream(evt) {
    console.log("@ pc.gotStream(evt)");
    // Contrôle de l'objet envoyé dans addStream
    // common.traceObjectDump(evt,'evt'); // Débugg > OK

    // Register local MediaStream with peer connection
    // On ajoute le stream local à la connexion
    // pc.addStream(evt.stream);
    pc.addStream(evt);
    
    // Output local video stream to video element (self view)
    // On envoie la vidéo locale au document html
    var local_video = document.getElementById('localVideo');
    local_video.src = window.URL.createObjectURL(evt);

    
    // A n'executer que par l'apellant ??? Pas si sur...
    // ------------------------------------------------------
    // On génère une offre SDP décrivant la connexion du pair 
    // et on l'envoie a l'autre pair.
    pc.createOffer(setLocalSdpAndSendMessage, null, constraints);

}

// Function from codelab7...
// Création d'un SDP puis envoi aux autres connectés
function setLocalSdpAndSendMessage(sessionDescription) {
  
  // Apply local session description: initiates ICE gathering process
  pc.setLocalDescription(sessionDescription);
  
  // Envoi par WebSocket
  console.log( ">> ("+myPlaceListe+")"+pseudo+" envoie une offre!!!");
  socket.emit('offer',sessionDescription); 
  // socket.emit('offre', {message: sessionDescription, placeListe: socket.placeListe});

  // console.log("Offer with ICE candidates: ");
  // console.log(sessionDescription);
  // Bug ???
  // socket.broadcast.emit('offer',sessionDescription);
  // contôle de l'objet sdp en emission
  // common.traceObjectDump(sessionDescription,"socket.emit('offer',sessionDescription)");
}




// Output remote video stream to video element (remote view)
// On envoie la vidéo distante au document html
pc.onaddstream = function (evt) {
    console.log("@ pc.onaddstream(evt)");
    var remote_video = document.getElementById('remoteVideo');
    remote_video.src = window.URL.createObjectURL(evt);
}




// -- Signaling par websocket ---------------------------------------------------

// Trickle ICE candidates to the peer via the signaling channel
// Insérer les Ices Candidates dans le 
pc.onicecandidate = function(evt) {
  
  console.log("@ pc.onicecandidate(evt)");  
  
  console.log(evt.target.iceGatheringState)  
  // console.log(evt);
  // Subscribe to ICE events and listen for ICE gathering completion
  if (evt.target.iceGatheringState == "complete") {
        pc.createOffer(setLocalSdpAndSendMessage, null, constraints);
        // pc.createAnswer(setLocalSdpAndSendMessage, null, constraints);
  }

    
  //common.traceObjectDump(evt,'onicecandidate(evt)'); // Débugg
  // common.testObject(evt); Affiche l'objet en intégralité
  // console.log(evt); // Affiche l'objet directement
  if (evt) {
    // signalingChannel.send(evt.candidate);
    // socket.send(evt.candidate);
    socket.emit('candidate',evt.candidate); // bug ???
    // console.log (">> socket.emit('candidate',evt.candidate)"); 
    //socket.emit('candidate',evt);
  }


/**/


// Quand on reçoit un message 'candidate'
// On enregistre l'ICE candidate pour commencer tests de connexion
// Register remote ICE candidate to begin connectivity checks
socket.on('candidate', function(msg) { 
   console.log(">> socket.on('candidate', function(msg)");
   console.log(msg);
   // if (msg.candidate) {
   if (msg) {
      // common.traceObjectDump(msg,'socket.on(candidate)'); // Débugg
      // pc.addIceCandidate(msg.candidate); // Bug !
      // Message d'erreur >>>>
      // Uncaught TypeMismatchError: Failed to execute 'saddIceCandidate' on 'RTCPeerConnection': 
      // The 1st argument provided is either null, or an invalid RTCSessionDescription object.
      // -----------------------
      pc.addIceCandidate(new RTCIceCandidate(msg)); // C'est OK en instanciant l'objet...
   }
})
/**/


// Quand on reçoit un message "offer"
socket.on('offer', function(data) { 
    console.log( ">> ("+myPlaceListe+")"+pseudo+" reçois une offre de ("+data.placeListe+")"+data.pseudo);
    // contôle de l'objet sdp en réception
    // common.traceObjectDump(data.message,'socket.on(offer) > data.message'); // OK. conforme a l'objet émis
    // pc.setRemoteDescription(data.message); // BUG
    // pc.setRemoteDescription(data.message.sdp); // BUG
    // Message d'erreur >>>>
    // Uncaught TypeMismatchError: Failed to execute 'setRemoteDescription' on 'RTCPeerConnection': 
    // The 1st argument provided is either null, or an invalid RTCSessionDescription object.
    // -----------------------
    pc.setRemoteDescription(new RTCSessionDescription(data.message)); // OK - Fallait instancier !!!
})
/**/

// Fin Signaling par websocket --------------------------------------------







 