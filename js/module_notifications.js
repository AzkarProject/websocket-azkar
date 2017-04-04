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

console.log("module_notifications chargé");
// Cool Notifications 
// source: http://red-team-design.com/cool-notification-messages-with-css3-jquery/

// define the messages types	
var myMessages = ['info','warning','error','success','standard']; 	 

// Variable globale de notification en cours
// pour éviter les doubles affichages...
activeNotification = false;
IS_Notify = false;

$(document).ready(function(){
		 
		 // Initially, hide them all
		 notifications.hideAllMessages();
		 notifications.hideAllRecommandations();

		 // When message is clicked, hide it
		 $('.message').click(function(){			  
				  $(this).animate({top: -$(this).outerHeight()}, 500);
		  });

		 // When recommandation is clicked, hide it
		 $('.recommandations').click(function(){			  
				  // $(this).animate({top: -$(this).outerHeight()}, 500);
		  });		 
		 
}); 


exports.hideAllMessages = function() {
		 // this array will store height for each
		 var messagesHeights = new Array(); 
	 
		 for (i=0; i<myMessages.length; i++)
		 {
				  messagesHeights[i] = $('.' + myMessages[i]).outerHeight();
				  //move element outside viewport
				  $('.' + myMessages[i]).css('top', -messagesHeights[i]); 	  
		 }
}

      


// Setter sous forme de fonction
// pour être apellé dans un setimeout
exports.set_IS_Notify = function (value) {
	// alert (IS_Notify);
	IS_Notify = value;
}

// author Titi: 
// Le parametre duration permet de temporiser
// La fermeture du message.
// 4 types possibles: 'info','warning','error','success'
exports.writeMessage = function (type,title,body,duration,notification,url){

	titleMessage = '<h3>'+title+'</h3>';
	var textMessage = titleMessage+'<p>'+body+'</p>';
	$('.'+type).html(textMessage);
	notifications.hideAllMessages();				  
	$('.'+type).animate({top:"0"}, 500);
	
	
	if (duration) {
		//setTimeout (set_IS_Notify(false),duration+500)
		setTimeout(function(){
         $('.'+type).animate({top: -$('.'+type).outerHeight()}, 500);
    	},duration);	
	} else IS_Notify = false;

	// Et une notification de type desktop....
	if (notification) notifications.spawnNotification(title,body,duration)

}



// ----- Affichages Partie Web Sémanique -----------------------

// Flag d'ouverture du bandeau de recommandations
IS_illustrated = false;

// define the messages types	
var recommandationsMsg = ['miscelleanous','media','text','web','link']; 	 

exports.hideAllRecommandations = function() {
		 // this array will store height for each
		 // if (IS_illustrated == false) return;
		 var messagesHeights = new Array(); 
	 
		 for (i=0; i<recommandationsMsg.length; i++)
		 {
				  messagesHeights[i] = $('.' + recommandationsMsg[i]).outerHeight();
				  //move element outside viewport
				  $('.' + recommandationsMsg[i]).css('top', -messagesHeights[i]); 	  
		 }
		 IS_illustrated = false;
}

// Author Titi: 
// inspiré de la fonction précédente
// mais adaptée pour que la nofifiction persiste en dessous des autres
// A déclencher quand on arrive sur un POI ou une Scène et a retirer quand on s'en éloigne
// Servira a afficher des médias et des infos Web Sémantique concernant la Scène. 

cliquableLogo = '<div style="float:left; margin: -5px 10px 0 10px"><a href="/">';
cliquableLogo += '<img src="/images/logo/AZKAR-v2.png" alt="AZKAR PROJECT" title="Projet Azkar"  width="75px;" height="27px"/>';
cliquableLogo += '</a></div>';

exports.writeRecommandations = function (type,title,body,duration){
	if (IS_illustrated == true) return
	IS_illustrated = true
	
	//titleMessage = '<div style="float:left;width:150px;background-color:red">'+cliquableLogo+'</a></div>';
	
	titleMessage = cliquableLogo
	titleMessage += '<div style="float:left;"><h3>'+title+'&nbsp;&nbsp;&nbsp;</h3></div>';


	//titleMessage += '<div style="float:left"><h3>'+title+'</h3><hr/>';
	var closeButton = ' <span style="text-align:center; float:right ;margin: 0 auto ">';
	closeButton +='<button class="shadowBlack" id="closeNotification" onclick="hideNotification(\'recommandation\')">close</button></span><hr/>';

	// var textMessage = titleMessage+closeButton+'<div>'+'<div style="float:right;>'+body+'</div>';
	var textMessage = titleMessage+closeButton+'<div style="float:right;>'+body+'</div>';
	
	$('.'+type).html(textMessage);
	

	$('.'+type).animate({top:"0"}, 500);
	
	
	if (duration) {
		//setTimeout (set_IS_Notify(false),duration+500)
		setTimeout(function(){
         // $('.'+type).animate({top: -$('.'+type).outerHeight()}, 500);
         	pprefresh(); // On rafraichit le listener de la lightbox
    	},duration);	
	} else IS_illustrated = false;
}





//-----Notifications Desktop -------------------------------------------------------------------------
// source: https://developer.mozilla.org/fr/docs/Web/API/notification

exports.notifyMe = function() {
  // Voyons si le navigateur supporte les notifications
  if (!("Notification" in window)) {
    alert("Ce navigateur ne supporte pas les notifications desktop");
  }

  // Voyons si l'utilisateur est OK pour recevoir des notifications
  else if (Notification.permission === "granted") {
    // Si c'est ok, créons une notification
    var notification = new Notification("Notifications activées !");
  }

  // Sinon, nous avons besoin de la permission de l'utilisateur
  // Note : Chrome n'implémente pas la propriété statique permission
  // Donc, nous devons vérifier s'il n'y a pas 'denied' à la place de 'default'
  else if (Notification.permission !== 'denied') {
    Notification.requestPermission(function (permission) {

      // Quelque soit la réponse de l'utilisateur, nous nous assurons de stocker cette information
      if(!('permission' in Notification)) {
        Notification.permission = permission;
      }

      // Si l'utilisateur est OK, on crée une notification
      if (permission === "granted") {
        var notification = new Notification("Notifications activées !");
      }
    });
  }

  // Comme ça, si l'utlisateur a refusé toute notification, et que vous respectez ce choix,
  // il n'y a pas besoin de l'ennuyer à nouveau.
}


// source: https://developer.mozilla.org/fr/docs/Web/API/notification
exports.spawnNotification = function (title,body,duration) {
  
  if (activeNotification == false) {
		  activeNotification = true;
		  var options = {body: body}
		  // var options = {body: activeNotification}
	 
		  var n = new Notification(title,options);
		  if (duration) {
		  	setTimeout(n.close.bind(n), duration);
		  	//setTimeout(closeNotification(n), duration+1);
		  }
	} else return
}

})(typeof exports === 'undefined'? this['notifications']={}: exports);