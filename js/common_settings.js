(function(exports){

exports.appName = function(){
    return 'AZKAR 1toN';
};

exports.appVersion = function(){
    return '0.9.5.0';
};

exports.appHostName = function(){
    return 'websocket-azkar';
};

exports.appBranch = function(){
    return '1to1-refacto';
};

exports.isRobubox = function(){
    var user = getCookie("username");
    if (user == "Thaby") return true; 
 	else return false;
 	// return false;
};


})(typeof exports === 'undefined'? this['settings']={}: exports);
