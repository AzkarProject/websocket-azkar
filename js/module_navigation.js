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


        var precisionXY = 0.4; 
        var precisionTheta = 0.7; // 0.7 pour 70%
        precisionTheta = 360*precisionTheta; //Si 360° = 6.25 Alors 70° = 360/70
        precisionTheta = 6.25 / precisionTheta;

        
        // console.log("@ getNearestPoiName()")

        
        var posX = false;
        var posY = false;
        var posZ = false;

        var matched = false;
        
        var oldNearestPoiName = nearestPoiName;
        for (poi in listPOI) {
            
            // todo: Faire les conversions pour tenir compte des offsets négatifs en X et en Y...
            // Si les X et Y sont tous 2 positifs
            if ( listPOI[poi].Pose.X >= 0 && listPOI[poi].Pose.Y >= 0) {
                    
                    if ( robotInfo.Pose.Position.X >= (listPOI[poi].Pose.X - precisionXY) && robotInfo.Pose.Position.X <= (listPOI[poi].Pose.X + precisionXY) ) posX = true;
            
                    if ( robotInfo.Pose.Position.Y >= (listPOI[poi].Pose.Y - precisionXY) && robotInfo.Pose.Position.Y <= (listPOI[poi].Pose.Y + precisionXY) ) posY = true;


            // Si les X et Y sont tous 2 négatifs
            } else if ( listPOI[poi].Pose.X < 0 && listPOI[poi].Pose.X < 0) {

                    if ( robotInfo.Pose.Position.X >= (listPOI[poi].Pose.X + precisionXY) && robotInfo.Pose.Position.X <= (listPOI[poi].Pose.X - precisionXY) ) posX = true;
            
                    if ( robotInfo.Pose.Position.Y >= (listPOI[poi].Pose.Y + precisionXY) && robotInfo.Pose.Position.Y <= (listPOI[poi].Pose.Y - precisionXY) ) posY = true;


            // Si le X est négatif et le Y positif
            } else if ( listPOI[poi].Pose.X < 0 && listPOI[poi].Pose.X >= 0) {

                    if ( robotInfo.Pose.Position.X >= (listPOI[poi].Pose.X + precisionXY) && robotInfo.Pose.Position.X <= (listPOI[poi].Pose.X - precisionXY) ) posX = true;
            
                    if ( robotInfo.Pose.Position.Y >= (listPOI[poi].Pose.Y - precisionXY) && robotInfo.Pose.Position.Y <= (listPOI[poi].Pose.Y + precisionXY) ) posY = true;
            
            
            // Si le X est positif et le Y négatif    
            } else if ( listPOI[poi].Pose.X >= 0 && listPOI[poi].Pose.X < 0) {

                    if ( robotInfo.Pose.Position.X >= (listPOI[poi].Pose.X - precisionXY) && robotInfo.Pose.Position.X <= (listPOI[poi].Pose.X + precisionXY) ) posX = true;
            
                    if ( robotInfo.Pose.Position.Y >= (listPOI[poi].Pose.Y + precisionXY) && robotInfo.Pose.Position.Y <= (listPOI[poi].Pose.Y - precisionXY) ) posY = true;

            }

            // if ( robotInfo.Pose.Position.Z >= listPOI[poi].Pose.Z - precisionTheta && robotInfo.Pose.Position.Z <= listPOI[poi].Pose.Z + precisionTheta ) posZ = true;


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

    function webSemanticRecommandations() {

        // if (fakeRobubox != true) return
            
        setInterval(function() {
          if (robotColor == 'green')  {

                // déclencer les traitements idoïnes en fonction du nearestPoiName
                // Algo: boucler sur listPOI
                var sceneName = null;
                var title = null;
                var htmlContent = ""; 
                for (poi in listPOI) {
                    
                    if (nearestPoiName == listPOI[poi].Name )  {
                        
                        if (listPOI[poi].label) { 
                            sceneName = listPOI[poi].label
                            title = "Ressources recommandées pour la scène '"+sceneName+"'";
                            htmlContent = "<div><p>Blabla quelconque...</p></div>";
                        } else {
                            sceneName = nearestPoiName;
                            title = "Nearest POI: '"+sceneName+"'";
                        }
                    }
                
                }

              
               notifications.writeRecommandations ("miscelleanous",title,htmlContent)
          
          } else if (robotColor == 'blue'){

               notifications.hideAllRecommandations()
          }
        }, 1000);
 

    }



})(typeof exports === 'undefined'? this['navigation']={}: exports);