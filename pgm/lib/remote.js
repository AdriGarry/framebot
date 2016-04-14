#!/usr/bin/env node
// Module Remote

var log = 'Odi/ ';
var fs = require('fs');
var request = require('request');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var leds = require('./leds.js');
var utils = require('./utils.js');
var timer = require('./timer.js');
var fip = require('./fip.js');
var jukebox = require('./jukebox.js');
var exclamation = require('./exclamation.js');
var tts = require('./tts.js');
// var EventEmitter = require('events').EventEmitter;
// var event = new EventEmitter();
// var clock = require('./clock.js');
var service = require('./service.js');
var party = require('./party.js');
var self = this;

// var voiceMailFilePath = '/home/pi/odi/log/voicemail.log';
var voiceMailFilePath = '/home/pi/odi/pgm/tmp/voicemail.log';
var check = function(mode){
	try{
		if(typeof mode === 'undefined') mode = '';
		var logFilePath = '/home/pi/odi/log/odi.log';
		var content = fs.readFileSync(logFilePath, 'UTF-8').toString().split('\n');
		content = content.slice(-120);
		content = content.join('\n');
		
		request.post({
			url:'http://adrigarry.com/odiTools/remote.php',
			body: content,
			log: content,
			headers: {'Content-Type': 'text/plain'}
			// headers: {'Content-Type': 'text/plain;charset=utf8'}
		},
		function (error, response, body){
			if(mode.indexOf('log') > -1){
				// console.log('remote.check(' + mode + ') ==> break;');
				console.log('Log Ok');
				return;
			}else if(error){
				console.error('Error Exporting Log  /!\\  ' + error);
			}else if(!error && response.statusCode == 200){
				leds.blinkSatellite(180,1.15);
				if(typeof body === 'undefined') body = '';
				if(body.indexOf('!DOCTYPE') == -1){
					// console.log('A_: ' + body);
					// body = body.toString("utf8");
					// console.log('B_: ' + body);
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
									utils.reboot();
								}else if(txt == 'shutdown' || txt == 'halt'){
									utils.shutdown();
								}else if(txt == 'odi'){
									utils.restartOdi();
								}else if(txt == 'sleep'){
									utils.restartOdi('sleep');
								}else if(txt == 'sleepWakeUp'){
									utils.restartOdi('sleepWakeUp');
								}else if(txt == 'mute') {
									// deploy = spawn('sh', ['/home/pi/odi/pgm/sh/mute.sh']);
									utils.mute();
								}else if(txt == 'lastTTS' && mode.indexOf('sleep') == -1){
									tts.lastTTS();
								}else if(txt == 'jukebox' && mode.indexOf('sleep') == -1){
									jukebox.loop();
								}else if(txt == 'jukebox m' || txt == 'medley' && mode.indexOf('sleep') == -1) {
									jukebox.medley();
								}else if (txt == 'party' && mode.indexOf('sleep') == -1){
									party.setParty();
								}else if(txt == 'timer' && mode.indexOf('sleep') == -1){
									timer.setTimer();
								}else if(txt == 'fip' && mode.indexOf('sleep') == -1){
									fip.playFip();
								}else if(txt == 'cigales' && mode.indexOf('sleep') == -1){
									deploy = spawn('sh', ['/home/pi/odi/pgm/sh/sounds.sh', 'cigales']);
								}else if(txt == 'exclamation' && mode.indexOf('sleep') == -1){
									exclamation.exclamation2Rappels();
								// }else if(txt == 'tts' && mode.indexOf('sleep') == -1){
									// tts.speak('','');
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
								}else if(txt == 'urss' && mode.indexOf('sleep') == -1){
									deploy = spawn('sh', ['/home/pi/odi/pgm/sh/music.sh', 'urss']);
								}else if(txt == 'test' && mode.indexOf('sleep') == -1){
									deploy = spawn('sh', ['/home/pi/odi/pgm/sh/music.sh', 'mouthTrick']);
								}else if(mode.indexOf('sleep') == -1){
									tts.speak('','');
								}else{
									console.log('Odi not allowed to interact  -.-');
								}
							}else{
								 if(mode.indexOf('sleep') > -1){
									console.log('New VoiceMail : ' + lg + ' / ' + txt);
									var message = '\r\n' + lg + ';' + txt; // AJOUTER HEURE + DATE ??
									// var voiceMailFilePath = '/home/pi/odi/log/voicemail.log';
									fs.appendFile(voiceMailFilePath, message, function(err){
										if(err) console.error(err);
									});
								 }else{
									 tts.speak(lg,txt);
								 }
								// setTimeout(function(lg, txt){
								// tts.speak(lg,txt);
								// }.bind(this, lg, txt), timeMessage*1000);
							}
						}
					}
					// console.log('Clearing messages!');
					request('http://adrigarry.com/odiTools/clearTTS.php', function (error, response, body){});
				}
				console.log('Log/Msg Ok [' + mode + ']');
			}
		});
	}catch(e){
		console.error('Exception Export Log && Check Messages   /!\\ /!\\');
	}			
}
exports.check = check;

var checkVoiceMail = function(){
	try{
		console.log('Checking VoiceMail...');
		var messages = fs.readFileSync(voiceMailFilePath, 'UTF-8').toString().split('\n');
		console.log(messages);
		var msgDelay = 1;
		for(i=messages.length;i>0;i--){ // CHANGER SENS
			var z = messages[i];
			if(typeof z !== 'undefined'){
				// console.error(z);
				// waitAndDo(3);
				setTimeout(function(z){
					txt = messages[i].split(';');
					lg = txt[0];
					txt = txt[1];
					console.error(lg,txt);
					// tts.speak(lg,txt);
					msgDelay = msgDelay + 5;
				// }.bind(this,z), msgDelay*1000);
				}, msgDelay*1000);
			}
		}
	}catch(e){
		console.error(e);
	}
}
exports.checkVoiceMail = checkVoiceMail;

/*function waitAndDo(times) {
	if(times < 1) {
		return;
	}
	setTimeout(function(){
		// Do something here
		console.log('Doing a request');
		waitAndDo(times-1);
	}, 1000);
}*/
var TTSMessage = function(lg, txt){
	setTimeout(function(lg, txt){
		txt = messages[i].split(';');
		lg = txt[0];
		txt = txt[1];
		tts.speak(lg,txt);
		msgDelay = msgDelay + 5;
	}.bind(this, lg, txt), msgDelay*1000);
}


var saveMessage = function(lg, txt){
	// try{
		// var contents = file.writeFileSync(voiceMailFilePath, 'test' + i, 'utf8');
		// fs.writeSyncFile(voiceMailFilePath, 'test' + i, 'utf8', function(error){
			// console.log('ERROR ' + error);
		// });
		console.log(lg + ';' + txt);
		// fs.appendFile(voiceMailFilePath, lg + ';' + txt, function (err){
		// });
		
		// console.log('callback : ' + callback);
		console.log('Message saved!');
		// fs.writeFile(voiceMailFilePath, 'test' + i, (error) => {
		// if(error) throw error;
			// console.log('Message saved!');
			i++;
		// });
	// }catch(e){
		// console.error('Exception VoiceMail   /!\\ /!\\');
		// console.error(e);
	// }
}
