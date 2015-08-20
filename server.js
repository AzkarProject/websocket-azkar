// ------------------------ Elements communs client/serveur
var tools = require('./js/common_tools'); // méthodes génériques & objets
var settings = require('./js/common_settings'); // paramètres de configuration
//var devSettings = require('./js/common_devSettings'); // Nom de la branche gitHub
var robubox = require('./js/common_robubox'); // Fonctions de communication avec la Robubox


deathManTimeStamp = new Date().getTime(); // TimeStamp en variable globale pour implémenter une sécurité homme/mort...
console.log (deathManTimeStamp);

// ------ Variables d'environnement & paramètrages serveurs ------------------
// Récupération du Nom de la machine 
var os = require("os");
hostName = os.hostname();
dyDns = 'azkar.ddns.net'; // Adresse no-Ip pointant sur Livebox domicile

ipaddress = process.env.OPENSHIFT_NODEJS_IP || process.env.IP || "127.0.0.1"; // défaut
port = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 80; // défaut

// Machines windows
if (hostName == "azcary") {
	ipaddress = "localhost"; // Machine HP bureau >> localhost pour les scripts autoIt
	port = 2000 ; // idem, pour ne pas réecrire tous les scripts autoIt basés sur ce port et cette IP...
}
else if (hostName == "thaby") ipaddress = "192.168.173.1"; // Tablette HP sur Robulab: ip du réseau virtuel robulab_wifi
else if (hostName == "lapto_Asus") ipaddress = "0.0.0.0"; // Pc perso - (IP interne, Livebox domicile)

// Machines Ubuntu
else if (hostName == "ubuntu64azkar") ipaddress = "192.168.1.10"; // Vm Ubuntu sur Pc perso (Domicile)
else if (hostName == "azkar-Latitude-E4200") ipaddress = "0.0.0.0"; // Pc Dell Latitude - Livebox domicile - noip > azkar.ddns.net
else if (hostName == "VM-AZKAR-Ubuntu") ipaddress = "134.59.130.141"; // IP statique de la Vm sparks
 

// Seul le port 80 passe malgrès les règles appropriées dans le NAT et le Firewall de la livebox ...
// if (hostName == "azkar-Latitude-E4200") port = 80;
// TODO > Trouver bon réglage livebox pour faire cohabiter port 2000(nodejs) et 80(apache) en même temps.

console.log("***********************************");
console.log('');
console.log('(' + settings.appBranch() + ') ' + settings.appName() + " V " + settings.appVersion());
console.log('');
console.log("***********************************");
console.log("Serveur sur machine: " + hostName);


var app = require('express')(),
    server = require('http').createServer(app),
    //server = require('https').createServer(app),
    io = require('socket.io').listen(server),
    ent = require('ent'), // Permet de bloquer les caractères HTML (sécurité équivalente à htmlentities en PHP)
    fs = require('fs');

var express = require('express');

// affectation du port
app.set('port', port);

// Pour que nodejs puisse servir correctement 
// les dépendances css du document html
app.use(express.static(__dirname));

// ------------ routing ------------

// Chargement de la page index.html
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

// Routing IHM >>>> TODO coté clients
app.get('/pilote/', function(req, res) {
    res.sendFile(__dirname + '/pilote.html');
});

app.get('/robot/', function(req, res) {
    res.sendFile(__dirname + '/robot.html');
});

app.get('/visiteur/', function(req, res) {
    res.sendFile(__dirname + '/visiteur.html');
});

app.get('/cartographie/', function(req, res) {
    res.sendFile(__dirname + '/cartographie.html');
});

// On passe la variable hostName en ajax à l'ihm d'accueil
// puisqu'on ne peux pas passer par websocket...
// TODO >> Faire pareil avec Pilote et Robot pour économiser une requête ws...
// NB : Fait le 19/08
app.get("/getvar", function(req, res){
    res.json({ hostName: hostName });
});


// Lancement du serveur
server.listen(app.get('port'), ipaddress);


// ------ Partie Websocket ------------------

// Adresse de redirection pour les connexions refusées
var indexUrl;
indexUrl = "http://" + ipaddress + ":" + port; // Par défaut...
if (hostName == "azkar-Latitude-E4200") indexUrl = "http://" + dyDns; // Si machine derrière liveBox && noip


