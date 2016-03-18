/*
*
* Authors: Thierry Bergeron, Michel Buffa
* Copyright : © CNRS (Laboratoire I3S) / université de Nice
*
*/


// Globale: flag de connexion webRTC active 
// Pour gérer les conflits entre les commandes déco/reco
// issues de l'interface et celles issues du Gamepad

IS_WebRTC_Connected = false;

function openCnxwith(userID) {
    console.log("@ openCnxwith("+userID+")");
    
    var cible = getClientBy('id',userID); 
	console.log ('socket.emit("requestConnect", ...) >>> ['+cible.typeClient+'] - ');
    var data = {from: localObjUser, cible: cible}
    // console.log (data);
    socket.emit("requestConnect", data);
   // var txt= userID;
    //alert(txt);
    updateListUsers ();
}


function closeCnxwith(userID) {
    console.log("@ closeCnxwith("+userID+")");
    
    var cible = getClientBy('id',userID); 
    var data = {from: localObjUser, cible: cible}

    socket.emit("closeConnectionOrder", data);
    	
	// Robustesse: 
	// On remet le flag de déconnexion du robot à "Forced" pour empécher une reconnexion automatique...
	// Et on remet le flag de session webRTC a zéro.
	robotDisconnection = "Forced";
	sessionConnection = "Pending"

	// On vire le bouton de fermeture de la connexion principale
	var buttonClose1to1 = "";
	document.getElementById('closeConnection').innerHTML = buttonClose1to1;
}


function isRobotConnected(peerCnxCollection) {
	console.log ("@ isRobotConnected()");
	var isConnected = false;
	//closeConnectionButton("deactivate",null);
	if (peerCnxCollection[peerCnx1to1]) {
		if (peerCnxCollection[peerCnx1to1].iceConnectionState != "new" ) isConnected = true;
	 }
	if (peerCnxCollection[peerCnx1to1] == null) {
		// On désactive le bouton de fermeture de la connexion principale
		ihm.closeConnectionButton("deactivate",null);
	}
	return isConnected;
}



function updateListUsers() {
        console.log ("@ updateListUsers()");
        console.log ("robotCnxStatus >>>>> "+robotCnxStatus);
        

        // closeConnectionButton("deactivate",null);

        // console.log (users);
        var blabla = "";
        var i = null;

		// Si connexion principale p2p active entre robot et pilote
    	var active1to1Cnx = false;
    	active1to1Cnx = isRobotConnected (peerCnxCollection);

        
    	// Elements HTML des boutons
    	// var HButton
    	
    	var isRobotInThelist = false;
        // On boucle sur la liste des clients connectés
        for (i in users.listUsers) {
		    var oneUser = users.listUsers[i];
		    var openform = "";
		    
		    // si le client est un robot
		    if (oneUser.typeClient == "Robot" )
		    	if (robotCnxStatus != "new") {
		    		// On active le bouton de fermeture de la connexion principale
		    		ihm.closeConnectionButton("activate",oneUser.id);
		    		isRobotInThelist = true;
		    	}
        
        } // end For  
        if (isRobotInThelist == false) ihm.closeConnectionButton("deactivate",null);
}

function getUserID(type) {
		var userID = null;
		console.log (users);
		for (i in users.listUsers) {
			    var oneUser = users.listUsers[i];
			    if (oneUser.typeClient === type ) userID = oneUser.id;
	        } 
	    return userID;    
}



/*// Activation/désactivation du bouton de fermeture de connexion
function closeConnectionButton(order,userID){
	console.log ("closeConnectionButton("+order+")");
	if (order == "activate") {
		var buttonClose1to1 = '<button class="shadowBlack txtRed" id="openCnx'+userID+'" onclick="closeCnxwith(\''+userID+'\')">Fermer la connexion</button>';
		document.getElementById('closeConnection').innerHTML = buttonClose1to1;
	} else if (order == "deactivate") {
		var buttonClose1to1 = '';
		document.getElementById('closeConnection').innerHTML = buttonClose1to1;
	}

}
/**/


// Fonctions passerelles

function closeRobotConnexion() {
		if (IS_WebRTC_Connected == false ) {
			alert ("la connexion est déjas fermée");
			return;
		}
		var userID = getUserID('Robot');
		// alert (userID);
		closeCnxwith(userID);
}


function openRobotConnexion() {
		if (IS_WebRTC_Connected == true ) {
			alert ("la connexion est déjas ouverte");
			return;
		}
		localManageDevices();
}