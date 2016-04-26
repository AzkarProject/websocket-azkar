/*
*
* Copyright © CNRS (Laboratoire I3S) / université de Nice
* Contributeurs: Michel Buffa & Thierry Bergeron, 2015-2016
* 
* Ce logiciel est un programme informatique servant à piloter un Robot à distance
* Ce logiciel est régi par la licence CeCILL-C soumise au droit français et
* respectant les principes de diffusion des logiciels libres. Vous pouvez
* utiliser, modifier et/ou redistribuer ce programme sous les conditions
* de la licence CeCILL-C telle que diffusée par le CEA, le CNRS et l'INRIA 
* sur le site "http://www.cecill.info".
*
* En contrepartie de l'accessibilité au code source et des droits de copie,
* de modification et de redistribution accordés par cette licence, il n'est
* offert aux utilisateurs qu'une garantie limitée.  Pour les mêmes raisons,
* seule une responsabilité restreinte pèse sur l'auteur du programme,  le
* titulaire des droits patrimoniaux et les concédants successifs.

* A cet égard  l'attention de l'utilisateur est attirée sur les risques
* associés au chargement,  à l'utilisation,  à la modification et/ou au
* développement et à la reproduction du logiciel par l'utilisateur étant 
* donné sa spécificité de logiciel libre, qui peut le rendre complexe à 
* manipuler et qui le réserve donc à des développeurs et des professionnels
* avertis possédant  des  connaissances  informatiques approfondies.  Les
* utilisateurs sont donc invités à charger  et  tester  l'adéquation  du
* logiciel à leurs besoins dans des conditions permettant d'assurer la
* sécurité de leurs systèmes et ou de leurs données et, plus généralement, 
* à l'utiliser et l'exploiter dans les mêmes conditions de sécurité. 

* Le fait que vous puissiez accéder à cet en-tête signifie que vous avez 
* pris connaissance de la licence CeCILL-C, et que vous en avez accepté les
* termes.
*
*/

	
(function(exports){

	// Todo: passer en mode exports...
	console.log("module_userConnection chargé")


	// Gestionnaire de flag de connexion WebRTC
	// IS_WebRTC_Connected

	exports.IS_WebRTC_Connected = function() {
		return IS_WebRTC_Connected;
	}

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


	//function closeCnxwith(userID) {
	exports.closeCnxwith = function (userID) {
	    console.log("@ closeCnxwith("+userID+")");
	    
	    var cible = usersConnection.getClientBy('id',userID); 
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



	// function updateListUsers() {
	exports.updateListUsers = function() {	
	        console.log ("@ updateListUsers()");
	        // console.log ("robotCnxStatus >>>>> "+robotCnxStatus);
	        

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




	//function getClientBy(key,value) {
	exports.getClientBy = function(key,value) {	

	    for (i in users.listUsers) {
	        if (users.listUsers[i][key] == value) {
	                return users.listUsers[i];
	                break;
	        }
	    }
	};

	// Retourne l'objet client distant d'une peerConnexion
	// On peux retrouver l'ID du pair distant en analysant l'ID de la connexion:
	// Le peerID de la connexion est constitué d'une concaténation
	// d'un préfixe et de l'id client du visiteur
	// Il suffit donc d'oter le préfixe pour retrouver l'id du pair distant...
	// A partir de là, on récupère aussi le client.
	function getCibleFromPeerConnectionID(peerCnxId, prefix) {
	    var cibleID = peerCnxId;
	    cibleID = cibleID.replace(prefix, "");
	    cible = getClientBy('id',cibleID); 
	    return cible;
	};



	// Fonctions passerelles

	exports.closeRobotConnexion = function() {
			if (IS_WebRTC_Connected == false ) {
				//alert ("la connexion est déjas fermée");
				return;
			}
			var userID = getUserID('Robot');
			// alert (userID);
			usersConnection.closeCnxwith(userID);
	}


	exports.openRobotConnexion = function() {
			if (IS_WebRTC_Connected == true ) {
				//alert ("la connexion est déjas ouverte");
				return;
			}
			localManageDevices();
	}


})(typeof exports === 'undefined'? this['usersConnection']={}: exports);	