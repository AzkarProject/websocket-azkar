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

console.log ("module_komcom chargé");
// Envoi d'une commande de type "Drive" au robot
// Note: Obsolète avec la nouvelle version de komNav
// exports.sendDrive = function (enable, aSpeed,lSpeed){
exports.sendDriveOLD = function (data){        
        
   
    var enable = data.enable;
    var aSpeed = data.aSpeed;
    var lSpeed = data.lSpeed;
    
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
         
            if (parameters.navSys == 'Robubox') {

                var url = "https://127.0.0.1:443/http://127.0.0.1:50000/api/drive" ; // CORS-ANYWHERE

                // function sendDrive(url, enable, aSpeed,lSpeed) {
                var btnA = (enable == 'true' ? true : false); //  
                //return Q.Promise(function(resolve, reject, notify) {
                    
                var xhr = new XMLHttpRequest();
                xhr.open('POST', url);
                xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                //xhr.send(data);
                xhr.send(JSON.stringify({
                        "Enable": btnA,
                        "TargetAngularSpeed": aSpeed,
                        "TargetLinearSpeed": lSpeed
                    }));
                xhr.closed;
           
            } else if (parameters.navSys == 'KomNAV') {
                //console.log (">>>>>>>>>>>>>> Send Drive To KomNav");

                var rpcMethod = 'com.kompai2.drive';
                var values = [];
                values[0] = lSpeed;
                values[1] = aSpeed;
                
                SESSION.call(rpcMethod, values);

            }

        }  
}


// Récupère les infos de position et de statut du robot
// Note: Obsolète avec la nouvelle version de komNav
// exports.getRobotInfo = function (init){
exports.getRobotInfoOLD = function (init){

	
	// console.log ('get robot position');
	// Titi: Rebond proxy en https(Client Robot) > Http(Robubox)
	var urlRobotPosition = 'https://127.0.0.1:443/http://127.0.0.1:50000/lokarria/localization';

	if (fakeRobubox == true) {  
       robotInfo = getFakeRobotInfo();
       DEFFERED_RobotInfo.resolve();

    } else {
    	
    	$.get(urlRobotPosition, function(dataLocalization) { // la localisation du robot sur la carte
        robotInfo = JSON.parse(dataLocalization);
        //if (init == true) defferedRobotInfo.resolve();
        if (init == true) DEFFERED_RobotInfo.resolve();
    	});

    }
	
}

// Récupère les métadatas de la map active coté robot
// Note: Obsolète avec la nouvelle version de komNav
// exports.getDataMap = function (){
exports.getDataMapOLD = function (){
	
	console.log ('get map informations');
	// Titi: Rebond proxy en https(Client Robot) > Http(Robubox)
    var url = 'https://127.0.0.1:443/http://127.0.0.1:50000/nav/maps/parameters';
    
    if (fakeRobubox == true) {  
        dataMap = getFakeDataMap();
        DEFFERED_DataMap.resolve();
    } else {
        
        $.get(url, function(rep) { // Les informations de la carte 
		    if (!rep) return;
		    dataMap = rep;
            DEFFERED_DataMap.resolve();

    	});  
    }   
}


