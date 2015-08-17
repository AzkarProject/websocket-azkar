var http = require('http'),
    httpProxy = require('http-proxy');

 var ip = 'http://localhost' ; 
 var port = 8080 ; 
//
// Create your proxy server and set the target in the options.
//
httpProxy.createProxyServer({target: 'http://localhost:50000'}).listen(port);

//
// Create your target server
//


http.createServer(function(req, res) {
    res.writeHead(200, {
        'Content-Type': 'text/plain'
    });
    res.write('request successfully proxied!' + '\n' + JSON.stringify(req.headers, true, 2));
    res.end();
   
}).listen(50000);

  console.log("Server proxy is running at ip:port  --->> : " + ip + ":" + port);