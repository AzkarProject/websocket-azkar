

// Elements communs client/serveur
var common = require('./js/common'); // méthodes génériques et objets
var settings = require('./js/settings'); // parametres de configuration
var request = require('request');
var bodyParser = require("body-parser"); // pour recuperer le contenu de requetes POST 
var HttpStatus = require('http-status-codes'); // le module qui recupère les status des requetes HTTP
var Q = require('Q');
var httpProxy = require('http-proxy');

// contrôle chargement coté serveur
var commonTest = common.test();
console.log(commonTest + " correctement chargé coté serveur !!!");

var app = require('express')(),
    server = require('http').createServer(app),
    //server = require('https').createServer(app),
    io = require('socket.io').listen(server),
    ent = require('ent'), // Permet de bloquer les caractères HTML (sécurité équivalente à htmlentities en PHP)
    fs = require('fs');

// variables d'environnement en variables globale pour les passer à la méthode websocket
ipaddress = process.env.OPENSHIFT_NODEJS_IP || process.env.IP || "127.0.0.1";
// ipaddress = process.env.OPENSHIFT_NODEJS_IP || process.env.IP ||"192.168.173.1";
port = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 2000;

// affectation du port
app.set('port', port);

// Pour que nodejs puisse servir correctement 
// les dépendances css du document html
var express = require('express');
app.use(express.static(__dirname));


var bodyParser = require("body-parser"); // pour recuperer le contenu de requetes POST
//Utiliser body-parser pour la gestion de requete POST
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json()); // support json encoded bodies

// Chargement de la page index.html
app.get('/', function(req, res, next ) {
    res.sendFile(__dirname + '/index.html');
});


// Routing IHM >>>> TODO coté clients
app.get('/pilote/', function(req, res, next) {
    res.sendFile(__dirname + '/pilote.html');
});

app.get('/robot/', function(req, res, next) {
    res.sendFile(__dirname + '/robot.html');
});

app.get('/cartographie/', function(req, res , next) {
    res.sendFile(__dirname + '/cartographie.html');
});


app.get('/visiteur/', function(req, res , next) {
    res.sendFile(__dirname + '/visiteur.html');
});

//pour faire des requettes XMLHttpRequest
var XMLHttpRequest = require('xhr2');

/*******************envoi de commande de deplacement en differential drive*********************/

//flag moveOder en cours  
var flagDrive = false; //Par défaut a false , à la reception de moveOrder ==> True 

function onMoveOrder(enable, aSpeed, lSpeed) {
    /*

        var btnA;
        var aSpeedMov = Math.round(aSpeed * 100) / 1000;
        //var aSpeedMov = Math.round(aSpeed*100)/500;
        // var aSpeedMov = aSpeed;
        // var lSpeed = Math.round(lSpeed*100)/1000;


        if (enable == 'true') {
            btnA = true;

        } else {
            btnA = false;
        }

        var url = 'http://localhost:50000/api/drive';
        var xmlhttp = new XMLHttpRequest(); // new HttpRequest instance 
        xmlhttp.open("POST", url);
        xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xmlhttp.send(JSON.stringify({
            "Enable": btnA,
            "TargetAngularSpeed": aSpeedMov,
            "TargetLinearSpeed": lSpeed
        }));
        console.log('@onMoveOrder >> angular spped :' + aSpeedMov + '  et linear speed :' + lSpeed);
        //res.end();*/

    var url = 'http://localhost:50000/api/drive';

    sendMove(url, enable, aSpeed, lSpeed)
        .then(function() {
            console.log('dans le then  ');
            console.log('@onMoveOrder >> angular speed :' + aSpeedMov + '  et linear speed :' + lSpeed);
        })

}


