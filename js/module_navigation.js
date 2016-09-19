// ---- Points Of Interest


(function(exports){


	console.log("module_navigation chargé")


    // Titi:  délai de rafraichissement carto en ms
    refreshDelay = 100; // 100ms (600ms ca saccade un peu) 

    // Datamap et robotInfo en variable globales...
    dataMap = null; // height , width , offset (x,y) , resolution
    robotInfo = null; // Pos X, Y et theta du robot
    listPOI = null;  
    nearestPoiName = null;

    // Trajectoire en cours.
    path = null;

    // Message d'information de trajectoire
    statusPath = "";

    /**/


    // Titi:
    // Flags et Ecouteurs pilote/robot pour l'échange des protocoles d'infos de navigation
    // var pilotGetNav = false; // Flag d'échange par défaut.  
    // si c'est un pilote qui éxécute le script
    // Il prévient le robot qu'il doit lui envoyer ses infos de navigation & de cartographie.
    if (type == "pilote-appelant") {
    	pilotGetNav = true;
    	socket.emit("pilotGetNav",{message:"getNavInfos"});
    }
    
    // Ecouteur coté Robot: 
    if (type == "robot-appelé") {
    	
        // reception demande d'échange de données cartos
        // Flag d'échange a true et envoi au pilote des paramètres de la carte
        socket.on("pilotGetNav", function(data) {
    		if (data = "getNavInfos") {
    			// pilotGetNav = true;
                var toSend = {"dataMap":dataMap, "listPOI":listPOI,}
    			//navigation_interface.sendToPilote("map_parameters", dataMap); // envoi parametres de la map
                navigation_interface.sendToPilote("map_parameters2", toSend); // envoi parametres de la map
                // navigation_interface.sendToPilote("list_POI", listPOI); // envoi liste des POI
            }
    	});


        
        // reception d'un ordre gotoPOI
        socket.on("gotoPOI", function(data) {
            
            // Mémo:
            // >>> POST: Commande "Aller vers un point d'intérêt"
            // http://127.0.0.1:7007/Navigation/Goto/POI
            // Envoi: {"poiname":"PilierA"}
            // Réponse: HTTP 204 (No content) / 
            // alert (data)
            var toSend = {"poiname":data.poi}
            komcom.sendGotoPOI(toSend)
            
        });       

    }

    
    // Ecouteur coté Pilote: 
    if (type == "pilote-appelant") {
    	
        var OldTextState = "";

        // Reception de données de navigation
        socket.on("navigation", function(data) {
           
            if (data.command == "map_parameters2") {
    			 console.log(">>> Socket.on(navigation)")
                 console.log(data.dataMap);
                 console.log(data.listPOI);
                 dataMap = data.dataMap;
                 listPOI = data.listPOI;
                 manageListPOIs(listPOI) // Ok
    			 mapSize = carto.resizeRatio(dataMap.Width, dataMap.Height, canvasWidth, canvasHeight)
                 //console.log (mapSize)
    		     //DATAMAP = data.dataMap;
                 //mapSize = resizeRatio(dataMap.Width, dataMap.Height, canvasWidth, canvasHeight)

            } else if (data.command == "robot_localization") {
    			 

                robotInfo = data.robotInfo;

                nearestPoiName = robotInfo.nearestPoiName;
                robotColor = robotInfo.robotColor;
                statusPath = robotInfo.statusPath;

                if (fakeRobubox == true) ihm.displayTrajectoryStatus(statusPath)


                if (robotInfo.State == 0) textState = "Invalid";
                else if (robotInfo.State == 1) textState = "Metric";
                else if (robotInfo.State ==  2) textState = "Decimetric";
                else if (robotInfo.State ==  4) textState = "Centimetric";
                else if (robotInfo.State ==  8) textState = "Proprioceptive";
                else if (robotInfo.State ==  16) textState = "Exteroceptive";
                else if (robotInfo.State ==  32) textState = "Error";

    			
                // if (robotInfo.State != 16)  { path=null;} // Plante en version non simulée...


                if (OldTextState != textState ) { 
                    // console.log("New Robot State: "+textState)
                    OldTextState = textState;
                }
                refresh();
    		}


    	});

        //-----------


        // Reception d'une trajectoire de Goto 
        socket.on('gotoTrajectory', function(data) {
            //console.log(data);
            //console.log(data.gotoState.Status)
            var textStatus = "???";
            path = data.path;
            carto.convertPath();

           /*
            if (data.gotoState.Status == 0) textStatus = "Waiting";
            else if (data.gotoState.Status == 1) textStatus = "Following";
            else if (data.gotoState.Status == 2) textStatus = "Aiming";
            else if (data.gotoState.Status == 3) textStatus = "Translating";
            else if (data.gotoState.Status == 4) textStatus = "Rotating";
            else if (data.gotoState.Status == 5) textStatus = "Error";
            /**/
            
            var dateR = tools.humanDateER('R');
            var msg = dateR+' Receive Trajectory path: '+textStatus;

            console.log(msg)
            // console.log(data)
        
        });



        // Reception du Statut (et trajectoire) d'une commande Goto 
        socket.on('gotoStateReturn', function(data) {
            //console.log(data);
            //console.log(data.gotoState.Status)
            var textStatus = "???";
            var trajectory = data.gotoState.Trajectory;
            if (data.gotoState.Status == 0) textStatus = "Waiting";
            else if (data.gotoState.Status == 1) textStatus = "Following";
            else if (data.gotoState.Status == 2) textStatus = "Aiming";
            else if (data.gotoState.Status == 3) textStatus = "Translating";
            else if (data.gotoState.Status == 4) textStatus = "Rotating";
            else if (data.gotoState.Status == 5) textStatus = "Error";
            
            //var dateR = tools.humanDateER('R');
            //var msg = dateR+' Trajectory Status: '+textStatus;

            if (fakeRobubox == false) {
                ihm.displayTrajectoryStatus(textStatus)
            }
        
        });

        //-------------


    }
    

    // ------------------------------------


    /* START */
    /* call init() then load() and finaly refresh() with setInterval */
    // type = pilote-appelant ou robot-appelé
    if (type == "robot-appelé") init(load);

    function init(callback) {

   
        console.log('@ init(callback)');      
        
        // On met le deffered en variable globale
        // Pour le modifier ds une autre fonction
        DEFFERED_DataMap = $.Deferred();
        DEFFERED_RobotInfo = $.Deferred();
    	DEFFERED_listPOI = $.Deferred();

        $.when(DEFFERED_DataMap, DEFFERED_RobotInfo).done(function(v1, v2) {
        //$.when(DEFFERED_DataMap, DEFFERED_RobotInfo).done(function(v1, v2) {
            mapSize = carto.resizeRatio(dataMap.Width, dataMap.Height, canvasWidth, canvasHeight)
            //if (listPOI != null) receiveListPoi();
            //receiveListPoi();
            callback();
        });

        var init = true;
        komcom.getRobotInfo(init);
        komcom.getDataMap();
        komcom.getListPOI();
        

    }

    function load() {
        console.log('@ load()');
        receiveListPoi()
        mapSize = carto.resizeRatio(dataMap.Width, dataMap.Height, canvasWidth, canvasHeight)

        //var toSend = {"dataMap":dataMap, "listPOI":listPOI,}
        //navigation_interface.sendToPilote("map_parameters2", toSend); // envoi parametres de la map

        refresh();
    }


    
    function refresh() {
        
        //console.log('@ refresh()');

        if (type == "robot-appelé") {
	        
	        setInterval(function() {
                if (fakeRobubox == true) navigation.simulateRobotInfo();
                else {
                    komcom.getRobotInfo();
                    navigation.getNearestPoiName();
                }

                robotInfo.nearestPoiName = nearestPoiName;
                robotInfo.robotColor = robotColor;
                robotInfo.statusPath = statusPath;


	            // si Pilote connecté: envoi datas carto Robot >> Pilote activé
	            if ( isOnePilot == true) navigation_interface.sendToPilote("robot_localization", robotInfo);
                //reDraw();
                carto.reDrawCanvas();
	        }, refreshDelay); // 600
    	
    	} else if (type = "pilote-appelant") {
    		
            if (dataMap == null) socket.emit("pilotGetNav",{message:"getNavInfos"});
    		else if (dataMap != null) carto.reDrawCanvas();
    	}

    }
    /**/


    // Robot. A la reception de la liste des POIs
    function receiveListPoi() {
        console.log("@ receiveListPoi()");
        populateListPOIs(listPOI);
    }

    

    // Pilote: début traitement & persistence des Maps/Pois/Scenes/Parcours coté client
    var singleton = false; // Pour éviter le doublonnage de la liste...
    function manageListPOIs(listPOI) {
        console.log("@ manageListPOIs()");
        console.log("singleton = "+singleton);
        if (listPOI != null || singleton === false ) {   
            populateListPOIs(listPOI);
            singleton = true;
        }
    }

    function populateListPOIs(listPOI) {
        console.log("@ populateListPOIs()");
        listPOI = null;
        if (listPOI == null) listPOI = [];
        // if (singleton === true) {
            list_POI_select = document.querySelector('select#list_POI');
            
            for (poi in listPOI) {
                var option = document.createElement('option');
                option.id = listPOI[poi].Name;
                option.value = listPOI[poi].Name;
                if (listPOI[poi].label) option.text = listPOI[poi].Name+" : "+listPOI[poi].label;
                else option.text = listPOI[poi].Name;
                list_POI_select.appendChild(option);
            }

    }
    

    var oldPoiTextMatch = null;
    
    exports.getNearestPoiName = function() {
   

        //console.log ("@ getNearestPoiName()")
        //if (type == "pilote-appelant") {}

        // Distance de détection du POI le plus proche
        var precisionXY = 0.4; 
        
        // Angle de vision (non utilisé pour l'instant) 
        var precisionTheta = 0.7; // 0.7 pour un champ de vision de 70%
        // Si 360° correspond à 6.25 pour la Robubox/KomNav, 
        // Alors pour obtenir un champ de vision de 70% il fait faire = 6.25/(360*0.70)
        precisionTheta = 360*precisionTheta; 
        precisionTheta = 6.25 / precisionTheta;


        var posX = false;
        var posY = false;
        var posZ = false;

        var matched = false; // Flag de détection
        var oldNearestPoiName = nearestPoiName; // Mémorisation du POI précedent
        var testCase = null; // Message de débug
        
        var rX = robotInfo.Pose.Position.X;
        var rY = robotInfo.Pose.Position.Y;

        // On arrondit tout ca a 2 décimales pour une meilleure lisibilité des offsets
        rX = Math.round(rX*100)/100;
        rY = Math.round(rY*100)/100;

        for (poi in listPOI) {
            
            // R.A.Z pour éviter les faux positifs
            posX = false;
            posY = false;

            // Coordonnées XY du point d'intérêt
            var pX = listPOI[poi].Pose.X;
            var pY = listPOI[poi].Pose.Y;
            pX = Math.round(pX*100)/100;
            pY = Math.round(pY*100)/100;
            
            // On arrondit les fourchettes Mini/Maxi des offsets XY
            var cx1 = pX - precisionXY;
            var cx2 = pX + precisionXY;
            var cy1 = pY - precisionXY;
            var cy2 = pY + precisionXY;
            cx1 = Math.round(cx1*100)/100;
            cx2 = Math.round(cx2*100)/100;
            cy1 = Math.round(cy1*100)/100;
            cy2 = Math.round(cy2*100)/100;

            testCase = "X:"+pX+"/Y:"+pY+") - MargeX(mini:"+cx1+"/maxi:"+cx2+") - MargeY(mini:"+cy1+"/maxi:"+cy2+") - Robot(X:"+rX+"/Y:"+rY;

            // Si les X et Y sont tous 2 positifs (cas pilier A,B,Armoire et Bureau415 ) >> OK
            if ( pX >= 0 && pY >= 0) {
                    if ( rX >= (cx1) && rX <= (cx2) ) posX = true;
                    if ( rY >= (cy1) && rY <= (cy2) ) posY = true;        
            } 
            // Si le X est négatif et le Y positif (cas des pilier C et D )
            else if ( pX < 0 && pY >= 0) {
                    if (rX <= (pX + precisionXY) && rX >= (pX - precisionXY) ) posX = true;
                    if (rY >= (pY - precisionXY) && rY <= (pY + precisionXY) ) posY = true;
            } 
            // Si les X et Y sont tous 2 négatifs (Non testé)
            else if ( pX < 0 && pY < 0) {
                    if ( rX <= (pX + precisionXY) && rX >= (pX - precisionXY) ) posX = true;
                    if (rY <= (pY + precisionXY) && rY >= (pY - precisionXY) ) posY = true;
            } 
            // Si le X est positif et le Y négatif (non testé)
            else if ( pX >= 0 && pY < 0) {
                    if ( rX >= (pX - precisionXY) && rX <= (pX + precisionXY) ) posX = true;
                    if ( rY <= (pY + precisionXY) && rY >= (pY - precisionXY) ) posY = true;
            }


            if ( posX == true && posY == true) {
                //console.log ("nearest Poi Name: " + listPOI[poi].Name)
                nearestPoiName = listPOI[poi].Name;
                matched = true;
                robotColor = 'green';
                break;
                //console.log ( " Robot Position Name "+ nearestPoiName);
            } else nearestPoiName = null
        }

        if (matched == false) {
            robotColor = 'blue';
            nearestPoiName = null
        } 
        // console.log ( " Robot Position Name "+ nearestPoiName);
        //console.log(nearestPoiName+"("+testCase+")");

    }

    

    countSimulation = 0
    sensSimulation = true;
    incrementDegree = 0.01;
    activeTrajectory = false;

    // function simulateRobotMove() {
    exports.simulateRobotInfo = function (){ 
        //console.log("@ simulateRobotMove")

        /*// 1ère version:
        // Un simple compteur qui inverse le sens
        // Toute les 20 secondes (100ms * 200)
        countSimulation += 1;
        if (countSimulation == 100) {
            incrementDegree = -incrementDegree;
            countSimulation = 0;
        }
        //robotInfo.Pose.Orientation += incrementDegree*4; // 6.25 pour un 360
        robotInfo.Pose.Orientation += incrementDegree; // 6.25 pour un 360
        robotInfo.Pose.Position.X += incrementDegree;               
        robotInfo.Pose.Position.Y += incrementDegree;
        /**/ // Fin première version

        navigation.getNearestPoiName();  
        // navigation.fakeFollowTrajectory()  

    }

    // boucle de contrôle de changement de point d'intérêt
    // pour déclencher la récupération de ressources Web sémantique...
    // Ne s'éxecute que coté Client...
    if (type == "pilote-appelant") {
        webSemanticRecommandations();
    }
    
    
    activeRecommandation = false;
    var wsTitle = null;
    var wsHtmlContent = null;
    function webSemanticRecommandations() {

        // if (fakeRobubox != true) return    
        setInterval(function() {
          
          if (robotColor == 'green')  {

                console.log("activeRecommandation:"+activeRecommandation)
                // déclencer les traitements idoïnes en fonction du nearestPoiName
                // Algo: boucler sur listPOI
                var sceneName = null;
                //var title = null;
                //var htmlContent = ""; 
                for (poi in listPOI) {
                    
                    if (nearestPoiName == listPOI[poi].Name )  {
                        
                        if (fakeRobubox == true) {

                            if (listPOI[poi].label) { 
                                sceneName = listPOI[poi].label

                                if (activeRecommandation === false) {
                                    
                                    //var sceneName = selectElmt.options[selectElmt.selectedIndex].value;
                                    socket.emit('getSceneRessources', {scene: sceneName});
                                    console.log( "socket.emit('getSceneRessources', {scene: "+sceneName+"})"    )
                                    //activeRecommandation = true;

                                    wsTitle = "Ressources recommandées pour la scène '"+sceneName+"'";
                                    wsHtmlContent = "<div><p>Blabla quelconque...</p></div>";
                                    //console.log(wsTitle);
                                    /**/
                                    
                                }

                            } else {
                                sceneName = nearestPoiName;
                                wsTitle = "Nearest POI: '"+sceneName+"'";
                                activeRecommandation = false;
                            }

                    // if (fakeRobubox == false)        
                    } else {

                         sceneName = nearestPoiName;
                         
                        if (sceneName == "PilierA") {
                                
                                socket.emit('getSceneRessources', {scene: "Marne14"});
                                console.log( "socket.emit('getSceneRessources', {scene: Marne14 })"    )
                                    //activeRecommandation = true;

                                wsTitle = "Ressources recommandées pour la scène 'Marne14'";
                                wsHtmlContent = "";
                        
                        } else if (sceneName == "PilierB") {

                                socket.emit('getSceneRessources', {scene: "La_tranchee"});
                                console.log( "socket.emit('getSceneRessources', {scene: La_tranchee })"    )
                                    //activeRecommandation = true;

                                wsTitle = "Ressources recommandées pour la scène 'La_tranchee'";
                                wsHtmlContent = "";
                        

                        } else {
                            wsTitle = "Nearest POI: '"+sceneName+"'";
                            activeRecommandation = false;
                        }



                    }
                
                }

            }
            if (activeRecommandation === false) notifications.writeRecommandations ("miscelleanous",wsTitle,"")
          
          } else if (robotColor == 'blue'){

               activeRecommandation = false;
               notifications.hideAllRecommandations()
          }
        }, 1000);
 

    }







    if (type == "pilote-appelant") {
    
        socket.on('onSceneRessources', function(data) {  
        //alert(JSON.stringify(data.sentData))
       
            console.log(">> socket.on('onSceneRessources',data)");
            activeRecommandation = true;
            // Variables & Objets des ressources
            var collection = data.sentData
            var sceneNumber = null;
            var sceneTitle = null;
            var sceneDescription = null;
            var sceneHistoricalMessage = null;
            var sceneComposedOf = {};
            var scenePictures = {};
            var sceneVideos = {};
            var sceneWebPages = {};
            var sceneWikiPedia = {};
            var sceneDbPedia = {};
            var sceneMuseumDomain = null;

            // console.log(collection); // Debug

            for(d in collection){
                       
                // Affectation des résultats
                if (collection[d].propriete == "hasSceneNumber") sceneNumber = collection[d].valeur; 
                if (collection[d].propriete == "title") sceneTitle = collection[d].valeur;  
                if (collection[d].propriete == "hasDescription") sceneDescription = collection[d].valeur;
                if (collection[d].propriete == "hasHistoricalMessage") sceneHistoricalMessage = collection[d].valeur;  

                if (collection[d].propriete == "ComposedOf") {
                    var obj = collection[d].valeur;
                    obj = obj.substr(obj.lastIndexOf('#') + 1);
                    obj=obj.replace(/_/g, " ");
                    sceneComposedOf[d] = obj;
                }

                if (collection[d].propriete == "hasPicture") scenePictures[d] = collection[d].valeur; 
                if (collection[d].propriete == "hasVideo") sceneVideos[d] = collection[d].valeur; 
                if (collection[d].propriete == "hasWebPage") sceneWebPages[d] = collection[d].valeur;
                if (collection[d].propriete == "hasWikipedia") sceneWikiPedia[d] = collection[d].valeur;
                if (collection[d].propriete == "hasDbdedia") sceneDbPedia[d] = collection[d].valeur;
     
            } // end for(d in collection) 
       
            var wsTitle = "";
            var wsHtmlContent = "";

            if (sceneNumber) wsTitle = "Scene n°"+ sceneNumber+ " : "+sceneTitle;
            if (sceneDescription) wsHtmlContent = "<b>Description:</b> "+sceneDescription+"<br/>"
            if (sceneHistoricalMessage) wsHtmlContent += "<b>Contexte historique:</b> "+sceneHistoricalMessage+"<br/>"
            if (tools.isEmpty(sceneComposedOf) == false) {
                    wsHtmlContent += "<p><b>Scène composée de:</b><ul>";
                    for (obj in sceneComposedOf) {
                         wsHtmlContent += "<li>"+sceneComposedOf[obj]+"</li>";
                    }
                    wsHtmlContent += "</ul></p>"
            }



            notifications.hideAllRecommandations()
            notifications.writeRecommandations ("miscelleanous",wsTitle,wsHtmlContent)
            

            /*// Affichage des résultats en console
            console.log("::::::::::::::::::::::::::::::::::::::::::::::")
            
            if (sceneTitle) console.log(textTitle)
            if (sceneDescription) console.log("Description: "+sceneDescription);
            if (sceneHistoricalMessage) console.log("Contexte historique: "+sceneHistoricalMessage);
      
            // Si l'objet sceneComposedOf n'est pas vide
            if (tools.isEmpty(sceneComposedOf) == false) {
            console.log ("Scène composée de:");
            console.log (sceneComposedOf)
            }
            if (tools.isEmpty(scenePictures) == false) {
                console.log ("Images:");
                console.log (scenePictures)
            }
            if (tools.isEmpty(sceneVideos) == false) {
                console.log ("Videos:");
                console.log (sceneVideos)
            }
            if (tools.isEmpty(sceneWebPages) == false) {
                console.log ("Pages Web:");
                console.log (sceneWebPages)
            }
            if (tools.isEmpty(sceneWikiPedia) == false) {
                console.log ("WikiPedia:");
                console.log (sceneWikiPedia)
            }
            if (tools.isEmpty(sceneDbPedia) == false) {
                console.log ("DbPedia:");
                console.log (sceneDbPedia)
            }
            /**/

        })
    
    }
    /**/






})(typeof exports === 'undefined'? this['navigation']={}: exports);