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



//------ PHASE 1 : Pré-signaling ----------------------------------------------------------

// --------------- ! Replace by 1to1-basic select cam process ------------

// sélecteurs de micros et caméras
local_AudioSelect = document.querySelector('select#local_audioSource');
local_VideoSelect = document.querySelector('select#local_videoSource');

// sélecteurs de micros et caméras (robot) affiché coté pilote 
remote_AudioSelect = document.querySelector('select#remote_audioSource');
remote_VideoSelect = document.querySelector('select#remote_videoSource');

// Liste des sources cam/micro
listeLocalSources = {};
listeRemoteSources = {};
exportMediaDevices = [];


// Récupération de la liste des devices (Version2)
// Voir: https://www.chromestatus.com/feature/4765305641369600
// MediaStreamTrack.getSources(gotSources) utilisée jusqu'a présent n'est implémentée que dans Chrome.
// La page https://developers.google.com/web/updates/2015/10/media-devices indique qu'à partir de la version 47
// sont implémentées de nouvelles méthodes crossBrowser: navigator.mediaDevices.enumerateDevices().
// Je passe donc par cette méthode passerelle getAllAudioVideoDevices() qui switche entre les 2 méthodes
// selon les implémentation du navigateur.
// Adapté de  http://stackoverflow.com/questions/14610945/how-to-choose-input-video-device-for-webrtc
function getAllAudioVideoDevices(successCallback, failureCallback) {

    console.log("getAllAudioVideoDevices()");

    var allMdiaDevices = [];
    var allAudioDevices = [];
    var allVideoDevices = [];

    var audioInputDevices = [];
    var audioOutputDevices = [];
    var videoInputDevices = [];
    var videoOutputDevices = [];

    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        
        // Firefox 38+, Microsoft Edge, and Chrome 44+ seems having support of enumerateDevices
        //alert ("COOL");
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
        }
    });
}

// Affectation et traitement des résultats générées par getAllAudioVideoDevices()
function populateListDevices(result,sourceDevices) {
    console.log("populateListDevices()");
    // console.log(result);

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

    
    
    
    if (sourceDevices == "remote") {
       
        console.log ('XXXXXXXXXXXXXXXXXX')
        if (result) {
            console.log ("result:")
            console.log (result)

        }

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

    console.log("populateFormDevices()");
    // console.log(device);

    var option = document.createElement('option');
    option.id = device.id;
    option.value = device.id;
    // console.log (option)

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

        console.log('Some other kind of source: ', device);

    }
}

// Récupération de la liste des devices (Version2)
// Voir: https://www.chromestatus.com/feature/4765305641369600
// MediaStreamTrack.getSources(gotSources) utilisée jusqu'a présent n'est implémentée que dans Chrome.
// La page https://developers.google.com/web/updates/2015/10/media-devices indique qu'à partir de la version 47
// sont implémentées de nouvelles méthodes crossBrowser: navigator.mediaDevices.enumerateDevices().
// Je passe donc par une méthode passerelle getAllAudioVideoDevices() qui switche entre les 2 méthodes
// selon les implémentation du navigateur.
var origin = "local"; // On prévient la fonction apellée que la source sera locale

getAllAudioVideoDevices(function(result) {
    populateListDevices(result,origin);
}, function(error) {
    if (error == null) error = "erreur getAllAudioVideoDevices()";
    alert(error);
});
/**/

// ----------------------------- reprise normùale ----------------------


// IHM Pilote
// Dévérouillage formulaires selection caméras Robot
// Animation d'invite
function activeManageDevices() {

     console.log("@ activeManageDevices()");

    // On active les sélecteurs de listes
    remote_ButtonDevices.disabled = false;
    remote_AudioSelect.disabled = false;
    remote_VideoSelect.disabled = false;

    // Une petite animation CSS pour visualiser l'invite de formulaire...
    ihm.manageSubmitForm("robotDevices","activate");
}

