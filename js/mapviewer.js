// TODO ...
// Ici on mettra tout ce qui concerne les canvas de télémétrie...

var canvasPilote  = document.querySelector('#mapviewer_canvas');
var ctxPilote = canvasPilote.getContext('2d');


var fondDemo = new Image();
fondDemo.src = '/images/mapwiever1.png';
console.log(fondDemo);
//ctxPilote.drawImage(fondDemo, 620, 350, 0, 0);
//alert("coucou");
/**/


fondDemo.addEventListener('load', function() {
    console.log ("RRRRRRRRRRRRRRRRRRRRRRRRR");
    ctxPilote.drawImage(fondDemo, 0,0, 620, 350);
}, false);
/**/

/*
ctxPilote.fillStyle = "gold";
ctxPilote.fillRect(50, 35, 50, 80);

ctxPilote.fillStyle = "rgba(23, 145, 167, 0.5)";
ctxPilote.fillRect(40, 25, 40, 40);
/**/