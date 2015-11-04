
/*// mémo Default Benchmarks Settings
navCh = 'webSocket'; // webRTC
lPview = 'show'; // 'hide'
lRview = 'show'; // 'hide' 
rPview = 'high'; // 'medium' 'low'
rRView = 'show'; // 'hide'
pStoR = 'open'; // close
/**/





/* Mémo
<span id="dataChannelSetting" class="">
Channel: 
    <input type="radio" name="controlChannel" value="webSocket" id="webSocket" onclick="setNavChannel('webSocket')" checked /> <label for="webSocket">webSocket</label>
    <input type="radio" name="controlChannel" value="webRTC" id="webRTC" onclick="setNavChannel('webRTC')"/> <label for="webRTC">webRTC</label>
    
</span>
<hr/>
/**/

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

/* Mémo
<span id="streamSetting" class="">
    Stream to Visitor:
    <input type="radio" name="streamRobotToVisitor" value="open" id="streamOpen" onclick="setRobotStreamToVisitor('open')" checked /> <label for="streamOpen">Robot</label>
    <input type="radio" name="streamRobotToVisitor" value="close" id="streamClose" onclick="setRobotStreamToVisitor('close')" /> <label for="streamClose">Pilote</label>
</span>
/**/

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


function setNavChannel(navChSet) { 
    parameters.navCh = navChSet;
    // alert("navChannel = "+parameters.navCh);
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