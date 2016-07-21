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
    backGroundMap.src = appSettings.getMapSource(); 

    // Si configuration spécifique à la branche:
    if (typeof appDevBranch != 'undefined') backGroundMap.src = appDevBranch.getMapSource();
      
    var canvasMap = document.getElementById('myCanvas');
    var context = canvasMap.getContext('2d');

    var newOffset = null;

    // Titi: 
    // Resize width et Height en conservant le ratio
    // retourne aussi le ratio utilisé.
    // Paramètres: width et Height d'origine, Width et Height max
    //function resizeRatio(srcWidth, srcHeight, maxWidth, maxHeight) {
    exports.resizeRatio = function (srcWidth, srcHeight, maxWidth, maxHeight) {
        var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
        return { width: srcWidth*ratio, height: srcHeight*ratio, ratio: ratio };
     }


    // Titi: 
    // Retourne les offsets  X Y resizés du point 0,0 de la carte originale
    // Paramètres: position point 0,0 sur la carte originale, width et Height carte originale, Width et Height carte affichée
    function resizeOffset (offsetWidth,offsetHeight,originalWidth,originalHeight,resizedWidth,resizedHeight) {
        
        //console.log("resizeOffset>>>");

        var offsetArrowWidth = originalWidth/offsetWidth;
        
        offsetArrowWidth = resizedWidth/offsetArrowWidth;
        
        var offsetArrowHeight = originalHeight/offsetHeight;
        
        offsetArrowHeight = resizedHeight/offsetArrowHeight;
        
        return { width: offsetArrowWidth, height: offsetArrowHeight };
    }

    mapSize = 0;
    canvasWidth = $('#myCanvas').width();
    canvasHeight = $('#myCanvas').height();


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
        

        if (newOffset == null) {
            newOffset = resizeOffset (baseAxis.X,baseAxis.Y,dataMap.Width, dataMap.Height, mapSize.width,mapSize.height);
        }
        //var newOffset = resizeOffset (baseAxis.X,baseAxis.Y,dataMap.Width, dataMap.Height, mapSize.width,mapSize.height);

        
        // Fix Titi (BUG passage de l'équateur):
        var ry = -robotInfo.Pose.Position.Y / dataMap.Resolution
        var rx = -robotInfo.Pose.Position.X / dataMap.Resolution

        //var qz = robotInfo.Pose.Orientation.Z; // Taxinomie Robubox
        var qz = robotInfo.Pose.Orientation; // Taxinomie Komnav
       
        // Titi: 
        // Inversion des axes d'orientation (Carte en horizontal)
        // et application du ratio de resize
        qz = - qz;
        rx = rx*drawRatio;
        ry = ry*drawRatio;
        
        // Décalage de l'offset pour tenir compte du centrage sur le robot       
        var newX = halfCanvasX-newOffset.width+rx; 
        var newY = halfCanvasY-newOffset.height-ry;

        context.clearRect(-10000, -10000, 100000, 1000000);
        context.drawImage(backGroundMap,newX,newY, mapSize.width, mapSize.height); // Image taille resizée avec ratio
        // drawRobot(initialX,initialY);

        context.save(); // Sauvegarde du contexte AVANT le contexte Translate..
        // context.translate(newOffset.width,newOffset.height);
        var startArrowX = halfCanvasX+rx
        var startArrowY = halfCanvasY-ry
        
        drawArrow(context, startArrowX, startArrowY, startArrowX+25, startArrowY, 1, "grey",'X'); // axe X
        drawArrow(context, startArrowX, startArrowY, startArrowX, startArrowY-25, 1, "grey",'Y'); // axe Y

                // dawListPointOfInterest("tracking",startArrowX, startArrowY,rx,ry) // BUG mode Traking - Les POIs dérivent...
                // carto.drawTrajectory (context, path); // Todo...


        //alert (rx +" / "+ ry)
        circleWithDirection(halfCanvasX,halfCanvasY, qz, "red", 1, 1); 
        // Titi: RAZ du context pour éviter la surimpression d'image décalée... 
        context.restore();
    

    }


    robotColor = 'grey';
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
               
        
        if (newOffset == null) newOffset = resizeOffset (baseAxis.X,baseAxis.Y,dataMap.Width, dataMap.Height, mapSize.width, mapSize.height);
        context.translate(newOffset.width,newOffset.height);
        
        /*// BUG au passage de l'équateur...        
        if (Math.round(Math.abs(robotInfo.Pose.Position.Y)) === 0) var ry = 0;
        else if (robotInfo.Pose.Position.Y > 0) ry = -robotInfo.Pose.Position.Y /0.02  ; // BUG
        else ry = robotInfo.Pose.Position.Y / 0.02; // BUG Idem
        //else  ry = -robotInfo.Pose.Position.Y /0.02  ; // Test Fix Titi 
        /**/
        /*// Fix Titi (BUG passage de l'équateur):
        var ry = -robotInfo.Pose.Position.Y /0.02
        var rx = -robotInfo.Pose.Position.X / 0.02
        var qz = robotInfo.Pose.Orientation.Z;
        /**/

        var ry = -robotInfo.Pose.Position.Y / dataMap.Resolution
        var rx = -robotInfo.Pose.Position.X / dataMap.Resolution

        //var qz = robotInfo.Pose.Orientation.Z; // Taxinomie Robubox
        var qz = robotInfo.Pose.Orientation; // Taxinomie Komnav

        
        // Titi: 
        // Inversion des axes d'orientation (Carte en horizontal)
        // et application du ratio de resize
        // console.log("z --> ", qz); 
        qz = - qz;
        rx = rx*drawRatio;
        ry = ry*drawRatio;

        // Décalage du robot pour tenir compte du centrage horizontal
        if (initialX) rx = rx-initialX;

        // function drawArrow(ctx, fromx, fromy, tox, toy, arrowWidth, color, text)
        //drawArrow(context, initialX, initialY, initialX+25, initialY, 1, "grey",'X'); // axe X
        //drawArrow(context, initialX, initialY, initialX, initialY-25, 1, "grey",'Y'); // axe Y

        
        dawListPointOfInterest("standard",null,null,null,null);

        carto.drawTrajectory (context, path);
        // circleWithDirection(ry, rx, 0, "blue", 3, 2); // Michael
        // Titi: Ajout du paramètre QZ pour l'orientation du robot et inversion des axes X,Y...
        // if (fakeRobubox == true) circleWithDirection(145, -10, qz, "blue", 3, 2);
        // if (fakeRobubox == true) circleWithDirection(-rx, ry, qz, "blue", 3, 2);
        // circleWithDirection(rx, -ry, qz, "blue", 3, 2);// OK sur I3S/: Inversion XY chez Robosoft...
        // circleWithDirection(rx, ry, qz, "blue", 3, 2);// OK sur I3S
        // circleWithDirection(geoloc.X, geoloc.Y, geoloc.Z, "blue", 3, 2);// OK sur I3S/: Inversion XY chez Robosoft...
        circleWithDirection(-rx, ry, qz, robotColor, 1, 1); // OK sur I3S/: Inversion XY chez Robosoft...








        // Titi: RAZ du context pour éviter la surimpression d'image décalée... 
        context.restore();
    }

   // Desine un point d'intérêt 
   function dawListPointOfInterest(mode, startArrowX, startArrowY,rx,ry) {
        

        if (listPOI == null) return

        for (poi in listPOI) {

            var drawRatio = mapSize.ratio;

            var poiName = listPOI[poi].Name;
            var PoseX = listPOI[poi].Pose.X;
            var PoseY = listPOI[poi].Pose.Y;
            var Theta = listPOI[poi].Pose.Theta;

            PoseX = -PoseX / dataMap.Resolution
            PoseY = -PoseY / dataMap.Resolution

            // Inversion des axes d'orientation (Carte en horizontal)
            // et application du ratio de resize
            Theta = - Theta;
            PoseY = PoseY*drawRatio;
            PoseX = PoseX*drawRatio;

            // Décalage du point d'intéret pour tenir compte du centrage de la carte
            if (initialX) PoseX = PoseX-initialX;
            if (initialY) PoseY = PoseY-initialY;

            
            // BuG du mode Traking
            // Les POIs dérivent....
            if (mode == "tracking") {
                
                PoseX = PoseX-(rx/2)-(startArrowX/3) // Ok 
                PoseY = PoseY+startArrowY; // OK
            }

            circleWithDirection(-PoseX, PoseY, Theta, "orange", 1, 1); // OK sur I3S/: Inversion XY chez Robosoft...

            context.save();
    
            if (poiName){
                
                drawTextBG(context, poiName, '5px verdana',-PoseX+3,PoseY-4,'black','orange');

            }

            context.restore();


            // singleton = false;
       
        } 


    }


    // Ecrit un texte avec un background
    // expand with color, background etc.
    // Inspiré de  http://jsfiddle.net/AbdiasSoftware/2JGHs/
    // Appel drawTextBG(ctx, txt, '32px arial', 30, 30);
    function drawTextBG(ctx, txt, font, x, y, fontColor, backGroundColor) {
        
        ctx.save();
        ctx.font = font;
        ctx.textBaseline = 'top';
        ctx.fillStyle = backGroundColor;
        
        var width = ctx.measureText(txt).width;
        ctx.fillRect(x, y, width, parseInt(font, 10)+1);
        //ctx.fillRect(x, y, width, 6);
        
        ctx.fillStyle = fontColor;
        ctx.fillText(txt, x, y);
        
        ctx.restore();
    } 

    // Dessine une flèche...
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
                ctx.font = "6px arial";
                ctx.fillStyle = color;
                ctx.fillText(text,tox+2,toy+2);
            }

            ctx.restore();
 
    }


    // draw a circle with a line     
    function circleWithDirection(x, y, theta, color, size, sizeStroke) {
        
       // console.log('@ dcircleWithDirection()');
        context.save();

        
        // Point
        context.beginPath();
        context.arc(x, y, size, 0, 2 * Math.PI, false);
        context.fillStyle = color;
        context.fill();
        context.lineWidth = 2;
        context.strokeStyle = color;
        context.stroke();
        context.closePath();
        
        // Ligne 
        x2 = x + Math.cos(theta) * 5;
        y2 = y + Math.sin(theta) * 5;
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

   
    /**/




    // Convertit la trajectoire Goto (un tableau de  positions XY) native fournie par le robot
    // en coordonnées XY adapées au Canvas...
    exports.convertPath = function () {

        if (! path) return;

        var drawRatio = mapSize.ratio;

        for (position in path.Trajectory) {
                
           
            var StartX = path.Trajectory[position].Start.X;
            var StartY = path.Trajectory[position].Start.Y;
            var EndX = path.Trajectory[position].End.X;
            var EndY = path.Trajectory[position].End.Y;


            StartX = -StartX / dataMap.Resolution
            StartY = -StartY / dataMap.Resolution
            EndX = -EndX / dataMap.Resolution
            EndY = -EndY / dataMap.Resolution

            // Inversion des axes d'orientation (Carte en horizontal)
            // et application du ratio de resize
            // Theta = - Theta;
            StartY = StartY*drawRatio;
            StartX = StartX*drawRatio;
            EndY = EndY*drawRatio;
            EndX = EndX*drawRatio;

            // Décalage pour tenir compte du centrage de la carte
            if (initialX) StartX = StartX-initialX;
            if (initialY) StartY = StartY-initialY;

            if (initialX) EndX = EndX-initialX;
            if (initialY) EndY = EndY-initialY;


            path.Trajectory[position].Start.X = -StartX;
            path.Trajectory[position].Start.Y = StartY;
            path.Trajectory[position].End.X = -EndX;
            path.Trajectory[position].End.Y = EndY;


            //console.log(poi.Name)
            // ihm.drawLine(ctx, -PoseX, PoseY, -EndX, EndY, 'red');
            // circleWithDirection(-PoseX, PoseY, Theta, "orange", 1, 1); // OK sur I3S/: Inversion XY chez Robosoft...




        }  

     }


    // Dessine la trajectoire d'un Goto sur le Canvas
    exports.drawTrajectory = function (ctx, path) {

        if (! path) return;

        for (position in path.Trajectory) {
                
                
                var path_fromX = path.Trajectory[position].Start.X;
                var path_fromY = path.Trajectory[position].Start.Y;
                var path_toX = path.Trajectory[position].End.X;
                var path_toY = path.Trajectory[position].End.Y;   
        
                ihm.drawLine(ctx, path_fromX, path_fromY, path_toX, path_toY, 'red');
        
        }


    }


    // ZOOM et translations à la souris
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


    // Commandes par boutons--------

   
    exports.setZoom = function (clicks) {
        //var reset = false;
        //if (clicks == 0) zoom(-zoomLevel,reset);
        zoom(-clicks);
    }


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

    // fonction passerelle
    exports.reDrawCanvas = function (){ 
        reDraw();
    }


})(typeof exports === 'undefined'? this['carto']={}: exports);
