// Gestion du Stream Relay



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
    // console.log (wtf);
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