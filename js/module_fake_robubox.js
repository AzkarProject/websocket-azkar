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

// Todo: Passer en mode export
console.log("module_fake_robubox chargé")

fakeRobubox = appSettings.isFakeRobubox();
// if (typeof appCNRS != 'undefined') fakeRobubox = appCNRS.isFakeRobubox();

// Si existence d'un configuration spécifique à la branche de dev:
if (typeof appDevBranch != 'undefined') fakeRobubox = appDevBranch.isFakeRobubox();


function getFakeDataMap() {

    var dataMap = {"Offset":{"X":-20.7969943946,"Y":-3.02713963867},"Width":1485,"Stride":1488,"Height":1187,"Data":[0,0,0],"Resolution":0.019999999553}
    return dataMap;
}


function getFakeRobotInfo() {


    var robotInfo = {"Pose":{"Orientation":0.014824313679471759,"Position":{"X":-0.01693115491662614,"Y":-0.011192893436510892,"Z":0}},"State":8,"Timestamp":2916720}
    return robotInfo;

}




function getFakelistPOI() {
    
    console.log("getFakelistPOI()")

    var listPOI = [{"Name":"PilierA","Pose":{"X":2.3736454829404003,"Y":6.2584240093506871,"Theta":0}},{"Name":"PilierB","Pose":{"X":2.1479895820222588,"Y":11.719296811569686,"Theta":0}},{"Name":"PilierC","Pose":{"X":-10.172822608108211,"Y":11.222853829549779,"Theta":0}},{"Name":"PilierD","Pose":{"X":-10.263084968475466,"Y":5.8973745678816627,"Theta":0}}]

    console.log(listPOI);

    return listPOI;

}



function getFakeBattery() {
    var battery ={
		"Properties":{
			"Critical":10,
			"Power":20,
			"Voltage":24
		},
		"Remaining":66,
		"Status":2,
		"Timestamp":14636000
	}
	return battery;
}