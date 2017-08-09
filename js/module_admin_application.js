var socket = io.connect();

// Récupération du pseudo
var localPseudo = checkCookie();
ihm.getHeaderPage(localPseudo);



// On transmet le pseudo au serveur pour qu'il l'associe au socket.id
socket.emit('onConnectionUser', {pseudo: localPseudo}); 


if (page == 'adminRobot') {

    // Récupération de la liste des cartes présentes dans le répertoire maps du serveur
    // Récupération de la carte active
    // Récupération du statut fakeRobubox
    // Récupération de la liste des clients connectés aux IHM pilotes et Robot
    getActiveMap();
    getMaps();
    getFakeRobubox();
    getUsers();
    getIpRessources();
    getIsGamepad();

}


// Gestion du pseudo ----------------

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}


function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}



function checkCookie(pseudo) {
    
    var nameCookie = "AzcarClientName"
    var user = getCookie(nameCookie);

    if (user != "") {
        pseudo = user;
    } else {
        user = prompt('Votre pseudo? (par défaut ce sera "Administrateur")');
        if (!user || user == '') {
           user = "Administrateur";
        }       
        if (user != "" && user != null) {
            setCookie(nameCookie, user, 365);
            pseudo = user;
        }
    }
    return pseudo;
    
}




function changePseudo() {
    var nameCookie = "AzcarClientName"
    var oldPseudo = getCookie(nameCookie);
    var newUser = prompt('Votre ancien Pseudo: '+ oldPseudo+"\n"+"Saisissez votre nouveau pseudo")
    if (newUser == null || newUser == "") newUser = oldPseudo;
    setCookie(nameCookie, newUser, 365);
    ihm.getHeaderPage(newUser);
    socket.emit('onConnectionUser', {pseudo: newUser});   
}


// --------- Messages génériques 
//var data = {message: "File is uploaded !", typeMessage: 'sucess'}
//socket.broadcast.emit('messageToAdmin', data);

socket.on("messageToAdmin", function(data) { 
    //notifications.writeMessage ('sucess','vastefaire','foutre',3500)
    console.log("socket.on(messageToAdmin)");
    console.log(data);
    var typeMsg = "info";
    var titleMsg = '';
    var Msg = '';
    if (data.typeMessage) typeMsg = data.typeMessage;
    if (data.titleMessage) titleMsg = data.titleMessage;
    if (data.message) Msg = data.message; 
    //notifications.writeMessage (typeMsg,titleMsg,msg,3500)
    notifications.writeMessage (typeMsg,titleMsg,Msg,3500)
    /**/

});




// ------------------ Cartographie

// >> Mode simulateur ( Cartographie et mouvements simulés )
// Drapeau mode simulation 
var isFakeRobubox = true;
console.log("isFakeRobubox = "+isFakeRobubox)
selectFakeTrue = document.querySelector('input#FakeTrue');
selectFakeFalse = document.querySelector('input#FakeFalse');
maps_list_select = document.querySelector('select#Maps_list');

// On demande au serveur si le mode simulateur est activé
function getFakeRobubox() {
    socket.emit('getFakeRobubox',""); 
}


// A la réponse du serveur:
socket.on("getFakeRobubox", function(data) { 
    //alert (data.isFakeRobubox)
    isFakeRobubox = data.isFakeRobubox
    setSelectFakeRobot(isFakeRobubox);
    updateTitleFakeRoboubox (data.isFakeRobubox);
});


// Traitement à chaque modification du formulaire
function setFakeRobubox(boolean) {
    console.log("@ setFakeRobubox("+boolean+")")
    // Si le bouton radio est déjà sélectionné...
    if (isFakeRobubox == boolean) return

    var message = "Attention ! \n \n"
    message += "Vous êtes sur le point d'activer ou de désactiver le mode de simulation ! ";
    message += "\n Cela entrainera le reload automatique des IHM Robot et Pilote.";
    var txt;
    
    var response = confirm(message);
    if (response == true) {
        isFakeRobubox = boolean;
        updateTitleFakeRoboubox (isFakeRobubox);
        if (isFakeRobubox == true) txt = "Mode simulation activé !";
        if (isFakeRobubox == false) txt = "Mode simulation désactivé !";

        var data = { isFakeRobubox: isFakeRobubox}; 
        socket.emit('setFakeRobubox',data); // Envoi au serveur
        notifications.writeMessage ("info",txt,"",7000)
        reloadClients();

    } else if (response == false) {
        setSelectFakeRobot(isFakeRobubox)
    }       
    
    

    console.log("isFakeRobubox = "+isFakeRobubox)           
}


