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


console.log("module_fake_robubox chargé")

fakeRobubox = appSettings.isFakeRobubox();
// if (typeof appCNRS != 'undefined') fakeRobubox = appCNRS.isFakeRobubox();


/*// --------------- Mémo services http de mobiserve -------------------------


>>> GET: Données de la carte active
http://127.0.0.1:7007/Navigation/Map/Properties
Result*: BUG (Le tableau Data[0,....,0] est tellement lourd qu'il est impossible de traiter 
l'objet JSon retourné dans un délai acceptable pour l'application...)
{"Offset":{"X":-20.7969943946,"Y":-3.02713963867},"Width":1485,"Stride":1488,"Height":1187,"Data":[0,...............................................................................,0],"Resolution":0.019999999553}

Fix: Ajout d'un service "Map/Properties" modifié dans Mobiserve retournant les mêmes infos sauf le tableau data[] 
http://127.0.0.1:7007/Navigation/Map/Metadatas
Result: 
{"Offset":{"X":-20.7969943946,"Y":-3.02713963867},"Width":1485,"Stride":1488,"Height":1187,"Data": null,"Resolution":0.019999999553}

>>> POST: Commande "Aller vers un point d'intérêt"
http://127.0.0.1:7007/Navigation/Goto/POI
Envoi: {"poiname":"PilierA"}
Réponse: HTTP 204 (No content) / 

// ---------------

>>> GET: Données de navigation pendant l'execution d'un mouvement Goto
http://127.0.0.1:7007/Navigation/Goto/State
Result*: {"Status":0,"Trajectory":null}

Result**: {"Status":1,"Trajectory":[{"Start":{"X":0.009070652537047863,"Y":3.9810504913330078},"End":{"X":0.025969889014959335,"Y":3.9916448593139648},"MaxSpeed":0.10939528289227803},{"Start":{"X":0.025969889014959335,"Y":3.9916448593139648},"End":{"X":0.042457610368728638,"Y":4.0029311180114746},"MaxSpeed":0.15477626154938765},{....},{....}]}

Result***: {"Status":0,"Trajectory":[{"Start":{"X":0.009070652537047863,"Y":3.9810504913330078},"End":{"X":0.025969889014959335,"Y":3.9916448593139648},"MaxSpeed":0.10939528289227803},{"Start":{"X":0.025969889014959335,"Y":3.9916448593139648},"End":{"X":0.042457610368728638,"Y":4.0029311180114746},"MaxSpeed":0.15477626154938765},{....},{....}]}

* Juste après intialisation Mobiserve + juste après "Drive" local
** Pendant un "Goto" distant - Ok
*** Après un "Goto" distant - Ok
** Pendant un "Goto" local - Todo
*** Après un "Goto" local - Todo
**** Juste après un "Drive" suivi d'un Stop - Todo
**** Juste après un "Goto" suivi d'un Stop - Todo

Status possibles:
- Waiting = 0,
- Following = 1,
- Aiming = 2,
- Translating = 3,
- Rotating = 4,
- Error = 5

// ----------

>>> GET: Position du robot
http://127.0.0.1:7007/Navigation/Map/Localization
Result*: {"Pose":{"Orientation":0.014824313679471759,"Position":{"X":-0.01693115491662614,"Y":-0.011192893436510892,"Z":0}},"State":8,"Timestamp":2916720}
Result**: {"Pose":{"Orientation":-0.0028899908138566629,"Position":{"X":2.2384453654557794,"Y":11.742592076925583,"Z":0}},"State":16,"Timestamp":3435520}

* Si le robot est à l'arret & après un "Drive" local & après un "Goto" (distant & local) 
** Pendant un "Goto" ( distant & local ) & un "Drive" local 
*** Pendant un "Drive" distant - Todo
***** juste aprè un "Drive" suivi d'un Stop - Todo
***** juste aprè un "Goto" suivi d'un Stop - Todo

Status possibles:
- Invalid = 0x0000 (0)
- Metric = 0x0001 (1)
- Decimetric = 0x0002 (2)
- Centimetric = 0x0004 (4)
- Proprioceptive = 0x0008 (8)
- Exteroceptive = 0x0010 (16)
- Error = 0x0020 (32)


/**///---------------------------------------------------------------------





// Si existence d'un configuration spécifique à la branche de dev:
if (typeof appDevBranch != 'undefined') fakeRobubox = appDevBranch.isFakeRobubox();


