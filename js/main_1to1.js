// Script inspiré de l'article suivant:
// https://developer.mozilla.org/fr/docs/Web/Guide/API/WebRTC/WebRTC_basics
// Source github : https://github.com/louisstow/WebRTC/blob/master/media.html

//------ PHASE 1 : Pré-signaling ----------------------------------------------------------

// ---- > Ecouteurs webSocket 
// Messages d'erreur et contrôles d'accès
socket.on('error', errorHandler);
socket.on('rejectConnexion', function(data) {
    alertAndRedirect(data.message, data.url)
})

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

//console.log (robotConstraints);
//console.log (piloteConstraints);


// Lancement de la récupération des Devices disponibles
if (typeof MediaStreamTrack === 'undefined') {
    alert('This browser does not support MediaStreamTrack.\n\nTry Chrome.');
} else {
    origin = "local"; // On prévient la fonction apellée que la source sera locale
    MediaStreamTrack.getSources(gotSources);
}

// IHM Pilote & Robot
// Génération des listes de sélection sources (cam/micro) 
// disponibles localement et a distance
function gotSources(sourceInfos) {

    console.log("@ gotSources()");
    //console.log(sourceInfos);

    // Si sources locales (pilote)
    if (origin == "local") {
        listeLocalSources = sourceInfos;

        // Si sources distantes (Robot)
    } else if (origin == "remote") {
        listeRemoteSources = sourceInfos;

    }

    // BUG: Double affichage des options remoteDevices en cas de déco/reco du Robot.
    // FIX ==> On vide la liste du formulaire de ses options.
    // Comment ==> En supprimant tous les enfants du nœud
    if (origin == "remote") {
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

    for (var i = 0; i !== sourceInfos.length; ++i) {

        var sourceInfo = sourceInfos[i];
        var option = document.createElement('option');
        option.id = sourceInfo.id;
        option.value = sourceInfo.id;

        // Reconstruction de l'objet javascript natif sourceInfo:
        // Quand il est construit sous chromium et transmit par websocket
        // vers Chrome impossible d'accéder à ses attributs une foi transmit... 
        // Ce qui est bizarre, c'est que l'objet natif semble tout à fait normal avant transmission.
        // Par contre, R.A.S quand on le transmet de Chrome à Chrome ou de Chromium à chromium.
        var sourceDevice = new tools.sourceDevice();
        sourceDevice.id = sourceInfo.id;
        sourceDevice.label = sourceInfo.label;
        sourceDevice.kind = sourceInfo.kind;
        sourceDevice.facing = sourceInfo.facing;
        sourceInfos[i] = sourceDevice;

        // Conflit webcam Chromium/Chrome si même device choisi sur le PC local
        // >>> L'ID fournie par L'API MediaStreamTrack.getSources est différente
        // selon le navigateur et ne permet pas de différencier cams et micros correctement
        // TODO: Trouver une solution de contournement pour les tests interNavigateurs sur une même machine

        if (sourceInfo.kind === 'audio') {

            if (origin == "local") {
                option.text = sourceInfo.label || 'localMicro ' + (local_AudioSelect.length + 1) + ' (ID:' + sourceInfo.id + ')';
                local_AudioSelect.appendChild(option);

            } else if (origin == "remote") {
                option.text = sourceInfo.label || 'RemoteMicro ' + (remote_AudioSelect.length + 1) + ' (ID:' + sourceInfo.id + ')';
                remote_AudioSelect.appendChild(option);
            }


        } else if (sourceInfo.kind === 'video') {

            if (origin == "local") {
                option.text = sourceInfo.label || 'localCam ' + (local_VideoSelect.length + 1) + ' (ID:' + sourceInfo.id + ')';
                local_VideoSelect.appendChild(option);

            } else if (origin == "remote") {
                option.text = sourceInfo.label || 'RemoteCam ' + (remote_VideoSelect.length + 1) + ' (ID:' + sourceInfo.id + ')';
                remote_VideoSelect.appendChild(option);
            }

        } else {

            console.log('Some other kind of source: ', sourceInfo);

        }
    }

    // On fait un RAZ du flag d'origine
    origin = null;
}

// IHM Pilote
// Dévérouillage formulaires selection caméras Robot
// Animation d'invite
function activeManageDevices() {

    // On active les sélecteurs de listes
    remote_ButtonDevices.disabled = false;
    remote_AudioSelect.disabled = false;
    remote_VideoSelect.disabled = false;

    // Une petite animation CSS pour visualiser l'invite de formulaire...
    document.getElementById("robotDevices").className = "insideFlex oneQuarterbox robot shadowGreen devicesInvite";
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
    document.getElementById("piloteDevices").className = "insideFlex oneQuarterbox pilote devices shadowGreen devicesInvite";
}

// IHM Pilote:
// Au submit du bouton d'ouverture de connexion -> 
// > Désactivation des formulaires remote et local de selection des devices
// > Animation CSS de désactivation
// > Envoi au robot des settings de benchmarks
// > Envoi au Robot la liste des devices à activer.
function localManageDevices() {

    console.log("@ localManageDevices()");
    if (type == "pilote-appelant") {
        local_ButtonDevices.disabled = true;
    }

    local_AudioSelect.disabled = true;
    local_VideoSelect.disabled = true;

    remote_ButtonDevices.disabled = true;
    remote_AudioSelect.disabled = true;
    remote_VideoSelect.disabled = true;

    // Animation CSS de désactivation du formulaire devices robot...
    document.getElementById("robotDevices").className = "insideFlex oneQuarterbox  robot devices shadowBlack device";

    // On balance au robot les paramètres de benchmarkings 
    // socket.emit('settingBenchmarks', {objUser:localObjUser,listeDevices:selectList}); // Version Objet

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
        // socket.emit("selectedRemoteDevices", selectList); Ancienne version
        // Coté serveur >> socket.broadcast.emit('selectedRemoteDevices', {objUser:data.objUser, listeDevices:data.listeDevices});
        socket.emit('selectedRemoteDevices', {
            objUser: localObjUser,
            listeDevices: selectList,
            appSettings: appSettings
        }); // Version Objet

        // Animation CSS de désactivation du formulaire devices pilote...
        document.getElementById("piloteDevices").className = "insideFlex oneQuarterbox pilote devices shadowBlack device";
    }
}

