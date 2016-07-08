// ---- Points Of Interest


(function(exports){


	console.log("module_navigation chargé")


    // Titi:  délai de rafraichissement carto en ms
    refreshDelay = 100; // 100ms (600ms ca saccade un peu) 

    // Datamap et robotInfo en variable globales...
    dataMap = null; // height , width , offset (x,y) , resolution
    robotInfo = null; // Pos X, Y et theta du robot
    listPOI = null;  

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
    			 refresh();
    		}


    	});

        //-----------


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
            
            var dateR = tools.humanDateER('R');
            var msg = dateR+' Trajectory Status'+textStatus;

            // Pour logs et débuggage
            // ihm.insertWsMessage(null,msg);

            displayTrajectoryStatus(textStatus);

            // Todo: Traiter le résultat:
            // 1 Affichage du statut
            // 2 Affichage de la trajectoire
        
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

        // $.when(DEFFERED_DataMap, DEFFERED_RobotInfo, DEFFERED_listPOI).done(function(v1, v2) {
        $.when(DEFFERED_DataMap, DEFFERED_RobotInfo).done(function(v1, v2) {
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


    
    function refresh() {
        
        //console.log('@ refresh()');

        if (type == "robot-appelé") {
	        
	        setInterval(function() {
                if (fakeRobubox == true) carto.simulateRobotMove();
                else komcom.getRobotInfo();
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
    var singleton = false; // Pour éviter le doublonnage
    function manageListPOIs(listPOI) {
        console.log("@ manageListPOIs()");
        console.log("singleton = "+singleton);
        if (singleton == false) {   
            // if (type == "pilote-appelant") managePOIs.init(listPOI,dataMap); 
            populateListPOIs(listPOI);
            singleton = true;
        }
    }


    function populateListPOIs(listPOI) {
        console.log("@ populateListPOIs()");
        list_POI_select = document.querySelector('select#list_POI');
        for (poi in listPOI) {
            var option = document.createElement('option');
            option.id = listPOI[poi].Name;
            option.value = listPOI[poi].Name;
            option.text = listPOI[poi].Name+" : "+listPOI[poi].label;
            list_POI_select.appendChild(option);
        }

    }
    


    function displayTrajectoryStatus(textStatus) {
        //alert("Trajectory status:"+textStatus);
        console.log("Trajectory Status:"+textStatus)
        $('#robotStatusMessage').replaceWith(" <span id ='connect-notice'>Trajectory Status: </br>"+textStatus+"</span>");

    }



})(typeof exports === 'undefined'? this['navigation']={}: exports);