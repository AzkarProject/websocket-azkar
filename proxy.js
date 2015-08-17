/*mise en place d'un proxy 
 
 -pour le tester il faut aller dans parametres du navigateur --> paramètres avancés --> paramètre du proxy et 
  décocher la case ==>  utiliser http 1.1 avec une connexion par proxy 

  Exemples de requetes qui fonctionne :
  -information sur la carte :  http://192.168.173.1:8080/127.0.0.1:50000/nav/maps/parameters
  -recuperer la carte en png : http://192.168.173.1:8080/127.0.0.1:50000/nav/maps/map
  -recuperer les informations sur la localisation : http://192.168.173.1:8080/127.0.0.1:50000/robulab/localization/localization

*/


// Heroku defines the environment variable PORT, and requires the binding address to be 0.0.0.0
var host = process.env.PORT ? '0.0.0.0' : '127.0.0.1';
var port = process.env.PORT || 8080;

var cors_proxy = require('cors-anywhere');
cors_proxy.createServer({
    originWhitelist: [], // Allow all origins
  //  requireHeader: ['origin', 'x-requested-with'],
    removeHeaders: ['cookie', 'cookie2']
}).listen(port, host, function() {
    console.log('Running CORS Anywhere on ' + host + ':' + port);
});
