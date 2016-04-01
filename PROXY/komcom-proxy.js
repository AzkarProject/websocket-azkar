var httpProxy = require('http-proxy'),
	http = require('http'),
	https = require('https'),
	fs = require('fs'),
	morgan = require('morgan');


function komcomProxy(server)  {
	var logger = morgan(':remote-addr - :remote-user [:date[clf]] ":method :req[host]:url HTTP/:http-version"' +
	' :status :res[content-length] ":referrer" ":user-agent"');

	console.log('| Starting Proxy');

	var proxy = httpProxy.createProxyServer({});

	var options = {
		'127.0.0.1': '3000'
	};

	var web = function(req, res) {
		logger(req, res, function() {
			if (options[req.headers.host]) {
				proxy.web(req, res, {
					target: {
						host: '127.0.0.1',
						port: options[req.headers.host]
					}
				});
			} else {
				res.writeHead(403, {
					'Content-Type': 'text/plain'
				});
				res.end('Forbidden.');
			}
		});
	};

	var upgrade = function(req, socket, head) {
		logger(req, socket, function() {
			if (options[req.headers.host]) {
				proxy.ws(req, socket, head, {
					target: {
						host: '127.0.0.1',
						port: options[req.headers.host]
					}
				});
			} else {
				socket.end('HTTP/1.1 403 Forbidden\r\n');
			}
		});
	};

	var error = function(err, req, res) {
		console.log('Un erreur est survenue.', err);
		if (res.writeHead) {
			res.writeHead(500, {
				'Content-Type': 'text/plain'
			});
			res.end('Something went wrong.');
		}
	};

	proxy.on('error', error);
	console.log('here');

	server.on('upgrade', upgrade);

	return server;
/*
	return {
		'request' : web,
		'upgrade' : upgrade
	}*/

}

module.exports = komcomProxy;
