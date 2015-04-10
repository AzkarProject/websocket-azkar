// Méthodes communes client/serveur
var common = require('./js/common');

// contrôle chargement coté serveur
var commonTest = common.test();
console.log(commonTest + " correctement chargé coté serveur !!!");

var app = require('express')(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    ent = require('ent'), // Permet de bloquer les caractères HTML (sécurité équivalente à htmlentities en PHP)
    fs = require('fs');

// variables d'environnement en variables globale pour les passer à la méthode websocket
ipaddress = process.env.OPENSHIFT_NODEJS_IP || process.env.IP ||"127.0.0.1";
port      = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 2000;

// affectation du port
app.set('port', port);

// Pour que nodejs puisse servir correctement 
// les dépendances css du document html
var express = require('express');
app.use(express.static(__dirname));

// Chargement de la page index.html
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});
/**/


// Routing IHM >>>> TODO coté clients
app.get('/pilote/', function (req, res) {
    res.sendFile(__dirname + '/pilote.html');
});

app.get('/robot/', function (req, res) {
    res.sendFile(__dirname + '/robot.html');
});








// Lancement du serveur
server.listen(app.get('port'),ipaddress);

// Pour débugg : Contrôle de la version de socket.io
var ioVersion = require('socket.io/package').version;
var expressVersion = require('express/package').version;
// On affiche ces éléments coté serveur
console.log("**Socket.IO Version: " + ioVersion);
console.log("**Express Version: " + expressVersion);
console.log("**ipAdress = " + ipaddress );
console.log("**port = " + port );


// liste des users
var users = {};
var nbUsers = 0;

// Historique des connexions
var histoUsers = {};
var placeHisto = 0;
histoPosition = 0;


// contrôle des connectés coté serveur
// Ecouteur de connexion d'un nouveau client
function onSocketConnected(socket){
   console.log ("-------------------------------");
   console.log("connexion nouveau client :"+ socket.pseudo + "(ID : " + socket.id + ")");  
}


io.sockets.on('connection', function (socket, pseudo) {
    
    // quand un User rentre un pseudo, 
    // on le stocke en variable de session et on informe les autres Users
    socket.on('nouveau_client', function(pseudo) {

        // On affecte à l'User le pseudo qu'il à renseigné
        pseudo = ent.encode(pseudo);
        socket.pseudo = pseudo;

        // On ajoute l'User à la liste des connectés
        users[socket.id] = pseudo; 

        // On lui attribue un numéro correspondant a sa position d'arrivée dans la session 
        // var placeListe = lastPosition +1; // WTF LastPosition ne s'incrémente pas... 
        // Même en modifiant la portée de la variable (placeliste déclaré sans "var" devant...)
        // var placeListe = nbUsers +1; // Par contre là ca marche ! PKOI ?
        // Il semblerai que les objets soient persistants, pas les valeurs de types primitifs...
        // A creuser + tard (tester si c'est pareil avec un type "string" )....
        
        // Plan B: On passe par un objet contenant tous les users connectés
        // depuis le début de la session (comme une sorte de log, d'historique..)
        // et on comptera simplement le nombre de propriétés de l'objet.
        histoUsers[socket.id] = pseudo + " timestamp:" + Date.now();
        socket.placeListe = common.lenghtObject(histoUsers);

        // On envoie au connecté apellant son ordre d'arrivée ds la session
        // pour qu'il l'ajoute à son pseudo affiché coté client...
        io.to(socket.id).emit('position_liste', socket.placeListe);
        // On signale à tout le monde l'arrivée de l'user
        socket.broadcast.emit('nouveau_client', {pseudo: socket.pseudo, placeListe: socket.placeListe});

        // Enfin on met a jour le nombre de connectés coté client"
        nbUsers = common.lenghtObject(users);
        io.sockets.emit('updateUsers',{nbUsers: nbUsers});


        // On en profite pour envoyer des variables d'environnement serveur 
        // aux parties clientes pour affichage et débug.
        infosServer = "Socket.IO: " + ioVersion + " / Express: " + expressVersion + " / IP: " + ipaddress + " / port: " + port;
        io.sockets.emit('infoServer', infosServer);        

        // Affichages de contrôle coté serveur:
        // nbUsers = common.lenghtObject(users);
        console.log ("-------------------------------");
   		console.log("Nouvel users:"+ socket.pseudo + "(ID : " + socket.id + ")");  
		console.log ("Nbre d'Users: " + nbUsers);
		console.log ("liste des Users: ->");
		console.log (users);
        
        console.log ("-------------------------------");
        console.log ("Nbre d'Users' ds l'historique: "+ socket.placeListe);
        console.log ("Historique des connexions: ->");
        console.log (histoUsers);
    });

    
  	// Quand un user se déconnecte 
    socket.on('disconnect', function(){  
        
		console.log ("-------------------------------");
		var message = "Déconnexion client : ("+socket.placeListe+") "+ socket.pseudo;
		console.log(message + "( ID : " + socket.id + ")");
        socket.broadcast.emit('message', { pseudo:"SERVER", message: message, placeListe: "-"});
        // On prévient tout le monde,
        // on retire le connecté de la liste des utilsateurs
        // et on actualise le nombre de connectés  
        delete users[socket.id]; 
        nbUsers = common.lenghtObject(users)

        // contrôle liste connectés coté serveur
		console.log (users);
		
        console.log ("Il reste " + nbUsers + " connectés");
        // TODO: Mise à jour de la liste coté client...

        // io.sockets.emit('users', users);           
        // socket.leave(socket.room);  /: On quitte la Room
    });  


    // Transmission de messages générique
    socket.on('message', function (message) {
        if (message){
	        message = ent.encode(message); // On vire les caractères html...
	        socket.broadcast.emit('message', {pseudo: socket.pseudo, message: message, placeListe: socket.placeListe});
    	}
        console.log ("@ message from "+socket.placeListe+socket.pseudo+ ": "+ message);
    }); 

    socket.on('signaling', function (message) {
        //console.log ("@ signaling from "+socket.placeListe+socket.pseudo);
        console.log ("@ signaling...");
        socket.broadcast.emit('signaling', message);
    }); 


    // ----------------------------------------------------------------------------------
    // Partie 'signaling'. Ces messages transitent par websocket 
    // mais n'ont pas vocation à s'afficher dans le tchat...
    
    // Quand est balancé un message 'candidate'
    // il est relayé à tous les autres connectés sauf à celui qui l'a envoyé
    socket.on('candidate', function (message) {
        // console.log ("@ candidate from "+socket.placeListe+socket.pseudo)
        socket.broadcast.emit('candidate', {pseudo: socket.pseudo, message: message, placeListe: socket.placeListe});
    }); 

    // Quand est balancé un message 'offer'
    // il est relayé à tous les autres connectés sauf à celui qui l'a envoyé
    socket.on('offer', function (message) {
        console.log ("@ offer from "+socket.placeListe+socket.pseudo);
        socket.broadcast.emit('offer', {pseudo: socket.pseudo, message: message, placeListe: socket.placeListe});
    }); 

    // Quand est balancé un message 'answer'
    // il est relayé à tous les autres connectés sauf à celui qui l'a envoyé
    socket.on('answer', function (message) {
    	console.log ("@ answer from "+socket.placeListe+socket.pseudo);
        socket.broadcast.emit('answer', {pseudo: socket.pseudo, message: message, placeListe: socket.placeListe});
    }); 



});
