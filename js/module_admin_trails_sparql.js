		   socket = io.connect(); 



			 var printTableHead=0;
			 var listOfMaps=[];
			 var listOfTrails=[];
       var listOfScenes=[];
       var listOfPOIs=[];
       var listOfTrailSteps=[];
       var TrailStepsDetail=[];
       var TrailStepsDetailToDisplay=[];
			 var coll=[];
			 var indiceCollection=0;
       var indiceTrailStep=0;
			 var TrailNameToDisplay=null;
			 var collectionOfTrailValues=[];
			 var collectionForUpdate=[];
       var linkedTo=[];
			 var SelectedMAP="";
			 var urlCorese = "http://134.59.130.147"


    // fonction de récupération de toutes les MAPs
		function getAllMaps(){
		      var url=urlCorese+"/tutorial/azkar?query=select ?x where { ?x  a <http://azkar.musee_Ontology.fr/amo%23MuseumMap> }";
		      
		      var data = {
		           url: url,
		           typeRequest: "getAllMaps"
		       }  

		      socket.emit('executeSPARQL',data);
		    }

      // fonction de récupération de toutes les scènes
      function getAllScenes(){  
      
      var urlScenes=urlCorese+"/tutorial/azkar?query=select ?x ?z where { ?x  a <http://azkar.musee_Ontology.fr/amo%23MuseumScene> . ?x <http://azkar.musee_Ontology.fr/amo%23linkedToMap> ?z}";
      
      var data = {
           url: urlScenes,
           typeRequest: "getAllScenes"
       }  

      socket.emit('executeSPARQL',data);

    }


    // fonction de récupération de touts les point d'interêt
     function getAllPOIs(){  
      
      var urlPOIs=urlCorese+"/tutorial/azkar?query=select ?x ?z where { ?x  a <http://azkar.musee_Ontology.fr/amo%23MuseumPointOfInterest> . ?x <http://azkar.musee_Ontology.fr/amo%23linkedToScene> ?z}";
      
      var data = {
           url: urlPOIs,
           typeRequest: "getAllPOIs"
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
		            
		              for(sc in listOfMaps){
		                  listOfMaps[sc].binding.uri=listOfMaps[sc].binding.uri.substring(listOfMaps[sc].binding.uri.lastIndexOf("#")+1);
		                  $('#choixMap').append("<option value='"+listOfMaps[sc].binding.uri+"'>"+listOfMaps[sc].binding.uri+"</option>");
		              }
                  getAllScenes();
                  getAllPOIs();

		        }else if (data.typeRequest == 'getMapTrails') {
		         
	             listOfTrails=jsonObj.sparql.results.result;
	             if(listOfTrails != undefined){
	             	getTrailValues();  
	             }
	            else
	              alert("Aucun parcours n'est associée à cette MAP ")     
		    }else if(data.typeRequest == 'getAllScenes'){
            listOfScenes=jsonObj.sparql.results.result;
            
            for(sc in listOfScenes){
              var nomOfScene =listOfScenes[sc].binding[0].uri.substring(listOfScenes[sc].binding[0].uri.lastIndexOf("#")+1);
              var mapAssocie=listOfScenes[sc].binding[1].literal.__text;
              listOfScenes[sc]=[];
              listOfScenes[sc].sceneName=nomOfScene;
              listOfScenes[sc].map=mapAssocie;
            }
        }else if(data.typeRequest == 'getAllPOIs'){
            listOfPOIs=jsonObj.sparql.results.result;
            
            for(p in listOfPOIs){
              var nameOfPOI =listOfPOIs[p].binding[0].uri.substring(listOfPOIs[p].binding[0].uri.lastIndexOf("#")+1);
              var sceneAssocie=listOfPOIs[p].binding[1].literal.__text;
              listOfPOIs[p]=[];
              listOfPOIs[p].poi=nameOfPOI;
              listOfPOIs[p].scene=sceneAssocie;
             
            }
        }else if (data.typeRequest == 'getTrailValues'){
		    	coll=jsonObj.sparql.results.result;

		    	for (c in coll){
		    		var uriTODisplay = coll[c].binding[0].uri.substring(coll[c].binding[0].uri.lastIndexOf("#")+1);
		    		if(uriTODisplay != "type"){
		    			var valeur = coll[c].binding[1].literal.__text;
		    			if(uriTODisplay === "label"){
		    				TrailNameToDisplay=valeur;
		    			}
		    				addcollectionTrail(collectionOfTrailValues,indiceCollection,uriTODisplay,valeur);
		    			if(TrailNameToDisplay!=null){
		    				var btnInfoTrailStep="<button type='button' class='btn btn-primary active' data-toggle='modal' data-target='#myModal' onclick='getTrailStep("+indiceCollection+");'><span class='glyphicon glyphicon-info-sign'></span> Étapes de parcours</button>";
	              var btnInfoTrail="<button type='button' class='btn btn-info active' data-toggle='modal' data-target='#myModal' onclick='afficheDetailTrail("+indiceCollection+");'><span class='glyphicon glyphicon-info-sign'></span> Détail</button>";
	              var btnSupprimer="<button type='button' class='btn btn-danger active' data-toggle='modal' data-target='#myModal' onclick='supprimerTrail("+indiceCollection+");'><span class='glyphicon glyphicon-remove'></span> Supprimer</button>";
							$('#myTable').append('<tr><td><center><b>'+TrailNameToDisplay+'</b></center></td><td><center>'+btnInfoTrail+' '+btnInfoTrailStep+' '+btnSupprimer+'</center></td><td><b><center>'+SelectedMAP+'</center></b></td></tr>');
							indiceCollection=indiceCollection+1;
							TrailNameToDisplay=null;
		    			}			
	}
		    	}
		    }else if (data.typeRequest == 'getTrailStep'){
          listOfTrailSteps=jsonObj.sparql.results.result;
          if(listOfTrailSteps != undefined){
            if(listOfTrailSteps.length===undefined){
              //console.log(listOfTrailSteps);
              var TrailStepName=listOfTrailSteps.binding.uri.substring(listOfTrailSteps.binding.uri.lastIndexOf("#")+1);
            listOfTrailSteps=[];
            listOfTrailSteps[0]=TrailStepName;
            }else{
              for( ts in listOfTrailSteps){
            var TrailStepName=listOfTrailSteps[ts].binding.uri.substring(listOfTrailSteps[ts].binding.uri.lastIndexOf("#")+1);
            listOfTrailSteps[ts]=[];
            listOfTrailSteps[ts]=TrailStepName;
          }
            }
            
          getDetailOfTrailSteps(data.indice);
          }else{
            alert("Aucun pas de ce parcours n'a été créer")
          }
          
        }else if (data.typeRequest == 'getDetailOfTrailSteps' ){
          TrailStepsDetail=jsonObj.sparql.results.result;
          if(TrailStepsDetail != undefined){
            for( ts in TrailStepsDetail){
              var attributeName = TrailStepsDetail[ts].binding[0].uri;
              attributeName = attributeName.substring(attributeName.lastIndexOf("#")+1);
              if(attributeName != "type"){
                var value = TrailStepsDetail[ts].binding[1].literal.__text;
                addcollectionTrail(TrailStepsDetailToDisplay,indiceTrailStep,attributeName,value);
              }
            }
         }
         indiceTrailStep++;
         if(indiceTrailStep === listOfTrailSteps.length){
          afficherLesTrailStepDuParcours(data.indice);
         }
          
        }
        else if (data.typeRequest == "ASKIfTrailNameExist" ){
		    	if(jsonObj.sparql.boolean==="false"){
           			 enregistrementNouveauTrail();  
          }		else{
            		alert("Le nom de la scène "+data.TrailName+" existe déjà , veuillez le changer !!!");
		    }

			    }

			  });


