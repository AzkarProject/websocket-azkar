/*mise en place d'un proxy */
var sys = require('sys'),
    http = require('http'),
    request = require('request'),
    url = require('url');

//gestionna
function notFound(res) {
    res.writeHead(404, "text/plain");
    res.end("404 : File not found ");
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
}).listen(8000,"127.0.0.1");

console.log("Server running at http://127.0.0.1:8000/") ;
