


refreshJaugeBattery = function (percentage) {
	
	progressBar = document.getElementById('battery_level'); 
	if (progressBar && percentage) progressBar.value = parseFloat(Math.round(percentage)); 

}

