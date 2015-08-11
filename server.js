// ------------------------ Elements communs client/serveur
var common = require('./js/common'); // méthodes génériques & objets
var settings = require('./js/settings'); // paramètres de configuration
var devSettings = require('./js/devSettings'); // Nom de la branche gitHub

// ------ Variables d'environnement & paramètrages serveurs ------------------
// Récupération du Nom de la machine 
var os = require("os");
hostName = os.hostname();

ipaddress = process.env.OPENSHIFT_NODEJS_IP || process.env.IP || "127.0.0.1"; // défaut
if (hostName == "azkary") ipaddress = "127.0.0.1"; // machine bureau
else if (hostName == "ubuntu64azkar") ipaddress = "192.168.1.10"; // Vm_umbutu_dom
else if (hostName == "VM-AZKAR-Ubuntu") ipaddress = "134.59.130.141"; // Vm_sparks
else if (hostName == "thaby") ipaddress = "192.168.173.1"; // robulab_wifi

port = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 2000;



console.log("***********************************");
console.log('');
console.log('(' + devSettings.appBranch() + ') ' + settings.appName() + " V " + settings.appVersion());
console.log('');
console.log("***********************************");
var hostMsg = "Serveur NodeJs hébergé ";
if (process.env.OPENSHIFT_NODEJS_IP) hostMsg += "sur OpenShift";
else if (process.env.IP) hostMsg += "sur ???";
else hostMsg += "en Local";
hostMsg += (" (hostName: " + hostName + ")");
console.log(hostMsg);


var app = require('express')(),
    // server = require('http').createServer(app),
    server = require('http').createServer(app),
    //server = require('https').createServer(app),
    io = require('socket.io').listen(server),
    ent = require('ent'), // Permet de bloquer les caractères HTML (sécurité équivalente à htmlentities en PHP)
    fs = require('fs');

var express = require('express');

// Ajouts Michael
var bodyParser = require("body-parser"); // pour recuperer le contenu de requêtes POST 
var HttpStatus = require('http-status-codes'); // le module qui recupère les status des requêtes HTTP
var XMLHttpRequest = require('xhr2'); // pour faire des requêtes XMLHttpRequest
var Q = require('q');

// affectation du port
app.set('port', port);

// Pour que nodejs puisse servir correctement 
// les dépendances css du document html
app.use(express.static(__dirname));

// Appel à body-parser pour la gestion de requêtes POST
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json()); // support json encoded bodies

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


// Lancement du serveur
server.listen(app.get('port'), ipaddress);


// ------ Partie Websocket ------------------

// Adresse de redirection pour les connexions refusées
var indexUrl;
if (process.env.OPENSHIFT_NODEJS_IP) indexUrl = "http://websocket-azkar.rhcloud.com";
else indexUrl = "http://" + ipaddress + ":" + port;


// liste des clients connectés
var users2 = {};
var nbUsers2 = 0;

