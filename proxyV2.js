var http = require('http'),
    httpProxy = require('http-proxy');

 var ip = 'http://localhost' ; 
 var port = 8080 ; 


 var app = require('express')();
var connect = require('connect');


//
// Create your proxy server and set the target in the options.
//
httpProxy.createProxyServer({target: 'http://localhost:50000'}).listen(port);

//
// Create your target server
//


http.createServer(function(req, res , next) {
   	res.setHeader("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
    
    res.writeHead(200, {
        'Content-Type': 'text/plain'
    });
    res.write('request successfully proxied!' + '\n' + JSON.stringify(req.headers, true, 2));
    res.end();
   
}).listen(50000);

  console.log("Server proxy is running at ip:port  --->> : " + ip + ":" + port);