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



// Initialisation des variables, objets et paramètres du script
// NB toutes les variables sont déclarées en global...

// Robot seulement
if (type == "robot-appelé") {  
    isOnePilot = false;
}

// 1to1 Pilote+Robot
onMove = false; // Flag > Si un mouvement est en cours
//lastMoveTimeStamp =  Date.now(); // Variable globale pour la détection du dernier mouvement (homme mort)...
lastMoveTimeStamp = 0;

// 1to1 Pilote+Robot
// Benchmarks Settings Default
navSys = 'Robubox';
navCh = 'webSocket';
lPview = 'show';
lRview = 'show';
rPview = 'high';
rRView = 'show';
pStoR = 'open';
cartoView = 'hide';
cartoChannel = 'webSocket';
camDefRobot = 'HD',
camDefPilote = 'HD';


// 1to1 Pilote+Robot
// Objet paramètres
parameters = {
    navSys: navSys,
    navCh: navCh,
    lPview: lPview,
    lRview: lRview,
    rPview: rPview,
    rRView: rRView,
    pStoR: pStoR,
    cartoView: cartoView,
    cartoChannel: cartoChannel,
    camDefRobot: camDefRobot,
    camDefPilote: camDefPilote
};


// 1to1 Pilote+Robot
// sélecteurs de micros et caméras
local_AudioSelect = document.querySelector('select#local_audioSource');
local_VideoSelect = document.querySelector('select#local_videoSource');

// 1to1 Pilote+Robot
// sélecteurs de micros et caméras (robot) affiché coté pilote 
remote_AudioSelect = document.querySelector('select#remote_audioSource');
remote_VideoSelect = document.querySelector('select#remote_videoSource');

// 1to1 Pilote+Robot
// Pour visualiser toutes les cams dispo coté Robot,
// on laisse par défaut l'affichage des devices.
local_AudioSelect.disabled = false;
local_VideoSelect.disabled = false;

// 1to1 Pilote seulement
// Sélécteurs définition caméra
if (type == "pilote-appelant") {
    robot_camdef_select = document.querySelector('select#robot_camdef_select');
    pilot_camdef_select = document.querySelector('select#pilot_camdef_select');
}
/**/


// 1to1 Pilote+Robot
// (pilote-Appelant) > Activation/Désativation préalable 
// Du formulaire de sélection des devices locaux et de demande de connexion
if (type == "pilote-appelant") {
    remote_ButtonDevices.disabled = true;
    local_ButtonDevices.disabled = true;
    //remote_AudioSelect.disabled = true; 
    //remote_VideoSelect.disabled = true; 
    local_AudioSelect.disabled = true;
    local_VideoSelect.disabled = true;
}



// 1to1 Pilote+Robot
// Liste des sources cam/micro
listeLocalSources = {};
listeRemoteSources = {};
// flag d'origine des listes (local/remote)
origin = null;


// 1to1 Pilote+Robot
// flag de connexion
isStarted = false;


// 1to1 Pilote+Robot
video1 = document.getElementById("1to1_localVideo"); // Sur IHM Robot, pilote, visiteur
video2 = document.getElementById("1to1_remoteVideo"); // Sur IHM Robot, pilote, visiteur


// 1to1 Pilote+Robot
// RTC DataChannel
// Zone d'affichage (textarea)
chatlog = document.getElementById("zone_chat_WebRTC");
// Zone de saisie (input)
message = document.getElementById("input_chat_WebRTC");


// 1to1 pilote + Robot
peerCnx1to1 = "Pilote-to-Robot"; // connexion principale Pilote/Robot
peerCnxId = "default"; // Nom par défaut


// 1to1 pilote + Robot
localStream = null;
remoteStream = null; // 


// 1to1 pilote + Robot
// définition de la variable channel
channel = null;
debugNbConnect = 0;

// 1to1 pilote + Robot
// Si une renégociation à déjas eu lieu
// >> pour éviter de réinitialiser +sieurs fois le même écouteur
isRenegociate = false; // 1to1 Pilote & robot

robotCnxStatus = 'new';
piloteCnxStatus = 'new';

// Robustesse -----------------
// Flags de types de déconnexions (volontaires/involontaires)
// valeurs possibles: Forced (par défaut), Unexpected
robotDisconnection = "Forced";
piloteDisconnection = "Forced";
// Flag d'ouverture de session webRTC coté pilote
// Valeurs possibles: Pending (par défaut), Launched
sessionConnection = "Pending";

