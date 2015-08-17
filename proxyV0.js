




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

var app = require('express')();
var connect = require('connect');

//autoriser le CORS
app.use(function(req, res,next){
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
 });

var server = http.createServer(app);

app.get('/', function (b_req , b_res) {
  
  var b_url = url.parse(b_req.url, true);
    if (!b_url.query || !b_url.query.url) return notFound(b_res);

    //read and parse the url parameter ( ?url=p_url )
    var p_url = url.parse(b_url.query.url);
   // console.log('cicici',p_url);
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
});

app.post('/', function (b_req , b_res) {
  
  var b_url = url.parse(b_req.url, true);
    if (!b_url.query || !b_url.query.url) return notFound(b_res);

    console.log("la requeste du browser", b_req) ;

    //read and parse the url parameter ( ?url=p_url )
    var p_url = url.parse(b_url.query.url);

    // Initialize HTTP Client
    var p_client = http.createClient(p_url.port || 80, p_url.hostname);

    //send Request 
    var p_req = p_client.request('POST', p_url.pathname || "/", {
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
});





server.listen(port, function () {

console.log("Server proxy is running at ip:port  --->> : " + ip + ":" + port);
        
});




