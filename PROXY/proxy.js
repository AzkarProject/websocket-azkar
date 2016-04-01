//  http://www.hacksparrow.com/express-js-https.html
//  https://github.com/Rob--W/cors-anywhere
//  53JS

var host = process.env.PORT ? '0.0.0.0' : '127.0.0.1';
var port = process.env.PORT || 443;
var fs = require('fs');

var https_options = {
  key: fs.readFileSync('./ssl/hacksparrow-key.pem'),
  cert: fs.readFileSync('./ssl/hacksparrow-cert.pem')
};

var cors_proxy = require('cors-anywhere');



var server = cors_proxy.createServer({
    httpsOptions : https_options,
    originWhitelist: [], // Allow all origins
    removeHeaders: ['cookie', 'cookie2']
});

var komcomProxy = require('./komcom-proxy.js')(server);

//require('./lib/komcom-ws.js')(server);

komcomProxy.listen(port, host, function() {
    console.log('Running CORS Anywhere on ' + host + ':' + port);
});

/**/




