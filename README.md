
# 1to1-refacto 
------------------------------------------------------------

### TODO's

- [ ] BUG STUN/TURN 
    - [x] Do: Déterminer configurations réseaux STUN ou TURN 
    - [x] Do: Tests serveur "Reciprocate" > Hs
        - [x] Sur Host VM2 > HS
    - [x] Do: Tests serveur "Restund" > Hs
        - [x] Sur Host VM2 > HS
        - [X] Sur Host OVH > HS
        - [ ] Sur host Livebox 
    - [ ] > Todo: Test Serveur "rfc-5766-turnServer"
        - [x] Sur Host VM2 > OK dom/i3S - HS unice/i3s
        - [ ] Sur Host OVH 
        - [ ] Sur host Livebox 
    - [ ] > Todo: Test Serveur "Coturn"
        - [ ] Sur Host VM2 
        - [ ] Sur Host OVH 
        - [ ] Sur host Livebox 
    - [ ] > Do: Test Solution commerciale anyfirewall.com
        - [x] Test API js > HS
        - [ ] Test API php > ?
    - [ ] > Todo: Test Solution commerciale xirsys.com
        - [x] Test API js > OK
        - [x] Test sans CB > HS
        - [ ] Test avec CB
        - [ ] Si tests OK > adapter API js inf 10sec

- [ ] Signaling > Robustesse
    - [x] Do: Flag robotDisconnexion et piloteDisconnexion
    - [x] Do: Repérage & simplification Fichier JS concernés
    - [x] Do: Si Flag = unexpected > submit cnx auto (recept ondisconnect + reconnect)
    - [x] Do: FIX BUG: Décco Robot (si WS only). Non détecté coté pilote > désactivation form 
    - [x] Do: FIX BUG: Décco Robot (si WebRTC). Désactivation Bouton décco coté Pilote
    - [x] Do: BUG: Déco/Reco & Cnx Robot auto si session webrtc non lancée coté pilote 
    - [x] Do: BUG non persistance select Camera & audio à la Reco auto 
    - [ ] > Todo: Voir Comportement si origine décco WebRTC...
    - [ ] > Todo: TEST & Validation sur EDUROAM ou UNICE
    
- [ ] Module Navigation
    - [ ] Cartographie
        - [x] Do: Zoom & translation (Souris)
        - [x] Do: Zoom (boutons)
        - [x] Do: restZoom (boutons)
        - [ ] > Todo: position (Boutons)
        - [ ] > ToDo: resetPosition (boutons)
        - [ ] > Todo: mode Tracking
        - [ ] > Todo: Zoom & position (Gamepad)
        
        - [ ] > Todo: mode TRacking
    - [ ] Télémétrie

- [x] Module Commande > Gamepad
    - [x] Do: Reprendre librairie
    - [x] Do: Définir affectations boutons 
    - [x] Do: Implémenter bouton mode Précision
    - [x] Do: Implémenter bouton switch déco/Reco
    - [x] Do: Systeme de notification 
    - [x] Do: Implémenter switch FullScreen
    - [x] Do: Implémenter Sélection caméra
    - [x] Do: Implémenter Sélection définition

- [x] Optimisations
    - [x] Do: Passer recup carto > komcom
    - [x] Do: Passer récup battery > komcom
    - [x] Do: (IHM robot) Modifier système création liste caméras
    - [x] Do: Version compatible Firefox
    - [x] Do: Intégrer modifs 1to1-basic
    
- [ ] > Refactorisation
    - [x] Do: Merge  1to1-refacto /Master
    - [x] Do: Filtrer fonctions 1to1/1toN
    - [x] Do: Revoir nommage Fichiers
    - [ ] > Todo: Passer tous les modules en mode encapsulé (export)
    - [ ] > Todo: Séparer algo fichier Main > Atomisation modules
    - [ ] > Todo: Factoriser settings
        - [ ] > Rationaliser isBenchmarks, IsRobubox et FakeRobubox
        - [ ] > Rationaliser settings (appli vs webRTC)
   - [ ] > Todo: Nettoyer & Upgrader Node Modules
   - [ ] > Todo: Gulp & Brosify app (hugo & François)