// Historique des connexions
var histoUsers2 = {};
var placeHisto2 = 0;
histoPosition2 = 0;


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
            var isOtherBot = common.searchInObjects(users2, "typeClient", "Robot", "boolean");
            if (isOtherBot == true) {
                isAuthorized = false;
                authMessage = "Robot déjà connecté...\n Veuillez attendre votre tour.";
                rReason = " > Because 2 Robots";
            }

        } else if (data.typeUser == "Pilote") {
            var isOneBot = common.searchInObjects(users2, "typeClient", "Robot", "boolean");
            if (isOneBot == false) {
                isAuthorized = false;
                authMessage = "Robot non connecté... \n Ressayez plus tard.";
                rReason = " > Because no robot";
            } else if (isOtherPilot == true) {
                // Teste la présence d'un pilote dans la liste des clients connectés
                var isOtherPilot = common.searchInObjects(users2, "typeClient", "Pilote", "boolean");
                isAuthorized = false;
                authMessage = "Pilote déjà connecté... \n Veuillez attendre votre tour.";
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
            // ...
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
        var userPlacelist = common.lenghtObject(histoUsers2);
        // On crée un User - Fonction de référence ds la librairie common:
        // exports.client = function client (id,pseudo,placeliste,typeClient,connectionDate,disConnectionDate){
        var p1 = socket.id;
        var p2 = ent.encode(data.pseudo);
        var p3 = userPlacelist;
        var p4 = data.typeUser;
        var p5 = Date.now();
        var p6 = null;
        var objUser = new common.client(p1, p2, p3, p4, p5, p6);

        // On ajoute l'User à la liste des connectés
        users2[socket.id] = objUser;

        // On renvoie l'User crée au nouveau connecté
        // pour l'informer entre autre de son ordre d'arrivée ds la session
        io.to(socket.id).emit('position_liste2', objUser);

        // 2 - on signale à tout le monde l'arrivée de l'User
        socket.broadcast.emit('nouveau_client2', objUser);


        // 3 - on met a jour le nombre de connectés coté client"
        nbUsers2 = common.lenghtObject(users2);
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
        nbUsers = common.lenghtObject(users2)

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

    // A la réception d'un ordre de commande
    socket.on('moveOrder', function(data) {
        // TODO >>> implémenter tests sur data.command pour apeller le traitement isoine ( onDrive, onStop, onStep, onGoto, onClicAndGo, etc...)
        console.log("@ moveOrder >>>> " + data.command);
        // ex: >> socket.emit("moveOrder",{ command:'Move', aSpeed:aSpeed, lSpeed:lSpeed, Enable:btHommeMort });
        onDrive(data.enable, data.aSpeed, data.lSpeed) //
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
        socket.broadcast.emit('selectedRemoteDevices', {
            objUser: data.objUser,
            listeDevices: data.listeDevices,
            settings: data.settings
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

// ------------ Fonctions Commande de déplacement par websocket ( Partie Michael)------------

// interfaces de lancement des fonctions d'envoi de commandes
function onStop(parameters) {
    console.log('todo...');
};

function onStep(parameters) {
    console.log('todo...');
};

function onGoto(parameters) {
    console.log('todo...');
};

function onClicAndGo(parameters) {
    console.log('todo...');
};
/**/
// Interfaces de lancement de la commande senDriveOrder 
function onDrive(enable, aSpeed, lSpeed) {
    var url = 'http://localhost:50000/api/drive';
    sendDrive(url, enable, aSpeed, lSpeed)
        .then(function() {
            console.log('@onMoveOrder >> angular speed :' + aSpeed + '  et linear speed :' + lSpeed);
        })
}


// fonctions d'envois de commandes
function sendStop(url) {
    console.log('todo...');
};

function sendStep(url) {
    console.log('todo...');
};

function sendGoto(url) {
    console.log('todo...');
};

function sendClicAndGo(url) {
    console.log('todo...');
};
/**/
// Envoi d'une commande de type "Drive" au robot avec une "promize"
function sendDrive(url, enable, aSpeed,lSpeed) {
    var btnA = (enable == 'true' ? true : false); //  
    return Q.Promise(function(resolve, reject, notify) {

        var xmlhttp = new XMLHttpRequest(); // new HttpRequest instance 

        xmlhttp.open("POST", url);
        xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

        xmlhttp.onload = onload;
        xmlhttp.onerror = onerror;
        xmlhttp.onprogress = onprogress;

        xmlhttp.send(JSON.stringify({
            "Enable": btnA,
            "TargetAngularSpeed": aSpeed,
            "TargetLinearSpeed": lSpeed
        }));

        function onload() {
            if (xmlhttp.status === 200) {
                resolve(xmlhttp.responseText);
            } else {
                reject(new Error("Status code was " + xmlhttp.status));
            }
        }

        function onerror() {
            reject(new Error("Can't XHR " + JSON.stringify(url)));
        }

        function onprogress(event) {
            notify(event.loaded / event.total);
        }

    })
}


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
