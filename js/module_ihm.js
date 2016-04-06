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

	
	console.log("module_ihm chargé");

	// Affichage par défaut. 
	$('#HudFullScreen').hide();


	
	// ----------- Méthodes jquery de saisie et d'affichage du tchat  ------------------------------

	// WebSocket-------------------------------
	// Lorsqu'on envoie le formulaire, on transmet le message et on l'affiche sur la page
	// Bloc de tchat principal des IHM Pilote et Robot
	$('#formulaire_chat_websoket').submit(function () {
	    var message = $('#message').val();
	    //var dateE = '[E-'+tools.dateNowInMs()+']';
	    //message = dateE + ' '+message;
	    socket.emit('message2', {objUser:localObjUser,message:message}); // envoi du lessage par WebSocket
	    ihm.insertWsMessage(localObjUser, message, 'local'); // On l'affiche ds le textArea local
	    $('#message').val('').focus(); // Vide la zone de Chat et remet le focus dessus
	    return false; // Permet de bloquer l'envoi "classique" du formulaire
	});



	// WebRTC ------------------------------------
	$('#formulaire_chat_webRTC').submit(function() {
	    var message = $('#send_chat_WebRTC').val() + '\n';
	    channel.send(msg); // envoi du message par webRTC
	    message.value = "";
	    $('#send_chat_WebRTC').val('').focus(); // Vide la zone de Chat et remet le focus dessus
	    return false; // Permet de bloquer l'envoi "classique" du formulaire
	});


	// websocket: Affiche message ds le tchat
	exports.insertWsMessage = function (objUser, message, origine) {
	   
	    console.log(objUser);
	    var text;
	    if (objUser){
	      
	      //text = '['+objUser.typeClient+'] '+ message;
	      if (origine == 'local' ) text = objUser.pseudo+': '+ message;
	      else text = 'Message from '+objUser.pseudo+': '+ message;
	   
	    } else {
	      text = message;
	    }
	    text += '\n';
	    $('#zone_chat_websocket').prepend(text);
	    
	}


	// formulaires de selection caméras
	exports.manageSubmitForm = function(cibleForm,status){
	    console.log("@ manageSubmitForm()");

	    var cssClass = "insideFlex oneQuarterbox devices ";
	    var cibleColor = " ";
	    var shadowColor = " shadowGreen"
	    var animation = " devicesInvite";
	    if (cibleForm == "robotDevices") cibleColor += "robot";
	    else if (cibleForm == "piloteDevices") cibleColor += "pilote";
	    
	    if (status == "deactivate") {
	        shadowColor = " shadowBlack"
	        animation = ""; 

	    } 
	    document.getElementById(cibleForm).className = cssClass+cibleColor+shadowColor+animation;
	}


	// Affichage de la jauge de batterie
	exports.refreshJaugeBattery = function (percentage){ 
		progressBar = document.getElementById('battery_level'); 
		if (progressBar && percentage) progressBar.value = parseFloat(Math.round(percentage)); 
	}




	// Activation/désactivation du bouton de fermeture de connexion
	exports.closeConnectionButton = function  (order,userID){
		console.log ("closeConnectionButton("+order+")");
		if (order == "activate") {
			var buttonClose1to1 = '<button class="shadowBlack txtRed" id="openCnx'+userID+'" onclick="usersConnection.closeCnxwith(\''+userID+'\')">Fermer la connexion</button>';
			document.getElementById('closeConnection').innerHTML = buttonClose1to1;
		} else if (order == "deactivate") {
			var buttonClose1to1 = '';
			document.getElementById('closeConnection').innerHTML = buttonClose1to1;
		}

	}


	// Gamepad - Affichage des jauges
	exports.driveJauges = function (speedPos,speedNeg,axes,jaugeClass) {
		advanceValueBar.setAttribute("class", jaugeClass)
		advanceValueBar.value = speedPos;
	    reverseValueBar.setAttribute("class", jaugeClass)
	    reverseValueBar.value = speedNeg;
	    leftRightValueBar.innerHTML = 0 + ": " + axes.toFixed(4);
	    leftRightValueBar.setAttribute("class", jaugeClass)
	    leftRightValueBar.setAttribute("value", axes + 1);
	}


	// Gamepad - Affichage du module
	exports.driveCommandBlock = function (order){
		if ( order == 'open' ) {
			activeGamePad = true;
			$('#step-commands').hide();
			$('#drive-commands').show();
		} else if ( order == 'close' ) {
			activeGamePad = false;
			$('#step-commands').show();
	   		$('#drive-commands').hide(); 
		}
	}


	// Gamepad - message de connexion
	exports.driveConnectNotice = function (message){
		$('#connect-notice').replaceWith(" <span id ='connect-notice'>"+message+"</span>");
	}


	// polyfill de l'API requestFullScreen >>> bloque sous Chrome
	// "Failed to execute 'requestFullScreen' on 'Element': API can only be initiated by a user gesture."
	exports.originalToggleFullScreen = function(){
	    console.log('@ toggleFullScreen()');
	    if(video2.requestFullScreen){
	        video2.requestFullScreen();
	    } else if(video2.webkitRequestFullScreen){
	        video2.webkitRequestFullScreen();
	    } else if(vid.mozRequestFullScreen){
	        video2.mozRequestFullScreen();
	    }
	}


	// FullScreen en full CSS
	// Remplace l'API requestFullScreen qui bloque sous Chrome
	// L'élément vidéo étant bizarrement inaccessible par sa classe ou son id css
	// on doit donc passer par une modif du style de l'élément
	remoteCameraView = "embed"; // Flag du mode d'affichage par défaut.
	exports.toggleFullScreen = function() {
		// alert ('toogleFullScreen');
		var style = null;
		if (remoteCameraView == 'full') {
            ihm.toggleModules('show');
            style = '';
			$('#1to1_remoteVideo').attr('style',style);
            remoteCameraView = "embed";
    	} else {
            ihm.toggleModules('hide');
            style = 'position:fixed;top:0;right:0;bottom:0;left:0;height:100%;width:100%;'
		 	$('#1to1_remoteVideo').attr('style',style);
            

            remoteCameraView = "full";
	    } 
	}



    // On cache certains blocs pour éviter la superposition. 
	// parce que modifier le z-index de la vidéo fullScreen ne fonctionne pas
	exports.toggleModules = function(value) {
		
		if (value == 'show') {
			$('#robotCommands').show();
	    	$('#robotInfos').show();
	    	$('#controlArea2').show();
			$('#settingsArea').show();
		} else if (value == 'hide') {
			$('#robotCommands').hide();
	    	$('#robotInfos').hide();
	    	$('#controlArea2').hide();
			$('#settingsArea').hide();

		}

	}


	// Deprecated..  Pas adapté au responsive design
	// Remplacé plus bas par ToggleHUD 
	exports.navigationView = function (horizontal,vertical){
		
		if (type == "pilote-appelant") {

			var style = 'position: fixed;';
			var navWidth = $('#NavigationArea').width();
	    	var navHeight = $('#NavigationArea').height();
	    	var hOffset = "left:0;", vOffset = "bottom:0;";
			var hPosition = 0;
			
			if (horizontal == "right") {
				hPosition = $(window).width() - navWidth;
			
			} else if (horizontal == "center") {
				var halfWidth = navWidth/2;
				var middle = $(window).width()/2
				hPosition = middle - halfWidth
			}
			hOffset = "left:"+hPosition+";";
			
			if (vertical == "top") vOffset = "top:0;"
			
			style += hOffset+vOffset;
			
			if (remoteCameraView == 'full') {
			 	$('#controlArea2').show();// On réouvre la section
			 	$('#websocketChat').hide(); // On cache la colonne gauche
			 	$('#NavigationArea').show(); // On réouvre la colonne centrale
			 	$('#WebRTC_Logs').hide(); // On cache la colonne de droite
			 	//style = 'position:fixed;top:0;right:0;bottom:0;left:0;'
		 		$('#NavigationArea').attr('style',style);

			 } else {
			 	$('#controlArea2').show();// On réouvre la section
			 	$('#websocketChat').show(); // On cache la colonne gauche
			 	$('#NavigationArea').show(); // On réouvre la colonne centrale
			 	$('#WebRTC_Logs').show(); // On cache la colonne de droite
			 	style = ''; // On vire les styles...
		 		$('#NavigationArea').attr('style',style);

			 }

		 }	
		 	

	}


	// On ne peux pas déplacer l'élément vidéo du DOM
    // Sinon celui-ci n'est plus lié au Stream et l'image se fige...
    // PAr contre, pour les autres elements, R.A.S
	exports.toggleHUD = function() {
		// alert ('toogleFullScreen');
		var style = null;
		if (remoteCameraView == 'embed') {
			// On déplace les éléments du HUD dans les conteneurs d'origine
			$('#robotCommands').append($('#step-commands')) 
			$('#robotCommands').append($('#drive-commands'))
			//$('#robotCommands').append($('#drive-commands'))
			$('#robotInfos').append($('#batteryJauge'))
			$('#NavigationArea').append($('#embededNav'))

			$( "#step-commands" ).removeClass( "HudClass floatRight HudModControls" );
			$( "#drive-commands" ).removeClass( "HudClass floatRight HudModControls" );
			$( "#batteryJauge" ).removeClass( "HudClass" );
			$( "#navButtons" ).removeClass( "HudClass" );
			$( "#embededNav" ).removeClass( "HudClass" );

			$('#HudFullScreen').hide();

    	} else {

			$('#HUD_left').append($('#embededNav'))
			$('#HUD_left').append($('#batteryJauge'))
			$('#HUD_right').append($('#step-commands'))
			$('#HUD_right').append($('#drive-commands'))

			$( "#HUD_left" ).addClass( "HudClass" );
			$( "#HUD_right" ).addClass( "HudClass" );

			$( "#embededNav" ).addClass( "HudClass" );
			$( "#batteryJauge" ).addClass( "HudClass" );

			$( "#step-commands" ).addClass( "HudClass HudModControls floatRight" );
			$( "#drive-commands" ).addClass( "HudClass HudModControls floatRight" );

			$('#HudFullScreen').show();

	    } 
	}


	// Ecouteur Full Screen d'évènement clavier (touche tab)
	document.addEventListener("keydown", function(e) {
	  // console.log(e);
	  if (e.keyCode == 9) {
	    ihm.toggleFullScreen();
	    ihm.toggleHUD();
	  } 
	}, false);

	



 

})(typeof exports === 'undefined'? this['ihm']={}: exports);