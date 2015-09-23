(function(exports){

exports.appName = function(){
    return 'AZKAR 1toN';
};

exports.appVersion = function(){
    return '0.8.3.3';
};

exports.appHostName = function(){
    return 'websocket-azkar';
};

exports.appBranch = function(){
    return '1to1-refacto';
};

exports.isRobubox = function(){
    return false;
};

})(typeof exports === 'undefined'? this['settings']={}: exports);
