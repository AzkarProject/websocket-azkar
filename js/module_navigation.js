// TODO ...
// Ici on mettra tout ce qui concerne la navigation...
// >> cartographie
// >> liste des points d'intérets
// >> fonctions de clic and go sur la cartographie
// >> Affichage de la télémétrie

var canvasPilote  = document.querySelector('#mapviewer_canvas');
var ctxPilote = canvasPilote.getContext('2d');


var fondDemo = new Image();
fondDemo.src = '/images/mapwiever1.png';


fondDemo.addEventListener('load', function() {
    console.log ("RRRRRRRRRRRRRRRRRRRRRRRRR");
    ctxPilote.drawImage(fondDemo, 0,0, 620, 350);
}, false);
/**/