// Affichage du flag kafeRobubox
function updateTitleFakeRoboubox (value) {
    console.log("updateTitleFakeRoboubox ("+value+")")
    var message = "disabled";
    if (value === true) message = "enabled";
    var html = '<span id="zone_info_fakerobubox"> = '+message+'</span>';
    $('#zone_info_fakerobubox').replaceWith(html);
}

// Gestion du formulaire
function setSelectFakeRobot(isFakeRobubox) {
        
        selectFakeTrue.disabled=false;
        selectFakeFalse.disabled=false;

        if (isFakeRobubox == true) {
            selectFakeTrue.checked = true;
            selectFakeFalse.checked = false;
        
        } else if (isFakeRobubox == false) {
            
            selectFakeTrue.checked = false;
            selectFakeFalse.checked = true;
        }
}



function getActiveMap() {
    socket.emit('getActiveMap',""); 
}

// A la réponse du serveur:
socket.on("getActiveMap", function(data) { 
    activeMap = " = "+data.activeMap;
    var html = '<span id="zone_info_maps">'+activeMap+'</span>';
    $('#zone_info_maps').replaceWith(html);
    

});



function selectMap() {
    activeMap = maps_list_select.value;
    var data = {activeMap: activeMap};
    socket.emit('setActiveMap',data);
    var txt = "Nouvelle Carte sélectionnée:  '"+activeMap+"'' !";
    notifications.writeMessage ("info",txt,"",7000)
    reloadClients();
    socket.emit('getActiveMap',"");  
    
}


function deleteMap() {
    
    var deleteMap = maps_list_select.value;
    
    if (deleteMap == activeMap) {
        alert ("Cette carte est en cours d'utilisation !");
        
    } else {
        

        var message = "Attention ! \n \n"
        message += "Vous êtes sur le point de supprimer une carte ! ";
        message += "\n Cette action est irréverible.";
        var response = confirm(message);
        if (response == true) {
            var data = { deleteMap: deleteMap}
            socket.emit('deleteMap', data); 
            setTimeout(function(){
                     getMaps();// Rafraichissemet de la liste des maps
                }
            , 3000);
        }

    }
    
}


// Demande au serveur la liste des maps disponibles dans l'application
function getMaps() {
    socket.emit('getMaps',""); 
}


// A la réponse du serveur:
socket.on("getMaps", function(data) { 
    console.log('socket.on("getMaps")')
    var listMaps = generateListMaps(data)
    populateSelectMap(listMaps,activeMap)
    // TODO >>> Affecter au formulaire
    // TODO >>> Récupérer la carte active ET la préselectionner
});


function generateListMaps(data) {

    var result = {};
    for (map in data.maps) {
        var nameMap = data.maps[map];
        var re = /\.\/maps\//g;
        var nameMap = nameMap.replace(re, "");  
        // console.log(nameMap);
        result[map] = nameMap;
    }
    // console.log(result);
    return result;

}



function populateSelectMap(listMaps,activeMap ){

    
    
    // On supprime tous les enfants du noeud précédent...
    while (maps_list_select.firstChild) {
        // La liste n'étant pas une copie, elle sera réindexée à chaque appel
        maps_list_select.removeChild(maps_list_select.firstChild);
    }

    console.log(listMaps[map])
    for (map in listMaps) {
        console.log(listMaps[map])
        var nameMap = listMaps[map];
        var option = document.createElement('option');
        option.id = nameMap;
        option.value = nameMap;
        option.text = nameMap;
        if (activeMap == nameMap) option.selected = "selected";
        maps_list_select.appendChild(option);
    }

}

// TODO: Interface graphique (affichage des cartes en vignette...);

// --------------------------


// Gestion des connectés (Pilote et Robot)
activeUsers = {};

function getUsers() {
    socket.emit('getUsers',""); 
}

// A la réponse du serveur:
socket.on("updateUsers", function(data) { 
    activeUsers = data.listUsers
    ihm.displayListUsers(activeUsers);
    console.log("socket.on('updateUsers', data");
    console.log(activeUsers);
});


function ejectClients() {
  socket.emit('ejectClients',""); // Ordonne au serveur de virer tous les connectés
    notifications.writeMessage ("warning","déconnexion des clients en cours !","",3500)
    setTimeout(function(){
    notifications.writeMessage ("success","Clients déconnectés !","",3000)
    }, 3500); 
}

function reloadClients() {

    var hasRobot = tools.searchInObjects(activeUsers,'typeClient','Robot','boolean');
    var hasPilot = tools.searchInObjects(activeUsers,'typeClient','Pilote','boolean');
    // console.log("hasRobot:"+hasRobot)    ;
    // console.log("hasPilot:"+hasPilot)    ;

    if (hasRobot == true) socket.emit('reloadRobot',""); // Ordre au robot de reloader son IHM
    
    if (hasPilot == true) {
            setTimeout(function(){
                socket.emit('reloadPilot',""); // Ordre au pilote de reloader son IHM
            }
        , 3000);
    }
    

}
  
 

