// TODO: Affichage et traitement des infos de battery par exemple...

function refreshJaugeBattery() {
     progressBar = document.getElementById('battery_level'); // 7- 
     progressBar.value = parseFloat(Math.round(percentage)); // 8- 

}