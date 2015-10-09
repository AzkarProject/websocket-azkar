// ------ 1 to N --------


// Switch relay par défaut: inactif
// Switch relay par défaut: Pilote
// Si déco P/R > Désactiver Switch Relay
// Si cnx/reco P/R > Activer Switch Relay
// On activ Switch Relay > Si P/V no relay en cours > Couper all p/V
// Si déco P/R > Si Stream Relay en cours > couper all P/V


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
	console.log ('socket.emit("closeConnectionOrder", ...) >>> ['+cible.typeClient+'] - ');
    var data = {from: localObjUser, cible: cible}
    // console.log (data);
    socket.emit("closeConnectionOrder", data);
    
    // Si la cible est le robot, 
    if (cible.typeClient == "Robot") {

    	// On informe tous les visiteurs de cette déconnexion
    	// Et on leur demande de lancer une procédure de déconnexion de leur coté
    	// socket.emit("closeMasterConnection", data); // BUG de récession...

    	// On coupe toutes les connexions p2p pilote/visiteurs
    	// Pour pouvoir leur retransmettre le nouveau Stream si changeme,nt de caméra coté robot.
    	closeCnxwithAllVisitors();
    	/*
    	for (i in users.listUsers) {
			// On récupère l'objet client
			var cibleToClose = getClientBy('id',users.listUsers[i].id);
			// Si le client est un visiteur
		    if (cibleToClose.typeClient == "Visiteur" ) {
		    	// On vérifie qu'il est bien l'objet d'une connexion p2p (WebRTC) entre pilote et visiteur
		    	var activeCnx = false;
		    	activeCnx = isVisitorConnected (peerCnxCollection,cibleToClose.id);
			    // Si connecté p2p >> on lance la procédure de Déconnexion locale du client.
			    if (activeCnx == true ) { 
			    	  // On reconstruit l'Id de la connexion p2p à cloturer
			    	  var thisPeerCnx = prefix_peerCnx_1toN_VtoP+cibleToClose.id; 
    				  // On lance le process de déconnexion coté Pilote
    				  onDisconnect_1toN_VtoP(thisPeerCnx);
			    } 
		    }
		    

    	}
    	/**/
    	// On vire le bouton de fermeture de la connexion principale
    	var buttonClose1to1 = "";
    	document.getElementById('closeConnection').innerHTML = buttonClose1to1;
    }  
    
        
    // si c'est un visiteur, on lance la procédure de Déconnexion locale du client concerné.
    else if (cible.typeClient == "Visiteur") {
    	// On reconstruit l'Id de la connexion p2p à cloturer
    	var thisPeerCnx = prefix_peerCnx_1toN_VtoP+userID; 
    	// On lance le process de déconnexion coté Pilote
    	onDisconnect_1toN_VtoP(thisPeerCnx);
    }  
}


function closeCnxwithAllVisitors() {
    console.log("@ closeCnxwithAllVisitors()");
    // On regarde dans la liste des clients
	for (i in users.listUsers) {
		// On récupère l'objet client
		var cibleToClose = getClientBy('id',users.listUsers[i].id);
		// Si le client est un visiteur
	    if (cibleToClose.typeClient == "Visiteur" ) {
	    	// On vérifie qu'il est bien l'objet d'une connexion p2p (WebRTC) entre pilote et visiteur
	    	var activeCnx = false;
	    	activeCnx = isVisitorConnected (peerCnxCollection,cibleToClose.id);
		    // Si connecté p2p >> on lance la procédure de Déconnexion locale du client.
		    if (activeCnx == true ) { 
		    	  // On reconstruit l'Id de la connexion p2p à cloturer
		    	  var thisPeerCnx = prefix_peerCnx_1toN_VtoP+cibleToClose.id; 
				  // On lance le process de déconnexion coté Pilote
				  onDisconnect_1toN_VtoP(thisPeerCnx);
		    } 
	    }
	}
}
/**/

