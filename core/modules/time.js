#!/usr/bin/env node

// Module Time

var spawn = require('child_process').spawn;
var fs = require('fs');
var leds = require(CORE_PATH + 'modules/leds.js');
var utils = require(CORE_PATH + 'modules/utils.js');
var hardware = require(CORE_PATH + 'modules/hardware.js');
var tts = require(CORE_PATH + 'modules/tts.js');
var service = require(CORE_PATH + 'modules/service.js');
var voiceMail = require(CORE_PATH + 'modules/voiceMail.js');
var fip = require(CORE_PATH + 'modules/fip.js');
var jukebox = require(CORE_PATH + 'modules/jukebox.js');

module.exports = {
	now: now,
	today: today,
	cocorico: cocorico,
	setAlarm: setAlarm,
	isAlarm: isAlarm,
	sayOdiAge: sayOdiAge,
	setTimer: setTimer,
	timeLeftTimer: timeLeftTimer,
	stopTimer: stopTimer
};

/** Function TTS time now */
function now(){
	console.debug('time.now()');
	var date = new Date();
	var hour = date.getHours();
	var min = date.getMinutes();
	tts.speak({lg: 'fr', msg: 'Il est ' + hour + ' heure ' + (min>0 ? min : '')});
};

var CALENDAR = require('/home/pi/odi/data/calendar.json');
/** Function to say current date */
function today(){
	var date = new Date();
	var dayNb = date.getDate();
	if(dayNb == 1) dayNb = 'premier';
	var day = date.getDay();
	var day = CALENDAR.days[day];
	var month = date.getMonth();
	var month = CALENDAR.months[month];
	var year = date.getFullYear();
	var annonceDate = 'Nous sommes le ' + day + ' ' + dayNb + ' ' + month + ' ' + year;
	console.debug('time.today()' + annonceDate);
	tts.speak({lg:'fr', msg:annonceDate});
};

/** Function alarm */
function cocorico(mode){
	console.log('cocorico MODE:', mode);
	var alarmDelay = 1;
	if(mode == 'slow'){ // Morning sea...
		console.log('Morning Sea... Let\'s start the day with some waves !'); // 2m 41s ==> REDUIRE A 1m55sec !!!
		spawn('sh', ['/home/pi/odi/core/sh/sounds.sh', 'MorningSea']);
		alarmDelay = 2*60*1000;
	}
	console.log('alarmDelay', alarmDelay);

	setTimeout(function(){
		console.log('COCORICO !!');
		spawn('sh', ['/home/pi/odi/core/sh/sounds.sh', 'cocorico']);

		var voiceMailMsg = voiceMail.areThereAnyMessages();
		setTimeout(function(){
			tts.speak({voice: 'google', lg:'fr', msg:'Bien le bonjour !'});
			now();
		}, 4000);
		setTimeout(function(){
			console.log('--> service', service);
			//service.weather();
			today();
		}, 7000);
		setTimeout(function(){
			voiceMail.checkVoiceMail();
		}, 18000);
		setTimeout(function(){
			tts.speak({voice: 'espeak', lg:'fr', msg:'Allez hop, un peu de musique pour commencer la journer!'});
		}, voiceMailMsg*3000+20000);
		setTimeout(function(){
			utils.testConnexion(function(connexion){
				if(connexion == true){
					fip.playFip();
				}else{
					jukebox.loop();
				}
			});
		}, voiceMailMsg*3000+25000);
	}, alarmDelay);
};

/** Function to set Odi's custom alarm */
function setAlarm(alarm){
	console.debug('time.setAlarm()', alarm);
	getJsonFileContent(CONFIG_FILE, function(data){
		var config = JSON.parse(data);
		config.alarms.custom.h = alarm.h;
		config.alarms.custom.m = alarm.m;
		global.CONFIG = config;
		console.debug(CONFIG);
		fs.writeFile(CONFIG_FILE, JSON.stringify(CONFIG, null, 2));
		if(restart) hardware.restartOdi();
	});
};

/** Function to test if alarm now */
function isAlarm(){
	var isAlarm = false, now = new Date();
	var d = now.getDay(), h = now.getHours(), m = now.getMinutes();
	Object.keys(CONFIG.alarms).forEach(function(key,index){//key: the name of the object key && index: the ordinal position of the key within the object 
		// console.log('Alarm', key, CONFIG.alarms[key]);// A SUPPRIMER
		if(CONFIG.alarms[key].d.indexOf(d) > -1 && h == CONFIG.alarms[key].h && m == CONFIG.alarms[key].m){
			console.log('ALARM TIME...');
			isAlarm = true;
		}
	});
	console.debug('time.isAlarm()', isAlarm);
	return isAlarm;
};

/** Function to TTS Odi's age */
function sayOdiAge(){
	var age = hardware.getOdiAge();
	var years = Math.floor(age/365);
	var mouths = Math.floor((age%365)/30);
	var rdm = ['Aujourd\'hui, ', 'A ce jour, ', 'A cet instant, ', ''];
	var birthDay = rdm[Math.floor(Math.random() * rdm.length)]
	birthDay += 'j\'ai ' + years + ' ans et ' + mouths + ' mois !';
	console.log('sayOdiAge() \'' + birthDay + '\'')
	tts.speak({lg: 'fr', msg: birthDay});
};

/** Function to set timer */
var time = 0, timer = false;
function setTimer(minutes){
	if(typeof minutes !== undefined && minutes > 1){
		minutes = 60 * minutes;
	}else{
		minutes = 60;
	}
	console.log(minutes);
	time = time + minutes;
	var etat = 1;
	
	var min = Math.floor(time/60);
	var sec = time%60;
	var ttsMsg = 'Minuterie ' + ((min>0)? ((min>1)? min : ' une ') + ' minutes ' : '') + ((sec>0)? sec + ' secondes' : '');
	console.log(ttsMsg);
	tts.speak({lg: 'fr', msg: ttsMsg});
	if(!timer){
		timer = true;
		var sec = setInterval(function(){
			belly.write(etat);
			etat = 1 - etat;
			if(time < 10){
				var deploy = spawn('sh', ['/home/pi/odi/core/sh/timerSound.sh', 'almost']);
			}
			else{
				var deploy = spawn('sh', ['/home/pi/odi/core/sh/timerSound.sh']);
			}
			time--;
			if(time%120 == 0 && (time/60)>0){
				tts.speak({lg:'fr', msg:time/60 + ' minutes et compte a rebours'});
			}else if(time <= 0 && time > -5){
				clearInterval(sec);
				console.log('End Timer !');
				var deploy = spawn('sh', ['/home/pi/odi/core/sh/timerSound.sh', 'end']);
				leds.blink({
					leds: ['belly','eye', 'satellite', 'nose'],
					speed: 90,
					loop: 12
				});
				tts.speak({lg:'fr', msg:'Les raviolis sont cuits !'});
				timer = false;
				belly.write(0);
			}else if(time < -2){
				clearInterval(sec);
				console.log('Timer canceled!');
				belly.write(0);
			}
		}, 1000);
	}
};

/** Function to return minutes left on timer **/
function timeLeftTimer(){
	return time;
};

/** Function to stop timer **/
function stopTimer(){
	time = -5;
	timer = false;
	tts.speak({lg:'en', msg:'Timer canceled'});
	belly.write(0);
};