// IHM Pilote & Robot: 
// Construction des constrain locale (affectation des devices sélectionnées)
function getLocalConstraint() {
	audioSource = local_AudioSelect.value;
	videoSource = local_VideoSelect.value;
	
    var camDef = "HD";
    if (type == "pilote-appelant") camDef = parameters.camDefPilote;
    else if (type == "robot-appelé") camDef = parameters.camDefRobot;
    var maxCamWidth = 100, maxCamHeight = 100;
    if (camDef == 'VLD') {maxCamWidth = 100; maxCamHeight = 52} // 16/9
    else if (camDef == 'LD') {maxCamWidth = 160; maxCamHeight = 88} // 16/9
    else if (camDef == 'MD') {maxCamWidth = 320; maxCamHeight = 180} // 16/9 
    else if (camDef == 'HD') {maxCamWidth = 640; maxCamHeight = 360} // 16/9
    else if (camDef == 'FHD') {maxCamWidth = 640; maxCamHeight = 480} // 4/3..

    // alert (maxCamWidth+"*"+maxCamHeight);

    var framerate = 24;

    var testConstraints = { 
            audio: { optional: [{sourceId: audioSource}] },
            video: {
                optional: [{sourceId: videoSource}],   
                mandatory: { maxWidth: maxCamWidth, maxHeight: maxCamHeight }
                // mandatory: { width: { ideal: 100 }, height: { ideal: 100 } } // BUG: Ca plante complètement sous Chrome...
            }
        }
    /**/


    var sourcedConstraints = {    
       audio: {optional: [{sourceId: audioSource}]},
       video: {optional: [{sourceId: videoSource}]}   
    }

    //var localConstraint = sourcedConstraints;
    var localConstraint = testConstraints;



	return localConstraint;
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
        gotSources(data.listeDevices);
    }
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

        console.log(data); 
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
        
        console.log ("isOnePilot ="+ isOnePilot);
        socket.emit('remoteListDevices', {
            objUser: localObjUser,
            listeDevices: listeLocalSources
        });
        
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
        console.log (users);
        updateListUsers(); // Appel à la fonction du module manageVisitors
    }
})

// Reception du niveau de la batterie
socket.on("battery_level", function(data) {
   // console.log('objet Batterie percentage ' + data.percentage);
    refreshJaugeBattery(data.percentage) // redessiner la jauge au niveau de l'ihm pilote
});

// ------------ Ajouts 1toN -------------------------


