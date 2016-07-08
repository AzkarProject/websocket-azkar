(function(exports){


	console.log("module_manage_POIs chargé")


	robotListPOI = null;
	robotMap = null;
	activeMap = null;
	dbListCollections = null;
	isCollectionMaps = false;
    isCollectionVisites = false;
    isCollectionScenes = false;
    isCollectionPointsOfInterest = false;



	// Retours de MongoDB
    socket.on("mongoDB", function(data) {
        console.log('>>> socket.on(mongoDB) > '+data.command)
        console.log(data)
        handlers[data.doAfter](data)



    });


    /*
    socket.on('mongoDB', function(data) {
        var consoleTxt = tools.humanDateER('R') + " @ mongoDB >>>>"+data.command; 
        console.log(consoleTxt); 
        console.log(data);
            
        // handlers['getListCollections'](callback, text);
        handlers[data.command](function (result){
                data.result = result;
                io.to(wsIdPilote).emit('mongoDB', data);
        },data.parameters);

    });
    /**/






	// --------------------- Persistance & Algo Map/Pois


	var handlers = {
		initCollections:initCollections,
		//initCollectionMaps:initCollectionMaps,
		//initCollectionsVisites,initCollectionsVisites,
		//initCollectionScenes,initCollectionScenes,
		//initCollectionPois,initCollectionPois,

	}





	exports.init = function (listPOI,dataMap){

  		console.log ("@ managePOIs.init()")
		
		robotListPOI = listPOI;
		robotMap = dataMap;
		activeMap = new models.Map(robotMap);

  		var parameters = {from: 'manageListPOIs', doAfter:'initMaps'}
        var data = {command:"getListCollections", parameters }
        socket.emit("mongoDB",data);    
  
  	

  	}

	
  	function initCollections(data){
            
            dbListCollections = data.result;
            //text = "Result of first getListCollections() "
            //displayResultTest (text,result)



            for (collection in result) {
                if (result[collection].name == 'Maps') isCollectionMaps = true;
                if (result[collection].name == 'Visites') isCollectionVisites = true;
                if (result[collection].name == 'Scenes') isCollectionScenes = true;
                if (result[collection].name == 'PointsOfInterest') isCollectionPointsOfInterest = true; 
            }

            
            isOneCollectionCreated = false;
            initMaps();
    }





	// Récupération de la liste des collections
    // Si les collections Maps, PointsOfInterest, Scenes et Visites ne sont pas dans la db, on les crées
    /*// initCollections();
    function initCollections2() {
        
        console.log("@ initCollections()")

        getListCollections(function (result){
            dbListCollections = result;
            text = "Result of first getListCollections() "
            displayResultTest (text,result)

            isCollectionMaps = false;
            isCollectionVisites = false;
            isCollectionScenes = false;
            isCollectionPointsOfInterest = false;

            for (collection in result) {
                if (result[collection].name == 'Maps') isCollectionMaps = true;
                if (result[collection].name == 'Visites') isCollectionVisites = true;
                if (result[collection].name == 'Scenes') isCollectionScenes = true;
                if (result[collection].name == 'PointsOfInterest') isCollectionPointsOfInterest = true; 
            }

            
            isOneCollectionCreated = false;
            initMaps();

            function initMaps () {
                if (isCollectionMaps == false) {
                    createCollection("Maps",function (result){
                        dbListCollections = result;
                        isCollectionMaps = true;
                        text = "init 1 - Result of createCollection(Maps)"
                        var displayResult = 'result.s.name: '+result.s.name;
                        displayResultTest (text,displayResult);
                        isOneCollectionCreated = true;
                        initVisites()
                    }); 
                } else initVisites()
            }

            function initVisites () {
                if (isCollectionVisites == false) {
                    createCollection("Visites",function (result){
                        dbListCollections = result;
                        isCollectionVisites = true;
                        text = "init 1 - Result of createCollection(Visites)"
                        var displayResult = 'result.s.name: '+result.s.name;
                        displayResultTest (text,displayResult);
                        isOneCollectionCreated = true;
                        initScenes();
                    }); 
                } else initScenes() 
            }


            function initScenes () {
                if (isCollectionScenes == false) {
                    createCollection("Scenes",function (result){
                        dbListCollections = result;
                        isCollectionVisites = true;
                        text = "init 1 - Result of createCollection(Scenes)"
                        var displayResult = 'result.s.name: '+result.s.name;
                        displayResultTest (text,displayResult);
                        isOneCollectionCreated = true;
                        initPois();
                    }); 
                } else initPois()
            }

            
            function initPois () {
                if (isCollectionPointsOfInterest === false) {
                    createCollection("PointsOfInterest",function (result){
                        dbListCollections = result;
                        text = "init 1 - Result of createCollection(PointsOfInterest)"
                        var displayResult = 'result.s.name: '+result.s.name;
                        isCollectionPointsOfInterest = true; 
                        displayResultTest (text,displayResult);
                        isOneCollectionCreated = true;
                        ControlNewCollections ()
                    }); 
                } else  ControlNewCollections();

            }

            function ControlNewCollections () {
                if (isOneCollectionCreated === true) {  
                    getListCollections(function (result){
                        dbListCollections = result;
                        text = "Result of last getListCollections() ";
                        displayResultTest (text,result)
                        initMapsContent();
                    });
                } else initMapsContent();
            }

        }); 

    } //function initCollections() {
    /**/












})(typeof exports === 'undefined'? this['managePOIs']={}: exports);