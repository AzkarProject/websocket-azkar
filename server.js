/*
*
* Copyright © CNRS (Laboratoire I3S) / université de Nice
* Contributeurs: Michel Buffa & Thierry Bergeron, 2015-2016
* 
* Ce logiciel est un programme informatique servant à piloter un Robot à distance
* Ce logiciel est régi par la licence CeCILL-C soumise au droit français et
* respectant les principes de diffusion des logiciels libres. Vous pouvez
* utiliser, modifier et/ou redistribuer ce programme sous les conditions
* de la licence CeCILL-C telle que diffusée par le CEA, le CNRS et l'INRIA 
* sur le site "http://www.cecill.info".
*
* En contrepartie de l'accessibilité au code source et des droits de copie,
* de modification et de redistribution accordés par cette licence, il n'est
* offert aux utilisateurs qu'une garantie limitée.  Pour les mêmes raisons,
* seule une responsabilité restreinte pèse sur l'auteur du programme,  le
* titulaire des droits patrimoniaux et les concédants successifs.

* A cet égard  l'attention de l'utilisateur est attirée sur les risques
* associés au chargement,  à l'utilisation,  à la modification et/ou au
* développement et à la reproduction du logiciel par l'utilisateur étant 
* donné sa spécificité de logiciel libre, qui peut le rendre complexe à 
* manipuler et qui le réserve donc à des développeurs et des professionnels
* avertis possédant  des  connaissances  informatiques approfondies.  Les
* utilisateurs sont donc invités à charger  et  tester  l'adéquation  du
* logiciel à leurs besoins dans des conditions permettant d'assurer la
* sécurité de leurs systèmes et ou de leurs données et, plus généralement, 
* à l'utiliser et l'exploiter dans les mêmes conditions de sécurité. 

* Le fait que vous puissiez accéder à cet en-tête signifie que vous avez 
* pris connaissance de la licence CeCILL-C, et que vous en avez accepté les
* termes.
*
*/

// ------------------------ Elements communs client/serveur
var tools = require('./js/common_tools'); // méthodes génériques
var models = require('./js/common_models'); // objets
var appSettings = require('./js/settings/common_app_settings'); // paramètres de configuration de l'application


// ------ Variables d'environnement & paramètrages serveurs ------------------
// Récupération du Nom de la machine 
var os = require("os");
hostName = os.hostname();

// Configuration de l'Ip et du port de l'application
ipaddress = appSettings.appServerIp();
port = appSettings.appServerPort();

// Adresse de redirection pour les connexions refusées
indexUrl = null;
indexUrl = "https://" + ipaddress + ":" + port; // Par défaut...

pathKey = appSettings.getPathKey();
pathCert = appSettings.getPathCert();

// Si présence du fichier de config propre au labo: Overwrinting des settings,
// >> différentes IP serveurs selon le nom des machines (VM1, Vm2, Livebox ou local Adhoc) 
var appCNRS;
try {
   appCNRS = require('./js/cnrs/common_app_cnrs'); 
   appCNRS.setLaboServers();
   console.log("Configuration Labo I3S")
}
catch (e) {
   console.log("Configuration Standard") 
}

console.log("***********************************");
console.log('');
// console.log('(' + appSettings.appBranch() + ') ' + appSettings.appName() + " V " + appSettings.appVersion());
console.log(appSettings.appName() + ': ' + appSettings.appBranch() + " (Version " + appSettings.appVersion()+")");
console.log(appSettings.appCredit());
console.log("***********************************");
console.log("Serveur sur machine: " + hostName);

// HTTPS ---------------------------

var fs = require('fs');
var express = require('express');
var https = require('https');
var ent = require('ent'); // Permet de bloquer les caractères HTML (sécurité équivalente à htmlentities en PHP)

key = fs.readFileSync(pathKey);
cert = fs.readFileSync(pathCert);


var https_options = {
    key: key,
    cert: cert
};

try {
   appCNRS = require('./js/common_app_cnrs'); 
   appCNRS.setLaboServers();
   console.log("Configuration Labo I3S")
}
catch (e) {
   console.log("Configuration Standard") 

}

var PORT = port;
var HOST = ipaddress;
app = express();

server = https.createServer(https_options, app).listen(PORT, HOST);
console.log('HTTPS Server listening on %s:%s', HOST, PORT);