// Récupère le niveau de la  la batterie et l'affiche dans une progress bar
// Iinterroge chaque 1000ms le robot via url et retourne le niveau de la batterie en pourcentage
// Note: Obsolète avec la nouvelle version de komNav
// exports.getBattery = function (){
exports.getBatteryOLD = function (){
        

	         var delay = 1000; // l'interval de temps au bout du quel on envoi une autre requete pour rafraichir les information
             var dataJson, remaining, percentage, dataString, thenum, progressBar;

             if (fakeRobubox == true) {
                batteryInfo = getFakeBattery();
                setInterval(function() {
                    thenum = batteryInfo.Remaining ;
                    percentage = (thenum <= 100) ? thenum : 100; // 6- 
                    // rafraichissement de la jauge sur l'IHM Robot
                    ihm.refreshJaugeBattery(percentage);
                    // envoi des valeurs au pilote via le serveur
                    navigation_interface.sendToPilote("battery_level",percentage)
                 }, delay);
                

             } else {

                var url = "https://127.0.0.1:443/http://127.0.0.1:50000/lokarria/battery" ; // CORS-ANYWHERE	         
    	                
    	        setInterval(function() {
    	            $.get(url, function(data) { // 1 -  et 2- 
    	               batteryInfo = JSON.parse(data);
    	                thenum = batteryInfo.Remaining ;
    	                // console.log('thenum -->', thenum);
    	                percentage = (thenum <= 100) ? thenum : 100; // 6- 
    	            });
                    // rafraichissement de la jauge sur l'IHM Robot
                    ihm.refreshJaugeBattery(percentage);
                    // envoi des valeurs au pilote via le serveur
                    //commandes.sendToPilote("battery_level",percentage)
                    navigation_interface.sendToPilote("battery_level",percentage)

    	        }, delay);

            } 
            /**/
               
} // End getBattery


// ------------ 05/2016 -- Versions adaptées pour KomNav/MobiServ -------------------
// Notes: la rétrocompatibilité Robubox n'est plus maintenue...



// 
var activeGoto = false; // Pour le switch go/stop du bouton de POI...
exports.sendGotoPOI = function (data) {

       
        console.log("komcom.sendGotoPOI("+data.poiname+") - activeGoto:"+activeGoto)
        
        // alert("komcom.sendGotoPOI("+data.poiname+")")

        // Mémo:
        // >>> POST: Commande "Aller vers un point d'intérêt"
        // http://127.0.0.1:7007/Navigation/Goto/POI
        // Envoi: {"poiname":"PilierA"}
        // Réponse: HTTP 204 (No content) / 

        /*// reception d'un ordre gotoPOI
        socket.on("gotoPOI", function(data) {
            var toSend = {"poiname":data.poi}
        }); 
        /**/  

        /*// Version avec activeGoto
        if (activeGoto == true)  {

            
            activeGoto = false;
            clearInterval(result);
            console.log("Trajectory Statut: Stopped!")
        

        } else if (activeGoto == false) {
        
            activeGoto = true;
            
            if (fakeRobubox == false) {
             
                //console.log

                var url = null
                url = "https://127.0.0.1:443/http://127.0.0.1:7007/Navigation/Goto/POI" ; // CORS-ANYWHERE

                if ( url != null) {
                    var xhr = new XMLHttpRequest();
                    xhr.open('POST', url);
                    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                    //xhr.send(data);
                    xhr.send(JSON.stringify({
                            "poiname": data.poiname,
                        }));
                    xhr.closed;
                }

            } 
        } 
        /**/ // Fin version avec activegoto 
        
        // Version sans activeGoto
        if (fakeRobubox == false) {
             
            //console.log

            var url = null
            url = "https://127.0.0.1:443/http://127.0.0.1:7007/Navigation/Goto/POI" ; // CORS-ANYWHERE

            if ( url != null) {
                var xhr = new XMLHttpRequest();
                xhr.open('POST', url);
                xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                //xhr.send(data);
                xhr.send(JSON.stringify({
                        "poiname": data.poiname,
                    }));
                xhr.closed;
            }

        } 
        /**/ // fin version sans activeGoto 








      

        /*else {
            clearInterval(result);
            console.log("Trajectory Statut: Stopped!")
            // stopTrajectoryState()
        }
        /**/

        
        // Petite tempo avant de récupérer la trajectoire du robot; le temps pour lui de la calculer...
        //var result = setTimeout(function() { komcom.getGotoTrajectoryState(); }, 500); 
        //var result = setInterval(function() { komcom.getGotoTrajectoryState(); }, 500);
        
        

        // 
        // var result == null;
        //var temporesult = setTimeout(function() {  result = setInterval(function() { getTrajectoryState(); }, 100); }, 1000); 

        // OK
        // result = setInterval(function() { getTrajectoryState(); }, 200);





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
                        url = "https://127.0.0.1:443/http://127.0.0.1:7007/Navigation/Goto/State" ; // CORS-ANYWHERE
                        if (url != null) {
                            $.get(url, function(data) { // la localisation du robot sur la carte
                            var gotoState = JSON.parse(data);
                            //console.log("Trajectory Statut: "+gotoState )
                            //console.log(gotoState);
                            
                            // Version sans activeGoto..
                            /*// Detection de fin de déplacement...
                            if (gotoState.Status == 0) { // 0 = status 'Waiting'
                                 clearInterval(result);
                                 console.log("Trajectory Statut: Stopped!")
                            }
                            /**/
                            socket.emit("gotoStateReturn",{gotoState});
                            
                            });
                        }
                    }


        }








}

