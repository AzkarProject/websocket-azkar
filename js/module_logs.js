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


// Sauvegarde des afichages TCHAT WebSocket et webRTC. Inspirés de:
// http://purl.eligrey.com/github/FileSaver.js/blob/master/demo/demo.js */
(function(view) {
"use strict";

// Todo: Passer en mode exports
console.log("module_logs chargé");

var document = view.document;
var $ = function(id) {return document.getElementById(id);}
var session = view.sessionStorage;
var get_blob = function() { return view.Blob;};

var text1 = $("zone_chat_websocket");
var text_options_form1 = $("text-options1");
var text_filename1 = $("text-filename1");

var text2 = $("zone_chat_WebRTC");
var text_options_form2 = $("text-options2");
var text_filename2 = $("text-filename2");

var text3 = $("zone_chat_1toN");
var text_options_form3 = $("text-options3");
var text_filename3 = $("text-filename3");

var text4 = $("zone_chat_1toN_visitor");
var text_options_form4 = $("text-options4");
var text_filename4 = $("text-filename4");

if (text_options_form1) {
	text_options_form1.addEventListener("submit", function(event) {
		event.preventDefault();
		var BB = get_blob();
		console.log (BB);
		// BUG: Le retour chariot(\n\r) du String est bien présent
		// puisque détecté par un .replace(), mais n'est plus pris en compte 
		// une foi passé dans la fonction saveAs()...
		// Alors que si on l'écrit en dur ici ou dans la fonction, 
		// Bizaremment il est  pris en compte..
		// >>> Hack
		var WTF = text1.value
		var WTF2 = WTF.replace(/\n/g, '\r\n');
		saveAs(
			  new BB(
				 //[ text1.value || text1.placeholder] // BUG >> les "\r\n" de text1.value sont ignorés...
				 //["TOTO & TATA \r\nTITI \r\nTITI \r\nTITI"] // >>> Alors qu'ici "\n\r" écrits en durs passent....
				 [WTF2 || text1.placeholder] // >>> Voir Hack de contournement plus haut...
				, {type: "text/plain;charset=" + document.characterSet}
			)
			, (text_filename1.value || text_filename1.placeholder) + ".txt"
		);
	}, false);
}

if (text_options_form2) {
	text_options_form2.addEventListener("submit", function(event) {
		event.preventDefault();
		var BB = get_blob();
		var WTF = text2.value; // Hack
		var WTF2 = WTF.replace(/\n/g, '\r\n'); // Hack 
		saveAs(
			  new BB(
				  //[text2.value || text2.placeholder] // BUG
				  [WTF2 || text2.placeholder] // OK (voir Hack)
				, {type: "text/plain;charset=" + document.characterSet}
			)
			, (text_filename2.value || text_filename2.placeholder) + ".txt"
		);
	}, false);
}

if (text_options_form3) {
	text_options_form3.addEventListener("submit", function(event) {
		event.preventDefault();
		var BB = get_blob();
		var WTF = text3.value; // Hack
		var WTF2 = WTF.replace(/\n/g, '\r\n'); // Hack 
		saveAs(
			  new BB(
				  //[text2.value || text2.placeholder] // BUG
				  [WTF2 || text3.placeholder] // OK (voir Hack)
				, {type: "text/plain;charset=" + document.characterSet}
			)
			, (text_filename3.value || text_filename3.placeholder) + ".txt"
		);
	}, false);
}


if (text_options_form4) {
	text_options_form4.addEventListener("submit", function(event) {
		event.preventDefault();
		var BB = get_blob();
		var WTF = text4.value; // Hack
		var WTF2 = WTF.replace(/\n/g, '\r\n'); // Hack 
		saveAs(
			  new BB(
				  //[text2.value || text2.placeholder] // BUG
				  [WTF2 || text4.placeholder] // OK (voir Hack)
				, {type: "text/plain;charset=" + document.characterSet}
			)
			, (text_filename4.value || text_filename4.placeholder) + ".txt"
		);
	}, false);
}

}(self));
