// ------ 1 to N --------

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
    // si c'est uin visiteur, on lance aussi localement le processus de déconnexion pilote/visiteur
    if (cible.typeClient == "Visiteur") {
    	var thisPeerCnx = prefix_peerCnx_1toN_VtoP+userID; // On reconstruit l'Id de l'objet peerConnexion
    	// on lance le processus préparatoire à une reconnexion
    	onDisconnect_1toN_VtoP(thisPeerCnx);
    }  
}


function isVisitorConnected(peerCnxCollection,userID) {
    //var cibleID = userID.replace(prefix_peerCnx_1toN_VtoP, "");
	console.log(peerCnxCollection);
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
        // console.log (users);
        var blabla = "";
        var i = null;
        
        // On boucle sur la liste des clients connectés
        for (i in users.listUsers) {
		    var oneUser = users.listUsers[i];
		    var openform = "";
		    
		    
		    // si le client est un robot
		    if (oneUser.typeClient == "Robot" )
		    	// Si connexion active entre robot et pilote
		    	if (robotCnxStatus != "new") {
		    		openform = '<button class="shadowBlack" id="openCnx'+oneUser.id+'" onclick="closeCnxwith(\''+oneUser.id+'\')">Close Stream</button>';
		    	}
		    
		    
		    // si le client est un visiteur
		    if (oneUser.typeClient == "Visiteur" ) {
		    	// Test de la connexion du visiteur:
		    	var activeCnx = false;
		    	activeCnx = isVisitorConnected (peerCnxCollection,oneUser.id);
		    	
			    if (activeCnx == true ) { // Connexion active >> Bouton close
			    	openform = '<button class="shadowBlack" id="openCnx'+oneUser.id+'" onclick="closeCnxwith(\''+oneUser.id+'\')">Close Stream</button>';
			    } else { // Connexion inactive >> Bouton Open
					openform = '<button class="shadowBlack" id="openCnx'+oneUser.id+'" onclick="openCnxwith(\''+oneUser.id+'\')">Open Stream</button>';
			    }
		    }
		    
		    


		    // Si le client n'est pas le pilote,
		    // on ajoute sa ligne a la liste des clients connectés.
		    if (oneUser.typeClient != "Pilote" ) {
		    	blabla +="<div> "+oneUser.placeliste +"-(" +oneUser.typeClient+") "+ oneUser.pseudo+" - "+openform+"</div>";  
			}
        } // end For
        
        // Affichage de la liste
        document.getElementById('listConnected').innerHTML = blabla;   
}