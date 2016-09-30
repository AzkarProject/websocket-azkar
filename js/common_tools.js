/*
*
* CopyLeft LGPL © Thierry Bergeron - 2013
* Ensemble de fonctions utiles et génériques
*
*/

(function(exports){

  
// Contrôle de fonction commune client/serveur
exports.test = function(){
    return 'tools.js'
};


// ---------------------------------
// Fonctions utiles (génériques)
// ---------------------------------

  // Création d'un UUID
  // Source : http://www.ietf.org/rfc/rfc4122.txt
  exports.createUUID = function () {
      var s = [];
      var hexDigits = "0123456789abcdef";
      for (var i = 0; i < 36; i++) {
          s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
      }
      s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
      s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
      s[8] = s[13] = s[18] = s[23] = "-";
      var uuid = s.join("");
      return uuid;
  }
  
  
     
  // Fonctions temporelles
  // ---------------------------
  
  // Retourne un timestamp formaté [E-123456789123]
  // Paramètre: flag pour la première lettre...
  exports.dateER = function (flag){
    return '['+flag+'-'+ Date.now() +']';
    
    }

  // Retourne une date préformatée [E-12:30:00:00:00]
  // Paramètre: flag pour la première lettre...
  exports.humanDateER = function (flag){
    var theDate = new Date();
    var h = theDate.getHours();
    var m = theDate.getMinutes();
    var s = theDate.getSeconds();
    var ms = theDate.getMilliseconds();
    return '('+h+":"+m+":"+s+":"+ms+')';
    }   


  // Retourne une date préformatée [E-12:30:00:00:00]
  // Paramètre: flag pour la première lettre...
  exports.getHumanDate = function (timeStamp){
    var theDate = new Date(timeStamp);
    var h = theDate.getHours();
    var m = theDate.getMinutes();
    var s = theDate.getSeconds();
    //var ms = theDate.getMilliseconds();
    return h+":"+m+":"+s;
  }  







  // Retourne un crhono brut
  exports.doChrono = function (startTime){
      var time=new Date(); 
      var temps_ecoule = time.getTime()-startTime;          
      return temps_ecoule; 
  }
  
  // Conversion des millisecondes en hr, mn et secondes
  // Adaptation de https://coderwall.com/p/wkdefg
  exports.msToTime = function(duration) {
      var milliseconds = parseInt((duration%1000)/100)
          , seconds = parseInt((duration/1000)%60)
          , minutes = parseInt((duration/(1000*60))%60)
          , hours = parseInt((duration/(1000*60*60))%24);
           
      var affichage = "";
      if (hours > 0.0 ) affichage += hours + " h ";
      if (minutes > 0.0 ) affichage += minutes + " min ";
      affichage += seconds + " sec ";
      affichage += milliseconds+"/100";
      return affichage;
  }
  

  // Fourni un Objet timeStamp converti en date, heure, minute, seconde...
  exports.actualDateToString = function () {
    var theDate = new Date();
    return theDate.toLocaleString();
  }

  // Fournit l'heure en cours + milisecondes
  exports.dateNowInMs = function () {
    var theDate = new Date();
    var h = theDate.getHours();
    var m = theDate.getMinutes();
    var s = theDate.getSeconds();
    var ms = theDate.getMilliseconds();
    return h+":"+m+":"+s+":"+ms;
  }


  //Convert milliseconds to object with days, hours, minutes, and seconds
  // source : https://gist.github.com/remino/1563878
   exports.convertMS = function (ms) {
    var d, h, m, s;
    s = Math.floor(ms / 1000);
    m = Math.floor(s / 60);
    s = s % 60;
    h = Math.floor(m / 60);
    m = m % 60;
    d = Math.floor(h / 24);
    h = h % 24;
    return { d: d, h: h, m: m, s: s };
  }


  



  // Gestion de tableaux
  // ---------------------------

  // Trier un tableau d'objets 
  // Source : // http://www.atinux.fr/2011/11/19/trier-un-tableau-d-objets-javascript/
  // sortHashTable prend en paramètres :
  // - le tableau d’objets
  // - la clé par laquelle on va trier le tableau
  // - [OPTIONNEL] Un booléen égal à true si on veut supprimer ou non la clé qui nous permet de trier.
  // - Exemple sortHashTable(listeJoueurs, number, false);
  //function sortHashTable(hashTable, key, removeKey) {
  exports.sortHashTable = function  (hashTable, key, removeKey) {
      hashTable = (hashTable instanceof Array ? hashTable : []);
      var newHashTable = hashTable.sort(function (a, b) {
          return (typeof(a[key]) === 'number' ?  a[key] - b[key] : a[key] > b[key]);
      });
      if (removeKey) {
          for (i in newHashTable) {
              delete newHashTable[i][key];
          }
      }
      return newHashTable;
  }

  // Récupérer la clef la plus haute d'un tableau
  // Source: ???
  // - le tableau d’objets
  // - la clé numérique max que l'on veut récupérer
  // - Exemple  getMaxKey(listeJoueurs, number) ;
  exports.getMaxKey = function  (hashTable, key) {
       var keyReturn = 0;
       for (i in hashTable) {
              if ( hashTable[i][key] > keyReturn ) keyReturn = hashTable[i][key];
          }
       return keyReturn;
  }


  // Fonction générique de recherche dans un tableau d'objet
  // Source: Thierry Bergeron
  // - hasTable > Nom du tableau d'objet
  // - key > Propriété à tester
  // - value > Valeur à rechercher
  /*// - typeReturn > boolean ou count
  exports.searchInObjects = function (hashTable,key,value,typeReturn){
    console.log("@ searchInObjects");
    var returnValue = false;
    var nbr = 0;
    //console.log(">>>>>>>>>> " + hashTable +" / " + key + " / " + value + " / " + typeReturn );
    for (i in hashTable) {
        // console.log(">>>>>>>>>> " + i );
        // console.log(">>>>>>>>>> " + hashTable[i][key]);        
        if (hashTable[i][key] == value) {
            returnValue = true;
            if (typeReturn == "boolean" ) {
              break;
            } else if(typeReturn == "count" ) {
              nbr +=1;
              returnValue = nbr;
            }
        }
   }
   return returnValue;
 }
 /**/
 

  // Fonction générique de recherche dans un tableau d'objet
  // Source: Thierry Bergeron
  // - hasTable > Nom du tableau d'objet
  // - key > Propriété à tester
  // - value > Valeur à rechercher
  // - typeReturn > boolean ou count ou object
  exports.searchInObjects = function (hashTable,key,value,typeReturn){
    // console.log("@ searchInObjects > "+ typeReturn);
    var returnValue = false;
    var nbr = 0;
    //console.log(">>>>>>>>>> " + hashTable +" / " + key + " / " + value + " / " + typeReturn );
    for (i in hashTable) {
        //console.log(">>>>>>>>>> " + typeReturn );
        //console.log(">>>>>>>>>> " + i );
        //console.log(hashTable[i]); 
        //console.log(hashTable[i][key]);        
        if (hashTable[i][key] == value) {
            returnValue = true;
      
            if (typeReturn == "boolean" ) {
              break;
            
            } else if(typeReturn === 'count' ) {
              nbr +=1;
              returnValue = nbr;
            
            } else if(typeReturn == "object" ) {
              returnValue = hashTable[i]
            }
        }
   }
   // console.log(">>>> returnValue:"+returnValue)
   return returnValue;
 }













// convertit un tableau en objet
// source: http://stackoverflow.com/questions/20807804/convert-array-to-object-javascript
exports.convertToArrayOfObjects = function  (data) {
    var keys = data.shift(),
        i = 0, k = 0,
        obj = null,
        output = [];

    for (i = 0; i < data.length; i++) {
        obj = {};

        for (k = 0; k < keys.length; k++) {
            obj[keys[k]] = data[i][k];
        }

        output.push(obj);
    }

    return output;
}

// convertit un array en objet V2
exports.toObject = function  (arr) {
  var rv = {};
  for (var i = 0; i < arr.length; ++i)
  rv[i] = arr[i];
  return rv;
}

// ----------------- Objets

// convertit un objet en array
exports.toArray = function  (obj) {
    var array =[];
    for( var i in obj ) {
        if (obj.hasOwnProperty(i)){
           array.push(obj[i]);
        }
    }
    return array;
}


 
 // Fonctions de débuggage
 // ---------------------------

 // Equivalent du Var_Dump
 // Source : http://trioniclabs.com/2012/09/javascript-var_dump-equivalent/  
 // function AlertObjectDump(obj, name) {
 exports.AlertObjectDump = function  (obj, name) {
    
    this.result = "[ " + name + " ]\n";
    this.indent = 0;
   
    this.dumpLayer = function(obj) {
      this.indent += 2;
   
      for (var i in obj) {
        if(typeof(obj[i]) == "object") {
          // alert ('typeof(obj[i]) == "object"'));
          this.result += "\n" +
            "              ".substring(0,this.indent) + i +
            ": " + "\n";
          this.dumpLayer(obj[i]);
        
        } else {
          this.result +=
            "              ".substring(0,this.indent) + i +
            ": " + obj[i] + "\n";
        }
      }
   
      this.indent -= 2;
    }
   
    this.showResult = function() {
      alert(this.result);
    }
   
    this.dumpLayer(obj);
    this.showResult();
}


// variante AlertObjectDump mais en console.log avec un timestamp 
exports.traceObjectDump = function  (obj, name) {
  this.result = "[ " + name + " ]\n";
  this.indent = 0;
  this.dumpLayer = function(obj) {
    this.indent += 2;
    for (var i in obj) {
      if(typeof(obj[i]) == "object") {
        // alert ('typeof(obj[i]) == "object"'));
        this.result += "\n" +
          "              ".substring(0,this.indent) + i +
          ": " + "\n";
        this.dumpLayer(obj[i]);
      
      } else {
        this.result +=
          "              ".substring(0,this.indent) + i +
          ": " + obj[i] + "\n";
      }
    }
    this.indent -= 2;
  }
  this.dumpLayer(obj);
  console.log((performance.now() / 1000).toFixed(3) + ": " + this.result);
  // this.showResult();
  // return this.result;
}

// 2eme variante AlertObjectDump mais retourne un string
exports.stringObjectDump = function  (obj, name) {
  this.result = "[ " + name + " ]\n";
  this.indent = 0;
  
  this.dumpLayer = function(obj) {
    this.indent += 2;
    
    for (var i in obj) {
      if(typeof(obj[i]) == "object") {
        // alert ('typeof(obj[i]) == "object"'));
        this.result += "\n" +
          "              ".substring(0,this.indent) + i +
          ": " + "\n";
        this.dumpLayer(obj[i]);
      
      } else {
        this.result +=
          "              ".substring(0,this.indent) + i +
          ": " + obj[i] + "\n";
      }
    }
    this.indent -= 2;
  }
  
  this.dumpLayer(obj);
  return this.result;

}


// Affiche les objets sous format json
exports.testObject = function (obj){
  // var toto = JSON.stringify(obj, null, 4);
  var toto = JSON.stringify(obj);
  console.log(toto);
  return toto;
}

   
// retourne le nombre de propriétés d'un objet
exports.lenghtObject = function (obj){
      var j = 0;
      for (var i in obj) {
          j += 1;
        }
      return j;
}

// Vérivie qu'un String est un JSON 
exports.isJson = function (str) {
  try {
      JSON.parse(str);
  } catch (e) {
      return false;
  }
  return true;
}

// Vérifie qu'un objet est vide
exports.isEmpty = function (obj) {
  for(var prop in obj) {
      if(obj.hasOwnProperty(prop))
          return false;
  }
  return true;
}

// clonage d'objet 
// Source: http://www.finalclap.com/faq/371-javascript-clone-dupliquer-objet
exports.cloneObject = function (obj){
  try{
      var copy = JSON.parse(JSON.stringify(obj));
  } catch(ex){
      alert("Vous utilisez un vieux navigateur bien pourri, qui n'est pas pris en charge par ce site");
  }
  return copy;
}

/*
Dynamically loading external JavaScript and CSS files
Source: http://www.javascriptkit.com/javatutors/loadjavascriptcss.shtml
loadjscssfile("myscript.js", "js") //dynamically load and add this .js file
loadjscssfile("javascript.php", "js") //dynamically load "javascript.php" as a JavaScript file
loadjscssfile("mystyle.css", "css") ////dynamically load and add this .css file
*/
exports.loadjscssfile = function (filename, filetype){
    if (filetype=="js"){ //if filename is a external JavaScript file
        var fileref=document.createElement('script')
        fileref.setAttribute("type","text/javascript")
        fileref.setAttribute("src", filename)
    }
    else if (filetype=="css"){ //if filename is an external CSS file
        var fileref=document.createElement("link")
        fileref.setAttribute("rel", "stylesheet")
        fileref.setAttribute("type", "text/css")
        fileref.setAttribute("href", filename)
    }
    if (typeof fileref!="undefined")
        document.getElementsByTagName("head")[0].appendChild(fileref)
}




})(typeof exports === 'undefined'? this['tools']={}: exports);