
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
	robotDisconnection = "Forced";

	// On vire le bouton de fermeture de la connexion principale
	var buttonClose1to1 = "";
	document.getElementById('closeConnection').innerHTML = buttonClose1to1;
}


function isRobotConnected(peerCnxCollection) {
	console.log ("@ isRobotConnected()");
	var isConnected = false;
	if (peerCnxCollection[peerCnx1to1]) {

		if (peerCnxCollection[peerCnx1to1].iceConnectionState != "new" ) isConnected = true;
	 	
	 }
	if (peerCnxCollection[peerCnx1to1] == null) {
		var buttonClose1to1 = '';
		document.getElementById('closeConnection').innerHTML = buttonClose1to1;
	}
	return isConnected;
}



function updateListUsers() {
        console.log ("@ updateListUsers()");
        console.log ("robotCnxStatus >>>>> "+robotCnxStatus);
        // console.log (users);
        var blabla = "";
        var i = null;
        
		// Si connexion principale p2p active entre robot et pilote
    	var active1to1Cnx = false;
    	active1to1Cnx = isRobotConnected (peerCnxCollection);

        
    	// Elements HTML des boutons
    	var HButton


        // On boucle sur la liste des clients connectés
        for (i in users.listUsers) {
		    var oneUser = users.listUsers[i];
		    var openform = "";
		    
		    // si le client est un robot
		    if (oneUser.typeClient == "Robot" )
		    	if (robotCnxStatus != "new") {
		    		// On active le bouton de fermeture de la connexion principale
		    		var buttonClose1to1 = '<button class="shadowBlack txtRed" id="openCnx'+oneUser.id+'" onclick="closeCnxwith(\''+oneUser.id+'\')">Fermer la connexion</button>';
		    		document.getElementById('closeConnection').innerHTML = buttonClose1to1;
		    	}
        
        } // end For  
}