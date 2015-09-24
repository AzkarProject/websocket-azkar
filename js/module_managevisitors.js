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
    // var txt= userID;
    //alert(txt);
    // si c'est uin visiteur, on lance aussi localement le processus de déconnexion pilote/visiteur
    if (cible.typeClient == "Visiteur") {
    	var thisPeerCnx = prefix_peerCnx_1toN_VtoP+userID; // On reconstruit l'Id de l'objet peerConnexion
    	// on lance le processus préparatoire à une reconnexion
    	onDisconnect_1toN_VtoP(thisPeerCnx);
    }  
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
		    var activeCnx = false;
		    // si le client est un robot
		    if (oneUser.typeClient == "Robot" )
		    	// Si connexion active entre robot et pilote
		    	if (robotCnxStatus != "new") {
		    		openform = '<button class="shadowBlack" id="openCnx'+oneUser.id+'" onclick="closeCnxwith(\''+oneUser.id+'\')">Close Stream</button>';
		    	}
		    
		    // si le client est un visiteur
		    if (oneUser.typeClient == "Visiteur" ) {
		    	// Test de la connexion du visiteur:
		    	// Regarder ds la liste des peerCollection et si l'Id du Peer est présent, alors connexion active
		    	for (var key in peerCnxCollection) {
				    // on ne teste pas la peerConnection 1to1 qui n'as pas de lien entre pilote et robot	
					if (key != peerCnx1to1) {    

					    // Si l'ID du client se retrouve dans l'ID d'une peerConnection
					    var oneUserCible = null;
					    oneUserCible = getCibleFromPeerConnectionID(key, prefix_peerCnx_1toN_VtoP);
					    console.log ("---------------------------------------------------------");
					    console.log (oneUserCible);
					    console.log ("---------------------------------------------------------");
					    // openform = '<button class="shadowBlack" id="openCnx'+oneUser.id+'" onclick="closeCnxwith(\''+oneUser.id+'\')">Close Stream</button>';
					    // openform += '<button class="shadowBlack" id="openCnx'+oneUser.id+'" onclick="openCnxwith(\''+oneUser.id+'\')">Open Stream</button>';
					    if (oneUserCible.id) { // si présent >>>> connexion active: >> Bouton close
					    	// openform += '<button class="shadowBlack" id="openCnx'+oneUser.id+'" onclick="openCnxwith(\''+oneUser.id+'\')">Open Stream</button>';
					    	 openform = '<button class="shadowBlack" id="openCnx'+oneUser.id+'" onclick="closeCnxwith(\''+oneUser.id+'\')">Close Stream</button>';
					    } else { // si pas présent, connexion inactive >> Bouton Open
					    	 openform = '<button class="shadowBlack" id="openCnx'+oneUser.id+'" onclick="openCnxwith(\''+oneUser.id+'\')">Open Stream</button>';
					    	// openform = '<button class="shadowBlack" id="openCnx'+oneUser.id+'" onclick="closeCnxwith(\''+oneUser.id+'\')">Close Stream</button>';
					    }
					} 
				}

		    }
		    // Si le client n'est pas le pilote,
		    // on ajoute sa ligne a la liste des clients connectés.
		    if (oneUser.typeClient != "Pilote" ) {
		    	blabla +="<div> ["+oneUser.typeClient+"] - Cnx n°"+ oneUser.placeliste +": "+ oneUser.pseudo+" - "+openform+"</div>";  
			}
        }
        // Affichage de la liste
        document.getElementById('listConnected').innerHTML = blabla;   
}