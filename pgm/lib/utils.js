#!/usr/bin/env node
// Module utilitaires

var utils = function(){

var log = 'Odi/ ';
var fs = require('fs');
var request = require('request');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var _leds = require('./leds.js');
var leds = new _leds();
var _tts = require('./tts.js');
var tts = new _tts();
var _power = require('./power.js');
var power = new _power();
var EventEmitter = require('events').EventEmitter;
var event = new EventEmitter();

var self = this;


self.mute = function(){
	var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/mute.sh']);
	console.log('>> MUTE ALL  :|');
	eye.write(0);
	belly.write(0);
	leds.clearLeds();
};

var muteTimer;
self.autoMute = function(message){
	clearTimeout(muteTimer);
	muteTimer = setTimeout(function(){
		//console.log('_EventEmited: ' + (message || '.'));
		var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/mute.sh', 'auto']);
		setTimeout(function(){
			deploy = spawn('sh', ['/home/pi/odi/pgm/sh/mute.sh']);
			console.log(message + ' > AUTO MUTE   :|');
			leds.clearLeds();
			eye.write(0);
			belly.write(0);
		}, 1600);
	}, 60*60*1000);
};

self.testConnexion = function(callback){
	require('dns').resolve('www.google.com', function(err) {
		if(err){
			//console.error('Odi is not connected to internet (utils.testConnexion)   /!\\');
			callback(false);
		}else{
			//console.log('Odi is online   :');
			callback(true);
		}
	});
};

var outputFile = '/home/pi/odi/log/odi.log';
self.recordLog = function(msg){
	try{
		var content = fs.readFileSync(outputFile, 'UTF-8');
	} catch(e){
		console.error(e);
		//throw new Error(msg + '\r\n' + e); 
		//this.recordLog(msg + '\r\n' + e);
	}
	content += '\r\n' + msg.trim();
	fs.writeFileSync(outputFile, content, 'UTF-8');
};

self.whatsup = function(){
	try{
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
									power.reboot();
								} else if(txt == 'shutdown' || txt == 'halt') {
									power.shutdown();
								} else if(txt == 'odi') {
									power.restartOdi();
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
		console.error('Exception Export Log && Check Messages   /!\\ /!\\');
	}			
}

self.sleepNode = function(sec, delay){
	/*if(delay){
		delay = 0;
	}*/
	//if(isNaN (parseFloat(delay)){
	//if(typeof delay == "number"){
	if(delay > 0){
		console.log('\nOdi is going to fall asleep in ' + delay + 'sec ...');
	} else {
		delay = 0;
		//console.log('_delay set to 0;');		
	}
	console.log('\nsleepNode: Odi falling asleep for ' + sec + 'sec !');
	setTimeout(function(){
		var wakeUp = new Date().getTime() + (sec * 1000);
		while (new Date().getTime() <= wakeUp) {
			; // <-- to sleep Node
		}
		console.log('\nsleepNode:       -->  Odi going on !!\n');
	}, delay*1000+1);	
};

self.getMsgLastGitCommit = function(callback){
	function getMsg(error, stdout, stderr){
		if(error) stdout = 'Error Git Last Commit Message  /!\\';
		console.log('LastGitCommitMsg : "' + stdout.trim() + '"');
		callback(stdout);
	}
	exec('git log -1 --pretty=%B',{cwd: '/home/pi/odi/'}, getMsg);
};

}
module.exports = utils;
