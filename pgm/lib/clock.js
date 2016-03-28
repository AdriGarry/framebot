#!/usr/bin/env node
// Module Horloge & Alarmes

var spawn = require('child_process').spawn;
// var CronJob = require('cron').CronJob;
var utils = require('./utils.js');
var fip = require('./fip.js');
var jukebox = require('./jukebox.js');
var tts = require('./tts.js');
var service = require('./service.js');
var log = require('./log.js');

var date = new Date();
var hour = date.getHours();
var pastHour = hour;

var startClock = function(modeInit){
	if(!modeInit){
		console.log('Starting clock in quiet mode     -.-');
	}else{
		console.log('Starting clock in normal mode');
	}
	setInterval(function(){
		date = new Date();
		hour = date.getHours();
		min = date.getMinutes();
		var mode = false;
		if(!modeInit){
			var day = date.getDay();
			if(day > 0 && day < 6 && hour >= 8){
				mode = true;
			}else if(hour >=11){
				mode = true;
			}
		}else{
			mode = true;
		}
		// console.log('Clock mode : ' + mode + ' [modeInit:' + modeInit + ']');
		if(pastHour < hour){
			pastHour = hour;
			var cpHour = hour;
			console.log('It\'s ' + hour + ' o\'clock');
			if(mode){
				utils.testConnexion(function(connexion){
					if(connexion == true){
						tts.speak('fr', 'Il est ' + hour + ' heures');
					}else{
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
			}else{ console.log('Clock in quiet mode     -.-'); }
		} else if (min == 30){
			console.log('It\'s ' + hour + ' and a half');
			if(mode){
				utils.testConnexion(function(connexion){
					if(connexion == true){
						// if(cpHour > 12){cpHour = hour - 12};
						tts.speak('fr', 'Il est ' + hour + ' heures 30');
					}else{
						var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/clock.sh', 'half']);
					}
				});
			}else{ console.log('Clock in quiet mode     -.-'); }
		}
	}, 60*1000);
};
exports.startClock = startClock;

var setAlarms = function(){
	console.log('Alarms On');
	setInterval(function(){
		var date = new Date();
		var day = date.getDay();
		var hour = date.getHours();
		var min = date.getMinutes();
		var sec = date.getSeconds();
		if(day > 0 && day < 6){
			if(hour == 7 && min == 26){
				console.log('Morning Sea...');
				var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/sounds.sh', 'MorningSea']);
			}
			if(hour == 7 && min == 30){
			// if(hour == 20 && min == 49){
				console.log('COCORICO !!');
				var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/clock.sh', 'cocorico']);
				// if(date.getSeconds() < 31){
					utils.testConnexion(function(connexion){
						if(connexion == true){
							tts.speak('fr', 'Il est ' + hour + ' heures ' + min);
							setTimeout(function(){
								service.weather();
							}, 5*1000);
							setTimeout(function(){
								fip.playFip();
							}, 15*1000);
						}else{
							jukebox.loop();
						}
						utils.autoMute('Auto mute Morning');
					});
				// }
			}else if(hour == 18 && min == 30){
				// if(date.getSeconds() < 31){
					utils.testConnexion(function(connexion){
						setTimeout(function(){
							if(connexion == true){
								fip.playFip();
							}else{
								jukebox.loop();
							}
							utils.autoMute('Auto mute Evening Fip');
						}, 3000);
					});
				// }
			}
		}else{
			if(hour == 11 && (min == 45 || min == 55)){
				console.log('Morning Birds...');
				var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/sounds.sh', 'MorningBirds']);
			}
			if(hour == 12 && min == 0){
				console.log('COCORICO !!');
				var deploy = spawn('sh', ['/home/pi/odi/pgm/sh/clock.sh', 'cocorico']);
				// if(date.getSeconds() < 26){
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
				// }
			}
		}
		if(hour == 13 && min == 13){
			utils.testConnexion(function(connexion){
				if(connexion == true){
					tts.speak('fr','Auto reboot');
					setTimeout(function(){
						utils.reboot();
					}, 3000);
				}
			});
		}else if(day == 2 && hour == 5 && min == 00){
			console.log('Clean log files  /!\\');
			log.cleanLog();
		}
	}, 60*1000);
};
exports.setAlarms = setAlarms;
