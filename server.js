// Méthodes communes client/serveur
var common = require('./js/common');
// contrôle chargement 
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

app.set('port', port); // Pour Openshift

// Pour que nodejs puisse servir correctement 
// les dépendances css du document html
var express = require('express');
app.use(express.static(__dirname));

// Chargement de la page index.html
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

// Lancement du serveur
server.listen(app.get('port'),ipaddress);

// Contrôle de la version de socket.io
var ioVersion = require('socket.io/package').version;
var expressVersion = require('express/package').version;
// On affiche ces éléments coté serveur
console.log("**Socket.IO Version: " + ioVersion);
console.log("**Express Version: " + expressVersion);
console.log("**ipAdress = " + ipaddress );
console.log("**port = " + port );


// liste des clients
var clients = {};
var nbClients = 0;
// Historique des connexions
var histoClients = {};
var placeHisto = 0;

// contrôle des connectés coté serveur
function onSocketConnected(socket){
   console.log ("-------------------------------");
   console.log("connexion nouveau client :"+ socket.pseudo + "( ID : " + socket.id + ")");  
}

io.sockets.on('connection', function (socket, pseudo) {
    
    // Dès qu'on nous donne un pseudo, 
    // on le stocke en variable de session et on informe les autres personnes
    socket.on('nouveau_client', function(pseudo) {
        


        // On affecte au nouveau client le pseudo qu'il à renseigné
        pseudo = ent.encode(pseudo);
        socket.pseudo = pseudo;


        // On ajoute le client a la liste des connectés
        clients[pseudo] = pseudo;

        // On lui attribue un numéro correspondant a sa position d'arrivée dans la session 
        // var placeListe = lastPosition +1; // WTF LastPosition ne s'incrémente pas... C'st quoi ce bordel ????
        // var placeListe = nbClients +1; // Par contre là ca marche !!!! PKOI ?????????????N??????
        // var placeListe = getLastPosition(); // Et en passant pas une fonction ??? >>>> QUEUE DALLE !!!!!!!!!!!!!
        // Plan B: On passe par un objet contenant tous les clients connectés avec l'historique...
        // Et on comptera le nombre de propriétés
        histoClients[socket.id] = pseudo + " at " + Date.now();
        console.log ("-------------------------------");
        socket.placeListe = common.lenghtObject(histoClients);
        console.log ("Nbre de client ds l'historique: "+ socket.placeListe);
        console.log (histoClients);
        // On lui renvoie a lui et a lui seul son ordre d'arrivée ds la session
        // Pour qu'il l'ajoute a son pseudo affiché par exemple
        io.to(socket.id).emit('position_liste', socket.placeListe);



        //socket.broadcast.emit('nouveau_client', pseudo);
        socket.broadcast.emit('nouveau_client', {pseudo: socket.pseudo, placeListe: socket.placeListe});


        // On en profite pour envoyer des variables d'environnement serveur 
        // aux parties clientes pour affichage et débug.
        infosServer = "Socket.IO: " + ioVersion + " / Express: " + expressVersion + " / IP: " + ipaddress + " / port: " + port;
        io.sockets.emit('infoServer', infosServer);
        // on affiche l'ID du nouveau client pour contrôle coté serveur
        onSocketConnected(socket)
        console.log (clients);
        nbClients = common.lenghtObject(clients);
        console.log ("Il y a maintenant" + nbClients + " connectés");
    });

    
    // when the user disconnects.. perform this  
    socket.on('disconnect', function(){  
        
		console.log ("-------------------------------");
		var message = "Déconnexion client : ("+socket.placeListe+") "+ socket.pseudo;
		console.log(message + "( ID : " + socket.id + ")");
        socket.broadcast.emit('message', { pseudo:"SERVER", message: message, placeListe: "-"});
        // On prévient tout le monde,
        // on retire le connecté de la liste des utilsateurs
        // et on actualise le nombre de connectés  
        delete clients[socket.pseudo]; 
        nbClients = common.lenghtObject(clients)

        // contrôle conté serveur de la liste
		console.log (clients);
		
        console.log ("Il reste " + nbClients + " connectés");
        // Mise a jour de la liste conté client...  
        // io.sockets.emit('clients', clients);           
        // socket.leave(socket.room);  /: On quitte la Room
    });  


    // Dès qu'on reçoit un message, on récupère le pseudo de son auteur
    // et on le transmet aux autres personnes
    socket.on('message', function (message) {
        if (message){
	        message = ent.encode(message);
	        socket.broadcast.emit('message', {pseudo: socket.pseudo, message: message, placeListe: socket.placeListe});
    	}
        //socket.emit('message', {pseudo: socket.pseudo, message: message});
    }); 

    // ----------------------------------------------------------------------------------
    // Et ici les messages de 'signaling'
    // Ils transitent par websocket mais n'ont pas vocation à s'afficher dans le tchat...
    
    // Quand est balancé un message 'candidate'
    // il est relayé a tous les autres connectés
    socket.on('candidate', function (message) {
        // message = ent.encode(message); // inutile de virer les caractères html
        // TODO: Verifier si 1toALL (io.sockets.emit) ou 1toOthers (socket.broadcast.emit)
        socket.broadcast.emit('candidate', message);
    }); 

    // Quand est balancé un message 'offer'
    // il est relayé a tous les autres connectés
    socket.on('offer', function (message) {
        // message = ent.encode(message); // inutile de virer les caractères html
        // TODO: Verifier si 1toALL (io.sockets.emit) ou 1toOthers (socket.broadcast.emit)
       
        // socket.broadcast.emit('offer', message);
        socket.broadcast.emit('offer', {pseudo: socket.pseudo, message: message});
    }); 
	/**/



});