function ejectRobot() {
  socket.emit('ejectRobot',""); // Ordonne au serveur de virer tous les connectés
    notifications.writeMessage ("warning","déconnexion du Robot !","",3500)
    setTimeout(function(){
    notifications.writeMessage ("success","Robot déconnecté !","",3000)
    }, 3500); 
//alert ("Clients réinitialisés !");
}

function ejectPilot() {
  socket.emit('ejectPilot',""); // Ordonne au serveur de virer tous les connectés
    notifications.writeMessage ("warning","déconnexion du pilote en cours !","",3500)
    setTimeout(function(){
    notifications.writeMessage ("success","pilote déconnecté !","",3000)
    }, 3500); 
//alert ("Clients réinitialisés !");
}

function reloadRobot() {
    socket.emit('reloadRobot',""); // Ordonne au serveur de reloader le robot connecté
    notifications.writeMessage ("warning","Reload de l'IHM Robot en cours !","",3500)
    setTimeout(function(){
        notifications.writeMessage ("success","Reload Robot terminé !","",3000)
    }
    , 3500); 
}       

function reloadPilot() {
    socket.emit('reloadPilot',""); // Ordonne au serveur de reloader le pilote connecté
    notifications.writeMessage ("warning","Reload de l'IHM Pilote en cours !","",3500)
    setTimeout(function(){
        notifications.writeMessage ("success","Reload Pilote terminé !","",3000)
    }
    , 3500); 
}





// -------------- Gestion du Gamepad Physique


// Drapeau d'activation de la détection du Gamepad
isGamepad = true;
console.log("isGamepad = "+isGamepad)
//selectGamepadTrue = document.querySelector('input#GamepadTrue');
//selectGamepadFalse = document.querySelector('input#GamepadFalse');


selectGamepadTrue = document.querySelector('input#gamepadTrue');
selectGamepadFalse = document.querySelector('input#gamepadFalse');


// On demande au serveur si la détection du Gamepad physique 
// est activée dans les paramètres
function getIsGamepad() {
    socket.emit('getIsGamepad',""); 
}


// A la réponse du serveur:
socket.on("getIsGamepad", function(data) { 
    //alert ("On getIsGamepad("+data.isGamepad+")")
    console.log('socket.on("getIsGamepad"')
    console.log(data)
    isGamepad = data.isGamepad
    updateTitleGamepad (isGamepad);
    setSelectGamepad(isGamepad)
});



function setGamepad(boolean) {
    console.log("@ setGamepad("+boolean+")")
    // Si le bouton radio est déjà sélectionné...
    if (isGamepad == boolean) return

    var hasPilot = tools.searchInObjects(activeUsers,'typeClient','Pilote','boolean');
    var response = true;
    //if (hasPilot == true) {
        var message = "Attention ! \n \n"
        message += "Activation/désactivation des commandes au Gamepad";
        message += "\n Cela entrainera le reload automatique du robot et du pilote.";
        var txt;
        response = confirm(message);
    //} 

    if (response == true) {
        isGamepad = boolean;
        updateTitleGamepad (isGamepad);
        if (isGamepad == true) txt = "Gamepad activé !";
        if (isGamepad == false) txt = "Gamepad désactivé !";

        var data = { isGamepad: isGamepad}; 
        socket.emit('setGamepad',data); // Envoi au serveur
        notifications.writeMessage ("info",txt,"",7000)
        reloadClients();
        setSelectGamepad(isGamepad)

    } else if (response == false) {
        setSelectGamepad(isGamepad)
    }       
    
    console.log("isGamepad = "+isGamepad)           
}



// Affichage du flag Gamepad
function updateTitleGamepad (value) {
    console.log("updateTitleGamepad ("+value+")")
    var message = "disabled";
    if (value === true) message = "enabled";
    var html = '<span id="zone_info_gamepad"> = '+message+'</span>';
    $('#zone_info_gamepad').replaceWith(html);
}

// Contrôle formulaire du gamepad physique
function setSelectGamepad(isGamepad) {
        
        console.log("setSelectGamepad("+isGamepad+")")


        selectGamepadTrue.disabled=false;
        selectGamepadFalse.disabled=false;

        if (isGamepad == true) {
            console.log('setTrue')
            selectGamepadTrue.checked = true;
            selectGamepadFalse.checked = false;
        
        } else if (isGamepad == false) {
            console.log('setFalse')
            selectGamepadTrue.checked = false;
            selectGamepadFalse.checked = true;
        }
}


// Gestion des IP du Robot et des caméras IP ----------------------------

