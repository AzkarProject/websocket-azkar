/*
*
* Copyright © CNRS (Laboratoire I3S) / université de Nice
* Contributeurs: Michel Buffa & Thierry Bergeron, 2015-2016
* 
* Ce logiciel est un programme informatique servant à piloter un Robot à distance
* Ce logiciel est régi par la licence CeCILL-C soumise au droit français et
* respectant les principes de diffusion des logiciels libres. Vous pouvez
* utiliser, modifier et/ou redistribuer ce programme sous les conditions
* de la licence CeCILL-C telle que diffusée par le CEA, le CNRS et l'INRIA 
* sur le site "http://www.cecill.info".
*
* En contrepartie de l'accessibilité au code source et des droits de copie,
* de modification et de redistribution accordés par cette licence, il n'est
* offert aux utilisateurs qu'une garantie limitée.  Pour les mêmes raisons,
* seule une responsabilité restreinte pèse sur l'auteur du programme,  le
* titulaire des droits patrimoniaux et les concédants successifs.

* A cet égard  l'attention de l'utilisateur est attirée sur les risques
* associés au chargement,  à l'utilisation,  à la modification et/ou au
* développement et à la reproduction du logiciel par l'utilisateur étant 
* donné sa spécificité de logiciel libre, qui peut le rendre complexe à 
* manipuler et qui le réserve donc à des développeurs et des professionnels
* avertis possédant  des  connaissances  informatiques approfondies.  Les
* utilisateurs sont donc invités à charger  et  tester  l'adéquation  du
* logiciel à leurs besoins dans des conditions permettant d'assurer la
* sécurité de leurs systèmes et ou de leurs données et, plus généralement, 
* à l'utiliser et l'exploiter dans les mêmes conditions de sécurité. 

* Le fait que vous puissiez accéder à cet en-tête signifie que vous avez 
* pris connaissance de la licence CeCILL-C, et que vous en avez accepté les
* termes.
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


// Objet POI (Pont d'intêret sur la carte)
exports.pointOfInterest = function client (Name,Pose,Label){
  this.id = tools.createUUID();
  this.Name = Name;
  this.Label = Label;
  this.Pose.X= Pose.X;
  this.Pose.Y = Pose.Y;
  this.Pose.Theta = Pose.Theta;
  this.tags = null;
}




// Objet Scene
// idScene
// idParcour
// sceneName
// localization[X,Y,Width,Height]
// description
// tags [...]
// SPARQL


// Objet Parcour
// idParcour
// nameParcour
// description
// mapName






})(typeof exports === 'undefined'? this['models']={}: exports);