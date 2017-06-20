// 1to1_init_webrtc

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


console.log("1to1_02_pre_signaling chargé")

//------ PHASE 1 : Pré-signaling ----------------------------------------------------------

// 23/05/17: PROVISOIRE
// Désativation provisoire des commandes caméras (pour expo valerian)
// todo: A mettre en paramètrs admin
isPanTiltCamera = false;





// Initialisation des variables, objets et paramètres du script
// NB toutes les variables sont déclarées en global...


// Robot seulement
if (type == "robot-appelé") {  
    isOnePilot = false;
}

onMove = false; // Flag > Si un mouvement est en cours
//Pour la détection du dernier mouvement (homme mort)...
lastMoveTimeStamp = 0;


// Settings Default
navSys = 'KomNAV'; // "Robubox" ou "KomNAV" / 
navCh = 'webSocket'; // "webSocket" ou "webRTC" /
piloteLocalView = 'show';
robotLocalView = 'show';
piloteRemoteView = 'show';
robotRemoteView = 'show';
// Add du 29/11/2016
echoCancellation= true;
autoGainControl= true;
noiseSuppression= true;
highpassFilter= true;
typingNoiseDetection= true;


// Objet paramètres
parameters = {
    navSys: navSys,
    navCh: navCh,
    piloteLocalView: piloteLocalView,
    robotLocalView:  robotLocalView,
    piloteRemoteView: piloteRemoteView,
    robotRemoteView: robotRemoteView,
    // Add du 29/11/2016
    echoCancellation: echoCancellation,
    autoGainControl: autoGainControl,
    noiseSuppression: noiseSuppression,
    highpassFilter: highpassFilter,
    typingNoiseDetection: typingNoiseDetection,
};



// sélecteurs de micros et caméras
local_AudioSelect = document.querySelector('select#local_audioSource');
local_VideoSelect = document.querySelector('select#local_videoSource');

// sélecteurs de micros et caméras (robot) affiché coté pilote 
remote_AudioSelect = document.querySelector('select#remote_audioSource');
remote_VideoSelect = document.querySelector('select#remote_videoSource');

// Pour visualiser toutes les cams dispo coté Robot,
// on laisse par défaut l'affichage des devices.
local_AudioSelect.disabled = false;
local_VideoSelect.disabled = false;

// Sélécteurs définition caméra
if (type == "pilote-appelant") {
    robot_camdef_select = document.querySelector('select#robot_camdef_select');
    pilot_camdef_select = document.querySelector('select#pilot_camdef_select');
}


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
/**/

// 1to1 Pilote+Robot
// Liste des sources cam/micro
listeLocalSources = {};
listeRemoteSources = {};
exportMediaDevices = [];
// flag d'origine des listes (local/remote)
origin = null;

// flag de connexion
isStarted = false;


// élements videos
video1 = document.getElementById("1to1_localVideo"); // Sur IHM Robot, pilote, visiteur
video2 = document.getElementById("1to1_remoteVideo"); // Sur IHM Robot, pilote, visiteur


// webRTC DataChannel
// Zone d'affichage (textarea)
chatlog = document.getElementById("zone_chat_WebRTC");
// Zone de saisie (input)
message = document.getElementById("input_chat_WebRTC");


// 1to1 pilote + Robot
peerCnx1to1 = "Pilote-to-Robot"; // connexion principale Pilote/Robot
peerCnxId = "default"; // Nom par défaut


peerCnxId2 = "sol"; // Nom de la connexion secondaire pour la caméra au sol




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

// Tableau des connexions WebRTC (pour les 1toN et NtoN)
peerCnxCollection = {};

// Globale: flag de connexion webRTC active 
// Pour gérer les conflits entre les commandes déco/reco
// issues de l'interface et celles issues du Gamepad

IS_WebRTC_Connected = false;

// shims!
PeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
SessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;
IceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;
navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;


