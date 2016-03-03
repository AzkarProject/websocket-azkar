// Cool Notifications 
// source: http://red-team-design.com/cool-notification-messages-with-css3-jquery/

// define the messages types	
var myMessages = ['info','warning','error','success']; 	 

function hideAllMessages()
{
		 // this array will store height for each
		 var messagesHeights = new Array(); 
	 
		 for (i=0; i<myMessages.length; i++)
		 {
				  messagesHeights[i] = $('.' + myMessages[i]).outerHeight();
				  //move element outside viewport
				  $('.' + myMessages[i]).css('top', -messagesHeights[i]); 	  
		 }
}

$(document).ready(function(){
		 
		 // Initially, hide them all
		 hideAllMessages();

		 // When message is clicked, hide it
		 $('.message').click(function(){			  
				  $(this).animate({top: -$(this).outerHeight()}, 500);
		  });		 
		 
});       





// author titi:
// Variable globale de notification en cours
// pour éviter les doubles affichages...
activeNotification = false;
IS_Notify = false;

// Setter sous forme de fonction
// pour être apellé dans un setimeout
function set_IS_Notify (value) {
	// alert (IS_Notify);
	IS_Notify = value;
}

// author Titi: 
// Le parametre duration permet de temporiser
// La fermeture du message.
// 4 types possibles: 'info','warning','error','success'
function writeMessage (type,title,body,duration,notification){
	
	// Pour éviter les notifications en cascade...
	//if (IS_Notify == true) return;

	//IS_Notify = true;

	titleMessage = '<h3>'+title+'</h3>';
	var textMessage = titleMessage+'<p>'+body+'</p>';
	$('.'+type).html(textMessage);
	hideAllMessages();				  
	$('.'+type).animate({top:"0"}, 500);
	
	
	if (duration) {
		//setTimeout (set_IS_Notify(false),duration+500)
		setTimeout(function(){
         $('.'+type).animate({top: -$('.'+type).outerHeight()}, 500);
    	},duration);	
	} else IS_Notify = false;

	// Et une notification de type desktop....
	if (notification) spawnNotification(title,body,duration)

}


//-----Notifications Desktop -------------------------------------------------------------------------
// source: https://developer.mozilla.org/fr/docs/Web/API/notification

function notifyMe() {
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
function spawnNotification(title,body,duration) {
  
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

/**/