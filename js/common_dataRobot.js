(function(exports){


console.log("dataRobot chargé")

//function getFakeDataMap() {
exports.getFakeDataMap = function () {

    var dataMap = {"Offset":{"X":-20.7969943946,"Y":-3.02713963867},"Width":1485,"Stride":1488,"Height":1187,"Data":[0,0,0],"Resolution":0.019999999553}
    return dataMap;
}


//function getFakelistPOI() {
exports.getFakelistPOI = function () {
    var listPOI = [
    				{"Name":"PilierA","Pose":{"X":2.3736454829404003,"Y":6.2584240093506871,"Theta":0}},
    				{"Name":"PilierB","Pose":{"X":2.1479895820222588,"Y":11.719296811569686,"Theta":0}},
    				{"Name":"PilierC","Pose":{"X":-10.172822608108211,"Y":11.222853829549779,"Theta":0}},
    				{"Name":"PilierD","Pose":{"X":-10.263084968475466,"Y":5.8973745678816627,"Theta":0}}
    				]
    return listPOI;

}



		// robotActiveMapPois = listPOI_addPOI; // Add Pilier E
		// robotActiveMapPois = listPOI_updatePOI; // Update pilier E & A
		// robotActiveMapPois = listPOI_deletePOI; // Add Pilier E , Update Pilier A et delete Pilier B
		// robotActiveMapPois = listPOI_MixOperationsPOIs // Add pilier AA, update pilier A, delete Pilier B







// robotActiveMapPois = listPOI_addPOI; // Add Pilier E
exports.getFakelistAddPOIE = function () {
    var listPOI = [
    				{"Name":"PilierA","Pose":{"X":2.3736454829404003,"Y":6.2584240093506871,"Theta":0}},
    				{"Name":"PilierB","Pose":{"X":2.1479895820222588,"Y":11.719296811569686,"Theta":0}},
    				{"Name":"PilierC","Pose":{"X":-10.172822608108211,"Y":11.222853829549779,"Theta":0}},
    				{"Name":"PilierD","Pose":{"X":-10.263084968475466,"Y":5.8973745678816627,"Theta":0}}, 
    				{"Name":"PilierE","Pose":{"X":-10.263084968475466,"Y":5.8973745678816627,"Theta":0}}
    				]
    return listPOI;

}

// robotActiveMapPois = listPOI_updatePOI; // Update pilier A & B + Add pilier E
exports.getFakelistUpdatePOIA = function () {
    var listPOI = [
    				{"Name":"PilierA","Pose":{"X":4.001,"Y":7.001,"Theta":0.5}},
    				{"Name":"PilierB","Pose":{"X":3.05,"Y":12.17,"Theta":0.8}},
    				{"Name":"PilierC","Pose":{"X":-10.172822608108211,"Y":11.222853829549779,"Theta":0}},
    				{"Name":"PilierD","Pose":{"X":-10.263084968475466,"Y":5.8973745678816627,"Theta":0}}, 
    				{"Name":"PilierE","Pose":{"X":-10.263084968475466,"Y":5.8973745678816627,"Theta":0}}
    				]
    return listPOI;

}

// robotActiveMapPois = listPOI_deletePOI; // Add Pilier E , Update Pilier A et delete Pilier B
exports.getFakelistDeletePOIB = function () {
    var listPOI = [
    				{"Name":"PilierA","Pose":{"X":4.001,"Y":7.001,"Theta":0.5}},
    				{"Name":"PilierC","Pose":{"X":-10.172822608108211,"Y":11.222853829549779,"Theta":0}},
    				{"Name":"PilierD","Pose":{"X":-10.263084968475466,"Y":5.8973745678816627,"Theta":0}}, 
    				{"Name":"PilierE","Pose":{"X":-10.263084968475466,"Y":5.8973745678816627,"Theta":0}}
    				]
    return listPOI;

}

// robotActiveMapPois = listPOI_MixOperationsPOIs // Add pilier AA, update pilier A, delete Pilier B
exports.getFakelistUpdPOIAAddPOIBBDeletePOIE = function () {
    var listPOI = [
    				{"Name":"PilierA","Pose":{"X":5.001,"Y":8.001,"Theta":0.9}},
    				{"Name":"PilierAA","Pose":{"X":2.3736454829404003,"Y":6.2584240093506871,"Theta":0}},
    				{"Name":"PilierC","Pose":{"X":-10.172822608108211,"Y":11.222853829549779,"Theta":0}},
    				{"Name":"PilierD","Pose":{"X":-10.263084968475466,"Y":5.8973745678816627,"Theta":0}}
    				]
    return listPOI;

}


exports.getFakeDataMap2 = function () {
    var dataMap = {"Offset":{"X":-30.7969943946,"Y":-5.02713963867},"Width":1485,"Stride":498,"Height":1187,"Data":[0,0,0],"Resolution":0.019999999553}
    return dataMap;
}

exports.getFakelistPOI2 = function () {
    var listPOI = [{"Name":"PilierMap2A","Pose":{"X":2.3736454829404003,"Y":6.2584240093506871,"Theta":0}},{"Name":"PilierMap2B","Pose":{"X":2.1479895820222588,"Y":11.719296811569686,"Theta":0}}]
    return listPOI;

}
})(typeof exports === 'undefined'? this['dataRobot']={}: exports);