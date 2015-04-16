// Fonctions websocket générales -----------------------------
// Flags divers
var isServerInfoReceived = false; 


// Contrôle des méthodes communes client/serveur
var commonTest = common.test();
console.log(commonTest + " correctement chargé coté client !!!");

// variables diverses
var myPlaceListe = 0;
var nbUsers = 0;


// Initialisation du canal de signalisation
var socket = io.connect();
/*
var socket = io.connect(socketServer, 
                {rememberTransport: false, 
                'reconnect': true,
                'reconnection delay': 500,
                'max reconnection attempts': 10,
                'secure': true});

socket.on('disconnect', function() {
    alert('client socketio disconnect!')
});
/**/

// Fonctions websocket dédiées au tchat ---------------------------

// On demande le pseudo, on l'envoie au serveur et on l'affiche dans le titre
var pseudo = prompt('Quel est votre pseudo ?');
if (!pseudo) { pseudo = "";}
document.title = pseudo + ' - ' + document.title;

socket.emit('nouveau_client', pseudo);


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

// ----------- Méthodes jquery d'affichage du tchat ------------------------------

// Lorsqu'on envoie le formulaire, on transmet le message et on l'affiche sur la page
$('#formulaire_chat_websoket').submit(function () {
    var message = $('#message').val();
    socket.emit('message', message); // Transmet le message aux autres
    insereMessage(pseudo, message, myPlaceListe); // Affiche le message aussi sur notre page
    $('#message').val('').focus(); // Vide la zone de Chat et remet le focus dessus
    return false; // Permet de bloquer l'envoi "classique" du formulaire
});

// Ajoute un message dans la page
function insereMessage(pseudo, message, placeListe) {
    $('#zone_chat_websocket').prepend('<p><strong>('+placeListe+') '+ pseudo + '</strong> ' + message + '</p>');
    console.log ((pseudo + " >> " + message));
}