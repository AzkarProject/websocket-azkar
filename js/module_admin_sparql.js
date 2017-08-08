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
var listOfScenes;


//var urlProxy= "https://127.0.0.1/";
//var urlCorese = "http://134.59.130.147"
var urlCorese = "http://corese.inria.fr"


function getAllScenes(){  
  //var urlScenes="https://corese.inria.fr/tutorial/azkar?query=select ?x where { ?x  a <http://azkar.musee_Ontology.fr/amo%23MuseumScene> }";
  var urlScenes=urlCorese+"/tutorial/azkar?query=select ?x where { ?x  a <http://azkar.musee_Ontology.fr/amo%23MuseumScene> }";
  
  var data = {
       url: urlScenes,
       typeRequest: "getAllScenes"
   }  

  socket.emit('executeSPARQL',data);

}


function getSceneValues(){
    $('#myTable').empty();
    collectionMedia=[];
    collectionMediaName=[];
    coll=[];
    //indiceMediaName=0;
    printTableHead=0;
    indiceDecollectionMedia=0;
    collectionForUpdate=[];

    var selectElmt = document.getElementById("choixScene");

    requestName = selectElmt.options[selectElmt.selectedIndex].value;
    //Pour filtrer les medias par leurs types
    choixFiltre=document.getElementById("choixFiltre").options[document.getElementById("choixFiltre").selectedIndex].value;
    PTH();    
    
    getSceneMedias(requestName);
}

function getSceneMedias(requestName){


    var resultSparql = null
    var urlScenes = urlCorese+"/tutorial/azkar?query=select * where {<http://azkar.musee_Ontology.fr/schema%23"+requestName+"> ?b ?c}"

    var data = {
       url: urlScenes,
       typeRequest: "getSceneMedias"
    }  

    socket.emit('executeSPARQL',data);

}


function getMediaDescription(){
    
    for(m in collectionMediaName){

        var resultSparql = null
        var urlMedia = urlCorese+"/tutorial/azkar?query=select * where {<http://azkar.musee_Ontology.fr/schema%23"+collectionMediaName[m]+"> ?b ?c}"
        var data = {
             url: urlMedia,
             typeRequest: "getMediaDescription"
        }  

         socket.emit('executeSPARQL',data);

    } 
} 

function generateUID(){

  return tools.createUUID();
}


function addcollectionMedia(indice,propriete,valeur){

  if(collectionMedia[indice]==null)
    collectionMedia[indice]=propriete+"::"+valeur+"|"; 
  else
    collectionMedia[indice]+=propriete+"::"+valeur+"|";
}


function supprimerMedia(indice){
  
  //confirm('Suppression du Media !!!');
  $('#modalTitle').empty();
  $('#modalTitle').append('<h4><b>Attention :: Suppression d\'un media </b></h4>');
  $('#modalTitle').append('Êtes vous sûr de vouloir supprimer ce media ?')
  $('#modalTitle').append('(plusieurs médias peuvent porter le même nom)')
  $('#modalBody').empty();
   //$('#modalBody').append("<table border=1><th><td>Propriété</td><td>Valeur</td></th>")
  var description=collectionMedia[indice];
  //console.log(description)
  var moreDescription=true;
  var s="";
  var i=0;

  while(moreDescription){
      
      if(description.charAt(i)=='|'){
          //var extMediaName=s.substring(0,s.lastIndexOf("::"));
          //$('#modalBody').append("<tr><td>"+s.substring(0,s.lastIndexOf("::")-2)+"</td><td>"+s.substring(s.lastIndexOf("::"))+"</td></tr>")
          $('#modalBody').append("<div><b>"+s+"</b></div>");
          s="";
      } else {
          s+=description.charAt(i);
      }

      i++;
      if(i==description.length){
          moreDescription=false;
      }

  }

  
  //$('#modalBody').append("</table")
  $('#modalFooter').empty();
  $('#modalFooter').append("<button type='button' class='btn btn-danger active' data-dismiss='modal' onclick='confirmationSuppressionMedia("+indice+")'><span class='glyphicon glyphicon-remove'></span> Supprimer</button>");
  $('#modalFooter').append("<button type='button' class='btn btn-default active' data-dismiss='modal'>Annuler</button>");
}