server = appSettings.setIceServers();
if (typeof appCNRS != 'undefined') server = appCNRS.setIceServers(type);



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


// Gamepad
xboxGamepad = false;


 // ------ fonctions de la phase présignaling --------------------------------


// Récupération de la liste des devices (Version2)
// Voir: https://www.chromestatus.com/feature/4765305641369600
// MediaStreamTrack.getSources(gotSources) utilisée jusqu'a présent n'est implémentée que dans Chrome.
// La page https://developers.google.com/web/updates/2015/10/media-devices indique qu'à partir de la version 47
// sont implémentées de nouvelles méthodes crossBrowser: navigator.mediaDevices.enumerateDevices().
// Je passe donc par cette méthode passerelle getAllAudioVideoDevices() qui switche entre les 2 méthodes
// selon les implémentation du navigateur.
// Adapté de  http://stackoverflow.com/questions/14610945/how-to-choose-input-video-device-for-webrtc
function getAllAudioVideoDevices(successCallback, failureCallback) {

    console.log("@ getAllAudioVideoDevices()");

    var allMdiaDevices = [];
    var allAudioDevices = [];
    var allVideoDevices = [];

    var audioInputDevices = [];
    var audioOutputDevices = [];
    var videoInputDevices = [];
    var videoOutputDevices = [];

    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        
        // Firefox 38+, Microsoft Edge, and Chrome 44+ seems having support of enumerateDevices
        navigator.enumerateDevices = function(callback) {
            navigator.mediaDevices.enumerateDevices().then(callback);
        };
    }

    else if (!navigator.enumerateDevices && window.MediaStreamTrack && window.MediaStreamTrack.getSources) {
        navigator.enumerateDevices = window.MediaStreamTrack.getSources.bind(window.MediaStreamTrack);
    }

    else {
        failureCallback(null, 'Neither navigator.mediaDevices.enumerateDevices navigator MediaStreamTrack.getSources are available.');
        return;
    }

    var allMdiaDevices = [];
    var allAudioDevices = [];
    var allVideoDevices = [];

    var audioInputDevices = [];
    var audioOutputDevices = [];
    var videoInputDevices = [];
    var videoOutputDevices = [];

    navigator.enumerateDevices(function(devices) {
        devices.forEach(function(_device) {
            var device = {};
            for (var d in _device) {
                device[d] = _device[d];
            }

            // make sure that we are not fetching duplicate devics
            var skip;
            allMdiaDevices.forEach(function(d) {
                if (d.id === device.id) {
                    skip = true;
                }
            });

            if (skip) {
                return;
            }

            // if it is MediaStreamTrack.getSources
            if (device.kind === 'audio') {
                device.kind = 'audioinput';
            }

            if (device.kind === 'video') {
                device.kind = 'videoinput';
            }

            if (!device.deviceId) {
                device.deviceId = device.id;
            }

            if (!device.id) {
                device.id = device.deviceId;
            }

            // Label jamais renseigné sous Firefox... 
            /*
            if (!device.label) {
                device.label = 'Please invoke getUserMedia once.';
            }
            /**/

            if (device.kind === 'audioinput' || device.kind === 'audio') {
                audioInputDevices.push(device);
            }

            if (device.kind === 'audiooutput') {
                audioOutputDevices.push(device);
            }

            if (device.kind === 'videoinput' || device.kind === 'video') {
                videoInputDevices.push(device);
            }

            if (device.kind.indexOf('audio') !== -1) {
                allAudioDevices.push(device);
            }

            if (device.kind.indexOf('video') !== -1) {
                allVideoDevices.push(device);
            }

            // there is no 'videoouput' in the spec.
            // so videoOutputDevices will always be [empty]

            allMdiaDevices.push(device);
        });

        if (successCallback) {
            successCallback({
                allMdiaDevices: allMdiaDevices,
                allVideoDevices: allVideoDevices,
                allAudioDevices: allAudioDevices,
                videoInputDevices: videoInputDevices,
                audioInputDevices: audioInputDevices,
                audioOutputDevices: audioOutputDevices
            });
            console.log ("SUCCESSCALLBACK")

        } else {
            alert ("ERROR");
        }
    });
}


