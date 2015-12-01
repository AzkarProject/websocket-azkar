$(document).ready(function() {
    

    // var fakeRobubox = true;

    // Titi: offsets du point 0,0 de localisation de la carte
    // -- Récupérés manuellement avec GIMP sur copie d'écran tailel réelle de la carte
    //var offsetWidth = 1308; // Version carte I3S
    //var offsetHeight = 861; // Version carte I3S
    var offsetWidth = 594; // Version carte Robosoft
    var offsetHeight = 470; // Version carte Robosoft

    
    // Titi: Image BackGround aux dimensions du Canvas
    var backGroundMap = new Image();
    // backGroundMap.src = '/images/mapOriginale.png'; // Version carte I3S
    backGroundMap.src = '/images/mapRobosoft.png'; // Version carte I3S

    // Titi:  délai de rafraichissement carto en ms
    var refreshDelay = 100; // 100ms (600ms ca saccade un peu) 

    var dataMap, // height , width , offset (x,y) , resolution
        dataLocalization, //
        offsetX,
        offsetY,
        corrOffestX,
        corrOffestY,
        robotInfo;
    var canvasMap = document.getElementById('myCanvas');
    var context = canvasMap.getContext('2d');
    // var urlP = 'http://127.0.0.1:8080/127.0.0.1:50000/nav/maps/parameters';
    // var urlRobotPosition = 'http://127.0.0.1:8080/127.0.0.1:50000/lokarria/localization';

    // Titi: Mode fakeRobubox pour simuler les infos en provenance de Pure
    if (fakeRobubox == true) {  
        dataMap = getFakeDataMap();
        robotInfo = getFakeRobotInfo();
    }

    // Titi: Rebond proxy en https(Client Robot) > Http(Robubox)
    var urlP = 'https://127.0.0.1:443/http://127.0.0.1:50000/nav/maps/parameters';
    var urlRobotPosition = 'https://127.0.0.1:443/http://127.0.0.1:50000/lokarria/localization';

    // Titi: 
    // Resize width et Height en conservant le ratio
    // retourne aussi le ratio utilisé.
    // Paramètres: width et Height d'origine, Width et Height max
    function resizeRatio(srcWidth, srcHeight, maxWidth, maxHeight) {
        var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
        return { width: srcWidth*ratio, height: srcHeight*ratio, ratio: ratio };
     }

    // Titi: 
    // Retourne les offsets  X Y resizés du point 0,0 de la carte originale
    // Paramètres: position point 0,0 sur la carte originale, width et Height carte originale, Width et Height carte affichée
    function resizeOffset (offsetWidth,offsetHeight,originalWidth,originalHeight,resizedWidth,resizedHeight) {
        var offsetArrowWidth = originalWidth/offsetWidth;
        offsetArrowWidth = resizedWidth/offsetArrowWidth;
        var offsetArrowHeight = originalHeight/offsetHeight;
        offsetArrowHeight = resizedHeight/offsetArrowHeight;
        return { width: offsetArrowWidth, height: offsetArrowHeight };
    }

    var mapSize = 0;
    var canvasWidth = $('#myCanvas').width();
    var canvasHeight = $('#myCanvas').height();

    
    // Titi:
    // Flags et Ecouteurs pilote/robot pour l'échange des protocoles d'infos de navigation
    // var pilotGetNav = false; // Flag d'échande par défaut.  
    // si c'est un pilote qui éxécute le script
    // Il prévient le robot qu'il doit lui envoyer ses infos de navigation.
    if (type == "pilote-appelant") {
    	pilotGetNav = true;
    	socket.emit("pilotGetNav",{message:"getNavInfos"});
    }
    
    // Titi:
    // Ecouteur coté Robot: reception demande d'échange de données cartos
    // Flag d'échange a true et envoi au pilote des paramètres de la carte
    if (type == "robot-appelé") {
    	socket.on("pilotGetNav", function(data) {
    		if (data = "getNavInfos") {
    			// pilotGetNav = true;
    			commandes.sendToPilote("map_parameters", dataMap);
    		}
    	});
    }

    // Titi: reception de données de navigation
    if (type == "pilote-appelant") {
    	socket.on("navigation", function(data) {

    		if (data.command == "map_parameters") {
    			 dataMap = data.dataMap;
    			 mapSize = resizeRatio(dataMap.Width, dataMap.Height, canvasWidth, canvasHeight)
    		} else if (data.command == "robot_localization") {
    			 robotInfo = data.robotInfo;
    			 refresh();
    		}


    	});
    }
    /**/


    // Conversion Karto to png
    // Auteur: Marc Traonmilin (Robosoft)
    function worldToMap(p, map) {
        var x = (p.X-map.Offset.X) / map.Resolution;
        var y = map.Height -((p.Y - map.Offset.Y) / map.Resolution);
        return {X:x, Y:y};
    };

    // Conversion png to Karto
    // Auteur: Marc Traonmilin (Robosoft)
    function mapToWorld(p, map) {
        var x = p.X * map.Resolution + map.Offset.X;
        var y = -(p.Y - map.Height) * map.Resolution + map.Offset.Y;
        return {X:x, Y:y};
    };


    /* START */
    /* call init() then load() and finaly refresh() with setInterval */
    // type = pilote-appelant ou robot-appelé
    init(load,type);

    function init(callback, typeUser) {

        // console.log('@ init(callback)');
        
        if (fakeRobubox == true) {
            
            mapSize = resizeRatio(dataMap.Width, dataMap.Height, canvasWidth, canvasHeight)
            callback();

        } else {
        
            if (type == "robot-appelé") {

                var d1 = $.Deferred();
                var d2 = $.Deferred();

                $.when(d1, d2).done(function(v1, v2) {
                    callback();
                });

                console.log ('get map informations');
                $.get(urlP, function(rep) { // Les informations de la carte 
                    if (!rep)
                        return;
                    dataMap = rep;
                    console.log('datamap -->', dataMap);
                    console.log(dataMap);
                    var debug = tools.stringObjectDump(dataMap,"dataMap");
                    console.log(debug);
                    // Michaël:
                    //console.log ('get the map width and height to adjust the canvas')
                    //$('#myCanvas').attr("width", dataMap.Width);
                    //$('#myCanvas').attr("height", dataMap.Height);
                    //console.log("Dimension  width : " +  dataMap.Width + " height : " +dataMap.Height ); 
                    
                    // Titi: Calcul des W,H et ratio de la carte à redéssiner
                    mapSize = resizeRatio(dataMap.Width, dataMap.Height, canvasWidth, canvasHeight)

                    d1.resolve();
                });

                console.log ('get robot position');
                $.get(urlRobotPosition, function(dataLocalization) { // la localisation du robot sur la carte
                    robotInfo = JSON.parse(dataLocalization);
                    console.log('robotInfo -->', robotInfo);
                    console.log(robotInfo);
                    var debug = tools.stringObjectDump(robotInfo,"robotInfo");
                    console.log(debug);
                    console.log ('then, call load function')
                    d2.resolve();
                });

            } // endif (type == "robot-appelé")
        
        } // endif fakeRobubox else

    }

    function load() {
        
        // console.log('@ load()');
       
        offsetX = dataMap.Offset.X;
        offsetY = dataMap.Offset.Y;
        corrOffestX = dataMap.Height - (offsetX / dataMap.Resolution);
        corrOffestY = dataMap.Width - (offsetY / dataMap.Resolution);         

        console.log ('then call refresh function'); 
        refresh();
    }


    function refresh() {
        
        if (type == "robot-appelé") {
	        
	        setInterval(function() {

	        	// console.log("@ refresh()");
                if (fakeRobubox == true) {
                    robotInfo.Pose.Orientation.Z += 0.05;
                    //robotInfo.Pose.Orientation.Z = robotInfo.Pose.Orientation.Z+0.20
                
                } else {
                    $.get(urlRobotPosition, function(dataLocalization) {
                        robotInfo = JSON.parse(dataLocalization);
                        //console.log('robotInfo -->', robotInfo);
                    });
                }

	            // Titi:
	            // si échange Robot/Pilote de données carto activé
	            if ( isOnePilot == true) commandes.sendToPilote("robot_localization", robotInfo);

	            context.clearRect(0, 0, canvasMap.width, canvasMap.height);
	            
	            // Add titi:
	            // context.drawImage(backGroundMap, 0,0); // Image taille non resizée 
	            context.drawImage(backGroundMap, 0,0, mapSize.width, mapSize.height); // Image taille resizée avec ratio
	            
	            drawRobot();

	        }, refreshDelay); // 600
    	

    	} else if (type = "pilote-appelant") {
    			
    			if (dataMap == null) socket.emit("pilotGetNav",{message:"getNavInfos"});

    			if (dataMap != null) {
	    			context.clearRect(0, 0, canvasMap.width, canvasMap.height);
	    			context.drawImage(backGroundMap, 0,0, mapSize.width, mapSize.height); // Image taille resizée avec ratio
	    			drawRobot();
	    		}
    			/**/
    	}

   


    }

    function drawRobot() {
        
        // Michaël...
        // context.translate(1308, 861); // ramener l'origine du repère au point 1308,861
               
        // Titi
        // console.log('@ drawRobot()');
        context.save(); // Sauvegarde du contexte AVANT le contexte Translate..
        var drawRatio = mapSize.ratio;
        // conversion de l'offset d'origine au ratio d'affichage...
        // Todo: ajouter les éléments d'ofset d'origine en paramètres...
        // console.log (dataMap.Offset.X + " : " + dataMap.Offset.Y) 
        // offsets: -25.8644... &&  -6.4501... >>> 1308 && 861 
        // reso: 0.2
        // size:  X = 2384 && Y = 1171 >>  399 && 165 
        // ----------------------------------
        // test fonction Robosoft...
        // var offsetWidth = 594; // Version carte Robosoft
        // var offsetHeight = 470; // Version carte Robosoft
        // function worldToMap(p, map) {
        //     var x = (p.X-map.Offset.X) / map.Resolution;
        //     var y = map.Height -((p.Y - map.Offset.Y) / map.Resolution);
        //     return {X:x, Y:y};
        // };
        // On essaie de convertir le point 0.0
        var basePosition = {};
        basePosition.X = 0;
        basePosition.Y = 0;
        var baseAxis = worldToMap(basePosition, dataMap);
        //console.log (baseAxis);
        var newOffset = resizeOffset (baseAxis.X,baseAxis.Y,dataMap.Width, dataMap.Height, mapSize.width,mapSize.height);
        // var newOffset = resizeOffset (offsetWidth,offsetHeight,dataMap.Width, dataMap.Height, mapSize.width,mapSize.height);
        context.translate(newOffset.width,newOffset.height);
        
        /*// Titi: Conversion de la position du robot avec la fonction Robosoft:
        var geoloc = worldToMap(robotInfo.Pose.Position, dataMap);
        geoloc.Z = -robotInfo.Pose.Orientation.Z;
        geoloc.Y = geoloc.X*drawRatio;
        geoloc.Y = geoloc.Y*drawRatio;
        /**/



        /*// BUG au passage de l'équateur...        
        if (Math.round(Math.abs(robotInfo.Pose.Position.Y)) === 0) var ry = 0;
        else if (robotInfo.Pose.Position.Y > 0) ry = -robotInfo.Pose.Position.Y /0.02  ; // BUG
        else ry = robotInfo.Pose.Position.Y / 0.02; // BUG Idem
        //else  ry = -robotInfo.Pose.Position.Y /0.02  ; // Fix Titi

        // BUG au passage de l'équateur...  
        if (Math.round(Math.abs(robotInfo.Pose.Position.X)) === 0) var rx = 0;
        else if (robotInfo.Pose.Position.X < 0) rx = -robotInfo.Pose.Position.X / 0.02; // BUG
        else rx = robotInfo.Pose.Position.X /0.02; // BUG Idem
        //else rx = -robotInfo.Pose.Position.X / 0.02; // Fix Titi
        /**/

        // Fix Titi:
        var ry = -robotInfo.Pose.Position.Y /0.02
        var rx = -robotInfo.Pose.Position.X / 0.02
        var qz = robotInfo.Pose.Orientation.Z;

        //console.log("X --> ", rx);
        //console.log("Y --> ", ry);
        
        // Titi: 
        // Inversion des axes d'orientation (Carte en horizontal)
        // et application du ratio de resize
        // console.log("z --> ", qz); 
        qz = - qz;
        rx = rx*drawRatio;
        ry = ry*drawRatio;



        drawArrow(context, 0, 0, 0, -50, 1, "green"); // axe Y
        drawArrow(context, 0, 0, 50, 0, 1, "red"); // axe X
        // circleWithDirection(ry, rx, 0, "blue", 3, 2); // Michael
        
        // Titi: Ajout du paramètre QZ pour l'orientation du robot et inversion des axes X,Y...
        if (fakeRobubox == true) circleWithDirection(0, 0, qz, "blue", 3, 2);
        //else circleWithDirection(rx, -ry, qz, "blue", 3, 2);// OK sur I3S/: Inversion XY chez Robosoft...
        // else circleWithDirection(rx, ry, qz, "blue", 3, 2);// OK sur I3S
        // else circleWithDirection(geoloc.X, geoloc.Y, geoloc.Z, "blue", 3, 2);// OK sur I3S/: Inversion XY chez Robosoft...
        else circleWithDirection(-rx, ry, qz, "blue", 3, 2);// OK sur I3S/: Inversion XY chez Robosoft...

        // Titi: RAZ du context pour éviter la surimpression d'image décalée... 
        context.restore();
    }


    //draw a circle with a line     
    function circleWithDirection(x, y, theta, color, size, sizeStroke) {
        
        // console.log('@ dcircleWithDirection()');
        context.save();

        context.beginPath();
        context.arc(x, y, size, 0, 2 * Math.PI, false);
        context.fillStyle = color;
        context.fill();
        context.lineWidth = 2;
        context.strokeStyle = "black";
        context.stroke();
        x2 = x + Math.cos(theta) * 15;
        y2 = y + Math.sin(theta) * 15;
        context.closePath();
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x2, y2);
        context.strokeStyle = color;
        context.lineCap = "round";
        context.lineWidth = sizeStroke;
        context.stroke();
        context.closePath();
        context.restore();
    }

    // Borrowed and adapted from : http://stackoverflow.com/questions/808826/draw-arrow-on-canvas-tag
    function drawArrow(ctx, fromx, fromy, tox, toy, arrowWidth, color) {
        

        //console.log('@ drawArrow()');
        //variables to be used when creating the arrow
        var headlen = 10;
        var angle = Math.atan2(toy - fromy, tox - fromx);

        ctx.save();
        ctx.strokeStyle = color;

        //starting path of the arrow from the start square to the end square and drawing the stroke
        ctx.beginPath();
        ctx.moveTo(fromx, fromy);
        ctx.lineTo(tox, toy);
        ctx.lineWidth = arrowWidth;
        ctx.stroke();

        //starting a new path from the head of the arrow to one of the sides of the point
        ctx.beginPath();
        ctx.moveTo(tox, toy);
        ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 7), toy - headlen * Math.sin(angle - Math.PI / 7));

        //path from the side point of the arrow, to the other side point
        ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 7), toy - headlen * Math.sin(angle + Math.PI / 7));

        //path from the side point back to the tip of the arrow, and then again to the opposite side point
        ctx.lineTo(tox, toy);
        ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 7), toy - headlen * Math.sin(angle - Math.PI / 7));

        //draws the paths created above
        ctx.stroke();
        ctx.restore();
    }


});
