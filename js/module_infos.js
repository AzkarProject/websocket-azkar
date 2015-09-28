// TODO: Affichage et traitement des infos de battery par exemple...

refreshJaugeBattery = function (percentage) {

progressBar = document.getElementById('battery_level'); 
progressBar.value = parseFloat(Math.round(percentage)); 

}