// Affectation et traitement des résultats générées par getAllAudioVideoDevices()
function populateListDevices(result,sourceDevices) {
    console.log("@ populateListDevices()");
    console.log(sourceDevices);
    //console.log(result);

    // Si sources locales (pilote)
    if (sourceDevices == "local") {
        listeLocalSources = result;
    // Si sources distantes (Robot)
    } else if (sourceDevices == "remote") {
        listeRemoteSources = result;
    }

    // BUG: Double affichage des options remoteDevices en cas de déco/reco du Robot.
    // FIX ==> On vide la liste du formulaire de ses options.
    // Comment ==> En supprimant tous les enfants du nœud
    if (sourceDevices == "remote") {
        // On supprime tous les enfants du noeud précédent...
        while (remote_AudioSelect.firstChild) {
            // La liste n'étant pas une copie, elle sera réindexée à chaque appel
            remote_AudioSelect.removeChild(remote_AudioSelect.firstChild);
        }
        // Idem pour le noeud video
        while (remote_VideoSelect.firstChild) {
            remote_VideoSelect.removeChild(remote_VideoSelect.firstChild);
        }
    }

    
    // Creation d'une option vidéo "Par défaut"
    var optionDefault = document.createElement('option');
    optionDefault.id = "0";
    optionDefault.value = "default";
    optionDefault.text = "Default Camera";
    


    if (sourceDevices == "remote") {
       

    	remote_VideoSelect.appendChild(optionDefault);
        

        if (result.allMdiaDevices) {
            result.allMdiaDevices.forEach(function(sourceInfo) {
                populateFormDevices(sourceInfo,sourceDevices)
            });
        
        } else {
            result.forEach(function(sourceInfo) {
                populateFormDevices(sourceInfo,sourceDevices)
            });
        }


    } else if (sourceDevices == "local") {

    	if (type == "robot-appelé") local_VideoSelect.appendChild(optionDefault);
        
        var countEatch = 0;
        result.allMdiaDevices.forEach(function(sourceInfo) {

            populateFormDevices(sourceInfo,sourceDevices)

            // BUG: Quand il sont construit sous chrome V47 les objets javascript natif "device" 
            // retournés par navigator.mediaDevices.enumerateDevices() sont impossible à sérialiser 
            // ils plantent sur 'JSON.stringify(...)' bien qu'on puisse leur faire un 'JSON.parse(...)'.
            // Quand on les envoie par websocket, ca provoque systématiquement un "illegal invoke" ds socket.io.
            // FIX: comme il est impossible de cloner proprement l'objet, il faut le reconstuire propriétés par propriétés.
            //var exportDevice = new tools.sourceDevice();
            var exportDevice = new models.sourceDevice();
            exportDevice.id = sourceInfo.id;
            exportDevice.label = sourceInfo.label;
            exportDevice.kind = sourceInfo.kind;
            exportDevice.facing = sourceInfo.facing;
            exportMediaDevices[countEatch] = exportDevice;
            countEatch ++;

        });

        if (type == "robot-appelé") socket.emit('remoteListDevices', {listeDevices: exportMediaDevices}); 
    
    } 
    
    // On fait un RAZ du flag d'origine
    sourceDevices = null;


}