socket.on('resultSPARQL', function(data) {
    
    console.log("socket.on('resultSPARQL',"+data.typeRequest)

    if (data.typeRequest == 'getAllScenes') {

        //resultSparql = data;
          parser = new DOMParser();
          var xmlDoc = parser.parseFromString(data.result, "text/xml");
        
          // Convert XML to JSON
          var x2js = new X2JS();
          var jsonObj = x2js.xml2json(xmlDoc);
          listOfScenes=jsonObj.sparql.results.result;


          for(sc in listOfScenes){
              listOfScenes[sc].binding.uri=listOfScenes[sc].binding.uri.substring(listOfScenes[sc].binding.uri.lastIndexOf("#")+1);
              $('#choixScene').append("<option value='"+listOfScenes[sc].binding.uri+"'>"+listOfScenes[sc].binding.uri+"</option>");
          }
          
          $('#choixScene').append("<option value='noClassifiedMedia'>No Classified Media</option>"); 

    } else if (data.typeRequest == 'getSceneMedias') {


          resultSparql = data.result;
          parser = new DOMParser();
          var xmlDoc = parser.parseFromString(resultSparql, "text/xml");
          // Convert XML to JSON
          var x2js = new X2JS();
          var jsonObj = x2js.xml2json(xmlDoc);

          coll=jsonObj.sparql.results.result;

          for(i in coll){
              
              var displayUri = coll[i].binding[1].uri;
              displayUri=displayUri.substring(displayUri.lastIndexOf("#")+1)
          
              if(displayUri==="linkedToExtMedia"){
                var uriMedia=coll[i].binding[0].uri; 
                uriMedia=uriMedia.substring(uriMedia.lastIndexOf("#")+1) 
                //console.log(uriMedia)
                collectionMediaName.push(uriMedia)

                //sendRequestToCoreseServer(uriMedia);
                
              }
          }  
        
          getMediaDescription();    
    
    } else if (data.typeRequest == 'getMediaDescription') {
    
                resultSparql = data.result;
                parser = new DOMParser();
                var xmlDoc = parser.parseFromString(resultSparql, "text/xml");
                // Convert XML to JSON
                var x2js = new X2JS();
                var jsonObj = x2js.xml2json(xmlDoc);

                coll=jsonObj.sparql.results.result;

                addcollectionMedia(indiceDecollectionMedia,"linkedToScene",requestName);

                for(i in coll){
                  var displayUri = coll[i].binding[1].uri;
                  displayUri=displayUri.substring(displayUri.lastIndexOf("#")+1);

                    switch(displayUri){

                        /*case "linkedToScene" :
                              addcollectionMedia(indiceDecollectionMedia,displayUri,coll[i].binding[0].uri);
                          console.log("linkedToScene : " + displayUri+"||"+coll[i].binding[0].uri)        
                          break;*/

                          case "hasURI" :
                          mediaURI=coll[i].binding[0].literal.__text;
                          if(mediaURI === undefined)
                            mediaURI=coll[i].binding[0].literal.__cdata;

                          addcollectionMedia(indiceDecollectionMedia,displayUri,mediaURI);
                          //console.log(displayUri+"||"+coll[i].binding[0].literal.__text)

                          break;
                          case "isMediaType":
                          mediaType=coll[i].binding[0].literal.__text;
                          addcollectionMedia(indiceDecollectionMedia,displayUri,coll[i].binding[0].literal.__text);
                          //console.log(displayUri+"||"+coll[i].binding[0].literal.__text)

                          break;

                          case "isDescribe" :
                          addcollectionMedia(indiceDecollectionMedia,displayUri,coll[i].binding[0].literal.__text);
                         // console.log(displayUri+"||"+coll[i].binding[0].literal.__text)
                         
                         break;
                         case "hasSource" :
                         addcollectionMedia(indiceDecollectionMedia,displayUri,coll[i].binding[0].literal.__text);
                          //console.log(displayUri+"||"+coll[i].binding[0].literal.__text)
                          
                          break;
                          case "hasMetric" :
                          addcollectionMedia(indiceDecollectionMedia,displayUri,coll[i].binding[0].literal.__text);
                         // console.log(displayUri+"||"+coll[i].binding[0].literal.__text)

                         break;
                         case "hasLabel" :
                         addcollectionMedia(indiceDecollectionMedia,displayUri,coll[i].binding[0].literal.__text);
                         // console.log(displayUri+"||"+coll[i].binding[0].literal.__text)

                         break;
                         case "hasExtMediaName" :
                         mediaName=coll[i].binding[0].literal.__text;//.substring(0,coll[i].binding[0].literal.__text.lastIndexOf(":"));

                         addcollectionMedia(indiceDecollectionMedia,displayUri,coll[i].binding[0].literal.__text);
                        //  console.log(displayUri+"||"+coll[i].binding[0].literal.__text)

                        break;
                        case "hasExtMediaComment" :
                        addcollectionMedia(indiceDecollectionMedia,displayUri,coll[i].binding[0].literal.__text);
                        //  console.log(displayUri+"||"+coll[i].binding[0].literal.__text)      
                        break;
                    } //end switch(displayUri)
                    
                    if(mediaType!=null && mediaName!=null && mediaURI!=null){

                      var btnModifier="<button type='button' class='btn btn-success active' data-toggle='modal' data-target='#myModal' onclick='modifierMedia("+indiceDecollectionMedia+");'><span class='glyphicon glyphicon-pencil'></span> Modifier</button>";
                      var btnInfoMedia="<button type='button' class='btn btn-info active' data-toggle='modal' data-target='#myModal' onclick='afficheDetailMedia("+indiceDecollectionMedia+");'><span class='glyphicon glyphicon-info-sign'></span> Détail</button>";
                      var btnSupprimer="<button type='button' class='btn btn-danger active' data-toggle='modal' data-target='#myModal' onclick='supprimerMedia("+indiceDecollectionMedia+");'><span class='glyphicon glyphicon-remove'></span> Supprimer</button>";
                      if(choixFiltre=="all" || mediaType==choixFiltre)
                        $('#myTable').append('<tr><td><a href="'+mediaURI+'"" target="_blank">'+mediaName+'</a></td><td><center><b>'+mediaType+'</b></center></td><td><center>'+btnInfoMedia+' '+btnModifier+' '+btnSupprimer+'</center></td><td><b><center>'+requestName+'</center></b></td></tr>');

                      indiceDecollectionMedia=indiceDecollectionMedia+1;
                      mediaType=null;
                      mediaName=null;
                      mediaURI=null;
                      // console.log(generateUID());
                    } // end if(mediaType!=null
                }// end for(i in coll){
    
    } else if (data.typeRequest == 'confirmationSuppressionMedia') {




    }
});


