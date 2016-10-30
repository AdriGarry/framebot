#!/usr/bin/env node

// Module TTS

var spawn = require('child_process').spawn;
var fs = require('fs');
var leds = require('./leds.js');
var request = require('request');
var utils = require('./utils.js');
// var deploy;
const self = this;

// const messageList = JSON.parse(fs.readFileSync('/home/pi/odi/data/ttsMessages.json', 'utf8'));
const messageList = require('/home/pi/odi/data/ttsMessages.json');
const messageListLength = messageList.length;

const CONVERSATIONS_PATH = '/home/pi/odi/data/ttsConversations.properties';
// const conversations = fs.readFileSync(CONVERSATIONS_PATH, 'UTF-8').toString().split('\n\n'); // \r\n
const conversations = require('/home/pi/odi/data/ttsConversations.json');
const rdmMaxConversations = conversations.length;
const LAST_TTS_PATH = '/home/pi/odi/tmp/lastTTS.log';

var ttsQueue = []; // TTS queue
var onAir = false;

module.exports = { // Singleton
	speak: speak,
	conversation: function(){
		console.log('FUNCTION NOT YET MIGRATED...');
	},
	clearLastTTS: clearLastTTS,
	lastTTS: lastTTS
};

/** Function to add TTS message in queue and proceed */
function speak(tts){
	if(Array.isArray(tts)){
		console.log('TTS array object... processing');
		tts.forEach(function(message){
			if(message.msg){
				speak(message);
			}
		});
	}else if(!tts || (tts.msg.toUpperCase().indexOf('RANDOM') > -1)){ // OR UNDEFINED !!
		var rdmNb = ((Math.floor(Math.random()*messageListLength)));
		tts = messageList[rdmNb];
		console.log('Random TTS : ' + rdmNb + '/' + messageListLength);
		ttsQueue.push(tts);
	}else{
		if(tts.hasOwnProperty('msg')){
			var ttsQueueLength = ttsQueue.length;
			ttsQueue.push(tts);
			console.log('newTTS [' + tts.lg + ', ' + tts.voice + '] "' + tts.msg + '"');
		}else console.debug(console.error('newTTS() Wrong TTS object ', tts));
	}
};

/*function speak(tts){
	if(Array.isArray(tts)){
		console.log('TTS array object... processing');
		tts.forEach(function(message){
			if(message.msg){
				speak(message);
			}
		});
	}else{
		if(tts.hasOwnProperty('msg')){
			var ttsQueueLength = ttsQueue.length;
			if(tts.msg.toUpperCase().indexOf('RANDOM') > -1){ // OR UNDEFINED !!
				var rdmNb = ((Math.floor(Math.random()*messageListLength)));
				tts = messageList[rdmNb];
				console.log('Random TTS : ' + rdmNb + '/' + messageListLength);
			}
			ttsQueue.push(tts);
			console.log('newTTS [' + tts.lg + ', ' + tts.voice + '] "' + tts.msg + '"');
		}else console.debug(console.error('newTTS() Wrong TTS object ', tts));
	}
}*/

/** Fonction conversation TTS */
var conversation = function(messages){
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
				speak({lg: lg, msg :txt});
			// console.log('__ ' + delay/1000);
			setTimeout(function(message){
			}.bind(this, message), delay+2500);
			delay += message.length*120;
		});
	}catch(e){
		// self.speak('fr','erreur conversation:1');
		self.new({voice: 'espeak', lg:'fr', msg: 'erreur conversation'});
		console.error('conversation_error : ' + e);
	}
};


/** Function to proceed TTS queue */
var currentTTS, delay;
// var listenQueue = function(){
console.log('Start listening TTS queue...');
delay = 1;
setInterval(function(){
	if(!onAir && ttsQueue.length > 0){
		onAir = true;
		leds.toggle({led: 'eye', mode: 1});
		// leds.toggle({led: 'belly', mode: 1});
		currentTTS = ttsQueue.shift();
		playTTS(currentTTS);
		setTimeout(function(){
			onAir = false;
			leds.toggle({led: 'eye', mode: 0});
		}, currentTTS.msg.length*50 + 1500);//*30 + 1500
	}
}, 500);
// }

/** Function to play TTS message (espeak / google translate) */
const VOICE_LIST = ['google', 'espeak'];
const LG_LIST = ['fr', 'en', 'ru', 'es', 'it', 'de'];
var playTTS = function(tts){
	if(!tts.hasOwnProperty('voice') || VOICE_LIST.indexOf(tts.voice) == -1){ // Random voice if undefined
		var tmp = Math.round(Math.random()*1);
		if(tmp) tts.voice = 'google';
		else tts.voice = 'espeak';
	}
	if(!tts.hasOwnProperty('lg') || LG_LIST.indexOf(tts.lg) == -1){ // Fr language if undefined
		tts.lg = 'fr';
	}
	console.debug('playTTS [' + tts.voice + ', ' + tts.lg + '] "' + tts.msg + '"');
	spawn('sh', ['/home/pi/odi/core/sh/tts.sh', tts.voice, tts.lg, tts.msg]);
	console.debug('tts.msg.length',tts.msg.length);
	leds.blink({leds: ['eye'], speed: Math.random() * (200 - 30) + 30, loop: tts.msg.length});

	fs.writeFile(LAST_TTS_PATH, tts.lg + ';' + tts.msg, 'UTF-8', function(err){
		if(err) return console.error('Error while saving last TTS : ' + err);
	});
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
	self.speak(lgParam, txtParam);
}*/


/** Fonction conversation TTS */
var conversation = function(messages){
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
				that.new({lg: lg, msg :txt});
			}.bind(this, message), delay+2500);
			delay += message.length*120;
		});
	}catch(e){
		// self.speak('fr','erreur conversation:1');
		self.new({voice: 'espeak', lg:'fr', msg: 'erreur conversation'});
		console.error('conversation_error : ' + e);
	}
};
// exports.conversation = conversation;

/** Function last TTS message */
function lastTTS(){
	console.log('lastTTS()');
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
	// self.speak(lg, txt);
	speak({lg: lg, msg: txt});
};

/** Function to delete last TTS message */
function clearLastTTS(){
	spawn('sh', ['/home/pi/odi/core/sh/utils.sh', 'clearLastTTS']);
	console.log('LastTTS cleared.');
};