// Génération des listes de devices pour les formulaires
function populateFormDevices(device,sourceDevices) {

    console.log("@ populateFormDevices()");
    console.log(" ---- sourceDevices >>>>>");
    console.log(sourceDevices);
    console.log(" ---- device >>>>>");
    console.log(device);

    var option = document.createElement('option');
    option.id = device.id;
    option.value = device.id;

    if (device.kind === 'audioinput' || device.kind === 'audio') {

        if (sourceDevices == "local") {
            option.text = device.label || 'localMicro ' + (local_AudioSelect.length + 1) + ' (ID:' + device.id + ')';
            local_AudioSelect.appendChild(option);

        } else if (sourceDevices == "remote") {
            option.text = device.label || 'RemoteMicro ' + (remote_AudioSelect.length + 1) + ' (ID:' + device.id + ')';
            remote_AudioSelect.appendChild(option);
        } 


    } else if (device.kind === 'videoinput'|| device.kind === 'video') {

        if (sourceDevices == "local") {
            option.text = device.label || 'localCam ' + (local_VideoSelect.length + 1) + ' (ID:' + device.id + ')';
            local_VideoSelect.appendChild(option);

        } else if (sourceDevices == "remote") {
            option.text = device.label || 'RemoteCam ' + (remote_VideoSelect.length + 1) + ' (ID:' + device.id + ')';
            remote_VideoSelect.appendChild(option);
        } 

    } else {

        // console.log('Some other kind of source: ', device);

    }
}


