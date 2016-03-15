// Author Thierry Bergeron
// Source: Aucune


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