/*
exports.getGotoTrajectoryState = function () {

            activeGoto = true

            if (fakeRobubox == true) {  
                var gotoState = getFakeGotoTrajectoryState();
                console.log("Trajectory Statut: "+gotoState )
                console.log(gotoState);
                socket.emit("gotoStateReturn",{gotoState});

            } else {

                var url = null
                url = "https://127.0.0.1:443/http://127.0.0.1:7007/Navigation/Goto/State" ; // CORS-ANYWHERE
                if (url != null) {
                    $.get(url, function(data) { // la localisation du robot sur la carte
                    var gotoState = JSON.parse(data);
                    console.log("Trajectory Statut: "+gotoState )
                    console.log(gotoState);
                    socket.emit("gotoStateReturn",{gotoState});
                    
                    });
                }
            }


}
/**/



// Envoi d'une commande de type "Drive" au robot
// Note: Compatible avec la version de komNav/Mobiserve
// exports.sendDrive = function (enable, aSpeed,lSpeed){
exports.sendDrive = function (data){        
        
   
    var enable = data.enable;
    var aSpeed = data.aSpeed;
    var lSpeed = data.lSpeed;
    
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
            url = "https://127.0.0.1:443/http://127.0.0.1:7007/Navigation/Speed" ; // CORS-ANYWHERE
            
            /*
            if (parameters.navSys == 'Robubox') {
                url = "https://127.0.0.1:443/http://127.0.0.1:50000/api/drive" ; // CORS-ANYWHERE
            } else if (parameters.navSys == 'KomNAV') {
            	url = "https://127.0.0.1:443/http://127.0.0.1:7007/Navigation/Speed" ; // CORS-ANYWHERE
            }
            /**/

            if ( url != null) {
	           	// function sendDrive(url, enable, aSpeed,lSpeed) {
	            var btnA = (enable == 'true' ? true : false); //  
	            //return Q.Promise(function(resolve, reject, notify) {  
	            var xhr = new XMLHttpRequest();
	            xhr.open('POST', url);
	            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	            //xhr.send(data);
	            xhr.send(JSON.stringify({
	                    "Enable": btnA,
	                    "TargetAngularSpeed": aSpeed,
	                    "TargetLinearSpeed": lSpeed
	                }));
	            xhr.closed;
            
            }

        }  

}


