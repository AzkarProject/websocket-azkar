 /**
     * function qui permet de recupérer le niveau de la  la battery et de l'afficher dans le progress bar
     * elle interroge chaque 1000ms le robot via url et retourne le niveau de la battery en pourcentage
     */

  //  $(document).ready(function() {

        //var url = "http://192.168.173.1:8080/?url=http://127.0.0.1:50000/robulab/battery/battery"; // url est passé en paramètre , elle sera interpretée par le proxy en premier


        var url = "http://127.0.0.1:50000/robulab/battery/battery"; // url est passé en paramètre , elle sera interpretée par le 
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
  //  });