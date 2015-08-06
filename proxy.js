/*mise en place d'un proxy 
 
 -pour le tester il faut aller dans parametres du navigateur --> paramètres avancés --> paramètre du proxy et 
  décocher la case ==>  utiliser http 1.1 avec une connexion par proxy 

  Exemples de requetes qui fonctionne :
  -information sur la carte :  http://192.168.173.1:8080/?url=http://127.0.0.1:50000/nav/maps/parameters
  -recuperer la carte en png : http://192.168.173.1:8080/?url=http://127.0.0.1:50000/nav/maps/map
  -recuperer les informations sur la localisation : http://192.168.173.1:8080/?url=http://127.0.0.1:50000/robulab/localization/localization

*/
var http = require('http'),
    request = require('request'),
    url = require('url');


var ip = "192.168.173.1"; //ou si nous sommes en local  127.0.0.1 
var port = 8080; // si nous voulons faire des requetes http sinon un autre port pour le tester en local

//gestionnaire d'eereur 
function notFound(res) {
    res.writeHead(404, "text/plain");
    res.end("404 : File not found || votre fichier n'existe pas ");
}

http.createServer(function(b_req, b_res) {
    //parse the request's url cette fonction prend en arg un string et  permet de retourner un objet url 
    var b_url = url.parse(b_req.url, true);
    if (!b_url.query || !b_url.query.url) return notFound(b_res);

    //read and parse the url parameter ( ?url=p_url )
    var p_url = url.parse(b_url.query.url);

    // Initialize HTTP Client
    var p_client = http.createClient(p_url.port || 80, p_url.hostname);

    //send Request 
    var p_req = p_client.request('GET', p_url.pathname || "/", {
        host: p_url.hostname
    });
    p_req.end();

    //Listen for the response : gestionnaire de reponse 
    p_req.addListener('response', function(p_res) {
        //pass through headers
        b_res.writeHead(p_res.statusCode, p_res.headers);

        //pass through data
        p_res.addListener('data', function(chunck) {
            b_res.write(chunck);
        });

        //End request 
        p_res.addListener('end', function() {

            b_res.end();
        })

    });
}).listen(port, ip);

console.log("Server running at ip:port  --->> : " + ip + ":" + port);

// Chargement de la page index.html
http.get('/', function(req, res) {
    res.sendFile(__dirname + '/cartographie.html');
});