// Récupère le niveau de la  la batterie et déclenche l'affiche dans une progress bar
// Interroge chaque 1000ms le robot via url et retourne le niveau de la batterie en pourcentage
// Note: Compatible avec la version de komNav/Mobiserve
exports.getBattery = function (){
        
			 // console.log("komcom.getBattery() >>> ");
	         var delay = 1000; // l'interval de temps au bout du quel on envoi une autre requete pour rafraichir les information
             var dataJson, remaining, percentage, dataString, thenum, progressBar;

             if (fakeRobubox == true) {
                
                batteryInfo = getFakeBattery();
                setInterval(function() {
                    thenum = batteryInfo.Remaining ;
                    percentage = (thenum <= 100) ? thenum : 100; // 6- 
                    // rafraichissement de la jauge sur l'IHM Robot
                    ihm.refreshJaugeBattery(percentage);
                    // envoi des valeurs au pilote via le serveur
                    navigation_interface.sendToPilote("battery_level",percentage)
                 }, delay);
                

             } else {

             	var url = null;
                url = "https://127.0.0.1:443/http://127.0.0.1:7007/Devices/Battery" ; // CORS-ANYWHERE    
             
    	        setInterval(function() {
    	            
	    	        // console.log("komcom.getBattery() >>> navSys ="+navSys);
	    	        // console.log("komcom.getBattery() >>> parameters.navSys ="+parameters.navSys);
	             	
	             	/*
                    if (parameters.navSys == 'Robubox') {
	              		url = "https://127.0.0.1:443/http://127.0.0.1:50000/lokarria/battery"
	              	} else if (parameters.navSys == 'KomNAV') {
	                	url = "https://127.0.0.1:443/http://127.0.0.1:7007/Devices/Battery" ; // CORS-ANYWHERE	  
	              	} 
                    /**/  
                    /*
    	            $.get(url, function(data) { // 1 -  et 2- 
    	                if (parameters.navSys == 'Robubox') {
    	                	batteryInfo = JSON.parse(data);
    	                	thenum = batteryInfo.Remaining ;
    	                } else if (parameters.navSys == 'KomNAV') {
    	                	thenum = data;
    	                }
    	                percentage = (data <= 100) ? data : 100; // 6- 
    	            });
                    /**/

                    $.get(url, function(data) { 
                        thenum = data;
                        percentage = (data <= 100) ? data : 100; 
                    });
                    
                    // rafraichissement de la jauge sur l'IHM Robot
                    ihm.refreshJaugeBattery(percentage);
                    // envoi des valeurs au pilote via le serveur
                    navigation_interface.sendToPilote("battery_level",percentage)

    	        }, delay);


             }
                
                


               
} // End getBattery


// Note: Compatible avec la version de komNav/Mobiserve
// TODO à terminer
exports.sendFullStop = function (data){        
        
    var messageStop = tools.stringObjectDump(data, "Fonction STOP à implémenter")
    alert(messageStop);

            
}


// 
// Note: Compatible avec la version de komNav/Mobiserve
exports.getListPOI = function (init){

	
    

    var url = null;
    url = 'https://127.0.0.1:443/http://127.0.0.1:7007/Navigation/Map/POI';

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

	
	var url = null;
	url = 'https://127.0.0.1:443/http://127.0.0.1:7007/Navigation/Map/Localization';
    /*
    if (parameters.navSys == 'Robubox') {
    	 url = 'https://127.0.0.1:443/http://127.0.0.1:50000/lokarria/localization';
    } else if (parameters.navSys == 'KomNAV') {
    	 url = 'https://127.0.0.1:443/http://127.0.0.1:7007/Navigation/Map/Localisation';
    }
    /**/	


    
	if (fakeRobubox == true) {  
       robotInfo = getFakeRobotInfo();
       DEFFERED_RobotInfo.resolve();

    } else {
    	
    	if (url != null) {
			$.get(url, function(data) { // la localisation du robot sur la carte
		    robotInfo = JSON.parse(data);
		    if (init == true) {
                console.log("get first robot position (init)")
                console.log(robotInfo)
                DEFFERED_RobotInfo.resolve();
                }
			});
		}

    }
    /**/

    // Pour tests
    //robotInfo = getFakeRobotInfo();
    //DEFFERED_RobotInfo.resolve();
	
}

// Récupère les métadatas de la map active coté robot
// Note: Compatible avec la version de komNav/Mobiserve
exports.getDataMap = function (){
	
	
	
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
    url = 'https://127.0.0.1:443/http://127.0.0.1:7007/Navigation/Map/Metadatas'; 
    
    
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
    } 
    /**/  

    // Provisoirement, on utilise les métadatas en dur
    /*// correspondant à la carte en cours...
    dataMap = getFakeDataMap();
    DEFFERED_DataMap.resolve();
    /**/
    
}



})(typeof exports === 'undefined'? this['komcom']={}: exports);