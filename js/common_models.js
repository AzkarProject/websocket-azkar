/*
*
* Authors: Thierry Bergeron, Michel Buffa
* Copyright : © CNRS (Laboratoire I3S) / université de Nice
*
*/
(function(exports){

  
// Objets 
// -------------------------------


// pour la reconstruction de l'objet sourceInfo, qui, 
// pour une raison inconnue, n'est pas transmissible tel quel par websocket 
// quand il est construit sous Chromium (V.44.0.2371.0).
// Par contre, R.A.S quans il est construit sous Chrome ( V.42.0.2311.90) 
exports.sourceDevice = function sourcedevice (id,kind,label,facing){
  this.id = id;
  this.kind = kind;
  this.label = label;
  this.facing = facing;
}


// Objet client ( Robot, Pilote, Visiteur, Patient, ect... )
exports.client = function client (id,pseudo,placeliste,typeClient,connectionDate){
  this.id = id;
  this.pseudo = pseudo;
  this.placeliste = placeliste;
  this.typeClient = typeClient;
  this.connectionDate = connectionDate;
  this.disConnectionDate = null;
  this.peerCnxCollection = null;
}


})(typeof exports === 'undefined'? this['models']={}: exports);