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

var typeUser = null;
if (type == "appelant") {
  typeUser = "Pilote";
} else if (type = "appelé") {
  typeUser = "Robot";
}

// On demande le pseudo, on l'envoie au serveur et on l'affiche dans le titre
var pseudo = prompt('Votre pseudo? (par défaut ce sera "'+typeUser+'")');


if (!pseudo) { pseudo = typeUser;}
// document.title = pseudo + ' - ' + document.title;

socket.emit('nouveau_client', pseudo); // Version 1
socket.emit('nouveau_client2', {pseudo: pseudo, typeUser: typeUser}); // Version objet

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

// Objet User de l'utilisateur courant.
var localObjUser;



// ------------------------------------------------------
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
// ----------------------------------------------------------

// Updater le titre de la page (pour le fun...)
// Version Objet...
socket.on('position_liste2', function(objUser) {
     // On copie l'objet pour un usage local
     localObjUser = objUser;

     console.log("socket.on(position_liste2,objUser) >>>");
     console.log(objUser);
     document.title = objUser.placeliste+"-" + objUser.pseudo +"("+objUser.typeClient+") - "+document.title;
     myPlaceListe = objUser.placeliste;
     //console.log ("Ordre d'arrivée dans la session websocket: "+placeListe);
     //document.title = "("+myPlaceListe+") " + document.title;
})



// Fonctions websocket dédiées au tchat ---------------------------

/*// Quand un nouveau client se connecte, on affiche l'information
socket.on('nouveau_client', function(data) {
    console.log(">> socket.on('nouveau_client', function(pseudo)");
    //$('#zone_chat').prepend('<p><em>(' +data.placeListe+')'+ data.pseudo + ' à rejoint le Chat !</em></p>');
    var message = "a rejoint le Tchat";
    insereMessage(data.pseudo, message, data.placeListe);
})
/**/

// Quand un nouveau client se connecte, on affiche l'information
socket.on('nouveau_client2', function(objUser) {
    console.log(">> socket.on('nouveau_client2', objUser");
    var message = "à rejoint le Tchat";
    /*
    console.log(objUser);
    console.log(message);
    console.log(objUser.pseudo);
    console.log(objUser.placeliste);
    /**/
    insereMessage2(objUser,message);
})



/*// Quand on reçoit un message, on l'insère dans la page
socket.on('message', function(data) {
    console.log(">> socket.on('message',...");
    insereMessage(data.pseudo, data.message, data.placeListe)
})

// Quand on reçoit un message de service
socket.on('service', function(data) {
    console.log(">> socket.on('service',...");
    insereMessage(data.pseudo, data.message);
})
/**/


// >> V2 User en version Objet

// Quand on reçoit un message, on l'insère dans la page V2
socket.on('message2', function(data) {
    console.log(">> socket.on('message2',...");
    //console.log(data);
    //console.log(data.message);
    //console.log(data.objUser);
    insereMessage2(data.objUser, data.message);
})

// Quand on reçoit un message de service
socket.on('service2', function(data) {
    console.log(">> socket.on('service2',...");
    insereMessage2(data.objUser, data.message);
})



// ----------- Méthodes jquery d'affichage du tchat ------------------------------

// Lorsqu'on envoie le formulaire, on transmet le message et on l'affiche sur la page
$('#formulaire_chat_websoket').submit(function () {
    console.log ("WWWWWWWWWWWWW");
    var message = $('#message').val();
    /*// Version classique
    socket.emit('message', message); // Transmet le message aux autres
    insereMessage(pseudo, message, myPlaceListe); // Affiche le message aussi sur notre page
    /**/// >>> Version objet
    socket.emit('message2', {objUser:localObjUser,message:message}); // Transmet le message aux autres
    //{pseudo: socket.pseudo, message: message, placeListe: socket.placeListe});
    insereMessage2(localObjUser, message); // Affiche le message aussi sur notre page
    
    $('#message').val('').focus(); // Vide la zone de Chat et remet le focus dessus
    return false; // Permet de bloquer l'envoi "classique" du formulaire
});

// Ajoute un message dans la page
function insereMessage(pseudo, message, placeListe) {
    $('#zone_chat_websocket').prepend('<p><strong>('+placeListe+') '+ pseudo + '</strong> ' + message + '</p>');
    console.log ((pseudo + " >> " + message));
}

// Ajoute un message dans la page V2
function insereMessage2(objUser, message) {
    /*
    console.log ("@ insereMessage2(objUser, message)");
    console.log(objUser);
    console.log(message);
    console.log(objUser.pseudo);
    console.log(objUser.placeliste);
    /**/
    $('#zone_chat_websocket').prepend('<p><strong>'+objUser.placeliste+'-'+objUser.pseudo+' (<i>'+objUser.typeClient+'</i>)</strong> ' + message + '</p>');
    // console.log ((objUser.pseudo + " >> " + message));
}