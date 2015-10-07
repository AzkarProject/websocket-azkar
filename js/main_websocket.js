// Fonctions websocket générales -----------------------------
// Flags divers
var isServerInfoReceived = false; 

// variables diverses
var myPlaceListe = 0;
var nbUsers = 0;

// Initialisation du canal de signalisation
// On récupère l'URL complète du client
var currentUrl = window.location.href; 
// On regarde si l'url contient la chaine "rhcloud.com"
var isOpenShift = currentUrl.indexOf("rhcloud.com") > -1;
var pIoConnect = ''; // local:; pas de proxy particulier
if (isOpenShift) {pIoConnect = 'http://'+settings.appHostName()+'.rhcloud.com:8000'} // proxy Openshift.
var socket = io.connect(pIoConnect); 



var typeClient = null;
if (type == "pilote-appelant") {typeClient = "Pilote";
} else if (type == "robot-appelé") { typeClient = "Robot";
} else if (type == "visiteur-appelé") { typeClient = "Visiteur";}



// On demande le pseudo, on l'envoie au serveur et on l'affiche dans le titre
pseudo = null;
// pseudo = prompt('Votre pseudo? (par défaut ce sera "'+typeClient+'")');

pseudo = checkCookie(pseudo);

// cookies
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}

function checkCookie(pseudo) {
    var user = getCookie("username");
    if (user != "") {
        // alert("Welcome again " + user);
        pseudo = user;
    } else {
        user = prompt("Please enter your name:", "");
        if (user != "" && user != null) {
            setCookie("username", user, 365);
            pseudo = user;
        }
    }
    return pseudo;
}


// if (!pseudo) { pseudo = typeClient;}
// document.title = pseudo + ' - ' + document.title;

// socket.emit('nouveau_client', pseudo); // Version 1
//console.log ("socket.emit('nouveau_client2', {pseudo: "+pseudo+", typeClient: "+typeClient+"t});")
socket.emit('nouveau_client2', {pseudo: pseudo, typeClient: typeClient}); // Version objet

// liste des users connectés
var users = {};

// Objet User courant.
var localObjUser;
var myPlaceListe;
var myPeerID;
// ------------------------------------------------------


// Updater le titre de la page (pour le fun...)
// Version Objet...
socket.on('position_liste2', function(objUser) {
    // On copie l'objet pour un usage local
    localObjUser = objUser;

    console.log(">> socket.on(position_liste2,objUser) >>>");
    console.log(objUser);
    // document.title = objUser.placeliste+"-" + objUser.pseudo +"("+objUser.typeClient+") - "+document.title;
    // >>> Même chose sans le numéro d'arrivée pour éviter que AutoIt ne se mélange les pédales dans la détection de la fenêtre du navigateur
    document.title = objUser.typeClient +"("+objUser.typeClient+") - "+document.title;

    myPlaceListe = objUser.placeliste;
    myPeerID = objUser.id;
    console.log ('myPeerID: '+myPeerID)

    //console.log ("Ordre d'arrivée dans la session websocket: "+placeListe);
    //document.title = "("+myPlaceListe+") " + document.title;
})

// Fonctions websocket dédiées au tchat ---------------------------


// Quand un nouveau client se connecte, on affiche l'information
socket.on('nouveau_client2', function(objUser) {
    var dateR = tools.dateER('R');
    console.log(dateR+">> socket.on('nouveau_client2', objUser");
    //var message = dateR + " à rejoint le Tchat";
    var message = dateR + " > Connexion entrante";
    insereMessage3(objUser,message);
})