function getFakeDataMap() {

    // Simu Map 26
    var dataMap = {"Offset":{"X":-20.7969943946,"Y":-3.02713963867},"Width":1485,"Stride":1488,"Height":1187,"Data": null,"Resolution":0.019999999553}

    // Simu Map 25
    // var dataMap = {"Offset":{"X":-19.8655429626,"Y":-3.10094802423},"Width":1577,"Stride":1584,"Height":1184,"Data":null,"Resolution":0.019999999553}

    // Simu map MGG
    // var dataMap = {"Offset":{"X":-52.8251232326,"Y":-63.9346600184},"Width":3942,"Stride":3944,"Height":1928,"Data":null,"Resolution":0.019999999553}
    
    // Simu map MGG offsets corrigés
    //var dataMap = {"Offset":{"X":-17.4151232326,"Y":-21.3146600184},"Width":3942,"Stride":3944,"Height":1928,"Data":null,"Resolution":0.019999999553}

    /**/

    return dataMap;
}


function getFakeRobotInfo() {

	// Simu map 26/26
    var robotInfo = {"Pose":{"Orientation":0.014824313679471759,"Position":{"X":-0.01693115491662614,"Y":-0.011192893436510892,"Z":0}},"State":8,"Timestamp":2916720}
    
    
    // Simu map MGG positon Marne 1914
    // var robotInfo = {"Pose":{"Orientation":3.15,"Position":{"X":-2.95,"Y":-2.3,"Z":0}},"State":8,"Timestamp":2916720}


    // Simu map MGG positon départ XY - OK
    //var robotInfo = {"Pose":{"Orientation":0,"Position":{"X":0,"Y":0,"Z":0}},"State":8,"Timestamp":2916720}

    // Simu map MGG position Tranchées - OK
    // var robotInfo = {"Pose":{"Orientation":5.5,"Position":{"X":7,"Y":0,"Z":0}},"State":8,"Timestamp":2916720}

    // Simu map MGG positon Tranchée Allemande
    //var robotInfo = {"Pose":{"Orientation":4.8,"Position":{"X":13,"Y":1,"Z":0}},"State":8,"Timestamp":2916720}
    
    // Simu map MGG positon No Man's Land
    //var robotInfo = {"Pose":{"Orientation":4.8,"Position":{"X":13,"Y":1,"Z":0}},"State":8,"Timestamp":2916720}

    // Simu map MGG positon Tranchée Française
    //var robotInfo = {"Pose":{"Orientation":4.8,"Position":{"X":13,"Y":1,"Z":0}},"State":8,"Timestamp":2916720}


    /**/

    return robotInfo;

}

function getFakeGotoTrajectoryState() {

	var gotoTrajectoryState = {"Status":1,"Trajectory":[{"Start":{"X":0.009070652537047863,"Y":3.9810504913330078},"End":{"X":0.025969889014959335,"Y":3.9916448593139648},"MaxSpeed":0.10939528289227803},{"Start":{"X":0.025969889014959335,"Y":3.9916448593139648},"End":{"X":0.042457610368728638,"Y":4.0029311180114746},"MaxSpeed":0.15477626154938765}]}

	return gotoTrajectoryState;

}


function getFakelistPOI() {
    
    console.log("getFakelistPOI()")

    // Simu Map 26
    var listPOI = [{"Name":"PilierA","Pose":{"X":1,"Y":6.2584240093506871,"Theta":0}},{"Name":"PilierB","Pose":{"X":2.1479895820222588,"Y":11.719296811569686,"Theta":0}},{"Name":"PilierC","Pose":{"X":-10.172822608108211,"Y":11.222853829549779,"Theta":0}},{"Name":"PilierD","Pose":{"X":-10.263084968475466,"Y":5.8973745678816627,"Theta":0}}]
	
	// Simu Map 25 (Sans POI)
	// var listPOI = []
    
    /*// Simu MGG
    var listPOI = [
        {"Name":"Poi1","Pose":{"X":-2.95,"Y":-2.3,"Theta":3.15}, "label":"Marne 1914" },
        {"Name":"Poi2","Pose":{"X":7,"Y":0,"Theta":5.5}, "label":"Tranchées" },
        {"Name":"Poi3","Pose":{"X":13,"Y":1,"Theta":4.8}, "label":"Tranchée Allemande" },
        // {"Name":"Poi n°4","Pose":{"X":16.5,"Y":1.25,"Theta":4.9},"label":"No Man's Land" },
        {"Name":"Poi4","Pose":{"X":20,"Y":1.5,"Theta":5}, "label":"Tranchée française" }
        ]
    /**/
   
        //var robotInfo = {"Pose":{"Orientation":4.8,"Position":{"X":13,"Y":1,"Z":0}},"State":8,"Timestamp":2916720}



    return listPOI;

}



function getFakeBattery() {
    var battery ={
		"Properties":{
			"Critical":10,
			"Power":20,
			"Voltage":24
		},
		"Remaining":66,
		"Status":2,
		"Timestamp":14636000
	}
	return battery;
}