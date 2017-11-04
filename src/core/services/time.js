#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi._CORE + 'Logger.js'))(__filename);

var Flux = require(Odi._CORE + 'Flux.js');

// module.exports = {
// 	now: now,
// 	today: today,
// 	cocorico: cocorico,
// 	setAlarm: setAlarm,
// 	isAlarm: isAlarm,
// 	sayOdiAge: sayOdiAge,
// 	setTimer: setTimer,
// 	timeLeftTimer: timeLeftTimer,
// 	stopTimer: stopTimer
// };

Flux.service.time.subscribe({
	next: flux => {
		log.info('Time service', flux);
		if(flux.id == 'now'){
			now();
		}else if(flux.id == 'today'){
			today();
		}else if(flux.id == 'cocorico'){
			// cocorico();
		}else if(flux.id == 'sayOdiAge'){
			sayOdiAge();
		}else if(flux.id == 'setTimer'){
			setTimer();
		}else if(flux.id == 'stopTimer'){
			stopTimer();
		}else if(flux.id == 'timeLeftTimer'){
			timeLeftTimer();
		}else Odi.error('unmapped flux in Time service:' + flux, false);
	},
	error: err => {
		Odi.error(flux);
	}
});

/** Function TTS time now */
function now(voice){  // TODO  prendre en compte le parametre voix (créer un objet tts avant de le passer en parametre)
	log.debug('time.now()');
	var date = new Date();
	var hour = date.getHours();
	var min = date.getMinutes();
	Flux.next('module', 'tts', 'speak', {lg: 'fr', msg: 'Il est ' + hour + ' heure ' + (min>0 ? min : '')});
};

const CALENDAR = require(Odi._DATA + 'calendar.json');
/** Function to say current date */
function today(voice){  // TODO  prendre en compte le parametre voix (créer un objet tts avant de le passer en parametre)
	var date = new Date();
	var dayNb = date.getDate();
	if(dayNb == 1) dayNb = 'premier';
	var day = date.getDay();
	var day = CALENDAR.days[day];
	var month = date.getMonth();
	var month = CALENDAR.months[month];
	var year = date.getFullYear();
	var annonceDate = 'Nous sommes le ' + day + ' ' + dayNb + ' ' + month + (Math.random() >= 0.5 ? '' : (' ' + year));
	log.debug('time.today()' + annonceDate);
	Flux.next('module', 'tts', 'speak', {lg:'fr', msg:annonceDate});
};

/** Function alarm */
function cocorico(mode){
	log.info('cocorico MODE:', mode);
	var alarmDelay = 1;
	if(mode == 'sea'){ // Morning sea...
		log.info('Morning Sea... Let\'s start the day with some waves !');
		spawn('sh', [Odi._SHELL + 'sounds.sh', 'MorningSea']);
		alarmDelay = 2*62*1000;
	}
	log.debug('alarmDelay', alarmDelay);

	setTimeout(function(){
		log.info('COCORICO !!');

		spawn('sh', [Odi._SHELL + 'sounds.sh', 'cocorico']);
		// spawn('sh', ['/home/pi/odi/core/sh/sounds.sh', 'birthday']);

		setTimeout(function(){ // ANNIF
			var voiceMailMsg = ODI.voiceMail.areThereAnyMessages();
			console.log('voiceMailMsg', voiceMailMsg);
			now();
			today();
			ODI.service.weather();
			ODI.voiceMail.checkVoiceMail();
			setTimeout(function(){
				ODI.utils.testConnexion(function(connexion){
					if(connexion == true){
						ODI.jukebox.playFip();
					}else{
						ODI.jukebox.loop();
					}
				});
			}, 30*1000);
		}, 5*1000);
		// }, 55*1000); // ANNIF
	}, alarmDelay);
};

/** Function to set Odi's custom alarm */
/*function setAlarm(alarm){
	console.debug('time.setAlarm()', alarm);
	getJsonFileContent(Odi._CONF, function(data){
		var config = JSON.parse(data);
		config.alarms.custom.h = alarm.h;
		config.alarms.custom.m = alarm.m;
		Odi.conf = config;
		//console.debug(CONFIG);
		ODI.config.logArray();
		fs.writeFile(Odi._CONF, JSON.stringify(Odi.conf, null, 2), function(cb){
			console.log('setAlarm() LOG FOR CB');
		});
		if(restart) ODI.hardware.restartOdi();
	});
};*/

/** Function to test if alarm now */
/*function isAlarm(){
	var isAlarm = false, now = new Date();
	var d = now.getDay(), h = now.getHours(), m = now.getMinutes();
	Object.keys(CONFIG.alarms).forEach(function(key,index){
		if(CONFIG.alarms[key].d.indexOf(d) > -1 && h == CONFIG.alarms[key].h && m == CONFIG.alarms[key].m){
			console.log('ALARM TIME...', CONFIG.alarms[key].h + ':' + CONFIG.alarms[key].m);
			isAlarm = true;
			cocorico(CONFIG.alarms[key].mode);
		}
	});
	console.debug('time.isAlarm()', isAlarm);
	return isAlarm;
};*/

/** Function to TTS Odi's age */
function sayOdiAge(){
	var age = ODI.hardware.getOdiAge();
	var years = Math.floor(age/365);
	var mouths = Math.floor((age%365)/30);
	var rdm = ['Aujourd\'hui, ', 'A ce jour', ''];
	var birthDay = rdm[Math.floor(Math.random() * rdm.length)]
	birthDay += 'j\'ai ' + years + ' ans et ' + mouths + ' mois !';
	console.log('sayOdiAge() \'' + birthDay + '\'')
	ODI.tts.speak({lg: 'fr', msg: birthDay});
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
	ODI.tts.speak({lg: 'fr', msg: ttsMsg});
	if(!timer){
		timer = true;
		var sec = setInterval(function(){
			ODI.leds.belly.write(etat);
			etat = 1 - etat;
			if(time < 10){
				spawn('sh', [CORE_PATH + 'sh/timerSound.sh', 'almost']);
			}
			else{
				spawn('sh', [CORE_PATH + 'sh/timerSound.sh']);
			}
			time--;
			if(time%120 == 0 && (time/60)>0){
				ODI.tts.speak({lg:'fr', msg:time/60 + ' minutes et compte a rebours'});
			}else if(time <= 0 && time > -5){
				clearInterval(sec);
				console.log('End Timer !');
				spawn('sh', [CORE_PATH + 'sh/timerSound.sh', 'end']);
				ODI.leds.blink({
					leds: ['belly','eye', 'satellite', 'nose'],
					speed: 90,
					loop: 12
				});
				ODI.tts.speak({lg:'fr', msg:'Les raviolis sont cuits !'});
				timer = false;
				ODI.leds.belly.write(0);
			}else if(time < -2){
				clearInterval(sec);
				console.log('Timer canceled!');
				ODI.leds.belly.write(0);
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
	ODI.tts.speak({lg:'en', msg:'Timer canceled'});
	ODI.leds.belly.write(0);
};
