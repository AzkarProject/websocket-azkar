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


function VtoR_InitCnxwith(userID) {
    console.log("@ VtoR_InitCnxwith("+userID+")");
    var offerer = getClientBy('id',userID);
    var cible = getClientBy('typeClient','Robot');
	console.log ('socket.emit("VtoR_initPreSignaling", ...) >>> ['+cible.typeClient+'] - ');
    var data = {from: offerer, cible: cible}
    socket.emit("VtoR_initPreSignaling", data);
    
    // On enregistre cette connexion dans une liste
    var cnxID = "Robot-to-Visiteur-"+userID;
    var peerCnx = {peerCnxID: cnxID, status: 'open'};
    RtoV_PeerCnx_Collection[userID] = peerCnx;
    

    console.log(RtoV_PeerCnx_Collection);

    updateListUsers()
}

    /*
    socket.on("VtoR_initPreSignaling", function(data) {
        if (data.cible.id === myPeerID ) {
            console.log(">> socket.on('VtoR_initPreSignaling',...");
            var data = {from: localObjUser, cible: data.cible};  
            socket.emit('VtoR_requestConnect', data);
        }
    });
    /**/


function closeCnxwith(userID) {
    console.log("@ closeCnxwith("+userID+")");
    
    var cible = getClientBy('id',userID); 
	console.log ('socket.emit("closeConnectionOrder", ...) >>> ['+cible.typeClient+'] - ');
    console.log ('socket.emit("closeAllVisitorsConnectionOrder", ...) >>> ['+cible.typeClient+'] - ');
    var data = {from: localObjUser, cible: cible}
    // console.log (data);
    socket.emit("closeConnectionOrder", data);
    socket.emit("closeAllVisitorsConnectionOrder", data);
    
    // Si la cible est le robot, 
    if (cible.typeClient == "Robot") {

    	// On coupe toutes les connexions p2p pilote/visiteurs
    	// Pour pouvoir leur retransmettre le nouveau Stream si changement de caméra coté robot.
    	closeCnxwithAllVisitors("Pilote");

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


function closeCnxwithAllVisitors(requester) {
    console.log("@ closeCnxwithAllVisitors()");
    
    // On définit le préfixe de l'ID de la connexion ()
    // en fonction de la nature de l'apellant de la fonction 
    var prefixID = "";
    if (requester == "Pilote") prefixID = "Pilote-to-Visiteur-";
    else if (requester == "Robot") prefixID = "Robot-to-Visiteur-";

    // On regarde dans la liste des clients
	for (i in users.listUsers) {
		// On récupère l'objet client
		var cibleToClose = getClientBy('id',users.listUsers[i].id);
		// Si le client est un visiteur
	    if (cibleToClose.typeClient == "Visiteur" ) {
	    	// On vérifie qu'il est bien l'objet d'une connexion p2p (WebRTC) entre pilote et visiteur
	    	var activeCnx = false;
	    	// activeCnx = isVisitorConnected (peerCnxCollection,cibleToClose.id);
	    	activeCnx = isVisitorConnected2 (peerCnxCollection,cibleToClose.id, prefixID);
		    // Si connecté p2p >> on lance la procédure de Déconnexion locale du client.
		    if (activeCnx == true ) { 
		    	var thisPeerCnx = prefixID+cibleToClose.id; 

		    	if (requester == "Pilote") onDisconnect_1toN_VtoP(thisPeerCnx);
			    	// On reconstruit l'Id de la connexion p2p à cloturer
			    	
					// On lance le process de déconnexion coté Pilote
					
				else if (requester == "Robot") onDisconnect_VtoR(thisPeerCnx);
			    	// On reconstruit l'Id de la connexion p2p à cloturer
			    	//var thisPeerCnx = prefix_peerCnx_VtoR+cibleToClose.id; 
					// On lance le process de déconnexion coté Pilote
					
				
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



function isVisitorConnected(peerCnxCollection,userID,prefixID) {
    //var cibleID = userID.replace(prefix_peerCnx_1toN_VtoP, "")
	var isConnected = false;
	// alert(prefixID);
	for (var key in peerCnxCollection) {
		// Inutile si la Key (id connection) est celle du peer Pilote-to-Robot
		if ( key != peerCnx1to1) {
			var testID = key.replace(prefixID, "");
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
/**/

function isVisitorConnected2(peerCnxCollection,userID) {
    //var cibleID = userID.replace(prefix_peerCnx_1toN_VtoP, "")
	var isConnected = false;
	// alert(prefixID);
	for (var key in peerCnxCollection) {
		// Inutile si la Key (id connection) est celle du peer Pilote-to-Robot
		if ( key != peerCnx1to1) {
			var testID = key.replace("Pilote-to-Visiteur-", "");
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


// open/Close connexions P2P directes 
// entre visiteur et Robot ( Option full Mesh )
function setCnxWithRobot(message) {
    console.log("@ setCnxWithRobot()");
    var cible = getClientBy('typeClient',"Robot"); 
	console.log ('socket.emit("setCnxWithRobot('+message+')", ...)');
    var data = {from: localObjUser, message: message, cible: cible}
    socket.emit("setCnxWithRobot", data);
    updateListUsers ();
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
		    	
		    
		    
		    // si le client est un visiteur
		    if (oneUser.typeClient == "Visiteur" ) {
		    	// Test de la connexion p2p du visiteur:
		    	activeCnx = isVisitorConnected (peerCnxCollection,oneUser.id,"Pilote-to-Visiteur-");
		    	//activeCnx = isVisitorConnected2 (peerCnxCollection,oneUser.id);

		    	// Si connexion principale p2p active entre robot et pilote 
		    	// var active1to1Cnx = false;
		    	if (robotCnxStatus != "new" ) active1to1Cnx = true;
		    	// active1to1Cnx = isRobotConnected (peerCnxCollection); // Obsolète
		    	
		    	// Si Connexion p2p pilote/visiteur >> Bouton Close Stream
			    if (activeCnx == true ) { 
			    	openform = '<button class="shadowBlack txtRed" id="openCnx'+oneUser.id;

			    	// Si Stream == Pilote (Défaut)
			    	openform += '" onclick="closeCnxwith(\''+oneUser.id+'\')">Close</button>';
			    	// Si Stream == Robot
			    	// openform += '" onclick="setCnxWithRobot(\''close'\')">Close Stream</button>';

					// On ne permet la connexion entre robot et visiteur
					// que si le mode Relay(broadcast) n'est pas activé
					// ET si le visiteur n'est pas déjà connecté au robot...
					var statusRelay =  parameters.rStoV;
			    	if (statusRelay == "close") {
						
			    		// On vérifie la liste des connexions Robot/Visiteurs

			    		var RtoV_Cnx_status = null
			    		if (RtoV_PeerCnx_Collection[oneUser.id]) RtoV_Cnx_status = RtoV_PeerCnx_Collection[oneUser.id].status;				    

						if ( RtoV_Cnx_status != "open") {  
							
							var cible = getClientBy('typeClient','Robot');
							openform += '...<button class="shadowBlack txtGreen" id="initCnx'+oneUser.id;
							openform +='" onclick="VtoR_InitCnxwith(\''+oneUser.id+'\')">Connect to Robot</button>';
						}
					}

			    // Sinon si Connexion principale p2p active entre pilote et robot >> Bouton Open Stream
			    } else if (active1to1Cnx == true) { 
					openform = '<button class="shadowBlack txtGreen" id="openCnx'+oneUser.id;

					// Si Stream == Pilote (Défaut)
					openform +='" onclick="openCnxwith(\''+oneUser.id+'\')">Open</button>';


					// Si Stream == Robot
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