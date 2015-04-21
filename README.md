# AZKAR WebRTC script base 1TO1 version 0.4.0 

-------------------------------------------------

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
            - [ ] BUG: Surcharge BP (multiples renégo)
                - [ ] ??? petite temporisation au vidage ???
            - [ ] Signaling HS (reset serveur) 
                - [x] Définir Rôle Robot/Pilote par routing > 
                - [ ] Detect déco serveur coté client
                - [ ] Reinitialiser session websocket coté client
        - [ ] Test local Chromium/Chrome > BUGS
            - [x] FIX: renégo RemoteStream (add 2ème caméra, 1 par browser)
            - [ ] BUG: Renégo si déco Robot
        - [ ] Tests en ligne > BUGS 
            - [ ] BUG: buffer signaling onDisconnect...
                - [ ] Vider buffer coté serveur (si déco Robot) ou revenir API WebRTC
            - [ ] BUG: a la 1ère renégo
- [ ] 2 remotes Stream (Caméra tête et caméra sol)
    - [x] get devices (Robot & Pilote)
    - [x] Select Device ID (Robot & Pilote)
    - [ ] TESTS
        - [x] Tests local (Chrome/Chrome)
        - [x] Tests local (Chromium/Chrome)
        - [ ] BUGS: Tests en ligne (HP/HP)
            - [x] OK: a la 1ere connexion 
            - [ ] BUG: à la renégo
        - [x] Tests en ligne (HP > fil > Surface)
        - [x] Tests en ligne (HP > wifi > Surface)
    - [ ] Pré-signaling 
        - [x] IHM Select Devices Robot (sur IHM pilote)
        - [ ] (pilote) js select-Devices
            - [ ] (Robot) IHM désactiver select Devices
            - [ ] (Robot) js > objet "listDevices" + Envoi > Pilote
            - [ ] (Pilote) js > Traitement "listDevices" + sélect
            - [ ] (Pilote) js > objet "selectedDevices" > Renvoi Robot
            - [ ] (Robot) js > Traitement "selectedDevices" 
    - [ ] Add capture 2eme Stream Sol > Robot
    - [ ] Add affichage 2ème Stream Sol > Pilote
- [ ] IHM différenciées (Pilote/Robot)
    - [x] IHM Pilote > sélécteur caméra robot
    - [ ] IHM Robot > Suppression affichages cam pilote
- [ ] Main.js différenciés (Pilote/Robot)
- [ ] Implémentations outils de test
- [ ] Constraints paramétrables
- [ ] Intégration webComponents caméra
- [ ] Interception ICE candidate actif
- [ ] Forcer le choix Host/Stun/Turn

[ ] STEP 2 >>> Livrable base NtoN:
- [ ] Gestion des connectés
	- [ ] Transformer les Users en "objet"
	- [ ] Passer liste Users coté client
- [ ] Websocket gestion des rooms
- [ ] Routes différenciées (pilote/robot + clients)
- [ ] IHM différenciées (Pilote/robot + clients)
- [ ] Main.js différenciés (Pilote/Robot + clients)	
- [ ] Intégration +Sieurs instances de RTCPeerConnection
- [ ] Intégration full-mesh (bas niveau ou librairie ??)

[ ] STEP 3 >>> Livrable base 1toN
- [ ] Intégration multiStream plan B (Chrome) 
- [ ] Intégration multiStream plan unifié (Mozzila) 

------------------------------------------------------------

Test en ligne du script base 1to1:
http://websocket-azkar.rhcloud.com/

------------------------------------------------------------
AZKAR WebRTC script Base.

Script le plus simple possible et basé sur clients chrome en 1to1 fonctionnant en bas-niveau. Objectif: Base de développement des différents scripts benchmarks du projet AZKAR.

Architectures prévues:
- 1 appli 1to1 pour le scénario transport 
- 1 appli 1toN scénario culture
- 1 appli NtoN scénario culture
- 1 appli 1toN scénario santé
- 1 appli NtoN scénario santé

Versions prévues:
- 1 en Bas niveau
- 1 avec lib haut-niveau (ds un second temps)

fonctionnalités supplémentaires à intégrer:
- 1 tchatt par room avec historique
- Transfert de fichier 
- Partage de fichier ( genre 1 room = 1 dossier ) ou avec dropbox ou googledrive

Moockups pour scénarii de développement:
- Transport: 1 IHM (pilote)
- Culture: 2 IHM (pilote/conferencier + groupe de visiteurs)
- Santé: 3 IHM (aidant + robot/patient + consultant)