// IHM Pilote & Robot: 
// Construction des constraint locale (affectation des devices sélectionnées)
function getLocalConstraint() {
    
    console.log("@ getLocalConstraint()");
    
    audioSource = local_AudioSelect.value;
    videoSource = local_VideoSelect.value;

    //console.log(videoSource);
    
    var camDef = "HD";
    if (type == "pilote-appelant") camDef = parameters.camDefPilote;
    else if (type == "robot-appelé") {
        camDef = parameters.camDefRobot;

        echoCancellation= parameters.echoCancellation;
        autoGainControl= parameters.autoGainControl;
        noiseSuppression= parameters.noiseSuppression;
        highpassFilter= parameters.highpassFilter;
        typingNoiseDetection= parameters.typingNoiseDetection;
    }
    





    var minCamWidth = 100, minCamHeight = 52;
    var maxCamWidth = 1920, maxCamHeight = 1080;

    /*
    if (camDef == 'VLD') {maxCamWidth = 100; maxCamHeight = 52}
    else if (camDef == '144p') {maxCamWidth = 196; maxCamHeight = 144}
    else if (camDef == '244p') {maxCamWidth = 350; maxCamHeight = 240}  
    else if (camDef == '360p') {maxCamWidth = 480; maxCamHeight = 360} 
    else if (camDef == 'VGA') {maxCamWidth = 640; maxCamHeight = 480}
    else if (camDef == '858p') {maxCamWidth = 858; maxCamHeight = 480} 
    else if (camDef == '720p') {maxCamWidth = 1280; maxCamHeight = 720} 
    else if (camDef == '1080p') {maxCamWidth = 1920; maxCamHeight = 1080} 
    /**/
    
    /*
    if (camDef == 'VLD') {maxCamWidth = 100; maxCamHeight = 52}
    else if (camDef == '144p') {maxCamWidth = 196; maxCamHeight = 144}
    else if (camDef == '244p') {minCamWidth = 196; minCamHeight = 144, maxCamWidth = 350; maxCamHeight = 240}  
    else if (camDef == '360p') {minCamWidth = 350; minCamHeight = 240, maxCamWidth = 480; maxCamHeight = 360} 
    else if (camDef == 'VGA') {minCamWidth = 480; minCamHeight = 360, maxCamWidth = 640; maxCamHeight = 480}
    else if (camDef == '858p') {minCamWidth = 640; minCamHeight = 480, maxCamWidth = 858; maxCamHeight = 480} 
    else if (camDef == '720p') {minCamWidth = 858; minCamHeight = 480, maxCamWidth = 1280; maxCamHeight = 720} 
    else if (camDef == '1080p') {minCamWidth = 1280; minCamHeight = 720, maxCamWidth = 1920; maxCamHeight = 1080} 
    /**/


    var listOptionsDefinition = '<option value="144p">144p: 196x144</option>'; 
    listOptionsDefinition += '<option value="QVGA">QVGA: 320x240</option>'; 
    listOptionsDefinition += '<option value="VGA">VGA: 640x480</option>';
    listOptionsDefinition += '<option value="HD">HD: 1280x720</option>';
    listOptionsDefinition += '<option value="Full HD">Full HD: 1920x1080</option>';

    if (camDef == '144p') {minCamWidth = 100; minCamHeight = 56, maxCamWidth = 196; maxCamHeight = 110}
    //if (camDef == '144p') {minCamWidth = 1268; minCamHeight = 520, maxCamWidth = 1268; maxCamHeight = 520}
    else if (camDef == 'QVGA') {minCamWidth = 196; minCamHeight = 144, maxCamWidth = 320; maxCamHeight = 240}  
    else if (camDef == 'VGA') {minCamWidth = 320; minCamHeight = 240, maxCamWidth = 640; maxCamHeight = 480}
    else if (camDef == 'HD') {minCamWidth = 640; minCamHeight = 480, maxCamWidth = 1280; maxCamHeight = 720}
    else if (camDef == 'Full HD') {minCamWidth = 1280; minCamHeight = 720, maxCamWidth = 1920; maxCamHeight = 1080} 


    var framerate = 24;

    var localConstraints;
    
    /*// Ancienne version. bloquait à 640*480
    localConstraints = { 
            audio: { optional: [{sourceId: audioSource}] },
            video: {
                optional: [{sourceId: videoSource}],   
                mandatory: { maxWidth: maxCamWidth, maxHeight: maxCamHeight }
            }
        }
    /**/

    /*// Nouvelle version permettant d'aller au dela de 640*480'
    // Fonctionne seulement à partir de Chrome V 46 ++ 
    // >>> BUG: Ne prend pas en compte la définition minimale déclarée
    // >>> et impose une définition limitée à 320*180 maximum si la caméra ne supporte pas la définition demandée.
    localConstraints = { 
        audio: { optional: [{sourceId: audioSource}] },
        video: {
                deviceId: videoSource ? {exact: videoSource} : undefined, 
                minWidth: minCamWidth, 
                minHeight: minCamHeight,
                width: maxCamWidth, 
                height: maxCamHeight 
        }
    }
    /**/

    /* // Bonne pratique "officielle" de l'implémentation (Chrome V46 ++)
    // >>> BUG: plante lamentablement si la caméra ne supporte pas la définition demandée
    localConstraints = { 
        audio: { optional: [{sourceId: audioSource}] },
        video: {
                deviceId: videoSource ? {exact: videoSource} : undefined, 
                width: {exact: maxCamWidth}, 
                height: {exact: maxCamHeight}
        }
    }
    /**/
   
    /* // OK sur Chrome V50
    // >>> Défaut: Pas de définition minimale déclarée, donc 320*180 max si la caméra ne supporte pas la définition demandée.
    localConstraints = { 
        audio: { optional: [{sourceId: audioSource}] },
        video: {
                deviceId: videoSource ? {exact: videoSource} : undefined, 
                width: {ideal: maxCamWidth}, 
                height: {ideal: maxCamHeight}
        }
    }
    /**/

    // OK sur V50.
    /*// >>> Prend en compte la définition minimale déclarée si la caméra ne supporte pas la définition max demandée.  
    localConstraints = { 
        audio: { optional: [{sourceId: audioSource}] },
        video: {
                deviceId: videoSource ? {exact: videoSource} : undefined, 
                width: {min:minCamWidth ,ideal: maxCamWidth}, 
                height: {min:minCamHeight ,ideal: maxCamHeight}
        }
    }
    /**/

    /*
    localConstraints = { 
       mandatory: {OfferToReceiveAudio: true, OfferToReceiveVideo: true},
       // audio: {deviceId: audioSource ? {exact: audioSource} : undefined},
       audio: true,
       video: {
                deviceId: videoSource ? {exact: videoSource} : undefined, 
                width: {min:minCamWidth ,ideal: maxCamWidth}, 
                height: {min:minCamHeight ,ideal: maxCamHeight}
        }
    }
    /**/
  
    
    // Avec la gestion des filtres...
    
    if (videoSource != "default") {

    localConstraints = { 
       mandatory: {OfferToReceiveAudio: true, OfferToReceiveVideo: true},
        audio: {
            mandatory: {
                googEchoCancellation: echoCancellation,
                googAutoGainControl: autoGainControl,
                googNoiseSuppression: noiseSuppression,
                googHighpassFilter: highpassFilter,
                googTypingNoiseDetection: typingNoiseDetection,
                //googAudioMirroring: true, // For some reason setting googAudioMirroring causes a navigator.getUserMedia error:  NavigatorUserMediaError
            },
            optional: [],
        },
        video: {
                deviceId: videoSource ? {exact: videoSource} : undefined, 
                width: {min:minCamWidth ,ideal: maxCamWidth}, 
                height: {min:minCamHeight ,ideal: maxCamHeight}
        }
    }
    
  } else if (videoSource == "default") {

    // Idem, mais la constraint d'ID de caméra vide...
    localConstraints = { 
       mandatory: {OfferToReceiveAudio: true, OfferToReceiveVideo: true},
        audio: {
            mandatory: {
                googEchoCancellation: echoCancellation,
                googAutoGainControl: autoGainControl,
                googNoiseSuppression: noiseSuppression,
                googHighpassFilter: highpassFilter,
                googTypingNoiseDetection: typingNoiseDetection,
                //googAudioMirroring: true, // For some reason setting googAudioMirroring causes a navigator.getUserMedia error:  NavigatorUserMediaError
            },
            optional: [],
        },
        video: {
                width: {min:minCamWidth ,ideal: maxCamWidth}, 
                height: {min:minCamHeight ,ideal: maxCamHeight}
        }
    }
    /**/

  }


    return localConstraints;
} 



