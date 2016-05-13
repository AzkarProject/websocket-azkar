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
		appBranch = '1to1-refacto(MASTER)';
	}

	exports.setServers = function(){
		
		
		// OverWriter les congig serveurs par défaut. Exemple: 

		/*
		port=80
		ipaddress = "xxx.xx.xx.xx" (ou le nom du domaine...)
		pathKey = './ssl/hacksparrow-key.pem';
		pathName = './ssl/hacksparrow-cert.pem';
	    indexUrl = "https://" + ipaddress + ":" + port;
		*/



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

	}


	  
	exports.isFakeRobubox = function() {
		var fakeRobubox = false;
		return fakeRobubox;
	}

	exports.getMapSource = function() {
		// var mapSource = '/images/mapRobosoft.png'; // Carte locaux Robosoft
		// var mapSource = '/images/mapLaboI3S.png'; // Carte I3S V2
		var mapSource = '/images/labo3.png'; // Carte I3S V3
		return mapSource
	}


})(typeof exports === 'undefined'? this['appDevBranch']={}: exports);
