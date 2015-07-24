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
    var newDate = '[R>>'+common.dateNowInMs()+']';
    console.log("[R>>"+newDate+"]>> socket.on('nouveau_client2', objUser");
    var message = "à rejoint le Tchat";
    insereMessage3(newDate,objUser,message);
})

// Réception d'une info de deconnexion 
// >>> plus réactif que l'écouteur de l'API WebRTC
// >>> On déplace ici l'écouteur ici au cas où la fonction
// Connect n'as pas encore été apellée.
socket.on("disconnected", function(data) { 
  var newDate = '[R>>'+common.dateNowInMs()+']';
  console.log(">> socket.on('disconnected',...");
  // On met à jour la liste des cliens connectés
  var users = data;
  var debug = common.stringObjectDump(users,"users");
  console.log(debug); 
  // On lance la méthode de préparatoire à la renégo WebRTC
  onDisconnect();
});
  
// >> V2 User en version Objet

// Quand on reçoit un message, on l'insère dans la page V2
socket.on('message2', function(data) {
    var newDate = '[R>>'+common.dateNowInMs()+']';
    console.log(">> socket.on('message2',...");
    insereMessage3(newDate,data.objUser,data.message);
})


// Quand on reçoit une nouvelle commande de déplacement, on l'insère dans la page
socket.on('moveOrder', function(data) {
    var newDate = '[R>>'+common.dateNowInMs()+']';
    console.log(">> socket.on('moveOrder',...");
    insereMessage3(newDate,data.objUser, data.message);
})

// Quand on reçoit un message de service
socket.on('service2', function(data) {
    var newDate = '[R>>'+common.dateNowInMs()+']';
    console.log(">> socket.on('service2',...");
    insereMessage3(newDate,data.objUser, data.message);
})



// ----------- Méthodes jquery d'affichage du tchat ------------------------------

// Lorsqu'on envoie le formulaire, on transmet le message et on l'affiche sur la page
$('#formulaire_chat_websoket').submit(function () {
    //console.log ("WWWWWWWWWWWWW");
    var message = $('#message').val();
    var newDate = '['+common.dateNowInMs()+'>>E]';
    socket.emit('message2', {objUser:localObjUser,message:message}); // Transmet le message aux autres
    insereMessage3(newDate,localObjUser, message); // Affiche le message aussi sur notre page
    $('#message').val('').focus(); // Vide la zone de Chat et remet le focus dessus
    return false; // Permet de bloquer l'envoi "classique" du formulaire
});

// Ajoute un message dans la page
function insereMessage3(date,objUser, message) {
    console.log(objUser.placeliste);
    $('#zone_chat_websocket').prepend(date+' <strong>'+objUser.placeliste+'-'+objUser.typeClient+' (<i>'+objUser.pseudo+'</i>):</strong> ' + message + '<br/>');
}