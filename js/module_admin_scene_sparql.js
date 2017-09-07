		   socket = io.connect(); 

       //alert("cool")

			 var printTableHead=0;
			 var listOfMaps=[];
			 var listOfScenes=[];
			 var coll=[];
			 var indiceCollection=0;
			 var sceneNameToDisplay=null;
			 var collectionOfSceneValues=[];
			 var collectionForUpdate=[];
			 var SelectedMAP;
			 var urlCorese = "http://134.59.130.147"


        // fonction de recupération de toutes les MAPs
		function getAllMaps(){
		      
          console.log("@getAllMaps")
          var url=urlCorese+"/tutorial/azkar?query=select ?x where { ?x  a <http://azkar.musee_Ontology.fr/amo%23MuseumMap> }";
		      
		      var data = {
		           url: url,
		           typeRequest: "getAllMaps"
		       }  

		      socket.emit('executeSPARQL',data);
		    }

    



    // Le traitement de retours des résultats SPARQL envoyé par le serveur nodeJS à travers websocket
		socket.on('resultSPARQL', function(data) {
		        
		        console.log("socket.on('resultSPARQL',"+data.typeRequest+")")
		         parser = new DOMParser();
		        var xmlDoc = parser.parseFromString(data.result, "text/xml");
		            
		        // Convert XML to JSON
		        var x2js = new X2JS();
		        var jsonObj = x2js.xml2json(xmlDoc);
		


    if (data.typeRequest == 'getAllMaps') {
		             
		            listOfMaps=jsonObj.sparql.results.result;
                console.log(listOfMaps )
		              
                  for(sc in listOfMaps){
		                  listOfMaps[sc].binding.uri=listOfMaps[sc].binding.uri.substring(listOfMaps[sc].binding.uri.lastIndexOf("#")+1);
		                  $('#choixMap').append("<option value='"+listOfMaps[sc].binding.uri+"'>"+listOfMaps[sc].binding.uri+"</option>");
		              }

		        } else if (data.typeRequest == 'getMapScenes') {

	             listOfScenes=jsonObj.sparql.results.result;
	             if(listOfScenes != undefined){
	             	getSceneValues();  
	             }
	            else
	              alert("Aucune scène n'est associée à cette MAP ")     
		    
        }else if (data.typeRequest == 'getSceneValues'){

		    	coll=jsonObj.sparql.results.result;

		    	for (c in coll){
		    		var uriTODisplay = coll[c].binding[0].uri.substring(coll[c].binding[0].uri.lastIndexOf("#")+1);
		    		if(uriTODisplay != "type"){
		    			var valeur = coll[c].binding[1].literal.__text;
		    			if(uriTODisplay === "label"){
		    				sceneNameToDisplay=valeur;
		    			}
		    				addcollectionScene(indiceCollection,uriTODisplay,valeur);

		    			if(sceneNameToDisplay!=null){
		    				var btnModifier="<button type='button' class='btn btn-success active' data-toggle='modal' data-target='#myModal' onclick='modifierScene("+indiceCollection+");'><span class='glyphicon glyphicon-pencil'></span> Modifier</button>";
	              var btnInfo="<button type='button' class='btn btn-info active' data-toggle='modal' data-target='#myModal' onclick='afficheDetailScene("+indiceCollection+");'><span class='glyphicon glyphicon-info-sign'></span> Détail</button>";
	              var btnSupprimer="<button type='button' class='btn btn-danger active' data-toggle='modal' data-target='#myModal' onclick='supprimerScene("+indiceCollection+");'><span class='glyphicon glyphicon-remove'></span> Supprimer</button>";
							$('#myTable').append('<tr><td><center><b>'+sceneNameToDisplay+'</b></center></td><td><center>'+btnInfo+' '+btnModifier+' '+btnSupprimer+'</center></td><td><b><center>'+SelectedMAP+'</center></b></td></tr>');
							indiceCollection=indiceCollection+1;
							sceneNameToDisplay=null;
		    			}
		    			
	}
		    	}
		    }else if (data.typeRequest == "ASKIfSceneNameExist" ){
		    	if(jsonObj.sparql.boolean==="false"){
           			 enregistrementNouvelleScene();  
          }		else{
            		alert("Le nom de la scène "+data.sceneName+" existe déjà , veuillez le changer !!!");
		    }

			    }

			  });


