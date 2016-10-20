#!/usr/bin/env node

// Module Remote

var log = 'Odi/ ';
var fs = require('fs');
var request = require('request');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var leds = require('./leds.js');
var utils = require('./utils.js');
var voiceMail = require('./voiceMail.js');
// var timer = require('./timer.js');
var fip = require('./fip.js');
var jukebox = require('./jukebox.js');
var exclamation = require('./exclamation.js');
var tts = require('./tts.js');
// var EventEmitter = require('events').EventEmitter;
// var event = new EventEmitter();
var service = require('./service.js');
var party = require('./party.js');
var self = this;

/** Fonction trySynchro : test connexion  */
exports.trySynchro = function trySynchro(mode){
	utils.testConnexion(function(connexion){
		if(connexion == true){
			self.synchro(mode);//mode
		} else {
			console.error('No network, I can\'t synchro with remote control /!\\');
			console.log('And I\'m a teapot !!');
		}
	});
}
// exports.trySynchro = trySynchro;



// REFACTORING REMOTE FONCTIONS...
// Attribuer dans une variable 
// mode.indexOf('sleep') == -1

exports.parseCommand = function parseCommand(){
	// Test des commandes et action
}

/** Fonction synchro : verification ordres et envoi logs */
var log;
var voiceMailFilePath = '/home/pi/odi/tmp/voicemail.log';
exports.synchro = function synchro(mode){
	//try{
		//console.error(mode);
		if(typeof mode === 'undefined') mode = '';
		var logs;
		utils.prepareLogs(120, function(log){
			logs = log;
		});
		request.post({
			url:'http://adrigarry.com/odiTools/remote.php',
			body: logs,
			log: logs,
			headers: {'Content-Type': 'text/plain'}
			// headers: {'Content-Type': 'text/plain;charset=utf8'}
		}, function (error, response, body){
			if(mode.indexOf('log') > -1){
				// console.log('remote.check(' + mode + ') ==> break;');
				console.log('Log Ok');
				return;
			}else if(error){
				console.error('Error synchro remote  /!\\  ' + error);
				// console.error('response : ' + response);
				// console.error('body : ' + body);
			}else if(!error && response.statusCode == 200){
				leds.blinkSatellite(180,1.15);
				if(typeof body === 'undefined') body = '';
				if(body.indexOf('!DOCTYPE') == -1){
					// console.log('A_: ' + body);
					// body = body.toString("utf8");
					// console.log('B_: ' + body);
					messages = body.split('\r\n');
					var lg, txt;
					for(i=messages.length;i>0;i--){
						// console.log(i + ' Message(s) TTS from OdiWeb ' + messages);
						txt = messages[i];
						if(txt != undefined){
							txt = txt.split(';');
							lg = txt[0];
							txt = txt[1];
							var timeMessage = txt ? txt.length/5 : 'undefined';
							if(lg == 'cmd'){
								console.log('REMOTE > ' + txt);
								if(txt == 'reboot'){
									utils.reboot();
								}else if(txt == 'shutdown'){
									utils.shutdown();
								}else if(txt == 'odi'){
									utils.restartOdi();
								}else if(txt.indexOf('sleep') >= 0){
									if(/\d/.test(txt)){
										var sleepTime = parseInt(txt.replace(/[^\d.]/g, ''), 10);
										utils.restartOdi(sleepTime);
									}else{
										utils.restartOdi(255);
									}
								}else if(txt == 'mute') {
									// deploy = spawn('sh', ['/home/pi/odi/core/sh/mute.sh']);
									utils.mute();
								}else if(txt == 'lastTTS' && mode.indexOf('sleep') == -1){
									tts.lastTTS();
								// A REVOIR !!!!!!!!!!!!!!!!!!!!!
								}else if(txt.indexOf('msg') >= 0 && mode.indexOf('sleep') == -1){
									voiceMail.addVoiceMailMessage(lg,txt.substring(3));
								}else if(txt == 'voiceMail' && mode.indexOf('sleep') == -1){
									if(!voiceMail.checkVoiceMail()){
										tts.new({voice: 'espeak', lg:'en', msg:'No voicemail message'});
									}
								}else if(txt == 'clearVoiceMail' && mode.indexOf('sleep') == -1){
									voiceMail.clearVoiceMail();
								}else if(txt == 'jukebox' && mode.indexOf('sleep') == -1){
									jukebox.loop();
								}else if(txt == 'jukebox m' || txt == 'medley' && mode.indexOf('sleep') == -1) {
									jukebox.medley();
								}else if (txt == 'party' && mode.indexOf('sleep') == -1){
									party.setParty();
								}else if(txt.indexOf('timer') >= 0 && mode.indexOf('sleep') == -1){
									if(/\d/.test(txt)){
										var min = parseInt(txt.replace(/[^\d.]/g, ''), 10);
										console.log('Remote timer for ' + min + ' minutes');
										timer.setTimer(min);
									}else{
										timer.setTimer();
									}
								}else if(txt == 'timer' && mode.indexOf('sleep') == -1){
									timer.setTimer();
								}else if(txt == 'fip' && mode.indexOf('sleep') == -1){
									fip.playFip();
								}else if(txt == 'cigales' && !mode){
									deploy = spawn('sh', ['/home/pi/odi/core/sh/sounds.sh', 'cigales']);
								}else if(txt.indexOf('exclamation') >= 0 && mode.indexOf('sleep') == -1){
									if(txt.toUpperCase().indexOf('LOOP') >= 0){
										exclamation.exclamationLoop();
									}else{
										// exclamation.exclamation2Rappels();
										exclamation.exclamation();
									}
								}else if(txt.indexOf('conversation') >= 0 && mode.indexOf('sleep') == -1){
									if(/\d/.test(txt)){
										var rdmNb = txt.replace(/[^\d.]/g, '');
										var rdmNb = parseInt(rdmNb, 10);
										console.log('Remote conversation random param : ' + rdmNb);
										tts.conversation(rdmNb);
									}else{
										tts.conversation('random');
									}
								}else if(txt == 'serviceDate' && mode.indexOf('sleep') == -1){
									service.date();
								}else if(txt == 'serviceTime' && mode.indexOf('sleep') == -1){
									service.time();
								}else if(txt == 'serviceWeather' && mode.indexOf('sleep') == -1){
									service.weather();
								}else if(txt == 'serviceInfo' && mode.indexOf('sleep') == -1){
									service.info();
								}else if(txt == 'serviceCpu' && mode.indexOf('sleep') == -1){
									service.cpuTemp();
								}else if(txt.indexOf('urss') >= 0 && mode.indexOf('sleep') == -1){
									deploy = spawn('sh', ['/home/pi/odi/core/sh/music.sh', txt]);
								}else if(txt == 'test' && mode.indexOf('sleep') == -1){
									deploy = spawn('sh', ['/home/pi/odi/core/sh/music.sh', 'mouthTrick']);
								// }else if(mode.indexOf('sleep') == -1){
								// 	tts.speak('','');
								}else{
									console.log('Odi not allowed to interact  -.-');
								}
							}else{
								 if(mode.indexOf('sleep') > -1){ // Saving message in voicemail
									voiceMail.addVoiceMailMessage(lg,txt);
								 }else{ // Saying message
									 // tts.speak(lg,txt);
									 tts.new({lg:lg, msg:txt});
								 }
							}
						}
					}
					// console.log('Clearing messages!');
					request('http://adrigarry.com/odiTools/clearTTS.php', function (error, response, body){});
				}
				if(mode == 'sleep') mode = 'S';
				// console.log('Log/Msg Ok [' + mode + '_' + messages + ']');
				console.log('Log/Msg Ok [' + mode + (messages != '' ?'_' + messages:'') + ']');
				// console.log(i + ' Message(s) TTS from OdiWeb ' + messages);
			}
		});
	/*}catch(e){
		console.error('Exception synchro remote controle   /!\\ /!\\ \n' + e);
		console.trace(e);
	}*/
}

