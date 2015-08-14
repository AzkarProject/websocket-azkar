(function(exports){

// Ajouts Michael
// XMLHttpRequest = require('xhr2'); // pour faire des requêtes XMLHttpRequest
// Q = require('q');



// Envoi d'une commande de type "Drive" au robot avec une "promize"
exports.sendDrive = function (enable, aSpeed,lSpeed){
    
    // var url = 'http://localhost:50000/api/drive';
    var url = "http://127.0.0.1:80/?url=http://localhost:50000/api/drive" ;

    // function sendDrive(url, enable, aSpeed,lSpeed) {
    var btnA = (enable == 'true' ? true : false); //  
    //return Q.Promise(function(resolve, reject, notify) {
    var data = JSON.stringify({
            "Enable": btnA,
            "TargetAngularSpeed": aSpeed,
            "TargetLinearSpeed": lSpeed
        });
        
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    //xhr.send(data);
    xhr.send(JSON.stringify({
            "Enable": btnA,
            "TargetAngularSpeed": aSpeed,
            "TargetLinearSpeed": lSpeed
        }));










        /*
        var xmlhttp = new XMLHttpRequest(); // new HttpRequest instance 

        xmlhttp.open("POST", url);
        xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

        xmlhttp.onload = onload;
        //xmlhttp.onerror = onerror;
        //xmlhttp.onprogress = onprogress;

        xmlhttp.send(JSON.stringify({
            "Enable": btnA,
            "TargetAngularSpeed": aSpeed,
            "TargetLinearSpeed": lSpeed
        }));

        function onload() {
            if (xmlhttp.status === 200) {
                resolve(xmlhttp.responseText);
            } else {
                reject(new Error("Status code was " + xmlhttp.status));
            }
        }

        /**/

        /*
        function onerror() {
            reject(new Error("Can't XHR " + JSON.stringify(url)));
        }
        /**/

        /*
        function onprogress(event) {
            notify(event.loaded / event.total);
        }
        /**/

    //})
    /**/
}



// Fonction qui permet de recupérer le niveau de la  la batterie et de l'afficher dans le progress bar
// elle interroge chaque 1000ms le robot via url et retourne le niveau de la batterie en pourcentage
exports.getBattery = function (){
        console.log ("robubox.getBattery()");

        var url = "http://127.0.0.1:80/?url=http://127.0.0.1:50000/robulab/battery/battery" ;
        //var url = "http://127.0.0.1:50000/robulab/battery/battery"; // url est passé en paramètre , elle sera interpretée par le 
        var delay = 1000; // l'interval de temps au bout du quel on envoi une autre requete pour rafraichir les information
        var dataJson, remaining, percentage, dataString, thenum, progressBar;

        /*
            1- envoyer toutes les "delay"  ms  une requete get sur "url" 
            2- le resultat  data  est en application/XML 
            3- on serialise data en string 
            4- on recupère la balise remaining 
            5- on recupère le nombre qui est dans la balise remaining
            6- on le convertie en %
            7- on recupère id du progressBar 
            8- on attribue la value du pourcentage à la propriété value du progress bar  , avec un arondi
         */
        
        
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
        /**/
  
}



})(typeof exports === 'undefined'? this['robubox']={}: exports);