// fonction d'extration des données des scènes
function getSceneValues(){
	      
	    
	        $('#myTable').empty();
	        
	        indiceCollection=0;
	        printTableHead=0;
	        collectionOfSceneValues=[];
	        PTH();
	        if (listOfScenes.length === undefined ){
	        	var sceneName=listOfScenes.binding.literal.__text;
            var url = urlCorese+"/tutorial/azkar?query=select ?y ?z where { <http://azkar.musee_Ontology.fr/schema%23"+sceneName+"> ?y ?z}"
            
            var data = {
               url: url,
               typeRequest: "getSceneValues"
            }  
            socket.emit('executeSPARQL',data);
	        }else{
	        	for(sc in listOfScenes){
	      	var sceneName=listOfScenes[sc].binding.literal.__text;
        
            var url = urlCorese+"/tutorial/azkar?query=select ?y ?z where { <http://azkar.musee_Ontology.fr/schema%23"+sceneName+"> ?y ?z}"
            
            var data = {
               url: url,
               typeRequest: "getSceneValues"
            }  
            socket.emit('executeSPARQL',data);
        }
	        }
	      
	    }

// pop-up qui contient le détail d'une scène
function afficheDetailScene(indice){
  $('#modalTitle').empty();

      $('#modalBody').empty();
      var description=collectionOfSceneValues[indice];
      var moreDescription=true;
      var s="";
      var i=0;
      $('#modalBody').append("<table>")
      while(moreDescription){
          if(description.charAt(i)=='|'){
              var extMediaName=s.substring(0,s.lastIndexOf(" : "));
              if(extMediaName=="label"){
                  $('#modalTitle').append('Détail de la scène  : <b>'+s.substring(s.lastIndexOf(" : ")+2)+'</b>');
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

// pop-up pour les m-à-j des scènes
function modifierScene(indice){
	$('#modalTitle').empty();

    $('#modalBody').empty();

       collectionForUpdate=[];
      var description=collectionOfSceneValues[indice];
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

          if (propriete ==="label")
            $('#modalTitle').append('Modification de la scène : <b>'+value+'</b>');
        else if (propriete != "ComposedOf" && propriete != "hasBoundingBox" && propriete != "hasBoundingBox" && propriete != "linkedToExternalRessource" && propriete != "linkedToPOI" && propriete != "linkedToTrail" && propriete != "linkedToMap"){
        	$('#modalBody').append("<tr><td><label><b>"+propriete+ " : </b></label></td><td><input type='text' value='"+value+"' name='"+prop+"' /></td></tr>");
            collectionForUpdate.push({Propriete:propriete,AtributeName:prop,oldValue:value.replace(/(^\s*)|(\s*$)/g,"")});
        }else if(propriete === "linkedToMap"){
        	var htmlToDisplay="";
            htmlToDisplay = "<tr><td><label><b>"+propriete+ " : </b></label></td><td><select name='linkedToMap'>";
        	for (m in listOfMaps){
        		
        		if(listOfMaps[m].binding.uri===SelectedMAP)
              htmlToDisplay+= "<option value='"+listOfMaps[m].binding.uri+"' selected='selected'>"+listOfMaps[m].binding.uri+"</option>";
               else
              htmlToDisplay+= "<option value='"+listOfMaps[m].binding.uri+"'>"+listOfMaps[m].binding.uri+"</option>";
        	}
        	htmlToDisplay+= "</select></td></tr>";
            $('#modalBody').append(htmlToDisplay);
            collectionForUpdate.push({Propriete:propriete,AtributeName:"linkedToMap",oldValue:SelectedMAP});
        }
          
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
      $('#modalFooter').append("<button type='button' class='btn btn-success active' data-dismiss='modal' onclick='enregistrementDesModificationsDesScenes("+indice+")'><span class='glyphicon glyphicon-floppy-saved'></span> Enregister</button>");
      $('#modalFooter').append("<button type='button' class='btn btn-default active' data-dismiss='modal'><span class='glyphicon glyphicon-floppy-remove'></span> Annuler</button>");
}

// fonction pour enregister les m-à-j des scènes
function enregistrementDesModificationsDesScenes(indice){
	var sceneName = getSceneName(indice);
	sceneName=sceneName.replace(/(^\s*)|(\s*$)/g,"");
	
	 for(c in collectionForUpdate) { 
	 	var newValue=document.getElementsByName(collectionForUpdate[c].AtributeName)[0].value;
          newValue=newValue.replace(/(^\s*)|(\s*$)/g,"");
          if(newValue === ""){
            newValue= "indefini";
          }
          newValue=newValue.replace(/(^\s*)|(\s*$)/g,"");
          //newValue=encodeURI(newValue);
          //newValue=newValue.replace("é","e");
          //newValue=newValue.replace("è","e");
          var proprieteToUpdate=collectionForUpdate[c].Propriete;
          var oldValue=collectionForUpdate[c].oldValue;
          oldValue=oldValue.replace(/(^\s*)|(\s*$)/g,"");
          //oldValue=encodeURI(oldValue);
          //oldValue=oldValue.replace("é","e");
          //oldValue=oldValue.replace("è","e");
          if(proprieteToUpdate === "linkedToMap" && oldValue!=newValue){

          	 var urlToUpdate= urlCorese+"/tutorial/azkar?query=DELETE DATA{ <http://azkar.musee_Ontology.fr/schema%23"+oldValue+"> <http://azkar.musee_Ontology.fr/amo%23linkedToScene> '"+sceneName+"'}";
              var data = {
               url: urlToUpdate,
               typeRequest: "enregistrementDesModfications"
	 }
	 	     socket.emit('executeSPARQL',data); 

	 	     var urlToUpdate= urlCorese+"/tutorial/azkar?query=INSERT DATA{ <http://azkar.musee_Ontology.fr/schema%23"+newValue+"> <http://azkar.musee_Ontology.fr/amo%23linkedToScene> '"+sceneName+"'}";
              var data = {
               url: urlToUpdate,
               typeRequest: "enregistrementDesModfications"
	 }
	 	     socket.emit('executeSPARQL',data); 

	 	     var urlToUpdate= urlCorese+"/tutorial/azkar?query=DELETE { <http://azkar.musee_Ontology.fr/schema%23"+sceneName+"> <http://azkar.musee_Ontology.fr/amo%23"+proprieteToUpdate+"> '"+oldValue+"'} INSERT {<http://azkar.musee_Ontology.fr/schema%23"+sceneName+"> <http://azkar.musee_Ontology.fr/amo%23"+proprieteToUpdate+"> '"+newValue+"'} WHERE {<http://azkar.musee_Ontology.fr/schema%23"+sceneName+"> rdfs:label '"+sceneName+"'}";
              var data = {
               url: urlToUpdate,
               typeRequest: "enregistrementDesModfications"
	 }
	 	socket.emit('executeSPARQL',data);
          }else{
          	var urlToUpdate= urlCorese+"/tutorial/azkar?query=DELETE { <http://azkar.musee_Ontology.fr/schema%23"+sceneName+"> <http://azkar.musee_Ontology.fr/amo%23"+proprieteToUpdate+"> '"+oldValue+"'} INSERT {<http://azkar.musee_Ontology.fr/schema%23"+sceneName+"> <http://azkar.musee_Ontology.fr/amo%23"+proprieteToUpdate+"> '"+newValue+"'} WHERE {<http://azkar.musee_Ontology.fr/schema%23"+sceneName+"> rdfs:label '"+sceneName+"'}";
              var data = {
               url: urlToUpdate,
               typeRequest: "enregistrementDesModfications"
	 }
	 	socket.emit('executeSPARQL',data);
          }
           
}

}

// fonction qui retourne le nom d'une scène selon un indice passé en paramètre
function getSceneName(indice){
      var arr=collectionOfSceneValues[indice];
      var arr2=arr.split("|");
      for(i in arr2){
        var moresplit=arr2[i].split(" : ")
        if(moresplit[0]=="label"){
          return moresplit[1];
        }
      }
    } 

// pop-up de suppression d'une scène
function supprimerScene(indice){
	  $('#modalTitle').empty();
      $('#modalTitle').append('<h4><b>Suppression d\'une scène : </b></h4>');
      $('#modalBody').empty();
      $('#modalBody').append('<h4>Êtes vous sûr de vouloir supprimer cette scène ?</h4>');
      $('#modalFooter').empty();
      $('#modalFooter').append("<button type='button' class='btn btn-danger active' data-dismiss='modal' onclick='confirmationSuppressionScene("+indice+")'><span class='glyphicon glyphicon-remove'></span> Supprimer</button>");
      $('#modalFooter').append("<button type='button' class='btn btn-default active' data-dismiss='modal'>Annuler</button>");
}

// fonction pour la suppression définitive d'une scène avec les m-à-j des autres objets liées à cette scène
function confirmationSuppressionScene(indice){
	 var SceneName = getSceneName(indice);

	 var urlMajMAP= urlCorese+"/tutorial/azkar?query=DELETE DATA{ <http://azkar.musee_Ontology.fr/schema%23"+SelectedMAP+"> <http://azkar.musee_Ontology.fr/amo%23linkedToScene> '"+SceneName+"'}";
          var data = {
                url: urlMajMAP,
                typeRequest: "confirmationSuppressionScene"
              }
              socket.emit('executeSPARQL',data);

    var urlMajOtherObject= urlCorese+"/tutorial/azkar?query=DELETE { ?x <http://azkar.musee_Ontology.fr/amo%23linkedToScene> '"+SceneName+"'} INSERT { ?x <http://azkar.musee_Ontology.fr/amo%23linkedToScene> 'undefined'} WHERE { ?x <http://azkar.musee_Ontology.fr/amo%23linkedToScene> '"+SceneName+"'}";
          var data = {
                url: urlMajOtherObject,
                typeRequest: "confirmationSuppressionScene"
              }
              socket.emit('executeSPARQL',data);

    var urlDelete= urlCorese+"/tutorial/azkar?query=DELETE { <http://azkar.musee_Ontology.fr/schema%23"+SceneName+">  ?y ?z } where { ?x ?y ?z }"
        var data = {
                url: urlDelete,
                typeRequest: "confirmationSuppressionScene"
              }
              socket.emit('executeSPARQL',data);
}

// pop-up pour l'ajout d'une nouvelle scène
function addNewScene(){
	
        $('#modalTitle').empty();
        $('#modalTitle').append('Ajout d\'une nouvelle scène : ');
        $('#modalBody').empty();
        $('#modalBody').append("<table>");
        $('#modalBody').append("<tr><td><label>Nom de la scène : </label></td><td><input type='text' name='label'></td></tr>");
        $('#modalBody').append("<tr><td><label>Description : </label></td><td><input type='text' name='hasDescription'></td></tr>");
        $('#modalBody').append("<tr><td><label>HistoricalMessage : </label></td><td><input type='text' name='hasHistoricalMessage'></td></tr>");
        $('#modalBody').append("<tr><td><label>ID de la scène : </label></td><td><input type='number' min='1' name='hasID'></td></tr>");
        $('#modalBody').append("<tr><td><label>Mots clés : </label></td><td><input type='text' name='hasKeyWords'></td></tr>");
        $('#modalBody').append("<tr><td><label>Image de la scène : </label></td><td><input type='text' name='hasPicture'></td></tr>");
        
        var htmlToDisplay="";
        htmlToDisplay = "<tr><td><label><b>linkedToMap : </b></label></td><td><select name='linkedToMap'>";
        for(m in listOfMaps){
            if(listOfMaps[m].binding.uri===SelectedMAP)
              htmlToDisplay+= "<option value='"+listOfMaps[m].binding.uri+"' selected='selected'>"+listOfMaps[m].binding.uri+"</option>";
            else
              htmlToDisplay+= "<option value='"+listOfMaps[m].binding.uri+"'>"+listOfMaps[m].binding.uri+"</option>";
        }
        htmlToDisplay+= "</select></td></tr>";
        $('#modalBody').append(htmlToDisplay);
        $('#modalBody').append("</table>");
        $('#modalFooter').empty();
        $('#modalFooter').append("<button type='button' class='btn btn-primary active' data-dismiss='modal' onclick='ASKIfSceneNameExist()'>Ajouter</button>");
        $('#modalFooter').append("<button type='button' class='btn btn-default active' data-dismiss='modal'>Annuler</button>");
}

// fonction qui vérifie que le nom d'une scène existe ou pas dans le dataSet
function ASKIfSceneNameExist(){
	var label=document.getElementsByName("label")[0].value;
	label=label.replace(/(^\s*)|(\s*$)/g,"");

	if(label != ""){
		var urlASK= urlCorese+"/tutorial/azkar?query=ASK WHERE { ?x a <http://azkar.musee_Ontology.fr/amo%23MuseumScene> . ?x rdfs:label '"+label+"'}" ;
                var data = {
                url: urlASK,
                typeRequest: "ASKIfSceneNameExist",
                sceneName:label
              }
              socket.emit('executeSPARQL',data);
	}else{
		alert("Merci de renseigner le champ \"Nom de la scène  ");
	}


}

// fonction d'enregistrement d'une nouvelle scène
function enregistrementNouvelleScene(){

	var label=document.getElementsByName("label")[0].value;
	var hasDescription=document.getElementsByName("hasDescription")[0].value;
	var hasHistoricalMessage=document.getElementsByName("hasHistoricalMessage")[0].value;
	var hasID=document.getElementsByName("hasID")[0].value;
	var hasKeyWords=document.getElementsByName("hasKeyWords")[0].value;
	var hasPicture=document.getElementsByName("hasPicture")[0].value;
	var linkedToMap=document.getElementsByName("linkedToMap")[0].value;
	
	if(hasDescription==="") hasDescription="undefined" ;	
	if(hasHistoricalMessage==="") hasHistoricalMessage="undefined" ;
	if(hasID==="") hasID="undefined" ;
	if(hasKeyWords==="") hasKeyWords="undefined" ;
	if(hasPicture==="") hasPicture="undefined" ;

	var urlAddScene=urlCorese+"/tutorial/azkar?query=INSERT DATA {<http://azkar.musee_Ontology.fr/schema%23"+label+"> a <http://azkar.musee_Ontology.fr/amo%23MuseumScene> ; <http://azkar.musee_Ontology.fr/amo%23hasDescription>'"+hasDescription+"';<http://azkar.musee_Ontology.fr/amo%23hasKeyWords>'"+hasKeyWords+"';<http://azkar.musee_Ontology.fr/amo%23hasPicture>'"+hasPicture+"';<http://azkar.musee_Ontology.fr/amo%23hasID>'"+hasID+"';<http://azkar.musee_Ontology.fr/amo%23hasHistoricalMessage>'"+hasHistoricalMessage+"';<http://azkar.musee_Ontology.fr/amo%23linkedToMap> '"+linkedToMap+"'; rdfs:label '"+label+"'}"
          var data = {
                url: urlAddScene,
                typeRequest: "enregistrementNouvelleScene"        
              }
              socket.emit('executeSPARQL',data);

     var urlMajMAP=urlCorese+"/tutorial/azkar?query=INSERT DATA{ <http://azkar.musee_Ontology.fr/schema%23"+linkedToMap+"> <http://azkar.musee_Ontology.fr/amo%23linkedToScene> '"+label+"'}"
             var data = {
                url: urlMajMAP,
                typeRequest: "enregistrementNouvelleScene"        
              }
              socket.emit('executeSPARQL',data);
}


// fonction d'ajout des données d'une scène dans une collection
 function addcollectionScene(indice,propriete,valeur){

      
      if(collectionOfSceneValues[indice]==null)
        collectionOfSceneValues[indice]=propriete+" : "+valeur+"|"; 
      else
        collectionOfSceneValues[indice]+=propriete+" : "+valeur+"|";
    }

    // fonction d'extraction des scènes liées à une MAP
		function getMapScenes(){
		    $('#myTable').empty();

		    var selectElmt = document.getElementById("choixMap");

		    SelectedMAP = selectElmt.options[selectElmt.selectedIndex].value;
		    
		    var url = urlCorese+"/tutorial/azkar?query=select ?z where { <http://azkar.musee_Ontology.fr/schema%23"+SelectedMAP+"> <http://azkar.musee_Ontology.fr/amo%23linkedToScene> ?z}"
		 
		    //Envoi de la requete au serveur web corese 
		    var data = {
		       url: url,
		       typeRequest: "getMapScenes"
		   }  

		  socket.emit('executeSPARQL',data);
		    
		}

    //afficher l'entête de tableau des données
		function PTH(){
		  if(printTableHead==0){
		    $('#myTable').append('<tr><td><b><center>Nom de la scène</center></b></td><td><b><center>Opérations</center></b></td><td><b><center>Associée à la MAP</center></b></td></tr>');
		    printTableHead=1;
		  } 
		}