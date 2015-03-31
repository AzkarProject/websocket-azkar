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

io.sockets.on('connection', function (socket, pseudo) {
    
    
	/*//Save User
	clients[socket.id] = {
		id:socket.id,
		ip: socket.manager.handshaken[socket.id].address.address,
		socket:socket	
	}
	
	
	//Add dispatchEvent to listeners
	socket.on( "dispatchEvent", function(data) {
		
		for( var i in clients ) {
			if( socket.id != i ) {
				clients[i].socket.emit( "onEvent", data );
			}
		}
	});
	
	
	socket.on( 'disconnect', function() {
		clients[socket.id] = undefined;
		delete clients[socket.id];
	});
	/**/





    // Dès qu'on nous donne un pseudo, 
    // on le stocke en variable de session et on informe les autres personnes
    socket.on('nouveau_client', function(pseudo) {
        pseudo = ent.encode(pseudo);
        socket.pseudo = pseudo;

        // add the client's username to the global list  
        clients[pseudo] = pseudo;


        socket.broadcast.emit('nouveau_client', pseudo);
        // On en profite pour envoyer des variables d'environnement serveur 
        // aux parties clientes pour affichage et débug.
        // TODO: Ne les afficher que qd ils sont reçuts pour la première foi...
        infosServer = "Socket.IO: " + ioVersion + " / Express: " + expressVersion + " / IP: " + ipaddress + " / port: " + port;
        io.sockets.emit('infoServer', infosServer);
        console.log ();

    });

    
    // when the user disconnects.. perform this  
    socket.on('disconnect', function(){  
        // remove the username from global usernames list  
        delete clients[socket.pseudo];  
        // update list of users in chat, client-side  
        io.sockets.emit('clients', clients);  
        // echo globally that this client has left  
        socket.broadcast.emit('message', 'SERVER', socket.pseudo + ' est déconnecté');  
        // socket.leave(socket.room);  /: On quitte la Room
    });  



    // Dès qu'on reçoit un message, on récupère le pseudo de son auteur
    // et on le transmet aux autres personnes
    socket.on('message', function (message) {
        message = ent.encode(message);
        socket.broadcast.emit('message', {pseudo: socket.pseudo, message: message});
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