//avoir les trelStep liée à un parcours
function getTrailStep(indice){
  var TrailName = getTrailName(indice);
  var url = urlCorese+"/tutorial/azkar?query=select ?x where { ?x a <http://azkar.musee_Ontology.fr/amo%23TrailStep> . ?x <http://azkar.musee_Ontology.fr/amo%23linkedToTrail> '"+TrailName+"'}"
            var data = {
               url: url,
               typeRequest: "getTrailStep",
               indice : indice
            }  
            socket.emit('executeSPARQL',data);
}

// Detail d'un Trail Step
function getDetailOfTrailSteps(indice){
  TrailStepsDetailToDisplay=[];
  indiceTrailStep=0;
  for(ts in listOfTrailSteps){
          var TrailStepName=listOfTrailSteps[ts];
        
            var url = urlCorese+"/tutorial/azkar?query=select ?y ?z where { <http://azkar.musee_Ontology.fr/schema%23"+TrailStepName+"> ?y ?z}"
            
            var data = {
               url: url,
               typeRequest: "getDetailOfTrailSteps",
               indice : indice
            }  
            socket.emit('executeSPARQL',data);
}
}

//pop-up pour afficher les infos d'un trail step liée à un trail 
function afficherLesTrailStepDuParcours(indice){
      var TrailName = getTrailName(indice);
      var TrailStepName="";
      var htmlToDisplay="";
      $('#modalTitle').empty();
      $('#modalTitle').append('Les étapes de parcours  : <b>'+TrailName+'</b>');
      $('#modalBody').empty();
      $('#modalBody').append("<table>")
      for (ts in TrailStepsDetailToDisplay){
        
        var unTrailStep=TrailStepsDetailToDisplay[ts];
        var description = unTrailStep.split("|")
        for(desc in description){
          var info = description[desc].split(" : ");
          if(info[0]==="label")
            TrailStepName=info[1];
          else if(info != "")
            htmlToDisplay+="<tr><td><label>"+info[0]+" : </label></td><td><label>"+info[1]+"</label></td></tr>";
        }
        $('#modalBody').append("<tr><td><label>Step name : </label></td><td><label>"+TrailStepName+"</label></td></tr>");
        $('#modalBody').append(htmlToDisplay);
        $('#modalBody').append("<tr><td><b>------------------------------</b></td><td><b>------------------------------------------------------------</b></td></tr>")
        htmlToDisplay="";
        TrailStepName="";
      }
      $('#modalBody').append("</table>")
      $('#modalFooter').empty();
      $('#modalFooter').append("<button type='button' class='btn btn-primary active' data-dismiss='modal'>Fermer</button>");

}

