# AZKAR WebRTC script Base. V 0.5.1
------------------------------------------------------------

Script basé sur clients chrome en 1to1 fonctionnant en bas-niveau. 
Objectif: Base de développement des différents scripts benchmarks du projet AZKAR.

Architectures prévues:
- 1 appli 1to1 pour le scénario transport 
- 1 appli 1toN scénario culture
- 1 appli NtoN scénario culture
- 1 appli 1toN scénario santé
- 1 appli NtoN scénario santé

Versions envisagées pour chaque architectures:
- 1 en Bas niveau
- 1 avec lib haut-niveau (ds un second temps)

fonctionnalités supplémentaires à intégrer:
- 1 tchatt par room avec historique
- Transfert de fichier 
- Partage de fichier ( genre 1 room = 1 dossier ) ou avec dropbox ou googledrive

Moockups à établir pour scénarii de développement:
- Transport: 1 IHM (pilote)
- Culture: 2 IHM (pilote/conferencier + groupe de visiteurs)
- Santé: 3 IHM (aidant + robot/patient + consultant)

------------------------------------------------------------

Test en ligne du script base 1to1:
http://websocket-azkar.rhcloud.com/

------------------------------------------------------------

### TODO's

[ ] STEP 1 >>> livrable base 1to1:
- [x] Hebergement nodejs sur Openshift
- [x] HTML5 & css client
- [x] Implémentation classes javascript communes client/serveur
- [x] Implémentation Tchat websocket indépendant de WebRTC
- [x] Implémentation localStram
- [x] Implémentation Signaling WebSocket 
	- [x] FIX: bug objet SDP
	- [x] FIX: bug objet Candidate
	- [x] Gestion déconnexions (apellant/apellé)
    - [x] Gestion Rôles actifs (pilotes/robot)
    - [ ] TEST en ligne:
        - [ ] BUG: Persistance messages fantômes après décco...
        - [ ] BUG: Déconnexions intempestives (buffer ou messages fantômes???...
            - [ ] >>>> Tracer TOUS les messages transitant sur le server....
- [x] Implémentation RemoteStream
- [x] implémentation RtcDataChannel 
- [x] Websocket - gestion des connectés
	- [x] Liste connectés
	- [x] Historique des connexions
	- [x] Gestion des numéros d'ordre
- [x] Routes différenciées (pilote/robot)	
- [ ]  WebRTC - gestion déco/reco (appelant<>appelé)
	- [x] Renégociation RTCDataChannel
	- [ ] Renégotiation RemoteStream 
        - [x] FIX: Relancer ouverture caméra sur Appelé (Robot)
        - [x] FIX: Use Chromium + --use-fake-ui sur Appelé (Robot)
        - [x] Test local Crhome/Chrome > R.A.S
        - [ ] Test local Chromium/Chromium > BUGS
            - [x] FIX: Surcharge BP (multiples renégo)
            - [ ] Signaling HS (reset serveur) 
                - [x] Définir Rôle Robot/Pilote par routing
                - [ ] >>> Detect déco serveur coté client ?
                - [ ] >>> Reinitialiser session websocket coté client ?
        - [X] Test local Chromium/Chrome > BUGS
            - [x] FIX: renégo RemoteStream (add 2ème caméra, 1 par browser)
            - [x] FIX: Renégo si déco Robot
- [x] 2 remotes Stream (Caméra tête et caméra sol)
    - [x] get devices (Robot & Pilote)
    - [x] Select Device ID (Robot & Pilote)
    - [x] TESTS
        - [x] Tests local (Chrome/Chrome)
        - [x] Tests local (Chromium/Chrome)
        - [x] Tests en ligne (HP/HP)
            - [x] OK: a la 1ere connexion 
            - [x] OK: à la renégo
        - [x] Tests en ligne (HP > fil > Surface)
        - [x] Tests en ligne (HP > wifi > Surface)
    - [x] Pré-signaling 
        - [x] IHM Select Devices Robot (sur IHM pilote)
        - [x] "pilote" js select-Devices
            - [x] "Robot" IHM désactiver select Devices
            - [x] "Robot" js > objet "listDevices" + Envoi > Pilote
            - [x] "Pilote" js > Traitement "listDevices" + sélect
            - [x] "Pilote" js > objet "selectedDevices" > Renvoi Robot
            - [x] "Robot" js > Traitement "selectedDevices"
        - [x] Tests Chromium/Chrome
            - [x] FIX: objet sourceInfo Chromium vide...
            - [x] FIX: labels sourceInfo Chromium
- [ ] IHM différenciées (Accueil/Pilote/Robot)
    - [ ] IHM Accueil
        - [ ] Avertissement Users en ligne...
        - [ ] Activation links IHM...
    - [ ] IHM Pilote 
        - [x] sélécteur caméra robot
        - [x] css selecteurs caméra 
        - [ ] Contrôle d'accès si 2 pilotes
        - [ ] Cam pilote 
            - [ ] sélection Micro uniquement
            - [ ] Suppression Affichage Stream
            - [ ] Suppression Flux a la source...
    - [ ] IHM Robot
        - [ ] Contrôle d'accès si 2 robots
        - [ ] Cam pilote 
            - [ ] Suppression Affichage Stream
            - [ ] Suppression Flux a la source...
        - [ ] Cams Robot
            - [ ] Suppression affichage Stream
- [ ] Main.js différenciés (Pilote/Robot)
    - [ ] Séparer classes et algos propres pilote/robot
- [ ] Implémentations outils de test
- [ ] Constraints paramétrables
- [ ] Intégration webComponents caméra
- [ ] Interception ICE candidate actif
- [ ] Forcer le choix Host/Stun/Turn

[ ] STEP 2 >>> Livrable base 1toN:
- [x] Gestion des connectés
	- [X] Transformer les Users en "objet"
	- [x] Passer liste Users coté client
- [ ] Websocket gestion des rooms
- [x] Routes différenciées (pilote/robot + clients)
- [ ] IHM différenciées (Pilote/robot + clients)
- [ ] Main.js différenciés (Pilote/Robot + clients)	
- [ ] Intégration +Sieurs instances de RTCPeerConnection
- [ ] Intégration multiStream plan B (Chrome) 
- [ ] Intégration multiStream plan unifié (Mozzila)

[ ] STEP 3 >>> Livrable base NtoN
- [ ] Intégration full-mesh (bas niveau ou librairie ??)