function confirmationSuppressionMedia(indice){
 
    console.log("confirmationSuppressionMedia")

    //var extMediaNameAndUID=getMediaName(indice);

    var mediaExtName=getMediaName(indice).substring(0,getMediaName(indice).lastIndexOf(":"));

    //var urlDelete="https://corese.inria.fr/tutorial/azkar?query=DELETE { <http://azkar.musee_Ontology.fr/schema%23"+mediaExtName+">  ?y ?z } where { ?x ?y ?z }"
    var urlDelete= urlEndpoint+"/tutorial/azkar?query=DELETE { <http://azkar.musee_Ontology.fr/schema%23"+mediaExtName+">  ?y ?z } where { ?x ?y ?z }"
      
    console.log("urlDelete = "+urlDelete)
    
    //ça marche
    if (urlDelete != null) {
        $.get(urlDelete,function(data) {
        });
    }


    //ça marche urlEndpoint
    //var urlMajscene="https://corese.inria.fr/tutorial/azkar?query=DELETE DATA{ <http://azkar.musee_Ontology.fr/schema%23"+requestName+"> <http://azkar.musee_Ontology.fr/amo%23linkedToExtMedia> <http://azkar.musee_Ontology.fr/schema%23"+mediaExtName+">}"
    
    var urlMajscene= urlEndpoint+"/tutorial/azkar?query=DELETE DATA{ <http://azkar.musee_Ontology.fr/schema%23"+requestName+"> <http://azkar.musee_Ontology.fr/amo%23linkedToExtMedia> <http://azkar.musee_Ontology.fr/schema%23"+mediaExtName+">}"



    console.log("urlMajscene = "+urlMajscene)
    if (urlMajscene != null) {

     $.get(urlMajscene,function(data) {});
    }
    window.location.reload();
}

