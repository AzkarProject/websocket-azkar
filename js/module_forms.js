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

// --------- Selection des caméras locales et distantes ----------------


console.log("module_forms chargé");



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




// --------- Système embarqué  (Robubox/KomNav) ------------------


// Formulaire de sélection systeme embarqué (Robubox/KomNav)
selectSystemRobubox = document.querySelector('input#Robubox');
selectSystemKomNAV = document.querySelector('input#KomNAV');

// Remise a zero (R.A.Z) du selecteur de systeme embarqué
function raZNavSystem() {
    
    console.log("@ raZNavSystem()")
    console.log("navSys =" + navSys)
    if (navSys == 'KomNAV') {
        selectSystemKomNAV.checked = true;
        selectSystemRobubox.checked = false;
        parameters.navSys = "KomNAV";
    } else if (navSys == 'Robubox') {
        selectSystemKomNAV.checked = false;
        selectSystemRobubox.checked = true;
        parameters.navSys = "Robubox";
    }
}
// Au chargement du script...
raZNavSystem();


// switch KonNav /Robubox
//function setNavSystem(navSysSet) { 
setNavSystem = function (navSysSet) {    
    parameters.navSys = navSysSet;
    // On prévient le robot qu'on bascule entre Robubox ou KomNav
    socket.emit('changeNavSystem', {
        objUser: localObjUser,
        navSystem: navSysSet
    }); 
}


// --------- Canal de commande (WebRTC/WebSocket) -----------------


// Formulaire de sélection canal de commandes  WebRTC/webSocket
selectChannelWebSocket = document.querySelector('input#webSocket');
selectChannelWebRTC = document.querySelector('input#webRTC');

// remise a zero (R.A.Z) selecteur canal de commande WebRTC/webSocket
// par défaut webSocket (si connexion WebRTC pas encore établie)
function raZNavChannel() {
	console.log("@ raZNavChannel()")
    
    selectChannelWebRTC.disabled = true;
	selectChannelWebRTC.checked = false;
	selectChannelWebSocket.checked = true;
	parameters.navCh = "webSocket";
    /**/

    /*// navCh = 'webSocket'; // "webSocket" ou "webRTC" /
    if (navCh == 'webSocket') {
        selectChannelWebRTC.disabled = true;
        selectChannelWebRTC.checked = false;
        selectChannelWebSocket.checked = true;
        parameters.navCh = "webSocket";
    } else if (navCh == 'webRTC') {
        selectChannelWebRTC.disabled = true;
        selectChannelWebRTC.checked = true;
        selectChannelWebSocket.checked = false;
        parameters.navCh = "webSocket";
    }
    /**/

}
// Au chargement du script...
raZNavChannel();

// Activation formulaire selection canal
function setNavChannelform(value) {
    if (value == 'open') {
        selectChannelWebRTC.disabled = false;
    } else raZNavChannel()

}

// Selecteur du canal de commande
function setNavChannel(navChSet) { 
    parameters.navCh = navChSet;
}



// ----- Boutons de cartographie --------


// Boutons de zoom + & -
function zoomCarto(inOut) {
    
    var delta = 1;
    var reset = null;
    if (inOut == 'Out') delta = 1
    else if (inOut == "In") delta = -1; 
    carto.setZoom(delta);
}

// Boutons directionnels (up,down,left,right)
function translationMap(direction) {
    var moveX = 0;
    var moveY = 0;
    if (direction == "Up") moveY = -1;
    else if (direction == "Down") moveY = 1;
    else if (direction == "Right") moveX = 1;
    else if (direction == "Left") moveX = -1;
    carto.canvasMove(moveX,moveY);
}

// Remise a zero de l'affichage cartographique (R.A.Z)
function resetMap() {
    carto.resetCanvas();
}

// Activation du tracking Mode
// > Désactivation par resetMap...
function trakingMode() {
    carto.activeTracking();
}



function gotoPOI() {
    list_POI_select = document.querySelector('select#list_POI');
    var valuePOI = list_POI_select.value;
    // alert("gotoPOI: "+valuePOI)

   socket.emit('gotoPOI', {
        objUser: localObjUser,
        poi: valuePOI
    }); 
}
/**/


// ----------- Selecteurs d'affichage des flux videos locaux et distants ---------------------
// > Permet d'économiser sur les postes client des ressources processeurs liées a l'affichage.


function setPiloteLocalView(viewSetting) {
    // parameters.lPview = lPVSet;
    parameters.piloteLocalView = viewSetting;

}

function setRobotLocalView(viewSetting) {
    // parameters.lRview = lRVSet;
    parameters.robotLocalView = viewSetting

}

function setPiloteRemoteView(viewSetting) {
    // parameters.rPview = rPVSet;
    parameters.piloteRemoteView = viewSetting;
}

function setRobotRemoteView(viewSetting) {
    // parameters.rRView = rRVSet;
    parameters.robotRemoteView = viewSetting;

}



// --------- Résolution des caméras vidéos -----------------------

// Génère les options des résolution
/*var listOptionsDefinition = '<option value="VLD" selected="selected" >Very Low: 100*52</option>';   
listOptionsDefinition += '<option value="144p">144p: 196*144</option>'; 
listOptionsDefinition += '<option value="244p">244p: 350*240</option>';
listOptionsDefinition += '<option value="360p">360p: 480*360</option>'; 
listOptionsDefinition += '<option value="VGA">VGA: 640*480</option>';
listOptionsDefinition += '<option value="858p">858p: 858*480</option>';
listOptionsDefinition += '<option value="720p">720p: 1280*720</option>';
listOptionsDefinition += '<option value="1080p">1080p: 1920*1080</option>';
/**/


var listOptionsDefinition = '<option value="144p">144p: 196x144</option>'; 
listOptionsDefinition += '<option value="QVGA">QVGA: 320x240</option>'; 
listOptionsDefinition += '<option value="VGA">VGA: 640x480</option>';
listOptionsDefinition += '<option value="HD">HD: 1280x720</option>';
listOptionsDefinition += '<option value="Full HD">Full HD: 1920x1080</option>';



// Sélecteurs html des options de résolution
$('#robot_camdef_select').html(listOptionsDefinition); 
$('#pilot_camdef_select').html(listOptionsDefinition); 