// liste des clients connectés
var users2 = {};
var nbUsers2 = 0;

// Historique des connexions
var histoUsers2 = {};
var placeHisto2 = 0;
histoPosition2 = 0;

// ID websockets pour les envois non broadcastés
wsIdPilote = '';
wsIdRobot = '';


io.on('connection', function(socket, pseudo) {

    onSocketConnected(socket);

    // Quand un User rentre un pseudo (version objet), 
    // on le stocke en variable de session et on informe les autres Users
    socket.on('nouveau_client2', function(data) {

        // Contrôle d'accès minimal (pour éviter les bugs...)
        // Si Pilote >> Si 0 Robot ou 1 Pilote déjà présents: Accès refusé
        // Si Robot >> Si 1 Robot déjà présent: Accès refusé
        // Si Visiteur >> Si 0 Robot ou 0 Pilote présents: Accès refusé
        // Comportement attendu du client après un refus d'accès:
        // >>> Redirection vers la page d'accueil de l'application
        // Contrainte: L'URL de la page d'accueil doit être dynamique 
        // donc le serveur websocket doit transmettre cette URL au client
        // pour forcer sa redirection.

        // 2 possibilités:
        // Soit contrôler la connexion en amont par un io.use(function...
        // et après traitement générer une erreur avec un message.
        // Mais dans ce cas de figure, ce serai trop compliqué 
        // de transmettre au client l'url de redirection en plus du message d'erreur
        // Autre solution, plus simple et plus bourrine:
        // Accepter la connexion, faire le traitement et renvoyer
        // au client un simple message websocket avec en paramètre l'ip de redirection. 
        // A sa réception, le client se redirige vers la nouvelle url, se déconnectant d'office. 

        // TODO: A régler Bug sur OpenShift:
        // >>>> Si déco/reco du robot, celui-ci n'est toujours compté parmis les connectés...

        var isAuthorized = true;
        var authMessage;
        var rMsg = "> Connexion Rejetée: ";
        var rReason;
        if (data.typeUser == "Robot") {

            // Teste la présence d'un robot dans la liste des clients connectés
            // Paramètres: (hashTable,attribute,value,typeReturn) typeReturn >> boolean ou count...
            var isOtherBot = tools.searchInObjects(users2, "typeClient", "Robot", "boolean");
            if (isOtherBot == true) {
                isAuthorized = false;
                authMessage = "Client Robot non disponible...\n Veuillez patienter.";
                rReason = " > Because 2 Robots";
            }

        } else if (data.typeUser == "Pilote") {
            var isOneBot = tools.searchInObjects(users2, "typeClient", "Robot", "boolean");
            if (isOneBot == false) {
                isAuthorized = false;
                authMessage = "Client Robot non connecté... \n Ressayez plus tard.";
                rReason = " > Because no robot";
            } else if (isOtherPilot == true) {
                // Teste la présence d'un pilote dans la liste des clients connectés
                var isOtherPilot = tools.searchInObjects(users2, "typeClient", "Pilote", "boolean");
                isAuthorized = false;
                authMessage = "Client Pilote non disponible...\n Veuillez patienter.";
                rReason = " > Because 2 Pilotes";
            }
        } else if (data.typeUser == "Visiteur") {
            // console.log ("++++++++++++REJECT++++++++++++ >> Is Visitor");
        }

        if (isAuthorized == false) {
            console.log(rMsg + "(ID: " + socket.id + ") " + rReason);
            io.to(socket.id).emit('rejectConnexion', {
                message: authMessage,
                url: indexUrl
            });
            return;
        } else {
            // Si tt est ok pour enregistrement ds la liste des connectés,
            // On renseigne la variable d'identité du pilote et du robot
            // pour les transferts de messages non broadcastés.
            if (data.typeUser == "Pilote") wsIdPilote = socket.id;
            if (data.typeUser == "Robot") wsIdRobot = socket.id;
        }



        // On lui attribue un numéro correspondant a sa position d'arrivée dans la session:
        // var placeListe = lastPosition +1; // WTF LastPosition ne s'incrémente pas... 
        // Même en modifiant la portée de la variable (placeliste déclaré sans "var" devant...)
        // var placeListe = nbUsers +1; // Par contre là ca marche ! PKOI ?
        // Il semblerai que seuls les objets soient persistants, pas les valeurs de types primitifs...
        // A creuser + tard (tester si c'est pareil avec un type "string" )....

        // Plan B: On passe par un objet contenant tous les users connectés
        // depuis le début de la session (comme une sorte de log, d'historique..)
        // et on comptera simplement le nombre de propriétés de l'objet.
        histoUsers2[socket.id] = data.pseudo + " timestamp:" + Date.now();
        var userPlacelist = tools.lenghtObject(histoUsers2);
        // On crée un User - Fonction de référence ds la librairie tools:
        // exports.client = function client (id,pseudo,placeliste,typeClient,connectionDate,disConnectionDate){
        var p1 = socket.id;
        var p2 = ent.encode(data.pseudo);
        var p3 = userPlacelist;
        var p4 = data.typeUser;
        var p5 = Date.now();
        var p6 = null;
        var objUser = new tools.client(p1, p2, p3, p4, p5, p6);

        // On ajoute l'User à la liste des connectés
        users2[socket.id] = objUser;

        // On renvoie l'User crée au nouveau connecté
        // pour l'informer entre autre de son ordre d'arrivée ds la session
        io.to(socket.id).emit('position_liste2', objUser);
        
        // On lui envoie aussi des infos concerant le serveur (pour débug)
		// io.to(socket.id).emit('infoServer', hostName);
		// NB > Obsolète.. >< Remplacé par une récupération directe 
		// depuis le client IHM en ajax par un $.get( "/getvar", function( data ) ) {}
		

        // 2 - on signale à tout le monde l'arrivée de l'User
        socket.broadcast.emit('nouveau_client2', objUser);


        // 3 - on met a jour le nombre de connectés coté client"
        nbUsers2 = tools.lenghtObject(users2);
        io.sockets.emit('updateUsers', {
            listUsers: users2
        });

        console.log("> Il y a " + nbUsers2 + " connectés");


        // 4 - on met à jour la liste des connectés cotés clients
        // ... TODO... EST-ce bien nécéssaire ????
        // exports.searchInObjects = function (hashTable,attribute,value,typeReturn){

        // contrôle fontion tests de tableau d'objet coté serveur
        //var commonTest2 = common.searchInObjects(users2,"typeClient","Robot","boolean");
        //console.log("commonTest2 >>> " + commonTest2 + " >>> true = robot - false = pilote");
    });

    // Quand un user se déconnecte
    socket.on('disconnect', function() {
        var dUser = users2[socket.id];

        //console.log ("-------------------------------");
        var message = "> Connexion sortante: ";
        console.log(message + "(ID: " + socket.id + ")");

        // on retire le connecté de la liste des utilisateurs
        delete users2[socket.id];
        socket.broadcast.emit('disconnected', {
            listUsers: users2
        });
        // On prévient tout le monde
        socket.broadcast.emit('message2', {
            objUser: dUser,
            message: message
        });
        // On actualise le nombre de connectés  
        nbUsers = tools.lenghtObject(users2)

        // contrôle liste connectés coté serveur
        // console.log (users2);

        console.log("> Il reste " + nbUsers + " connectés");
        // TODO: Mise à jour de la liste coté client...

        // io.sockets.emit('users', users);           
        // socket.leave(socket.room);  /: On quitte la Room

        // envoi d'un second message destiné au signaling WebRTC
        // socket.broadcast.emit('disconnected', { pseudo:"SERVER", message: message, placeListe: "-"});
        // socket.broadcast.emit('disconnected', {listUsers: users2});
    });
    /**/

    // Transmission de messages génériques 
    socket.on('message2', function(data) {
        console.log(data);
        if (data.message) {
            message = ent.encode(data.message); // On vire les caractères html...
            socket.broadcast.emit('message2', {
                objUser: data.objUser,
                message: message
            });
        }
        console.log("@ message2 from " + data.objUser.placeliste + "-" + data.objUser.pseudo + ": " + message);
    });


    // ---------------------------------------------------------------------------------
    // Partie commandes du robot par websocket (stop, moveDrive, moveSteps, goto & clicAndGo)

    // A la réception d'un ordre de commande en provenance du pilote
    // On le renvoie au client robot qui exécuté sur la même machine que la Robubox.
    // Il pourra ainsi faire un GET ou un POST de la commande à l'aide d'un proxy et éviter le Cross Origin 
    socket.on('piloteOrder', function(data) {
        // TODO >>> implémenter tests sur data.command pour apeller le traitement isoine ( onDrive, onStop, onStep, onGoto, onClicAndGo, etc...)
        console.log("@ piloteOrder >>>> " + data.command);
        // ex: >> socket.emit("moveOrder",{ command:'Move', aSpeed:aSpeed, lSpeed:lSpeed, Enable:btHommeMort });
        // onDrive(data.enable, data.aSpeed, data.lSpeed) //
        //io.to(wsIdRobot).emit('moveOrder', data);
        io.to(wsIdRobot).emit('piloteOrder', data);
    });

    // ----------------------------------------------------------------------------------
    // Partie 'signaling'. Ces messages transitent par websocket 
    // mais n'ont pas vocation à s'afficher dans le tchat client...
    // Cezs messages sont relayés à tous les autres connectés (sauf à celui qui l'a envoyé)

    socket.on('candidate', function(message) {
        socket.broadcast.emit('candidate', {
            message: message
        });
    });

    socket.on('offer', function(message) {
        socket.broadcast.emit('offer', {
            message: message
        });
    });

    socket.on('answer', function(message) {
        socket.broadcast.emit('answer', {
            message: message
        });
    });


    // ----------------------------------------------------------------------------------
    // Phase pré-signaling ( selections caméras et micros du robot par l'IHM pilote et status de la connexion WebRTC de chaque client)

    // Retransmission du statut de connexion WebRTC du pilote
    socket.on('piloteCnxStatus', function(message) {
        socket.broadcast.emit('piloteCnxStatus', {
            message: message
        });
    });

    // Retransmission du statut de connexion WebRTC du robot
    socket.on('robotCnxStatus', function(message) {
        socket.broadcast.emit('robotCnxStatus', {
            message: message
        });
    });

    // Robot >> Pilote: Offre des cams/micros disponibles coté robot
    socket.on('remoteListDevices', function(data) {
        socket.broadcast.emit('remoteListDevices', {
            objUser: data.objUser,
            listeDevices: data.listeDevices
        });
    });

    // Pilote >> Robot: cams/micros sélectionnés par le Pilote
    socket.on('selectedRemoteDevices', function(data) {
        console.log("@ selectedRemoteDevices >>>> ");
        console.log (data);
        socket.broadcast.emit('selectedRemoteDevices', {
            objUser: data.objUser,
            listeDevices: data.listeDevices,
            appSettings: data.appSettings
        });
    });

    // Robot >> Pilote: Signal de fin pré-signaling...
    socket.on('readyForSignaling', function(data) {
        socket.broadcast.emit('readyForSignaling', {
            objUser: data.objUser,
            message: data.message
        });
    });

});