// pop-up de détail des parcours
function afficheDetailTrail(indice){
  $('#modalTitle').empty();

      $('#modalBody').empty();
      var description=collectionOfTrailValues[indice];
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



// fonction d'éxtraction des données des parcours depuis le dataSet
function getTrailValues(){
	      
	    
	        $('#myTable').empty();
	        
	        indiceCollection=0;
	        printTableHead=0;
	        collectionOfTrailValues=[];
	        PTH();
	        if (listOfTrails.length === undefined ){
	        	var TrailName=listOfTrails.binding.literal.__text;
            var url = urlCorese+"/tutorial/azkar?query=select ?y ?z where { <http://azkar.musee_Ontology.fr/schema%23"+TrailName+"> ?y ?z}"
            console.log("url if : " + url)
            var data = {
               url: url,
               typeRequest: "getTrailValues"
            }  
            socket.emit('executeSPARQL',data);
	        }else{
	        	for(sc in listOfTrails){
	      	var TrailName=listOfTrails[sc].binding.literal.__text;
         
            var url = urlCorese+"/tutorial/azkar?query=select ?y ?z where { <http://azkar.musee_Ontology.fr/schema%23"+TrailName+"> ?y ?z}"
            
            var data = {
               url: url,
               typeRequest: "getTrailValues"
            }  
            socket.emit('executeSPARQL',data);
        }
	        }
	      
	    }

// pop-up des m-à-j des parcours
/*function modifierTrail(indice){
	$('#modalTitle').empty();

    $('#modalBody').empty();

       collectionForUpdate=[];
      var description=collectionOfTrailValues[indice];
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
      $('#modalFooter').append("<button type='button' class='btn btn-success active' data-dismiss='modal' onclick='enregistrementDesModificationsDesTrails("+indice+")'><span class='glyphicon glyphicon-floppy-saved'></span> Enregister</button>");
      $('#modalFooter').append("<button type='button' class='btn btn-default active' data-dismiss='modal'><span class='glyphicon glyphicon-floppy-remove'></span> Annuler</button>");
}*/


// fonction d'enregistrement des m-à-j des parcours
/*function enregistrementDesModificationsDesTrails(indice){
	var TrailName = getTrailName(indice);
	TrailName=TrailName.replace(/(^\s*)|(\s*$)/g,"");
	
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

          	 var urlToUpdate= urlCorese+"/tutorial/azkar?query=DELETE DATA{ <http://azkar.musee_Ontology.fr/schema%23"+oldValue+"> <http://azkar.musee_Ontology.fr/amo%23linkedToTrail> '"+TrailName+"'}";
              var data = {
               url: urlToUpdate,
               typeRequest: "enregistrementDesModfications"
	 }
	 	     socket.emit('executeSPARQL',data); 

	 	     var urlToUpdate= urlCorese+"/tutorial/azkar?query=INSERT DATA{ <http://azkar.musee_Ontology.fr/schema%23"+newValue+"> <http://azkar.musee_Ontology.fr/amo%23linkedToTrail> '"+TrailName+"'}";
              var data = {
               url: urlToUpdate,
               typeRequest: "enregistrementDesModfications"
	 }
	 	     socket.emit('executeSPARQL',data); 

	 	     var urlToUpdate= urlCorese+"/tutorial/azkar?query=DELETE { <http://azkar.musee_Ontology.fr/schema%23"+TrailName+"> <http://azkar.musee_Ontology.fr/amo%23"+proprieteToUpdate+"> '"+oldValue+"'} INSERT {<http://azkar.musee_Ontology.fr/schema%23"+TrailName+"> <http://azkar.musee_Ontology.fr/amo%23"+proprieteToUpdate+"> '"+newValue+"'} WHERE {<http://azkar.musee_Ontology.fr/schema%23"+TrailName+"> rdfs:label '"+TrailName+"'}";
              var data = {
               url: urlToUpdate,
               typeRequest: "enregistrementDesModfications"
	 }
	 	socket.emit('executeSPARQL',data);
          }else{
          	var urlToUpdate= urlCorese+"/tutorial/azkar?query=DELETE { <http://azkar.musee_Ontology.fr/schema%23"+TrailName+"> <http://azkar.musee_Ontology.fr/amo%23"+proprieteToUpdate+"> '"+oldValue+"'} INSERT {<http://azkar.musee_Ontology.fr/schema%23"+TrailName+"> <http://azkar.musee_Ontology.fr/amo%23"+proprieteToUpdate+"> '"+newValue+"'} WHERE {<http://azkar.musee_Ontology.fr/schema%23"+TrailName+"> rdfs:label '"+TrailName+"'}";
              var data = {
               url: urlToUpdate,
               typeRequest: "enregistrementDesModfications"
	 }
	 	socket.emit('executeSPARQL',data);
          }
           
}

}*/

// fonction d'extraction du nom d'un parcours selon un indice donné
function getTrailName(indice){
      var arr=collectionOfTrailValues[indice];
      var arr2=arr.split("|");
      for(i in arr2){
        var moresplit=arr2[i].split(" : ")
        if(moresplit[0]=="label"){
          return moresplit[1];
        }
      }
    } 

// pop-up de suppression d'un parcours
function supprimerTrail(indice){
	  $('#modalTitle').empty();
      $('#modalTitle').append('<h4><b>Suppression d\'un parcours : </b></h4>');
      $('#modalBody').empty();
      $('#modalBody').append('<h4>Êtes vous sûr de vouloir supprimer ce parcours (même les pas de ce parcours vont êtres supprimer) ?</h4>');
      $('#modalFooter').empty();
      $('#modalFooter').append("<button type='button' class='btn btn-danger active' data-dismiss='modal' onclick='confirmationSuppressionTrail("+indice+")'><span class='glyphicon glyphicon-remove'></span> Supprimer</button>");
      $('#modalFooter').append("<button type='button' class='btn btn-default active' data-dismiss='modal'>Annuler</button>");
}

// fonction de suppression définitive d'un parcours
function confirmationSuppressionTrail(indice){
	 var TrailName = getTrailName(indice);
   getTrailStep(indice);
    for (ts in listOfTrailSteps){
      var urlDeleteTrailStep= urlCorese+"/tutorial/azkar?query=DELETE {<http://azkar.musee_Ontology.fr/schema%23"+listOfTrailSteps[ts]+"> ?y ?z} where { ?x ?y ?z }"
        console.log("urlDeleteTrailStep : "+urlDeleteTrailStep);
        var data = {
                url: urlDeleteTrailStep,
                typeRequest: "confirmationSuppressionTrail"
              }
              socket.emit('executeSPARQL',data);
    }
        

	 var urlMaj= urlCorese+"/tutorial/azkar?query=DELETE { ?x <http://azkar.musee_Ontology.fr/amo%23linkedToTrail> '"+TrailName+"' } where { ?x ?y ?z }"
          console.log("urlMaj : "+urlMaj)
          var data = {
                url: urlMaj,
                typeRequest: "confirmationSuppressionTrail"
              }
              socket.emit('executeSPARQL',data);


    var urlDelete= urlCorese+"/tutorial/azkar?query=DELETE { <http://azkar.musee_Ontology.fr/schema%23"+TrailName+">  ?y ?z } where { ?x ?y ?z }"
        console.log("urlDelete : "+urlDelete);
        var data = {
                url: urlDelete,
                typeRequest: "confirmationSuppressionTrail"
              }
              socket.emit('executeSPARQL',data);
}

// pop-up d'ajout d'un nouveau parcours
function addNewTrail(){
	
        if(SelectedMAP===""){
          alert("Merci de choisir une MAP svp !!!")
        }else{
        $('#modalTitle').empty();
        $('#modalTitle').append('Ajout d\'un parcours liée à la MAP : <b>'+ SelectedMAP+'</b>');
        $('#modalBody').empty();
        $('#modalBody').append("<table>");
        $('#modalBody').append("<tr><td><label>Nom du parcours : </label></td><td><input type='text' name='label'></td></tr>");
        $('#modalBody').append("<tr><td><label>Description : </label></td><td><input type='text' name='hasDescription'></td></tr>");
        $('#modalBody').append("<tr><td><label>Le niveau academic : </label></td><td><input type='text' name='hasAcademicLevel'></td></tr>");
        $('#modalBody').append("<tr><td><label>Durée de parcours : </label></td><td><input type='number' min='1' name='hasDuration'></td></tr>");
        $('#modalBody').append("<tr><td><label>Mots clés : </label></td><td><input type='text' name='hasKeyWords'></td></tr>");
        $('#modalBody').append("<tr><td><label>MuseumTheme : </label></td><td><input type='text' name='hasMuseumTheme'></td></tr>");
        $('#modalBody').append("<tr><td><label>Image du parcours : </label></td><td><input type='text' name='hasPicture'></td></tr>");
        $('#modalBody').append("<tr><td><label>Language : </label></td><td><input type='text' name='hasUsualLanguage'></td></tr>");

        
        var htmlToDisplay="";
        for(sc in listOfScenes){ 
            var IsPOIExistInScene=false;
             
            if(SelectedMAP===listOfScenes[sc].map){
              htmlToDisplay += "<tr><td><b>------------------------------</b></td><td><b>------------------------------------------------------------</b></td></tr>";
              htmlToDisplay += "<tr><td><label><u>Scène "+listOfScenes[sc].sceneName+" :  </u></label></td></tr>";
              for(p in listOfPOIs){
                if(listOfPOIs[p].scene===listOfScenes[sc].sceneName){
                  htmlToDisplay += "<tr><td><label>Point d'interêt : </label></td><td><input type='radio' name='"+listOfPOIs[p].scene+"' value='"+listOfPOIs[p].poi+"'><b> "+listOfPOIs[p].poi+"</b></td></tr>";
                  IsPOIExistInScene=true;
                }
              }
              if(IsPOIExistInScene){
                htmlToDisplay +="<tr><td><label>Duration(mn) : </label></td><td><input type='number' min='1' value='1' name='Duration_"+listOfScenes[sc].sceneName+"'></td></tr>";
                htmlToDisplay +="<tr><td><label>N°Order : </label></td><td><input type='number' min='0' value='0' name='Order_"+listOfScenes[sc].sceneName+"'></td></tr>";
              }
              else{
                htmlToDisplay += "<tr><td></td><td><label>Pas de point d'interêt</label></td></tr>";
              }
            }
            
        }
              $('#modalBody').append(htmlToDisplay);
              

        $('#modalBody').append("</table>");
        $('#modalFooter').empty();
        $('#modalFooter').append("<button type='button' class='btn btn-primary active' data-dismiss='modal' onclick='ASKIfTrailNameExist()'>Ajouter</button>");
        $('#modalFooter').append("<button type='button' class='btn btn-default active' data-dismiss='modal'>Annuler</button>");
        }
        
      
}

// fonction d'ajout d'un nouveau parcours
function enregistrementNouveauTrail(){

  var label=document.getElementsByName("label")[0].value;
  var hasDescription=document.getElementsByName("hasDescription")[0].value;
  var hasAcademicLevel=document.getElementsByName("hasAcademicLevel")[0].value;
  var hasDuration=document.getElementsByName("hasDuration")[0].value;
  var hasKeyWords=document.getElementsByName("hasKeyWords")[0].value;
  var hasPicture=document.getElementsByName("hasPicture")[0].value;
  var hasMuseumTheme=document.getElementsByName("hasMuseumTheme")[0].value;
  var hasUsualLanguage=document.getElementsByName("hasUsualLanguage")[0].value;
  var linkedToMap=SelectedMAP;

  if(hasDescription==="") hasDescription="undefined" ;  
  if(hasAcademicLevel==="") hasAcademicLevel="undefined" ;
  if(hasDuration==="") hasDuration="undefined" ;
  if(hasKeyWords==="") hasKeyWords="undefined" ;
  if(hasPicture==="") hasPicture="undefined" ;
  if(hasMuseumTheme==="") hasMuseumTheme="undefined" ;
  if(hasUsualLanguage==="") hasUsualLanguage="undefined" ;

  linkedTo=[]; 

for (sc in listOfScenes){
  if(document.getElementsByName(listOfScenes[sc].sceneName)[0] != undefined 
    && document.getElementsByName(listOfScenes[sc].sceneName)[0].checked===true){
    linkedTo.push({scene:listOfScenes[sc].sceneName,poi:document.getElementsByName(listOfScenes[sc].sceneName)[0].value,
    duration:document.getElementsByName("Duration_"+listOfScenes[sc].sceneName)[0].value,
    order:document.getElementsByName("Order_"+listOfScenes[sc].sceneName)[0].value});
  }
}


  var urlAddTrail=urlCorese+"/tutorial/azkar?query=INSERT DATA {<http://azkar.musee_Ontology.fr/schema%23"+label+"> a <http://azkar.musee_Ontology.fr/amo%23MuseumTrail> ; <http://azkar.musee_Ontology.fr/amo%23hasDescription>'"+hasDescription+"';<http://azkar.musee_Ontology.fr/amo%23hasKeyWords>'"+hasKeyWords+"';<http://azkar.musee_Ontology.fr/amo%23hasPicture>'"+hasPicture+"';<http://azkar.musee_Ontology.fr/amo%23hasAcademicLevel>'"+hasAcademicLevel+"';<http://azkar.musee_Ontology.fr/amo%23hasDuration>'"+hasDuration+"';<http://azkar.musee_Ontology.fr/amo%23hasMuseumTheme>'"+hasMuseumTheme+"';<http://azkar.musee_Ontology.fr/amo%23hasUsualLanguage>'"+hasUsualLanguage+"';<http://azkar.musee_Ontology.fr/amo%23linkedToMap> '"+linkedToMap+"'; rdfs:label '"+label+"'}"
          console.log("urlAddTrail : "+urlAddTrail)
          var data = {
                url: urlAddTrail,
                typeRequest: "enregistrementNouveauTrail"        
              }
              socket.emit('executeSPARQL',data);

     var urlMajMAP=urlCorese+"/tutorial/azkar?query=INSERT DATA{ <http://azkar.musee_Ontology.fr/schema%23"+linkedToMap+"> <http://azkar.musee_Ontology.fr/amo%23linkedToTrail> '"+label+"'}"
             console.log("urlMajMAP : "+urlMajMAP)
             var data = {
                url: urlMajMAP,
                typeRequest: "enregistrementNouveauTrail"        
              }
              socket.emit('executeSPARQL',data);


      for (sc in linkedTo){
        //mettre à jour le parcours en la lien à la scène
         var url=urlCorese+"/tutorial/azkar?query=INSERT DATA{ <http://azkar.musee_Ontology.fr/schema%23"+label+"> <http://azkar.musee_Ontology.fr/amo%23linkedToScene> '"+linkedTo[sc].scene+"'}"
             console.log("url : "+url)
             var data = {
                url: url,
                typeRequest: "enregistrementNouveauTrail"        
              }
              socket.emit('executeSPARQL',data);
        //mettre à jour la scène en la lien au parcours
        var urlMAJScene=urlCorese+"/tutorial/azkar?query=INSERT DATA{ <http://azkar.musee_Ontology.fr/schema%23"+linkedTo[sc].scene+"> <http://azkar.musee_Ontology.fr/amo%23linkedToTrail> '"+label+"'}"
              console.log("urlMAJScene : "+urlMAJScene)
             var data = {
                url: urlMAJScene,
                typeRequest: "enregistrementNouveauTrail"        
              }
              socket.emit('executeSPARQL',data);
        var urlCreateTrailStep=urlCorese+"/tutorial/azkar?query=INSERT DATA {<http://azkar.musee_Ontology.fr/schema%23"+label+"_"+linkedTo[sc].poi+"> a <http://azkar.musee_Ontology.fr/amo%23TrailStep> ; <http://azkar.musee_Ontology.fr/amo%23hasDuration> '"+linkedTo[sc].duration+"' ; <http://azkar.musee_Ontology.fr/amo%23hasOrderNumber> '"+linkedTo[sc].order+"' ; <http://azkar.musee_Ontology.fr/amo%23linkedToPOI> '"+linkedTo[sc].poi+"' ; <http://azkar.musee_Ontology.fr/amo%23linkedToTrail> '"+label+"' ; rdfs:label '"+label+"_"+linkedTo[sc].poi+"'}";
         console.log("urlCreateTrailStep : "+urlCreateTrailStep)
             var data = {
                url: urlCreateTrailStep,
                typeRequest: "enregistrementNouveauTrail"        
              }
              socket.emit('executeSPARQL',data);
      }
}


// fonction qui vérifie que le nom d'un parcours existe ou pas dans le dataSet
function ASKIfTrailNameExist(){
	var label=document.getElementsByName("label")[0].value;
	label=label.replace(/(^\s*)|(\s*$)/g,"");

	if(label != ""){
		var urlASK= urlCorese+"/tutorial/azkar?query=ASK WHERE { ?x a <http://azkar.musee_Ontology.fr/amo%23MuseumTrail> . ?x rdfs:label '"+label+"'}" ;
                var data = {
                url: urlASK,
                typeRequest: "ASKIfTrailNameExist",
                TrailName:label
              }
              socket.emit('executeSPARQL',data);
	}else{
		alert("Merci de renseigner le champ \"Nom du Parcours");
	}


}

 // fonction d'ajout des données d'un parcours dans une collection
 function addcollectionTrail(collection,indice,propriete,valeur){

      
      if(collection[indice]==null)
        collection[indice]=propriete+" : "+valeur+"|"; 
      else
        collection[indice]+=propriete+" : "+valeur+"|";
    }

    // fonction d'extration des parcours liés à une MAP donnée
		function getMapTrails(){
		    $('#myTable').empty();

		    var selectElmt = document.getElementById("choixMap");

		    SelectedMAP = selectElmt.options[selectElmt.selectedIndex].value;
		    
		    var url = urlCorese+"/tutorial/azkar?query=select ?z where { <http://azkar.musee_Ontology.fr/schema%23"+SelectedMAP+"> <http://azkar.musee_Ontology.fr/amo%23linkedToTrail> ?z}"
		 
		    //Envoi de la requete au serveur web corese 
		    var data = {
		       url: url,
		       typeRequest: "getMapTrails"
		   }  

		  socket.emit('executeSPARQL',data);
		    
		}

    //afficher l'entête de tableau des données
		function PTH(){
		  if(printTableHead==0){
		    $('#myTable').append('<tr><td><b><center>Parcours</center></b></td><td><b><center>Opérations</center></b></td><td><b><center>Associée à la MAP</center></b></td></tr>');
		    printTableHead=1;
		  } 
		}

// fonction pour supprimer les doublons dans un tableau
  function cleanArray(array) {
  var i, j, len = array.length, out = [], obj = {};
  for (i = 0; i < len; i++) {
    obj[array[i]] = 0;
  }
  for (j in obj) {
    out.push(j);
  }
  return out;
}