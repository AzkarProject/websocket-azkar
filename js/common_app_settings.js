/*
*
* Authors: Thierry Bergeron, Michel Buffa
* Copyright : © CNRS (Laboratoire I3S) / université de Nice
*
*/

// return "Copyright © CNRS (Laboratoire I3S) & université de Nice";

(function(exports){

exports.appName = function(){
    return 'AZKAR Project';
};

exports.appBranch = function(){
    return '1to1-refacto';
};

exports.appVersion = function(){
    return '0.9.9.8.1';
};

exports.appCredit = function(){
    return 'Copyright © CNRS (Laboratoire I3S) / université de Nice';
};

exports.appServerIp = function(){
	return "127.0.0.1";
}

exports.appServerPort = function(){
	return 80;
}

exports.isRobubox = function(){
    var user = getCookie("username");
    if (user == "Thaby") return true; 
 	//else return false;
 	return true;
};
/**/




})(typeof exports === 'undefined'? this['appSettings']={}: exports);
