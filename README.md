
# 1to1-refacto (1to1 Refactorisé > 1toN)
------------------------------------------------------------

### TODO's

[i] STEP 2 >>> Livrable base 1toN:
- [x] Gestion des connectés
	- [X] Transformer les Users en "objet"
	- [x] Passer liste Users coté client
- [x] Reviews Projets Miage + multiStream Plan B
- [ ] (option 1 Full Mesh) 1toN Bas niveau
    - [x] Peerconnexion en tableaux
    - [x] Modélisation signaling 1to1 & 1toN
    - [x] Modélisation post-signaling 1to1 & 1toN
    - [x] Factorisation 1to1 > 1toN
        - [X] Pré-signaling 1to1 Pilote<>Robot
        - [X] Signaling 1to1 Pilote<>Robot
        - [X] Post-Signaling 1to1 Pilote<>Robot
    - [ ] 1toN Pilote<>Visiteurs(S)
        - [X] Pré-signaling 1to1 Pilote<>Visiteur
        - [x] Signaling 1to1 Pilote<>Visiteur
        - [ ] Post-Signaling 1to1 Pilote<>Visiteur
        - [X] Factorisation 1to1 > 1toN Pilote<>Visiteur(S)
    - [ ] 1toN 1-Robot > 1-Pilote > N-Visiteurs(S) - (option1)
    - [ ] 1toN 1-Robot > N-Visiteurs(S) - (option2)
    - [ ] Transfert fichiers Pilote > Visiteurs
    - [i] Implémentation gestion des Visiteurs (droits, etc...)
- [ ] (option 2 Lib) 1toN lib RTCMulticonnection.js
    - [ ] Refactorisa° >>> All .js
- [ ] IHMs (Pilote/Robot/Visiteur)
    - [ ] IHM Pilote 
        - [X] CSS Mookups
        - [x] bloc Cam Pilote
        - [i] bloc Cam Visiteurs
        - [x] bloc Tchat
        - [i] bloc Manage Visiteurs
        - [ ] bloc Manage Files
    - [ ] IHM Robot 
        - [x] CSS
        - [x] bloc pilot camera
        - [i] bloc Liste visiteurs
    - [ ] IHM Visiteur 
        - [x] CSS
        - [x] Cam Pilote
        - [x] Cam Visiteur
        - [ ] Cam Robot
        - [i] Tchat
        - [ ] Bloc Uploaded Files
- [ ] Tests Fonctionnels




