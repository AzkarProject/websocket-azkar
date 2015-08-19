// Sauvegarde des afichages TCHAT WebSocket et webRTC. Inspirés de:
// http://purl.eligrey.com/github/FileSaver.js/blob/master/demo/demo.js */
(function(view) {
"use strict";

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

}(self));
