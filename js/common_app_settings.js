(function(exports){

exports.appName = function(){
    return 'AZKAR Project';
};

exports.appVersion = function(){
    return '0.9.9.8.1';
};

exports.appCredit = function(){
    return 'Author: Thierry Bergeron - Copyright : © CNRS / Laboratoire I3S';
};

/*
exports.appHostName = function(){
    return 'websocket-azkar';
};
/**/

exports.appBranch = function(){
    return '1to1-refacto';
};


/*
exports.isBenchmark = function(){
 	return false;
};

exports.isFakeRobubox = function(){
 	return false;
};


exports.isRobubox = function(){
    var user = getCookie("username");
    if (user == "Thaby") return true; 
 	//else return false;
 	return true;
};
/**/




})(typeof exports === 'undefined'? this['appSettings']={}: exports);
