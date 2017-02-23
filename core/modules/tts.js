#!/usr/bin/env node

// Module TTS

var spawn = require('child_process').spawn;
var fs = require('fs');
var leds = require(CORE_PATH + 'modules/leds.js');
var request = require('request');
var utils = require(CORE_PATH + 'modules/utils.js');
var self = this;

// const LAST_TTS_PATH = '/home/pi/odi/tmp/lastTTS.log';
const LAST_TTS_PATH = '/home/pi/odi/tmp/lastTTS.json';

var RDM_MESSAGE_LIST, RDM_MESSAGE_LIST_LENGTH;
fs.readFile('/home/pi/odi/data/ttsMessages.json', function(err, data){
	if(err && err.code === 'ENOENT'){
		console.debug(console.error('No file : ' + filePath));
		callback(null);
	}
	RDM_MESSAGE_LIST = JSON.parse(data);
	RDM_MESSAGE_LIST_LENGTH = RDM_MESSAGE_LIST.length;
});

var RDM_CONVERSATION_LIST, RDM_CONVERSATION_LIST_LENGTH;
fs.readFile('/home/pi/odi/data/ttsConversations.json', function(err, data){
	if(err && err.code === 'ENOENT'){
		console.debug(console.error('No file : ' + filePath));
		callback(null);
	}
	RDM_CONVERSATION_LIST = JSON.parse(data);
	RDM_CONVERSATION_LIST_LENGTH = RDM_CONVERSATION_LIST.length;
});

var onAir = false, ttsQueue = [], lastTtsMsg = {voice: 'espeak', lg: 'en', msg: '.undefined'};

module.exports = { // Singleton
	speak: speak,
	randomConversation: randomConversation,
	clearTTSQueue: clearTTSQueue,
	lastTTS: lastTTS
};

/** Function to add TTS message in queue and proceed */
function speak(tts){
	console.debug(tts);
	if(Array.isArray(tts)){
		console.log('TTS array object... processing');
		tts.forEach(function(message){
			if(message.msg){
				speak(message);
			}
		});
	}else if(!tts || (!Object.keys(tts).length > 0) || (tts.msg.toUpperCase().indexOf('RANDOM') > -1)){ // OR UNDEFINED !!
		var rdmNb = ((Math.floor(Math.random()*RDM_MESSAGE_LIST_LENGTH)));
		console.log('tts.js> rdmNb: ', rdmNb);
		tts = RDM_MESSAGE_LIST[rdmNb];
		console.log('Random TTS : ' + rdmNb + '/' + RDM_MESSAGE_LIST_LENGTH);
		console.debug('new TTS [' + (tts.lg || '') + ', ' + (tts.voice || '') + '] "' + tts.msg + '"');
		ttsQueue.push(tts);
	}else{
		if(tts.hasOwnProperty('msg')){
			var ttsQueueLength = ttsQueue.length;
			ttsQueue.push(tts);
			console.debug('new TTS [' + (tts.lg || '') + ', ' + (tts.voice || '') + '] "' + tts.msg + '"');
		}else console.debug(console.error('newTTS() Wrong TTS object ', tts));
	}
	if(ttsQueue.length > 0) proceedQueue(); // NEW
};

/** Function to proceed TTS queue */
var queueInteval, currentTTS, timeout = 0;
function proceedQueue(){  // NEW  // NEW  // NEW  // NEW
	// spawn('sh', ['/home/pi/odi/core/sh/sounds.sh', 'tone']);
	var isFirst = true;
	console.debug('Start processing TTS queue...');
	// setTimeout(function(){
		queueInteval = setInterval(function(){
			if(!onAir && ttsQueue.length > 0){
				onAir = true;
				// leds.toggle({led: 'eye', mode: 1});
				currentTTS = ttsQueue.shift();
				playTTS(currentTTS, isFirst);
				if(currentTTS.voice === 'google') timeout = currentTTS.msg.length*90 + 1500;
				else timeout = currentTTS.msg.length*60 + 1500;
				setTimeout(function(){
					onAir = false;
					// leds.toggle({led: 'eye', mode: 0});
				}, timeout);
				if(ttsQueue.length === 0){
					console.debug('No more TTS, stop processing TTS queue!');
					clearInterval(queueInteval);
				}
				isFirst = true;
				// console.log('isFirst', isFirst);
			}
		}, 500);
	// }, 1500);
};

/** Function to launch random conversation */
function randomConversation(){
	console.debug('randomConversation()');
	var rdmNb = ((Math.floor(Math.random()*RDM_CONVERSATION_LIST_LENGTH))); // IMPORT JSON FILE
	var conversation = RDM_CONVERSATION_LIST[rdmNb];
	console.debug(conversation);
	console.log('Random conversation : ' + (rdmNb+1) + '/' + RDM_CONVERSATION_LIST_LENGTH);
	speak(conversation);
};

/** Function to play TTS message (espeak / google translate) */
const VOICE_LIST = ['google', 'espeak'];
const LG_LIST = ['fr', 'en', 'ru', 'es', 'it', 'de'];
var playTTS = function(tts, isFirst){
	// TEST IF INTERNET CONNEXION
	if(!tts.hasOwnProperty('voice') || !VOICE_LIST.indexOf(tts.voice) == -1){ // Random voice if undefined
		//var tmp = Math.round(Math.random()*1);
		tts.voice = 'espeak';
		/*utils.testConnexion(function(connexion){
			if(connexion == true){
			}else{
			}
		});*/

	}
	if(!tts.hasOwnProperty('lg') || !LG_LIST.indexOf(tts.lg) == -1){ // Fr language if undefined
		tts.lg = 'fr';
	}
	console.log('play TTS [' + tts.voice + ', ' + tts.lg + '] "' + tts.msg + '"');
	// console.log('isFirst', isFirst);
	spawn('sh', ['/home/pi/odi/core/sh/tts.sh', tts.voice,tts.lg, tts.msg]);//isFirst, 
	console.debug('tts.msg.length :',tts.msg.length);
	leds.blink({leds: ['eye'], speed: Math.random() * (150 - 50) + 30, loop: (tts.msg.length/2)+2});

	lastTtsMsg = tts;
	/*fs.writeFile(LAST_TTS_PATH, JSON.stringify(tts), 'UTF-8', function(err){ // TODO to JSON file
		if(err) return console.error('Error while saving last TTS : ' + err);
	});*/
};

/** Function to clear TTS Queue */
function clearTTSQueue(){
	ttsQueue = [];
};

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
	self.speak(lgParam, txtParam);
}*/

/** Function last TTS message */
function lastTTS(){
	console.log('LastTTS ->', lastTtsMsg);
	speak(lastTtsMsg);
};