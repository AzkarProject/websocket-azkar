(function(exports){


// Envoi d'une commande de type "Drive" au robot
exports.sendDrive = function (enable, aSpeed,lSpeed){
        
        
    var isRobubox = settings.isRobubox();
    console.log ("robubox.sendDrive("+isRobubox+")");
    
    
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
        console.log(toto);
        console.log(tata); 
            


        // var url = 'http://localhost:50000/api/drive';
        var url = "http://127.0.0.1:8080/127.0.0.1:50000/api/drive" ; // CORS-ANYWHERE

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
    /**/
      
}

// Envoi d'une commande de type "Step" au robot avec une "promize"
exports.sendStep = function (typeMove,dist, MaxSpeed){
        
        
    var isRobubox = settings.isRobubox();
    console.log ("robubox.sendStep("+isRobubox+")");
    
    
    if (isRobubox == true) {


        // console.log ("robubox.sendStep()");

        // le type --> relative ou translate
        // var url = 'http://localhost:50000/lokarria/step';
        
        var url = "http://127.0.0.1:8080/127.0.0.1:50000/lokarria/step/" ; // Tests CORS-ANYWHERE
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
    console.log ("robubox.getBattery("+isRobubox+")");
    
    
    if (isRobubox == true) {

        //var url = "http://127.0.0.1:8080/?url=http://127.0.0.1:50000/robulab/battery/battery" ;
        var url = "http://127.0.0.1:8080/127.0.0.1:50000/lokarria/battery" ; // Tests CORS-ANYWHERE
        //var url = "http://127.0.0.1:8080/127.0.0.1:50000/robulab/battery/battery" ; // Tests CORS-ANYWHERE
        //var url = "http://127.0.0.1:50000/robulab/battery/battery"; // url est passé en paramètre , elle sera interpretée par le 
        var delay = 1000; // l'interval de temps au bout du quel on envoi une autre requete pour rafraichir les information
        var dataJson, remaining, percentage, dataString, thenum, progressBar;

       
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
              //  console.log('batteryInfo -->', batteryInfo);

               // dataString = new XMLSerializer().serializeToString(data.documentElement); // 3- 
                //remaining = dataString.substr(dataString.indexOf("<Remaining>"), dataString.indexOf("</Remaining>")); // 4 - 
                //thenum = remaining.match(/\d+/)[0] // 5-
                thenum = batteryInfo.Remaining ;
                // console.log('thenum -->', thenum);
                percentage = (thenum <= 100) ? thenum : 100; // 6- 
            });
            
            // envoi des valeurs au pilote via le serveur
             socket.emit("battery_level", {
                 command: 'battery_level',
                 percentage: percentage
            });
        }, delay);

    }
    /**/
        
                 
} // End getBattery



})(typeof exports === 'undefined'? this['robubox']={}: exports);