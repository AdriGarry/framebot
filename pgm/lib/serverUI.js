#!/usr/bin/env node
// Module http

var _http = require('http');
var _url = require('url');
var _fs = require('fs');
var _utils = require('./utils.js');
var _tts = require('./tts.js');

var server = _http.createServer(function(req, res){
	// console.log(req);

	var path = _url.parse(req.url,true).pathname;
	// console.log(path);

	var params = _url.parse(req.url,true).query;
	console.log('path : ' + path + ' params : ');
	console.log(params);

	// res.writeHead(200);
	// _utils.prepareLogs(1000, function(log){
	// 	res.end(log);
	// });
	
	// res.end('Hey, I\'m Odi !\r\nSome very good things to come...');
	res.writeHead(200, {"Content-Type": "text/html"});
	res.end(_fs.readFileSync('/home/pi/odi/pgm/web/index.html', 'UTF-8').toString());
	
	
	// console.log(res);

	if(path == '/odi'){
		_utils.restartOdi();
	}
});

server.listen(8080);
console.log('Listening port 8080');
// _tts.speak('fr', 'hey! je suis connecter');
_tts.speak('en', 'I\'m connected to the world !:1');