// Reception d'une demande de clearance
socket.on('requestClearance', function(data) {
    console.log (">> socket.on('requestClearance',...");
    //console.log (visitor);
    // Si la connexion avec le Robot est déja initialisée
    if (isStarted == true) { // False pour tests...
        socket.emit('responseClearance', {
            from: localObjUser,
            cible: data.from,
            message: "ready"
        }); 
    }
});

// ---- PHASE 2 : Signaling --------------------------------------------------

// initialisation du localStream et appel connexion
function initLocalMedia(peerCnxId) {

    console.log("@ initLocalMedia("+peerCnxId+")");

    peerCnxCollection[peerCnxId] =new PeerConnection(server, options);
    console.log("new peerCnxCollection["+peerCnxId+"]"); 
    console.log(peerCnxCollection); 

    // Récupération et affectation des caméras et micros selectionnés  
    constraint = getLocalConstraint();

    // Initialisation du localStream et lancement connexion
    navigator.getUserMedia(constraint, function(stream) {

        
        console.log(" >>>> @  navigator.getUserMedia(constraint, function(stream)");
        console.log(stream);    

        /*// Pour éviter la perte de caméras en cas de changement de constraints
        //// PUTAIN  DE BUG DE MERDE !!!!!!!!!!! ---- Michel, il marche pas ton code !!!!!!!
        // J'ai encore les cam du pc pilote complètement HS !!!!!!!!!!!!!!!!
        // WTF ...@%§!/@..
        if (!!stream) {
            video1.src = null;
            stream.stop();
        }
        /**/
        // alert(stream);


        //console.log(parameters.lRview)
        localStream = stream;



        var showLocalVideo = true;
        if (type == "pilote-appelant") {
            if (parameters.lPview != 'show') showLocalVideo = false;
        } else if (type == "robot-appelé") {
            // alert("local view: " +parameters.lRview);
            if (parameters.lRview != 'show') showLocalVideo = false;
        	// On prévient l'autre pair qu'il peut lui aussi ouvrir sa caméra
            socket.emit('readyForSignaling', {
	            objUser: localObjUser,
	            message: "ready"
			});
			/**/
        }
        if (showLocalVideo == true) video1.src = URL.createObjectURL(localStream);
        
        peerCnxCollection[peerCnxId].addStream(localStream);
        connect(peerCnxId);
    }, errorHandler);
};

