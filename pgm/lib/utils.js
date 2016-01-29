#!/usr/bin/env node
// Module utilitaires

var log = 'Odi/ ';
var fs = require('fs');
var request = require('request');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var leds = require('./leds.js');
var timer = require('./timer.js');
var fip = require('./fip.js');
var jukebox = require('./jukebox.js');
var exclamation = require('./exclamation.js');
var tts = require('./tts.js');
var EventEmitter = require('events').EventEmitter;
var event = new EventEmitter();
var clock = require('./clock.js');

var self = this;

var mute = function(){
	var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/mute.sh']);
	console.log('>> MUTE ALL  :|');
	eye.write(0);
	belly.write(0);
	leds.clearLeds();
};
exports.mute = mute;

var muteTimer;
var autoMute = function(message){
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
exports.autoMute = autoMute;

var testConnexion = function(callback){
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
exports.testConnexion = testConnexion;

var outputFile = '/home/pi/odi/log/odi.log';
var recordLog = function(msg){
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
exports.recordLog = recordLog;

var whatsup = function(){
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
				// console.log('body ' + body);
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
							if(lg == 'cmd'){
								console.log('REMOTE > ' + txt);
								if(txt == 'reboot'){
									self.reboot();
								} else if(txt == 'shutdown' || txt == 'halt') {
									self.shutdown();
								} else if(txt == 'odi') {
									self.restartOdi();
								} else if(txt == 'mute') {
									deploy = spawn('sh', ['/home/pi/odi/pgm/sh/mute.sh']);
								} else if(txt == 'jukebox') {
									jukebox.loop();
								} else if(txt == 'jukebox m' || txt == 'medley') {
									jukebox.medley();
								} else if (txt == 'party') {
									clock.setParty();
								} else if(txt == 'timer') {
									timer.setTimer();
								} else if(txt == 'fip') {
									fip.playFip();
								} else if(txt == 'exclamation') {
									exclamation.exclamation2Rappels();
								} else if(txt == 'tts') {
									tts.speak('','');
								} else if(txt == 'sayTime') {
									var date = new Date();
									var hour = date.getHours();
									var min = date.getMinutes();
									console.log('REMOTE > What\'s time is it ?   It\'s ' + hour + ':' + min);
									tts.speak('fr', 'Il est ' + hour + ' heures ' + min);
								} else {
									tts.speak('','');
								}
							} else {
								console.log(lg.toUpperCase() + ' > "' + txt + '"  [' + timeMessage + ']');
								setTimeout(function(lg, txt){
									tts.speak(lg,txt);
								}.bind(this, lg, txt), timeMessage*1000);
							}
						}
					}
					// console.log('Clearing messages!');
					request('http://adrigarry.com/odiTools/clearTTS.php', function (error, response, body){});
				}
				console.log('Export Log && Check Messages OK !');
			}
		});
	}catch(e){
		console.error('Exception Export Log && Check Messages   /!\\ /!\\');
	}			
}
exports.whatsup = whatsup;

var sleepNode = function(sec, delay){
	/*if(delay){
		delay = 0;
	}*/
	//if(isNaN (parseFloat(delay)){
	//if(typeof delay == "number"){
	if(delay > 0){
		console.log('\nOdi is going to fall asleep in ' + delay + 'sec ...');
	} else {
		delay = 0; //console.log('_delay set to 0;');		
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
exports.sleepNode = sleepNode;

var getMsgLastGitCommit = function(callback){
	function getMsg(error, stdout, stderr){
		if(error) stdout = 'Error Git Last Commit Message  /!\\';
		console.log('LastGitCommitMsg : "' + stdout.trim() + '"');
		callback(stdout);
	}
	exec('git log -1 --pretty=%B',{cwd: '/home/pi/odi/'}, getMsg);
};
exports.getMsgLastGitCommit = getMsgLastGitCommit;

var reboot = function(){
	tts.speak('fr','A tout de suite !');
	self.whatsup();
	deploy = spawn('sh', ['/home/pi/odi/pgm/sh/mute.sh']);
	deploy = spawn('sh', ['/home/pi/odi/pgm/sh/sounds.sh', 'reboot']);
	console.log('_/!\\__REBOOTING RASPBERRY PI !!');
	// deploy = spawn('omxplayer', ['/home/pi/odi/mp3/sounds/autres/beback.mp3', '-o local']);
	setTimeout(function(){
		deploy = spawn('sh', ['/home/pi/odi/pgm/sh/shutdown.sh', 'reboot']);
	}, 2000);
};
exports.reboot = reboot;

var shutdown = function(){
	tts.speak('fr','Arret du systeme !');
	self.whatsup();
	deploy = spawn('sh', ['/home/pi/odi/pgm/sh/mute.sh']);
	deploy = spawn('sh', ['/home/pi/odi/pgm/sh/sounds.sh', 'shutdown']);
	// deploy = spawn('omxplayer', ['-o local', '/home/pi/odi/mp3/sounds/autres/sessionOff.mp3']);
	console.log('_/!\\__SHUTING DOWN RASPBERRY PI !!');
	setTimeout(function(){
		deploy = spawn('sh', ['/home/pi/odi/pgm/sh/reInit_log.sh']);
		deploy = spawn('sh', ['/home/pi/odi/pgm/sh/shutdown.sh']);
	}, 2000);
};

self.restartOdi = function(){
	//tts.speak('en','Restarting Ody ! !');
	console.log('Restarting Odi !!');
	setTimeout(function(){
		process.exit();
	}, 1000);
};
exports.shutdown = shutdown;