// Add pour 1-openshift 2-heroku 3-local
ipaddress = process.env.OPENSHIFT_NODEJS_IP || process.env.IP ||"127.0.0.1";
port      = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 8080;




var app = require('express')(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    ent = require('ent'), // Permet de bloquer les caractères HTML (sécurité équivalente à htmlentities en PHP)
    fs = require('fs');

// Variables d'environnement
// app.set('port', (process.env.PORT || 8080)); // Pour Heroku
app.set('port', port); // Pour Openshift



// Chargement de la page index.html
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});


// Titi - Contrôle de la version de socket.io
console.log("**Socket.IO Version: " + require('socket.io/package').version);
console.log("**Express Version: " + require('express/package').version);
console.log("**ipAdress = " + ipaddress );
console.log("**port = " + port );

io.sockets.on('connection', function (socket, pseudo) {
    // Dès qu'on nous donne un pseudo, on le stocke en variable de session et on informe les autres personnes
    socket.on('nouveau_client', function(pseudo) {
        pseudo = ent.encode(pseudo);
        socket.pseudo = pseudo;
        socket.broadcast.emit('nouveau_client', pseudo);
    });

    // Dès qu'on reçoit un message, on récupère le pseudo de son auteur et on le transmet aux autres personnes
    socket.on('message', function (message) {
        message = ent.encode(message);
        socket.broadcast.emit('message', {pseudo: socket.pseudo, message: message});
        // socket.broadcast.emit('message', "message");
    }); 
});

server.listen(app.get('port'),ipaddress);
