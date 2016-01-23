#!/usr/bin/env node
// Module log
var log = function(){

var fs = require('fs');
var request = require('request');
var http = require('http');
var leds = require('./leds.js');
var ledsInstance = new leds();
var utils = require('./utils.js');
var utilsInstance = new utils();

var self = this;
var content;
var date;
var outputFile = '/home/pi/odi/log/odi.log';

var cp;

self.output = function(msg){
	try{
		var content = fs.readFileSync(outputFile, 'UTF-8');
	} catch(e){
		console.error(e);
		//throw new Error(msg + '\r\n' + e); 
		//this.output(msg + '\r\n' + e);
	}
	content += '\r\n' + msg.trim();
	fs.writeFileSync(outputFile, content, 'UTF-8');
};

self.exportLog = function(){
	// utilsInstance.testConnexion(function(connexion){
		// if(connexion == true){
			try{
				// console.log('Try Exporting Log...');
				var logFilePath = '/home/pi/odi/log/odi.log';
				var content = fs.readFileSync(logFilePath, 'UTF-8').toString().split('\n');
				content = content.slice(-60);
				content = content.join('\n');
				
				request.post({
					url:'http://adrigarry.com/odiTools/getLog.php',
					body: content,
					log: content,
					headers: {'Content-Type': 'text/plain'}
				},
				function (error, response, body){
					if(error){
						console.error('Error Exporting Log  /!\\');	
					}else if(!error && response.statusCode == 200){
						// console.log(body);
						ledsInstance.blinkSatellite(180,1.15);
						console.log('Export Log OK');
					}
				});
			}catch(e){
				console.error('Exception Exporting Log  /!\\ /!\\');
			}			
		// } else {
			// console.error('No network, can\'t export log  /!\\');
		// }
	// });	
}
}
module.exports = log;