// --------------------- Persistance & Algo Map/Pois


robotListPOI = dataRobot.getFakelistPOI();
robotMap = dataRobot.getFakeDataMap();
activeMap = new models.Map(robotMap);

// Pour tester les POI d'une autre Map
robotListPOI2 = dataRobot.getFakelistPOI2();
robotMap2 = dataRobot.getFakeDataMap2();
map2 = new models.Map(robotMap2);

// Pour simuler les CRUD sur les listes de POI
listPOI_original = {}; // La liste des POIs persistée
listPOI_addPOI = {}; // Create: On ajoute un POI "PillierE"
listPOI_updatePOI = {}; // Update: On modifie le POI "PilierA""
listPOI_deletePOI = {}; // Delete: On supprime le POI "PilierE"
listPOI_MixOperationsPOIs = {}; // Delete: On supprime le POI "PilierD"


modeDebug = true;

if (modeDebug === true) {
    dropCollection('PointsOfInterest',function (result) {
        text = "Before All: dropCollection(PointsOfInterest)"
        initCollections();
        displayResultTest (text,result)
    }); 
} else initCollections();

function createDataSet(fakelistPOI) {

    console.log("@ createDataSet");
    //console.log(fakelistPOI);
    
    var returnListPois = {}
    for (poi in fakelistPOI) {
        var newObject = fakelistPOI[poi];
        var newPoi = new models.Poi(newObject);
        newPoi.MapID = activeMap.MapID;
        newPoi.SceneID = null;
        newPoi.Label = "Label du POI "+newObject.Name;
        newPoi.Description = "Description du POI "+newObject.Name;
        newPoi.Sparql = null;
        //var newPoi = new models.Poi(newObject);
        returnListPois[poi] = newPoi;
        
    } 
    if (modeDebug === true) console.log(returnListPois);
    return returnListPois;
}


// Création des datasets 
listPOI_original = createDataSet(dataRobot.getFakelistPOI()); 
listPOI_addPOI = createDataSet(dataRobot.getFakelistAddPOIE()); 
listPOI_updatePOI = createDataSet(dataRobot.getFakelistUpdatePOIA()); 
listPOI_deletePOI = createDataSet(dataRobot.getFakelistDeletePOIB()); 
listPOI_MixOperationsPOIs = createDataSet(dataRobot.getFakelistUpdPOIAAddPOIBBDeletePOIE());

/// ------ Tests de persistance scriptés -----------------

// Algo a implémentar dans 1to1
// 1 - OK ! Si les collections Maps, PointsOfInterest, Scenes et Visites ne sont pas dans la db, on les crées
// 2 Si la map active n'existe pas dans la db: 
// ------ on la persiste dans sa collection 
// ------ on la télécharge physiquement sur le serveur
// ------ on la charge dans l'application carto
// 3 Si la map active existe dans la db:
// ------ on la charge dans l'application carto 
// 4 Si les POIs n'existent pas dans la db, pour chaque POI: 
// ------ On crée le POI individuellement
// ------ On lie le POI à la carte active
// ------ On lie le POI à sa scene 
// ------ On renseigne ses champs 'Description' et 'Sparql'
// ------ On persiste le POI
// 5 Si les POIs existent en db mais ont été modifiés
// ------ On recupère l'ID du POI persisté a partir de son nom
// ------ On crée un nouveau POI individuel
// ------ ------- Avec les propriétés MapID, SceneID, Description et SparQl du POI persisté
// ------ ------- Avec les propriétés Pose et Name du Poi envoyé par le Robot
// ------ On remplace le POI persisté par le nouveau POI modifié
// 6 Si les POIs existent en db mais ont été supprimés
// ------ Soit On supprime le POI persisté
// ------ Soit On ajoute au POI persisté un statut "inactive" avec un TimeStamp

