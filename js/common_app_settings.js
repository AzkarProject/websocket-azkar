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

	// Nom de l'application
	exports.appName = function(){
	    return 'AZKAR Project';
	};

	// Nom de la branche
	exports.appBranch = function(){
	    return '1to1-cnrs';
	};

	// Numéro de version
	exports.appVersion = function(){
	    return '1.6.2';
	};

	// Crédits
	exports.appCredit = function(){
	   return '© 2015-2016 - CNRS (Laboratoire I3S) / Université de Nice';
	};

	// Adresse Ip ou nom de domaine du serveur de l'application
	// Eviter le 0.0.0.0 standard
	// localhost (de préference) pour un test en local
	// 134.59.130.143:80 VM1 Azkar
	// 134.59.130.14 ?? VM2 Azkar
	// 192.168.173.1 pour un serveur local accessible sur réseau wifi AdHoc (windows) 
	// Sinon le nom de domaine du serveur distant (de préférence) ou son adresse IP 
	exports.appServerIp = function(){
		//return "localhost";
		// return "192.168.173.1" // réseau AdHoc 'Robulab_wiwi'
		return "134.59.130.143" // VM 1 Sparks
		//return "134.59.130.142" // VM 2 Sparks
	}

	// N° de port: Idéalement 443 pour du https.
	// Le 80 marche aussi partout, mais dans ce cas 
	// il faut veiller a préciser le numéro de port dans l'url
	// pour se connecter à l'application. 
	exports.appServerPort = function(){
		//return 443; (utilisé avec localHost)
		return 80; // (utilisé avec VM 1 Sparks & réseau AD Hoc)
	}

	// Retourne le nom d'instance de l'application
	exports.appInstanceTitle = function(){
		return "Laboratoire I3S";
	}



	// Liste des serveurs STUN et TURN
	// Il est possible de mettre plusieurs serveurs STUN et TURN
	// Toutefois, il est conseillé de ne mettre qu'un seul serveur TURN fonctionnel 
	// pour diminuer les échanges de "candidates" superflus et raccourcir les délais de connexion/reconnexion. 
	exports.setIceServers = function() {
		var server = {'iceServers': []};
		server.iceServers.push({ url: 'stun:stun.l.google.com:19302'});
		server.iceServers.push({ url: "turn:turn.anyfirewall.com:443?transport=tcp",credential: "webrtc",username: "webrtc"});
		return server
	}

	
	// Si le client Robot n'est pas sur un Pc embarqué dans un Kompaï ou autre robot,
	// on émule un pseudo système embarqué pour la cartographie, la jauge de batterie et les commandes drive...
	/*// Si connecté a une robubox ou KomNav, mettre la valeur a false
	exports.isFakeRobubox = function() {
		var fakeRobubox = true;
		return null;
	}
	/**/

	// Chemin et nom de l'image par défaut pour la cartographie
	exports.getMapSource = function() {
    	var mapSource = '/images/defaultMaps/map_unavailable.jpg'; // Image de map absente
		return mapSource
	}
	/**/


	exports.getPathKey = function() {
		var key = './ssl/hacksparrow-key.pem';
		return key
	}

	exports.getPathCert = function() {
		var cert = './ssl/hacksparrow-cert.pem';
		return cert
	}

})(typeof exports === 'undefined'? this['appSettings']={}: exports);