// initialisation de la connexion
function connect(peerCnxId) {

    //console.log ("@ connect()");
    debugNbConnect += 1;
    console.log("@ connect("+peerCnxId+") n°"+debugNbConnect+"> rôle: " + type);
    isStarted = true;
    // if (type == "pilote-appelant") updateListUsers(); // Rafraichissement de la liste des visiteurs

    // Ecouteurs communs apellant/apellé
    // ---------------------------------

    // Ecouteurs de l'API WebRTC -----------------

    // Ecouteur déclenché à la génération d'un candidate 
    peerCnxCollection[peerCnxId].onicecandidate = function(e) {
        //console.log("@ pc["+peerCnxId+"].onicecandidate > timestamp:" + Date.now());
        // vérifie que le candidat ne soit pas nul
        if (!e.candidate) {
            // console.log("  > !e.candidate): return ");
            return;
        }
    
        var cible = ""; 
        // Si on est bien dans la peerConnection principale (Pilote <> Robot)
        if (peerCnxId == peerCnx1to1) {
            if (type === "pilote-appelant" ) cible = getClientBy('typeClient','Robot');
            else if ( type === "robot-appelé") cible = getClientBy('typeClient','Pilote');
        
        } 
        console.log ("------------ Candidate to >>> "+cible.typeClient+"----------");
        var data = {from: localObjUser, message: e.candidate, cible: cible, peerCnxId: peerCnxId}
        // console.log (data);
        socket.emit("candidate2", data);
    
    };


    // Ecouteur déclenché a la reception d'un remoteStream
    peerCnxCollection[peerCnxId].onaddstream = function(e) {
        console.log("@ @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
        console.log("@ pc["+peerCnxId+"].onaddstream > timestamp:" + Date.now());
        console.log(e);


        var showRemoteVideo = true;
        
        // Version 1to1
        remoteStream = e.stream;

        if (type == "pilote-appelant") {
            if (parameters.rPview == 'hide') showRemoteVideo = false;
            // showRemoteVideo = false;

            // Add version 1toN
            /*if (originStream != "Visiteur") remoteStream = e.stream;*/
        
        } else if (type == "robot-appelé") {
            if (parameters.rRView == 'hide') showRemoteVideo = false;
        }
        
        // Version 1to1
		if (showRemoteVideo == true) video2.src = URL.createObjectURL(remoteStream);

    };


    // Ecouteurs de changement de statut de connexion
    // Permet de déterminer si le pair distant s'est déconnecté. (Version 1to1)
    peerCnxCollection[peerCnxId].oniceconnectionstatechange = function(e) {

        //var dateE = tools.dateER('E');
        var dateE = tools.humanDateER("E");
        console.log("@ pc["+peerCnxId+"].oniceconnectionstatechange > " + dateE);

        //console.log(">>> stateConnection Event > " + peerCnxCollection[peerCnxId].iceConnectionState);
        //$(chatlog).prepend(dateE + ' [stateConnection Event] ' + peerCnxCollection[peerCnxId].iceConnectionState + '\n');

        console.log(">>> pc["+peerCnxId+"] stateConnection Event > " + peerCnxCollection[peerCnxId].iceConnectionState);
        $(chatlog).prepend(dateE + ' pc['+peerCnxId+'] stateConnection Event: ' + peerCnxCollection[peerCnxId].iceConnectionState + '\n');


        // Si la connexion est neuve, on remet le flag de renégo à sa position par défaut...
        if ( peerCnxCollection[peerCnxId].iceConnectionState == 'new') isRenegociate = false; 

        // Si on est dans la peerConnection principale (Pilote <> Robot)
        if (peerCnxId == peerCnx1to1) {

            // On informe l'autre pair de son statut de connexion   
            if (type == 'pilote-appelant') {
                piloteCnxStatus = peerCnxCollection[peerCnxId].iceConnectionState;

                socket.emit("piloteCnxStatus", piloteCnxStatus);
                // Si on change de status suite à une déco du robot
                // On redéclenche l'ouverture des formulaires de connexion 
                // a la condition que le robot soit lui aussi prêt a se reconnecter... (new...)
                if (piloteCnxStatus == 'new' && robotCnxStatus == 'new') {
                    activeManageDevices(); // On active les formulaires permettant de relancer la connexion
                }


            } else if (type == 'robot-appelé') {
                robotCnxStatus = peerCnxCollection[peerCnxId].iceConnectionState;
                socket.emit("robotCnxStatus", robotCnxStatus);
            }
     
            // si le pair distant (Robot ou Pilote) est déconnecté en WebRTC,
            if (peerCnxCollection[peerCnxId].iceConnectionState == 'disconnected') {   
                
                // A tous les Visiteurs: Signal de perte de la connexion WebRTC principale (Pilote <> Robot)
                socket.emit('closeMasterConnection','disconnected')
                
                // on lance le processus préparatoire a une reconnexion
                onDisconnect(peerCnxId);
            }

        } // endif connexion principale (Pilote <> Robot)

    };

    // Ecouteur ... Todo...
    peerCnxCollection[peerCnxId].onremovestream = function(e) {
        console.log("@ pc["+peerCnxId+"].onremovestream(e) > timestamp:" + Date.now());
        console.log(e);
    }

    
    // CreateOffer - Si on est l'apellant (Pilote)
    if (type === "pilote-appelant") {
        
        // Si on est dans la peerConnection principale (Pilote <> Robot)
        if (peerCnxId == peerCnx1to1) {

            
	        // Bug: l'objet RTCDataChannel de l'apellé est null 
	        // si le createDataChannel de l'apellant est activé sous Chrome Version 46.0.2490.71 m
	        // Bug de recession Release Chrome du 15/16 Oct(11) 2015...
	        // Tentative de contournement: Envoi de l'objet RTCDatachannel par websocket...

            /*// l'apellant crée un dataChannel
            channel = peerCnxCollection[peerCnxId].createDataChannel("mychannel", {});
            var tStp = tools.humanDateER("date");
            console.log ("peerCnxCollection[peerCnxId].createDataChannel("+tStp+")");
            /**/
            

            /*function setupDC1() {
			    try {
			        console.log("+++++++++++++++++++++++++++++++++++++")
			    	console.log(channel);
			        channel = peerCnxCollection[peerCnxId].createDataChannel("1to1_PtoR", {reliable: false});
            		var tStp = tools.humanDateER("date");
            		console.log ("peerCnxCollection[peerCnxId].createDataChannel("+tStp+")");
			        console.log(channel);
			        console.log("+++++++++++++++++++++++++++++++++++++");

			        //var data = {from: localObjUser, channel: channel.toJSON()};
			        //console.log (data);
			        var data = tools.deepClone(channel);
			        socket.emit("channelObject", data);

			    } catch (e) { console.warn("No data channel (peerCnxCollection[peerCnxId])", e); }
			}

			/**/// setupDC1();


					console.log("+++++++++++++++++++++++++++++++++++++")
			    	console.log(channel);
			        channel = peerCnxCollection[peerCnxId].createDataChannel("1to1_PtoR", {reliable: false});
            		var tStp = tools.humanDateER("date");
            		console.log ("peerCnxCollection[peerCnxId].createDataChannel("+tStp+")");
			        console.log(channel);
			        console.log("+++++++++++++++++++++++++++++++++++++");

			        //var data = {from: localObjUser, channel: channel.toJSON()};
			        //console.log (data);
			        // -----------------------------------------
			        // var data = tools.deepClone(channel);
			        // socket.emit("channelObject", data);



            // et on peut maintenant lancer l'écouteur d'évènement sur le datachannel
            bindEvents();

            // création et envoi de l'offre SDP
            var cible = getClientBy('typeClient','Robot');
            peerCnxCollection[peerCnxId].createOffer(function(sdp){
                        peerCnxCollection[peerCnxId].setLocalDescription(sdp);
                        console.log ("------------ offer >>> to "+cible.typeClient+"----------");
                        var data = {from: localObjUser, message: sdp, cible: cible, peerCnxId: peerCnxId}
                        // console.log (data.message.sdp);
                        socket.emit("offer2", data);
                    }
                    , errorHandler, 
                    constraints // Pilote
                    // piloteConstraints
                );

        } 

    // Sinon CreateAnswer si on est l'apellé (Robot)
    } else if (type === "robot-appelé") {
        
        // Si on est dans la peerConnection principale (Pilote <> Robot)
        if (peerCnxId == peerCnx1to1) {
            var tStp1 = tools.humanDateER("date");
            console.log ("@ ondatachannel = function(e) {... "+tStp1)

            // bindEvents(); //now bind the events
            // l'appelé doit attendre l'ouverture d'un dataChannel pour lancer son écouteur d'èvènement data...
            // Ecouteur d'ouverture d'un data channel
            peerCnxCollection[peerCnxId].ondatachannel = function(e) {
                console.log("+++++++++++++++++++++++++++++++++++++")
                var tStp2 = tools.humanDateER("date");
            	console.log ("peerCnxCollection[peerCnxId].ondatachannel("+tStp2+")");
            	console.log(e);
                console.log("+++++++++++++++++++++++++++++++++++++")

                channel = e.channel;
                bindEvents(); //now bind the events
            };
            /**/
        } // endif connexion principale (Pilote <> Robot)
        /**/
    }
}


// Ecouteurs Signaling de l'API websocket -----------------


// L'apellé doit attendre de recevoir une offre SDP
// avant de générer une réponse SDP
// ---------------------------------
// Ok au premier passage
// BUG a la renégo > ne déclenches plus le onAddStream... 
// FIX: réinstancier onAddStream après reinstanciation PeerConnection
// BUG a la renégo > Envoie 2 answers...
// Cause: L'écouteur de reception "offer"est instancié 2 fois...
// FIX: ajout d'un flag "isRenegociate = false;" 
socket.on("offer", function(data) {
    
    if (data.cible.id == myPeerID) {
        
    	var tStp = tools.humanDateER("R");
		console.log ("------------ >>> offer from "+data.from.typeClient+" "+tStp);
       


        if (isRenegociate == false) {            

            //console.log("(apellé)>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
            //peerCnxCollection[peerCnxId].setRemoteDescription(new SessionDescription(data.message));
            //peerCnxCollection[peerCnxId].createAnswer(doAnswer, errorHandler, constraints);           

            // ------------- Version 1toN
            var offer = new SessionDescription(data.message);
            
            //console.log("- Offer From: " + data.from.pseudo +"("+data.from.id+")");
            //console.log("- Cible: " + data.cible.pseudo +"("+data.cible.id+")");
            //console.log("- peerconnection: " + data.peerCnxId);
            //console.log (offer);
            peerCnxCollection[data.peerCnxId].setRemoteDescription(offer); 
            
            // Une foi l'offre reçue et celle-ci enregistrée dans un setRemoteDescription,
            // on peu enfin générer une réponse SDP 
            var cible = getClientBy('id', data.from.id);
            var idPeerConnection = data.peerCnxId;

            // création de l'offre SDP
            peerCnxCollection[idPeerConnection].createAnswer(function(sdp){
                    peerCnxCollection[idPeerConnection].setLocalDescription(sdp);
                    console.log ("------------ Answer to >>> "+cible.typeClient+"----------");
                    var data = {from: localObjUser, message: sdp, cible: cible, peerCnxId: idPeerConnection}
                    //console.log (data);
                    socket.emit("answer2", data);
                }
                , errorHandler, 
                constraints // Robot
                //robotConstraints
            );
        }
    }
});
/**/


// Réception d'une réponse à une offre
socket.on("answer", function(data) {
    if (data.cible.id == myPeerID) {
        var tStp = tools.humanDateER("R");
		console.log ("------------ >>> answer from "+data.from.typeClient+" "+tStp);
        //console.log("- Answer From: " + data.from.pseudo +"("+data.from.id+")");
        //console.log("- Cible: " + data.cible.pseudo +"("+data.cible.id+")");
        //console.log("- peerconnection: " + data.peerCnxId);
        //console.log (data.message);
        peerCnxCollection[data.peerCnxId].setRemoteDescription(new SessionDescription(data.message));
    }
});

// Réception d'un ICE Candidate
socket.on("candidate", function(data) {
    if (data.cible.id == myPeerID) {
        console.log ("------------ >>>> Candidate from "+data.from.typeClient+"----------");
        //console.log("- candidate From: " + data.from.pseudo +"("+data.from.id+")");
        //console.log("- Cible: " + data.cible.pseudo +"("+data.cible.id+")");
        //console.log("- peerconnection: " + data.peerCnxId);
        //console.log (data.message);
        // TODO : ici intercepter et filter le candidate
        // console.log (data.message);
        peerCnxCollection[data.peerCnxId].addIceCandidate(new IceCandidate(data.message)); // OK
    }
});

// tentative contournement BUG createDataChannel sous Chrome
socket.on("channelObject", function(data) {
	var tStp = tools.humanDateER("R");
	console.log ("------------ >>> channelObject ");
	console.log (data);
	// channel = peerCnxCollection[peerCnx1to1].createDataChannel(data, {reliable: false});
	// channel = data;
    // bindEvents(); //now bind the events
});
/**/



// ----- Phase 3 Post-Signaling --------------------------------------------


// Réception d'un ordre de déconnexion
socket.on("closeConnectionOrder",function(data) {
    if (data.cible.id == myPeerID) {
        // A priori on est dans la peerConnection principale (Pilote <> Robot) >> peerCnx1to1
        console.log ("------------ >>> closeConnectionOrder "+data.from.typeClient+"----------");
        // on lance le processus préparatoire à une reconnexion
        onDisconnect(peerCnx1to1);
    }
});

/*// Réception d'un ordre de déconnexion en provenance du Pilote
// >> Pour le robot: se déconneter de tous les visiteurs
// >> Pour tous les visiteurs, se déconnecter du robot Et du pilote
socket.on("closeAllVisitorsConnectionOrder", function(data) {

        console.log ("------------ >>> closeAllVisitorsConnectionOrder "+data.from.typeClient+"----------");
        var prefixID = "Robot-To-Visiteur-";
        var robotPeerCnxID = "Robot-To-Visiteur-"+myPeerID;
        var pilotePeerCnxID = "Pilote-To-Visiteur-"+myPeerID;
        // Si robot on vire tous les visiteurs
        if (type == 'robot-appelé') closeCnxwithAllVisitors("Robot"); 
        // Si visiteur on vire Pilote et Robot
        else if (type == 'visiteur-appelé') {
            onDisconnect_VtoR(robotPeerCnxID);
            onDisconnect_1toN_VtoP(pilotePeerCnxID);      
        }
});
/**/

// A la déconnection du pair distant:
function onDisconnect(peerCnxId) {

    console.log("@ onDisconnect()");


    // Robustesse:
    if (type == "pilote-appelant") robotDisconnection = "Unexpected";
    else if (type == "robot-appelé") piloteDisconnection = "Unexpected";

    // On vérifie le flag de connexion
    if (isStarted == false) return;


    if (!!localStream) {
         video1.src = null;
         localStream.stop();
    }

    if (!!remoteStream) {
         video2.src = null;
         remoteStream.stop();
    }

    // on retire le flux remoteStream
    video1.src = "";
    video2.src = "";

    //videoElement.src = null;
    //window.stream.stop();

    // on coupe le RTC Data channel
    if (channel) channel.close();
    channel = null;

    // On vide et on ferme la connexion courante
    // pc["+peerCnxId+"].onicecandidate = null;
    //pc["+peerCnxId+"].close();
    //pc = null;

    peerCnxCollection[peerCnxId].close();
    peerCnxCollection[peerCnxId] = null;
    stopAndStart(peerCnxId);
}

// Fermeture et relance de la connexion p2p par l'apellé (Robot)
function stopAndStart(peerCnxId) {

    console.log("@ stopAndStart()");
    
    if (type == "pilote-appelant") updateListUsers(); // Rafraichissement de la liste des visiteurs
    input_chat_WebRTC.disabled = true;
    input_chat_WebRTC.placeholder = "RTCDataChannel close";
    env_msg_WebRTC.disabled = true;

    peerCnxCollection[peerCnxId] = new PeerConnection(server, options);
    

    // console.log("------pc = new PeerConnection(server, options);-----");

    // On informe la machine à état que c'est une renégociation
    isRenegociate = true;
};

// -------------------- Méthodes RTCDataChannel ----------------------

// bind the channel events
function bindEvents() {

    // alert ("@ bindEvents()");
    console.log("@ bindEvents()");

    // écouteur d'ouverture
    channel.onopen = function() {
        //console.log("RTCDataChannel is Open");
        input_chat_WebRTC.focus();
        input_chat_WebRTC.placeholder = "RTCDataChannel is Open !";
        input_chat_WebRTC.disabled = false;
        env_msg_WebRTC.disabled = false;
        //isStarted = true;
        //console.log("isStarted = "+ isStarted);
    };

    // écouteur de reception message
    channel.onmessage = function(e) {
        var dateR = Date.now();
        // si c'est u message string
        if (tools.isJson(e.data) == false) {
            $(chatlog).prepend(dateR + ' ' + e.data + "\n");
        }
        
        // sinon si c'est un objet Json 
        else if (tools.isJson(e.data) == true || type == "robot-appelé"){
            var cmd = e.data;
            cmd = JSON.parse(cmd);
            // S'il existe une propriété "command" (commande via webRTC))
            if (cmd.command) {
                
                // Affiche la trace de la commande dans le chatlog webRTC
                // var delta = dateR-cmd.dateE;
                // $(chatlog).prepend('[' +delta+' ms] ' + cmd.command + "\n");
                
                // Envoi de la commande à la Robubox...
                if (cmd.command == "onDrive") {
                    // Flags homme mort
                    onMove = true;
                    lastMoveTimeStamp = Date.now(); // on met a jour le timestamp du dernier ordre de mouvement...
                    // Envoi commande  
                    // robubox.sendDrive(cmd.enable, cmd.aSpeed, cmd.lSpeed);
                    robubox.sendDrive(cmd);
                }
                
                else if (cmd.command == "onStop") {
                    // Flags homme mort
                    onMove = false;
                    lastMoveTimeStamp = 0;
                    // Envoi commande    
                    //robubox.sendDrive(cmd.enable, cmd.aSpeed, cmd.lSpeed);
                    robubox.sendDrive(cmd);
                }
                
                else if (cmd.command == "onStep") {
                    robubox.sendStep(cmd.typeMove,cmd.distance,cmd.MaxSpeed) ;
                }
            }
        }
    };
}

// Robot & Pilote: envoi d'un message par WebRTC
function sendMessage() {
    var dateE = tools.dateER('E');
    var msgToSend = dateE + ' [' + localObjUser.typeClient + '] ' + message.value;
    channel.send(msgToSend);
    message.value = "";
    // Affiche trace du message dans le chatlog websocket local
    $(chatlog).prepend(msgToSend + "\n");
}

// Pilote: Envoi au robot d'une commande par WebRTC
function sendCommand(commandToSend) {
    console.log ("@ sendCommand("+commandToSend.command+")");

    // Affiche trace de la commande dans le chatlog webRTC local
    //var dateE = Date.now()
    //commandToSend.dateE = dateE;
    // $(chatlog).prepend(commandToSend.dateA + " SEND "+commandToSend.command + "\n");
    
    // sérialisation et envoi de la commande au robot via WebRTC
    commandToSend = JSON.stringify(commandToSend);
    channel.send(commandToSend);
}


// Bouton d'envoi du formulaire de chat WebRTC
$('#formulaire_chat_webRTC').submit(function() {
    var message = $('#send_chat_WebRTC').val() + '\n';
    channel.send(msg);
    message.value = "";
    $('#send_chat_WebRTC').val('').focus(); // Vide la zone de Chat et remet le focus dessus
    return false; // Permet de bloquer l'envoi "classique" du formulaire
});

// --------------------- Gestion des commandes du robot -------------------

// Robot: fonction homme mort...
if (type == "robot-appelé") {
    function deathMan(){
    
        //console.log("@ deathMan() >> onMove:"+onMove+" "+"lastMoveTimeStamp:"+lastMoveTimeStamp);          

         var dateA = Date.now();
         // if (settings.isBenchmark() == true ) dateA = Date.now(ts.now()), // date synchronisée avec le serveur (V1 timesync.js)
         if (settings.isBenchmark() == true ) dateA = ServerDate.now(); // date synchronisée avec le serveur (V2 ServerDate.js)

         var data = {
                 channel: "Local-Robot",
                 source: "Homme-Mort",
                 system: parameters.navSys,
                 // dateA: Date.now(),
                 // dateA: Date.now(ts.now()), // date synchronisée avec le serveur (V1 timesync.js)
                 // dateA: ServerDate.now(), // date synchronisée avec le serveur (V2 ServerDate.js)
                 dateA: dateA,
                 command: 'deathMan',
                 aSpeed: 0,
                 lSpeed: 0,
                 enable: false
             }

        if (onMove == true || lastMoveTimeStamp != 0) {
            var now = Date.now();
            // if (settings.isBenchmark() == true )  now = Date.now(ts.now()); // date synchronisée avec le serveur (V1 timesync.js)
            if (settings.isBenchmark() == true ) now = ServerDate.now(); // date synchronisée avec le serveur (V2 ServerDate.js)
            
            var test = now - lastMoveTimeStamp;
            if (test >= 1000 ) {
               robubox.sendDrive(data); // Envoi de la commande a la Robubox
               //console.log("@ >> deathMan() ---> STOP");
            }
        }
        setTimeout(deathMan,1000); /* rappel après 1000 millisecondes */
    }
    deathMan();
}


// Robot: Reception webSocket d'une commande pilote
// On la renvoie au client robot qui exécuté sur la même machine que la Robubox.
// Il pourra ainsi faire un GET ou un POST de la commande à l'aide d'un proxy et éviter le Cross Origin 
socket.on("piloteOrder", function(data) {
    // console.log('@onPiloteOrder >> command:' + data.command);
    
    if (type == "robot-appelé") {
        
        if (data.command == "onDrive") {
            // Flags homme mort
            onMove = true;
            lastMoveTimeStamp = Date.now(); // on met a jour le timestamp du dernier ordre de mouvement...
            // if (settings.isBenchmark() == true )  lastMoveTimeStamp = Date.now(ts.now()); // date synchro serveur (V1 timesync.js)
            if (settings.isBenchmark() == true ) lastMoveTimeStamp = ServerDate.now(); // date synchroserveur (V2 ServerDate.js)


            // Envoi commande Robubox
            // robubox.sendDrive(data.enable, data.aSpeed, data.lSpeed);
            robubox.sendDrive(data);
        } else if (data.command == "onStop") {
            // Flags homme mort
            onMove = false;
            lastMoveTimeStamp = 0;
            // Envoi commande Robubox
            // robubox.sendDrive(data.enable, data.aSpeed, data.lSpeed);
            robubox.sendDrive(data);
        

        } else if (data.command == 'onStep') {
            robubox.sendStep(data.typeMove,data.distance,data.MaxSpeed) ;
        }
        
        /*// Envoi d'une trace au log WebSocket de l'IHM robot
        var dateB = Date.now();
        var delta = dateB-data.dateA;
        var msg = '[' +delta+' ms] ' +data.command;
        insereMessage3("",msg);
        /**/
        /*
        if (data.command == "onStop") {};
        if (data.command == "onStep") {};
        if (data.command == "onGoto") {};
        if (data.command == "onClicAndGo") {};
        /**/
        
    }
});


// Robot: Selection du système embarqué (Robubox ou KomNAV)
// pour l'exécution des commandes reçues en WebRTC et webSocket
socket.on('changeNavSystem', function(data) {
   console.log('@changeNavSystem >> ' + data.navSystem);
   parameters.navSys = data.navSystem;
});

video2.addEventListener("playing", function () {
    console.log ("RemoteStream dimensions: " + video2.videoWidth + "x" + video2.videoHeight)
});