// ---- > Ecouteurs webSocket de pré-signaling

// Pilote: Reception de la liste des Devices du Robot V2 (version objet)
// coté serveur >> socket.broadcast.emit('remoteListDevices', {objUser:data.objUser, listeDevices:data.listeDevices});
socket.on('remoteListDevices', function(data) {
    console.log(">> socket.on('remoteListDevices',...");
    // On renseigne  le flag d'ogigine
    if (type == "pilote-appelant") {
        origin = "remote";
        // On alimente les listes de micro/caméra distantes
        // Sauf dans le cas d'une déconnexion involontaire du robot
        // ou on dois garder la liste et la séléction en cours...
        // if (robotDisconnection != "Unexpected") gotSources(data.listeDevices);
        console.log(data);
        if (robotDisconnection != "Unexpected") populateListDevices(data.listeDevices,origin);
    }
    /**/
})

// Pilote: Reception du signal de fin pré-signaling
socket.on("readyForSignaling", function(data) {
    console.log(">> socket.on('readyForSignaling',...");
    if (type == "pilote-appelant") {
        if (data.message == "ready") {
            // initLocalMedia(peerCnxId); 
            initLocalMedia(peerCnx1to1);
        }
    }
})

// Robot: Reception cam et micro selectionnés par le pilote (apellant)
// Coté serveur >> socket.broadcast.emit('selectedRemoteDevices', {objUser:data.objUser, listeDevices:data.listeDevices});
socket.on('selectedRemoteDevices', function(data) {
    console.log(">> socket.on('selectedRemoteDevices',...");
    console.log(data);

    if (type == "robot-appelé") {
        // On rebalance au formulaire les caméras/micros choisies par le pilote
        document.getElementById(data.listeDevices.selectAudio).selected = "selected";
        document.getElementById(data.listeDevices.selectVideo).selected = "selected";

        // On affecte les paramètres de settings
        parameters = data.appSettings;

        var infoMicro = "<strong> Micro Activé </strong>"
        var infoCam = "<strong> Caméra Activée </strong>"
        document.getElementById("messageDevicesStateMicro").innerHTML = infoMicro;
        document.getElementById("messageDevicesStateCams").innerHTML = infoCam;

        // On lance l'initlocalmedia
        initLocalMedia(peerCnx1to1);
    }
})