function getMediaName(indice){
    var arr=collectionMedia[indice];
      var arr2=arr.split("|");
      for(i in arr2){
            var moresplit=arr2[i].split("::")
            if(moresplit[0]=="hasExtMediaName"){
            return moresplit[1];
        }
    }
}

function enregistrementDesModfications(indice){

  	console.log("enregistrementDesModfications")

    var extMediaNameAndUID=getMediaName(indice);

  	var mediaExtName=extMediaNameAndUID.substring(0,extMediaNameAndUID.lastIndexOf(":"));

  		for(c in collectionForUpdate) { 
    
		    var oldValue=collectionForUpdate[c].oldValue;
		    var newValue=document.getElementsByName(collectionForUpdate[c].AtributeName)[0].value;

		    if(collectionForUpdate[c].Propriete==="linkedToScene"){

				//var urlUpdate="https://corese.inria.fr/tutorial/azkar?query=delete { <http://azkar.musee_Ontology.fr/schema%23"+mediaExtName+"> <http://azkar.musee_Ontology.fr/amo%23linkedToScene> <http://azkar.musee_Ontology.fr/schema%23"+requestName+"> } INSERT{ <http://azkar.musee_Ontology.fr/schema%23"+mediaExtName+"> <http://azkar.musee_Ontology.fr/amo%23linkedToScene> <http://azkar.musee_Ontology.fr/schema%23"+newValue+">} where { <http://azkar.musee_Ontology.fr/schema%23"+mediaExtName+"> <http://azkar.musee_Ontology.fr/amo%23hasExtMediaName> '"+extMediaNameAndUID+"' }"
				

        var urlUpdate= urlEndpoint+"/tutorial/azkar?query=delete { <http://azkar.musee_Ontology.fr/schema%23"+mediaExtName+"> <http://azkar.musee_Ontology.fr/amo%23linkedToScene> <http://azkar.musee_Ontology.fr/schema%23"+requestName+"> } INSERT{ <http://azkar.musee_Ontology.fr/schema%23"+mediaExtName+"> <http://azkar.musee_Ontology.fr/amo%23linkedToScene> <http://azkar.musee_Ontology.fr/schema%23"+newValue+">} where { <http://azkar.musee_Ontology.fr/schema%23"+mediaExtName+"> <http://azkar.musee_Ontology.fr/amo%23hasExtMediaName> '"+extMediaNameAndUID+"' }"



        //console.log("urlUpdate : " +urlUpdate)
				if (urlUpdate != null) {

					$.get(urlUpdate,function(data) {

					});
				}
				
				//var urlUpdate="https://corese.inria.fr/tutorial/azkar?query=delete data { <http://azkar.musee_Ontology.fr/schema%23"+oldValue+"> <http://azkar.musee_Ontology.fr/amo%23linkedToExtMedia> <http://azkar.musee_Ontology.fr/schema%23"+mediaExtName+"> }"
				
        var urlUpdate=urlEndpoint+"/tutorial/azkar?query=delete data { <http://azkar.musee_Ontology.fr/schema%23"+oldValue+"> <http://azkar.musee_Ontology.fr/amo%23linkedToExtMedia> <http://azkar.musee_Ontology.fr/schema%23"+mediaExtName+"> }"

        //console.log("deleteData : " +urlUpdate)
				if (urlUpdate != null) {

					$.get(urlUpdate,function(data) {
					});
				}
			     
			    //var urlUpdate="https://corese.inria.fr/tutorial/azkar?query=insert data  { <http://azkar.musee_Ontology.fr/schema%23"+newValue+"> <http://azkar.musee_Ontology.fr/amo%23linkedToExtMedia> <http://azkar.musee_Ontology.fr/schema%23"+mediaExtName+"> }"

          var urlUpdate=urlEndpoint+"/tutorial/azkar?query=insert data  { <http://azkar.musee_Ontology.fr/schema%23"+newValue+"> <http://azkar.musee_Ontology.fr/amo%23linkedToExtMedia> <http://azkar.musee_Ontology.fr/schema%23"+mediaExtName+"> }"
			    

          if (urlUpdate != null) {

			       $.get(urlUpdate,function(data) {
			       });
			    }
		   	
		   	} else {
					
				if(collectionForUpdate[c].Propriete==="hasURI"){
					      
					    newValue = encodeURIComponent(newValue);
					    oldValue = encodeURIComponent(oldValue);
				}

			   // var urlUpdate="https://corese.inria.fr/tutorial/azkar?query=delete { <http://azkar.musee_Ontology.fr/schema%23"+mediaExtName+"> <http://azkar.musee_Ontology.fr/amo%23"+collectionForUpdate[c].Propriete+"> '"+oldValue+"' } INSERT{ <http://azkar.musee_Ontology.fr/schema%23"+mediaExtName+"> <http://azkar.musee_Ontology.fr/amo%23"+collectionForUpdate[c].Propriete+"> '"+newValue+"'} where { <http://azkar.musee_Ontology.fr/schema%23"+mediaExtName+"> <http://azkar.musee_Ontology.fr/amo%23hasExtMediaName> '"+extMediaNameAndUID+"' }"


          var urlUpdate=urlEndpoint+"/tutorial/azkar?query=delete { <http://azkar.musee_Ontology.fr/schema%23"+mediaExtName+"> <http://azkar.musee_Ontology.fr/amo%23"+collectionForUpdate[c].Propriete+"> '"+oldValue+"' } INSERT{ <http://azkar.musee_Ontology.fr/schema%23"+mediaExtName+"> <http://azkar.musee_Ontology.fr/amo%23"+collectionForUpdate[c].Propriete+"> '"+newValue+"'} where { <http://azkar.musee_Ontology.fr/schema%23"+mediaExtName+"> <http://azkar.musee_Ontology.fr/amo%23hasExtMediaName> '"+extMediaNameAndUID+"' }"

			    if (urlUpdate != null) {

				    $.get(urlUpdate,function(data) {

				    });
			   }
				 
			}


		}
	window.location.reload();
}

