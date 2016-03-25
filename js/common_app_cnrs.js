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

	exports.setLaboParameters = function(){
		
		dyDns = 'azkar.ddns.net'; // Adresse no-Ip pointant sur Livebox domicile
		if (hostName == "azkar-Latitude-E4200") indexUrl = "http://" + dyDns; // Si machine derrière liveBox && noip

		// Machines windows - I3S
		if (hostName == "azcary") ipaddress = "192.168.173.1"; // Ip du réseau virtuel robulab2_wifi
		else if (hostName == "thaby") ipaddress = "192.168.173.1"; // Tablette HP sur Robulab: ip du réseau virtuel robulab_wifi

		// Machine Windows - Domicile
		else if (hostName == "lapto_Asus") ipaddress = "0.0.0.0"; // Pc perso - (IP interne, Livebox domicile)

		// Machines Ubuntu - Domicile
		else if (hostName == "ubuntu64azkar") ipaddress = "192.168.1.10"; // Vm Ubuntu sur Pc perso (Domicile)
		else if (hostName == "azkar-Latitude-E4200") ipaddress = "0.0.0.0"; // Pc Dell Latitude - Livebox domicile - noip > azkar.ddns.net

		// VM Sparks -Ubuntu
		else if (hostName == "Mainline") ipaddress = "134.59.130.141"; // IP statique de la Vm sparks
		else if (hostName == "AZKAR-1") ipaddress = "134.59.130.143"; // IP statique de la Vm sparks 
		else if (hostName == "AZKAR-2") ipaddress = "134.59.130.142"; // IP statique de la Vm sparks

		port=80
		indexUrl = "https://" + ipaddress + ":" + port;

	}


	exports.setIceServers = function(type) {
		 
		// Test rfc5766 avec authentification
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
		server.iceServers.push({urls: "turn:134.59.130.142:443",credential: TURN_credential ,username: TURN_username}); 
		return server
	}


})(typeof exports === 'undefined'? this['appCNRS']={}: exports);
