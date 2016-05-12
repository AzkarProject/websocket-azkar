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

//fakeRobubox = true;

fakeRobubox = appSettings.isFakeRobubox();
// if (typeof appCNRS != 'undefined') fakeRobubox = appCNRS.isFakeRobubox();

// Si existence d'un configuration spécifique à la branche de dev:
if (typeof appDevBranch != 'undefined') fakeRobubox = appDevBranch.isFakeRobubox();


function getFakeDataMap() {
	var dataMap = {
        Height: 1171,
        Width:2384,
        Resolution: 0.2,
        Offset : {     
        	X: -25.864425741383123,
  			Y: -6.450160926629708
        }
    }
    return dataMap;
}


function getFakeRobotInfo() {
    var robotInfo = {
        Pose : { 
            Orientation : {
                X:0,
                Y:0,
                Z:0.4147678497279166
            },
            Position : {
                X:10,
                Y:3.5,
                Z:0
            },
        },
        Status: 8,
        Timestamp : 1563315020
    }
    return robotInfo;
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