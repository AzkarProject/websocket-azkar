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

    activeMapNameFile = null;



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

            activeMapNameFile = data.activeMap;
            getTrails(activeMapNameFile);
           //alert ("activeMap = " + activeMapNameFile)


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
            //console.log(data);
            var toSend = {"poiname":data.poi}
            komcom.sendGotoPOI(toSend)
            
        });       



        // réception d'un demande de relocalization sur un POI
        socket.on("relocalizeOnPOI", function(data) {
            console.log("***********received a relocalizeOnPOI************");
            //console.log(data); 
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
                 
                 
                 //console.log(data.dataMap);
                 //console.log(data.listPOI);
                 dataMap = data.dataMap;
                 listPOI = data.listPOI;
                 manageListPOIs(listPOI) // Ok
    			 mapSize = carto.resizeRatio(dataMap.Width, dataMap.Height, canvasWidth, canvasHeight)
                 //console.log (mapSize)
    		     //DATAMAP = data.dataMap;
                 //mapSize = resizeRatio(dataMap.Width, dataMap.Height, canvasWidth, canvasHeight)
                 getAllMapScenes()

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

            console.log('@gotoStateReturn');
            console.log(data);

            var textDisplay = null;
            textDisplay = data.statusTitle;
            if (data.statusCode == 202) {
                ihm.displayTrajectoryStatus(textDisplay);
            
            } else if (data.statusCode == 409) {

                textDisplay = "The robot is already moving. Please wait for its complete stop !"
                notifications.writeMessage ("warning","Navigation:",textDisplay,5000)  
            
            } else if (data.statusComment != null) {
                textDisplay+="<br/>"+data.statusComment
                ihm.displayTrajectoryStatus(textDisplay);
                if (data.statusCode == 404) notifications.writeMessage ("warning","Navigation:",textDisplay,5000)    
            
            } else {
                ihm.displayTrajectoryStatus("");
            }

           

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
        //console.log("singleton = "+singleton);
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

    // Web sémantique -- Version 2017
    // ----------------------------------------------------------------------

    // todo: Remplacer ca par un paramètre en admin
    //var urlProxy= "https://127.0.0.1/";
    var urlCorese = "http://134.59.130.147"

    // idem: Récupérer le nom de la map active ds les paramètres
    // Ou via un script....
    //var activeMap = activeMapNameFile
    //alert (activeMap)
    // activeMapNameFile


    //var urlCorese = "http://corese.inria.fr"

    // Au charegement de la page on cache le bouton des trails (Trails)
    ihm.setDisplay ('switchOpenTrail','close')
 
    AllScenes = [];
    var ExternalRessourceslistName=[];
    var ExternalRessourcesObjects=[];
    var TrailsName=[];
    var TrailsObjects=[];
    var TrailObjectsLinkedToScene = []
    var TrailStepsName=[];
    var TrailStepsObjects = []
    //var TrailScenes=[];
    

    museumScene = new Object();
    museumScene.label = null;
	museumScene.hasBoundingBox= null;
	museumScene.hasDescription=  null;
	museumScene.hasHistoricalMessage= null;
	museumScene.hasID= null;
	museumScene.hasKeyWords= null;
	museumScene.hasPicture= null;
	museumScene.linkedToExternalRessource = ExternalRessourceslistName;

	function resetMuseumSceneObject() {
		ExternalRessourceslistName=[]
		museumScene.hasBoundingBox= null;
		museumScene.hasDescription=  null;
		museumScene.hasHistoricalMessage= null;
		museumScene.hasID= null;
		museumScene.hasKeyWords= null;
		museumScene.hasPicture= null;
		//museumScene.linkedToMap= null;
		//museumScene.linkedToPOI= null;
		//museumScene.linkedToTrail= null;
		museumScene.label= null;
	}
	/**/

    function convertXmlToJson(result,typeRequest) {
        var parser = new DOMParser();
        var xmlDoc = parser.parseFromString(result, "text/xml");
        var x2js = new X2JS();
        var jsonObj = x2js.xml2json(xmlDoc);
        return jsonObj;
    }

    function getSparqlUri (object){
    	var binding0 = object.binding[0].uri;
    	var binding1 = object.binding[1].uri;
    	if (binding0 != undefined) return binding0
    	else if (binding1 != undefined) return binding1
    }
    
    function getSparqlProperty(uri){
    	var property = uri.substring(uri.lastIndexOf("#")+1);
    	return property;
    }
    
   
    function getSparqlStringText(object){
    	var text = object.__text
    	
    	//console.log(dataType)
    	//dataType = dataType.substring(dataType.lastIndexOf("#")+1);
    	// console.log(object)
    	return text;
    }

    // Pour débug...
    // Todo: A virer
    function open_infos(url, nomRessource) {
      
       window.open(url,nomRessource,'menubar=no, scrollbars=no, top=100, left=100, width=300, height=200');
    }

    
    function getNameWithoutExtension(filename){
        var parts = filename.split(".");
        return (parts[0])
    } 


    function getSceneMedias(listUriMedias){

        console.log("@getSceneMedias(listUriMedias)")
        //console.log(listUriMedias);

        for(m in listUriMedias){

            var resultSparql = null
            var urlMedia = urlCorese+"/tutorial/azkar?query=select ?y ?z where {?x rdfs:label '"+listUriMedias[m]+"'.?x <http://azkar.musee_Ontology.fr/amo%23linkedToScene> '"+sceneName+"' .?x ?y ?z}"

            var data = { url: urlMedia, typeRequest: "getSceneMedias"}  
            socket.emit('executeSPARQL',data);

        } 

    }
    

    function getTrails(activeMapNameFile) {
        
        console.log("@getTrails(activeMapNameFile)")

        // Virer le .png ou autre du namefile de la map
        activeMap = getNameWithoutExtension(activeMapNameFile)
        
        // Lancer la récupération des trails proposés sur cette map
        var urlTrails = urlCorese+"/tutorial/azkar?query=select ?z where { <http://azkar.musee_Ontology.fr/schema%23"+activeMap+"> <http://azkar.musee_Ontology.fr/amo%23linkedToTrail> ?z}"; 
        
        var data = { url: urlTrails, typeRequest: "getMapTrailsNames", requestObject: activeMap} 
        console.log ("--------------------- GETTRAILS ??? -----------") 
        socket.emit('executeSPARQL',data);
    }


    
    function getTrailsObjects(TrailsName) {
        
        console.log("@getTrailsObjects(TrailsName)")
        // Pour chaque trail aller chercher son contenu...
        // Et l'ajouter au var TrailsObjects=[];
        for(tr in TrailsName){
            var requestName = TrailsName[tr];
            var urlScenes = urlCorese+"/tutorial/azkar?query=select * where {<http://azkar.musee_Ontology.fr/schema%23"+requestName+"> ?b ?c}"
            var data = { url: urlScenes,typeRequest: "getTrailObject" } 
            socket.emit('executeSPARQL',data);
        } 

    }

    /*
    function displaySceneRessources (scene, extMedias) {

    		console.log("@ displayScenesRessources(scene, extMedias)");
            //console.log(extMedias);

            // Variables & Objets des ressources
            var collection = {}
            //var collection = data.sentData
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

            return; // Pour débugg - Ne pas exécuter la suite...

            //console.log(data);
            activeRecommandation = true;
            


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
    } 
    /**/   

    
    function displayReccomendedRessources(medias){
       // alert (medias.length + "Medias externes")
       // Todo: 

        console.log("@displayReccomendedRessources(medias)");
        //console.log(data);
        activeRecommandation = true;
        // Variables & Objets des ressources
        var collection = medias;
        var sceneNumber = museumScene.hasID
        var sceneTitle = museumScene.label;
        var sceneDescription = museumScene.hasDescription
        var sceneHistoricalMessage = museumScene.hasHistoricalMessage
        var sceneComposedOf = {};
        var scenePictures = {};
        var sceneVideos = {};
        var sceneWebPages = {};
        var sceneWikiPedia = {};
        var sceneDbPedia = {};
        var sceneMuseumDomain = null;


        for(m in medias){

            //console.log(collection[m])
            //console.log(collection[m].hasMediaType)
            
            if (collection[m].hasMediaType == "Picture")   {
                scenePictures[m] = collection[m].label;

            }  

            if (collection[m].hasMediaType == "Video")   {  
                sceneVideos[m] = collection[m].label;

            } 

            if (collection[m].hasMediaType == "webPage")   {  
                
                if (collection[m].hasProvider == "wikipedia") {
                    sceneWikiPedia[m] = collection[m].label;
                } else {
                    sceneWebPages[m] = collection[m].label;
                }

            }  

            if (collection[m].hasMediaType == "webPage")   {  
                sceneWebPages[m] = collection[m].label;
            } 

            if (collection[m].hasMediaType == "dbpedia")   {  
                sceneDbPedia[m] = collection[m].label;
            }      
               
     
        } 


            var test01 = '<div id="preview">'
                            
            test01 += '  <div id="preview-coverflow" class="gallery clearfix" >'
        
                    // Récupération Données Flora

                    var txtFlora = "";
                    if (sceneNumber) wsTitle = "Scene n°"+ sceneNumber+ " : "+ sceneTitle;
                    if (sceneDescription) txtFlora = "<b>Description:</b> "+sceneDescription+"<br/></br>"
                    if (sceneHistoricalMessage) txtFlora += "<b>Contexte historique:</b> "+sceneHistoricalMessage+"<br/><br/>"
                    /*
                    if (tools.isEmpty(sceneComposedOf) == false) {
                        txtFlora += "<p><b>Scène composée de:</b><ul>";
                        for (obj in sceneComposedOf) {
                             txtFlora += "<li>"+sceneComposedOf[obj]+"</li>";
                        }
                        txtFlora += "</ul></p>"
                    }
                    /**/
                   
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
                   /**/


                   // Traitement des photos - OK
                   if (tools.isEmpty(scenePictures) == false) {
                        for (obj in scenePictures) {
                            test01 += '<a href="'+scenePictures[obj]+'" rel="prettyPhoto">'
                            test01 += '        <img src="'+scenePictures[obj]+'" '
                            test01 += '        class="cover"'
                            test01 += '        alt="" '
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
    }
    /**/

   
    
    function populateFormTrails(TrailsObjects) {
        console.log("@populateTrails(TrailsObjects)");
        //console.log(TrailsObjects);
        Trail_AutoSelect = document.querySelector('select#list_TRAILS');
        

        // On supprime tous les enfants du noeud précédent...
        while (Trail_AutoSelect.firstChild) {
            // La liste n'étant pas une copie, elle sera réindexée à chaque appel
            Trail_AutoSelect.removeChild(Trail_AutoSelect.firstChild);
        }


        // remplis la liste de choix
        for (obj in TrailsObjects) {

            var option = document.createElement('option');
            option.id = TrailsObjects[obj].label;
            option.value = TrailsObjects[obj].label;
            console.log(TrailsObjects[obj])
            var duration = "";
            if (TrailsObjects[obj].hasDuration != null) duration = " ("+TrailsObjects[obj].hasDuration+")";
            option.text = TrailsObjects[obj].label+duration
            Trail_AutoSelect.appendChild(option);
    
        }    


    }



    // Parcours choisi
    var selectedTrail = null;
    exports.manageTrail = function (order) {
        console.log("@manageTrails("+order+")")
        // alert("@manageTrails("+order+")")
   
        if (order == 'select') {
            
            // Selection du parcours
            // On réupère l'objet trail dont la propriété 'Label' correspond a la liste de sélection
            var value = $('#list_TRAILS').val();
            selectedTrail = tools.searchInObjects(TrailsObjects,'label',value,'object')
            

            // On remet a zéro les flags d'état du trail
            resetFlagsTrails()
            getTrailSteps()
            
            displayTrail();
        
        }   else if (order == 'change') {
            
            // Reset de flags et variables
            resetFlagsTrails()
            selectedTrail = null;
            TrailStepsName=[];
            TrailStepsObjects = [];

            // Todo
            // si un trajet est lancé, on le stoppe et on le remet a zéro
            // Ensuite on laisse l'afficheur proposer un autre trajet...


        }   else if (order == 'next') {

               // Si pas de nextStep, on lance la réorganisation des steps
               // Et on prend le premier  du tableau
               if (!nextStep) {
                    startTrail()
                    nextStep = TrailStepsObjects[0]
               } 
               
               var nextPOI = nextStep.linkedToPOI;
               alert ("Go to: "+nextPOI);

                // Faire correspondre le nom du POI et son ID 
                for (poi in listPOI) {
                                
                    if (nextPOI == listPOI[poi].Name) {
                        nextPOI = listPOI[poi].Id;
                        gotoStep(nextPOI);
                        break;
                    }

                }
          


        }  

   }

   function displayTrail(){
        
        console.log("@displayTrail()")
        console.log(selectedTrail)

        var Name = '<b>Recommended Trail name </b> '+selectedTrail.label+".<br/>"
        var Level = ''; if (selectedTrail.hasAcademicLevel != null) Level = "<b>Level</b>: '"+selectedTrail.hasAcademicLevel+". ";
        var Duration = ''; if (selectedTrail.hasDuration != null) Duration = "<b>Duration</b>: "+selectedTrail.hasDuration+". ";
        var Language = ''; if (selectedTrail.hasUsualLanguage != null) Language = "<b>Language</b>: "+selectedTrail.hasUsualLanguage+".";
        var Description = ''; if (selectedTrail.hasDescription != null) Description = '<br/><b>Description</b>: "'+ selectedTrail.hasDescription+'".';
        
        var linkedToScene = [];
        var ScenesName = '<hr/><b>Recommended Scenes</b>: ';

        
        for (t in selectedTrail.linkedToScene ) {
             
             linkedToScene[t] = selectedTrail.linkedToScene[t];   
        }
        
        for (s in linkedToScene) {
             ScenesName += linkedToScene[s]+", ";
        }
        
        if (linkedToScene.length == 0) ScenesName = ""
        /**/
        var textTrail = Name+Level+Duration+Language+Description+ScenesName;
        //$('#robotStatusMessage').replaceWith(" <span id='robotStatusMessage'>"+textStatus+"</span>");

         $('#trailDetailsMessage').replaceWith(" <span id='trailDetailsMessage'>"+textTrail+"</span>");

   }

   
    function gotoStep(valuePOI) {
    
        console.log("@gotoStep(valuePoi");
        socket.emit('gotoPOI', {
            objUser: localObjUser,
            poi: valuePOI
        }); 
    }


    function getTrailSteps() {

        // si le trailStep[] est vide, on télécharge
        // le trailStep correspondant au trail sélectionné..
        
        console.log("@getTrailSteps()")
        console.log(selectedTrail);
        

        if ( TrailStepsName.lenght > 0) {

            console.log(" TrailStepsName[] ++++++" );
            console.log(TrailStepsName);
                  

        } else {

            console.log(" TrailStepsName[] is empty" );
         
            var url = urlCorese+'/tutorial/azkar?query=select ?x ?z  where { ?x a <http://azkar.musee_Ontology.fr/amo%23TrailStep> . ?x <http://azkar.musee_Ontology.fr/amo%23linkedToTrail> "'+selectedTrail.label+'" . ?x <http://azkar.musee_Ontology.fr/amo%23hasOrderNumber> ?z } order by DESC (?z)'


            var data = { url: url, typeRequest: "getTrailSteps", requestObject: selectedTrail.label} 
            socket.emit('executeSPARQL',data);

        }
        
 
    }



    function getTrailStepObject(objectName) {

        console.log("@getTrailSteps()")
        // http://134.59.130.147/tutorial/azkar?query=select ?y ?z where { <http://azkar.musee_Ontology.fr/schema%23"+objectName+"> "?y ?z}
        var url = urlCorese+'/tutorial/azkar?query=select ?y ?z where { <http://azkar.musee_Ontology.fr/schema%23'+objectName+'> ?y ?z}'
        
        var data = { url: url, typeRequest: "getTrailStepObject", requestObject: "objectName"} 
        socket.emit('executeSPARQL',data);

        /*
        var requestName = data.requestObject;
        var urlScenes = urlCorese+"/tutorial/azkar?query=select * where {<http://azkar.musee_Ontology.fr/schema%23"+requestName+"> ?b ?c}"
        var data = { url: urlScenes,typeRequest: "getScene" } 
        socket.emit('executeSPARQL',data);
        /**/


    }

    
    // Flags d'état pour les trails (parcours)
    firstStep = null;
    previousStep = null
    presentStep = null
    nextStep = null

    function resetFlagsTrails() {
        console.log("@resetFlagsTrails()")
        firstStep = null;
        previousStep = null
        presentStep = null
        nextStep = null
    }
    

    // initialisation d'un trail après chargement
    function startTrail() {
        
        console.log("@startTrail()")
        //alert ("GOOOOOOOO ( startTrail() )")

        // Avant toute chose: 
        // Reprendre l'array des steps et les réorganiser en fonction de 
        // leur numberorder... >>> La récéception des requètes SPARQL ne se faisant pas toujours dans 
        // Leur ordre d'émission...     
        TrailStepsObjects = tools.sortHashTable(TrailStepsObjects,'hasOrderNumber',false)
        console.log(TrailStepsObjects)

        // On compare le poi encours  aux steps 
        compareNearestPoitoSteps();
      
    }


    function getNearIndexOnArray(arrayObject, object) {
        
        console.log("###############################################")
        console.log("@getNearIndexOnArray()")

        // On boucle sur les steps
        var firstObject = arrayObject[0]; 
        var nearObject = null;
        var match = false

        if (object == null) return firstObject

        else for (step in arrayObject) {
            
            // console.log(lastStep.label+' = '+TrailStepsObjects[step].label)

            // match a true veut dire que le step précédent est le lastStep  
            if (match == true) {
                nearObject = arrayObject[step]
                match = false;

            }

            // Si on boucle sur le lasStep
            // on met le match a true pour prévenir que 
            // le step suivant est le nearStep
            if (object == arrayObject[step]) {
                match = true;
            }    

        }

        //console.log(object)
        //console.log(nearObject)
        //console.log("###############################################")
        return nearObject;

    }


    // On vérifie que le nearestPoiName correspond à un steptrail
    var oldNextStep = null;
    function compareNearestPoitoSteps(poi) {
        
        if (!poi) poi = nearestPoiName;


        console.log("compareNearestPoitoSteps("+poi+")")

        // Avant toute chose: 
        // Reprendre l'array des steps et les réorganiser en fonction de 
        // leur numberorder... >>> La récéception des requètes SPARQL ne se faisant pas toujours dans 
        // Leur ordre d'émission...     
        TrailStepsObjects = tools.sortHashTable(TrailStepsObjects,'hasOrderNumber',false)
        console.log(TrailStepsObjects);
        



        // Récupérer le stepTrail en cours qui correspond au POI rencontré...
        var newStep = null
        var newStep =  tools.searchInObjects(TrailStepsObjects,'linkedToPOI',poi,'object')    
        presentStep = newStep


        nextStep = getNearIndexOnArray(TrailStepsObjects, newStep)
 
    } 
        
    // Flag singleton
    var doGetAllMapScenes = false
    function getAllMapScenes() {
        
        console.log("@getAllMapScene()")
        console.log ("doGetAllMapScenes :"+ doGetAllMapScenes)

        // http://134.59.130.147/tutorial/azkar?query=select ?z where { <http://azkar.musee_Ontology.fr/schema%23Valerian3> <http://azkar.musee_Ontology.fr/amo%23linkedToScene> ?z}
         // Virer le .png ou autre du namefile de la map
        activeMap = getNameWithoutExtension(activeMapNameFile) 
        

        if ( doGetAllMapScenes == false ) {

            // http://134.59.130.147/tutorial/azkar?query=select ?y ?z where { <http://azkar.musee_Ontology.fr/schema%23"+objectName+"> "?y ?z}
            var url = urlCorese+'/tutorial/azkar?query=select ?z where { <http://azkar.musee_Ontology.fr/schema%23'+activeMap+'> <http://azkar.musee_Ontology.fr/amo%23linkedToScene> ?z}'
            
            var data = { url: url, typeRequest: "getAllMapScenes", requestObject: activeMap} 
            socket.emit('executeSPARQL',data);
        }

    }

  
   socket.on('resultSPARQL', function(data) {
        
        console.log("socket.on('resultSPARQL',"+data.typeRequest)
        

        if (data.typeRequest == "getAllMapScenes") {

             if ( doGetAllMapScenes == false ) { 

                 var listScenes = convertXmlToJson(data.result); 
                 // AllScenes  
                 console.log (listScenes);

            
                try {

                    if (listScenes.sparql) {

                        for (content in listScenes) {
                                                
                            var length = listScenes.sparql.results.result.length
                            //console.log("lenght :"+length)    

                            if (length > 0) {

                                // Récupération de la liste des ressources externes liées
                                for (index = 0; index < length; index++) {


                                    var details = listScenes[content].results.result[index]; 
                                    
                                    var thisScene = details.binding.literal;
                                    //console.log("["+index+"]"+ thisScene );        
                                    AllScenes.push(thisScene);

                                }



                            }

                        }

                    }

                }  catch (e) {
                    console.log(" !!! SPARQL negative response")
                }
                


            }

            // on met le flag a false pour éviter de répéter en boucle la requête.
            doGetAllMapScenes = true;
            console.log (AllScenes)

        }

        
        /*
            try {

            }  catch (e) {
                 console.log(" !!! SPARQL endpoint Corese not online")
            }
        /**/




        if (data.typeRequest == "getTrailStepObject") {

            var trailStepObject = convertXmlToJson(data.result);
            //console.log(trailStepObject)

            // Ici, créer un objet stepTrail
            // ----------------------------------

            if (trailStepObject.sparql) {

                for (content in trailStepObject) {
                                        
                    var length = trailStepObject.sparql.results.result.length
                    //console.log("lenght :"+length)    

                    if (length > 0) {
                       

                        newStepTrailObject = new Object();
                  
                        // Récupération de la liste des ressources externes liées
                        for (index = 0; index < length; index++) {


                            var details = trailStepObject[content].results.result[index]; 
                            
                            var uri = getSparqlUri(details)
                            var property = getSparqlProperty(uri)
                            //property = property.substring(property.lastIndexOf("#")+1);   
                            
                            var value = details.binding[1].literal;
                            var text = null;

                            if (value == undefined) {
                                
                                value = details.binding[0].uri;
                                //console.log (value)
                                text = getSparqlProperty(value)
                                //console.log (text)
                                dataType = "uri"
                                //console.log("["+index+"]"+ property + ":"+ text);       


                            } else {

                                text = getSparqlStringText(value)
                            }
                            
                            
                             //console.log("["+index+"]"+ property + ":"+ text );        
                             // newTrailobject.property = text
                             newStepTrailObject[property] = text

                        }
                            
                    }
                    
                    // On ajoute le StepTrail à la liste
                    TrailStepsObjects.push(newStepTrailObject)
                    
                    console.log('TrailStep ' + TrailStepsObjects.length + " sur " + TrailStepsName.sparql.results.result.length);
                    
                    
                    // Si la liste et complète on lance un utilitaire pour 
                    // Remètre les trailsStep dans l'ordre de leur reception

                    if (TrailStepsObjects.length == TrailStepsName.sparql.results.result.length ) {
                        //console.log(TrailStepsObjects)
                        startTrail()

                    }   
                    /**/ 

                } 


            }

        

        } 

        if (data.typeRequest == "getTrailSteps") {

            var trailsStepsList = convertXmlToJson(data.result);
            //console.log(trailsStepsList)

            // Boucler sur la liste des noms de steptrails et extraire les steptrails correspondants
            if (trailsStepsList.sparql) {

                for (content in trailsStepsList) {
                                        
                    var length = trailsStepsList.sparql.results.result.length
                    //console.log("lenght :"+length)    

                    if (length > 0) {

                        //newStepTrailObject = new Object();

                        for (index = 0; index < length; index++) {


                            var details = trailsStepsList[content].results.result[index]; 
                            
                            var uri = getSparqlUri(details)
                            var property = getSparqlProperty(uri)
                            //property = property.substring(property.lastIndexOf("#")+1);   
                            
                            var value = details.binding[0].literal;
                            var text = null;

                            if (value == undefined) {
                                
                                value = details.binding[0].uri;
                                //console.log (value)
                                text = getSparqlProperty(value)
                                //console.log (text)
                                dataType = "uri"
                                //console.log("["+index+"]"+ property + ":"+ text);       


                            } else {

                                text = getSparqlStringText(value)
                            }
                            
                            console.log(text);

                            getTrailStepObject(text);
                            /**/

                             
                        

                        } // end for index = 0; index < length; index++

                    } // end if lenght > 0

                } // end for

            } // end iftrailsStepList
            TrailStepsName = trailsStepsList
            //console.log("TrailStepsName[] ***")
            console.log(TrailStepsName.sparql.results.result.length)

        } 
        



        if (data.typeRequest == "getMapTrailsNames") {



            var trails = convertXmlToJson(data.result);
            
            console.log(trails)


            try {
               
                if (trails.sparql.results) {

                    for (t in trails) {
                                            
                        //console.log (trails[t].sparql.results.result.lenght);

                        var length = trails.sparql.results.result.length
                        // if (!lenght) alert ('NO')

                            // Récupération de la liste des ressources externes liées
                            for (index = 0; index < length; index++) {


                                var details = trails[t].results.result[index];                       
                                var trailName = details.binding.literal.__text;
                                TrailsName.push(trailName);
                                console.log("["+index+"]"+trailName);  

                                  
                               
                                // On a&joue le nom a la liste des trails a télécharger...
                            }
                            /**/
                    } // end for t in trails
                    
                    ihm.setDisplay ('switchOpenTrail','open')
                    console.log(TrailsName);
                    getTrailsObjects(TrailsName);
               
                } else {
                console.log ('NO TRAILS')
                //ihm.setDisplay ('switchOpenTrail','close')
                ihm.setDisplay ('switchOpenTrail','close')
                }

            }  catch (e) {
                console.log(" !!! SPARQL endpoint Corese not online")
            }




        }

        if (data.typeRequest == "getTrailObject") {
            
            var trailobject = convertXmlToJson(data.result);
            console.log(trailobject)
            TrailObjectsLinkedToScene = []
        
            if (trailobject.sparql) {

                for (content in trailobject) {
                                        
                    var length = trailobject.sparql.results.result.length
                    //console.log("lenght :"+length)    

                    if (length > 0) {
                       

                        newTrailobject = new Object();
                  
                        // Récupération de la liste des ressources externes liées
                        for (index = 0; index < length; index++) {


                            var details = trailobject[content].results.result[index]; 
                            
                            var uri = getSparqlUri(details)
                            var property = getSparqlProperty(uri)
                            //property = property.substring(property.lastIndexOf("#")+1);   
                            
                            var value = details.binding[0].literal;
                            var text = null;

                            if (value == undefined) {
                                
                                value = details.binding[0].uri;
                                //console.log (value)
                                text = getSparqlProperty(value)
                                //console.log (text)
                                dataType = "uri"
                                //console.log("["+index+"]"+ property + ":"+ text);       


                            } else {

                                text = getSparqlStringText(value)
                            }
                            
                            
                             if (property == 'linkedToScene') {
                                TrailObjectsLinkedToScene.push(text)
                             }

                             //console.log("["+index+"]"+ property + ":"+ text );        
                             // newTrailobject.property = text
                             newTrailobject[property]= text

                        }
                            
                    }
                    
                    
                    // On ajoute les scènes à l'objet
                    newTrailobject["linkedToScene"] = TrailObjectsLinkedToScene;

                    TrailsObjects.push(newTrailobject)
                    console.log(newTrailobject);
                    console.log('Trail ' +TrailsObjects.length + " sur " + TrailsName.length);
                    // Si la liste et complète on lance la récupération des trailsSteps
                    if (TrailsObjects.length == TrailsName.length ) {
                        populateFormTrails(TrailsObjects);

                    }    

                } 


            }


        
        }

        



        //var data = { url: urlScenes, typeRequest: "isScene", requestName: "requestName"} 
        if (data.typeRequest == 'isScene') {

        	
        	var isScene = convertXmlToJson(data.result, 'ask');
        	console.log(isScene);
        	//console.log("data.result for "+ data.requestObject + " scene : "+isScene.sparql.boolean);
        
            
           try {
               
            
                if (isScene.sparql.boolean == 'true') {
                    

                    // Si on a un TRUE, on vas chercher la scene en question...
                    // Ici via une nouvelle requêt SPARQL
                    var requestName = data.requestObject;
                    var urlScenes = urlCorese+"/tutorial/azkar?query=select * where {<http://azkar.musee_Ontology.fr/schema%23"+requestName+"> ?b ?c}"
                    var data = { url: urlScenes,typeRequest: "getScene" } 
                    socket.emit('executeSPARQL',data);

                    // Ou ici en comparant a la liste des scenes.
                    // Todo
                    

                } else {
                    // Todo
                }

            }
            catch (e) {
                 console.log(" !!! SPARQL endpoint Corese not online")
            } 
            
        } // end 'isScene'


        if (data.typeRequest == 'getScene') {

            var scene = convertXmlToJson(data.result);
            
            if (scene.sparql) {

	           	for (content in scene) {
			    				    	
	           		var length = scene.sparql.results.result.length
	           		//console.log("lenght :"+length)	

			    	if (length > 0) {
		               
		                activeRecommandation = true;
		                wsTitle = "Recommended ressources for '"+sceneName+"'";
		                wsHtmlContent = "";
		                notifications.writeRecommandations ("miscelleanous",wsTitle,"")
		                
		                ExternalRessourceslistName =[];

            			newScene = new Object();
            			newScene.linkedToExternalRessource = ExternalRessourceslistName;
		           
		                // Récupération de la liste des ressources externes liées
		           		for (index = 0; index < length; index++) {


					    	var details = scene[content].results.result[index];	
					    	
					    	var uri = getSparqlUri(details)
					    	var property = getSparqlProperty(uri)
					    	//property = property.substring(property.lastIndexOf("#")+1);	
					    	
					    	var value = details.binding[0].literal;
					    	var text = null;

					    	if (value == undefined) {
					    		value = details.binding[0].uri;
					    		//console.log (value)
					    		text = getSparqlProperty(value)
					    		//console.log (text)
					    		dataType = "uri"
					    		console.log("["+index+"]"+ property + ":"+ text);		


					    	} else {

						    	//dataType = getSparqlDatatype(value)
						    	text = getSparqlStringText(value)
						    	if (property == "linkedToExternalRessource") {
						    		//open_infos(text, "DebugUrl")
						    		ExternalRessourceslistName.push(text)
                                    //console.log (newScene)
						    	}
							
						    if (text == 'undefined') text=null;
                            newScene[property]= text
							//console.log("["+index+"]"+ property + ":"+ text + " (dataType:"+ dataType + ")");		
					    	}
					    	
		           		}
		           		
                        museumScene = newScene;
                        //console.log(museumScene);	           		
                        ExternalRessourcesObjects=[];
                        getSceneMedias(ExternalRessourceslistName)
                        

		            } 
	           	}

            }
        } // end 'getScene'


        if (data.typeRequest == 'getSceneMedias') {

            // Convert XML to JSON
            var medias = convertXmlToJson(data.result);
            //console.log ("--------------------- MediaDetails-----------") 
            //console.log(ExternalRessourcesObjects);
            
            if (medias.sparql) {


	            for (media in medias) {
	            	
	            	var lenght = 0;
                    
                    try {
                        length = medias.sparql.results.result.length;
                    } catch (e) {
                     // console.log ("no lenght");
                    }
	            	
	            	if (length > 0) {


                        newMedia = new Object();
                        
 	            		// Récupération des propriétés pour chaque média:
			           	for (index = 0; index < length; index++) {

			           		var details = medias[media].results.result[index];	
						    var uri = getSparqlUri(details)
						    var property = getSparqlProperty(uri)
						    	
						    var value = details.binding[1].literal;
						    var text = null;
						    

                            if (value == undefined) {
                                value = details.binding[0].uri;
                                //console.log (value)
                                value = getSparqlProperty(value)
                                //console.log (text)
                                dataType = "uri"
                                 


                            } else {


                            }
                            
                            // console.log("["+index+"]"+ property + ":"+value ); 
                            
                            if( value.__text == 'undefined') value=null;
                            else value = value.__text;

                            newMedia[property] = value

			           	}

                        // On ajoute le média à la liste
    	            	ExternalRessourcesObjects.push(newMedia)
                        console.log('Media ' +ExternalRessourcesObjects.length + " sur " + ExternalRessourceslistName.length);
                        // Si la liste et complète on lance l'affichage de la liste en bandeau...
                        if (ExternalRessourcesObjects.length == ExternalRessourceslistName.length ) {
                            

                            displayReccomendedRessources(ExternalRessourcesObjects);

                        }

	            	}
	            }

	        }
        } // end 'getSceneMedias'	
        

    });
        



    




    function webSemanticRecommandations() {

        // if (fakeRobubox != true) return    
        setInterval(function() {
           
            // Si la couleur du robot est vert 
            // couleur pour signifier qu'il est dans le champ d'influence d'un poi)
            if (robotColor == 'green')  {

                sceneName = null;
                
                for (poi in listPOI) {
                    
					
                    if (nearestPoiName == listPOI[poi].Name )  {
                        
                        if (fakeRobubox == true) {
                            // TODO
                        } else { // if (fakeRobubox == false)

                             //sceneName = nearestPoiName;
                             sceneName = listPOI[poi].Label;

                             // Pour eviter les affichages en boucle
                             if (lastPoiName != nearestPoiName) {
                                    
                                    lastPoiName = nearestPoiName

                                    // On vérifie que le nearestPoiName correspond à un steptrail
                                    compareNearestPoitoSteps(nearestPoiName);

                                                                     
                                    // on vérifie que la scene existe dans l'ontologie
                                    var requestName = sceneName;                                  
									var urlScenes = urlCorese+"/tutorial/azkar?query=ASK WHERE { ?x a <http://azkar.musee_Ontology.fr/amo%23MuseumScene> . ?x rdfs:label '"+requestName+"'}"
                                    var data = { url: urlScenes, typeRequest: "isScene", requestObject: requestName} 
                                    socket.emit('executeSPARQL',data);

                                    wsTitle = "Nearest POI: '"+sceneName+"'";
                                    activeRecommandation = false;
                                    notifications.writeRecommandations ("miscelleanous",wsTitle,"")

                            } // if (lastPoiName != nearestPoiName) 

                        } // if (fakeRobubox == false)   
                
                    } // if (nearestPoiName == listPOI[poi].Name )
                    /**/

                } // for (poi in listPOI)
            
          
            } else if (robotColor == 'blue'){
               lastPoiName = null; 
               activeRecommandation = false;
               notifications.hideAllRecommandations()
            }
        
        }, 1000);
 

    }

    
    // En cours de développement...
    // Todo: A finir ...
    function SPARQLtoJSON(object,resultArray){
        
        console.log("SPARQLtoJSON(sparqlObject)")
        console.log(object);

        var trailobject = convertXmlToJson(object.result);
        console.log(trailobject)
        
            if ( !trailobject.sparql) { return }
            else {

                for (content in trailobject) {
                                        
                    var length = trailobject.sparql.results.result.length
                    //console.log("lenght :"+length)    

                    if (length > 0) {
                       

                        newTrailobject = new Object();
                  
                        // Récupération de la liste des ressources externes liées
                        for (index = 0; index < length; index++) {


                            var details = trailobject[content].results.result[index]; 
                            console.log(details);
                            //var uri = getSparqlUri(details)

                            /*
                            var binding0 = object.binding[0].uri;
                            var binding1 = object.binding[1].uri;
                            if (binding0 != undefined) return binding0
                            else if (binding1 != undefined) return binding1
                            /**/









                            //var property = getSparqlProperty(uri)
                            //property = property.substring(property.lastIndexOf("#")+1);   
                            
                            /*
                            var value = details.binding[0].literal;
                            var text = null;

                            if (value == undefined) {
                                
                                value = details.binding[0].uri;
                                //console.log (value)
                                text = getSparqlProperty(value)
                                //console.log (text)
                                dataType = "uri"
                                //console.log("["+index+"]"+ property + ":"+ text);       


                            } else {

                                text = getSparqlStringText(value)
                                }
                            /**/
                            
                            
                             //console.log("["+index+"]"+ property + ":"+ text );        
                             // newTrailobject.property = text
                             //newTrailobject[property]= text

                        }
                            
                    }
                    
                    // On ajoute le Trail à la liste
                    resultArray.push(newTrailobject)
                    //console.log('Trail ' +TrailsObjects.length + " sur " + TrailsName.length);
                      

                } 


            }
        console.log("#####################################")    
        console.log(resultArray)
        console.log("#####################################")
        // return resultArray;

    }
    

    // ---------------- end Web sémantique -- Version 2017 
    /**/
    // Web sémantique -- Version 2016
    // Obsolète
    // ----------------------------------------------------------------------
    
    function webSemanticRecommandationsOLD() {

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
                                    
                                    } else if (sceneName == "Univers") {

                                            //isLinkedToWS = true;
                                            socket.emit('getSceneRessources', {scene: "Univers"});
                                            console.log( "socket.emit('getSceneRessources', {scene: Univers })"    )
                                            activeRecommandation = true;

                                            wsTitle = "Ressources recommandées";
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

                                    alert("last poi:"+lastPoiName+'\n'+"Nearest poi:"+nearestPoiName) 
                                    
                                    if (sceneName == "Marne 1914") {
                                            //isLinkedToWS = true;
                                            socket.emit('getSceneRessources', {scene: "Marne14"});
                                            console.log( "socket.emit('getSceneRessources', {scene: Marne14 })"    )
                                            activeRecommandation = true;
                                            wsTitle = "Ressources complémentaires pour la scène 'Marne 1914'";
                                            wsHtmlContent = "";
                                    

                                    } else if (sceneName == "Tranchées") {
                                            //isLinkedToWS = true;
                                            socket.emit('getSceneRessources', {scene: "La_tranchee"});
                                            console.log( "socket.emit('getSceneRessources', {scene: La_tranchee })"    )
                                            activeRecommandation = true;
                                            wsTitle = "Ressources complémentaires pour la scène 'Les tranchèes'";
                                            wsHtmlContent = "";
                                    

                                    
                                    } else if (sceneName == "Univers") {
                                            //isLinkedToWS = true;
                                            socket.emit('getSceneRessources', {scene: "Univers"});
                                            console.log( "socket.emit('getSceneRessources', {scene: Univers })"    )
                                            activeRecommandation = true;
                                            wsTitle = "Ressources complémentaires pour la scène 'L'univers de Valérian'";
                                            wsHtmlContent = "";

                                    

                                    } else if (sceneName == "Civilisations") {
                                            //isLinkedToWS = true;
                                            socket.emit('getSceneRessources', {scene: "Civilisations"});
                                            console.log( "socket.emit('getSceneRessources', {scene: Civilisations })"    )
                                            activeRecommandation = true;
                                            wsTitle = "Ressources complémentaires pour la scène 'Civilisations'";
                                            wsHtmlContent = "";



                                    } else if (sceneName == "Diversité") {
                                            //isLinkedToWS = true;
                                            socket.emit('getSceneRessources', {scene: "Diversité"});
                                            console.log( "socket.emit('getSceneRessources', {scene: Diversité })"    )
                                            activeRecommandation = true;
                                            wsTitle = "Ressources complémentaires pour la scène 'Diversité'";
                                            wsHtmlContent = "";


                                    } else if (sceneName == "PolitiqueFiction") {
                                            //isLinkedToWS = true;
                                            socket.emit('getSceneRessources', {scene: "PolitiqueFiction"});
                                            console.log( "socket.emit('getSceneRessources', {scene: PolitiqueFiction })"    )
                                            activeRecommandation = true;
                                            wsTitle = "Ressources complémentaires pour la scène 'Politique Fiction'";
                                            wsHtmlContent = "";

                                    } else if (sceneName == "Inspirations") {
                                            //isLinkedToWS = true;
                                            socket.emit('getSceneRessources', {scene: "InspirationsEtAlbums"});
                                            console.log( "socket.emit('getSceneRessources', {scene: InspirationsEtAlbums })"    )
                                            activeRecommandation = true;
                                            wsTitle = "Ressources complémentaires pour la scène 'Inspiration et albums'";
                                            wsHtmlContent = "";

                                    } else if (sceneName == "Scénario1") {
                                            //isLinkedToWS = true;
                                            socket.emit('getSceneRessources', {scene: "AventureContinue"});
                                            console.log( "socket.emit('getSceneRessources', {scene: AventureContinue })"    )
                                            activeRecommandation = true;
                                            wsTitle = "Ressources complémentaires pour la scène 'L'aventure continue'";
                                            wsHtmlContent = "";

                                    } else if (sceneName == "Scénario2") {
                                            //isLinkedToWS = true;
                                            socket.emit('getSceneRessources', {scene: "DuScénarioALaBd"});
                                            console.log( "socket.emit('getSceneRessources', {scene: DuScénarioALaBd })"    )
                                            activeRecommandation = true;
                                            wsTitle = "Ressources complémentaires pour la scène 'Du scénario à la BD";
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

    // Reception d'une ressource web sémantique
    // Obsolète... 
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
                       
                

                /*// Affectation des résultats
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
                /**/
     
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
    // ---------------- end Web sémantique -- Version 2016 
    /**/






})(typeof exports === 'undefined'? this['navigation']={}: exports);