// Réception d'une info de deconnexion 
// >>> plus réactif que l'écouteur de l'API WebRTC
// >>> On déplace ici l'écouteur ici au cas où la fonction
// >>> Connect n'as pas encore été apellée.
socket.on("disconnected", function(data) { 
  console.log(">> socket.on('disconnected',...");

  var dateR = tools.dateER('R');
  var msg = dateR+' '+data.message;
  insereMessage3(data.objUser,msg); // Plante puisque no data.objUser  !!!

  // On met à jour la liste des cliens connectés
  //var users = data;
  //var debug = tools.stringObjectDump(users,"users");
  // console.log(debug); 
  
  // Si le receveur est le pilote*
  // et que le déconnecté est un visiteur
  // on lance d'office la procédure de déconnexion 
  if (type == "pilote-appelant") {
    if (data.objUser.typeClient = "Visiteur") {
        closeCnxwith(data.objUser.id);
        }
  }



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
    var dateR = tools.dateER('R');
    var msg = dateR+' '+data.message;
    insereMessage3(data.objUser,msg);
})

// Quand on reçoit une nouvelle commande de déplacement, on l'insère dans la page
/*// piloteOrder
socket.on('piloteOrder', function(data) {
    var dateR = tools.dateER('R');
    var msg = dateR+' '+data.message;
    insereMessage3(data.objUser, msg);
})
/**/



// Quand on reçoit un message de service
socket.on('service2', function(data) {
    var dateR = tools.dateER('R');
    var msg = dateR+' '+data.message;
    insereMessage3(data.objUser,msg);
})



// ----------- Méthodes jquery d'affichage du tchat ------------------------------

// Lorsqu'on envoie le formulaire, on transmet le message et on l'affiche sur la page
// Bloc de tchat principal des IHM Pilote et Robot
$('#formulaire_chat_websoket').submit(function () {
    var message = $('#message').val();
    // On ajoute la dateE au message
    var dateE = '[E-'+tools.dateNowInMs()+']';
    message = dateE + ' '+message;
    socket.emit('message2', {objUser:localObjUser,message:message}); // Transmet le message aux autres
    insereMessage3(localObjUser, message); // Affiche le message aussi sur notre page
    $('#message').val('').focus(); // Vide la zone de Chat et remet le focus dessus
    return false; // Permet de bloquer l'envoi "classique" du formulaire
});

// ------------ ADD version 1toN
// Bloc de tchatt secondaire de l'IHM pilote (s'affiche dans le bloc 1toN) 
$('#formulaire_chat_1toN').submit(function () {
    //console.log ("WWWWWWWWWWWWW");
    var message = $('#message3').val();
    // On ajoute la dateE au message
    var dateE = '[E-'+tools.dateNowInMs()+']';
    message = dateE + ' '+message;
    socket.emit('message2', {objUser:localObjUser,message:message}); // Transmet le message aux autres
    insereMessage3(localObjUser, message); // Affiche le message aussi sur notre page
    $('#message3').val('').focus(); // Vide la zone de Chat et remet le focus dessus
    return false; // Permet de bloquer l'envoi "classique" du formulaire
});

// Bloc de tchat principal de l'IHM Visiteur
$('#formulaire_chat_1toN_visitor').submit(function () {
    //console.log ("WWWWWWWWWWWWW");
    var message = $('#message4').val();
    // On ajoute la dateE au message
    var dateE = '[E-'+tools.dateNowInMs()+']';
    message = dateE + ' '+message;
    socket.emit('message2', {objUser:localObjUser,message:message}); // Transmet le message aux autres
    insereMessage3(localObjUser, message); // Affiche le message aussi sur notre page
    $('#message4').val('').focus(); // Vide la zone de Chat et remet le focus dessus
    return false; // Permet de bloquer l'envoi "classique" du formulaire
});
/**/ // ------------- / Version 1toN




// Affiche le message ds le tchat
function insereMessage3(objUser, message) {
    
    var text;
    if (objUser){
      text = '['+objUser.typeClient+'] '+ message;
    } else {
      text = message;
    }
    text += '\n';
    
    $('#zone_chat_websocket').prepend(text);
    if ( $('#zone_chat_1toN') )  $('#zone_chat_1toN').prepend(text);
    if ( $('#zone_chat_1toN_visitor') )  $('#zone_chat_1toN_visitor').prepend(text);
}