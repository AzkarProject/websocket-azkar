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


/*// mémo Default Benchmarks Settings
navSys = 'Robubox'; // 'KomNAV'
navCh = 'webSocket'; // webRTC
lPview = 'show'; // 'hide'
lRview = 'show'; // 'hide' 
rPview = 'high'; // 'medium' 'low'
rRView = 'show'; // 'hide'
pStoR = 'open'; // close

cartoView = 'hide'; // 'show'
cartoChannel = 'webSocket'; // 'webRTC'
/**/



// Génère les options des résolution
var listOptionsDefinition = '<option value="VLD" selected="selected" >Very Low: 100*52</option>';   
listOptionsDefinition += '<option value="144p">144p: 196*144</option>'; 
listOptionsDefinition += '<option value="244p">244p: 350*240</option>';
listOptionsDefinition += '<option value="360p">360p: 480*360</option>'; 
listOptionsDefinition += '<option value="VGA">VGA: 640*480</option>';
listOptionsDefinition += '<option value="858p">858p: 858*480</option>';
listOptionsDefinition += '<option value="720p">720p: 1280*720</option>';
listOptionsDefinition += '<option value="1080p">1080p: 1920*1200</option>';



$('#robot_camdef_select').html(listOptionsDefinition); 
$('#pilot_camdef_select').html(listOptionsDefinition); 



// Formulaire de sélection systeme embarqué
selectSystemRobubox = document.querySelector('input#Robubox');
selectSystemKomNAV = document.querySelector('input#KomNAV');

// Raz du selecteur de systeme embarqué
function raZNavSystem() {
    // selectSystemKomNAV.disabled = true;
    selectSystemKomNAV.checked = false;
    selectSystemRobubox.checked = true;
    parameters.navSys = "Robubox";
}
raZNavSystem();



// Formulaire de sélection canal de commandes
selectChannelWebSocket = document.querySelector('input#webSocket');
selectChannelWebRTC = document.querySelector('input#webRTC');

// Par défaut, désactivation du selecteur de canal webRTC
// si aucune connexion 1to1 active entre Pilote et Robot
function raZNavChannel() {
	selectChannelWebRTC.disabled = true;
	selectChannelWebRTC.checked = false;
	selectChannelWebSocket.checked = true;
	parameters.navCh = "webSocket";
}
raZNavChannel();


// ----- Navigation --------


// Boutons de zoom + & -
function zoomCarto(inOut) {
    
    var delta = 1;
    var reset = null;
    if (inOut == 'Out') delta = 1
    else if (inOut == "In") delta = -1; 
    //else if (inOut == "Reset") delta = 0;
    carto.setZoom(delta);
    /**/
}

function translationMap(direction) {
    var moveX = 0;
    var moveY = 0;
    if (direction == "Up") moveY = -1;
    else if (direction == "Down") moveY = 1;
    else if (direction == "Right") moveX = 1;
    else if (direction == "Left") moveX = -1;
    carto.canvasMove(moveX,moveY);
}

function resetMap() {
    // console.log("resetMp");
    carto.resetCanvas();
}

function trakingMode() {
    carto.activeTracking();
}

// --------------- Ecouteurs des formulaires HTML


function setNavSystem(navSysSet) { 
    parameters.navSys = navSysSet;
    // On prévient le robot qu'on bascule entre Robubox ou KomNav
    // console.log (parameters.navSys);
    socket.emit('changeNavSystem', {
        objUser: localObjUser,
        navSystem: navSysSet
    }); 
}


function setCarto() { 

}

function setCartoChannel() { 

}



function setNavChannel(navChSet) { 
    parameters.navCh = navChSet;
}

function setLocalPilotView(lPVSet) {
    parameters.lPview = lPVSet;
}

function setLocalRobotView(lRVSet) {
    parameters.lRview = lRVSet;
}

function setRemotePiloteView(rPVSet) {
    parameters.rPview = rPVSet;
}

function setRemoteRobotView(rRVSet) {
    parameters.rRView = rRVSet;
}

function setRobotStreamToVisitor(vRStream) {
    parameters.rStoV = vRStream;
}

