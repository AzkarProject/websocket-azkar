'use strict';

var Router = require('wamp.rt');

function komcomWS(server) {

	console.log('| Starting KomCom WebSocket Server');

	function onRPCRegistered(uri) {
		console.log('onRPCRegistered RPC registered', uri);
	}

	function onRPCUnregistered(uri) {
		console.log('onRPCUnregistered RPC unregistered', uri);
	}

	function onPublish(topicUri, args) {
		console.log('onPublish Publish', topicUri, args);
	}

	var router = new Router({ server: server });

	router.on('RPCRegistered', onRPCRegistered);
	router.on('RPCUnregistered', onRPCUnregistered);
	router.on('Publish', onPublish);
	console.log('la');
	return router;
}

module.exports = komcomWS;
