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

// Urls des ressources (Robot, caméras IP)
exports.ressourceUrl = function ressourceUrl (url,Label,description){
  this.url = url;
  this.Label = Label;
  if (description ) this.description = description;
}


// Géolocalisation & Web sémantique

// Objet POI (Pont d'intêret sur la carte)
exports.pointOfInterest = function pointOfInterest (Name,Pose,Label){
  this.id = tools.createUUID();
  this.Name = Name;
  this.Label = Label;
  this.Pose.X= Pose.X;
  this.Pose.Y = Pose.Y;
  this.Pose.Theta = Pose.Theta;
  this.tags = null;
}

// -- Objet Map
// Todo Ontologie amo:MuseumMap
exports.Map = function Map (data){
  this.MapID = exports.checkSumMap(data);
  this.Offset = data.Offset;
  this.Width = data.Width;
  this.Stride = data.Stride;
  this.Height = data.Height;
  this.Resolution = data.Resolution;
  this.creationDate = Date.now(); // TimeStamp
}


// -- Objet POI (Pont d'intêret sur la carte)
// Ontologie amo:Poi >>>> MuseumPointOfInterest
exports.Poi = function Poi (data){
  this.Name = data.Name; // hasName (String)
  this.Pose = data.Pose; // - hasPosY (decimal) , hasPosY (decimal), hasOrientation (decimal)
  if (data.Label) this.Label = data.Label; 
  if (data.MapID) this.MapID = data.MapID; // propre à MonGodb
  if (data.SceneID) this.SceneID = data.SceneID; // linkedTo (SceneMusee)
  if (data.Label) this.Label = data.Label; // 
  if (data.Description) this.Description = data.Description; // 
  if (data.Sparql) this.Sparql = data.Sparql; // propre à MonGodb
  if (data.creationDate) this.creationDate = data.creationDate; // TimeStamp propre à MonGodb
  if (data.lastUpdate) this.lastUpdate; // TimeStamp propre à MonGodb
  if (data.active) this.active; // TimeStamp propre à MonGodb
}



// 2ème phase: Association N POIs <> 1 Scene
//--  Objet Scene
// Ontologie amo:SceneMusee >>> à traduire en MuseumScene
exports.Scene = function Scene (data){
  this.SceneId = data.SceneId; // SceneNumber
  this.MapID = data.MapId; // todo ?? dans l'ontologie)
  this.PoisIds = data.PoisIds; // [] --- linkedTo (Facultatif pour MonGoDB)
  this.Name = data.Name; // dc:Title 
  this.Description = data.Description; // hasDescription
  
  // - ComposeOfObject (ObjectMusee) ex Mitrailleuse_de_Saint_Etienne , Mortier_de_Tranchée
  // - hasCenter (Point) ex point_1
  // - hasRadius (decimal) 3
  // >>>>>> object Point 
  this.Boxing;  // - - hasPosY (decimal) , hasPosY (decimal), hasRadius (decimal)
  this.creationDate = Date.now(); // TimeStamp - Propre a Mongodb
  if (data.lastUpdate) this.lastUpdate; // TimeStamp - Propre a Mongodb
  
}

// 3ème phase: Association N Scenes <> 1 Visite
// -- Objet Visite
// Ontologie amo: MuseumTrail
exports.Visite = function Visite (data){
  this.VisiteId = data.VisiteId;
  this.MapID = data.MapID;
  this.ScenesId = data.ScenesId; // []
  this.Name = data.Name;
  this.Description = data.Description;
  this.Sparql = data.Sparql;
  this.creationDate = Date.now(); // TimeStamp
}



// pour détecter tout changements dans une carte
exports.checkSumMap = function(map) {
    var checksum = map.Offset.X + map.Offset.Y + map.Width + map.Stride + map.Height +map.Resolution;
    return checksum;
}


// pour détecter tout changements dans la liste de POI
// ordre, composition, noms différents, coordonnées x,y et theta
exports.checkSumListPOI = function(listPOI) {
  idText = "";
  idPOS = 0;
  for (poi in listPOI) {
    idText += listPOI[poi].Name;
    idPOS = listPOI[poi].Pose.X;
    idPOS += listPOI[poi].Pose.Y;
    idPOS += listPOI[poi].Pose.Theta;
  }
  var checkSum = idText += idPOS;
  return checkSum;
}

// pour détecter tout changements dans un POI
exports.checkSumPOI = function (poi) {
  idText = poi.Name;
  idPOS = poi.Pose.X+poi.Pose.Y+poi.Pose.Theta;
  var checkSum = idText += idPOS;
  return checkSum;
}
/**/






})(typeof exports === 'undefined'? this['models']={}: exports);