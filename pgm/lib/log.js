#!/usr/bin/env node
// Module log
var log = function(){

var fs = require('fs');
var request = require('request');
var http = require('http');
var _leds = require('./leds.js');
var leds = new _leds();
var _utils = require('./utils.js');
var utils = new _utils();
var _tts = require('./tts.js');
var tts = new _tts();

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
	try{
		// console.log('Try Exporting Log...');
		var logFilePath = '/home/pi/odi/log/odi.log';
		var content = fs.readFileSync(logFilePath, 'UTF-8').toString().split('\n');
		content = content.slice(-60);
		content = content.join('\n');
		
		request.post({
			url:'http://adrigarry.com/odiTools/whatsup.php',
			body: content,
			log: content,
			headers: {'Content-Type': 'text/plain'}
		},
		function (error, response, body){
			if(error){
				console.error('Error Exporting Log  /!\\');	
			}else if(!error && response.statusCode == 200){
				leds.blinkSatellite(180,1.15);
				console.log('body' + body);
				// if(body.trim() == '') body = 'No message.';
				if(typeof body === 'undefined') body = '';
				if(body.indexOf('!DOCTYPE') == -1){
					messages = body.split('\r\n');
					var lg, txt;
					for(i=messages.length-1;i>0;i--){
						console.log(i + ' Message(s) TTS from OdiWeb');
						txt = messages[i];
						if(txt != undefined){
							txt = txt.split(';');
							lg = txt[0];
							txt = txt[1];
							var timeMessage = txt ? txt.length/5 : 'undefined';
							console.log(lg.toUpperCase() + ' > "' + txt + '"  [' + timeMessage + ']');
							if(lg == 'cmd'){
								if(txt == 'reboot'){
									powerInstance.reboot();
								} else if(txt == 'shutdown' || txt == 'halt') {
									powerInstance.shutdown();
								} else if(txt == 'odi') {
									powerInstance.restartOdi();
								} else if(txt == 'mute') {
									deploy = spawn('sh', ['/home/pi/odi/pgm/sh/mute.sh']);
									console.log('>> MUTE ALL  :|');
								} else if(txt == 'jukebox') {
									console.log('Blue Btn >> Jukebox Loop !');
									deploy = spawn('sh', ['/home/pi/odi/pgm/sh/jukebox.sh']);
									utilsInstance.autoMute();
								} else if(txt == 'jukebox m' || txt == 'medley') {
									console.log('Blue Btn >> Medley Jukebox !!');
									deploy = spawn('sh', ['/home/pi/odi/pgm/sh/jukebox.sh', 'medley']);
									utilsInstance.autoMute();
								} else if (txt == 'party') {
									clockInstance.setParty();
								} else {
									tts.speak('','');
								}
							} else {
								setTimeout(function(lg, txt){
									tts.speak(lg,txt);
								}.bind(this, lg, txt), timeMessage*1000);
							}
						}
					}
					// console.log('Clearing messages!');
					request('http://adrigarry.com/odiTools/clearTTS.php', function (error, response, body){});
				}
				console.log('Export Log && Check Messages OK !!!!!!!!!!');
			}
		});
	}catch(e){
		console.error('Exception Exporting Log  /!\\ /!\\');
	}			
}
}
module.exports = log;