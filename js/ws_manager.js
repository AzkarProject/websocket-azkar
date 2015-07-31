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
if (type == "pilote-appelant") {typeUser = "Pilote";
} else if (type == "robot-appelé") { typeUser = "Robot";}


// On demande le pseudo, on l'envoie au serveur et on l'affiche dans le titre
var pseudo = prompt('Votre pseudo? (par défaut ce sera "'+typeUser+'")');


if (!pseudo) { pseudo = typeUser;}
// document.title = pseudo + ' - ' + document.title;

// socket.emit('nouveau_client', pseudo); // Version 1
socket.emit('nouveau_client2', {pseudo: pseudo, typeUser: typeUser}); // Version objet

// liste des users connectés
var users = {};

// Objet User courant.
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
     // document.title = objUser.placeliste+"-" + objUser.pseudo +"("+objUser.typeClient+") - "+document.title;
     // >>> Même chose sans le numéro d'arrivée pour éviter que AutoIt ne se mélange les pédales dans la détection de la fenêtre du navigateur
     document.title = objUser.pseudo +"("+objUser.typeClient+") - "+document.title;

     myPlaceListe = objUser.placeliste;
     //console.log ("Ordre d'arrivée dans la session websocket: "+placeListe);
     //document.title = "("+myPlaceListe+") " + document.title;
})



// Fonctions websocket dédiées au tchat ---------------------------


// Quand un nouveau client se connecte, on affiche l'information
socket.on('nouveau_client2', function(objUser) {
    var dateR = common.dateER('R');
    console.log(dateR+">> socket.on('nouveau_client2', objUser");
    var message = dateR + " à rejoint le Tchat";
    insereMessage3(objUser,message);
})

// Réception d'une info de deconnexion 
// >>> plus réactif que l'écouteur de l'API WebRTC
// >>> On déplace ici l'écouteur ici au cas où la fonction
// Connect n'as pas encore été apellée.
socket.on("disconnected", function(data) { 
  console.log(">> socket.on('disconnected',...");

  var dateR = common.dateER('R');
  var msg = dateR+' '+data.message;
  insereMessage3(data.objUser,msg); // Plante puisque no data.objUser  !!!

  // On met à jour la liste des cliens connectés
  var users = data;
  var debug = common.stringObjectDump(users,"users");
  console.log(debug); 
  
  // On lance la méthode de préparatoire à la renégo WebRTC
  // Todo >>>> Tester déclenchement a la detection WebRTC...
  // Pour voir si ca résoud le problème de déco intempestive sur openShift
  // onDisconnect();
  // >>>> Tests en local: renégo webSoket et WebRTC OK
  // >>>> Todo >> Tests en ligne sur OpenShift...
});
  
// >> V2 User en version Objet

// Quand on reçoit un message, on l'insère dans la page
socket.on('message2', function(data) {
    var dateR = common.dateER('R');
    var msg = dateR+' '+data.message;
    insereMessage3(data.objUser,msg);
})

// Quand on reçoit une nouvelle commande de déplacement, on l'insère dans la page
socket.on('moveOrder', function(data) {
    var dateR = common.dateER('R');
    var msg = dateR+' '+data.message;
    insereMessage3(data.objUser, msg);
})

// Quand on reçoit un message de service
socket.on('service2', function(data) {
    var dateR = common.dateER('R');
    var msg = dateR+' '+data.message;
    insereMessage3(data.objUser,msg);
})



// ----------- Méthodes jquery d'affichage du tchat ------------------------------

// Lorsqu'on envoie le formulaire, on transmet le message et on l'affiche sur la page
$('#formulaire_chat_websoket').submit(function () {
    //console.log ("WWWWWWWWWWWWW");
    var message = $('#message').val();
    // On ajoute la dateE au message
    var dateE = '[E-'+common.dateNowInMs()+']';
    message = dateE + ' '+message;
    socket.emit('message2', {objUser:localObjUser,message:message}); // Transmet le message aux autres
    insereMessage3(localObjUser, message); // Affiche le message aussi sur notre page
    $('#message').val('').focus(); // Vide la zone de Chat et remet le focus dessus
    return false; // Permet de bloquer l'envoi "classique" du formulaire
});

// Affiche le message ds le tchat
function insereMessage3(objUser, message) {
    
    var text;
    
    if (objUser){
      text = '['+objUser.typeClient+'] '+ message;
    } else {
      text = '[????] '+ message;
    }
    /**/
    text += '\n';
    
    $('#zone_chat_websocket').prepend(text);
}