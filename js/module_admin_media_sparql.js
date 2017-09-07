    socket = io.connect(); 

    //declaration des variables globale

    var printTableHead=0;
    var collectionMedia=[];
    var collectionMediaName=[];
    //var indiceMediaName=0;
    var coll=[];
    var choixFiltre=null;
    var indiceDecollectionMedia=0;
    var mediaName=null;
    var mediaType=null;
    var mediaURI=null;
    var collectionForUpdate=[];
    var scName;
    var requestName;
    var listOfScenes=[];
    var listOfMaps=[];
    var Scenes=[];
    var showUndefinedMedia=false;

    var urlCorese = "http://134.59.130.147"

    // fonction de recupération de toutes les MAPs
    function getAllMaps(){
      var url=urlCorese+"/tutorial/azkar?query=select ?x where { ?x  a <http://azkar.musee_Ontology.fr/amo%23MuseumMap> }";
      
      var data = {
           url: url,
           typeRequest: "getAllMaps"
       }  

      socket.emit('executeSPARQL',data);
    }
    //fonction de recupération de toutes les scènes
    function getAllScenes(){  
      
      var urlScenes=urlCorese+"/tutorial/azkar?query=select ?x where { ?x  a <http://azkar.musee_Ontology.fr/amo%23MuseumScene> }";
      
      var data = {
           url: urlScenes,
           typeRequest: "getAllScenes"
       }  

      socket.emit('executeSPARQL',data);

    }

    // fonction de recupération des ressources externes non liée à des scènes
    function getUndefinedRessources(){
      $('#myTable').empty();
        collectionMedia=[];
        collectionMediaName=[];
        coll=[];
        //indiceMediaName=0;
        printTableHead=0;
        indiceDecollectionMedia=0;
        collectionForUpdate=[];
        try{
        var selectElmt = document.getElementById("choixScene");
        requestName = selectElmt.options[selectElmt.selectedIndex].value;
        choixFiltre=document.getElementById("choixFiltre").options[document.getElementById("choixFiltre").selectedIndex].value;
        PTH();    
        
        var url = urlCorese+"/tutorial/azkar?query=select * where {?x a <http://azkar.musee_Ontology.fr/amo%23MuseumExternalRessource> . ?x <http://azkar.musee_Ontology.fr/amo%23linkedToScene> 'undefined' }"

        //Envoi de la requete a corese server
        var data = {
           url: url,
           typeRequest: "getUndefinedRessources"
       }  
       showUndefinedMedia=true;
      socket.emit('executeSPARQL',data);
    }catch(err){
      alert("Veuillez choisir une MAP SVP !!!")
    }
        

    }

    // Le traitement de retours des résultats SPARQL envoyé par le serveur nodeJS à travers websocket
    socket.on('resultSPARQL', function(data) {
        
        console.log("socket.on('resultSPARQL',"+data.typeRequest+")")
         parser = new DOMParser();
        var xmlDoc = parser.parseFromString(data.result, "text/xml");
            
        // Convert XML to JSON
        var x2js = new X2JS();
        var jsonObj = x2js.xml2json(xmlDoc);

        if (data.typeRequest == 'getMapScenes') {
             


             $('#choixScene').empty();
             listOfScenes=jsonObj.sparql.results.result;
             if(listOfScenes != undefined){
              if (listOfScenes.length === undefined ){
              $('#choixScene').append("<option value='"+listOfScenes.binding.literal.__text+"'>"+listOfScenes.binding.literal.__text+"</option>");
            }
            
            else {
               
               for(sc in listOfScenes){
              
                 $('#choixScene').append("<option value='"+listOfScenes[sc].binding.literal.__text+"'>"+listOfScenes[sc].binding.literal.__text+"</option>");
                  
              }
            }     
             }
            else
              alert("Aucune scène n'est associée à cette MAP ")

        }else if (data.typeRequest == 'getAllMaps') {
             
            listOfMaps=jsonObj.sparql.results.result;


              for(sc in listOfMaps){
                  listOfMaps[sc].binding.uri=listOfMaps[sc].binding.uri.substring(listOfMaps[sc].binding.uri.lastIndexOf("#")+1);
                  $('#choixMap').append("<option value='"+listOfMaps[sc].binding.uri+"'>"+listOfMaps[sc].binding.uri+"</option>");
              }

        }else if(data.typeRequest == 'getAllScenes'){
            

            Scenes=jsonObj.sparql.results.result;
            for(sc in Scenes){
              Scenes[sc].binding.uri=Scenes[sc].binding.uri.substring(Scenes[sc].binding.uri.lastIndexOf("#")+1);
            }
        }else if(data.typeRequest == 'getSceneValues'){
           coll=jsonObj.sparql.results.result;

           console.log(">>Socket.on(getSceneValues)")

           for(i in coll){
                  
                  var displayUri = coll[i].binding[1].uri;
                  displayUri=displayUri.substring(displayUri.lastIndexOf("#")+1)
              
                  if(displayUri==="linkedToExternalRessource"){
                    var uriMedia=coll[i].binding[0].literal.__text; 
                    uriMedia=uriMedia.substring(uriMedia.lastIndexOf("#")+1) 
                   
                    collectionMediaName.push(uriMedia)
                    
                  }
              } 
              getMediaDescription(); 
        }else if (data.typeRequest == "getMediaDescription" || data.typeRequest == "getUndefinedRessourceDescription"){
           coll=jsonObj.sparql.results.result;
         
           console.log(coll)


            for(i in coll){
                      var displayUri = coll[i].binding[0].uri;
                      displayUri=displayUri.substring(displayUri.lastIndexOf("#")+1);

                        switch(displayUri){

                              case "label" :
                              mediaURI=coll[i].binding[1].literal.__text;
                            
                             addcollectionMedia(indiceDecollectionMedia,displayUri,mediaURI);

                              break;
                              case "hasMediaType":
                              mediaType=coll[i].binding[1].literal.__text;
                             
                              addcollectionMedia(indiceDecollectionMedia,displayUri,mediaType);

                              break;
                              case "hasName":
                              mediaName=coll[i].binding[1].literal.__text;
                              addcollectionMedia(indiceDecollectionMedia,displayUri,mediaName);

                              break;

                              default :
                                
                                  if(displayUri != "type")
                                addcollectionMedia(indiceDecollectionMedia,displayUri,coll[i].binding[1].literal.__text);
                              break;
                        } 
                        
                        if(mediaType!=null && mediaName!=null && mediaURI!=null){

                          var btnModifier="<button type='button' class='btn btn-success active' data-toggle='modal' data-target='#myModal' onclick='modifierMedia("+indiceDecollectionMedia+");'><span class='glyphicon glyphicon-pencil'></span> Modifier</button>";
                          var btnInfoMedia="<button type='button' class='btn btn-info active' data-toggle='modal' data-target='#myModal' onclick='afficheDetailMedia("+indiceDecollectionMedia+");'><span class='glyphicon glyphicon-info-sign'></span> Détail</button>";
                          var btnSupprimer="<button type='button' class='btn btn-danger active' data-toggle='modal' data-target='#myModal' onclick='supprimerMedia("+indiceDecollectionMedia+");'><span class='glyphicon glyphicon-remove'></span> Supprimer</button>";
                          if(choixFiltre=="all" || mediaType==choixFiltre)
                            if(showUndefinedMedia==false)
                            $('#myTable').append('<tr><td><a href="'+mediaURI+'"" target="_blank">'+mediaName+'</a></td><td><center><b>'+mediaType+'</b></center></td><td><center>'+btnInfoMedia+' '+btnModifier+' '+btnSupprimer+'</center></td><td><b><center>'+requestName+'</center></b></td></tr>');
                            else
                            $('#myTable').append('<tr><td><a href="'+mediaURI+'"" target="_blank">'+mediaName+'</a></td><td><center><b>'+mediaType+'</b></center></td><td><center>'+btnInfoMedia+' '+btnModifier+' '+btnSupprimer+'</center></td><td><b><center>Undefined</center></b></td></tr>');
                          indiceDecollectionMedia=indiceDecollectionMedia+1;
                          mediaType=null;
                          mediaName=null;
                          mediaURI=null;
                          
                        } 
                    }
                    getAllScenes();
        }else if (data.typeRequest == "ASKCorese"){
          if(jsonObj.sparql.boolean==="false"){
            ASKCorese2(data.indice);
          }else  
            alert("L'URI de cette ressource existe déjà !!!");
        }
        else if (data.typeRequest == "ASKCorese2"){
          //coll=jsonObj;
          console.log("Corese dit : " +jsonObj.sparql.boolean)
          if(jsonObj.sparql.boolean==="true"){
            //alert("URI saisie existe déjà dans cette scène !!!")
            data.mediaExistInScene="true";
          }
          enregistrementDesModfications(data)
        }else if (data.typeRequest == "getUndefinedRessources"){
          coll=jsonObj.sparql.results.result;
          //console.log(jsonObj.sparql.results.result[0].binding.uri)
          if(coll != undefined){
            if (coll.length === undefined ){
            console.log(coll)
            collectionMediaName[0]=coll.binding.uri.substring(coll.binding.uri.lastIndexOf("#")+1);
              //$('#choixScene').append("<option value='"+listOfScenes.binding.literal.__text+"'>"+listOfScenes.binding.literal.__text+"</option>");
            }
            else{
              for (r in coll){
            collectionMediaName[r]=coll[r].binding.uri.substring(coll[r].binding.uri.lastIndexOf("#")+1)
            console.log(collectionMediaName[r])
          }
            }
          
          getUndefinedRessourceDescription();
          }else{
            alert("Pas de undefined ressources pour le moment !!!");
          }
          
        }else if (data.typeRequest == "ASKIFRessourceExist"){
          if(jsonObj.sparql.boolean==="false"){
            ASKIFURIExistInRessources();  
          }else{
            alert("Le nom du media "+data.ressourceName+" existe déjà , veuillez le changer !!!");
          }
        }else if (data.typeRequest == "ASKIFURIExistInRessources"){
          if(jsonObj.sparql.boolean==="false"){
            ASKIFURIExistInScene();  
          }else{
            alert("La ressource "+data.ressourceURI+" existe déjà , veuillez saisir une autre !!!");
          }
        }else if (data.typeRequest == "ASKIFURIExistInScene"){
          if(jsonObj.sparql.boolean==="false"){
            enregistrementNouveauMedia();  
          }else{
            alert("La ressource "+data.ressourceURI+" existe déjà dans la scène "+data.sceneName+" !!!");
          }
        }
        
    });

    // fonction d'extraction des scènes liées à une MAP
    function getMapScenes(){
        

        $('#myTable').empty();

        var selectElmt = document.getElementById("choixMap");

        requestName = selectElmt.options[selectElmt.selectedIndex].value;
        
        PTH();    
        
        var url = urlCorese+"/tutorial/azkar?query=select ?z where { <http://azkar.musee_Ontology.fr/schema%23"+requestName+"> <http://azkar.musee_Ontology.fr/amo%23linkedToScene> ?z}"
     
        //Envoi de la requete a corese server
        var data = {
           url: url,
           typeRequest: "getMapScenes"
       }  

      socket.emit('executeSPARQL',data);
        
    }


    function searchScenes(){
         showUndefinedMedia=false;
         getSceneValues();
    }

    // fonction d'extration des données des scènes
    function getSceneValues(){
      if(showUndefinedMedia===true)
        getUndefinedRessources();
      else{
        $('#myTable').empty();
        collectionMedia=[];
        collectionMediaName=[];
        coll=[];
        //indiceMediaName=0;
        printTableHead=0;
        indiceDecollectionMedia=0;
        collectionForUpdate=[];
        
      try {
       //Pour filtrer les medias par leurs types
        var selectElmt = document.getElementById("choixScene");
        requestName = selectElmt.options[selectElmt.selectedIndex].value;
        choixFiltre=document.getElementById("choixFiltre").options[document.getElementById("choixFiltre").selectedIndex].value;
        PTH();    
        
        var url = urlCorese+"/tutorial/azkar?query=select * where {<http://azkar.musee_Ontology.fr/schema%23"+requestName+"> ?b ?c}"

        //Envoi de la requete a corese server
        var data = {
           url: url,
           typeRequest: "getSceneValues"
       }  

      socket.emit('executeSPARQL',data);
    }
    catch(err) {
       alert("Veuillez choisir une MAP SVP !!!")
    }
      } 
    }

    // fonction d'extration des données des ressources non liées à des scènes
    function getUndefinedRessourceDescription(){
        
        for(m in collectionMediaName){

            var url = urlCorese+"/tutorial/azkar?query=select ?y ?z where { <http://azkar.musee_Ontology.fr/schema%23"+collectionMediaName[m]+"> ?y ?z}"
           
            var data = {
               url: url,
               typeRequest: "getUndefinedRessourceDescription"
            }  
            socket.emit('executeSPARQL',data);
        } 
    } 

    // fonction d'extration des données relatives aux ressources externes
    function getMediaDescription(){

        for(m in collectionMediaName){

            var url = urlCorese+"/tutorial/azkar?query=select ?y ?z where {?x rdfs:label '"+collectionMediaName[m]+"'.?x <http://azkar.musee_Ontology.fr/amo%23linkedToScene> '"+requestName+"' .?x ?y ?z}"
           //console.log(url);
            var data = {
               url: url,
               typeRequest: "getMediaDescription"
            }  
            showUndefinedMedia=false;
            socket.emit('executeSPARQL',data);
        } 
    } 

    // fonction d'insertion des valeurs des ressources dans une collection 
    function addcollectionMedia(indice,propriete,valeur){

      
      if(collectionMedia[indice]==null)
        collectionMedia[indice]=propriete+" : "+valeur+"|"; 
      else
        collectionMedia[indice]+=propriete+" : "+valeur+"|";
    }

    // pop-up de suppression d'une ressource
    function supprimerMedia(indice){
      
      $('#modalTitle').empty();
      $('#modalTitle').append('<h4><b>Suppression d\'une ressource externe </b></h4>');
      $('#modalBody').empty();
      $('#modalBody').append('<h4>Êtes vous sûr de vouloir supprimer cette ressource ?</h4>')
      $('#modalFooter').empty();
      $('#modalFooter').append("<button type='button' class='btn btn-danger active' data-dismiss='modal' onclick='confirmationSuppressionMedia("+indice+")'><span class='glyphicon glyphicon-remove'></span> Supprimer</button>");
      $('#modalFooter').append("<button type='button' class='btn btn-default active' data-dismiss='modal'>Annuler</button>");
    }


    // fonction de suppression définitive d'une ressource
    function confirmationSuppressionMedia(indice){
     
        var SceneName = getRessourceScene(indice);
        var ressourceName = getRessourceName(indice);

        
        if(SceneName!="undefined"){
          var ressourceURI = getRessourceURI(indice);
          var urlMajscene= urlCorese+"/tutorial/azkar?query=DELETE DATA{ <http://azkar.musee_Ontology.fr/schema%23"+SceneName+"> <http://azkar.musee_Ontology.fr/amo%23linkedToExternalRessource> '"+ressourceURI+"'}";
          var data = {
                url: urlMajscene,
                typeRequest: "confirmationSuppressionMedia"
              }
              socket.emit('executeSPARQL',data);
        }

        //var urlDelete="https://corese.inria.fr/tutorial/azkar?query=DELETE { <http://azkar.musee_Ontology.fr/schema%23"+mediaExtName+">  ?y ?z } where { ?x ?y ?z }"
        var urlDelete= urlCorese+"/tutorial/azkar?query=DELETE { <http://azkar.musee_Ontology.fr/schema%23"+ressourceName+">  ?y ?z } where { ?x ?y ?z }"
        var data = {
                url: urlDelete,
                typeRequest: "confirmationSuppressionMedia"
              }
              socket.emit('executeSPARQL',data);
        
       
        //window.location.reload();
    }

    // fonction qui retourne le nom d'une ressource
    function getRessourceName(indice){
      var arr=collectionMedia[indice];
      var arr2=arr.split("|");
      for(i in arr2){
        var moresplit=arr2[i].split(" : ")
        if(moresplit[0]=="hasName"){
          return moresplit[1];
        }
      }
    }

    // fonction qui retourne l'URI (label) d'une ressource
    function getRessourceURI(indice){
      var arr=collectionMedia[indice];
      var arr2=arr.split("|");
      for(i in arr2){
        var moresplit=arr2[i].split(" : ")
        if(moresplit[0]=="label"){
          return moresplit[1];
        }
      }
    }

    // fonction qui retourne la scène liée à une ressource
    function getRessourceScene(indice){
      var arr=collectionMedia[indice];
      var arr2=arr.split("|");
      for(i in arr2){
        var moresplit=arr2[i].split(" : ")
        if(moresplit[0]=="linkedToScene"){
          return moresplit[1];
        }
      }
    }

    // fonction qui vérifie qu'une ressource existe ou pas sur le sw-corese
    function ASKCorese(indice){

      //il faut vérifier que l'URI de la ressource n'a jamais été créer
      var label="";
      var ressourceURI=getRessourceURI(indice);
      ressourceURI=ressourceURI.replace(/(^\s*)|(\s*$)/g,"");
      for(c in collectionForUpdate) {
        if(collectionForUpdate[c].Propriete === "label"){
          label=document.getElementsByName(collectionForUpdate[c].AtributeName)[0].value;
        }
      }
      label=label.replace(/(^\s*)|(\s*$)/g,"");
      if(label != "" ){

      if(label != ressourceURI){
        var urlASK= urlCorese+"/tutorial/azkar?query=ASK WHERE { ?x a <http://azkar.musee_Ontology.fr/amo%23MuseumExternalRessource> . ?x rdfs:label '"+label+"'}";
                var data = {
                url: urlASK,
                typeRequest: "ASKCorese",
                indice : indice,
                ressourceURI:label
              }
              socket.emit('executeSPARQL',data);
            }else
            {
                ASKCorese2(indice);
            }
      }else
            {
               alert("Merci de renseigner le champs label de cette ressource !!!");
            }
      
              
    }

    // fonction qui vérifie qu'une ressource existe ou pas dans une scène
    function ASKCorese2(indice){
      var ressourceName=getRessourceName(indice);
        var ressourceURI=getRessourceURI(indice);
        var newSceneName="";
        var urilabel="";
        for(c in collectionForUpdate) { 
          var newValue=document.getElementsByName(collectionForUpdate[c].AtributeName)[0].value;
          if(collectionForUpdate[c].Propriete === "linkedToScene")
            newSceneName=newValue.replace(/(^\s*)|(\s*$)/g,"");
          else if(collectionForUpdate[c].Propriete === "label")
            urilabel=newValue.replace(/(^\s*)|(\s*$)/g,"");
          console.log(collectionForUpdate[c].AtributeName +"|" +collectionForUpdate[c].Propriete +"|"+collectionForUpdate[c].oldValue + "|"+ newValue.replace(/(^\s*)|(\s*$)/g,""))
        }
        
          if(newSceneName !="undefined"){
         var data = {
               url: urlCorese+"/tutorial/azkar?query=ASK where { <http://azkar.musee_Ontology.fr/schema%23"+newSceneName+"> <http://azkar.musee_Ontology.fr/amo%23linkedToExternalRessource> '"+urilabel+"' }",
               typeRequest: "ASKCorese2",
               indice : indice,
               mediaExistInScene : "false"
            }
            //console.log("requete ASK = "+data.url)
            socket.emit('executeSPARQL',data);
            
      }else{
        var data = {
               indice : indice,
               mediaExistInScene : "false"
            }
        enregistrementDesModfications(data);
      }

      
    }

    // fonction d'enregistrement des modifications d'une ressource externe
    function enregistrementDesModfications(data){

        var ressourceName=getRessourceName(data.indice);
        var ressourceURI=getRessourceURI(data.indice);
        ressourceURI=ressourceURI.replace(/(^\s*)|(\s*$)/g,"");
        var newRessourceURI="";
        var newSceneName="";
        var urilabel="";
        var isMediaExist=data.mediaExistInScene;
       
        for(c in collectionForUpdate) { 
          var newValue=document.getElementsByName(collectionForUpdate[c].AtributeName)[0].value;
          newValue=newValue.replace(/(^\s*)|(\s*$)/g,"");
          if(newValue === ""){
            newValue= "undefined";
          }
          newValue=newValue.replace(/(^\s*)|(\s*$)/g,"");
          //newValue=encodeURI(newValue);
          newValue=newValue.replace("é","e");
          newValue=newValue.replace("è","e");
          var proprieteToUpdate=collectionForUpdate[c].Propriete;
          var oldValue=collectionForUpdate[c].oldValue;
          oldValue=oldValue.replace(/(^\s*)|(\s*$)/g,"");
          //oldValue=encodeURI(oldValue);
          oldValue=oldValue.replace("é","e");
          oldValue=oldValue.replace("è","e");
          if(proprieteToUpdate != "linkedToScene" && proprieteToUpdate != "label" && proprieteToUpdate != "comment"){
              var urlToUpdate= urlCorese+"/tutorial/azkar?query=DELETE { <http://azkar.musee_Ontology.fr/schema%23"+ressourceName+"> <http://azkar.musee_Ontology.fr/amo%23"+proprieteToUpdate+"> '"+oldValue+"'} INSERT {<http://azkar.musee_Ontology.fr/schema%23"+ressourceName+"> <http://azkar.musee_Ontology.fr/amo%23"+proprieteToUpdate+"> '"+newValue+"'} WHERE {<http://azkar.musee_Ontology.fr/schema%23"+ressourceName+"> rdfs:label '"+ressourceURI+"'. <http://azkar.musee_Ontology.fr/schema%23"+ressourceName+"> <http://azkar.musee_Ontology.fr/amo%23hasName> '"+ressourceName+"'} ";
              var data = {
               url: urlToUpdate,
               typeRequest: "enregistrementDesModfications"
            }
            
            socket.emit('executeSPARQL',data);    
         }
         if(proprieteToUpdate === "label"){
            newRessourceURI = newValue;
         }
            
          }

          //une 2 ème boucle pour la màj des scènes s'il y a des màj à faire
          for(c in collectionForUpdate) { 
          var newValue=document.getElementsByName(collectionForUpdate[c].AtributeName)[0].value;
          newValue=newValue.replace(/(^\s*)|(\s*$)/g,"");
          if(newValue === ""){
            newValue= "undefined";
          }
          newValue=newValue.replace(/(^\s*)|(\s*$)/g,"");
          //newValue=encodeURI(newValue);
          newValue=newValue.replace("é","e");
          newValue=newValue.replace("è","e");
          var proprieteToUpdate=collectionForUpdate[c].Propriete;
          var oldValue=collectionForUpdate[c].oldValue;
          oldValue=oldValue.replace(/(^\s*)|(\s*$)/g,"");
          //oldValue=encodeURI(oldValue);
          oldValue=oldValue.replace("é","e");
          oldValue=oldValue.replace("è","e");
          if(oldValue!=newValue){
          if(proprieteToUpdate == "linkedToScene"){
            if(isMediaExist==="false"){
              
                if(newValue=="undefined" && oldValue!="undefined"){
                 
                var urlToUpdate= urlCorese+"/tutorial/azkar?query=DELETE DATA{ <http://azkar.musee_Ontology.fr/schema%23"+oldValue+"> <http://azkar.musee_Ontology.fr/amo%23linkedToExternalRessource>'"+ressourceURI+"'}"
                var data = {
                url: urlToUpdate,
                typeRequest: "enregistrementDesModfications"
              }
              
              socket.emit('executeSPARQL',data);  

              var urlToUpdate= urlCorese+"/tutorial/azkar?query=DELETE { <http://azkar.musee_Ontology.fr/schema%23"+ressourceName+"> <http://azkar.musee_Ontology.fr/amo%23linkedToScene> '"+oldValue+"'} INSERT {<http://azkar.musee_Ontology.fr/schema%23"+ressourceName+"> <http://azkar.musee_Ontology.fr/amo%23linkedToScene> '"+newValue+"'} WHERE {<http://azkar.musee_Ontology.fr/schema%23"+ressourceName+"> rdfs:label '"+ressourceURI+"'. <http://azkar.musee_Ontology.fr/schema%23"+ressourceName+"> <http://azkar.musee_Ontology.fr/amo%23hasName> '"+ressourceName+"'} ";
                var data = {
                url: urlToUpdate,
                typeRequest: "enregistrementDesModfications"
              }
              
              socket.emit('executeSPARQL',data);  
            }else if(oldValue=="undefined" && newValue!="undefined"){
               
                var urlToUpdate= urlCorese+"/tutorial/azkar?query=DELETE { <http://azkar.musee_Ontology.fr/schema%23"+ressourceName+"> <http://azkar.musee_Ontology.fr/amo%23"+proprieteToUpdate+"> '"+oldValue+"'} INSERT {<http://azkar.musee_Ontology.fr/schema%23"+ressourceName+"> <http://azkar.musee_Ontology.fr/amo%23"+proprieteToUpdate+"> '"+newValue+"'} WHERE {<http://azkar.musee_Ontology.fr/schema%23"+ressourceName+"> rdfs:label '"+ressourceURI+"'. <http://azkar.musee_Ontology.fr/schema%23"+ressourceName+"> <http://azkar.musee_Ontology.fr/amo%23hasName> '"+ressourceName+"'} ";
              var data = {
               url: urlToUpdate,
               typeRequest: "enregistrementDesModfications"
            }
            
            socket.emit('executeSPARQL',data); 
             
              var urlToUpdate= urlCorese+"/tutorial/azkar?query=INSERT DATA{ <http://azkar.musee_Ontology.fr/schema%23"+newValue+"> <http://azkar.musee_Ontology.fr/amo%23linkedToExternalRessource>'"+newRessourceURI+"'}"
                var data = {
                url: urlToUpdate,
                typeRequest: "enregistrementDesModfications"
              }
              
              socket.emit('executeSPARQL',data);

            }else if(oldValue!="undefined" && newValue!="undefined"){
                console.log("else if(oldValue!=undefined && newValue!=undefined)")
                console.log("oldValue=" + oldValue)
                console.log("newValue=" + newValue)

                var urlToUpdate= urlCorese+"/tutorial/azkar?query=DELETE DATA{ <http://azkar.musee_Ontology.fr/schema%23"+oldValue+"> <http://azkar.musee_Ontology.fr/amo%23linkedToExternalRessource>'"+ressourceURI+"'}"
                var data = {
                url: urlToUpdate,
                typeRequest: "enregistrementDesModfications"
              }
              
              socket.emit('executeSPARQL',data);  

              var urlToUpdate= urlCorese+"/tutorial/azkar?query=DELETE { <http://azkar.musee_Ontology.fr/schema%23"+ressourceName+"> <http://azkar.musee_Ontology.fr/amo%23linkedToScene> '"+oldValue+"'} INSERT {<http://azkar.musee_Ontology.fr/schema%23"+ressourceName+"> <http://azkar.musee_Ontology.fr/amo%23linkedToScene> '"+newValue+"'} WHERE {<http://azkar.musee_Ontology.fr/schema%23"+ressourceName+"> rdfs:label '"+ressourceURI+"'. <http://azkar.musee_Ontology.fr/schema%23"+ressourceName+"> <http://azkar.musee_Ontology.fr/amo%23hasName> '"+ressourceName+"'} ";
                var data = {
                url: urlToUpdate,
                typeRequest: "enregistrementDesModfications"
              }
              
              socket.emit('executeSPARQL',data); 

               var urlToUpdate= urlCorese+"/tutorial/azkar?query=INSERT DATA{ <http://azkar.musee_Ontology.fr/schema%23"+newValue+"> <http://azkar.musee_Ontology.fr/amo%23linkedToExternalRessource>'"+newRessourceURI+"'}"
                var data = {
                url: urlToUpdate,
                typeRequest: "enregistrementDesModfications"
              }
              
              socket.emit('executeSPARQL',data);  
               
          }
            //}//end if(oldValue!=newValue)
            }//end if(isMediaExist==="false")
            else{
             
               var urlToUpdate= urlCorese+"/tutorial/azkar?query=DELETE { <http://azkar.musee_Ontology.fr/schema%23"+ressourceName+"> <http://azkar.musee_Ontology.fr/amo%23"+proprieteToUpdate+"> '"+oldValue+"'} INSERT {<http://azkar.musee_Ontology.fr/schema%23"+ressourceName+"> <http://azkar.musee_Ontology.fr/amo%23"+proprieteToUpdate+"> '"+newValue+"'} WHERE {<http://azkar.musee_Ontology.fr/schema%23"+ressourceName+"> rdfs:label '"+ressourceURI+"'. <http://azkar.musee_Ontology.fr/schema%23"+ressourceName+"> <http://azkar.musee_Ontology.fr/amo%23hasName> '"+ressourceName+"'} ";
                var data = {
                url: urlToUpdate,
                typeRequest: "enregistrementDesModfications"
              }
             
              socket.emit('executeSPARQL',data);

              var urlToUpdate= urlCorese+"/tutorial/azkar?query=DELETE DATA{ <http://azkar.musee_Ontology.fr/schema%23"+oldValue+"> <http://azkar.musee_Ontology.fr/amo%23linkedToExternalRessource> '"+ressourceURI+"'}"
                var data = {
                url: urlToUpdate,
                typeRequest: "enregistrementDesModfications"
              }
              
              socket.emit('executeSPARQL',data); 

           
              var urlToUpdate= urlCorese+"/tutorial/azkar?query=INSERT DATA{ <http://azkar.musee_Ontology.fr/schema%23"+newValue+"> <http://azkar.musee_Ontology.fr/amo%23linkedToExternalRessource> '"+newRessourceURI+"'}"
                var data = {
                url: urlToUpdate,
                typeRequest: "enregistrementDesModfications"
              }
              
              socket.emit('executeSPARQL',data);  

                }
          }// end if(proprieteToUpdate == "linkedToScene")
         
          else if (proprieteToUpdate == "comment"){
             var urlToUpdate= urlCorese+"/tutorial/azkar?query=DELETE { <http://azkar.musee_Ontology.fr/schema%23"+ressourceName+"> rdfs:comment '"+oldValue+"'} INSERT {<http://azkar.musee_Ontology.fr/schema%23"+ressourceName+"> rdfs:comment '"+newValue+"'} WHERE {<http://azkar.musee_Ontology.fr/schema%23"+ressourceName+"> rdfs:label '"+ressourceURI+"'. <http://azkar.musee_Ontology.fr/schema%23"+ressourceName+"> <http://azkar.musee_Ontology.fr/amo%23hasName> '"+ressourceName+"'} ";
                var data = {
                url: urlToUpdate,
                typeRequest: "enregistrementDesModfications"
              }
             
              socket.emit('executeSPARQL',data);
          }
        }
        }// end for(c in collectionForUpdate) 
        if(ressourceURI!=newRessourceURI){
          var urlToUpdate= urlCorese+"/tutorial/azkar?query=DELETE { <http://azkar.musee_Ontology.fr/schema%23"+ressourceName+"> rdfs:label '"+ressourceURI+"'} INSERT {<http://azkar.musee_Ontology.fr/schema%23"+ressourceName+"> rdfs:label '"+newRessourceURI+"'} WHERE {<http://azkar.musee_Ontology.fr/schema%23"+ressourceName+"> rdfs:label '"+ressourceURI+"'. <http://azkar.musee_Ontology.fr/schema%23"+ressourceName+"> <http://azkar.musee_Ontology.fr/amo%23hasName> '"+ressourceName+"'} ";
                var data = {
                url: urlToUpdate,
                typeRequest: "enregistrementDesModfications"
              }
              socket.emit('executeSPARQL',data);
        }
            
      //window.location.reload();
    }// end function enregistrementDesModfications(data)

    // pop-up pour faire les m-à-j des ressources externes
    function modifierMedia(indice){

      $('#modalTitle').empty();

      $('#modalBody').empty();
      collectionForUpdate=[];
      var description=collectionMedia[indice];
      var moreDescription=true;
      var s="";
      var i=0;
      $('#modalBody').append("<table>");
      while(moreDescription){
        
        if(description.charAt(i)=='|'){

          var pos = s.lastIndexOf(" : ")+2;
          var value= s.substring(pos);

          var propriete=s.substring(0,pos-2);
          var prop=propriete+i;
          if(propriete != "hasName" && propriete != "linkedToScene" && propriete != "hasMediaType"){
            $('#modalBody').append("<tr><td><label><b>"+propriete+ " : </b></label></td><td><input type='text' value='"+value+"' name='"+prop+"' /></td></tr>");
            collectionForUpdate.push({Propriete:propriete,AtributeName:prop,oldValue:value.replace(/(^\s*)|(\s*$)/g,"")});     
          }
          if(propriete === "hasMediaType"){
            if(value.replace(/ /g,"")==="Picture" || value.replace(/ /g,"")==="picture")
              $('#modalBody').append("<tr><td><label><b>"+propriete+ " : </b></label></td><td><select name='hasMediaType'><option value='Picture' selected='selected'>Picture</option><option value='webPage'>webPage</option><option value='Video'>Video</option><option value='wikipedia'>wikipedia</option><option value='dbpedia'>Dbpedia</option></select></td></tr>");
            else if(value.replace(/ /g,"")==="Video" || value.replace(/ /g,"")==="video")
              $('#modalBody').append("<tr><td><label><b>"+propriete+ " : </b></label></td><td><select name='hasMediaType'><option value='Picture'>Picture</option><option value='webPage'>webPage</option><option value='Video' selected='selected'>Video</option><option value='wikipedia'>wikipedia</option><option value='dbpedia'>Dbpedia</option></select></td></tr>");
            else if(value.replace(/ /g,"")==="webPage" || value.replace(/ /g,"")==="webpage")
              $('#modalBody').append("<tr><td><label><b>"+propriete+ " : </b></label></td><td><select name='hasMediaType'><option value='Picture'>Picture</option><option value='webPage' selected='selected'>webPage</option><option value='Video'>Video</option><option value='wikipedia'>wikipedia</option><option value='dbpedia'>Dbpedia</option></select></td></tr>");
            else if(value.replace(/ /g,"")==="dbpedia" || value.replace(/ /g,"")==="Dbpedia")
              $('#modalBody').append("<tr><td><label><b>"+propriete+ " : </b></label></td><td><select name='hasMediaType'><option value='Picture'>Picture</option><option value='webPage'>webPage</option><option value='Video'>Video</option><option value='wikipedia'>wikipedia</option><option value='dbpedia' selected='selected'>Dbpedia</option></select></td></tr>");
            else
              $('#modalBody').append("<tr><td><label><b>"+propriete+ " : </b></label></td><td><select name='hasMediaType'><option value='Picture'>Picture</option><option value='webPage'>webPage</option><option value='Video'>Video</option><option value='wikipedia' selected='selected'>wikipedia</option><option value='dbpedia'>Dbpedia</option></select></td></tr>");
            collectionForUpdate.push({Propriete:propriete,AtributeName:"hasMediaType",oldValue:value.replace(/(^\s*)|(\s*$)/g,"")});
          }
          if(propriete === "linkedToScene"){
            var htmlToDisplay="";
            htmlToDisplay = "<tr><td><label><b>"+propriete+ " : </b></label></td><td><select name='linkedToScene'>";
            for(sc in Scenes){
              if(showUndefinedMedia===true){
                htmlToDisplay+= "<option value='"+Scenes[sc].binding.uri+"'>"+Scenes[sc].binding.uri+"</option>";
              }else{
                if(Scenes[sc].binding.uri===requestName)
              htmlToDisplay+= "<option value='"+Scenes[sc].binding.uri+"' selected='selected'>"+Scenes[sc].binding.uri+"</option>";
               else
              htmlToDisplay+= "<option value='"+Scenes[sc].binding.uri+"'>"+Scenes[sc].binding.uri+"</option>";
              }
            
            } 
            if(showUndefinedMedia===true)
               htmlToDisplay+= "<option value='undefined' selected='selected'>No Classified Media</option>";
            else
               htmlToDisplay+= "<option value='undefined'>No Classified Media</option>";
            htmlToDisplay+= "</select></td></tr>";
            $('#modalBody').append(htmlToDisplay);
            if(showUndefinedMedia===true)
              collectionForUpdate.push({Propriete:propriete,AtributeName:"linkedToScene",oldValue:"undefined"});
            else
            collectionForUpdate.push({Propriete:propriete,AtributeName:"linkedToScene",oldValue:requestName});
          }

          if (propriete ==="hasName")
            $('#modalTitle').append('Modification de la ressource : <b>'+value+'</b>');


          s="";
        }
        
        else{
          s+=description.charAt(i);
        }
        
        i++;
        if(i==description.length){
          moreDescription=false;
        }
        
      }
      $('#modalBody').append("</table>");
      $('#modalFooter').empty();
      $('#modalFooter').append("<button type='button' class='btn btn-success active' data-dismiss='modal' onclick='ASKCorese("+indice+")'><span class='glyphicon glyphicon-floppy-saved'></span> Enregister</button>");
      $('#modalFooter').append("<button type='button' class='btn btn-default active' data-dismiss='modal'><span class='glyphicon glyphicon-floppy-remove'></span> Annuler</button>");
    }

    // fonction d'affichage de détail des ressources
    function afficheDetailMedia(indice){
      $('#modalTitle').empty();

      $('#modalBody').empty();
      var description=collectionMedia[indice];
      //console.log(description)
      var moreDescription=true;
      var s="";
      var i=0;
      $('#modalBody').append("<table>")
      while(moreDescription){
          if(description.charAt(i)=='|'){
              var extMediaName=s.substring(0,s.lastIndexOf(" : "));
              if(extMediaName=="hasName"){
                  $('#modalTitle').append('Détail Media : <b>'+s.substring(s.lastIndexOf(" : ")+2)+'</b>');
              }    
              $('#modalBody').append("<tr><td><label>"+s.substring(0,s.lastIndexOf(" : "))+"</label></td><td><label>"+s.substring(s.lastIndexOf(" : "))+"</label></td></tr>");
              s="";
          } else{
            s+=description.charAt(i);
          }

          i++;
          
          if(i==description.length){
            moreDescription=false;
          }

      }
      $('#modalBody').append("</table>")
      $('#modalFooter').empty();
      $('#modalFooter').append("<button type='button' class='btn btn-primary active' data-dismiss='modal'>Fermer</button>");
    }

    // fonction qui vérifie l'existance ou pas d'une autre ressource qui porte le même nom
    function ASKIFRessourceExist(){
        //il faut vérifier est ce qu'il existe une autre ressource avec le même nom
        
        var hasName=document.getElementsByName("hasName")[0].value;
        var label=document.getElementsByName("label")[0].value;

        if(hasName != "" && label!=""){
          var urlASK= urlCorese+"/tutorial/azkar?query=ASK WHERE { ?x a <http://azkar.musee_Ontology.fr/amo%23MuseumExternalRessource> . ?x <http://azkar.musee_Ontology.fr/amo%23hasName> '"+hasName+"'}" ;
                var data = {
                url: urlASK,
                typeRequest: "ASKIFRessourceExist",
                ressourceName:hasName
              }
              socket.emit('executeSPARQL',data);
            }else{
               alert("Veuillez renseigner les champs \"Nom du media\" & \"URI\" ")
            }
    }

    // fonction qui vérifie que l'URI de la ressource n'a jamais été créer
    function ASKIFURIExistInRessources(){

      var label=document.getElementsByName("label")[0].value;
      label=label.replace(/(^\s*)|(\s*$)/g,"");
      //label=encodeURIComponent(label);
      
        var urlASK= urlCorese+"/tutorial/azkar?query=ASK WHERE { ?x a <http://azkar.musee_Ontology.fr/amo%23MuseumExternalRessource> . ?x rdfs:label '"+label+"'}";
                var data = {
                url: urlASK,
                typeRequest: "ASKIFURIExistInRessources",
                ressourceURI:label
              }
              socket.emit('executeSPARQL',data);
           
    }

    //fonction qui vérifie que la ressource n'existe pas dans la scène associée
    function ASKIFURIExistInScene(){
      var label=document.getElementsByName("label")[0].value;
      label=encodeURIComponent(label);
      var linkedToScene=document.getElementsByName("linkedToScene")[0].value;

      if(linkedToScene != "undefined"){
        var urlASK= urlCorese+"/tutorial/azkar?query=ASK WHERE { <http://azkar.musee_Ontology.fr/schema%23"+linkedToScene+"> <http://azkar.musee_Ontology.fr/amo%23linkedToExternalRessource> '"+label+"'}";
                var data = {
                url: urlASK,
                typeRequest: "ASKIFURIExistInScene",
                sceneName:linkedToScene,
                ressourceURI:label
              }
              socket.emit('executeSPARQL',data);
            }else{
              enregistrementNouveauMedia();
            }
    }

    // fonction qui enregistre une nouvelle ressource externe sur le dataSet
    function enregistrementNouveauMedia(){
      
      var hasName=document.getElementsByName("hasName")[0].value;
      var comment=document.getElementsByName("comment")[0].value;
      var hasMuseumTheme=document.getElementsByName("hasMuseumTheme")[0].value;
      var label=document.getElementsByName("label")[0].value;
      var hasKeyWords=document.getElementsByName("hasKeyWords")[0].value;
      var hasLogo=document.getElementsByName("hasLogo")[0].value;
      var hasProvider=document.getElementsByName("hasProvider")[0].value;
      var hasUsualLanguage=document.getElementsByName("hasUsualLanguage")[0].value;
      var hasDescription=document.getElementsByName("hasDescription")[0].value;
      var hasMediaType=document.getElementsByName("listMediaTypes")[0].value;
      var linkedToScene=document.getElementsByName("linkedToScene")[0].value;


      if(comment==="") comment="undefined" ;
      if(hasMuseumTheme==="") hasMuseumTheme="undefined" ;
      if(hasKeyWords==="")  hasKeyWords="undefined" ;
      if(hasLogo==="") hasLogo="undefined" ;
      if(hasProvider==="") hasProvider="undefined" ;
      if(hasUsualLanguage==="") hasUsualLanguage="undefined" ;
      if(hasDescription==="") hasDescription="undefined" ;
      
          label=encodeURIComponent(label);
          
          if(linkedToScene === "noClassifiedMedia")
            linkedToScene="undefined";
          //requete pour ajouter un media à partir des champs de saisie

          var urlAddRessource=urlCorese+"/tutorial/azkar?query=INSERT DATA {<http://azkar.musee_Ontology.fr/schema%23"+hasName+"> a <http://azkar.musee_Ontology.fr/amo%23MuseumExternalRessource>;<http://azkar.musee_Ontology.fr/amo%23hasDescription>'"+hasDescription+"';<http://azkar.musee_Ontology.fr/amo%23hasKeyWords>'"+hasKeyWords+"';<http://azkar.musee_Ontology.fr/amo%23hasLogo>'"+hasLogo+"';<http://azkar.musee_Ontology.fr/amo%23hasMediaType>'"+hasMediaType+"';<http://azkar.musee_Ontology.fr/amo%23hasMuseumTheme>'"+hasMuseumTheme+"';<http://azkar.musee_Ontology.fr/amo%23hasName> '"+hasName+"';<http://azkar.musee_Ontology.fr/amo%23hasProvider>'"+hasProvider+"';<http://azkar.musee_Ontology.fr/amo%23hasUsualLanguage>'"+hasUsualLanguage+"';<http://azkar.musee_Ontology.fr/amo%23linkedToScene>'"+linkedToScene+"';rdfs:comment '"+comment+"';rdfs:label '"+label+"'}"
          var data = {
                url: urlAddRessource,
                typeRequest: "enregistrementNouveauMedia"        
              }
              socket.emit('executeSPARQL',data);
          //pour mettre à jour la scène correspondante
          //var urlMajscene="https://corese.inria.fr/tutorial/azkar?query=INSERT DATA{ <http://azkar.musee_Ontology.fr/schema%23"+SceneName+"> <http://azkar.musee_Ontology.fr/amo%23linkedToExtMedia> <http://azkar.musee_Ontology.fr/schema%23"+mediaName+">}"
          
          if(linkedToScene!="undefined"){
             var urlMajscene=urlCorese+"/tutorial/azkar?query=INSERT DATA{ <http://azkar.musee_Ontology.fr/schema%23"+linkedToScene+"> <http://azkar.musee_Ontology.fr/amo%23linkedToExternalRessource> '"+label+"'}"
             var data = {
                url: urlMajscene,
                typeRequest: "enregistrementNouveauMedia"        
              }
              socket.emit('executeSPARQL',data);
          }
         

          //window.location.reload();     
    }

    // pop-up d'ajout d'une nouvelle ressource
    function addNewMedia(){

      try{
        var selectElmt = document.getElementById("choixScene");
        scName = selectElmt.options[selectElmt.selectedIndex].value;
        
        $('#modalTitle').empty();
        $('#modalTitle').append('Ajout d\'une nouvelle ressource externe : ');
        $('#modalBody').empty();
        $('#modalBody').append("<table>");
        $('#modalBody').append("<tr><td><label>Nom du media : </label></td><td><input type='text' name='hasName'></td></tr>");
        $('#modalBody').append("<tr><td><label>Comment : </label></td><td><input type='text' name='comment'></td></tr>");
        $('#modalBody').append("<tr><td><label>MuseumTheme : </label></td><td><input type='text' name='hasMuseumTheme'></td></tr>");
        $('#modalBody').append("<tr><td><label>URI : </label></td><td><input type='text' name='label'></td></tr>");
        $('#modalBody').append("<tr><td><label>Key Words :</label></td><td><input type='text' name='hasKeyWords'></td></tr>");
        $('#modalBody').append("<tr><td><label>Logo :</label></td><td><input type='text' name='hasLogo'></td></tr>");
        $('#modalBody').append("<tr><td><label>Provider  :</label></td><td><input type='text' name='hasProvider'></td></tr>");
        $('#modalBody').append("<tr><td><label>Language  :</label></td><td><input type='text' name='hasUsualLanguage'></td></tr>");
        $('#modalBody').append("<tr><td><label>Description :</label></td><td><input type='text' name='hasDescription'></td></tr>");
        $('#modalBody').append("<tr><td><label><b>MediaType :</b></label></td><td><select name='listMediaTypes'><option value='Picture' selected='selected'>Picture</option><option value='webPage'>webPage</option><option value='Video'>Video</option><option value='wikipedia'>wikipedia</option><option value='dbpedia'>Dbpedia</option></select></td></tr>");

        var htmlToDisplay="";
        htmlToDisplay = "<tr><td><label><b>linkedToScene : </b></label></td><td><select name='linkedToScene'>";
        for(sc in Scenes){
            if(Scenes[sc].binding.uri===scName)
              htmlToDisplay+= "<option value='"+Scenes[sc].binding.uri+"' selected='selected'>"+Scenes[sc].binding.uri+"</option>";
            else
              htmlToDisplay+= "<option value='"+Scenes[sc].binding.uri+"'>"+Scenes[sc].binding.uri+"</option>";
        }
        htmlToDisplay+= "<option value='noClassifiedMedia'>No Classified Media</option>";
        htmlToDisplay+= "</select></td></tr>";
        $('#modalBody').append(htmlToDisplay);
        $('#modalBody').append("</table>");
        $('#modalFooter').empty();
        $('#modalFooter').append("<button type='button' class='btn btn-primary active' data-dismiss='modal' onclick='ASKIFRessourceExist()'>Ajouter</button>");
        $('#modalFooter').append("<button type='button' class='btn btn-default active' data-dismiss='modal'>Annuler</button>");
      }catch(err)
      {
        alert("Veuillez choisir une MAP SVP !!!");
      }
        
    }

    //afficher l'entête de tableau des données
    function PTH(){
      if(printTableHead==0){
        $('#myTable').append('<tr><td><b><center>Nom de la ressource</center></b></td><td><b><center>Type</center></b></td><td><b><center>Opérations</center></b></td><td><b><center>Associé à la Scène</center></b></td></tr>');
        printTableHead=1;
      } 
    }

