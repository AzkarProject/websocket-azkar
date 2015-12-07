
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


// Formulaires settings cartographie
selectCartoShow = document.querySelector('input#CartoShow');
selectCartoHide = document.querySelector('input#CartoHide');
selectCartoWs = document.querySelector('input#CartoChannelWs');
selectCartoWebRTC = document.querySelector('input#CartoChannelWebRTC');


if (proto == "1to1") {

    // Raz du selecteur de systeme embarqué
    function raZCarto() {
        // selectSystemKomNAV.disabled = true;
        selectCartoShow.checked = false;
        selectCartoHide.checked = true;
        selectCartoWs.checked = true;
        selectCartoWebRTC.checked = false;
        selectCartoWebRTC.disabled = true;
        //parameters.navSys = "Robubox";
    }
    raZCarto();

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