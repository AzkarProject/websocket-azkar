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

		 // When message is clicked, hide it
		 $('.message').click(function(){			  
				  $(this).animate({top: -$(this).outerHeight()}, 500);
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