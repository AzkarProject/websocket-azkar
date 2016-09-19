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
*
* Le fait que vous puissiez accéder à cet en-tête signifie que vous avez 
* pris connaissance de la licence CeCILL-C, et que vous en avez accepté les
* termes.
*
*/



(function(exports){

	
	// Pour tester si le ficher est présent 
	// dans la distribution...
	exports.isExist = function(){
		return true;
	}

	exports.setBranch = function(){
		appBranch = "1to1-cnrs";
	}

	exports.setServers = function(){
		
		
		// OverWriter les configs serveurs par défaut. Exemple: 

		/*
		port=80
		ipaddress = "xxx.xx.xx.xx" (ou le nom du domaine...)
		pathKey = './ssl/hacksparrow-key.pem';
		pathName = './ssl/hacksparrow-cert.pem';
	    indexUrl = "https://" + ipaddress + ":" + port;
		*/

		// ----------------------------------- CNRS

		dyDns = 'azkar.ddns.net'; // Adresse no-Ip pointant sur Livebox domicile
		pathKey = './ssl/hacksparrow-key.pem';
		pathName = './ssl/hacksparrow-cert.pem';



		// Machines windows - I3S
		if (hostName == "azcary") ipaddress = "192.168.173.1"; // Ip du réseau virtuel AdHoc
		else if (hostName == "thaby") ipaddress = "192.168.173.1"; // Tablette HP sur Robulab: ip du réseau virtuel AdHoc
		else if (hostName == "amini") ipaddress = "192.168.173.1"; // Machine Anthony
		else if (hostName == "Az_HaTiM") ipaddress = "localhost"; // Machine Hatim

		// Machine Windows - Domicile
		else if (hostName == "lapto_Asus") ipaddress = "0.0.0.0"; // Pc perso - (IP interne, Livebox domicile)

		// Machines Ubuntu - Domicile
		else if (hostName == "ubuntu64azkar") ipaddress = "192.168.1.10"; // Vm Ubuntu sur Pc perso (Domicile)
		else if (hostName == "azkar-Latitude-E4200") ipaddress = "0.0.0.0"; // Pc Dell Latitude - Livebox domicile - noip > azkar.ddns.net

		// VM Sparks -Ubuntu
		else if (hostName == "Mainline") ipaddress = "134.59.130.141"; // IP statique de la Vm sparks
		// else if (hostName == "AZKAR-1") ipaddress = "134.59.130.143"; // IP statique de la Vm sparks 
		else if (hostName == "AZKAR-1") ipaddress = "0.0.0.0"; // IP statique de la Vm sparks 
		else if (hostName == "AZKAR-2") ipaddress = "134.59.130.142"; // IP statique de la Vm sparks

		port=80
		indexUrl = "https://" + ipaddress + ":" + port;

		if (hostName == "azkar-Latitude-E4200") indexUrl = "http://" + dyDns; // Si machine derrière liveBox && noip

	}


	exports.setIceServers = function(type) {
		 

		/*// ---------- Exemple
		TURN_username = "webrtc";
		TURN_credential = "webrtc";
		var server = {'iceServers': []};
		server.iceServers.push({ url: 'stun:stun.l.google.com:19302'});
		server.iceServers.push({urls: "turn:xxx.xxx.xxx.xxx:XX",credential: TURN_credential ,username: TURN_username}); 
		return server
		/**/





		/*// ---------------- ROBOSOFT

		// rfc5766 avec authentification
		TURN_username = "robosoft";
		TURN_credential = "robosoft";
		var server = {'iceServers': []};
		server.iceServers.push({ url: 'stun:stun.l.google.com:19302'});
		//server.iceServers.push({ url: "turn:turn.anyfirewall.com:443?transport=tcp",credential: "webrtc",username: "webrtc"});
		// Serveur STUN/TURN du CNRS... Essayez avec le votre...
		server.iceServers.push({urls: "turn:134.59.130.142:3478",credential: TURN_credential ,username: TURN_username}); 
		return server
		/**/



		/*// ---------------  ANOTHERWORLD

		// rfc5766 avec authentification
		TURN_username = "anotherworld";
		TURN_credential = "anotherworld";
		var server = {'iceServers': []};
		server.iceServers.push({ url: 'stun:stun.l.google.com:19302'});
		//server.iceServers.push({ url: "turn:turn.anyfirewall.com:443?transport=tcp",credential: "webrtc",username: "webrtc"});
		// Serveur STUN/TURN du CNRS... Essayez avec le votre...
		server.iceServers.push({urls: "turn:134.59.130.142:3478",credential: TURN_credential ,username: TURN_username}); 
		return server

		/**/

		// ------------------ CNRS 


		// rfc5766 avec authentification
		TURN_username = "azkar";
		TURN_credential = "azkar";
		    
		// Si on est l'apellant (pilote)
		if (type == "pilote-appelant") {
		   	TURN_username = "pilote";
		   	TURN_credential = "azkar";
		// Sinon si on est l'apellé (Robot)
		} else if (type == "robot-appelé") {
		   	TURN_username = "robot";
		   	TURN_credential = "azkar";
		}


		// options pour l'objet PeerConnection
		server = {'iceServers': []}; // OK sur même réseau...
		server.iceServers.push({ url: 'stun:stun.l.google.com:19302'});
		// rfc5766  sur VM1 (Cluster SPARKS)
		// server.iceServers.push({urls: "turn:134.59.130.142:3478",credential: TURN_credential ,username: TURN_username}); 
		return server
	}


	  
	exports.isFakeRobubox = function() {
		var fakeRobubox = false;
		return fakeRobubox;
	}

	exports.getMapSource = function() {
		// var mapSource = '/images/mapRobosoft.png'; // Carte locaux Robosoft Robubox
		// var mapSource = '/images/mapLaboI3S.png'; // Carte I3S Robubox V2
		// var mapSource = '/images/labo3.png'; // Carte I3S Robubox V3
		// var mapSource = '/images/hu0.png'; // Carte MGG
		var mapSource = '/images/labo261.png'; // Carte I3S Via Dashboard Mobiserv
		// var mapSource = '/images/labovilette.png'; // Carte CS La Vilette Via Dashboard Mobiserv
		// var mapSource = '/images/lavilette-salle-de-jeux.png'; // Carte CS La Vilette V2 Via Dashboard Mobiserv
		// var mapSource = '/images/PenBron0.png'; // Carte PenBron: 
		//var mapSource = '/images/atelierlavilette30.png'; // Carte CS La Vilette V3 Via Dashboard Mobiserv
		//var mapSource = '/images/couloir0.png'; // Carte CS La Vilette V4 (demo du 17/09) Via Dashboard Mobiserv
		return mapSource
	}

	/*
	exports.getMobiserveUrl = function() {
		// var url = "192.166.1.66:7007"; // Mobiserve Robulab Labo (Si rebond via Surface)
		var url = "127.0.0.1:7007"; // Mobiserve Robulab Labo (Si HP seul)
		//var url = "10.0.15.74:7007"; // Mobiserve Kompaï LaVilette
		return url;
	}

	exports.getFoscamUrl = function() {
		var url = "192.168.1.50:88"; // Foscam Robulab Labo
		//var url = "10.0.15.50:88"; // Foscam Kompaï LaVilette
		return url;
	}
	/**/


})(typeof exports === 'undefined'? this['appDevBranch']={}: exports);
