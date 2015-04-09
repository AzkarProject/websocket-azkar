// Contrôle des méthodes communes client/serveur
var commonTest = common.test();
console.log(commonTest + " correctement chargé coté client !!!");

// Flags divers
var isServerInfoReceived = false; 

// variables diverses
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

// ------------------ Tiré de l'Exemple 4 du WebRTC 1.0 draft ---------------
//                 http://www.w3.org/TR/webrtc/#simple-example

var configuration = { "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] };
var pc;

// call start() to initiate
function start() {
    console.log("@ start()");
    pc = new RTCPeerConnection(configuration);

    // Dès qu'un Ice Candidate est généré localement, 
    // ca déclenche un callback onicecandidate
    // afin que l'on puisse faire passer cet Ice Candidate 
    // à l'autre pair.
    pc.onicecandidate = function (evt) {
        console.log("@ ----- pc.onicecandidate(evt)"); 
        //console.log( ">>> ("+myPlaceListe+")"+pseudo+" génère un Ice Candidate");
        
        // - récupération de l'état de la connexion
        // var connexionStatut = pc.iceConnectionState; 
        // console.log("iceConnectionState = " + connexionStatut);
        // console.log("iceGatheringState = " + evt.target.iceGatheringState);  
        
        if (evt.candidate) socket.emit('candidate',evt.candidate);
     };


    // let the "negotiationneeded" event trigger offer generation
    // The browser wishes to inform the application that session 
    // negotiation should now be done (i.e. a createOffer call followed by setLocalDescription).
    pc.onnegotiationneeded = function () {
        console.log("@ ----- pc.onnegotiationneeded()");
        console.log( ">>> ("+myPlaceListe+")"+pseudo+" envoie une offre!!!");
        // On génère une offre SDP décrivant la connexion du pair 
        // et on l'envoie a l'autre pair.
        pc.createOffer(doOffer, logError, constraints); // Avec constraints seul
        //pc.createOffer(doOffer, logError, sdpConstraints); // Avec sdpConstraints seul
        //pc.createOffer(doOffer, logError, mergeConstraints); // Avec merge constraints/sdpConstraint
        
    };

    // Ecouteur déclenché a la réception d'un stream distant
    // c.a.d à l'instanciation d'un pc.setRemoteDescription(offer)
    // suite a la reception d'un offre
    // JE SUIS BLOQUE SUR CETTE SAL.. DE.. M... DEPUIS 1 SEMAINE !!!
    // Le pc.setRemoteDescription(offer) ne déclenches pas ce onaddStream!!!
    // Le "offer" semble pourtant correctement construit...
    // J'ai testé en construisant le offer avec "constraint" "sdpConstraint"
    // J'ai aussi testé en utilisant la syntaxe vue ds le codelab7
    // A savoir un merge de "constraints" et "sdpConstraints" >>> Tjrs rien !!!!!
    // ---------------------------------------------------------------------------
    // This event handler, of event handler event type addstream, 
    // must be fired by all objects implementing the RTCPeerConnection interface. 
    // It is called any time a MediaStream is added by the remote peer. 
    // This will be fired only as a result of setRemoteDescription. 
    // Onnaddstream happens as early as possible after the setRemoteDescription. 
    // This callback does not wait for a given media stream 
    // to be accepted or rejected via SDP negotiation.
    pc.onaddstream = function (evt) {
        alert("évènement onaddstream détecté"); // >>> BUG ! n'est jamais apellé !!!
        //console.log("@ ------ pc.onaddstream(evt)");
        var remote_video = document.getElementById('remoteVideo');
        remote_video.src = window.URL.createObjectURL(evt);
     };
     
    // Récupération du flux audio et vidéo local grâce à getUserMedia
    navigator.getUserMedia(constraints, function (stream) {
            pc.addStream(stream);
            // On envoie la vidéo locale au document html
            var local_video = document.getElementById('localVideo');
            local_video.src = window.URL.createObjectURL(stream);
        }, logError);

}; // ----------- End start();


function doOffer(offerSDP) {
    // var offerSDP = new RTCSessionDescription(offerSDP)
    pc.setLocalDescription(offerSDP);
    // console.log('offer sdp', offerSDP.sdp);
    console.log('@doOffer(offerSDP) > emit sdp type:'+ offerSDP.type);
    socket.emit('offer',offerSDP);
};

function doAnswer(answerSDP) {
    // var offerSDP = new RTCSessionDescription(offerSDP)
    // pc.setRemoteDescription(answerSDP);
    // console.log('offer sdp', offerSDP.sdp);
    console.log('@doAnswer(answerSDP) > emit sdp type:'+ answerSDP.type);
    //pc.setLocalDescription(sessionDescription);
    // pc.createAnswer(setLocalAndSendMessage, null, sdpConstraints);

    socket.emit('answer',answerSDP);
};

// ----- Traitement des erreurs
function logError(error) {
    console.log("@ logError(error)");
    console.log(error);
    // log(error.name + ": " + error.message);
}


// Si peerConnection n'est pas instancié
// on lance la méthode d'initialisation
if (!pc) start();

// --- Messages de signaling websocket

// Récéption d'une offre
socket.on('offer', function(data) { 
    console.log(">> socket.on('offer',...");
    console.log( ">>> ("+myPlaceListe+")"+pseudo+" reçois une offre de ("+data.placeListe+")"+data.pseudo);    
    
    // pc.createAnswer(doAnswer, logError, sdpConstraints); /: >>> BUG
    // BUG >>>> "CreateAnswer can't be called before SetRemoteDescription."

    /*
    var remoteSDP = new RTCSessionDescription(data.message);
    pc.setRemoteDescription(remoteSDP);
    pc.createAnswer(doAnswer, logError, sdpConstraints); 
    /**/// BUG >>>> "CreateAnswer can't be called before SetRemoteDescription."

    
    pc.createAnswer(doAnswer, logError, sdpConstraints);
    var remoteSDP = new RTCSessionDescription(data.message);
    pc.setRemoteDescription(remoteSDP);
    /**/// BUG >>>> "CreateAnswer can't be called before SetRemoteDescription."



    /*
    var desc = new RTCSessionDescription(sdpConstraints); // desc est null...
    console.log(desc);
    console.log('type', desc.type);
    socket.emit('answer',desc);
  /**/

    // pc.createAnswer(doAnswer, logError, sdpConstraints);

    /*
    pc.setRemoteDescription(getRemoteDesc, logError, desc);
    getRemoteDesc = function (desc) {
            alert ("hein ???");
            // pc.setRemoteDescription(desc);
    };
    /**/

        /*
        pc.createOffer(getOfferSDP, logError, sdpConstraints);
        
        function getOfferSDP(offerSDP) {
            //var offerSDP = new RTCSessionDescription(offerSDP)
            pc.setLocalDescription(offerSDP);
            // console.log('offer sdp', offerSDP.sdp);
            console.log('type', offerSDP.type);
            socket.emit('offer',offerSDP);
        };
        /**/
        




    //console.log(data.message);
    //pc.setRemoteDescription(data.message);


   // console.log(data);
   // console.log(desc);
   
    // pc.createAnswer(setLocalSdpAndSendAnswer); 
    // >> ne fait rien...
    // pc.createAnswer(setLocalSdpAndSendAnswer, null, constraints); 
    // >> Uncaught TypeError: Failed to execute 'createAnswer' on 'RTCPeerConnection': Malformed constraints object.
    // pc.createAnswer(setLocalSdpAndSendAnswer, null, sdpConstraints); 
    // >> ne fait rien...
    // doAnswer(); // Même en passant par les méthodes du Codelab7 > answer toujours pas envoyé pas envoyé...

}) 

// Réception d'une réponse a une offre
socket.on("answer", function(data) { 
    console.log(">> socket.on('answer',...");
    // console.log(data.message);
    //var desc = new RTCSessionDescription(data.message);
    //pc.setRemoteDescription(desc)
    alert ("réception réponse");
})

// Réception d'un ICE Candidate
socket.on("candidate", function(data) { 
    console.log(">> socket.on('candidate',...");
    // console.log(data);
   	// console.log( ">>> candidate from ("+data.placeListe+")"+data.pseudo);    
	pc.addIceCandidate(new RTCIceCandidate(data.message)); // OK

})

