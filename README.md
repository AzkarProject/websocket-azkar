
# 1to1-refacto 
------------------------------------------------------------

### TODO's

- [ ] BUG STUN/TURN (15jh)
    - [x] Do: Déterminer configurations réseaux STUN ou TURN (1jh) 
    - [x] Do: Tests Host VM2 (2jh)
    - [x] Do: Tests Host OVH (0,5 jh)
    - [ ] > Todo: Tests Host Livebox (1jh)
    - [x] Do: Tests serveur Reciprocate (1jh)
    - [x] Do: Tests serveur Restund (2jh)
    - [ ] > Todo: Test Serveur rfc-5766-turnServer (1jh)
    - [ ] > Todo: Test Serveur Coturn (1jh)
    - [ ] > Todo: Test Solution commerciale anyfirewall.com (1jh)
    - [ ] > Todo: Test Solution commerciale xirsys.com (1jh)

- [ ] Signaling > Robustesse (5jh)
    - [x] Do: Flag robotDisconnexion et piloteDisconnexion (0,25jh)
    - [x] Do: Repérage & simplification Fichier JS concernés (0,5jh)
    - [x] Do: Si Flag = unexpected > submit cnx auto (recept ondisconnect + reconnect) (0,25jh)
    - [x] Do: FIX BUG: Décco Robot (si WS only). Non détecté coté pilote > désactivation form (0,25jh)
    - [x] Do: FIX BUG: Décco Robot (si WebRTC). Désactivation Bouton décco coté Pilote(0,25jh)
    - [x] Do: BUG: Déco/Reco & Cnx Robot auto si session webrtc non lancée coté pilote (0,25jh)
    - [x] Do: BUG non persistance select Camera & audio à la Reco auto (0,25jh)
    - [ ] > Todo: Voir Comportement si origine décco WebRTC... (0,5jh)
    - [ ] > Todo: TEST & Validation sur EDUROAM ou UNICE (2jh)

- [ ] Module Navigation (10jh)
    - [ ] Cartographie (5jh)
        - [x] Do: Zoom & translation (Souris) (0,5jh)
        - [ ] > ToDo: Zoom & translation (Boutons) (1jh)
        - [ ] > Todo: Centrage Caméra sur Robot (1jh)
        - [ ] > Todo: Rotation Carte autour Robot (1jh)
        - [ ] > Todo: Switch mode Suivi/Statique (0,5jh)
    - [ ] Télémétrie (5jh)

- [ ] Module Commande > Gamepad (6jh)
    - [ ] > Todo: Reprendre librairie ((2jh) 
    - [ ] > Todo: Définir Comportement Gamepad (0,5jh)
    - [ ] > Todo: Implémenter Mode Précision (0,5jh)
    - [ ] > Todo: Implémenter Mode déco/Reco (0,5jh)
    - [ ] > Todo: Implémenter Cycle selection Définitions (0.5jh)

- [ ] Systême (9,5jh)
    - [ ] Optimisations (2,5jh)
        - [ ] > Todo: Passer recup carto par KomNav (1jh)
        - [ ] > Todo: Passer récup battery par KomNav (0,5jh)
        - [ ] > Todo: (IHM robot) Modifier système création liste caméras (1jh)
        - [ ] > Todo: Si possible >> version compatible Firefox
    - [ ] > Refactorisation (7jh)
        - [x] Do: Merge  1to1-refacto /Master (0,5jh)
        - [ ] > Todo: Filtrer fonctions 1to1/1toN (1jh)
        - [ ] > Todo: Revoir convention nommage Fichiers (0.5jh)
        - [ ] > Todo: Passer tous les modules en mode encapsulé (export) (1,5jh) 
        - [ ] > Todo: Séparer algo fichier Main > Atomisation modules (1jh)
        - [ ] > Todo: Factoriser settings (1jh)
            - [ ] > Rationaliser isBenchmarks, IsRobubox et FakeRobubox
            - [ ] > Rationaliser settings (appli vs webRTC)
       - [ ] > Todo: Nettoyer & Upgrader Node Modules (0,5 jh)
       - [ ] > Todo: Gulp & Brosify app (hugo & François) (1jh)