// Tableau des connexions WebRTC
peerCnxCollection = {};

// shims!
PeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
SessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;
IceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;
navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;


 // Test rfc5766 avec authentification
 TURN_username = "azkar";
 TURN_credential = "azkar";
 // server.iceServers.push({urls: "turn:134.59.130.142:3478",credential: "azkar" ,username: "azkar"}); // rfc5766 sur VM2
    
 // Si on est l'apellant (pilote)
 if (type == "pilote-appelant") {
    	TURN_username = "pilote";
    	TURN_credential = "azkar";
 // Sinon si on est l'apellé (Robot)
 } else if (type == "robot-appelé") {
    	TURN_username = "robot";
    	TURN_credential = "azkar";
 }


// options pour l'objet PeerConnection
server = {'iceServers': []}; // OK sur même réseau...
server.iceServers.push({ url: 'stun:stun.l.google.com:19302'});

server.iceServers.push({urls: "turn:134.59.130.142:3478",credential: TURN_credential ,username: TURN_username}); // rfc5766 

// corection du bug createDataChannel à partir de Chrome M46
options = { optional: [{DtlsSrtpKeyAgreement: true }]};


// Constraints de l'offre SDP. 
constraints = {
    mandatory: {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true
    }
};


// ----- Variables globales Robot/Pilote

audioSource = local_AudioSelect.value;
videoSource = local_VideoSelect.value;

constraint = null;

if (type == "pilote-appelant" && proto == "1to1") {
    robotCamDef = robot_camdef_select.value;
    piloteCamDef = pilot_camdef_select.value;
}

// -----------------------------

// Constraints de l'offre SDP. 
robotConstraints = {
    mandatory: {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true
    }
};

// Constraints de l'offre SDP. 
piloteConstraints = {
    mandatory: {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true
    }
};


// --------- contrôle d'accès via websocket...

// rejectConnexion', message:message, url:indexUrl);
socket.on('error', errorHandler);
socket.on('rejectConnexion', function(data) {
    // alertAndRedirect(data.message, data.url)
    notifyAndRedirect("error", data.message,data.url)
})

socket.on('razConnexion', function(data) {
    console.log(">> socket.on('razConnexion',...");
    var message = "Fermeture des connexions webSockets ! "
    notifyAndRedirect("warning", message, data.url)
})

socket.on('reloadAllClients', function(data) {
    
    console.log(">> socket.on('reloadAllClients',...");
    var message = "Connexion webSocket réinitialisée ! ";
    notifyAndRedirect("warning", message, data.url+"/"+localObjUser.typeClient)
})



socket.on('reloadClientrobot', function(style,message,url) {
    console.log(">> socket.on('reloadClient',...");
    notifications.writeMessage (style,message,"Vous allez être redirigé vers "+ url,3000)
    setTimeout(function(){
        window.location.href = url+"/"+"robot"
    }
    , 3500); 
});
/**/
// --------------------- Gestion des messages d'erreur ------------------

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
    , 3500); 
}

// ------ fonctions diverses ---------------


function forceRedirect(url) {
    console.log("@ forceRedirect("+url+")");
    //alert (message);
    // exports.writeMessage = function (type,title,body,duration,notification){
    //notifications.writeMessage ("info","","message",3000,null)
    
    // window.location.href = url;
    //notifications.writeMessage ("info","","message",3000)
}

function getClientBy(key,value) {
    for (i in users.listUsers) {
        if (users.listUsers[i][key] == value) {
                return users.listUsers[i];
                break;
        }
    }
};

// Retourne l'objet client distant d'une peerConnexion
// On peux retrouver l'ID du pair distant en analysant l'ID de la connexion:
// Le peerID de la connexion est constitué d'une concaténation
// d'un préfixe et de l'id client du visiteur
// Il suffit donc d'oter le préfixe pour retrouver l'id du pair distant...
// A partir de là, on récupère aussi le client.
function getCibleFromPeerConnectionID(peerCnxId, prefix) {
    var cibleID = peerCnxId;
    cibleID = cibleID.replace(prefix, "");
    cible = getClientBy('id',cibleID); 
    return cible;
};


