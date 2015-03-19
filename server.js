var app = require('express')(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    ent = require('ent'), // Permet de bloquer les caractères HTML (sécurité équivalente à htmlentities en PHP)
    fs = require('fs');

// variables d'environnement en variables globale pour les passer à la méthode websocket
ipaddress = process.env.OPENSHIFT_NODEJS_IP || process.env.IP ||"127.0.0.1";
port      = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 8080;

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


io.sockets.on('connection', function (socket, pseudo) {
    
    // Dès qu'on nous donne un pseudo, 
    // on le stocke en variable de session et on informe les autres personnes
    socket.on('nouveau_client', function(pseudo) {
        pseudo = ent.encode(pseudo);
        socket.pseudo = pseudo;
        socket.broadcast.emit('nouveau_client', pseudo);
        // On en profite pour envoyer des variables d'environnement serveur 
        // aux parties clientes pour affichage et débug.
        // TODO: Ne les afficher que qd ils sont reçuts pour la première foi...
        infosServer = "Socket.IO: " + ioVersion + " / Express: " + expressVersion + " / IP: " + ipaddress + " / port: " + port;
        io.sockets.emit('infoServer', infosServer);
    });

    // Dès qu'on reçoit un message, on récupère le pseudo de son auteur
    // et on le transmet aux autres personnes
    socket.on('message', function (message) {
        message = ent.encode(message);
        socket.broadcast.emit('message', {pseudo: socket.pseudo, message: message});
    }); 

    // Et ici les messages de 'signaling' ( ou 'candidate', a voir comment les apeller)
    // Ces messages n'ont pas vocation a s'afficher coté client...
    socket.on('signaling', function (message) {
        //message = ent.encode(message); // inutile de virer les caractères html
        // TODO: Verifier si 1toALL (io.sockets.emit) ou 1toOthers (socket.broadcast.emit)
        socket.broadcast.emit('message', message);
    }); 




});
