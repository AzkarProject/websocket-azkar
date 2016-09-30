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

console.log("1to1_01_websocket chargé")

// Initialisation du canal de signalisation
socket = io.connect(); 


typeClient = null;
if (type == "pilote-appelant") typeClient = "Pilote";
else if (type == "robot-appelé")  typeClient = "Robot";


// On demande le pseudo ou on le récupère ds un cookie et on l'envoie au serveur
pseudo = null;
pseudo = checkCookie(pseudo);
socket.emit('nouveau_client2', {pseudo: pseudo, typeClient: typeClient}); // Version objet


// liste des users connectés
users = {};

// Objet User courant.
var localObjUser;
var myPlaceListe;
var myPeerID;



// --- Ecouteurs utilisés pour les connections websockets --------------------------------------------------


// Updater le titre de la page (pour le fun...)
// Version Objet...
socket.on('localUser', function(objUser) {
    // On copie l'objet pour un usage local
    localObjUser = objUser;

    console.log(">> socket.on(localUser) >>>");
    console.log(objUser);
    // document.title = objUser.placeliste+"-" + objUser.pseudo +"("+objUser.typeClient+") - "+document.title;
    // >>> Même chose sans le numéro d'arrivée pour éviter que AutoIt ne se mélange les pédales dans la détection de la fenêtre du navigateur
    document.title = "IHM "+objUser.typeClient +" ("+objUser.typeClient+") - "+document.title;

    myPlaceListe = objUser.placeliste;
    myPeerID = objUser.id;
    console.log ('myPeerID: '+myPeerID)

})


// Quand un nouveau client se connecte, on affiche l'information
socket.on('nouveau_client2', function(objUser) {
    console.log(">> socket.on(nouveau_client2) >>>");
    var dateR = tools.humanDateER('R');
    // alert(dateR+">> socket.on('nouveau_client2', objUser");
    //var message = dateR + " à rejoint le Tchat";
    var message = " > Connexion entrante";
    //insereMessage3(objUser,message);
    ihm.insertWsMessage(objUser,dateR+message);
    //message = data.objUser.pseudo+" > Connexion entrante"
    message = objUser.pseudo += message;
    notifications.writeMessage ("success","Notification WebSocket",message,3000)


})


// Réception d'une info de déconnexion websocket:
// Plus réactif que l'écouteur de l'API WebRTC !
socket.on("disconnected", function(data) { 
  
  if (!data.objUser) return;

  var dateR = tools.humanDateER('R');
  var msg = dateR+' '+data.message;
  ihm.insertWsMessage(data.objUser,msg);
  notifications.writeMessage ("error","Notification WebSocket",data.objUser.pseudo+" "+data.message,3000)

  /*// On remet les flags a zero et on efface l'ID de connexion
  var testPeerCnxId = "";
  var isAPeerCnxID = false;
  /**/

   // On lance le processus de déconnexion WebRTC
   onDisconnect(peerCnx1to1);
});
  

// Reception d'un message websoclet
socket.on('message2', function(data) { 
    var dateR = tools.humanDateER('R');
    var msg = dateR+' '+data.message;
    //ihm.insertWsMessage(data.objUser,msg);
    ihm.insertWsMessage(data.objUser,data.message);
    var message = 'Message from ' + data.objUser.pseudo+": "+data.message;
    notifications.writeMessage ("info","Chat WebSocket",message,3000)
})



// reception d'un message WS de service
socket.on('service2', function(data) {
    var dateR = tools.humanDateER('R');
    var msg = dateR+' '+data.message;
    ihm.insertWsMessage(data.objUser,msg)
    notifications.writeMessage ("info","Message de service WebSocket",msg,3000)
})



// --------- écouteurs de contrôle d'accès via websocket...

socket.on('error', errorHandler);
socket.on('rejectConnexion', function(data) {
    console.log(">> socket.on('rejectConnexion',...");
    // notifyAndRedirect("error", data.message,data.url)
    var href = window.location.href;
    var pathname = window.location.pathname;
    var redirectHref = href.replace(pathname, "");
    notifyAndRedirect("error", data.message,redirectHref)
})

socket.on('razConnexion', function(data) {
    // alert('razConnexion ')
    console.log(">> socket.on('razConnexion',...");
    //notifyAndRedirect("warning", message, data.url)
    var href = window.location.href;
    var pathname = window.location.pathname;
    var redirectHref = href.replace(pathname, "");
    var message = "Fermeture des connexions webSockets ! "
    notifyAndRedirect("warning", message, redirectHref)
})

socket.on('reloadAllClients', function(data) {
    console.log(">> socket.on('reloadAllClients',...");
    /*
    var debug = 'reloadAllClients '+data.url;
    debug = "\n Url (document.location) = "+document.location;
    debug += "\n path only (window.location.pathname) = "+ window.location.pathname;// Returns path only
    debug += "\n full URL (window.location.href) = "+window.location.href;// Returns full URL
    alert(debug)
    /**/
    
    var message = "Attention, La page vas être rechargée ! ";
    //notifyAndRedirect("warning", message, data.url+"/"+localObjUser.typeClient)
    notifyAndRedirect("warning", message, window.location.href)
})


/*
socket.on('reloadClientrobot', function(style,message,url) {
    alert('reloadClientrobot ')
    console.log(">> socket.on('reloadClient',...");
    notifications.writeMessage (style,message,"Vous allez être redirigé vers "+ url,5000)
    setTimeout(function(){
        window.location.href = url+"/"+"robot"
        //window.location.href+"/"+"robot"
    }
    , 5500); 
});
/**/

// --------------------- Messages d'erreur & de redirection ------------------

function errorHandler(err) {
    console.log("ON-ERROR");
    console.error(err);
    // notifications.writeMessage ("error","ON-ERROR","err",3000)

}


function alertAndRedirect(message, url) {
    window.alert(message)
    window.location.href = url;
}

function notifyAndRedirect(style, message, url) {
    notifications.writeMessage (style,message,"Vous allez être redirigé vers "+ url,3000)
    setTimeout(function(){
        window.location.href = url
    }
    , 500); 
}


function forceRedirect(url) {
    console.log("@ forceRedirect("+url+")");
    // Todo....

}


// ------- Gestion des Cookies -----------------

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
    var nameCookie = "AzcarClientName"
    var user = getCookie(nameCookie);
    
    if (user != "") {
        pseudo = user;
    
    } else {
        user = prompt('Votre pseudo? (par défaut ce sera "'+typeClient+'")');
        if (!user) {
           user = typeClient;
        }       
        if (user != "" && user != null) {
            setCookie(nameCookie, user, 365);
            pseudo = user;
        }
    }
    return pseudo;
}



