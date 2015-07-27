# AZKAR WebRTC script Base. V 0.7.1.2
------------------------------------------------------------

Test en ligne du script base 1to1:
http://websocket-azkar.rhcloud.com/

------------------------------------------------------------

### TODO's

[ ] STEP 1 >> 1to1
- [x] LocalStream
- [x] Pré-Signalig (Select Devices)
- [x] Signaling Websocket
- [x] RemoteStream
- [x] Paths Pilotes/Robots
- [ ] Websocket
    - [ ] >> Implémenter Backups Logs
- [ ] RTCdataChannel
    - [ ] >> Implémenter Backups Logs
    - [ ] Fix Date E&R ds même message
- [ ] Gest° Déco/Reco
    - [ ] Tracer TOUS les messages transitants sur le server....
        - [ ] Implémenter Backup Logs coté serveur 
    - [ ] BUG: OpenShift > 1 Robot déjà connecté
    - [ ] BUG: OpenShift > Persistance msg fantômes après déco...
    - [ ] BUG: OpenShift > déco intempestives
        - [ ] Fix: Vider buffer >> messages fantômes..
        - [ ] FiX: Désacoupler déco WebSocket/WebRTC
    - [ ] Si déco WebSocket >> Reco transparante   
- [ ] Intégra° Commandes & Carto (Michael)
    - [ ] Switch WebSocket/WebRTC
    - [ ] >> Commandes Drive
        - [ ] GamePad
        - [ ] Clavier
        - [ ] Sécurité Homme/mort coté serveur
            - >>> ex boucle 100ms>cmd/350ms sans recept cmd >> Stop...
            - >>> ou boucle 50ms Bouton Homme mort GamePad >
            - [ ] Implémentation Bas niveau > Robot (voir Robosoft)
    - [ ] Cartographie
        - [ ] Chargement & mise à l'échelle 
        - [ ] Affichage Pos Robot en Tps Réel
        - [ ] Affichage télémétrie en tps réel (optionnel)
    - [ ] Navigation 
        - [ ] Go > liste Points d'intérêts (Goto)
        - [ ] Go > Clic Cartographie (Clic and Go)
    - [ ] Commandes Steps
        - [ ] Switch Ecran/Clavier
- [ ] IHMs (Accueil/Pilote/Robot)
    - [x] IHM Accueil
    - [ ] IHM Pilote
        - [x] CSS MookUps 
        - [x] Contrôle d'accès
        - [x] Bloc Robot Devices
        - [x] Bloc Pilot Devices
        - [x] Bloc robot View
        - [ ] Bloc robot controls 
        - [ ] Bloc robot informations
            - [ ] Charge Batterie
            - [ ] Vitesse en temps réel
        - [x] Bloc tchat websocket
        - [ ] Bloc logs webRTC
        - [ ] Bloc Settings 
    - [ ] IHM Robot
        - [X] CSS Mookups
        - [x] Contrôle d'accès
        - [ ] Bloc Logs WebSocket/WebRTC
        - [ ] Bloc Settings > Activer Gest° Volume
- [ ] Factorisation Main.js
- [ ] Tests fonctionnels

[ ] STEP 2 >>> Livrable base 1toN:
- [x] Gestion des connectés
	- [X] Transformer les Users en "objet"
	- [x] Passer liste Users coté client
- [ ] Reviews Projets Miage + multiStream Plan B
- [ ] Refactorisa°
    - [ ] Main.js
    - [ ] Pilote.js
    - [ ] Robot.js
    - [ ] Visiteur.js
- [ ] (option 1 Full Mesh) 1toN Bas niveau
    - [ ] Signaling & Peers Pilote > Visiteurs
    - [ ] Transfert fichiers Pilote > Visiteurs
    - [ ] (option 1) Inclusion Stream Robot > Pilote > Visiteur
    - [ ] (option 2) Signaling & Peers Robot > Visiteurs
- [ ] (option 2 Lib) 1toN lib RTCMulticonnection.js
    - [ ] Refactorisa° >>> All .js
- [ ] IHMs (Pilote/Robot/Visiteur)
    - [ ] Contrôle d'accès Pilote + Robot
    - [ ] IHM Accueil
    - [ ] IHM Pilote 
        - [ ] CSS Mookups
        - [x] bloc Cam Pilote
        - [ ] bloc Cam Visiteurs
        - [x] bloc Tchat
        - [ ] bloc Manage Visiteurs
        - [ ] bloc Manage Files
    - [ ] IHM Robot 
        - [ ] CSS
        - [x] bloc pilot camera
        - [ ] bloc Liste visiteurs
    - [ ] IHM Visiteur 
        - [ ] CSS
        - [ ] Cam Pilote
        - [ ] Cam Visiteur
        - [ ] Cam Robot
        - [ ] Tchat
        - [ ] Bloc Uploaded Files
- [ ] Tests Fonctionnels

[ ] STEP 3 >>> Livrable base NtoN
- [ ] Websocket gestion des rooms
- [ ] Intégration full-mesh (bas niveau ou librairie ??)

[ ] STEP 4 >>> Adapta° Benchmarking (1to1 - 1toN - NtoN)
- [ ] Implémentations outils de test
- [ ] Constraints paramétrables
- [ ] Intégration webComponents caméra
- [ ] Interception ICE candidate actif
- [ ] Forcer le choix Host/Stun/Turn



