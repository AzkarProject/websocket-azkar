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


	// Gamepad
	exports.driveJauges = function (speedPos,speedNeg,axes,jaugeClass) {
		advanceValueBar.setAttribute("class", jaugeClass)
		advanceValueBar.value = speedPos;
	    reverseValueBar.setAttribute("class", jaugeClass)
	    reverseValueBar.value = speedNeg;
	    leftRightValueBar.innerHTML = 0 + ": " + axes.toFixed(4);
	    leftRightValueBar.setAttribute("class", jaugeClass)
	    leftRightValueBar.setAttribute("value", axes + 1);
	}


	// Gamepad
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


	// Gamepad
	exports.driveConnectNotice = function (message){
		$('#connect-notice').replaceWith(" <span id ='connect-notice'>"+message+"</span>");
	}






})(typeof exports === 'undefined'? this['ihm']={}: exports);