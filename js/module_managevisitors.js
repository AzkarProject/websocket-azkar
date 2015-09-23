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
}


function updateListUsers () {
        console.log ("@ updateListUsers()");
        // console.log (users);
        var blabla = "";
        var i = null;
        for (i in users.listUsers) {
		    var oneUser = users.listUsers[i];
		    var openform = "";
		    var activeCnx = false;
		    if (oneUser.typeClient == "Robot" )
		    	// Si connexion inactive
		    	// >> TODO
		    	// Si connexion active
		    	if (robotCnxStatus != "new") {
		    		openform = '<button class="shadowBlack" id="openCnx'+oneUser.id+'" onclick="closeCnxwith(\''+oneUser.id+'\')">Close Stream</button>';
		    	}
		    

		    if (oneUser.typeClient == "Visiteur" ) {
		    	// Test de la connexion du visiteur:
		    	// Regarder ds la liste des peerCollection et si l'Id du Peer est présent, alors connexion active
		    	// Sinon connexion non active...
		    	// Si connexion inactive
		    	openform = '<button class="shadowBlack" id="openCnx'+oneUser.id+'" onclick="openCnxwith(\''+oneUser.id+'\')">Open Stream</button>';
		    	// Si connexion active
		    	// openform = '<button class="shadowBlack" id="openCnx'+oneUser.id+'" onclick="closeCnxwith(\''+oneUser.id+'\')">Close Stream</button>';

		    }
		    // On affiche tout sauf sois-même...
		    if (oneUser.typeClient != "Pilote" ) {
		    	blabla +="<div> ["+oneUser.typeClient+"] - Cnx n°"+ oneUser.placeliste +": "+ oneUser.pseudo+" - "+openform+"</div>";  
			}
        }
        // console.log (blabla);
        document.getElementById('listConnected').innerHTML = blabla;   
}