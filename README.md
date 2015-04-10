# websocket-azkar

-------------------------------------------------

STEP 1 >>> livrable base 1to1:
- DO: Hebergement nodejs sur Openshift
- DO: HTML5 & css client
- DO: Implémentation classes javascript communes client/serveur
- DO: Implémentation Tchat websocket indépendant de WebRTC
- DO: Implémentation localStram
- DO: Implémentation Signaling WebSocket 
	- DO: Bug objet SDP...
	- DO: Bug objet Candidate
- DO: Implémentation RemoteStream
- DO: implémentation RtcDataChannel 
- DO: Websocket gestion des connectés
	- DO: Liste connectés
	- DO: Historique des connexions
	- DO: Gestion des numéros d'ordre
	- DO: gestion déconnexions
- TODO: Passer liste connectés coté client
	- TODO: objet "user" similaires serveur/client
- TODO: Websocket gestion des rooms
- TODO: WebRTC: gestion décco/recco (appelant<>appelé)
- TODO: 2 remotes Stream (Caméra tête et caméra sol)
- TODO: Routes différenciées (pilote/robot)
- TODO: Interception ICE candidate actif
- TODO: Forcer le choix Host/Stun/Turn
- TODO: Gestion des constraints

STEP 2 >>> Livrable base NtoN:
- TODO: Intégration +Sieurs instances de RTCPeerConnection
- TODO: Intégration full-mesh (bas niveau ou librairie ??)

STEP 3 >>> Livrable base 1toN
- TODO: Intégration multiStream plan B (Chrome) 
- TODO: Intégration multiStream plan unifié (Mozzila) 

------------------------------------------------------------

AZKAR WebRTC script Base.

Script le plus simple possible et basé sur des clients chrome en 1to1 fonctionnant en bas-niveau pour servir de base au développement des scripts de benchmarks du projet AZKAR dans différentes versions.

Méthodologie: Les échéances de livrables définies dans le projet AZKAR laissent suffisement de temps pour partir "from sctratch" et procéder par de petites itérations afin d'assurer une compatibilité maximum avec l'évolution de la norme et des navigateurs. Bien que plus lente, cette méthodologie assure une bien meilleure lisibilité/compréhension du code source et des fonctionnements internes de WebRTC.

A construire sur cette base: Applis pour les benchmarks (1to1, 1toN, NtoN bas niveau + versions avec libs et sdk)

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