function sendMove(url, enable, aSpeed, lSpeed) {

    //var aSpeedMov = Math.round(aSpeed * 100) / 1000;
    var aSpeedMov = aSpeed;
    var btnA = (enable == 'true' ? true : false); //  

    /* if (enable == 'true') {
         btnA = true;
     } else {
         btnA = false;
     }*/


    return Q.Promise(function(resolve, reject, notify) {

        var xmlhttp = new XMLHttpRequest(); // new HttpRequest instance 

        xmlhttp.open("POST", url);
        xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

        xmlhttp.onload = onload;
        xmlhttp.onerror = onerror;
        xmlhttp.onprogress = onprogress;

        xmlhttp.send(JSON.stringify({
            "Enable": btnA,
            "TargetAngularSpeed": aSpeedMov,
            "TargetLinearSpeed": lSpeed
        }));

        function onload() {
            if (xmlhttp.status === 200) {
                resolve(xmlhttp.responseText);
                // console.log('dans  le onload du send move ');
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

/***/
/*******Gestion de la cartographie *******************/


/*mise en place d'un proxy */

var httpProxy = require('http-proxy');
// Error example
//
// Http Proxy Server with bad target
//
var proxy = httpProxy.createServer({
    target: 'http://localhost:50000'
});

proxy.listen(2000);

//
// Listen for the `error` event on `proxy`.
proxy.on('error', function(err, req, res) {
    res.writeHead(500, {
        'Content-Type': 'text/plain'
    });

    res.end('Something went wrong. And we are reporting a custom error message.');
});

//
// Listen for the `proxyRes` event on `proxy`.
//
proxy.on('proxyRes', function(proxyRes, req, res) {
    console.log('RAW Response from the target', JSON.stringify(proxyRes.headers, true, 2));
});

//
// Listen for the `open` event on `proxy`.
//
proxy.on('open', function(proxySocket) {
    // listen for messages coming FROM the target here
    proxySocket.on('data', hybiParseAndLogMessage);
});

//
// Listen for the `close` event on `proxy`.
//
proxy.on('close', function(req, socket, head) {
    // view disconnected websocket connections
    console.log('Client disconnected');
});



/****************************/

function onAfficherCarto() {

    var xmlhttp = new XMLHttpRequest(); // new HttpRequest instance 
    var url = 'http://localhost:50000/nav/maps/map';
    xmlhttp.open("GET", url);
    xmlhttp.send();
    if (xmlhttp.status == 200) {
        console.log("requette bien envoyee  : " +
            xmlhttp.responseText);

    }

    console.log("apres l'envoi du GET ! ");


}


/*********************************************/

var http = require('http'),
    https = require('https'),
    URL = require('url');

var request = function(name, url, proxy) {
    // options
    var options = URL.parse(url, false);
    // headers
    options.headers = {
        accept: '*/*',
        'content-length': 0
    };
    var body = '';
    // proxy set
    if (proxy) {
        var proxy = URL.parse(proxy, false);
        options.path = options.protocol + '//' + options.host + options.path;
        options.headers.host = options.host;
        options.protocol = proxy.protocol;
        options.host = proxy.host;
        options.port = proxy.port;
    }
    console.log(name, 'request options:', options);

    var r = (options.protocol == 'http:' ? http : https).request(options, function(res) {
        res.on('end', function() {
            // just print ip, instead of whole body
            console.log(name, body.match(/check_ip" value="([^"]*)"/)[1]);
            // console.log(name, body);
        });
        res.on('readable', function() {
            body += this.read().toString();
        });
    });
    r.end();
};





/*********************************************/


























app.get('/tourne/', function(req, res) {

    /*
    var TargetAngularSpeed = 0.1;
    var TargetLinearSpeed = 0;
    var url = 'http://localhost:50000/api/drive';
    var xmlhttp = new XMLHttpRequest(); // new HttpRequest instance 
    xmlhttp.open("POST", url);
    xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xmlhttp.send(JSON.stringify({
        "Enable": true,
        "TargetAngularSpeed": TargetAngularSpeed,
        "TargetLinearSpeed": TargetLinearSpeed
    }));
    console.log('héhé je tourne  !! apres lenvoi de la requete POST');
    res.end();
    /**/



});

app.get('/arretteTourne/', function(req, res) {

    var TargetAngularSpeed = 0;
    var TargetLinearSpeed = 0;
    var url = 'http://192.168.1.72:50000/api/drive';
    // var url = 'http://localhost:50000/api/drive'; //192.168.1.72:50000 avec le wifi du robot localhost:50000 en local
    var xmlhttp = new XMLHttpRequest(); // new HttpRequest instance 
    xmlhttp.open("POST", url);
    xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xmlhttp.send(JSON.stringify({
        "Enable": true,
        "TargetAngularSpeed": TargetAngularSpeed,
        "TargetLinearSpeed": TargetLinearSpeed
    }));
    res.end();
});

/****************************************************************************************************/
/*******************envoi de requetes POST pour les mouvements du robot***********************************/

// Routing Envoi de requetes POST pour la partie des commande STEP pg 40 - 45 RobuBox et voir page 70 --> Translate , relative , absolute , stop 
/*
app.post('/lokarria/step/translate', function(req, res) {
    var x = req.body.X;
    var y = req.body.Y;

    console.log('héhé je veux me deplacer ');
    res.send('héhé je veux me deplacer de : [ x ' + x + ' , y : ' + y + ' ]');
    res.end();
});

app.post('/lokarria/step/relative', function(req, res) {
    var distance = req.body.distance;
    var maxSpeed = req.body.maxSpeed;

    console.log('héhé je veux faire une rotation relative ');
    res.send(' je me suis tourné dune rotation relative de  ' + distance + ' rad  avec une vitesse de : ' + maxSpeed + ' rad/s');
    res.end();
});

app.post('/lokarria/step/absolute', function(req, res) {
    var distance = req.body.distance;
    var maxSpeed = req.body.maxSpeed;

    console.log('héhé je veux faire une rotation absolue ');
    res.send(' je me suis tourné dune rotation absolue de  ' + distance + ' rad  avec une vitesse de : ' + maxSpeed + 'rad/s');
    res.end();
});

app.post('/lokarria/step/stop', function(req, res) {
    console.log('héhé je veux me stopper ');
    res.send('requette post reçue pour me stopper et le http status : ' + HttpStatus.OK);
    res.end();
});
/**/
/******************************************************/

// Lancement du serveur
server.listen(app.get('port'), ipaddress);

// Pour débugg : Contrôle de la version de socket.io
var ioVersion = require('socket.io/package').version;
var expressVersion = require('express/package').version;
// On affiche ces éléments coté serveur
console.log("**Socket.IO Version: " + ioVersion);
console.log("**Express Version: " + expressVersion);
console.log("**ipAdress = " + ipaddress);
console.log("**port = " + port);
console.log("***********************************");
console.log("     " + settings.appName() + " V " + settings.appVersion());


var indexUrl = "http://" + ipaddress + ":" + port;


/*// liste des clients
var users = {};
var nbUsers = 0;

// Historique des connexions
var histoUsers = {};
var placeHisto = 0;
histoPosition = 0;
/**/

// --- idem mais pour la version Objet

// liste des clients
var users2 = {};
var nbUsers2 = 0;

// Historique des connexions
var histoUsers2 = {};
var placeHisto2 = 0;
histoPosition2 = 0;


// contrôle des connectés coté serveur
// Ecouteur de connexion d'un nouveau client
function onSocketConnected(socket) {
    console.log("-------------------------------");
    console.log("connexion nouveau client :" + socket.pseudo + "(ID : " + socket.id + ")");
    //var infoServer = appName + " V " + appVersion;
    //io.to(socket.id).emit('infoServer', infoServer);
}


var debugNbOffer = 0;


/*// Pour le contrôle d'accès:
// Selon Hugo: Deprecated
io.set('authorization', function (handshakeData, callback) {
  // make sure the handshake data looks good
  callback('not authorized', false); // error first, 'authorized' boolean second 
});
/**/

/*// Autre version, non dépréciée
io.use(function(socket, next) {
  // .. traitement a faire... 
  var isAuthorised = false;
  if (isAuthorised == false) {
    next(new Error('not authorized'));
    return;
  }
  next();
});
//**/



io.sockets.on('connection', function(socket, pseudo) {


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

        /*
        var isAuthorized = true;
        var authMessage;
        if (data.typeUser == "Robot") {

            // Teste la présence d'un robot dans la liste des clients connectés
            // Paramètres: (hashTable,attribute,value,typeReturn) typeReturn >> boolean ou count...
            var isOtherBot = common.searchInObjects(users2, "typeClient", "Robot", "boolean");
            if (isOtherBot == true) {
                isAuthorized = false;
                authMessage = "Un Robot est déjà connecté...";
                console.log("++++++++++++REJECT++++++++++++ >> Is Robot");
            }

        } else if (data.typeUser == "Pilote") {
            var isOneBot = common.searchInObjects(users2, "typeClient", "Robot", "boolean");
            if (isOneBot == false) {
                isAuthorized = false;
                authMessage = "Pas de robot connecté...";
                console.log("++++++++++++REJECT++++++++++++ Pilot >> No Robot");
            } else if (isOtherPilot == true) {
                // Teste la présence d'un pilote dans la liste des clients connectés
                var isOtherPilot = common.searchInObjects(users2, "typeClient", "Pilote", "boolean");
                isAuthorized = false;
                authMessage = "Un Pilote est déjà connecté...";
                console.log("++++++++++++REJECT++++++++++++ >> Is Pilot");
            }



        } else if (data.typeUser == "Visiteur") {
            console.log("++++++++++++REJECT++++++++++++ >> Is Visitor");

        }

        if (isAuthorized == false) {
            io.to(socket.id).emit('rejectConnexion', {
                message: authMessage,
                url: indexUrl
            });
            return;
        }
        /**/


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

        // 4 - on met à jour la liste des connectés cotés clients
        // ... TODO... EST-ce bien nécéssaire ????
        // exports.searchInObjects = function (hashTable,attribute,value,typeReturn){

        // contrôle fontion tests de tableau d'objet coté serveur
        //var commonTest2 = common.searchInObjects(users2,"typeClient","Robot","boolean");
        //console.log("commonTest2 >>> " + commonTest2 + " >>> true = robot - false = pilote");

    });

    // Quand un user se déconnecte (V2)
    socket.on('disconnect', function() {

        var dUser = users2[socket.id];


        //console.log ("-------------------------------");
        var message = "Vient de se déconnecter !";
        // console.log(message + "( ID : " + socket.id + ")");

        // on retire le connecté de la liste des utilisateurs
        delete users2[socket.id];
        socket.broadcast.emit('disconnected', {
            listUsers: users2
        });
        //socket.broadcast.emit('disconnected', "WTF");
        // On prévient tout le monde
        socket.broadcast.emit('message2', {
            objUser: dUser,
            message: message
        });

        // on retire le connecté de la liste des utilsateurs
        // et on actualise le nombre de connectés  
        // delete users2[socket.id]; 
        nbUsers = common.lenghtObject(users2)

        // contrôle liste connectés coté serveur
        console.log(users2);

        console.log("Il reste " + nbUsers + " connectés");
        // TODO: Mise à jour de la liste coté client...

        // io.sockets.emit('users', users);           
        // socket.leave(socket.room);  /: On quitte la Room

        // envoi d'un second message destiné au signaling WebRTC
        // socket.broadcast.emit('disconnected', { pseudo:"SERVER", message: message, placeListe: "-"});
        // socket.broadcast.emit('disconnected', {listUsers: users2});
    });

    // Transmission de messages générique V2 objet
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


    // Transmission de commande générique V2 objet
    socket.on('moveOrder', function(data) {

        console.log("@ moveOrder >>>> " + data.command + "[ vitesse angulaire : " + data.aSpeed + " | vitesse linéaire : " + data.lSpeed + " ]");
        onMoveOrder(data.enable, data.aSpeed, data.lSpeed)
            //  socket.emit("moveOrder",{ command:'Move', aSpeed:aSpeed, lSpeed:lSpeed, Enable:btHommeMort });
        if (data.command == 'Move') {
            //memoriser le dernier timeStamp
            flagDrive = true;
        } else if (data.command == 'Stop') {
            flagDrive = false;
        }
    });

    // cartographie 
    socket.on('afficheCarto', function(data) {

        console.log("@ afficherCarto  >>>> " + data.message);
        onAfficherCarto();
        socket.broadcast.emit("afficheCarto", data);

    });



    // ----------------------------------------------------------------------------------
    // Partie 'signaling'. Ces messages transitent par websocket 
    // mais n'ont pas vocation à s'afficher dans le tchat client...

    socket.on('signaling', function(message) {
        //console.log ("@ signaling from "+socket.placeListe+socket.pseudo);
        console.log("@ signaling...");
        socket.broadcast.emit('signaling', message);
    });

    // Quand est balancé un message 'candidate'
    // il est relayé à tous les autres connectés sauf à celui qui l'a envoyé
    socket.on('candidate', function(message) {
        // console.log ("@ candidate from "+socket.placeListe+socket.pseudo+" timestamp:" + Date.now());
        // socket.broadcast.emit('candidate', {pseudo: socket.pseudo, message: message, placeListe: socket.placeListe});
        socket.broadcast.emit('candidate', {
            message: message
        });
    });

    // Quand est balancé un message 'offer'
    // il est relayé à tous les autres connectés sauf à celui qui l'a envoyé
    socket.on('offer', function(message) {
        socket.broadcast.emit('offer', {
            message: message
        });
    });

    // Quand est balancé un message 'answer'
    // il est relayé à tous les autres connectés sauf à celui qui l'a envoyé
    socket.on('answer', function(message) {
        socket.broadcast.emit('answer', {
            message: message
        });
    });

    // ----------------------------------------------------------------------------------
    // Phase pré-signaling ( selections caméras et micros du robot par l'IHM pilote)

    // Robot >> Pilote: Offre des cams/micros disponibles coté robot
    socket.on('remoteListDevices', function(data) {
        socket.broadcast.emit('remoteListDevices', {
            objUser: data.objUser,
            listeDevices: data.listeDevices
        });
        /*// Contrôle >>
        var place = data.objUser.placeliste;
        var login = data.objUser.pseudo;
        var role = data.objUser.typeClient;
        console.log ("@ remoteListDevices from: "+place+"-"+login+" ("+role+") timestamp:" + Date.now());
        console.log(data.objUser);
        console.log(data.listeDevices);
        /**/
    });


    // Pilote >> Robot: cams/micros sélectionnés par le Pilote
    socket.on('selectedRemoteDevices', function(data) {
        socket.broadcast.emit('selectedRemoteDevices', {
            objUser: data.objUser,
            listeDevices: data.listeDevices
        });
        /*// Contrôle >>
        var place = data.objUser.placeliste;
        var login = data.objUser.pseudo;
        var role = data.objUser.typeUser;
        console.log ("@ selectedRemoteDevices from: "+place+"-"+login+" ("+role+") timestamp:" + Date.now());
        console.log(data);
        /**/
    });

    // Robot >> Pilote: Signal de fin pré-signaling...
    socket.on('readyForSignaling', function(data) {
        socket.broadcast.emit('readyForSignaling', {
            objUser: data.objUser,
            message: data.message
        });
    });
});
