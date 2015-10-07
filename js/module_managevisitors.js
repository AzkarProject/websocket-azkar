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
    // Si la cible est le robot, on vire le bouton closeConnection
    if (cible.typeClient == "Robot") {
    	var buttonClose1to1 = "";
    	document.getElementById('closeConnection').innerHTML = buttonClose1to1;
    }  
    document.getElementById('closeConnection').innerHTML = buttonClose1to1;
    // si c'est un visiteur, on lance aussi localement le processus de déconnexion pilote/visiteur
    if (cible.typeClient == "Visiteur") {
    	var thisPeerCnx = prefix_peerCnx_1toN_VtoP+userID; // On reconstruit l'Id de l'objet peerConnexion
    	// on lance le processus préparatoire à une reconnexion
    	onDisconnect_1toN_VtoP(thisPeerCnx);
    }  
}


function isRobotConnected(peerCnxCollection) {
	console.log ("@ isRobotConnected()");
	console.log (peerCnxCollection);
	var isConnected = false;
	// var toto = peerCnxCollection[peerCnx1to1];
	// console.log(toto);
	if (peerCnxCollection[peerCnx1to1]) {

		if (peerCnxCollection[peerCnx1to1].iceConnectionState != "new" ) isConnected = true;
	 	
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
        // console.log (users);
        var blabla = "";
        var i = null;
        
        if (robotCnxStatus == "new") raZNavChannel();
        else selectChannelWebRTC.disabled = false;





        // On boucle sur la liste des clients connectés
        for (i in users.listUsers) {
		    var oneUser = users.listUsers[i];
		    var openform = "";
		    
		    
		    // si le client est un robot
		    if (oneUser.typeClient == "Robot" )
		    	// Si connexion active entre robot et pilote
		    	if (robotCnxStatus != "new") {
		    		// openform = '<button class="shadowBlack" id="openCnx'+oneUser.id+'" onclick="closeCnxwith(\''+oneUser.id+'\')">Close Stream</button>';
		    		var buttonClose1to1 = '<button class="shadowBlack" id="openCnx'+oneUser.id+'" onclick="closeCnxwith(\''+oneUser.id+'\')">Fermer la connexion</button>';
		    		document.getElementById('closeConnection').innerHTML = buttonClose1to1;
		    	}
		    
		    
		    // si le client est un visiteur
		    if (oneUser.typeClient == "Visiteur" ) {
		    	// Test de la connexion du visiteur:
		    	var activeCnx = false;
		    	activeCnx = isVisitorConnected (peerCnxCollection,oneUser.id);

		    	var active1to1Cnx = false;
		    	if (robotCnxStatus != "new" ) active1to1Cnx = true;
		    	// active1to1Cnx = isRobotConnected (peerCnxCollection);
		    	
			    if (activeCnx == true ) { // Connexion active >> Bouton close
			    	openform = '<button class="shadowBlack" id="openCnx'+oneUser.id;
			    	openform += '" onclick="closeCnxwith(\''+oneUser.id+'\')">Close Stream</button>';
			    } else if (active1to1Cnx == true){ // seulement si connexion active entre robot et pilote
					openform = '<button class="shadowBlack" id="openCnx'+oneUser.id;
					openform +='" onclick="openCnxwith(\''+oneUser.id+'\')">Open Stream</button>';
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