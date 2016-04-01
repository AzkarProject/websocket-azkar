'use strict';

var express = require('express');

console.log('| Starting KomCom Web Server');

var app = express();

app.get('/', function(req, res) {
	res.send('Welcome on KomCom!');
});

module.exports = app;