// IHM Pilote:
// Traitement du formulaire de selection caméras du robot
// Dévérouillage du formulaire de selection des devices du pilote 
// et invite lancement processus connexion 1to1 pilote/robot
function remoteManageDevices() {

    console.log("@ remoteManageDevices()");
    // Activation
    if (type == "pilote-appelant") {
        local_ButtonDevices.disabled = false;
    }
    local_AudioSelect.disabled = false;
    local_VideoSelect.disabled = false;

    // Invite de formulaire...
    ihm.manageSubmitForm("piloteDevices","activate");
}

// IHM Pilote:
// Au submit du bouton d'ouverture de connexion -> 
// > Désactivation des formulaires remote et local de selection des devices
// > Animation CSS de désactivation
// > Envoi au robot des settings de benchmarks
// > Envoi au Robot la liste des devices à activer.
function localManageDevices() {

    console.log("@ localManageDevices()");

    IS_WebRTC_Connected = true;

    if (type == "pilote-appelant") {
        local_ButtonDevices.disabled = true;
    }

    local_AudioSelect.disabled = true;
    local_VideoSelect.disabled = true;

    remote_ButtonDevices.disabled = true;
    remote_AudioSelect.disabled = true;
    remote_VideoSelect.disabled = true;

    // Animation CSS de désactivation du formulaire devices robot...
    ihm.manageSubmitForm("robotDevices","deactivate");

    // On balance coté robot les devices sélectionnés...
    // ... Et les Settings de canal/caméra du benchmarking...
    if (type == "pilote-appelant") {
        var selectAudio = remote_AudioSelect.value;
        var selectVideo = remote_VideoSelect.value;
        var selectList = {
            selectAudio, selectVideo
        };
        
        if (type == "pilote-appelant" && proto == "1to1") {
            // Récupérations sélections définition caméras
            parameters.camDefRobot = robot_camdef_select.value;
            parameters.camDefPilote = pilot_camdef_select.value;
        }

        var appSettings = parameters;
        socket.emit('selectedRemoteDevices', {
            objUser: localObjUser,
            listeDevices: selectList,
            appSettings: appSettings
        }); // Version Objet

        // Animation CSS de désactivation du formulaire devices pilote...
        ihm.manageSubmitForm("piloteDevices","deactivate");
    }
}

