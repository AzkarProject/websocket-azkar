// TODO récupérer les paramétrages du benchmark

/*// mémo Default Benchmarks Settings
navCh = 'webSocket'; // webRTC
lPview = 'show'; // 'hide'
lRview = 'show'; // 'hide' 
rPview = 'high'; // 'medium' 'low'
rRView = 'show'; // 'hide'
pStoR = 'open'; // close
/**/


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