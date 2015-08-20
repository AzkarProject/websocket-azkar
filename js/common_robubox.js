(function(exports){


// Envoi d'une commande de type "Drive" au robot
exports.sendDrive = function (enable, aSpeed,lSpeed){
        
        console.log ("robubox.sendDrive()");
        
        // Seulement Si on est sur un serveur relié a la Robubox, on fait:
        //if (hostName == "ubuntu64azkar" && hostName == "azkar-Latitude-E4200" && hostName == "thaby") {
        // var url = 'http://localhost:50000/api/drive';
            var url = "http://127.0.0.1:8080/127.0.0.1:50000/api/drive" ; // Tests CORS-ANYWHERE

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
        //}
}



// Fonction qui permet de recupérer le niveau de la  la batterie et de l'afficher dans le progress bar
// elle interroge chaque 1000ms le robot via url et retourne le niveau de la batterie en pourcentage
exports.getBattery = function (){
        
        // console.log ("robubox.getBattery()");

        //var url = "http://127.0.0.1:8080/?url=http://127.0.0.1:50000/robulab/battery/battery" ;
        var url = "http://127.0.0.1:8080/127.0.0.1:50000/robulab/battery/battery" ; // Tests CORS-ANYWHERE
        //var url = "http://127.0.0.1:50000/robulab/battery/battery"; // url est passé en paramètre , elle sera interpretée par le 
        var delay = 1000; // l'interval de temps au bout du quel on envoi une autre requete pour rafraichir les information
        var dataJson, remaining, percentage, dataString, thenum, progressBar;

        /*
            1- envoyer toutes les "delay"  ms  une requete get sur "url" 
            2- le resultat  data  est en application/XML 
            3- on serialise data en string 
            4- on recupère la balise remaining 
            5- on recupère le nombre qui est dans la balise remaining
            6- on la converti en %
            7- on recupère id du progressBar 
            8- on attribue la value du pourcentage à la propriété value du progress bar  , avec un arondi
         */
        
        // Si on est sur un serveur relié a la Robubox
        // TODO : Externaliser affichage batterie dans module.infos.js
        // Seulement Si on est sur un serveur relié a la Robubox, on fait:
        if (hostName == "ubuntu64azkar" && hostName == "azkar-Latitude-E4200" && hostName == "thaby") {
            setInterval(function() {
                $.get(url, function(data) { // 1 -  et 2- 
                    dataString = new XMLSerializer().serializeToString(data.documentElement); // 3- 
                    remaining = dataString.substr(dataString.indexOf("<Remaining>"), dataString.indexOf("</Remaining>")); // 4 - 
                    thenum = remaining.match(/\d+/)[0] // 5-
                    percentage = (thenum <= 100) ? thenum : 100; // 6- 
                });
                progressBar = document.getElementById('battery_level'); // 7- 
                progressBar.value = parseFloat(Math.round(percentage)); // 8- 
            }, delay);
        }
  
}



})(typeof exports === 'undefined'? this['robubox']={}: exports);