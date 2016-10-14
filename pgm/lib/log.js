#!/usr/bin/env node

// Module Log

var spawn = require('child_process').spawn;
var fs = require('fs');

var outputFile = '/home/pi/odi/log/odiNode.log';
var recordLog = function(msg){
	try{
		var content = fs.readFileSync(outputFile, 'UTF-8');
	}catch(e){
		console.error(e);
		//this.recordLog(msg + '\r\n' + e);
	}
	content += '\r\n' + msg;//.trim();
	fs.writeFileSync(outputFile, content, 'UTF-8');
};
exports.recordLog = recordLog;

var cleanLog = function(){
	var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/log.sh', 'clean']);
};
exports.cleanLog = cleanLog;