function modifierMedia(indice){

   console.log("modifierMedia")

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

      var pos = s.lastIndexOf("::")+2;
      var value= s.substring(pos);

      var propriete=s.substring(0,pos-2);
      var prop=propriete+i;
      if(propriete != "hasExtMediaName" && propriete != "linkedToScene" && propriete != "isMediaType"){
        $('#modalBody').append("<tr><td><label><b>"+propriete+ " : </b></label></td><td><input type='text' value='"+value+"' name='"+prop+"' /></td></tr>");
        collectionForUpdate.push({Propriete:propriete,AtributeName:prop,oldValue:value});     
      }
      if(propriete === "isMediaType"){
        if(value==="Picture")
          $('#modalBody').append("<tr><td><label><b>"+propriete+ " : </b></label></td><td><select name='listMediaTypes'><option value='Picture' selected='selected'>Picture</option><option value='webPage'>webPage</option><option value='Video'>Video</option><option value='wikipedia'>wikipedia</option><option value='dbpedia'>Dbpedia</option></select></td></tr>");
        else if(value==="Video")
          $('#modalBody').append("<tr><td><label><b>"+propriete+ " : </b></label></td><td><select name='listMediaTypes'><option value='Picture'>Picture</option><option value='webPage'>webPage</option><option value='Video' selected='selected'>Video</option><option value='wikipedia'>wikipedia</option><option value='dbpedia'>Dbpedia</option></select></td></tr>");
        else if(value==="webPage")
          $('#modalBody').append("<tr><td><label><b>"+propriete+ " : </b></label></td><td><select name='listMediaTypes'><option value='Picture'>Picture</option><option value='webPage' selected='selected'>webPage</option><option value='Video'>Video</option><option value='wikipedia'>wikipedia</option><option value='dbpedia'>Dbpedia</option></select></td></tr>");
        else if(value==="dbpedia")
          $('#modalBody').append("<tr><td><label><b>"+propriete+ " : </b></label></td><td><select name='listMediaTypes'><option value='Picture'>Picture</option><option value='webPage'>webPage</option><option value='Video'>Video</option><option value='wikipedia'>wikipedia</option><option value='dbpedia' selected='selected'>Dbpedia</option></select></td></tr>");
        else
          $('#modalBody').append("<tr><td><label><b>"+propriete+ " : </b></label></td><td><select name='listMediaTypes'><option value='Picture'>Picture</option><option value='webPage'>webPage</option><option value='Video'>Video</option><option value='wikipedia' selected='selected'>wikipedia</option><option value='dbpedia'>Dbpedia</option></select></td></tr>");
        collectionForUpdate.push({Propriete:propriete,AtributeName:"listMediaTypes",oldValue:value});
      }
      if(propriete === "linkedToScene"){
        var htmlToDisplay="";
        htmlToDisplay = "<tr><td><label><b>"+propriete+ " : </b></label></td><td><select name='sceneOfMedia'>";
        for(sc in listOfScenes){
          if(listOfScenes[sc].binding.uri===requestName)
            htmlToDisplay+= "<option value='"+listOfScenes[sc].binding.uri+"' selected='selected'>"+listOfScenes[sc].binding.uri+"</option>";
          else
            htmlToDisplay+= "<option value='"+listOfScenes[sc].binding.uri+"'>"+listOfScenes[sc].binding.uri+"</option>";

        }   
        htmlToDisplay+= "<option value='noClassifiedMedia'>No Classified Media</option>";
        htmlToDisplay+= "</select></td></tr>";
        $('#modalBody').append(htmlToDisplay);
        collectionForUpdate.push({Propriete:propriete,AtributeName:"sceneOfMedia",oldValue:requestName});
      }

      if (propriete ==="hasExtMediaName")
        $('#modalTitle').append('Modifier Media : <b>'+value.substring(0,value.lastIndexOf(":"))+'</b>');


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
  $('#modalFooter').append("<button type='button' class='btn btn-success active' data-dismiss='modal' onclick='enregistrementDesModfications("+indice+")'><span class='glyphicon glyphicon-floppy-saved'></span> Enregister</button>");
  $('#modalFooter').append("<button type='button' class='btn btn-default active' data-dismiss='modal'><span class='glyphicon glyphicon-floppy-remove'></span> Annuler</button>");
}


