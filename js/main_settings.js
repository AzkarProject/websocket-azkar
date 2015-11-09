// Initialisation des variables, objets et paramètres du script
// NB toutes les variables sont déclarées en global...

  
// 1to1 Pilote+Robot
if (type == "pilote-appelant" || type == "robot-appelé") {

    // 1to1 Pilote+Robot
    onMove = false; // Flag > Si un mouvement est en cours
    //lastMoveTimeStamp =  Date.now(); // Variable globale pour la détection du dernier mouvement (homme mort)...
    lastMoveTimeStamp = 0;
    
    // 1to1 Pilote+Robot
    // Benchmarks Settings Default
    navCh = 'webSocket';
    lPview = 'show';
    lRview = 'show';
    rPview = 'high';
    rRView = 'show';
    pStoR = 'open';

    // 1to1 Pilote+Robot
    // Objet paramètres
    parameters = {
        navCh: navCh,
        lPview: lPview,
        lRview: lRview,
        rPview: rPview,
        rRView: rRView,
        pStoR: pStoR
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

} // 1to1 Pilote+Robot

// 1toN Pilote+Visiteur
if (type == "pilote-appelant" || type == "visiteur-appelé") {
    
    // 1toN > Pilote+Visiteur 
    video1_1toN_VtoP = document.getElementById("1to1_localVideo"); // Sur IHM Robot, pilote, visiteur
    video2_1toN_VtoP = document.getElementById("1to1_remoteVideo"); // Sur IHM Robot, pilote, visiteur
    /*
    if (type == "pilote-appelant") {
    videoVisitor1 = document.getElementById("1toN_remoteVideos"); // Vue des visiteurs sur IHM Pilote
    videoVisitor2 = document.getElementById("1toN_remoteVideos2"); // Vue des visiteurs sur IHM Pilote
    videoVisitor3 = document.getElementById("1toN_remoteVideos3"); // Vue des visiteurs sur IHM Pilote
    videoVisitor4 = document.getElementById("1toN_remoteVideos4"); // Vue des visiteurs sur IHM Pilote
    videoVisitor5 = document.getElementById("1toN_remoteVideos3"); // Vue des visiteurs sur IHM Pilote
    videoVisitor6 = document.getElementById("1toN_remoteVideos4"); // Vue des visiteurs sur IHM Pilote

    //video3 = document.getElementById("1toN_remoteVideos"); // Vue des visiteurs sur IHM Pilote
    //video4 = document.getElementById("1toN_remoteVideoRobot"); // Vue du Robot sur IHM Visiteur
    } 
    /**/

    prefix_peerCnx_1toN_VtoP = "Pilote-to-Visiteur-"; // connexion principale Pilote/Robot
    peerCnxId_1toN_VtoP = "default"; // Nom par défaut

    localStream_1toN_VtoP = null;
    remoteStream_1toN_VtoP = null; // remoteStream 1to
    remoteStreamCollection_1toN_VtoP = {}; // 1toN > Tableau des remoteStreams visiteurs
    
    debugNbConnect_1toN_VtoP = 0;
    
    // Si une renégociation à déja eu lieu
    // >> pour éviter de réinitialiser +sieurs fois le même écouteur
    isRenegociate_1toN_VtoP = false;


} // 1toN Pilote+Visiteur   
    

// 1toN Pilote seulement
if (type == "pilote-appelant") {
    
    remoteStreamCollection = {}; // 1toN > liste des remoteStreams visiteurs
    visitorStatusCollection = {}; // 1toN > Liste des status de connexions des visiteurs
} // 1toN Pilote seulement  

// 1toN visiteur seulement
if (type == "visiteur-appelé") {
    isStarted_1toN_VtoP = false;
    video3_VtoR = document.getElementById("1toN_remoteVideoRobot"); 
} // 1toN visiteur seulement

// --------------------------  Communs 1to1 & 1toN (Robot, pilote, visiteurs)

// Tableau des connexions WebRTC
peerCnxCollection = {};

// shims!
PeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
SessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;
IceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;
navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;



// options pour l'objet PeerConnection
server = {'iceServers': [{ 'url': 'stun:23.21.150.121'}]};
server.iceServers.push({ url: 'stun:stun.l.google.com:19302'});
server.iceServers.push({url: 'stun:stun.anyfirewall.com:3478'});
server.iceServers.push({url: 'stun:turn1.xirsys.com'});

// Ajout de serveurs TURN
 server.iceServers.push({url: "turn:turn.bistri.com:80",credential: "homeo",username: "homeo"});
 server.iceServers.push({url: 'turn:turn.anyfirewall.com:443?transport=tcp', credential: 'webrtc',username: 'azkarproject'});
 server.iceServers.push({url: "turn:numb.viagenie.ca",credential: "webrtcdemo",username: "temp20fev2015@gmail.com"});

 server.iceServers.push({url: "turn:turn.anyfirewall.com:443?transport=tcp",credential: "webrtc",username: "webrtc"});

server.iceServers.push({url: "turn:turn1.xirsys.com:443?transport=tcp",credential: "b8631283-b642-4bfc-9222-352d79e2d793",username: "e0f4e2b6-005f-440b-87e7-76df63421d6f"});

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


/*// Idem mais retourne l'ID du client
function getIdFromPeerConnectionID(peerCnxId, prefix) {
    var cibleID = peerCnxId;
    cibleID = cibleID.replace(prefix, "");
    //cible = getClientBy('id',cibleID); 
    return cibleID;
};
/**/