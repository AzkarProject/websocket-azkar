/*
*
* Copyright © CNRS (Laboratoire I3S) / université de Nice
* Contributeurs: Michel Buffa & Thierry Bergeron, 2015-2016
* 
* Ce logiciel est un programme informatique servant à piloter un Robot à distance
* Ce logiciel est régi par la licence CeCILL-C soumise au droit français et
* respectant les principes de diffusion des logiciels libres. Vous pouvez
* utiliser, modifier et/ou redistribuer ce programme sous les conditions
* de la licence CeCILL-C telle que diffusée par le CEA, le CNRS et l'INRIA 
* sur le site "http://www.cecill.info".
*
* En contrepartie de l'accessibilité au code source et des droits de copie,
* de modification et de redistribution accordés par cette licence, il n'est
* offert aux utilisateurs qu'une garantie limitée.  Pour les mêmes raisons,
* seule une responsabilité restreinte pèse sur l'auteur du programme,  le
* titulaire des droits patrimoniaux et les concédants successifs.

* A cet égard  l'attention de l'utilisateur est attirée sur les risques
* associés au chargement,  à l'utilisation,  à la modification et/ou au
* développement et à la reproduction du logiciel par l'utilisateur étant 
* donné sa spécificité de logiciel libre, qui peut le rendre complexe à 
* manipuler et qui le réserve donc à des développeurs et des professionnels
* avertis possédant  des  connaissances  informatiques approfondies.  Les
* utilisateurs sont donc invités à charger  et  tester  l'adéquation  du
* logiciel à leurs besoins dans des conditions permettant d'assurer la
* sécurité de leurs systèmes et ou de leurs données et, plus généralement, 
* à l'utiliser et l'exploiter dans les mêmes conditions de sécurité. 

* Le fait que vous puissiez accéder à cet en-tête signifie que vous avez 
* pris connaissance de la licence CeCILL-C, et que vous en avez accepté les
* termes.
*
*/

// Fonctions websocket générales -----------------------------
// Flags divers
var isServerInfoReceived = false; 

// variables diverses
var myPlaceListe = 0;
var nbUsers = 0;

// Initialisation du canal de signalisation
var socket = io.connect(); 

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
    var user = getCookie("AzcarClientName");
    
    if (user != "") {
        //alert("Welcome again " + user);
        notifications.writeMessage ("success","Bienvenue " + user,"",3000)
        pseudo = user;
    
    } else {
        user = prompt('Votre pseudo? (par défaut ce sera "'+typeClient+'")');
        if (!user) {
           user = typeClient;
        }       
        if (user != "" && user != null) {
            setCookie("AzcarClientName", user, 365);
            pseudo = user;
        }
    }
    return pseudo;
}

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

})

// Fonctions websocket dédiées au tchat ---------------------------


// Quand un nouveau client se connecte, on affiche l'information
socket.on('nouveau_client2', function(objUser) {
    var dateR = tools.dateER('R');
    console.log(dateR+">> socket.on('nouveau_client2', objUser");
    //var message = dateR + " à rejoint le Tchat";
    var message = dateR + " > Connexion entrante";
    //insereMessage3(objUser,message);
    ihm.insertWsMessage(objUser,message);

})


function isInPeerCnxCollection(peerCnxID ){
  var isPresent = true
  if (!peerCnxCollection[peerCnxID] || peerCnxCollection[peerCnxID] == null) isPresent = false;
  return isPresent;
}



// Réception d'une info de deconnexion:
// Plus réactif que l'écouteur de l'API WebRTC !
// On déplace ici l'écouteur au cas où la fonction
// connect() de webRTC n'as pas encore été instanciée.
socket.on("disconnected", function(data) { 
  console.log(">> socket.on('webSocket-disconnected',...");

  var dateR = tools.dateER('R');
  var msg = dateR+' '+data.message;
  ihm.insertWsMessage(data.objUser,msg);
  if (!data.objUser) return;
  
  
  var testPeerCnxId = "";
  var isAPeerCnxID = false;

  // Si le receveur est le pilote
  if (type == "pilote-appelant") {
    // si le déconnecté est un visiteur
    if (data.objUser.typeClient == "Visiteur") {
      // on lance la procédure individuelle de déconnexion 
      closeCnxwith(data.objUser.id);
    // si le déconnecté est un robot
    } else if (data.objUser.typeClient == "Robot") {
      // On lance la procédure de déco/reco 1to1 par défaut
        onDisconnect(peerCnx1to1);
    }
  }
  
  // Si le receveur est le Robot
  if (type == "robot-appelé") {
    // Si le déconnecté est le pilote,
    if (data.objUser.typeClient == "Pilote") {
        // On lance la procédure de déco/reco 1to1 par défaut
        onDisconnect(peerCnx1to1);

    // Si le déconnecté est un visiteur,
    } else if (data.objUser.typeClient == "Visiteur") {
      // On vérifie que la connexion existe bien...
      testPeerCnxId = prefix_peerCnx_VtoR+data.objUser.id;
      if ( isInPeerCnxCollection(testPeerCnxId) == false ) return; 
      else onDisconnect_VtoR(testPeerCnxId);
    }

  }

  // Si le receveur est un Visiteur
  if (type == "visiteur-appelé") { 
      
      // si le déconnecté est un pilote
      if (data.objUser.typeClient == "Pilote") {
        
        // Déconnexion avec le pilote
        testPeerCnxId = prefix_peerCnx_1toN_VtoP+myPeerID;
        if ( isInPeerCnxCollection(testPeerCnxId) == false ) return; 
        onDisconnect_1toN_VtoP(testPeerCnxId);
       
        // Mais aussi déconnexion avecv le Robot
        testPeerCnxId = prefix_peerCnx_VtoR+myPeerID;
        if ( isInPeerCnxCollection(testPeerCnxId) != false ) {
          onDisconnect_VtoR(testPeerCnxId);
        }

      // si le déconnecté est un robot
      } else if (data.objUser.typeClient == "Robot") {
        
        // On vérifie que la connexion existe bien...
        testPeerCnxId = prefix_peerCnx_VtoR+myPeerID;
        if ( isInPeerCnxCollection(testPeerCnxId) == false ) return; 
        else onDisconnect_VtoR(testPeerCnxId);
      }
  }

});
  

// Quand on reçoit un message WS, on l'insère dans la page
socket.on('message2', function(data) {
    var dateR = tools.dateER('R');
    var msg = dateR+' '+data.message;
    ihm.insertWsMessage(data.objUser,msg);
})



// Quand on reçoit un message WS de service
socket.on('service2', function(data) {
    var dateR = tools.dateER('R');
    var msg = dateR+' '+data.message;
    ihm.insertWsMessage(data.objUser,msg);
})



// ----------- Méthodes jquery d'affichage du tchat WS ------------------------------

// Lorsqu'on envoie le formulaire, on transmet le message et on l'affiche sur la page
// Bloc de tchat principal des IHM Pilote et Robot
$('#formulaire_chat_websoket').submit(function () {
    var message = $('#message').val();
    // On ajoute la dateE au message
    var dateE = '[E-'+tools.dateNowInMs()+']';
    message = dateE + ' '+message;
    socket.emit('message2', {objUser:localObjUser,message:message}); // Transmet le message aux autres
    // insereMessage3(localObjUser, message); // Affiche le message aussi sur notre page
    ihm.insertWsMessage(localObjUser, message);
    $('#message').val('').focus(); // Vide la zone de Chat et remet le focus dessus
    return false; // Permet de bloquer l'envoi "classique" du formulaire
});