ipFoscam = null;
ipRobot = null;
listUrlsRobot = {};
listUrlsFoscam = {}

// Récupération des infos serveur
function getIpRessources() {
    console.log("@ getIpRessources()");
    socket.emit('getIpRessources',""); 
}

// Réponse du serveur au chargement de la page:
socket.on("getIpRessources", function(data) { 
    
    console.log("socket.on('getIpRessources', data");
    console.log(data);

    ipFoscam = data.ipFoscam;
    ipRobot = data.ipRobot;
    listUrlsRobot = data.listUrlsRobot;
    listUrlsFoscam = data.listUrlsFoscam;


    ihm.displayFormIp('Robot',listUrlsRobot,ipRobot);
    ihm.displayFormIp('Camera',listUrlsFoscam,ipFoscam);

});





// Réponse du serveur après select/add/delete d'une IP caméra ou Robot:
socket.on("setIpRessources", function(data) { 
    
    console.log("socket.on('setIpRessources', data");
    console.log(data);

    var hasRobot = tools.searchInObjects(activeUsers,'typeClient','Robot','boolean');
    if (hasRobot == true) socket.emit('reloadRobot',""); // Ordre au robot de reloader son IHM
    
    ipFoscam = data.ipFoscam;
    ipRobot = data.ipRobot;
    listUrlsRobot = data.listUrlsRobot;
    listUrlsFoscam = data.listUrlsFoscam;


    ihm.displayFormIp('Robot',listUrlsRobot,ipRobot);
    ihm.displayFormIp('Camera',listUrlsFoscam,ipFoscam);

});



// Selection de l'ip caméra
function setIp_Robot(parameter){
    
    console.log('setIp_Robot('+parameter+')');
    
    for (ip in listUrlsRobot) {
        if (parameter == listUrlsRobot[ip].Label ) ipRobot = listUrlsRobot[ip];
        var data = {
            cible: 'Robot',
            newData: ipRobot
        }
        socket.emit('updateIpRessources', data);
    } 
}


// Sélection de l'ip caméra
function setIp_Camera(parameter){
    
    console.log('setIp_Camera('+parameter+')');
    
    for (ip in listUrlsFoscam) {
        if (parameter == listUrlsFoscam[ip].Label ) ipFoscam = listUrlsFoscam[ip];
        var data = {
            cible: 'Camera',
            newData: ipFoscam
        }
        socket.emit('updateIpRessources', data);
    } 

}



// suppression d'une IP robot
function deleteIp_Robot(parameter){
    console.log('deleteIp_Robot('+parameter+')');
    
    if (parameter == ipRobot.Label) {
        alert ("IP Robot active! \n Suppression impossible.");
        
    } else {
        delete listUrlsRobot[parameter];
        var data = {
                cible: 'listUrlsRobot',
                newData: listUrlsRobot
            }
        socket.emit('updateIpRessources', data);
    }
}

// suppression d'une IP caméra
function deleteIp_Camera(parameter){
    console.log('deleteIp_Camera('+parameter+')');
    
    if (parameter == ipFoscam.Label) {
        alert ("IP Camera active! \n Suppression impossible.");
        
    } else {

        delete listUrlsFoscam[parameter]; 
        var data = {
            cible: 'listUrlsFoscam',
            newData: listUrlsFoscam
        }
        socket.emit('updateIpRessources', data);
    }

}



// Ajouts d'IPs caméra et robot


newIpRobot = document.getElementById("newIP_Robot");
newLabelRobot = document.getElementById("newLabel_Robot");

newIpCamera = document.getElementById("newIP_Camera");
newLabelCamera = document.getElementById("newLabel_Camera");

function addRessource(type) {
    if (!type) return;
    console.log("@ addressource("+type+")")
    
    var newListRessources = {}, newRessource = null, label = null, ip = null, cible = null;;

    if (type == 'Robot') {
        cible = 'listUrlsRobot';
        label = newLabelRobot.value;
        ip = newIpRobot.value
        newRessource = new models.ressourceUrl(ip, label, "");
        listUrlsRobot[label] = newRessource;
        newListRessources = listUrlsRobot;

    } else if (type == 'Camera') {
        cible = 'listUrlsFoscam',
        label = newLabelCamera.value;
        ip = newIpCamera.value
        newRessource = new models.ressourceUrl(ip, label, "");
        listUrlsFoscam[label] = newRessource;
        newListRessources = listUrlsFoscam;
    }
    if (label == "" || ip == "") return

        var data = {
            cible: cible,
            newData: newListRessources
        }
        console.log(data);
        socket.emit('updateIpRessources', data);

    
    console.log("Type: "+ type + " | Label: " + label + " | IP: "+ ip)

    
}