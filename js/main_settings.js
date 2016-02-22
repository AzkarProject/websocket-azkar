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
//server.iceServers.push({ url: 'stun:stun.l.google.com:19302'});

//server.iceServers.push({urls: "turn:134.59.130.142:3478",credential: TURN_credential ,username: TURN_username}); // rfc5766 sur VM2
server.iceServers.push({urls: "turn:134.59.130.142:443",credential: TURN_credential ,username: TURN_username}); // rfc5766 sur VM2
//server.iceServers.push({urls: "turn:134.59.130.142:80",credential: TURN_credential ,username: TURN_username}); // rfc5766 sur VM2

// -------------------------------------------------------------------

/*// Celui là fonctionnait encore le 23/11/2015
server.iceServers.push({url: "turn:turn.anyfirewall.com:443?transport=tcp",credential: "webrtc",username: "webrtc"});
// TURN maison - Ne fonctionne pas sous wifi unice/Eduroam
server.iceServers.push({url: "turn:134.59.130.142:3478?transport=tcp",credential: "azkar",username: "azkar"});
server.iceServers.push({url: "turn:134.59.130.142:3478?transport=udp",credential: "azkar",username: "azkar"});

/**/// ------------------------------------------------------------------------------



//server = {'iceServers': [{url: "turn:turn.anyfirewall.com:443?transport=tcp",credential: "webrtc",username: "webrtc"}]}; // OK filaire
//server = {'iceServers': [{url: "turn:134.59.130.142:3478?transport=tcp",credential: "robosoft",username: "robosoft"}]}; // ???

//server = {'iceServers': [{ 'url': 'stun:23.21.150.121'}]};
// server.iceServers.push({ url: 'stun:stun.l.google.com:19302'});
//server.iceServers.push({url: 'stun:stun.anyfirewall.com:3478'});
//server.iceServers.push({url: 'stun:turn1.xirsys.com'});

// Ajout de serveurs TURN
//server.iceServers.push({url: "turn:turn.bistri.com:80",credential: "homeo",username: "homeo"});
//server.iceServers.push({url: 'turn:turn.anyfirewall.com:443?transport=tcp', credential: 'webrtc',username: 'azkarproject'});
//server.iceServers.push({url: "turn:numb.viagenie.ca",credential: "webrtcdemo",username: "temp20fev2015@gmail.com"});

// C'est celui-là qui fonctionne...
//server.iceServers.push({url: "turn:turn.anyfirewall.com:443?transport=tcp",credential: "webrtc",username: "webrtc"});
//server.iceServers.push({url: "turn:134.59.130.142:3478?transport=tcp",credential: "robosoft",username: "robosoft"});
//server.iceServers.push({url: "turn:134.59.130.142:3478?transport=udp",credential: "robosoft",username: "robosoft"});
//server.iceServers.push({url: "turn:turn1.xirsys.com:443?transport=tcp",credential: "b8631283-b642-4bfc-9222-352d79e2d793",username: "e0f4e2b6-005f-440b-87e7-76df63421d6f"});

/*
options = {
    optional: [{
            DtlsSrtpKeyAgreement: true
        }, {
            RtpDataChannels: true
        } //required for Firefox
    ]
}
/**/

// corection du bug createDataChannel à partir de Chrome M46
options = { optional: [{DtlsSrtpKeyAgreement: true }]};


// Constraints de l'offre SDP. 
constraints = {
    mandatory: {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true
    }
};

// --------- contrôle d'accès websocket...

// rejectConnexion', message:message, url:indexUrl);
socket.on('error', errorHandler);
socket.on('rejectConnexion', function(data) {
    alertAndRedirect(data.message, data.url)
})

socket.on('razConnexion', function(data) {
    console.log(">> socket.on('razConnexion',...");
    forceRedirect(data.url)
})
// --------------------- Gestion des messages d'erreur ------------------

function errorHandler(err) {
    console.log("ON-ERROR");
    console.error(err);
}

function alertAndRedirect(message, url) {
    //alert (message);
    window.alert(message)
    window.location.href = url;
}


// ------ fonctions diverses ---------------


function forceRedirect(url) {
    console.log("@ forceRedirect("+url+")");
    //alert (message);
    // window.alert(message)
    window.location.href = url;
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