// 7 ---- Faire un formulaire HTML pour editer les POI et les liers a des scènes et de visites
// 8 ---- Faire un formulaire HTML pour editer les Scenes et les liers a des visites et a des Maps
// 9 ---- Faire un formulaire HTML pour editer les visites et les liers a des Maps 


mongoCounDbs = 0;
mongolistDbs = {};
dbCountCollections = 0;
dbListCollections = {}
collectionMapsAllDocs = {}
collectionPoisAllDocs = {}
mongoActiveMapPois = {};
robotActiveMapPois = {};

function displayResultTest (text,result,object) {
    
    if (modeDebug === true) {
        console.log("")
        console.log("---------- "+text+"------------------")
        console.log(result)
        if (object) console.log(object);
        console.log("---------- End "+text+"------------------")
        console.log("")
    }
}







// Lancement des tests:

// Récupération de la liste des collections
// Si les collections Maps, PointsOfInterest, Scenes et Visites ne sont pas dans la db, on les crées
// initCollections();
function initCollections() {
    
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



// 2 Si la map active n'existe pas dans la db: 
// ------ DO - on la persiste dans sa collection 
// ------ Todo - on la télécharge physiquement sur le serveur
// ------ Todo - on la charge dans l'application carto
// 3 Si la map active existe dans la db:
// ------ Todo - on la charge dans l'application carto 
function initMapsContent() {
    console.log("@ initMapsContent()")

    firstControlDocs ();
    
    function firstControlDocs() {
        // On remonte tous les documents de la collection:
        console.log("@ initMapsContent.firstControlDocs()")
        getCollectionDocs("Maps",function (result){
            collectionMapsAllDocs = result; 
            text = "@ initMapsContent.firstControlDocs() - Result of First getCollectionDocs(Maps)"             
            displayResultTest (text,result);
            controlActiveMap();
        });
    }

    
    var isMapActiveInCollection = false;
    // On verifie que la Maps active (activeMap) est dans cette colection
    function controlActiveMap() {
        console.log("@ initMapsContent.controlActiveMap()")
        for (map in collectionMapsAllDocs) {
            if (collectionMapsAllDocs[map].MapID === activeMap.MapID) {
                isMapActiveInCollection = true;
                if (modeDebug === true) console.log(collectionMapsAllDocs[map].MapID+" : " + isMapActiveInCollection)
            }
            
        }
        if (isMapActiveInCollection === false) persistActiveMap();
        else initPoiContents();
    }
    

    // Si elle n'y est pas, on la persiste...
    function persistActiveMap() {
        console.log("@ initMapsContent.persistActiveMap()")
        insertOnedDoc("Maps", activeMap, function (result){
            text = "@ initMapsContent.persistActiveMap() - Result of insertOnedDoc(activeMap)"
            var displayResult = "result.result.ok: " + result.result.ok;
            displayResult += "\nresult.result.n: " + result.result.n;
            displayResult += "\nresult.insertedCount: " + result.insertedCount ;
            displayResult += "\nresult.insertedId: " + result.insertedId ;
            displayResult += "\nresult.ops:" + result.ops
            var insertedDoc = result.ops[0]             
            displayResultTest (text,displayResult,insertedDoc);
            lastControlDocs()
        });
    }

    // Mise a jour de la liste des Maps
    function lastControlDocs() {
        // On remonte tous les documents de la collection:
        console.log("@ initMapsContent.lastControlDocs()")
        getCollectionDocs("Maps",function (result){
            collectionMapsAllDocs = result; 
            text = "@ initMapsContent.lastControlDocs() - Result of last getCollectionDocs(Maps)"   
            displayResultTest (text,result);
            initPoiContents();
        });
    }


}



// 4 Si les POIs n'existent pas dans la db, pour chaque POI: 
// ------ On crée le POI individuellement
// ------ On lie le POI à la carte active
// ------ On lie le POI à sa scene 
// ------ On renseigne ses champs 'Description' et 'Sparql'
// ------ On persiste le POI
// 5 Si les POIs existent en db mais ont été modifiés
// ------ On recupère l'ID du POI persisté a partir de son nom
// ------ On crée un nouveau POI individuel
// ------ ------- Avec les propriétés MapID, SceneID, Description et SparQl du POI persisté
// ------ ------- Avec les propriétés Pose et Name du Poi envoyé par le Robot
// ------ On remplace le POI persisté par le nouveau POI modifié
// 6 Si les POIs existent en db mais ont été supprimés
// ------ Soit On supprime le POI persisté
// ------ Soit On ajoute au POI persisté un statut "inactive" avec un TimeStamp
function initPoiContents() {
    console.log("@ initPoiContents()")

    firstControlDocs ();
    
    function firstControlDocs() {
        // On remonte tous les documents de la collection:
        console.log("@ initPoiContents.firstControlDocs()")
        var collection = 'PointsOfInterest'
        getCollectionDocs(collection,function (result){
            collectionPoisAllDocs = result; 
            text = "initPoiContents().firstControlDocs() - Result of First getCollectionDocs("+collection+")"               
            displayResultTest (text,result);
            // Si la collection est vide, on enregistre un premier dataset
            if (tools.isEmpty(result) === true) { 
                insertfirstPoisDataset()
            // Sinon on extrait les Pois correspondant a la Map puis on les traitera..
            } else {
                if (modeDebug === true) console.log ("The Point Of interest Collection is not Empty");
                getActiveMapPois(activeMap);
            // insertfirstDataset()
            }
        });
    }


    function insertfirstPoisDataset() {
        console.log("@ initPoiContents.insertfirstPoisDataset()")
        // On rajoute une date de réation
        for( var i in listPOI_original ) {
            listPOI_original[i].creationDate = Date.now(); // TimeStamp
        }

        // On convertit l'objet JS en Array pour l'insérer dans une collection
        var arrayDocs = tools.toArray(listPOI_original);
        var collection = 'PointsOfInterest'
        insertManyDocs(collection,arrayDocs,function (result){
            text = "@ initPoiContents.insertfirstPoisDataset() - Result of insertManyDocs("+collection+")";
            var displayResult = "result.result.ok: " + result.result.ok;
            displayResult += " \nresult.result.n: " + result.result.n;
            displayResult += "\nresult.insertedCount: " + result.insertedCount ;
            displayResult += "\nresult.insertedIds: " + result.insertedIds ;
            displayResult += "\nresult.ops:" + result.ops;
            manyDocs = result.ops
            displayResultTest (text,displayResult,manyDocs);
            getActiveMapPois();
        });
    }
    
    
    
    // on extrait les Pois correspondant à la Map..
    function getActiveMapPois() {
        console.log("@ initPoiContents.getActiveMapPois(MapID: "+activeMap.MapID+")")
        // mongoActiveMapPois{};
        // robotActiveMapPois{};
        var query = { 'MapID': activeMap.MapID }
        var collection = 'PointsOfInterest'
        findManyDocs(collection,query,function (result){
            text = "@ initPoiContents.getActiveMapPois() - Result of findManyDocs("+collection+") > query = "+JSON.stringify(query);
            mongoActiveMapPois = result;
            displayResultTest (text,result);
            synchroPois();
        }); 
        
    }


    // on synchronise les Pois issus de la BD et ceux du Robot..
    function synchroPois() {
        
        console.log("@ initPoiContents.synchroPois()")
        //robotActiveMapPois = listPOI_original;
        //robotActiveMapPois = listPOI_addPOI; // Add Pilier E
        //robotActiveMapPois = listPOI_updatePOI; // Add Pilier E, Update pilier A & B
        robotActiveMapPois = listPOI_deletePOI; // Add Pilier E , Update Pilier A et delete Pilier B
        //robotActiveMapPois = listPOI_MixOperationsPOIs // Add pilier AA, update pilier A, delete Pilier B

        
        if (modeDebug === true) {
                console.log("@ ------------- Mongo List POI -----------------")
                console.log(mongoActiveMapPois)
                console.log("@ ------------- Robot List POI -----------------")
                console.log(robotActiveMapPois)
        }

        // On compare le nombre d'Items de chaque liste pour décider des listes imbriquées
        var nbMongoPois = tools.searchInObjects(mongoActiveMapPois,'MapID',activeMap.MapID,'count') 
        var nbRobotPois = tools.searchInObjects(robotActiveMapPois,'MapID',activeMap.MapID,'count') 
        
        var poisToAdd = []
        var poisToUpdate = []
        var poisToDelete = []

                

        // Détection des ajouts et des updates
        for (poi in robotActiveMapPois) {
            var poiOriginal = robotActiveMapPois[poi];
            var poiToCompare =  tools.searchInObjects(mongoActiveMapPois,'Name',poiOriginal.Name,'object')
            // console.log ("poiOriginal :"+poiOriginal.Name)
            // console.log ("poiToCompare :"+poiToCompare.Name)
            if (poiToCompare) {
                if (models.checkSumPOI(poiOriginal) ===  models.checkSumPOI(poiToCompare)) {
                    if (modeDebug === true)  console.log (poiOriginal.Name+ ": poiOriginal == poiToCompare ("+poiToCompare.Name+")")
                } else {
                    if (modeDebug === true)  console.log (poiOriginal.Name+ ": poiOriginal != poiToCompare("+poiToCompare.Name+")")
                    poiToCompare.Pose = poiOriginal.Pose
                    poiToCompare.lastUpdate = Date.now(); // TimeStamp
                    poisToUpdate.push(poiToCompare);
                }
            } else {
                var newPoi = new models.Poi(poiOriginal);
                newPoi.MapID = activeMap.MapID;
                newPoi.creationDate = Date.now(); // TimeStamp
                newPoi.SceneID = null;
                newPoi.Description = "Description du POI "+poiOriginal.Name;
                newPoi.Sparql = null;
                poisToAdd.push(newPoi);
            }

        }
        

        //Détection des suppressions
        for (poi in mongoActiveMapPois) {
            var poiToCompare = mongoActiveMapPois[poi];
            var isInNewList =  tools.searchInObjects(robotActiveMapPois,'Name',poiToCompare.Name,'boolean')
            if (isInNewList === false) poisToDelete.push(poiToCompare);
        }



        if (modeDebug === true) {
            
            console.log ("poisToAdd: ")
            console.log (poisToAdd)

            console.log ("poisToUpdate: ")
            console.log (poisToUpdate)

            console.log ("poisToDelete: ")
            console.log (poisToDelete)

        }

        addPois();
        //updatePois();
        //deletePois();

        function addPois() {
            console.log("@ initPoiContents.synchroPois.addPois()")
            if (tools.isEmpty(poisToAdd) === false)  {
                // console.log (poisToAdd)
                var arrayDocs = poisToAdd
                var collection = 'PointsOfInterest'
                insertManyDocs(collection,arrayDocs,function (result){
                    text = "@ initPoiContents.synchroPois.addPois() - Result of insertManyDocs("+collection+")";
                    var displayResult = "result.result.ok: " + result.result.ok;
                    displayResult += " \nresult.result.n: " + result.result.n;
                    displayResult += "\nresult.insertedCount: " + result.insertedCount ;
                    displayResult += "\nresult.insertedIds: " + result.insertedIds ;
                    displayResult += "\nresult.ops:" + result.ops;
                    manyDocs = result.ops
                    displayResultTest (text,displayResult,manyDocs);
                    updatePois()
                });
            } else {
                updatePois()
            }
        }


        function updatePois() {
            console.log("@ initPoiContents.synchroPois.updatePois()")
            
            if (tools.isEmpty(poisToUpdate) === false) {
                
                
                // Vu qu'il est impossible sous MongoDB de faire un ReplaceManyDocs,
                // On passe par une boucle While sur le tableau des docs à modifier
                // Et on fait des transactions unitaires
                var lastItem = poisToUpdate.length
                // console.log (" +++++ poisToUpdate.lenght: "+lastItem);
                var collection = 'PointsOfInterest';
                
                var n = 0;
                var nResult = 0;
                while (n < lastItem) {
                    
                    //console.log("WHILE "+n);
                    //console.log(poisToUpdate[n]);
                    var docID = {_id: poisToUpdate[n]._id};     
                    replaceOneDoc(collection,docID,poisToUpdate[n],function (result){
                            
                        text = "@ initPoiContents.synchroPois.updatePois() - Result of replaceOneDoc("+collection+")["+nResult+"] > " ;
                        var displayResult = "result.result.ok: " + result.result.ok;
                        displayResult += "\nresult.result.n: " + result.result.n;
                        displayResult += "\nresult.matchedCount: "+result.matchedCount;
                        displayResult += "\nresult.modifiedCount: "+result.modifiedCount;
                        displayResult += "\nresult.upsertedId: "+result.upsertedId;
                        displayResult += "\nresult.upsertedCount: "+result.upsertedCount;
                        displayResultTest (text,displayResult); 
                                    
                        // On incrémente le compteur de résultats de l'update pour le comparer
                        // aux nombres d'items du tableau, et si tous l;es résultats sont OK
                        // on lance la transaction suivante (delete)...
                        nResult = nResult +result.result.n; 
                        console.log (" +++++ ("+nResult+") ENd of While ???  +++++ ");
                            if (nResult === lastItem) {
                                console.log (" +++++ ("+nResult+") ENd of While !!!  +++++ ");
                                
                                    deletePois()
                            }
                    }); 
                    n+=1;                   
                }

            } else {
                deletePois()
            }
                
        }   







        function deletePois() {
            console.log("@ initPoiContents.synchroPois.deletePois()")
            if (tools.isEmpty(poisToDelete) === false) {
                //console.log (poisToDelete)
                
                // voir ici
                // http://stackoverflow.com/questions/18566590/remove-multiple-documents-from-mongo-in-a-single-query


                // Vu qu'il est impossible sous MongoDB de faire un deleteManyDocs,
                // On passe par une boucle While sur le tableau des docs à modifier
                // Et on fait des transactions unitaires
                var lastItem = poisToDelete.length
                // console.log (" +++++ poisToUpdate.lenght: "+lastItem);
                var collection = 'PointsOfInterest';
                
                var n = 0;
                var nResult = 0;
                while (n < lastItem) {
                    
                    //console.log("WHILE "+n);
                    //console.log(poisToUpdate[n]);
                    var docID = {_id: poisToDelete[n]._id};     
                    
                    deleteOnedDoc(collection,poisToDelete[n],function (result){
                            
                        text = "@ initPoiContents.synchroPois.deletePois() - Result of deleteOneDoc("+collection+")["+nResult+"] > " ;
                        
                        var displayResult = "result.result.ok: " + result.result.ok;
                        displayResult += "\nresult.result.n: " + result.result.n;
                        displayResult += "\nresult.deletedCount: "+result.deletedCount;
                        displayResultTest (text,displayResult);
                        
                        // On incrémente le compteur de résultats de l'update pour le comparer
                        // aux nombres d'items du tableau, et si tous l;es résultats sont OK
                        // on lance la transaction suivante (delete)...
                        nResult = nResult +result.result.n; 
                        console.log (" +++++ ("+nResult+") ENd of While ???  +++++ ");
                        if (nResult === lastItem) {
                            console.log (" +++++ ("+nResult+") ENd of While !!!  +++++ ");
                            laSuiteIbrahim()
                        }
                    }); 
                    n+=1;                   
                }
            } else {
                laSuiteIbrahim()
            }
        }

    }

}



function laSuiteIbrahim() {
    console.log ("@ laSuiteIbrahim()");
}

/**/


/**/// ------------------------------------------------------