// Pour que nodejs puisse servir correctement 
// les dépendances css du document html
app.use(express.static(__dirname));

// Routing des différentes IHM
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

// --------------- 1to1

app.get('/robot/', function(req, res) {
    res.sendFile(__dirname + '/robot.html');
});


app.get('/pilote/', function(req, res) {
    res.sendFile(__dirname + '/pilote.html');
});


// On passe la variable hostName en ajax à l'IHM d'accueil
// puisqu'on ne peux pas passer par websocket...
app.get("/getvar", function(req, res){
    res.json({ hostName: hostName });
});


io = require('socket.io').listen(server); // OK
/**/// Fin test 2 -----------------------------

// ------ Partie Websocket ------------------



// liste des clients connectés
var users2 = {};
var nbUsers2 = 0;

// Historique des connexions
var histoUsers2 = {};
var placeHisto2 = 0;
histoPosition2 = 0;

// ID websockets 1to1 Pilote et Robot pour les envois non broadcastés
wsIdPilote = '';
wsIdRobot = '';

// Flag session serveur
isServerStarted = false;



io.on('connection', function(socket, pseudo) {

    // Ecouteur de connexion entrante
    onSocketConnected(socket);

   
    // Bouton ejection de tous les clients robot/Pilote et visiteurs
    socket.on('razConnexions', function(data) {
        var data = { url: indexUrl};  
        socket.broadcast.emit('razConnexion',data); 
        console.log ("> socket.broadcast.emit('razConnexions',"+data.url+")");
     });
    /**/
    

    // Reload de tous les clients robot/Pilote et visiteurs
    socket.on('reloadAllClients', function(data) {
        var data = { url: indexUrl};  
        socket.broadcast.emit('reloadAllClients',data); 
        console.log ("> socket.broadcast.emit('reloadAllClients',"+data.url+")");
     });
    /**/
    
    // Quand un User rentre un pseudo 
    // on le stocke en variable de session et on informe les autres Users
    socket.on('nouveau_client2', function(data) {

        // console.log(tools.humanDateER('R') + " @ nouveau_client2 >>>> (???)");
        console.log(tools.humanDateER('R') + " @ nouveau_client >>>> (socket.id: "+socket.id+") - ["+data.typeClient+"]"+data.pseudo+")");

	    // Contrôle d'accès minimal (pour éviter les conflits de rôles et les bugs de signaling...)
        // Cas Pilote >> Si 0 Robot ou 1 Pilote déjà présents: Accès refusé
        // Cas Robot >> Si 1 Robot déjà présent: Accès refusé
        // Cas Visiteur >> Si 0 Robot ou 0 Pilote présents: Accès refusé
        // Comportement attendu du client après un refus d'accès:
        // >>> Redirection vers la page d'accueil de l'application
        // Contrainte: L'URL de la page d'accueil doit être dynamique 
        // donc le serveur websocket doit transmettre cette URL au client
        // pour forcer sa redirection.

        // 2 possibilités:
        // Soit contrôler la connexion en amont par un io.use(function... 
        // et, après traitement, générer une erreur avec un message.
        // Mais dans ce cas de figure, ce serai trop compliqué de transmettre 
        // au client l'url de redirection en plus du message d'erreur.
        // Autre solution, plus simple et plus bourrine:
        // Accepter la connexion, faire le traitement et renvoyer
        // au client un simple message websocket avec en paramètre l'ip de redirection. 
        // A sa réception, le client se redirige vers la nouvelle url, se déconnectant d'office. 
       
        var isAuthorized = true;
        var authMessage;
        var rMsg = "> Connexion Rejetée: ";
        var rReason;
        if (data.typeClient == "Robot") {

            // Teste la présence d'un robot dans la liste des clients connectés
            // Paramètres: (hashTable,attribute,value,typeReturn) typeReturn >> boolean ou count...
            var isOtherBot = tools.searchInObjects(users2, "typeClient", "Robot", "boolean");
            if (isOtherBot == true) {
                isAuthorized = false;
                authMessage = "Client Robot non disponible...\n Veuillez patienter.";
                rReason = " > Because 2 Robots";
            }

        } else if (data.typeClient == "Pilote") {
            var isOneBot = tools.searchInObjects(users2, "typeClient", "Robot", "boolean");
            var isOtherPilot = tools.searchInObjects(users2, "typeClient", "Pilote", "boolean");
            if (isOneBot == false) {
                isAuthorized = false;
                authMessage = "Client Robot non connecté... \n Ressayez plus tard.";
                rReason = " > Because no robot";
            } else if (isOtherPilot == true) {
                // Teste la présence d'un pilote dans la liste des clients connectés
                isAuthorized = false;
                authMessage = "Client Pilote non disponible...\n Veuillez patienter.";
                rReason = " > Because 2 Pilotes";
            }
        } else if (data.typeClient == "Visiteur") {
            var isOnePilot = tools.searchInObjects(users2, "typeClient", "Pilote", "boolean");
            if (isOnePilot == false) {
                isAuthorized = false;
                authMessage = "Client Pilote non connecté... \n Ressayez plus tard.";
                rReason = " > Because no pilote";
            }
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
            if (data.typeClient == "Pilote") wsIdPilote = socket.id;
            if (data.typeClient == "Robot") wsIdRobot = socket.id;
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
        var p4 = data.typeClient;
        var p5 = Date.now();
        //var p6 = null;
        // var objUser = new tools.client(p1, p2, p3, p4, p5, p6);
        //var objUser = new tools.client(p1, p2, p3, p4, p5);
        var objUser = new models.client(p1, p2, p3, p4, p5);

        // On ajoute l'User à la liste des connectés
        users2[socket.id] = objUser;

        // On renvoie l'User crée au nouveau connecté
        // pour l'informer entre autre de son ordre d'arrivée ds la session
        io.to(socket.id).emit('localUser', objUser);
        
        // On lui envoie aussi des infos concerant le serveur (pour débug)
		// io.to(socket.id).emit('infoServer', hostName);
		// NB > Obsolète.. >< Remplacé par une récupération directe 
		// depuis le client IHM en ajax par un $.get( "/getvar", function( data ) ) {}
		
        // On signale à tout le monde l'arrivée de l'User
        socket.broadcast.emit('nouveau_client2', objUser);

        /*// Si c'st un "Visiteur", on informe Pilote (et Robot ??)
        if (objUser.typeClient == "Visiteur") {
            io.to(wsIdPilote).emit('newVisitor', objUser);
            //io.to(wsIdRobot).emit('newVisitor', objUser);
        }
        /**/
        

        // On met a jour la liste des connectés coté client"
        nbUsers2 = tools.lenghtObject(users2);
        io.sockets.emit('updateUsers', {
            listUsers: users2
        });

        console.log("> Il y a " + nbUsers2 + " connectés");

    });

    // Quand un user se déconnecte
    socket.on('disconnect', function() {
        console.log(tools.humanDateER('R') + " @ disconnect >>>> (from "+socket.id+")");
        var dUser = users2[socket.id];

        var message = "> Connexion sortante";

        // On met a jour la liste des connectés
        delete users2[socket.id];

        // On envoie a tous le monde l'info de déconnexion
        socket.broadcast.emit('disconnected', {
            objUser: dUser,
            message: message
        });


        // On actualise le nombre de connectés coté serveur
        nbUsers = tools.lenghtObject(users2)

        // On met a jour la liste des connectés coté client"
        io.sockets.emit('updateUsers', {
            listUsers: users2
        });

        // contrôle liste connectés coté serveur
        console.log("> Il reste " + nbUsers + " connectés");
    });
    

    // Transmission de messages génériques 
    socket.on('message2', function(data) {
        console.log(tools.humanDateER('R') + " @ message2 >>>> (from "+data.objUser.typeClient+" id:"+data.objUser.peerID+")");
        if (data.message) {
            message = ent.encode(data.message); // On vire les caractères html...
            socket.broadcast.emit('message2', {
                objUser: data.objUser,
                message: message
            });
        }
        console.log("------------------");
        console.log(message);
        console.log("------------------");
    });


    // ---------------------------------------------------------------------------------
    // Echanges clients Robot/Pilote

    // A la réception d'un ordre de commande en provenance du pilote
    // On le renvoie au client robot qui exécuté sur la même machine que la Robubox.
    // Il pourra ainsi faire un GET ou un POST de la commande à l'aide d'un proxy et éviter le Cross Origin 
    socket.on('piloteOrder', function(data) {
        //console.log(tools.humanDateER('R') + " @ piloteOrder >>>> " + data.command + " (from "+data.objUser.pseudo+" id:"+data.objUser.id+")");
        // var consoleTxt = tools.humanDateER('R') + " @ piloteOrder >>>> " + data.command;
        // consoleTxt += " (from "+data.objUser.pseudo+" id:"+data.objUser.id+")";
        // console.log(consoleTxt);
        io.to(wsIdRobot).emit('piloteOrder', data);
    });

    
    // A la reception du niveau de la batterie
    socket.on('battery_level', function(data) {
       // console.log("@ battery_level >>>> " + data.percentage);
       io.to(wsIdPilote).emit('battery_level', data);
    });


   // Selection du système embarqué (Robubox ou KomNAV)
   // pour l'exécution des commandes reçues en WebRTC et webSocket
   socket.on('changeNavSystem', function(data) {
        io.to(wsIdRobot).emit('changeNavSystem', data);
    });
    

    // Demande d'infos navigation au robot
    socket.on('pilotGetNav', function(data) {
       io.to(wsIdRobot).emit('pilotGetNav', data);
    });



    // Envoi infos navigation au pilote.
    socket.on('navigation', function(data) {
       //console.log("@ navigation >>>> ");
       io.to(wsIdPilote).emit('navigation', data);
    });
    





    // ----------------------------------------------------------------------------------
    // Partie 'signaling'. Ces messages transitent par websocket 
    // mais n'ont pas vocation à s'afficher dans le tchat client...
    // Ces messages sont relayés à tous les autres connectés (sauf à celui qui l'a envoyé)


    socket.on('offer2', function(data) {
        var consoleTxt = tools.humanDateER('R') + " @ offer >>>> (SDP from "+ data.from.pseudo +"("+data.from.id+")"
        consoleTxt += " to " + data.cible.pseudo +"("+data.cible.id+") / peerConnectionID: "+ data.peerCnxId;
        console.log(consoleTxt);
        socket.broadcast.emit('offer', data);

    });

    socket.on('answer2', function(data) {
        var consoleTxt = tools.humanDateER('R') + " @ answer >>>> (SDP from "+ data.from.pseudo +"("+data.from.id+")"
        consoleTxt += " to " + data.cible.pseudo +"("+data.cible.id+") / peerConnectionID: "+ data.peerCnxId;
        console.log(consoleTxt);
        socket.broadcast.emit('answer',data);
    });

    socket.on('candidate2', function(data) {
       var consoleTxt = tools.humanDateER('R') + " @ candidate >>>> (from "+data.from.pseudo + " ("+data.from.id+")" ;
        consoleTxt += "to "+data.cible.pseudo +" ("+data.cible.id+") / peerConnectionID: "+ data.peerCnxId;
        socket.broadcast.emit('candidate', data);
    });

    /*
    socket.on('offer_VtoR', function(data) {

        var consoleTxt = tools.humanDateER('R') + " @ offer_VtoR >>>> (SDP from "+ data.from.pseudo +"("+data.from.id+")"
        consoleTxt += " to " + data.cible.pseudo +"("+data.cible.id+") / peerConnectionID: "+ data.peerCnxId;
        console.log(consoleTxt);

        socket.broadcast.emit('offer_VtoR', data);
    });
    /**/
 

    // ----------------------------------------------------------------------------------
    // Phase pré-signaling ( selections caméras et micros du robot par l'IHM pilote 
    // et statut de la connexion WebRTC de chaque client)

    // Retransmission du statut de connexion WebRTC du pilote
    socket.on('piloteCnxStatus', function(message) {
        console.log(tools.humanDateER('R') + " @ piloteCnxStatus >>>> "+message);
        socket.broadcast.emit('piloteCnxStatus', {
            message: message
        });
    });

    // Retransmission du statut de connexion WebRTC du robot
    socket.on('robotCnxStatus', function(message) {
       console.log(tools.humanDateER('R') + " @ robotCnxStatus >>>> "+message);
        socket.broadcast.emit('robotCnxStatus', {
            message: message
        });
    });



    // Robot >> Pilote: Offre des cams/micros disponibles coté robot
    socket.on('remoteListDevices', function(data) {
        socket.broadcast.emit('remoteListDevices', data);
    });

    // Pilote >> Robot: cams/micros sélectionnés par le Pilote
    socket.on('selectedRemoteDevices', function(data) {
        console.log(tools.humanDateER('R') + " @ selectedRemoteDevices >>>> (from "+data.objUser.pseudo+" id:"+data.objUser.id+")");
        socket.broadcast.emit('selectedRemoteDevices', {
            objUser: data.objUser,
            listeDevices: data.listeDevices,
            appSettings: data.appSettings
        });
    });

    // Robot >> Pilote: Signal de fin pré-signaling...
    socket.on('readyForSignaling', function(data) {
        console.log(tools.humanDateER('R') + " @ readyForSignaling >>>> (from "+data.objUser.pseudo+" id:"+data.objUser.id+")");
        socket.broadcast.emit('readyForSignaling', {
            objUser: data.objUser,
            message: data.message
        });
    });


    // ----------------------------------------------------------------------------------
    // Elements pré-Signaling adaptée au 1toN & NtoN
    // A la différence du 1to1 de base, ces messages ne sont pas broadcastés à tous les connectés
    // mais sont relayés à une cible spécifique 'io.to(destinataire.id)...' 


    // Pilote > Visiteur >> initialisation d'une connexion WebRTC
    // Pour mémo >> socket.emit('requestConnect', { objUser: localObjUser, cible: "pilote" }); 
    socket.on('requestConnect', function(data) { 
        var consoleTxt = tools.humanDateER('R') + " @ requestConnect >>>> from "+data.from.pseudo+" ("+data.from.id+") ";
        consoleTxt += "to: "+data.cible.pseudo+"("+data.cible.id+")"; 
        console.log(consoleTxt); 
        io.to(data.cible.id).emit('requestConnect', data);
    }); 

    // Visiteur > pilote >> acceptation de la connexion WebRTC
    /*// Pour mémo >> socket.emit('requestConnect', { objUser: localObjUser, cible: "pilote" }); 
    socket.on('readyForSignaling_1toN_VtoP', function(data) { 
        var consoleTxt = tools.humanDateER('R') + " @ readyForSignaling_1toN_VtoP >>>> from "+data.from.pseudo+" ("+data.from.id+") ";
        consoleTxt += "to: "+data.cible.pseudo+"("+data.cible.id+")"; 
        console.log(consoleTxt); 
        io.to(data.cible.id).emit('readyForSignaling_1toN_VtoP', data);
    }); 

    //  Visiteur > pilote >> statut de connexion WebRTC du visiteur ( p2p pilote/visiteur)
    socket.on('visitorCnxPiloteStatus', function(data) {
       console.log(tools.humanDateER('R') + " @ visitorCnxPiloteStatus >>>> "+data.iceState);
       socket.broadcast.emit('visitorCnxPiloteStatus', data);
    });
    /**/


   // Elements de post-signaling----------------------------------------------------------------------------------

    socket.on('closeConnectionOrder', function(data) { 
        var consoleTxt = tools.humanDateER('R') + " @ closeConnectionOrder >>>> from "+data.from.pseudo+" ("+data.from.id+") ";
        consoleTxt += "to: "+data.cible.pseudo+"("+data.cible.id+")"; 
        console.log(consoleTxt); 
        io.to(data.cible.id).emit('closeConnectionOrder', data);
    }); 



    /*// Pilote/Robot >>> Visiteurs > Signal de perte de la connexion WebRTC principale (Pilote <> Robot)
    socket.on('closeMasterConnection', function(data) { 
        var consoleTxt = tools.humanDateER('R') + " @ closeMasterConnection >>>> to ALL Clients"; 
        console.log(consoleTxt); 
        socket.broadcast.emit('closeMasterConnection', data);
    });
    /**/ 


    socket.on('infoToPilote', function(data) {
        var consoleTxt = tools.humanDateER('R') + " @ infoToPilote >>>>"; 
        console.log(consoleTxt); 
       io.to(wsIdPilote).emit('infoToPilote', data);
    });

});
/**/

// ------------ fonctions Diverses ------------

// Pour Contrôle des connectés coté serveur
// Ecouteur de connexion entrante
function onSocketConnected(socket) {
    console.log("> Connexion entrante: (ID: " + socket.id + ")");
}


