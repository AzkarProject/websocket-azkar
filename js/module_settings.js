
/*// mémo Default Benchmarks Settings
navSys = 'Robubox'; // 'KomNAV'
navCh = 'webSocket'; // webRTC
lPview = 'show'; // 'hide'
lRview = 'show'; // 'hide' 
rPview = 'high'; // 'medium' 'low'
rRView = 'show'; // 'hide'
pStoR = 'open'; // close
/**/

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


// Formulaire de sélection du Stream Relay
// Règles:
// Switch relay par défaut: inactif
// Switch relay par défaut: Pilote
// Si déco P/R > Désactiver Switch Relay
// Si cnx/reco P/R > Activer Switch Relay
// On activ Switch Relay > Si P/V no relay en cours > Couper all p/V
// Si déco P/R > Si Stream Relay en cours > couper all P/V

// Formulaire de sélection canal de commandes
selectOpenRelay = document.querySelector('input#streamOpen');
selectCloseRelay = document.querySelector('input#streamClose');

function razOpenRelay() {
    console.log("@ razOpenRelay()");
    selectOpenRelay.disabled = true;
    selectOpenRelay.checked = false;
    selectCloseRelay.checked = true;
    parameters.rStoV = "close";
}
razOpenRelay();



function activeOpenRelay() {
    console.log("@ activeOpenRelay()");
    selectOpenRelay.disabled = false;
    selectCloseRelay.disabled  = false;
    //selectOpenRelay.checked = false;
}



function setOpenRelay(status) {
    console.log("@ setOpenRelay("+status+")");
    parameters.rStoV = status;
    
    if (status == "open") {
        selectOpenRelay.checked = true;
        selectCloseRelay.checked = false;
    }
    else if (status == "close") {
        selectOpenRelay.checked = false;
        selectCloseRelay.checked = true;
    }
}





function freezeOpenRelay() {
    console.log("@ activeOpenRelay()");
    selectOpenRelay.disabled = true;
    // selectCloseRelay.checked = true;
    selectCloseRelay.disabled  = true;
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



/*               
<span id="systemSetting" class="">
System: 
    <input type="radio" name="controlSystem" value="Robubox" id="Robubox" onclick="setNavSystem('Robubox')" checked /> <label for="Robubox">Robubox</label>
    <input type="radio" name="controlSystem" value="KomNAV" id="webRTC" onclick="setNavSystem('KomNAV')"/> <label for="KomNAV">KomNAV</label>
</span>
<br/>
<span id="dataChannelSetting" class="">
Channel: 
    <input type="radio" name="controlChannel" value="webSocket" id="webSocket" onclick="setNavChannel('webSocket')" checked /> <label for="webSocket">webSocket</label>
    <input type="radio" name="controlChannel" value="webRTC" id="webRTC" onclick="setNavChannel('webRTC')"/> <label for="webRTC">webRTC</label>
    
</span>
<hr/>

*/