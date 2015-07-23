# AZKAR WebRTC script Base. V 0.7.1
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
- [x] Routes différenciées (pilote/robot)	
- [ ]  WebRTC - gestion déco/reco (appelant<>appelé)
    - [ ] BUG: Désacoupler decco WebSocket/WebRTC
        - [ ] >>> 	Si decco WebSocket >> Recco transparante
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
- [x] remotes Stream
- [ ] IHMs (Accueil/Pilote/Robot)
    - [x] IHM Accueil (100%)
    - [ ] IHM Pilote (80%)
        - [x] CSS MookUps 
        - [x] Contrôle d'accès
        - [x] bloc Robot Devices
        - [x] bloc Pilot Devices
        - [x] bloc robot View
        - [ ] bloc robot controls 
        - [ ] bloc robot informations
        - [x] bloc tchat websocket
        - [x] bloc logs webRTC 
        - [ ] bloc Settings Benchmarks 
    - [ ] IHM Robot
        - [X] CSS Mookups
        - [x] Contrôle d'accès
        - [x] bloc logs WebRTC
        - [ ] bloc Settings
- [ ] Factorisation Main.js

[ ] STEP 2 >>> Livrable base 1toN:
- [x] Gestion des connectés
	- [X] Transformer les Users en "objet"
	- [x] Passer liste Users coté client
- [ ] IHMs (Pilote/Robot/Visiteur)
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
- [ ] Intégration +Sieurs instances de RTCPeerConnection
- [ ] Intégration multiStream plan B (Chrome) 
- [ ] Intégration multiStream plan unifié (Mozzila)

[ ] STEP 3 >>> Livrable base NtoN
- [ ] Websocket gestion des rooms
- [ ] Intégration full-mesh (bas niveau ou librairie ??)

[ ] STEP 4 >>> Adapta° Benchmarking (1to1 - 1toN - NtoN)
- [ ] Implémentations outils de test
- [ ] Constraints paramétrables
- [ ] Intégration webComponents caméra
- [ ] Interception ICE candidate actif
- [ ] Forcer le choix Host/Stun/Turn
