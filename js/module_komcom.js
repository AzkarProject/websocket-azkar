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

(function(exports){

console.log ("module_komcom V2 chargé");
// console.log("fakeRobubox = "+fakeRobubox)

// ------------ 05/2016 -- Versions adaptées pour KomNav/MobiServ -------------------
// Notes: la rétrocompatibilité Robubox n'est plus maintenue...

// ------------ 07/2016 -- Abandon compatibilité KomNav (serveur WSS plus maintenu par 52js)

// ------------ 09/2016 -- Ajouts IPs dynamiques pour Robot et caméra

// ------------ 03/08/2017 -- Modification pour PTZ Optics... 

mobiservUrl = null; // MobiServ Kompaï LaVilette
foscamUrl = null; // Foscam Kompaï LaVilette

// Récupération des infos serveur
function getIpRessources() {
    socket.emit('getIpRessources',""); 
}

// A la réponse du serveur:
socket.on("getIpRessources", function(data) { 
    
    foscamUrl = data.ipFoscam.url;
    mobiservUrl = data.ipRobot.url;
    console.log("socket.on('getIpRessources', data");
    console.log(data);

});

getIpRessources();


exports.sendGotoPOI = function (data) {

       
    console.log("komcom.sendGotoPOI("+data+")");
    console.log (data);
    var IdPoi = parseInt(data.poiname)
    //console.log (listPOI);
    //console.log (robotInfo);
    //console.log (robotInfo.Differential.Status);

    if (fakeRobubox == null) return;
    //else if (robotInfo.Differential.Status != 0) alert("Robot in move ! Stop it or wait the end of the translation")
    //else if (robotInfo.Localization.Localized != true ) alert("Robot is not correctly localized ! move it manually on a Point of interest, select the POI in the form and click on the reset button")


    // if ( robotInfo.State === 16) return; // si le robot est en mouvement...
   

    
    // On n'envoie la commande que si le robot est branché

    if (fakeRobubox == false) {
         
        //console.log

        var url = null
        //url = "https://127.0.0.1:443/http://127.0.0.1:7007/Navigation/Goto/POI" ; // CORS-ANYWHERE
        //url = "https://127.0.0.1:443/http://192.168.1.66:7007/Navigation/Goto/POI" ; // CORS-ANYWHERE
        //url = "https://127.0.0.1:443/http://"+mobiservUrl+"/Navigation/Goto/POI" ; // CORS-ANYWHERE
        url = "https://127.0.0.1:443/http://"+mobiservUrl+"/navigation/destination/poi" ; // CORS-ANYWHERE

        if ( url != null) {
            
            var xhr = new XMLHttpRequest();
            

            //Ecouteur pour traiter les réponses HTTP
            var statusCode = null
            var statusTitle = null
            var statusComment = null
            xhr.onreadystatechange = function() {
                
                
                statusCode = xhr.status;

                if (statusCode == 202) statusTitle = "Accepted";
                else if (statusCode == 400) statusTitle = "Bad Request : The specified point of interest doesn't exist";
                else if (statusCode == 404) {
                    statusTitle = "Not Found : the robot couldn't compute a trajectory.";
                    statusComment = "This could happen for two reasons. Either the destination is unreachable or outside of the free mapped area, or the localization is bad and indicates the robot is in an occupied area "
                }
                else if (statusCode == 500) statusTitle = "Internal Error : There was an error while sending the trajectory to the low level controller ";
                
                // On informe l'autre client du résultat de la requête
                var response = {"statusCode":statusCode, "statusTitle": statusTitle, "statusComment": statusComment };
                socket.emit("gotoStateReturn", response);
                // console.log(response)
                // Si la commande est acceptée, on lance la récupération de la trajectoire:
                if (statusCode == 202) {
                    //getTrajectoryPath();
                    // Petite tempo avant de récupérer la trajectoire du robot, pour éviter les effacements accidentels...
                    var result = setTimeout(function() { getTrajectoryPath(); }, 1000);
                }
                /**/
               

                
            }







            xhr.open('PUT', url);
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            //xhr.send(data);
            xhr.send(JSON.stringify({
                    "Id": IdPoi,
                }));
            xhr.closed;
        


        }

   
    }         

    
  







    function getTrajectoryPath() {

        console.log ("@ getTrajectoryPath()")
        // si on est en mode simulation
        // On récupère un dataset correspondant à la trajectoire demandée
        // la commande getFakeTrajectory étant sensée simuler 
        // ce que renverrai le vrai robot...
        if (fakeRobubox == true) {  
            
            getFakeTrajectory(data);

        } else {

            var url = null
            //url = "https://127.0.0.1:443/http://127.0.0.1:7007/Navigation/Goto/State" ; // CORS-ANYWHERE
            //url = "https://127.0.0.1:443/http://127.0.0.1:7007/Navigation/Goto/Status" ; // CORS-ANYWHERE
            //url = "https://127.0.0.1:443/http://192.166.1.66:7007/Navigation/Goto/Status" ; // CORS-ANYWHERE
            url = "https://127.0.0.1:443/http://"+mobiservUrl+"/navigation/trajectory" ;
            
            if (url != null) {
                $.get(url, function(data) { // la localisation du robot sur la carte
                path = JSON.parse(data);
                
                console.log(path)




                socket.emit("gotoTrajectory",{path});
                carto.convertPath()
                });
            }
        }


    }



    /*// Petite tempo avant de récupérer la trajectoire du robot; le temps pour lui de la calculer...
    var result = setTimeout(function() { getTrajectoryPath(); }, 500); 


    function getTrajectoryPath() {

        console.log ("@ getTrajectoryPath()")
        // si on est en mode simulation
        // On récupère un dataset correspondant à la trajectoire demandée
        // la commande getFakeTrajectory étant sensée simuler 
        // ce que renverrai le vrai robot...
        if (fakeRobubox == true) {  
            
            getFakeTrajectory(data);

        } else {

            var url = null
            //url = "https://127.0.0.1:443/http://127.0.0.1:7007/Navigation/Goto/State" ; // CORS-ANYWHERE
            //url = "https://127.0.0.1:443/http://127.0.0.1:7007/Navigation/Goto/Status" ; // CORS-ANYWHERE
            //url = "https://127.0.0.1:443/http://192.166.1.66:7007/Navigation/Goto/Status" ; // CORS-ANYWHERE
            url = "https://127.0.0.1:443/http://"+mobiservUrl+"/Navigation/Goto/Status" ; // CORS-ANYWHERE
            if (url != null) {
                $.get(url, function(data) { // la localisation du robot sur la carte
                path = JSON.parse(data);
                socket.emit("gotoTrajectory",{path});
                carto.convertPath()
                
                });
            }
        }


    }

    // On récupère la trajectoire en cours
    // Avec une intervalle d'une seconde...

    if (fakeRobubox == false ) result = setInterval(function() { getTrajectoryState(); }, 2000);


    function stopTrajectoryState() {
        clearInterval(result);
        console.log("Trajectory Statut: Stopped!")
    }
    


    function getTrajectoryState() {

        //activeGoto = true

        if (fakeRobubox == true) {  
            var gotoState = getFakeGotoTrajectoryState();
            //console.log("Trajectory Statut: "+gotoState )
            //console.log(gotoState);
            socket.emit("gotoStateReturn",{gotoState});

        } else {

            var url = null
            //url = "https://127.0.0.1:443/http://127.0.0.1:7007/Navigation/Goto/State" ; // CORS-ANYWHERE
            //url = "https://127.0.0.1:443/http://127.0.0.1:7007/Navigation/Goto/Status" ; // CORS-ANYWHERE
            //url = "https://127.0.0.1:443/http://192.168.1.66:7007/Navigation/Goto/Status" ; // CORS-ANYWHERE
            url = "https://127.0.0.1:443/http://"+mobiservUrl+"/Navigation/Goto/Status" ; // CORS-ANYWHERE
            if (url != null) {
                $.get(url, function(data) { // la localisation du robot sur la carte
                var gotoState = JSON.parse(data);
                gotoState.Trajectory = null; // On vire le tableau des trajectoires pour ne pas surcharger le système....
                //console.log("Trajectory Statut: "+gotoState )
                //console.log(gotoState);
                
                // Version sans activeGoto..
                // -- Detection de fin de déplacement...
                    // if (gotoState.Status == 0) { // 0 = status 'Waiting'
                    //    clearInterval(result);
                    //    console.log("Trajectory Statut: Stopped!")
                    // }
                socket.emit("gotoStateReturn",{gotoState});
                
                });
            }
        }


    }
    /**/

}



exports.sendWTF = function (data) {
    console.log("komcom.sendWTF("+data+")");
    console.log (data);

    var xPoi = data.poi.Pose.X;
    var yPoi = data.poi.Pose.Y;
    var tPoi = data.poi.Pose.Z;

    if (fakeRobubox == true) {  
            
            // getFakeTrajectory(data);

    } else {

        // { "X" : 1.2, "Y" : 3.4, "T" : 0.5 }

        var url = null
        url = "https://127.0.0.1:443/http://"+mobiservUrl+"/localization/pose" ; // CORS-ANYWHERE

        if ( url != null) {
            
            var xhr = new XMLHttpRequest();
            //Ecouteur pour traiter les réponses HTTP
            var statusCode = null
            var statusTitle = null
            var statusComment = null
            xhr.onreadystatechange = function() {
                
                statusCode = xhr.status;

                // Si la commande est acceptée
                if (statusCode == 202) statusTitle = "Accepted";
                else if (statusCode == 400) statusTitle = "Bad Request : The specified point of interest doesn't exist";
                else if (statusCode == 404) {
                    statusTitle = "Not Found : the robot couldn't be relocalized.";
                    statusComment = "This could happen because the selected localization not corresponding to the real robot position "
                }
                else if (statusCode == 500) statusTitle = "Internal Error : There was an error while sending the relocalisation position to the low level controller ";
                
                // On informe l'autre client du résultat de la requête
                var response = {"statusCode":statusCode, "statusTitle": statusTitle, "statusComment": statusComment };
                socket.emit("gotoStateReturn", response);
                console.log("Response:" +response)
    
                
            }

            
            xhr.open('PUT', url);
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            //xhr.send(data);
            xhr.send(JSON.stringify({
                    "X": xPoi,
                    "Y": yPoi,
                    "T": tPoi
                }));
            xhr.closed;
            /**/


        }






    }
}



exports.sendRelocalizeOnPOI = function (data) {

   
    console.log("komcom.sendRelocalizeOnPOI("+data+")");
    console.log (data);
    

    var IdPoi = parseInt(data.poiname)


    if (fakeRobubox == null) return;


    if (fakeRobubox == false) {
         
        //console.log

        var url = null
        url = "https://127.0.0.1:443/http://"+mobiservUrl+"/navigation/localization/pose" ; // CORS-ANYWHERE

        if ( url != null) {
            
            var xhr = new XMLHttpRequest();
            

            //Ecouteur pour traiter les réponses HTTP
            var statusCode = null
            var statusTitle = null
            var statusComment = null
            xhr.onreadystatechange = function() {
                
                
                statusCode = xhr.status;

                if (statusCode == 202) statusTitle = "Accepted";
                else if (statusCode == 400) statusTitle = "Bad Request : The specified point of interest doesn't exist";
                else if (statusCode == 404) {
                    statusTitle = "Not Found : the robot couldn't be relocalized.";
                    statusComment = "This could happen because the selected localization not corresponding to the real robot position "
                }
                else if (statusCode == 500) statusTitle = "Internal Error : There was an error while sending the relocalisation position to the low level controller ";
                
                // On informe l'autre client du résultat de la requête
                var response = {"statusCode":statusCode, "statusTitle": statusTitle, "statusComment": statusComment };
                socket.emit("gotoStateReturn", response);
                console.log("Response:" +response)
                // Si la commande est acceptée
                if (statusCode == 202) {
                    // todo
                }
                
               

                
            }






       
            xhr.open('PUT', url);
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            //xhr.send(data);
            xhr.send(JSON.stringify({
                    "Id": IdPoi,
                }));
            xhr.closed;
            


        }

   
    }
    /**/ 
}     



// Envoi d'une commande de type "Drive" au robot
// Note: Compatible avec la version de komNav/Mobiserve
// exports.sendDrive = function (enable, aSpeed,lSpeed){
exports.sendDrive = function (data){        
        
    if (fakeRobubox == null) return;
    //console.log("sendDrive")
    //console.log(data)

    var enable = data.enable;
    var aSpeed = data.aSpeed;
    var lSpeed = data.lSpeed;


    // Recentrage préventif de la caméra PTZ...
    var order = {command: "onCameraGoToDefaultPosition"}    
    getPtzOpticsCommand(order)

    if (data.source == "Homme-Mort") console.log ("Homme-Mort");
    
        //console.log ("komcom.sendDrive()");
       
        // Flags Homme mort:  
        if (enable != false) {
            onMove = true;
            lastMoveTimeStamp = Date.now();
        
        } else if (enable == false){
            onMove = false;
            lastMoveTimeStamp = 0;
        }
        
            
        if (fakeRobubox == false) {
         
         	var url = null
            //url = "https://127.0.0.1:443/http://127.0.0.1:7007/Navigation/Speed" ; // CORS-ANYWHERE
            //url = "https://127.0.0.1:443/http://192.168.1.66:7007/Navigation/Speed" ; // CORS-ANYWHERE
            // url = "https://127.0.0.1:443/http://"+mobiservUrl+"/Navigation/Speed" ; // CORS-ANYWHERE
            url = "https://127.0.0.1:443/http://"+mobiservUrl+"/differential/command" ; // CORS-ANYWHERE
            

            if ( url != null) {
	           	// function sendDrive(url, enable, aSpeed,lSpeed) {
	            var btnA = (enable == 'true' ? true : false); //  
	            //return Q.Promise(function(resolve, reject, notify) {  
	            var xhr = new XMLHttpRequest();
	            xhr.open('PUT', url);
	            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	            //xhr.send(data);
	            xhr.send(JSON.stringify({
	                    "Enable": btnA,
	                    "TargetAngularSpeed": aSpeed,
	                    "TargetLinearSpeed": lSpeed
	                }));
	            xhr.closed;
            
            }

        }  else {
            // On simule le déplacement du robot...
            console.log(robotInfo)
            /*// Version 1
            // Modification de l'angle...
            robotInfo.Pose.Orientation = robotInfo.Pose.Orientation+aSpeed/4;
            // Marche avant/arrière selon l'angle...
            var x2 = robotInfo.Pose.Position.X + Math.cos(robotInfo.Pose.Orientation) * lSpeed/4;
            var y2 = robotInfo.Pose.Position.Y + Math.sin(robotInfo.Pose.Orientation) * lSpeed/4;
            robotInfo.Pose.Position.X = x2;
            robotInfo.Pose.Position.Y = y2;
            /**/

            // Version Aggregate (komnav 2)
            // modification de l'angle
            robotInfo.Localization.T = robotInfo.Localization.T+aSpeed/4;
            // Marche avant/arrière selon l'angle...
            var x2 = robotInfo.Localization.X + Math.cos(robotInfo.Localization.T) * lSpeed/4;
            var y2 = robotInfo.Localization.Y + Math.sin(robotInfo.Localization.T) * lSpeed/4;
            robotInfo.Localization.X = x2;
            robotInfo.Localization.Y = y2;


            /**/

        }

}


// Récupère le niveau de la  la batterie et déclenche l'affichage d'une progress bar
// Interroge chaque 1000ms le robot via url et retourne le niveau de la batterie en pourcentage
// Note: Compatible avec la version de komNav/Mobiserve
exports.getBattery = function (){
        
    // console.log('@@@@@@@@@@@@@@@ getBattery')

    if (fakeRobubox == null) return;

    // console.log("komcom.getBattery() >>> ");
    var delay = 1000; // l'interval de temps au bout du quel on envoi une autre requete pour rafraichir les information
    var dataJson, remaining, percentage, dataString, thenum, progressBar;

    if (fakeRobubox == true) {

        
        batteryInfo = getFakeBattery();
        loopBattery = setInterval(function() {
            // console.log('@@@@@@@@@@@@@@@ getBattery (Fake true)')

            thenum = batteryInfo.Remaining ;
            percentage = (thenum <= 100) ? thenum : 100; // 6- 
            // rafraichissement de la jauge sur l'IHM Robot
            ihm.refreshJaugeBattery(percentage);
            // envoi des valeurs au pilote via le serveur
            navigation_interface.sendToPilote("battery_level",percentage)
         }, delay);


    } else {

    	var url = null;
        //url = "https://127.0.0.1:443/http://127.0.0.1:7007/Devices/Battery" ; // CORS-ANYWHERE    
        // url = "https://127.0.0.1:443/http://192.168.1.66:7007/Devices/Battery" ; // CORS-ANYWHERE  
        // url = "https://127.0.0.1:443/http://"+mobiservUrl+"/Devices/Battery" ; // CORS-ANYWHERE  
        
        url = "https://127.0.0.1:443/http://"+mobiservUrl+"/battery/state" ; // CORS-ANYWHERE 


        loopBattery = setInterval(function() {
        
            // console.log('@@@@@@@@@@@@@@@ getBattery (Fake false)')    

            $.get(url, function(data) { 
                thenum = data;
                percentage = (data <= 100) ? data : 100; 
            });

            
            // Debugg fakeRobubox via admin
            //percentage = (25 <= 100) ? 25 : 100; 


            // rafraichissement de la jauge sur l'IHM Robot
            ihm.refreshJaugeBattery(percentage);
            // envoi des valeurs au pilote via le serveur
            navigation_interface.sendToPilote("battery_level",percentage)

        }, delay);


    }
                          
} // End getBattery


// Envoi d'une commande STOP permettant de bloquer 
// Note: Compatible avec la version de komNav/Mobiserve
// TODO à tester...
exports.sendFullStop = function (data){        
        
    if (fakeRobubox == null) return;

    console.log("@ sendFullStop()");
    stopFakeFollowTrajectory();
    robotInfo.State = 8;
    // robotInfo.statusPath = "STOP ORDER !!"
    path = null;
    



    if (fakeRobubox == true) {  

        // Stopper le FakeTrajectory

    } else {  

        var url = null
        //url = "https://127.0.0.1:443/http://127.0.0.1:7007/Navigation/Stop" ; // CORS-ANYWHERE
        //url = "https://127.0.0.1:443/http://192.168.1.66:7007/Navigation/Stop" ; // CORS-ANYWHERE
        //url = "https://127.0.0.1:443/http://"+mobiservUrl+"/Navigation/Stop" ; // CORS-ANYWHERE
        url = "https://127.0.0.1:443/http://"+mobiservUrl+"/navigation/stop" ; // CORS-ANYWHERE


        if ( url != null) {
            var xhr = new XMLHttpRequest();
            xhr.open('PUT', url);
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            //xhr.send(data);
            xhr.send();
            xhr.closed;
        }

        var response = {"statusTitle": "Stopped"};
        socket.emit("gotoStateReturn", response);

    }      
}


// Note: Compatible avec la version de komNav/Mobiserve
exports.getListPOI = function (init){

	
    if (fakeRobubox == null) return;

    var url = null;
    //url = 'https://127.0.0.1:443/http://127.0.0.1:7007/Navigation/Map/POI';
    //url = 'https://127.0.0.1:443/http://192.168.1.66:7007/Navigation/Map/POI';
    //url = "https://127.0.0.1:443/http://"+mobiservUrl+"/Navigation/Map/POI";
    url = "https://127.0.0.1:443/http://"+mobiservUrl+"/pois";

    if (fakeRobubox == true) {  
        
        listPOI = getFakelistPOI();
        DEFFERED_listPOI.resolve();

    } else {
        
        
        if (url != null) {

            $.get(url, function(data) { // la localisation du robot sur la carte
            listPOI = JSON.parse(data);
            console.log("get list of P.O.I")
            console.log(listPOI)
            if (init == true) DEFFERED_listPOI.resolve();

            });
        }
        /**/
        
        /*// Debugg fakeRobubox via admin
        // listPOI = [];
        listPOI = [
            {"Name":"Poi1","Pose":{"X":-2.95,"Y":-2.3,"Theta":3.15}, "label":"Marne 1914" },
            {"Name":"Poi2","Pose":{"X":7,"Y":0,"Theta":5.5}, "label":"Tranchées" },
            {"Name":"Poi3","Pose":{"X":13,"Y":1,"Theta":4.8}, "label":"Tranchée Allemande" },
            {"Name":"Poi4","Pose":{"X":20,"Y":1.5,"Theta":5}, "label":"Tranchée française" }
        ] ;
        DEFFERED_listPOI.resolve();
        /**/

    }

    // Pour tests
    // listPOI = getFakelistPOI();
    // DEFFERED_listPOI.resolve();

}

// Récupère les infos de position et de statut du robot
// Note: Compatible avec la version de komNav/Mobiserve
// Le paramètre init (true ou false) permet de ne déclencher
// la gestion asynchrone du résultat qu'au premier appel..
// Une sorte de pattern "Singleton"
exports.getRobotInfo = function (init){

	if (fakeRobubox == null) return;
    
	var url = null;
	//url = 'https://127.0.0.1:443/http://127.0.0.1:7007/Navigation/Map/Localization';
    //url = 'https://127.0.0.1:443/http://192.168.1.66:7007/Navigation/Map/Localization';
    // url = "https://127.0.0.1:443/http://"+mobiservUrl+"/Navigation/Map/Localization";
	//url = "https://127.0.0.1:443/http://"+mobiservUrl+"/localization/state";
    url = "https://127.0.0.1:443/http://"+mobiservUrl+"/aggregate";
    
    // console.log("************ getRobotInfo() ****");

    if (fakeRobubox == true) {  
       
       robotInfo = getFakeRobotInfo();
       DEFFERED_RobotInfo.resolve();

    } else {
    	
    	
        if (url != null) {
			$.get(url, function(data) { // la localisation du robot sur la carte
		    robotInfo = JSON.parse(data);
		    // console.log(robotInfo)
            //robotInfo = {"Pose":{"Orientation":4.8,"Position":{"X":13,"Y":1,"Z":0}},"State":8,"Timestamp":2916720}
            
            if (init == true) {
                console.log("get first robot position (init)")
                console.log(robotInfo)
                DEFFERED_RobotInfo.resolve();
                }
			});

		}

        //url = "https://127.0.0.1:443/http://"+mobiservUrl+"/aggregate";

        // Pour debug, test du 

        
        /*// Debugg fakeRobubox via admin
        robotInfo = {"Pose":{"Orientation":4.8,"Position":{"X":13,"Y":1,"Z":0}},"State":8,"Timestamp":2916720}
        DEFFERED_RobotInfo.resolve();
        /**/
    }


    // Pour tests
    //robotInfo = getFakeRobotInfo();
    //DEFFERED_RobotInfo.resolve();
	
}

// Récupère les métadatas de la map active coté robot
// Note: Compatible avec la version de komNav/Mobiserve
exports.getDataMap = function (){
	
	if (fakeRobubox == null) return;
	
	//console.log ('get map metadatas');
    // Titi: Rebond proxy en https(Client Robot) > Http(Robubox/KomNav)
    var url = null;
    // URL du service http Mobiserve original:
    // url = 'https://127.0.0.1:443/http://127.0.0.1:7007/Navigation/Map/Properties'; 
    // >>> BUG ! Cette fonction Mobiserve Renvoie un objet contenant une propriété "data []" beaucoup trop lourde !!!
    // >>> Non seulement Il faut + de 900ms secondes pour avoir une réponse
    // >>> mais en plus ca plante complètement le script de carto pour des raisons de tailles et d'asynchronité.

    // Essai avec une version modifiée de Mobiserve qui implémente une fonction
    // identique à la précédente mais renvoyant un objet map reconstruit propriété par propriété
    // et expurgé  de sa priopriété data.
    // Cette nouvelle fonction est dans mobiserve/Runtime/WebAPI.cs ligne 285   
    //url = 'https://127.0.0.1:443/http://127.0.0.1:7007/Navigation/Map/Metadatas'; 
    //url = 'https://127.0.0.1:443/http://192.168.1.66:7007/Navigation/Map/Metadatas'; 
    //url = "https://127.0.0.1:443/http://"+mobiservUrl+"/Navigation/Map/Metadatas"; 
    url = "https://127.0.0.1:443/http://"+mobiservUrl+"/map/properties"; 
    
    if (fakeRobubox == true) {  
        dataMap = getFakeDataMap();
        DEFFERED_DataMap.resolve();
    
    } else {
        
        
        if (url != null) {
            $.get(url, function(rep) { // Les informations de la carte 
                
                dataMap = JSON.parse(rep);
                DEFFERED_DataMap.resolve();
                console.log ('get map metadatas');
                console.log(dataMap)
            }); 
        } 
        /**/

        /*// Debugg fakeRobubox via admin
        dataMap = {"Offset":{"X":-17.4151232326,"Y":-21.3146600184},"Width":3942,"Stride":3944,"Height":1928,"Data":null,"Resolution":0.019999999553}
        DEFFERED_DataMap.resolve();
        /**/
    }  

}

// ---------- Author F Mazieras
/*// Note titi: obsolète. 
exports.sendCameraOld = function (data){        
    //decoder_control.cgi?command=[&onestep=&degree=&user=&pwd=&next_url=]
      
    // 0 up
    // 1 stop up
    // 2 down
    // 3 stop down
    // 4 left
    // 5 stop left
    // 6 right
    // 7 stop right
    

    // console.log ("komcom.sendCamera("+ url +")");

    var command = data.command;
    console.log ("komcom.sendCamera("+ command +")");
    var cmd = "";
    switch (command) {
        case "onCameraLeft":
            cmd = "ptzMoveLeft";
            break;
        case "onCameraStop":
            cmd = "ptzStopRun";
            break;
        case "onCameraRight":
            cmd = "ptzMoveRight";
            break;
        case "onCameraUp":
            cmd = "ptzMoveUp";
            break;
        case "onCameraDown":
            cmd = "ptzMoveDown";
            break;
       case "onCameraGoToDefaultPosition":
            cmd = "ptzReset";
            break;
       case "onCameraGoToPreset1":
            cmd = "31";
            break;
        default:
            console.log("command unknown");
            break;
            
    }
    
    //var url = "http://192.168.1.32:88/cgi-bin/CGIProxy.fcgi?usr%3Dwebvisite%26pwd%3D230458DS%23%26cmd%3D" + cmd  ; // CORS-ANYWHERE
    //var url = "https://127.0.0.1:443/https://192.168.1.50:88/cgi-bin/CGIProxy.fcgi?usr%3Dwebvisite%26pwd%3D230458DS%26cmd%3D" + cmd  ; // CORS-ANYWHERE
   // -------------------------------------------
   //var url = "https://127.0.0.1:443/http://192.168.1.50:88/cgi-bin/CGIProxy.fcgi?cmd="+cmd+"&usr=webvisite&pwd=230458DS"; // CORS-ANYWHERE
    //var url = "https://127.0.0.1:443/http://10.0.15.50:88/cgi-bin/CGIProxy.fcgi?cmd="+cmd+"&usr=webvisite&pwd=230458DS"; 
    var url = "https://127.0.0.1:443/http://"+foscamUrl+"/cgi-bin/CGIProxy.fcgi?cmd="+cmd+"&usr=webvisite&pwd=230458DS"; 
    console.log ("komcom.sendCamera("+ url +")");
        
   
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.send();
        xhr.closed;
}
/**/


// ---------- Author F Mazieras & Thierry Bergeron
/*// Obsolète: (ajout switch caméra ptz optics)
exports.sendCameraOld2 = function (data){        
    
    
    console.log ("komcom.sendCamera *********");
    console.log (data);
    
    if ( isPanTiltCamera == false ) {
        console.log ("isPanTiltCamera == false");
        return
    } else {
        console.log ("isPanTiltCamera == true");
    }



    var proxyUrl = "https://127.0.0.1:443/http://";
    var cgiUrl = foscamUrl+"/cgi-bin/CGIProxy.fcgi";
    var cmdUrl = "?cmd=";
    var usrUrl = "&usr=webvisite&pwd=230458DS";
    var valueUrl = "";
    var command = data.command;
     
    var value = null;
    if (data.value) value = data.value;
    
     // console.log ("komcom.sendCamera(command = "+ command +", value = "+value+")");
     //console.log ("komcom.sendCamera()");
     //console.log(data);
    
    switch (command) {

        case "onCameraLeft":
            cmd = "ptzMoveLeft";
            break;
        case "onCameraRight":
            cmd = "ptzMoveRight";
            break;
        case "onCameraUp":
            cmd = "ptzMoveUp";
            break;
        case "onCameraDown":
            cmd = "ptzMoveDown";
            break;

        case "onCameraStop":
            cmd = "ptzStopRun";
            break;        
        case "onCameraGoToDefaultPosition":
            cmd = "ptzReset";
            break;

        
        // Speed = 0:very slow, 1:Slow, 2:Normal speed, 3:Fast , 4:Very Fast
        // /cgi-bin/CGIProxy.fcgi?cmd=setPTZSpeed&speed=2&usr=admin&pwd=    
        case "onCameraSetSpeed":
            cmd = "setPTZSpeed";
            valueUrl = "&speed="+value;
            break;


        // ptzAddPresetPoint
        // /cgi-bin/CGIProxy.fcgi?cmd=ptzAddPresetPoint&name=test&usr=admin&pwd

        // ptzDeletePresetPoint
        // /cgi-bin/CGIProxy.fcgi?cmd=ptzDeletePresetPoint&name=test&usr=admin&pwd=
        case "onCameraDeletePoint":
            cmd = "ptzDeletePresetPoint";
            valueUrl = "&name="+value;
            break;
        
        // We have 4 point default:LeftMost\RightMost\TopMost\BottomMost
        case "onCameraGoToPresetTopMost":
            cmd = "ptzGotoPresetPoint";
            valueUrl = "&name=TopMost";
            break;
        
        case "onCameraGoToPresetBottomMost":
            cmd = "ptzGotoPresetPoint";
            valueUrl = "&name=BottomMost";
            break;

        case "onCameraGoToPresetLeftMost":
            cmd = "ptzGotoPresetPoint";
            valueUrl = "&name=LeftMost";
            break;

        case "onCameraGoToPresetRightMost":
            cmd = "ptzGotoPresetPoint";
            valueUrl = "&name=RightMost";
            break;    


        // zoomIn
        // /cgi-bin/CGIProxy.fcgi?cmd=zoomIn
        case "onCameraZoomIn":
            cmd = "zoomIn";
            break;  

        // zoomOut
        // /cgi-bin/CGIProxy.fcgi?cmd=zoomOut
        case "onCameraZoomOut":
            cmd = "zoomOut";
            break;  

        // zoomStop
        // /cgi-bin/CGIProxy.fcgi?cmd=zoomStop
        case "onCameraZoomStop":
            cmd = "zoomStop";
            break;  

        // setZoomSpeed
        // Speed: 1 = Slow, 2= Normal, 3= Fast
        // /cgi-bin/CGIProxy.fcgi?cmd=setZoomSpeed&usr=admin&pwd=&speed=1
        case "onCameraSetZoomSpeed":
            cmd = "setZoomSpeed";
            valueUrl = "&Speed="+value;
            break;  


        default:
            console.log("Unknown command: "+cmd);
            break;
            
    }
    //  var url = "https://127.0.0.1:443/http://"+foscamUrl+"/cgi-bin/CGIProxy.fcgi?cmd="+cmd+"&usr=webvisite&pwd=230458DS";
    var url = proxyUrl+cgiUrl+cmdUrl+cmd+valueUrl+usrUrl; 
    //console.log ("komcom.sendCamera("+ url +")");
        
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.send();
    xhr.closed;
}
/**/

// Récupère les infos de la caméra Foscam 
/*// Todo: A finir !!!!!
exports.getCameraInfosOld = function (query){
    
    console.log ("komcom.getCameraInfos *********");

    if ( isPanTiltCamera == false ) return
    if (fakeRobubox == null) return;
    
    //console.log ('get map metadatas');
    // Titi: Rebond proxy en https(Client Robot) > Http(Robubox/KomNav)
    var url = null;
    var url = "https://127.0.0.1:443/http://"+foscamUrl+"/cgi-bin/CGIProxy.fcgi?cmd="+cmd+"&usr=webvisite&pwd=230458DS"; 
    console.log ("komcom.getCameraInfos("+ url +")");
    
    



    if (fakeRobubox == true) {  

    
    } else {
        
        

        // Todo:

        // getPTZPresetPointList
        // /cgi-bin/CGIProxy.fcgi?cmd=getPTZPresetPointList&usr=admin&pwd=
        // We have 4 point default:LeftMost\RightMost\TopMost\BottomMost
        // Return cnt = Current preset point count
        // Return pointN = The name of point N

        // getPTZSpeed
        // /cgi-bin/CGIProxy.fcgi?cmd=getPTZSpeed&usr=admin&pwd=
        // Return Speed = 0:very slow, 1:Slow, 2:Normal speed, 3:Fast , 4:Very Fast

        // getZoomSpeed
        // /cgi-bin/CGIProxy.fcgi?cmd=getZoomSpeed&usr=admin&pwd=
        // Return Speed = 0:Slow, 1:Normal, 3:Fast

        if (url != null) {
            $.get(url, function(rep) {
                //console.log (rep);
            }); 
        } 
    }  
}
/**/




// --------- 03/08/2017 ------ Switch Foscam/ptz optics


// ---------- Author F Mazieras
function getFoscamCommand(data) {

   console.log("getFoscamCommand("+data+")") 

    var cgiUrl = foscamUrl+"/cgi-bin/CGIProxy.fcgi";
    var cmdUrl = "?cmd=";
    var usrUrl = "&usr=webvisite&pwd=230458DS";
    var valueUrl = "";
    var command = data.command;

    var value = null;
    if (data.value) value = data.value;
    
     // console.log ("komcom.sendCamera(command = "+ command +", value = "+value+")");
     //console.log ("komcom.sendCamera()");
     //console.log(data);
    
    switch (command) {

        case "onCameraLeft":
            cmd = "ptzMoveLeft";
            break;
        case "onCameraRight":
            cmd = "ptzMoveRight";
            break;
        case "onCameraUp":
            cmd = "ptzMoveUp";
            break;
        case "onCameraDown":
            cmd = "ptzMoveDown";
            break;

        case "onCameraStop":
            cmd = "ptzStopRun";
            break;        
        case "onCameraGoToDefaultPosition":
            cmd = "ptzReset";
            break;

        
        // Speed = 0:very slow, 1:Slow, 2:Normal speed, 3:Fast , 4:Very Fast
        // /cgi-bin/CGIProxy.fcgi?cmd=setPTZSpeed&speed=2&usr=admin&pwd=    
        case "onCameraSetSpeed":
            cmd = "setPTZSpeed";
            valueUrl = "&speed="+value;
            break;


        // ptzAddPresetPoint
        // /cgi-bin/CGIProxy.fcgi?cmd=ptzAddPresetPoint&name=test&usr=admin&pwd

        // ptzDeletePresetPoint
        // /cgi-bin/CGIProxy.fcgi?cmd=ptzDeletePresetPoint&name=test&usr=admin&pwd=
        case "onCameraDeletePoint":
            cmd = "ptzDeletePresetPoint";
            valueUrl = "&name="+value;
            break;
        
        // We have 4 point default:LeftMost\RightMost\TopMost\BottomMost
        case "onCameraGoToPresetTopMost":
            cmd = "ptzGotoPresetPoint";
            valueUrl = "&name=TopMost";
            break;
        
        case "onCameraGoToPresetBottomMost":
            cmd = "ptzGotoPresetPoint";
            valueUrl = "&name=BottomMost";
            break;

        case "onCameraGoToPresetLeftMost":
            cmd = "ptzGotoPresetPoint";
            valueUrl = "&name=LeftMost";
            break;

        case "onCameraGoToPresetRightMost":
            cmd = "ptzGotoPresetPoint";
            valueUrl = "&name=RightMost";
            break;    


        // zoomIn
        // /cgi-bin/CGIProxy.fcgi?cmd=zoomIn
        case "onCameraZoomIn":
            cmd = "zoomIn";
            break;  

        // zoomOut
        // /cgi-bin/CGIProxy.fcgi?cmd=zoomOut
        case "onCameraZoomOut":
            cmd = "zoomOut";
            break;  

        // zoomStop
        // /cgi-bin/CGIProxy.fcgi?cmd=zoomStop
        case "onCameraZoomStop":
            cmd = "zoomStop";
            break;  

        // setZoomSpeed
        // Speed: 1 = Slow, 2= Normal, 3= Fast
        // /cgi-bin/CGIProxy.fcgi?cmd=setZoomSpeed&usr=admin&pwd=&speed=1
        case "onCameraSetZoomSpeed":
            cmd = "setZoomSpeed";
            valueUrl = "&Speed="+value;
            break;  


        default:
            console.log("Unknown command: "+cmd);
            break;
            
    }
    //  var url = "https://127.0.0.1:443/http://"+foscamUrl+"/cgi-bin/CGIProxy.fcgi?cmd="+cmd+"&usr=webvisite&pwd=230458DS";
    return cgiUrl+cmdUrl+cmd+valueUrl+usrUrl; 

}

// ---------- Author F Mazieras
function getPtzOpticsCommand(data) {

    console.log("getPtzOpticsCommand("+data+")")
    console.log(data)
    var cgiUrl = foscamUrl+"/cgi-bin/ptzctrl.cgi";
    var cmdUrl = "";
    var usrUrl = "&usr=admin&pwd=admin";
    var command = data.command;

    var value = null;
    if (data.value) value = data.value;
    
     // console.log ("komcom.sendCamera(command = "+ command +", value = "+value+")");
     //console.log ("komcom.sendCamera()");
     //console.log(data);
    
    switch (command) {

        case "onCameraLeft":
            console.log('case "onCameraLeft"')
            cmdUrl = "?ptzcmd&left&" + panspeed + "&" + tiltspeed + "";
            break;
        case "onCameraRight":
            console.log('case "onCameraRight"')
            cmdUrl = "?ptzcmd&right&" + panspeed + "&" + tiltspeed + "";
            break;
        case "onCameraUp":
            console.log('case "onCameraUp"')
             cmdUrl = "?ptzcmd&up&" + panspeed + "&" + tiltspeed + "";
            break;
        case "onCameraDown":
            console.log('case "onCameraDown"')
             cmdUrl = "?ptzcmd&down&" + panspeed + "&" + tiltspeed + "";
            break;

        case "onCameraStop":
            console.log('case "onCameraStop"')
            cmdUrl = "?ptzcmd&ptzstop&" + panspeed + "&" + tiltspeed + "";
            break;        
        
        case "onCameraGoToDefaultPosition":
            console.log('case "onCameraGoToDefaultPosition"')
             cmdUrl = "?ptzcmd&home&" + panspeed + "&" + tiltspeed + "";
            break;

        
        // Speed = 0:very slow, 1:Slow, 2:Normal speed, 3:Fast , 4:Very Fast
        // /cgi-bin/CGIProxy.fcgi?cmd=setPTZSpeed&speed=2&usr=admin&pwd=    
        case "onCameraSetSpeed":
            
            panspeed = value;
            tiltspeed = value;
            break;


        // ptzAddPresetPoint
        // /cgi-bin/CGIProxy.fcgi?cmd=ptzAddPresetPoint&name=test&usr=admin&pwd

        // ptzDeletePresetPoint
        // /cgi-bin/CGIProxy.fcgi?cmd=ptzDeletePresetPoint&name=test&usr=admin&pwd=
        //case "onCameraDeletePoint":
            //cmd = "ptzDeletePresetPoint";
            //valueUrl = "&name="+value;
        //    break;
        
        // We have 4 point default:LeftMost\RightMost\TopMost\BottomMost
        case "onCameraGoToPresetTopMost":
            cmdUrl = "?ptzcmd&poscall&1";
            break;
        
        case "onCameraGoToPresetBottomMost":
            cmdUrl = "?ptzcmd&poscall&2";
            break;

        case "onCameraGoToPresetLeftMost":
            cmdUrl = "?ptzcmd&poscall&3";
            break;

        case "onCameraGoToPresetRightMost":
            cmdUrl = "?ptzcmd&poscall&4";
            break;    


        // zoomIn
        // /cgi-bin/CGIProxy.fcgi?cmd=zoomIn
        case "onCameraZoomIn":
            cmdUrl = "?ptzcmd&zoomin&" + zoomspeed  + "";
            break;  

        // zoomOut
        // /cgi-bin/CGIProxy.fcgi?cmd=zoomOut
        case "onCameraZoomOut":
            cmdUrl = "?ptzcmd&zoomout&" + zoomspeed + "";
            break;  

        // zoomStop
        // /cgi-bin/CGIProxy.fcgi?cmd=zoomStop
        case "onCameraZoomStop":
            cmdUrl = "?ptzcmd&zoomstop&" + zoomspeed + "";
            break;  

        // setZoomSpeed
        // Speed: 1 = Slow, 2= Normal, 3= Fast
        // /cgi-bin/CGIProxy.fcgi?cmd=setZoomSpeed&usr=admin&pwd=&speed=1
        case "onCameraSetZoomSpeed":
            zoomspeed = value;
            break;  


        default:
            console.log("Unknown command: "+cmd);
            break;
            
    }
    //  var url = "https://127.0.0.1:443/http://"+foscamUrl+"/cgi-bin/CGIProxy.fcgi?cmd="+cmd+"&usr=webvisite&pwd=230458DS";
    return cgiUrl+cmdUrl+usrUrl; 
}



// ---------- Author F Mazieras & Thierry Bergeron
exports.sendCamera = function (data){        
    
    
    console.log ("komcom.sendCamera *********");
    console.log (data);
    
    if ( isPanTiltCamera == false ) {
        console.log ("isPanTiltCamera == false");
        return
    } else {
        console.log ("isPanTiltCamera == true");
    }



    var proxyUrl = "https://127.0.0.1:443/http://";
    var url;

    if (isFoscam == true) {
        url = proxyUrl + getFoscamCommand(data)
    } else {
        url = proxyUrl + getPtzOpticsCommand(data)
    }
    //console.log ("komcom.sendCamera("+ url +")");
        
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.send();
    xhr.closed;
}












})(typeof exports === 'undefined'? this['komcom']={}: exports);