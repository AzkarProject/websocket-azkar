
// Contrôle des méthodes communes client/serveur
var commonTest = common.test();
console.log(commonTest + " correctement chargé coté client !!!");


// Fonctions websocket générales -----------------------------

// Initialisation du canal de signalisation
// Initialize shared signaling channel
var socket = io.connect();


// Pour contrôle hosting
// Affichage des variables d'environnement serveur ds la partie cliente
// Todo: n'afficher q'une foi par client...
// par exemple, une balise dédiée a cet affichage
// si elle est vide, on la rempli
// Si elle est déjà remplie, on ne fait rien...
// Et comme ca on peut alléger les messages de la console
socket.on('infoServer', function(data) {
    console.log(" Infos serveur: " + data);
})


// Fonctions websocket dédiées au tchat ---------------------------


// On demande le pseudo, on l'envoie au serveur et on l'affiche dans le titre
var pseudo = prompt('Quel est votre pseudo ?');
socket.emit('nouveau_client', pseudo);
document.title = pseudo + ' - ' + document.title;

// Quand on reçoit un message, on l'insère dans la page
socket.on('message', function(data) {
    insereMessage(data.pseudo, data.message)

})

// Quand un nouveau client se connecte, on affiche l'information
socket.on('nouveau_client', function(pseudo) {
    $('#zone_chat').prepend('<p><em>' + pseudo + ' a rejoint le Chat !</em></p>');
})


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
var constraint = {
  audio:true,
  video: {
    mandatory: {
      maxWidth: 302,
      maxHeight: 168
    }
  }
};


// On récupère le flux audio et vidéo local grace a getUserMedia
// Acquire local audio and video streams
//navigator.getUserMedia({ "audio": true, "video": true }, gotStream, logError);
navigator.getUserMedia(constraint, gotStream, logError);

// Callback en cas d'echec de getUserMedia()
function logError(error) {
      console.log("getUserMedia error: " + error);
};


// Callback en cas de succès de getUserMedia()
function gotStream(evt) {
    
    // Contrôle de l'objet envoyé ds addStream
    // common.traceObjectDump(evt,'evt'); // Débugg

    // Register local MediaStream with peer connection
    // On ajoute le stream local à la connexion
    // pc.addStream(evt.stream);
    pc.addStream(evt);
    // Output local video stream to video element (self view)
    // On envoie la vidéo locale au document html
    var local_video = document.getElementById('localVideo');
    local_video.src = window.URL.createObjectURL(evt);

    // On génère une offre SDP décrivant la connexion du pair 
    // et on l'envoie a l'autre pair.
    // Generate SDP offer describing peer connection and send to peer
    pc.createOffer(function(offer) {
            pc.setLocalDescription(offer);
            // signalingChannel.send(offer.sdp);
            socket.emit('offer',offer.sdp);
    });
}


// Output remote video stream to video element (remote view)
// On envoie la vidéo distante au document html
pc.onaddstream = function (evt) {
    var remote_video = document.getElementById('remoteVideo');
    remote_video.src = window.URL.createObjectURL(evt);
}
/**/



// -- Signaling par websocket ---------------------------------------------------

// Trickle ICE candidates to the peer via the signaling channel
pc.onicecandidate = function(evt) {
    // common.traceObjectDump(evt,'onicecandidate(evt)'); // Débugg
    if (evt.candidate) {
      // signalingChannel.send(evt.candidate);
      // socket.send(evt.candidate);
      socket.emit('candidate',evt.candidate);
    }
}


// Quand on reçoit un message 'candidate'
// On enregistre l'ICE candidate por commencer tests de connexion
// Register remote ICE candidate to begin connectivity checks
socket.on('candidate', function(msg) { 
   if (msg.candidate) {
      common.traceObjectDump(msg,'socket.on(candidate)'); // Débugg
      pc.addIceCandidate(msg.candidate);
   }
})



// Quand on reçoit un message "offer"
socket.on('createOffer', function(msg) { 
    pc.setRemoteDescription(msg.offer);
})




// Fin Signaling par websocket --------------------------------------------



// ----------------------------------------------------------------------------------
// ----------- Méthodes jquery d'affichage du tchat

// Lorsqu'on envoie le formulaire, on transmet le message et on l'affiche sur la page
$('#formulaire_chat').submit(function () {
    var message = $('#message').val();
    socket.emit('message', message); // Transmet le message aux autres
    insereMessage(pseudo, message); // Affiche le message aussi sur notre page
    $('#message').val('').focus(); // Vide la zone de Chat et remet le focus dessus
    return false; // Permet de bloquer l'envoi "classique" du formulaire
});

// Ajoute un message dans la page
function insereMessage(pseudo, message) {
    $('#zone_chat').prepend('<p><strong>' + pseudo + '</strong> ' + message + '</p>');
    console.log ((pseudo + " >> " + message));
}

// --------- / Méthodes Jquery ---------------------------------------------



 