function afficheDetailMedia(indice){
  
  console.log("afficheDetailMedia")

  $('#modalTitle').empty();

  $('#modalBody').empty();
  var description=collectionMedia[indice];
  //console.log(description)
  var moreDescription=true;
  var s="";
  var i=0;

  while(moreDescription){
      if(description.charAt(i)=='|'){
          var extMediaName=s.substring(0,s.lastIndexOf("::"));
          if(extMediaName=="hasExtMediaName"){
              $('#modalTitle').append('Detail Media : <b>'+s.substring(s.lastIndexOf("::")+2,s.lastIndexOf(":"))+'</b>');
          }    
          $('#modalBody').append("<div><b>"+s+"</b></div>");
          s="";
      } else{
        s+=description.charAt(i);
      }

      i++;
      
      if(i==description.length){
        moreDescription=false;
      }

  }
  $('#modalFooter').empty();
  $('#modalFooter').append("<button type='button' class='btn btn-primary active' data-dismiss='modal'>Fermer</button>");
}

function enregistrementNouveauMedia(){
  //alert("ajouter media !!!")
  
  var mediaName=document.getElementsByName("mediaName")[0].value;
  var hasExtMediaComment=document.getElementsByName("hasExtMediaComment")[0].value;
  //var hasExtMediaName=document.getElementsByName("hasExtMediaName")[0].value;
  var hasLabel=document.getElementsByName("hasLabel")[0].value;
  var hasMetric1=document.getElementsByName("hasMetric1")[0].value;
  var hasMetric2=document.getElementsByName("hasMetric2")[0].value;
  var hasSource=document.getElementsByName("hasSource")[0].value;
  var hasURI=document.getElementsByName("hasURI")[0].value;
  var isDescribe=document.getElementsByName("isDescribe")[0].value;
  var isMediaType=document.getElementsByName("listMediaTypes")[0].value;
  var SceneName=document.getElementsByName("sceneOfMedia")[0].value;
  if(hasExtMediaComment==="")
    hasExtMediaComment="indefini"
  if(hasLabel==="")
    hasLabel="indefini"
  if(hasMetric1==="")
    hasMetric1="indefini"
  if(hasMetric2==="")
    hasMetric2="indefini"
  if(hasSource==="")
    hasSource="indefini"
  if(isDescribe==="")
    isDescribe="indefini"
  //requete pour ajouter un media à partir des champs de saisie
  if(mediaName!="" && hasURI!="" ){
   hasURI=encodeURIComponent(hasURI);
      var nameAndUIDMedia=mediaName+":OBJECTID__"+generateUID();
      
      //var urlInsertNewMedia="https://corese.inria.fr/tutorial/azkar?query=insert data{<http://azkar.musee_Ontology.fr/schema%23"+mediaName+"> a <http://azkar.musee_Ontology.fr/amo%23externalMedia>;<http://azkar.musee_Ontology.fr/amo%23hasExtMediaComment>'"+hasExtMediaComment+"';<http://azkar.musee_Ontology.fr/amo%23hasExtMediaName>'"+nameAndUIDMedia+"';<http://azkar.musee_Ontology.fr/amo%23hasLabel>'"+hasLabel+"';<http://azkar.musee_Ontology.fr/amo%23hasMetric>'"+hasMetric1+"';<http://azkar.musee_Ontology.fr/amo%23hasMetric>'"+hasMetric2+"';<http://azkar.musee_Ontology.fr/amo%23hasSource>'"+hasSource+"';<http://azkar.musee_Ontology.fr/amo%23hasURI>'"+hasURI+"';<http://azkar.musee_Ontology.fr/amo%23isDescribe>'"+isDescribe+"';<http://azkar.musee_Ontology.fr/amo%23isMediaType>'"+isMediaType+"';<http://azkar.musee_Ontology.fr/amo%23linkedToScene> <http://azkar.musee_Ontology.fr/schema%23"+SceneName+">}"
      
      var urlInsertNewMedia=urlEndpoint+"/tutorial/azkar?query=insert data{<http://azkar.musee_Ontology.fr/schema%23"+mediaName+"> a <http://azkar.musee_Ontology.fr/amo%23externalMedia>;<http://azkar.musee_Ontology.fr/amo%23hasExtMediaComment>'"+hasExtMediaComment+"';<http://azkar.musee_Ontology.fr/amo%23hasExtMediaName>'"+nameAndUIDMedia+"';<http://azkar.musee_Ontology.fr/amo%23hasLabel>'"+hasLabel+"';<http://azkar.musee_Ontology.fr/amo%23hasMetric>'"+hasMetric1+"';<http://azkar.musee_Ontology.fr/amo%23hasMetric>'"+hasMetric2+"';<http://azkar.musee_Ontology.fr/amo%23hasSource>'"+hasSource+"';<http://azkar.musee_Ontology.fr/amo%23hasURI>'"+hasURI+"';<http://azkar.musee_Ontology.fr/amo%23isDescribe>'"+isDescribe+"';<http://azkar.musee_Ontology.fr/amo%23isMediaType>'"+isMediaType+"';<http://azkar.musee_Ontology.fr/amo%23linkedToScene> <http://azkar.musee_Ontology.fr/schema%23"+SceneName+">}"


      if (urlInsertNewMedia != null) {

         $.get(urlInsertNewMedia,function(data) {});
      }
      
      //pour mettre à jour la scène correspondante
      //var urlMajscene="https://corese.inria.fr/tutorial/azkar?query=INSERT DATA{ <http://azkar.musee_Ontology.fr/schema%23"+SceneName+"> <http://azkar.musee_Ontology.fr/amo%23linkedToExtMedia> <http://azkar.musee_Ontology.fr/schema%23"+mediaName+">}"
      
      var urlMajscene=urlEndpoint+"/tutorial/azkar?query=INSERT DATA{ <http://azkar.musee_Ontology.fr/schema%23"+SceneName+"> <http://azkar.musee_Ontology.fr/amo%23linkedToExtMedia> <http://azkar.musee_Ontology.fr/schema%23"+mediaName+">}"



      if (urlMajscene != null) {

          $.get(urlMajscene,function(data) {});
      
      }

      //window.location.reload();
      } else {
          alert("Veuillez renseigner les champs : Nom du media , hasURI ")
      }
}

