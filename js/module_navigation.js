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

    defaultMapName = 'map_unavailable.jpg';
    defaultMapPath = '/images/defaultMaps/';

    /**/


    // Titi:
    // Flags et Ecouteurs pilote/robot pour l'échange des protocoles d'infos de navigation  
    // testFakeRobubox = null; // pour débugg


    // Si c'est un pilote qui éxécute le script
    // - Il demande au serveur si on est en mode simulation ou non
    // Il prévient le robot qu'il doit lui envoyer ses infos de navigation & de cartographie.
    if (type == "pilote-appelant") {
    	

        socket.emit('getFakeRobubox',"");
        
        // A la réponse du serveur:
        socket.on("getFakeRobubox", function(data) { 
            fakeRobubox = data.isFakeRobubox
            // testFakeRobubox = fakeRobubox; // Pour débugg
            //init(load);
            socket.emit("pilotGetNav",{message:"getNavInfos"});
        });

    
        socket.emit('getActiveMap',"");
        //socket.emit('getFakeRobubox',"");
        
        // A la réponse du serveur:
        socket.on("getActiveMap", function(data) { 
            //alert("getActiveMap:"+data.activeMap)
            var mapPath = '/maps/';
            if (data.activeMap == defaultMapName ) mapPath = defaultMapPath;
            else backGroundMap.src = mapPath+data.activeMap;

           //  if (data.activeMap == defaultMapName)


            socket.emit('getFakeRobubox',"");
        });


        // A la réponse du serveur:
        socket.on("getFakeRobubox", function(data) { 
            fakeRobubox = data.isFakeRobubox
            //if (fakeRobubox == true) backGroundMap.src = '/maps/default.png';
            if (fakeRobubox == true) backGroundMap.src = defaultMapPath+'default.png';
            socket.emit("pilotGetNav",{message:"getNavInfos"});
        });

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
            console.log("***********received a GotoPoi************");
            console.log(data);
            var toSend = {"poiname":data.poi}
            komcom.sendGotoPOI(toSend)
            
        });       



        // réception d'un demande de relocalization sur un POI
        socket.on("relocalizeOnPOI", function(data) {
            console.log("***********received a relocalizeOnPOI************");
            console.log(data); 
            komcom.sendWTF(data)
        });   




    }

    
    // Ecouteur coté Pilote: 
    if (type == "pilote-appelant") {
    	
        var OldTextState = "";

        // Reception de données de navigation
        socket.on("navigation", function(data) {
        // console.log(">>> Socket.on(navigation)")   
            
            if (data.command == "map_parameters2") {
    			 
                if (data.dataMap == null) return;
                 
                 
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
                driveStatus = robotInfo.Differential.Status
                statusPath = robotInfo.Navigation.Status;
                linearSpeed = data.robotInfo.Differential.CurrentLinearSpeed;
                angularSpeed = data.robotInfo.Differential.CurrentAngularSpeed;
                // console.log (angularSpeed)

                // console.log (data.robotInfo.Differential)
                // console.log ("Drive Status: "+robotInfo.Differential.Status+" / Speed: "+linearSpeed+ " & " + angularSpeed)
                // console.log ("Navigation Status:"+robotInfo.Navigation.Status +" - avoided:"+robotInfo.Navigation.Avoided)
                
                /*
                if (statusPath == 0 && driveStatus == 0) {
                    statusPath = "Stop"; 
                    // path = null;
                }
                else if (statusPath == 0 && driveStatus != 0) {
                    statusPath = "" ; 
                    path = null;
                }
                /**/
                
                if (statusPath == 0) {statusPath = "Waiting"; path = null;}
                else if (statusPath == 1) statusPath = "Following";
                else if (statusPath == 2) statusPath = "Aiming";
                else if (statusPath == 3) statusPath = "Translating";
                else if (statusPath == 4) statusPath = "Rotating";
                else if (statusPath == 5) statusPath = "Error";
                ihm.displayTrajectoryStatus(statusPath);
                //ihm.displayTrajectoryStatus(statusPath);    
                // Sile robot n'est pas sur une trajectoire, 
                // on vide le tableau de trajectoire pourl'effacer de la carte
                // if (robotInfo.Navigation.Status == 0) path = null;
                // if (statusPath == "Stop") path = null;
                refresh();
    		}


    	});

        //-----------


        // Reception d'un resultat de Goto
         socket.on('gotoStateReturn', function(data) {
            // var response = {"statusCode":statusCode, "statusTitle": statusTitle, "statusComment": statusComment };
            // socket.emit("gotoResult", response);
            ///console.log(data)
            //console.log(data.statusCode)
            //console.log(data.statusTitle)
            //console.log(data.statusComment)

            var textDisplay = null;
            textDisplay = data.statusTitle;
            if (data.statusCode == 202) ihm.displayTrajectoryStatus(textDisplay);
            else if (data.statusComment != null) {
                textDisplay+="<br/>"+data.statusComment
                ihm.displayTrajectoryStatus(textDisplay);
                if (data.statusCode == 404) notifications.writeMessage ("error","Navigation:",textDisplay,5000)    
            } else ihm.displayTrajectoryStatus("");

           

        });


        // Reception d'une trajectoire de Goto 
        socket.on('gotoTrajectory', function(data) {
            //console.log(data);
            //console.log(data.gotoState.Status)
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
            
            /*
            var dateR = tools.humanDateER('R');
            var msg = dateR+' Receive Trajectory path: ';
            console.log(msg)
            console.log(data)
            /**/
        
        });


    }
    

    // ------------------------------------


    /* START */
    /* call init() then load() and finaly refresh() with setInterval */
    // type = pilote-appelant ou robot-appelé
    if (type == "robot-appelé") {
        
        socket.emit('getActiveMap',"");
        //socket.emit('getFakeRobubox',"");
        
        // A la réponse du serveur:
        socket.on("getActiveMap", function(data) { 
            //alert("getActiveMap:"+data.activeMap)
            //backGroundMap.src = '/maps/'+data.activeMap;

            var mapPath = '/maps/';
            if (data.activeMap == defaultMapName ) mapPath = defaultMapPath;
            else backGroundMap.src = mapPath+data.activeMap;
            
            socket.emit('getFakeRobubox',"");
            init(load);
        });


        // A la réponse du serveur:
        socket.on("getFakeRobubox", function(data) { 
            fakeRobubox = data.isFakeRobubox
            //if (data.isFakeRobubox == false) backGroundMap.src = '/maps/mgg01.png'
            if (fakeRobubox == true) backGroundMap.src = defaultMapPath+'default.png';
            clearInterval(loopBattery);
            komcom.getBattery();
            // carto.resetCanvas();
            init(load);
        });


    }



    function init(callback) {

        if (fakeRobubox == null) return;

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
        refresh();
    }


    
    function refresh(stop) {
        
        //console.log('@ refresh()');

        if (stop == 'stop'){
            clearInterval(refreshLoop);
            return;
        }  

        if (fakeRobubox == null) return;
        if (type == "robot-appelé") {
	        
	        var refreshLoop = setInterval(function() {
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
        if (type == "pilote-appelant") {

            list_POI_select = document.querySelector('select#list_POI');

            // On supprime tous les enfants du noeud précédent...
            while (list_POI_select.firstChild) {
                // La liste n'étant pas une copie, elle sera réindexée à chaque appel
                list_POI_select.removeChild(list_POI_select.firstChild);
            }

            for (poi in listPOI) {
                var option = document.createElement('option');
                option.id = listPOI[poi].Id;
                option.value = listPOI[poi].Id;
                option.text = listPOI[poi].Id+":"+listPOI[poi].Name;
                if (listPOI[poi].label) option.text +="("+listPOI[poi].label+")";
                
                //if (listPOI[poi].label) option.text = listPOI[poi].Name+" : "+listPOI[poi].label;
                //else option.text = listPOI[poi].Name;
                list_POI_select.appendChild(option);
            }

        } else if (type == "robot-appelé") {

            // TODO: Liste ul/li des points d'intérêts dans une div avec ascenceur...


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
        
        //var rX = robotInfo.Pose.Position.X;
        //var rY = robotInfo.Pose.Position.Y;

        var rX = robotInfo.Localization.X;
        var rY = robotInfo.Localization.Y;

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
    lastPoiName = null
    var wsTitle = null;
    var wsHtmlContent = null;
    // var isLinkedToWS = false;
    
    
    function webSemanticRecommandations() {

        // if (fakeRobubox != true) return    
        setInterval(function() {
           
           /*
           console.log("---------------------------------")  
           console.log("webSemanticRecommandations(activeRecommandation = "+activeRecommandation+")") 
           console.log("webSemanticRecommandations(lastPoiName = "+lastPoiName+")")
           console.log("webSemanticRecommandations(nearestPoiName = "+nearestPoiName+")")
           /**/
           /**/
            if (robotColor == 'green')  {

                var sceneName = null;
                
                for (poi in listPOI) {
                    
                    if (nearestPoiName == listPOI[poi].Name )  {
                        
                        if (fakeRobubox == true) {

                            /*
                            if (lastPoiName != nearestPoiName) {

                                

                                if (listPOI[poi].label) { 
                                    sceneName = listPOI[poi].label

                                    if (activeRecommandation === false) {
                                        //isLinkedToWS = true;
                                        //var sceneName = selectElmt.options[selectElmt.selectedIndex].value;
                                        socket.emit('getSceneRessources', {scene: sceneName});
                                        console.log( "socket.emit('getSceneRessources', {scene: "+sceneName+"})"    )
                                        activeRecommandation = true;

                                        wsTitle = "Ressources recommandées pour la scène '"+sceneName+"'";
                                        wsHtmlContent = "<div><p>Blabla quelconque...</p></div>";
                                    }
                                    

                          

                                } else {
                                    
                                    // isLinkedToWS = false;
                                    sceneName = nearestPoiName;
                                    wsTitle = "Nearest POI: '"+sceneName+"'";
                                    activeRecommandation = false;
                                }

                                lastPoiName = nearestPoiName
                                notifications.writeRecommandations ("miscelleanous",wsTitle,"")

                            } //if (lastPoiName != nearestPoiName)
                            /**/
                        

                             sceneName = nearestPoiName;
                             // Pour eviter les affichages en boucle
                             if (lastPoiName != nearestPoiName) {
                                    
                                    
                                if (activeRecommandation === false) {

                                    lastPoiName = nearestPoiName
                                    
                                    

                                    if (sceneName == "Poi1") {
                                            //isLinkedToWS = true;
                                            socket.emit('getSceneRessources', {scene: "Marne14"});
                                            console.log( "socket.emit('getSceneRessources', {scene: Marne14 })"    )
                                            activeRecommandation = true;

                                            wsTitle = "Ressources recommandées pour la scène 'Marne 1914'";
                                            wsHtmlContent = "";
                                    
                                    } else if (sceneName == "Poi2") {
                                            //isLinkedToWS = true;
                                            socket.emit('getSceneRessources', {scene: "La_tranchee"});
                                            console.log( "socket.emit('getSceneRessources', {scene: La_tranchee })"    )
                                            activeRecommandation = true;

                                            wsTitle = "Ressources recommandées pour la scène 'Les tranchèes'";
                                            wsHtmlContent = "";
                                    

                                    } else {
                                        // isLinkedToWS = false;

                                        // wsTitle = "Nearest POI: '"+sceneName+"'";
                                        wsTitle = "Nearest POI: '"+sceneName+"'";
                                        activeRecommandation = false;
                                    }



                                    notifications.writeRecommandations ("miscelleanous",wsTitle,"")

                                } // if (activeRecommandation === false)

                            } // if (lastPoiName != nearestPoiName) 







                        } else { // if (fakeRobubox == false)

                             sceneName = nearestPoiName;
                             // Pour eviter les affichages en boucle
                             if (lastPoiName != nearestPoiName) {
                                    
                                    lastPoiName = nearestPoiName
                                    
                                    if (sceneName == "Marne 1914") {
                                            //isLinkedToWS = true;
                                            socket.emit('getSceneRessources', {scene: "Marne14"});
                                            console.log( "socket.emit('getSceneRessources', {scene: Marne14 })"    )
                                            activeRecommandation = true;

                                            wsTitle = "Ressources recommandées pour la scène 'Marne 1914'";
                                            wsHtmlContent = "";
                                    
                                   




                                    } else if (sceneName == "Tranchées") {
                                            //isLinkedToWS = true;
                                            socket.emit('getSceneRessources', {scene: "La_tranchee"});
                                            console.log( "socket.emit('getSceneRessources', {scene: La_tranchee })"    )
                                            activeRecommandation = true;

                                            wsTitle = "Ressources recommandées pour la scène 'Les tranchèes'";
                                            wsHtmlContent = "";
                                    

                                    } else {
                                        // isLinkedToWS = false;

                                        // wsTitle = "Nearest POI: '"+sceneName+"'";
                                        wsTitle = "Nearest POI: '"+sceneName+"'";
                                        activeRecommandation = false;
                                    }


                                    notifications.writeRecommandations ("miscelleanous",wsTitle,"")

                            } // if (lastPoiName != nearestPoiName) 

                        } // if (fakeRobubox == false)   
                
                    } // if (nearestPoiName == listPOI[poi].Name )

                } // for (poi in listPOI)
            
          
            } else if (robotColor == 'blue'){
               lastPoiName = null; 
               activeRecommandation = false;
               notifications.hideAllRecommandations()
            }
        
        }, 1000);
 

    }







    if (type == "pilote-appelant") {
    
        socket.on('onSceneRessources', function(data) {  
        //alert(JSON.stringify(data.sentData))
       
            console.log(">> socket.on('onSceneRessources',data)");
            //console.log(data);
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
                    obj = obj.replace(/_/g, " ");
                    sceneComposedOf[d] = obj;
                }

                if (collection[d].propriete == "hasPicture") scenePictures[d] = collection[d].valeur; 
                if (collection[d].propriete == "hasVideo") sceneVideos[d] = collection[d].valeur; 
                if (collection[d].propriete == "hasWebPage") sceneWebPages[d] = collection[d].valeur;
                if (collection[d].propriete == "hasWikipedia") sceneWikiPedia[d] = collection[d].valeur;
                if (collection[d].propriete == "hasDbpedia") sceneDbPedia[d] = collection[d].valeur;
     
            } // end for(d in collection) 
       
            
            

            var test01 = '<div id="preview">'
                                
                test01 += '  <div id="preview-coverflow" class="gallery clearfix" >'
            
                        // Récupération Données Flora

                        var txtFlora = "";
                        if (sceneNumber) wsTitle = "Scene n°"+ sceneNumber+ " : "+sceneTitle;
                        if (sceneDescription) txtFlora = "<b>Description:</b> "+sceneDescription+"<br/></br>"
                        if (sceneHistoricalMessage) txtFlora += "<b>Contexte historique:</b> "+sceneHistoricalMessage+"<br/><br/>"
                        if (tools.isEmpty(sceneComposedOf) == false) {
                            txtFlora += "<p><b>Scène composée de:</b><ul>";
                            for (obj in sceneComposedOf) {
                                 txtFlora += "<li>"+sceneComposedOf[obj]+"</li>";
                            }
                            txtFlora += "</ul></p>"
                        }
                       // On remplace les simples et doubles quôtes, au cas ou
                       var newTxtFlora = txtFlora.replace("'", "\'");
                       newTxtFlora = newTxtFlora.replace('"', '\"');
                       
                       if ( txtFlora !=  "") {

                            test01 += '<a href="#inline_content_01" rel="prettyPhoto">'
                            test01 += '       <img src="../images/thumbnails/logo_Flora.gif"' 
                            test01 += '        class="cover"'
                            test01 += '        alt="Museum Database Flora"' 
                            test01 += '        title="Museum Database Flora"' 
                            test01 += '        />'
                            test01 += '</a>' 

                            test01 += '<div id="inline_content_01" class="embed_content" style="display:none;">'
                            test01 += '    <h1 style="margin-top:0px;padding-top:0px" >'+wsTitle+'</h1>'
                            test01 += newTxtFlora;
                            test01 += '</div>' 

                       }


                       // Traitement des photos - OK
                       if (tools.isEmpty(scenePictures) == false) {
                            for (obj in scenePictures) {
                                test01 += '<a href="'+scenePictures[obj]+'" rel="prettyPhoto">'
                                test01 += '        <img src="'+scenePictures[obj]+'" '
                                test01 += '        class="cover"'
                                test01 += '        alt="Image" '
                                test01 += '        />'
                                test01 += '</a>'
                            }
                        }
                        /**/
                        

                        // Vidéos - BUG youtube !!!!! (Hatim, pas bien tes urls....)
                        if (tools.isEmpty(sceneVideos) == false) {
                            for (obj in sceneVideos) {
                                // Correction des urls saisies par Hatim dans le dataset
                                var url = sceneVideos[obj].replace("embed/", "watch?v=")
                                // console.log ("@"+sceneVideos[obj]+"@ -- @"+url+"@")
                                test01 += '<a href="'+url+'" rel="prettyPhoto" title="Video">'
                                test01 += '     <img src="../images/thumbnails/movie.png" alt="Video" class="cover" />'
                                test01 += '</a>'
                            
                            }
                        }

                        // Pages Web - OK
                        if (tools.isEmpty(sceneWebPages) == false) {
                            for (obj in sceneWebPages) {
                                test01 += '<a href="'+sceneWebPages[obj]+'?iframe=true&amp;width=100%&amp;height=100%" '
                                test01 += '        rel="prettyPhoto">'
                                test01 += '        <img src="../images/thumbnails/web-page.jpg" alt="Web Page" class="cover" />'
                                test01 += '</a>'

                            }
                        }


                        if (tools.isEmpty(sceneWikiPedia) == false) {
                            for (obj in sceneWikiPedia) {
                                test01 += '<a href="'+sceneWikiPedia[obj]+'?iframe=true&amp;width=100%&amp;height=100%"' 
                                test01 += '        rel="prettyPhoto">'
                               test01 += '        <img src="../images/thumbnails/wikipedia-icon.jpg" alt="Wikipedia Article" class="cover"  />'
                                test01 += '</a>'
                            }
                        }
                        

                        if (tools.isEmpty(sceneDbPedia) == false) {
                            for (obj in sceneDbPedia) {
                                test01 += '<a href="'+sceneDbPedia[obj]+'?iframe=true&amp;width=100%&amp;height=100%"' 
                                test01 += '        rel="prettyPhoto">'
                                
                                 test01 += '        <img src="../images/thumbnails/dbPedia.jpg" alt="dbPedia"  class="cover" />'
                                test01 += '</a>'
                            }
                        }

                    test01 += '</div>'
        
            



                test01 += '</div>'

            var wsTitle = "";
            





            if (sceneNumber) wsTitle = "Scene n°"+ sceneNumber+ " : "+sceneTitle;
            notifications.hideAllRecommandations()
            // 500 ms de tempo en paramètre pour laisser le temps 
            // au plugin lightbox de reparser la page...
            notifications.writeRecommandations ("miscelleanous",wsTitle,test01,500)
            
            /*
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
            /**/
            

            // Affichage des résultats en console
            // console.log("::::::::::::::::::::::::::::::::::::::::::::::")
            
            //if (sceneTitle) console.log(textTitle)
            //if (sceneDescription) console.log("Description: "+sceneDescription);
            //if (sceneHistoricalMessage) console.log("Contexte historique: "+sceneHistoricalMessage);
      
            /*// Si l'objet sceneComposedOf n'est pas vide
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

            // -------------------------------------------------------

        })
    
    }
    /**/






})(typeof exports === 'undefined'? this['navigation']={}: exports);