// ---- Ecouteurs Websockets communs au pilote et robot

// Reception du statut de connexion du pilote
socket.on("piloteCnxStatus", function(data) {
    console.log('>> socket.on("piloteCnxStatus" , '+data.message);
    piloteCnxStatus = data.message;
});
/**/

// Reception du statut de connexion du robot
socket.on("robotCnxStatus", function(data) {
    console.log('socket.on("robotCnxStatus" , '+data.message);
    robotCnxStatus = data.message;

    // Version 1to1
    // Si on est le pilote, on vérifie sa propre connexion et celle du robot
    // si tout est propre, on active le formulaire de lancement (Selection des caméras du robot à activer...)
    if (type == "pilote-appelant") {
        
        // On force la mise à jour de la liste utilisateurs coté Pilote
        usersConnection.updateListUsers ();

        // Si le robot à une nouvelle connexion principale
        // on lance le processus préparatoire à une reconnexion
        if (robotCnxStatus == 'new') onDisconnect(peerCnx1to1);

        // Si les 2 pairs principales sont claires de toute connexion
        if (piloteCnxStatus == 'new' && robotCnxStatus == 'new') {
            if (type == "pilote-appelant") activeManageDevices(); 
        }
    }
    
});

// Quand on reçoit un update de la liste des clients websockets 
// C.A.D à chaque nouvel arrivant... 
socket.on('updateUsers', function(data) {
    console.log(">> socket.on('updateUsers',...");
    // On met à jour la liste locale des connectés...
    oldUsers = users;
    users = data;
    //var debug = tools.stringObjectDump(users,"users");
    //console.log(debug);

    // si on est l'apellé  (Robot)
    // On renvoie à l'autre pair la liste de ses devices
    // Et on met à jour le flag isOnePilot (pour ouvrir le canal d'infos de cartographie)
    if (type == "robot-appelé") {
        // isOnePilot = tools.searchInObjects(users, "typeClient", "Pilote", "boolean");
        isOnePilot = tools.searchInObjects(users.listUsers, "typeClient", "Pilote", "boolean");
        
       
        if (tools.isEmpty(listeLocalSources) == false) {
            socket.emit('remoteListDevices', {listeDevices: exportMediaDevices});
        }
        
        // On envoie ensuite son etat de connexion - Version 1to1
        if ( ! peerCnxCollection[peerCnx1to1] ) robotCnxStatus = 'new'; 
        else robotCnxStatus = peerCnxCollection[peerCnx1to1].iceConnectionState; 
        socket.emit("robotCnxStatus", robotCnxStatus);
        
    }

    // si on est le pilote, 
    // ... En cas de besoin...
    if (type == "pilote-appelant") {
        if (usersConnection) usersConnection.updateListUsers(); // Appel à la fonction du module manageVisitors
        else console.log("!! Module userconnection pas encore chargé");
        // on met à jour son status de connexion
        if ( ! peerCnxCollection[peerCnx1to1] ) piloteCnxStatus = 'new'; 
        else piloteCnxStatus = peerCnxCollection[peerCnx1to1].iceConnectionState; 
        socket.emit("piloteCnxStatus", piloteCnxStatus);

    }
})

// Reception du niveau de la batterie
socket.on("battery_level", function(data) {
    ihm.refreshJaugeBattery(data.percentage) // redessiner la jauge au niveau de l'ihm pilote
});





