// Contrôle des méthodes communes client/serveur
var commonTest = common.test();
console.log(commonTest + " correctement chargé coté client !!!");

// variables diverses
var myPlaceListe = 0;
var nbUsers = 0;

// Flags divers
var isServerInfoReceived = false; 

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
if (!pseudo) { pseudo = "";}
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
    $('#zone_chat').prepend('<p><em>(' +data.placeListe+')'+ data.pseudo + ' à rejoint le Chat !</em></p>');
})

// Quand on reçoit un message, on l'insère dans la page
socket.on('message', function(data) {
    console.log(">> socket.on('message',...");
    insereMessage(data.pseudo, data.message, data.placeListe)
})

// Quand on reçoit un message de service
socket.on('service', function(data) {
    console.log(">> socket.on('service',...");
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

// --------- WebRTC ---------------------------------------------

// Déclaration des constraints pour l'audio et la vidéo
// Note: Les constraints de taille ne semblent actuellement pas prises en compte dans Mozzilla
var constraints = {
  audio:true,
  video: {
    mandatory: {
      maxWidth: 302,
      maxHeight: 168
    }
  }
};

// Set up audio and video regardless of what devices are present.
var sdpConstraints = {'mandatory': {
  'OfferToReceiveAudio':true,
  'OfferToReceiveVideo':true }};

// Déclaration avec plusieurs préfixes de l'api de flux getUserMedia
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

//var signalingChannel = new SignalingChannel();
var configuration = { "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] };
var pc;

// call start() to initiate
function start() {
    // alert ("start()");
    console.log('start()');
    pc = new RTCPeerConnection(configuration);

    // socket.emit('signaling', "prout");

    // send any ice candidates to the other peer
    pc.onicecandidate = function (evt) {
        console.log("@ pc.onicecandidate...");
        if (evt.candidate) {
            
            // socket.send(JSON.stringify({ "candidate": evt.candidate }));
            var candidate = JSON.stringify({ "candidate": evt.candidate });
            socket.emit('signaling', candidate);
        }
    };

    // let the "negotiationneeded" event trigger offer generation
    pc.onnegotiationneeded = function () {
        console.log("@ pc.onnegotiationneeded...");
        pc.createOffer().then(function (offer) {
            return pc.setLocalDescription(offer);
        })
        .then(function () {
            // send the offer to the other peer
            // socket.send(JSON.stringify({ "sdp": pc.localDescription }));
            var sdp = JSON.stringify({ "sdp": pc.localDescription });
            console.log (sdp);
            socket.emit('signaling', sdp);
        })
        .catch(logError);
    };

    // once remote stream arrives, show it in the remote video element
    pc.onaddstream = function (evt) {
        alert ("onaddStream");
        remoteView.srcObject = evt.stream;
    };

    /*// get a local stream, show it in a self-view and add it to be sent
    navigator.mediaDevices.getUserMedia({ "audio": true, "video": true }, function (stream) {
        selfView.srcObject = stream;
        pc.addStream(stream);
    }, logError);
    /**/

    // Récupération du flux audio et vidéo local grâce à getUserMedia
    navigator.getUserMedia(constraints, function (stream) {
            pc.addStream(stream);
            // On envoie la vidéo locale au document html
            var local_video = document.getElementById('localVideo');
            local_video.src = window.URL.createObjectURL(stream);
        }, logError);


}


// socket.onmessage = function (evt) {
socket.on('signaling', function(evt) {
    console.log(">> socket.on('signaling',...");
    if (!pc) start();

    /*
    var message = JSON.parse(evt.data);
    if (message.sdp) {
        var desc = new RTCSessionDescription(message.sdp);

        // if we get an offer, we need to reply with an answer
        if (desc.type == "offer") {
            pc.setRemoteDescription(desc).then(function () {
                return pc.createAnswer();
            })
            .then(function (answer) {
                return pc.setLocalDescription(answer);
            })
            .then(function () {
                //socket.send(JSON.stringify({ "sdp": pc.localDescription }));
                var sdp = JSON.stringify({ "sdp": pc.localDescription });
                socket.emit('signaling', sdp);
            })
            .catch(logError);
        } else
            pc.setRemoteDescription(desc).catch(logError);
    } else
        pc.addIceCandidate(new RTCIceCandidate(message.candidate)).catch(logError);
    /**/
// };
})



function logError(error) {
    console.log(error.name + ": " + error.message);
}

// Quand on reçoit une mise a jour de la liste des utilisateurs
socket.on('updateUsers', function(data) {
    console.log(">> socket.on('updateUsers',...");
    // Si on est seul et qu'on as pas déjà instancié la connexion
    // Autrement dit, si on est le premier dans la session...
    if (!pc) {
        start(); // on démmarre 
    };
})