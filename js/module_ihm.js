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
	   
	    //console.log(objUser);
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

	    if (ihmVersion == "V1") document.getElementById(cibleForm).className = cssClass+cibleColor+shadowColor+animation;
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
			// IHM V2: ajout class groupDefCam
			var buttonClose1to1 = '<button class="shadowBlack txtRed groupDefCam" id="openCnx'+userID+'" onclick="usersConnection.closeCnxwith(\''+userID+'\')">CLOSE</button>';
			document.getElementById('closeConnection').innerHTML = buttonClose1to1;
		} else if (order == "deactivate") {
			var buttonClose1to1 = '';
			document.getElementById('closeConnection').innerHTML = buttonClose1to1;
			// ADD IHM V2
			// Remise a zero des boutons camDef
		    var groupButton = ['144p','QVGA','VGA','SVGA','HD'];
			ihm.manageGroupButtons(null,null,groupButton);
		}

	}


	
	// Gamepad - Affichage du module Gamepad (jauges par défaut)
	exports.driveCommandBlock = function (order){
		if ( order == 'open' ) {
			activeGamePad = true;
			$('#step-commands').hide(); // Kom-remote
			$('#drive-commands').show(); // Drive Standard
			//$('#canvasGamepad').hide(); // Drive gauche full directionnel
		} else if ( order == 'close' ) {
			activeGamePad = false;
			$('#step-commands').show(); // Kom-remote
	   		$('#drive-commands').hide(); // Drive Standard
	   		//$('#canvasGamepad').hide(); // Drive gauche full directionnel
		}
	}


	// Gamepad - Dessin des jauges
	exports.driveJauges = function (speedPos,speedNeg,axes,jaugeClass) {
		advanceValueBar.setAttribute("class", jaugeClass)
		advanceValueBar.value = speedPos;
	    reverseValueBar.setAttribute("class", jaugeClass)
	    reverseValueBar.value = speedNeg;
	    leftRightValueBar.innerHTML = 0 + ": " + axes.toFixed(4);
	    leftRightValueBar.setAttribute("class", jaugeClass)
	    leftRightValueBar.setAttribute("value", axes + 1);
	}


	// Gamepad - Dessin du joystick
	exports.drawJoystick = function( posX, posY ) {


		var canvas = document.getElementById("canvasGamepad"); 
		var context = canvas.getContext('2d');
    	var canvasWidth = $('#canvasGamepad').width();
    	var canvasHeight = $('#canvasGamepad').height();

    	var diametre = canvasHeight*0.4;
    	if (canvasWidth > canvasHeight) diametre = canvasHeight*0.4;
    	else if (canvasWidth < canvasHeight) diametre = canvasWidth*0.4;

		context.save();
		context.clearRect(0, 0, canvasWidth, canvasHeight);

		// Cercle orange
		context.beginPath();
		context.fillStyle="#FF4422"
		//context.arc(150, 75, 60, 0, 2 * Math.PI);
		context.arc(canvasWidth/2, canvasHeight/2, diametre, 0, 2 * Math.PI);
		context.fill();
		    
		/*
		context.beginPath();
		context.fillStyle="#000"
		context.arc(150, 30, 30, 0, 2 * Math.PI); // p2 à 30 = oeil butée bas
		context.fill();

		context.beginPath();
		context.arc(150, 75, 30, 0, 2 * Math.PI); // p2 à 75 = oeil milieu
		context.fill();

		context.beginPath();			  
		context.arc(150, 120, 30, 0, 2 * Math.PI); // p2 à 120 = oeil butée bas
		context.fill();
				  
		// Values verticales  20 /75 = Marche avant > 45
		// Values verticales  72/120 = marche arrière > 45

		context.beginPath();			  
		context.arc(105, 75, 30, 0, 2 * Math.PI); // p2 à 30 = oeil droit
		context.fill();

		context.beginPath();			  
		context.arc(150, 75, 30, 0, 2 * Math.PI); // p2 à 75 = oeil milieu
		context.fill();

		context.beginPath();			  
		context.arc(195, 75, 30, 0, 2 * Math.PI); // p2 à 120 = oeil gauchs
		context.fill();
		/**/

		var x = canvasWidth/2,  y = canvasHeight/2;
		//var ratio = 1/45;
		var ratio = diametre*0.75
		var ratioX = ratio*posX; x = x+ratioX;
		var ratioY = ratio*posY; y = y+ratioY;
		//console.log ("(horizontal)posX: "+posX)
		//console.log ("(horizontal)>>>>: "+ratioX)

		context.beginPath();
		context.fillStyle="#fff"
		context.arc(x, y, diametre/2, 0, 2 * Math.PI);
		context.fill();

		context.restore();

		/* 
		function assignToDiv(){ // this kind of function you are looking for
		  dataUrl = canvas.toDataURL();
		  document.getElementById('gamePadInfos').style.background='url('+dataUrl+')'
		  //alert('cool')
		}

		assignToDiv()
		
		/**/
		
	}


	exports.directionnalArrow = function (posX,posY) {

		var canvas = document.getElementById("canvasGamepad"); 
		var context = canvas.getContext('2d');
		var canvasWidth = $('#canvasGamepad').width();
    	var canvasHeight = $('#canvasGamepad').height();
	    
	    var diametre = canvasHeight*0.4;
    	if (canvasWidth > canvasHeight) diametre = canvasHeight*0.4;
    	else if (canvasWidth < canvasHeight) diametre = canvasWidth*0.4;
		var x = canvasWidth/2,  y = canvasHeight/2;
		var ratio = diametre
		var ratioX = ratio*posX; 
		x = x+ratioX;
		//if (posY > 0) x = x-ratioX 
		//else x = x+ratioX;
		var ratioY = ratio*posY; y = y+ratioY;

	    var diametre = canvasHeight*0.4;
    	if (canvasWidth > canvasHeight) diametre = canvasHeight*0.4;
    	else if (canvasWidth < canvasHeight) diametre = canvasWidth*0.4;

	    context.save();
	    context.clearRect(0, 0, canvasWidth, canvasHeight);


	    // Cercle orange
	    context.beginPath();
		//context.fillStyle="#FF4422"
		context.fillStyle ="rgba(255, 255, 255, 0.5)";
		context.arc(canvasWidth/2, canvasHeight/2, diametre, 0, 2 * Math.PI);
		context.fill();

	    /*
	    var p1 = [canvasWidth/2, canvasHeight/2];
		var p2 = [Math.round(x), Math.round(y)]; 
		console.log (Math.round(x) + " " +Math.round(y)) 
		/**/

	    var fromX = canvasWidth/2; 
	    var fromY = canvasHeight/2; 
	    var toX = Math.round(x); 
	    var toY = Math.round(y);
	    //console.log (">>> "+posY) 
	    //console.log (toX + " " +toY) 



	    if (toX != fromX || toY != fromY ) {
		
			var lineWidth = 2; 
	    	var strokeLine = '#0000ff';
	    	var fillArrow = '#0000ff';
	    	var strokeArrow = '#ff0000';
	    	var sizeArrow = 10;



			drawArrow (context, fromX, fromY, toX, toY, lineWidth, strokeLine, fillArrow, strokeArrow, sizeArrow);
		}

	    context.restore();

	}


	// inspiré de https://www.snip2code.com/Snippet/265248/HTML5-Canvas--drawing-an-arrow-at-the-en
	function drawArrow (context, fromX, fromY, toX, toY, lineWidth, strokeLine, fillArrow, strokeArrow, sizeArrow) {

		var ctx = context;
		
		var p1 = [fromX, fromY];
	    var p2 = [toX,  toY]; 

		var dist = Math.sqrt((p2[0] - p1[0]) * (p2[0] - p1[0]) + (p2[1] - p1[1]) * (p2[1] - p1[1]));
	    
	    ctx.save();

	    ctx.beginPath();
	    ctx.lineWidth = lineWidth; //2
	    ctx.strokeStyle = strokeLine; // '#0000ff';
	    ctx.moveTo(p1[0], p1[1]);
	    ctx.lineTo(p2[0], p2[1]);
	    ctx.stroke();

	    var angle = Math.acos((p2[1] - p1[1]) / dist);

	    if (p2[0] < p1[0]) angle = 2 * Math.PI - angle;

	    var size = sizeArrow; // 15;

	    ctx.beginPath();
	    ctx.translate(p2[0], p2[1]);
	    ctx.rotate(-angle);
	    ctx.fillStyle = fillArrow; //'#0000ff';
	    ctx.lineWidth = lineWidth; // 2
	    ctx.strokeStyle = strokeArrow; // '#ff0000';
	    ctx.moveTo(0, -size);
	    ctx.lineTo(-size, -size);
	    ctx.lineTo(0, 0);
	    ctx.lineTo(size, -size);
	    ctx.lineTo(0, -size);
	    ctx.closePath();
	    ctx.fill();
	    ctx.stroke();

	    ctx.restore();


	}


	//function drawLine (ctx, fromX, fromY, toX, toY) {
	exports.drawLine = function (ctx, fromX, fromY, toX, toY, color) {

		// console.log ("@ drawLine() ")
		
		ctx.save();
		ctx.beginPath();
		ctx.strokeStyle = color;
 		ctx.moveTo(fromX,fromY);
 		ctx.lineTo(toX,toY);
 		ctx.stroke();
 		ctx.restore(); 

	}

	
	// Affichage du statut de trajectoire.
	exports.displayTrajectoryStatus = function (textStatus) {
        $('#robotStatusMessage').replaceWith(" <span id='robotStatusMessage'>"+textStatus+"</span>");

    }
	




	// Gamepad - Affichage du module FullAxes (param 'jauges' ou 'joystick' ou 'none')
	exports.switchGamepadDisplayMode = function (type) {
		
		//alert ("switchGamepadDisplayMode("+type+")")
		
		if ( type == 'jauges' ) {
			$('#gamepadDefault').hide();
			$('#fullAxesInfos').hide();
			$('#gamePadInfos').show();
			$('#cameraInfos').hide();
		
		} else if ( type == 'joystick' ) {
			$('#gamepadDefault').hide();
			$('#fullAxesInfos').show();
	   		$('#gamePadInfos').hide();
	   		$('#cameraInfos').hide(); 
		
		}  else if ( type == 'camera' ) { 
			$('#gamepadDefault').hide();
			$('#fullAxesInfos').hide();
	   		$('#gamePadInfos').hide();
	   		$('#cameraInfos').show();	
		
		} else {
			$('#gamepadDefault').show();
			$('#fullAxesInfos').hide();
	   		$('#gamePadInfos').hide();
	   		$('#cameraInfos').hide();	
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

	// Deprecated pour IHM V2 /: Todo a modifier
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
            // if (xboxGamepad == false) ihm.driveCommandBlock('close');
	    } 
	}


	// Deprecated pour IHM V2
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


	// Deprecated pour IHM V2
	// On ne peux pas déplacer l'élément vidéo du DOM
    // Sinon celui-ci n'est plus lié au Stream et l'image se fige...
    // Par contre, pour les autres elements, R.A.S
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



	// Admin et Accueil
	// Bandeau supérieur
	// Pour le logo
    azkarLogo = '<div style="float:left; margin-right:20px;"><a href="/">';
	azkarLogo += '<img src="/images/logo/AZKAR-v2.png" alt="AZKAR PROJECT" title="Projet Azkar"  width="150px;" height="54px"/>';
	azkarLogo += '</a></div>';
	exports.getHeaderPage = function(login) {


      // On récupère depuis nodejs le nom de la machine serveur
      // en passant par de l'AJAX plutôt que par websocket....
      $.get( "/getvar", function( data ) {
        hostName = data.hostName;

        appName = appSettings.appName();
        appBranch = appSettings.appBranch();
        appVersion = appSettings.appVersion();
        appCredit= appSettings.appCredit()

        if (typeof appDevBranch != 'undefined') appDevBranch.setBranch();
		//infoServerTxt= "<info id='zone_info_server'>";
        infoServerTxt = "<i>"+appName;
        infoServerTxt += " Version " + appVersion;
        infoServerTxt += " (Branche "+appBranch+" / ";
        infoServerTxt += " Serveur: "+hostName+")";
        infoServerTxt += " </i><br/> " + appCredit;
        if(login) {
        	infoServerTxt += "<br/>   Bienvenue '" + login+"'";
        } else {
        	infoServerTxt += "<br/>   Bienvenue visiteur";
        }

        var img = '<div style="float:left; margin-right:20px"><a href="/"><img src="/images/logo/AZKAR.png" alt="AZKAR PROJECT" title="Projet Azkar"  width="150px;" height="54px"/></a></div>';
		//var img = '<div style="float:left; margin-right:20px"><img src="/images/logo/AZKAR.png" alt="AZKAR PROJECT" title="Projet Azkar"  width="150px;" height="54px"/></div>';

        if (hostName != "???" ) {
        	$('#zone_info_server').replaceWith('<div id="zone_info_server" style="min-width:1000px;min-height:54px">'+azkarLogo+'<p style="font-family: time new roman;">'+infoServerTxt+'</p></div>');
        }
      });

	}

	// Pour l'interface d'admin
	exports.displayListUsers = function(listUsers) {
		// alert (listUsers)
		var html = ""

		var ejectRobot =  '<span id="ejectRobot"><button class="shadowBlack" id="admin_RazRobot" onclick="ejectRobot()">Ejection</button> </span>';
        var ejectPilot =  '<span id="ejectPilot"> <button class="shadowBlack" id="index_RazPilote" onclick="ejectPilot()"> Ejection</button> </span>';
   		var reloadRobot =  '<span id="reloadRobot"><button class="shadowBlack" id="index_ReloadRobot" onclick="reloadRobot()">Reload</button></span>';
        var reloadPilot =  '<span id="reloadPilot"><button class="shadowBlack" id="index_ReloadPilot" onclick="reloadPilot()">Reload</button></span>';

		if (listUsers) {
			
			html = ""
			for (user in listUsers ) {
				var connectionDate = tools.getHumanDate(listUsers[user].connectionDate);
				var typeIHM = listUsers[user].typeClient;
				var pseudoClient = listUsers[user].pseudo;
				html += "IHM: "+typeIHM+ " >>> Login: '"+pseudoClient+"'' | Connexion: "+connectionDate;
				if (typeIHM == "Robot") html += " | "+reloadRobot+" | "+ejectRobot;
				if (typeIHM == "Pilote") html += " | "+reloadPilot+" | "+ejectPilot;
				html += "</br>";
			}
			if (html == "") html = "Aucun";
		} else {
			html = "Aucun"
		}
		//console.log(html)
		html = '<div id="zone_info_users">'+html+'</div>';
		$('#zone_info_users').replaceWith(html);

	}

	// Pour l'interface d'admin
	exports.displayFormIp = function(typeIp,listIp,defaultIp) {
		
		console.log('@ ihm.displayFormIp()');

		//message = '<span id="zone_info_'+typeIp+'>';
		message = ' = IP '+typeIp+' : '
		if (defaultIp) {
			message += defaultIp.url+"  ( "+defaultIp.Label+" )";
		} else { 
			message += "No "+typeIp;
		}
		message +='</span>';
		html = "";

		if (listIp) {
			for (ip in listIp) {
				
				var ipValue = listIp[ip].url;
				var ipLabel = listIp[ip].Label;
				var ipDesciption = "";
				if (listIp[ip].description) ipDesciption = listIp[ip].description;
				var checked = "";
				

				// Si l'IP correspond à l'IP par défaut
				if (defaultIp.Label === ipLabel && defaultIp.url === ipValue) checked = "checked";
				
				var idForm = 'select'+ipLabel;
				
				html += 'Activer <input type="radio" name="setIP_'+typeIp+'" value="'+ipValue+'"'+checked;
				html += ' id="'+idForm+'" onclick="setIp_'+typeIp+'(\''+ipLabel+'\')"> <label for="'+ipLabel+'">';
				html += '</label>';
				

				html += "   <input type='text' id='editLabel_"+typeIp+"' disabled value='"+ipLabel+"''>";
				html += "   <input type='text' id='editIP_"+typeIp+"' disabled value='"+ipValue+"''>";
				html +=  '  <span ><button id="deleteIP_'+typeIp+'" onclick="deleteIp_'+typeIp+'(\''+ipLabel+'\')">Supprimer</button></span>';
				html += '<br/>';
			}
			html += '<br/>';
		} else {
		}
		//console.log(html)
		message = '<span id="zone_info_'+typeIp+'">'+message+'</span>';
		$('#zone_info_'+typeIp).replaceWith(message);
		html = '<div id="zone_info_Ip_'+typeIp+'">'+html+'</div>';
		$('#zone_info_Ip_'+typeIp).replaceWith(html);

	}



	// Gestion d'un groupe de boutons
	// IndexSelect pour rétrocompatibilité avec la commande cycleSelect du Gamepad
	// function manageGroupButtons (camDef,indexSelect,group) {
	exports.manageGroupButtons = function(camDef,indexSelect,group) {

	    // On vire les classes selected de tous les boutons
	    for (var i= 0; i < group.length; i++){
	        $( '#'+group[i] ).removeClass( "buttonSelected" );
	    }


	    if (camDef != null ) {
	        // On met une classe selected au bouton 
	        $('#'+camDef).addClass( "buttonSelected" );

	    } else if  (indexSelect != null ){
			$('#'+group[indexSelect] ).addClass( "buttonSelected" );
	    }

	}


	// IHM V2
	// Flags d'état pour l'affichage des modules.
	moduleSetDisplay = false; $('#switchdisplaySettings').addClass('txtRed');
	moduleSettings = false; $('#switchsettings').addClass('txtRed');
	moduleMap = true; $('#switchmap').addClass('buttonSelected');
	moduleDrive = true; $('#switchdrive').addClass('buttonSelected');
	moduleNav = true; $('#switchnav').addClass('buttonSelected');
	moduleConnexion = true; $('#switchconnexion').addClass('buttonSelected');
	moduleTchat = false; $('#switchtchat').addClass('txtRed');

	// IHM V2
	// Comportement Barre de settings
	exports.setDisplay = function (idElement, openClose) {
	   

	   	if (idElement == 'displaySettings') {
	   		
	   		// console.log(" ********************************************* ");
	   		// console.log(moduleSetDisplay);
	   		// console.log(openClose);
	   		
	   		if (moduleSetDisplay == false ) {
	   			moduleSetDisplay = true;
	   			openClose = 'open';
	   			$('#switch'+idElement).removeClass('txtRed');
	   			$('#switch'+idElement).addClass('buttonSelected');
	   		


	   		} else if (moduleSetDisplay == true){
	   			moduleSetDisplay = false;
	   			openClose = 'close';
	   			$('#switch'+idElement).removeClass('buttonSelected');
	   			$('#switch'+idElement).addClass('txtRed');

	   		}
	   } 



	   if (idElement == 'settings') {
	   		
	   		if (openClose == 'open' ) {
	   			moduleSettings = true;
	   			$('#switch'+idElement).removeClass('txtRed');
	   			$('#switch'+idElement).addClass('buttonSelected');
	   		


	   		} else if (openClose == 'close' ){
	   			moduleSettings = false;
	   			$('#switch'+idElement).removeClass('buttonSelected');
	   			$('#switch'+idElement).addClass('txtRed');

	   		}
	   } 


	   	if (idElement == 'map') {
	   		
	   		if (moduleMap == false ) {
	   			moduleMap = true;
	   			openClose = 'open';
	   			$('#switch'+idElement).removeClass('txtRed');
	   			$('#switch'+idElement).addClass('buttonSelected');
	   		


	   		} else if (moduleMap == true){
	   			moduleMap = false;
	   			openClose = 'close';
	   			$('#switch'+idElement).removeClass('buttonSelected');
	   			$('#switch'+idElement).addClass('txtRed');

	   		}
	   } 


	   if (idElement == 'drive') {
	   		
	   		if (moduleDrive == false ) {
	   			moduleDrive = true;
	   			openClose = 'open';
	   			$('#switch'+idElement).removeClass('txtRed');
	   			$('#switch'+idElement).addClass('buttonSelected');
	   		


	   		} else if (moduleDrive == true){
	   			moduleDrive = false;
	   			openClose = 'close';
	   			$('#switch'+idElement).removeClass('buttonSelected');
	   			$('#switch'+idElement).addClass('txtRed');

	   		}
	   } 

	   if (idElement == 'nav') {
	   		
	   		if (moduleNav == false ) {
	   			moduleNav = true;
	   			openClose = 'open';
	   			$('#switch'+idElement).removeClass('txtRed');
	   			$('#switch'+idElement).addClass('buttonSelected');
	   		


	   		} else if (moduleNav == true){
	   			moduleNav = false;
	   			openClose = 'close';
	   			$('#switch'+idElement).removeClass('buttonSelected');
	   			$('#switch'+idElement).addClass('txtRed');

	   		}
	   } 


	   if (idElement == 'connexion') {
	   		
	   		if (moduleConnexion == false ) {
	   			moduleConnexion = true;
	   			openClose = 'open';
	   			$('#switch'+idElement).removeClass('txtRed');
	   			$('#switch'+idElement).addClass('buttonSelected');
	   		


	   		} else if (moduleConnexion == true){
	   			moduleConnexion = false;
	   			openClose = 'close';
	   			$('#switch'+idElement).removeClass('buttonSelected');
	   			$('#switch'+idElement).addClass('txtRed');

	   		}
	   } 


	   	if (idElement == 'tchat') {
	   		
	   		if (moduleTchat == false ) {
	   			moduleTchat = true;
	   			openClose = 'open';
	   			$('#switch'+idElement).removeClass('txtRed');
	   			$('#switch'+idElement).addClass('buttonSelected');
	   		


	   		} else if (moduleTchat == true){
	   			moduleTchat = false;
	   			openClose = 'close';
	   			$('#switch'+idElement).removeClass('buttonSelected');
	   			$('#switch'+idElement).addClass('txtRed');

	   		}
	   } 



	   if (openClose == 'open') {
	   		$('#'+idElement).show();
	   		 // alert (idElement +'>>>'+ openClose)
	   	}
	   else if (openClose == 'close') {
	   	 	$('#'+idElement).hide();
	   	 	// alert (idElement +'>>>'+ openClose)
	   }                      
	

	    if (openClose == 'reset') {
	    	resetDisplay();
	    }



	}

	// IHM V2
	// RAZ de l'affichage
	function resetDisplay () {
		
	
		$('#nav-GotoPoi').hide();
		$('#nav-Relocalize').hide();
		$('#nav-ListPoi').hide();
		$('#nav-RobotStatus').show();

		// ihm.setDisplay('openListPoi','close')


		// Flags d'état pour l'affichage des modules.
		moduleSetDisplay = false; $('#displaySettings').hide();$('#switchdisplaySettings').addClass('txtRed');$('#switchdisplaySettings').removeClass('buttonSelected');
		moduleSettings = false; $('#switchsettings').addClass('txtRed');$('#switchsettings').removeClass('buttonSelected');$('#settings').hide();
		moduleMap = true; $('#switchmap').addClass('buttonSelected');$('#switchmap').addClass('buttonSelected');$('#map').show();
		moduleDrive = true; $('#switchdrive').addClass('buttonSelected');$('#switchdrive').addClass('buttonSelected');$('#drive').show();
		moduleNav = true; $('#switchnav').addClass('buttonSelected');$('#switchnav').addClass('buttonSelected');$('#nav').show();
		moduleConnexion = true; $('#switchconnexion').addClass('buttonSelected');$('#switchconnexion').addClass('buttonSelected');$('#connexion').show();
		moduleTchat = false; $('#switchtchat').addClass('txtRed');$('#switchtchat').removeClass('buttonSelected');$('#tchat').hide();


		// Regles CSS par défaut chaqu'un des modules
		var divModule = null;
		//<div id="remoteCam" class='draggable resizable' 
   		//style="position:absolute;top:0px; left:0px;float:left;width:1230px; height:375px;border:1px solid #ccc;border-radius: 10px;margin: 5px 5px 10px 5px">
   		divModule = '#remoteCam';
		$(divModule).css('position', 'absolute');
		$(divModule).css('top', '0px');
		$(divModule).css('left', '0px');
		$(divModule).css('width', '1230px');
		$(divModule).css('height', '375px');
		//$(divModule).css('border', '1px solid #ccc');
		//$(divModule).css('border-radius', '10px');
		$(divModule).css('margin', '5px 5px 10px 5px');
		$(divModule).css('background', 'rgba(221,221,221,0.1)');

		// <div id="localCam" class='draggable' 
		// style="position:absolute;top:150px; left:100px;float:left;z-index:100;height:160px;width:160px; border:1px solid #ccc;border-radius: 10px;margin: 0">
		// style="position:absolute;top:200px; left:20px;float:left;z-index:100;height:100px;width:100px; border:1px solid #ccc;border-radius: 10px;margin: 0">
		divModule = '#localCam';
		$(divModule).css('position', 'absolute');
		$(divModule).css('top', '200px');
		$(divModule).css('left', '20px');
		$(divModule).css('float', 'left');
		$(divModule).css('z-index', '100');
		$(divModule).css('height', '100px');
		$(divModule).css('width', '100px');
		//$(divModule).css('border', '1 px solid #ccc');
		//$(divModule).css('border-radius', '10 px');
		$(divModule).css('margin', '0');
		$(divModule).css('background', 'rgba(221,221,221,0.1)');

		//<div id="map" class='draggable' 
		//style="position:absolute;top:390px; left:0px;color:white;float:left; width:495px;height:230px;border:1px solid #ccc; border-radius: 10px;margin:0 0 0 5px;padding:5px;overflow:hidden;background:rgba(221,221,221,0.1);">	
		divModule = '#map';
		$(divModule).css('position', 'absolute');
		$(divModule).css('top', '390px');
		$(divModule).css('left', '5px');
		$(divModule).css('float', 'left');
		$(divModule).css('color', 'white');
		$(divModule).css('height', '230px');
		$(divModule).css('width', '495px');
		//$(divModule).css('border', '1 px solid #ccc');
		//$(divModule).css('border-radius', '10 px');
		$(divModule).css('margin', '0 0 0');
		$(divModule).css('background', 'rgba(221,221,221,0.1)');


		divModule = '#drive';
		$(divModule).css('position', 'absolute');
		$(divModule).css('top', '390px');
		$(divModule).css('left', '510px');
		$(divModule).css('float', 'left');
		$(divModule).css('color', 'white');
		$(divModule).css('z-index', '100');
		$(divModule).css('height', '230px');
		$(divModule).css('width', '230px');
		$(divModule).css('background-color', 'black');
		//$(divModule).css('border', '1 px solid #ccc');
		//$(divModule).css('border-radius', '10 px');
		$(divModule).css('margin', '0 0 0 5px');
		$(divModule).css('padding', '5px');
		$(divModule).css('overflow', 'hidden');
		$(divModule).css('background', 'rgba(221,221,221,0.1)');
		/**/

		divModule = '#nav';
		$(divModule).css('position', 'absolute');
		$(divModule).css('top', '390px');
		$(divModule).css('left', '755px');
		$(divModule).css('float', 'left');
		$(divModule).css('width', '335px');
		$(divModule).css('height', '230px');
		$(divModule).css('background-color', 'black');
		$(divModule).css('color', 'white');
		//$(divModule).css('border', '1 px solid #ccc');
		//$(divModule).css('border-radius', '10 px');		
		$(divModule).css('margin', '0 0 0 5px');
		$(divModule).css('padding', '5px');
		$(divModule).css('overflow', 'hidden');
		$(divModule).css('background', 'rgba(221,221,221,0.1)');


		divModule = '#connexion';
		$(divModule).css('position', 'absolute');
		$(divModule).css('top', '390px');
		$(divModule).css('left', '1110px');
		$(divModule).css('float', 'left');
		$(divModule).css('z-index', '125');
		$(divModule).css('width', '110px');
		$(divModule).css('height', '230px');
		$(divModule).css('background-color', 'black');
		$(divModule).css('color', 'white');
		//$(divModule).css('border', '1 px solid #ccc');
		//$(divModule).css('border-radius', '10 px');		
		$(divModule).css('margin', '0 0 0 5px');
		$(divModule).css('padding', '5px');
		$(divModule).css('overflow', 'hidden');
		$(divModule).css('background', 'rgba(221,221,221,0.1)');


		divModule = '#appSettings';
		$(divModule).css('position', 'absolute');
		$(divModule).css('top', '100px');
		$(divModule).css('left', '10px');
		$(divModule).css('float', 'left');
		$(divModule).css('width', '100px');
		//$(divModule).css('border', '1 px solid #ccc');
		//$(divModule).css('border-radius', '10 px');		
		$(divModule).css('margin', '10px 5px 5px 5px');
		$(divModule).css('padding', '5px');
		$(divModule).css('overflow', 'hidden');
		$(divModule).css('background', 'rgba(221,221,221,0.1)');


		/*<div id="displaySettings" class="draggable"
			style="
			position:absolute;
			top:100px;
			left:130px;
			float:left;
			border: 1px solid #ccc; 
			border-radius: 10px;
			margin:10px 5px 5px 5px;
			padding:5px;
			 background:rgba(221,221,221,0.1);
			z-index:999999">
		/**/
		divModule = '#displaySettings';
		$(divModule).css('position', 'absolute');
		$(divModule).css('top', '100px');
		$(divModule).css('left', '130px');
		$(divModule).css('float', 'left');
		//$(divModule).css('border', '1 px solid #ccc');
		//$(divModule).css('border-radius', '10 px');		
		$(divModule).css('margin', '10px 5px 5px 5px');
		$(divModule).css('padding', '5px');
		$(divModule).css('background', 'rgba(221,221,221,0.1)');
		$(divModule).css('z-index', '999999');


	}
	/**/







	// Au chargement de la paddingge on fait un resetDisplay
	if (type == "pilote-appelant") resetDisplay()

	// Gestion evenements clavier


	// Ecouteur  d'évènements clavier (touche tab)
	document.addEventListener("keydown", function(e) {
	  
		// linearSpeed = data.robotInfo.Differential.CurrentLinearSpeed;
        // angularSpeed = data.robotInfo.Differential.CurrentAngularSpeed;

        // console.log(angularSpeed)

		var flagSendToRobot = true;
	   	var key = e.keyCode || e.which;
	   	var keyboardASpeed = 0;
	    var keyboardLSpeed = 0;
		    
	    switch (key) {
	    	//console.log(key)
		    case 9: // (tab)
		    	ihm.toggleFullScreen();
		    	flagSendToRobot = false;
		    	break;
		    
		    /*
		    case 37: //(flèche left)
		    	//keyboardASpeed = -0.05;
   				keyboardASpeed =  -0.2 - angularSpeed /2
   				keyboardLSpeed = linearSpeed;
   				
		        break;
		    case 39: //(flèche right)
		        keyboardASpeed = 0.2 - angularSpeed / 2
   				keyboardLSpeed = linearSpeed
		        break;
		    case 38: //(flèche up)
		        keyboardASpeed =angularSpeed
   				keyboardLSpeed = -0.2 - linearSpeed / 2
		        break;
		    case 40: //(flèche down)
		        keyboardASpeed = angularSpeed
   				keyboardLSpeed = 0.2 - linearSpeed / 2
		        break;
		    /**/    


		    /*
		    case 37: //(flèche left)
		    	//keyboardASpeed = -0.05;
   				keyboardASpeed =  -0.3 - keyboardASpeed
   				keyboardLSpeed = 0
   				
		        break;
		    case 39: //(flèche right)
		        keyboardASpeed = 0.2
   				keyboardLSpeed = 0


   				//$("pad-arrow-right").trigger("clic");
		        break;
		    case 38: //(flèche up)
		        keyboardASpeed = 0
   				keyboardLSpeed = -0.2 - linearSpeed
		        break;
		    case 40: //(flèche down)
		        keyboardASpeed = 0
   				keyboardLSpeed = 0.2 - linearSpeed
		        break; 

		    /**/   
		   
		    

		    default:
		        break;
	    
	    }






		}, 

	false);
	/**/

   function sendArrowsToRobot (keyboardASpeed,keyboardLSpeed ) {

   			 // envoi de l'ordre
			     var driveCommand = {
			         driveSettings: '',
			         channel: parameters.navCh,
			         system: parameters.navSys,
			         source:"Keyboard",
			         dateA: '',
			         command: 'onDrive',
			         aSpeed: -keyboardASpeed,
			         lSpeed: -keyboardLSpeed,
			         enable: 'true'
			     }             
				    
			   navigation_interface.sendToRobot("", "", "Keyboard",driveCommand);
   }


   // Ecouteurs Keyup, Keydown 
   // source : http://nokarma.org/2011/02/27/javascript-game-development-keyboard-input/
   var Key = {
	  	_pressed: {},

	  	LEFT: 37,
	  	UP: 38,
	  	RIGHT: 39,
  		DOWN: 40,
  		CTRL: 17,
  
  		isDown: function(keyCode) {
    		return this._pressed[keyCode];
  		},
  
  		onKeydown: function(event) {
    		this._pressed[event.keyCode] = true;
    		//console.log("Key "+event.keyCode+" pressed")
    		//emulatePad()
  		},
  
  		onKeyup: function(event) {
    		delete this._pressed[event.keyCode];
    		//console.log("Key "+event.keyCode+" released")
    		//Pad.trigger();
  		}
	};	


   	window.addEventListener('keyup', function(event) { 
   			Key.onKeyup(event);  keyboardControl();
   	}, false);
   
    window.addEventListener('keydown', function(event) { 
    		Key.onKeydown(event);  keyboardControl();
    }, false);		

    var lastDirectionnal = "relase";
    // Pente d'arrêt (décéllération) en cours (flag)
    // Pour éviter les accès concurrents le temps de finir l'arrêt.
    var decreaseDirectionnal = false; 
    

    function keyboardControl() {
	  	// console.log("keyboardControl()")
	  	// return
	  	var stepLinearSpeed = 0.05;
	  	var stepAngularSpeed = 0.2;
	  	// Si touche up appuyée et aucune décéllération en cours... 
	  	
	  	// Touche CTRL appuyée...
	  	if (Key.isDown(Key.CTRL) ) {

		  	if (Key.isDown(Key.UP) && decreaseDirectionnal == false) {
		  		lastDirectionnal = "top";
			    keyboardASpeed = angularSpeed
				keyboardLSpeed = -stepLinearSpeed - linearSpeed / 1.5
		  		sendArrowsToRobot (keyboardASpeed,keyboardLSpeed )
		  		//console.log('top');
		  	} else if (Key.isDown(Key.DOWN)  && decreaseDirectionnal == false) {
		  		lastDirectionnal = "bottom";
		  		keyboardASpeed = angularSpeed
				keyboardLSpeed = stepLinearSpeed - linearSpeed / 1.5
		  		sendArrowsToRobot (keyboardASpeed,keyboardLSpeed )
		  		//console.log('bottom'); 

		  	} else if (Key.isDown(Key.LEFT) && decreaseDirectionnal == false) {
		  		lastDirectionnal = "left";
		  		keyboardASpeed =  -stepAngularSpeed - angularSpeed /2
				keyboardLSpeed = linearSpeed;	
		  		sendArrowsToRobot (keyboardASpeed,keyboardLSpeed )
		  		//console.log('left'); 
		  
		  	} else if (Key.isDown(Key.RIGHT)  && decreaseDirectionnal == false) {
		  		lastDirectionnal = "right";
		  		keyboardASpeed = stepAngularSpeed - angularSpeed /2
				keyboardLSpeed = linearSpeed;	
		  		sendArrowsToRobot (keyboardASpeed,keyboardLSpeed )
		  		//console.log('right');
		  	}  else if (decreaseDirectionnal == false){
		  		decreaseDirectionnal = true; // On déclenche la pente d'arrêt...
				decreaseDirectionnal = false;
				lastDirectionnal = "relase";

		  	}
		}
	};

    //console.log(Pad)

 

})(typeof exports === 'undefined'? this['ihm']={}: exports);