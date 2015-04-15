# AZKAR WebRTC script base 1TO1 version 0.4.0 

-------------------------------------------------

### Todo's

:large_orange_diamond: STEP 1 >>> livrable base 1to1:
- :white_check_mark:: Hebergement nodejs sur Openshift
- :white_check_mark: HTML5 & css client
- :white_check_mark: Implémentation classes javascript communes client/serveur
- :white_check_mark: Implémentation Tchat websocket indépendant de WebRTC
- :white_check_mark: Implémentation localStram
- :white_check_mark: Implémentation Signaling WebSocket 
	- :white_check_mark: Bug objet SDP
	- :white_check_mark: Bug objet Candidate
	- :white_check_mark: gestion déconnexions (apellant/apellé)
- :white_check_mark: Implémentation RemoteStream
- :white_check_mark: implémentation RtcDataChannel 
- :white_check_mark: Websocket gestion des connectés
	- :white_check_mark: Liste connectés
	- :white_check_mark: Historique des connexions
	- :white_check_mark: Gestion des numéros d'ordre
- :white_check_mark: Routes différenciées (pilote/robot)	
- :large_orange_diamond: WebRTC: gestion déco/reco (appelant<>appelé)
	- :white_check_mark: Bug renégociation RTCDataChannel
	- :white_check_mark: Bug renégotiation RemoteStream 
        - >>> Refaire demande ouverture caméra sur Appelé (Robot)
        - >>> Chromium + --use-fake-ui sur Appelé (Robot)
        - :white_check_mark: Test local Crhome/Chrome
        - :interrobang: Test local Chromium/Chromium
            - >>> OK au lancement Chromium + serveur
            - >>> Surcharge BP si multiples renégo
            - >>> Signaling HS si relance serveur + refresh Crhomium
        - :interrobang: Test local Chromium/Chrome
        - :interrobang:: tests en ligne
            - >>> BUG buffer signaling onDisconnect...
            - >>> :ballot_box_with_check: vider buffer coté serveur (si déco Robot) 
            - >>>>>>>> ou RevenirAPI WebRTC > détection déco
            - >>> :ballot_box_with_check: Définition Rôle Robot/Pilote par routing
- :ballot_box_with_check: main.js différenciés (Pilote/Robot)
- :ballot_box_with_check: IHM différenciées (Pilote/Robot)
- :ballot_box_with_check: 2 remotes Stream (Caméra tête et caméra sol)
- :ballot_box_with_check: Implémentations outils de test
- :ballot_box_with_check: Constraints paramétrables
- :ballot_box_with_check: intégration webComponents caméra
- :ballot_box_with_check: Interception ICE candidate actif
- :ballot_box_with_check: Forcer le choix Host/Stun/Turn

:ballot_box_with_check: STEP 2 >>> Livrable base NtoN:
- :ballot_box_with_check: Gestion des connectés
	- :ballot_box_with_check: transformer les Users en "objet"
	- :ballot_box_with_check: Passer liste Users coté client
- :ballot_box_with_check: Websocket gestion des rooms
- :ballot_box_with_check: Routes différenciées (pilote/robot + clients)
- :ballot_box_with_check: IHM différenciées (Pilote/robot + clients)
- :ballot_box_with_check: main.js différenciés (Pilote/Robot + clients)	
- :ballot_box_with_check: Intégration +Sieurs instances de RTCPeerConnection
- :ballot_box_with_check: Intégration full-mesh (bas niveau ou librairie ??)

:ballot_box_with_check: STEP 3 >>> Livrable base 1toN
- :ballot_box_with_check: Intégration multiStream plan B (Chrome) 
- :ballot_box_with_check: Intégration multiStream plan unifié (Mozzila) 

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