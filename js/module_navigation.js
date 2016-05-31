// ---- Points Of Interest

/*// Génération des listes de POI pour la navigation
    exports.populateFormPOI = function(point) {

        console.log("@ populateFormPOI()");

        var option = document.createElement('option');
        option.id = point.Name;
        option.value = point.Name;
        option.text = point.Name;

        list_POI.appendChild(option);

           
    }
/**/
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
    
    // Titi:
    // Ecouteur coté Robot: reception demande d'échange de données cartos
    // Flag d'échange a true et envoi au pilote des paramètres de la carte
    if (type == "robot-appelé") {
    	socket.on("pilotGetNav", function(data) {
    		if (data = "getNavInfos") {
    			// pilotGetNav = true;
                var toSend = {"dataMap":dataMap, "listPOI":listPOI,}
    			//navigation_interface.sendToPilote("map_parameters", dataMap); // envoi parametres de la map
                navigation_interface.sendToPilote("map_parameters2", toSend); // envoi parametres de la map
                
                // navigation_interface.sendToPilote("list_POI", listPOI); // envoi liste des POI

            }
    	});
    }

    // Titi: reception de données de navigation
    if (type == "pilote-appelant") {
    	socket.on("navigation", function(data) {
           
            if (data.command == "map_parameters2") {
    			 console.log(">>> Socket.on(navigation)")
                 console.log(data.dataMap);
                 console.log(data.listPOI);
                 dataMap = data.dataMap;
                 listPOI = data.listPOI;
    			 mapSize = carto.resizeRatio(dataMap.Width, dataMap.Height, canvasWidth, canvasHeight)
                 //console.log (mapSize)
    		     //DATAMAP = data.dataMap;
                 //mapSize = resizeRatio(dataMap.Width, dataMap.Height, canvasWidth, canvasHeight)

            } else if (data.command == "robot_localization") {
    			 robotInfo = data.robotInfo;
    			 refresh();
    		}


    	});
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
            alert("isDeffered");
            mapSize = carto.resizeRatio(dataMap.Width, dataMap.Height, canvasWidth, canvasHeight)
            callback();
        });

        var init = true;
        komcom.getRobotInfo(init);
        komcom.getDataMap();
        // komcom.getListPOI();
        

    }

    function load() {
        mapSize = carto.resizeRatio(dataMap.Width, dataMap.Height, canvasWidth, canvasHeight)
        refresh();
    }


    
    function refresh() {
        
        console.log('@ init(callback)');

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


})(typeof exports === 'undefined'? this['navigation']={}: exports);