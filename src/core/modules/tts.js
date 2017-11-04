#!/usr/bin/env node
'use strict';

var Odi = require(ODI_PATH + 'src/core/Odi.js').Odi;
var log = new (require(Odi._CORE + 'Logger.js'))(__filename);

var spawn = require('child_process').spawn;

var Flux = require(Odi._CORE + 'Flux.js');
var Utils = require(Odi._CORE + 'Utils.js');

Flux.module.tts.subscribe({
	next: flux => {
		log.info('TTS service', flux.id);
		if (flux.id == 'speak') {
			speak(flux.value);
		} else if (flux.id == 'lastTTS') {
			lastTTS();
		} else if (flux.id == 'randomConversation') {
			randomConversation();
		} else if (flux.id == 'clearTTSQueue') {
			clearTTSQueue();
		} else {
			log.info('TTS flux not mapped', flux);
		}
	},
	error: err => {
		Odi.error(flux);
	}
});

const LAST_TTS_PATH = '/home/pi/odi/tmp/lastTTS.json';

var onAir = false,
	ttsQueue = [],
	allowedModes = ['ready', 'test'],
	lastTtsMsg = { voice: 'espeak', lg: 'en', msg: '.undefined' };

/** Function to add TTS message in queue and proceed */
function speak(tts) {
	if (Utils.searchStringInArray(Odi.conf.mode, allowedModes)) {
		log.debug(tts);
		if (Array.isArray(tts)) {
			log.info('TTS array object... processing');
			tts.forEach(function(message) {
				if (message.msg) {
					speak(message);
				}
			});
		} else if (!tts || !Object.keys(tts).length > 0 || tts.msg.toUpperCase().indexOf('RANDOM') > -1) {
			// OR UNDEFINED !!
			randomTTS();
		} else {
			if (tts.hasOwnProperty('msg')) {
				var ttsQueueLength = ttsQueue.length;
				ttsQueue.push(tts);
				log.debug('new TTS [' + (tts.lg || '') + ', ' + (tts.voice || '') + '] "' + tts.msg + '"');
			} else log.debug(console.error('newTTS() Wrong TTS object ', tts));
		}
		if (ttsQueue.length > 0) proceedQueue();
	} else log.info('Wrong mode for TTS speak !!');
}

/** Function to proceed TTS queue */
var queueInterval,
	currentTTS,
	timeout = 0;
function proceedQueue() {
	// spawn('sh', ['/home/pi/odi/core/sh/sounds.sh', 'tone']);
	log.debug('Start processing TTS queue...');
	queueInterval = setInterval(function() {
		if (!onAir && ttsQueue.length > 0) {
			onAir = true;
			currentTTS = ttsQueue.shift();
			playTTS(currentTTS);
			if (currentTTS.voice === 'google') timeout = currentTTS.msg.length * 90 + 1500;
			else timeout = currentTTS.msg.length * 60 + 1500;
			setTimeout(function() {
				onAir = false;
			}, timeout);
			if (ttsQueue.length === 0) {
				log.debug('No more TTS, stop processing TTS queue!');
				clearInterval(queueInterval);
			}
	}
	}, 500);
}

/** Function to launch random TTS */
const RANDOM_TTS_LENGTH = Odi.ttsMessages.randomTTS.length;
function randomTTS() {
	var rdmNb = Math.floor(Math.random() * RANDOM_TTS_LENGTH);
	log.info('tts.js> rdmNb: ', rdmNb);
	var rdmTTS = Odi.ttsMessages.randomTTS[rdmNb];
	log.info('Random TTS : ' + rdmNb + '/' + RANDOM_TTS_LENGTH);
	speak(rdmTTS);
	// console.debug('new TTS [' + (tts.lg || '') + ', ' + (tts.voice || '') + '] "' + tts.msg + '"');
}

/** Function to launch random TTS conversation */
const RANDOM_CONVERSATIONS_LENGTH = Odi.ttsMessages.randomConversations.length;
function randomConversation() {
	log.debug('randomConversation()');
	var rdmNb = Math.floor(Math.random() * RANDOM_CONVERSATIONS_LENGTH); // IMPORT JSON FILE
	var conversation = Odi.ttsMessages.randomConversations[rdmNb];
	log.debug(conversation);
	log.info('Random conversation : ' + (rdmNb + 1) + '/' + RANDOM_CONVERSATIONS_LENGTH);
	speak(conversation);
}

/** Function to play TTS message (espeak / google translate) */
const VOICE_LIST = ['google', 'espeak'];
const LG_LIST = ['fr', 'en', 'ru', 'es', 'it', 'de'];
var playTTS = function(tts) {
	// TEST IF INTERNET CONNEXION
	if (!tts.hasOwnProperty('voice') || !VOICE_LIST.indexOf(tts.voice) == -1) {
		// Random voice if undefined
		//var tmp = Math.round(Math.random()*1);
		tts.voice = 'espeak';
		/*ODI.utils.testConnexion(function(connexion){
			if(connexion == true){
			}else{
			}
		});*/
	}
	if (!tts.hasOwnProperty('lg') || !LG_LIST.indexOf(tts.lg) == -1) {
		// Fr language if undefined
		tts.lg = 'fr';
	}
	log.info('play TTS [' + tts.voice + ', ' + tts.lg + '] "' + tts.msg + '"');
	spawn('sh', ['/home/pi/odi/core/sh/tts.sh', tts.voice, tts.lg, tts.msg]);
	log.debug('tts.msg.length :', tts.msg.length);
	//ODI.leds.blink({ leds: ['eye'], speed: Math.random() * (150 - 50) + 30, loop: tts.msg.length / 2 + 2 });

	lastTtsMsg = tts;
	/*fs.writeFile(LAST_TTS_PATH, JSON.stringify(tts), 'UTF-8', function(err){ // TODO to JSON file
		if(err) return console.error('Error while saving last TTS : ' + err);
	});*/
};

/** Function to clear TTS Queue */
function clearTTSQueue() {
	ttsQueue = [];
}

/** Detection des parametres en cas d'appel direct (pour tests ou exclamation TTS) */
/*var params = process.argv[2];
try{
	params = params.split('_');
	var lgParam = params[0];
	// params = params.shift();
	params.splice(0, 1);
	// console.log('A: ' + lgParam + ', ' + params);
	var txtParam = params.join(' ');
	// console.log('B: ' + lgParam + ', ' + txtParam);
	txtParam = txtParam.replace('#',':');
}catch(e){
	if(typeof params !== 'undefined'){
		console.error('Exception while getting speak param at init : ' + e);
	}
}
if(typeof lgParam != 'undefined' && lgParam !='' && typeof txtParam != 'undefined' && txtParam !=''){
	console.log('TTS_PARAMS: ' + lgParam + ', ' + txtParam);
	//self.speak(lgParam, txtParam);
	speak(lgParam, txtParam);
}*/

/** Function last TTS message */
function lastTTS() {
	log.info('LastTTS ->', lastTtsMsg);
	speak(lastTtsMsg);
}
