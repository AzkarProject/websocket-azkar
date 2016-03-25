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
   

    console.log("module_carto chargé")

    
    // Titi: Image BackGround aux dimensions du Canvas
    var backGroundMap = new Image();
    backGroundMap.src = '/images/mapOriginale.png'; // Version carte I3S
    // backGroundMap.src = '/images/mapRobosoft.png'; // Version carte Robosoft

    // Titi:  délai de rafraichissement carto en ms
    var refreshDelay = 100; // 100ms (600ms ca saccade un peu) 

    // Datamap et robotInfo en variable globales...
    dataMap = null; // height , width , offset (x,y) , resolution
    robotInfo = null;   

    var dataLocalization, 
        offsetX,
        offsetY,
        corrOffestX,
        corrOffestY;
        
    var canvasMap = document.getElementById('myCanvas');
    var context = canvasMap.getContext('2d');

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
    // var pilotGetNav = false; // Flag d'échange par défaut.  
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
    			navigation_interface.sendToPilote("map_parameters", dataMap);
                //navigation_datas.sendToPilote("map_parameters", DATAMAP);
    		}
    	});
    }

    // Titi: reception de données de navigation
    if (type == "pilote-appelant") {
    	socket.on("navigation", function(data) {

    		if (data.command == "map_parameters") {
    			 dataMap = data.dataMap;
    			 mapSize = resizeRatio(dataMap.Width, dataMap.Height, canvasWidth, canvasHeight)
                 console.log (mapSize)
    		     //DATAMAP = data.dataMap;
                 //mapSize = resizeRatio(dataMap.Width, dataMap.Height, canvasWidth, canvasHeight)

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
    if (type == "robot-appelé") init(load);

    function init(callback) {

    console.log('@ init(callback)');      
        
            
            /*
            defferedDataMap = $.Deferred();
            defferedRobotInfo = $.Deferred();

            $.when(defferedDataMap, defferedRobotInfo).done(function(v1, v2) {
                mapSize = resizeRatio(dataMap.Width, dataMap.Height, canvasWidth, canvasHeight)
                callback();
            });
            /**/


            // On met le deffered en variable globale
            // Pour le modifier ds une autre fonction
            DEFFERED_DataMap = $.Deferred();
            DEFFERED_RobotInfo = $.Deferred();

            $.when(DEFFERED_DataMap, DEFFERED_RobotInfo).done(function(v1, v2) {
                mapSize = resizeRatio(dataMap.Width, dataMap.Height, canvasWidth, canvasHeight)
                callback();
            });

            var init = true;
            komcom.getRobotInfo(init);
            komcom.getDataMap();
    



    }

    function load() {
        
        console.log('@ load()');
        mapSize = resizeRatio(dataMap.Width, dataMap.Height, canvasWidth, canvasHeight)
        offsetX = dataMap.Offset.X;
        offsetY = dataMap.Offset.Y;
        corrOffestX = dataMap.Height - (offsetX / dataMap.Resolution);
        corrOffestY = dataMap.Width - (offsetY / dataMap.Resolution);         

        // console.log ('then call refresh function'); 
        refresh();
    }



    function refresh() {
        
        if (type == "robot-appelé") {
	        
	        setInterval(function() {
                if (fakeRobubox == true) simulateRobotMove();
                else komcom.getRobotInfo();
	            // si Pilote connecté: envoi datas carto Robot >> Pilote activé
	            if ( isOnePilot == true) navigation_interface.sendToPilote("robot_localization", robotInfo);
                reDraw();
	        }, refreshDelay); // 600
    	
    	} else if (type = "pilote-appelant") {
    		
            if (dataMap == null) socket.emit("pilotGetNav",{message:"getNavInfos"});
    		else if (dataMap != null) reDraw();
    	}

    }

    
    

    // flags
    modeTraking = false;
    var initialContextSaved = false; 
    var initialX = 0;
    var initialY = 0;

    function reDraw() {
        
        // Centrage de la Map (Horizontal et Vertical...)
        // Horizontal:
        // 1 on prend la moitié du canvas
        // 2 on lui retire la moitié de la carte
        var halfCanvasX = canvasWidth/2;
        var halfMapX = mapSize.width/2;
        

        initialX = halfCanvasX - halfMapX;
        //alert (halfCanvasX +" - "+halfMapX+" = "+initialX)




        if (initialContextSaved == false) {           
            context.save(); // On sauvegarde le contexte initial pour le prochain reset
            initialContextSaved = true; // On prévient le systeme que le contexte de départ est sauvegardé
            // modeTraking = false; // On désactive le mode tracking          
        } 

        if (modeTraking == true) redrawTracking(initialX,initialY)
        else {
        context.clearRect(-10000, -10000, 100000, 1000000);
        context.drawImage(backGroundMap,initialX,initialY, mapSize.width, mapSize.height); // Image taille resizée avec ratio
        drawRobot(initialX,initialY);
        }
    }



    exports.activeTracking = function () {
        if (modeTraking == true) return // Si le modeTracking est déjà activé
        modeTraking = true; // Sinon on active le mode tracking
        initialContextSaved = false; // On prévient le systeme que le contexte de départ doit être réinitialisé
        context.restore(); // On rétablit contexte de départ

    }


 function redrawTracking(initialX,initialY) {
        
            
        var halfCanvasX = canvasWidth/2;
        var halfCanvasY = canvasHeight/2;
        var halfMapX = mapSize.height/2;
        var halfMapY = mapSize.height/2;

        var drawRatio = mapSize.ratio;
        // On essaie de convertir le point 0.0
        var basePosition = {};
        basePosition.X = 0;
        basePosition.Y = 0;
        var baseAxis = worldToMap(basePosition, dataMap);
        var newOffset = resizeOffset (baseAxis.X,baseAxis.Y,dataMap.Width, dataMap.Height, mapSize.width,mapSize.height);

        
        // Fix Titi (BUG passage de l'équateur):
        var ry = -robotInfo.Pose.Position.Y /0.02
        var rx = -robotInfo.Pose.Position.X / 0.02
        var qz = robotInfo.Pose.Orientation.Z;
       
        // Titi: 
        // Inversion des axes d'orientation (Carte en horizontal)
        // et application du ratio de resize
        // console.log("z --> ", qz); 
        qz = - qz;
        rx = rx*drawRatio;
        ry = ry*drawRatio;
        // Décalage du robot pour tenir compte du centrage horizontal
        //if (initialX) rx = rx-initialX;

        var toto = newOffset.width;
        var tata = newOffset.height;

        //console.log(rx + "-" + ry)
       
        //console.log(newOffset)

        var newX = halfCanvasX-newOffset.width; 
        var newY = newOffset.height-canvasHeight;
        //console.log(toto + " - " + tata)
        //console.log (newX +" - " + newY)

        var newX = halfCanvasX-toto+rx; 
        var newY = halfCanvasY-tata-ry;
        
        context.clearRect(-10000, -10000, 100000, 1000000);
        context.drawImage(backGroundMap,newX,newY, mapSize.width, mapSize.height); // Image taille resizée avec ratio
        // drawRobot(initialX,initialY);

        context.save(); // Sauvegarde du contexte AVANT le contexte Translate..
        // context.translate(newOffset.width,newOffset.height);
        var startArrowX = halfCanvasX+rx
        var startArrowY = halfCanvasY-ry
        
        drawArrow(context, startArrowX, startArrowY, startArrowX+25, startArrowY, 1, "red",'X'); // axe X
        drawArrow(context, startArrowX, startArrowY, startArrowX, startArrowY-25, 1, "green",'Y'); // axe Y



        //alert (rx +" / "+ ry)
        circleWithDirection(halfCanvasX,halfCanvasY, qz, "red", 1, 1); 
        // Titi: RAZ du context pour éviter la surimpression d'image décalée... 
        context.restore();
    

    }



    function drawRobot(initialX,initialY) {
        
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
        
        /*// BUG au passage de l'équateur...        
        if (Math.round(Math.abs(robotInfo.Pose.Position.Y)) === 0) var ry = 0;
        else if (robotInfo.Pose.Position.Y > 0) ry = -robotInfo.Pose.Position.Y /0.02  ; // BUG
        else ry = robotInfo.Pose.Position.Y / 0.02; // BUG Idem
        //else  ry = -robotInfo.Pose.Position.Y /0.02  ; // Test Fix Titi 
        /**/
        // Fix Titi (BUG passage de l'équateur):
        var ry = -robotInfo.Pose.Position.Y /0.02
        var rx = -robotInfo.Pose.Position.X / 0.02
        var qz = robotInfo.Pose.Orientation.Z;

        // console.log("X --> ", rx);
        // console.log("Y --> ", ry);
        
        // Titi: 
        // Inversion des axes d'orientation (Carte en horizontal)
        // et application du ratio de resize
        // console.log("z --> ", qz); 
        qz = - qz;
        rx = rx*drawRatio;
        ry = ry*drawRatio;

        // Décalage du robot pour tenir compte du centrage horizontal
        if (initialX) rx = rx-initialX;
        //
        // Valeur absolue du point 0.0 ???
        // Désactivation le 29/01/16 pour tests ZOOM CARTO - A réactiver.
        //function drawArrow(ctx, fromX, fromY, toX, toY, arrowWidth, color) {
        var arrowX = 0
        var arrowY = 0
        
        // drawArrow(context, 0, 0, 25, 0, 1, "red"); // axe X
        // drawArrow(context, 0, 0, 0,-25, 1, "green"); // axe Y

        drawArrow(context, initialX, initialY, initialX+25, initialY, 1, "red",'X'); // axe X
        drawArrow(context, initialX, initialY, initialX, initialY-25, 1, "green",'Y'); // axe Y

        // circleWithDirection(ry, rx, 0, "blue", 3, 2); // Michael
        // Titi: Ajout du paramètre QZ pour l'orientation du robot et inversion des axes X,Y...
        // if (fakeRobubox == true) circleWithDirection(145, -10, qz, "blue", 3, 2);
        // if (fakeRobubox == true) circleWithDirection(-rx, ry, qz, "blue", 3, 2);
        // circleWithDirection(rx, -ry, qz, "blue", 3, 2);// OK sur I3S/: Inversion XY chez Robosoft...
        // circleWithDirection(rx, ry, qz, "blue", 3, 2);// OK sur I3S
        // circleWithDirection(geoloc.X, geoloc.Y, geoloc.Z, "blue", 3, 2);// OK sur I3S/: Inversion XY chez Robosoft...
        circleWithDirection(-rx, ry, qz, "blue", 1, 1); // OK sur I3S/: Inversion XY chez Robosoft...

        // Titi: RAZ du context pour éviter la surimpression d'image décalée... 
        context.restore();
    }


     // Borrowed and adapted from : http://stackoverflow.com/questions/808826/draw-arrow-on-canvas-tag
    function drawArrow(ctx, fromx, fromy, tox, toy, arrowWidth, color, text) {
        
        
            //console.log('@ drawArrow()');
            //variables to be used when creating the arrow
            var headlen = 3;
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

            // titi: Nommage des axes
            if (text){
                ctx.font = "8px arial";
                ctx.fillStyle = color;
                ctx.fillText(text,tox+2,toy+2);
            }

            ctx.restore();
 
    }



    //draw a circle with a line     
    function circleWithDirection(x, y, theta, color, size, sizeStroke) {
        
       // console.log(theta);
       // if (modeTraking == true ) theta = -1.45;

       // console.log('@ dcircleWithDirection()');
        context.save();

        context.beginPath();
        context.arc(x, y, size, 0, 2 * Math.PI, false);
        context.fillStyle = color;
        context.fill();
        context.lineWidth = 2;
        context.strokeStyle = "black";
        context.stroke();
        
        x2 = x + Math.cos(theta) * 8;
        y2 = y + Math.sin(theta) * 8;
        
        /*
        if (modeTraking == false ) {
            x2 = x + Math.cos(theta) * 8;
            y2 = y + Math.sin(theta) * 8;
        } else {
            x2 = x*8;
            y2 = y*8;
        }
        /**/
        


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

   



    function simulateRobotMove() {
        //robotInfo.Pose.Orientation.Z += 0.02;
        robotInfo.Pose.Position.X += 0.01;               
        robotInfo.Pose.Position.Y += 0.01;
    }




    // Titi: Intégration ZOOM et translations à la souris
    // Adapté de http://phrogz.net/tmp/canvas_zoom_to_cursor.html
      
    trackTransforms(context);  
       
    var lastX=canvasMap.width/2, lastY=canvasMap.height/2;
    var dragStart,dragged;

    // Add Titi
    var lastDragStart,lastDragged;

    
    canvasMap.addEventListener('mousedown',function(evt){
        // console.log("mousedown");
        document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
        lastX = evt.offsetX || (evt.pageX - canvasMap.offsetLeft);
        lastY = evt.offsetY || (evt.pageY - canvasMap.offsetTop);
        dragStart = context.transformedPoint(lastX,lastY);
        dragged = false;
        // Add titi pour le RAZ
        // lastDragStart = context.transformedPoint(lastX,lastY); 
       
    },false);
        
    canvasMap.addEventListener('mousemove',function(evt){
        // console.log("mousemove");
        lastX = evt.offsetX || (evt.pageX - canvasMap.offsetLeft);
        lastY = evt.offsetY || (evt.pageY - canvasMap.offsetTop);
        dragged = true;
        if (dragStart){
            var pt = context.transformedPoint(lastX,lastY);
            var ptX = pt.x-dragStart.x;
            var ptY = pt.y-dragStart.y;
            //contextTranslateMemorize(ptX,ptY); // Add Titi
            context.translate(ptX,ptY);
            //console.log("context.transformedPoint("+lastX+","+lastY+")");
            //console.log("context.translate("+ptX+","+ptY+")");
            //console.log(context);

            //context.translate(pt.x-dragStart.x,pt.y-dragStart.y);

            reDraw();
        }
    },false);
    
    canvasMap.addEventListener('mouseup',function(evt){
        // console.log("mouseup");
        dragStart = null;
        // if (!dragged) zoom(evt.shiftKey ? -1 : 1 );
    },false);

 

    var scaleFactor = 1.1;
    zoomLevel = 0; // Add titi
        
    var zoom = function(clicks,reset){
        
        var factor = Math.pow(scaleFactor,clicks);        
        var pt = context.transformedPoint(lastX,lastY);
        context.translate(pt.x,pt.y);
        //contextTranslateMemorize(pt.x,pt.y);// add titi
        context.scale(factor,factor);
        context.translate(-pt.x,-pt.y);
        //contextTranslateMemorize(-pt.x,-pt.y);// add titi
        
        // Add Titi pour mémoriser le niveau de Zoom courant
        // afin de faire un R.A.Z du Zoom à son niveau d'origine (0)
        if (clicks) zoomLevel = zoomLevel + clicks;
        else if (reset == true) zoomLevel = 0;
        else zoomLevel = zoomLevel + 1;

        reDraw();        

    }

    var handleScroll = function(evt){
        var delta = evt.wheelDelta ? evt.wheelDelta/40 : evt.detail ? -evt.detail : 0;
        if (delta) zoom(delta);
        return evt.preventDefault() && false;
    };
    canvasMap.addEventListener('DOMMouseScroll',handleScroll,false);
    canvasMap.addEventListener('mousewheel',handleScroll,false);

    // Adds ctx.getTransform() - returns an SVGMatrix
    // Adds ctx.transformedPoint(x,y) - returns an SVGPoint
    function trackTransforms(ctx){
        var svg = document.createElementNS("http://www.w3.org/2000/svg",'svg');
        var xform = svg.createSVGMatrix();
        ctx.getTransform = function(){ return xform; };
        
        var savedTransforms = [];
        var save = context.save;
        ctx.save = function(){
            savedTransforms.push(xform.translate(0,0));
            return save.call(context);
        };
        var restore = context.restore;
        context.restore = function(){
            xform = savedTransforms.pop();
            return restore.call(context);
        };

        var scale = context.scale;
        context.scale = function(sx,sy){
            xform = xform.scaleNonUniform(sx,sy);
            return scale.call(context,sx,sy);
        };
        var rotate = context.rotate;
        context.rotate = function(radians){
            xform = xform.rotate(radians*180/Math.PI);
            return rotate.call(context,radians);
        };
        var translate = context.translate;
        context.translate = function(dx,dy){
            xform = xform.translate(dx,dy);
            return translate.call(context,dx,dy);
        };
        var transform = context.transform;
        ctx.transform = function(a,b,c,d,e,f){
            var m2 = svg.createSVGMatrix();
            m2.a=a; m2.b=b; m2.c=c; m2.d=d; m2.e=e; m2.f=f;
            xform = xform.multiply(m2);
            return transform.call(context,a,b,c,d,e,f);
        };
        var setTransform = context.setTransform;
        ctx.setTransform = function(a,b,c,d,e,f){
            xform.a = a;
            xform.b = b;
            xform.c = c;
            xform.d = d;
            xform.e = e;
            xform.f = f;
            return setTransform.call(context,a,b,c,d,e,f);
        };
        var pt  = svg.createSVGPoint();
        ctx.transformedPoint = function(x,y){
            pt.x=x; pt.y=y;
            return pt.matrixTransform(xform.inverse());
        }
    }


    // Adss Titi: pour les commandes par boutons--------

   
    /*// Add Titi: fonction passerelle
    // pour mémoriser les différents context.translate
    // Afin de faire un RAZ de la position de départ...
    actualPosX = 0;
    actualPosY = 0;
    function contextTranslateMemorize(toX,toY) {
        actualPosX += toX;
        actualPosY += toY;
    }
    /**/



    exports.setZoom = function (clicks) {
        //var reset = false;
        //if (clicks == 0) zoom(-zoomLevel,reset);
        zoom(-clicks);
    }

    /*
    exports.resetPosition = function (){
    //function resetPosition() {
        context.translate(-actualPosX,-actualPosY);
        actualPosX = 0;
        actualPosY = 0;

        //var toZeroX = 300-pt.X;
        //var toZeroY = 80-pt.y;
        //context.translate(toZeroX,toZeroY);
        //reDraw();       

    }
    /**/

    // Interface de retour aux valeurs par défaut de la carte
    exports.resetCanvas = function (){ 
    // function resetCanvas() {
        // resetZoom();  
        //resetPosition();  
        // resetZoom();
        // initialContext.restore();
        modeTraking = false; // On reset le mode tracking 
        initialContextSaved = false; // On prévient le systeme que le contexte de départ doit être réinitialisé
        context.restore(); // On rétablit contexte de départ

       
    }


   // Interface de translations horizontales et verticales:
    exports.canvasMove = function (moveX,moveY){ 
   // function canvasMove(moveX,moveY) {
        //contextTranslateMemorize(moveX,moveY);
        context.translate(moveX,moveY);
        reDraw();
        // console.log(context);
    }


})(typeof exports === 'undefined'? this['carto']={}: exports);