// ------------ fonctions Diverses ------------

// Pour Contrôle des connectés coté serveur
// Ecouteur de connexion d'un nouveau client
function onSocketConnected(socket) {
    // console.log ("-------------------------------");
    console.log("> Connexion entrante: (ID: " + socket.id + ")");
    //var infoServer = appName + " V " + appVersion;
    //io.to(socket.id).emit('infoServer', infoServer);
}
/**/

// ----- Contrôles pour débuggage coté serveur

// Contrôle des versions node.modules (Pour debugg sur Openshift)
var ioVersion = require('socket.io/package').version;
var expressVersion = require('express/package').version;
var entVersion = require('ent/package').version;
//var fsVersion = require('express/package').version;
//var httpVersion = require('socket.io/package').version;
var bodyparserVersion = require('body-parser/package').version;
var HttpStatusVersion = require('http-status-codes/package').version;
var xhr2Version = require('xhr2/package').version;
var QVersion = require('q/package').version;

// Affichage de contrôle coté serveur
console.log("***********************************");
console.log("** Socket.IO Version: " + ioVersion);
console.log("** Express Version: " + expressVersion);
console.log("** Ent  Version: " + entVersion);
console.log("** Body-parser Version: " + bodyparserVersion);
console.log("** Http-status-codes Version: " + HttpStatusVersion);
console.log("** Xhr2 Version: " + xhr2Version);
console.log("** Q Version: " + QVersion);
console.log("***********************************");
console.log("** Adresse IP = " + ipaddress);
console.log("** N° de port = " + port);
console.log("***********************************");
