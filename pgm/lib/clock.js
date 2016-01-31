#!/usr/bin/env node
// Module Horloge & Alarmes

var spawn = require('child_process').spawn;
var utils = require('./utils.js');
var fip = require('./fip.js');
var jukebox = require('./jukebox.js');
var tts = require('./tts.js');
var service = require('./service.js');

var date = new Date();
var hour = date.getHours();
var pastHour = hour;
// var minRing = true;

var startClock = function(mode){
	if(!mode){
		console.log('Starting clock in quiet mode');
	}else{
		console.log('Starting clock in normal mode');
	}
	setInterval(function(){
		date = new Date();
		hour = date.getHours();
		min = date.getMinutes();
		console.log('mode before clock filter : ' + mode);
		if(!mode){
			var day = date.getDay();
			if(day > 0 && day < 6 && hour >= 7){
				mode = true;
			}else if(hour >=11){
				mode = true;
			}
		}
		console.log('mode after clock filter : ' + mode);
		if(pastHour < hour){
			pastHour = hour;
			var cpHour = hour;
			// console.log('It\'s ' + hour + ' o\'clock');
			console.log('CLOCK__ IT\'S ' + hour + ' O\'CLOCK');
			if(mode){
				utils.testConnexion(function(connexion){
					if(connexion == true){
						tts.speak('fr', 'Il est ' + hour + ' heures');
					} else {
						// console.error('Erreur test connexion /!\\');
						if(cpHour > 12){
							cpHour = hour - 12;
						} else if(cpHour == 0){
							cpHour = 12;
						}
						var oClock = setInterval(function(){
							console.log('RING BELL ' + cpHour);
							var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/clock.sh']);
							cpHour--;
							if(cpHour < 1){clearInterval(oClock);}
						}, 1100);						
					}
				});
			}
		} else if (min == 30){
			console.log('CLOCK__ IT\'S ' + hour + ' AND A HALF');
			if(mode){
				var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/clock.sh', 'half']);
				if(cpHour > 12){cpHour = hour - 12};
				tts.speak('fr', 'Il est ' + hour + ' heures et demi');
			}
		}
	}, 30*1000);
};
exports.startClock = startClock;

var setAlarms = function(){
	setInterval(function(){
		var date = new Date();
		var day = date.getDay();
		var hour = date.getHours();
		var min = date.getMinutes();
		var sec = date.getSeconds();
		//console.log('Alarms On');
		if(day > 0 && day < 6){
			if(hour == 7 && min == 30){
				console.log('COCORICO !!');
				var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/clock.sh', 'cocorico']);
				if(date.getSeconds() < 26){
					utils.testConnexion(function(connexion){
						setTimeout(function(){
							if(connexion == true){
									console.log('It\'s '+ hour + ':' + min 
										+ ' !!  Let\'s listen the radio :D');
									setTimeout(function(){
										service.info();
										setTimeout(function(){
											fip.playFip();
										}, 15*1000);
									}, 5*1000);
							} else {
								console.log('It\'s '+ hour + ':' + min 
									+ ' !!  Let\'s play some music :D');
								jukebox.loop();
							}
							utils.autoMute('Auto mute Morning');
						}, 3000);
					});
				}
			} else if(hour == 18 && min == 45){
				if(date.getSeconds() < 26){
					utils.testConnexion(function(connexion){
						setTimeout(function(){
							if(connexion == true){
									console.log('It\'s '+ hour + ':' + min 
										+ ' !!  Let\'s listen the radio :D');
									fip.playFip();
							} else {
								console.log('It\'s '+ hour + ':' + min 
									+ ' !!  Let\'s play some music :D');
								jukebox.loop();
							}
							utils.autoMute('Auto mute Evening Fip');
						}, 3000);
					});
				}
			}
		} else {
			// if(hour == 12 && min == 0){
			if(hour == 6 && min == 38){
				console.log('COCORICO !!');
				var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/clock.sh', 'cocorico']);
				if(date.getSeconds() < 26){
					utils.testConnexion(function(connexion){
						setTimeout(function(){
							if(connexion == true){
									console.log('It\'s '+ hour + ':' + min 
										+ ' !!  Let\'s listen the radio :D');
									setTimeout(function(){
										service.info();
										setTimeout(function(){
											fip.playFip();
										}, 25*1000);
									}, 5*1000);
							} else {
								console.log('It\'s '+ hour + ':' + min 
									+ ' !!  Let\'s play some music :D');
								jukebox.loop();
							}
							utils.autoMute('Auto mute Morning');
						}, 3000);
					});
				}
			}
		}
		if(hour == 5 && min == 0){
			utils.testConnexion(function(connexion){
				if(connexion == true){
					console.log('REBOOTING RASPBERRY PI !!');
					var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/shutdown.sh', 'reboot']);
				}
			});
		} else if(hour == 0 && min == 1){
			tts.speak('fr', 'Un jour de plus vient de s\'achever.');
		}
	}, 30*1000);
};
exports.setAlarms = setAlarms;
