(function(exports){

	
	// websocket: Affiche message ds le tchat
	exports.insertWsMessage = function (objUser, message) {
	    
	    var text;
	    if (objUser){
	      text = '['+objUser.typeClient+'] '+ message;
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
			var buttonClose1to1 = '<button class="shadowBlack txtRed" id="openCnx'+userID+'" onclick="closeCnxwith(\''+userID+'\')">Fermer la connexion</button>';
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


	// z-index de la vidéo fullScreen ne fonctionne pas
	// >>> On cache cerrttains blocs pour éviter la superposition. 
	exports.toggleModules = function(value) {
		
		/*// Version jQuery (pompre pas mal de ressources...)
		$('#robotCommands').fadeToggle();
    	$('#robotInfos').fadeToggle();
    	$('#controlArea2').fadeToggle();
		$('#settingsArea').fadeToggle();
		/***/

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




	// Cartographie en FullScreen...
	exports.navigationView = function (horizontal,vertical){
		
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
		 /**/	

	}

	



	// Ecouteur d'évènement clavier (touche tab)
	document.addEventListener("keydown", function(e) {
	  console.log(e);
	  if (e.keyCode == 9) {
	    ihm.toggleFullScreen();
	    // ihm.originalToggleFullScreen() 
	  } 
	}, false);

	



 

})(typeof exports === 'undefined'? this['ihm']={}: exports);