// IHM Pilote & Robot: 
// Construction des constraint locale (affectation des devices sélectionnées)
function getLocalConstraint() {
    
    console.log("@ getLocalConstraint()");
    
    audioSource = local_AudioSelect.value;
    videoSource = local_VideoSelect.value;
    
    var camDef = "HD";
    if (type == "pilote-appelant") camDef = parameters.camDefPilote;
    else if (type == "robot-appelé") camDef = parameters.camDefRobot;
    var maxCamWidth = 100, maxCamHeight = 100;
    /*
    if (camDef == 'VLD') {maxCamWidth = 100; maxCamHeight = 52} // 16/9
    else if (camDef == 'LD') {maxCamWidth = 160; maxCamHeight = 88} // 16/9
    else if (camDef == 'MD') {maxCamWidth = 320; maxCamHeight = 180} // 16/9 
    else if (camDef == 'HD') {maxCamWidth = 640; maxCamHeight = 360} // 16/9
    else if (camDef == 'VHD') {maxCamWidth = 640; maxCamHeight = 480} // 4/3..
    else if (camDef == '720p') {maxCamWidth = 1280; maxCamHeight = 720} // 16/9..
    else if (camDef == '1080p') {maxCamWidth = 1920; maxCamHeight = 1200} // 16/9..
    /**/


    if (camDef == 'VLD') {maxCamWidth = 100; maxCamHeight = 52}
    else if (camDef == '144p') {maxCamWidth = 196; maxCamHeight = 144}
    else if (camDef == '244p') {maxCamWidth = 350; maxCamHeight = 240}  
    else if (camDef == '360p') {maxCamWidth = 480; maxCamHeight = 360} 
    else if (camDef == 'VGA') {maxCamWidth = 640; maxCamHeight = 480}
    else if (camDef == '858p') {maxCamWidth = 858; maxCamHeight = 480} 
    else if (camDef == '720p') {maxCamWidth = 1280; maxCamHeight = 720} 
    else if (camDef == '1080p') {maxCamWidth = 1920; maxCamHeight = 1200} 
    
    var framerate = 24;

    var localConstraints;
    
    /*// ancienne version. bloquait à 640*480
    localConstraints = { 
            audio: { optional: [{sourceId: audioSource}] },
            video: {
                optional: [{sourceId: videoSource}],   
                mandatory: { maxWidth: maxCamWidth, maxHeight: maxCamHeight }
            }
        }
    /**/

    // Nouvelle version. Ne passe plus si Chrome > V 46   
    localConstraints = { 
        audio: { optional: [{sourceId: audioSource}] },
        video: {
                deviceId: videoSource ? {exact: videoSource} : undefined, 
                width: maxCamWidth, 
                height: maxCamHeight 
        }
    }

    /**/
    
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

    if (type == "robot-appelé") {
        // On rebalance au formulaire les caméras/micros choisies par le pilote
        document.getElementById(data.listeDevices.selectAudio).selected = "selected";
        document.getElementById(data.listeDevices.selectVideo).selected = "selected";

        // On affecte les paramètres de settings
        parameters = data.appSettings;
        // alert("Parameters: " +data.appSettings.lRview);

        // console.log(data); 
        //var debugg = tools.stringObjectDump(data,"selectedRemoteDevice")
        //console.log(debugg);
        //console.log(data);



        var infoMicro = "<strong> Micro Activé </strong>"
        var infoCam = "<strong> Caméra Activée </strong>"
        document.getElementById("messageDevicesStateMicro").innerHTML = infoMicro;
        document.getElementById("messageDevicesStateCams").innerHTML = infoCam;

        // On lance l'initlocalmedia
        initLocalMedia(peerCnx1to1);


        // On rebalance au pilote-appelant le top-départ pour 
        // qu'il lance un intilocalMedia de son coté....
        // socket.emit("readyForSignaling","ready"); // ancienne version

        // Fix Bug renégociation > On vérifie que c'est une renégo et
        // si c'est le cas, on attend d'avoir l'état du statut webRTC ps iceConnexionXtate à "new"
        // pour lancer le message de fin de pré-signaling . A faire ds l'écouteur idoine...
        /*socket.emit('readyForSignaling', {
            objUser: localObjUser,
            message: "ready"
        }); // Version objet
/**/
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
        updateListUsers ();

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
// C.A.D à chaque nouveln arrivant... 
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
        
        // console.log ("isOnePilot ="+ isOnePilot);
        
        /*
        socket.emit('remoteListDevices', {
            objUser: localObjUser,
            listeDevices: listeLocalSources
        });
        /**/

        
        if (tools.isEmpty(listeLocalSources) == false) {
            socket.emit('remoteListDevices', {listeDevices: exportMediaDevices});
        }
        /**/


        
        // On envoie ensuite son etat de connexion - Version 1to1
        if ( ! peerCnxCollection[peerCnx1to1] ) robotCnxStatus = 'new'; 
        else robotCnxStatus = peerCnxCollection[peerCnx1to1].iceConnectionState; 
        socket.emit("robotCnxStatus", robotCnxStatus);
        
    }

    // si on est le pilote, 
    // ... En cas de besoin...
    if (type == "pilote-appelant") {
        // on met à jour son status de connexion
        if ( ! peerCnxCollection[peerCnx1to1] ) piloteCnxStatus = 'new'; 
        else piloteCnxStatus = peerCnxCollection[peerCnx1to1].iceConnectionState; 
        socket.emit("piloteCnxStatus", piloteCnxStatus);
        // console.log (users);
        updateListUsers(); // Appel à la fonction du module manageVisitors
    }
})

// Reception du niveau de la batterie
socket.on("battery_level", function(data) {
    // console.log('onBattery_level >>');
   // console.log('objet Batterie percentage ' + data.percentage);
    ihm.refreshJaugeBattery(data.percentage) // redessiner la jauge au niveau de l'ihm pilote
});

