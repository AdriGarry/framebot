#!/usr/bin/env node
// Module Http

var http = function(){

//var sys = require('sys')
//var spawn = require('child_process').spawn;
//var exec = require('child_process').exec;
//var Gpio = require('onoff').Gpio;
//var leds = require('./leds.js');
//var ledsInstance = new leds();

var http = require('http');

var self = this;

var instance = false;
//var interval;
var i=0;
self.listenHttp = function(){
	console.log('Serveur http started, listening for request...');
	var server = http.createServer(function(req, res) {
		//res.writeHead(200);
		res.writeHead(200, {"Content-Type": "text/html"});
		res.end('<h1>Odi says Hi !!</h1><h2>i = ' + i + '</h2>');
		console.log('Serveur http...answering !');
		i++;
		
		/*for(var i=0; i < 10; i++){
			res.end('<h1>Odi says Hi !!</h1><h2>i = ' + i + '</h2>');
			console.log('Serveur http...answering !');
		}*/
		/*var i=0;
		interval = setInterval(function(){
			res.end('<h1>Odi says Hi !!</h1><h2>i = ' + i + '</h2>');
			console.log('Serveur http...answering !');
			i++;
		}, 1000);*/
	});
	server.listen(8080);
};


/*self.sendConsole = function(){
	console.log('Serveur http... starting... listening !!');
	var server = http.createServer(function(req, res) {
		res.writeHead(200, {"Content-Type": "text/html"});
			res.end('<h1>Odi says Hi !!</h1><h2>i = ' + i + '</h2>');
			i++;
	});
	server.listen(8080);
};*/

}
module.exports = http;