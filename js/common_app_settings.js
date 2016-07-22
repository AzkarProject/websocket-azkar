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
	    return '1to1-refacto(MASTER)';
	};

	// Numéro de version
	exports.appVersion = function(){
	    return '1.5.2';
	};

	// Crédits
	exports.appCredit = function(){
	   return '© 2015-2016 - CNRS (Laboratoire I3S) / Université de Nice';
	};

	// Adresse Ip ou nom de domaine du serveur de l'application
	// 127.0.0.1 ou localhost pour un test en local
	// 192.168.173.1 pour un serveur local accessible sur réseau wifi AdHoc (windows) 
	// Sinon l'adresse Ip  ou le nom de domaaine du serveur distant.
	exports.appServerIp = function(){
		return "127.0.0.1";
	}

	// N° de port: Idéalement 443 pour du https.
	// Le 80 marche aussi partout, mais dans ce cas 
	// il faut veiller a préciser le numéro de port dans l'url
	// pour se connecter à l'application. 
	exports.appServerPort = function(){
		return 80;
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
	// Si connecté a une robubox ou KomNav, mettre la valeur a false
	exports.isFakeRobubox = function() {
		var fakeRobubox = true;
		return fakeRobubox;
	}

	// Chemin et nom de l'image de cartographie à utiliser
	// NB: Penser à placer la carte active exportée en png par la robubox ds le repertoire image de l'applicaion.
	exports.getMapSource = function() {
    	//var mapSource = '/images/mapRobosoft.png'; // Carte locaux Robosoft
		//var mapSource = '/images/mapLaboI3S.png'; // Carte I3S V2
		//var mapSource = '/images/labo3.png'; // Carte I3S V3
		var mapSource = '/images/labo261.png'; // Carte I3S Via Dashboard Mobiserv
		return mapSource
	}

	exports.getPathKey = function() {
		var key = './ssl/hacksparrow-key.pem';
		return key
	}

	exports.getPathCert = function() {
		var cert = './ssl/hacksparrow-cert.pem';
		return cert
	}

})(typeof exports === 'undefined'? this['appSettings']={}: exports);
