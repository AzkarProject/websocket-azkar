// ------------   multiview Michel


if (proto != '1to1') {



  var buttonAdd, buttonChangePos, videoSection;
  var nbVideos = 0;
  var width, height;
  var tabVideos = [];

  window.onload = function(evt) {
    
    
    videoSection = document.querySelector("#videos");
    
    var rect = videoSection.getBoundingClientRect();
    
    videoSection.style.height="340px";
    
    width= rect.width;
    height = rect.height;
    
    window.onresize = function() {
      setLayoutForTwoVideos();
    };
  };


  function addRemoteMultiVideo(remoteStream,peerCnxID) {  
      
      console.log("@ AddRemoteVideo( remoteStream, "+peerCnxId+")");

      // create a video element  
      var v = document.createElement("video");
      var largeurVideo=150;
      var hauteurVideo=150;
       
      var xVideo = Math.round((width-largeurVideo)/2);
      var yVideo = Math.round((height+hauteurVideo)/2);

      v.style.width=largeurVideo + "px";
      v.style.height=hauteurVideo + "px";

      v.style.left=xVideo + "px";
      // v.style.top=yVideo + "px"; // Modif Titi

      // v.id = 'vid'+ tabVideos.length; // Modif Titi
      v.id = peerCnxID; // Modif Titi
      v.setAttribute("controls", "true");
      v.setAttribute("autoplay", "true");
      v.setAttribute("muted", "true");
      v.src = URL.createObjectURL(remoteStream);
        
      tabVideos.push(v);
      videoSection.appendChild(v);
      setLayoutForTwoVideos();

      console.log("------------------------------------------");
      console.log (v.id);
      console.log(tabVideos);
      console.log("------------------------------------------");
  }


  function removeRemoteVideo(peerCnxId) {

    console.log("@ removeRemoteVideo("+peerCnxId+")");
    // if(! indexVideo) indexVideo = tabVideos.length-1;
    // console.log("on supprime la video id=" + peerCnxId);
    console.log("-------------"+tabVideos.length+" vidéos -----------------------------");
    console.log(tabVideos);
    //console.log("------------------------------------------");
    
    /*// tabVideos.splice(indexVideo, 1);
    for(var i = tabVideos.length-1; i--;){
      
      console.log(" - tabVideos["+i+"].id: "+tabVideos[i].id);
      
      //if (tabVideos[i].id == peerCnxId) {
        //console.log(" >>>> Suppression tabVideos["+i+"].id: "+tabVideos[i].id);
        //tabVideos.splice(i, 1);
      //}
    }
    /**/

    // On la vire de la liste des vidéos
    for(var i in tabVideos){
          console.log(" - tabVideos["+i+"].id: "+tabVideos[i].id);
          if (tabVideos[i].id == peerCnxId) {
            console.log(" >>>> Suppression tabVideos["+i+"].id: "+tabVideos[i].id);
            tabVideos.splice(i, 1);
          }
    }
    
    
    console.log("-------------"+tabVideos.length+" vidéos -----------------------------");
    console.log(tabVideos);
    console.log("------------------------------------------");

    // Et ensuite on la vire du dom
    //if ( tabVideos.length != 0 ) {
      var id = peerCnxId;
      var v = document.querySelector("#"+id);
      // videoSection.removeChild(v); // modif Titi
      //if (v.nodeType === 1) videoSection.removeChild(v); // modif Titi
      if (v != null) videoSection.removeChild(v); // modif Titi
      // Repositionnement des vidéos restantes
      setLayoutForTwoVideos();
    //}

  }


  function setLayoutForTwoVideos() {
    var nbVideos = tabVideos.length;
    var nbHorizontalMargins = nbVideos+1;
      
    var rect = videoSection.getBoundingClientRect();
      
    width= rect.width;
    height = rect.height;
    
    // width and height = size of the container
    // 5% pour chaque marge horizontale, pour deux vidéos il y en a 3
    var horizontalPercentageForMargin = 0.05;
    var horizontalMargin = width*horizontalPercentageForMargin;
    
    // Percentage of total width for the sum of video width
    var percentageWidthForVideos = 1 - horizontalPercentageForMargin;
    var percentageHeightForVideos = 0.9;
    
    // size of each video
    var videoWidth = (width - (nbHorizontalMargins * horizontalMargin))  / nbVideos;
    var videoHeight = height * percentageHeightForVideos;
   
    
    var x= rect.left, y, oldx=0;
    
    for(var i=0; i < nbVideos; i++) {
      var v = tabVideos[i];
      
      x += horizontalMargin;
      y = height - rect.top - videoHeight;
      
      v.style.width=videoWidth + "px";
      v.style.height=videoHeight + "px";

      v.style.left = x + "px";
      //v.style.top  = y + "px"; // Modif Titi
    
      x+=videoWidth;
    }
  }
     
}
