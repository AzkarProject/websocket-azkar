// ------ 1 to N --------

function openCnxwith(userID) {
    console.log("@ openCnxwith("+userID+")");
    
    var cible = getClientBy('id',userID); 
	console.log ('socket.emit("requestConnect", ...) >>> ['+cible.typeClient+'] - ');
    var data = {from: localObjUser, cible: cible}
    // console.log (data);
    socket.emit("requestConnect", data);
   // var txt= userID;
    //alert(txt);
}


function updateListUsers () {
        console.log ("@ updateListUsers()");
        // console.log (users);
        var blabla = "";
        var i = null;
        for (i in users.listUsers) {
		    var oneUser = users.listUsers[i];
		    var openform = "";
		    if (oneUser.typeClient == "Visiteur" ) {
		    	openform = '<button class="shadowBlack" id="openCnx'+oneUser.id+'" onclick="openCnxwith(\''+oneUser.id+'\')">Connecter</button>';
		    }
		    blabla +="<div> ["+oneUser.typeClient+"] - Cnx n°"+ oneUser.placeliste +": "+ oneUser.pseudo+" - "+openform+"</div>";   
        }
        // console.log (blabla);
        document.getElementById('listConnected').innerHTML = blabla;   
}