function addNewMedia(){

    var selectElmt = document.getElementById("choixScene");
    scName = selectElmt.options[selectElmt.selectedIndex].value;
    $('#modalTitle').empty();
    $('#modalTitle').append('Ajout d\'un nouveau media relative à la scène : <b>'+scName+'</b>');
    $('#modalBody').empty();
    $('#modalBody').append("<table>");
    $('#modalBody').append("<tr><td><label>Nom du media : </label></td><td><input type='text' name='mediaName'></td></tr>");
    $('#modalBody').append("<tr><td><label>hasExtMediaComment : </label></td><td><input type='text' name='hasExtMediaComment'></td></tr>");
    //$('#modalBody').append("<label>hasExtMediaName  :: </label><input type='text' name='hasExtMediaName'></br>");
    $('#modalBody').append("<tr><td><label>hasLabel : </label></td><td><input type='text' name='hasLabel'></td></tr>");
    $('#modalBody').append("<tr><td><label>hasMetric :</label></td><td><input type='text' name='hasMetric1'></td></tr>");
    $('#modalBody').append("<tr><td><label>hasMetric  :</label></td><td><input type='text' name='hasMetric2'></td></tr>");
    $('#modalBody').append("<tr><td><label>hasSource  :</label></td><td><input type='text' name='hasSource'></td></tr>");
    $('#modalBody').append("<tr><td><label>hasURI  :</label></td><td><input type='text' name='hasURI'></td></tr>");
    $('#modalBody').append("<tr><td><label>isDescribe  :</label></td><td><input type='text' name='isDescribe'></td></tr>");
    $('#modalBody').append("<tr><td><label><b>isMediaType :</b></label></td><td><select name='listMediaTypes'><option value='Picture' selected='selected'>Picture</option><option value='webPage'>webPage</option><option value='Video'>Video</option><option value='wikipedia'>wikipedia</option><option value='dbpedia'>Dbpedia</option></select></td></tr>");

    var htmlToDisplay="";
    htmlToDisplay = "<tr><td><label><b>linkedToScene :: </b></label></td><td><select name='sceneOfMedia'>";
    for(sc in listOfScenes){
        if(listOfScenes[sc].binding.uri===requestName)
          htmlToDisplay+= "<option value='"+listOfScenes[sc].binding.uri+"' selected='selected'>"+listOfScenes[sc].binding.uri+"</option>";
        else
          htmlToDisplay+= "<option value='"+listOfScenes[sc].binding.uri+"'>"+listOfScenes[sc].binding.uri+"</option>";
    }

    htmlToDisplay+= "<option value='noClassifiedMedia'>No Classified Media</option>";
    htmlToDisplay+= "</select></td></tr>";
    $('#modalBody').append(htmlToDisplay);
    $('#modalBody').append("</table>");
    $('#modalFooter').empty();
    $('#modalFooter').append("<button type='button' class='btn btn-primary active' data-dismiss='modal' onclick='enregistrementNouveauMedia()''>Ajouter</button>");
    $('#modalFooter').append("<button type='button' class='btn btn-default active' data-dismiss='modal'>Annuler</button>");
}

//juste pour afficher l'entête du tableau
function PTH(){
	if(printTableHead==0){
		$('#myTable').append('<tr><td><b><center>Nom du Média</center></b></td><td><b><center>Type</center></b></td><td><b><center>Opérations</center></b></td><td><b><center>Associé à la Scène</center></b></td></tr>');
		printTableHead=1;
	} 
}





