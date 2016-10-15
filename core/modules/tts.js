#!/usr/bin/env node

// Module TTS

var spawn = require('child_process').spawn;
var fs = require('fs');
var leds = require('./leds.js');
var request = require('request');
var utils = require('./utils.js');
var deploy;
var self = this;

var MESSAGES_PATH = '/home/pi/odi/data/intern/ttsMessages.properties';
var messages = fs.readFileSync(MESSAGES_PATH, 'UTF-8').toString().split('\n'); // \r\n
var rdmMaxMessages = messages.length;
var CONVERSATIONS_PATH = '/home/pi/odi/data/intern/ttsConversations.properties';
var conversations = fs.readFileSync(CONVERSATIONS_PATH, 'UTF-8').toString().split('\n\n'); // \r\n
var rdmMaxConversations = conversations.length;
var LAST_TTS_PATH = '/home/pi/odi/tmp/lastTTS.log';


var singleton = function(){ //defining a var instead of this (works for variable & function) will create a private definition
	var that = this;
	/** TTS queue */
	var ttsQueue = [];

	if(singleton.caller != singleton.getInstance){
		throw new Error("This object cannot be instanciated");
	}

	/** Function to add TTS message in queue and proceed */
	this.newTTS = function(tts){
		// console.log('newTTS() ' + tts.msg);
		if(tts.hasOwnProperty('msg')){
			var ttsQueueLength = ttsQueue.length;
			// console.log(ttsQueueLength);
			ttsQueue.push(tts);
			console.log('newTTS() ' + tts.msg);
			console.log(ttsQueue);
			if(!ttsQueueLength) self.proceedTTSQueue();
		}else console.error('newTTS() Wrong TTS object');
	}

	/** Function to proceed TTS queue */
	var currentTTS, delay;
	var proceedTTSQueue = function(){
		console.log('proceedTTSQueue()');
		delay = 0;
		while(ttsQueue.length > 0){
			currentTTS = ttsQueue.shift()
			// self.playTTS(currentTTS);
			setTimeout(function(currentTTS){
				self.playTTS(currentTTS);
			}.bind(this, currentTTS), delay+2500);/*+2500*/
			delay += currentTTS.msg.length*1200;
			console.log(delay);
		}
		console.log('proceedTTSQueue() ttsQueue empty');
	}
	exports.proceedTTSQueue = proceedTTSQueue;

	/** Function to play TTS message */
	var VOICE_LIST = ['google', 'espeak'];
	var LG_LIST = ['fr', 'en', 'ru', 'es', 'it', 'de'];
	var playTTS = function(tts){
		if(!tts.hasOwnProperty('voice' || VOICE_LIST.indexOf(tts.voice) == -1)){ // Random voice if undefined
			var tmp = Math.round(Math.random()*1);
			if(tmp) tts.voice = 'google';
			else tts.voice = 'espeak';
		}
		if(!tts.hasOwnProperty('lg') || LG_LIST.indexOf(tts.lg) == -1){ // Fr language if undefined
			tts.lg = 'fr';
		}
		console.log('playTTS [' + tts.voice + ', ' + tts.lg + '] "' + tts.msg + '"');
		deploy = spawn('sh', ['/home/pi/odi/core/sh/tts.sh', tts.voice, tts.lg, tts.msg]);
		leds.blink({
			leds: ['eye'],
			speed: Math.random() * (200 - 30) + 30,
			loop: 4
		});

		fs.writeFile(LAST_TTS_PATH, tts.lg + ';' + tts.msg, 'UTF-8', function(err){
			if(err) return console.error('Error while saving last TTS : ' + err);
		});
	}
	exports.playTTS = playTTS;


	/** Fonction speak TTS (synthetisation vocale espeak & google translate) */
	var voice;
	this.speak = function(lg, txt){
		utils.testConnexion(function(connexion){
			if(connexion == true){
				// if(txt == '' || typeof txt === 'undefined'){
				if(typeof txt !== 'undefined'){
					if(txt.toUpperCase().indexOf('RANDOM') > -1){
						var rdmNb = ((Math.floor(Math.random()*rdmMaxMessages)));
						txt = messages[rdmNb];
						console.log('Random speech : ' + rdmNb + '/' + rdmMaxMessages);
						txt = txt.split(';');
						lg = txt[0];
						txt = txt[1];
					}
					txt = txt.split(':');
					voice = txt[1];
					if(typeof voice == 'undefined'){
						voice = Math.round(Math.random()*4);
						// console.log('Voice Random = ' + voice);
					}
					if(voice <= 1){
						voice = 'espeak';
					} else {
						voice = 'google';
					}
					txt = txt[0];
					console.log('TTS [' + voice + ', ' + lg + '] "' + txt + '"');
					deploy = spawn('sh', ['/home/pi/odi/core/sh/tts.sh', voice, lg, txt]);
					var blinkTime = (txt.length/15) + 1;
					// leds.blinkEye((Math.round(Math.random()*5) + 1)*50, blinkTime);
					//console.log(blinkTime);
					leds.blink({
						leds: ['eye'],
						speed: Math.random() * (200 - 30) + 30,
						loop: 4
					});

					fs.writeFile(LAST_TTS_PATH, lg + ';' + txt, 'UTF-8', function(err){
						if(err){
							return console.error('Error while saving last TTS : ' + err);
						}
						// console.log('I\'ll keep this message ;) ' + lg + ';' + txt);
					});
				}
				// return true;
			} else {
				// console.error('No network, can\'t get TTS data /!\\');
				deploy = spawn('sh', ['/home/pi/odi/core/sh/tts.sh', 'espeakTTS', lg, txt]);
			}
		});
	};
	// exports.speak = speak;

	/** Detection des parametres en cas d'appel direct (pour tests) */
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


	/** Fonction conversation TTS */
	this.conversation = function(messages){
		console.log('Conversation Service... ' + messages);
		try{
			if(typeof messages == 'undefined') throw (messages);
			// Mettre un 2eme Try catch imbriqué...
			if( messages.constructor != Array){// typeof messages == 'undefined' ||       // IS EMPTY
				if(messages.constructor == Number && messages != NaN && messages <= rdmMaxConversations-1){
					messages = conversations[messages];
				}else{
					var rdmNb = ((Math.floor(Math.random()*rdmMaxConversations)));
					messages = conversations[rdmNb];
					console.log('Random conversation : ' + (rdmNb+1) + '/' + rdmMaxConversations);
				}
				messages = messages.split('\n');
			}
			var delay = 1;
			messages.forEach(function(message){
				// console.log('__ ' + delay/1000);
				setTimeout(function(message){
					message = message.split(';');
					var lg = message[0];
					var txt = message[1];
					that.speak(lg, txt);
				}.bind(this, message), delay+2500);
				delay += message.length*120;
			});
		}catch(e){
			self.speak('fr','erreur conversation:1');
			console.error('conversation_error : ' + e);
		}
	};
	// exports.conversation = conversation;

	/** Fonction last speak TTS */
	this.lastTTS = function(){
		try{
			var lastMsg = fs.readFileSync(LAST_TTS_PATH, 'UTF-8').toString().split('\n'); // PREVENIR SI FICHIER NON EXISTANT !!!
			// console.log('lastMsg=> ' + lastMsg);
			txt = lastMsg[lastMsg.length-1].split(';');
			lg = txt[0];
			txt = txt[1];
			if(typeof lg === 'undefined' || typeof txt === 'undefined'){
				throw e;
			}
		}catch(e){
			console.error(e);
			lg = 'en';
			txt = '.undefined:0';
		}
		console.log('LastTTS -> [' + lg + '] ' + txt);
		self.speak(lg, txt);
	};
	// exports.lastTTS = lastTTS;

	/** Fonction suppression last speak TTS */
	this.clearLastTTS = function(){
		// deploy = spawn('sh', ['/home/pi/odi/core/sh/utils.sh', 'clearLastTTS']);
		console.log('LastTTS cleared.');
	};
	// exports.clearLastTTS = clearLastTTS;

}
/* ************************************************************************
SINGLETON CLASS DEFINITION
************************************************************************ */
singleton.instance = null;
/**
 * Singleton getInstance definition
 * @return singleton class
 */
singleton.getInstance = function(){
	if(this.instance === null){
		this.instance = new singleton();
	}
	return this.instance;
}

module.exports = singleton.getInstance();