function countVisitorsP2P() {
	var count = 0;
	console.log ("countVisitorsP2P()");
	console.log(peerCnxCollection)


	for (var key in peerCnxCollection) {
		// Inutile si la Key (id connection) est celle du peer Pilote-to-Robot
		if ( key != peerCnx1to1) {
			
			if (peerCnxCollection[key] != null ) {
				if (peerCnxCollection[key].iceConnectionState != "new") count ++;
			}
		}
	}
	return count;
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



function isVisitorConnected(peerCnxCollection,userID) {
    //var cibleID = userID.replace(prefix_peerCnx_1toN_VtoP, "")
	var isConnected = false;
	for (var key in peerCnxCollection) {
		// Inutile si la Key (id connection) est celle du peer Pilote-to-Robot
		if ( key != peerCnx1to1) {
			var testID = key.replace(prefix_peerCnx_1toN_VtoP, "");
			if (userID == testID) {
				isConnected = true;
				// if ( peerCnxCollection[key].RTCPeerConnection.iceConnectionState == "new" ) isConnected = false;
				if (!peerCnxCollection[key]) isConnected = false;
				else if (peerCnxCollection[key].iceConnectionState == "new") isConnected = false;
			}
		}
	}
	console.log("Visitor connected: "+isConnected);
	return isConnected;
}

function updateListUsers() {
        console.log ("@ updateListUsers()");
        console.log ("robotCnxStatus >>>>> "+robotCnxStatus);
        // console.log (users);
        var blabla = "";
        var i = null;
        
        // Reset du selecteur de canal de navigation (webRTC/WebSocket)
        // si la connexion p2p pilote/robot n'est pas encore établie
        // Selection par défaut de l'option webSocket et blocage du WebRTC
        // sinon, déblocage de l'option WebRTC
        // Idem pour l'ouverture ou la fermeture de l'option relay Stream
        if (robotCnxStatus == "new") {
        	raZNavChannel();
        	razOpenRelay();
        } else {
        	selectChannelWebRTC.disabled = false;
        	activeOpenRelay();
        }

        // On verouille le switch Relay dés la première connection p2p d'un visiteur 
        var nbVisitors = countVisitorsP2P();
		console.log ("XXXXXXXXXXXX nbVisitors >> "+nbVisitors);
		if ( nbVisitors > 0 ) freezeOpenRelay();


		// Si connexion principale p2p active entre robot et pilote
    	var active1to1Cnx = false;
    	active1to1Cnx = isRobotConnected (peerCnxCollection);

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
		    	
		    
		    
		    // si le client est un visiteur
		    if (oneUser.typeClient == "Visiteur" ) {
		    	// Test de la connexion p2p du visiteur:
		    	var activeCnx = false;
		    	activeCnx = isVisitorConnected (peerCnxCollection,oneUser.id);

		    	// Si connexion principale p2p active entre robot et pilote 
		    	// var active1to1Cnx = false;
		    	if (robotCnxStatus != "new" ) active1to1Cnx = true;
		    	// active1to1Cnx = isRobotConnected (peerCnxCollection); // Obsolète
		    	
		    	// Si Connexion p2p pilote/visiteur >> Bouton Close Stream
			    if (activeCnx == true ) { 
			    	openform = '<button class="shadowBlack txtRed" id="openCnx'+oneUser.id;
			    	openform += '" onclick="closeCnxwith(\''+oneUser.id+'\')">Close Stream</button>';
			    // Sinon si Connexion principale p2p active entre pilote et robot >> Bouton Open Stream
			    } else if (active1to1Cnx == true) { 
					openform = '<button class="shadowBlack txtGreen" id="openCnx'+oneUser.id;
					openform +='" onclick="openCnxwith(\''+oneUser.id+'\')">Open Stream</button>';
			    }
		    
		    }
		    
		    // Si le client n'est pas le pilote,
		    // on peux ajouter sa ligne a la liste des clients connectés.
		    if (oneUser.typeClient != "Pilote" && oneUser.typeClient != "Robot") {
		    	blabla +="<div> "+oneUser.placeliste +"-(" +oneUser.typeClient+") "+ oneUser.pseudo+" - "+openform+"</div>";  
			}
        } // end For
        
        // Affichage de la liste
        document.getElementById('listConnected').innerHTML = blabla;   
}