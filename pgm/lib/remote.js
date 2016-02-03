#!/usr/bin/env node
// Module Remote

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
var party = require('./party.js');
var service = require('./service.js');
var utils = require('./utils.js');
var self = this;

var check = function(){
	try{
		var logFilePath = '/home/pi/odi/log/odi.log';
		var content = fs.readFileSync(logFilePath, 'UTF-8').toString().split('\n');
		content = content.slice(-100); //-120
		content = content.join('\n');
		
		request.post({
			url:'http://adrigarry.com/odiTools/remote.php',
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
									utils.reboot();
								} else if(txt == 'shutdown' || txt == 'halt') {
									utils.shutdown();
								} else if(txt == 'odi') {
									utils.restartOdi();
								} else if(txt == 'mute') {
									deploy = spawn('sh', ['/home/pi/odi/pgm/sh/mute.sh']);
								} else if(txt == 'jukebox') {
									jukebox.loop();
								} else if(txt == 'jukebox m' || txt == 'medley') {
									jukebox.medley();
								} else if (txt == 'party') {
									party.setParty();
								} else if(txt == 'timer') {
									timer.setTimer();
								} else if(txt == 'fip') {
									fip.playFip();
								} else if(txt == 'exclamation') {
									exclamation.exclamation2Rappels();
								} else if(txt == 'tts') {
									tts.speak('','');
								} else if(txt == 'serviceDate') {
									service.date();
								} else if(txt == 'serviceTime') {
									service.time();
								} else if(txt == 'serviceWeather') {
									service.weather();
								} else if(txt == 'serviceInfo') {
									service.info();
								} else if(txt == 'serviceCpu') {
									service.cpuTemp();
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
				console.log('Log/Msg Ok.');
			}
		});
	}catch(e){
		console.error('Exception Export Log && Check Messages   /!\\ /!\\');
	}			
}
exports.check = check;
