
# 1to1-refacto (1to1 Refactorisé > 1toN)
------------------------------------------------------------

### TODO's

[i] STEP 2 >>> Livrable base 1toN:

- [x] Gestion des connectés
	- [X] Transformer les Users en "objet"
	- [x] Passer liste Users coté client

- [ ] (option 1) 1toN Bas niveau
    - [x] Peerconnexion en tableaux
    - [x] Modélisation signaling 1to1 & 1toN
    - [x] Modélisation post-signaling 1to1 & 1toN
    - [x] 1to1 Pilote<>Robot
    - [x] 1toN Pilote<>Visiteurs(S)
    - [ ] 1toN 1-Robot > 1-Pilote > N-Visiteurs(S) - (option1 - BroadCast)
        - [x] Pre-signaling
        - [x] Signaling
        - [X] Post-Signaling
        - [ ] Fix Bug Stream Audio
    - [ ] 1toN 1-Robot > N-Visiteurs(S) - (option2 - full Mesh)
        - [x] Pre-signaling
        - [x] Signaling
        - [ ] Post-Signaling
    - [ ] Transfert fichiers Pilote > Visiteurs
    - [X] Implémentation gestion des Visiteurs (droits, etc...)

- [ ] (option 2 Lib) 1toN lib RTCMulticonnection.js
    - [ ] Refactorisa° >>> All .js

- [ ] IHMs (Pilote/Robot/Visiteur)
    - [ ] IHM Pilote 
        - [X] CSS Mookups
        - [x] bloc Cam Pilote
        - [x] bloc Cam Visiteurs
        - [x] bloc Tchat
        - [x] bloc Manage Visiteurs
        - [ ] bloc Manage Files
    - [ ] IHM Robot 
        - [x] CSS
        - [x] bloc pilot camera
        - [ ] bloc Liste visiteurs
    - [ ] IHM Visiteur 
        - [x] CSS
        - [x] Cam Pilote
        - [x] Cam Visiteur
        - [x] Cam Robot
        - [ ] Tchat
        - [ ] Bloc Uploaded Files

- [ ] Tests Fonctionnels




