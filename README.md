# websocket-azkar

AZKAR WebRTC script Base 
Script le plus simple possible en 1to1 fonctionnant en bas-niveau pour servir de base au développement des scripts de benchmarks du projet AZKAR dans différentes versions.

Méthodologie: Les échéances de livrables définies dans le projet AZKAR laissent suffisement de temps pour partir from sctratch et procéder par de petites itérations afin d'assurer une compatibilité maximum avec l'évolution de la norme et des navigateurs. Bien que plus lente, cette méthodologie assure une bien meilleure lisibilité/compréhension du code source et des fonctionnements internes de WebRTC.

A construire sur cette base: Applis pour les benchmarks (1to1, 1toN, NtoN bas niveau + versions avec libs et sdk)
	Architectures possibles
		1 appli 1to1 pour le scénario transport 
		1 appli 1toN scénario culture
		1 appli NtoN scénario culture
		1 appli 1toN scénario santé
		1 appli NtoN scénario santé
	Versions
		1 en Bas niveau
		1 avec lib haut-niveau (ds un second temps)
		1 avec sdk
	fonctionnalités
		1 tchatt par room avec historique
		Transfert de fichier 
		Partage de fichier ( genre 1 room = 1 dossier ) ou avec dropbox ou googledrive

Préparer Moockups pour scénarii de développement
	Transport: 1 ihm (pilote)
	Culture: 2 ihm (pilote/conferencier + classe)
	Santé: 3 ihm (aidant + robot/patient + consultant)

-------------------------------------------------

Progression:
DO: Hebergement nodejs sur Openshift
DO: HTML5 & css client
DO: Implémentation classes javascript communes client/serveur
DO: Implémentation Tchat websocket indépendant de WebRTC
DO: Implémentation du localStram
Encours: Implémentation Signaling WebSocket (Bug sur l'objet ICE Candidate...)
TODO: Implémentation du remoteStream
TODO: implémentation du RtcDataChannel 
TODO: Tchatt websocket: Gestion des rooms
TODO: Tchatt websocket: Implémentation liste des connectés
TODO: Tchatt websocket: Gestion des connectés
TODO: WebRTC: gestion des décco/recco
TODO: Interception de l'ICE candidate actif
----------> STEP 1 >>> livrable base 1to1

TODO: Intégration +Sieurs instances de RTCPeerConnection
TODO: Intégration du full-mesh (bas niveau ou librairie ??)
----------> STEP 2 >>> Livrable base NtoN

TODO: Intégration multiStream plan B (Chrome) 
TODO: Intégration multiStream plan unifié (Mozzila) 
----------> STEP 3 >>> Livrable base 1toN





