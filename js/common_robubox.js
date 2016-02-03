(function(exports){


// Envoi d'une commande de type "Drive" au robot
//exports.sendDrive = function (enable, aSpeed,lSpeed){
exports.sendDrive = function (data){        
        
    var isRobubox = settings.isRobubox();
    var isBenchmark = settings.isBenchmark();

    console.log ("robubox.sendDrive_01("+isRobubox+")");
    // console.log(data);
    
     // driveSettings: this.settings.rpcMethod,
     // channel: parameters.navCh,
     // system: parameters.navSys,
     // dateA: dateA,
     // command: 'onDrive',
     // aSpeed: values[1],
     // lSpeed: values[0],
     // enable: 'true'
    
    var enable = data.enable;
    var aSpeed = data.aSpeed;
    var lSpeed = data.lSpeed;
    
    if (isBenchmark == true ) {

        var dateA = data.dateA;
        // var dateB = Date.now();
        //var dateB = Date.now(ts.now()); // date synchronisée avec le serveur
        var dateB = ServerDate.now(); // date synchronisée avec le serveur
        var source = data.source;
        var channel = data.channel;
        // var delta = dateB - dateA;
        //var msg = '['+data.channel+']['+data.system+']['+data.command+'][AtoB>'+delta+' ms]';
        //insereMessage3("",msg);
        //console.log(data);
    }

    
    if (isRobubox == true) {

        // var toto = "robubox.sendDrive(1) >> enable:"+enable+" onMove:"+onMove+" "+"lastMoveTimeStamp:"+lastMoveTimeStamp;
        
        // Flags Homme mort:  
        if (enable != false) {
            onMove = true;
            // console.log ("onMove = "+onMove);
            // lastMoveTimeStamp = Date.now(); // MAJ du dernier timestamp mouvement... 
            // lastMoveTimeStamp = Date.now(ts.now()); // date synchronisée avec le serveur
            if (isBenchmark == true ) lastMoveTimeStamp = ServerDate.now();
            else lastMoveTimeStamp = Date.now();
        


        } else if (enable == false){
            onMove = false;
            // console.log ("onMove = "+onMove);
            lastMoveTimeStamp = 0;
        }
        
        // var tata = "robubox.sendDrive(2) >> enable:"+enable+" onMove:"+onMove+" "+"lastMoveTimeStamp:"+lastMoveTimeStamp;
        // console.log(toto);
        // console.log(tata); 
            
        if (fakeRobubox == false) {
         
            if (parameters.navSys == 'Robubox') {

                //console.log (">>>>>>>>>>>>>> Send Drive To Robubox");
                // var url = 'http://localhost:50000/api/drive';
                // var url = "http://127.0.0.1:8080/127.0.0.1:50000/api/drive" ; // CORS-ANYWHERE
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

                var rpcMethod = 'com.thaby.drive';
                var values = [];
                values[0] = lSpeed;
                values[1] = aSpeed;
                
                if (isBenchmark == true ) {
                    values[2] = source; // source
                    values[3] = channel; // channel
                    values[4] = dateA;
                    values[5] = dateB;
                rpcMethod = 'com.thaby.drive.benchmark'; 
                }   
                
                SESSION.call(rpcMethod, values);

            }

        } else if (fakeRobubox == true) {
            
            if (isBenchmark == true ) {
                var aToB = dateB-dateA;
                var text = dateA+";"+dateB+";"+dateB+";"+source+";"+channel+";"+aToB+";;;"+'\n';
                insereMessage3('', text)
            }


        }
        
    }
    /**/
      
}

/*// Envoi d'une commande de type "Drive" au robot
exports.sendDrive2 = function (enable, aSpeed,lSpeed){
        
        
    var isRobubox = settings.isRobubox();
    console.log ("robubox.sendDrive_01("+isRobubox+")");
    
    
    var dateB = Date.now();


    if (isRobubox == true) {

        var toto = "robubox.sendDrive(1) >> enable:"+enable+" onMove:"+onMove+" "+"lastMoveTimeStamp:"+lastMoveTimeStamp;
        
        // Flags Homme mort:  
        if (enable == true) {
            onMove = true;
            lastMoveTimeStamp = Date.now(); // MAJ du dernier timestamp mouvement... 
        } else if (enable == false){
            onMove = false;
            lastMoveTimeStamp = 0;
        }
        
        var tata = "robubox.sendDrive(2) >> enable:"+enable+" onMove:"+onMove+" "+"lastMoveTimeStamp:"+lastMoveTimeStamp;
        //console.log(toto);
        //console.log(tata); 
            

         if (parameters.navSys == 'Robubox') {
            console.log (">>>>>>>>>>>>>> Send Drive To Robubox");
            // var url = 'http://localhost:50000/api/drive';
            //var url = "http://127.0.0.1:8080/127.0.0.1:50000/api/drive" ; // CORS-ANYWHERE
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
            console.log (">>>>>>>>>>>>>> Send Drive To KomNav");

            var values = [];
            values[1] = aSpeed;
            values[0] = lSpeed;

            var rpcMethod = 'com.thaby.drive'    
            
            SESSION.call(rpcMethod, values);

        }
        
    }
    
      
}
/**/


// Envoi d'une commande de type "Step" au robot avec une "promize"
exports.sendStep = function (typeMove,dist, MaxSpeed){
        
        
    var isRobubox = settings.isRobubox();
    console.log ("robubox.sendStep("+isRobubox+")");
    
    
    if (isRobubox == true) {


       

        // console.log ("robubox.sendStep()");

        // le type --> relative ou translate
        // var url = 'http://localhost:50000/lokarria/step';
        
        //var url = "http://127.0.0.1:8080/127.0.0.1:50000/lokarria/step/" ; // Tests CORS-ANYWHERE
        var url = "https://127.0.0.1:443/http://127.0.0.1:50000/lokarria/step/" ; // Tests CORS-ANYWHERE
            url = url + typeMove ;
            console.log(url) ;
                   
        var xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.send(JSON.stringify({
                "Distance": dist,
                "MaxSpeed": MaxSpeed                
            }));
        xhr.closed;
            

    }
    /**/

}


// Fonction qui permet de recupérer le niveau de la  la batterie et de l'afficher dans le progress bar
// elle interroge chaque 1000ms le robot via url et retourne le niveau de la batterie en pourcentage
exports.getBattery = function (){
        
        
    var isRobubox = settings.isRobubox();
    //var isRobubox = false;
    // console.log ("robubox.getBattery("+isRobubox+")");
    
    
    if (isRobubox == true) {

        
    	//if (parameters.navSys == 'Robubox') {

	         var delay = 1000; // l'interval de temps au bout du quel on envoi une autre requete pour rafraichir les information
             var dataJson, remaining, percentage, dataString, thenum, progressBar;

             if (fakeRobubox == true) {
                batteryInfo = getFakeBattery();
                setInterval(function() {
                    thenum = batteryInfo.Remaining ;
                    percentage = (thenum <= 100) ? thenum : 100; // 6- 
                    // rafraichissement de la jauge sur l'IHM Robot
                    refreshJaugeBattery(percentage);
                    // envoi des valeurs au pilote via le serveur
                    commandes.sendToPilote("battery_level",percentage)
                 }, delay);
                

             } else {

                var url = "https://127.0.0.1:443/http://127.0.0.1:50000/lokarria/battery" ; // CORS-ANYWHERE
    	        //var delay = 1000; // l'interval de temps au bout du quel on envoi une autre requete pour rafraichir les information
    	        //var dataJson, remaining, percentage, dataString, thenum, progressBar;

    	       
    	        //    1- envoyer toutes les "delay"  ms  une requete get sur "url" 
    	        //    2- le resultat  data  est en application/XML 
    	        //    3- on serialise data en string 
    	        //    4- on recupère la balise remaining 
    	        //    5- on recupère le nombre qui est dans la balise remaining
    	        //    6- on la converti en %
    	        //    7- on recupère id du progressBar 
    	        //    8- on attribue la value du pourcentage à la propriété value du progress bar  , avec un arondi
    	         
    	                
    	        setInterval(function() {
    	            $.get(url, function(data) { // 1 -  et 2- 
    	               batteryInfo = JSON.parse(data);
    	                thenum = batteryInfo.Remaining ;
    	                // console.log('thenum -->', thenum);
    	                percentage = (thenum <= 100) ? thenum : 100; // 6- 
    	            });
                    // rafraichissement de la jauge sur l'IHM Robot
                    refreshJaugeBattery(percentage);
                    // envoi des valeurs au pilote via le serveur
                    commandes.sendToPilote("battery_level",percentage)

    	        }, delay);

            } // end if (fakeRobubox == true) else
       	
        //} else if (parameters.navSys == 'KomNAV') {

       		// TODO

       	//}

    }
    /**/
        
                 
} // End getBattery



})(typeof exports === 'undefined'? this['robubox']={}: exports);