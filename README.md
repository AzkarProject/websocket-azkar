

# AZKAR PROJECT 

to download this branch:

git clone -b 1to1-generic --single-branch https://github.com/AzkarProject/websocket-azkar.git

Copyright © CNRS (Laboratoire I3S) / université de Nice
Contributeurs: Thierry Bergeron & Michel Buffa, 2015-2016

Prototype de Contrôle/Commande à distance d'un Robot par internet.

Cette application est régie par la licence CeCILL-C soumise au droit français et
respectant les principes de diffusion des logiciels libres. Vous pouvez
utiliser, modifier et/ou redistribuer ce programme sous les conditions
de la licence CeCILL-C telle que diffusée par le CEA, le CNRS et l'INRIA 
sur le site "http://www.cecill.info".

Révision 1.6.2
- Caméra Foscam
    - Simplification du code source coté Gamepad
    - Implémentation commandes de Zoom
    - Implémentation commandes de reset caméra
    - Factorisation du code dans une classe dédiée
    - Modification mapping Gamepad des commandes caméra
    - Implémentation d'une interface Web avec comandes en mode "pas a pas" et "continu"
    - Ajouts d'icones et corrections de Bugs dans le bloc de commandes
    - Todo: Implémentation de commandes au clavier
    - Todo: Activation/Désactivation des commandes de la caméra coté admin

Révision 1.6.1
- Cartographie
    - Refonte algorithme du mode tracking
- Interface d'administration
    - Activation/désactivation du Gamepad Physique
    - Optimisation de l'ejection forcée des utilisateurs
- Système de recommandations (web sémantique)
    - Implémentation Menu de sélection type coverflow
    - Implémentation d'une lihgtBox pour l'affichage des ressources

Révision 1.6.0
- Implémentation d'une couche de persistence sous MongoDB (non exploitée pour l'instant):
- Implémentation d'une couche de web sémantique permettant:
    - Selon le POI le plus proche, le téléchargement de ressources complémentaires
    - L'affichage de ces ressources (Photos, vidéos, articles, données fournies par le musée)
- Implémentation des commandes de caméra IP de type Foscam
- Implémentation d'une interface d'administration permettant:
    - l'éjection ou le reload forcé du pilote et du robot
    - l'ajout, la sélection et la suppresion à la volée de maps pour la cartographie
    - la bascule à la volée en mode de simulation robot "FakeRobubox"
    - l'ajout, la sélection et la suppresion à la volée des IPs pour les caméras Foscam et les robots
    - La persistence de ces configurations
- Modification du Header des IHMs
- Modification légère de l'IHM Robot

Révision 1.5.2:
- Abandon rétrocompatibilité systême embarqué "Robubox"
- Remplacement par le système embarqué "KomNav/Mobiserv" 
- Visualisation des "Poins d'intérêts" sur la cartographie
- Implémentation de la navigation par "Points d'intérêts" 

Révision 1.5.1:
- Modification de l'architecture des fichiers de configuration
- Implémentation d'un nouvel affichage de la vitesse et de la direction  
- Ajout d'un mode de conduite "Full Axe" sur un seul stick analogique
- Simplification des procédures de configurations caméra en mode conférencier
- Simplification des procédures de connexion/déconnexion en mode conférencier
- Fix d'un bug aléatoire (liste des caméras distantes vide)
- Modification de la gestion des résolutions de caméras.  
- Optimisation générale de l'ergonomie de l'IHM de commande

Révision 1.5.0: 
- Implémentation d'un mode conférencier (Commandes au Gamepad + Plein ecran)
- Implémentation d'un mode tracking pour la géolocalisation du robot

