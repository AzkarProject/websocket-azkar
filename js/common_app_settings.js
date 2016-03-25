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

exports.appName = function(){
    return 'AZKAR Project';
};

exports.appBranch = function(){
    return '1to1-refacto';
};

exports.appVersion = function(){
    return '0.9.9.8.1';
};

exports.appCredit = function(){
   // return 'Copyright © CNRS (Laboratoire I3S) / université de Nice';
   return 'CeCILL-C © 2015-2016 - CNRS (Laboratoire I3S) / université de Nice';

};

exports.appServerIp = function(){
	return "127.0.0.1";
}

exports.appServerPort = function(){
	return 80;
}


exports.setIceServers = function() {
	// options pour l'objet PeerConnection
	var server = {'iceServers': []}; // OK sur même réseau...
	server.iceServers.push({ url: 'stun:stun.l.google.com:19302'});
	// Celui là fonctionnait encore le 23/11/2015
	server.iceServers.push({url: "turn:turn.anyfirewall.com:443?transport=tcp",credential: "webrtc",username: "webrtc"});
	return server
}



})(typeof exports === 'undefined'? this['appSettings']={}: exports);
