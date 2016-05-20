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
//exports.sendDrive = function (enable, aSpeed,lSpeed){
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





// Fonction qui permet de recupérer le niveau de la  la batterie et de l'afficher dans le progress bar
// elle interroge chaque 1000ms le robot via url et retourne le niveau de la batterie en pourcentage
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


// ------------ 05/2016 -- Versions compatibles MobiServ -------------------


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
            
            if (parameters.navSys == 'Robubox') {
                url = "https://127.0.0.1:443/http://127.0.0.1:50000/api/drive" ; // CORS-ANYWHERE
            } else if (parameters.navSys == 'KomNAV') {
            	url = "https://127.0.0.1:443/http://127.0.0.1:7007/Navigation/Speed" ; // CORS-ANYWHERE
            }

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



// Fonction qui permet de recupérer le niveau de la  la batterie et de l'afficher dans le progress bar
// elle interroge chaque 1000ms le robot via url et retourne le niveau de la batterie en pourcentage
exports.getBattery = function (){
        
			 console.log("komcom.getBattery() >>> ");
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

             	
             
    	        setInterval(function() {
    	            
	    	        console.log("komcom.getBattery() >>> navSys ="+navSys);
	    	        console.log("komcom.getBattery() >>> parameters.navSys ="+parameters.navSys);
	             	
	             	if (parameters.navSys == 'Robubox') {
	              		url = "https://127.0.0.1:443/http://127.0.0.1:50000/lokarria/battery"
	              	} else if (parameters.navSys == 'KomNAV') {
	                	url = "https://127.0.0.1:443/http://127.0.0.1:7007/Devices/Battery" ; // CORS-ANYWHERE	  
	              	}   

    	            $.get(url, function(data) { // 1 -  et 2- 
    	                if (parameters.navSys == 'Robubox') {
    	                	batteryInfo = JSON.parse(data);
    	                	thenum = batteryInfo.Remaining ;
    	                } else if (parameters.navSys == 'KomNAV') {
    	                	thenum = data;
    	                }
    	                percentage = (data <= 100) ? data : 100; // 6- 
    	            });
                    
                    // rafraichissement de la jauge sur l'IHM Robot
                    ihm.refreshJaugeBattery(percentage);
                    // envoi des valeurs au pilote via le serveur
                    navigation_interface.sendToPilote("battery_level",percentage)

    	        }, delay);


             }
                
                


               
} // End getBattery



exports.sendFullStop = function (data){        
        
    var messageStop = tools.stringObjectDump(data, "Fonction STOP à implémenter")
    alert(messageStop);

            
}


exports.getRobotInfo = function (init){

	 /*
	var url = null;
    if (parameters.navSys == 'Robubox') {
    	 url = 'https://127.0.0.1:443/http://127.0.0.1:50000/lokarria/localization';
    } else if (parameters.navSys == 'KomNAV') {
    	 url = 'https://127.0.0.1:443/http://127.0.0.1:7007/Navigation/Map/Localisation';
    }	


   
	if (fakeRobubox == true) {  
       robotInfo = getFakeRobotInfo();
       DEFFERED_RobotInfo.resolve();

    } else {
    	
    	if (url != null) {

			$.get(url, function(dataLocalization) { // la localisation du robot sur la carte
		    robotInfo = JSON.parse(dataLocalization);
		    //if (init == true) defferedRobotInfo.resolve();
		    if (init == true) DEFFERED_RobotInfo.resolve();
			});
		}

    }
    /**/

    // Pour tests
    robotInfo = getFakeRobotInfo();
    DEFFERED_RobotInfo.resolve();
	
}


exports.getDataMap = function (){
	
	/*
	console.log ('get map informations');
	// Titi: Rebond proxy en https(Client Robot) > Http(Robubox)
    var url = null;
    
    if (parameters.navSys == 'Robubox') {
    	 url = 'https://127.0.0.1:443/http://127.0.0.1:50000/nav/maps/parameters';
    } else if (parameters.navSys == 'KomNAV') {
    	 url = 'https://127.0.0.1:443/http://127.0.0.1:7007/Navigation/Map/Properties';
    }	

    
    
    if (fakeRobubox == true) {  
        dataMap = getFakeDataMap();
        DEFFERED_DataMap.resolve();
    } else {
        
        if (url != null) {
	        $.get(url, function(rep) { // Les informations de la carte 
			    if (!rep) return;
			    dataMap = rep;
	            DEFFERED_DataMap.resolve();

	    	}); 
    	} 
    } 
    /**/  

    // Pour tests
    dataMap = getFakeDataMap();
    DEFFERED_DataMap.resolve();
}



})(typeof exports === 'undefined'? this['komcom']={}: exports);